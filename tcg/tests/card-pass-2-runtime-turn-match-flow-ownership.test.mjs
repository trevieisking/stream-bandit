import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchActions = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const turnFlow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-turn-v0-2.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('ordinary turn progression is owned by Match Flow while Card-Zone owns the draw transfer', () => {
  assert.ok(matchActions.includes('import { runtimeV02AdvanceTurn } from "../_shared/tcg-match-flow-turn-v0-2.ts";'));

  const advance = slice(matchActions, 'const advanceTurn=', 'const aftermath=');
  assert.ok(advance.includes('runtimeV02AdvanceTurn(s,(plan)=>{'));
  assert.equal(advance.includes('s.active_seat='), false, 'dispatcher still owns active-seat rotation');
  assert.equal(advance.includes('s.turn_seq='), false, 'dispatcher still owns turn sequence');
  assert.equal(advance.includes('s.personal_turns='), false, 'dispatcher still owns personal-turn counters');
  assert.equal(advance.includes('s.deckout_loser='), false, 'dispatcher still owns deckout timing');

  assert.ok(advance.includes('runtimeV02ApplyCardZoneTransfer(np.deck,np.hand'));
  assert.ok(advance.includes('source_action_id:plan.source_action_id'));
  assert.ok(advance.includes('controller_seat:plan.controller_seat'));
  assert.ok(advance.includes('card_uids:[plan.card_uid]'));

  assert.ok(turnFlow.includes('export function runtimeV02AdvanceTurn'));
  assert.ok(turnFlow.includes('state.active_seat = nextSeat;'));
  assert.ok(turnFlow.includes('state.turn_seq = nextTurn;'));
  assert.ok(turnFlow.includes('personalTurns[String(nextSeat)] = nextPersonalTurn;'));
  assert.ok(turnFlow.includes('state.deckout_loser = nextSeat;'));
  assert.ok(turnFlow.includes('state.log.push(`Seat ${nextSeat} begins personal turn ${nextPersonalTurn}.`);'));
});
