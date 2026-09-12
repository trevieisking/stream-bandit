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

test('setup distribution keeps setup timing/counts while delegating both Reward deals and opening draw to one Card-Zone atomic batch', () => {
  assert.ok(setup.includes('runtimeV02ApplyCardZoneTransferBatch'));
  const block = slice(setup, 'if(action==="setup_ready")', 'return json({ok:false,version:VERSION,error:"unknown_action"},400);');

  assert.ok(block.includes('if(p1.deck.length<6||p2.deck.length<6)return json({ok:false,version:VERSION,error:"deck_depleted_before_rewards"},400)'));
  assert.ok(block.includes('if(ap.deck.length<7)return json({ok:false,version:VERSION,error:"deck_depleted_before_start_draw"},400)'));
  assert.ok(block.includes('const rewardOne=p1.deck.slice(0,6).map((x:Inst)=>x.uid)'));
  assert.ok(block.includes('rewardTwo=p2.deck.slice(0,6).map((x:Inst)=>x.uid)'));
  assert.ok(block.includes('drawUid=String(ap.deck[6]?.uid||"")'));
  assert.ok(block.includes('runtimeV02ApplyCardZoneTransferBatch(['));
  assert.ok(block.includes('source_action_id:"setup_rewards"'));
  assert.ok(block.includes('destination:{controller_seat:1,zone:"rewards",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:2,zone:"rewards",owner_card_uid:null}'));
  assert.ok(block.includes('source_action_id:"setup_start_draw"'));
  assert.ok(block.includes('destination:{controller_seat:activeSeat,zone:"hand",owner_card_uid:null}'));

  assert.equal(block.includes('pp.rewards=pp.deck.splice(0,6)'), false, 'Setup must not directly own Reward transfer mutation');
  assert.equal(block.includes('ap.hand.push(ap.deck.shift())'), false, 'Setup must not directly own opening draw mutation');
});
