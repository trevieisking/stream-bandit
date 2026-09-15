import {
  runtimeV02CountDamageHistory,
  runtimeV02QueryDamageHistory,
  runtimeV02TotalDamageHistory,
} from "../_shared/tcg-match-damage-history-query-v0-2.ts";

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

Deno.test("Damage #20 history query normalizes packet, effect-program and card-cost damage", () => {
  const state: any = {
    effect_events: [
      {
        event_id: "after-damage:packet-1",
        event: "after_damage_packet",
        turn_seq: 8,
        source_controller_seat: 1,
        source_kind: "ability",
        source_action_id: "ability-a",
        source_card_uid: "source-a",
        source_card_id: "underworld-a",
        source_creature_uid: "creature-a",
        target_controller_seat: 1,
        target_creature_uid: "scarjackal",
        actual_hp_damage: 20,
      },
      {
        event_id: "effect-damage:8:drain:0:target",
        event: "effect_damage_dealt",
        turn_seq: 8,
        source_action_id: "drain-a",
        source_card_uid: "source-b",
        controller_seat: 1,
        target_controller_seat: 2,
        target_creature_uid: "opponent-vanguard",
        actual_hp_damage: 40,
      },
      {
        event_id: "card-cost:8:paid-in-blood:0:damage",
        event: "card_cost_paid",
        turn_seq: 8,
        active_seat: 1,
        controller_seat: 1,
        action_kind: "ability",
        source_action_id: "paid-in-blood",
        source_step_index: 0,
        source_card_uid: "bloodbasilisk-card",
        source_card_id: "underworld-bloodbasilisk",
        source_creature_uid: "bloodbasilisk",
        cost_kind: "damage",
        target_controller_seat: 1,
        target_creature_uid: "bloodbasilisk",
        actual_damage_placed: 20,
      },
      {
        event_id: "damage-moved:8:move:0:a:b",
        event: "damage_moved",
        turn_seq: 8,
        controller_seat: 1,
        source_creature_uid: "a",
        destination_creature_uid: "scarjackal",
        actual_damage_moved: 30,
      },
    ],
  };

  equal(runtimeV02CountDamageHistory(state), 3);
  equal(runtimeV02TotalDamageHistory(state), 80);
  equal(
    runtimeV02QueryDamageHistory(state, { source_controller_seat: 1, card_effect_only: true })
      .map((record) => [record.source, record.actual_damage]),
    [["damage_packet", 20], ["effect_program", 40], ["card_cost", 20]],
  );
});

Deno.test("current-turn self card-effect query covers Scarjackal and Bloodbasilisk semantics", () => {
  const state: any = {
    effect_events: [
      {
        event_id: "old",
        event: "after_damage_packet",
        turn_seq: 7,
        source_controller_seat: 1,
        source_kind: "tactic",
        source_action_id: "old-effect",
        source_card_uid: "old-card",
        source_card_id: "old-card-id",
        source_creature_uid: null,
        target_controller_seat: 1,
        target_creature_uid: "scarjackal",
        actual_hp_damage: 50,
      },
      {
        event_id: "small",
        event: "after_damage_packet",
        turn_seq: 8,
        source_controller_seat: 1,
        source_kind: "ability",
        source_action_id: "small-effect",
        source_card_uid: "small-card",
        source_card_id: "small-card-id",
        source_creature_uid: null,
        target_controller_seat: 1,
        target_creature_uid: "scarjackal",
        actual_hp_damage: 5,
      },
      {
        event_id: "qualifying",
        event: "after_damage_packet",
        turn_seq: 8,
        source_controller_seat: 1,
        source_kind: "ability",
        source_action_id: "own-effect",
        source_card_uid: "own-card",
        source_card_id: "own-card-id",
        source_creature_uid: "other-friendly",
        target_controller_seat: 1,
        target_creature_uid: "scarjackal",
        actual_hp_damage: 10,
      },
      {
        event_id: "opponent-effect",
        event: "after_damage_packet",
        turn_seq: 8,
        source_controller_seat: 2,
        source_kind: "tactic",
        source_action_id: "opponent-effect",
        source_card_uid: "opponent-card",
        source_card_id: "opponent-card-id",
        source_creature_uid: null,
        target_controller_seat: 1,
        target_creature_uid: "scarjackal",
        actual_hp_damage: 30,
      },
    ],
  };

  equal(runtimeV02CountDamageHistory(state, {
    min_turn_seq: 8,
    max_turn_seq: 8,
    source_controller_seat: 1,
    target_controller_seat: 1,
    target_creature_uid: "scarjackal",
    min_actual_damage: 10,
    card_effect_only: true,
  }), 1);
});

Deno.test("damage paid as a card cost is card-effect history but moved wounds are excluded", () => {
  const state: any = {
    effect_events: [
      {
        event_id: "card-cost:9:paid-in-blood:0:damage",
        event: "card_cost_paid",
        turn_seq: 9,
        active_seat: 1,
        controller_seat: 1,
        action_kind: "ability",
        source_action_id: "paid-in-blood",
        source_step_index: 0,
        source_card_uid: "bloodbasilisk-card",
        source_card_id: "underworld-bloodbasilisk",
        source_creature_uid: "bloodbasilisk",
        cost_kind: "damage",
        target_controller_seat: 1,
        target_creature_uid: "bloodbasilisk",
        actual_damage_placed: 20,
      },
      {
        event_id: "damage-moved:9:collector:0:source:bloodbasilisk",
        event: "damage_moved",
        turn_seq: 9,
        controller_seat: 1,
        source_creature_uid: "source",
        destination_creature_uid: "bloodbasilisk",
        actual_damage_moved: 30,
      },
    ],
  };

  equal(runtimeV02CountDamageHistory(state, {
    min_turn_seq: 9,
    max_turn_seq: 9,
    source_controller_seat: 1,
    target_creature_uid: "bloodbasilisk",
    min_actual_damage: 10,
    card_effect_only: true,
  }), 1);
  equal(runtimeV02QueryDamageHistory(state)[0].source, "card_cost");
});

Deno.test("damage history is read-only and fails closed on malformed canonical damage records", () => {
  const state: any = {
    effect_events: [{
      event_id: "after-damage:packet-1",
      event: "after_damage_packet",
      turn_seq: 1,
      source_controller_seat: 1,
      source_kind: "ability",
      source_action_id: "ability-a",
      source_card_uid: "source-a",
      source_card_id: "card-a",
      source_creature_uid: "source-creature",
      target_controller_seat: 1,
      target_creature_uid: "target-a",
      actual_hp_damage: 10,
    }],
  };
  const records = runtimeV02QueryDamageHistory(state);
  records[0].actual_damage = 999;
  equal(state.effect_events[0].actual_hp_damage, 10);

  const malformed = structuredClone(state);
  malformed.effect_events[0].target_controller_seat = 9;
  throws(
    () => runtimeV02QueryDamageHistory(malformed),
    "tcg_v0_2_damage_history_packet_target_controller_invalid",
  );
  throws(
    () => runtimeV02QueryDamageHistory({ effect_events: {} as any }),
    "tcg_v0_2_damage_history_event_stream_invalid",
  );
});
