import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controllerPath = path.join(root, 'stream-bandit-tcg-v2-battle-controller.js');
const surfacePath = path.join(root, 'tcg-battle-v2.html');
const contractPath = path.join(root, 'tcg-battle-client-interaction-v1.json');
const controller = fs.readFileSync(controllerPath, 'utf8');
const surface = fs.readFileSync(surfacePath, 'utf8');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const flow = (id) => contract.required_flows.find((entry) => entry.id === id);

test('V2 battle surface makes the creature card the primary control without replacing the old lab', () => {
  assert.match(surface, /data-sb-tcg-v2-battle="card-control-v0-1"/);
  assert.match(surface, /id="youVanguard"/);
  assert.match(surface, /stream-bandit-tcg-v2-battle-controller\.js/);
  assert.doesNotMatch(surface, /Debug/i);
  assert.ok(contract.input_modes.desktop.includes('click_select'));
  assert.deepEqual(flow('creature_context').steps.slice(0, 3), ['select_creature', 'enlarge_card', 'show_ability_or_attack_slots']);
  assert.ok(contract.forbidden_client_patterns.includes('generic_global_attack_buttons_as_primary_attack_ui'));
  assert.ok(contract.forbidden_client_patterns.includes('debug_form_layout_as_release_battlefield'));
});

test('active Creature attack intent preserves the existing authoritative transport fence', () => {
  assert.match(controller, /const API_MATCH = 'tcg-match-actions'/);
  assert.match(controller, /actionBase\('attack'\)/);
  assert.match(controller, /attack_slot: attackSlot/);
  assert.match(controller, /match_id: state\.matchId/);
  assert.match(controller, /client_nonce: crypto\.randomUUID\(\)/);
  assert.match(controller, /expected_revision: revision\(\)/);
  assert.match(controller, /await refreshMatch\(\)/);
  assert.equal(contract.authority.server_authoritative, true);
  assert.ok(flow('attack').steps.includes('server_validate'));
});

test('V2 attack controller does not implement card-specific gameplay branches', () => {
  const forbiddenRuntimeNames = [
    'gale-skyrend',
    'tide-tideroar',
    'volt-stormmane',
    'astral-cosmarch',
    'astral-celestyr-dream-cartographer',
    'astral-nebulynx',
    'grove-myceliarch'
  ];
  for (const id of forbiddenRuntimeNames) assert.doesNotMatch(controller, new RegExp(id, 'i'), `${id} must remain server-owned`);
  assert.doesNotMatch(controller, /if\s*\([^)]*(?:card_id|\.id)[^)]*===/i);
  assert.doesNotMatch(controller, /damage\s*[+\-*]=/i);
  assert.doesNotMatch(controller, /essence[^\n]{0,40}(?:pay|cost)[^\n]{0,40}(?:>=|<=|===)/i);
  assert.ok(contract.forbidden_client_patterns.includes('duplicate_browser_rules_engine'));
});

test('V2 browser targeting is card/board based, never prompt or confirm based', () => {
  assert.doesNotThrow(() => new Function(controller));
  assert.doesNotMatch(controller, /\bprompt\s*\(/);
  assert.doesNotMatch(controller, /\bconfirm\s*\(/);
  assert.doesNotMatch(controller, /Math\.random\s*\(/);
  assert.ok(contract.forbidden_client_patterns.includes('browser_prompt_for_gameplay_targeting'));
});

test('card selection is presentation-only and attack slots come from structured card data', () => {
  assert.match(controller, /data-card-anchor/);
  assert.match(controller, /data-card-intent="attack"/);
  assert.match(controller, /definition_v0_2/);
  assert.match(controller, /structured\.creature\.attacks/);
  assert.match(controller, /state\.selectedAnchorUid/);
  assert.deepEqual(flow('attack').steps.slice(0, 3), ['select_vanguard', 'choose_attack_1_or_attack_2', 'show_attack_cost']);
});
