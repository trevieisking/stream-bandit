begin;

create table if not exists public.code_labs_github_operations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  operation_key text not null,
  operation_type text not null check (operation_type in (
    'branch_create',
    'file_create',
    'file_update',
    'draft_pr_create'
  )),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  repo text not null check (repo ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  branch text not null check (
    branch ~ '^[A-Za-z0-9._/-]{3,120}$'
    and branch !~* '^(main|master|gh-pages|production|live)$'
  ),
  base_ref text,
  path text,
  expected_blob_sha text check (
    expected_blob_sha is null or expected_blob_sha ~ '^[a-f0-9]{40}$'
  ),
  content_hash text check (
    content_hash is null or content_hash ~ '^[a-f0-9]{64}$'
  ),
  content text check (content is null or octet_length(content) between 1 and 750000),
  commit_message text,
  pr_title text,
  pr_body text,
  status text not null default 'queued' check (status in (
    'queued', 'processing', 'completed', 'failed'
  )),
  claim_id uuid,
  claimed_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  result jsonb not null default '{}'::jsonb,
  error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, operation_key),
  check (
    path is null or (
      path <> ''
      and path !~ '(^/|\\.\\.|\\\\|^\\.|/\\.)'
      and path !~* '(^|/)\.github/'
      and path !~* '(\.env$|\.pem$|\.key$|\.p12$|\.pfx$|secrets?)'
    )
  ),
  check (
    (operation_type = 'branch_create' and base_ref is not null and path is null and content is null)
    or
    (operation_type = 'file_create' and path is not null and expected_blob_sha is null and content_hash is not null and content is not null)
    or
    (operation_type = 'file_update' and path is not null and expected_blob_sha is not null and content_hash is not null and content is not null)
    or
    (operation_type = 'draft_pr_create' and base_ref is not null and path is null and content is null)
  )
);

comment on table public.code_labs_github_operations is
  'Durable owner-scoped V105 GitHub operations. This lane is independent of code_labs_workspace_state and never reads or increments state_version.';

create index if not exists code_labs_github_operations_owner_status_idx
  on public.code_labs_github_operations (owner_id, status, created_at desc);

create index if not exists code_labs_github_operations_claim_idx
  on public.code_labs_github_operations (claim_id)
  where claim_id is not null;

alter table public.code_labs_github_operations enable row level security;
revoke all on table public.code_labs_github_operations from anon, authenticated, public;
grant select, insert, update on table public.code_labs_github_operations to service_role;

create or replace function public.code_labs_claim_github_operation(
  p_owner_id uuid,
  p_operation_key text,
  p_request_hash text,
  p_claim_id uuid
)
returns public.code_labs_github_operations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation public.code_labs_github_operations;
begin
  if p_owner_id is null or p_operation_key is null or p_request_hash is null or p_claim_id is null then
    raise exception 'V105 GitHub operation claim parameters are required.';
  end if;

  select * into v_operation
  from public.code_labs_github_operations
  where owner_id = p_owner_id
    and operation_key = p_operation_key
  for update;

  if not found then
    raise exception 'V105 GitHub operation was not found.';
  end if;

  if v_operation.request_hash <> p_request_hash then
    raise exception 'V105 GitHub operation identity was reused with different input.';
  end if;

  if v_operation.status = 'completed' then
    return v_operation;
  end if;

  if v_operation.status = 'processing' and v_operation.claim_id <> p_claim_id then
    raise exception 'V105 GitHub operation is already processing.';
  end if;

  update public.code_labs_github_operations
  set status = 'processing',
      claim_id = p_claim_id,
      claimed_at = coalesce(claimed_at, now()),
      attempt_count = attempt_count + case when status = 'processing' then 0 else 1 end,
      error = null,
      updated_at = now()
  where id = v_operation.id
  returning * into v_operation;

  return v_operation;
end;
$$;

create or replace function public.code_labs_complete_github_operation(
  p_owner_id uuid,
  p_operation_key text,
  p_claim_id uuid,
  p_result jsonb
)
returns public.code_labs_github_operations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation public.code_labs_github_operations;
begin
  update public.code_labs_github_operations
  set status = 'completed',
      result = coalesce(p_result, '{}'::jsonb),
      error = null,
      completed_at = coalesce(completed_at, now()),
      updated_at = now()
  where owner_id = p_owner_id
    and operation_key = p_operation_key
    and status = 'processing'
    and claim_id = p_claim_id
  returning * into v_operation;

  if not found then
    raise exception 'V105 GitHub operation completion claim did not match.';
  end if;

  return v_operation;
end;
$$;

create or replace function public.code_labs_fail_github_operation(
  p_owner_id uuid,
  p_operation_key text,
  p_claim_id uuid,
  p_error text
)
returns public.code_labs_github_operations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation public.code_labs_github_operations;
begin
  update public.code_labs_github_operations
  set status = 'failed',
      error = left(coalesce(p_error, 'V105 GitHub operation failed.'), 1000),
      updated_at = now()
  where owner_id = p_owner_id
    and operation_key = p_operation_key
    and status = 'processing'
    and claim_id = p_claim_id
  returning * into v_operation;

  if not found then
    raise exception 'V105 GitHub operation failure claim did not match.';
  end if;

  return v_operation;
end;
$$;

revoke all on function public.code_labs_claim_github_operation(uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.code_labs_complete_github_operation(uuid, text, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.code_labs_fail_github_operation(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.code_labs_claim_github_operation(uuid, text, text, uuid) to service_role;
grant execute on function public.code_labs_complete_github_operation(uuid, text, uuid, jsonb) to service_role;
grant execute on function public.code_labs_fail_github_operation(uuid, text, uuid, text) to service_role;

commit;
