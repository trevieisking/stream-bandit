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

function walk(card,value,path=[],out=[]){
  if(Array.isArray(value)){value.forEach((entry,index)=>walk(card,entry,[...path,String(index)],out));return out;}
  if(!value||typeof value!=='object') return out;
  if(value.op==='ADD_SHIELD_EACH') out.push({card_id:card.id,path:path.join('.'),node:value});
  for(const [key,child] of Object.entries(value)) walk(card,child,[...path,key],out);
  return out;
}

test('frozen ADD_SHIELD_EACH inventory is exactly Crowncrag plus Reversal Seal',()=>{
  const found=cards().flatMap(card=>walk(card,card)).sort((a,b)=>a.card_id.localeCompare(b.card_id));
  assert.deepEqual(found.map(({card_id})=>card_id),[
    'stone-crowncrag-mountain-warden',
    'stone-reversal-seal',
  ]);
  const crown=found.find(({card_id})=>card_id==='stone-crowncrag-mountain-warden');
  assert.deepEqual(crown.node,{op:'ADD_SHIELD_EACH',targets:'$fortify_targets',amount:20});
  const seal=found.find(({card_id})=>card_id==='stone-reversal-seal');
  assert.deepEqual(seal.node,{op:'ADD_SHIELD_EACH',targets:'$seal_target',amount:30});
});

test('Tactic interpreter owns ADD_SHIELD_EACH generically through the shared Shield primitive',()=>{
  const source=fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');
  assert.match(source,/if \(op === "ADD_SHIELD_EACH"\)/);
  assert.match(source,/const resolved = resolveVar\(vars, step\.targets\)/);
  assert.match(source,/for \(const ref of refs as CreatureRef\[\]\)/);
  assert.match(source,/addRuntimeShield\(found\.cr, amount\)/);
  assert.doesNotMatch(source,/stone-reversal-seal/);
});

test('Attack owner has a generic revision-safe mixed Shield choice route',()=>{
  const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-shield-choice-v0-2.ts','utf8');
  const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');
  assert.match(owner,/structuredRuntimeAfterDamageSelectedShieldEachChoice/);
  assert.match(owner,/runtimeV02BeginAttackSelectedShieldEachChoice/);
  assert.match(owner,/runtimeV02ResolveAttackSelectedShieldEachChoice/);
  assert.match(owner,/select_friendly_creatures_add_shield_each/);
  assert.match(owner,/addRuntimeShield/);
  assert.match(owner,/tcg_v0_2_attack_shield_choice_turn_changed/);
  assert.match(owner,/tcg_v0_2_attack_shield_choice_source_vanguard_changed/);
  assert.match(owner,/tcg_v0_2_attack_shield_choice_target_changed/);
  assert.doesNotMatch(owner,/stone-crowncrag|stone-reversal-seal|crown-of-stone/);

  assert.match(match,/structuredRuntimeAfterDamageSelectedShieldEachChoice/);
  assert.match(match,/runtimeV02BeginAttackSelectedShieldEachChoice/);
  assert.match(match,/runtimeV02ResolveAttackSelectedShieldEachChoice/);
  assert.match(match,/pending\.kind==="select_friendly_creatures_add_shield_each"/);
  assert.doesNotMatch(match,/stone-crowncrag-mountain-warden/);
});

test('pure ADD_SHIELD Attack owner remains whole-program only',()=>{
  const source=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts','utf8');
  assert.match(source,/Mixed programs deliberately return null/);
  assert.match(source,/if \(normalized\.some\(\(step\) => step == null\)\) return null/);
  assert.match(source,/addRuntimeShield\(sourceCreature, step\.amount\)/);
});
