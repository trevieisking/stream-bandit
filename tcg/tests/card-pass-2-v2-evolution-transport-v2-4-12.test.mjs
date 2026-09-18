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

test('selected hand cards ask the server for Evolution legality rather than duplicating stage rules', () => {
  assert.match(controller, /actionBase\('evolve_targets'\)/);
  assert.match(controller, /card_uid: cardUid/);
  assert.match(controller, /projected\.eligible === true/);
  assert.match(controller, /projected\.legal_targets/);
  assert.doesNotMatch(controller, /evolves_from_id/);
  assert.doesNotMatch(controller, /evolution_locked_on_first_personal_turn/);
  assert.doesNotMatch(controller, /one_evolution_per_stack_per_turn/);
});

test('only server-returned Evolution coordinates receive green board target controls', () => {
  assert.match(controller, /legalEvolutionTarget\('vanguard', null\)/);
  assert.match(controller, /legalEvolutionTarget\('reserve', index\)/);
  assert.match(controller, /data-evolve-target-where="vanguard"/);
  assert.match(controller, /data-evolve-target-where="reserve"/);
  assert.match(css, /\.is-evolution-target/);
  assert.match(css, /Legal Evolution/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('Evolution commits through the existing server action and revalidates target membership before transport', () => {
  const start = controller.indexOf('async function runEvolutionIntent');
  const end = controller.indexOf('async function runPlayRealmIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /legalEvolutionTarget\(where, index\)/);
  assert.match(branch, /actionBase\('evolve'\)/);
  assert.match(branch, /card_uid: cardUid/);
  assert.match(branch, /where,/);
  assert.match(branch, /index/);
  assert.match(branch, /refreshMatch\(\)/);
});

test('Evolution mode suppresses generic Reserve and Realm hand targets without changing their transports', () => {
  assert.match(controller, /const evolutionMode = selectedPlayCard/);
  assert.match(controller, /const playHandTarget = selectedPlayCard && !evolutionMode/);
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /actionBase\('play_realm'\)/);
});

test('battle cache identity advances to V2.4.12 without changing the renderer identity', () => {
  assert.match(html, /data-sb-tcg-tabletop="v2-4-12"/);
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-12/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-12/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
