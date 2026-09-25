import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateAfterAttackDamageEvent,
  runtimeV02CreateResolvedAttackDamageEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeConditions } from "../_shared/tcg-match-condition-engine-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

type Inst = { uid: string; card_id: string };

function inst(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function creatureDefinition(id: string, element: string, hp = 200) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    creature: {
      stage: "Standalone",
      hp,
      withdrawal: 1,
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function faultstoneDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "test-faultstone",
    name: "Faultstone",
    card_family: "Tactic",
    element: "Stone",
    creature: null,
    essence: null,
    tactic: {
      subtype: "Relic",
      program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: false, steps: [] },
      continuous: [],
      listeners: [{
        id: "faultstone-crush",
        event: "after_attack_damage",
        requirements: {
          all: [
            { predicate: "attack_source_is_attached_creature" },
            { predicate: "attack_target_is_opponent_vanguard" },
            { predicate: "attack_actual_damage_at_least", value: 100 },
            { predicate: "target_remains_in_play_after_damage" },
          ],
        },
        limit: null,
        steps: [{
          op: "APPLY_CONDITION",
          target: "$attack_target",
          condition: "Crushed",
          mode: "apply_if_empty",
        }],
      }],
    },
  };
}

function field(card: Inst, relic: Inst | null = null, damage = 0) {
  return {
    stack: [card],
    essence: [],
    relic,
    damage,
    shield: 0,
    condition: null,
    conditions: {
      scorched: false,
      venomed: 0,
      control: null,
      modifier: null,
    },
    flags: {},
  };
}

function fixture(options: {
  faultOnAttacker?: boolean;
  targetZone?: "vanguard" | "reserve";
  actualDamage?: number;
  targetRemains?: boolean;
} = {}) {
  const attacker=inst("attacker-uid","test-attacker");
  const other=inst("other-uid","test-other");
  const target=inst("target-uid","test-target");
  const opponentVanguard=inst("opponent-vanguard-uid","test-opponent-vanguard");
  const fault=inst("faultstone-uid","test-faultstone");
  const faultOnAttacker=options.faultOnAttacker ?? true;
  const targetZone=options.targetZone ?? "vanguard";
  const definitions=[
    creatureDefinition("test-attacker","Stone"),
    creatureDefinition("test-other","Stone"),
    creatureDefinition("test-target","Shade"),
    creatureDefinition("test-opponent-vanguard","Shade"),
    faultstoneDefinition(),
  ];
  const targetField=field(target,null,options.actualDamage ?? 100);
  const state:any={
    turn_seq:31,
    active_seat:1,
    phase:"attack",
    runtime_registry_v0_2:runtimeV02SnapshotMarker(),
    effect_events:[],
    card_index:Object.fromEntries(definitions.map((definition:any)=>[
      definition.id,{definition_v0_2:definition},
    ])),
    realm:null,
    players:{
      "1":{
        vanguard:field(attacker,faultOnAttacker?fault:null),
        reserve:[faultOnAttacker?field(other):field(other,fault),null,null,null],
        hand:[],deck:[],discard:[],rewards:[],
      },
      "2":{
        vanguard:targetZone==="vanguard"?targetField:field(opponentVanguard),
        reserve:[targetZone==="reserve"?targetField:null,null,null,null],
        hand:[],deck:[],discard:[],rewards:[],
      },
    },
  };
  const packet=runtimeV02CreateResolvedAttackDamageEvent(state,{
    action_id:"attack-action",
    packet_id:"attack-packet",
    attack_id:"stone-smash",
    source_controller_seat:1,
    source_creature_uid:"attacker-uid",
    source_card_uid:"attacker-uid",
    source_card_id:"test-attacker",
    target_controller_seat:2,
    target_creature_uid:"target-uid",
    target_zone:targetZone,
    target_index:targetZone==="reserve"?0:null,
    requested_amount:options.actualDamage ?? 100,
    final_packet_amount:options.actualDamage ?? 100,
    shield_prevented:0,
    actual_hp_damage:options.actualDamage ?? 100,
  });
  const after=runtimeV02CreateAfterAttackDamageEvent(
    state,
    packet,
    options.targetRemains ?? true,
  );
  return {state,packet,after,targetField};
}

Deno.test("Faultstone applies Crushed from the metadata-only after_attack_damage view while preserving the packet event",()=>{
  const {state,packet,after,targetField}=fixture();
  equal(packet.event,"after_damage_packet");
  equal(after.event,"after_attack_damage");
  equal(after.packet_id,packet.packet_id);
  equal(after.actual_hp_damage,100);
  equal((state.effect_events as any[]).map((event:any)=>event.event),[
    "after_damage_packet",
    "after_attack_damage",
  ]);
  const flow=runtimeV02BeginEventListenerContinuation(state,[packet,after]);
  equal(flow.status,"complete");
  equal(flow.processed_listener_keys.length,1);
  equal(runtimeConditions(targetField).modifier,"Crushed");
});

Deno.test("Faultstone rejects sub-100 actual HP damage",()=>{
  const {state,after,targetField}=fixture({actualDamage:99});
  const flow=runtimeV02BeginEventListenerContinuation(state,[after]);
  equal(flow.processed_listener_keys.length,0);
  equal(runtimeConditions(targetField).modifier,null);
});

Deno.test("Faultstone rejects a Reserve attack target",()=>{
  const {state,after,targetField}=fixture({targetZone:"reserve"});
  const flow=runtimeV02BeginEventListenerContinuation(state,[after]);
  equal(flow.processed_listener_keys.length,0);
  equal(runtimeConditions(targetField).modifier,null);
});

Deno.test("Faultstone rejects an Attack whose source is not its attached Creature",()=>{
  const {state,after,targetField}=fixture({faultOnAttacker:false});
  const flow=runtimeV02BeginEventListenerContinuation(state,[after]);
  equal(flow.processed_listener_keys.length,0);
  equal(runtimeConditions(targetField).modifier,null);
});

Deno.test("Faultstone rejects lethal damage when the target no longer remains in play after damage",()=>{
  const {state,after,targetField}=fixture({targetRemains:false,actualDamage:150});
  const flow=runtimeV02BeginEventListenerContinuation(state,[after]);
  equal(flow.processed_listener_keys.length,0);
  equal(runtimeConditions(targetField).modifier,null);
});
