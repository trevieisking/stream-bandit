import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tide=fs.readFileSync('tcg-card-pass-2-tide.md','utf8');
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-supply-v0-2.ts','utf8');
const continuation=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-continuation-v0-2.ts','utf8');
const live=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts','utf8');
const healLive=fs.readFileSync('supabase/functions/_shared/tcg-match-heal-listener-live-v0-2.ts','utf8');
const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');

function cardsFrom(markdown){
  const fence=String.fromCharCode(96).repeat(3);
  const pattern=new RegExp(fence+'json\\s*([\\s\\S]*?)'+fence,'g');
  return [...markdown.matchAll(pattern)].map((m)=>JSON.parse(m[1]));
}

test('Surgefin Undertow Supply remains the frozen optional discard-Essence / Tide Reserve / target-damaged IF shape',()=>{
  const surgefin=cardsFrom(tide).find((card)=>card.id==='tide-surgefin');
  assert.ok(surgefin,'missing frozen Surgefin');
  const ability=surgefin.creature?.ability;
  assert.equal(ability?.id,'undertow-supply');
  assert.equal(ability?.mode,'active');
  assert.equal(ability?.steps?.length,4);
  assert.deepEqual(ability.steps[3],{
    op:'IF',
    when:{predicate:'target_damaged',target:'$supply_target'},
    then:[{op:'HEAL',target:'$supply_target',amount:10}],
  });
});

test('generic supply owner stays card-id-free and delegates attachment, IF and Heal semantics',()=>{
  for(const forbidden of ['tide-surgefin','Surgefin','undertow-supply','Undertow Supply']){
    assert.equal(owner.includes(forbidden),false,'generic supply owner contains card/name authority: '+forbidden);
  }
  assert.match(owner,/runtimeV02BeginExternalEssenceAttachmentRoute\(/);
  assert.match(owner,/runtimeV02EvaluateActiveAbilityIf\(/);
  assert.match(owner,/applyRuntimeV02HealPacket\(/);
});

test('live Ability facade exposes supply through the existing pending_ability_choice transport',()=>{
  assert.match(live,/structuredRuntimeActiveAbilitySupply\(state, instance\)/);
  assert.match(live,/runtimeV02CreateActiveAbilitySupplyChoice\(/);
  assert.match(live,/runtimeV02PendingActiveAbilitySupplyChoiceView\(/);
  assert.match(live,/runtimeV02ResolveActiveAbilitySupplyChoice\(/);
});

test('generic active-Ability continuation owns post-attachment resume rather than Match/card-specific code',()=>{
  assert.match(continuation,/runtimeV02InstallActiveAbilityContinuation/);
  assert.match(continuation,/runtimeV02ResumeActiveAbilityContinuation/);
  assert.match(continuation,/supply_after_attachment/);
  for(const forbidden of ['tide-surgefin','Surgefin']){
    assert.equal(continuation.includes(forbidden),false,'continuation contains card identity: '+forbidden);
  }
});

test('nested Event / Movement / Heal choices can return to unfinished active Ability before ordinary play',()=>{
  assert.match(healLive,/resume_active_ability_effect/);
  assert.match(healLive,/runtimeV02BeginActiveAbilityEffectHealListenerContinuation/);
  assert.match(healLive,/runtimeV02ResolveActiveAbilityEffectHealListenerChoice/);
  assert.match(match,/setEventResume\("ability",seat\)/);
  assert.match(match,/setMovementResume\("ability",seat,eventFlow\.emitted_heal_packet_ids\)/);
  assert.match(match,/continueActiveAbilityAfterNestedListeners/);
  assert.match(match,/finishActiveAbilityEffect/);
  assert.match(match,/runtimeV02InstallActiveAbilityContinuation\(s,resolved\.resume\)/);
  assert.match(match,/runtimeV02ResumeActiveAbilityContinuation\(s\)/);
});

test('Match public supply receipts expose counts and target slot, not selected Essence identity',()=>{
  const start=match.indexOf('if(resolved.kind==="supply_reserve_then_heal")');
  assert.ok(start>=0,'supply Match branch missing');
  const end=match.indexOf('}if(resolved.kind==="heal_one_damaged_friendly_creature")',start);
  assert.ok(end>start,'supply Match branch terminator missing');
  const branch=match.slice(start,end);
  assert.match(branch,/selected_essence_count:resolved\.selected_essence_count/);
  assert.match(branch,/target_reserve_index:resolved\.target_reserve_index/);
  assert.equal(/essence_uid:/.test(branch),false,'public supply receipt leaked Essence UID');
  assert.equal(/essence_card_id:/.test(branch),false,'public supply receipt leaked Essence card ID');
});
