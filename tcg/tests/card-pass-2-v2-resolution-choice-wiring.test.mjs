import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const battle = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const matchActions = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-match-actions', 'index.ts'), 'utf8');

test('Battle controller remains valid JavaScript after resolution UI wiring', () => {
  assert.doesNotThrow(() => new Function(controller));
});

test('stable card inspector has an in-controller card-name resolver and cannot call an undefined helper', () => {
  assert.match(controller, /function cardNameById\(cardId\)/);
  assert.match(controller, /const renderer = cardRenderer\(\)/);
  assert.match(controller, /const row = view && view\.card_index && id \? view\.card_index\[id\] : null/);
  assert.match(controller, /aria-label="' \+ esc\(cardNameById\(cardId\) \|\| 'Card'\) \+ ' card details"/);
});

test('pending take_reward is a real face-down Reward selection flow, not a generic deadlock', () => {
  assert.match(controller, /view\.pending_resolution/);
  assert.match(controller, /String\(pending\.kind \|\| ''\) === 'take_reward'/);
  assert.match(controller, /data-reward-position=/);
  assert.match(controller, /data-take-reward-confirm="1"/);
  assert.match(controller, /selectedRewardPositions/);
  assert.match(controller, /actionBase\('take_reward'\)/);
  assert.match(controller, /reward_positions: positions/);
  assert.match(battle, /\.sb-reward-card\.is-selectable/);
  assert.match(battle, /\.sb-reward-card\.is-selected/);
});

test('Reward resolution keeps the authoritative server Card-Zone move and resumes the queue', () => {
  assert.match(matchActions, /if\(action==="take_reward"\)/);
  assert.match(matchActions, /body\.reward_positions/);
  assert.match(matchActions, /runtimeV02ApplyCardZoneTransfer\(p\.rewards,p\.hand/);
  assert.match(matchActions, /source_action_id:"take_reward"/);
  assert.match(matchActions, /queue\(\)\.shift\(\);log\([^\n]*took \$\{count\} Reward Card[\s\S]*?continueResolution\(\)/);
});

test('forced promotion is exposed as the next visible resolution step when a defeated Vanguard has Reserves', () => {
  assert.match(controller, /String\(view\.pending_resolution\.kind \|\| ''\) === 'promote'/);
  assert.match(controller, /data-promote-index=/);
  assert.match(controller, /actionBase\('promote'\)/);
  assert.match(controller, /reserve_index: reserveIndex/);
  assert.match(controller, /Choose your new Vanguard/);
  assert.match(matchActions, /if\(action==="promote"\)/);
  assert.match(matchActions, /runtimeV02ApplyForcedPromotion/);
  assert.match(matchActions, /queue\(\)\.shift\(\)/);
  assert.match(matchActions, /scanDefeats\(\);s\.phase="resolution";continueResolution\(\)/);
});

test('completed knockout resolution returns to the existing Aftermath and turn-advance owner', () => {
  assert.match(matchActions, /const continueResolution=\(\)=>\{const continuation=runtimeV02ContinueResolution\(s\)/);
  assert.match(matchActions, /continuation\.status==="resume_aftermath"\)aftermath\(continuation\.seat\)/);
  assert.match(matchActions, /const aftermath=\(who:number\)=>/);
  assert.match(matchActions, /advanceTurn\(\)\};/);
});

test('bounded Battle cards keep the board calm while click opens the readable inspect face', () => {
  assert.match(battle, /\.sb-reserve-slot \.sb-card-control\{[\s\S]*?width:min\(var\(--card-w\),10\.36dvh\);[\s\S]*?height:auto/);
  assert.match(battle, /\.sb-vanguard-slot \.sb-card-control\{[\s\S]*?width:min\(var\(--active-w\),11\.79dvh\);[\s\S]*?height:auto/);
  assert.match(controller, /renderCardFace\(cardId, \{[\s\S]*?mode: 'compact'/);
  assert.match(controller, /renderCardFace\(cardId, \{[\s\S]*?mode: 'inspect'/);
  assert.match(battle, /id="cardInspector"/);
  assert.match(battle, /\.sb-card-inspector-panel\{[\s\S]*?width:min\(390px,36vw,48dvh\)/);
  assert.match(controller, /function renderSelectedCardInspector\(view, canAct\)/);
  assert.match(controller, /inspected\.kind === 'hand'/);
  assert.match(controller, /inspected\.kind === 'field'/);
  assert.match(battle, /stream-bandit-tcg-v2-battle-controller\.js\?v=0-20-server-attack-choice-route/);
});
