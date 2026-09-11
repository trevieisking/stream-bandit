import { runtimeV02ResolveConditionAftermath } from "../_shared/tcg-match-condition-lifecycle-v0-2.ts";
import { placeRuntimeDamage } from "./runtime-v0-2-core.ts";

function equal(actual: unknown, expected: unknown, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

Deno.test("Condition Aftermath preserves current direct-placement Shield semantics through the damage primitive", () => {
  const creature = {
    damage: 5,
    shield: 50,
    condition: null,
    conditions: {
      scorched: true,
      venomed: 20,
      control: null,
      modifier: null,
    },
    flags: {},
  };

  const result = runtimeV02ResolveConditionAftermath(
    creature,
    () => "heads",
    (target, request) => {
      placeRuntimeDamage(target, request.amount);
    },
  );

  equal(
    result.damage_requests.length,
    2,
    "Scorched and Venomed must both request damage",
  );
  equal(
    creature.damage,
    45,
    "20 Scorched plus 20 Venomed damage must still be placed",
  );
  equal(
    creature.shield,
    50,
    "ordinary Condition damage must preserve the prior Shield-bypass behaviour",
  );
  equal(
    creature.conditions.scorched,
    false,
    "Scorched heads must clear through the lifecycle owner",
  );
  equal(
    creature.conditions.venomed,
    30,
    "Venomed must still escalate through the lifecycle owner",
  );
});
