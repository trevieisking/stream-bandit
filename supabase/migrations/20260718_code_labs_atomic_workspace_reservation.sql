create or replace function public.code_labs_reserve_workspace_state(
  p_owner_id uuid,
  p_expected_state_version bigint
)
returns setof public.code_labs_workspace_state
language sql
security definer
set search_path = public
as $$
  update public.code_labs_workspace_state
  set
    state_version = state_version + 1,
    updated_at = now()
  where owner_id = p_owner_id
    and state_version = p_expected_state_version
  returning *;
$$;

revoke all on function public.code_labs_reserve_workspace_state(uuid, bigint) from public, anon, authenticated;
grant execute on function public.code_labs_reserve_workspace_state(uuid, bigint) to service_role;
