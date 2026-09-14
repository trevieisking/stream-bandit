import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const turnFlow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-turn-v0-2.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('automatic turn-start draw keeps lifecycle in Match Flow while Card-Zone owns physical deck-to-hand movement', () => {
  assert.ok(match.includes('import { runtimeV02AdvanceTurn } from "../_shared/tcg-match-flow-turn-v0-2.ts";'));

  const block = slice(match, 'const advanceTurn=', 'const aftermath=');
  assert.ok(block.includes('runtimeV02AdvanceTurn(s,(plan)=>{'));
  assert.equal(block.includes('s.active_seat='), false, 'dispatcher must not own active-seat rotation');
  assert.equal(block.includes('s.turn_seq='), false, 'dispatcher must not own turn sequence');
  assert.equal(block.includes('s.personal_turns='), false, 'dispatcher must not own personal-turn counters');
  assert.equal(block.includes('s.deckout_loser='), false, 'dispatcher must not own deckout timing');

  assert.ok(block.includes('runtimeV02ApplyCardZoneTransfer(np.deck,np.hand'));
  assert.ok(block.includes('cause:"rule"'));
  assert.ok(block.includes('action_kind:"turn"'));
  assert.ok(block.includes('source_action_id:plan.source_action_id'));
  assert.ok(block.includes('source_card_uid:null'));
  assert.ok(block.includes('source:{controller_seat:plan.controller_seat,zone:"deck",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:plan.controller_seat,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('card_uids:[plan.card_uid]'));
  assert.ok(block.includes('destination_position:"bottom"'));
  assert.equal(block.includes('np.hand.push('), false, 'dispatcher must not directly push drawn cards into hand');
  assert.equal(block.includes('np.deck.shift('), false, 'dispatcher must not directly remove the top deck card');

  const deckout = turnFlow.indexOf('if (nextPlayer.deck.length === 0) {');
  const draw = turnFlow.indexOf('draw(plan);');
  const log = turnFlow.indexOf('state.log.push(`Seat ${nextSeat} begins personal turn ${nextPersonalTurn}.`);');
  assert.ok(deckout >= 0, 'Match Flow must retain the empty-deck deckout rule');
  assert.ok(draw > deckout, 'deckout must be evaluated before the draw callback');
  assert.ok(log > draw, 'turn-start log must remain after a successful Card-Zone draw');
  assert.ok(turnFlow.includes('state.active_seat = nextSeat;'));
  assert.ok(turnFlow.includes('state.turn_seq = nextTurn;'));
  assert.ok(turnFlow.includes('personalTurns[String(nextSeat)] = nextPersonalTurn;'));
  assert.ok(turnFlow.includes('state.deckout_loser = nextSeat;'));
});
