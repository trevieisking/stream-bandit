create or replace function public.tcg_server_commit_state(
  p_match_id uuid,
  p_actor_user_id uuid,
  p_client_nonce uuid,
  p_expected_revision bigint,
  p_command_type text,
  p_new_state jsonb,
  p_player_one_id uuid,
  p_player_one_view jsonb,
  p_player_two_id uuid,
  p_player_two_view jsonb,
  p_event_type text,
  p_public_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state public.tcg_match_state_private%rowtype;
  v_existing public.tcg_match_commands%rowtype;
  v_new_revision bigint;
  v_result jsonb;
begin
  if not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_actor_user_id) then
    return jsonb_build_object('ok',false,'error','actor_not_match_participant');
  end if;

  select * into v_existing
  from public.tcg_match_commands
  where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;

  if found then
    return coalesce(v_existing.result,jsonb_build_object('ok',false,'error','command_already_received')) || jsonb_build_object('duplicate',true);
  end if;

  insert into public.tcg_match_commands(match_id,user_id,client_nonce,expected_revision,command_type,payload,status)
  values (p_match_id,p_actor_user_id,p_client_nonce,p_expected_revision,p_command_type,'{}'::jsonb,'received');

  select * into v_state
  from public.tcg_match_state_private
  where match_id=p_match_id
  for update;

  if not found then
    v_result := jsonb_build_object('ok',false,'error','match_state_not_initialized');
    update public.tcg_match_commands set status='rejected',result=v_result,resolved_at=now()
    where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;
    return v_result;
  end if;

  if v_state.revision <> p_expected_revision then
    v_result := jsonb_build_object('ok',false,'error','stale_revision','expected',v_state.revision,'received',p_expected_revision);
    update public.tcg_match_commands set status='rejected',result=v_result,resolved_at=now()
    where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;
    return v_result;
  end if;

  if not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_one_id and seat=1)
     or not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_two_id and seat=2) then
    v_result := jsonb_build_object('ok',false,'error','view_users_do_not_match_seats');
    update public.tcg_match_commands set status='rejected',result=v_result,resolved_at=now()
    where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;
    return v_result;
  end if;

  v_new_revision := v_state.revision + 1;

  update public.tcg_match_state_private
  set canonical_state=p_new_state,revision=v_new_revision,updated_at=now()
  where match_id=p_match_id;

  insert into public.tcg_match_views(match_id,user_id,revision,view_state)
  values
    (p_match_id,p_player_one_id,v_new_revision,p_player_one_view),
    (p_match_id,p_player_two_id,v_new_revision,p_player_two_view)
  on conflict (match_id,user_id) do update
  set revision=excluded.revision,view_state=excluded.view_state,updated_at=now();

  update public.tcg_matches set revision=v_new_revision where id=p_match_id;

  insert into public.tcg_match_events(match_id,seq,actor_user_id,event_type,public_payload,audience_user_id)
  values (p_match_id,v_new_revision,p_actor_user_id,p_event_type,coalesce(p_public_payload,'{}'::jsonb),null);

  v_result := jsonb_build_object('ok',true,'revision',v_new_revision,'event_type',p_event_type);
  update public.tcg_match_commands
  set status='applied',result=v_result,resolved_at=now()
  where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;

  return v_result;
end;
$$;

revoke all on function public.tcg_server_commit_state(uuid,uuid,uuid,bigint,text,jsonb,uuid,jsonb,uuid,jsonb,text,jsonb) from public,anon,authenticated;
grant execute on function public.tcg_server_commit_state(uuid,uuid,uuid,bigint,text,jsonb,uuid,jsonb,uuid,jsonb,text,jsonb) to service_role;