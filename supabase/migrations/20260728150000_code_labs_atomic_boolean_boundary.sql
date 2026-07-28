-- Code Labs atomic workspace strict boolean boundary.
-- EXPANSION ONLY: safe to install before the atomic-only runtime is deployed.
-- The currently deployed V49 runtime does not call either RPC in this file.

begin;

create or replace function public.code_labs_require_jsonb_boolean(
  p_value jsonb,
  p_default boolean,
  p_error_code text
)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
begin
  if p_value is null or p_value = 'null'::jsonb then
    return p_default;
  end if;

  if jsonb_typeof(p_value) = 'boolean' then
    return p_value::text::boolean;
  end if;

  raise exception using
    errcode = 'P0001',
    message = coalesce(nullif(p_error_code, ''), 'json_boolean_invalid');
end;
$$;

create or replace function public.code_labs_execute_workspace_action_strict(
  p_owner_id uuid,
  p_operation_id uuid,
  p_action text,
  p_expected_state_version bigint,
  p_request_hash text,
  p_payload jsonb,
  p_fencing_token bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_effects jsonb;
  v_effect jsonb;
  v_request jsonb;
  v_index integer;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = 'P0001', message = 'atomic_action_request_invalid';
  end if;

  v_effects := p_payload->'effects';
  if v_effects is not null and jsonb_typeof(v_effects) = 'array' then
    if jsonb_array_length(v_effects) > 0 then
      for v_index in 0..jsonb_array_length(v_effects) - 1 loop
        v_effect := v_effects->v_index;
        if jsonb_typeof(v_effect) <> 'object' then
          continue;
        end if;

        if v_effect->>'kind' = 'write_request_insert' then
          v_request := v_effect->'request';
          if v_request is not null and jsonb_typeof(v_request) = 'object' then
            perform public.code_labs_require_jsonb_boolean(
              v_request->'expected_github_blob_absent',
              false,
              'writer_expected_blob_absent_invalid'
            );
          end if;
        elsif v_effect->>'kind' = 'receipt_insert' then
          perform public.code_labs_require_jsonb_boolean(
            v_effect->'created_new_row',
            false,
            'receipt_boolean_invalid'
          );
          perform public.code_labs_require_jsonb_boolean(
            v_effect->'undo_available',
            false,
            'receipt_boolean_invalid'
          );
        end if;
      end loop;
    end if;
  end if;

  return public.code_labs_execute_workspace_action(
    p_owner_id,
    p_operation_id,
    p_action,
    p_expected_state_version,
    p_request_hash,
    p_payload,
    p_fencing_token
  );
end;
$$;

revoke all on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated;
revoke all on function public.code_labs_execute_workspace_action_strict(
  uuid, uuid, text, bigint, text, jsonb, bigint
) from public, anon, authenticated;

-- The raw transaction remains callable by its owning database role, but not by
-- the Edge Function service role. All runtime calls must enter the strict gate.
revoke execute on function public.code_labs_execute_workspace_action(
  uuid, uuid, text, bigint, text, jsonb, bigint
) from service_role;

grant execute on function public.code_labs_execute_workspace_action_strict(
  uuid, uuid, text, bigint, text, jsonb, bigint
) to service_role;

commit;
