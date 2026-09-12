create or replace function public.tcg_server_prepare_match(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.tcg_rooms%rowtype;
  v_member_count integer;
  v_ready_count integer;
  v_match_id uuid;
  m record;
  v_validation jsonb;
  v_players jsonb;
begin
  select * into v_room from public.tcg_rooms where id=p_room_id for update;
  if not found then return jsonb_build_object('ok',false,'error','room_not_found'); end if;
  if v_room.status not in ('locked','in_match') then return jsonb_build_object('ok',false,'error','room_not_locked'); end if;

  select count(*)::int, count(*) filter (where ready)::int
  into v_member_count,v_ready_count
  from public.tcg_room_members where room_id=p_room_id;
  if v_member_count <> 2 or v_ready_count <> 2 then return jsonb_build_object('ok',false,'error','both_players_must_be_ready'); end if;

  for m in select * from public.tcg_room_members where room_id=p_room_id order by seat loop
    if m.selected_deck_id is null then return jsonb_build_object('ok',false,'error','selected_deck_required'); end if;
    v_validation := public.tcg_server_validate_deck(m.user_id,m.selected_deck_id);
    if not coalesce((v_validation->>'ok')::boolean,false) then
      return jsonb_build_object('ok',false,'error','invalid_player_deck','seat',m.seat,'validation',v_validation);
    end if;
  end loop;

  select id into v_match_id from public.tcg_matches where room_id=p_room_id;
  if v_match_id is null then
    insert into public.tcg_matches(room_id,rules_version,status,revision)
    values (p_room_id,'set-one-v0.6.1','setup',0)
    returning id into v_match_id;

    insert into public.tcg_match_players(match_id,user_id,seat,deck_id,deck_snapshot)
    select
      v_match_id,
      rm.user_id,
      rm.seat,
      rm.selected_deck_id,
      jsonb_build_object(
        'deck_id',d.id,
        'name',d.name,
        'primary_element',d.primary_element,
        'secondary_element',d.secondary_element,
        'rules_version',d.rules_version,
        'cards',coalesce((
          select jsonb_agg(jsonb_build_object(
            'card_id',dc.card_id,
            'quantity',dc.quantity,
            'name',cd.name,
            'element',cd.element,
            'card_family',cd.card_family,
            'definition',cd.definition
          ) order by dc.card_id)
          from public.tcg_deck_cards dc
          join public.tcg_card_definitions cd on cd.card_id=dc.card_id
          where dc.deck_id=d.id
        ),'[]'::jsonb)
      )
    from public.tcg_room_members rm
    join public.tcg_decks d on d.id=rm.selected_deck_id
    where rm.room_id=p_room_id;
  end if;

  select jsonb_agg(jsonb_build_object(
    'user_id',mp.user_id,
    'seat',mp.seat,
    'deck_id',mp.deck_id,
    'deck_snapshot',mp.deck_snapshot
  ) order by mp.seat)
  into v_players
  from public.tcg_match_players mp where mp.match_id=v_match_id;

  return jsonb_build_object('ok',true,'match_id',v_match_id,'room_id',p_room_id,'players',coalesce(v_players,'[]'::jsonb));
end;
$$;

create or replace function public.tcg_server_install_initial_state(
  p_match_id uuid,
  p_canonical_state jsonb,
  p_player_one_id uuid,
  p_player_one_view jsonb,
  p_player_two_id uuid,
  p_player_two_view jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_match public.tcg_matches%rowtype;
  v_room_id uuid;
begin
  select * into v_match from public.tcg_matches where id=p_match_id for update;
  if not found then return jsonb_build_object('ok',false,'error','match_not_found'); end if;
  v_room_id := v_match.room_id;

  if not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_one_id)
     or not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_two_id)
     or p_player_one_id=p_player_two_id then
    return jsonb_build_object('ok',false,'error','view_users_not_match_participants');
  end if;

  insert into public.tcg_match_state_private(match_id,revision,canonical_state,rng_state)
  values (p_match_id,0,p_canonical_state,jsonb_build_object('source','edge-webcrypto-v0.1'))
  on conflict (match_id) do nothing;

  if not found then
    return jsonb_build_object('ok',true,'already_initialized',true,'match_id',p_match_id);
  end if;

  insert into public.tcg_match_views(match_id,user_id,revision,view_state)
  values
    (p_match_id,p_player_one_id,0,p_player_one_view),
    (p_match_id,p_player_two_id,0,p_player_two_view)
  on conflict (match_id,user_id) do update set revision=excluded.revision,view_state=excluded.view_state,updated_at=now();

  update public.tcg_rooms set status='in_match' where id=v_room_id;
  update public.tcg_matches set started_at=coalesce(started_at,now()),revision=0,status='setup' where id=p_match_id;

  return jsonb_build_object('ok',true,'already_initialized',false,'match_id',p_match_id,'revision',0,'status','setup');
end;
$$;

revoke all on function public.tcg_server_prepare_match(uuid) from public,anon,authenticated;
revoke all on function public.tcg_server_install_initial_state(uuid,jsonb,uuid,jsonb,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.tcg_server_prepare_match(uuid) to service_role;
grant execute on function public.tcg_server_install_initial_state(uuid,jsonb,uuid,jsonb,uuid,jsonb) to service_role;