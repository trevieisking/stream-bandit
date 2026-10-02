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

test('tactic hidden-information operations preserve history while writing source-only trigger provenance', () => {
  assert.ok(
    tacticSource.includes('recordRuntimeV02HiddenInformationView,') &&
      tacticSource.includes('runtimeV02TakeHiddenInformationOccurrences,') &&
      tacticSource.includes('from "../_shared/tcg-match-hidden-information-v0-2.ts";'),
    'hidden-information recorder/occurrence imports missing',
  );
  const lookBlock = functionSlice(
    tacticSource,
    'if (op === "LOOK_TOP") {',
    'if (op === "SELECT_CARDS") {',
  );
  assert.ok(lookBlock.includes('recordRuntimeV02HiddenInformationView('));
  assert.ok(lookBlock.includes('"deck_top"'));
  assert.ok(lookBlock.includes('action_kind: "tactic"'));
  assert.ok(lookBlock.includes('source_controller_seat: ownerSeat as 1 | 2'));
  assert.ok(lookBlock.includes('source_action_id: effect.id'));
  assert.ok(lookBlock.includes('source_card_uid: effect.source_card.uid'));
  assert.ok(lookBlock.includes('source_creature_uid: null'));

  const searchBlock = functionSlice(
    tacticSource,
    'if (op === "SEARCH_DECK") {',
    'if (op === "SEARCH_DECK_GROUP") {',
  );
  assert.ok(searchBlock.includes('recordRuntimeV02HiddenInformationView('));
  assert.ok(searchBlock.includes('"deck"'));
  assert.ok(searchBlock.includes('action_kind: "tactic"'));
  assert.ok(searchBlock.includes('source_controller_seat: ownerSeat as 1 | 2'));
  assert.ok(searchBlock.includes('source_action_id: effect.id'));
  assert.ok(searchBlock.includes('source_card_uid: effect.source_card.uid'));
  assert.ok(searchBlock.includes('source_creature_uid: null'));
  assert.ok(
    searchBlock.includes('drainTacticHiddenInformationEvents(state, effect);'),
    'hidden listeners must be drained before the source SEARCH_DECK choice is returned',
  );
});

test('match preserves current-turn hidden history and drains occurrence events through Event Listener ownership', () => {
  assert.ok(
    matchSource.includes('runtimeV02CurrentTurnHiddenInformationViews,') &&
      matchSource.includes('runtimeV02TakeHiddenInformationOccurrences,') &&
      matchSource.includes('from "../_shared/tcg-match-hidden-information-v0-2.ts";'),
    'hidden-information history/occurrence imports missing',
  );
  assert.ok(
    matchSource.includes('runtimeV02CurrentTurnHiddenInformationViews(s,seat as 1|2).map((entry)=>({event:"hidden_information_viewed" as const,controller:"self" as const,zone:entry.zone}))'),
    'current-turn hidden-information views must remain available to structured attack history',
  );
  assert.ok(
    matchSource.includes('runtimeV02AdaptHiddenInformationOccurrencesForListener'),
    'hidden-information occurrences must adapt into canonical Event Listener events',
  );
  assert.ok(
    matchSource.includes('const drainHiddenInformationEvents=()=>'),
    'Match hidden-information drain coordinator missing',
  );
  assert.ok(
    matchSource.includes('const commit=async(eventType:string,payload:any)=>{drainHiddenInformationEvents();'),
    'Match must drain hidden occurrences before persisted presentation/view commit',
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
    assert.equal(source.includes('runtime_hidden_information_occurrences_v0_2'), false, `${name} view leaked occurrence queue key`);
    assert.equal(source.includes('pending_hidden_information_resume'), false, `${name} view leaked hidden resume receipt`);
    assert.equal(source.includes('runtimeV02CurrentTurnHiddenInformationViews'), false, `${name} view leaked ledger reader`);
    assert.equal(source.includes('runtimeV02TakeHiddenInformationOccurrences'), false, `${name} view leaked occurrence queue reader`);
    assert.equal(source.includes('recordRuntimeV02HiddenInformationView'), false, `${name} view leaked ledger writer`);
  }
});
