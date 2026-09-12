import {
  runtimeConditions,
  type RuntimeV02ConditionCreature,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02ResolveConditionAftermath,
  type RuntimeV02ConditionDamageRequest,
} from "../_shared/tcg-match-condition-lifecycle-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function creature(): RuntimeV02ConditionCreature {
  return {
    damage: 5,
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

Deno.test("condition lifecycle owns Aftermath timing while delegating damage placement", () => {
  const target = creature();
  const setup = runtimeConditions(target);
  setup.scorched = true;
  setup.venomed = 20;
  setup.control = "Stunned";
  setup.modifier = "Crushed";

  const applied: RuntimeV02ConditionDamageRequest[] = [];
  const result = runtimeV02ResolveConditionAftermath(
    target,
    () => "heads",
    (creature, request) => {
      applied.push(request);
      creature.damage += request.amount;
    },
  );
  const final = runtimeConditions(target);

  equal(applied.length, 2, "Scorched and Venomed must each request damage");
  equal(applied[0].condition, "Scorched", "Scorched must resolve first");
  equal(applied[0].amount, 20, "Scorched Aftermath damage must remain 20");
  equal(applied[1].condition, "Venomed", "Venomed must resolve second");
  equal(applied[1].amount, 20, "Venomed must use its current damage value");
  equal(target.damage, 45, "injected damage owner must apply both requests");
  equal(final.scorched, false, "heads must clear Scorched");
  equal(final.venomed, 30, "Venomed must escalate by 10");
  equal(final.control, null, "Stunned must expire at Aftermath");
  equal(final.modifier, null, "Crushed must expire at Aftermath");
  assert(
    result.cleared_conditions.includes("Scorched") &&
      result.cleared_conditions.includes("Stunned") &&
      result.cleared_conditions.includes("Crushed"),
    "Aftermath audit must report every cleared condition",
  );
});

Deno.test("condition lifecycle preserves Venomed cap and Drenched coin behaviour", () => {
  const target = creature();
  const setup = runtimeConditions(target);
  setup.venomed = 60;
  setup.control = "Rooted";
  setup.modifier = "Drenched";

  const damage: number[] = [];
  const result = runtimeV02ResolveConditionAftermath(
    target,
    () => "heads",
    (_creature, request) => damage.push(request.amount),
  );
  const final = runtimeConditions(target);

  equal(target.damage, 5, "condition lifecycle must not place damage behind the damage owner's back");
  equal(damage.length, 1, "only Venomed should request damage in this case");
  equal(damage[0], 60, "Venomed damage must cap at 60");
  equal(final.venomed, 60, "Venomed escalation must remain capped at 60");
  equal(final.control, null, "Rooted must expire at Aftermath");
  equal(final.modifier, null, "heads must clear Drenched");
  equal(result.random_results.length, 1, "Drenched must record one coin result");
  equal(result.random_results[0].condition, "Drenched", "Drenched coin audit must be explicit");
});

Deno.test("Drenched tails remains active and unrelated special conditions are not cleared by Aftermath", () => {
  const target = creature();
  const setup = runtimeConditions(target);
  setup.control = "Mindbound";
  setup.modifier = "Drenched";

  const result = runtimeV02ResolveConditionAftermath(
    target,
    () => "tails",
    () => {
      throw new Error("no damage request expected");
    },
  );
  const final = runtimeConditions(target);

  equal(final.control, "Mindbound", "Mindbound must not be an ordinary Aftermath expiry");
  equal(final.modifier, "Drenched", "Drenched tails must keep the condition active");
  equal(result.damage_requests.length, 0, "no periodic damage should be requested");
  equal(result.cleared_conditions.length, 0, "no condition should have cleared");
});
