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

test('ready conditional_add snapshots final attack target state before legacy bonus parsing', () => {
  assert.ok(
    source.includes('evaluateRuntimeAttackReadyConditionalAddFormula'),
    'ready conditional_add evaluator import/call missing',
  );
  assertInOrder([
    'if(cq.control==="Blinded")',
    'if(!target)return json({ok:false,version:VERSION,error:"legal_attack_target_required"},400)',
    'const conditionalAddEvaluation=evaluateRuntimeAttackReadyConditionalAddFormula(atk,{',
    'let bonus=0,ef=atk.effect.toLowerCase()',
  ], 'ready conditional_add target snapshot ordering changed');
  assert.ok(source.includes('source_conditions:activeConditions(p.vanguard)'), 'source condition context missing');
  assert.ok(source.includes('target_conditions:activeConditions(target)'), 'target condition context missing');
  assert.ok(source.includes('source_became_vanguard_this_turn:Number(p.vanguard.became_vanguard_turn??-1)===Number(s.turn_seq||0)'), 'Vanguard-move context missing');
  assert.ok(source.includes('self_reserve_count:p.reserve.filter(Boolean).length'), 'Reserve-count context missing');
  assert.ok(source.includes('opponent_hand_count:opp.hand.length'), 'opponent-hand context missing');
  assert.ok(source.includes('source_has_relic:!!p.vanguard.relic'), 'source-Relic context missing');
});

test('structured conditional_add suppresses matching state-local English bonuses', () => {
  const guarded = [
    'if(conditionalAddEvaluation==null&&ef.includes("target is scorched")',
    'if(conditionalAddEvaluation==null&&ef.includes("target is venomed")',
    'if(conditionalAddEvaluation==null&&ef.includes("target is mindbound")',
    'if(conditionalAddEvaluation==null&&(ef.includes("target has a condition")||ef.includes("vanguard has a condition"))',
    'if(conditionalAddEvaluation==null&&ef.includes("3 or more reserve")',
    'if(conditionalAddEvaluation==null&&ef.includes("5 or more cards in hand")',
    'if(conditionalAddEvaluation==null&&ef.includes("has a relic")',
    'if(conditionalAddEvaluation==null&&ef.includes("became vanguard this turn")',
  ];
  for (const needle of guarded) {
    assert.ok(source.includes(needle), `direct legacy fallback guard missing: ${needle}`);
  }
});

test('canonical Device turn flag is adapted to device_resolved and suppresses only its matching English fallback', () => {
  assert.ok(
    source.includes('current_turn_events:[...(Number(flags.device_turn??-1)===Number(s.turn_seq||0)?[{event:"device_resolved" as const,controller:"self" as const}]:[]),...hiddenInformationEvents]'),
    'Device turn flag must remain part of the structured current-turn event input',
  );
  assert.ok(
    source.includes('if(conditionalAddEvaluation==null&&ef.includes("played a device this turn")'),
    'Device English bonus must be gated by structured conditional authority',
  );
});

test('remaining event/history English bonus fallbacks stay active until their event owners are wired', () => {
  const preserved = [
    'if(ef.includes("looked at a reward card this match")',
    'if(ef.includes("essence is discarded from this creature during this turn")',
  ];
  for (const needle of preserved) {
    assert.ok(source.includes(needle), `event/history legacy fallback missing: ${needle}`);
    assert.ok(
      !source.includes(`if(conditionalAddEvaluation==null&&${needle.slice(3)}`),
      `unproven event/history fallback was prematurely suppressed: ${needle}`,
    );
  }
  assert.ok(
    source.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at your deck this turn")'),
    'Predicted Hit deck-view fallback must now be gated by structured conditional authority',
  );
  assert.ok(
    source.includes('if(conditionalAddEvaluation==null&&ef.includes("prevented damage this turn")'),
    'Bastion Quake prevention fallback must now be gated by structured conditional authority',
  );
  assert.ok(source.includes('source_attached_essence_kinds:[]'), 'adapter must not invent temporary/borrowed attachment state');
});

test('count_add and ready conditional_add contributions combine without double counting', () => {
  assertInOrder([
    'const countFormulaBonus=countAddEvaluation?Math.max(0,countAddEvaluation.damage-atk.damage):0',
    'const conditionalFormulaBonus=conditionalAddEvaluation?Math.max(0,conditionalAddEvaluation.damage-atk.damage):0',
    'const formulaBonus=countFormulaBonus+conditionalFormulaBonus',
    'const formulaBase=atk.damage+formulaBonus',
    'attackDamage(p.vanguard,target,s,formulaBase+bonus',
  ], 'combined structured formula damage pipeline changed');
});

test('attack audit records ready conditional_add evaluation separately', () => {
  assert.ok(source.includes('formula_bonus_damage:formulaBonus'), 'combined formula bonus audit missing');
  assert.ok(source.includes('structured_count_add:countAddEvaluation'), 'count_add audit missing');
  assert.ok(source.includes('structured_conditional_add:conditionalAddEvaluation'), 'conditional_add audit missing');
  assert.ok(source.includes('bonus_damage:formulaBonus+bonus'), 'total bonus audit missing');
});
