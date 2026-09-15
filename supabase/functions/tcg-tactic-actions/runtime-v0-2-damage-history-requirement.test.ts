import {
  evaluateRuntimeV02DamageHistoryCountRequirement,
  normalizeRuntimeV02DamageHistoryCountRequirement,
  runtimeV02DamageHistoryRequirementQuery,
} from "../_shared/tcg-match-requirement-evaluator-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

const REQUIREMENT = {
  predicate: "damage_history_count_at_least",
  target: "$source_creature",
  source_controller: "self",
  window: "current_turn",
  min_actual_damage: 10,
  card_effect_only: true,
  count: 1,
} as const;

const CONTEXT = {
  source_creature_uid: "source-creature-1",
  source_controller_seat: 1 as const,
};

function packet(overrides: Record<string, unknown> = {}) {
  return {
    event: "after_damage_packet",
    event_id: crypto.randomUUID(),
    turn_seq: 7,
    source_controller_seat: 1,
    source_kind: "ability",
    source_action_id: "blood-interest-source",
    source_card_uid: "source-card-1",
    source_card_id: "underworld-source",
    source_creature_uid: "source-creature-1",
    target_controller_seat: 1,
    target_creature_uid: "source-creature-1",
    actual_hp_damage: 10,
    ...overrides,
  };
}

Deno.test("damage-history requirement builds the exact owner #20 current-turn query", () => {
  const query = runtimeV02DamageHistoryRequirementQuery(
    { turn_seq: 7 },
    REQUIREMENT,
    CONTEXT,
  );
  assertEquals(query, {
    min_turn_seq: 7,
    max_turn_seq: 7,
    source_controller_seat: 1,
    target_controller_seat: 1,
    target_creature_uid: "source-creature-1",
    min_actual_damage: 10,
    card_effect_only: true,
  });
});

Deno.test("current-turn own card effect damage at the threshold satisfies the predicate", () => {
  const result = evaluateRuntimeV02DamageHistoryCountRequirement(
    { turn_seq: 7, effect_events: [packet()] },
    REQUIREMENT,
    CONTEXT,
  );
  assertEquals(result, {
    predicate: "damage_history_count_at_least",
    matched: true,
    required_count: 1,
    actual_count: 1,
  });
});

Deno.test("opponent card damage, prior-turn damage and sub-threshold damage do not satisfy", () => {
  const result = evaluateRuntimeV02DamageHistoryCountRequirement(
    {
      turn_seq: 7,
      effect_events: [
        packet({ source_controller_seat: 2, actual_hp_damage: 50 }),
        packet({ turn_seq: 6, actual_hp_damage: 50 }),
        packet({ actual_hp_damage: 9 }),
      ],
    },
    REQUIREMENT,
    CONTEXT,
  );
  assertEquals(result.matched, false);
  assertEquals(result.actual_count, 0);
});

Deno.test("damage paid as a card cost satisfies the same generic predicate", () => {
  const result = evaluateRuntimeV02DamageHistoryCountRequirement(
    {
      turn_seq: 7,
      effect_events: [{
        event: "card_cost_paid",
        event_id: "cost-1",
        turn_seq: 7,
        cost_kind: "damage",
        controller_seat: 1,
        action_kind: "ability",
        source_action_id: "paid-in-blood",
        source_card_uid: "basilisk-card-1",
        source_card_id: "underworld-bloodbasilisk",
        source_creature_uid: "source-creature-1",
        target_controller_seat: 1,
        target_creature_uid: "source-creature-1",
        actual_damage_placed: 20,
      }],
    },
    REQUIREMENT,
    CONTEXT,
  );
  assertEquals(result.matched, true);
  assertEquals(result.actual_count, 1);
});

Deno.test("damage_moved never satisfies the damage-history requirement", () => {
  const result = evaluateRuntimeV02DamageHistoryCountRequirement(
    {
      turn_seq: 7,
      effect_events: [{
        event: "damage_moved",
        event_id: "move-1",
        turn_seq: 7,
        source_controller_seat: 1,
        target_controller_seat: 1,
        target_creature_uid: "source-creature-1",
        actual_damage_moved: 60,
      }],
    },
    REQUIREMENT,
    CONTEXT,
  );
  assertEquals(result.matched, false);
  assertEquals(result.actual_count, 0);
});

Deno.test("count is generic rather than hard-coded to one occurrence", () => {
  const requirement = { ...REQUIREMENT, count: 2 } as const;
  const result = evaluateRuntimeV02DamageHistoryCountRequirement(
    { turn_seq: 7, effect_events: [packet({ event_id: "a" }), packet({ event_id: "b", actual_hp_damage: 20 })] },
    requirement,
    CONTEXT,
  );
  assertEquals(result.matched, true);
  assertEquals(result.required_count, 2);
  assertEquals(result.actual_count, 2);
});

Deno.test("unsupported requirement variants fail closed", () => {
  assertThrows(
    () => normalizeRuntimeV02DamageHistoryCountRequirement({ ...REQUIREMENT, window: "previous_turn" }),
    "tcg_v0_2_requirement_damage_history_window_unsupported",
  );
  assertThrows(
    () => normalizeRuntimeV02DamageHistoryCountRequirement({ ...REQUIREMENT, card_effect_only: false }),
    "tcg_v0_2_requirement_damage_history_card_effect_required",
  );
  assertThrows(
    () => normalizeRuntimeV02DamageHistoryCountRequirement({ ...REQUIREMENT, min_actual_damage: 0 }),
    "tcg_v0_2_requirement_damage_history_min_damage_invalid",
  );
});
