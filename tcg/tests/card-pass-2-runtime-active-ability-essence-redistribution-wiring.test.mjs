import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tide=fs.readFileSync('tcg-card-pass-2-tide.md','utf8');
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-essence-redistribution-v0-2.ts','utf8');
const live=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts','utf8');
const movement=fs.readFileSync('supabase/functions/_shared/tcg-match-essence-movement-v0-2.ts','utf8');
const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');

function cardsFrom(markdown){
  const fence=String.fromCharCode(96).repeat(3);
  const pattern=new RegExp(fence+'json\\s*([\\s\\S]*?)'+fence,'g');
  return [...markdown.matchAll(pattern)].map((m)=>JSON.parse(m[1]));
}

test('Marevault Heart of Tides remains the frozen two-move / participating damaged Tide heal Ability IF shape',()=>{
  const card=cardsFrom(tide).find((entry)=>entry.id==='tide-marevault-heart-of-tides');
  assert.ok(card,'missing frozen Marevault');
  const ability=card.creature?.ability;
  assert.equal(ability?.id,'heart-of-tides');
  assert.equal(ability?.mode,'active');
  assert.equal(ability?.steps?.length,2);
  assert.deepEqual(ability.steps[0],{
    op:'MOVE_ATTACHED_ESSENCE',
    controller:'self',
    element:'Tide',
    count:{min:0,max:2},
    source_selector:{zone:'field',filters:{card_family:'Creature'}},
    destination_selector:{zone:'field',filters:{card_family:'Creature'}},
    require_destination_different_creature:true,
    as:'heart_moves',
  });
  assert.deepEqual(ability.steps[1],{
    op:'IF',
    when:{predicate:'essence_move_count_at_least',moves:'$heart_moves',count:2},
    then:[
      {
        op:'SELECT_CREATURE',
        controller:'self',
        zone:'field',
        count:1,
        filters:{
          element:'Tide',
          damaged:true,
          participated_in_moves:'$heart_moves',
        },
        as:'heart_heal',
      },
      {op:'HEAL',target:'$heart_heal',amount:20},
    ],
  });
});

test('generic redistribution owner contains no Marevault identity and delegates exact mutation / IF / Heal ownership',()=>{
  for(const forbidden of ['tide-marevault-heart-of-tides','Marevault','heart-of-tides','Heart of Tides']){
    assert.equal(owner.includes(forbidden),false,'generic redistribution owner contains card/name authority: '+forbidden);
  }
  assert.match(owner,/applyRuntimeV02EssenceTransfer\(/);
  assert.match(owner,/runtimeV02EvaluateActiveAbilityIf\(/);
  assert.match(owner,/applyRuntimeV02HealPacket\(/);
  assert.match(movement,/export function applyRuntimeV02EssenceTransfer/);
  assert.match(movement,/export function runtimeV02CurrentTurnEssenceMovements/);
});

test('two-move redistribution preflights on cloned authoritative state before applying real mutations',()=>{
  assert.match(owner,/const probe = structuredClone\(state\)/);
  const preflight=owner.indexOf('preflightMoves(');
  const apply=owner.indexOf('const movementReceipts: RuntimeV02EssenceMovement[]');
  assert.ok(preflight>=0 && apply>preflight,'preflight must occur before authoritative movement application');
});

test('live Ability facade routes redistribution through existing pending_ability_choice transport',()=>{
  assert.match(live,/structuredRuntimeActiveAbilityEssenceRedistribution\(state, instance\)/);
  assert.match(live,/runtimeV02CreateActiveAbilityEssenceRedistributionChoice\(/);
  assert.match(live,/runtimeV02PendingActiveAbilityEssenceRedistributionChoiceView\(/);
  assert.match(live,/runtimeV02ResolveActiveAbilityEssenceRedistributionChoice\(/);
});

test('Match resolves redistribution through canonical Ability Heal listeners and publishes only structural movement/heal data',()=>{
  const start=match.indexOf('if(resolved.kind==="redistribute_attached_essence_then_conditional_heal")');
  assert.ok(start>=0,'redistribution Match branch missing');
  const end=match.indexOf('}if(resolved.kind==="supply_reserve_then_heal")',start);
  assert.ok(end>start,'redistribution Match branch terminator missing');
  const branch=match.slice(start,end);
  assert.match(branch,/runtimeV02BeginAbilityHealListenerContinuation\(s,resolved\.emitted_packet_ids,seat as 1\|2\)/);
  assert.match(branch,/movement_count:resolved\.movement_count/);
  assert.match(branch,/if_matched:resolved\.if_matched/);
  assert.match(branch,/requested_heal:resolved\.requested_heal/);
  assert.match(branch,/actual_heal:resolved\.actual_heal/);
  assert.equal(/essence_uid:/.test(branch),false,'public redistribution receipt leaked Essence UID');
  assert.equal(/movement_receipts:/.test(branch),false,'public redistribution receipt leaked raw movement receipts');
  assert.equal(/heal_target_uid:/.test(branch),false,'public redistribution receipt leaked target UID');
});
