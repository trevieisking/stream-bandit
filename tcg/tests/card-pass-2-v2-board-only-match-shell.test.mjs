import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const battle = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

test('V2 active match is a board-only game route, not the site shell', () => {
  assert.match(battle, /data-sb-tcg-v2-battle="board-only-v0-2"/);
  assert.match(battle, /aria-label="One-screen battlefield"/);
  assert.doesNotMatch(battle, /stream-bandit-header-shell/i);
  assert.doesNotMatch(battle, /stream-bandit-footer-shell/i);
  assert.doesNotMatch(battle, /id="siteHeader"|id="siteFooter"/i);
  assert.doesNotMatch(battle, /stream-bandit-shell-v6-24\.js/);
  assert.doesNotMatch(battle, /stream-bandit-theme-projector/i);
});

test('board-only match uses the dedicated TCG config bridge and existing authentication owner', () => {
  assert.match(battle, /stream-bandit-tcg-config-v2-4-31\.js/);
  assert.match(battle, /stream-bandit-auth-gate-v7-13-001\.js/);
  assert.match(battle, /stream-bandit-tcg-v2-battle-controller\.js/);
});

test('paired battle startup waits for a completed auth decision before rejecting the player', () => {
  assert.match(controller, /async function resolveAuthDecision\(\)/);
  assert.match(controller, /decision = await gate\.decide\(\)/);
  assert.match(controller, /snapshot && snapshot\.lastDecision/);
  assert.match(controller, /const decision = await resolveAuthDecision\(\)/);
});

test('match page does not contain matchmaking, room-code, or menu controls', () => {
  assert.doesNotMatch(battle, /joinCode|join code|createRoom|Matchmake|private room/i);
  assert.doesNotMatch(battle, /Collection|Deck Builder|Packs|Main Menu/i);
});

test('existing battle controller still binds the route to authoritative match identity', () => {
  assert.match(controller, /new URLSearchParams\(window\.location\.search\)\.get\('match_id'\)/);
  assert.match(controller, /callEdge\(API_SETUP, \{ action: 'match_view', match_id: state\.matchId \}\)/);
  assert.match(controller, /callEdge\(API_MATCH, Object\.assign\(actionBase\('attack'\)/);
});
