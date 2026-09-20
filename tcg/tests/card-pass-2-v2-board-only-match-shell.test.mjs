import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const battle = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

test('V2 active match is a true board-only full-viewport route', () => {
  assert.match(battle, /data-sb-tcg-v2-battle="board-only-v0-4"/);
  assert.match(battle, /aria-label="One-screen battlefield"/);
  assert.match(battle, /height:100dvh/);
  assert.doesNotMatch(battle, /stream-bandit-header-shell/i);
  assert.doesNotMatch(battle, /stream-bandit-footer-shell/i);
  assert.doesNotMatch(battle, /id="siteHeader"|id="siteFooter"/i);
  assert.doesNotMatch(battle, /class="sb-hud"/i);
  assert.doesNotMatch(battle, /class="sb-foot"/i);
  assert.doesNotMatch(battle, /class="sb-game-nav"/i);
  assert.doesNotMatch(battle, />Battle<\/a>|>Decks<\/a>|>Collection<\/a>|>Battle Pass<\/a>|>Shop<\/a>|>Settings<\/a>/i);
});

test('board-only match uses the dedicated TCG config bridge without the Stream Bandit app shell', () => {
  assert.match(battle, /stream-bandit-tcg-config-v2-4-31\.js/);
  assert.match(battle, /stream-bandit-auth-gate-v7-13-001\.js/);
  assert.match(battle, /stream-bandit-tcg-v2-battle-controller\.js/);
  assert.doesNotMatch(battle, /stream-bandit-shell-v6-24\.js/);
  assert.doesNotMatch(battle, /stream-bandit-theme-projector/i);
});

test('phone battle scrolls vertically instead of trapping the board inside one viewport', () => {
  assert.match(battle, /@media\(max-width:640px\)/);
  assert.match(battle, /overflow-y:auto/);
  assert.match(battle, /-webkit-overflow-scrolling:touch/);
  assert.match(battle, /\.sb-battle\{height:auto;min-height:100dvh/);
  assert.match(battle, /\.sb-board\s*\{[\s\S]*?height:auto;min-height:100dvh/);
});


test('wide battle card fit is viewport-driven and does not depend on mouse pointer classification', () => {
  assert.match(battle, /@media\(min-width:641px\)\{/);
  assert.doesNotMatch(battle, /@media\(min-width:641px\) and \(hover:hover\) and \(pointer:fine\)/);
  assert.match(battle, /\.sb-reserve-slot \.sb-card-control\{[\s\S]*?width:min\(var\(--card-w\),10\.36dvh\);[\s\S]*?height:auto/);
  assert.match(battle, /\.sb-vanguard-slot \.sb-card-control\{[\s\S]*?width:min\(var\(--active-w\),11\.79dvh\);[\s\S]*?height:auto/);
  assert.match(battle, /\.sb-card-control-shell\.is-selected\{[\s\S]*?width:min\(330px,33vw,40dvh\)/);
  assert.match(battle, /Phone\/coarse layout below remains the later override/);
});

test('battle cards are wired to the canonical shared card renderer and repository art sources', () => {
  assert.match(battle, /stream-bandit-tcg-art-resolver-v2-4-36\.js/);
  assert.match(battle, /stream-bandit-tcg-card-renderer-v2-4-51\.js/);
  assert.match(battle, /stream-bandit-tcg-card-renderer-v2-4-51\.css/);
  assert.match(battle, /data-sb-tcg-page="battle"/);
  assert.match(battle, /data-sb-tcg-card-face="v1"/);
  assert.match(controller, /StreamBanditTCGCardRendererV2451/);
  assert.match(controller, /renderCardFace\(cardId/);
  assert.match(controller, /sb-card-control-shell/);
  assert.match(controller, /sb-hand-card-shell/);
});

test('paired battle startup waits for a completed auth decision before rejecting the player', () => {
  assert.match(controller, /async function resolveAuthDecision\(\)/);
  assert.match(controller, /decision = await gate\.decide\(\)/);
  assert.match(controller, /snapshot && snapshot\.lastDecision/);
  assert.match(controller, /const decision = await resolveAuthDecision\(\)/);
});

test('opponent cosmetic is bound to authoritative match identity and sb_profiles public cosmetic fields', () => {
  assert.match(controller, /view && view\.opponent && view\.opponent\.user_id/);
  assert.match(controller, /\.from\('sb_profiles'\)/);
  assert.match(controller, /\.select\('id,username,display_name,channel_name,avatar_url'\)/);
  assert.match(battle, /id="oppAvatar"/);
  assert.match(battle, /id="oppName"/);
  assert.match(battle, /id="oppHandle"/);
});

test('match page does not contain matchmaking, room-code, or out-of-match menu controls', () => {
  assert.doesNotMatch(battle, /joinCode|join code|createRoom|Matchmake|private room/i);
  assert.doesNotMatch(battle, /Main Menu|Create New Deck|Find Opponent/i);
});

test('battle settings exposes only explicit server concession and terminal results return to fresh matchmaking', () => {
  assert.match(battle, /id="battleSettings"/);
  assert.match(battle, /data-concede="1"/);
  assert.match(battle, />Quit Match<\/button>/);
  assert.match(battle, /Quit Match is a concession/);
  assert.match(controller, /async function runConcede\(\)/);
  assert.match(controller, /callEdge\(API_MATCH, actionBase\('concede'\)\)/);
  assert.doesNotMatch(controller, /\bconfirm\s*\(/);
  assert.doesNotMatch(controller, /beforeunload[\s\S]{0,500}concede/);
  assert.match(controller, />Back to Matchmaking<\/button>/);
  assert.match(controller, /window\.location\.href = 'tcg-play\.html'/);
  assert.doesNotMatch(controller, /data-result-continue[\s\S]{0,500}match_id/);
});

test('existing battle controller still binds the route to authoritative match identity', () => {
  assert.match(controller, /new URLSearchParams\(window\.location\.search\)\.get\('match_id'\)/);
  assert.match(controller, /callEdge\(API_SETUP, \{ action: 'match_view', match_id: state\.matchId \}\)/);
  assert.match(controller, /callEdge\(API_MATCH, Object\.assign\(actionBase\('attack'\)/);
});
