alter table public.code_labs_write_requests
  add column if not exists writer_claim_id uuid,
  add column if not exists writer_claimed_at timestamptz;

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_write_status_check;

alter table public.code_labs_write_requests
  add constraint code_labs_write_status_check
  check (
    status = any (
      array[
        'queued'::text,
        'prepared'::text,
        'branch_created'::text,
        'processing'::text,
        'pr_opened'::text,
        'preview_passed'::text,
        'merged'::text,
        'closed'::text,
        'failed'::text
      ]
    )
  );

create unique index if not exists code_labs_write_requests_one_active_route_idx
  on public.code_labs_write_requests (requested_by, repo, path, branch)
  where status in ('queued', 'prepared', 'branch_created', 'processing');

create or replace function public.code_labs_claim_write_request(
  p_owner_id uuid,
  p_request_id uuid,
  p_claim_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  claimed jsonb;
begin
  if p_owner_id is null or p_request_id is null or p_claim_id is null then
    raise exception 'writer_claim_invalid';
  end if;

  update public.code_labs_write_requests as request
  set
    status = 'processing',
    writer_claim_id = p_claim_id,
    writer_claimed_at = pg_catalog.now(),
    error = null,
    updated_at = pg_catalog.now()
  where request.id = p_request_id
    and request.requested_by = p_owner_id
    and request.status in ('queued', 'prepared', 'branch_created')
    and request.writer_claim_id is null
  returning pg_catalog.to_jsonb(request) into claimed;

  if claimed is null then
    raise exception 'writer_request_not_claimable';
  end if;

  return claimed;
end;
$$;

revoke all on function public.code_labs_claim_write_request(uuid, uuid, uuid) from public;
revoke all on function public.code_labs_claim_write_request(uuid, uuid, uuid) from anon;
revoke all on function public.code_labs_claim_write_request(uuid, uuid, uuid) from authenticated;
grant execute on function public.code_labs_claim_write_request(uuid, uuid, uuid) to service_role;
