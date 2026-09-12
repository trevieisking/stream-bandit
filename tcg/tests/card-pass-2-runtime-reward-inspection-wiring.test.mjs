import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const authoritySource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-authority-v0-2.ts', 'utf8');
const rewardSource = fs.readFileSync('supabase/functions/_shared/tcg-match-reward-inspection-v0-2.ts', 'utf8');
const capabilities = JSON.parse(fs.readFileSync('tcg-runtime-capabilities-v0.2.json', 'utf8'));

function viewSlice() {
  const from = matchSource.indexOf('function makeView');
  const to = matchSource.indexOf('function views', from + 1);
  assert.notEqual(from, -1, 'match makeView missing');
  assert.notEqual(to, -1, 'match views boundary missing');
  return matchSource.slice(from, to);
}

test('evolution path delegates private Reward inspection to the structured runtime owner', () => {
  assert.ok(
    matchSource.includes('structuredRuntimeEvolutionRewardInspection(s,x,seat as 1|2,body.inspect_reward_positions)'),
    'evolve action must delegate Reward inspection to the structured helper',
  );
  assert.ok(rewardSource.includes('ability.event !== "creature_evolved"'), 'helper must be bound to creature_evolved');
  assert.ok(rewardSource.includes('step?.op === "INSPECT_ZONE" && step.zone === "rewards"'), 'helper must require Reward INSPECT_ZONE');
  assert.ok(rewardSource.includes('step.visibility !== "controller_private"'), 'helper must require controller-private visibility');
  assert.ok(rewardSource.includes('step.return_policy !== "same_position"'), 'helper must leave Rewards in place');
});

test('Reward identities are exposed only through the controller-private player view', () => {
  const view = viewSlice();
  assert.ok(view.includes('private_reward_inspection:runtimeV02PrivateRewardInspectionView(s,viewerSeat as 1|2)'), 'private Reward view adapter missing');
  assert.equal(view.includes('runtime_reward_inspections_v0_2'), false, 'event ledger key leaked into player view');
  assert.ok(rewardSource.includes('view.controller_seat !== seat(viewerSeat)'), 'private view must be viewer-bound');
});

test('Reward Arc authority consumes only the canonical current-turn inspection ledger', () => {
  assert.ok(authoritySource.includes('runtimeV02CurrentTurnRewardInspections'), 'Reward inspection ledger reader missing');
  assert.ok(authoritySource.includes('predicate.event === "reward_inspected"'), 'Reward Arc ready predicate missing');
  assert.ok(authoritySource.includes('predicate.window === "current_turn"'), 'Reward Arc current-turn window missing');
  assert.ok(authoritySource.includes('predicate.min_count === 1'), 'Reward Arc minimum event count missing');
  assert.ok(
    matchSource.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at a reward card this match")'),
    'legacy Reward Arc fallback must be suppressed whenever structured authority evaluates',
  );
});

test('bounded Reward owner does not claim generic INSPECT_ZONE interpreter parity', () => {
  assert.ok(
    capabilities.operations.missing.includes('INSPECT_ZONE'),
    'narrow evolution Reward inspection must not be advertised as generic INSPECT_ZONE support',
  );
});
