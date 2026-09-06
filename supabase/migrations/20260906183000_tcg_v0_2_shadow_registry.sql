-- Stream Bandit TCG v0.2 replay-safe shadow registry.
--
-- Purpose:
-- - give fresh databases and existing production databases the same server-only place
--   to stage deterministic structured card registries;
-- - do not depend on legacy public.tcg_card_definitions rows being present;
-- - do not change the current private-alpha runtime authority;
-- - keep activation impossible until a later explicit cutover migration removes the hold.

create table if not exists public.tcg_registry_versions (
  registry_id text primary key,
  set_code text not null,
  card_schema text not null,
  effect_schema text not null,
  card_count integer not null check (card_count > 0),
  registry_sha256 text not null check (registry_sha256 ~ '^[0-9a-f]{64}$'),
  is_runtime_authority boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tcg_registry_versions_runtime_authority_hold
    check (is_runtime_authority = false),
  constraint tcg_registry_versions_identity_unique
    unique (registry_id, set_code, card_schema, effect_schema)
);

create table if not exists public.tcg_card_definition_versions (
  registry_id text not null,
  card_id text not null,
  set_code text not null,
  name text not null,
  element text,
  card_family text not null check (card_family in ('Creature','Tactic','Essence')),
  card_schema text not null,
  effect_schema text not null,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (registry_id, card_id),
  constraint tcg_card_definition_versions_registry_fk
    foreign key (registry_id, set_code, card_schema, effect_schema)
    references public.tcg_registry_versions(registry_id, set_code, card_schema, effect_schema)
    on update restrict
    on delete cascade,
  constraint tcg_card_definition_versions_definition_id_check
    check (definition ->> 'id' = card_id),
  constraint tcg_card_definition_versions_definition_name_check
    check (definition ->> 'name' = name),
  constraint tcg_card_definition_versions_card_family_check
    check (definition ->> 'card_family' = card_family),
  constraint tcg_card_definition_versions_card_schema_check
    check (definition ->> 'schema' = card_schema),
  constraint tcg_card_definition_versions_effect_schema_check
    check (definition ->> 'effect_schema' = effect_schema)
);

create index if not exists tcg_card_definition_versions_card_idx
  on public.tcg_card_definition_versions(card_id, registry_id);

create index if not exists tcg_card_definition_versions_set_idx
  on public.tcg_card_definition_versions(set_code, registry_id);

drop trigger if exists tcg_registry_versions_updated_at on public.tcg_registry_versions;
create trigger tcg_registry_versions_updated_at
before update on public.tcg_registry_versions
for each row execute function public.tcg_set_updated_at();

drop trigger if exists tcg_card_definition_versions_updated_at on public.tcg_card_definition_versions;
create trigger tcg_card_definition_versions_updated_at
before update on public.tcg_card_definition_versions
for each row execute function public.tcg_set_updated_at();

alter table public.tcg_registry_versions enable row level security;
alter table public.tcg_card_definition_versions enable row level security;

-- Deliberately server-only during registry migration. No anon/authenticated policies exist.
revoke all on table public.tcg_registry_versions from public, anon, authenticated;
revoke all on table public.tcg_card_definition_versions from public, anon, authenticated;

comment on table public.tcg_registry_versions is
  'Server-only registry-version metadata. is_runtime_authority is held false until an explicit runtime-parity cutover migration.';

comment on table public.tcg_card_definition_versions is
  'Server-only structured card definitions keyed by registry version. This table intentionally has no foreign key to legacy tcg_card_definitions so a fresh database can stage the frozen v0.2 registry independently.';
