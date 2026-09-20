import {
  evaluateRuntimeV02SourceDamagedRequirement,
  evaluateRuntimeV02SourceHasShieldAtLeastRequirement,
  normalizeRuntimeV02SourceHasShieldAtLeastRequirement,
} from "../_shared/tcg-match-requirement-evaluator-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
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

Deno.test("shared source_damaged requirement preserves one current-damage meaning", () => {
  equal(evaluateRuntimeV02SourceDamagedRequirement({ damage: 0 }, { predicate: "source_damaged" }).matched, false);
  equal(evaluateRuntimeV02SourceDamagedRequirement({ damage: 1 }, { predicate: "source_damaged" }).matched, true);
});

Deno.test("shared source Shield threshold matches current Shield at or above threshold", () => {
  const requirement = { predicate: "source_has_shield_at_least", value: 10 } as const;
  const below = evaluateRuntimeV02SourceHasShieldAtLeastRequirement({ shield: 9 }, requirement);
  equal(below.matched, false);
  equal(below.required_shield, 10);
  equal(below.actual_shield, 9);

  const exact = evaluateRuntimeV02SourceHasShieldAtLeastRequirement({ shield: 10 }, requirement);
  equal(exact.matched, true);

  const above = evaluateRuntimeV02SourceHasShieldAtLeastRequirement({ shield: 30 }, requirement);
  equal(above.matched, true);
});

Deno.test("source Shield threshold normalization fails closed on malformed shapes", () => {
  throws(
    () => normalizeRuntimeV02SourceHasShieldAtLeastRequirement({ predicate: "source_has_shield_at_least", value: 0 }),
    "tcg_v0_2_requirement_source_shield_value_invalid",
  );
  throws(
    () => normalizeRuntimeV02SourceHasShieldAtLeastRequirement({ predicate: "source_has_shield_at_least", value: 1, extra: true }),
    "tcg_v0_2_requirement_source_shield_field_unsupported:extra",
  );
  throws(
    () => evaluateRuntimeV02SourceHasShieldAtLeastRequirement(
      { shield: -1 },
      { predicate: "source_has_shield_at_least", value: 1 },
    ),
    "tcg_v0_2_requirement_source_shield_amount_invalid",
  );
});
