import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-table-v2-4-7.css'), 'utf8');

test('selected hand cards ask the live Tactic owner for playability without browser subtype rules', () => {
  assert.match(controller, /const API_TACTIC = 'tcg-tactic-actions'/);
  assert.match(controller, /actionBase\('play_tactic_legality'\)/);
  assert.match(controller, /projected\.eligible === true/);
  assert.doesNotMatch(controller, /tactic_subtype_uses_dedicated_owner/);
  assert.doesNotMatch(controller, /first_player_cannot_play_ally_on_first_turn/);
  assert.doesNotMatch(controller, /tactic_play_requirement_not_met/);
  assert.doesNotMatch(controller, /required_tactic_target_unavailable/);
  assert.doesNotMatch(controller, /required_tactic_resource_unavailable/);
  assert.doesNotMatch(controller, /subtype\s*===?\s*['"](Ally|Device|Realm|Relic)['"]/);
});

test('server eligibility exposes Play Tactic as an action on the selected hand card', () => {
  const start = controller.indexOf('function renderYourHand');
  const end = controller.indexOf('function renderPhaseControls', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /state\.tacticProjectionUid === uid && state\.tacticEligible/);
  assert.match(branch, /intent: 'play_tactic'/);
  assert.match(branch, /label: 'Play Tactic'/);
  assert.match(branch, /actions: tacticAction/);
});

test('Play Tactic commits through the existing Tactic owner and refreshes authoritative state', () => {
  const start = controller.indexOf('async function runTacticIntent');
  const end = controller.indexOf('async function runTacticChoiceIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /callEdge\(API_TACTIC/);
  assert.match(branch, /actionBase\('play_tactic'\)/);
  assert.match(branch, /card_uid: cardUid/);
  assert.match(branch, /await refreshMatch\(\)/);
});

test('generic Tactic choice panel consumes only the authoritative choice-view schema', () => {
  const helperStart = controller.indexOf('function tacticPendingChoice');
  const helperEnd = controller.indexOf('function attackSlots', helperStart);
  const helper = controller.slice(helperStart, helperEnd);
  assert.match(helper, /view\.pending_choice/);
  assert.match(helper, /view\.phase === 'effect_resolution' && view\.pending_movement_listener_choice/);
  assert.match(helper, /view\.phase === 'effect_resolution' && view\.pending_heal_listener_choice/);

  const renderStart = controller.indexOf('function renderTacticChoice');
  const renderEnd = controller.indexOf('function renderRealm', renderStart);
  const render = controller.slice(renderStart, renderEnd);
  for (const field of ['pending.min', 'pending.max', 'pending.mode', 'pending.options', 'option.id', 'option.label', 'pending.waiting']) {
    assert.match(render, new RegExp(field.replace('.', '\\.')));
  }
  assert.match(html, /id="tacticChoicePanel"/);
  assert.match(css, /\.sb-tactic-choice-option/);
});

test('choice submission uses resolve_choice with server-projected choice and option IDs', () => {
  const start = controller.indexOf('async function runTacticChoiceIntent');
  const end = controller.indexOf('async function runPlayRealmIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /tacticPendingChoice\(viewState\(\)\)/);
  assert.match(branch, /actionBase\('resolve_choice'\)/);
  assert.match(branch, /choice_id: String\(pending\.id/);
  assert.match(branch, /choice_ids: choiceIds/);
  assert.match(branch, /callEdge\(API_TACTIC/);
});

test('Tactic projection takes precedence before generic Creature Realm fallback only when server eligible', () => {
  assert.match(controller, /const tacticMode = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode/);
  assert.match(controller, /const playHandTarget = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode && !tacticMode/);
  assert.match(controller, /runTacticPlayabilityProjection\(uid\)/);
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /actionBase\('play_realm'\)/);
});

test('battle cache identity advances to V2.4.19 without changing renderer identity', () => {
  assert.match(html, /data-sb-tcg-tabletop="v2-4-19"/);
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-19/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-19/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
