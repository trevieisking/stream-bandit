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

test('Battle compact tabletop follows the recorded interaction layout without restoring a site shell', () => {
  assert.match(battle, /data-sb-tcg-battle-layout="tabletop-v0-9-hand-peek"/);
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

test('phone battlefield keeps all zones visible while the bottom hand is a horizontal card tray', () => {
  assert.match(battle, /@media\(max-width:640px\), \(hover:none\) and \(pointer:coarse\)/);
  assert.match(battle, /grid-template-areas:"rail-left field rail-right"/);
  assert.match(battle, /\.sb-half>\.sb-field-core\{grid-area:field\}/);
  assert.match(battle, /\.sb-reserve\{height:100%;min-height:0;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(battle, /\.sb-player-strip\{min-height:0;height:44px/);
  assert.match(battle, /\.sb-hand-wrap\{[\s\S]*?height:94px;min-height:0;overflow:hidden/);
  assert.match(battle, /\.sb-hand\{[\s\S]*?height:76px[\s\S]*?overflow-x:auto;overflow-y:hidden/);
  assert.match(battle, /\.sb-hand-card\{[\s\S]*?height:152px[\s\S]*?margin-right:-14px/);
  assert.match(battle, /\.sb-realm\{display:none\}/);
  assert.match(battle, /scroll-snap-type:x proximity/);
});

test('desktop battlefield gives Vanguard and Reserves independent height-bounded rows', () => {
  assert.match(battle, /@media\(min-width:641px\)\{/);
  assert.doesNotMatch(battle, /@media\(min-width:641px\) and \(hover:hover\) and \(pointer:fine\)/);
  assert.match(battle, /grid-template-rows:auto minmax\(0,1fr\) minmax\(68px,auto\) minmax\(0,1fr\) clamp\(88px,10\.8dvh,108px\)/);
  assert.match(battle, /\.sb-field-core\{[\s\S]*?grid-template-rows:minmax\(0,1fr\) minmax\(0,1\.18fr\)/);
  assert.match(battle, /\.sb-half-you \.sb-field-core\{[\s\S]*?grid-template-rows:minmax\(0,1\.18fr\) minmax\(0,1fr\)/);
  assert.match(battle, /\.sb-reserve,\.sb-vanguard-line\{[\s\S]*?height:100%;[\s\S]*?align-items:stretch/);
  assert.match(battle, /\.sb-reserve-slot,\.sb-vanguard-slot\{[\s\S]*?height:100%;[\s\S]*?min-height:0/);
  assert.match(battle, /#oppVanguard,#youVanguard\{[\s\S]*?width:100%;[\s\S]*?height:100%;[\s\S]*?display:grid;[\s\S]*?place-items:center/);
  assert.match(battle, /\.sb-reserve-slot \.sb-card-wrap,[\s\S]*?\.sb-vanguard-slot \.sb-card-wrap\{[\s\S]*?height:100%;[\s\S]*?place-items:center/);
  assert.match(battle, /\.sb-reserve-slot \.sb-card-control\{[\s\S]*?width:min\(var\(--card-w\),10\.36dvh\);[\s\S]*?height:auto;[\s\S]*?max-height:calc\(100% - 8px\)/);
  assert.match(battle, /\.sb-vanguard-slot \.sb-card-control\{[\s\S]*?width:min\(var\(--active-w\),11\.79dvh\);[\s\S]*?height:auto;[\s\S]*?max-height:calc\(100% - 8px\)/);
  assert.match(battle, /\.sb-card-wrap\.is-selected \.sb-card-actions\{[\s\S]*?position:absolute;[\s\S]*?bottom:4px;[\s\S]*?left:50%;[\s\S]*?width:min\(180px,calc\(100% - 10px\)\);[\s\S]*?max-height:calc\(100% - 8px\);[\s\S]*?overflow-y:auto/);
  assert.match(battle, /\.sb-card-wrap\.has-setup-return \.sb-card-actions\{[\s\S]*?position:absolute;[\s\S]*?bottom:5px;[\s\S]*?left:50%;[\s\S]*?width:min\(120px,calc\(100% - 10px\)\)/);
  assert.match(battle, /\.sb-hand-card\{[\s\S]*?height:clamp\(138px,17\.2dvh,172px\);[\s\S]*?width:auto;[\s\S]*?max-height:none;[\s\S]*?margin-right:-14px/);
  assert.match(battle, /\.sb-card-control-shell\.is-selected\{[\s\S]*?position:relative/);
  assert.match(battle, /\.sb-card-inspector-panel\{[\s\S]*?width:min\(390px,36vw,48dvh\);[\s\S]*?max-height:86dvh/);
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

test('phone setup keeps destinations visible and scrolls only the horizontal hand rail', () => {
  assert.doesNotMatch(controller, /scrollIntoView\(/);
  assert.match(controller, /Setup destinations remain visible in the one-viewport tabletop/);
  assert.match(battle, /\.sb-hand\{[\s\S]*?overflow-x:auto;overflow-y:hidden/);
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
  assert.equal(contract.board.normal_browser_zoom_required, true);
  assert.equal(contract.board.field_card_presentation, 'bounded_compact_art_status_preview');
  assert.equal(contract.board.full_card_presentation, 'click_or_tap_opens_shared_inspect_face_with_moves_and_abilities');
  assert.equal(contract.board.hand_behavior, 'bottom_edge_peek_fan_horizontal_scroll');
  assert.equal(contract.board.mobile_hand_behavior, 'larger_cards_partially_clipped_below_bottom_rail_swipe_left_right');
  assert.equal(contract.board.viewport_contract, 'entire_battlefield_plus_hand_visible_in_one_device_viewport_at_normal_zoom');
  assert.equal(contract.input_modes.mobile_hand_horizontal_scroll_required, true);
  assert.equal(contract.board.hand_cards_may_extend_below_visible_rail, true);
  assert.deepEqual(contract.non_battle_card_inspection.pages, ['decks', 'collection', 'battlepass']);
  assert.equal(contract.non_battle_card_inspection.mode, 'inspect');
  assert.equal(contract.non_battle_card_inspection.read_only, true);
  const opening = contract.required_flows.find((flow) => flow.id === 'opening_setup');
  assert.deepEqual(opening.steps, ['opening_choice', 'opening_hand', 'place_vanguard', 'place_reserves', 'confirm_setup', 'install_rewards']);
});
