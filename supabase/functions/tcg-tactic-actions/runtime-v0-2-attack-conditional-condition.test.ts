import {
  runtimeV02AttackConditionalConditionProgramIsSupported,
  runtimeV02ExecuteAttackConditionalConditionSteps,
  type RuntimeV02AttackConditionalConditionContext,
} from "../_shared/tcg-match-attack-conditional-condition-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function context(overrides: Partial<RuntimeV02AttackConditionalConditionContext> = {}): RuntimeV02AttackConditionalConditionContext {
  const target = {
    damage: 40,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
  return {
    if_context: {
      source_creature: { damage: 0, shield: 20 },
      attack_target: target,
      self_reserve: [{}, {}, {}, {}],
      opponent_reserve: [],
      variables: {},
      current_action_events: {},
      target_remains_in_play_after_damage: true,
      card_matches: () => false,
    },
    target_creature: target,
    source_controller_seat: 1,
    target_controller_seat: 2,
    active_seat: 1,
    turn_seq: 7,
    source_action_id: "attack:test",
    ...overrides,
  };
}

Deno.test("conditional Condition Attack family supports nested IF and shared slot state", () => {
  const ctx = context();
  const receipts = runtimeV02ExecuteAttackConditionalConditionSteps([
    {
      op: "IF",
      when: {
        all: [
          { predicate: "reserve_count_at_least", controller: "self", count: 4 },
          { predicate: "target_remains_in_play_after_damage" },
        ],
      },
      then: [
        { op: "APPLY_CONDITION", target: "$attack_target", condition: "Venomed", mode: "apply_if_empty" },
        {
          op: "IF",
          when: { predicate: "control_condition_slot_empty", target: "$attack_target" },
          then: [
            { op: "APPLY_CONDITION", target: "$attack_target", condition: "Rooted", mode: "apply_if_empty" },
          ],
        },
      ],
    },
  ], ctx);
  assertEquals(receipts.length, 2, "two Condition receipts");
  assertEquals(receipts[0].condition, "Venomed", "first Condition");
  assertEquals(receipts[1].condition, "Rooted", "nested Condition");
  assertEquals((ctx.target_creature.conditions as Record<string, unknown>).control, "Rooted", "control slot");
});

Deno.test("conditional Condition Attack family maps REPLACE_CONTROL_CONDITION to shared replace mode", () => {
  const ctx = context();
  (ctx.target_creature.conditions as Record<string, unknown>).control = "Stunned";
  const receipts = runtimeV02ExecuteAttackConditionalConditionSteps([
    {
      op: "IF",
      when: { predicate: "target_remains_in_play_after_damage" },
      then: [
        {
          op: "REPLACE_CONTROL_CONDITION",
          target: "$attack_target",
          condition: "Mindbound",
          allow_if_empty: true,
          replace_existing: true,
        },
      ],
    },
  ], ctx);
  assertEquals(receipts.length, 1, "one replacement receipt");
  assertEquals(receipts[0].mode, "replace", "replace mode");
  assertEquals((ctx.target_creature.conditions as Record<string, unknown>).control, "Mindbound", "control replaced");
});

Deno.test("conditional Condition Attack family consumes action-local declaration event evidence", () => {
  const ctx = context({
    if_context: {
      ...context().if_context,
      current_action_events: { "chainstorm-borrowed": 1 },
      target_remains_in_play_after_damage: true,
    },
  });
  const receipts = runtimeV02ExecuteAttackConditionalConditionSteps([
    {
      op: "IF",
      when: {
        all: [
          {
            predicate: "event_occurred",
            event: "chainstorm-borrowed",
            controller: "self",
            window: "current_action",
            min_count: 1,
          },
          { predicate: "target_remains_in_play_after_damage" },
        ],
      },
      then: [
        { op: "APPLY_CONDITION", target: "$attack_target", condition: "Stunned", mode: "apply_if_empty" },
      ],
    },
  ], ctx);
  assertEquals(receipts.length, 1, "Chainstorm-style Condition receipt");
  assertEquals(receipts[0].condition, "Stunned", "Stunned result");
});

Deno.test("conditional Condition family claims only nested IF + Condition programs", () => {
  assertEquals(runtimeV02AttackConditionalConditionProgramIsSupported([
    { op: "IF", when: { predicate: "source_damaged" }, then: [{ op: "APPLY_CONDITION", target: "$attack_target", condition: "Rooted" }] },
  ]), true, "IF Condition family");
  assertEquals(runtimeV02AttackConditionalConditionProgramIsSupported([
    { op: "APPLY_CONDITION", target: "$attack_target", condition: "Rooted" },
  ]), false, "direct Condition remains with existing owner");
  assertEquals(runtimeV02AttackConditionalConditionProgramIsSupported([
    { op: "IF", when: { predicate: "source_damaged" }, then: [{ op: "HEAL", target: "$source_creature", amount: 10 }] },
  ]), false, "heal family not claimed");
});
