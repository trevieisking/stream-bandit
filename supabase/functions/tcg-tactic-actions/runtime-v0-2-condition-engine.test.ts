import {
  applyRuntimeCondition,
  clearRuntimeCondition,
  hasRuntimeCondition,
  runtimeConditions,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";
import {
  applyRuntimeCondition as applyRuntimeConditionFromCore,
  clearRuntimeCondition as clearRuntimeConditionFromCore,
  hasRuntimeCondition as hasRuntimeConditionFromCore,
  runtimeConditions as runtimeConditionsFromCore,
  type RuntimeCreature,
} from "./runtime-v0-2-core.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function creature(): RuntimeCreature {
  return {
    damage: 0,
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

Deno.test("runtime core is a compatibility facade over the dedicated condition engine", () => {
  equal(
    runtimeConditionsFromCore,
    runtimeConditions,
    "runtimeConditions must have one canonical implementation",
  );
  equal(
    hasRuntimeConditionFromCore,
    hasRuntimeCondition,
    "hasRuntimeCondition must have one canonical implementation",
  );
  equal(
    clearRuntimeConditionFromCore,
    clearRuntimeCondition,
    "clearRuntimeCondition must have one canonical implementation",
  );
  equal(
    applyRuntimeConditionFromCore,
    applyRuntimeCondition,
    "applyRuntimeCondition must have one canonical implementation",
  );
});

Deno.test("canonical condition engine owns persistent, control and modifier condition clearing", () => {
  const target = creature();
  const state = runtimeConditions(target);
  state.scorched = true;
  state.venomed = 20;
  state.control = "Mindbound";
  state.modifier = "Crushed";

  equal(clearRuntimeCondition(target, "Scorched"), true, "Scorched must clear");
  equal(clearRuntimeCondition(target, "Venomed"), true, "Venomed must clear");
  equal(clearRuntimeCondition(target, "Mindbound"), true, "control condition must clear");
  equal(clearRuntimeCondition(target, "Crushed"), true, "modifier condition must clear");
  equal(hasRuntimeCondition(target), false, "all conditions must be gone");
  equal(
    clearRuntimeCondition(target, "Crushed"),
    false,
    "clearing an already absent condition must be an idempotent no-op",
  );
});

Deno.test("canonical condition engine owns slot legality and immunity", () => {
  const target = creature();
  const first = applyRuntimeCondition(target, "Dazed", 7, "apply_if_empty");
  equal(first.applied, true, "empty control slot must accept Dazed");
  const blocked = applyRuntimeCondition(target, "Rooted", 7, "apply_if_empty");
  equal(blocked.applied, false, "occupied control slot must reject Rooted");
  equal(blocked.reason, "slot_occupied", "occupied slot reason must be preserved");

  target.flags = {
    lifecycle_condition_immunity: {
      turn_seq: 7,
      conditions: ["Crushed"],
      expires: "aftermath",
    },
  };
  const immune = applyRuntimeCondition(target, "Crushed", 7, "apply");
  equal(immune.applied, false, "immune condition must not apply");
  equal(immune.prevented, true, "immunity must report prevention");
  assert(
    runtimeConditions(target).modifier == null,
    "immunity must leave modifier slot empty",
  );
});
