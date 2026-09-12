begin;

alter table public.tcg_rooms
  add column if not exists room_mode text not null default 'private';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tcg_rooms'::regclass
      and conname = 'tcg_rooms_room_mode_check'
  ) then
    alter table public.tcg_rooms
      add constraint tcg_rooms_room_mode_check
      check (room_mode in ('private','matchmaking'));
  end if;
end;
$$;

create index if not exists tcg_rooms_matchmaking_waiting_idx
  on public.tcg_rooms (created_at, id)
  where room_mode = 'matchmaking' and status = 'waiting';

create or replace function public.tcg_server_matchmake(p_user_id uuid, p_deck_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_validation jsonb;
  v_opponent_validation jsonb;
  v_existing public.tcg_rooms%rowtype;
  v_candidate public.tcg_rooms%rowtype;
  v_host_deck_id uuid;
  v_match_id uuid;
  v_prep jsonb;
  v_code text;
  v_try integer := 0;
  v_candidate_found boolean := false;
begin
  v_validation := public.tcg_server_validate_deck(p_user_id, p_deck_id);
  if not coalesce((v_validation->>'ok')::boolean, false) then
    return jsonb_build_object('ok',false,'error','invalid_deck','validation',v_validation);
  end if;

  -- One serialized queue owner prevents two simultaneous taps from claiming the
  -- same waiting room or creating duplicate matchmaking rooms for one user.
  perform pg_advisory_xact_lock(hashtextextended('stream-bandit-tcg-matchmaking-v1', 0));

  update public.tcg_rooms
  set status='closed', closed_at=coalesce(closed_at,now())
  where room_mode='matchmaking'
    and status='waiting'
    and expires_at <= now();

  -- Idempotent retry/poll: reuse this user's current matchmaking room.
  select r.* into v_existing
  from public.tcg_rooms r
  join public.tcg_room_members rm on rm.room_id=r.id
  where rm.user_id=p_user_id
    and r.room_mode='matchmaking'
    and r.status in ('waiting','locked','in_match')
    and r.expires_at > now()
  order by r.created_at desc
  limit 1
  for update of r;

  if found then
    if v_existing.status='waiting' then
      update public.tcg_room_members
      set selected_deck_id=p_deck_id, ready=true
      where room_id=v_existing.id and user_id=p_user_id;

      return jsonb_build_object(
        'ok',true,
        'state','waiting',
        'paired',false,
        'existing',true,
        'room_id',v_existing.id
      );
    end if;

    if v_existing.status='locked' then
      v_prep := public.tcg_server_prepare_match(v_existing.id);
      if not coalesce((v_prep->>'ok')::boolean,false) then
        raise exception 'tcg_matchmaking_prepare_failed: %', v_prep::text;
      end if;
      v_match_id := nullif(v_prep->>'match_id','')::uuid;
    else
      select m.id into v_match_id
      from public.tcg_matches m
      where m.room_id=v_existing.id;
    end if;

    return jsonb_build_object(
      'ok',true,
      'state','matched',
      'paired',true,
      'existing',true,
      'room_id',v_existing.id,
      'match_id',v_match_id
    );
  end if;

  -- Find the oldest valid opponent. Invalid stale queue entries are closed and
  -- skipped without affecting private join-code rooms.
  loop
    v_candidate_found := false;

    select r.* into v_candidate
    from public.tcg_rooms r
    where r.room_mode='matchmaking'
      and r.status='waiting'
      and r.expires_at > now()
      and r.host_user_id <> p_user_id
      and not exists (
        select 1 from public.tcg_room_members x
        where x.room_id=r.id and x.seat=2
      )
    order by r.created_at, r.id
    limit 1
    for update of r;

    if not found then
      exit;
    end if;

    select rm.selected_deck_id into v_host_deck_id
    from public.tcg_room_members rm
    where rm.room_id=v_candidate.id
      and rm.user_id=v_candidate.host_user_id
      and rm.seat=1;

    if v_host_deck_id is not null then
      v_opponent_validation := public.tcg_server_validate_deck(v_candidate.host_user_id, v_host_deck_id);
    else
      v_opponent_validation := jsonb_build_object('ok',false,'error','host_deck_missing');
    end if;

    if coalesce((v_opponent_validation->>'ok')::boolean,false) then
      v_candidate_found := true;
      exit;
    end if;

    update public.tcg_rooms
    set status='closed', closed_at=coalesce(closed_at,now())
    where id=v_candidate.id;
  end loop;

  if not v_candidate_found then
    loop
      v_try := v_try + 1;
      if v_try > 12 then
        raise exception 'tcg_matchmaking_room_code_generation_failed';
      end if;

      v_code := tcg_private.make_join_code();
      begin
        insert into public.tcg_rooms(
          join_code,host_user_id,status,room_mode,expires_at
        ) values (
          v_code,p_user_id,'waiting','matchmaking',now()+interval '10 minutes'
        )
        returning * into v_existing;
        exit;
      exception when unique_violation then
        null;
      end;
    end loop;

    insert into public.tcg_room_members(room_id,user_id,seat,selected_deck_id,ready)
    values (v_existing.id,p_user_id,1,p_deck_id,true);

    return jsonb_build_object(
      'ok',true,
      'state','waiting',
      'paired',false,
      'existing',false,
      'room_id',v_existing.id
    );
  end if;

  insert into public.tcg_room_members(room_id,user_id,seat,selected_deck_id,ready)
  values (v_candidate.id,p_user_id,2,p_deck_id,true);

  update public.tcg_rooms
  set status='locked'
  where id=v_candidate.id;

  v_prep := public.tcg_server_prepare_match(v_candidate.id);
  if not coalesce((v_prep->>'ok')::boolean,false) then
    raise exception 'tcg_matchmaking_prepare_failed: %', v_prep::text;
  end if;

  v_match_id := nullif(v_prep->>'match_id','')::uuid;

  return jsonb_build_object(
    'ok',true,
    'state','matched',
    'paired',true,
    'existing',false,
    'room_id',v_candidate.id,
    'match_id',v_match_id
  );
end;
$$;

revoke all on function public.tcg_server_matchmake(uuid,uuid) from public,anon,authenticated;
grant execute on function public.tcg_server_matchmake(uuid,uuid) to service_role;

commit;
