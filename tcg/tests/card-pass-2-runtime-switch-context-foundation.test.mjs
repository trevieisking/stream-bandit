import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-switch-context-v0-2.ts'), 'utf8');
const paymentOwner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-payment-v0-2.ts'), 'utf8');
const withdrawalTransaction = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-withdrawal-transaction-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const amendment = fs.readFileSync(path.join(root, 'tcg-card-pass-2-schema-amendment-h.md'), 'utf8');
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'tcg-runtime-capabilities-v0.2.json'), 'utf8'));

function findCard(registry, cardId) {
  return registry.definitions.find((entry) => entry.card_id === cardId)?.definition || null;
}

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `missing source block: ${start}`);
  return source.slice(from, to);
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
  assert.ok(owner.includes('switch:${turn}:${nextSequence}'));
  assert.ok(owner.includes('export function runtimeV02PreflightAtomicSwitch('));
  assert.ok(owner.includes('const preflight = runtimeV02PreflightAtomicSwitch(state, controllerSeatRaw, reserveIndex, input)'));
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

test('frozen Gale tactics prove 79c needs self, opponent, repeated and counterpart-bound effect switches', () => {
  const registry = buildSetOneRegistry(root);
  const cyclone = findCard(registry, 'gale-cyclone-route');
  const featherstep = findCard(registry, 'gale-featherstep');
  const sera = findCard(registry, 'gale-pilot-sera');
  assert.ok(cyclone && featherstep && sera, 'missing frozen Gale tactic switch definitions');

  const cycloneSteps = cyclone.tactic?.program?.steps || [];
  assert.equal(cycloneSteps[1]?.op, 'SWITCH_WITH_VANGUARD');
  assert.equal(cycloneSteps[1]?.player, 'self');
  assert.equal(cycloneSteps[1]?.action_kind, 'effect_switch');
  const opponentOptional = cycloneSteps[2]?.then?.[0];
  assert.equal(opponentOptional?.op, 'OPTIONAL');
  assert.equal(opponentOptional?.steps?.[0]?.op, 'PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE');
  assert.equal(opponentOptional?.steps?.[0]?.player, 'opponent');
  assert.equal(opponentOptional?.steps?.[1]?.op, 'SWITCH_WITH_VANGUARD');
  assert.equal(opponentOptional?.steps?.[1]?.player, 'opponent');
  assert.equal(opponentOptional?.steps?.[1]?.action_kind, 'effect_switch');

  const featherSteps = featherstep.tactic?.program?.steps || [];
  assert.equal(featherSteps[1]?.op, 'SWITCH_WITH_VANGUARD');
  assert.equal(featherSteps[1]?.action_kind, 'effect_switch');
  assert.equal(featherSteps[2]?.target, '$switch_incoming_vanguard');

  const seraRepeat = sera.tactic?.program?.steps?.[0];
  assert.equal(seraRepeat?.op, 'REPEAT_OPTIONAL');
  assert.equal(seraRepeat?.max, 2);
  assert.equal(seraRepeat?.steps?.[1]?.op, 'SWITCH_WITH_VANGUARD');
  assert.equal(seraRepeat?.steps?.[1]?.action_kind, 'effect_switch');
});

