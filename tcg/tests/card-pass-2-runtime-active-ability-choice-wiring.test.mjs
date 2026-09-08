import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-choice-v0-2.ts'), 'utf8');
const rewardOwner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-reward-inspection-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

function matchesActiveRewardInspect(ability) {
  if (!ability || ability.mode !== 'active' || ability.event !== null || ability.timing !== 'own_turn') return false;
  if (JSON.stringify(ability.limit) !== JSON.stringify({ scope: 'turn', count: 1, owner: 'controller' })) return false;
  if (!Array.isArray(ability.requirements) || ability.requirements.length !== 0) return false;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return false;
  if (!Array.isArray(ability.steps) || ability.steps.length !== 1) return false;
  const step = ability.steps[0];
  if (step?.op !== 'INSPECT_ZONE' || step.player !== 'self' || step.zone !== 'rewards') return false;
  if (step.visibility !== 'controller_private' || step.return_policy !== 'same_position') return false;
  if (typeof step.as !== 'string' || !step.as) return false;
  if (!step.selection || Number(step.selection.min) !== 1 || Number(step.selection.max) !== 1) return false;
  if (!step.selection.filters || Object.keys(step.selection.filters).length !== 0) return false;
  return Object.keys(step.selection).every((key) => ['min', 'max', 'filters'].includes(key));
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

test('generic active Ability Reward choice owner stays card-id-free and delegates the existing Reward privacy owner', () => {
  for (const token of [
    'astral-nebulynx',
    'nebula-memory',
    'grove-myceliarch',
    'networked-growth',
    'shade-noctivane',
    'night-reading',
    'shade-hollowcrown',
    'hollow-command',
    'astral-cosmarch',
    'charted-future',
  ]) {
    assert.equal(owner.includes(token), false, `generic active Ability owner contains card-specific authority: ${token}`);
  }
  assert.ok(owner.includes('runtimeV02InspectRewardPositions'));
  assert.ok(owner.includes('runtimeV02Definition'));
  assert.equal(owner.includes('runtime_private_reward_inspection_v0_2'), false, 'active Ability owner must not duplicate private Reward storage');
  assert.ok(rewardOwner.includes('export function runtimeV02InspectRewardPositions('));
});

test('frozen Set One inventory has exactly one active Ability in the one-Reward private inspection family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  const active = [];
  for (const row of registry.definitions) {
    const ability = row.definition?.creature?.ability;
    if (ability?.mode === 'active') active.push(`${row.card_id}:${ability.id}`);
    if (matchesActiveRewardInspect(ability)) matches.push(`${row.card_id}:${ability.id}`);
  }
  assert.ok(active.length > 1, 'inventory proof must distinguish the new family from other active Abilities');
  assert.deepEqual(matches, ['astral-nebulynx:nebula-memory']);
});

test('match owner exposes one generic use_ability boundary after the active-player play gate', () => {
  assert.ok(match.includes('structuredRuntimeActiveAbilityRewardInspection'));
  assert.ok(match.includes('runtimeV02CreateActiveAbilityRewardChoice'));
  assertInOrder(match, [
    'if(s.phase!=="play"||Number(s.active_seat)!==seat)',
    'if(action==="use_ability")',
    'const descriptor=structuredRuntimeActiveAbilityRewardInspection(s,source)',
    'runtimeV02CreateActiveAbilityRewardChoice(',
    's.pending_ability_choice=pending',
    's.phase="ability_effect_resolution"',
  ], 'active Ability activation lifecycle');
  const start = match.indexOf('if(action==="use_ability")');
  const end = match.indexOf('if(action==="play_creature")', start);
  const block = match.slice(start, end);
  assert.ok(block.includes('getCr(p,where,idx)'));
  assert.ok(block.includes('cr.stack[cr.stack.length-1]'));
  assert.ok(block.includes('active_ability_requires_runtime_owner'));
  for (const cardSpecific of ['astral-nebulynx', 'nebula-memory', 'grove-myceliarch']) {
    assert.equal(block.includes(cardSpecific), false, `use_ability branch contains card-specific authority: ${cardSpecific}`);
  }
});

test('pending active Ability choice is viewer-owned and public activation receipt contains no Reward identity', () => {
  assert.ok(match.includes('pending_ability_choice:runtimeV02PendingActiveAbilityChoiceView(s.pending_ability_choice||null,viewerSeat as 1|2)'));
  assert.equal(match.includes('runtime_active_ability_limits_v0_2'), false, 'private active Ability limit ledger must not be serialized by match view');
  const start = match.indexOf('if(action==="use_ability")');
  const end = match.indexOf('if(action==="play_creature")', start);
  const block = match.slice(start, end);
  assert.ok(block.includes('commit("ability_pending_choice"'));
  assert.ok(block.includes('reward_selection_count:1'));
  for (const secret of ['anchor_uid', 'anchor_card_id', 'reward_position', 'source_uid', 'source_card_id', 'options:', '.prompt']) {
    assert.equal(block.includes(secret), false, `activation public receipt leaked private Ability field: ${secret}`);
  }
});

test('resolve_ability_choice runs before the ordinary play gate and returns to play without defeat or Aftermath ownership', () => {
  const resolveStart = match.indexOf('if(action==="resolve_ability_choice")');
  const takeReward = match.indexOf('if(action==="take_reward")', resolveStart);
  const playGate = match.indexOf('if(s.phase!=="play"||Number(s.active_seat)!==seat)', resolveStart);
  assert.ok(resolveStart >= 0 && takeReward > resolveStart && playGate > takeReward, 'active Ability resolver must precede ordinary play gate');
  const block = match.slice(resolveStart, takeReward);
  assertInOrder(block, [
    's.phase!=="ability_effect_resolution"',
    'runtimeV02ResolveActiveAbilityRewardChoice(',
    'delete s.pending_ability_choice',
    's.phase="play"',
    'commit("resolve_ability_choice"',
  ], 'active Ability private continuation');
  assert.equal(block.includes('scanDefeats()'), false, 'inspection-only active Ability must not own defeat scanning');
  assert.equal(block.includes('aftermath('), false, 'inspection-only active Ability must not own Aftermath');
  assert.ok(block.includes('reward_inspected_count:resolved.reward_inspected_count'));
  for (const secret of ['anchor_uid', 'anchor_card_id', 'reward_position', 'source_uid', 'source_card_id', 'resolved.options', 'resolved.prompt']) {
    assert.equal(block.includes(secret), false, `resolution public receipt leaked private Ability field: ${secret}`);
  }
});

test('active Ability owner consumes the controller turn limit at activation and revalidates source, turn, Reward set and receipt on resolution', () => {
  assertInOrder(owner, [
    'runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, descriptor.ability_id)',
    'const rewardCards = rewards.map',
    'recordActiveAbilityUse(state, controller, descriptor.ability_id)',
    'return {',
  ], 'limit must be consumed only after activation preconditions and Reward anchors are valid');
  assert.ok(owner.includes('tcg_v0_2_active_ability_choice_turn_limit_reached'));
  assert.ok(owner.includes('tcg_v0_2_active_ability_choice_turn_changed'));
  assert.ok(owner.includes('tcg_v0_2_active_ability_choice_source_changed'));
  assert.ok(owner.includes('tcg_v0_2_active_ability_choice_reward_set_changed'));
  assert.ok(owner.includes('tcg_v0_2_active_ability_choice_limit_receipt_missing'));
});
