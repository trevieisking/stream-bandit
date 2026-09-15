import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const setup = fs.readFileSync('supabase/functions/tcg-private-alpha-api/index.ts', 'utf8');
const flow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-engine-v0-2.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('setup readiness is owned by Match Flow while one Card-Zone atomic batch owns both Reward deals and opening draw', () => {
  assert.ok(setup.includes('runtimeV02ApplySetupReady'));
  assert.ok(setup.includes('runtimeV02ApplyCardZoneTransferBatch'));
  assert.ok(flow.includes('export function runtimeV02ApplySetupReady'));
  assert.equal(flow.includes('runtimeV02ApplyCardZoneTransferBatch'), false, 'Match Flow must not become a physical Card-Zone owner');

  const block = slice(setup, 'if(action==="setup_ready")', 'return json({ok:false,version:VERSION,error:"unknown_action"},400);');

  assert.ok(block.includes('runtimeV02ApplySetupReady(state,seat as 1|2,(plan)=>{'));
  assert.ok(block.includes('const rewardOne=p1.deck.slice(0,plan.reward_count_each).map((x:Inst)=>x.uid)'));
  assert.ok(block.includes('rewardTwo=p2.deck.slice(0,plan.reward_count_each).map((x:Inst)=>x.uid)'));
  assert.ok(block.includes('drawUid=String(ap.deck[plan.reward_count_each]?.uid||"")'));
  assert.ok(block.includes('runtimeV02ApplyCardZoneTransferBatch(['));
  assert.ok(block.includes('source_action_id:"setup_rewards"'));
  assert.ok(block.includes('destination:{controller_seat:1,zone:"rewards",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:2,zone:"rewards",owner_card_uid:null}'));
  assert.ok(block.includes('source_action_id:"setup_start_draw"'));
  assert.ok(block.includes('destination:{controller_seat:activeSeat,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('all_ready:transition.all_ready'));

  assert.equal(block.includes('if(p1.deck.length<6||p2.deck.length<6)'), false, 'Dispatcher must not duplicate Match Flow reward-count preconditions');
  assert.equal(block.includes('if(ap.deck.length<7)'), false, 'Dispatcher must not duplicate Match Flow opening-draw preconditions');
  assert.equal(block.includes('state.setup_ready[String(seat)]=true'), false, 'Dispatcher must not own setup readiness mutation');
  assert.equal(block.includes('state.phase="play"'), false, 'Dispatcher must not own setup-to-play transition');
  assert.equal(block.includes('state.setup_turn_seat=2'), false, 'Dispatcher must not own setup order mutation');
  assert.equal(block.includes('state.active_seat=activeSeat'), false, 'Dispatcher must not own active-seat transition');
  assert.equal(block.includes('state.turn_seq=1'), false, 'Dispatcher must not own turn sequence start');
  assert.equal(block.includes('state.personal_turns[String(state.active_seat)]=1'), false, 'Dispatcher must not own personal-turn lifecycle');

  assert.equal(block.includes('pp.rewards=pp.deck.splice(0,6)'), false, 'Setup must not directly own Reward transfer mutation');
  assert.equal(block.includes('ap.hand.push(ap.deck.shift())'), false, 'Setup must not directly own opening draw mutation');
});
