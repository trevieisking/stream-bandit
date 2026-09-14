import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchActions = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const matchFlow = fs.readFileSync('supabase/functions/_shared/tcg-match-flow-engine-v0-2.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('terminal winner evaluation is owned by Match Flow and dispatcher only delegates', () => {
  assert.ok(matchActions.includes('import { runtimeV02EvaluateWinner } from "../_shared/tcg-match-flow-engine-v0-2.ts";'));
  const evaluator = slice(matchActions, 'const evaluateWinner=', 'const scanDefeats=');
  assert.equal(evaluator, 'const evaluateWinner=()=>runtimeV02EvaluateWinner(s);\n  ');
  assert.equal(evaluator.includes('all_rewards_taken'), false, 'dispatcher duplicated Reward terminal semantics');
  assert.equal(evaluator.includes('opponent_has_no_creature'), false, 'dispatcher duplicated battlefield terminal semantics');
  assert.equal(evaluator.includes('opponent_deckout'), false, 'dispatcher duplicated deckout terminal semantics');
  assert.equal(evaluator.includes('overtime_pending'), false, 'dispatcher duplicated overtime terminal semantics');

  assert.ok(matchFlow.includes('export function runtimeV02EvaluateWinner'));
  assert.ok(matchFlow.includes('all_rewards_taken'));
  assert.ok(matchFlow.includes('opponent_has_no_creature'));
  assert.ok(matchFlow.includes('opponent_deckout'));
  assert.ok(matchFlow.includes('simultaneous_win_tie_requires_overtime'));
});
