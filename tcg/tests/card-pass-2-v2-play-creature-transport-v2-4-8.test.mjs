import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-table-v2-4-7.css'), 'utf8');
const actions = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-match-actions', 'index.ts'), 'utf8');

test('V2.4.8 browser play_creature transport sends only card UID and Reserve index beyond the shared envelope', () => {
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /card_uid:\s*cardUid[\s\S]*reserve_index:\s*reserveIndex/);
  assert.match(controller, /callEdge\(API_MATCH,\s*Object\.assign\(actionBase\('play_creature'\)/);
  assert.doesNotMatch(controller, /starterLegal\s*\(/);
  assert.doesNotMatch(controller, /baby_standalone_or_mythic_required/);
  assert.doesNotMatch(controller, /empty_reserve_slot_required/);
});

test('server remains sole owner of play_creature type, stage, slot and listener legality', () => {
  const start = actions.indexOf('if(action==="play_creature")');
  const end = actions.indexOf('if(action==="evolve")', start);
  assert.ok(start >= 0 && end > start, 'play_creature server branch not found');
  const branch = actions.slice(start, end);
  assert.match(branch, /body\.card_uid/);
  assert.match(branch, /body\.reserve_index/);
  assert.match(branch, /p\.reserve\[idx\]/);
  assert.match(branch, /empty_reserve_slot_required/);
  assert.match(branch, /starterLegal\(d\)/);
  assert.match(branch, /baby_standalone_or_mythic_required/);
  assert.match(branch, /runtimeV02PlaceCreatureFromHand/);
  assert.match(branch, /runtimeV02BeginEventListenerContinuation/);
  assert.match(branch, /runtimeV02BeginMovementListenerContinuation/);
  assert.match(branch, /runtimeV02BeginMovementHealListenerContinuation/);
});

test('hand selection and Reserve targeting stay presentation-only and card-identity-free', () => {
  assert.match(controller, /anchor:\s*'hand:'\s*\+\s*uid/);
  assert.match(controller, /data-play-creature-reserve-index/);
  assert.match(controller, /runPlayCreatureIntent\(state\.selectedHandUid/);
  assert.match(css, /\.sb-reserve-slot\.is-hand-target/);
  assert.doesNotMatch(controller, /if\s*\([^)]*(?:card_id|\.id)[^)]*===/i);
});

test('play_creature failures re-sync authoritative state just like accepted Attack transport', () => {
  const start = controller.indexOf('async function runPlayCreatureIntent');
  const end = controller.indexOf('async function runAttackIntent', start);
  assert.ok(start >= 0 && end > start, 'runPlayCreatureIntent not found');
  const fn = controller.slice(start, end);
  assert.match(fn, /await callEdge\(API_MATCH/);
  assert.match(fn, /await refreshMatch\(\)/);
  assert.match(fn, /catch \(error\)[\s\S]*await refreshMatch\(\)\.catch/);
  assert.match(fn, /state\.selectedHandUid = ''/);
});

test('browser does not decide whether a selected hand card is Creature/Baby/Standalone/Mythic or whether a Reserve is empty', () => {
  const start = controller.indexOf('async function runPlayCreatureIntent');
  const end = controller.indexOf('async function runAttackIntent', start);
  const fn = controller.slice(start, end);
  for (const forbidden of ['Baby', 'Standalone', 'Mythic', 'starterLegal', 'empty_reserve_slot_required', 'card_family', '.kind']) {
    assert.equal(fn.includes(forbidden), false, 'browser play intent must not own ' + forbidden + ' legality');
  }
});
