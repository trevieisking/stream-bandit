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

test('selected hand cards ask the server for Relic legality instead of duplicating subtype or slot rules', () => {
  assert.match(controller, /actionBase\('attach_relic_targets'\)/);
  assert.match(controller, /projected\.eligible === true/);
  assert.match(controller, /projected\.legal_targets/);
  assert.doesNotMatch(controller, /subtype\s*===?\s*['"]Relic['"]/);
  assert.doesNotMatch(controller, /creature_already_has_relic/);
  assert.doesNotMatch(controller, /relic_card_required/);
});
test('only server-returned Relic coordinates become green board targets', () => {
  assert.match(controller, /legalRelicTarget\('vanguard', null\)/);
  assert.match(controller, /legalRelicTarget\('reserve', index\)/);
  assert.match(controller, /data-relic-target-where="vanguard"/);
  assert.match(controller, /data-relic-target-where="reserve"/);
  assert.match(css, /\.is-relic-target/);
  assert.match(css, /Legal Relic/);
});
test('Relic target activation commits through the existing attach_relic action', () => {
  const start = controller.indexOf('async function runRelicIntent');
  const end = controller.indexOf('async function runPlayRealmIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /legalRelicTarget\(where, index\)/);
  assert.match(branch, /actionBase\('attach_relic'\)/);
  assert.match(branch, /card_uid: cardUid/);
  assert.match(branch, /where,/);
  assert.match(branch, /index/);
  assert.match(branch, /refreshMatch\(\)/);
});
test('projection precedence preserves Evolution and Essence before Relic and generic fallback after all three', () => {
  assert.match(controller, /const relicMode = selectedPlayCard && !evolutionMode && !essenceMode/);
  assert.match(controller, /const playHandTarget = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode/);
  assert.match(controller, /runEvolutionTargetProjection\(uid\)/);
  assert.match(controller, /runEssenceTargetProjection\(uid\)/);
  assert.match(controller, /runRelicTargetProjection\(uid\)/);
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /actionBase\('play_realm'\)/);
});
test('battle cache identity advances to V2.4.16 without changing renderer identity', () => {
  assert.match(html, /data-sb-tcg-tabletop="v2-4-16"/);
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-16/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-16/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
