create or replace function public.code_labs_reserve_writer_workspace(
  p_owner_id uuid,
  p_expected_state_version bigint,
  p_reservation_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  affected_rows integer;
begin
  if p_owner_id is null or p_expected_state_version is null or p_reservation_id is null then
    raise exception 'workspace_reservation_invalid';
  end if;

  update public.code_labs_workspace_state
  set
    state_version = state_version + 1,
    writer_reservation_id = p_reservation_id,
    updated_at = pg_catalog.now()
  where owner_id = p_owner_id
    and state_version = p_expected_state_version;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'workspace_state_changed';
  end if;
end;
$$;

revoke all on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) from public;
revoke all on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) from anon;
revoke all on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) from authenticated;
grant execute on function public.code_labs_reserve_writer_workspace(uuid, bigint, uuid) to service_role;
