-- Code Labs V50 coherent post-cutover hardening.
-- SOURCE CANDIDATE ONLY.
--
-- This is the authoritative final owner for the strict boolean boundary,
-- immutable Writer branch proof, failure-transition fencing and proof trigger.
-- Apply only after the expansion, atomic engine and initial hardening migrations,
-- and only after isolated PostgreSQL plus exact-head runtime review.
-- Never apply while V49 or any legacy reservation-based runtime remains active.

begin;

do $$
begin
  if to_regprocedure('public.code_labs_require_jsonb_boolean(jsonb,boolean,text)') is null then
    raise exception using errcode = 'P0001', message = 'v50_strict_boolean_boundary_missing';
  end if;
  if to_regprocedure('public.code_labs_sha256_text(text)') is null then
    raise exception using errcode = 'P0001', message = 'v50_sha256_boundary_missing';
  end if;
end;
$$;

alter table public.code_labs_write_requests
  add column if not exists github_base_sha text,
  add column if not exists github_head_sha text,
  add column if not exists github_head_branch_sha text,
  add column if not exists github_branch_verified_at timestamptz;

-- The strict expansion helper is the sole boolean boundary. Remove the older
-- string-coercing helper so two boolean owners cannot survive cutover.
revoke all on function public.code_labs_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated, service_role;
drop function if exists public.code_labs_jsonb_boolean(jsonb, boolean, text);
revoke all on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  to service_role;

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_writer_branch_proof_check;
alter table public.code_labs_write_requests
  add constraint code_labs_writer_branch_proof_check
  check (
    operation_id is null
    or (
      github_base_sha ~ '^[a-f0-9]{40}$'
      and github_head_sha ~ '^[a-f0-9]{40}$'
      and github_head_branch_sha = github_head_sha
      and github_branch_verified_at is not null
      and github_head_branch = branch
      and nullif(btrim(github_base_branch), '') is not null
      and github_head_branch is distinct from github_base_branch
      and lower(github_head_branch) not in (
        'main', 'master', 'production', 'live', 'gh-pages'
      )
      and lower(branch) not in (
        'main', 'master', 'production', 'live', 'gh-pages'
      )
    )
  );

create or replace function public.code_labs_validate_writer_request_proof()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_metadata jsonb := '{}'::jsonb;
  v_handoff jsonb := '{}'::jsonb;
  v_review jsonb := '{}'::jsonb;
  v_base_sha text;
  v_head_sha text;
  v_verified_at timestamptz;
  v_source public.code_labs_files%rowtype;
  v_checkpoint public.code_labs_versions%rowtype;
  v_checkpoint_receipt public.code_labs_action_receipts%rowtype;
  v_master_plan public.code_labs_files%rowtype;
  v_evidence_input jsonb := '{}'::jsonb;
  v_evidence_packet jsonb := '{}'::jsonb;
  v_evidence_binding jsonb := '{}'::jsonb;
  v_checkpoint_id uuid;
  v_checkpoint_receipt_id uuid;
  v_master_plan_id uuid;
  v_checklist_version bigint;
  v_checked_at timestamptz;
  v_checkpoint_note_hash text;
  v_current_hash text;
  v_candidate_hash text;
