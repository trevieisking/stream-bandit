import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SET_ONE_CANDIDATE_FILES,
  buildSetOneRegistry,
  serializeSetOneRegistry,
  serializeSetOneRegistryStagingSql,
} from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

function starterCardIds() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tcg-set-one-starters-v0.2.json'), 'utf8'));
  const ids = new Set();
  for (const starter of manifest.starters || []) {
    for (const entry of starter.cards || starter.decklist || []) {
      const id = Array.isArray(entry) ? entry[0] : entry?.card_id || entry?.id;
      if (typeof id === 'string') ids.add(id);
    }
  }
  return ids;
}

test('Set One registry builder produces exactly the accepted 193 v0.2 definitions', () => {
  const registry = buildSetOneRegistry(root);
  assert.equal(registry.schema, 'sb-tcg-registry-v0.2');
  assert.equal(registry.registry_id, 'SB1-set-one-v0.2');
  assert.equal(registry.card_schema, 'sb-tcg-card-v0.2');
  assert.equal(registry.effect_schema, 'sb-tcg-effects-v0.2');
  assert.equal(registry.card_count, 193);
  assert.equal(registry.definitions.length, 193);
  assert.deepEqual(registry.source_files, [...SET_ONE_CANDIDATE_FILES]);

  const expectedSourceCounts = Object.fromEntries([
    ...SET_ONE_CANDIDATE_FILES.slice(0, 8).map((name) => [name, 24]),
    ['tcg-card-pass-2-founder-structured.md', 1],
  ]);
  assert.deepEqual(registry.source_counts, expectedSourceCounts);
});

test('registry rows are unique, sorted and directly shaped for tcg_card_definitions', () => {
  const registry = buildSetOneRegistry(root);
  const ids = registry.definitions.map((row) => row.card_id);
  assert.equal(new Set(ids).size, ids.length, 'registry card ids must be unique');
  assert.deepEqual(ids, [...ids].sort((a, b) => a.localeCompare(b)), 'registry rows must be stable card-id order');

  for (const row of registry.definitions) {
    assert.equal(row.set_code, 'SB1');
    assert.equal(row.rules_version, 'sb-tcg-card-v0.2');
    assert.equal(row.is_active, true);
    assert.equal(row.definition.id, row.card_id);
    assert.equal(row.definition.name, row.name);
    assert.equal(row.definition.card_family, row.card_family);
    assert.equal(row.definition.schema, 'sb-tcg-card-v0.2');
    assert.equal(row.definition.effect_schema, 'sb-tcg-effects-v0.2');
    assert.ok(['Creature', 'Tactic', 'Essence'].includes(row.card_family));
  }
});

test('registry serialization is deterministic and contains no generated timestamp', () => {
  const first = serializeSetOneRegistry(root);
  const second = serializeSetOneRegistry(root);
  assert.equal(first, second);
  assert.equal(first.endsWith('\n'), true);
  assert.equal(first.includes('generated_at'), false);
  assert.equal(first.includes('created_at'), false);
  assert.equal(first.includes('updated_at'), false);
  const digest = createHash('sha256').update(first).digest('hex');
  console.log(`SET_ONE_REGISTRY_SHA256=${digest}`);
});

test('every exact starter reference exists in the deterministic registry', () => {
  const registry = buildSetOneRegistry(root);
  const ids = new Set(registry.definitions.map((row) => row.card_id));
  const starterIds = starterCardIds();
  assert.ok(starterIds.size > 0, 'starter manifest must yield at least one card id');
  const missing = [...starterIds].filter((id) => !ids.has(id)).sort();
  assert.deepEqual(missing, []);
});

test('staging SQL is deterministic, exact-set fail-closed and preserves legacy runtime definitions', () => {
  const registry = buildSetOneRegistry(root);
  const first = serializeSetOneRegistryStagingSql(root);
  const second = serializeSetOneRegistryStagingSql(root);
  assert.equal(first, second, 'staging SQL must be deterministic');

  const payloadRows = first.split('\n').filter((line) =>
    line.startsWith('  (') && line.includes("::jsonb, 'sb-tcg-card-v0.2')")
  );
  assert.equal(payloadRows.length, 193, 'staging SQL must contain exactly 193 generated payload rows');

  assert.match(first, /create temporary table tcg_set_one_v0_2_stage/i);
  assert.match(first, /update public\.tcg_card_definitions cd/i);
  assert.match(first, /set definition_v0_2 = s\.definition_v0_2/i);
  assert.match(first, /definition_v0_2_rules_version = s\.definition_v0_2_rules_version/i);
  assert.match(first, /tcg_set_one_v0_2_identity_set_mismatch/);
  assert.match(first, /expected 193/);
  assert.match(first, /\bexcept\b/i);

  assert.doesNotMatch(first, /insert\s+into\s+public\.tcg_card_definitions/i, 'staging SQL must not insert registry rows');
  assert.doesNotMatch(first, /set\s+definition\s*=/i, 'staging SQL must not overwrite the legacy runtime definition column');
  assert.doesNotMatch(first, /set\s+rules_version\s*=/i, 'staging SQL must not overwrite the legacy runtime rules_version column');

  for (const row of registry.definitions) {
    assert.ok(first.includes(`'${row.card_id}'`), `staging SQL missing ${row.card_id}`);
  }
});
