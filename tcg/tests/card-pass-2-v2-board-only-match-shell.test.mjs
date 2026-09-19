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
});

test('board-only match reuses shared config and explicit existing authentication', () => {
  assert.match(battle, /stream-bandit-tcg-config-v2-4-31\.js/);
  assert.doesNotMatch(battle, /stream-bandit-shell-v6-24\.js/);
  assert.match(battle, /stream-bandit-auth-gate-v7-13-001\.js/);
  assert.match(battle, /stream-bandit-tcg-v2-battle-controller\.js/);
});

test('match page has no matchmaking or room controls and uses only the approved TCG-owned game menu', () => {
  assert.doesNotMatch(battle, /joinCode|join code|createRoom|Matchmake|private room/i);
  assert.match(battle, /class="sb-game-nav"/);
  for (const label of ['Battle','Decks','Collection','Battle Pass','Shop','Settings']) assert.ok(battle.includes('>'+label+'</a>'));
  assert.doesNotMatch(battle, /siteHeader|siteFooter|Search Stream Bandit|Main Menu/i);
});

test('existing battle controller still binds the route to authoritative match identity', () => {
  assert.match(controller, /new URLSearchParams\(window\.location\.search\)\.get\('match_id'\)/);
  assert.match(controller, /callEdge\(API_SETUP, \{ action: 'match_view', match_id: state\.matchId \}\)/);
  assert.match(controller, /callEdge\(API_MATCH, Object\.assign\(actionBase\('attack'\)/);
});
