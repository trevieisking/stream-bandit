import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const owner = fs.readFileSync(
  'supabase/functions/_shared/tcg-match-realm-replaced-event-v0-2.ts',
  'utf8',
);

test('Realm replacement event owner is context-only and card-id-free', () => {
  assert.ok(owner.includes('export function runtimeV02CreateRealmReplacedEvent'));
  assert.ok(owner.includes('event: "realm_replaced"'));
  assert.ok(owner.includes('previous_controller_seat'));
  assert.ok(owner.includes('previous_card_uid'));
  assert.ok(owner.includes('previous_card_id'));
  assert.ok(owner.includes('incoming_controller_seat'));
  assert.ok(owner.includes('incoming_card_uid'));
  assert.ok(owner.includes('incoming_card_id'));
  assert.ok(owner.includes('origin_zone: "realm"'));
  assert.ok(owner.includes('destination_zone: "realm"'));
  assert.ok(owner.includes('event_count: 1'));
  assert.ok(owner.includes('assertCurrentRealm'));
  assert.ok(owner.includes('assertPreviousRealmDiscarded'));

  for (const forbidden of [
    'runtimeV02ApplyRealmPlayTransaction(',
    'runtimeV02BeginEventListenerContinuation(',
    'runtimeV02ApplyCardZoneTransfer(',
    'applyRuntimeV02HealPacket(',
    'runtimeV02ApplyEssenceAttachmentTransaction(',
    'runtimeV02ApplyWithdrawalPaymentAndSwitch(',
    'state.realm =',
    '.hand.splice(',
    'discard.push(',
    'Moonlit Reef',
    'moonlit-reef',
    'tide-moonlit-reef',
    'Nightmaw',
  ]) {
    assert.equal(
      owner.includes(forbidden),
      false,
      `Realm replacement event owner absorbed forbidden authority or card-specific routing: ${forbidden}`,
    );
  }
});

test('Realm replacement event owner binds accepted Realm receipt to deterministic listener context', () => {
  assert.ok(
    owner.includes(
      'import type { RuntimeV02RealmPlayReceipt } from "./tcg-match-realm-engine-v0-2.ts"',
    ),
  );
  assert.ok(owner.includes('receipt.schema !== "sb-tcg-realm-transaction-v0.2"'));
  assert.ok(owner.includes('receipt.event_name !== "realm_replaced"'));
  assert.ok(owner.includes('receipt.turn_seq !== turn'));
  assert.ok(owner.includes('incoming.uid === previous.uid'));
  assert.ok(owner.includes('incoming.card_id === previous.card_id'));
  assert.ok(owner.includes('"realm-replaced"'));
  assert.ok(owner.includes('source_action_id: sourceActionId'));
  assert.ok(owner.includes('source_card_uid: incoming.uid'));
  assert.ok(owner.includes('turn_seq: turn'));
  assert.ok(owner.includes('events.push(structuredClone(event)'));
});
