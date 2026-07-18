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
  if p_owner_id is null or p_expected_state_version is null or p_res