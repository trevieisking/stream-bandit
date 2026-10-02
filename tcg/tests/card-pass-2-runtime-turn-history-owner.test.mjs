import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const history=fs.readFileSync('supabase/functions/_shared/tcg-match-turn-history-v0-2.ts','utf8');
const flow=fs.readFileSync('supabase/functions/_shared/tcg-match-flow-engine-v0-2.ts','utf8');
const turn=fs.readFileSync('supabase/functions/_shared/tcg-match-flow-turn-v0-2.ts','utf8');

test('Match Flow owns turn-history writes at every ordinary turn start',()=>{
  assert.match(flow,/runtimeV02RecordTurnOwner\(state, 1, firstPlayerSeat\)/);
  assert.match(turn,/runtimeV02RecordTurnOwner\(state, nextTurn, nextSeat\)/);
  const occurrences=[...turn.matchAll(/runtimeV02RecordTurnOwner\(state, nextTurn, nextSeat\)/g)].length;
  assert.equal(occurrences,2,'normal and deckout turn starts must both record ownership');
});

test('previous opponent turn is resolved from ownership history, never currentTurn minus one',()=>{
  assert.match(history,/export function runtimeV02PreviousOpponentTurn/);
  assert.match(history,/record\.active_seat !== controller/);
  assert.doesNotMatch(history,/currentTurn\s*-\s*1/);
  assert.doesNotMatch(history,/turn_seq\s*-\s*1/);
});

test('explicit turn history is append-only and extra-turn capable',()=>{
  assert.match(history,/tcg_v0_2_turn_history_owner_conflict/);
  assert.match(history,/tcg_v0_2_turn_history_append_only/);
  assert.match(history,/turn_owner_history/);
  assert.match(history,/Explicit history is authoritative and supports extra turns/);
});

test('legacy states have a bounded alternating fallback until explicit history exists',()=>{
  assert.match(history,/legacyAlternatingHistory/);
  assert.match(history,/first_player_seat/);
  assert.match(history,/states predate structured Timefold support/);
});
