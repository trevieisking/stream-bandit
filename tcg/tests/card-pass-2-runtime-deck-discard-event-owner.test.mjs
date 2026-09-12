import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const owner = fs.readFileSync(
  'supabase/functions/_shared/tcg-match-deck-discard-event-v0-2.ts',
  'utf8',
);

test('Deck-Discard Event owner records context only and never moves cards or resolves listeners', () => {
  assert.ok(owner.includes('export function runtimeV02CreateDeckCardsDiscardedEvent'));
  assert.ok(owner.includes('event: "deck_cards_discarded"'));
  assert.ok(owner.includes('source_controller_seat'));
  assert.ok(owner.includes('controller_seat: discardedControllerSeat'));
  assert.ok(owner.includes('origin_zone: "deck"'));
  assert.ok(owner.includes('destination_zone: "discard"'));
  assert.ok(owner.includes('discarded_card_uids'));
  assert.ok(owner.includes('event_count: discardedCardUids.length'));
  assert.ok(owner.includes('state.effect_events'));

  for (const forbidden of [
    'Nightmaw',
    'nightmaw',
    'dread-hunger',
    'Dread Hunger',
    'dread-crush',
    'Dread Crush',
    'runtimeV02ApplyCardZoneTransfer',
    'runtimeV02BeginEventListenerContinuation',
    'applyRuntimeV02HealPacket',
    'deckout_loser',
    'deck_bottom',
    'runtimeV02Shuffle',
    '.shift(',
    '.splice(',
    '.push(...',
  ]) {
    assert.equal(owner.includes(forbidden), false, `Deck-Discard Event owner absorbed forbidden authority: ${forbidden}`);
  }
});

test('Deck-Discard Event owner distinguishes affected controller from source controller', () => {
  assert.ok(owner.includes('discarded_controller_seat'));
  assert.ok(owner.includes('source_controller_seat'));
  assert.ok(owner.includes('controller_seat: discardedControllerSeat'));
  assert.ok(owner.includes('source_controller_seat: sourceControllerSeat'));
  assert.ok(owner.includes('source_action_id: sourceActionId'));
  assert.ok(owner.includes('source_card_uid: sourceCard.uid'));
});
