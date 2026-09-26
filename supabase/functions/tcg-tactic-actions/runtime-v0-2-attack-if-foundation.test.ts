import {
  runtimeV02EvaluateAttackIf,
  type RuntimeV02AttackIfContext,
} from "../_shared/tcg-match-attack-if-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}
function assertThrows(fn: () => unknown, expected: string) {
  let error: unknown = null;
  try { fn(); } catch (caught) { error = caught; }
  assert(error instanceof Error, `expected error ${expected}`);
  assertEquals(error.message, expected, "unexpected error");
}

function context(overrides: Partial<RuntimeV02AttackIfContext> = {}): RuntimeV02AttackIfContext {
  return {
    source_creature: {
      damage: 20,
      shield: 30,
      conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    },
    attack_target: {
      damage: 10,
      shield: 0,
      conditions: { scorched: true, venomed: 0, control: null, modifier: null },
    },
    self_reserve: [{}, {}, null, null],
    opponent_reserve: [{}, null, null, null],
    variables: { top_card: { element: "Astral" } },
    current_action_events: {
      "storm-break-overcharged": 1,
      "chainstorm-borrowed": 1,
    },
    target_remains_in_play_after_damage: true,
    card_matches: (card, filters) => {
      const value = card as Record<string, unknown>;
      return Object.entries(filters).every(([key, expected]) => value?.[key] === expected);
    },
    ...overrides,
  };
}

Deno.test("Attack IF composes frozen nested all trees through the shared predicate tree", () => {
  assertEquals(
    runtimeV02EvaluateAttackIf({
      all: [
        { predicate: "source_has_shield_at_least", value: 1 },
        { predicate: "target_remains_in_play_after_damage" },
      ],
    }, context()),
    true,
    "nested all",
  );
});

Deno.test("Attack IF reuses shared source-damage, source-Shield and reserve-count meanings", () => {
  const ctx = context();
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "source_damaged" }, ctx), true, "source damaged");
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "source_has_shield_at_least", value: 20 }, ctx), true, "source Shield");
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "reserve_count_at_least", controller: "self", count: 2 }, ctx), true, "self reserve count");
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "reserve_count_at_least", controller: "opponent", count: 2 }, ctx), false, "opponent reserve count");
});

Deno.test("Attack IF resolves target Condition and survival predicates without mutating target state", () => {
  const ctx = context();
  const before = JSON.stringify(ctx.attack_target);
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "target_has_any_condition" }, ctx), true, "target has condition");
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "control_condition_slot_empty", target: "$attack_target" }, ctx), true, "control slot empty");
  assertEquals(runtimeV02EvaluateAttackIf({ predicate: "target_remains_in_play_after_damage" }, ctx), true, "target remains");
  assertEquals(JSON.stringify(ctx.attack_target), before, "predicate evaluation must not mutate target");
});

Deno.test("Attack IF current-action event predicate consumes caller-owned event evidence", () => {
  const ctx = context();
  assertEquals(runtimeV02EvaluateAttackIf({
    predicate: "event_occurred",
    event: "storm-break-overcharged",
    controller: "self",
    window: "current_action",
    min_count: 1,
  }, ctx), true, "event occurred");
  assertEquals(runtimeV02EvaluateAttackIf({
    predicate: "event_occurred",
    event: "missing-event",
    controller: "self",
    window: "current_action",
    min_count: 1,
  }, ctx), false, "missing event");
});

Deno.test("Attack IF card_matches delegates variable/filter meaning to the caller card matcher", () => {
  assertEquals(runtimeV02EvaluateAttackIf({
    predicate: "card_matches",
    card: "$top_card",
    filters: { element: "Astral" },
  }, context()), true, "Astral top card");
  assertEquals(runtimeV02EvaluateAttackIf({
    predicate: "card_matches",
    card: "$top_card",
    filters: { element: "Shade" },
  }, context()), false, "nonmatching top card");
});

Deno.test("Attack IF fails closed on unsupported event windows and predicates", () => {
  assertThrows(
    () => runtimeV02EvaluateAttackIf({
      predicate: "event_occurred",
      event: "x",
      controller: "self",
      window: "current_turn",
      min_count: 1,
    }, context()),
    "tcg_v0_2_attack_if_event_window_unsupported",
  );
  assertThrows(
    () => runtimeV02EvaluateAttackIf({ predicate: "unknown" }, context()),
    "tcg_v0_2_attack_if_predicate_unsupported:unknown",
  );
});
