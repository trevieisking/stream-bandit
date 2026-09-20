import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const shade=fs.readFileSync('tcg-card-pass-2-shade.md','utf8');
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-deck-reading-v0-2.ts','utf8');
const live=fs.readFileSync('supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts','utf8');
const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');
const scheduled=fs.readFileSync('supabase/functions/_shared/tcg-match-scheduled-action-v0-2.ts','utf8');
const cardZone=fs.readFileSync('supabase/functions/_shared/tcg-match-card-zone-engine-v0-2.ts','utf8');

function cardsFrom(markdown){
  const fence=String.fromCharCode(96).repeat(3);
  const pattern=new RegExp(fence+'json\\s*([\\s\\S]*?)'+fence,'g');
  return [...markdown.matchAll(pattern)].map((match)=>JSON.parse(match[1]));
}

test('Noctivane Night Reading remains the frozen inspect / optional bottom / deferred draw Ability IF shape',()=>{
  const noctivane=cardsFrom(shade).find((card)=>card.id==='shade-noctivane');
  assert.ok(noctivane,'missing frozen Noctivane');
  const ability=noctivane.creature?.ability;
  assert.equal(ability?.id,'night-reading');
  assert.equal(ability?.mode,'active');
  assert.equal(ability?.steps?.length,4);
  assert.deepEqual(ability.steps[0],{
    op:'INSPECT_ZONE',
    player:'opponent',
    zone:'deck_top',
    selection:{min:1,max:1,filters:{}},
    visibility:'controller_private',
    return_policy:'same_position',
    as:'looked',
  });
  assert.deepEqual(ability.steps[1],{
    op:'CHOOSE_FROM_SET',
    source:'$looked',
    min:0,
    max:1,
    as:'bottom',
  });
  assert.deepEqual(ability.steps[2],{
    op:'MOVE_CARDS',
    player:'opponent',
    cards:'$bottom',
    to:'deck_bottom',
  });
  assert.deepEqual(ability.steps[3],{
    op:'IF',
    when:{predicate:'selected_count_at_least',set:'$bottom',count:1},
    then:[{
      op:'SCHEDULE_ACTION',
      owner:'self',
      trigger:'controller_aftermath_finished',
      match_must_be_active:true,
      steps:[{op:'DRAW_FIXED',player:'opponent',count:1,deckout_on_incomplete:true}],
    }],
  });
});

test('deck-reading owner is card-id-free and delegates IF, hidden-info, Card-Zone reorder and schedule semantics',()=>{
  for(const forbidden of ['shade-noctivane','Noctivane','night-reading','Night Reading']){
    assert.equal(owner.includes(forbidden),false,'generic deck-reading owner contains card/name authority: '+forbidden);
  }
  assert.match(owner,/runtimeV02EvaluateActiveAbilityIf\(/);
  assert.match(owner,/recordRuntimeV02HiddenInformationView\(state, controllerSeat, "deck_top"\)/);
  assert.match(owner,/runtimeV02ApplyCardZoneReorder\(/);
  assert.match(owner,/runtimeV02ScheduleAction\(/);
  assert.match(cardZone,/export function runtimeV02ApplyCardZoneReorder/);
  assert.match(scheduled,/export function runtimeV02ResolveControllerAftermathScheduledActions/);
});

test('live Active Ability facade routes the deck-reading family through the same pending_ability_choice surface',()=>{
  assert.match(live,/structuredRuntimeActiveAbilityDeckReading\(state, instance\)/);
  assert.match(live,/runtimeV02CreateActiveAbilityDeckReadingChoice\(/);
  assert.match(live,/runtimeV02PendingActiveAbilityDeckReadingChoiceView\(/);
  assert.match(live,/runtimeV02ResolveActiveAbilityDeckReadingChoice\(/);
});

test('Match resolves deck-reading without exposing inspected card identity and executes schedule at controller-aftermath-finished boundary',()=>{
  const branchStart=match.indexOf('if(resolved.kind==="inspect_opponent_deck_top_then_optional_bottom")');
  assert.ok(branchStart>=0,'deck-reading Match receipt branch missing');
  const branch=match.slice(branchStart,branchStart+1800);
  assert.match(branch,/selected_count:resolved\.selected_count/);
  assert.match(branch,/moved_to_deck_bottom_count:resolved\.moved_to_deck_bottom_count/);
  assert.match(branch,/scheduled_action:!!resolved\.scheduled_action_id/);
  assert.equal(branch.includes('card_id:'),false,'public deck-reading receipt leaked inspected card ID');
  assert.equal(branch.includes('uid:'),false,'public deck-reading receipt leaked inspected card UID');
  assert.match(match,/runtimeV02ResolveControllerAftermathScheduledActions\(s,Number\(s\.active_seat\) as 1\|2\)/);
});
