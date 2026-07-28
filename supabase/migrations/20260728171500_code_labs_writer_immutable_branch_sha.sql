-- Code Labs Writer immutable branch SHA binding finaliser.
-- SOURCE CANDIDATE ONLY.
-- This migration must not be applied to production until it is folded into the
-- reviewed hardening bundle and passes isolated PostgreSQL and Writer tests.
--
-- Legacy requests remain readable because rows without operation_id are outside
-- the V50 atomic proof contract. New atomic requests derive exact branch proof
-- from the selected file's Repo Handoff and Code God metadata in the same owner
-- scope; untrusted request payload fields are not treated as authority.

begin;

alter table public.code_labs_write_requests
  add column if not exists github_base_sha text,
  add column if not exists github_head_sha text,
  add column if not exists github_branch_verified_at timestamptz;

alter table public.code_labs_write_requests
  drop constraint if exists code_labs_writer_branch_proof_check;

alter table public.code_labs_write_requests
  add constraint code_labs_writer_branch_proof_check
  check (
    operation_id is null
    or (
      github_base_sha ~ '^[a-f0-9]{40}$'
      and github_head_sha ~ '^[a-f0-9]{40}$'
      and github_branch_verified_at is not null
      and github_head_branch = branch
      and nullif(btrim(github_base_branch), '') is not null
      and github_head_branch is distinct from github_base_branch
      and lower(github_head_branch) not in ('main', 'master', 'production', 'live', 'gh-pages')
      and github_head_branch_sha = github_head_sha
    )
  );

create or replace function public.code_labs_validate_writer_request_proof()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_metadata jsonb := '{}'::jsonb;
  v_handoff jsonb := '{}'::jsonb;
  v_review jsonb := '{}'::jsonb;
  v_base_sha text;
  v_head_sha text;
  v_verified_at timestamptz;
begin
  -- Existing pre-atomic Writer rows retain their historical shape.
  if new.operation_id is null then
    return new;
  end if;

  if new.code_god_source_file_id is null then
    raise exception using errcode = 'P0001', message = 'writer_source_file_required';
  end if;

  select coalesce(f.metadata, '{}'::jsonb)
  into v_metadata
  from public.code_labs_files f
  where f.owner_id = new.requested_by
    and f.id = new.code_god_source_file_id;

  if not found then
    raise exception using errcode = 'P0001', message = 'writer_source_file_not_found';
  end if;

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
     or coalesce(v_review->>'source_file_id', '') <> new.code_god_source_file_id::text
     or coalesce(v_review->>'proposed_hash', '') <> coalesce(new.code_god_proposed_hash, '')
     or coalesce(v_review->>'handoff_hash', '') <> coalesce(new.code_god_handoff_hash, '') then
    raise exception using errcode = 'P0001', message = 'writer_review_binding_invalid';
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

  new.github_base_sha := v_base_sha;
  new.github_head_sha := v_head_sha;
  new.github_head_branch_sha := v_head_sha; -- retained compatibility alias
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
  github_base_sha,
  github_head_sha,
  github_head_branch_sha,
  github_branch_verified_at,
  expected_content_sha256,
  expected_github_blob_sha,
  expected_github_blob_absent,
  code_god_handoff_hash,
  code_god_proposed_hash,
  code_god_source_file_id
on public.code_labs_write_requests
for each row execute function public.code_labs_validate_writer_request_proof();

revoke all on function public.code_labs_validate_writer_request_proof()
  from public, anon, authenticated;

commit;