begin
  -- Existing pre-atomic Writer rows retain their historical shape.
  if new.operation_id is null then
    return new;
  end if;

  if new.code_god_source_file_id is null then
    raise exception using errcode = 'P0001', message = 'writer_source_file_required';
  end if;

  select f.*
  into v_source
  from public.code_labs_files f
  where f.owner_id = new.requested_by
    and f.id = new.code_god_source_file_id;

  if not found then
    raise exception using errcode = 'P0001', message = 'writer_source_file_not_found';
  end if;

  v_metadata := coalesce(v_source.metadata, '{}'::jsonb);
  v_handoff := coalesce(v_metadata->'repo_handoff', '{}'::jsonb);
  v_review := coalesce(v_metadata->'code_god_review', '{}'::jsonb);
  v_base_sha := lower(coalesce(v_handoff->>'github_base_sha', ''));
  v_head_sha := lower(coalesce(v_handoff->>'github_head_sha', ''));

  begin
    v_verified_at := nullif(v_handoff->>'branch_verified_at', '')::timestamptz;
  exception when others then
    raise exception using errcode = 'P0001', message = 'writer_branch_verified_at_invalid';
  end;

  if coalesce(v_review->>'outcome', '') <> 'PASS'
     or coalesce(v_review->>'scope_outcome', '') <> 'BOUNDED_CHECKS_CLEAR'
     or coalesce(v_review->>'authoritative', '') <> 'false'
     or coalesce(v_review->>'trust_state', '') <> 'HOLD_UNTRUSTED_ADVISORY'
     or coalesce(v_review->>'requires_independent_evidence_receipt', '') <> 'true'
     or coalesce(v_review->>'version', '') <> 'V50-code-god-2-bounded-advisory'
     or coalesce(new.code_god_review_version, '') <> coalesce(v_review->>'version', '')
     or coalesce(new.code_god_outcome, '') <> 'PASS'
     or new.code_god_reviewed_at is distinct from nullif(v_review->>'created_at', '')::timestamptz
     or coalesce(v_review->>'source_file_id', '') <> new.code_god_source_file_id::text
     or coalesce(v_review->>'proposed_hash', '') <> coalesce(new.code_god_proposed_hash, '')
     or coalesce(v_review->>'handoff_hash', '') <> coalesce(new.code_god_handoff_hash, '') then
    raise exception using errcode = 'P0001', message = 'writer_bounded_review_binding_invalid';
  end if;

  if coalesce(v_handoff->>'repo', '') <> coalesce(new.repo, '')
     or coalesce(v_handoff->>'path', '') <> coalesce(new.path, '')
     or coalesce(v_handoff->>'request_branch', '') <> coalesce(new.branch, '')
     or coalesce(v_handoff->>'github_base_branch', '') <> coalesce(new.github_base_branch, '')
     or coalesce(v_handoff->>'github_head_branch', '') <> coalesce(new.github_head_branch, '') then
    raise exception using errcode = 'P0001', message = 'writer_handoff_branch_binding_invalid';
  end if;

  if v_base_sha !~ '^[a-f0-9]{40}$'
     or v_head_sha !~ '^[a-f0-9]{40}$'
     or coalesce(v_review->>'github_base_sha', '') <> v_base_sha
     or coalesce(v_review->>'github_head_sha', '') <> v_head_sha
     or v_verified_at is null then
    raise exception using errcode = 'P0001', message = 'writer_branch_sha_binding_invalid';
  end if;

  if new.github_base_sha is not null
     and lower(new.github_base_sha) is distinct from v_base_sha then
    raise exception using errcode = 'P0001', message = 'writer_base_sha_conflict';
  end if;
  if new.github_head_sha is not null
     and lower(new.github_head_sha) is distinct from v_head_sha then
    raise exception using errcode = 'P0001', message = 'writer_head_sha_conflict';
  end if;
  if new.github_head_branch_sha is not null
     and lower(new.github_head_branch_sha) is distinct from v_head_sha then
    raise exception using errcode = 'P0001', message = 'writer_head_sha_alias_conflict';
  end if;
  if new.github_branch_verified_at is not null
     and new.github_branch_verified_at is distinct from v_verified_at then
    raise exception using errcode = 'P0001', message = 'writer_branch_verified_at_conflict';
  end if;

  new.github_base_sha := v_base_sha;
  new.github_head_sha := v_head_sha;
  new.github_head_branch_sha := v_head_sha; -- temporary compatibility alias
  new.github_branch_verified_at := v_verified_at;

  if new.github_head_branch is distinct from new.branch
     or nullif(btrim(new.github_base_branch), '') is null
     or new.github_head_branch is not distinct from new.github_base_branch
     or lower(new.github_head_branch) in ('main', 'master', 'production', 'live', 'gh-pages')
     or lower(new.branch) in ('main', 'master', 'production', 'live', 'gh-pages') then
    raise exception using errcode = 'P0001', message = 'writer_protected_branch_invalid';
  end if;

  if new.expected_content_sha256 is null
     or new.expected_content_sha256 !~ '^[a-f0-9]{64}$'
     or new.expected_content_sha256 <> public.code_labs_sha256_text(coalesce(new.content, '')) then
    raise exception using errcode = 'P0001', message = 'writer_content_hash_invalid';
  end if;

  if (new.expected_github_blob_absent and new.expected_github_blob_sha is not null)
     or (not new.expected_github_blob_absent
       and coalesce(new.expected_github_blob_sha, '') !~ '^[a-f0-9]{40}$') then
    raise exception using errcode = 'P0001', message = 'writer_expected_blob_invalid';
  end if;


  begin
    v_evidence_input := coalesce(new.safety_note, '')::jsonb;
    v_checkpoint_id := nullif(v_evidence_input->>'checkpoint_id', '')::uuid;
    v_checkpoint_receipt_id := nullif(v_evidence_input->>'receipt_id', '')::uuid;
  exception when others then
    raise exception using errcode = 'P0001', message = 'writer_independent_evidence_request_invalid';
  end;

  if coalesce(v_evidence_input->>'kind', '') not in (
       'code-labs-writer-evidence-request-v1',
       'code-labs-writer-evidence-binding-v1'
     )
     or v_checkpoint_id is null
     or v_checkpoint_receipt_id is null then
    raise exception using errcode = 'P0001', message = 'writer_independent_evidence_request_invalid';
  end if;

  select v.* into v_checkpoint
  from public.code_labs_versions v
  where v.owner_id = new.requested_by
    and v.id = v_checkpoint_id;

  select r.* into v_checkpoint_receipt
  from public.code_labs_action_receipts r
  where r.owner_id = new.requested_by
    and r.id = v_checkpoint_receipt_id;

  if v_checkpoint.id is null
     or v_checkpoint.version_kind <> 'checkpoint'
     or v_checkpoint.file_id is distinct from new.code_god_source_file_id
     or v_checkpoint.filename is distinct from new.path
     or v_checkpoint.operation_id is null
     or v_checkpoint.fencing_token is null then
    raise exception using errcode = 'P0001', message = 'writer_independent_checkpoint_invalid';
  end if;

  if v_checkpoint_receipt.id is null
     or v_checkpoint_receipt.action <> 'checkpoint.create'
     or v_checkpoint_receipt.record_type <> 'version'
     or v_checkpoint_receipt.record_id is distinct from v_checkpoint.id
     or v_checkpoint_receipt.operation_id is distinct from v_checkpoint.operation_id
     or v_checkpoint_receipt.fencing_token is distinct from v_checkpoint.fencing_token
     or v_checkpoint_receipt.undone_at is not null then
    raise exception using errcode = 'P0001', message = 'writer_independent_checkpoint_receipt_invalid';
  end if;

  v_checkpoint_note_hash := public.code_labs_sha256_text(coalesce(v_checkpoint.note, ''));
  begin
    v_evidence_packet := coalesce(v_checkpoint.note, '')::jsonb;
    v_master_plan_id := nullif(v_evidence_packet->>'master_plan_record_id', '')::uuid;
    v_checklist_version := nullif(v_evidence_packet->>'checklist_version', '')::bigint;
    v_checked_at := nullif(v_evidence_packet->>'checked_at', '')::timestamptz;
  exception when others then
    raise exception using errcode = 'P0001', message = 'writer_independent_checkpoint_packet_invalid';
  end;

  select p.* into v_master_plan
  from public.code_labs_files p
  where p.owner_id = new.requested_by
    and p.id = v_master_plan_id;

  if v_master_plan.id is null
     or v_master_plan.filename <> 'code-labs/CODE-LABS-V1-PLAN.md'
     or coalesce(v_master_plan.current_hash, '') !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = 'P0001', message = 'writer_master_plan_binding_invalid';
  end if;

  v_current_hash := public.code_labs_sha256_text(coalesce(v_source.current_code, ''));
  v_candidate_hash := public.code_labs_sha256_text(coalesce(v_metadata->>'fixed_output', ''));

  if coalesce(v_evidence_packet->>'kind', '') <> 'master-checklist-independent-gate-v1'
     or coalesce(v_evidence_packet->>'decision', '') <> 'PASS'
     or coalesce(v_evidence_packet->>'review_scope', '') <> 'writer-preparation'
     or coalesce(v_evidence_packet->>'independent_of_code_god', '') <> 'true'
     or coalesce(v_evidence_packet->>'independent_of_repair_lab', '') <> 'true'
     or coalesce(v_evidence_packet->>'repo', '') <> coalesce(new.repo, '')
     or coalesce(v_evidence_packet->>'path', '') <> coalesce(new.path, '')
     or coalesce(v_evidence_packet->>'branch', '') <> coalesce(new.branch, '')
     or coalesce(v_evidence_packet->>'github_head_sha', '') <> v_head_sha
     or coalesce(v_evidence_packet->>'source_file_id', '') <> new.code_god_source_file_id::text
     or coalesce(v_evidence_packet->>'source_hash', '') <> v_current_hash
     or coalesce(v_source.current_hash, '') <> v_current_hash
     or coalesce(v_evidence_packet->>'candidate_hash', '') <> v_candidate_hash
     or coalesce(v_evidence_packet->>'candidate_hash', '') <> coalesce(new.expected_content_sha256, '')
     or v_candidate_hash <> public.code_labs_sha256_text(coalesce(new.content, ''))
     or coalesce(v_evidence_packet->>'handoff_hash', '') <> coalesce(new.code_god_handoff_hash, '')
     or coalesce(v_evidence_packet->>'handoff_hash', '') <> coalesce(v_review->>'handoff_hash', '')
     or coalesce(v_evidence_packet->>'code_god_review_version', '') <> coalesce(new.code_god_review_version, '')
     or coalesce(v_evidence_packet->>'code_god_scope_outcome', '') <> 'BOUNDED_CHECKS_CLEAR'
     or coalesce(v_evidence_packet->>'code_god_trust_state', '') <> 'HOLD_UNTRUSTED_ADVISORY'
     or coalesce(v_master_plan.current_hash, '') <> coalesce(v_evidence_packet->>'master_plan_source_hash', '')
     or coalesce(v_master_plan.metadata->'exact_checklist'->>'checklist_id', '') <> coalesce(v_evidence_packet->>'checklist_id', '')
     or coalesce((v_master_plan.metadata->'exact_checklist'->>'checklist_version')::bigint, 0) <> v_checklist_version
     or coalesce(v_evidence_packet->>'checklist_scope_state', '') <> 'PASS'
     or coalesce(v_master_plan.metadata->'review_system_trust_program'->>'status', '') <> 'HOLD_UNTRUSTED_ADVISORY'
     or v_checklist_version is null or v_checklist_version < 1
     or v_checked_at is null
     or v_checked_at < nullif(v_review->>'created_at', '')::timestamptz
     or v_checkpoint.created_at < v_checked_at
     or public.code_labs_sha256_text(coalesce(v_checkpoint.code, '')) <> v_current_hash
     or jsonb_typeof(v_evidence_packet->'checks_run') <> 'array'
     or jsonb_array_length(v_evidence_packet->'checks_run') < 1
     or jsonb_typeof(v_evidence_packet->'checks_not_run') <> 'array'
     or jsonb_typeof(v_evidence_packet->'limitations') <> 'array'
     or jsonb_array_length(v_evidence_packet->'limitations') < 1
     or jsonb_typeof(v_evidence_packet->'evidence_sources') <> 'array'
     or jsonb_array_length(v_evidence_packet->'evidence_sources') < 1 then
    raise exception using errcode = 'P0001', message = 'writer_independent_evidence_binding_invalid';
  end if;

  v_evidence_binding := jsonb_build_object(
    'kind', 'code-labs-writer-evidence-binding-v1',
    'checkpoint_id', v_checkpoint.id,
    'receipt_id', v_checkpoint_receipt.id,
    'checkpoint_note_hash', v_checkpoint_note_hash,
    'evidence_kind', v_evidence_packet->>'kind',
    'decision', v_evidence_packet->>'decision',
    'checked_at', v_evidence_packet->>'checked_at',
    'master_plan_record_id', v_master_plan.id,
    'master_plan_source_hash', v_master_plan.current_hash,
    'checklist_id', v_evidence_packet->>'checklist_id',
    'checklist_version', v_checklist_version,
    'checklist_scope_state', v_evidence_packet->>'checklist_scope_state',
    'code_god_scope_outcome', v_evidence_packet->>'code_god_scope_outcome',
    'code_god_trust_state', v_evidence_packet->>'code_god_trust_state'
  );

  if coalesce(v_evidence_input->>'kind', '') = 'code-labs-writer-evidence-binding-v1'
     and v_evidence_input is distinct from v_evidence_binding then
    raise exception using errcode = 'P0001', message = 'writer_independent_evidence_binding_changed';
  end if;

  if length(v_evidence_binding::text) > 4000 then
    raise exception using errcode = 'P0001', message = 'writer_independent_evidence_binding_too_large';
  end if;
  new.safety_note := v_evidence_binding::text;

  return new;
