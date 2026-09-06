import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';
import { serializeSetOneShadowRegistrySql } from '../../tcg-set-one-shadow-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const registryLock = JSON.parse(fs.readFileSync(path.join(root, 'tcg-card-pass-2-registry-lock-v0.2.json'), 'utf8'));
const migrationPath = path.join(
  root,
  'supabase',
  'migrations',
  '20260906183000_tcg_v0_2_shadow_registry.sql',
);
const migration = fs.readFileSync(migrationPath, 'utf8');

test('v0.2 shadow registry is additive, server-only and cannot become runtime authority', () => {
  assert.match(migration, /create table if not exists public\.tcg_registry_versions/i);
  assert.match(migration, /create table if not exists public\.tcg_card_definition_versions/i);
  assert.match(migration, /is_runtime_authority boolean not null default false/i);
  assert.match(migration, /constraint tcg_registry_versions_runtime_authority_hold\s+check \(is_runtime_authority = false\)/i);

  assert.match(migration, /alter table public\.tcg_registry_versions enable row level security/i);
  assert.match(migration, /alter table public\.tcg_card_definition_versions enable row level security/i);
  assert.match(migration, /revoke all on table public\.tcg_registry_versions from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.tcg_card_definition_versions from public, anon, authenticated/i);

  assert.doesNotMatch(migration, /references\s+public\.tcg_card_definitions/i, 'fresh-db staging must not depend on legacy card rows');
  assert.doesNotMatch(migration, /insert\s+into\s+public\.tcg_card_definitions/i, 'shadow registry must not create legacy runtime rows');
  assert.doesNotMatch(migration, /update\s+public\.tcg_card_definitions/i, 'shadow registry must not mutate legacy runtime rows');
  assert.doesNotMatch(migration, /grant\s+.+\s+to\s+(anon|authenticated)/i, 'shadow registry must remain server-only');
});

test('v0.2 shadow registry enforces registry and structured-card identity consistency', () => {
  assert.match(migration, /registry_sha256 text not null check \(registry_sha256 ~ '\^\[0-9a-f\]\{64\}\$'\)/i);
  assert.match(migration, /unique \(registry_id, set_code, card_schema, effect_schema\)/i);
  assert.match(migration, /primary key \(registry_id, card_id\)/i);
  assert.match(migration, /foreign key \(registry_id, set_code, card_schema, effect_schema\)/i);
  assert.match(migration, /references public\.tcg_registry_versions\(registry_id, set_code, card_schema, effect_schema\)/i);
  assert.match(migration, /check \(definition ->> 'id' = card_id\)/i);
  assert.match(migration, /check \(definition ->> 'name' = name\)/i);
  assert.match(migration, /check \(definition ->> 'card_family' = card_family\)/i);
  assert.match(migration, /check \(definition ->> 'schema' = card_schema\)/i);
  assert.match(migration, /check \(definition ->> 'effect_schema' = effect_schema\)/i);
});

test('v0.2 shadow registry remains replay-oriented and payload-free until the frozen 193-card load step', () => {
  assert.match(migration, /create index if not exists tcg_card_definition_versions_card_idx/i);
  assert.match(migration, /create index if not exists tcg_card_definition_versions_set_idx/i);
  assert.match(migration, /drop trigger if exists tcg_registry_versions_updated_at/i);
  assert.match(migration, /drop trigger if exists tcg_card_definition_versions_updated_at/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.tcg_registry_versions/i, 'schema migration must not silently declare a frozen registry');
  assert.doesNotMatch(migration, /insert\s+into\s+public\.tcg_card_definition_versions/i, 'schema migration must not silently stage card payloads');
});

test('generated shadow-registry load is deterministic, exact-193 and locked to the frozen digest', () => {
  const registry = buildSetOneRegistry(root);
  const first = serializeSetOneShadowRegistrySql(root);
  const second = serializeSetOneShadowRegistrySql(root);
  assert.equal(first, second, 'shadow registry SQL must be deterministic');
  assert.equal(registry.card_count, 193);

  const payloadRows = first.split('\n').filter((line) =>
    line.startsWith('  (') && line.includes("'SB1-set-one-v0.2'") && line.includes('::jsonb)')
  );
  assert.equal(payloadRows.length, 193, 'shadow registry SQL must contain exactly 193 generated card rows');

  assert.match(first, /insert into public\.tcg_registry_versions/i);
  assert.match(first, /insert into public\.tcg_card_definition_versions/i);
  assert.match(first, /on conflict \(registry_id\) do update/i);
  assert.match(first, /on conflict \(registry_id, card_id\) do update/i);
  assert.match(first, /tcg_v0_2_shadow_registry_row_count_mismatch/);
  assert.match(first, /tcg_v0_2_shadow_registry_structured_row_mismatch/);
  assert.ok(first.includes(registryLock.sha256), 'shadow registry SQL must carry the frozen registry digest');
  assert.equal(registryLock.runtime_authority, false);
  assert.match(first, /is_runtime_authority = false/i);
  assert.doesNotMatch(first, /is_runtime_authority\s*=\s*true/i, 'generated load must never activate runtime authority');

  assert.doesNotMatch(first, /insert\s+into\s+public\.tcg_card_definitions\b/i, 'generated load must not insert legacy runtime definitions');
  assert.doesNotMatch(first, /update\s+public\.tcg_card_definitions\b/i, 'generated load must not update legacy runtime definitions');
  assert.doesNotMatch(first, /delete\s+from\s+public\.tcg_card_definitions\b/i, 'generated load must not delete legacy runtime definitions');

  for (const row of registry.definitions) {
    assert.ok(first.includes(`'${row.card_id}'`), `shadow registry SQL missing ${row.card_id}`);
  }
});
