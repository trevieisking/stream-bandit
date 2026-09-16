create or replace function tcg_private.make_join_code()
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw bytea;
  code text := '';
  i integer;
begin
  raw := gen_random_bytes(6);
  for i in 0..5 loop
    code := code || substr(chars, (get_byte(raw,i) % length(chars)) + 1, 1);
  end loop;
  return code;
end;
$$;
revoke all on function tcg_private.make_join_code() from public, anon, authenticated;

create or replace function public.tcg_server_create_room(p_user_id uuid, p_deck_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_validation jsonb;
  v_room_id uuid;
  v_code text;
  v_try integer := 0;
begin
  v_validation := public.tcg_server_validate_deck(p_user_id,p_deck_id);
  if not coalesce((v_validation->>'ok')::boolean,false) then
    return jsonb_build_object('ok',false,'error','invalid_deck','validation',v_validation);
  end if;

  loop
    v_try := v_try + 1;
    if v_try > 12 then raise exception 'room_code_generation_failed'; end if;
    v_code := tcg_private.make_join_code();
    begin
      insert into public.tcg_rooms(join_code,host_user_id,status)
      values (v_code,p_user_id,'waiting')
      returning id into v_room_id;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  insert into public.tcg_room_members(room_id,user_id,seat,selected_deck_id,ready)
  values (v_room_id,p_user_id,1,p_deck_id,false);

  return jsonb_build_object('ok',true,'room_id',v_room_id,'join_code',v_code,'seat',1,'status','waiting');
end;
$$;

create or replace function public.tcg_server_join_room(p_user_id uuid, p_join_code text, p_deck_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_validation jsonb;
  v_room public.tcg_rooms%rowtype;
  v_existing public.tcg_room_members%rowtype;
begin
  v_validation := public.tcg_server_validate_deck(p_user_id,p_deck_id);
  if not coalesce((v_validation->>'ok')::boolean,false) then
    return jsonb_build_object('ok',false,'error','invalid_deck','validation',v_validation);
  end if;

  select * into v_room
  from public.tcg_rooms
  where join_code = upper(trim(p_join_code));

  if not found or v_room.expires_at <= now() or v_room.status not in ('waiting','locked') then
    return jsonb_build_object('ok',false,'error','room_not_available');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_room.id::text || ':join',0));

  select * into v_existing
  from public.tcg_room_members
  where room_id=v_room.id and user_id=p_user_id;

  if found then
    return jsonb_build_object('ok',true,'already_joined',true,'room_id',v_room.id,'join_code',v_room.join_code,'seat',v_existing.seat,'status',v_room.status);
  end if;

  if v_room.host_user_id = p_user_id then
    return jsonb_build_object('ok',false,'error','host_cannot_join_twice');
  end if;

  if exists (select 1 from public.tcg_room_members where room_id=v_room.id and seat=2) then
    return jsonb_build_object('ok',false,'error','room_full');
  end if;

  insert into public.tcg_room_members(room_id,user_id,seat,selected_deck_id,ready)
  values (v_room.id,p_user_id,2,p_deck_id,false);

  update public.tcg_rooms set status='locked' where id=v_room.id;

  return jsonb_build_object('ok',true,'already_joined',false,'room_id',v_room.id,'join_code',v_room.join_code,'seat',2,'status','locked');
end;
$$;

create or replace function public.tcg_server_set_room_ready(p_user_id uuid, p_room_id uuid, p_deck_id uuid, p_ready boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_validation jsonb;
  v_count integer;
  v_ready_count integer;
begin
  if not exists (select 1 from public.tcg_room_members where room_id=p_room_id and user_id=p_user_id) then
    return jsonb_build_object('ok',false,'error','not_room_member');
  end if;

  v_validation := public.tcg_server_validate_deck(p_user_id,p_deck_id);
  if not coalesce((v_validation->>'ok')::boolean,false) then
    return jsonb_build_object('ok',false,'error','invalid_deck','validation',v_validation);
  end if;

  update public.tcg_room_members
  set selected_deck_id=p_deck_id, ready=p_ready
  where room_id=p_room_id and user_id=p_user_id;

  select count(*)::int, count(*) filter (where ready)::int
  into v_count,v_ready_count
  from public.tcg_room_members where room_id=p_room_id;

  return jsonb_build_object('ok',true,'room_id',p_room_id,'member_count',v_count,'ready_count',v_ready_count,'all_ready',(v_count=2 and v_ready_count=2));
end;
$$;

create or replace function public.tcg_server_room_snapshot(p_user_id uuid, p_room_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case when not exists (
    select 1 from public.tcg_room_members x where x.room_id=p_room_id and x.user_id=p_user_id
  ) then jsonb_build_object('ok',false,'error','not_room_member')
  else jsonb_build_object(
    'ok',true,
    'room', jsonb_build_object('id',r.id,'join_code',r.join_code,'status',r.status,'expires_at',r.expires_at),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id',m.user_id,
        'seat',m.seat,
        'ready',m.ready,
        'selected_deck_id',m.selected_deck_id,
        'display_name',coalesce(p.display_name,p.username,'Player '||m.seat)
      ) order by m.seat)
      from public.tcg_room_members m
      left join public.sb_profiles p on p.id=m.user_id
      where m.room_id=r.id
    ),'[]'::jsonb)
  ) end
  from public.tcg_rooms r where r.id=p_room_id;
$$;

revoke all on function public.tcg_server_create_room(uuid,uuid) from public,anon,authenticated;
revoke all on function public.tcg_server_join_room(uuid,text,uuid) from public,anon,authenticated;
revoke all on function public.tcg_server_set_room_ready(uuid,uuid,uuid,boolean) from public,anon,authenticated;
revoke all on function public.tcg_server_room_snapshot(uuid,uuid) from public,anon,authenticated;
grant execute on function public.tcg_server_create_room(uuid,uuid) to service_role;
grant execute on function public.tcg_server_join_room(uuid,text,uuid) to service_role;
grant execute on function public.tcg_server_set_room_ready(uuid,uuid,uuid,boolean) to service_role;
grant execute on function public.tcg_server_room_snapshot(uuid,uuid) to service_role;
