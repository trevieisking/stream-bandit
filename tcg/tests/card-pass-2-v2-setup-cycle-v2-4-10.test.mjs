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
const css = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-table-v2-4-7.css'), 'utf8');
const setup = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-private-alpha-api', 'index.ts'), 'utf8');

function actionBranch(action, nextAction) {
  const start = setup.indexOf('if(action==="' + action + '")');
  const end = nextAction ? setup.indexOf('if(action==="' + nextAction + '")', start) : setup.indexOf('return json({ok:false,version:VERSION,error:"unknown_action"', start);
  assert.ok(start >= 0 && end > start, action + ' setup branch not found');
  return setup.slice(start, end);
}

test('V2.4.10 setup browser transports are thin server-authoritative intents', () => {
  assert.match(controller, /actionBase\('opening_coin_call'\)/);
  assert.match(controller, /actionBase\('opening_choice'\)/);
  assert.match(controller, /actionBase\('setup_place'\)/);
  assert.match(controller, /actionBase\('setup_return'\)/);
  assert.match(controller, /actionBase\('setup_ready'\)/);
  assert.match(controller, /card_uid:\s*cardUid[\s\S]*where,[\s\S]*index/);
  const start = controller.indexOf('async function runSetupPlaceIntent');
  const end = controller.indexOf('async function runSetupReturnIntent', start);
  const fn = controller.slice(start, end);
  for (const forbidden of ['starterLegal', 'Baby', 'Standalone', 'Mythic', 'vanguard_occupied', 'illegal_reserve_slot', '.card_id', '.stage']) {
    assert.equal(fn.includes(forbidden), false, 'browser setup placement must not own ' + forbidden);
  }
});

test('private-alpha remains sole setup legality and lifecycle owner', () => {
  const coin = actionBranch('opening_coin_call', 'opening_choice');
  const opening = actionBranch('opening_choice', 'setup_place');
  const place = actionBranch('setup_place', 'setup_return');
  const ret = actionBranch('setup_return', 'setup_ready');
  const ready = actionBranch('setup_ready', null);
  assert.match(coin, /runtimeV02ApplyOpeningCoinCall/);
  assert.match(coin, /runtimeV02FlipCoin/);
  assert.match(opening, /runtimeV02ApplyOpeningChoice/);
  assert.match(place, /starterLegal\(meta\)/);
  assert.match(place, /vanguard_occupied/);
  assert.match(place, /illegal_reserve_slot/);
  assert.match(place, /runtimeV02PlaceCreatureFromHand/);
  assert.match(ret, /runtimeV02ReturnSetupCreatureToHand/);
  assert.match(ready, /runtimeV02ApplySetupReady/);
  assert.match(ready, /runtimeV02ApplyCardZoneTransferBatch/);
  assert.match(ready, /setup_rewards/);
  assert.match(ready, /setup_start_draw/);
});

test('setup destinations and lifecycle controls are board/card based', () => {
  assert.match(controller, /data-setup-place-where="vanguard"/);
  assert.match(controller, /data-setup-place-where="reserve"/);
  assert.match(controller, /data-lifecycle-intent="opening_coin_call"/);
  assert.match(controller, /data-coin-call="heads"/);
  assert.match(controller, /data-coin-call="tails"/);
  assert.match(controller, /data-lifecycle-intent="opening_choice"/);
  assert.match(controller, /data-lifecycle-intent="setup_ready"/);
  assert.match(controller, /data-card-intent="setup_return"/);
  assert.match(html, /id="phaseControls"/);
  assert.match(css, /\.sb-vanguard-hand-target\.is-hand-target/);
  assert.match(css, /\.sb-phase-controls/);
  assert.doesNotMatch(controller, /\bprompt\s*\(/);
  assert.doesNotMatch(controller, /\bconfirm\s*\(/);
});

test('reusable renderer supports generic card-context intents without gaining gameplay authority', () => {
  assert.match(renderer, /function contextActionMarkup/);
  assert.match(renderer, /data-card-intent=/);
  assert.match(renderer, /data-action-where=/);
  for (const forbidden of [/\bfetch\s*\(/, /supabase/i, /tcg-private-alpha-api/i, /tcg-match-actions/i, /service_role/i]) {
    assert.doesNotMatch(renderer, forbidden);
  }
  assert.match(renderer, /return attackActionMarkup\(action\)/);
});

test('V2.4.10 preserves accepted play Creature, Realm and Attack transport paths', () => {
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /data-play-creature-reserve-index/);
  assert.match(controller, /actionBase\('play_realm'\)/);
  assert.match(controller, /data-play-realm-target/);
  assert.match(controller, /actionBase\('attack'\)/);
  assert.match(controller, /data-card-intent="attack"/);
});

test('V2.4.10 setup delivery remains valid after later tabletop interaction versions advance cache identity', () => {
  const marker = html.match(/data-sb-tcg-tabletop="v2-4-(\d+)"/);
  assert.ok(marker, 'tabletop version marker missing');
  assert.ok(Number(marker[1]) >= 10, 'tabletop must not regress below accepted V2.4.10 setup');
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-\d+/);
});
