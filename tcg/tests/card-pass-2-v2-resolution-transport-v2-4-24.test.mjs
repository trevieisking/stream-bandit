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

test('resolution UI consumes only the authoritative pending_resolution view', () => {
  assert.match(controller, /function resolutionDescriptor\(view\)/);
  assert.match(controller, /view\.pending_resolution/);
  assert.match(controller, /kind !== 'take_reward' && kind !== 'promote'/);
  assert.doesNotMatch(controller, /rewardValue\(/);
  assert.doesNotMatch(controller, /runtimeV02ApplyForcedPromotion/);
  assert.doesNotMatch(controller, /scanDefeats\(/);
});

test('Reward resolution keeps cards face-down and submits only selected positions', () => {
  const renderStart = controller.indexOf('function renderRewards');
  const renderEnd = controller.indexOf('function renderOpponentHand', renderStart);
  assert.ok(renderStart >= 0 && renderEnd > renderStart);
  const render = controller.slice(renderStart, renderEnd);
  assert.match(render, /renderer\(\)\.renderCardBack/);
  assert.match(render, /data-reward-position/);
  assert.match(render, /state\.rewardPositions\.includes\(index\)/);

  const intentStart = controller.indexOf('async function runTakeRewardIntent');
  const intentEnd = controller.indexOf('async function runPromotionIntent', intentStart);
  const intent = controller.slice(intentStart, intentEnd);
  assert.match(intent, /pending\.kind !== 'take_reward'/);
  assert.match(intent, /positions\.length !== pending\.count/);
  assert.match(intent, /actionBase\('take_reward'\)/);
  assert.match(intent, /reward_positions: positions/);
});

test('mandatory promotion highlights occupied Reserve cards and commits the chosen index only after confirmation', () => {
  assert.match(controller, /data-promotion-reserve-index/);
  assert.match(controller, /promotionTargets && !!creature/);
  assert.match(controller, /state\.promotionReserveIndex === index/);
  assert.match(css, /\.is-promotion-target/);
  assert.match(css, /\.is-promotion-selected/);

  const intentStart = controller.indexOf('async function runPromotionIntent');
  const intentEnd = controller.indexOf('async function runOpeningChoiceIntent', intentStart);
  const intent = controller.slice(intentStart, intentEnd);
  assert.match(intent, /pending\.kind !== 'promote'/);
  assert.match(intent, /!reserve\[index\]/);
  assert.match(intent, /actionBase\('promote'\)/);
  assert.match(intent, /reserve_index: index/);
});

test('Reward and promotion selections remain local and cancellable before server commit', () => {
  const bindStart = controller.indexOf("document.querySelectorAll('[data-reward-position]')");
  const bindEnd = controller.indexOf("document.querySelectorAll('[data-play-realm-target]')", bindStart);
  assert.ok(bindStart >= 0 && bindEnd > bindStart);
  const binding = controller.slice(bindStart, bindEnd);
  assert.match(binding, /state\.rewardPositions\.splice/);
  assert.match(binding, /state\.promotionReserveIndex = state\.promotionReserveIndex === index \? null : index/);
  assert.doesNotMatch(binding, /callEdge\(/);
});

test('resolution controls distinguish acting seat from waiting seat and visibly state defeated Vanguard promotion', () => {
  const start = controller.indexOf('function renderPhaseControls');
  const end = controller.indexOf('function renderActionChoice', start);
  const phase = controller.slice(start, end);
  assert.match(phase, /Waiting for the other player to resolve/);
  assert.match(phase, /Take selected Reward/);
  assert.match(phase, /Your Vanguard was defeated/);
  assert.match(phase, /Confirm promotion/);
});

test('post-promotion movement/heal choices remain on the generic authoritative choice router', () => {
  const start = controller.indexOf('function pendingActionChoice');
  const end = controller.indexOf('function yourCreatureAt', start);
  const route = controller.slice(start, end);
  assert.match(route, /pending_movement_listener_choice/);
  assert.match(route, /resolve_movement_listener_choice/);
  assert.match(route, /pending_heal_listener_choice/);
  assert.match(route, /resolve_heal_listener_choice/);
});

test('battle cache identity advances to V2.4.24 without changing renderer identity', () => {
  assert.match(html, /data-sb-tcg-tabletop="v2-4-24"/);
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-24/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-24/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
