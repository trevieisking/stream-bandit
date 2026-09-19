import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const battle = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'tcg-battle-client-interaction-v1.json'), 'utf8'));

test('Battle v0.5 follows the recorded tabletop interaction layout without restoring a site shell', () => {
  assert.match(battle, /data-sb-tcg-battle-layout="tabletop-v0-5"/);
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

test('phone portrait keeps the board usable without requiring rotation', () => {
  assert.match(battle, /@media\(max-width:640px\)/);
  assert.match(battle, /overflow-y:auto/);
  assert.match(battle, /grid-template-columns:48px minmax\(0,1fr\) 48px/);
  assert.match(battle, /--active-w:min\(34vw,142px\)/);
  assert.match(battle, /\.sb-hand-wrap\{min-height:150px;overflow:visible/);
  assert.match(battle, /scroll-snap-type:x proximity/);
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

test('opening setup uses the existing server setup actions and card-zone destinations', () => {
  assert.match(controller, /data-setup-hand-uid/);
  assert.match(controller, /data-setup-destination="reserve"/);
  assert.match(controller, /dataset\.setupDestination = 'vanguard'/);
  assert.match(controller, /runAuthoritativeSetupAction\('setup_place'/);
  assert.match(controller, /runAuthoritativeSetupAction\('setup_return'/);
  assert.match(controller, /runAuthoritativeSetupAction\('setup_ready'/);
  assert.match(controller, /client_nonce: crypto\.randomUUID\(\)/);
  assert.match(controller, /expected_revision: revision\(\)/);
});

test('browser setup guidance does not replace the server legality owner', () => {
  assert.match(controller, /SETUP_RECIPES/);
  assert.match(controller, /await callEdge\(API_SETUP, Object\.assign\(actionBase\(action\), extra \|\| \{\}\)\)/);
  assert.doesNotMatch(controller, /phase\s*=\s*['"]play['"]/);
  assert.doesNotMatch(controller, /toss_winner_seat\s*=/);
  assert.doesNotMatch(controller, /first_player_seat\s*=/);
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
