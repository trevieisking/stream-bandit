import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const tacticSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('tactic hidden-information operations write only canonical view metadata', () => {
  assert.ok(
    tacticSource.includes('import { recordRuntimeV02HiddenInformationView } from "../_shared/tcg-match-hidden-information-v0-2.ts";'),
    'hidden-information recorder import missing',
  );
  assert.ok(
    tacticSource.includes('if (count > 0) recordRuntimeV02HiddenInformationView(state, seat as 1 | 2, "deck_top");'),
    'LOOK_TOP must record a deck_top view only when at least one card was viewed',
  );
  assert.ok(
    tacticSource.includes('recordRuntimeV02HiddenInformationView(state, seat as 1 | 2, "deck");'),
    'SEARCH_DECK must record a deck view',
  );
});

test('match attack path consumes current-turn hidden-information metadata as self events', () => {
  assert.ok(
    matchSource.includes('import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";'),
    'hidden-information reader import missing',
  );
  assert.ok(
    matchSource.includes('runtimeV02CurrentTurnHiddenInformationViews(s,seat as 1|2).map((entry)=>({event:"hidden_information_viewed" as const,controller:"self" as const,zone:entry.zone}))'),
    'current-turn hidden-information views must be projected into structured attack events',
  );
  assert.ok(
    matchSource.includes('current_turn_events:[...(Number(flags.device_turn??-1)===Number(s.turn_seq||0)?[{event:"device_resolved" as const,controller:"self" as const}]:[]),...hiddenInformationEvents]'),
    'Device and hidden-information events must share the structured current-turn event input',
  );
  assert.ok(
    matchSource.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at your deck this turn")&&Number(flags.looked_deck_turn??-1)===Number(s.turn_seq||0))bonus+=20'),
    'legacy deck-view bonus must remain only as fallback when structured authority is unavailable',
  );
});

test('private hidden-information ledger is never serialized into either player view', () => {
  const matchView = functionSlice(matchSource, 'function makeView', 'function views');
  const tacticView = functionSlice(tacticSource, 'function makeView', 'function views');
  for (const [name, source] of [['match', matchView], ['tactic', tacticView]]) {
    assert.equal(source.includes('runtime_hidden_information_views_v0_2'), false, `${name} view leaked ledger key`);
    assert.equal(source.includes('runtimeV02CurrentTurnHiddenInformationViews'), false, `${name} view leaked ledger reader`);
    assert.equal(source.includes('recordRuntimeV02HiddenInformationView'), false, `${name} view leaked ledger writer`);
  }
});
