create extension if not exists pgcrypto;

create table if not exists public.code_labs_browser_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  pairing_code_hash text not null unique,
  browser_secret_hash text not null,
  control_token_hash text unique,
  claimed_by text,
  paired_at timestamptz,
  status text not null default 'pairing' check (status in ('pairing','paired','closed','expired')),
  page_name text not null default '',
  page_url text not null default '',
  page_fingerprint text not null default '',
  page_snapshot jsonb not null default '{}'::jsonb,
  last_receipt jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  pairing_expires_at timestamptz not null default (now() + interval '10 minutes'),
  control_expires_at timestamptz
);

create table if not exists public.code_labs_browser_commands (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.code_labs_browser_sessions(id) on delete cascade,
  requested_by text not null default 'code-labs-live-v105',
  command jsonb not null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled','expired')),
  dangerous boolean not null default false,
  receipt jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '5 minutes')
);

create index if not exists code_labs_browser_sessions_owner_status_idx
  on public.code_labs_browser_sessions(owner_id, status, updated_at desc);
create index if not exists code_labs_browser_sessions_control_hash_idx
  on public.code_labs_browser_sessions(control_token_hash) where control_token_hash is not null;
create index if not exists code_labs_browser_commands_queue_idx
  on public.code_labs_browser_commands(session_id, status, created_at);

alter table public.code_labs_browser_sessions enable row level security;
alter table public.code_labs_browser_commands enable row level security;

revoke all on public.code_labs_browser_sessions from anon, authenticated;
revoke all on public.code_labs_browser_commands from anon, authenticated;

grant all on public.code_labs_browser_sessions to service_role;
grant all on public.code_labs_browser_commands to service_role;

comment on table public.code_labs_browser_sessions is
  'Short-lived owner browser pairing sessions for Code Labs V105. Secrets are stored only as SHA-256 hashes.';
comment on table public.code_labs_browser_commands is
  'Short-lived commands and receipts for paired Code Labs browser tabs. No GitHub or direct-main writes.';
