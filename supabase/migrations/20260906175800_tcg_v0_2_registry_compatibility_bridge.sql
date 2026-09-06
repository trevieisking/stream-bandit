-- Stream Bandit TCG v0.2 registry compatibility bridge.
--
-- Safety contract:
-- - additive only;
-- - preserves the existing definition/rules_version columns used by the current private-alpha runtime;
-- - does not populate or activate v0.2 definitions;
-- - lets the deterministic Set One registry payload be staged beside legacy definitions before runtime cutover.

alter table public.tcg_card_definitions
  add column if not exists definition_v0_2 jsonb,
  add column if not exists definition_v0_2_rules_version text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tcg_card_definitions'::regclass
      and conname = 'tcg_card_definitions_v0_2_schema_check'
  ) then
    alter table public.tcg_card_definitions
      add constraint tcg_card_definitions_v0_2_schema_check
      check (
        definition_v0_2 is null
        or definition_v0_2 ->> 'schema' = 'sb-tcg-card-v0.2'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tcg_card_definitions'::regclass
      and conname = 'tcg_card_definitions_v0_2_effect_schema_check'
  ) then
    alter table public.tcg_card_definitions
      add constraint tcg_card_definitions_v0_2_effect_schema_check
      check (
        definition_v0_2 is null
        or definition_v0_2 ->> 'effect_schema' = 'sb-tcg-effects-v0.2'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tcg_card_definitions'::regclass
      and conname = 'tcg_card_definitions_v0_2_identity_check'
  ) then
    alter table public.tcg_card_definitions
      add constraint tcg_card_definitions_v0_2_identity_check
      check (
        definition_v0_2 is null
        or definition_v0_2 ->> 'id' = card_id
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tcg_card_definitions'::regclass
      and conname = 'tcg_card_definitions_v0_2_rules_version_check'
  ) then
    alter table public.tcg_card_definitions
      add constraint tcg_card_definitions_v0_2_rules_version_check
      check (
        (definition_v0_2 is null and definition_v0_2_rules_version is null)
        or (
          definition_v0_2 is not null
          and definition_v0_2_rules_version = 'sb-tcg-card-v0.2'
        )
      );
  end if;
end
$$;

comment on column public.tcg_card_definitions.definition_v0_2 is
  'Branch-migration slot for the deterministic sb-tcg-card-v0.2 Set One definition. Legacy definition remains runtime authority until explicit cutover gates pass.';

comment on column public.tcg_card_definitions.definition_v0_2_rules_version is
  'Schema marker for definition_v0_2. Must be sb-tcg-card-v0.2 whenever the v0.2 definition is populated.';
