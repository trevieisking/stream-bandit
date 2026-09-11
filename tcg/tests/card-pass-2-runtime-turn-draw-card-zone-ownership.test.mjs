import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('automatic turn-start draw keeps deckout in turn flow and delegates physical deck-to-hand movement to Card-Zone', () => {
  const block = slice(match, 'const advanceTurn=()=>{', 'const aftermath=');

  const deckout = block.indexOf('if(!np.deck?.length){s.deckout_loser=next;evaluateWinner();return}');
  const transfer = block.indexOf('runtimeV02ApplyCardZoneTransfer(np.deck,np.hand');
  const log = block.indexOf('log(`Seat ${next} begins personal turn');

  assert.ok(deckout >= 0, 'turn flow must retain the empty-deck deckout rule');
  assert.ok(transfer > deckout, 'deckout must be evaluated before any draw mutation');
  assert.ok(log > transfer, 'turn-start log must remain after the successful draw');

  assert.ok(block.includes('const drawUid=String(np.deck[0]?.uid||"")'));
  assert.ok(block.includes('cause:"rule"'));
  assert.ok(block.includes('action_kind:"turn"'));
  assert.ok(block.includes('source_action_id:"turn_start_draw"'));
  assert.ok(block.includes('source_card_uid:null'));
  assert.ok(block.includes('source:{controller_seat:next as 1|2,zone:"deck",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:next as 1|2,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('card_uids:[drawUid]'));
  assert.ok(block.includes('destination_position:"bottom"'));

  assert.equal(block.includes('np.hand.push('), false, 'turn flow must not directly push drawn cards into hand');
  assert.equal(block.includes('np.deck.shift('), false, 'turn flow must not directly remove the top deck card');
});
