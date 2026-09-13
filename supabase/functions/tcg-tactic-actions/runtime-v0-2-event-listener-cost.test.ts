import {
  runtimeV02AdaptCardCostEventForListener,
  runtimeV02AdaptCardCostEventsForListener,
} from "./tcg-match-event-listener-cost-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
const base = {
  event_id: "card-cost:3:ability:test:0:damage",
  event: "card_cost_paid" as const,
  turn_seq: 3,
  active_seat: 1 as const,
  controller_seat: 1 as const,
  action_kind: "ability" as const,
  source_action_id: "ability:test",
  source_step_index: 0,
  source_card_uid: "source-card-uid",
  source_card_id: "source-card",
  source_creature_uid: "source-creature",
};

Deno.test("Cost->#28 adapter exposes damage cost as a precise generic listener event", () => {
  const event = runtimeV02AdaptCardCostEventForListener({ phase: "build" }, {
    ...base,
    cost_kind: "damage",
    target_controller_seat: 1,
    target_creature_uid: "paid-on-creature",
    requested_amount: 20,
    actual_damage_placed: 20,
  });
  equal(event.event, "damage_card_cost_paid");
  equal(event.subject_uid, "paid-on-creature");
  equal(event.controller_seat, 1);
  equal(event.source_controller_seat, 1);
  equal(event.action_kind, "ability");
  equal(event.phase, "build");
});

Deno.test("Cost->#28 adapter exposes hand discard cost without losing source identity", () => {
  const event = runtimeV02AdaptCardCostEventForListener({}, {
    ...base,
    event_id: "card-cost:3:attack:test:1:hand_discard",
    action_kind: "attack",
    source_action_id: "attack:test",
    source_step_index: 1,
    cost_kind: "hand_discard",
    discarded_card_uids: ["h1", "h2"],
    discarded_count: 2,
  });
  equal(event.event, "hand_discard_card_cost_paid");
  equal(event.subject_uid, "source-creature");
  equal(event.subject_card_id, "source-card");
  equal(event.origin_zone, "hand");
  equal(event.destination_zone, "discard");
  equal(event.action_kind, "attack");
});

Deno.test("Cost->#28 adapter preserves event order for a mixed cost batch", () => {
  const events = runtimeV02AdaptCardCostEventsForListener({}, [
    {
      ...base,
      cost_kind: "damage",
      target_controller_seat: 1,
      target_creature_uid: "paid-on-creature",
      requested_amount: 20,
      actual_damage_placed: 20,
    },
    {
      ...base,
      event_id: "card-cost:3:ability:test:1:hand_discard",
      source_step_index: 1,
      cost_kind: "hand_discard",
      discarded_card_uids: ["h1"],
      discarded_count: 1,
    },
  ]);
  equal(events.map((event) => event.event), ["damage_card_cost_paid", "hand_discard_card_cost_paid"]);
});
