create table if not exists public.code_labs_workspace_state (
  owner_id uuid primary key references public.code_labs_owners(user_id) on delete cascade,
  current_project_id uuid references public.code_labs_projects(id) on delete set null,
  current_file_id uuid references public.code_labs_files(id) on delete set null,
  current_job_id uuid references public.code_labs_jobs(id) on delete set null,
  current_packet_id uuid references public.code_labs_packets(id) on delete set null,
  current_test_run_id uuid references public.code_labs_test_runs(id) on delete set null,
  workflow_step text not null default 'setup',
  state_version bigint not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.code_labs_action_receipts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  action text not null,
  record_type text,
  record_id uuid,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  changed_fields text[] not null default '{}'::text[],
  created_new_row boolean not null default false,
  undo_available boolean not null default false,
  undone_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.code_labs_workspace_state enable row level security;
alter table public.code_labs_action_receipts enable row level security;

revoke all on table public.code_labs_workspace_state from anon, authenticated;
revoke all on table public.code_labs_action_receipts from anon, authenticated;
grant select, insert, update, delete on table public.code_labs_workspace_state to service_role;
grant select, insert, update, delete on table public.code_labs_action_receipts to service_role;

create index if not exists code_labs_action_receipts_owner_created_idx
  on public.code_labs_action_receipts(owner_id, created_at desc);
