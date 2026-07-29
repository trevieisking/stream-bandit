create or replace function public.code_labs_reserve_workspace_state_version(
  p_owner_id uuid,
  p_expected_state_version bigint
)
returns bigint
language sql
security definer
set search_path = pg_catalog, public
as $$
  update public.code_labs_workspace_state
  set
    state_version = state_version + 1,
    updated_at = pg_catalog.now()
  where p_owner_id is not null
    and p_expected_state_version is not null
    and owner_id = p_owner_id
    and state_version = p_expected_state_version
  returning state_version;
$$;

revoke all on function public.code_labs_reserve_workspace_state_version(uuid, bigint) from public;
revoke all on function public.code_labs_reserve_workspace_state_version(uuid, bigint) from anon;
revoke all on function public.code_labs_reserve_workspace_state_version(uuid, bigint) from authenticated;
grant execute on function public.code_labs_reserve_workspace_state_version(uuid, bigint) to service_role;
