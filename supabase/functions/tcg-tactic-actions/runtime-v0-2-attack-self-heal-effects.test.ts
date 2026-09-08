import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageSelfHealEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import { healRuntimeDamage } from "./runtime-v0-2-core.ts";

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

function creature(damage = 0, shield = 0) {
  return {
    damage,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "self-heal-attack") {
  const cardId = "test-self-heal-creature";
  return {
    turn_seq: 15,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "2 Tide — Self Heal — 60; heal" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Self Heal Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Self Heal Attack",
              cost: [{ element: "Tide", amount: 2 }],
              base_damage: 60,
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

Deno.test("shared heal primitive reports actual healing and never goes below zero", () => {
  const source = creature(7);
  assertEquals(healRuntimeDamage(source, 10), 7);
  assertEquals(source.damage, 0);
  assertEquals(healRuntimeDamage(source, 10), 0);
  assertEquals(source.damage, 0);
  assertEquals(healRuntimeDamage(source, -10), 0);
  assertEquals(source.damage, 0);
});

Deno.test("Rushing Wake-style source_damaged self-heal is registry-driven", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }], "rushing-wake");
  const source = creature(30);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result?.attack_id, "rushing-wake");
  assertEquals(result?.effects[0].condition_met, true);
  assertEquals(result?.effects[0].actual_heal, 10);
  assertEquals(source.damage, 20);
});

Deno.test("source_damaged self-heal remains structurally owned when condition is false", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }], "rushing-wake");
  const source = creature(0);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result?.effects[0].condition_met, false);
  assertEquals(result?.effects[0].actual_heal, 0);
  assertEquals(source.damage, 0);
});

Deno.test("Guarded Surge-style Shield predicate heals only while threshold is met", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_has_shield_at_least", value: 1 },
    then: [{ op: "HEAL", target: "$source_creature", amount: 20 }],
  }], "guarded-surge");
  const source = creature(35, 10);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result?.effects[0].condition_met, true);
  assertEquals(result?.effects[0].actual_heal, 20);
  assertEquals(source.damage, 15);

  const noShield = creature(35, 0);
  const noShieldResult = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, noShield);
  assertEquals(noShieldResult?.effects[0].condition_met, false);
  assertEquals(noShieldResult?.effects[0].actual_heal, 0);
  assertEquals(noShield.damage, 35);
});

Deno.test("mixed after_damage programs do not partially execute self-healing", () => {
  const state = stateWith([
    {
      op: "IF",
      when: { predicate: "source_damaged" },
      then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
    },
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
  ]);
  const source = creature(30);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 30);
});

Deno.test("unsupported owned self-heal predicate fails closed", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 1 },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    "tcg_v0_2_attack_self_heal_predicate_unsupported",
  );
});

Deno.test("owned self-heal requires source creature target", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$attack_target", amount: 10 }],
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    "tcg_v0_2_attack_self_heal_target_unsupported",
  );
});

Deno.test("invalid owned self-heal amount fails closed", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 0 }],
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    "tcg_v0_2_attack_self_heal_amount_invalid",
  );
});

Deno.test("selected-target and HEAL_EACH programs stay outside this owner", () => {
  const selected = stateWith([
    { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ]);
  assertEquals(
    structuredRuntimeAfterDamageSelfHealEffects(selected, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    null,
  );
  const each = stateWith([{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 4 },
    then: [{ op: "HEAL_EACH", controller: "self", zone: "reserve", filters: { card_family: "Creature" }, amount: 20 }],
  }]);
  assertEquals(
    structuredRuntimeAfterDamageSelfHealEffects(each, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    null,
  );
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  delete state.runtime_registry_v0_2;
  const source = creature(30);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 30);
});
