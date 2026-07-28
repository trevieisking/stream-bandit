-- Code Labs atomic failure-transition finalisation.
-- POST-CUTOVER CLEANUP ONLY.
-- Apply after the hardening migration and fold into that migration before any
-- deployment decision. It aligns the final trigger with the strict wrapper.

begin;

create or replace function public.code_labs_guard_action_run_transition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation_text text;
  v_fence_text text;
  v_operation_id uuid;
  v_fencing_token bigint;
begin
  if new.owner_id is distinct from old.owner_id
     or new.operation_id is distinct from old.operation_id
     or new.action is distinct from old.action
     or new.request_hash is distinct from old.request_hash
     or new.expected_state_version is distinct from old.expected_state_version then
    raise exception using errcode = 'P0001', message = 'operation_identity_mutation_forbidden';
  end if;

  if new.status in ('failed_validation', 'interrupted')
     and new.status is distinct from old.status then
    v_operation_text := nullif(current_setting('code_labs.operation_id', true), '');

    if old.status <> 'running' or v_operation_text is null then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end if;

    begin
      v_operation_id := v_operation_text::uuid;
    exception when others then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end;

    if v_operation_id is distinct from old.operation_id
       or new.completed_state_version is not null
       or new.stored_result is null
       or coalesce(new.stored_result->>'status', '') is distinct from new.status then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end if;

    new.completed_state_version := null;

    if new.status = 'failed_validation' then
      new.fencing_token := null;
      new.stored_result := jsonb_set(
        new.stored_result,
        '{fencing_token}',
        'null'::jsonb,
        true
      );
    else
      v_fence_text := nullif(current_setting('code_labs.fencing_token', true), '');
      if v_fence_text is null then
        raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
      end if;

      begin
        v_fencing_token := v_fence_text::bigint;
      exception when others then
        raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
      end;

      if v_fencing_token < 1
         or (old.fencing_token is not null and old.fencing_token is distinct from v_fencing_token) then
        raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
      end if;

      new.fencing_token := v_fencing_token;
      new.stored_result := jsonb_set(
        new.stored_result,
        '{fencing_token}',
        to_jsonb(v_fencing_token),
        true
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.code_labs_guard_action_run_transition()
  from public, anon, authenticated;

commit;
