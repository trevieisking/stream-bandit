-- Stream Bandit replay foundation part.
-- SOURCE CANDIDATE ONLY.
-- Schema-only reconstruction of the pre-ledger foundation.
-- Test on a fresh database before any deployment or production decision.
-- Creates no rows and performs no destructive table or schema operation.

begin;

create table if not exists public.code_labs_owners (
  user_id uuid not null,
  email text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint code_labs_owners_email_key unique (email),
  constraint code_labs_owners_pkey primary key (user_id)
);

create table if not exists public.code_labs_projects (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  workspace text,
  site_name text not null,
  site_url text,
  repo text,
  mode text default 'manual'::text not null,
  notes text,
  status text default 'active'::text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint code_labs_projects_pkey primary key (id)
);

create table if not exists public.code_labs_files (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  project_id uuid not null,
  filename text not null,
  file_type text,
  current_code text,
  current_hash text,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint code_labs_files_pkey primary key (id)
);

create table if not exists public.code_labs_jobs (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  project_id uuid not null,
  file_id uuid,
  title text,
  problem text,
  dont_touch text,
  errors text,
  status text default 'draft'::text not null,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint code_labs_jobs_pkey primary key (id)
);

create table if not exists public.code_labs_packets (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  project_id uuid not null,
  job_id uuid,
  packet_type text default 'full-file-repair'::text not null,
  packet_text text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  constraint code_labs_packets_pkey primary key (id)
);

create table if not exists public.code_labs_test_runs (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  project_id uuid not null,
  job_id uuid,
  filename text,
  result text not null,
  checked_count integer default 0 not null,
  total_count integer default 0 not null,
  notes text,
  details jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  constraint code_labs_test_runs_pkey primary key (id)
);

create table if not exists public.code_labs_versions (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  project_id uuid not null,
  job_id uuid,
  file_id uuid,
  version_kind text default 'manual'::text not null,
  label text,
  filename text,
  code text,
  note text,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  constraint code_labs_versions_pkey primary key (id)
);

create table if not exists public.code_labs_audit_log (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  project_id uuid,
  job_id uuid,
  action text not null,
  details jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  constraint code_labs_audit_log_pkey primary key (id)
);

create table if not exists public.code_labs_write_requests (
  id uuid default gen_random_uuid() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  requested_by uuid default auth.uid(),
  requested_email text default auth.email(),
  requested_source text default 'code_labs_app'::text not null,
  repo text default 'trevieisking/stream-bandit'::text not null,
  path text not null,
  branch text not null,
  action text default 'create_or_update_file'::text not null,
  content text not null,
  commit_message text not null,
  pr_title text not null,
  pr_body text default ''::text not null,
  status text default 'queued'::text not null,
  preview_url text,
  pull_request_url text,
  pull_request_number integer,
  github_branch_created boolean default false not null,
  github_commit_sha text,
  github_content_sha text,
  error text,
  direct_main_write boolean default false not null,
  branch_pr_only boolean default true not null,
  deletes_anything boolean default false not null,
  safety_note text default 'Code Labs safe write bridge: branch + PR only; no direct-main write; no delete.'::text not null,
  writer_claim_id uuid,
  writer_claimed_at timestamptz,
  code_god_review_version text,
  code_god_outcome text,
  code_god_handoff_hash text,
  code_god_proposed_hash text,
  code_god_reviewed_at timestamptz,
  code_god_source_file_id uuid,
  constraint code_labs_active_request_review_proof_check check ((status <> all (array['queued','prepared','branch_created','processing']::text[])) or (code_god_outcome='PASS' and coalesce(code_god_review_version,'')<>'' and coalesce(code_god_handoff_hash,'') ~ '^[a-f0-9]{64}$' and coalesce(code_god_proposed_hash,'') ~ '^[a-f0-9]{64}$' and code_god_reviewed_at is not null and code_god_source_file_id is not null)),
  constraint code_labs_write_action_check check (action = any (array['create_file','update_file','create_or_update_file']::text[])),
  constraint code_labs_write_branch_check check (branch ~ '^[A-Za-z0-9._/-]{3,80}$' and branch !~* '^(main|master|gh-pages|production|live)$'),
  constraint code_labs_write_content_check check (char_length(content) between 1 and 180000),
  constraint code_labs_write_no_direct_main_or_delete_check check (not direct_main_write and branch_pr_only and not deletes_anything),
  constraint code_labs_write_repo_check check (repo='trevieisking/stream-bandit'),
  constraint code_labs_write_requests_pkey primary key (id),
  constraint code_labs_write_status_check check (status = any (array['queued','prepared','branch_created','processing','pr_opened','preview_passed','merged','closed','failed']::text[]))
);

commit;
