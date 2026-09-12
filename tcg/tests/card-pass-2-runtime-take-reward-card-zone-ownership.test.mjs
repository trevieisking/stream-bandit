import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('take_reward keeps Reward legality while Card-Zone owns Rewards-to-Hand movement', () => {
  const block = functionSlice(match, 'if(action==="take_reward")', 'if(action==="promote")');

  const legalityAt = block.indexOf('exact_legal_reward_positions_required');
  const orderAt = block.indexOf('const orderedPositions=[...posRaw].sort((a:number,b:number)=>a-b);');
  const uidAt = block.indexOf('const rewardUids=orderedPositions.map((i:number)=>String(p.rewards[i]?.uid||""));');
  const transferAt = block.indexOf('runtimeV02ApplyCardZoneTransfer(');
  const queueAt = block.indexOf('queue().shift()');
  const continueAt = block.indexOf('continueResolution()');

  assert.ok(legalityAt >= 0, 'Reward legality check must remain in Match');
  assert.ok(orderAt > legalityAt, 'Reward ordering must be derived only after legality is established');
  assert.ok(uidAt > orderAt, 'Reward UIDs must preserve ascending original Reward position order');
  assert.ok(transferAt > uidAt, 'Card-Zone transfer must occur only after the exact Reward UID list is frozen');
  assert.ok(queueAt > transferAt && continueAt > queueAt, 'resolution queue and continuation must remain Match-owned after movement');

  assert.ok(block.includes('if(count>0)'));
  assert.ok(block.includes('cause:"rule"'));
  assert.ok(block.includes('action_kind:"reward"'));
  assert.ok(block.includes('source_action_id:"take_reward"'));
  assert.ok(block.includes('source_card_uid:null'));
  assert.ok(block.includes('source:{controller_seat:seat as 1|2,zone:"rewards",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:seat as 1|2,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('card_uids:rewardUids'));
  assert.ok(block.includes('destination_position:"bottom"'));

  for (const forbidden of [
    'p.rewards.splice(',
    'p.hand.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `take_reward regained Card-Zone mutation authority: ${forbidden}`);
  }
});
