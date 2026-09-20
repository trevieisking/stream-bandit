import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const battle = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const matchActions = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-match-actions', 'index.ts'), 'utf8');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'tcg-battle-client-interaction-v1.json'), 'utf8'));

test('Battle v0.7 follows the recorded tabletop interaction layout without restoring a site shell', () => {
  assert.match(battle, /data-sb-tcg-battle-layout="tabletop-v0-7"/);
  assert.match(battle, /id="oppReserve"/);
  assert.match(battle, /id="oppVanguard"/);
  assert.match(battle, /id="youVanguard"/);
  assert.match(battle, /id="youReserve"/);
  assert.match(battle, /id="yourHand"/);
  assert.match(battle, /id="oppRewards"/);
  assert.match(battle, /id="yourRewards"/);
  assert.match(battle, /id="oppDeck"/);
  assert.match(battle, /id="yourDeck"/);
  assert.match(battle, /id="oppDiscard"/);
  assert.match(battle, /id="yourDiscard"/);
  assert.doesNotMatch(battle, /stream-bandit-shell-v6-24\.js/);
  assert.doesNotMatch(battle, /stream-bandit-theme-projector/i);
});

test('phone battlefield gives the field full width and does not cover it with sticky chrome', () => {
  assert.match(battle, /@media\(max-width:640px\), \(hover:none\) and \(pointer:coarse\)/);
  assert.match(battle, /overflow-y:auto/);
  assert.match(battle, /grid-template-areas:"rail-left rail-right" "field field"/);
  assert.match(battle, /\.sb-half>\.sb-field-core\{grid-area:field\}/);
  assert.match(battle, /\.sb-reserve\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(battle, /\.sb-player-strip\{[\s\S]*?position:relative;top:auto/);
  assert.match(battle, /\.sb-hand-wrap\{[\s\S]*?position:relative;bottom:auto/);
  assert.match(battle, /\.sb-realm\{display:none\}/);
  assert.match(battle, /@media\(max-width:960px\) and \(orientation:landscape\), \(hover:none\) and \(pointer:coarse\) and \(orientation:landscape\)/);
  assert.match(battle, /scroll-snap-type:x proximity/);
});

test('desktop battlefield gives Vanguard and Reserves independent height-bounded rows', () => {
  assert.match(battle, /@media\(min-width:641px\) and \(hover:hover\) and \(pointer:fine\)/);
  assert.match(battle, /grid-template-rows:auto minmax\(0,1fr\) minmax\(68px,auto\) minmax\(0,1fr\) clamp\(132px,17\.2dvh,166px\)/);
  assert.match(battle, /\.sb-field-core\{[\s\S]*?grid-template-rows:minmax\(0,1fr\) minmax\(0,1\.18fr\)/);
  assert.match(battle, /\.sb-half-you \.sb-field-core\{[\s\S]*?grid-template-rows:minmax\(0,1\.18fr\) minmax\(0,1fr\)/);
  assert.match(battle, /\.sb-reserve,\.sb-vanguard-line\{[\s\S]*?height:100%;[\s\S]*?align-items:stretch/);
  assert.match(battle, /\.sb-reserve-slot,\.sb-vanguard-slot\{[\s\S]*?height:100%;[\s\S]*?min-height:0/);
  assert.match(battle, /#oppVanguard,#youVanguard\{[\s\S]*?width:100%;[\s\S]*?height:100%;[\s\S]*?display:grid;[\s\S]*?place-items:center/);
  assert.match(battle, /\.sb-reserve-slot \.sb-card-wrap,[\s\S]*?\.sb-vanguard-slot \.sb-card-wrap\{[\s\S]*?height:100%;[\s\S]*?place-items:center/);
  assert.match(battle, /\.sb-reserve-slot \.sb-card-control,[\s\S]*?\.sb-vanguard-slot \.sb-card-control\{[\s\S]*?height:calc\(100% - 8px\);[\s\S]*?width:auto;[\s\S]*?max-width:calc\(100% - 8px\)/);
  assert.match(battle, /\.sb-card-wrap\.is-selected \.sb-card-actions\{[\s\S]*?position:absolute;[\s\S]*?bottom:4px;[\s\S]*?left:50%;[\s\S]*?width:min\(180px,calc\(100% - 10px\)\);[\s\S]*?max-height:calc\(100% - 8px\);[\s\S]*?overflow-y:auto/);
  assert.match(battle, /\.sb-card-wrap\.has-setup-return \.sb-card-actions\{[\s\S]*?position:absolute;[\s\S]*?bottom:5px;[\s\S]*?left:50%;[\s\S]*?width:min\(120px,calc\(100% - 10px\)\)/);
  assert.match(battle, /\.sb-hand-card\{[\s\S]*?height:100%;[\s\S]*?max-height:100%;[\s\S]*?width:auto;[\s\S]*?flex:0 0 auto/);
});


test('opening toss is rendered from authoritative toss_winner_seat and never randomized in browser', () => {
  assert.match(controller, /Number\(view\.toss_winner_seat\) === youSeat/);
  assert.match(controller, /data-opening-choice="first"/);
  assert.match(controller, /data-opening-choice="second"/);
  assert.match(controller, /runAuthoritativeSetupAction\(\s*'opening_choice'/);
  assert.match(controller, /\{ choice \}/);
  assert.doesNotMatch(controller, /Math\.random\s*\(/);
  assert.doesNotMatch(controller, /crypto\.getRandomValues\s*\(/);
});

test('opening setup uses the existing server setup actions and guides Vanguard before Reserves', () => {
  assert.match(controller, /data-setup-hand-uid/);
  assert.match(controller, /dataset\.setupDestination = 'vanguard'/);
  assert.match(controller, /const setupAvailable = !!\(yourSetup && hasVanguard && !creature\)/);
  assert.match(controller, /setupLegal = !!\(setupAvailable && state\.selectedHandUid && setupTargetLegal\('reserve', index\)\)/);
  assert.match(controller, /selected — tap Your Vanguard first/);
  assert.match(controller, /Choose an eligible Creature for Your Vanguard first/);
  assert.match(controller, /runAuthoritativeSetupAction\('setup_place'/);
  assert.match(controller, /runAuthoritativeSetupAction\('setup_return'/);
  assert.match(controller, /runAuthoritativeSetupAction\('setup_ready'/);
  assert.match(controller, /client_nonce: crypto\.randomUUID\(\)/);
  assert.match(controller, /expected_revision: revision\(\)/);
});

test('End Turn is a browser control for the existing tcg-match-actions lifecycle owner', () => {
  assert.match(matchActions, /if\(action==="end_turn"\)\{/);
  assert.match(matchActions, /aftermath\(seat\);return json\(\{version:VERSION,result:await commit\("end_turn",\{seat\}\)\}\)/);
  assert.match(controller, /data-end-turn="1"/);
  assert.match(controller, /async function runEndTurn\(\)/);
  assert.match(controller, /view\.phase !== 'play'/);
  assert.match(controller, /Number\(view\.active_seat\) !== youSeat/);
  assert.match(controller, /hasPendingAction\(view\)/);
  assert.match(controller, /await callEdge\(API_MATCH, actionBase\('end_turn'\)\)/);
});

test('phone setup selection scrolls toward the canonical destination instead of hiding it behind the hand', () => {
  assert.match(controller, /window\.matchMedia\('\(max-width: 640px\), \(hover: none\) and \(pointer: coarse\)'\)\.matches/);
  assert.match(controller, /const target = hasVanguard \? \$\('youReserve'\) : \$\('youVanguardSlot'\)/);
  assert.match(controller, /target\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
});

test('browser setup guidance does not replace the server legality owner', () => {
  assert.match(controller, /SETUP_RECIPES/);
  assert.match(controller, /await callEdge\(API_SETUP, Object\.assign\(actionBase\(action\), extra \|\| \{\}\)\)/);
  assert.doesNotMatch(controller, /phase\s*=\s*['"]play['"]/);
  assert.doesNotMatch(controller, /toss_winner_seat\s*=/);
  assert.doesNotMatch(controller, /first_player_seat\s*=/);
});

test('toss reveal is stable between polling refreshes and setup placements can be corrected', () => {
  assert.match(battle, /\.sb-card-wrap\.has-setup-return \.sb-card-actions/);
  assert.match(controller, /opts\.setupReturn \? ' has-setup-return' : ''/);
  assert.match(controller, /data-setup-return=/);
  const refreshStart = controller.indexOf('async function refreshMatch()');
  const pollStart = controller.indexOf('function startPoll()', refreshStart);
  const refreshBody = controller.slice(refreshStart, pollStart);
  assert.doesNotMatch(refreshBody, /state\.overlayKey\s*=\s*''/);
});

test('recorded interaction contract still requires the same opening and board grammar', () => {
  assert.equal(contract.board.opponent_position, 'top');
  assert.equal(contract.board.player_position, 'bottom');
  assert.equal(contract.board.vanguard_slots_per_player, 1);
  assert.equal(contract.board.reserve_slots_per_player, 4);
  assert.equal(contract.board.reward_cards_per_player, 6);
  assert.equal(contract.board.show_deck_pile, true);
  assert.equal(contract.board.show_discard_pile, true);
  assert.equal(contract.board.hand_position, 'bottom_edge');
  assert.equal(contract.board.board_remains_visible_during_choices, true);
  const opening = contract.required_flows.find((flow) => flow.id === 'opening_setup');
  assert.deepEqual(opening.steps, ['opening_choice', 'opening_hand', 'place_vanguard', 'place_reserves', 'confirm_setup', 'install_rewards']);
});
