begin;

-- G0R-09: serialize Ready updates for one room so simultaneous Ready taps cannot
-- both count against a snapshot where the other player's update is still uncommitted.
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

  -- One room-scoped transaction owner serializes the write + aggregate read.
  -- The second simultaneous Ready transaction therefore observes the first
  -- committed Ready row and can return all_ready=true deterministically.
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text || ':ready',0));

  update public.tcg_room_members
  set selected_deck_id=p_deck_id, ready=p_ready
  where room_id=p_room_id and user_id=p_user_id;

  select count(*)::int, count(*) filter (where ready)::int
  into v_count,v_ready_count
  from public.tcg_room_members where room_id=p_room_id;

  return jsonb_build_object(
    'ok',true,
    'room_id',p_room_id,
    'member_count',v_count,
    'ready_count',v_ready_count,
    'all_ready',(v_count=2 and v_ready_count=2)
  );
end;
$$;

revoke all on function public.tcg_server_set_room_ready(uuid,uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.tcg_server_set_room_ready(uuid,uuid,uuid,boolean) to service_role;

commit;
