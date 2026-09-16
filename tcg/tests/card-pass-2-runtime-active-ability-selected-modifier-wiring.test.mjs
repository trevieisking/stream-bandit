import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const ownerPath = 'supabase/functions/_shared/tcg-match-active-ability-selected-modifier-v0-2.ts';
const livePath = 'supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts';
const attackPath = 'supabase/functions/_shared/tcg-match-attack-modifier-v0-2.ts';
const protectionPath = 'supabase/functions/_shared/tcg-match-damage-protection-v0-2.ts';
const matchPath = 'supabase/functions/tcg-match-actions/index.ts';
const owner = fs.readFileSync(path.join(root, ownerPath), 'utf8');
const live = fs.readFileSync(path.join(root, livePath), 'utf8');
const attack = fs.readFileSync(path.join(root, attackPath), 'utf8');
const protection = fs.readFileSync(path.join(root, protectionPath), 'utf8');
const match = fs.readFileSync(path.join(root, matchPath), 'utf8');

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function exactLimit(value) {
  return JSON.stringify(value) === JSON.stringify({ scope: 'turn', count: 1, owner: 'controller' });
}

function exactTarget(select) {
  if (!select || select.op !== 'SELECT_CREATURE' || select.controller !== 'self' || select.zone !== 'field' || Number(select.count) !== 1) return null;
  if (typeof select.as !== 'string' || !select.as) return null;
  const filters = object(select.filters);
  if (!filters || typeof filters.element !== 'string' || !filters.element) return null;
  if (Object.hasOwn(filters, 'damaged') && filters.damaged !== true) return null;
  if (Object.hasOwn(filters, 'exclude_source') && filters.exclude_source !== true) return null;
  if (!Object.keys(filters).every((key) => ['element', 'damaged', 'exclude_source'].includes(key))) return null;
  return {
    variable: select.as,
    element: filters.element,
    damaged: Object.hasOwn(filters, 'damaged') ? true : null,
    exclude_source: Object.hasOwn(filters, 'exclude_source'),
  };
}

function exactRequirement(requirements, target) {
  if (!object(requirements) || !Array.isArray(requirements.all) || requirements.all.length !== 1) return false;
  const legal = object(requirements.all[0]);
  if (!legal || legal.predicate !== 'legal_card_available' || legal.controller !== 'self' || legal.zone !== 'field') return false;
  const filters = object(legal.filters);
  if (!filters || filters.card_family !== 'Creature' || filters.element !== target.element) return false;
  const damaged = Object.hasOwn(filters, 'damaged') ? filters.damaged : null;
  const excludeSource = Object.hasOwn(filters, 'exclude_source') ? filters.exclude_source : false;
  return damaged === target.damaged && excludeSource === target.exclude_source &&
    Object.keys(filters).every((key) => ['card_family', 'element', 'damaged', 'exclude_source'].includes(key));
}

function exactOutgoing(step, variable) {
  const duration = object(step?.duration);
  if (!step || step.op !== 'ADD_ATTACK_DAMAGE_MODIFIER' || step.target !== `$${variable}` || !(Number(step.amount) > 0)) return false;
  return !!duration && JSON.stringify(duration.expires_on) === JSON.stringify(['end_of_turn']) &&
    Number(duration.max_uses) === 1 && duration.consume_on === 'legal_attack_declared';
}

function exactIncoming(step, variable) {
  const duration = object(step?.duration);
  const filters = object(step?.filters);
  if (!step || step.op !== 'ADD_INCOMING_ATTACK_DAMAGE_MODIFIER' || step.target !== `$${variable}` || !(Number(step.amount) < 0)) return false;
  return !!filters && filters.source_controller === 'opponent' &&
    !!duration && JSON.stringify(duration.expires_on) === JSON.stringify(['opponent_next_turn_end']) &&
    Number(duration.max_uses) === 1 && duration.consume_on === 'successful_prevention' &&
    Number(step.minimum_prevention_to_consume) === 1;
}

