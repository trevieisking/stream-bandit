import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(
  'supabase/functions/tcg-match-actions/index.ts',
  'utf8',
);

function actionBlock(name, nextName) {
  const startToken = `if(action==="${name}"){`;
  const endToken = `if(action==="${nextName}"){`;
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  assert.ok(start >= 0, `${name} action block missing`);
  assert.ok(end > start, `${name} action block end missing`);
  return source.slice(start, end);
}

test('play_realm delegates specialist Realm mutation to Realm Route', () => {
  const block = actionBlock('play_realm', 'withdraw');

  assert.ok(source.includes(
    'import { runtimeV02BeginRealmPlayRoute } from "../_shared/tcg-match-realm-route-v0-2.ts";',
  ));
  assert.equal(
    (block.match(/runtimeV02BeginRealmPlayRoute\(/g) || []).length,
    1,
    'play_realm must enter Realm Route exactly once',
  );
  assert.ok(block.includes(
    'runtimeV02BeginRealmPlayRoute(s,seat as 1|2,inst,"play_realm",{phase:"play",action_kind:"realm"})',
  ));

  assert.ok(block.includes('error:"realm_card_required"'));
  assert.ok(block.includes('message==="tcg_v0_2_realm_already_played_this_turn"'));
  assert.ok(block.includes('error:"realm_already_played_this_turn"'));
  assert.ok(block.includes('message==="tcg_v0_2_realm_same_named_replacement_forbidden"'));
  assert.ok(block.includes('error:"same_named_realm_cannot_replace_itself"'));

  for (const forbidden of [
    'owner.discard.push(',
    'removeHand(',
    's.realm=',
    's.realm =',
    'flags.realm_turn=',
    'flags.realm_turn =',
    '.hand.splice(',
  ]) {
    assert.equal(
      block.includes(forbidden),
      false,
      `play_realm regained Realm mutation authority: ${forbidden}`,
    );
  }
});

test('play_realm uses the existing Event to Movement to Heal continuation owners', () => {
  const block = actionBlock('play_realm', 'withdraw');

  const route = block.indexOf('runtimeV02BeginRealmPlayRoute(');
  const eventChoice = block.indexOf('setEventResume("play_realm",seat)');
  const movement = block.indexOf('runtimeV02BeginMovementListenerContinuation(');
  const movementChoice = block.indexOf('setMovementResume("play_realm",seat,eventFlow.emitted_heal_packet_ids)');
  const heal = block.indexOf('runtimeV02BeginMovementHealListenerContinuation(');
  const defeatScan = block.indexOf('scanDefeats()');

  assert.ok(route >= 0);
  assert.ok(eventChoice > route);
  assert.ok(movement > route);
  assert.ok(movementChoice > movement);
  assert.ok(heal > movementChoice);
  assert.ok(defeatScan > heal);

  assert.ok(block.includes('commit("play_realm_pending_event_listener_choice"'));
  assert.ok(block.includes('commit("play_realm_pending_movement_listener_choice"'));
  assert.ok(block.includes('commit("play_realm_pending_heal_listener_choice"'));
  assert.ok(block.includes('commit("play_realm"'));
});

test('play_realm is a first-class Event and Movement resume kind', () => {
  const eventResumeStart = source.indexOf('const setEventResume=');
  const eventResumeEnd = source.indexOf('const setMovementResume=', eventResumeStart);
  const movementResumeEnd = source.indexOf('if(action==="concede")', eventResumeEnd);
  assert.ok(eventResumeStart >= 0 && eventResumeEnd > eventResumeStart);
  assert.ok(movementResumeEnd > eventResumeEnd);

  const eventResume = source.slice(eventResumeStart, eventResumeEnd);
  const movementResume = source.slice(eventResumeEnd, movementResumeEnd);

  assert.ok(eventResume.includes('"play_realm"'));
  assert.ok(eventResume.includes('kind!=="play_realm"'));
  assert.ok(movementResume.includes('"play_realm"'));
  assert.ok(movementResume.includes('kind!=="play_realm"'));

  assert.ok(
    source.includes('if(resume.kind!=="attack"){'),
    'all validated non-attack movement resumes must use Movement Heal then return to play',
  );
});
