import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const movement = fs.readFileSync('supabase/functions/_shared/tcg-match-movement-listener-v0-2.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Movement Listener keeps DRAW semantics while Card-Zone owns deck-to-hand movement', () => {
  assert.ok(movement.includes('import { runtimeV02ApplyCardZoneTransfer } from "./tcg-match-card-zone-engine-v0-2.ts";'));
  const block = functionSlice(movement, 'if (op === "DRAW") {', 'if (op === "CHOOSE_HAND_TO_DISCARD")');

  assert.ok(block.includes('const drawCount = Math.min(count, player.deck.length)'));
  assert.ok(block.includes('if (drawCount > 0)'));
  assert.ok(block.includes('const cardUids = (player.deck as Inst[]).slice(0, drawCount).map((card) => card.uid)'));
  assert.equal(block.split('runtimeV02ApplyCardZoneTransfer(').length - 1, 1);
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: candidate.kind'));
  assert.ok(block.includes('source_action_id: `listener:${listenerId(candidate)}`'));
  assert.ok(block.includes('source_card_uid: candidate.source.uid'));
  assert.ok(block.includes('source: { controller_seat: seat, zone: "deck", owner_card_uid: null }'));
  assert.ok(block.includes('destination: { controller_seat: seat, zone: "hand", owner_card_uid: null }'));
  assert.ok(block.includes('card_uids: cardUids'));
  assert.ok(block.includes('destination_position: "bottom"'));
  assert.ok(block.indexOf('if (drawCount > 0)') < block.indexOf('runtimeV02ApplyCardZoneTransfer('));

  for (const forbidden of [
    '(player.hand as Inst[]).push(',
    '(player.deck as Inst[]).splice(',
    'player.deck.shift(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Movement Listener regained DRAW mutation authority: ${forbidden}`);
  }
});

test('Movement Listener validates discard choice while Card-Zone owns one atomic hand-to-discard transfer', () => {
  const block = functionSlice(
    movement,
    'if (pendingChoice.kind === "discard_from_hand") {',
    'else if (pendingChoice.kind === "order_deck_top")',
  );

  assert.ok(block.includes('const selectedUids = selected.map((option) => {'));
  assert.ok(block.includes('(player.hand as Inst[]).some((card) => card.uid === uid)'));
  assert.ok(block.includes('tcg_v0_2_movement_listener_choice_hand_stale'));
  assert.ok(block.includes('if (selectedUids.length > 0)'));
  assert.equal(block.split('runtimeV02ApplyCardZoneTransfer(').length - 1, 1);
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: candidate.kind'));
  assert.ok(block.includes('source_action_id: `listener:${listenerId(candidate)}`'));
  assert.ok(block.includes('source_card_uid: candidate.source.uid'));
  assert.ok(block.includes('source: { controller_seat: seat, zone: "hand", owner_card_uid: null }'));
  assert.ok(block.includes('destination: { controller_seat: seat, zone: "discard", owner_card_uid: null }'));
  assert.ok(block.includes('card_uids: selectedUids'));
  assert.ok(block.includes('destination_position: "bottom"'));
  assert.ok(block.indexOf('const selectedUids = selected.map') < block.indexOf('runtimeV02ApplyCardZoneTransfer('));

  for (const forbidden of [
    '(player.discard as Inst[]).push(',
    '(player.hand as Inst[]).splice(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Movement Listener regained discard mutation authority: ${forbidden}`);
  }
});

test('deck-top ordering remains outside the bounded Movement-to-Card-Zone transfer slice', () => {
  assert.ok(movement.includes('else if (pendingChoice.kind === "order_deck_top")'));
  assert.ok(movement.includes('(player.deck as Inst[]).splice(0, expected.length, ...ordered)'));
});
