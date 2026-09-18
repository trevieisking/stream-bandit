import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-table-v2-4-7.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const actions = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-match-actions', 'index.ts'), 'utf8');

test('V2.4.9 browser play_realm transport sends only card UID beyond the shared envelope', () => {
  assert.match(controller, /actionBase\('play_realm'\)/);
  assert.match(controller, /card_uid:\s*cardUid/);
  assert.match(controller, /callEdge\(API_MATCH,\s*Object\.assign\(actionBase\('play_realm'\)/);
  const start = controller.indexOf('async function runPlayRealmIntent');
  const end = controller.indexOf('async function runPlayCreatureIntent', start);
  assert.ok(start >= 0 && end > start, 'runPlayRealmIntent not found');
  const fn = controller.slice(start, end);
  for (const forbidden of ['realm_card_required', 'realm_already_played_this_turn', 'same_named_realm_cannot_replace_itself', '.kind', '.family']) {
    assert.equal(fn.includes(forbidden), false, 'browser Realm intent must not own ' + forbidden + ' legality');
  }
});

test('server remains sole owner of Realm family, timing, replacement and listener legality', () => {
  const start = actions.indexOf('if(action==="play_realm")');
  const end = actions.indexOf('if(action==="withdraw")', start);
  assert.ok(start >= 0 && end > start, 'play_realm server branch not found');
  const branch = actions.slice(start, end);
  assert.match(branch, /body\.card_uid/);
  assert.match(branch, /d\.kind!==\"Tactic\"/);
  assert.match(branch, /d\.family!==\"Realm\"/);
  assert.match(branch, /runtimeV02BeginRealmPlayRoute/);
  assert.match(branch, /realm_already_played_this_turn/);
  assert.match(branch, /same_named_realm_cannot_replace_itself/);
  assert.match(branch, /const eventFlow=routed\.flow/);
  assert.match(branch, /runtimeV02BeginMovementListenerContinuation/);
  assert.match(branch, /runtimeV02BeginMovementHealListenerContinuation/);
});

test('selected non-Evolution hand card can expose the shared Realm slot without browser card-family classification', () => {
  assert.match(controller, /data-play-realm-target/);
  assert.match(controller, /runPlayRealmIntent\(state\.selectedHandUid\)/);
  assert.match(controller, /const selectedPlayCard = !!state\.selectedHandUid && canPlayFromHand/);
  assert.match(controller, /const playHandTarget = selectedPlayCard && !evolutionMode && !essenceMode && !state\.evolutionProjectionBusy && !state\.essenceProjectionBusy/);
  assert.match(controller, /renderRealm\(view,\s*playHandTarget\)/);
  assert.match(controller, /actionBase\('evolve_targets'\)/);
  assert.doesNotMatch(controller, /evolves_from_id/);
  assert.match(css, /\.sb-realm-slot\.is-hand-target/);
});

test('play_realm success and rejection both re-sync authoritative match state', () => {
  const start = controller.indexOf('async function runPlayRealmIntent');
  const end = controller.indexOf('async function runPlayCreatureIntent', start);
  const fn = controller.slice(start, end);
  assert.match(fn, /await callEdge\(API_MATCH/);
  assert.match(fn, /state\.selectedHandUid = ''/);
  assert.match(fn, /await refreshMatch\(\)/);
  assert.match(fn, /catch \(error\)[\s\S]*await refreshMatch\(\)\.catch/);
});

test('V2.4.9 delivery contract remains valid after later tabletop versions advance cache identity', () => {
  const marker = html.match(/data-sb-tcg-tabletop="v2-4-(\d+)"/);
  assert.ok(marker, 'tabletop version marker missing');
  assert.ok(Number(marker[1]) >= 9, 'tabletop must not regress below the accepted V2.4.9 surface');
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-\d+/);
});
