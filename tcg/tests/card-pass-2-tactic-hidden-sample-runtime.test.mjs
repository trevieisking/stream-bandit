import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tacticSource=fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');
const shadeSource=fs.readFileSync('tcg-card-pass-2-shade.md','utf8');

function cards(){
  const out=[];
  for(const match of shadeSource.matchAll(/```json\s*([\s\S]*?)```/g)){
    const parsed=JSON.parse(match[1]);
    if(parsed?.schema==='sb-tcg-card-v0.2') out.push(parsed);
  }
  return out;
}

test('False Memory is the frozen Tactic consumer of server-only random hand sampling',()=>{
  const tacticConsumers=[];
  const walk=(card,steps)=>{
    for(const step of steps||[]){
      if(!step||typeof step!=='object') continue;
      if(step.op==='RANDOM_SAMPLE_HIDDEN_ZONE') tacticConsumers.push({card:card.id,step});
      walk(card,step.then);
      walk(card,step.else);
      walk(card,step.steps);
      walk(card,step.else_steps);
    }
  };
  for(const card of cards()) if(card.tactic?.program?.steps) walk(card,card.tactic.program.steps);
  assert.deepEqual(tacticConsumers.map(({card})=>card),['shade-false-memory']);
  const step=tacticConsumers[0].step;
  assert.equal(step.player,'opponent');
  assert.equal(step.zone,'hand');
  assert.deepEqual(step.count,{min:1,max:1});
  assert.equal(step.rng_owner,'match');
  assert.equal(step.visibility,'server_only');
  assert.equal(step.as,'random_discard');

  const falseMemory=cards().find((card)=>card.id==='shade-false-memory');
  const thenSteps=falseMemory.tactic.program.steps[0].then;
  assert.equal(thenSteps[1].op,'MOVE_CARDS');
  assert.equal(thenSteps[1].player,'opponent');
  assert.equal(thenSteps[1].cards,'$random_discard');
  assert.equal(thenSteps[1].to,'discard');
  assert.equal(thenSteps[1].visibility,'public_on_destination');
});

test('Tactic random hidden sample delegates RNG to the shared non-destructive sampler',()=>{
  assert.match(tacticSource,/tcg-match-hidden-zone-sample-v0-2\.ts/);
  const start=tacticSource.indexOf('if (op === "RANDOM_SAMPLE_HIDDEN_ZONE")');
  const end=tacticSource.indexOf('if (op === "LOOK_TOP")',start);
  assert.ok(start>=0&&end>start);
  const block=tacticSource.slice(start,end);
  assert.match(block,/String\(step\.rng_owner \|\| "match"\) !== "match"/);
  assert.match(block,/String\(step\.visibility \|\| ""\) !== "server_only"/);
  assert.match(block,/String\(step\.zone \|\| ""\) !== "hand"/);
  assert.match(block,/range\.min !== range\.max/);
  assert.match(block,/runtimeV02RandomSampleHiddenZone\(targetPlayer\.hand as Inst\[\], range\.min\)/);
  assert.match(block,/provenance\[varName\] = \{ seat: targetSeat, zone: "hand" \}/);
  assert.doesNotMatch(block,/Math\.random|crypto\.getRandomValues/);
  assert.doesNotMatch(block,/shade-false-memory/);
});

test('sampled hidden cards move later through Card-Zone from their recorded owner zone',()=>{
  const start=tacticSource.indexOf('if (op === "MOVE_CARDS") {',tacticSource.indexOf('if (op === "RANDOM_SAMPLE_HIDDEN_ZONE")'));
  const end=tacticSource.indexOf('if (op === "PUT_REMAINDER_ON_DECK_BOTTOM"',start);
  assert.ok(start>=0&&end>start);
  const block=tacticSource.slice(start,end);
  assert.match(block,/step\.player[\s\S]*playerSeat\(ownerSeat, step\.player, vars\)/);
  assert.match(block,/vars\.__hidden_sample_sources/);
  assert.match(block,/Number\(provenance\.seat\) !== destinationSeat/);
  assert.match(block,/runtimeV02ApplyCardZoneTransfer\(player\.hand as Inst\[\], destinationZone/);
  assert.match(block,/card_uids: cardUids/);
  assert.match(block,/delete provenanceMap\[token\]/);
  assert.doesNotMatch(block,/shade-false-memory/);
});