test('79b match and 79c tactic paths share atomic switch events while preserving one tactic cursor and private choices', () => {
  assert.equal(match.includes('tcg-match-switch-context-v0-2.ts'), true, '79b match wiring must use the shared atomic switch owner');
  assert.equal(tactic.includes('tcg-match-switch-context-v0-2.ts'), true, '79c tactic wiring must use the same shared atomic switch owner');
  assert.equal(tactic.includes('tcg-match-movement-listener-v0-2.ts'), true, '79c tactic wiring must use the shared movement listener continuation');
  assert.ok(match.includes('runtimeV02ApplyWithdrawalPaymentAndSwitch(s,seat as 1|2,idx,p.vanguard.essence,p.discard,uids,cost)'), 'voluntary withdrawal must use the accepted Payment + Atomic Switch transaction');
  assert.ok(match.includes('runtimeV02ApplyAtomicSwitch(s,seat,switchIndex,{action_kind:"attack"'), 'post-attack switch must use the atomic switch owner');
  assert.equal(match.includes('function switchWithReserve('), false, 'old direct match swap helper must not remain as a competing owner');
  assert.equal(tactic.includes('function switchWithVanguard('), false, '79c must remove the competing direct tactic swap helper');
  assert.equal(match.includes('gale-aeralith-storm-shepherd'), false, 'Aeralith must not require a new card-specific switch branch');
  assert.ok(match.includes('if(wantsSwitch&&body.switch_reserve_index!=null)'), 'attack switch remains optional when the frozen effect says it is optional');
  assert.ok(match.includes('runtimeV02BeginMovementListenerContinuation(s,switched.events)'), 'match atomic switch events must enter the generic movement listener continuation');

  const switchStart = tactic.indexOf('if (op === "SWITCH_WITH_VANGUARD")');
  const switchEnd = tactic.indexOf('if (op === "CHOOSE_PLAYER")', switchStart);
  const switchBlock = tactic.slice(switchStart, switchEnd);
  assert.ok(switchStart >= 0 && switchEnd > switchStart, '79c tactic switch block missing');
  assert.ok(switchBlock.includes('playerSeat(ownerSeat, step.player || "self", vars)'), 'tactic switch must resolve self/opponent controller from structured data');
  assert.ok(switchBlock.includes('runtimeV02ApplyAtomicSwitch(state, controllerSeat, Number(found.index), {'), 'tactic switch must call the atomic owner');
  assert.ok(switchBlock.includes('action_kind: "effect_switch"'), 'tactic switches must be canonical effect_switch actions');
  assert.ok(switchBlock.includes('source_action_id: effect.id'), 'switch context must retain the exact tactic effect action identity');
  assert.ok(switchBlock.includes('source_card_uid: effect.source_card.uid'), 'switch context must retain the exact source card instance');
  assert.ok(switchBlock.includes('vars.switch_outgoing_vanguard = outgoingRef'));
  assert.ok(switchBlock.includes('vars.switch_incoming_vanguard = incomingRef'));
  const cursorAdvance = switchBlock.indexOf('effect.cursor++');
  const movementBegin = switchBlock.indexOf('runtimeV02BeginMovementListenerContinuation(state, switched.events)');
  assert.ok(cursorAdvance >= 0 && movementBegin > cursorAdvance, 'tactic cursor must advance before movement listeners can pause, preventing switch replay');
  assert.ok(switchBlock.includes('setTacticMovementResume(state, effect)'), 'movement choice must preserve the same tactic effect resume owner');
  assert.ok(tactic.includes('runtimeV02ResolveMovementListenerChoice(state, seat as 1 | 2'), 'resolve_choice must resume the shared movement continuation');
  assert.ok(tactic.includes('tcg_v0_2_tactic_effect_switch_movement_heal_resume_not_yet_supported'), 'future movement-heal widening must fail closed until its separate handoff is implemented');

  const matchView = match.slice(match.indexOf('function makeView('), match.indexOf('function views('));
  const tacticView = tactic.slice(tactic.indexOf('function makeView('), tactic.indexOf('function views('));
  assert.equal(matchView.includes('runtime_v0_2_switch_ledger'), false, 'private switch ledger must never enter match player views');
  assert.equal(tacticView.includes('runtime_v0_2_switch_ledger'), false, 'private switch ledger must never enter tactic player views');
  assert.ok(tacticView.includes('runtimeV02PendingMovementListenerChoiceView'), 'tactic view must expose only the seat-filtered movement choice');
  assert.ok(tacticView.includes('runtimeV02PrivateMovementInspectionView'), 'tactic view must expose only the seat-filtered movement inspection');
});

test('Withdrawal dispatcher cannot regain attached-Essence payment or direct switch authority', () => {
  assert.ok(match.includes('import { runtimeV02ApplyWithdrawalPaymentAndSwitch } from "../_shared/tcg-match-withdrawal-transaction-v0-2.ts";'));
  const block = functionSlice(
    match,
    '  if(action==="withdraw"){',
    '  if(action==="end_turn"){',
  );

  assert.ok(block.includes('runtimeV02ApplyWithdrawalPaymentAndSwitch('));
  assert.ok(block.includes('const switched=transaction.switched'));
  assert.ok(block.includes('message==="tcg_v0_2_payment_exact_amount_required"'));
  assert.ok(block.includes('error:"exact_withdrawal_essence_payment_required",cost'));
  assert.ok(block.includes('message.startsWith("tcg_v0_2_payment_source_missing:")'));
  assert.ok(block.includes('error:"withdrawal_payment_not_attached"'));
  assert.ok(block.includes('runtimeV02BeginMovementListenerContinuation(s,switched.events)'));
  assert.ok(block.includes('runtimeV02BeginMovementHealListenerContinuation(s,movementFlow.emitted_heal_packet_ids'));

  for (const forbidden of [
    'new Set(uids)',
    'p.vanguard.essence.some(',
    'p.vanguard.essence.findIndex(',
    'p.vanguard.essence.splice(',
    'p.discard.push(p.vanguard.essence',
    'runtimeV02ApplyAtomicSwitch(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Withdrawal dispatcher regained owner authority: ${forbidden}`);
  }

  const switchPreflightAt = withdrawalTransaction.indexOf('runtimeV02PreflightAtomicSwitch(');
  const paymentPreflightAt = withdrawalTransaction.indexOf('runtimeV02ValidateAttachedEssencePayment(');
  const paymentApplyAt = withdrawalTransaction.indexOf('runtimeV02ApplyAttachedEssencePayment(');
  const switchApplyAt = withdrawalTransaction.indexOf('runtimeV02ApplyAtomicSwitch(');
  assert.ok(switchPreflightAt >= 0 && paymentPreflightAt > switchPreflightAt);
  assert.ok(paymentApplyAt > paymentPreflightAt && switchApplyAt > paymentApplyAt);
  assert.ok(paymentOwner.includes('const [essence] = sourceEssence.splice(index, 1)'));
  assert.ok(paymentOwner.includes('discard.push(essence)'));
  assert.equal(withdrawalTransaction.includes('sourceEssence.splice('), false);
  assert.equal(withdrawalTransaction.includes('discard.push('), false);
});

test('switch foundation does not falsely claim listener or full runtime parity', () => {
  assert.ok(capabilities.operations.missing.includes('OPTIONAL'));
  assert.ok(capabilities.operations.missing.includes('APPLY_CONDITION'));
  assert.equal(capabilities.completion.runtime_interpreter_parity, false);
  assert.equal(capabilities.completion.zero_card_specific_runtime_branches, false);
  assert.ok(amendment.includes('One atomic switch, two movement events'));
  assert.ok(amendment.includes('Both events created by the same switch carry the same `switch_id`'));
});
