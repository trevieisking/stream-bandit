import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260906191500_tcg_match_v0_2_registry_snapshot_bridge.sql'),
  'utf8',
);

const registryId = 'SB1-set-one-v0.2';
const registrySha = 'b1bc874a6d3707f5c93cd4067994a12111416da636cb15048d10e109829b1c00';

test('match preparation keeps legacy definition authority while snapshotting guarded v0.2 definitions', () => {
  assert.match(migration, /create or replace function public\.tcg_server_prepare_match\(p_room_id uuid\)/i);
  assert.match(migration, /'definition',cd\.definition/i, 'legacy definition snapshot must remain present');
  assert.match(migration, /'definition_v0_2',case when v_registry_ready then cv\.definition else null end/i);
  assert.match(migration, /'definition_v0_2_rules_version',case when v_registry_ready then 'sb-tcg-card-v0\.2' else null end/i);
  assert.match(migration, /left join public\.tcg_card_definition_versions cv/i);
  assert.match(migration, /cv\.registry_id='SB1-set-one-v0\.2'/i);
  assert.doesNotMatch(migration, /update\s+public\.tcg_card_definitions\b/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.tcg_card_definitions\b/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.tcg_card_definitions\b/i);
});

test('snapshot bridge accepts only the frozen registry identity and remains non-authoritative', () => {
  assert.ok(migration.includes(registryId));
  assert.ok(migration.includes(registrySha));
  assert.match(migration, /rv\.set_code='SB1'/i);
  assert.match(migration, /rv\.card_schema='sb-tcg-card-v0\.2'/i);
  assert.match(migration, /rv\.effect_schema='sb-tcg-effects-v0\.2'/i);
  assert.match(migration, /rv\.card_count=193/i);
  assert.match(migration, /rv\.is_runtime_authority=false/i);
  assert.match(migration, /'runtime_authority',false/i);
  assert.doesNotMatch(migration, /is_runtime_authority\s*=\s*true/i);
});

test('declared but inconsistent or incomplete v0.2 registry fails closed before match creation', () => {
  assert.match(migration, /v_registry_declared and not v_registry_ready/i);
  assert.match(migration, /tcg_v0_2_registry_metadata_mismatch/);
  assert.match(migration, /where dc\.deck_id=m\.selected_deck_id[\s\S]*cv\.card_id is null/i);
  assert.match(migration, /tcg_v0_2_registry_missing_deck_cards/);
  assert.match(migration, /missing_count/i);
});

test('absence of a declared v0.2 registry preserves the legacy match path', () => {
  assert.match(migration, /v_registry_ready boolean := false/i);
  assert.match(migration, /case when v_registry_ready then cv\.definition else null end/i);
  assert.match(migration, /join public\.tcg_card_definitions cd on cd\.card_id=dc\.card_id/i);
  assert.match(migration, /values \(p_room_id,'set-one-v0\.6\.1','setup',0\)/i);
  assert.match(migration, /grant execute on function public\.tcg_server_prepare_match\(uuid\) to service_role/i);
});
