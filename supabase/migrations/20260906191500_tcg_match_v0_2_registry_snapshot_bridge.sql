-- Stream Bandit TCG v0.2 guarded match-registry snapshot bridge.
--
-- Purpose:
-- - preserve the existing legacy definition snapshot as current runtime authority;
-- - when the exact frozen SB1 v0.2 shadow registry is available, snapshot its structured
--   definition beside the legacy definition at match creation;
-- - fail closed if a declared v0.2 registry exists with wrong metadata or is missing any
--   card used by a selected deck;
-- - never make v0.2 runtime authority and never mutate legacy card definitions.

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
  v_registry_ready boolean := false;
  v_registry_declared boolean := false;
  v_snapshot_missing integer := 0;
begin
  select * into v_room from public.tcg_rooms where id=p_room_id for update;
  if not found then return jsonb_build_object('ok',false,'error','room_not_found'); end if;
  if v_room.status not in ('locked','in_match') then return jsonb_build_object('ok',false,'error','room_not_locked'); end if;

  select exists(
    select 1
    from public.tcg_registry_versions rv
    where rv.registry_id='SB1-set-one-v0.2'
  ) into v_registry_declared;

  select exists(
    select 1
    from public.tcg_registry_versions rv
    where rv.registry_id='SB1-set-one-v0.2'
      and rv.set_code='SB1'
      and rv.card_schema='sb-tcg-card-v0.2'
      and rv.effect_schema='sb-tcg-effects-v0.2'
      and rv.card_count=193
      and rv.registry_sha256='8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f'
      and rv.is_runtime_authority=false
  ) into v_registry_ready;

  if v_registry_declared and not v_registry_ready then
    return jsonb_build_object('ok',false,'error','tcg_v0_2_registry_metadata_mismatch');
  end if;

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

    if v_registry_ready then
      select count(*)::int into v_snapshot_missing
      from public.tcg_deck_cards dc
      left join public.tcg_card_definition_versions cv
        on cv.registry_id='SB1-set-one-v0.2'
       and cv.card_id=dc.card_id
       and cv.set_code='SB1'
       and cv.card_schema='sb-tcg-card-v0.2'
       and cv.effect_schema='sb-tcg-effects-v0.2'
      where dc.deck_id=m.selected_deck_id
        and cv.card_id is null;

      if v_snapshot_missing <> 0 then
        return jsonb_build_object(
          'ok',false,
          'error','tcg_v0_2_registry_missing_deck_cards',
          'seat',m.seat,
          'missing_count',v_snapshot_missing
        );
      end if;
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
        'registry_v0_2',case when v_registry_ready then jsonb_build_object(
          'registry_id','SB1-set-one-v0.2',
          'set_code','SB1',
          'card_schema','sb-tcg-card-v0.2',
          'effect_schema','sb-tcg-effects-v0.2',
          'card_count',193,
          'registry_sha256','8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f',
          'runtime_authority',false,
          'source','match_prepare_snapshot'
        ) else null end,
        'cards',coalesce((
          select jsonb_agg(jsonb_build_object(
            'card_id',dc.card_id,
            'quantity',dc.quantity,
            'name',cd.name,
            'element',cd.element,
            'card_family',cd.card_family,
            'definition',cd.definition,
            'definition_v0_2',case when v_registry_ready then cv.definition else null end,
            'definition_v0_2_rules_version',case when v_registry_ready then 'sb-tcg-card-v0.2' else null end
          ) order by dc.card_id)
          from public.tcg_deck_cards dc
          join public.tcg_card_definitions cd on cd.card_id=dc.card_id
          left join public.tcg_card_definition_versions cv
            on v_registry_ready
           and cv.registry_id='SB1-set-one-v0.2'
           and cv.card_id=dc.card_id
           and cv.set_code='SB1'
           and cv.card_schema='sb-tcg-card-v0.2'
           and cv.effect_schema='sb-tcg-effects-v0.2'
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

revoke all on function public.tcg_server_prepare_match(uuid) from public,anon,authenticated;
grant execute on function public.tcg_server_prepare_match(uuid) to service_role;
