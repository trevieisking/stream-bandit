import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

test('generic Tactic route is explicitly fenced to Ally and Device', () => {
  const start = tactic.indexOf('function tacticPlayability');
  const end = tactic.indexOf('function ', start + 1);
  assert.ok(start >= 0);
  const section = tactic.slice(start, end > start ? end : start + 9000);
  assert.match(section, /subtype !== "Ally" && subtype !== "Device"/);
  assert.match(section, /tactic_subtype_uses_dedicated_owner/);
});

test('dedicated-owner fence executes before Ally first-turn and effect legality checks', () => {
  const routeFence = tactic.indexOf('tactic_subtype_uses_dedicated_owner');
  const allyFence = tactic.indexOf('first_player_cannot_play_ally_on_first_turn');
  const playFence = tactic.indexOf('tactic_play_requirement_not_met');
  assert.ok(routeFence >= 0 && allyFence > routeFence && playFence > allyFence);
});

test('projection and real play still share the same fenced evaluator', () => {
  const preview = tactic.indexOf('if (action === "play_tactic_legality")');
  const play = tactic.indexOf('if (action === "play_tactic")', preview + 1);
  assert.ok(preview >= 0 && play > preview);
  assert.match(tactic.slice(preview, play), /tacticPlayability\(state, seat, body\.card_uid\)/);
  assert.match(tactic.slice(play, play + 1600), /tacticPlayability\(state, seat, body\.card_uid\)/);
});

test('browser remains untouched until the dedicated Tactic browser slice', () => {
  assert.doesNotMatch(controller, /API_TACTIC/);
  assert.doesNotMatch(controller, /play_tactic_legality/);
  assert.doesNotMatch(controller, /data-card-intent="play_tactic"/);
});
