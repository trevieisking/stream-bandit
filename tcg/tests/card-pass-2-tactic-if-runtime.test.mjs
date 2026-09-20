import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tacticSource=fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');
const files=[
  'tcg-card-pass-2-astral.md',
  'tcg-card-pass-2-ember.md',
  'tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md',
  'tcg-card-pass-2-shade.md',
  'tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md',
  'tcg-card-pass-2-volt.md',
  'tcg-card-pass-2-founder-structured.md',
];

function cards(){
  const out=[];
  for(const file of files){
    const source=fs.readFileSync(file,'utf8');
    for(const match of source.matchAll(/\`\`\`json\s*([\s\S]*?)\`\`\`/g)){
      const parsed=JSON.parse(match[1]);
      if(parsed?.schema==='sb-tcg-card-v0.2') out.push(parsed);
    }
  }
  return out;
}

function tacticIfs(){
  const found=[];
  const walk=(card,steps)=>{
    for(const step of steps||[]){
      if(!step||typeof step!=='object') continue;
      if(step.op==='IF') found.push({card:card.id,step});
      walk(card,step.then);
      walk(card,step.else);
      walk(card,step.steps);
    }
  };
  for(const card of cards()){
    if(card.tactic?.program?.steps) walk(card,card.tactic.program.steps);
  }
  return found;
}

test('frozen Release 1 has exactly six Tactic IF programs',()=>{
  const found=tacticIfs().map(({card})=>card).sort();
  assert.deepEqual(found,[
    'gale-cyclone-route',
    'shade-false-memory',
    'stone-reversal-seal',
    'stone-surveyor-mina',
    'tide-recovery-spray',
    'volt-blackout-pulse',
  ]);
});

test('frozen Release 1 Tactic IF predicate inventory is bounded to six generic meanings',()=>{
  const predicates=new Set();
  const walk=(value)=>{
    if(Array.isArray(value)){ for(const item of value) walk(item); return; }
    if(!value||typeof value!=='object') return;
    if(typeof value.predicate==='string') predicates.add(value.predicate);
    for(const child of Object.values(value)) walk(child);
  };
  for(const {step} of tacticIfs()) walk(step.when);
  assert.deepEqual([...predicates].sort(),[
    'hand_count_at_least',
    'legal_card_available',
    'modifier_condition_slot_empty',
    'reserve_count_at_least',
    'target_has_condition',
    'target_printed_hp_at_least',
  ]);
});

test('Tactic IF delegates boolean composition to the shared predicate-tree owner',()=>{
  assert.match(tacticSource,/runtimeV02EvaluatePredicateTree/);
  assert.match(tacticSource,/function tacticPredicateLeaf\(/);
  assert.match(tacticSource,/function evaluateTacticIf\([\s\S]*?runtimeV02EvaluatePredicateTree\(/);
  assert.match(tacticSource,/if \(op === "IF"\) \{/);
  assert.match(tacticSource,/effect\.steps\.splice\(effect\.cursor, 1, \.\.\.branch\)/);
});

test('Tactic IF leaf adapter is data-driven and contains no launch card identity branches',()=>{
  const start=tacticSource.indexOf('function tacticPredicateLeaf(');
  const end=tacticSource.indexOf('function evaluateTacticIf(',start);
  assert.ok(start>=0&&end>start);
  const leaf=tacticSource.slice(start,end);
  for(const card of [
    'gale-cyclone-route',
    'shade-false-memory',
    'stone-reversal-seal',
    'stone-surveyor-mina',
    'tide-recovery-spray',
    'volt-blackout-pulse',
  ]) assert.doesNotMatch(leaf,new RegExp(card));
});

test('Tactic IF reuses existing shared requirement semantics where already canonical',()=>{
  const start=tacticSource.indexOf('function tacticPredicateLeaf(');
  const end=tacticSource.indexOf('function evaluateTacticIf(',start);
  const leaf=tacticSource.slice(start,end);
  assert.match(leaf,/normalizeRuntimeV02ReserveCountAtLeastRequirement/);
  assert.match(leaf,/evaluateRuntimeV02ReserveCountAtLeastRequirement/);
  assert.match(leaf,/normalizeRuntimeV02LegalCardAvailableRequirement/);
  assert.match(leaf,/evaluateRuntimeV02LegalCardAvailableRequirement/);
});
