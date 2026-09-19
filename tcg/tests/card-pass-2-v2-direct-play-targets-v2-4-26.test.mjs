import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-match-actions', 'index.ts'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');

function sliceBetween(source, startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start + startText.length);
  assert.ok(start >= 0, 'missing start marker: ' + startText);
  assert.ok(end > start, 'missing end marker: ' + endText);
  return source.slice(start, end);
}

test('Match direct-play projection reuses canonical Creature and Realm owners on clones only', () => {
  assert.match(match, /runtimeV02ApplyRealmPlayTransaction/);
  const projection = sliceBetween(match, 'if(action==="play_card_targets")', 'if(action==="evolve_targets")');
  assert.match(projection, /const playerClone=structuredClone\(p\)/);
  assert.match(projection, /runtimeV02PlaceCreatureFromHand\(playerClone/);
  assert.match(projection, /const stateClone=structuredClone\(s\)/);
  assert.match(projection, /runtimeV02ApplyRealmPlayTransaction\(stateClone/);
  assert.match(projection, /legalTargets\.push\(\{kind:"reserve",reserve_index:idx\}\)/);
  assert.match(projection, /legalTargets\.push\(\{kind:"realm"\}\)/);
  assert.doesNotMatch(projection, /await commit\(/);
});

test('Match projection is read-only while mutation commands remain the final authority', () => {
  const projection = sliceBetween(match, 'if(action==="play_card_targets")', 'if(action==="evolve_targets")');
  assert.match(projection, /p\.hand\.find/);
  assert.match(match, /if\(action==="play_creature"\)/);
  assert.match(match, /runtimeV02PlaceCreatureFromHand\(p,seat as 1\|2/);
  assert.match(match, /if\(action==="play_realm"\)/);
  assert.match(match, /runtimeV02BeginRealmPlayRoute\(s,seat as 1\|2/);
});

test('browser requests and sanitizes only server-projected direct destinations', () => {
  const projection = sliceBetween(controller, 'async function runPlayCardTargetProjection', 'async function runTacticPlayabilityProjection');
  assert.match(projection, /actionBase\('play_card_targets'\)/);
  assert.match(projection, /kind === 'realm'/);
  assert.match(projection, /kind === 'reserve'/);
  assert.match(projection, /reserveIndex >= 0 && reserveIndex <= 3/);
  assert.match(projection, /state\.playTargets = Array\.isArray\(projected\.legal_targets\)/);
});

test('ordinary Reserve and Realm controls exist only for exact projected targets', () => {
  const targetHelpers = sliceBetween(controller, 'function clearPlayProjection', 'function pendingActionChoice');
  assert.match(targetHelpers, /state\.playProjectionUid !== state\.selectedHandUid/);
  assert.match(targetHelpers, /target\.kind === 'reserve' && target\.reserve_index === index/);
  assert.match(targetHelpers, /target\.kind === 'realm'/);

  const reserve = sliceBetween(controller, 'function renderReserve', 'function renderYourVanguard');
  assert.match(reserve, /playCreatureTarget = playCreatureTargets && !creature && legalPlayCreatureTarget\(index\)/);
  assert.match(reserve, /data-play-creature-reserve-index/);
  assert.match(reserve, /\(handTarget \|\| playCreatureTarget\) \? ' is-hand-target'/);

  const realm = sliceBetween(controller, 'function renderRealm', 'function render()');
  assert.match(realm, /classList\.toggle\('is-hand-target', !!realmTarget\)/);
  assert.match(realm, /data-play-realm-target/);
});

test('direct-play browser path contains no Creature-family or Realm-rule evaluator', () => {
  const projection = sliceBetween(controller, 'async function runPlayCardTargetProjection', 'async function runTacticPlayabilityProjection');
  const render = sliceBetween(controller, 'function render()', 'function bindCardControls');
  const directIntents = sliceBetween(controller, 'async function runPlayRealmIntent', 'async function runAttackIntent');
  const directSurface = projection + render + directIntents;
  assert.doesNotMatch(directSurface, /Baby|Standalone|Mythic/);
  assert.doesNotMatch(directSurface, /realm_already_played_this_turn/);
  assert.doesNotMatch(directSurface, /same_named_realm/);
  assert.doesNotMatch(directSurface, /manual_essence_turn/);
  assert.doesNotMatch(directSurface, /starterLegal/);
});

test('specialized projections retain precedence and direct intents reject stale projection', () => {
  const render = sliceBetween(controller, 'function render()', 'function bindCardControls');
  assert.match(render, /const evolutionMode/);
  assert.match(render, /const essenceMode = selectedPlayCard && !evolutionMode/);
  assert.match(render, /const relicMode = selectedPlayCard && !evolutionMode && !essenceMode/);
  assert.match(render, /const tacticMode = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode/);
  assert.match(render, /const directPlayMode = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode && !tacticMode/);
  assert.match(controller, /if \(!legalPlayRealmTarget\(\)\) throw new Error/);
  assert.match(controller, /if \(!legalPlayCreatureTarget\(reserveIndex\)\) throw new Error/);
});

test('selected hand card launches direct projection alongside accepted specialized projections', () => {
  const binding = sliceBetween(controller, 'function bindCardControls', 'async function runTakeRewardIntent');
  assert.match(binding, /runEvolutionTargetProjection\(uid\)/);
  assert.match(binding, /runEssenceTargetProjection\(uid\)/);
  assert.match(binding, /runRelicTargetProjection\(uid\)/);
  assert.match(binding, /runTacticPlayabilityProjection\(uid\)/);
  assert.match(binding, /runPlayCardTargetProjection\(uid\)/);
});

test('V2.4.30 visual cache identity remains compatible after later controller revisions', () => {
  const marker=html.match(/data-sb-tcg-tabletop="v2-4-(\d+)"/);
  const controllerCache=html.match(/stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-(\d+)/);
  assert.ok(marker,'tabletop cache marker missing');
  assert.ok(controllerCache,'controller cache identity missing');
  assert.equal(marker[1],controllerCache[1],'tabletop marker and controller cache must advance together');
  assert.ok(Number(marker[1])>=26,'tabletop/controller cache identity regressed');
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-30/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
