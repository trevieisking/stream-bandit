alter table public.code_labs_write_requests
  add column if not exists code_god_review_version text,
  add column if not exists code_god_outcome text,
  add column if not exists code_god_handoff_hash text,
  add column if not exists code_god_proposed_hash text,
  add column if not exists code_god_reviewed_at timestamptz,
  add column if not exists code_god_source_file_id uuid;

create or replace function public.code_labs_capture_writer_review_proof()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  selected_file_id uuid;
  selected_metadata jsonb;
  handoff jsonb;
  review jsonb;
  reviewed_at timestamptz;
begin
  if new.status not in ('queued', 'prepared', 'branch_created') then
    return new;
  end if;

  select workspace.current_file_id
    into selected_file_id
  from public.code_labs_workspace_state as workspace
  where workspace.owner_id = new.requested_by
  limit 1;

  select file.metadata
    into selected_metadata
  from public.code_labs_files as file
  where file.id = selected_file_id
    and file.owner_id = new.requested_by
  limit 1;

  handoff := pg_catalog.coalesce(selected_metadata -> 'repo_handoff', '{}'::jsonb);
  review := pg_catalog.coalesce(selected_metadata -> 'code_god_review', '{}'::jsonb);

  if selected_file_id is null or review ->> 'outcome' is distinct from 'PASS' then
    raise exception 'writer_code_god_pass_required';
  end if;
  if pg_catalog.coalesce(review ->> 'handoff_hash', '') !~ '^[a-f0-9]{64}$'
    or pg_catalog.coalesce(review ->> 'proposed_hash', '') !~ '^[a-f0-9]{64}$'
  then
    raise exception 'writer_review_hash_invalid';
  end if;
  if review ->> 'repo' is distinct from new.repo
    or review ->> 'path' is distinct from new.path
    or review ->> 'request_branch' is distinct from new.branch
    or handoff ->> 'repo' is distinct from new.repo
    or handoff ->> 'path' is distinct from new.path
    or handoff ->> 'request_branch' is distinct from new.branch
    or handoff ->> 'proposed' is distinct from new.content
    or review ->> 'proposed_hash' is distinct from handoff ->> 'proposed_hash'
  then
    raise exception 'writer_review_route_mismatch';
  end if;

  begin
    reviewed_at := (review ->> 'created_at')::timestamptz;
  exception when others then
    raise exception 'writer_review_timestamp_invalid';
  end;

  new.code_god_review_version := pg_catalog.left(pg_catalog.coalesce(review ->> 'version', ''), 120);
  new.code_god_outcome := 'PASS';
  new.code_god_handoff_hash := review ->> 'handoff_hash';
  new.code_god_proposed_hash := review ->> 'proposed_hash';
  new.code_god_reviewed_at := reviewed_at;
  new.code_god_source_file_id := selected_file_id;
  return new;
end;
$$;

revoke all on function public.code_labs_capture_writer_review_proof() from public, anon, authenticated;
grant execute on function public.code_labs_capture_writer_review_proof() to service_role;

drop trigger if exists code_labs_capture_writer_review_proof on public.code_labs_write_requests;
create trigger code_labs_capture_writer_review_proof
before insert on public.code_labs_write_requests
for each row execute function public.code_labs_capture_writer_review_proof();

create or replace function public.code_labs_prevent_writer_request_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.requested_by is distinct from old.requested_by
    or new.repo is distinct from old.repo
    or new.path is distinct from old.path
    or new.branch is distinct from old.branch
    or new.action is distinct from old.action
    or new.content is distinct from old.content
    or new.direct_main_write is distinct from old.direct_main_write
    or new.branch_pr_only is distinct from old.branch_pr_only
    or new.deletes_anything is distinct from old.deletes_anything
    or new.code_god_review_version is distinct from old.code_god_review_version
    or new.code_god_outcome is distinct from old.code_god_outcome
    or new.code_god_handoff_hash is distinct from old.code_god_handoff_hash
    or new.code_god_proposed_hash is distinct from old.code_god_proposed_hash
    or new.code_god_reviewed_at is distinct from old.code_god_reviewed_at
    or new.code_god_source_file_id is distinct from old.code_god_source_file_id
  then
    raise exception 'writer_request_review_proof_immutable';
  end if;
  return new;
end;
$$;

revoke all on function public.code_labs_prevent_writer_request_mutation() from public, anon, authenticated;
grant execute on function public.code_labs_prevent_writer_request_mutation() to service_role;

drop trigger if exists code_labs_prevent_writer_request_mutation on public.code_labs_write_requests;
create trigger code_labs_prevent_writer_request_mutation
before update on public.code_labs_write_requests
for each row execute function public.code_labs_prevent_writer_request_mutation();

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_active_request_review_proof_check;
alter table public.code_labs_write_requests
  add constraint code_labs_active_request_review_proof_check
  check (
    status not in ('queued', 'prepared', 'branch_created', 'processing')
    or (
      code_god_outcome = 'PASS'
      and pg_catalog.coalesce(code_god_review_version, '') <> ''
      and pg_catalog.coalesce(code_god_handoff_hash, '') ~ '^[a-f0-9]{64}$'
      and pg_catalog.coalesce(code_god_proposed_hash, '') ~ '^[a-f0-9]{64}$'
      and code_god_reviewed_at is not null
      and code_god_source_file_id is not null
    )
  );

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
  set status = 'processing',
      writer_claim_id = p_claim_id,
      writer_claimed_at = pg_catalog.now(),
      error = null,
      updated_at = pg_catalog.now()
  where request.id = p_request_id
    and request.requested_by = p_owner_id
    and request.status in ('queued', 'prepared', 'branch_created')
    and request.writer_claim_id is null
    and request.code_god_outcome = 'PASS'
    and pg_catalog.coalesce(request.code_god_review_version, '') <> ''
    and pg_catalog.coalesce(request.code_god_handoff_hash, '') ~ '^[a-f0-9]{64}$'
    and pg_catalog.coalesce(request.code_god_proposed_hash, '') ~ '^[a-f0-9]{64}$'
    and request.code_god_reviewed_at is not null
    and request.code_god_source_file_id is not null
  returning pg_catalog.to_jsonb(request) into claimed;

  if claimed is null then
    raise exception 'writer_request_not_claimable';
  end if;
  return claimed;
end;
$$;

revoke all on function public.code_labs_claim_write_request(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.code_labs_claim_write_request(uuid, uuid, uuid) to service_role;