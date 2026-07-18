create or replace function public.code_labs_reserve_workspace_state_json(
  p_owner_id uuid,
  p_expected_state_version bigint
)
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
as $$
  with reserved as (
    update public.code_labs_workspace_state
    set
      state_version = state_version + 1,
      updated_at = pg_catalog.now()
    where p_owner_id is not null
      and p_expected_state_version is not null
      and owner_id = p_owner_id
      and state_version = p