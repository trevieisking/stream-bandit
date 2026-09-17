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

test('V2 battle surface makes the creature card the primary control without replacing the old lab', () => {
  assert.match(surface, /data-sb-tcg-v2-battle="card-control-v0-1"/);
  assert.match(surface, /id="youVanguard"/);
  assert.match(surface, /stream-bandit-tcg-v2-battle-controller\.js/);
  assert.doesNotMatch(surface, /Debug/i);
  assert.doesNotMatch(surface, /generic global attack/i);
  assert.equal(contract.interaction_model.card_face_primary_control, true);
});

test('active Creature attack intent preserves the existing authoritative transport fence', () => {
  assert.match(controller, /const API_MATCH = 'tcg-match-actions'/);
  assert.match(controller, /actionBase\('attack'\)/);
  assert.match(controller, /attack_slot: attackSlot/);
  assert.match(controller, /match_id: state\.matchId/);
  assert.match(controller, /client_nonce: crypto\.randomUUID\(\)/);
  assert.match(controller, /expected_revision: revision\(\)/);
  assert.match(controller, /await refreshMatch\(\)/);
  assert.equal(contract.interaction_model.server_authoritative, true);
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
});

test('card selection is presentation-only and attack slots come from structured card data', () => {
  assert.match(controller, /data-card-anchor/);
  assert.match(controller, /data-card-intent="attack"/);
  assert.match(controller, /definition_v0_2/);
  assert.match(controller, /structured\.creature\.attacks/);
  assert.match(controller, /state\.selectedAnchorUid/);
  assert.equal(contract.interaction_model.illegal_drop_behavior, 'snap_back');
  assert.equal(contract.interaction_model.prevent_double_resolution, true);
});
