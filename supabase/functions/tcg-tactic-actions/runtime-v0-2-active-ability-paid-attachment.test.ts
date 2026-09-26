import { assertEquals, assertThrows } from "jsr:@std/assert";
import {
  runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute,
  runtimeV02PendingPaidSelfAttachmentChoiceView,
  runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute,
  structuredRuntimePaidSelfAttachmentActiveAbility,
} from "../_shared/tcg-match-active-ability-paid-attachment-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02BeginActiveAbilityLiveRoute } from "../_shared/tcg-match-active-ability-live-route-v0-2.ts";
import { runtimeV02PendingActiveAbilityLiveChoiceView } from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import { runtimeV02ResumeActiveAbilitySupplyAttachment } from "../_shared/tcg-match-active-ability-supply-attachment-v0-2.ts";
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
    id:"overcharge-engine", name:"Overcharge Engine", mode:"active", event:null, timing:"own_turn",
    limit:{scope:"turn",count:1,owner:"controller"},
    requirements:{all:[
      {predicate:"hand_contains",filters:{card_family:"Tactic",tactic_subtype:"Device"}},
      {predicate:"legal_card_available",controller:"self",zone:"discard",filters:{card_family:"Essence",essence_subtype:"Basic",element:"Volt"}},
    ]},
    costs:[{
      op:"CHOOSE_HAND_TO_DISCARD",player:"self",count:1,
      filters:{card_family:"Tactic",tactic_subtype:"Device"},
    }],
    steps:[{
      op:"ATTACH_ESSENCE_FROM_ZONE",player:"self",zone:"discard",
      selection:{min:1,max:1,filters:{card_family:"Essence",essence_subtype:"Basic",element:"Volt"}},
      target:"$source_creature",manual_attachment:false,
      attachment_state:{kind:"temporary",expires:"controller_aftermath",destination_on_expire:"discard"},
    }],
  };
}
function tacticDefinition(id: string, subtype: string) {
  return {
    card_id:id,
    definition_v0_2:{
      ...envelope(id,id,"Tactic","Volt"),
      creature:null,essence:null,
      tactic:{subtype,requirements:null,program:[],listeners:[],continuous:[]},
    },
    definition_v0_2_rules_version:"sb-tcg-card-v0.2",
  };
}
function essenceDefinition(id: string, element: string) {
  return {
    card_id:id,
    definition_v0_2:{
      ...envelope(id,id,"Essence",element),
      creature:null,tactic:null,
      essence:{subtype:"Basic",provides:[{element,amount:1}],attach_requirements:[],on_attach:[],continuous:[],listeners:[],lifecycle:null},
    },
    definition_v0_2_rules_version:"sb-tcg-card-v0.2",
  };
}
function state() {
  const sourceId="test-paid-source";
  return {
    runtime_registry_v0_2:runtimeV02SnapshotMarker(),
    turn_seq:31,active_seat:1,phase:"play",
    effect_events:[],pending_resolutions:[],
    players:{
      "1":{
        vanguard:creature("source-uid",sourceId),reserve:[null,null,null,null],
        deck:[],
        hand:[card("device-uid","device-card"),card("ally-uid","ally-card")],
        discard:[card("volt-uid","volt-basic"),card("tide-uid","tide-basic")],
        rewards:[],
      },
      "2":{
        vanguard:null,reserve:[null,null,null,null],deck:[],hand:[],discard:[],rewards:[],
      },
    },
    card_index:{
      [sourceId]:{
        card_id:sourceId,
        definition_v0_2:{
          ...envelope(sourceId,"Paid Source","Creature","Volt"),
          creature:{stage:"Standalone",hp:200,withdrawal:2,reward_value:1,ability:ability(),attacks:[]},
          essence:null,tactic:null,
        },
        definition_v0_2_rules_version:"sb-tcg-card-v0.2",
      },
      "device-card":tacticDefinition("device-card","Device"),
      "ally-card":tacticDefinition("ally-card","Ally"),
      "volt-basic":essenceDefinition("volt-basic","Volt"),
      "tide-basic":essenceDefinition("tide-basic","Tide"),
    },
  } as Record<string, unknown> & any;
}
function source(){return {where:"vanguard" as const,index:null,instance:card("source-uid","test-paid-source")};}
const describe=()=>({max_hp:200,reward_value:1,label:"Paid Source"});

Deno.test("paid self-attachment descriptor is operation-shaped and preserves temporary attachment state", () => {
  const d=structuredRuntimePaidSelfAttachmentActiveAbility(state(),{card_id:"test-paid-source"});
  if(!d)throw new Error("descriptor required");
  assertEquals(d.ability_id,"overcharge-engine");
  assertEquals(d.cost_filters,{card_family:"Tactic",tactic_subtype:"Device"});
  assertEquals(d.essence_filters,{card_family:"Essence",essence_subtype:"Basic",element:"Volt"});
  assertEquals(d.attachment_state,{kind:"temporary",expires:"controller_aftermath",destination_on_expire:"discard"});
});

