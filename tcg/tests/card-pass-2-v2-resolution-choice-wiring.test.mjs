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

test('wide Battle cards are height-bounded at normal browser zoom and selected Vanguard can open a readable canonical face', () => {
  assert.match(battle, /width:min\(var\(--card-w\),10\.36dvh\)/);
  assert.match(battle, /width:min\(var\(--active-w\),11\.79dvh\)/);
  assert.match(battle, /width:min\(clamp\(94px,8vw,126px\),10\.8dvh\)/);
  assert.match(battle, /\.sb-card-control-shell\.is-selected\{[\s\S]*?position:relative/);
  assert.match(battle, /id="cardInspector"/);
  assert.match(battle, /\.sb-card-inspector-panel\{[\s\S]*?width:min\(330px,33vw,40dvh\)/);
  assert.match(controller, /function renderSelectedCardInspector\(view, canAct\)/);
  assert.match(battle, /stream-bandit-tcg-v2-battle-controller\.js\?v=0-15-stable-card-focus/);
});
