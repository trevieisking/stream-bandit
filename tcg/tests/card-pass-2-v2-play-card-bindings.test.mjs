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
const evolutionOwner = fs.readFileSync(path.join(root, 'supabase', 'functions', '_shared', 'tcg-match-evolution-legality-v0-2.ts'), 'utf8');
const tacticActions = fs.readFileSync(path.join(root, 'supabase', 'functions', 'tcg-tactic-actions', 'index.ts'), 'utf8');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'tcg-battle-client-interaction-v1.json'), 'utf8'));

test('Battle keeps the accepted v0.7 geometry and v0.8 play bindings while adding the shared card-face bridge', () => {
  assert.match(battle, /data-sb-tcg-battle-layout="tabletop-v0-7"/);
  assert.match(battle, /data-sb-tcg-play-bindings="v0-8"/);
  assert.match(battle, /data-sb-tcg-card-face="v1"/);
  assert.match(battle, /stream-bandit-tcg-card-renderer-v2-4-51\.js/);
  assert.match(battle, /stream-bandit-tcg-v2-battle-controller\.js\?v=0-15-stable-card-focus/);
  assert.match(controller, /Stream Bandit TCG V2 Battle Controller v0\.15-stable-card-focus/);
});

test('play-phase hand cards become selectable and desktop-draggable without changing setup binding', () => {
  assert.match(controller, /data-play-hand-uid=/);
  assert.match(controller, /data-play-intent=/);
  assert.match(controller, /draggable="' \+ \(touchPrimaryInput\(\) \? 'false' : 'true'\) \+ '"/);
  assert.match(controller, /addEventListener\('dragstart'/);
  assert.match(controller, /addEventListener\('dragover'/);
  assert.match(controller, /addEventListener\('drop'/);
  assert.match(controller, /data-setup-hand-uid=/);
  assert.match(battle, /\.sb-hand-card\.is-play-selected/);
  assert.match(battle, /\.sb-play-destination\.is-play-legal/);
});

test('touch and click use the same selected-card to destination transport path', () => {
  assert.match(controller, /document\.querySelectorAll\('\[data-play-hand-uid\]'/);
  assert.match(controller, /document\.querySelectorAll\('\[data-play-where\]'/);
  assert.match(controller, /await runPlayHandTarget\(where, index\)/);
  assert.match(controller, /window\.matchMedia\('\(max-width: 640px\), \(hover: none\) and \(pointer: coarse\)'\)\.matches/);
  assert.match(controller, /scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
});

test('hand intents map only to existing authoritative server owners', () => {
  for (const action of ['play_creature', 'evolve', 'attach_essence', 'attach_relic', 'play_realm']) {
    assert.match(matchActions, new RegExp('action===["\\\']' + action + '["\\\']'));
    assert.match(controller, new RegExp("['\\\"]" + action + "['\\\"]"));
  }
  assert.match(tacticActions, /\["play_tactic", "resolve_choice"\]/);
  assert.match(controller, /const API_TACTIC = 'tcg-tactic-actions'/);
  assert.match(controller, /runPlayCommand\(\s*API_TACTIC,\s*'play_tactic'/);
});

test('play Creature uses an empty Reserve and keeps server legality final', () => {
  assert.match(controller, /intent === 'play_creature'\) return where === 'reserve' && !creature/);
  assert.match(controller, /\{ card_uid: cardUid, reserve_index: Number\(index\) \}/);
  assert.match(controller, /await callEdge\(endpointName, Object\.assign\(actionBase\(action\), payload \|\| \{\}\)\)/);
  assert.match(matchActions, /empty_reserve_slot_required/);
  assert.match(matchActions, /baby_standalone_or_mythic_required/);
});

test('evolution selection is a UI candidate only and server validates predecessor and turn legality', () => {
  assert.match(controller, /intent === 'evolve'/);
  assert.match(controller, /definition\.evolves_from_id/);
  assert.match(controller, /'evolve',[\s\S]*?\{ card_uid: cardUid, where \}/);
  assert.match(matchActions, /runtimeV02ValidateEvolutionDeclaration/);
  assert.match(evolutionOwner, /evolution_predecessor_mismatch/);
  assert.match(evolutionOwner, /evolution_locked_on_first_personal_turn/);
  assert.match(evolutionOwner, /stack_entered_or_evolved_this_turn/);
  assert.match(evolutionOwner, /one_evolution_per_stack_per_turn/);
});

test('Essence and Relic attach through existing match-action owners', () => {
  assert.match(controller, /intent === 'attach_essence'/);
  assert.match(controller, /'attach_essence'/);
  assert.match(controller, /intent === 'attach_relic'/);
  assert.match(controller, /'attach_relic'/);
  assert.match(matchActions, /manual_essence_already_used_this_turn/);
  assert.match(matchActions, /essence_card_required/);
  assert.match(matchActions, /creature_already_has_relic/);
  assert.match(matchActions, /relic_card_required/);
});

test('Realm and structured Tactic use explicit server-backed Play controls', () => {
  assert.match(controller, /data-play-direct=/);
  assert.match(controller, /Play Realm/);
  assert.match(controller, /Play Tactic/);
  assert.match(controller, /runDirectHandPlay/);
  assert.match(controller, /runPlayCommand\(\s*API_MATCH,\s*'play_realm'/);
  assert.match(controller, /runPlayCommand\(\s*API_TACTIC,\s*'play_tactic'/);
  assert.match(matchActions, /realm_card_required/);
  assert.match(tacticActions, /structured_tactic_required/);
});

test('server choice options are rendered from returned labels and resolved by id', () => {
  assert.match(controller, /currentServerChoice\(view\)/);
  assert.match(controller, /data-server-choice-option=/);
  assert.match(controller, /data-server-choice-confirm=/);
  assert.match(controller, /choice\.options/);
  assert.match(controller, /choice_id: String\(choice\.id \|\| ''\)/);
  assert.match(controller, /choice_ids: ids/);
  assert.match(tacticActions, /selectChoiceOptions\(pending, ids\)/);
});

test('browser never becomes a duplicate game engine', () => {
  assert.doesNotMatch(controller, /Math\.random\s*\(/);
  assert.doesNotMatch(controller, /crypto\.getRandomValues\s*\(/);
  assert.doesNotMatch(controller, /\.phase\s*=\s*['"]play['"]/);
  assert.doesNotMatch(controller, /manual_essence_turn\s*=/);
  assert.doesNotMatch(controller, /evolved_turn\s*=/);
});

test('recorded interaction contract still requires desktop drag/drop and touch destination play', () => {
  assert.ok(contract.input_modes.desktop.includes('drag_drop'));
  assert.ok(contract.input_modes.touch.includes('tap_select'));
  assert.ok(contract.input_modes.touch.includes('tap_destination'));
  for (const id of ['play_creature', 'evolve_creature', 'attach_essence', 'play_tactic']) {
    assert.ok(contract.required_flows.some((flow) => flow.id === id));
  }
});
