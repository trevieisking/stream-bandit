
import { assertEquals, assertThrows } from "jsr:@std/assert";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02ResumeActiveAbilitySupplyAttachment,
  structuredRuntimeActiveAbilitySupplyAttachment,
} from "../_shared/tcg-match-active-ability-supply-attachment-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function card(uid: string, card_id: string) { return { uid, card_id }; }
function creature(uid: string, card_id: string) {
  return { stack: [card(uid, card_id)], essence: [], relic: null, damage: 0, shield: 0, flags: {} };
}
function envelope(id: string, name: string, family: string, element: string) {
  return { schema:"sb-tcg-card-v0.2", effect_schema:"sb-tcg-effects-v0.2", id, name, card_family:family, element, traits:[] };
}
function ability() {
  return {
    id:"borrowed-current", name:"Borrowed Current", mode:"active", event:null, timing:"own_turn",
    limit:{scope:"turn",count:1,owner:"controller"},
    requirements:{all:[
      {predicate:"legal_card_available",controller:"self",zone:"discard",filters:{card_family:"Essence",essence_subtype:"Basic",element:"Volt"}},
      {predicate:"legal_card_available",controller:"self",zone:"field",filters:{card_family:"Creature",element:"Volt"}},
    ]},
    costs:[],
    steps:[
      {op:"SELECT_CARDS",player:"self",zone:"discard",selection:{min:1,max:1,filters:{card_family:"Essence",essence_subtype:"Basic",element:"Volt"}},as:"borrowed_essence"},
      {op:"SELECT_CREATURE",controller:"self",zone:"field",count:1,filters:{element:"Volt"},as:"borrowed_target"},
      {op:"ATTACH_ESSENCE_FROM_ZONE",player:"self",zone:"discard",cards:"$borrowed_essence",target:"$borrowed_target",manual_attachment:false,attachment_state:{kind:"borrowed",expires:"controller_aftermath",destination_on_expire:"discard"}},
    ],
  };
}
function state() {
  const sourceId="test-borrow-source", targetId="test-volt-target", essenceId="test-basic-volt";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq:22, active_seat:1, phase:"play",
    players:{
      "1":{vanguard:creature("source-uid",sourceId),reserve:[creature("target-uid",targetId),null,null,null],deck:[],hand:[],discard:[card("essence-uid",essenceId)],rewards:[]},
      "2":{vanguard:null,reserve:[null,null,null,null],deck:[],hand:[],discard:[],rewards:[]},
    },
    card_index:{
      [sourceId]:{card_id:sourceId,definition_v0_2:{...envelope(sourceId,"Borrow Source","Creature","Volt"),creature:{stage:"Standalone",hp:200,withdrawal:2,reward_value:1,ability:ability(),attacks:[]},essence:null,tactic:null}},
      [targetId]:{card_id:targetId,definition_v0_2:{...envelope(targetId,"Volt Target","Creature","Volt"),creature:{stage:"Standalone",hp:120,withdrawal:1,reward_value:1,ability:null,attacks:[]},essence:null,tactic:null}},
      [essenceId]:{card_id:essenceId,definition_v0_2:{...envelope(essenceId,"Basic Volt Essence","Essence","Volt"),creature:null,tactic:null,essence:{subtype:"Basic",provides:[{element:"Volt",amount:1}],attach_requirements:[],on_attach:[],continuous:[],listeners:[],lifecycle:null}}},
    },
  } as Record<string, unknown> & any;
}
function source(){return {where:"vanguard" as const,index:null,instance:card("source-uid","test-borrow-source")};}

Deno.test("sequential Supply attachment descriptor is operation-shaped and borrowed-state aware", () => {
  const s=state();
  const d=structuredRuntimeActiveAbilitySupplyAttachment(s,{card_id:"test-borrow-source"});
  if(!d) throw new Error("descriptor required");
  assertEquals(d.ability_id,"borrowed-current");
  assertEquals(d.attachment_state,{kind:"borrowed",expires:"controller_aftermath",destination_on_expire:"discard"});
});

Deno.test("sequential Supply attachment preserves Essence choice then Creature choice and canonical attachment metadata", () => {
  const s=state();
  const first=runtimeV02CreateActiveAbilityLiveChoice(s,1,source(),"choice-1");
  if(!first||first.kind!=="select_discard_essence_then_friendly_target") throw new Error("first choice required");
  assertEquals(first.stage,"essence");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"borrowed-current"),1);
  assertEquals((runtimeV02PendingActiveAbilityLiveChoiceView(first,1) as any).options,[{id:"essence:essence-uid",label:"Essence — Basic Volt Essence"}]);

  const selected=runtimeV02ResolveActiveAbilityLiveChoice(first,1,first.id,["essence:essence-uid"],s);
  if(selected.kind!=="effect_attachment_supply"||selected.stage!=="target_choice_required") throw new Error("target choice required");
  assertEquals(selected.pending_choice.stage,"target");
  assertEquals((runtimeV02PendingActiveAbilityLiveChoiceView(selected.pending_choice,1) as any).options,[
    {id:"target:source-uid",label:"Target — Borrow Source"},
    {id:"target:target-uid",label:"Target — Volt Target"},
  ]);

  const attached=runtimeV02ResolveActiveAbilityLiveChoice(selected.pending_choice,1,selected.pending_choice.id,["target:target-uid"],s);
  if(attached.kind!=="effect_attachment_supply"||attached.stage!=="attachment_resolved") throw new Error("attachment resolution required");
  assertEquals(s.players["1"].discard,[]);
  assertEquals(s.players["1"].reserve[0].essence[0].uid,"essence-uid");
  assertEquals(s.players["1"].reserve[0].essence[0].effect_flags,{
    discard_during_target_aftermath:true,
    runtime_v0_2_effect_attachment_state:{kind:"borrowed",expires:"controller_aftermath",destination_on_expire:"discard"},
  });
  assertEquals(attached.attachment_flow.status,"complete");
  assertEquals(runtimeV02ResumeActiveAbilitySupplyAttachment(s,attached.resume),{
    kind:"effect_attachment_after_attachment",ability_id:"borrowed-current",attached_essence_count:1,
  });
});

Deno.test("sequential Supply attachment revalidates discard identity before attachment", () => {
  const s=state();
  const first=runtimeV02CreateActiveAbilityLiveChoice(s,1,source(),"choice-stale");
  if(!first||first.kind!=="select_discard_essence_then_friendly_target") throw new Error("first choice required");
  const selected=runtimeV02ResolveActiveAbilityLiveChoice(first,1,first.id,["essence:essence-uid"],s);
  if(selected.kind!=="effect_attachment_supply"||selected.stage!=="target_choice_required") throw new Error("target choice required");
  s.players["1"].discard=[];
  assertThrows(
    () => runtimeV02ResolveActiveAbilityLiveChoice(selected.pending_choice,1,selected.pending_choice.id,["target:target-uid"],s),
    Error,
    "essence_changed",
  );
  assertEquals(s.players["1"].reserve[0].essence,[]);
});
