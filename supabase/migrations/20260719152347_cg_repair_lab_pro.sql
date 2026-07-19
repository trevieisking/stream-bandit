-- CG Repair Lab Pro authority model.
--
-- These tables contain product entitlement and GitHub installation metadata only.
-- They never contain GitHub App private keys, installation tokens, repository
-- credentials, or values read from repository secret references.

create table if not exists public.code_labs_entitlements (
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  product_key text not null default 'code_labs',
  plan_key text not null default 'free',
  status text not null default 'inactive',
  starts_at timestamptz,
  expires_at timestamptz,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, product_key),
  constraint code_labs_entitlements_product_key_check
    check (product_key = 'code_labs'),
  constraint code_labs_entitlements_plan_key_check
    check (plan_key in ('free', 'pro')),
  constraint code_labs_entitlements_status_check
    check (status in ('inactive', 'active', 'past_due', 'cancelled'))
);

create table if not exists public.code_labs_github_installations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  installation_id bigint not null,
  status text not null default 'active',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, installation_id),
  constraint code_labs_github_installations_status_check
    check (status in ('active', 'suspended', 'revoked')),
  constraint code_labs_github_installations_id_check
    check (installation_id > 0)
);

create table if not exists public.code_labs_github_repositories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  installation_id bigint not null,
  repo_full_name text not null,
  default_branch text,
  status text not null default 'active',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, repo_full_name),
  constraint code_labs_github_repositories_installation_fkey
    foreign key (owner_id, installation_id)
    references public.code_labs_github_installations(owner_id, installation_id)
    on delete cascade,
  constraint code_labs_github_repositories_name_check
    check (repo_full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  constraint code_labs_github_repositories_status_check
    check (status in ('active', 'disabled', 'revoked'))
);

create index if not exists code_labs_entitlements_active_idx
  on public.code_labs_entitlements (owner_id, product_key, plan_key, status);

create index if not exists code_labs_github_installations_owner_status_idx
  on public.code_labs_github_installations (owner_id, status);

create index if not exists code_labs_github_repositories_owner_status_idx
  on public.code_labs_github_repositories (owner_id, status, repo_full_name);

alter table public.code_labs_entitlements enable row level security;
alter table public.code_labs_github_installations enable row level security;
alter table public.code_labs_github_repositories enable row level security;

revoke all on table public.code_labs_entitlements from anon, authenticated;
revoke all on table public.code_labs_github_installations from anon, authenticated;
revoke all on table public.code_labs_github_repositories from anon, authenticated;

grant select on table public.code_labs_entitlements to authenticated;
grant select on table public.code_labs_github_installations to authenticated;
grant select on table public.code_labs_github_repositories to authenticated;

drop policy if exists code_labs_entitlements_owner_select
  on public.code_labs_entitlements;
create policy code_labs_entitlements_owner_select
  on public.code_labs_entitlements
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists code_labs_github_installations_owner_select
  on public.code_labs_github_installations;
create policy code_labs_github_installations_owner_select
  on public.code_labs_github_installations
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists code_labs_github_repositories_owner_select
  on public.code_labs_github_repositories;
create policy code_labs_github_repositories_owner_select
  on public.code_labs_github_repositories
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

comment on table public.code_labs_entitlements is
  'Owner-scoped Code Labs product entitlement. Server actions must re-check this row.';

comment on table public.code_labs_github_installations is
  'Owner-scoped GitHub App installation references. No credentials or tokens are stored.';

comment on table public.code_labs_github_repositories is
  'Repositories explicitly bound to an owner and verified GitHub App installation.';
