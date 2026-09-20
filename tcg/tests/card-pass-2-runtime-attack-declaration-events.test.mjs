import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sources=[
  'tcg-card-pass-2-astral.md','tcg-card-pass-2-ember.md','tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md','tcg-card-pass-2-shade.md','tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md','tcg-card-pass-2-volt.md','tcg-card-pass-2-founder-structured.md',
];
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-declaration-events-v0-2.ts','utf8');

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

test('Release 1 Attack on_declare grammar is exactly two RECORD_EVENT steps',()=>{
  const steps=[];
  for(const card of cards()){
    for(const attack of card.creature?.attacks||[]){
      for(const step of attack.on_declare||[]) steps.push({card:card.id,attack:attack.id,step});
    }
  }
  assert.equal(steps.length,2);
  assert.deepEqual(steps.map(({card,attack,step})=>[card,attack,step.op]),[
    ['volt-stormmane','storm-break','RECORD_EVENT'],
    ['volt-stormcoil-living-circuit','chainstorm','RECORD_EVENT'],
  ]);
  assert.deepEqual(steps.map(({step})=>step.when.predicate).sort(),[
    'event_attack_source_attached_essence_count_at_least',
    'event_attack_source_has_attached_essence_kind',
  ]);
});

test('declaration event collector is card-id-free and delegates attached-Essence kind query',()=>{
  assert.match(owner,/runtimeV02AttackSourceAttachedEssenceKinds/);
  assert.match(owner,/event_attack_source_attached_essence_count_at_least/);
  assert.match(owner,/event_attack_source_has_attached_essence_kind/);
  assert.doesNotMatch(owner,/volt-stormmane|volt-stormcoil-living-circuit/);
});
