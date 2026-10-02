import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sources=[
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
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-if-v0-2.ts','utf8');

function cards(){
  const out=[];
  for(const path of sources){
    const source=fs.readFileSync(path,'utf8');
    for(const match of source.matchAll(/```json\s*([\s\S]*?)```/g)){
      const card=JSON.parse(match[1]);
      if(card?.schema==='sb-tcg-card-v0.2') out.push(card);
    }
  }
  return out;
}

function leaves(node,out=[]){
  if(!node||typeof node!=='object') return out;
  if(typeof node.predicate==='string') out.push(node.predicate);
  for(const key of ['all','any']) for(const child of node[key]||[]) leaves(child,out);
  if(node.not) leaves(node.not,out);
  return out;
}

test('frozen Release 1 inventory has 13 Attack IF instances across 11 cards and eight predicate families',()=>{
  const instances=[];
  const walk=(card,attack,steps,path=[])=>{
    for(let i=0;i<(steps||[]).length;i++){
      const step=steps[i];
      if(!step||typeof step!=='object') continue;
      if(step.op==='IF') instances.push({card:card.id,attack:attack.id,when:step.when,path:[...path,i]});
      walk(card,attack,step.then,[...path,i,'then']);
      walk(card,attack,step.else,[...path,i,'else']);
      walk(card,attack,step.steps,[...path,i,'steps']);
    }
  };
  for(const card of cards()){
    for(const attack of card.creature?.attacks||[]){
      walk(card,attack,attack.on_declare||[],['on_declare']);
      walk(card,attack,attack.before_damage||[],['before_damage']);
      walk(card,attack,attack.after_damage||[],['after_damage']);
    }
  }
  assert.equal(instances.length,13);
  assert.equal(new Set(instances.map((entry)=>entry.card)).size,11);
  assert.deepEqual([...new Set(instances.flatMap((entry)=>leaves(entry.when,[])))].sort(),[
    'card_matches',
    'control_condition_slot_empty',
    'event_occurred',
    'reserve_count_at_least',
    'source_damaged',
    'source_has_shield_at_least',
    'target_has_any_condition',
    'target_remains_in_play_after_damage',
  ]);
});

test('Attack IF foundation is one read-only shared predicate owner and contains no launch card identity',()=>{
  assert.match(owner,/runtimeV02EvaluatePredicateTree/);
  assert.match(owner,/evaluateRuntimeV02SourceDamagedRequirement/);
  assert.match(owner,/evaluateRuntimeV02SourceHasShieldAtLeastRequirement/);
  assert.match(owner,/evaluateRuntimeV02ReserveCountAtLeastRequirement/);
  assert.match(owner,/activeRuntimeConditions/);
  assert.match(owner,/current_action_events/);
  assert.match(owner,/context\.card_matches\(card, filters\)/);
  for(const forbidden of [
    'astral-cosmarch','gale-slipwing','grove-verdantusk','grove-elderbloom-first-canopy',
    'shade-nightmaw','shade-umbravale-thought-hunter','tide-rillrunner','tide-reefback',
    'tide-abyssalume','volt-stormmane','volt-stormcoil-living-circuit'
  ]) assert.equal(owner.includes(forbidden),false,`Attack IF owner contains card identity ${forbidden}`);
  assert.doesNotMatch(owner,/applyRuntimeCondition|healRuntimeDamage|runtimeV02ApplyCardZoneTransfer|runtimeV02ApplyAtomicSwitch/);
});
