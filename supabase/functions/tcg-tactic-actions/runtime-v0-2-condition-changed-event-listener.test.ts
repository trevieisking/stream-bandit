import {
  applyRuntimeConditionWithContext,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateConditionChangedEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function creature(uid: string, cardId: string, damage = 0) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

function entry(id: string, definition: Record<string, unknown>) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      ...definition,
    },
  };
}

function sourceContext() {
  return {
    turn_seq: 41,
    active_seat: 1 as const,
    source_controller_seat: 1 as const,
    target_controller_seat: 2 as const,
    card_effect: true,
    source_action_id: "condition-test",
  };
}

Deno.test("Condition Engine reports apply, replace and no-op from canonical slot state", () => {
  const target = creature("target", "target-card") as any;
  let result = applyRuntimeConditionWithContext(
    target,
    "Dazed",
    41,
    "apply",
    sourceContext(),
  );
  equal(
    { slot: result.condition_slot, kind: result.change_kind, applied: result.applied },
    { slot: "control", kind: "apply", applied: true },
  );

  result = applyRuntimeConditionWithContext(
    target,
    "Dazed",
    41,
    "apply_if_empty_or_same",
    sourceContext(),
  );
  equal(
    { slot: result.condition_slot, kind: result.change_kind, applied: result.applied },
    { slot: "control", kind: null, applied: true },
  );

  result = applyRuntimeConditionWithContext(
    target,
    "Blinded",
    41,
    "replace",
    sourceContext(),
  );
  equal(
    { slot: result.condition_slot, kind: result.change_kind, applied: result.applied },
    { slot: "control", kind: "replace", applied: true },
  );
});

