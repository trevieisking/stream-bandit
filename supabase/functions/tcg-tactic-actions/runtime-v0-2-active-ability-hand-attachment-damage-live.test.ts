import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02InstallActiveAbilityContinuation,
  runtimeV02ResumeActiveAbilityContinuation,
} from "../_shared/tcg-match-active-ability-continuation-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function inst(uid: string, card_id: string) { return { uid, card_id }; }
function cr(uid: string, card_id: string, damage = 0) {
  return { stack: [inst(uid, card_id)], essence: [], relic: null, damage, shield: 0, flags: {} };
}
function creatureDef(id: string, element: string, ability: unknown = null) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id, name: id, card_family: "Creature", element,
      creature: { stage: "Standalone", hp: 100, withdrawal: 0, reward_value: 1, ability, attacks: [] },
      essence: null, tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function essenceDef(id: string, element: string) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id, name: id, card_family: "Essence", element,
      creature: null, tactic: null,
      essence: { subtype: "Basic", provides: [{ element, amount: 1 }], continuous: [], listeners: [] },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function ability() {
  return {
    id: "test-feed", name: "Test Feed", mode: "active", event: null, timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: { all: [
      { predicate: "legal_card_available", controller: "self", zone: "hand", filters: { card_family: "Essence", essence_subtype: "Basic", element: "Ember" } },
      { predicate: "legal_card_available", controller: "self", zone: "field", filters: { card_family: "Creature", element: "Ember", damaged: true } },
    ] },
    costs: [],
    steps: [
      { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { element: "Ember", damaged: true }, as: "feed_target" },
      { op: "ATTACH_ESSENCE_FROM_ZONE", player: "self", zone: "hand", selection: { min: 1, max: 1, filters: { card_family: "Essence", essence_subtype: "Basic", element: "Ember" } }, target: "$feed_target" },
      { op: "DIRECT_DAMAGE", target: "$feed_target", amount: 10, damage_class: "effect" },
    ],
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 14, active_seat: 1, effect_events: [],
    players: {
      "1": { hand: [inst("e1", "ember-basic")], vanguard: cr("source", "test-source"), reserve: [cr("target", "test-target", 20), null, null, null] },
      "2": { hand: [], vanguard: cr("opp", "test-opp"), reserve: [null,null,null,null] },
    },
    card_index: {
      "test-source": creatureDef("test-source", "Ember", ability()),
      "test-target": creatureDef("test-target", "Ember"),
      "test-opp": creatureDef("test-opp", "Stone"),
      "ember-basic": essenceDef("ember-basic", "Ember"),
    },
  } as Record<string, any>;
}

Deno.test("live Active Ability facade routes hand-attachment DIRECT_DAMAGE through the canonical continuation", () => {
  const s=state();
  const source={where:"vanguard" as const,index:null,instance:inst("source","test-source")};
  const first=runtimeV02CreateActiveAbilityLiveChoice(s,1,source,"target-choice");
  if(!first||first.kind!=="select_target_then_hand_essence_direct_damage") throw new Error("hand attachment damage live choice required");
  const target=runtimeV02ResolveActiveAbilityLiveChoice(first,1,"target-choice",["target:target"],s);
  if(target.kind!=="hand_attachment_damage"||target.stage!=="essence_choice_required") throw new Error("essence choice stage required");
  const attached=runtimeV02ResolveActiveAbilityLiveChoice(target.pending_choice,1,target.pending_choice.id,["essence:e1"],s);
  if(attached.kind!=="hand_attachment_damage"||attached.stage!=="attachment_resolved") throw new Error("attachment stage required");
  equal((s.players as any)["1"].reserve[0].damage,20);
  runtimeV02InstallActiveAbilityContinuation(s,attached.resume);
  const damaged=runtimeV02ResumeActiveAbilityContinuation(s);
  if(damaged.kind!=="hand_attachment_damage"||damaged.stage!=="direct_damage_resolved") throw new Error("direct damage continuation required");
  equal(damaged.actual_hp_damage,10);
  equal((s.players as any)["1"].reserve[0].damage,30);
  runtimeV02InstallActiveAbilityContinuation(s,damaged.resume);
  const done=runtimeV02ResumeActiveAbilityContinuation(s);
  if(done.kind!=="hand_attachment_damage"||done.stage!=="complete") throw new Error("complete continuation required");
  equal(done.actual_hp_damage,10);
});
