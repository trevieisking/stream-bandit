import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-attack-card-choice-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

function matchesTopDeckChoiceShape(attack) {
  const steps = attack?.after_damage;
  if (!Array.isArray(steps) || steps.length !== 4) return false;
  const [look, choose, move, remainder] = steps;
  if (look?.op !== 'LOOK_TOP' || look?.player !== 'self' || !Number.isInteger(Number(look?.count)) || Number(look.count) <= 0) return false;
  const looked = String(look?.as || '');
  if (!looked) return false;
  if (choose?.op !== 'CHOOSE_FROM_SET' || choose?.source !== `$${looked}` || Number(choose?.min) !== 1 || Number(choose?.max) !== 1) return false;
  const chosen = String(choose?.as || '');
  if (!chosen) return false;
  if (move?.op !== 'MOVE_CARDS' || move?.player !== 'self' || move?.cards !== `$${chosen}` || move?.to !== 'hand') return false;
  return remainder?.op === 'PUT_REMAINDER_ON_DECK_BOTTOM' && remainder?.player === 'self' && remainder?.source === `$${looked}` && remainder?.except === `$${chosen}` && remainder?.order === 'preserve';
}

test('generic top-deck attack choice owner stays card-id-free and private by structure', () => {
  for (const cardId of ['astral-celestyr-dream-cartographer', 'astral-nebulynx', 'grove-myceliarch']) {
    assert.equal(owner.includes(cardId), false, `generic attack-card choice owner contains card-specific authority: ${cardId}`);
  }
  assert.ok(owner.includes('structuredRuntimeAfterDamageTopDeckCardChoice'));
  assert.ok(owner.includes('runtimeV02CreateTopDeckCardChoice'));
  assert.ok(owner.includes('runtimeV02ResolveTopDeckCardChoice'));
  assert.ok(owner.includes('recordRuntimeV02HiddenInformationView'));
});

test('frozen Set One inventory has exactly one attack in the newly-owned top-deck choice family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    for (const attack of row.definition?.creature?.attacks || []) {
      if (matchesTopDeckChoiceShape(attack)) matches.push(`${row.card_id}:${attack.id}`);
    }
  }
  assert.deepEqual(matches, ['astral-celestyr-dream-cartographer:dream-ray']);
});

test('match owner uses the generic descriptor while preserving Celestyr legacy fallback and the other blockers', () => {
  assert.ok(match.includes('structuredRuntimeAfterDamageTopDeckCardChoice'));
  assert.ok(match.includes('runtimeV02CreateTopDeckCardChoice'));
  assert.ok(match.includes('runtimeV02ResolveTopDeckCardChoice'));
  assert.ok(match.includes('ad?.id==="astral-celestyr-dream-cartographer"&&slot===1&&structuredTopDeckCardChoice==null'));
  assert.ok(match.includes('ad?.id==="astral-nebulynx"'));
  assert.ok(match.includes('ad?.id==="grove-myceliarch"'));
});

test('resolve_attack_choice routes hidden-card choices before the selected-heal resolver', () => {
  const branch = match.indexOf('if(pending.kind==="choose_from_looked_set")');
  const cardResolve = match.indexOf('runtimeV02ResolveTopDeckCardChoice', branch);
  const healResolve = match.indexOf('runtimeV02ResolveSelectedHealChoice', branch);
  assert.ok(branch >= 0, 'missing choose_from_looked_set branch');
  assert.ok(cardResolve > branch, 'hidden-card resolver must be inside the private choice branch');
  assert.ok(healResolve > cardResolve, 'selected-heal resolver must remain the later fallback kind');
});

test('pending hidden-card choice pauses before defeats and keeps public audit free of hidden identities', () => {
  const start = match.indexOf('if(pendingTopDeckCardChoice)');
  const end = match.indexOf('if(pendingSelectedHeal)', start);
  assert.ok(start >= 0 && end > start, 'missing pending top-deck choice block');
  const block = match.slice(start, end);
  assert.ok(block.includes('s.phase="attack_effect_resolution"'));
  assert.ok(block.includes('runtimeV02PendingAttackChoiceView'));
  assert.equal(block.includes('scanDefeats()'), false, 'defeat scan must wait for private card choice');
  assert.equal(block.includes('aftermath('), false, 'Aftermath must wait for private card choice');
  assert.equal(block.includes('chosen_uid'), false, 'public pending receipt must not expose chosen card uid');
  assert.equal(block.includes('chosen_card_id'), false, 'public pending receipt must not expose chosen card id');
  assert.equal(block.includes('options:'), false, 'public pending receipt must not serialize private options');
});

test('resolved hidden-card public receipt exposes only counts and never selected identity', () => {
  const start = match.indexOf('if(pending.kind==="choose_from_looked_set")');
  const end = match.indexOf('const selectedPending=', start);
  assert.ok(start >= 0 && end > start, 'missing resolved hidden-card branch');
  const block = match.slice(start, end);
  for (const safe of ['looked_count:resolved.looked_count', 'chosen_count:resolved.chosen_count', 'remainder_count:resolved.remainder_count']) {
    assert.ok(block.includes(safe), `missing safe resolved audit field ${safe}`);
  }
  assert.equal(block.includes('chosen_uid'), false);
  assert.equal(block.includes('chosen_card_id'), false);
  assert.equal(block.includes('resolved.options'), false);
  assert.equal(block.includes('resolved.label'), false);
});
