import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gale = fs.readFileSync('tcg-card-pass-2-gale.md','utf8');
const cards = [...gale.matchAll(/```json\s*([\s\S]*?)```/g)]
  .map((match)=>JSON.parse(match[1]))
  .filter((card)=>card?.schema==='sb-tcg-card-v0.2');
const consumers=[];
for (const card of cards) {
  for (const attack of card.creature?.attacks || []) {
    for (const step of attack.after_attack_finished || []) {
      if (step?.op === 'APPLY_CONDITION') consumers.push({card_id:card.id,attack_id:attack.id,step});
    }
  }
}
const owner = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-after-finished-condition-v0-2.ts','utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');

test('Aeralith family is the single frozen after_attack_finished APPLY_CONDITION consumer', () => {
  assert.equal(consumers.length,1);
  assert.equal(consumers[0].card_id,'gale-aeralith-storm-shepherd');
  assert.equal(consumers[0].attack_id,'eye-of-the-storm');
  assert.deepEqual(consumers[0].step,{
    op:'APPLY_CONDITION',
    target:'$current_opponent_vanguard',
    condition:'Blinded',
    mode:'apply_if_empty',
  });
});

test('after-finished condition owner is generic, protection-aware and disjoint from Marevault', () => {
  assert.match(owner,/after_attack_finished/);
  assert.match(owner,/applyRuntimeConditionWithContext/);
  assert.match(owner,/\$current_opponent_vanguard/);
  assert.doesNotMatch(owner,/gale-aeralith-storm-shepherd|Aeralith|eye-of-the-storm|tide-marevault-heart-of-tides|Marevault/);
  assert.doesNotMatch(owner,/after_damage_finished/);
});

test('Match preserves after-finished condition across optional switch listener continuations', () => {
  assert.match(match,/runtimeV02InstallAttackAfterFinishedConditionContinuation/);
  assert.match(match,/runtimeV02ResolveAttackAfterFinishedConditionContinuation/);
  const install = match.indexOf('runtimeV02InstallAttackAfterFinishedConditionContinuation(');
  const switchBlock = match.indexOf('const wantsSwitch=', install);
  assert.ok(install >= 0 && switchBlock > install, 'after-finished continuation must install before optional switch');
  const tailResolve = match.indexOf('runtimeV02ResolveAttackAfterFinishedConditionContinuation(s);', switchBlock);
  const tailScan = match.indexOf('const n=scanDefeats()', tailResolve);
  assert.ok(tailResolve >= 0 && tailScan > tailResolve, 'normal attack completion must resolve condition before defeat scan');
  assert.match(match,/resume\.kind==="attack"[\s\S]*runtimeV02ResolveAttackAfterFinishedConditionContinuation\(s\)[\s\S]*scanDefeats\(\)/);
  assert.match(match,/resumeKind==="scan_defeats_then_aftermath"[\s\S]*runtimeV02ResolveAttackAfterFinishedConditionContinuation\(s\)[\s\S]*scanDefeats\(\)/);
});
