import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('supabase/functions/_shared/tcg-match-heal-listener-choice-v0-2.ts', 'utf8');

test('private heal-listener choice uses canonical continuation, packet and registry owners', () => {
  assert.ok(source.includes('continueRuntimeV02AfterHealPackets'));
  assert.ok(source.includes('runtimeV02CurrentTurnHealPackets'));
  assert.ok(source.includes('runtimeV02Definition'));
  assert.ok(source.includes('state.pending_heal_listener_choice'));
});

test('opponent view is waiting-only while chooser receives explicit private options', () => {
  assert.ok(source.includes('waiting: true'));
  assert.ok(source.includes('options: pending.options.map'));
  assert.ok(source.includes('stage: pending.stage'));
  assert.ok(source.includes('crypto.randomUUID()'));
});

test('owned optional shape is exact DRAW 1 then private discard 1 and remains card-id-free', () => {
  for (const token of ['OPTIONAL', 'DRAW', 'CHOOSE_HAND_TO_DISCARD', '$event_controller']) {
    assert.ok(source.includes(token), `missing exact optional-shape token ${token}`);
  }
  assert.ok(source.includes('Number(draw.count) !== 1'));
  assert.ok(source.includes('Number(discard.count) !== 1'));
  for (const cardId of ['tide-moonlit-reef', 'tide-shellip', 'grove-symbiote-essence', 'tide-tideroar']) {
    assert.equal(source.includes(cardId), false, `generic private-choice owner contains card-specific authority: ${cardId}`);
  }
});

test('decline marks packet receipt without consuming the turn limit; completed accept consumes both', () => {
  assert.ok(source.includes('markReceipt(located, packet);'));
  assert.ok(source.includes('consumeLimit(located, packet);'));
  const declineBlock = source.slice(source.indexOf('if (decision === "decline")'), source.indexOf('if (decision !== "accept")'));
  assert.ok(declineBlock.includes('markReceipt(located, packet);'));
  assert.equal(declineBlock.includes('consumeLimit(located, packet);'), false, 'decline must not consume once-per-turn use');
});

test('accept and discard are separated by a fresh stale-choice fence and exact hand UID revalidation', () => {
  assert.ok(source.includes('stage: "discard_from_hand"'));
  assert.ok(source.includes('id: crypto.randomUUID()'));
  assert.ok(source.includes('tcg_v0_2_heal_choice_stale_id'));
  assert.ok(source.includes('tcg_v0_2_heal_choice_selected_hand_card_missing'));
  assert.ok(source.includes('player.hand.findIndex'));
});

test('choice completion resumes only the preserved canonical packet queue', () => {
  assert.ok(source.includes('resume(state, pending.remaining_packet_ids)'));
  assert.ok(source.includes('runtimeV02InstallHealListenerChoice'));
  assert.equal(source.includes('dispatchRuntimeV02AfterHealPacket'), false, 'choice owner must resume through the continuation owner, not bypass it');
});
