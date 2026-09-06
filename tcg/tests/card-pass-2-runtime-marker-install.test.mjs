import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '20260906193000_tcg_match_v0_2_runtime_marker_bridge.sql'),
  'utf8',
);

const registrySha = 'b1bc874a6d3707f5c93cd4067994a12111416da636cb15048d10e109829b1c00';

test('canonical-state marker is stamped only from the exact frozen non-authoritative registry', () => {
  assert.match(migration, /create or replace function public\.tcg_server_install_initial_state/i);
  assert.ok(migration.includes(registrySha));
  assert.match(migration, /rv\.registry_id='SB1-set-one-v0\.2'/i);
  assert.match(migration, /rv\.card_count=193/i);
  assert.match(migration, /rv\.is_runtime_authority=false/i);
  assert.match(migration, /'runtime_registry_v0_2'/i);
  assert.match(migration, /'runtime_authority',false/i);
  assert.doesNotMatch(migration, /is_runtime_authority\s*=\s*true/i);
});

test('every canonical card sidecar is checked against the frozen shadow-registry row before marking', () => {
  assert.match(migration, /from jsonb_each\(v_state->'card_index'\)/i);
  assert.match(migration, /left join public\.tcg_card_definition_versions cv/i);
  assert.match(migration, /cv\.card_id=e\.card_id/i);
  assert.match(migration, /e\.entry->'definition_v0_2' is distinct from cv\.definition/i);
  assert.match(migration, /definition_v0_2_rules_version/i);
  assert.match(migration, /tcg_v0_2_snapshot_sidecar_mismatch/i);
  assert.match(migration, /tcg_v0_2_snapshot_card_index_required/i);
});

test('legacy-only initialization remains valid and false markers are stripped when v0.2 is absent', () => {
  assert.match(migration, /if v_registry_ready then/i);
  assert.match(migration, /v_state := v_state - 'runtime_registry_v0_2'/i);
  assert.match(migration, /values \(p_match_id,0,v_state,jsonb_build_object\('source','edge-webcrypto-v0\.1'\)\)/i);
  assert.doesNotMatch(migration, /update\s+public\.tcg_card_definitions\b/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.tcg_card_definitions\b/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.tcg_card_definitions\b/i);
});

test('already initialized matches preserve the original idempotent legacy-safe state', () => {
  assert.match(migration, /exists \(select 1 from public\.tcg_match_state_private where match_id=p_match_id\)/i);
  assert.match(migration, /'already_initialized',true/i);
  assert.match(migration, /grant execute on function public\.tcg_server_install_initial_state\(uuid,jsonb,uuid,jsonb,uuid,jsonb\) to service_role/i);
});
