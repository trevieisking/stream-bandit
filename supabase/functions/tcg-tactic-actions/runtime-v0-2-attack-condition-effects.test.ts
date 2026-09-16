import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageConditionEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function creature() {
  return {
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "condition-strike") {
  const cardId = "test-condition-creature";
  return {
    turn_seq: 7,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "1 Shade — Legacy — 50" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Condition Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Condition Strike",
              cost: [{ element: "Shade", amount: 1 }],
              base_damage: 50,
              damage_formula: null,
              requirements: [],
              on_declare: [],
              before_damage: [],
              after_damage: afterDamage,
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

Deno.test("condition-only after_damage applies to the actual attack target", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  const source = creature();
  const target = creature();
  const opponentVanguard = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    source,
    target,
    opponentVanguard,
  );
  assertEquals(result?.attack_id, "condition-strike");
  assertEquals(result?.effects[0].applied, true);
  assertEquals(target.conditions.modifier, "Crushed");
  assertEquals(opponentVanguard.conditions.modifier, null);
});

Deno.test("source-creature condition effects are registry-driven", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$source_creature",
    condition: "Scorched",
    mode: "apply_if_empty",
  }], "overheat");
  const source = creature();
  const target = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    source,
    target,
    creature(),
  );
  assertEquals(result?.effects[0].condition, "Scorched");
  assertEquals(source.conditions.scorched, true);
  assertEquals(target.conditions.scorched, false);
});

Deno.test("current-opponent-vanguard target does not alias a Reserve attack target", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$current_opponent_vanguard",
    condition: "Silenced",
    mode: "apply_if_empty",
  }], "dark-forecast");
  const source = creature();
  const reserveTarget = creature();
  const opponentVanguard = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    source,
    reserveTarget,
    opponentVanguard,
  );
  assertEquals(result?.effects[0].applied, true);
  assertEquals(opponentVanguard.conditions.modifier, "Silenced");
  assertEquals(reserveTarget.conditions.modifier, null);
});

Deno.test("apply_if_empty preserves an occupied condition slot", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  const target = creature();
  target.conditions.modifier = "Silenced";
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result?.effects[0].applied, false);
  assertEquals(result?.effects[0].reason, "slot_occupied");
  assertEquals(target.conditions.modifier, "Silenced");
});

Deno.test("condition immunity prevents the structured attack condition", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  const target = creature();
  target.flags.lifecycle_condition_immunity = { turn_seq: 7, conditions: ["Crushed"] };
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result?.effects[0].prevented, true);
  assertEquals(result?.effects[0].reason, "condition_immunity");
  assertEquals(target.conditions.modifier, null);
});

Deno.test("mixed after_damage programs remain on compatibility authority and do not partially execute", () => {
  const state = stateWith([
    { op: "APPLY_CONDITION", target: "$attack_target", condition: "Crushed", mode: "apply_if_empty" },
    { op: "HEAL", target: "$source_creature", amount: 20 },
  ]);
  const target = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result, null);
  assertEquals(target.conditions.modifier, null);
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  delete state.runtime_registry_v0_2;
  const target = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result, null);
  assertEquals(target.conditions.modifier, null);
});

Deno.test("malformed owned condition metadata fails closed", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
    surprise: true,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageConditionEffects(
      state,
      { card_id: "test-condition-creature" },
      1,
      creature(),
      creature(),
      creature(),
    ),
    "tcg_v0_2_attack_condition_step_field_unsupported",
  );
});
