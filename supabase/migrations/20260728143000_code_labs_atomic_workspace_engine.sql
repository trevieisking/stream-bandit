-- Code Labs atomic workspace engine foundation.
-- Candidate only: do not apply to production until exact-head review,
-- isolated database integration tests, and a separate promotion decision pass.
--
-- This is the additive transaction foundation. The later enforcement migration
-- attaches the universal workspace guard and revokes the legacy reservation RPC
-- only after the compatible Edge Function has passed isolated smoke tests.

begin;

alter table public.code_labs_workspace_state
  add column if not exists workspace_fencing_token bigint not null default 0;

alter table public.code_labs_packets
  add column if not exists updated_at timestamptz not null default now();

alter table public.code_labs_test_runs
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.code_labs_action_runs (
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  operation_id uuid not null,
  action text not null,
  request_hash text not null,
  expected_state_version bigint not null,
  completed_state_version bigint,
  fencing_token bigint,
  status text not null default 'running',
  stored_result jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (owner_id, operation_id)
);

alter table public.code_labs_action_runs
  add column if not exists request_hash text,
  add column if not exists completed_state_version bigint,
  add column if not exists fencing_token bigint,
  add column if not exists stored_result jsonb,
  add column if not exists error_code text,
  add column if not exists error_message text,
  add column if not exists completed_at timestamptz;

update public.code_labs_action_runs
set request_hash = coalesce(request_hash, repeat('0', 64))
where request_hash is null;

alter table public.code_labs_action_runs
  alter column request_hash set not null;

alter table public.code_labs_action_receipts
  add column if not exists operation_id uuid,
  add column if not exists fencing_token bigint;

alter table public.code_labs_versions
  add column if not exists operation_id uuid,
  add column if not exists fencing_token bigint;

alter table public.code_labs_write_requests
  add column if not exists operation_id uuid,
  add column if not exists writer_fencing_token bigint,
  add column if not exists writer_phase text,
  add column if not exists expected_github_blob_sha text,
  add column if not exists expected_github_blob_absent boolean not null default false,
  add column if not exists expected_content_sha256 text,
  add column if not exists github_base_branch text,
  add column if not exists github_head_branch text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.code_labs_action_runs'::regclass
      and conname = 'code_labs_action_runs_request_hash_check'
  ) then
    alter table public.code_labs_action_runs
      add constraint code_labs_action_runs_request_hash_check
      check (request_hash ~ '^[a-f0-9]{64}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.code_labs_action_runs'::regclass
      and conname = 'code_labs_action_runs_status_check'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.code_labs_action_runs'::regclass
      and conname = 'code_labs_action_runs_completion_check'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.code_labs_write_requests'::regclass
      and conname = 'code_labs_writer_phase_check'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.code_labs_write_requests'::regclass
      and conname = 'code_labs_writer_expected_blob_check'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.code_labs_write_requests'::regclass
      and conname = 'code_labs_writer_content_hash_check'
  ) then
    alter table public.code_labs_write_requests
      add constraint code_labs_writer_content_hash_check
      check (
        operation_id is null
        or expected_content_sha256 ~ '^[a-f0-9]{64}$'
      );
  end if;
end;
$$;

create unique index if not exists code_labs_action_runs_owner_fence_uidx
  on public.code_labs_action_runs (owner_id, fencing_token)
  where fencing_token is not null;

create index if not exists code_labs_action_runs_owner_updated_idx
  on public.code_labs_action_runs (owner_id, updated_at desc);

create unique index if not exists code_labs_action_receipts_owner_operation_uidx
  on public.code_labs_action_receipts (owner_id, operation_id)
  where operation_id is not null;

create unique index if not exists code_labs_versions_owner_operation_uidx
  on public.code_labs_versions (owner_id, operation_id)
  where operation_id is not null;

create unique index if not exists code_labs_write_requests_owner_operation_uidx
  on public.code_labs_write_requests (requested_by, operation_id)
  where operation_id is not null;

alter table public.code_labs_action_runs enable row level security;
revoke all on table public.code_labs_action_runs from public, anon, authenticated;
grant select, insert, update, delete on table public.code_labs_action_runs to service_role;

create or replace function public.code_labs_sha256_text(p_value text)
returns text
language sql
immutable
strict
set search_path = pg_catalog, public, extensions
as $$
  select encode(extensions.digest(p_value, 'sha256'), 'hex');
$$;

create or replace function public.code_labs_effect_allowed(
  p_action text,
  p_effect_kind text
)
returns boolean
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case p_effect_kind
    when 'workspace_select' then p_action in (
      'project.select', 'file.select', 'job.select', 'packet.select', 'test.select'
    )
    when 'workflow_move' then p_action in ('workflow.advance', 'workflow.reset')
    when 'workspace_patch' then p_action = 'file.intake'
    when 'record_update' then p_action in (
      'setup.save',
      'file.replace_current',
      'repair.save',
      'packet.build',
      'canvas.save_candidate',
      'candidate.save',
      'candidate.accept',
      'test.record',
      'repo.prepare_handoff',
      'code_god.review',
      'undo.execute'
    )
    when 'file_intake_upsert' then p_action = 'file.intake'
    when 'checkpoint_insert' then p_action = 'checkpoint.create'
    when 'write_request_insert' then p_action = 'github.writer_prepare'
    when 'receipt_update' then p_action = 'undo.execute'
    when 'receipt_insert' then p_action in (
      'file.intake',
      'setup.save',
      'project.select',
      'file.select',
      'job.select',
      'packet.select',
      'test.select',
      'file.replace_current',
      'repair.save',
      'packet.build',
      'canvas.save_candidate',
      'candidate.save',
      'candidate.accept',
      'test.record',
      'checkpoint.create',
      'workflow.advance',
      'workflow.reset',
      'repo.prepare_handoff',
      'code_god.review',
      'github.writer_prepare',
      'undo.execute'
    )
    else false
  end;
$$;

