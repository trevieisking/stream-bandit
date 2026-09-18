import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'stream-bandit-tcg-card-renderer-v2-4-7.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');

test('accepted card renderer visibly projects current HP damage Shield and Conditions', () => {
  assert.match(renderer, /HP ' \+ esc\(remaining\) \+ '\/' \+ esc\(maxHp\)/);
  assert.match(renderer, /Damage ' \+ esc\(damage\)/);
  assert.match(renderer, /Shield ' \+ esc\(shield\)/);
  assert.match(renderer, /function conditionsMarkup\(conditions\)/);
  assert.match(renderer, /class="sb-condition"/);
});

test('Ability ready or locked presentation derives only from revision-current field_actions projection', () => {
  const start = controller.indexOf('function printedActiveAbility');
  const end = controller.indexOf('function legalWithdrawTarget', start);
  assert.ok(start >= 0 && end > start);
  const projection = controller.slice(start, end);
  assert.match(projection, /fieldActionsFresh\(\)/);
  assert.match(projection, /legalAbilitySource\(where, index, anchor\)/);
  assert.match(projection, /Ability ready · server projected/);
  assert.match(projection, /Ability locked/);
  assert.match(projection, /Not server-available now/);
  assert.doesNotMatch(projection, /turn_limit_reached/);
  assert.doesNotMatch(projection, /CurrentTurnActiveAbilityUseCount/);
  assert.doesNotMatch(projection, /requirements/);
  assert.doesNotMatch(projection, /costs/);
});

test('card-owned Use Ability action remains bound to exact projected field source', () => {
  assert.match(controller, /function legalAbilitySource\(where, index, anchorUid\)/);
  assert.match(controller, /source\.anchor_uid === anchorUid/);
  assert.match(controller, /intent: 'use_ability'/);
  assert.match(controller, /await callEdge\(API_MATCH, Object\.assign\(actionBase\('use_ability'\), \{ where, index \}\)\)/);
});

test('terminal result presentation reads authoritative result without calculating a winner', () => {
  const start = controller.indexOf('function resultReasonLabel');
  const end = controller.indexOf('function renderActionChoice', start);
  assert.ok(start >= 0 && end > start);
  const resultSurface = controller.slice(start, end);
  assert.match(resultSurface, /view\.result/);
  assert.match(resultSurface, /view\.result\.winner_seat/);
  assert.match(resultSurface, /Victory/);
  assert.match(resultSurface, /Defeat/);
  assert.match(resultSurface, /Overtime pending/);
  assert.match(resultSurface, /data-match-result="complete"/);
  assert.match(resultSurface, /data-match-result="overtime"/);
  assert.doesNotMatch(resultSurface, /all_rewards_taken/);
  assert.doesNotMatch(resultSurface, /opponent_deckout/);
  assert.doesNotMatch(resultSurface, /opponent_has_no_creature/);
  assert.doesNotMatch(resultSurface, /rewardValue\(/);
});

test('accepted visible-state surfaces retain counts phase and generic pending-choice routing', () => {
  assert.match(controller, /renderDeck\('oppDeck'/);
  assert.match(controller, /renderDiscard\('oppDiscard'/);
  assert.match(controller, /renderDeck\('yourDeck'/);
  assert.match(controller, /renderDiscard\('yourDiscard'/);
  assert.match(controller, /\$\('phasePill'\)\.textContent = String\(view\.phase/);
  assert.match(controller, /pending_attack_choice/);
  assert.match(controller, /pending_ability_choice/);
  assert.match(controller, /pending_event_listener_choice/);
  assert.match(controller, /pending_movement_listener_choice/);
  assert.match(controller, /pending_heal_listener_choice/);
  assert.match(controller, /pending_choice/);
});

test('battle cache identity advances to V2.4.25 with the accepted renderer identity unchanged', () => {
  assert.match(html, /data-sb-tcg-tabletop="v2-4-25"/);
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-25/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-25/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