function shadeState() {
  const source = creature("shade-source-uid", "shade-test-source", 20) as any;
  source.essence.push({ uid: "eclipse-uid", card_id: "shade-eclipse-essence" });
  source.relic = { uid: "mirror-uid", card_id: "shade-mirror-fang" };
  source.conditions.control = "Blinded";
  const opponent = creature("opponent-uid", "stone-test-target", 0) as any;

  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 41,
    active_seat: 1,
    effect_events: [],
    turn_flags: { "1": {}, "2": {} },
    realm: null,
    card_index: {
      "shade-test-source": entry("shade-test-source", {
        card_family: "Creature",
        element: "Shade",
        creature: { stage: "Standalone", withdrawal: 1, attacks: [], ability: null },
        essence: null,
        tactic: null,
      }),
      "stone-test-target": entry("stone-test-target", {
        card_family: "Creature",
        element: "Stone",
        creature: { stage: "Standalone", withdrawal: 2, attacks: [], ability: null },
        essence: null,
        tactic: null,
      }),
      "shade-eclipse-essence": entry("shade-eclipse-essence", {
        card_family: "Essence",
        element: "Shade",
        creature: null,
        essence: {
          subtype: "Special",
          provides: [{ element: "Shade", amount: 1 }],
          attach_requirements: [],
          on_attach: [],
          continuous: [],
          lifecycle: null,
          listeners: [{
            id: "eclipse-condition-heal",
            event: "condition_changed",
            requirements: { all: [
              { predicate: "source_is_attached_creature" },
              { predicate: "source_controller_is_self" },
              { predicate: "event_controller_is_opponent" },
              { predicate: "event_change_kind_in", values: ["apply", "replace"] },
              { predicate: "target_damaged", target: "$attached_creature" },
            ] },
            limit: { scope: "turn", count: 1, owner: "attachment" },
            steps: [{ op: "HEAL", target: "$attached_creature", amount: 10 }],
          }],
        },
        tactic: null,
      }),
      "shade-mirror-fang": entry("shade-mirror-fang", {
        card_family: "Tactic",
        element: "Shade",
        creature: null,
        essence: null,
        tactic: {
          subtype: "Relic",
          play_requirements: [],
          program: {
            schema: "sb-tcg-effects-v0.2",
            discard_after_resolve: false,
            steps: [],
          },
          continuous: [],
          listeners: [{
            id: "mirror-fang-reflection",
            event: "condition_changed",
            requirements: { all: [
              { predicate: "event_subject_is_attached_creature" },
              { predicate: "event_condition_slot_is", slot: "control" },
              { predicate: "event_change_kind_in", values: ["apply", "replace"] },
              { predicate: "control_condition_slot_empty", target: "$current_opponent_vanguard" },
            ] },
            limit: { scope: "turn", count: 1, owner: "attachment" },
            steps: [{
              op: "APPLY_CONDITION",
              target: "$current_opponent_vanguard",
              condition: "Dazed",
              mode: "apply_if_empty",
            }],
          }],
        },
      }),
    },
    players: {
      "1": {
        vanguard: source,
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: opponent,
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  } as Record<string, any>;
}

Deno.test("Mirror Fang condition_changed chains canonically into Eclipse Essence heal", () => {
  const state = shadeState();
  const event = runtimeV02CreateConditionChangedEvent(state, {
    event_id: "condition-changed:41:external:shade-source-uid",
    source_controller_seat: 2,
    target_controller_seat: 1,
    target_creature_uid: "shade-source-uid",
    target_zone: "vanguard",
    target_index: null,
    condition: "Blinded",
    condition_slot: "control",
    change_kind: "apply",
    source_action_id: "opponent-condition-effect",
    source_card_uid: null,
    source_card_id: null,
    source_creature_uid: null,
    action_kind: "attack",
    phase: "after_damage",
  });

  equal(event.controller_seat, 1);
  equal(event.source_controller_seat, 2);
  equal(event.subject_uid, "shade-source-uid");

  const flow = runtimeV02BeginEventListenerContinuation(state, [event]);
  equal(flow.status, "complete");
  equal(flow.processed_listener_keys.length, 2);
  equal(state.players["2"].vanguard.conditions.control, "Dazed");
  equal(state.players["1"].vanguard.damage, 10);
  equal(flow.emitted_heal_packet_ids.length, 1);

  const changedEvents = state.effect_events.filter(
    (entry: any) => entry.event === "condition_changed",
  );
  equal(changedEvents.length, 2);
  equal(
    {
      controller: changedEvents[1].controller_seat,
      source_controller: changedEvents[1].source_controller_seat,
      source_creature_uid: changedEvents[1].source_creature_uid,
      subject_uid: changedEvents[1].subject_uid,
      slot: changedEvents[1].condition_slot,
      change_kind: changedEvents[1].change_kind,
    },
    {
      controller: 2,
      source_controller: 1,
      source_creature_uid: "shade-source-uid",
      subject_uid: "opponent-uid",
      slot: "control",
      change_kind: "apply",
    },
  );
});

Deno.test("condition_changed predicate grammar rejects undeclared fields", () => {
  const state = shadeState();
  const mirror = state.card_index["shade-mirror-fang"].definition_v0_2.tactic.listeners[0];
  mirror.requirements = {
    all: [
      { predicate: "event_subject_is_attached_creature" },
      { predicate: "event_condition_slot_is", slot: "control", surprise: true },
    ],
  };
  const event = runtimeV02CreateConditionChangedEvent(state, {
    event_id: "condition-changed:41:grammar",
    source_controller_seat: 2,
    target_controller_seat: 1,
    target_creature_uid: "shade-source-uid",
    target_zone: "vanguard",
    target_index: null,
    condition: "Blinded",
    condition_slot: "control",
    change_kind: "replace",
    source_action_id: "test",
    source_card_uid: null,
    source_card_id: null,
    source_creature_uid: null,
    action_kind: "attack",
    phase: "after_damage",
  });
  let message = "";
  try {
    runtimeV02BeginEventListenerContinuation(state, [event]);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  equal(message.includes("condition_slot_field_unsupported:surprise"), true);
});