create or replace function public.code_labs_apply_record_patch(
  p_owner_id uuid,
  p_action text,
  p_record_type text,
  p_record_id uuid,
  p_expected_updated_at timestamptz,
  p_patch jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_state public.code_labs_workspace_state%rowtype;
  v_before jsonb;
  v_after jsonb;
  v_allowed text[];
  v_bad_keys text[];
begin
  if p_owner_id is null or p_record_id is null
     or nullif(btrim(p_record_type), '') is null
     or p_expected_updated_at is null
     or p_patch is null or jsonb_typeof(p_patch) <> 'object' then
    raise exception 'record_patch_invalid';
  end if;

  select * into v_state
  from public.code_labs_workspace_state
  where owner_id = p_owner_id;

  if not found then raise exception 'workspace_not_found'; end if;

  if p_record_type = 'project' then
    if p_action <> 'setup.save' or v_state.current_project_id is distinct from p_record_id then
      raise exception 'selected_project_mismatch';
    end if;
    v_allowed := array['workspace','site_name','site_url','repo','mode','notes','status','metadata'];

    select to_jsonb(p) into v_before
    from public.code_labs_projects p
    where p.owner_id = p_owner_id and p.id = p_record_id
    for update;

    if v_before is null then raise exception 'project_not_found'; end if;
    if (v_before->>'updated_at')::timestamptz is distinct from p_expected_updated_at then
      raise exception 'record_changed';
    end if;
    if p_patch ? 'metadata' and jsonb_typeof(p_patch->'metadata') <> 'object' then
      raise exception 'metadata_must_be_object';
    end if;

    select array_agg(k) into v_bad_keys
    from jsonb_object_keys(p_patch) as k
    where not (k = any(v_allowed));
    if v_bad_keys is not null then raise exception 'unsupported_project_fields'; end if;

    update public.code_labs_projects p
    set workspace = case when p_patch ? 'workspace' then p_patch->>'workspace' else p.workspace end,
        site_name = case when p_patch ? 'site_name' then p_patch->>'site_name' else p.site_name end,
        site_url = case when p_patch ? 'site_url' then p_patch->>'site_url' else p.site_url end,
        repo = case when p_patch ? 'repo' then p_patch->>'repo' else p.repo end,
        mode = case when p_patch ? 'mode' then p_patch->>'mode' else p.mode end,
        notes = case when p_patch ? 'notes' then p_patch->>'notes' else p.notes end,
        status = case when p_patch ? 'status' then p_patch->>'status' else p.status end,
        metadata = case when p_patch ? 'metadata' then p_patch->'metadata' else p.metadata end,
        updated_at = now()
    where p.owner_id = p_owner_id and p.id = p_record_id
    returning to_jsonb(p) into v_after;

  elsif p_record_type = 'file' then
    if p_action not in (
      'file.replace_current', 'canvas.save_candidate', 'candidate.save',
      'candidate.accept', 'repo.prepare_handoff', 'code_god.review',
      'undo.execute'
    ) then raise exception 'file_action_mismatch'; end if;
    if p_action <> 'undo.execute' and v_state.current_file_id is distinct from p_record_id then
      raise exception 'selected_file_mismatch';
    end if;
    v_allowed := case p_action
      when 'file.replace_current' then array['filename','file_type','current_code','metadata']
      when 'candidate.accept' then array['current_code','metadata']
      when 'undo.execute' then array['filename','file_type','current_code','metadata']
      else array['metadata']
    end;

    select to_jsonb(f) into v_before
    from public.code_labs_files f
    where f.owner_id = p_owner_id and f.id = p_record_id
    for update;

    if v_before is null then raise exception 'file_not_found'; end if;
    if p_action <> 'undo.execute'
       and (v_before->>'project_id')::uuid is distinct from v_state.current_project_id then
      raise exception 'file_project_mismatch';
    end if;
    if (v_before->>'updated_at')::timestamptz is distinct from p_expected_updated_at then
      raise exception 'record_changed';
    end if;
    if p_patch ? 'metadata' and jsonb_typeof(p_patch->'metadata') <> 'object' then
      raise exception 'metadata_must_be_object';
    end if;
    if p_action = 'candidate.accept' and (
      not (p_patch ? 'current_code')
      or coalesce(p_patch->>'current_code','') = ''
      or coalesce(p_patch->>'current_code','') <> coalesce(v_before->'metadata'->>'fixed_output','')
    ) then
      raise exception 'candidate_accept_binding_invalid';
    end if;

    select array_agg(k) into v_bad_keys
    from jsonb_object_keys(p_patch) as k
    where not (k = any(v_allowed));
    if v_bad_keys is not null then raise exception 'unsupported_file_fields'; end if;

    update public.code_labs_files f
    set filename = case when p_patch ? 'filename' then p_patch->>'filename' else f.filename end,
        file_type = case when p_patch ? 'file_type' then p_patch->>'file_type' else f.file_type end,
        current_code = case when p_patch ? 'current_code' then p_patch->>'current_code' else f.current_code end,
        current_hash = case
          when p_patch ? 'current_code' then public.code_labs_sha256_text(coalesce(p_patch->>'current_code', ''))
          else f.current_hash
        end,
        metadata = case when p_patch ? 'metadata' then p_patch->'metadata' else f.metadata end,
        updated_at = now()
    where f.owner_id = p_owner_id and f.id = p_record_id
    returning to_jsonb(f) into v_after;

  elsif p_record_type = 'job' then
    if p_action not in ('repair.save', 'undo.execute') then raise exception 'job_action_mismatch'; end if;
    if p_action <> 'undo.execute' and v_state.current_job_id is distinct from p_record_id then
      raise exception 'selected_job_mismatch';
    end if;
    v_allowed := array['file_id','title','problem','dont_touch','errors','status','started_at','completed_at','metadata'];

    select to_jsonb(j) into v_before
    from public.code_labs_jobs j
    where j.owner_id = p_owner_id and j.id = p_record_id
    for update;

    if v_before is null then raise exception 'job_not_found'; end if;
    if p_action <> 'undo.execute'
       and ((v_before->>'project_id')::uuid is distinct from v_state.current_project_id
         or (v_before->>'file_id')::uuid is distinct from v_state.current_file_id) then
      raise exception 'job_hierarchy_mismatch';
    end if;
    if (v_before->>'updated_at')::timestamptz is distinct from p_expected_updated_at then
      raise exception 'record_changed';
    end if;
    if p_patch ? 'metadata' and jsonb_typeof(p_patch->'metadata') <> 'object' then
      raise exception 'metadata_must_be_object';
    end if;

    select array_agg(k) into v_bad_keys
    from jsonb_object_keys(p_patch) as k
    where not (k = any(v_allowed));
    if v_bad_keys is not null then raise exception 'unsupported_job_fields'; end if;

    update public.code_labs_jobs j
    set file_id = case when p_patch ? 'file_id' then nullif(p_patch->>'file_id','')::uuid else j.file_id end,
        title = case when p_patch ? 'title' then p_patch->>'title' else j.title end,
        problem = case when p_patch ? 'problem' then p_patch->>'problem' else j.problem end,
        dont_touch = case when p_patch ? 'dont_touch' then p_patch->>'dont_touch' else j.dont_touch end,
        errors = case when p_patch ? 'errors' then p_patch->>'errors' else j.errors end,
        status = case when p_patch ? 'status' then p_patch->>'status' else j.status end,
        started_at = case when p_patch ? 'started_at' then nullif(p_patch->>'started_at','')::timestamptz else j.started_at end,
        completed_at = case when p_patch ? 'completed_at' then nullif(p_patch->>'completed_at','')::timestamptz else j.completed_at end,
        metadata = case when p_patch ? 'metadata' then p_patch->'metadata' else j.metadata end,
        updated_at = now()
    where j.owner_id = p_owner_id and j.id = p_record_id
    returning to_jsonb(j) into v_after;

  elsif p_record_type = 'packet' then
    if p_action not in ('packet.build', 'undo.execute') then raise exception 'packet_action_mismatch'; end if;
    if p_action <> 'undo.execute' and v_state.current_packet_id is distinct from p_record_id then
      raise exception 'selected_packet_mismatch';
    end if;
    v_allowed := array['job_id','packet_type','packet_text','metadata'];

    select to_jsonb(p) into v_before
    from public.code_labs_packets p
    where p.owner_id = p_owner_id and p.id = p_record_id
    for update;

    if v_before is null then raise exception 'packet_not_found'; end if;
    if p_action <> 'undo.execute'
       and ((v_before->>'project_id')::uuid is distinct from v_state.current_project_id
         or (v_before->>'job_id')::uuid is distinct from v_state.current_job_id) then
      raise exception 'packet_hierarchy_mismatch';
    end if;
    if (v_before->>'updated_at')::timestamptz is distinct from p_expected_updated_at then
      raise exception 'record_changed';
    end if;
    if p_patch ? 'metadata' and jsonb_typeof(p_patch->'metadata') <> 'object' then
      raise exception 'metadata_must_be_object';
    end if;

    select array_agg(k) into v_bad_keys
    from jsonb_object_keys(p_patch) as k
    where not (k = any(v_allowed));
    if v_bad_keys is not null then raise exception 'unsupported_packet_fields'; end if;

    update public.code_labs_packets p
    set job_id = case when p_patch ? 'job_id' then nullif(p_patch->>'job_id','')::uuid else p.job_id end,
        packet_type = case when p_patch ? 'packet_type' then p_patch->>'packet_type' else p.packet_type end,
        packet_text = case when p_patch ? 'packet_text' then p_patch->>'packet_text' else p.packet_text end,
        metadata = case when p_patch ? 'metadata' then p_patch->'metadata' else p.metadata end,
        updated_at = now()
    where p.owner_id = p_owner_id and p.id = p_record_id
    returning to_jsonb(p) into v_after;

  elsif p_record_type = 'test' then
    if p_action not in ('test.record', 'undo.execute') then raise exception 'test_action_mismatch'; end if;
    if p_action <> 'undo.execute' and v_state.current_test_run_id is distinct from p_record_id then
      raise exception 'selected_test_mismatch';
    end if;
    v_allowed := array['job_id','filename','result','checked_count','total_count','notes','details'];

    select to_jsonb(t) into v_before
    from public.code_labs_test_runs t
    where t.owner_id = p_owner_id and t.id = p_record_id
    for update;

    if v_before is null then raise exception 'test_not_found'; end if;
    if p_action <> 'undo.execute'
       and ((v_before->>'project_id')::uuid is distinct from v_state.current_project_id
         or (v_before->>'job_id')::uuid is distinct from v_state.current_job_id) then
      raise exception 'test_hierarchy_mismatch';
    end if;
    if (v_before->>'updated_at')::timestamptz is distinct from p_expected_updated_at then
      raise exception 'record_changed';
    end if;
    if p_patch ? 'details' and jsonb_typeof(p_patch->'details') <> 'object' then
      raise exception 'details_must_be_object';
    end if;

    select array_agg(k) into v_bad_keys
    from jsonb_object_keys(p_patch) as k
    where not (k = any(v_allowed));
    if v_bad_keys is not null then raise exception 'unsupported_test_fields'; end if;

    update public.code_labs_test_runs t
    set job_id = case when p_patch ? 'job_id' then nullif(p_patch->>'job_id','')::uuid else t.job_id end,
        filename = case when p_patch ? 'filename' then p_patch->>'filename' else t.filename end,
        result = case when p_patch ? 'result' then p_patch->>'result' else t.result end,
        checked_count = case when p_patch ? 'checked_count' then (p_patch->>'checked_count')::integer else t.checked_count end,
        total_count = case when p_patch ? 'total_count' then (p_patch->>'total_count')::integer else t.total_count end,
        notes = case when p_patch ? 'notes' then p_patch->>'notes' else t.notes end,
        details = case when p_patch ? 'details' then p_patch->'details' else t.details end,
        updated_at = now()
    where t.owner_id = p_owner_id and t.id = p_record_id
    returning to_jsonb(t) into v_after;

  else
    raise exception 'unsupported_record_type';
  end if;

  if v_after is null then raise exception 'record_update_failed'; end if;
  return jsonb_build_object('before', v_before, 'after', v_after);
end;
$$;

create or replace function public.code_labs_execute_workspace_action(
  p_owner_id uuid,
  p_operation_id uuid,
  p_action text,
  p_expected_state_version bigint,
  p_request_hash text,
  p_payload jsonb,
  p_fencing_token bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_allowed_actions constant text[] := array[
    'file.intake',
    'setup.save',
    'project.select',
    'file.select',
    'job.select',
    'packet.select',
    'test.select',
    'file.replace_current',
    'repair.save',
    'packet.build',
    'canvas.save_candidate',
    'candidate.save',
    'candidate.accept',
    'test.record',
    'checkpoint.create',
    'workflow.advance',
    'workflow.reset',
    'repo.prepare_handoff',
    'code_god.review',
    'github.writer_prepare',
    'undo.execute'
  ];
  v_run public.code_labs_action_runs%rowtype;
  v_state public.code_labs_workspace_state%rowtype;
  v_state_after public.code_labs_workspace_state%rowtype;
  v_undo_receipt public.code_labs_action_receipts%rowtype;
  v_effects jsonb;
  v_effect jsonb;
  v_effect_kind text;
  v_effect_key text;
  v_outputs jsonb := '{}'::jsonb;
  v_workspace_patch jsonb := '{}'::jsonb;
  v_record_result jsonb;
  v_record_type text;
  v_record_id uuid;
  v_expected_updated_at timestamptz;
  v_patch jsonb;
  v_fencing_token bigint;
  v_completed_state_version bigint;
  v_result jsonb;
  v_failure jsonb;
  v_status text;
  v_error_code text;
  v_error_message text;
  v_receipt_count integer := 0;
  v_receipt_spec jsonb;
  v_receipt_before jsonb;
  v_receipt_after jsonb;
  v_receipt_record_type text;
  v_receipt_record_id uuid;
  v_record_update_count integer := 0;
  v_workspace_effect_count integer := 0;
  v_checkpoint_count integer := 0;
  v_write_request_count integer := 0;
  v_intake_count integer := 0;
  v_receipt_update_count integer := 0;
  v_selected jsonb;
  v_linked jsonb;
  v_file jsonb;
  v_file_id uuid;
  v_project_id uuid;
  v_matches integer;
  v_created boolean;
  v_path text;
  v_file_type text;
  v_code text;
  v_current_hash text;
  v_metadata jsonb;
  v_source_commit_sha text;
  v_changed_fields text[];
  v_inserted_receipt public.code_labs_action_receipts%rowtype;
  v_inserted_version public.code_labs_versions%rowtype;
  v_inserted_request public.code_labs_write_requests%rowtype;
  v_handoff jsonb;
  v_review jsonb;
  v_request jsonb;
  v_expected_blob_sha text;
  v_expected_blob_absent boolean;
  v_expected_content_sha256 text;
  v_content text;
  v_writer_marker jsonb;
  v_writer_before_marker jsonb;
  v_checkpoint_marker jsonb;
  v_intake_marker jsonb;
  v_file_before jsonb;
begin
  if p_owner_id is null or p_operation_id is null
     or nullif(btrim(p_action), '') is null
     or p_expected_state_version is null or p_expected_state_version < 1
     or p_request_hash is null or p_request_hash !~ '^[a-f0-9]{64}$'
     or p_payload is null or jsonb_typeof(p_payload) <> 'object'
     or pg_column_size(p_payload) > 2000000 then
    raise exception 'atomic_action_request_invalid';
  end if;

  if not (p_action = any(v_allowed_actions)) then
    raise exception 'atomic_action_not_allowed';
  end if;

  if not exists (
    select 1 from public.code_labs_owners where user_id = p_owner_id
  ) then
    raise exception 'code_labs_owner_not_found';
  end if;

  select * into v_run
  from public.code_labs_action_runs
  where owner_id = p_owner_id and operation_id = p_operation_id
  for update;

  if found then
    if v_run.action <> p_action
       or v_run.request_hash <> p_request_hash
       or v_run.expected_state_version <> p_expected_state_version then
      raise exception 'operation_identity_conflict';
    end if;

    if v_run.status = 'completed' then
      v_completed_state_version := v_run.completed_state_version;
      return coalesce(v_run.stored_result, '{}'::jsonb) || jsonb_build_object(
        'replayed', true,
        'completed_state_version', v_completed_state_version,
        'fencing_token', v_run.fencing_token
      );
    end if;

    if v_run.status = 'failed_validation' then
      return coalesce(v_run.stored_result, '{}'::jsonb) || jsonb_build_object(
        'replayed', true,
        'completed_state_version', null,
        'fencing_token', v_run.fencing_token
      );
    end if;

    if v_run.status in ('external_pending', 'external_applied') then
      raise exception 'external_operation_requires_reconciliation';
    end if;

    if v_run.status = 'running' then
      raise exception 'operation_already_running';
    end if;

    if v_run.status = 'interrupted'
       and p_fencing_token is not null
       and v_run.fencing_token is not null
       and p_fencing_token <> v_run.fencing_token then
      raise exception 'stale_fencing_token';
    end if;

    update public.code_labs_action_runs
    set status = 'running',
        completed_state_version = null,
        stored_result = null,
        error_code = null,
        error_message = null,
        updated_at = now(),
        completed_at = null
    where owner_id = p_owner_id and operation_id = p_operation_id;
  else
    insert into public.code_labs_action_runs (
      owner_id,
      operation_id,
      action,
      request_hash,
      expected_state_version,
      status
    ) values (
      p_owner_id,
      p_operation_id,
      p_action,
      p_request_hash,
      p_expected_state_version,
      'running'
    );
  end if;

  begin
    select * into v_state
    from public.code_labs_workspace_state
    where owner_id = p_owner_id
    for update;

    if not found then raise exception 'workspace_not_found'; end if;
    if v_state.state_version <> p_expected_state_version then
      raise exception 'workspace_state_changed';
    end if;

    v_effects := coalesce(p_payload->'effects', '[]'::jsonb);
    if jsonb_typeof(v_effects) <> 'array'
       or jsonb_array_length(v_effects) < 1
       or jsonb_array_length(v_effects) > 12 then
      raise exception 'effects_invalid';
    end if;

    if p_action = 'undo.execute' then
      if nullif(p_payload->>'undo_receipt_id','') is null then
        raise exception 'undo_receipt_required';
      end if;
      select * into v_undo_receipt
      from public.code_labs_action_receipts
      where owner_id = p_owner_id
        and id = (p_payload->>'undo_receipt_id')::uuid
        and undo_available = true
        and undone_at is null
      for update;
      if not found then raise exception 'undo_receipt_unavailable'; end if;
    end if;

    v_fencing_token := v_state.workspace_fencing_token + 1;
    if p_fencing_token is not null and p_fencing_token <> v_fencing_token then
      raise exception 'stale_fencing_token';
    end if;

    update public.code_labs_action_runs
    set fencing_token = v_fencing_token,
        updated_at = now()
    where owner_id = p_owner_id
      and operation_id = p_operation_id
      and status = 'running';

    perform set_config('code_labs.operation_id', p_operation_id::text, true);
    perform set_config('code_labs.fencing_token', v_fencing_token::text, true);

    for v_effect in
      select value from jsonb_array_elements(v_effects)
    loop
      if jsonb_typeof(v_effect) <> 'object' then raise exception 'effect_must_be_object'; end if;
      v_effect_kind := nullif(btrim(v_effect->>'kind'), '');
      v_effect_key := nullif(btrim(v_effect->>'key'), '');
      if v_effect_kind is null or v_effect_key is null then raise exception 'effect_identity_required'; end if;
      if v_outputs ? v_effect_key then raise exception 'duplicate_effect_key'; end if;
      if not public.code_labs_effect_allowed(p_action, v_effect_kind) then
        raise exception 'effect_not_allowed_for_action';
      end if;

      if v_effect_kind = 'record_update' then
        v_record_type := nullif(btrim(v_effect->>'record_type'), '');
        v_record_id := nullif(v_effect->>'record_id','')::uuid;
        v_expected_updated_at := nullif(v_effect->>'expected_updated_at','')::timestamptz;
        v_patch := coalesce(v_effect->'patch', '{}'::jsonb);

        if p_action = 'undo.execute' and (
          v_record_type is distinct from v_undo_receipt.record_type
          or v_record_id is distinct from v_undo_receipt.record_id
        ) then raise exception 'undo_record_mismatch'; end if;

        v_record_result := public.code_labs_apply_record_patch(
          p_owner_id,
          p_action,
          v_record_type,
          v_record_id,
          v_expected_updated_at,
          v_patch
        );
        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_record_result);
        v_record_update_count := v_record_update_count + 1;

      elsif v_effect_kind = 'workspace_select' then
        v_record_id := nullif(v_effect->>'record_id','')::uuid;
        if v_record_id is null then raise exception 'selection_record_required'; end if;

        if p_action = 'project.select' then
          select to_jsonb(p) into v_selected
          from public.code_labs_projects p
          where p.owner_id = p_owner_id and p.id = v_record_id;
          if v_selected is null then raise exception 'project_not_found'; end if;
          v_workspace_patch := jsonb_build_object(
            'current_project_id', v_record_id,
            'current_file_id', null,
            'current_job_id', null,
            'current_packet_id', null,
            'current_test_run_id', null
          );

        elsif p_action = 'file.select' then
          select to_jsonb(f) into v_selected
          from public.code_labs_files f
          where f.owner_id = p_owner_id and f.id = v_record_id
            and f.project_id = v_state.current_project_id;
          if v_selected is null then raise exception 'file_not_found'; end if;
          v_workspace_patch := jsonb_build_object(
            'current_file_id', v_record_id,
            'current_job_id', null,
            'current_packet_id', null,
            'current_test_run_id', null
          );

        elsif p_action = 'job.select' then
          select to_jsonb(j) into v_selected
          from public.code_labs_jobs j
          where j.owner_id = p_owner_id and j.id = v_record_id
            and j.project_id = v_state.current_project_id;
          if v_selected is null then raise exception 'job_not_found'; end if;
          select to_jsonb(f) into v_linked
          from public.code_labs_files f
          where f.owner_id = p_owner_id
            and f.id = (v_selected->>'file_id')::uuid
            and f.project_id = v_state.current_project_id;
          if v_linked is null then raise exception 'job_file_not_found'; end if;
          v_workspace_patch := jsonb_build_object(
            'current_file_id', (v_linked->>'id')::uuid,
            'current_job_id', v_record_id,
            'current_packet_id', null,
            'current_test_run_id', null
          );

        elsif p_action = 'packet.select' then
          select to_jsonb(p) into v_selected
          from public.code_labs_packets p
          where p.owner_id = p_owner_id and p.id = v_record_id
            and p.project_id = v_state.current_project_id;
          if v_selected is null then raise exception 'packet_not_found'; end if;
          select to_jsonb(j) into v_linked
          from public.code_labs_jobs j
          where j.owner_id = p_owner_id
            and j.id = (v_selected->>'job_id')::uuid
            and j.project_id = v_state.current_project_id;
          if v_linked is null then raise exception 'packet_job_not_found'; end if;
          select to_jsonb(f) into v_file
          from public.code_labs_files f
          where f.owner_id = p_owner_id
            and f.id = (v_linked->>'file_id')::uuid
            and f.project_id = v_state.current_project_id;
          if v_file is null then raise exception 'packet_file_not_found'; end if;
          v_workspace_patch := jsonb_build_object(
            'current_file_id', (v_file->>'id')::uuid,
            'current_job_id', (v_linked->>'id')::uuid,
            'current_packet_id', v_record_id,
            'current_test_run_id', null
          );

        elsif p_action = 'test.select' then
          select to_jsonb(t) into v_selected
          from public.code_labs_test_runs t
          where t.owner_id = p_owner_id and t.id = v_record_id
            and t.project_id = v_state.current_project_id;
          if v_selected is null then raise exception 'test_not_found'; end if;
          select to_jsonb(j) into v_linked
          from public.code_labs_jobs j
          where j.owner_id = p_owner_id
            and j.id = (v_selected->>'job_id')::uuid
            and j.project_id = v_state.current_project_id;
          if v_linked is null then raise exception 'test_job_not_found'; end if;
          select to_jsonb(f) into v_file
          from public.code_labs_files f
          where f.owner_id = p_owner_id
            and f.id = (v_linked->>'file_id')::uuid
            and f.project_id = v_state.current_project_id;
          if v_file is null then raise exception 'test_file_not_found'; end if;
          v_workspace_patch := jsonb_build_object(
            'current_file_id', (v_file->>'id')::uuid,
            'current_job_id', (v_linked->>'id')::uuid,
            'current_packet_id', case
              when v_state.current_packet_id is not null
               and exists (
                 select 1 from public.code_labs_packets p
                 where p.owner_id = p_owner_id
                   and p.id = v_state.current_packet_id
                   and p.project_id = v_state.current_project_id
                   and p.job_id = (v_linked->>'id')::uuid
               ) then v_state.current_packet_id
              else null
            end,
            'current_test_run_id', v_record_id
          );
        else
          raise exception 'selection_action_invalid';
        end if;

        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_selected);
        v_workspace_effect_count := v_workspace_effect_count + 1;

      elsif v_effect_kind = 'workflow_move' then
        if p_action = 'workflow.reset' then
          v_workspace_patch := jsonb_build_object('workflow_step', 'setup');
        elsif p_action = 'workflow.advance' then
          v_workspace_patch := jsonb_build_object(
            'workflow_step', case v_state.workflow_step
              when 'setup' then 'project'
              when 'project' then 'file'
              when 'file' then 'repair'
              when 'repair' then 'packet'
              when 'packet' then 'candidate'
              when 'candidate' then 'test'
              when 'test' then 'checkpoint'
              when 'checkpoint' then 'repo'
              when 'repo' then 'cg_repair_lab'
              when 'cg_repair_lab' then 'code_god'
              when 'code_god' then 'github_writer'
              when 'github_writer' then 'github_tracker'
              else v_state.workflow_step
            end
          );
        else
          raise exception 'workflow_action_invalid';
        end if;
        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_workspace_patch);
        v_workspace_effect_count := v_workspace_effect_count + 1;

      elsif v_effect_kind = 'file_intake_upsert' then
        v_project_id := nullif(v_effect->>'project_id','')::uuid;
        v_file_id := nullif(v_effect->>'file_id','')::uuid;
        v_path := btrim(coalesce(v_effect->>'filename',''));
        v_file_type := left(coalesce(v_effect->>'file_type','text'), 20);
        v_code := coalesce(v_effect->>'current_code','');
        v_current_hash := lower(coalesce(v_effect->>'current_hash',''));
        v_metadata := coalesce(v_effect->'metadata','{}'::jsonb);
        v_source_commit_sha := lower(coalesce(v_metadata->>'source_commit_sha',''));

        if v_project_id is null or v_file_id is null
           or v_project_id is distinct from v_state.current_project_id then
          raise exception 'intake_project_mismatch';
        end if;
        if not exists (
          select 1 from public.code_labs_projects p
          where p.owner_id = p_owner_id and p.id = v_project_id
        ) then raise exception 'intake_project_not_found'; end if;
        if v_path = '' or left(v_path,1) in ('.','/')
           or position('..' in v_path) > 0
           or position(E'\\' in v_path) > 0
           or v_path ~* '(^|/)(secrets?|\.env[^/]*)$'
           or v_path ~* '\.(pem|key|p12|pfx)$'
           or v_path like '.github/%' then
          raise exception 'intake_path_unsafe';
        end if;
        if v_code = '' or octet_length(v_code) > 750000 then
          raise exception 'intake_content_invalid';
        end if;
        if v_current_hash !~ '^[a-f0-9]{64}$'
           or v_current_hash <> public.code_labs_sha256_text(v_code) then
          raise exception 'intake_hash_mismatch';
        end if;
        if jsonb_typeof(v_metadata) <> 'object'
           or v_source_commit_sha !~ '^[a-f0-9]{40}$'
           or coalesce(v_metadata->>'verified_owner_repository','false') <> 'true' then
          raise exception 'intake_provenance_invalid';
        end if;

        select count(*) into v_matches
        from public.code_labs_files f
        where f.owner_id = p_owner_id
          and f.project_id = v_project_id
          and f.filename = v_path;
        if v_matches > 1 then raise exception 'intake_duplicate_rows'; end if;

        select to_jsonb(f) into v_file
        from public.code_labs_files f
        where f.owner_id = p_owner_id
          and f.project_id = v_project_id
          and f.filename = v_path
        for update;

        if v_file is null then
          insert into public.code_labs_files as inserted_file (
            id, owner_id, project_id, filename, file_type,
            current_code, current_hash, metadata
          ) values (
            v_file_id, p_owner_id, v_project_id, v_path, v_file_type,
            v_code, v_current_hash, v_metadata
          )
          returning to_jsonb(inserted_file) into v_file;
          v_created := true;
        else
          if (v_file->>'id')::uuid is distinct from v_file_id then
            raise exception 'intake_identity_mismatch';
          end if;
          update public.code_labs_files f
          set filename = v_path,
              file_type = v_file_type,
              current_code = v_code,
              current_hash = v_current_hash,
              metadata = v_metadata,
              updated_at = now()
          where f.owner_id = p_owner_id and f.id = v_file_id
          returning to_jsonb(f) into v_file;
          v_created := false;
        end if;

        v_intake_marker := jsonb_build_object(
          'id', v_file_id,
          'path', v_path,
          'file_type', v_file_type,
          'current_hash', v_current_hash,
          'created', v_created,
          'source_commit_sha', v_source_commit_sha
        );
        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_intake_marker);
        v_intake_count := v_intake_count + 1;

      elsif v_effect_kind = 'workspace_patch' then
        v_file_id := nullif(v_effect->>'current_file_id','')::uuid;
        if v_file_id is null or not exists (
          select 1 from public.code_labs_files f
          where f.owner_id = p_owner_id
            and f.id = v_file_id
            and f.project_id = v_state.current_project_id
        ) then raise exception 'workspace_file_patch_invalid'; end if;
        v_workspace_patch := jsonb_build_object(
          'current_file_id', v_file_id,
          'current_job_id', null,
          'current_packet_id', null,
          'current_test_run_id', null,
          'workflow_step', 'file'
        );
        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_workspace_patch);
        v_workspace_effect_count := v_workspace_effect_count + 1;

      elsif v_effect_kind = 'checkpoint_insert' then
        if v_state.current_project_id is null or v_state.current_file_id is null then
          raise exception 'checkpoint_selection_required';
        end if;
        select to_jsonb(f) into v_file
        from public.code_labs_files f
        where f.owner_id = p_owner_id
          and f.id = v_state.current_file_id
          and f.project_id = v_state.current_project_id
        for update;
        if v_file is null then raise exception 'checkpoint_file_not_found'; end if;

        insert into public.code_labs_versions (
          owner_id,
          project_id,
          job_id,
          file_id,
          version_kind,
          label,
          filename,
          code,
          note,
          metadata,
          operation_id,
          fencing_token
        ) values (
          p_owner_id,
          v_state.current_project_id,
          v_state.current_job_id,
          v_state.current_file_id,
          'checkpoint',
          left(coalesce(v_effect->>'label','Checkpoint'), 200),
          v_file->>'filename',
          coalesce(v_file->>'current_code',''),
          left(coalesce(v_effect->>'note',''), 4000),
          jsonb_build_object(
            'source', 'code-labs-atomic-workspace-engine',
            'expected_state_version', p_expected_state_version,
            'operation_id', p_operation_id,
            'fencing_token', v_fencing_token
          ),
          p_operation_id,
          v_fencing_token
        ) returning * into v_inserted_version;

        v_checkpoint_marker := jsonb_build_object(
          'id', v_inserted_version.id,
          'version_kind', v_inserted_version.version_kind,
          'label', v_inserted_version.label,
          'filename', v_inserted_version.filename,
          'created_at', v_inserted_version.created_at
        );
        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_checkpoint_marker);
        v_checkpoint_count := v_checkpoint_count + 1;

      elsif v_effect_kind = 'write_request_insert' then
        if v_state.current_file_id is null then raise exception 'writer_file_selection_required'; end if;
        select to_jsonb(f) into v_file
        from public.code_labs_files f
        where f.owner_id = p_owner_id and f.id = v_state.current_file_id
        for update;
        if v_file is null then raise exception 'writer_file_not_found'; end if;

        v_file_before := v_file;
        v_metadata := coalesce(v_file->'metadata','{}'::jsonb);
        v_writer_before_marker := coalesce(v_metadata->'github_writer_request','{}'::jsonb);
        v_handoff := coalesce(v_metadata->'repo_handoff','{}'::jsonb);
        v_review := coalesce(v_metadata->'code_god_review','{}'::jsonb);
        v_request := coalesce(v_effect->'request','{}'::jsonb);
        v_content := coalesce(v_request->>'content','');
        v_expected_content_sha256 := lower(coalesce(v_request->>'expected_content_sha256',''));
        v_expected_blob_sha := nullif(lower(coalesce(v_request->>'expected_github_blob_sha','')), '');
        v_expected_blob_absent := coalesce((v_request->>'expected_github_blob_absent')::boolean, false);

        if jsonb_typeof(v_request) <> 'object' then raise exception 'writer_request_invalid'; end if;
        if lower(coalesce(v_request->>'independent_evidence_checkpoint_id','')) !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
           or lower(coalesce(v_request->>'independent_evidence_receipt_id','')) !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' then
          raise exception 'independent_evidence_ids_invalid';
        end if;
        if coalesce(v_review->>'outcome','') <> 'PASS'
           or coalesce(v_review->>'scope_outcome','') <> 'BOUNDED_CHECKS_CLEAR'
           or coalesce(v_review->>'authoritative','') <> 'false'
           or coalesce(v_review->>'trust_state','') <> 'HOLD_UNTRUSTED_ADVISORY'
           or coalesce(v_review->>'requires_independent_evidence_receipt','') <> 'true'
           or coalesce(v_request->>'code_god_scope_outcome','') <> 'BOUNDED_CHECKS_CLEAR' then
          raise exception 'bounded_code_god_advisory_required';
        end if;
        if coalesce(v_review->>'proposed_hash','') <> coalesce(v_handoff->>'proposed_hash','')
           or coalesce(v_request->>'code_god_proposed_hash','') <> coalesce(v_review->>'proposed_hash','')
           or coalesce(v_request->>'code_god_handoff_hash','') <> coalesce(v_review->>'handoff_hash','')
           or coalesce(v_request->>'code_god_review_version','') <> coalesce(v_review->>'version','')
           or coalesce(v_request->>'code_god_source_file_id','') <> coalesce(v_file->>'id','') then
          raise exception 'writer_review_binding_invalid';
        end if;
        if coalesce(v_request->>'repo','') <> coalesce(v_handoff->>'repo','')
           or coalesce(v_request->>'path','') <> coalesce(v_handoff->>'path','')
           or coalesce(v_request->>'branch','') <> coalesce(v_handoff->>'request_branch','')
           or v_content <> coalesce(v_handoff->>'proposed','') then
          raise exception 'writer_handoff_binding_invalid';
        end if;
        if v_expected_content_sha256 !~ '^[a-f0-9]{64}$'
           or v_expected_content_sha256 <> public.code_labs_sha256_text(v_content) then
          raise exception 'writer_content_hash_invalid';
        end if;
        if (v_expected_blob_absent and v_expected_blob_sha is not null)
           or (not v_expected_blob_absent and v_expected_blob_sha !~ '^[a-f0-9]{40}$') then
          raise exception 'writer_expected_blob_invalid';
        end if;
        if coalesce(v_request->>'github_head_branch','') <> coalesce(v_request->>'branch','')
           or coalesce(v_request->>'github_base_branch','') = '' then
          raise exception 'writer_pr_binding_invalid';
        end if;

        insert into public.code_labs_write_requests (
          requested_by,
          requested_source,
          repo,
          path,
          branch,
          action,
          content,
          commit_message,
          pr_title,
          pr_body,
          status,
          direct_main_write,
          branch_pr_only,
          deletes_anything,
          safety_note,
          code_god_review_version,
          code_god_outcome,
          code_god_handoff_hash,
          code_god_proposed_hash,
          code_god_reviewed_at,
          code_god_source_file_id,
          operation_id,
          writer_fencing_token,
          writer_phase,
          expected_github_blob_sha,
          expected_github_blob_absent,
          expected_content_sha256,
          github_base_branch,
          github_head_branch
        ) values (
          p_owner_id,
          'code_labs_atomic_workspace_engine',
          v_request->>'repo',
          v_request->>'path',
          v_request->>'branch',
          v_request->>'action',
          v_content,
          left(coalesce(v_request->>'commit_message','Code Labs complete-file update'), 240),
          left(coalesce(v_request->>'pr_title','Code Labs update'), 240),
          left(coalesce(v_request->>'pr_body','Prepared by Code Labs after Code God PASS.'), 20000),
          'queued',
          false,
          true,
          false,
          jsonb_build_object(
            'kind', 'code-labs-writer-evidence-request-v1',
            'checkpoint_id', v_request->>'independent_evidence_checkpoint_id',
            'receipt_id', v_request->>'independent_evidence_receipt_id'
          )::text,
          v_request->>'code_god_review_version',
          'PASS',
          v_request->>'code_god_handoff_hash',
          v_request->>'code_god_proposed_hash',
          (v_request->>'code_god_reviewed_at')::timestamptz,
          (v_request->>'code_god_source_file_id')::uuid,
          p_operation_id,
          v_fencing_token,
          'queued',
          v_expected_blob_sha,
          v_expected_blob_absent,
          v_expected_content_sha256,
          v_request->>'github_base_branch',
          v_request->>'github_head_branch'
        ) returning * into v_inserted_request;

        v_writer_marker := jsonb_build_object(
          'request_id', v_inserted_request.id,
          'status', v_inserted_request.status,
          'writer_phase', v_inserted_request.writer_phase,
          'repo', v_inserted_request.repo,
          'path', v_inserted_request.path,
          'branch', v_inserted_request.branch,
          'github_base_branch', v_inserted_request.github_base_branch,
          'github_head_branch', v_inserted_request.github_head_branch,
          'expected_content_sha256', v_inserted_request.expected_content_sha256,
          'independent_evidence_checkpoint_id', v_request->>'independent_evidence_checkpoint_id',
          'independent_evidence_receipt_id', v_request->>'independent_evidence_receipt_id',
          'independent_evidence_state', 'validated_by_final_hardening_trigger',
          'prepared_at', v_inserted_request.created_at
        );
        update public.code_labs_files f
        set metadata = v_metadata || jsonb_build_object('github_writer_request', v_writer_marker),
            updated_at = now()
        where f.owner_id = p_owner_id
          and f.id = v_state.current_file_id
        returning to_jsonb(f) into v_file;
        if v_file is null then raise exception 'writer_file_marker_update_failed'; end if;

        v_record_result := jsonb_build_object('before', v_file_before, 'after', v_file);
        v_outputs := v_outputs || jsonb_build_object(v_effect_key, v_writer_marker);
        v_record_update_count := v_record_update_count + 1;
        v_write_request_count := v_write_request_count + 1;

      elsif v_effect_kind = 'receipt_update' then
        if v_undo_receipt.id is null
           or (v_effect->>'receipt_id')::uuid is distinct from v_undo_receipt.id then
          raise exception 'undo_receipt_update_mismatch';
        end if;
        update public.code_labs_action_receipts r
        set undone_at = now(),
            undo_available = false
        where r.owner_id = p_owner_id
          and r.id = v_undo_receipt.id
          and r.undo_available = true
          and r.undone_at is null;
        if not found then raise exception 'undo_receipt_update_failed'; end if;
        v_outputs := v_outputs || jsonb_build_object(
          v_effect_key,
          jsonb_build_object('receipt_id', v_undo_receipt.id, 'undone', true)
        );
        v_receipt_update_count := v_receipt_update_count + 1;

      elsif v_effect_kind = 'receipt_insert' then
        if v_receipt_spec is not null then raise exception 'duplicate_receipt_effect'; end if;
        if v_effect->'changed_fields' is not null
           and jsonb_typeof(v_effect->'changed_fields') <> 'array' then
          raise exception 'receipt_changed_fields_invalid';
        end if;
        v_receipt_spec := v_effect;
        v_receipt_count := v_receipt_count + 1;

      else
        raise exception 'effect_kind_not_implemented';
      end if;
    end loop;

    if v_receipt_count <> 1 then raise exception 'exactly_one_receipt_required'; end if;

    if p_action in (
      'setup.save', 'file.replace_current', 'repair.save', 'packet.build',
      'canvas.save_candidate', 'candidate.save', 'candidate.accept',
      'test.record', 'repo.prepare_handoff', 'code_god.review'
    ) and v_record_update_count <> 1 then
      raise exception 'record_update_effect_required';
    end if;

    if p_action = 'github.writer_prepare'
       and (v_record_update_count <> 1 or v_write_request_count <> 1) then
      raise exception 'writer_prepare_effects_required';
    end if;

    if p_action = 'checkpoint.create' and v_checkpoint_count <> 1 then
      raise exception 'checkpoint_effect_required';
    end if;

    if p_action = 'file.intake'
       and (v_intake_count <> 1 or v_workspace_effect_count <> 1) then
      raise exception 'intake_effects_required';
    end if;

    if p_action in (
      'project.select', 'file.select', 'job.select', 'packet.select', 'test.select',
      'workflow.advance', 'workflow.reset'
    ) and v_workspace_effect_count <> 1 then
      raise exception 'workspace_effect_required';
    end if;

    if p_action = 'undo.execute'
       and (v_record_update_count <> 1 or v_receipt_update_count <> 1) then
      raise exception 'undo_effects_required';
    end if;

    update public.code_labs_workspace_state s
    set current_project_id = case
          when v_workspace_patch ? 'current_project_id'
            then nullif(v_workspace_patch->>'current_project_id','')::uuid
          else s.current_project_id
        end,
        current_file_id = case
          when v_workspace_patch ? 'current_file_id'
            then nullif(v_workspace_patch->>'current_file_id','')::uuid
          else s.current_file_id
        end,
        current_job_id = case
          when v_workspace_patch ? 'current_job_id'
            then nullif(v_workspace_patch->>'current_job_id','')::uuid
          else s.current_job_id
        end,
        current_packet_id = case
          when v_workspace_patch ? 'current_packet_id'
            then nullif(v_workspace_patch->>'current_packet_id','')::uuid
          else s.current_packet_id
        end,
        current_test_run_id = case
          when v_workspace_patch ? 'current_test_run_id'
            then nullif(v_workspace_patch->>'current_test_run_id','')::uuid
          else s.current_test_run_id
        end,
        workflow_step = case
          when v_workspace_patch ? 'workflow_step'
            then coalesce(nullif(v_workspace_patch->>'workflow_step',''), s.workflow_step)
          else s.workflow_step
        end,
        workspace_fencing_token = v_fencing_token,
        state_version = s.state_version + 1,
        updated_at = now()
    where s.owner_id = p_owner_id
      and s.state_version = p_expected_state_version
    returning * into v_state_after;

    if not found then raise exception 'workspace_completion_conflict'; end if;

    select coalesce(array_agg(value), '{}'::text[])
    into v_changed_fields
    from jsonb_array_elements_text(coalesce(v_receipt_spec->'changed_fields','[]'::jsonb));

    v_receipt_record_type := nullif(v_receipt_spec->>'record_type','');
    v_receipt_record_id := nullif(v_receipt_spec->>'record_id','')::uuid;
    v_receipt_before := coalesce(v_receipt_spec->'before_data','{}'::jsonb);
    v_receipt_after := coalesce(v_receipt_spec->'after_data','{}'::jsonb);

    if p_action in (
      'project.select', 'file.select', 'job.select', 'packet.select', 'test.select',
      'workflow.advance', 'workflow.reset'
    ) then
      v_receipt_record_type := 'workspace';
      v_receipt_record_id := p_owner_id;
      v_receipt_before := to_jsonb(v_state);
      v_receipt_after := to_jsonb(v_state_after);
      select coalesce(array_agg(k), '{}'::text[]) || array['state_version']
      into v_changed_fields
      from jsonb_object_keys(v_workspace_patch) as k;
    elsif p_action = 'file.intake' then
      v_receipt_record_type := 'file';
      v_receipt_record_id := v_file_id;
      v_receipt_before := '{}'::jsonb;
      v_receipt_after := coalesce(v_intake_marker,'{}'::jsonb) || jsonb_build_object(
        'workspace_state_version', v_state_after.state_version,
        'workflow_step', v_state_after.workflow_step,
        'downstream_cleared', true
      );
      v_changed_fields := array['file','workspace','state_version'];
    elsif p_action = 'checkpoint.create' then
      v_receipt_record_type := 'version';
      v_receipt_record_id := v_inserted_version.id;
      v_receipt_before := '{}'::jsonb;
      v_receipt_after := coalesce(v_checkpoint_marker,'{}'::jsonb);
      v_changed_fields := array['checkpoint'];
    elsif p_action = 'github.writer_prepare' then
      v_receipt_record_type := 'file';
      v_receipt_record_id := v_state.current_file_id;
      v_receipt_before := coalesce(v_writer_before_marker,'{}'::jsonb);
      v_receipt_after := coalesce(v_writer_marker,'{}'::jsonb);
      v_changed_fields := array['metadata','write_request'];
    elsif v_record_result is not null then
      v_receipt_record_type := v_record_type;
      v_receipt_record_id := v_record_id;
      v_receipt_before := coalesce(v_record_result->'before','{}'::jsonb);
      v_receipt_after := coalesce(v_record_result->'after','{}'::jsonb);
      if coalesce(array_length(v_changed_fields, 1), 0) = 0 and v_patch is not null then
        select coalesce(array_agg(k), '{}'::text[])
        into v_changed_fields
        from jsonb_object_keys(v_patch) as k;
      end if;
    end if;

    insert into public.code_labs_action_receipts (
      owner_id,
      action,
      record_type,
      record_id,
      before_data,
      after_data,
      changed_fields,
      created_new_row,
      undo_available,
      operation_id,
      fencing_token
    ) values (
      p_owner_id,
      p_action,
      v_receipt_record_type,
      v_receipt_record_id,
      v_receipt_before,
      v_receipt_after,
      coalesce(v_changed_fields, '{}'::text[]),
      case when p_action = 'file.intake' then v_created
           when p_action = 'checkpoint.create' then true
           else coalesce((v_receipt_spec->>'created_new_row')::boolean, false)
      end,
      case when p_action in (
        'project.select','file.select','job.select','packet.select','test.select',
        'workflow.advance','workflow.reset','file.intake','checkpoint.create',
        'repo.prepare_handoff','code_god.review','github.writer_prepare','undo.execute'
      ) then false
      else coalesce((v_receipt_spec->>'undo_available')::boolean, false)
      end,
      p_operation_id,
      v_fencing_token
    ) returning * into v_inserted_receipt;

    v_outputs := v_outputs || jsonb_build_object(
      coalesce(nullif(v_receipt_spec->>'key',''),'receipt'),
      jsonb_build_object(
        'receipt_id', v_inserted_receipt.id,
        'action', v_inserted_receipt.action,
        'record_type', v_inserted_receipt.record_type,
        'record_id', v_inserted_receipt.record_id,
        'changed_fields', v_inserted_receipt.changed_fields,
        'created_new_row', v_inserted_receipt.created_new_row,
        'undo_available', v_inserted_receipt.undo_available,
        'completed_at', v_inserted_receipt.created_at
      )
    );

    v_completed_state_version := v_state_after.state_version;
    v_result := coalesce(p_payload->'response','{}'::jsonb) || jsonb_build_object(
      'ok', true,
      'action', p_action,
      'operation_id', p_operation_id,
      'fencing_token', v_fencing_token,
      'replayed', false,
      'completed_state_version', v_completed_state_version,
      'workspace', to_jsonb(v_state_after),
      'outputs', v_outputs
    );

    update public.code_labs_action_runs
    set status = 'completed',
        completed_state_version = v_completed_state_version,
        stored_result = v_result,
        error_code = null,
        error_message = null,
        updated_at = now(),
        completed_at = now()
    where owner_id = p_owner_id
      and operation_id = p_operation_id
      and status = 'running'
      and fencing_token = v_fencing_token;

    if not found then raise exception 'operation_completion_fence_failed'; end if;

    return v_result;
  exception when others then
    v_error_code := sqlstate;
    v_error_message := left(sqlerrm, 2000);
    v_status := case
      when v_error_code = 'P0001' then 'failed_validation'
      else 'interrupted'
    end;
    v_failure := jsonb_build_object(
      'ok', false,
      'action', p_action,
      'operation_id', p_operation_id,
      'fencing_token', null,
      'replayed', false,
      'completed_state_version', null,
      'status', v_status,
      'error_code', v_error_code,
      'error', v_error_message
    );

    update public.code_labs_action_runs
    set status = v_status,
        completed_state_version = null,
        fencing_token = null,
        stored_result = v_failure,
        error_code = v_error_code,
        error_message = v_error_message,
        updated_at = now(),
        completed_at = now()
    where owner_id = p_owner_id
      and operation_id = p_operation_id;

    return v_failure;
  end;
end;
$$;

revoke all on function public.code_labs_sha256_text(text) from public, anon, authenticated;
revoke all on function public.code_labs_effect_allowed(text, text) from public, anon, authenticated;
revoke all on function public.code_labs_apply_record_patch(uuid, text, text, uuid, timestamptz, jsonb) from public, anon, authenticated;
revoke all on function public.code_labs_execute_workspace_action(uuid, uuid, text, bigint, text, jsonb, bigint) from public, anon, authenticated;

grant execute on function public.code_labs_execute_workspace_action(uuid, uuid, text, bigint, text, jsonb, bigint) to service_role;

commit;
