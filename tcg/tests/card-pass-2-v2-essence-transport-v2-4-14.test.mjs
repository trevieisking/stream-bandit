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

test('selected hand cards ask the server for Essence legality instead of duplicating rules', () => {
  assert.match(controller, /actionBase\('attach_essence_targets'\)/);
  assert.match(controller, /projected\.eligible === true/);
  assert.match(controller, /projected\.legal_targets/);
  assert.doesNotMatch(controller, /manual_essence_turn/);
  assert.doesNotMatch(controller, /card_family\s*===?\s*['"]Essence['"]/);
});

test('only server-returned Essence coordinates become green board targets', () => {
  assert.match(controller, /legalEssenceTarget\('vanguard', null\)/);
  assert.match(controller, /legalEssenceTarget\('reserve', index\)/);
  assert.match(controller, /data-essence-target-where="vanguard"/);
  assert.match(controller, /data-essence-target-where="reserve"/);
  assert.match(css, /\.is-essence-target/);
  assert.match(css, /Legal Essence/);
});

test('Essence target activation commits through the existing attach_essence action', () => {
  const start = controller.indexOf('async function runEssenceIntent');
  const end = controller.indexOf('async function runPlayRealmIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /legalEssenceTarget\(where, index\)/);
  assert.match(branch, /actionBase\('attach_essence'\)/);
  assert.match(branch, /card_uid: cardUid/);
  assert.match(branch, /where,/);
  assert.match(branch, /index/);
  assert.match(branch, /refreshMatch\(\)/);
});

test('Evolution, Essence and later Relic projections keep precedence over generic Creature Realm fallback', () => {
  assert.match(controller, /const essenceMode = selectedPlayCard && !evolutionMode/);
  assert.match(controller, /const relicMode = selectedPlayCard && !evolutionMode && !essenceMode/);
  assert.match(controller, /const playHandTarget = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode/);
  assert.match(controller, /actionBase\('evolve'\)/);
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /actionBase\('play_realm'\)/);
});

test('V2.4.14 Essence delivery remains valid after later tabletop interaction versions advance cache identity', () => {
  const marker = html.match(/data-sb-tcg-tabletop="v2-4-(\d+)"/);
  assert.ok(marker, 'tabletop version marker missing');
  assert.ok(Number(marker[1]) >= 14, 'tabletop must not regress below the accepted V2.4.14 Essence surface');
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
