-- Code Labs atomic workspace engine hardening.
-- Candidate only: apply only after the foundation migration and only in an
-- isolated database after exact-head review and disposable-database tests.

begin;

alter table public.code_labs_write_requests
  add column if not exists github_head_branch_sha text,
  add column if not exists github_branch_verified_at timestamptz;

-- Replace named constraints rather than preserving a stale earlier definition.
alter table public.code_labs_action_runs
  drop constraint if exists code_labs_action_runs_request_hash_check;
alter table public.code_labs_action_runs
  add constraint code_labs_action_runs_request_hash_check
  check (request_hash ~ '^[a-f0-9]{64}$');

alter table public.code_labs_action_runs
  drop constraint if exists code_labs_action_runs_status_check;
alter table public.code_labs_action_runs
  add constraint code_labs_action_runs_status_check
  check (status in (
    'running',
    'completed',
    'failed_validation',
    'interrupted',
    'external_pending',
    'external_applied'
  ));

alter table public.code_labs_action_runs
  drop constraint if exists code_labs_action_runs_completion_check;
alter table public.code_labs_action_runs
  add constraint code_labs_action_runs_completion_check
  check (
    (status = 'completed'
      and completed_state_version = expected_state_version + 1
      and fencing_token is not null
      and stored_result is not null)
    or
    (status <> 'completed' and completed_state_version is null)
  );

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_writer_phase_check;
alter table public.code_labs_write_requests
  add constraint code_labs_writer_phase_check
  check (
    writer_phase is null or writer_phase in (
      'queued',
      'processing',
      'github_committed',
      'pr_opened',
      'completed'
    )
  );

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_writer_expected_blob_check;
alter table public.code_labs_write_requests
  add constraint code_labs_writer_expected_blob_check
  check (
    operation_id is null
    or (
      expected_github_blob_absent = true
      and expected_github_blob_sha is null
    )
    or (
      expected_github_blob_absent = false
      and expected_github_blob_sha ~ '^[a-f0-9]{40}$'
    )
  );

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_writer_content_hash_check;
alter table public.code_labs_write_requests
  add constraint code_labs_writer_content_hash_check
  check (
    operation_id is null
    or expected_content_sha256 ~ '^[a-f0-9]{64}$'
  );

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_writer_branch_proof_check;
alter table public.code_labs_write_requests
  add constraint code_labs_writer_branch_proof_check
  check (
    operation_id is null
    or (
      github_head_branch_sha ~ '^[a-f0-9]{40}$'
      and github_branch_verified_at is not null
      and github_head_branch = branch
      and nullif(btrim(github_base_branch), '') is not null
      and github_head_branch is distinct from github_base_branch
      and lower(github_head_branch) not in ('main', 'master')
    )
  );

create or replace function public.code_labs_jsonb_boolean(
  p_value jsonb,
  p_default boolean,
  p_error_code text
)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
declare
  v_text text;
