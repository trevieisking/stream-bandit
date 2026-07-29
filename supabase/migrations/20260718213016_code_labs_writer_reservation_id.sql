alter table public.code_labs_workspace_state
  add column if not exists writer_reservation_id uuid;

create or replace function public.code_labs_reserve_writer_workspace(
  p_owner_id uuid,
  p_expected_state_version bigint,
  p_reservation_id uuid
)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  update public.code_labs_workspace_state
  set
    state_version = state_version + 1,
    writer_reservation_id = p_reservation_id,
    updated_at = pg_catalog.now()
  where p_owner_id is not null
    and p_expected_state_version is not null
    and p_reservation_id is not null
    and owner_id = p_owner_id
    and state_version = p_expected_state_version;
$$;

revoke all on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) from public;
revoke all on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) from anon;
revoke all on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) from authenticated;
grant execute on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) to service_role;
