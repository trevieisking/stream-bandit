import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

test('Tactic owner exposes read-only playability through the same evaluator used by play_tactic', () => {
  assert.match(tactic, /function tacticPlayability\(/);
  assert.match(tactic, /"play_tactic_legality"/);
  const preview = tactic.indexOf('if (action === "play_tactic_legality")');
  const play = tactic.indexOf('if (action === "play_tactic")', preview + 1);
  assert.ok(preview >= 0 && play > preview);
  assert.match(tactic.slice(preview, play), /tacticPlayability\(state, seat, body\.card_uid\)/);
  assert.match(tactic.slice(play, play + 1500), /tacticPlayability\(state, seat, body\.card_uid\)/);
});

test('playability evaluator preserves the accepted Tactic play fences and public reasons', () => {
  for (const reason of [
    'not_active_player',
    'effect_resolution_already_pending',
    'tactic_not_in_hand',
    'structured_tactic_required',
    'first_player_cannot_play_ally_on_first_turn',
    'tactic_play_requirement_not_met',
    'required_tactic_target_unavailable',
    'required_tactic_resource_unavailable',
    'tactic_lifecycle_contract_unsupported',
  ]) {
    assert.match(tactic, new RegExp(reason));
  }
  assert.match(tactic, /unsupported_ops: unsupported/);
});

test('real Tactic mutation still starts only after shared playability succeeds', () => {
  const play = tactic.indexOf('if (action === "play_tactic")');
  const remove = tactic.indexOf('player.hand.splice(index, 1)', play);
  const validate = tactic.indexOf('const legality = tacticPlayability(state, seat, body.card_uid)', play);
  assert.ok(play >= 0 && validate > play && remove > validate);
  assert.match(tactic.slice(validate, remove), /if \(!legality\.eligible\)/);
});

test('later browser transport consumes V2.4.17 playability without taking Tactic legality ownership', () => {
  assert.match(controller, /const API_TACTIC = 'tcg-tactic-actions'/);
  assert.match(controller, /actionBase\('play_tactic_legality'\)/);
  assert.match(controller, /actionBase\('play_tactic'\)/);
  assert.match(controller, /actionBase\('resolve_choice'\)/);
  for (const reason of [
    'first_player_cannot_play_ally_on_first_turn',
    'tactic_play_requirement_not_met',
    'required_tactic_target_unavailable',
    'required_tactic_resource_unavailable',
    'tactic_lifecycle_contract_unsupported',
  ]) {
    assert.doesNotMatch(controller, new RegExp(reason));
  }
});