end;
$$;

drop trigger if exists code_labs_writer_request_proof_guard
on public.code_labs_write_requests;
create trigger code_labs_writer_request_proof_guard
before insert or update of
  requested_by,
  operation_id,
  repo,
  path,
  content,
  branch,
  github_base_branch,
  github_head_branch,
  github_base_sha,
  github_head_sha,
  github_head_branch_sha,
  github_branch_verified_at,
  expected_content_sha256,
  expected_github_blob_sha,
  expected_github_blob_absent,
  code_god_review_version,
  code_god_outcome,
  code_god_reviewed_at,
  code_god_handoff_hash,
  code_god_proposed_hash,
  code_god_source_file_id,
  safety_note
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
  if new.owner_id is distinct from old.owner_id
     or new.operation_id is distinct from old.operation_id
     or new.action is distinct from old.action
     or new.request_hash is distinct from old.request_hash
     or new.expected_state_version is distinct from old.expected_state_version then
    raise exception using errcode = 'P0001', message = 'operation_identity_mutation_forbidden';
  end if;

  if new.status in ('failed_validation', 'interrupted')
     and new.status is distinct from old.status then
    v_operation_text := nullif(current_setting('code_labs.operation_id', true), '');

    if old.status <> 'running' or v_operation_text is null then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end if;

    begin
      v_operation_id := v_operation_text::uuid;
    exception when others then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end;

    if v_operation_id is distinct from old.operation_id
       or new.completed_state_version is not null
       or new.stored_result is null
       or coalesce(new.stored_result->>'status', '') is distinct from new.status then
      raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
    end if;

    new.completed_state_version := null;

    if new.status = 'failed_validation' then
      new.fencing_token := null;
      new.stored_result := jsonb_set(
        new.stored_result,
        '{fencing_token}',
        'null'::jsonb,
        true
      );
    else
      v_fence_text := nullif(current_setting('code_labs.fencing_token', true), '');
      if v_fence_text is null then
        raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
      end if;

      begin
        v_fencing_token := v_fence_text::bigint;
      exception when others then
        raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
      end;

      if v_fencing_token < 1
         or (old.fencing_token is not null
           and old.fencing_token is distinct from v_fencing_token) then
        raise exception using errcode = 'P0001', message = 'operation_failure_fence_failed';
      end if;

      new.fencing_token := v_fencing_token;
      new.stored_result := jsonb_set(
        new.stored_result,
        '{fencing_token}',
        to_jsonb(v_fencing_token),
        true
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists code_labs_action_runs_transition_guard
on public.code_labs_action_runs;
create trigger code_labs_action_runs_transition_guard
before update on public.code_labs_action_runs
for each row execute function public.code_labs_guard_action_run_transition();

revoke all on function public.code_labs_validate_writer_request_proof()
  from public, anon, authenticated;
revoke all on function public.code_labs_guard_action_run_transition()
  from public, anon, authenticated;

comment on function public.code_labs_validate_writer_request_proof() is
  'V50 authoritative immutable Writer proof owner: derives exact repo, path, branches, base/head SHAs and review bindings from the selected owner-scoped file metadata.';
comment on function public.code_labs_guard_action_run_transition() is
  'V50 authoritative action failure-transition owner: preserves identity and enforces validation/interruption fencing semantics.';

commit;