Deno.test("paid self-attachment keeps cost private, pays once, then offers a fresh Essence choice", () => {
  const s=state();
  const first=runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute(
    s,1,source(),describe as never,"cost-choice",
  );
  if(!first||first.status!=="player_choice_required")throw new Error("cost choice required");
  assertEquals(first.pending_choice.stage,"activation_cost");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"overcharge-engine"),0);
  assertEquals(runtimeV02PendingPaidSelfAttachmentChoiceView(first.pending_choice,2),{
    id:"cost-choice",seat:1,kind:"paid_self_attachment",waiting:true,
  });
  assertEquals((runtimeV02PendingPaidSelfAttachmentChoiceView(first.pending_choice,1) as any).options,[
    {id:"hand:device-uid",label:"device-card"},
  ]);

  const paid=runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute(
    s,first.pending_choice,1,"cost-choice",["hand:device-uid"],describe as never,"essence-choice",
  );
  if(paid.status!=="player_choice_required")throw new Error("essence choice required");
  assertEquals(paid.pending_choice.stage,"essence");
  assertEquals(paid.pending_choice.id,"essence-choice");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"overcharge-engine"),1);
  assertEquals(s.players["1"].hand.map((entry:any)=>entry.uid),["ally-uid"]);
  assertEquals(s.players["1"].discard.map((entry:any)=>entry.uid).sort(),["device-uid","tide-uid","volt-uid"]);
  assertEquals((runtimeV02PendingPaidSelfAttachmentChoiceView(paid.pending_choice,1) as any).options,[
    {id:"essence:volt-uid",label:"volt-basic"},
  ]);
});

Deno.test("paid self-attachment hand_contains requirement fails closed when no matching Device is in hand before consuming the turn limit", () => {
  const s=state();
  s.players["1"].hand=[card("ally-uid","ally-card")];
  assertThrows(
    ()=>runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute(
      s,1,source(),describe as never,"blocked-hand",
    ),
    Error,
    "tcg_v0_2_card_cost_choice_hand_insufficient",
  );
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"overcharge-engine"),
    0,
  );
});

Deno.test("paid self-attachment delegates physical attachment and existing post-attachment continuation", () => {
  const s=state();
  const first=runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute(
    s,1,source(),describe as never,"cost-choice",
  );
  if(!first||first.status!=="player_choice_required")throw new Error("cost choice required");
  const paid=runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute(
    s,first.pending_choice,1,first.pending_choice.id,["hand:device-uid"],describe as never,"essence-choice",
  );
  if(paid.status!=="player_choice_required")throw new Error("essence choice required");
  const attached=runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute(
    s,paid.pending_choice,1,paid.pending_choice.id,["essence:volt-uid"],describe as never,
  );
  if(attached.status!=="attachment_resolved")throw new Error("attachment resolution required");
  assertEquals(s.players["1"].vanguard.essence.map((entry:any)=>entry.uid),["volt-uid"]);
  assertEquals(s.players["1"].discard.map((entry:any)=>entry.uid).sort(),["device-uid","tide-uid"]);
  assertEquals(s.players["1"].vanguard.essence[0].effect_flags,{
    discard_during_target_aftermath:true,
    runtime_v0_2_effect_attachment_state:{kind:"temporary",expires:"controller_aftermath",destination_on_expire:"discard"},
  });
  assertEquals(attached.resolution.attachment_flow.status,"complete");
  assertEquals(runtimeV02ResumeActiveAbilitySupplyAttachment(s,attached.resolution.resume),{
    kind:"effect_attachment_after_attachment",ability_id:"overcharge-engine",attached_essence_count:1,
  });
});

Deno.test("paid self-attachment preflights eligible Essence before any cost choice or payment", () => {
  const s=state();
  s.players["1"].discard=[card("tide-uid","tide-basic")];
  assertThrows(
    ()=>runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute(
      s,1,source(),describe as never,"blocked",
    ),
    Error,
    "eligible_essence_required",
  );
  assertEquals(s.players["1"].hand.map((entry:any)=>entry.uid),["device-uid","ally-uid"]);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"overcharge-engine"),0);
});

Deno.test("paid self-attachment rejects stale Essence after cost without replaying Payment", () => {
  const s=state();
  const first=runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute(
    s,1,source(),describe as never,"cost-choice",
  );
  if(!first||first.status!=="player_choice_required")throw new Error("cost choice required");
  const paid=runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute(
    s,first.pending_choice,1,first.pending_choice.id,["hand:device-uid"],describe as never,"essence-choice",
  );
  if(paid.status!=="player_choice_required")throw new Error("essence choice required");
  s.players["1"].discard=s.players["1"].discard.filter((entry:any)=>entry.uid!=="volt-uid");
  assertThrows(
    ()=>runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute(
      s,paid.pending_choice,1,paid.pending_choice.id,["essence:volt-uid"],describe as never,
    ),
    Error,
    "essence_changed",
  );
  assertEquals(s.players["1"].hand.map((entry:any)=>entry.uid),["ally-uid"]);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"overcharge-engine"),1);
});


Deno.test("single active Ability live router exposes paid self-attachment through the shared private-choice boundary", () => {
  const s=state();
  const routed=runtimeV02BeginActiveAbilityLiveRoute(
    s,1,source(),describe as never,"router-cost-choice",
  );
  if(!routed||routed.kind!=="private_choice")throw new Error("paid private choice route required");
  assertEquals(routed.choice.kind,"paid_self_attachment");
  if(routed.choice.kind!=="paid_self_attachment")throw new Error("paid choice required");
  assertEquals(routed.choice.stage,"activation_cost");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s,1,"overcharge-engine"),0);
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(routed.choice,2),{
    id:"router-cost-choice",seat:1,kind:"paid_self_attachment",waiting:true,
  });
  assertEquals((runtimeV02PendingActiveAbilityLiveChoiceView(routed.choice,1) as any).options,[
    {id:"hand:device-uid",label:"device-card"},
  ]);
});
