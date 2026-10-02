import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cardFiles=[
  'tcg-card-pass-2-astral.md',
  'tcg-card-pass-2-ember.md',
  'tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md',
  'tcg-card-pass-2-shade.md',
  'tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md',
  'tcg-card-pass-2-volt.md',
];

function cards(){
  const out=[];
  for(const file of cardFiles){
    const source=fs.readFileSync(file,'utf8');
    for(const match of source.matchAll(/```json\s*([\s\S]*?)```/g)){
      const parsed=JSON.parse(match[1]);
      if(parsed?.schema==='sb-tcg-card-v0.2') out.push(parsed);
    }
  }
  return out;
}

function walk(card,value,path=[],out={ops:[],predicates:[]}){
  if(Array.isArray(value)){value.forEach((entry,index)=>walk(card,entry,[...path,String(index)],out));return out;}
  if(!value||typeof value!=='object') return out;
  if(typeof value.op==='string') out.ops.push({card:card.id,op:value.op,path:path.join('.'),node:value});
  if(typeof value.predicate==='string') out.predicates.push({card:card.id,predicate:value.predicate,path:path.join('.'),node:value});
  for(const [key,child] of Object.entries(value)) walk(card,child,[...path,key],out);
  return out;
}

test('frozen Release 1 incoming attached-Relic attack-damage family has exactly three consumers',()=>{
  const found=cards()
    .filter(card=>card.tactic?.subtype==='Relic')
    .flatMap(card=>(card.tactic.continuous||[])
      .filter(effect=>effect?.kind==='incoming_attack_damage'&&effect?.target==='$attached_creature')
      .map(effect=>({card:card.id,effect})))
    .map(({card,effect})=>({
      card,
      amount:effect.amount,
      limit:effect.limit||null,
      consume_when:effect.consume_when||null,
      filters:effect.filters||{},
    }))
    .sort((a,b)=>a.card.localeCompare(b.card));

  assert.deepEqual(found,[
    {
      card:'shade-gloom-locket',
      amount:-10,
      limit:null,
      consume_when:null,
      filters:{source_controller:'opponent',attacker_has_any_condition:true,target_element:'Shade'},
    },
    {
      card:'stone-bastion-plate',
      amount:-20,
      limit:null,
      consume_when:null,
      filters:{source_controller:'opponent'},
    },
    {
      card:'tide-shellguard-pendant',
      amount:-20,
      limit:{scope:'attachment',count:1,owner:'attachment'},
      consume_when:'prevention_amount_at_least_1',
      filters:{source_controller:'opponent'},
    },
  ]);
});

test('frozen damage_prevented attached-Relic listener family is exactly Bastion Plate plus Shellguard Pendant',()=>{
  const found=cards()
    .filter(card=>card.tactic?.subtype==='Relic')
    .flatMap(card=>(card.tactic.listeners||[])
      .filter(listener=>listener?.event==='damage_prevented')
      .map(listener=>({card:card.id,listener})))
    .sort((a,b)=>a.card.localeCompare(b.card));

  assert.deepEqual(found.map(({card})=>card),['stone-bastion-plate','tide-shellguard-pendant']);
  for(const {listener} of found){
    assert.deepEqual(listener.requirements,{
      all:[
        {predicate:'prevention_target_is_attached_creature'},
        {predicate:'prevention_source_is_attached_card'},
        {predicate:'prevention_amount_at_least',value:1},
      ],
    });
  }

  const bastion=found.find(({card})=>card==='stone-bastion-plate').listener;
  assert.deepEqual(bastion.steps,[
    {op:'INCREMENT_SOURCE_COUNTER',counter_id:'prevention_uses',amount:1},
    {
      op:'IF',
      when:{predicate:'source_counter_at_least',counter_id:'prevention_uses',value:3},
      then:[{op:'SCHEDULE_SOURCE_DISCARD',timing:'after_attack_finished',source:'$listener_source'}],
    },
  ]);
  const shellguard=found.find(({card})=>card==='tide-shellguard-pendant').listener;
  assert.deepEqual(shellguard.limit,{scope:'attachment',count:1,owner:'attachment'});
  assert.deepEqual(shellguard.steps,[
    {op:'SCHEDULE_SOURCE_DISCARD',timing:'after_attack_finished',source:'$listener_source'},
  ]);
});

test('frozen structured operation and predicate inventories stay bounded to the accepted Relic consumers',()=>{
  const inventory=cards().reduce((out,card)=>{
    const walked=walk(card,card);
    out.ops.push(...walked.ops);
    out.predicates.push(...walked.predicates);
    return out;
  },{ops:[],predicates:[]});

  const ops=(name)=>inventory.ops.filter(entry=>entry.op===name).map(entry=>entry.card).sort();
  const predicates=(name)=>inventory.predicates.filter(entry=>entry.predicate===name).map(entry=>entry.card).sort();

  assert.deepEqual(ops('INCREMENT_SOURCE_COUNTER'),['stone-bastion-plate']);
  assert.deepEqual(ops('SCHEDULE_SOURCE_DISCARD'),['stone-bastion-plate','tide-shellguard-pendant']);
  assert.deepEqual(predicates('source_counter_at_least'),['stone-bastion-plate']);
  assert.deepEqual(predicates('prevention_target_is_attached_creature'),['stone-bastion-plate','tide-shellguard-pendant']);
  assert.deepEqual(predicates('prevention_source_is_attached_card'),['stone-bastion-plate','tide-shellguard-pendant']);
  assert.deepEqual(predicates('prevention_amount_at_least'),['stone-bastion-plate','tide-shellguard-pendant']);
});

test('runtime ownership is operation-shaped and contains no frozen Relic identity dispatch',()=>{
  const attackDamage=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-damage-v0-2.ts','utf8');
  const eventListener=fs.readFileSync('supabase/functions/_shared/tcg-match-event-listener-v0-2.ts','utf8');
  const scheduled=fs.readFileSync('supabase/functions/_shared/tcg-match-scheduled-action-v0-2.ts','utf8');
  const relic=fs.readFileSync('supabase/functions/_shared/tcg-match-relic-engine-v0-2.ts','utf8');
  const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');

  for(const source of [attackDamage,eventListener,scheduled,relic]){
    assert.doesNotMatch(source,/stone-bastion-plate|tide-shellguard-pendant|shade-gloom-locket/);
  }
  assert.match(attackDamage,/structuredRuntimeIncomingAttackDamageDetailed/);
  assert.match(eventListener,/runtimeV02CreateDamagePreventedEvent/);
  assert.match(eventListener,/op === "INCREMENT_SOURCE_COUNTER"/);
  assert.match(eventListener,/op === "SCHEDULE_SOURCE_DISCARD"/);
  assert.match(eventListener,/runtimeV02ScheduleAction/);
  assert.match(scheduled,/runtimeV02ResolveAfterAttackFinishedScheduledActions/);
  assert.match(relic,/runtimeV02DiscardAttachedRelic/);
  assert.match(match,/runtimeV02CreateDamagePreventedEvent/);
  assert.match(match,/runtimeV02ResolveAfterAttackFinishedScheduledActions/);
  assert.match(match,/runtimeV02DiscardAttachedRelic/);
});
