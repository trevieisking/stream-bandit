import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const owner = fs.readFileSync(
  'supabase/functions/_shared/tcg-match-realm-engine-v0-2.ts',
  'utf8',
);

const dispatcher = fs.readFileSync(
  'supabase/functions/tcg-match-actions/index.ts',
  'utf8',
);

test('Realm Engine family #18 owns shared-slot mutation without absorbing other systems', () => {
  assert.ok(owner.includes('export function runtimeV02ApplyRealmPlayTransaction'));
  assert.ok(owner.includes('schema: "sb-tcg-realm-transaction-v0.2"'));
  assert.ok(owner.includes('event_name: previous ? "realm_replaced" : null'));
  assert.ok(owner.includes('previousDiscard.push(previous.card)'));
  assert.ok(owner.includes('state.realm = nextRealm'));
  assert.ok(owner.includes('flags.realm_turn = turn'));
  assert.ok(owner.includes('tcg_v0_2_realm_same_named_replacement_forbidden'));
  assert.ok(owner.includes('tcg_v0_2_realm_already_played_this_turn'));

  for (const forbidden of [
    'runtimeV02ApplyCardZoneTransfer',
    'runtimeV02BeginEventListenerContinuation',
    'applyRuntimeV02HealPacket',
    'runtimeV02ApplyEssenceAttachmentTransaction',
    'runtimeV02ApplyWithdrawalPaymentAndSwitch',
    'runtimeV02Shuffle',
    'deckout_loser',
    'Nightmaw',
    'Moonlit Reef',
    'moonlit-reef',
    'tide-moonlit-reef',
    'Dread Crush',
  ]) {
    assert.equal(
      owner.includes(forbidden),
      false,
      `Realm Engine absorbed forbidden authority or card-specific routing: ${forbidden}`,
    );
  }
});

test('Realm Engine preserves specialist Realm boundary and event handoff only', () => {
  assert.ok(owner.includes('previous_controller_seat'));
  assert.ok(owner.includes('previous_card_uid'));
  assert.ok(owner.includes('previous_card_id'));
  assert.ok(owner.includes('incoming_card_uid'));
  assert.ok(owner.includes('incoming_card_id'));
  assert.ok(owner.includes('source_action_id'));
  assert.ok(owner.includes('event_name: "realm_replaced" | null'));
  assert.equal(owner.includes('effect_events'), false);
  assert.equal(owner.includes('pending_event_listener_choice'), false);
  assert.equal(owner.includes('tactic.program'), false);
  assert.equal(owner.includes('definition_v0_2'), false);
});

test('Realm Engine foundation is not yet wired into the dispatcher', () => {
  assert.equal(
    dispatcher.includes('tcg-match-realm-engine-v0-2.ts'),
    false,
    'foundation step must remain unwired until its own exact-head gates pass',
  );
});
