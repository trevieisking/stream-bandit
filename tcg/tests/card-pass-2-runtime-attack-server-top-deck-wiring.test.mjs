import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-attack-server-top-deck-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'tcg-runtime-capabilities-v0.2.json'), 'utf8'));

function matchesServerTopDeckConditionalMove(attack) {
  const steps = attack?.after_damage;
  if (!Array.isArray(steps) || steps.length !== 2) return false;
  const [inspect, conditional] = steps;
  if (inspect?.op !== 'INSPECT_ZONE' || inspect?.player !== 'self' || inspect?.zone !== 'deck_top') return false;
  if (inspect?.visibility !== 'server_only' || inspect?.return_policy !== 'same_position') return false;
  if (Number(inspect?.selection?.min) !== 1 || Number(inspect?.selection?.max) !== 1) return false;
  if (!inspect?.selection?.filters || Object.keys(inspect.selection.filters).length !== 0) return false;
  if (typeof inspect?.as !== 'string' || !inspect.as) return false;
  if (conditional?.op !== 'IF' || !conditional.when || !Array.isArray(conditional.then) || conditional.then.length !== 1) return false;
  if (conditional.when.predicate !== 'card_matches' || conditional.when.card !== `$${inspect.as}`) return false;
  if (!conditional.when.filters || typeof conditional.when.filters.element !== 'string') return false;
  if (Object.keys(conditional.when.filters).some((key) => key !== 'element')) return false;
  const move = conditional.then[0];
  return move?.op === 'MOVE_CARDS' && move?.player === 'self' && move?.cards === `$${inspect.as}` && move?.to === 'hand';
}

test('server-only top-deck attack owner is card-id-free, attack-scoped and does not leak server inspection into player view ledgers', () => {
  for (const forbidden of ['astral-cosmarch', 'known-horizon', 'Cosmarch', 'Known Horizon']) {
    assert.equal(owner.includes(forbidden), false, `generic server top-deck owner contains card/name authority: ${forbidden}`);
  }
  assert.ok(owner.includes('structuredRuntimeAfterDamageServerTopDeckConditionalMove'));
  assert.ok(owner.includes('runtimeV02ResolveAfterDamageServerTopDeckConditionalMove'));
  assert.ok(owner.includes('attack.after_damage'));
  assert.equal(owner.includes('recordRuntimeV02HiddenInformationView'), false, 'server-only inspection must not become a player hidden-information view');
  assert.equal(owner.includes('runtime_private_reward_inspection_v0_2'), false);
});

test('frozen Set One inventory has exactly one attack in the server-only top-deck conditional move family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    for (const attack of row.definition?.creature?.attacks || []) {
      if (matchesServerTopDeckConditionalMove(attack)) matches.push(`${row.card_id}:${attack.id}`);
    }
  }
  assert.deepEqual(matches, ['astral-cosmarch:known-horizon']);
});

test('Cosmarch Constellation Claw remains a plain slot-1 attack and Known Horizon alone owns this after-damage family', () => {
  const registry = buildSetOneRegistry(root);
  const row = registry.definitions.find((entry) => entry.card_id === 'astral-cosmarch');
  assert.ok(row, 'missing frozen Astral Cosmarch definition');
  const attacks = row.definition?.creature?.attacks || [];
  assert.equal(attacks[0]?.id, 'constellation-claw');
  assert.equal(attacks[0]?.base_damage, 70);
  assert.deepEqual(attacks[0]?.after_damage, []);
  assert.equal(matchesServerTopDeckConditionalMove(attacks[0]), false);
  assert.equal(attacks[1]?.id, 'known-horizon');
  assert.equal(attacks[1]?.base_damage, 110);
  assert.equal(matchesServerTopDeckConditionalMove(attacks[1]), true);
});

test('live match owner delegates marked v0.2 server-only top-deck effects and preserves Cosmarch card-id handling only as legacy fallback', () => {
  assert.ok(match.includes('tcg-match-attack-server-top-deck-v0-2.ts'));
  assert.ok(match.includes('structuredRuntimeAfterDamageServerTopDeckConditionalMove('));
  assert.ok(match.includes('runtimeV02ResolveAfterDamageServerTopDeckConditionalMove('));
  assert.ok(match.includes('structured_after_damage_server_top_deck:structuredServerTopDeckResult'));
  assert.ok(match.includes('atk.metadata_source==="legacy"&&ad?.id==="astral-cosmarch"'));
  assert.equal(match.includes('if(ad?.id==="astral-cosmarch"&&'), false, 'marked v0.2 Cosmarch must not pass through the old whole-card fallback');
});

test('server-only top-deck audit is count/status only and remains before defeat scanning and Aftermath', () => {
  const resolve = match.indexOf('runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(');
  const scan = match.indexOf('const n=scanDefeats()', resolve);
  assert.ok(resolve >= 0, 'missing structured server top-deck resolver call');
  assert.ok(scan > resolve, 'server-only after-damage effect must finish before defeat scanning');
  const ownerResult = owner.slice(owner.indexOf('export type RuntimeV02AttackServerTopDeckConditionalMoveResolution'), owner.indexOf('function objectRecord'));
  for (const secret of ['uid', 'card_id', 'card_name', 'top_card']) {
    assert.equal(ownerResult.includes(secret), false, `public structured result must not expose ${secret}`);
  }
  assert.ok(ownerResult.includes('inspected_count'));
  assert.ok(ownerResult.includes('matched'));
  assert.ok(ownerResult.includes('moved_count'));
});

test('bounded Known Horizon owner does not falsely claim generic INSPECT_ZONE, IF or card_matches interpreter parity', () => {
  assert.ok(capabilities.operations.missing.includes('INSPECT_ZONE'));
  assert.ok(capabilities.operations.missing.includes('IF'));
  assert.ok(capabilities.predicates.missing.includes('card_matches'));
  assert.equal(capabilities.completion.runtime_interpreter_parity, false);
});
