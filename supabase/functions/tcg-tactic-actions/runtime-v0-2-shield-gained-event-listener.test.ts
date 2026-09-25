import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateShieldGainedEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function creature(uid: string, cardId: string, shield = 0) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield,
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
function boulderbugDefinition() {
  return {
    card_family: "Creature",
    element: "Stone",
    creature: {
      stage: "Standalone",
      withdrawal: 1,
      attacks: [],
      ability: {
        id: "compact-shell",
        name: "Compact Shell",
        mode: "triggered",
        event: "shield_gained",
        timing: "own_turn",
        limit: { scope: "turn", count: 1, owner: "card_instance" },
        requirements: {
          all: [
            { predicate: "shield_target_is_self" },
            { predicate: "shield_source_is_card_effect" },
            { predicate: "shield_actual_gain_at_least", value: 1 },
            {
              not: {
                predicate: "event_source_action_is",
                action_id: "ability:compact-shell",
              },
            },
          ],
        },
        costs: [],
        steps: [{
          op: "ADD_SHIELD",
          target: "$source_creature",
          amount: 10,
          source_key: "ability:compact-shell",
        }],
      },
    },
    essence: null,
    tactic: null,
  };
}
function state(activeSeat: 1 | 2 = 1) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 44,
    active_seat: activeSeat,
    effect_events: [],
    card_index: {
      "stone-boulderbug": entry("stone-boulderbug", boulderbugDefinition()),
      "stone-other": entry("stone-other", {
        card_family: "Creature",
        element: "Stone",
        creature: { stage: "Standalone", withdrawal: 1, attacks: [], ability: null },
        essence: null,
        tactic: null,
      }),
    },
    players: {
      "1": {
        vanguard: creature("boulderbug-uid", "stone-boulderbug", 20),
        reserve: [creature("other-uid", "stone-other", 10), null, null, null],
        hand: [], deck: [], discard: [], rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        hand: [], deck: [], discard: [], rewards: [],
      },
    },
  } as Record<string, any>;
}
function shieldEvent(
  s: Record<string, any>,
  options: {
    suffix?: string;
    targetUid?: string;
    targetZone?: "vanguard" | "reserve";
    targetIndex?: number | null;
    actionId?: string;
    actual?: number;
    requested?: number;
    cardEffect?: boolean;
  } = {},
) {
  const targetUid = options.targetUid ?? "boulderbug-uid";
  const targetZone = options.targetZone ?? "vanguard";
  return runtimeV02CreateShieldGainedEvent(s, {
    event_id: `shield-gained:44:${options.suffix ?? "external"}`,
    source_controller_seat: 1,
    target_controller_seat: 1,
    target_creature_uid: targetUid,
    target_zone: targetZone,
    target_index: targetZone === "reserve" ? (options.targetIndex ?? 0) : null,
    requested_amount: options.requested ?? 20,
    actual_shield_gained: options.actual ?? 20,
    source_action_id: options.actionId ?? "tactic:test-shield",
    source_card_uid: options.cardEffect === false ? null : "source-card-uid",
    source_card_id: options.cardEffect === false ? null : "stone-shield-source",
    source_creature_uid: null,
    action_kind: options.cardEffect === false ? "rule" : "tactic",
    phase: "effect_resolution",
    card_effect: options.cardEffect ?? true,
  });
}

Deno.test("Compact Shell triggers from a real card-effect Shield gain and its nested gain does not recurse", () => {
  const s = state();
  const flow = runtimeV02BeginEventListenerContinuation(s, [
    shieldEvent(s, { suffix: "first" }),
  ]);
  equal(flow.status, "complete");
  equal(flow.processed_listener_keys.length, 1);
  equal(s.players["1"].vanguard.shield, 30);
  equal(
    s.effect_events.map((event: any) => ({
      event: event.event,
      action: event.source_action_id,
      actual: event.actual_shield_gained,
    })),
    [
      { event: "shield_gained", action: "tactic:test-shield", actual: 20 },
      { event: "shield_gained", action: "ability:compact-shell", actual: 10 },
    ],
  );
});

Deno.test("Compact Shell exact four-predicate contract rejects self-source, non-card effect, other target, and wrong turn", () => {
  let s = state();
  equal(
    runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, { suffix: "self", actionId: "ability:compact-shell" }),
    ]).processed_listener_keys.length,
    0,
  );

  s = state();
  equal(
    runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, { suffix: "rule", cardEffect: false }),
    ]).processed_listener_keys.length,
    0,
  );

  s = state();
  equal(
    runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, {
        suffix: "other",
        targetUid: "other-uid",
        targetZone: "reserve",
        targetIndex: 0,
      }),
    ]).processed_listener_keys.length,
    0,
  );

  s = state(2);
  equal(
    runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, { suffix: "inactive" }),
    ]).processed_listener_keys.length,
    0,
  );
});

Deno.test("Compact Shell card-instance turn limit prevents a second external Shield trigger", () => {
  const s = state();
  equal(
    runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, { suffix: "one" }),
    ]).processed_listener_keys.length,
    1,
  );
  equal(
    runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, { suffix: "two" }),
    ]).processed_listener_keys.length,
    0,
  );
  equal(s.players["1"].vanguard.shield, 30);
});

Deno.test("Shield event grammar fails closed and zero actual gain is not an event", () => {
  const s = state();
  throws(
    () => runtimeV02CreateShieldGainedEvent(s, {
      event_id: "shield-gained:bad",
      source_controller_seat: 1,
      target_controller_seat: 1,
      target_creature_uid: "boulderbug-uid",
      target_zone: "vanguard",
      target_index: null,
      requested_amount: 20,
      actual_shield_gained: 0,
      source_action_id: "tactic:test",
      source_card_uid: "source-card-uid",
      source_card_id: "stone-source",
      source_creature_uid: null,
      action_kind: "tactic",
      phase: "effect_resolution",
      card_effect: true,
    }),
    "tcg_v0_2_shield_gained_actual_amount_invalid",
  );

  s.card_index["stone-boulderbug"].definition_v0_2.creature.ability.requirements = {
    all: [{ predicate: "shield_actual_gain_at_least", value: 1, surprise: true }],
  };
  throws(
    () => runtimeV02BeginEventListenerContinuation(s, [
      shieldEvent(s, { suffix: "extra-field" }),
    ]),
    "tcg_v0_2_event_listener_shield_gain_field_unsupported:surprise",
  );
});