function matchesSelectedModifier(ability) {
  if (!ability || ability.mode !== 'active' || ability.event !== null || ability.timing !== 'own_turn') return false;
  if (!exactLimit(ability.limit) || !Array.isArray(ability.costs) || ability.costs.length !== 0) return false;
  if (!Array.isArray(ability.steps) || ability.steps.length !== 2) return false;
  const target = exactTarget(ability.steps[0]);
  if (!target || !exactRequirement(ability.requirements, target)) return false;
  return exactOutgoing(ability.steps[1], target.variable) || exactIncoming(ability.steps[1], target.variable);
}

test('frozen Set One has exactly the two selected-modifier active Ability programs', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    const ability = row.definition?.creature?.ability;
    if (matchesSelectedModifier(ability)) matches.push(`${row.card_id}:${ability.id}`);
  }
  assert.deepEqual(matches.sort(), [
    'ember-pyrohorn-ash-crown:ash-crown',
    'stone-crowncrag-mountain-warden:mountain-warden',
  ]);
});

test('selected-modifier owner is card-id-free and delegates mutation to the two canonical owners', () => {
  for (const token of [
    'ember-pyrohorn-ash-crown',
    'Pyrohorn',
    'ash-crown',
    'stone-crowncrag-mountain-warden',
    'Crowncrag',
    'mountain-warden',
  ]) {
    assert.equal(owner.includes(token), false, `selected modifier owner contains card-specific authority: ${token}`);
    assert.equal(live.includes(token), false, `active Ability facade contains card-specific authority: ${token}`);
  }
  assert.ok(owner.includes('runtimeV02InstallAttackDamageModifier('));
  assert.ok(owner.includes('runtimeV02InstallDamageProtection('));
  assert.ok(attack.includes('export function runtimeV02InstallAttackDamageModifier('));
  assert.ok(protection.includes('export function runtimeV02InstallDamageProtection('));
  assert.equal(owner.includes('runtime_v0_2_attack_modifiers'), false, 'Ability owner must not write Attack #14 storage directly');
  assert.equal(owner.includes('runtime_v0_2_damage_protections'), false, 'Ability owner must not write Damage Protection storage directly');
});

test('one live Active-Ability facade owns selected-modifier preflight, receipt, viewer and resolution', () => {
  for (const token of [
    'structuredRuntimeActiveAbilitySelectedModifier(',
    'runtimeV02BuildActiveAbilitySelectedModifierChoice(',
    'runtimeV02RecordActiveAbilityUse(',
    'runtimeV02PendingActiveAbilitySelectedModifierChoiceView(',
    'runtimeV02ResolveActiveAbilitySelectedModifierChoice(',
  ]) assert.ok(live.includes(token), `missing selected-modifier live facade token: ${token}`);
  assert.ok(live.includes('choice.kind === "modify_one_friendly_creature"'));
});

test('Match Actions remains orchestration-only for the selected-modifier family', () => {
  const useStart = match.indexOf('if(action==="use_ability")');
  const useEnd = match.indexOf('if(action==="play_creature")', useStart);
  const useBlock = match.slice(useStart, useEnd);
  assert.ok(useBlock.includes('runtimeV02BeginActiveAbilityLiveRoute('));
  assert.ok(useBlock.includes('runtimeV02PendingActiveAbilityLiveChoiceView('));
  assert.equal(useBlock.includes('runtimeV02InstallAttackDamageModifier'), false);
  assert.equal(useBlock.includes('runtimeV02InstallDamageProtection'), false);

  const resolveStart = match.indexOf('if(action==="resolve_ability_choice")');
  const resolveEnd = match.indexOf('if(action==="take_reward")', resolveStart);
  const resolveBlock = match.slice(resolveStart, resolveEnd);
  assert.ok(resolveBlock.includes('resolved.kind==="modify_one_friendly_creature"'));
  assert.ok(resolveBlock.includes('modifier_kind:resolved.modifier_kind'));
  assert.ok(resolveBlock.includes('target_creature_uid:resolved.target_creature_uid'));
  assert.equal(resolveBlock.includes('runtimeV02InstallAttackDamageModifier'), false);
  assert.equal(resolveBlock.includes('runtimeV02InstallDamageProtection'), false);
});
