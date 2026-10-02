import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sources=[
  'tcg-card-pass-2-astral.md','tcg-card-pass-2-ember.md','tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md','tcg-card-pass-2-shade.md','tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md','tcg-card-pass-2-volt.md','tcg-card-pass-2-founder-structured.md',
];
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-conditional-condition-v0-2.ts','utf8');

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
function shape(steps){
  if(!Array.isArray(steps))return{supported:false,hasIf:false};
  let hasIf=false;
  for(const step of steps){
    if(!step||typeof step!=='object')return{supported:false,hasIf};
    if(step.op==='IF'){
      hasIf=true;
      const yes=shape(step.then);
      if(!yes.supported)return{supported:false,hasIf:true};
      if(step.else!=null){
        const no=shape(step.else);
        if(!no.supported)return{supported:false,hasIf:true};
      }
      continue;
    }
    if(!['APPLY_CONDITION','REPLACE_CONTROL_CONDITION'].includes(step.op))return{supported:false,hasIf};
  }
  return{supported:true,hasIf};
}

test('frozen conditional-Condition Attack IF family is exactly four cards',()=>{
  const found=[];
  for(const card of cards()){
    for(const attack of card.creature?.attacks||[]){
      const result=shape(attack.after_damage||[]);
      if(result.supported&&result.hasIf)found.push([card.id,attack.id]);
    }
  }
  assert.deepEqual(found,[
    ['grove-elderbloom-first-canopy','forest-awakening'],
    ['shade-umbravale-thought-hunter','mind-eclipse'],
    ['tide-abyssalume','abyssal-break'],
    ['volt-stormcoil-living-circuit','chainstorm'],
  ]);
});

test('conditional-Condition owner delegates predicate and Condition semantics without card IDs',()=>{
  assert.match(owner,/runtimeV02EvaluateAttackIf/);
  assert.match(owner,/applyRuntimeConditionWithContext/);
  assert.match(owner,/runtimeV02ConditionSlot/);
  for(const id of [
    'grove-elderbloom-first-canopy','shade-umbravale-thought-hunter',
    'tide-abyssalume','volt-stormcoil-living-circuit'
  ]) assert.equal(owner.includes(id),false,`owner contains card id ${id}`);
});
