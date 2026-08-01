-- One-time OAuth authorization codes for the owner-approved V104 connector.
create table if not exists public.code_labs_oauth_grants (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  owner_id uuid not null,
  session_id uuid not null references public.code_labs_browser_sessions(id) on delete cascade,
  client_id text not null,
  redirect_uri text not null,
  code_challenge text not null,
  scope text not null default 'code_labs.read code_labs.write',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists code_labs_oauth_grants_expiry_idx
  on public.code_labs_oauth_grants (expires_at desc);
create index if not exists code_labs_oauth_grants_binding_idx
  on public.code_labs_oauth_grants (owner_id, session_id, created_at desc);

alter table public.code_labs_oauth_grants enable row level security;
revoke all on table public.code_labs_oauth_grants from public, anon, authenticated;
grant select, insert, update, delete on table public.code_labs_oauth_grants to service_role;
