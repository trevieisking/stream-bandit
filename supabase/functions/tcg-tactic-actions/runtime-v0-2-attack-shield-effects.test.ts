import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import { addRuntimeShield } from "./runtime-v0-2-core.ts";

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

function creature(shield = 0) {
  return {
    damage: 0,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "gravity-shell") {
  const cardId = "test-shield-creature";
  return {
    turn_seq: 12,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "3 Astral — Gravity Shell — 80; gain 20 Shield" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Shield Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Shield Attack",
              cost: [{ element: "Astral", amount: 3 }],
              base_damage: 80,
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

Deno.test("shared Shield primitive preserves the 60 cap and reports actual gain", () => {
  const source = creature(55);
  assertEquals(addRuntimeShield(source, 20), 5);
  assertEquals(source.shield, 60);
  assertEquals(addRuntimeShield(source, 20), 0);
  assertEquals(source.shield, 60);
  assertEquals(addRuntimeShield(source, -10), 0);
  assertEquals(source.shield, 60);
});

Deno.test("Gravity Shell-style attack Shield gain is registry-driven", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
  }]);
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(
    state,
    { card_id: "test-shield-creature" },
    1,
    source,
  );
  assertEquals(result?.attack_id, "gravity-shell");
  assertEquals(result?.effects[0].amount, 20);
  assertEquals(result?.effects[0].actual_gain, 20);
  assertEquals(result?.effects[0].shield_cap, 60);
  assertEquals(source.shield, 30);
});

Deno.test("structured attack Shield gain reports only real capacity at the cap", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
  }]);
  const source = creature(55);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result?.effects[0].actual_gain, 5);
  assertEquals(source.shield, 60);
});

Deno.test("non-ADD_SHIELD after_damage stays on compatibility authority", () => {
  const state = stateWith([{ op: "HEAL", target: "$source_creature", amount: 20 }]);
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.shield, 10);
});

Deno.test("mixed after_damage programs do not partially execute Shield gain", () => {
  const state = stateWith([
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
    { op: "HEAL", target: "$source_creature", amount: 20 },
  ]);
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.shield, 10);
});

Deno.test("attack-owned Shield gain requires the source creature target", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$attack_target",
    amount: 20,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, creature()),
    "tcg_v0_2_attack_shield_target_unsupported",
  );
});

Deno.test("malformed owned Shield metadata fails closed", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
    surprise: true,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, creature()),
    "tcg_v0_2_attack_shield_step_field_unsupported",
  );
});

Deno.test("invalid owned Shield amount fails closed", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 0,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, creature()),
    "tcg_v0_2_attack_shield_amount_invalid",
  );
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
  }]);
  delete state.runtime_registry_v0_2;
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.shield, 10);
});
