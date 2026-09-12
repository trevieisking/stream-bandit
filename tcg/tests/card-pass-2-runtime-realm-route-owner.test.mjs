import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync(
  'supabase/functions/_shared/tcg-match-realm-route-v0-2.ts',
  'utf8',
);

test('Realm Route sequences existing owners without becoming a new mutation owner', () => {
  assert.ok(route.includes('runtimeV02ApplyRealmPlayTransaction'));
  assert.ok(route.includes('runtimeV02CreateRealmReplacedEvent'));
  assert.ok(route.includes('runtimeV02BeginEventListenerContinuation'));
  assert.ok(route.includes('transaction.receipt.event_name !== "realm_replaced"'));
  assert.ok(route.includes('replacement_event: null'));
  assert.ok(route.includes('flow: completeEventFlow()'));
  assert.ok(route.includes('replacement_event: replacementEvent'));
  assert.ok(route.includes('flow,'));

  for (const forbidden of [
    'state.realm =',
    '.hand.splice(',
    '.discard.push(',
    'runtimeV02ApplyCardZoneTransfer(',
    'runtimeV02BeginMovementListenerContinuation(',
    'runtimeV02BeginMovementHealListenerContinuation(',
    'runtimeV02BeginAttackHealListenerContinuation(',
    'applyRuntimeV02HealPacket(',
    'runtimeV02ApplyEssenceAttachmentTransaction(',
    'runtimeV02ApplyWithdrawalPaymentAndSwitch(',
    'runtimeV02UniformRandomInt(',
    'Moonlit Reef',
    'Nightmaw',
    'tide-',
    'gale-',
    'shade-',
    'stone-',
    'grove-',
    'volt-',
    'ember-',
    'astral-',
  ]) {
    assert.equal(
      route.includes(forbidden),
      false,
      `Realm Route absorbed forbidden authority or card-specific routing: ${forbidden}`,
    );
  }
});

test('Realm Route validates orchestration metadata before invoking Realm Engine', () => {
  const phaseValidation = route.indexOf('const phase = requiredString(');
  const actionKindValidation = route.indexOf('const actionKind = requiredString(');
  const actionIdValidation = route.indexOf('const actionId = requiredString(');
  const transaction = route.indexOf('const transaction = runtimeV02ApplyRealmPlayTransaction');
  const event = route.indexOf('const replacementEvent = runtimeV02CreateRealmReplacedEvent');
  const listener = route.indexOf('const flow = runtimeV02BeginEventListenerContinuation');

  assert.ok(phaseValidation >= 0);
  assert.ok(actionKindValidation > phaseValidation);
  assert.ok(actionIdValidation > actionKindValidation);
  assert.ok(transaction > actionIdValidation);
  assert.ok(event > transaction);
  assert.ok(listener > event);
});
