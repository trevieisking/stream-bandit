import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const conditionSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');
const conditionalConditionSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-conditional-condition-v0-2.ts', 'utf8');

function assertInOrder(needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = matchSource.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('condition-only after_damage programs execute through the structured owner before legacy effects', () => {
  assert.ok(
    matchSource.includes('structuredRuntimeAfterDamageConditionEffects') &&
      matchSource.includes('../_shared/tcg-match-attack-effects-v0-2.ts'),
    'structured attack condition owner import missing',
  );
  assertInOrder([
    'const dmg=attackDamage(p.vanguard,target,s,declaredAttackDamage',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'const structuredConditionalConditionEffects=structuredConditionEffects==null?structuredRuntimeAfterDamageConditionalConditionEffects(',
    'const structuredConditionOwnerEffects=structuredConditionEffects??structuredConditionalConditionEffects;',
    'if(structuredConditionOwnerEffects==null&&ef.includes("this creature becomes scorched"))',
    'const n=scanDefeats()',
  ], 'structured after-damage condition ordering changed');
});

test('every legacy English condition application is gated by structured ownership', () => {
  const fragments = [
    'this creature becomes scorched',
    'becomes blinded',
    'becomes venomed',
    'becomes rooted',
    'becomes silenced',
    'becomes mindbound',
    'becomes crushed',
    'becomes drenched',
  ];
  for (const fragment of fragments) {
    assert.ok(
      matchSource.includes(`if(structuredConditionOwnerEffects==null&&ef.includes("${fragment}")`),
      `legacy condition fallback is not gated: ${fragment}`,
    );
  }
  assert.ok(
    matchSource.includes('if(structuredConditionOwnerEffects==null&&structuredOverchargeDiscard==null&&ef.includes("becomes stunned"))'),
    'legacy Stunned fallback must be gated by both ordinary structured-condition and overcharge-family ownership',
  );
});

test('Drenched compatibility fallback preserves its existing attacker-Shield requirement', () => {
  assert.ok(
    matchSource.includes('if(structuredConditionOwnerEffects==null&&ef.includes("becomes drenched")&&Number(p.vanguard.shield||0)>0)applyCondition(target,"Drenched",s)'),
    'Drenched fallback lost its attacker-Shield requirement',
  );
});

test('attack audit records structured condition ownership separately', () => {
  assert.ok(
    matchSource.includes('structured_after_damage_conditions:structuredConditionOwnerEffects'),
    'structured after-damage condition audit missing',
  );
});

test('the condition owner is deliberately narrow and fail-closed', () => {
  assert.ok(conditionSource.includes('if (String(step.op || "") !== "APPLY_CONDITION") return null;'));
  assert.ok(conditionSource.includes('["op", "target", "condition", "mode"]'));
  assert.ok(conditionSource.includes('applyRuntimeConditionWithContext('));
  assert.ok(conditionSource.includes('"$bound_attack_target"'));
  assert.ok(conditionSource.includes('target_controller_seat: target.controller_seat'));
  assert.ok(matchSource.includes('source_action_id:attackActionId'));
  assert.ok(conditionSource.includes('Mixed programs deliberately return null'));
});

test('nested conditional Condition programs reuse shared Attack IF and Condition protection ownership', () => {
  assert.ok(
    matchSource.includes('structuredRuntimeAfterDamageConditionalConditionEffects') &&
      matchSource.includes('../_shared/tcg-match-attack-conditional-condition-v0-2.ts'),
    'conditional Condition Attack owner import missing',
  );
  assert.match(conditionalConditionSource,/runtimeV02EvaluateAttackIf/);
  assert.match(conditionalConditionSource,/applyRuntimeConditionWithContext/);
  assert.match(conditionalConditionSource,/runtimeV02ConditionSlot/);
  assert.doesNotMatch(conditionalConditionSource,/grove-elderbloom-first-canopy|shade-umbravale-thought-hunter|tide-abyssalume|volt-stormcoil-living-circuit/);
});
