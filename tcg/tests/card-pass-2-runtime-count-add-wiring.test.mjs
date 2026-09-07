import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function assertInOrder(needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = source.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('count_add snapshot is wired after declaration requirements and before Starbound consumption', () => {
  assertInOrder([
    'const requirementCheck=evaluateRuntimeAttackDeclarationRequirements(s,p.vanguard,atk)',
    'const countAddEvaluation=evaluateRuntimeAttackCountAddFormula(s,p.vanguard,p,atk)',
    'if(atk.starbound)',
    'const cq=conditions(p.vanguard)',
  ], 'count_add legal-declaration snapshot ordering changed');
});

test('structured count_add damage replaces only its matching legacy Pyrohorn bonus path', () => {
  assert.ok(
    source.includes('if(countAddEvaluation==null&&ef.includes("friendly damaged creature"))'),
    'legacy friendly-damaged Creature bonus must be gated by structured count_add authority',
  );
  assert.ok(
    source.includes('const formulaBase=countAddEvaluation?.damage??atk.damage'),
    'structured formula damage must become the attack damage baseline',
  );
  assert.ok(
    source.includes('attackDamage(p.vanguard,target,s,formulaBase+bonus'),
    'damage pipeline must receive structured formula damage plus remaining legacy-only bonuses',
  );
});

test('attack event keeps structured formula contribution auditable', () => {
  assert.ok(source.includes('formula_bonus_damage:formulaBonus'), 'formula bonus audit field missing');
  assert.ok(source.includes('bonus_damage:formulaBonus+bonus'), 'total bonus audit field missing');
  assert.ok(source.includes('structured_count_add:countAddEvaluation'), 'count_add evaluation audit payload missing');
});