begin
  if p_value is null or p_value = 'null'::jsonb then
    return p_default;
  end if;

  if jsonb_typeof(p_value) = 'boolean' then
    return p_value::text::boolean;
  end if;

  if jsonb_typeof(p_value) = 'string' then
    v_text := lower(btrim(p_value #>> '{}'));
    if v_text = 'true' then return true; end if;
    if v_text = 'false' then return false; end if;
  end if;

  raise exception using
    errcode = 'P0001',
    message = coalesce(nullif(p_error_code, ''), 'json_boolean_invalid');
end;
$$;

create or replace function public.code_labs_raise_hierarchy_error(
  p_owner_id uuid,
  p_specific_error text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation_text text;
  v_operation_id uuid;
  v_action text;
begin
  v_operation_text := nullif(current_setting('code_labs.operation_id', true), '');
  if v_operation_text is not null then
    begin
      v_operation_id := v_operation_text::uuid;
      select r.action into v_action
      from public.code_labs_action_runs r
      where r.owner_id = p_owner_id
        and r.operation_id = v_operation_id;
    exception when others then
      v_action := null;
    end;
  end if;

  if v_action = 'undo.execute' then
    raise exception using errcode = 'P0001', message = 'undo_hierarchy_invalid';
  end if;

  raise exception using
    errcode = 'P0001',
    message = coalesce(nullif(p_specific_error, ''), 'record_hierarchy_invalid');
end;
$$;

create or replace function public.code_labs_validate_record_hierarchy()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_table_name = 'code_labs_jobs' then
    if new.file_id is null or not exists (
      select 1
      from public.code_labs_files f
      where f.owner_id = new.owner_id
        and f.project_id = new.project_id
        and f.id = new.file_id
    ) then
      perform public.code_labs_raise_hierarchy_error(
        new.owner_id,
        'job_patch_file_hierarchy_invalid'
      );
    end if;

  elsif tg_table_name = 'code_labs_packets' then
    if new.job_id is null or not exists (
      select 1
      from public.code_labs_jobs j
      where j.owner_id = new.owner_id
        and j.project_id = new.project_id
        and j.id = new.job_id
    ) then
      perform public.code_labs_raise_hierarchy_error(
        new.owner_id,
        'packet_patch_job_hierarchy_invalid'
      );
    end if;

  elsif tg_table_name = 'code_labs_test_runs' then
    if new.job_id is null or not exists (
      select 1
      from public.code_labs_jobs j
      where j.owner_id = new.owner_id
        and j.project_id = new.project_id
        and j.id = new.job_id
    ) then
      perform public.code_labs_raise_hierarchy_error(
        new.owner_id,
        'test_patch_job_hierarchy_invalid'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists code_labs_jobs_hierarchy_guard on public.code_labs_jobs;
create trigger code_labs_jobs_hierarchy_guard
before insert or update of owner_id, project_id, file_id
on public.code_labs_jobs
for each row execute function public.code_labs_validate_record_hierarchy();

drop trigger if exists code_labs_packets_hierarchy_guard on public.code_labs_packets;
create trigger code_labs_packets_hierarchy_guard
before insert or update of owner_id, project_id, job_id
on public.code_labs_packets
for each row execute function public.code_labs_validate_record_hierarchy();

drop trigger if exists code_labs_test_runs_hierarchy_guard on public.code_labs_test_runs;
create trigger code_labs_test_runs_hierarchy_guard
before insert or update of owner_id, project_id, job_id
on public.code_labs_test_runs
for each row execute function public.code_labs_validate_record_hierarchy();

create or replace function public.code_labs_validate_file_hashes()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_candidate text;
  v_candidate_hash text;
  v_source_hash text;
begin
  new.current_hash := public.code_labs_sha256_text(coalesce(new.current_code, ''));

  v_candidate := coalesce(new.metadata->>'fixed_output', '');
  v_candidate_hash := lower(coalesce(new.metadata->>'candidate_hash', ''));
  if v_candidate_hash <> '' and (
    v_candidate = ''
    or v_candidate_hash !~ '^[a-f0-9]{64}$'
    or v_candidate_hash <> public.code_labs_sha256_text(v_candidate)
  ) then
    raise exception using errcode = 'P0001', message = 'candidate_hash_invalid';
  end if;

  v_source_hash := lower(coalesce(new.metadata->>'source_hash', ''));
  if v_source_hash <> '' and (
    v_source_hash !~ '^[a-f0-9]{64}$'
    or v_source_hash <> public.code_labs_sha256_text(coalesce(new.current_code, ''))
  ) then
    raise exception using errcode = 'P0001', message = 'source_hash_invalid';
  end if;

  return new;
end;
$$;

drop trigger if exists code_labs_files_hash_guard on public.code_labs_files;
create trigger code_labs_files_hash_guard
before insert or update of current_code, current_hash, metadata
on public.code_labs_files
for each row execute function public.code_labs_validate_file_hashes();

create or replace function public.code_labs_validate_writer_request_proof()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
begin
  if new.operation_id is null then
    return new;
  end if;

  if new.github_head_branch_sha is null
     or new.github_head_branch_sha !~ '^[a-f0-9]{40}$'
     or new.github_branch_verified_at is null
     or new.github_head_branch is distinct from new.branch
     or nullif(btrim(new.github_base_branch), '') is null then
    raise exception using errcode = 'P0001', message = 'writer_branch_proof_invalid';
  end if;

  if lower(new.github_head_branch) in ('main', 'master')
     or new.github_head_branch is not distinct from new.github_base_branch
     or lower(new.branch) in ('main', 'master') then
    raise exception using errcode = 'P0001', message = 'writer_protected_branch_invalid';
  end if;

  if new.expected_content_sha256 is null
     or new.expected_content_sha256 !~ '^[a-f0-9]{64}$'
     or new.expected_content_sha256 <> public.code_labs_sha256_text(coalesce(new.content, '')) then
    raise exception using errcode = 'P0001', message = 'writer_content_hash_invalid';
  end if;

  if (new.expected_github_blob_absent and new.expected_github_blob_sha is not null)
     or (not new.expected_github_blob_absent and coalesce(new.expected_github_blob_sha, '') !~ '^[a-f0-9]{40}$') then
    raise exception using errcode = 'P0001', message = 'writer_expected_blob_invalid';
  end if;

  return new;
end;
$$;

drop trigger if exists code_labs_writer_request_proof_guard
on public.code_labs_write_requests;
create trigger code_labs_writer_request_proof_guard
before insert or update of
  operation_id,
  content,
  branch,
  github_base_branch,
  github_head_branch,
  github_head_branch_sha,
  github_branch_verified_at,
  expected_content_sha256,
  expected_github_blob_sha,
  expected_github_blob_absent
on public.code_labs_write_requests
for each row execute function public.code_labs_validate_writer_request_proof();

create or replace function public.code_labs_guard_action_run_transition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation_text text;
  v_fence_text text;
  v_operation_id uuid;
  v_fencing_token bigint;
begin
  if new.status in ('failed_validation', 'interrupted')
     and new.status is distinct from old.status then
    v_operation_text := nullif(current_setting('code_labs.operation_id', true), '');
    v_fence_text := nullif(current_setting('code_labs.fencing_token', true), '');

    if old.status <> 'running'
       or old.fencing_token is null
       or v_operation_text is null
       or v_fence_text is null then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end if;

    begin
      v_operation_id := v_operation_text::uuid;
      v_fencing_token := v_fence_text::bigint;
    exception when others then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end;

    if v_operation_id is distinct from old.operation_id
       or v_fencing_token is distinct from old.fencing_token then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end if;

    new.fencing_token := old.fencing_token;
    new.completed_state_version := null;
  end if;

  return new;
end;
$$;

drop trigger if exists code_labs_action_runs_transition_guard
on public.code_labs_action_runs;
create trigger code_labs_action_runs_transition_guard
before update on public.code_labs_action_runs
for each row execute function public.code_labs_guard_action_run_transition();

revoke all on function public.code_labs_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated;
revoke all on function public.code_labs_raise_hierarchy_error(uuid, text)
  from public, anon, authenticated;
revoke all on function public.code_labs_validate_record_hierarchy()
  from public, anon, authenticated;
revoke all on function public.code_labs_validate_file_hashes()
  from public, anon, authenticated;
revoke all on function public.code_labs_validate_writer_request_proof()
  from public, anon, authenticated;
revoke all on function public.code_labs_guard_action_run_transition()
  from public, anon, authenticated;

grant execute on function public.code_labs_jsonb_boolean(jsonb, boolean, text)
  to service_role;

commit;
