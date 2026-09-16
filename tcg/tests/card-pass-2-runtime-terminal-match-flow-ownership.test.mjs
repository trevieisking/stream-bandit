import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchActions = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const matchFlow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-engine-v0-2.ts', 'utf8');
const resolutionFlow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-resolution-v0-2.ts', 'utf8');
const turnFlow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-turn-v0-2.ts', 'utf8');

test('terminal winner evaluation is owned by Match Flow and dispatcher does not duplicate it', () => {
  assert.equal(matchActions.includes('runtimeV02EvaluateWinner'), false, 'dispatcher retained direct terminal evaluator authority');
  assert.ok(matchActions.includes('runtimeV02ContinueResolution'), 'dispatcher must route resolution terminal preflight through Match Flow');
  assert.ok(matchActions.includes('runtimeV02AdvanceTurn'), 'dispatcher must route turn terminal preflight through Match Flow');

  assert.ok(resolutionFlow.includes('runtimeV02EvaluateWinner(state)'), 'resolution Match Flow lost terminal preflight');
  assert.ok(turnFlow.includes('runtimeV02EvaluateWinner(state)'), 'turn Match Flow lost terminal preflight');

  assert.ok(matchFlow.includes('export function runtimeV02EvaluateWinner'));
  assert.ok(matchFlow.includes('all_rewards_taken'));
  assert.ok(matchFlow.includes('opponent_has_no_creature'));
  assert.ok(matchFlow.includes('opponent_deckout'));
  assert.ok(matchFlow.includes('simultaneous_win_tie_requires_overtime'));

  assert.equal(matchActions.includes('all_rewards_taken'), false, 'dispatcher duplicated Reward terminal semantics');
  assert.equal(matchActions.includes('opponent_has_no_creature'), false, 'dispatcher duplicated battlefield terminal semantics');
  assert.equal(matchActions.includes('opponent_deckout'), false, 'dispatcher duplicated deckout terminal semantics');
  assert.equal(matchActions.includes('overtime_pending'), false, 'dispatcher duplicated overtime terminal semantics');
});
