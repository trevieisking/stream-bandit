import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const lab = fs.readFileSync('t.html', 'utf8');
const setup = fs.readFileSync('supabase/functions/tcg-private-alpha-api/index.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const flow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-engine-v0-2.ts', 'utf8');
const matchmaking = fs.readFileSync('supabase/migrations/20260905110000_tcg_automatic_matchmaking.sql', 'utf8').toLowerCase();
const progression = fs.readFileSync('supabase/migrations/20260905111500_tcg_arcade_progression_and_rewards.sql', 'utf8').toLowerCase();

function hasAction(source, action) {
  return source.includes(`action===\"${action}\"`) ||
    source.includes(`action === \"${action}\"`) ||
    source.includes(`action==='${action}'`) ||
    source.includes(`action === '${action}'`);
}

test('ordinary two-player Arcade journey stays connected from client to canonical terminal settlement', () => {
  for (const owner of [
    "const API_SETUP='tcg-private-alpha-api'",
    "const API_MATCH='tcg-match-actions'",
    "const API_TACTIC='tcg-tactic-actions'",
  ]) assert.ok(lab.includes(owner), `client owner missing: ${owner}`);

  for (const action of ['matchmake', 'match_view', 'opening_choice', 'setup_place', 'setup_ready']) {
    assert.ok(hasAction(setup, action), `setup server missing ${action}`);
  }
  assert.ok(setup.includes('tcg_server_matchmake'), 'setup server must delegate Arcade pairing to the server matchmaking RPC');
  assert.ok(matchmaking.includes('create or replace function public.tcg_server_matchmake'), 'automatic matchmaking RPC must exist');
  assert.ok(matchmaking.includes('tcg_server_prepare_match'), 'matchmaking must prepare the paired match through the canonical match shell');

  assert.ok(hasAction(match, 'concede'), 'match owner must expose a terminal player action');
  assert.ok(flow.includes('phase: "complete"') || flow.includes('phase:"complete"') || flow.includes('state.phase = "complete"') || flow.includes('state.phase="complete"'), 'Match Flow must own the canonical complete phase');

  assert.ok(progression.includes('create or replace function public.tcg_server_award_match_rewards'), 'Arcade reward awarder must exist');
  assert.ok(progression.includes("v_phase='complete'") || progression.includes("v_phase = 'complete'"), 'commit path must recognize canonical completion');
  assert.ok(progression.includes('tcg_server_award_match_rewards'), 'completion path must call the idempotent Arcade reward awarder');
  assert.ok(progression.includes("status='finished'") || progression.includes("status = 'finished'"), 'canonical completion must finish the persisted match');

  assert.match(lab, /phase\s*===\s*['"]complete['"][\s\S]{0,240}loadAccount\s*\(/, 'client must refresh account/progression after match completion');
});

test('playable-path guard does not create a second gameplay authority', () => {
  assert.ok(setup.includes('runtimeV02ApplyOpeningChoice'), 'opening choice must stay delegated to Match Flow');
  assert.ok(setup.includes('runtimeV02ApplySetupReady'), 'setup completion must stay delegated to Match Flow');
  assert.ok(match.includes('runtimeV02ContinueResolution'), 'battle resolution must stay delegated to Match Flow');
  assert.equal(/function\s+tcg_server_matchmake/i.test(match), false, 'Edge match owner must not duplicate matchmaking SQL authority');
  assert.equal(/function\s+tcg_server_award_match_rewards/i.test(match), false, 'Edge match owner must not duplicate reward-settlement SQL authority');
});
