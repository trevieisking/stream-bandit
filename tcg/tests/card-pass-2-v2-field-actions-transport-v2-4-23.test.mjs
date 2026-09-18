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

test('browser refresh consumes read-only field_actions and stores only projected coordinates/payment data', () => {
  assert.match(controller, /actionBase\('field_actions'\)/);
  assert.match(controller, /projected\.ability_sources/);
  assert.match(controller, /projected\.withdraw/);
  assert.match(controller, /withdraw\.legal_targets/);
  assert.match(controller, /withdraw\.payment_options/);
  assert.doesNotMatch(controller, /runtimeV02BeginActiveAbilityLiveRoute/);
  assert.doesNotMatch(controller, /withdrawalCost\(/);
  assert.doesNotMatch(controller, /condition_prevents_withdrawal/);
  assert.doesNotMatch(controller, /withdrawal_already_used_this_turn/);
});

test('Ability controls render only on exact server-projected source card anchors', () => {
  assert.match(controller, /function legalAbilitySource\(where, index, anchorUid\)/);
  assert.match(controller, /source\.anchor_uid === anchorUid/);
  assert.match(controller, /intent: 'use_ability'/);
  assert.match(controller, /label: 'Use Ability'/);
  assert.match(controller, /data-card-intent="use_ability"/);
  assert.match(controller, /actionBase\('use_ability'\)/);
});

test('Withdrawal starts on the Vanguard card and uses only server-projected cost targets and payment options', () => {
  assert.match(controller, /intent: 'withdraw'/);
  assert.match(controller, /detail: 'Server cost '/);
  assert.match(controller, /function legalWithdrawTarget\(index\)/);
  assert.match(controller, /data-withdraw-target-index/);
  assert.match(controller, /state\.fieldWithdraw\.payment_options/);
  assert.match(controller, /actionBase\('withdraw'\)/);
  assert.match(controller, /discard_essence_uids: paymentUids/);
  assert.match(css, /\.is-withdraw-target/);
});

test('Withdrawal remains cancellable before authoritative commit', () => {
  const start = controller.indexOf('function startWithdrawMode');
  const commit = controller.indexOf('async function runWithdrawIntent', start);
  assert.ok(start >= 0 && commit > start);
  const select = controller.slice(start, commit);
  assert.doesNotMatch(select, /callEdge\(/);
  assert.match(controller, /actionChoiceCancel/);
  assert.match(controller, /clearWithdrawMode\(\)/);
  assert.match(html, /id="actionChoiceCancel"/);
});

test('generic authoritative choice router completes Ability and Withdrawal continuations without card-specific rules', () => {
  const start = controller.indexOf('function pendingActionChoice');
  const end = controller.indexOf('function yourCreatureAt', start);
  assert.ok(start >= 0 && end > start);
  const route = controller.slice(start, end);
  for (const field of [
    'pending_attack_choice',
    'pending_ability_choice',
    'pending_event_listener_choice',
    'pending_movement_listener_choice',
    'pending_heal_listener_choice',
    'pending_choice'
  ]) assert.match(route, new RegExp(field));
  assert.match(route, /resolve_ability_choice/);
  assert.match(route, /resolve_movement_listener_choice/);
  assert.match(route, /resolve_heal_listener_choice/);

  const submitStart = controller.indexOf('async function runPendingChoiceIntent');
  const submitEnd = controller.indexOf('async function runAbilityIntent', submitStart);
  const submit = controller.slice(submitStart, submitEnd);
  assert.match(submit, /route\.owner === 'tactic'/);
  assert.match(submit, /callEdge\(API_TACTIC/);
  assert.match(submit, /callEdge\(API_MATCH/);
});

test('Reserve card selection persists by field anchor so projected Reserve Abilities remain card-owned', () => {
  assert.match(controller, /function fieldHasAnchor\(view, anchorUid\)/);
  assert.match(controller, /reserve\.some\(\(creature\) => cardAnchor\(creature\) === anchorUid\)/);
  assert.match(controller, /if \(state\.selectedAnchorUid && !fieldHasAnchor\(view, state\.selectedAnchorUid\)\)/);
});

test('battle cache identity advances to V2.4.23 without changing renderer identity', () => {
  assert.match(html, /data-sb-tcg-tabletop="v2-4-23"/);
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-23/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-23/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
