import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-attack-inspection-choice-v0-2.ts'), 'utf8');
const rewardOwner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-reward-inspection-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

function exactInspect(step, zone) {
  if (step?.op !== 'INSPECT_ZONE' || step?.player !== 'self' || step?.zone !== zone) return false;
  if (step?.visibility !== 'controller_private' || step?.return_policy !== 'same_position') return false;
  if (typeof step?.as !== 'string' || !step.as) return false;
  const selection = step?.selection;
  if (!selection || Number(selection.min) !== 1 || Number(selection.max) !== 1) return false;
  if (!selection.filters || Object.keys(selection.filters).length !== 0) return false;
  return Object.keys(selection).every((key) => ['min', 'max', 'filters'].includes(key));
}

function matchesInspectionChoiceShape(attack) {
  const steps = attack?.after_damage;
  if (!Array.isArray(steps) || steps.length !== 2) return false;
  return exactInspect(steps[0], 'deck_top') && exactInspect(steps[1], 'rewards') && steps[0].as !== steps[1].as;
}

function assertInOrder(source, needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = source.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('generic ordered inspection owner stays card-id-free and delegates existing privacy ledgers', () => {
  for (const token of ['astral-nebulynx', 'starfall-path', 'astral-celestyr-dream-cartographer', 'grove-myceliarch']) {
    assert.equal(owner.includes(token), false, `generic inspection owner contains card-specific authority: ${token}`);
  }
  assert.ok(owner.includes('recordRuntimeV02HiddenInformationView'));
  assert.ok(owner.includes('runtimeV02InspectRewardPositions'));
  assert.equal(owner.includes('runtime_private_reward_inspection_v0_2'), false, 'attack owner must not duplicate private Reward storage ownership');
  assert.ok(rewardOwner.includes('export function runtimeV02InspectRewardPositions('));
  assert.ok(rewardOwner.includes('state[PRIVATE_VIEW_KEY]'));
});

test('frozen Set One inventory has exactly one attack in the ordered deck-top plus Reward inspection family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    for (const attack of row.definition?.creature?.attacks || []) {
      if (matchesInspectionChoiceShape(attack)) matches.push(`${row.card_id}:${attack.id}`);
    }
  }
  assert.deepEqual(matches, ['astral-nebulynx:starfall-path']);
});

test('Nebulynx blocker is narrowed to Starfall Path slot 2 while malformed structured metadata still fails closed', () => {
  assert.ok(match.includes('structuredRuntimeAfterDamageInspectionChoice'));
  assert.ok(match.includes('runtimeV02CreateAttackInspectionChoice'));
  assert.ok(match.includes('runtimeV02ResolveAttackInspectionChoice'));
  assert.ok(match.includes('ad?.id==="astral-nebulynx"&&slot===2&&structuredInspectionChoice==null'));
  assert.equal(match.includes('||ad?.id==="astral-nebulynx"||'), false, 'whole-card Nebulynx blocker must be removed');
  assert.ok(match.includes('ad?.id==="grove-myceliarch"&&slot===2&&structuredDiscardRecycleChoice==null'));
  assert.equal(match.includes('ad?.id==="grove-myceliarch"&&(slot!==2||structuredDiscardRecycleChoice==null)'), false, 'inspection regression must not restore the old Colony Pulse blocker');
});

test('inspection pending choice pauses after damage and before defeat scanning through the existing private viewer', () => {
  assertInOrder(match, [
    'const dmg=attackDamage(',
    'const pendingInspectionChoice=structuredInspectionChoice?runtimeV02CreateAttackInspectionChoice(',
    'if(pendingInspectionChoice)',
    's.phase="attack_effect_resolution"',
  ], 'ordered private inspection handoff must occur after attack damage');
  const start = match.indexOf('if(pendingInspectionChoice)');
  const end = match.indexOf('if(pendingSelectedHeal)', start);
  assert.ok(start >= 0 && end > start, 'pending inspection branch missing');
  const block = match.slice(start, end);
  assert.ok(block.includes('runtimeV02PendingAttackChoiceView'));
  assert.equal(block.includes('scanDefeats()'), false, 'defeat scan must wait for private Reward inspection choice');
  assert.equal(block.includes('aftermath('), false, 'Aftermath must wait for private Reward inspection choice');
  for (const secret of ['anchor_uid', 'anchor_card_id', 'deck_top_card', 'options:', 'reward_position', '.prompt']) {
    assert.equal(block.includes(secret), false, `pending public receipt leaked private inspection field: ${secret}`);
  }
});

test('resolve_attack_choice routes ordered inspection before selected-heal fallback and resumes defeat lifecycle', () => {
  const actionStart = match.indexOf('if(action==="resolve_attack_choice")');
  const inspectBranch = match.indexOf('if(pending.kind==="inspect_deck_top_then_choose_reward")', actionStart);
  const inspectResolve = match.indexOf('runtimeV02ResolveAttackInspectionChoice(', inspectBranch);
  const selectedFallback = match.indexOf('const selectedPending=', inspectBranch);
  assert.ok(actionStart >= 0 && inspectBranch > actionStart, 'ordered inspection resolve branch missing');
  assert.ok(inspectResolve > inspectBranch, 'ordered inspection resolver must run inside its kind branch');
  assert.ok(selectedFallback > inspectResolve, 'selected-heal fallback must remain after the inspection kind branch');
  const block = match.slice(inspectBranch, selectedFallback);
  assertInOrder(block, [
    'runtimeV02ResolveAttackInspectionChoice(',
    'delete s.pending_attack_choice',
    'const n=scanDefeats()',
    'aftermath(seat)',
    'commit("resolve_attack_choice"',
  ], 'inspection choice must finish before defeat scan and Aftermath');
  for (const secret of ['reward_position:resolved', 'anchor_uid', 'anchor_card_id', 'deck_top_card', 'resolved.options', 'resolved.prompt']) {
    assert.equal(block.includes(secret), false, `resolved public receipt leaked private inspection field: ${secret}`);
  }
  assert.ok(block.includes('deck_top_inspected_count:resolved.deck_top_inspected_count'));
  assert.ok(block.includes('reward_inspected_count:resolved.reward_inspected_count'));
});

test('existing private Reward viewer remains the player-view exposure boundary', () => {
  assert.ok(match.includes('private_reward_inspection:runtimeV02PrivateRewardInspectionView(s,viewerSeat as 1|2)'));
  assert.equal(match.includes('runtime_private_reward_inspection_v0_2'), false, 'match view must not serialize canonical private Reward storage directly');
});

test('inspection choice refuses to overlap other post-damage private/heal continuations', () => {
  assert.ok(match.includes('if(structuredInspectionChoice&&(structuredDiscardRecycleChoice||structuredTopDeckCardChoice||pendingSelectedHeal||structuredHealPacketIds.length))throw new Error("tcg_v0_2_attack_inspection_choice_order_unsupported")'));
});
