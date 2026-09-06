import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SET_ONE_CANDIDATE_FILES,
  buildSetOneRegistry,
  serializeSetOneRegistry,
} from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

function starterCardIds() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tcg-set-one-starters-v0.2.json'), 'utf8'));
  const ids = new Set();
  for (const starter of manifest.starters || []) {
    for (const entry of starter.cards || starter.decklist || []) {
      const id = entry.card_id || entry.id;
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
});

test('every exact starter reference exists in the deterministic registry', () => {
  const registry = buildSetOneRegistry(root);
  const ids = new Set(registry.definitions.map((row) => row.card_id));
  const missing = [...starterCardIds()].filter((id) => !ids.has(id)).sort();
  assert.deepEqual(missing, []);
});
