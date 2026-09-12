import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const setup = fs.readFileSync('supabase/functions/tcg-private-alpha-api/index.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('opening hand and failed mulligan keep setup rules while delegating movement to Card-Zone and shuffle to Randomization', () => {
  const block = slice(setup, 'function opening(', 'function publicField');

  assert.ok(block.includes('function opening(deck0:Inst[],meta:Record<string,any>,seat:1|2)'));
  assert.ok(block.includes('const hand:Inst[]=[]'));
  assert.ok(block.includes('const openingUids=deck.slice(0,7).map((x:Inst)=>x.uid)'));
  assert.ok(block.includes('source_action_id:"opening_hand_deal"'));
  assert.ok(block.includes('source:{controller_seat:seat,zone:"deck",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:seat,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('card_uids:openingUids'));

  assert.ok(block.includes('if(hand.some(i=>starterLegal(meta[i.card_id])))return{deck,hand,mulligans}'));
  assert.ok(block.includes('mulligans++'));
  assert.ok(block.includes('const mulliganUids=hand.map((x:Inst)=>x.uid)'));
  assert.ok(block.includes('source_action_id:"opening_hand_mulligan_return"'));
  assert.ok(block.includes('source:{controller_seat:seat,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:seat,zone:"deck",owner_card_uid:null}'));
  assert.ok(block.includes('card_uids:mulliganUids'));
  assert.ok(block.includes('deck=runtimeV02ShuffledCopy(deck)'));

  assert.equal((block.match(/runtimeV02ApplyCardZoneTransferBatch/g) || []).length, 2);
  assert.equal(block.includes('deck.splice(0,7)'), false, 'Setup must not directly remove the opening hand from deck');
  assert.equal(block.includes('[...deck,...hand]'), false, 'Setup must not directly rebuild deck from a failed hand');
  assert.ok(setup.includes('opening(full,cardIndex,p.seat as 1|2)'));
});
