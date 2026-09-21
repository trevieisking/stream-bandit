import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const shade=fs.readFileSync('tcg-card-pass-2-shade.md','utf8');
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-hidden-sample-v0-2.ts','utf8');
const route=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-live-route-v0-2.ts','utf8');
const hiddenSample=fs.readFileSync('supabase/functions/_shared/tcg-match-hidden-zone-sample-v0-2.ts','utf8');
const eventListener=fs.readFileSync('supabase/functions/_shared/tcg-match-event-listener-v0-2.ts','utf8');
const tactic=fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');
const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');

function cardsFrom(markdown){
  const fence=String.fromCharCode(96).repeat(3);
  const pattern=new RegExp(fence+'json\\s*([\\s\\S]*?)'+fence,'g');
  return [...markdown.matchAll(pattern)].map((m)=>JSON.parse(m[1]));
}
function walk(value,visit,path=[]){
  if(Array.isArray(value)){
    value.forEach((entry,index)=>walk(entry,visit,[...path,String(index)]));
    return;
  }
  if(!value||typeof value!=='object')return;
  visit(value,path);
  for(const [key,child] of Object.entries(value))walk(child,visit,[...path,key]);
}

test('frozen Shade inventory has exactly three RANDOM_SAMPLE_HIDDEN_ZONE uses across triggered Ability, active Ability and Tactic',()=>{
  const uses=[];
  for(const card of cardsFrom(shade)){
    walk(card,(node,path)=>{
      if(node.op==='RANDOM_SAMPLE_HIDDEN_ZONE'){
        uses.push({id:card.id,path:path.join('.'),step:node});
      }
    });
  }
  assert.deepEqual(uses.map((use)=>use.id),[
    'shade-duskstalker',
    'shade-umbravale-thought-hunter',
    'shade-false-memory',
  ]);
  assert.equal(uses.filter((use)=>use.path.startsWith('creature.ability')).length,2);
  assert.equal(uses.filter((use)=>use.path.startsWith('tactic.program')).length,1);
});

test('Thought Hunter remains the frozen active opponent-hand 1..2 controller-private sample gated by control Condition and hand count',()=>{
  const card=cardsFrom(shade).find((entry)=>entry.id==='shade-umbravale-thought-hunter');
  assert.ok(card,'missing frozen Thought Hunter');
  const ability=card.creature?.ability;
  assert.equal(ability?.id,'thought-hunter');
  assert.deepEqual(ability?.requirements,{
    all:[
      {predicate:'control_condition_present',target:'$current_opponent_vanguard'},
      {predicate:'hand_count_at_least',player:'opponent',count:1},
    ],
  });
  assert.deepEqual(ability?.steps,[{
    op:'RANDOM_SAMPLE_HIDDEN_ZONE',
    player:'opponent',
    zone:'hand',
    count:{min:1,max:2},
    rng_owner:'match',
    visibility:'controller_private',
    as:'sampled',
  }]);
});

test('generic active hidden-sample owner stays card-id-free and delegates RNG/composition/condition state to existing owners',()=>{
  for(const forbidden of [
    'shade-umbravale-thought-hunter',
    'Umbravale',
    'thought-hunter',
    'Thought Hunter',
  ]){
    assert.equal(owner.includes(forbidden),false,'generic active hidden-sample owner contains card/name authority: '+forbidden);
  }
  assert.match(owner,/runtimeV02RandomSampleHiddenZone\(/);
  assert.match(owner,/runtimeV02EvaluatePredicateTree\(/);
  assert.match(owner,/runtimeConditions\(vanguard\)\.control/);
  assert.match(owner,/runtimeV02RecordActiveAbilityUse\(/);
  assert.match(hiddenSample,/runtimeV02UniformRandomInt/);
  assert.match(hiddenSample,/export function runtimeV02RandomSampleHiddenZone/);
});

test('Duskstalker remains Event Listener-owned and False Memory remains Tactic-interpreter-owned',()=>{
  assert.match(eventListener,/RANDOM_SAMPLE_HIDDEN_ZONE/);
  assert.match(eventListener,/runtimeV02RandomSampleHiddenZone\(/);
  assert.match(eventListener,/visibility !== "controller_private"/);
  assert.match(tactic,/case"RANDOM_SAMPLE_HIDDEN_ZONE"/);
  assert.match(tactic,/runtimeV02RandomSampleHiddenZone\(/);
  assert.match(tactic,/visibility\)!=="server_only"/);
});

test('active live route executes generic hidden sample before unrelated active families',()=>{
  assert.match(route,/runtimeV02ExecuteActiveAbilityHiddenSample\(/);
  const hiddenStart=route.indexOf('const hiddenSample = runtimeV02ExecuteActiveAbilityHiddenSample(');
  const immediateStart=route.indexOf('const immediate = runtimeV02BeginImmediateActiveAbilityLiveRoute(');
  assert.ok(hiddenStart>=0&&immediateStart>hiddenStart,'hidden-sample route must get its own generic route before unrelated fallthrough');
  assert.match(route,/kind: "hidden_sample"/);
});

test('Match viewer exposes sampled identities only through seat-gated private Ability inspection and public receipt is count-only',()=>{
  assert.match(match,/private_ability_inspection:runtimeV02PrivateActiveAbilityInspectionView\(s,viewerSeat as 1\|2\)/);
  const start=match.indexOf('if(routed.kind==="hidden_sample")');
  const end=match.indexOf('if(routed.kind==="immediate")',start);
  assert.ok(start>=0&&end>start,'hidden-sample Match route missing');
  const branch=match.slice(start,end);
  assert.match(branch,/sampled_count:resolution\.sampled_count/);
  assert.match(branch,/private_ability_inspection:runtimeV02PrivateActiveAbilityInspectionView\(s,seat as 1\|2\)/);
  assert.equal(/uid:/.test(branch),false,'public hidden-sample receipt leaked sampled UID');
  assert.equal(/card_id:/.test(branch),false,'public hidden-sample receipt leaked sampled card ID');
  assert.equal(/cards:/.test(branch),false,'public hidden-sample receipt leaked sampled cards');
});
