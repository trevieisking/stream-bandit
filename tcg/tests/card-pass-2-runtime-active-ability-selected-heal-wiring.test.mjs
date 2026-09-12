import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-selected-heal-v0-2.ts'), 'utf8');
const activeChoiceOwner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-choice-v0-2.ts'), 'utf8');
const activeLive = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts'), 'utf8');
const healPacketOwner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts'), 'utf8');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

function matchesActiveSelectedHeal(ability) {
  if (!ability || ability.mode !== 'active' || ability.event !== null || ability.timing !== 'own_turn') return false;
  if (JSON.stringify(ability.limit) !== JSON.stringify({ scope: 'turn', count: 1, owner: 'controller' })) return false;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return false;
  if (!Array.isArray(ability.steps) || ability.steps.length !== 2) return false;
  const [select, heal] = ability.steps;
  if (select?.op !== 'SELECT_CREATURE' || select.controller !== 'self' || select.zone !== 'field' || Number(select.count) !== 1) return false;
  if (!select.filters || typeof select.filters.element !== 'string' || select.filters.damaged !== true) return false;
  if (Object.keys(select.filters).some((key) => !['element', 'damaged'].includes(key))) return false;
  if (typeof select.as !== 'string' || !select.as) return false;
  if (heal?.op !== 'HEAL' || heal.target !== `$${select.as}` || !Number.isFinite(Number(heal.amount)) || Number(heal.amount) <= 0) return false;
  const all = ability.requirements?.all;
  if (!Array.isArray(all) || all.length !== 2) return false;
  const event = all.find((entry) => entry?.predicate === 'event_occurred');
  const legal = all.find((entry) => entry?.predicate === 'legal_card_available');
  if (!event || !legal) return false;
  if (event.event !== 'device_resolved' || event.controller !== 'self' || event.window !== 'current_turn' || Number(event.min_count) !== 1) return false;
  if (legal.controller !== 'self' || legal.zone !== 'field') return false;
  if (JSON.stringify(legal.filters) !== JSON.stringify({ card_family: 'Creature', element: select.filters.element, damaged: true })) return false;
  return true;
}

function blockBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert.notEqual(start, -1, `missing start marker: ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.notEqual(end, -1, `missing end marker: ${endNeedle}`);
  return source.slice(start, end);
}

test('generic active Ability selected-heal owner stays card-id-free and reuses the single limit and heal-packet owners', () => {
  for (const token of [
    'grove-myceliarch',
    'networked-growth',
    'grove-sporeling',
    'spore-feed',
    'astral-nebulynx',
    'nebula-memory',
    'shade-noctivane',
  ]) {
    assert.equal(owner.includes(token), false, `generic selected-heal owner contains card-specific authority: ${token}`);
    assert.equal(activeLive.includes(token), false, `generic active-Ability live facade contains card-specific authority: ${token}`);
  }
  assert.ok(owner.includes('runtimeV02CurrentTurnActiveAbilityUseCount'));
  assert.ok(owner.includes('applyRuntimeV02HealPacket'));
  assert.ok(owner.includes('action_kind: "ability"'));
  assert.equal(owner.includes('healRuntimeDamage('), false, 'selected-heal owner must not bypass canonical heal packets');
  assert.equal(owner.includes('runtime_active_ability_limits_v0_2'), false, 'selected-heal owner must not become a second limit-ledger owner');
  assert.ok(activeChoiceOwner.includes('const LIMIT_KEY = "runtime_active_ability_limits_v0_2"'));
  assert.ok(activeChoiceOwner.includes('export function runtimeV02RecordActiveAbilityUse('));
  assert.equal(activeChoiceOwner.split('state[LIMIT_KEY] =').length - 1, 1, 'active Ability limit ledger must have one write statement');
  assert.ok(activeChoiceOwner.includes('runtimeV02RecordActiveAbilityUse(state, controller, descriptor.ability_id)'));
  assert.ok(activeLive.includes('runtimeV02RecordActiveAbilityUse('));
  assert.equal(activeLive.includes('state[LIMIT_KEY] ='), false, 'live facade must delegate rather than duplicate the limit-ledger write');
  assert.ok(healPacketOwner.includes('export function applyRuntimeV02HealPacket('));
});

test('frozen Set One inventory has exactly one active Ability in the Device-gated damaged-friendly selected-heal family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    const ability = row.definition?.creature?.ability;
    if (matchesActiveSelectedHeal(ability)) matches.push(`${row.card_id}:${ability.id}`);
  }
  assert.deepEqual(matches, ['grove-myceliarch:networked-growth']);
});

test('Device resolution has one existing server-owned current-turn truth source and the selected-heal family only reads it', () => {
  assert.ok(tactic.includes('if (effect.source_subtype === "Device") state.turn_flags[String(effect.owner_seat)].device_turn = Number(state.turn_seq || 0);'));
  assert.ok(owner.includes('Number(own?.device_turn ?? -1) === currentTurn(state)'));
  assert.equal(owner.includes('.device_turn ='), false, 'selected-heal owner must not write Device-resolution authority');
  assert.equal(activeLive.includes('.device_turn ='), false, 'live facade must not write Device-resolution authority');
  assert.ok(match.includes('Number(flags.device_turn??-1)===Number(s.turn_seq||0)'));
});

test('selected-heal resolution emits canonical ability heal packets and exposes only packet ids in its result', () => {
  assert.ok(owner.includes('const packetContext: RuntimeV02HealPacketContext = {'));
  assert.ok(owner.includes('action_kind: "ability"'));
  assert.ok(owner.includes('action_id: choice.ability_id'));
  assert.ok(owner.includes('const resolved = applyRuntimeV02HealPacket('));
  assert.ok(owner.includes('emitted_packet_ids: resolved.packet ? [resolved.packet.id] : []'));
  assert.equal(owner.includes('runtimeV02BeginAttackHealListenerContinuation'), false, 'pure selected-heal owner must not pretend to own live listener continuation');
  assert.equal(owner.includes('runtimeV02BeginAbilityHealListenerContinuation'), false, 'pure selected-heal owner must not become live Ability orchestration');
});

test('live match owner routes Reward and selected-heal active Abilities through one generic facade', () => {
  const useAbility = blockBetween(match, 'if(action==="use_ability")', 'if(action==="play_creature")');
  const resolveAbility = blockBetween(match, 'if(action==="resolve_ability_choice")', 'if(action==="take_reward")');
  assert.ok(match.includes('tcg-match-active-ability-live-v0-2.ts'));
  assert.ok(useAbility.includes('runtimeV02CreateActiveAbilityLiveChoice('));
  assert.ok(useAbility.includes('runtimeV02PendingActiveAbilityLiveChoiceView('));
  assert.ok(resolveAbility.includes('runtimeV02ResolveActiveAbilityLiveChoice('));
  assert.ok(resolveAbility.includes('resolved.kind==="heal_one_damaged_friendly_creature"'));
  assert.ok(resolveAbility.includes('runtimeV02BeginAbilityHealListenerContinuation('));
  assert.ok(resolveAbility.includes('reward_inspected_count:resolved.reward_inspected_count'));
  assert.ok(activeLive.includes('structuredRuntimeActiveAbilityRewardInspection('));
  assert.ok(activeLive.includes('runtimeV02CreateActiveAbilityRewardChoice('));
  assert.ok(activeLive.includes('structuredRuntimeActiveAbilitySelectedHeal('));
  assert.ok(activeLive.includes('runtimeV02BuildActiveAbilitySelectedHealChoice('));
  assert.equal(match.includes('tcg-match-active-ability-selected-heal-v0-2.ts'), false, 'match owner must orchestrate through the facade rather than semantic internals');
  assert.equal(match.includes('structuredRuntimeActiveAbilitySelectedHeal'), false, 'match owner must not parse selected-heal Ability metadata itself');
  assert.equal(match.includes('runtimeV02BuildActiveAbilitySelectedHealChoice'), false, 'match owner must not become a second selected-heal choice owner');
  assert.ok(match.includes('active_ability_requires_runtime_owner'));
});

test('Networked Growth stays on its existing Ability facade while Mycelial Bloom uses a separate exact attack-only gate', () => {
  assert.ok(match.includes('ad?.id==="grove-myceliarch"&&slot===2&&structuredDiscardRecycleChoice==null'));
  assert.equal(match.includes('ad?.id==="grove-myceliarch"&&(slot!==2||structuredDiscardRecycleChoice==null)'), false, 'Mycelial Bloom gate must not block plain Colony Pulse');
  assert.ok(match.includes('attack_effect_requires_pending_choice_engine'));
  assert.equal(owner.includes('SELECT_CARDS'), false);
  assert.equal(owner.includes('MOVE_CARDS'), false);
  assert.equal(activeLive.includes('SELECT_CARDS'), false);
  assert.equal(activeLive.includes('MOVE_CARDS'), false);
});
