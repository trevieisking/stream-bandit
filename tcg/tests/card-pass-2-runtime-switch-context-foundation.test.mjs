import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-switch-context-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const amendment = fs.readFileSync(path.join(root, 'tcg-card-pass-2-schema-amendment-h.md'), 'utf8');
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'tcg-runtime-capabilities-v0.2.json'), 'utf8'));

function findCard(registry, cardId) {
  return registry.definitions.find((entry) => entry.card_id === cardId)?.definition || null;
}

test('atomic switch context owner is card-id-free and records the exact shared Amendment H switch identity', () => {
  for (const forbidden of [
    'gale-aeralith-storm-shepherd',
    'eye-of-the-storm',
    'Aeralith',
    'Eye of the Storm',
    'Driftlet',
    'Skyweaver',
    'Tempestalon',
    'Jetstream Essence',
  ]) {
    assert.equal(owner.includes(forbidden), false, `generic switch owner contains card/name authority: ${forbidden}`);
  }
  for (const required of [
    'switch_id',
    'controller_seat',
    'outgoing_vanguard_uid',
    'incoming_vanguard_uid',
    'source_action_id',
    'source_card_uid',
    'action_kind',
    'turn_seq',
    'moved_to_reserve',
    'became_vanguard',
  ]) {
    assert.ok(owner.includes(required), `switch owner missing ${required}`);
    assert.ok(amendment.includes(required), `Amendment H no longer requires ${required}`);
  }
  assert.ok(owner.includes('switch:${turn}:${sequence}'));
  assert.ok(owner.includes('runtime_v0_2_switch_ledger'));
});

test('foundation performs one atomic swap only after complete validation and preserves existing condition-clear semantics', () => {
  const validateSeat = owner.indexOf('const controllerSeat = normalizedSeat(controllerSeatRaw)');
  const validateIncoming = owner.indexOf('const incoming = creature(reserve[reserveIndex]');
  const createLedger = owner.indexOf('const ledger = ensureLedger(state, turn)');
  const mutateVanguard = owner.indexOf('player.vanguard = incoming');
  const appendContext = owner.indexOf('ledger.contexts.push(context)');
  assert.ok(validateSeat >= 0 && validateIncoming > validateSeat);
  assert.ok(createLedger > validateIncoming, 'ledger must not be created before switch inputs are fully validated');
  assert.ok(mutateVanguard > createLedger, 'battlefield mutation must follow complete validation');
  assert.ok(appendContext > mutateVanguard, 'canonical context is appended only after the atomic swap');
  assert.ok(owner.includes('clearOrdinaryConditions(outgoing)'));
  assert.ok(owner.includes('clearOrdinaryConditions(incoming)'));
  assert.ok(owner.includes('incoming.became_vanguard_turn = turn'));
});

test('frozen Gale data proves Aeralith cannot safely bypass the shared switch-event prerequisite', () => {
  const registry = buildSetOneRegistry(root);
  const aeralith = findCard(registry, 'gale-aeralith-storm-shepherd');
  assert.ok(aeralith, 'missing frozen Aeralith definition');
  const attacks = aeralith.creature?.attacks || [];
  assert.equal(attacks[0]?.id, 'shepherd-wind');
  assert.equal(attacks[0]?.base_damage, 80);
  assert.deepEqual(attacks[0]?.after_damage, []);
  assert.equal(attacks[1]?.id, 'eye-of-the-storm');
  assert.equal(attacks[1]?.base_damage, 140);
  assert.equal(attacks[1]?.after_damage?.[0]?.op, 'OPTIONAL');
  assert.equal(attacks[1]?.after_damage?.[0]?.steps?.[1]?.op, 'SWITCH_WITH_VANGUARD');
  assert.equal(attacks[1]?.after_damage?.[0]?.steps?.[1]?.action_kind, 'attack');
  assert.equal(attacks[1]?.after_attack_finished?.[0]?.op, 'APPLY_CONDITION');
  assert.equal(attacks[1]?.after_attack_finished?.[0]?.target, '$current_opponent_vanguard');

  const becameVanguardSources = [];
  for (const row of registry.definitions) {
    const definition = row.definition || {};
    if (definition.element !== 'Gale') continue;
    if (definition.creature?.ability?.event === 'became_vanguard') becameVanguardSources.push(row.card_id);
    for (const listener of definition.essence?.listeners || []) {
      if (listener?.event === 'became_vanguard') becameVanguardSources.push(row.card_id);
    }
  }
  for (const required of ['gale-driftlet', 'gale-skyweaver', 'gale-tempestalon', 'gale-jetstream-essence']) {
    assert.ok(becameVanguardSources.includes(required), `expected Gale switch listener missing: ${required}`);
  }
});

test('79b wires atomic switch events into the live match owner while preserving private state and separate tactic ownership', () => {
  assert.equal(match.includes('tcg-match-switch-context-v0-2.ts'), true, '79b match wiring must use the shared atomic switch owner');
  assert.equal(tactic.includes('tcg-match-switch-context-v0-2.ts'), false, 'tactic switch ownership remains outside this bounded 79b match tick');
  assert.ok(match.includes('runtimeV02ApplyAtomicSwitch(s,seat,idx,{action_kind:"voluntary_withdrawal"'), 'voluntary withdrawal must use the atomic switch owner');
  assert.ok(match.includes('runtimeV02ApplyAtomicSwitch(s,seat,switchIndex,{action_kind:"attack"'), 'post-attack switch must use the atomic switch owner');
  assert.equal(match.includes('function switchWithReserve('), false, 'old direct match swap helper must not remain as a competing owner');
  assert.ok(tactic.includes('function switchWithVanguard('), 'tactic switch helper remains a separate later-runtime owner in this tick');
  assert.equal(match.includes('gale-aeralith-storm-shepherd'), false, 'Aeralith must not require a new card-specific switch branch');
  assert.ok(match.includes('if(wantsSwitch&&body.switch_reserve_index!=null)'), 'attack switch remains optional when the frozen effect says it is optional');
  assert.ok(match.includes('runtimeV02BeginMovementListenerContinuation(s,switched.events)'), 'atomic switch events must enter the generic movement listener continuation');

  const matchView = match.slice(match.indexOf('function makeView('), match.indexOf('function views('));
  assert.equal(matchView.includes('runtime_v0_2_switch_ledger'), false, 'private switch ledger must never enter match player views');
  assert.equal(tactic.includes('runtime_v0_2_switch_ledger'), false, 'tactic surface must not serialize the private ledger');
});

test('switch foundation does not falsely claim listener or full runtime parity', () => {
  assert.ok(capabilities.operations.missing.includes('OPTIONAL'));
  assert.ok(capabilities.operations.missing.includes('APPLY_CONDITION'));
  assert.equal(capabilities.completion.runtime_interpreter_parity, false);
  assert.equal(capabilities.completion.zero_card_specific_runtime_branches, false);
  assert.ok(amendment.includes('One atomic switch, two movement events'));
  assert.ok(amendment.includes('Both events created by the same switch carry the same `switch_id`'));
});
