import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateConditionAppliedEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02ResolveWithdrawalModifierCost } from "../_shared/tcg-match-withdrawal-modifier-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function creature(uid: string, cardId: string) {
  return { stack: [{ uid, card_id: cardId }], essence: [], relic: null, damage: 0, shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null }, flags: {} };
}
function entry(id: string, definition: Record<string, unknown>) {
  return { card_id: id, definition_v0_2: { schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2",
    id, name: id, ...definition } };
}
function pinionDefinition() {
  return { card_family: "Creature", element: "Gale", creature: { stage: "Standalone", withdrawal: 1, attacks: [],
    ability: { id: "wind-coil", name: "Wind Coil", mode: "triggered", event: "condition_applied", timing: "own_turn",
      limit: { scope: "turn", count: 1, owner: "card_instance" },
      requirements: { all: [
        { predicate: "source_is_self" },
        { predicate: "event_condition_is", condition: "Blinded" },
        { predicate: "event_target_controller_is_opponent" },
        { predicate: "event_controller_is_active_seat" },
      ]},
      costs: [],
      steps: [{ op: "SET_WITHDRAWAL_MODIFIER", target: "$source_creature", mode: "set", amount: 0, minimum: 0,
        duration: { expires_on: ["end_of_turn"], max_uses: 1, consume_on: "legal_voluntary_withdrawal_declared" } }],
    } }, essence: null, tactic: null };
}
function state(activeSeat: 1 | 2 = 1) {
  return { runtime_registry_v0_2: runtimeV02SnapshotMarker(), turn_seq: 31, active_seat: activeSeat,
    effect_events: [], turn_flags: { "1": {}, "2": {} }, realm: null,
    card_index: {
      "gale-pinionserpent": entry("gale-pinionserpent", pinionDefinition()),
      "stone-target": entry("stone-target", { card_family: "Creature", element: "Stone",
        creature: { stage: "Standalone", withdrawal: 2, attacks: [], ability: null }, essence: null, tactic: null }),
    },
    players: {
      "1": { vanguard: creature("pinion-uid", "gale-pinionserpent"), reserve: [null,null,null,null], hand: [], deck: [], discard: [], rewards: [] },
      "2": { vanguard: creature("target-uid", "stone-target"), reserve: [null,null,null,null], hand: [], deck: [], discard: [], rewards: [] },
    },
  } as Record<string, any>;
}
function conditionEvent(s: Record<string, any>, condition = "Blinded", sourceSeat: 1 | 2 = 1, targetSeat: 1 | 2 = 2, suffix = "a") {
  return runtimeV02CreateConditionAppliedEvent(s, {
    event_id: `condition-applied:31:${suffix}`,
    source_controller_seat: sourceSeat, target_controller_seat: targetSeat,
    target_creature_uid: targetSeat === 2 ? "target-uid" : "pinion-uid",
    target_zone: "vanguard", target_index: null, condition,
    source_action_id: "blindside-spiral", source_card_uid: "attacker-card-uid",
    source_card_id: "gale-attacker", source_creature_uid: "attacker-creature-uid",
    action_kind: "attack", phase: "after_damage",
  });
}

Deno.test("condition_applied metadata triggers Wind Coil and installs canonical one-use withdrawal modifier", () => {
  const s = state();
  const event = conditionEvent(s);
  equal(event.controller_seat, 1);
  equal(event.target_controller_seat, 2);
  equal(event.condition, "Blinded");
  equal(event.condition_slot, "control");
  const flow = runtimeV02BeginEventListenerContinuation(s, [event]);
  equal(flow.status, "complete");
  equal(flow.processed_listener_keys.length, 1);
  const resolved = runtimeV02ResolveWithdrawalModifierCost(s, s.players["1"].vanguard, 1, "Gale", 1);
  equal(resolved.cost, 0);
  equal(resolved.consumable_modifier_ids.length, 1);
});

Deno.test("Wind Coil rejects wrong condition, friendly target, and non-active source controller", () => {
  let s = state();
  equal(runtimeV02BeginEventListenerContinuation(s, [conditionEvent(s, "Crushed", 1, 2, "wrong")]).processed_listener_keys.length, 0);
  s = state();
  equal(runtimeV02BeginEventListenerContinuation(s, [conditionEvent(s, "Blinded", 1, 1, "friendly")]).processed_listener_keys.length, 0);
  s = state(2);
  equal(runtimeV02BeginEventListenerContinuation(s, [conditionEvent(s, "Blinded", 1, 2, "inactive")]).processed_listener_keys.length, 0);
});

Deno.test("Wind Coil card-instance turn limit prevents a second trigger", () => {
  const s = state();
  equal(runtimeV02BeginEventListenerContinuation(s, [conditionEvent(s, "Blinded", 1, 2, "first")]).processed_listener_keys.length, 1);
  equal(runtimeV02BeginEventListenerContinuation(s, [conditionEvent(s, "Blinded", 1, 2, "second")]).processed_listener_keys.length, 0);
});

Deno.test("event_condition_is grammar fails closed on undeclared fields", () => {
  const s = state();
  s.card_index["gale-pinionserpent"].definition_v0_2.creature.ability.requirements = {
    all: [{ predicate: "source_is_self" }, { predicate: "event_condition_is", condition: "Blinded", surprise: true }],
  };
  let message = "";
  try { runtimeV02BeginEventListenerContinuation(s, [conditionEvent(s)]); }
  catch (error) { message = error instanceof Error ? error.message : String(error); }
  equal(message.includes("event_condition_field_unsupported:surprise"), true);
});
