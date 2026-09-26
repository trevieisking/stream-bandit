import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tacticSource=fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');
const astralSource=fs.readFileSync('tcg-card-pass-2-astral.md','utf8');

function cards(){
  const out=[];
  for(const match of astralSource.matchAll(/```json\s*([\s\S]*?)```/g)){
    const parsed=JSON.parse(match[1]);
    if(parsed?.schema==='sb-tcg-card-v0.2') out.push(parsed);
  }
  return out;
}

function walkSteps(card,steps,found){
  for(const step of steps||[]){
    if(!step||typeof step!=='object') continue;
    if(step.op==='SHUFFLE_ZONE_INTO_DECK') found.push({card:card.id,step});
    walkSteps(card,step.then,found);
    walkSteps(card,step.else,found);
    walkSteps(card,step.steps,found);
    walkSteps(card,step.else_steps,found);
  }
}

test('Archivist Sol is the sole frozen Release 1 SHUFFLE_ZONE_INTO_DECK family',()=>{
  const found=[];
  for(const card of cards()) if(card.tactic?.program?.steps) walkSteps(card,card.tactic.program.steps,found);
  assert.deepEqual(found.map(({card,step})=>({
    card,
    player:step.player,
    zone:step.zone,
    visibility:step.visibility,
  })),[
    {card:'astral-archivist-sol',player:'self',zone:'hand',visibility:'owner_private'},
    {card:'astral-archivist-sol',player:'opponent',zone:'hand',visibility:'owner_private'},
  ]);

  const sol=cards().find((card)=>card.id==='astral-archivist-sol');
  assert.ok(sol?.tactic?.program?.steps,'missing frozen Archivist Sol program');
  assert.deepEqual(sol.tactic.program.steps.map((step)=>step.op),[
    'SHUFFLE_ZONE_INTO_DECK',
    'SHUFFLE_ZONE_INTO_DECK',
    'DRAW_FIXED',
    'DRAW_FIXED',
    'CHECK_DECKOUT_AFTER_RESOLUTION',
  ]);
  assert.deepEqual(sol.tactic.program.steps.slice(2),[
    {op:'DRAW_FIXED',player:'self',count:5,deckout_on_incomplete:true},
    {op:'DRAW_FIXED',player:'opponent',count:5,deckout_on_incomplete:true},
    {op:'CHECK_DECKOUT_AFTER_RESOLUTION'},
  ]);
});

test('Tactic SHUFFLE_ZONE_INTO_DECK delegates movement to Card-Zone and shuffle to Randomization',()=>{
  const start=tacticSource.indexOf('if (op === "SHUFFLE_ZONE_INTO_DECK")');
  const end=tacticSource.indexOf('if (op === "SHUFFLE_DECK")',start);
  assert.ok(start>=0&&end>start,'generic SHUFFLE_ZONE_INTO_DECK branch missing');
  const block=tacticSource.slice(start,end);

  assert.match(block,/playerSeat\(ownerSeat, step\.player \|\| "self", vars\)/);
  assert.match(block,/String\(step\.zone \|\| ""\) !== "hand"/);
  assert.match(block,/String\(step\.visibility \|\| ""\) !== "owner_private"/);
  assert.match(block,/\(player\.hand as Inst\[\]\)\.map\(\(inst\) => inst\.uid\)/);
  assert.match(block,/runtimeV02ApplyCardZoneTransfer\(player\.hand as Inst\[\], player\.deck as Inst\[\]/);
  assert.match(block,/source: \{ controller_seat: seat as 1 \| 2, zone: "hand", owner_card_uid: null \}/);
  assert.match(block,/destination: \{ controller_seat: seat as 1 \| 2, zone: "deck", owner_card_uid: null \}/);
  assert.match(block,/card_uids: handUids/);
  assert.match(block,/runtimeV02ShuffleInPlace\(player\.deck as Inst\[\]\)/);
  assert.doesNotMatch(block,/Math\.random|crypto\.getRandomValues/);
  assert.doesNotMatch(block,/astral-archivist-sol|Archivist Sol/);
});

test('empty hand remains a legal generic shuffle-zone operation and still shuffles the deck',()=>{
  const start=tacticSource.indexOf('if (op === "SHUFFLE_ZONE_INTO_DECK")');
  const end=tacticSource.indexOf('if (op === "SHUFFLE_DECK")',start);
  const block=tacticSource.slice(start,end);
  assert.match(block,/if \(handUids\.length > 0\) \{[\s\S]*runtimeV02ApplyCardZoneTransfer/);
  const shuffleIndex=block.indexOf('runtimeV02ShuffleInPlace(player.deck as Inst[])');
  const transferGuardEnd=block.indexOf('\n      }',block.indexOf('if (handUids.length > 0)'));
  assert.ok(shuffleIndex>transferGuardEnd,'deck shuffle must occur even when the hand is empty');
});
