import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const conditionSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');

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
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'if(structuredConditionEffects==null&&ef.includes("this creature becomes scorched"))',
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
      matchSource.includes(`if(structuredConditionEffects==null&&ef.includes("${fragment}")`),
      `legacy condition fallback is not gated: ${fragment}`,
    );
  }
  assert.ok(
    matchSource.includes('if(structuredConditionEffects==null&&structuredOverchargeDiscard==null&&ef.includes("becomes stunned"))'),
    'legacy Stunned fallback must be gated by both ordinary structured-condition and overcharge-family ownership',
  );
});

test('Drenched compatibility fallback preserves its existing attacker-Shield requirement', () => {
  assert.ok(
    matchSource.includes('if(structuredConditionEffects==null&&ef.includes("becomes drenched")&&Number(p.vanguard.shield||0)>0)applyCondition(target,"Drenched",s)'),
    'Drenched fallback lost its attacker-Shield requirement',
  );
});

test('attack audit records structured condition ownership separately', () => {
  assert.ok(
    matchSource.includes('structured_after_damage_conditions:structuredConditionEffects'),
    'structured after-damage condition audit missing',
  );
});

test('the condition owner is deliberately narrow and fail-closed', () => {
  assert.ok(conditionSource.includes('if (String(step.op || "") !== "APPLY_CONDITION") return null;'));
  assert.ok(conditionSource.includes('["op", "target", "condition", "mode"]'));
  assert.ok(conditionSource.includes('applyRuntimeCondition(target, step.condition, turn, step.mode)'));
  assert.ok(conditionSource.includes('Mixed programs deliberately return null'));
});