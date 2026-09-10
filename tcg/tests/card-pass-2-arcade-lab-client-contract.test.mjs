import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const lab = fs.readFileSync('t.html', 'utf8');
const setup = fs.readFileSync('supabase/functions/tcg-private-alpha-api/index.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const tactic = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Arcade Lab keeps one explicit setup, match and tactic Edge owner', () => {
  assert.ok(lab.includes("const API_SETUP='tcg-private-alpha-api'"));
  assert.ok(lab.includes("const API_MATCH='tcg-match-actions'"));
  assert.ok(lab.includes("const API_TACTIC='tcg-tactic-actions'"));
  for (const action of ['choose_starter', 'matchmake', 'create_room', 'join_room', 'set_ready', 'match_view', 'opening_choice', 'setup_place', 'setup_ready']) {
    assert.ok(setup.includes(`action===\"${action}\"`) || setup.includes(`action === \"${action}\"`) || setup.includes(`action === '${action}'`) || setup.includes(`action==='${action}'`), `setup server missing ${action}`);
  }
  assert.ok(tactic.includes('["play_tactic", "resolve_choice"].includes(action)'));
  assert.ok(tactic.includes('if (action === "play_tactic")'));
});

test('Arcade Lab recognizes every live pending-choice family', () => {
  const router = slice(lab, 'function pendingChoiceDescriptor', 'function chooseTarget');
  for (const field of [
    'pending_attack_choice',
    'pending_ability_choice',
    'pending_event_listener_choice',
    'pending_movement_listener_choice',
    'pending_heal_listener_choice',
    'pending_choice',
  ]) {
    assert.ok(router.includes(field), `choice router missing ${field}`);
  }
  for (const action of [
    'resolve_attack_choice',
    'resolve_ability_choice',
    'resolve_event_listener_choice',
    'resolve_movement_listener_choice',
    'resolve_heal_listener_choice',
  ]) {
    assert.ok(router.includes(action), `choice router missing ${action}`);
    assert.ok(match.includes(`action===\"${action}\"`) || match.includes(`action === \"${action}\"`), `match server missing ${action}`);
  }
  assert.ok(router.includes("v.phase==='effect_resolution'?'tactic':'match'"), 'movement/heal choices must preserve tactic ownership during effect resolution');
  assert.ok(router.includes("v.phase==='effect_resolution'?'resolve_choice'"), 'tactic-owned listener choices must return through tactic resolve_choice');
});

test('Arcade Lab exposes active abilities from structured metadata without card IDs', () => {
  const helper = slice(lab, 'function structuredActiveAbility', 'function viewState');
  assert.ok(helper.includes("ability.mode==='active'"));
  assert.equal(/card_id|\.id\s*===|\.id===/.test(helper), false, 'active ability client routing must not depend on a card ID');
  const controls = slice(lab, 'function renderBattleActions', 'function renderChoice');
  assert.ok(controls.includes('structuredActiveAbility'));
  assert.ok(controls.includes("battleAction('use_ability'"));
  assert.ok(match.includes('action==="use_ability"') || match.includes('action === "use_ability"'));
});

test('one generic choice panel dispatches to the route selected by the server-owned state', () => {
  const render = slice(lab, 'function renderChoice', 'function renderRewardResolution');
  assert.ok(render.includes('pendingChoiceDescriptor(v)'));
  assert.ok(render.includes("route.owner==='tactic'"));
  assert.ok(render.includes('tacticAction(route.action'));
  assert.ok(render.includes('battleAction(route.action'));
  assert.equal(render.includes("if(attackPending)"), false, 'legacy two-family choice split must be removed');
});
