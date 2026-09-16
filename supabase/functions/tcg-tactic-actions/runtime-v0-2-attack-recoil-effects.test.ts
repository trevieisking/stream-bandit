import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageRecoilEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

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
    damage: 5,
    shield: 30,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "reckless-rush") {
  const cardId = "test-recoil-creature";
  return {
    turn_seq: 9,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "2 Ember — Legacy Rush — 70; place 10 damage on this creature" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Recoil Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Recoil Attack",
              cost: [{ element: "Ember", amount: 2 }],
              base_damage: 70,
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

Deno.test("attack-owned recoil is registry-driven and preserves Shield", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
  }]);
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(
    state,
    { card_id: "test-recoil-creature" },
    1,
    source,
  );
  assertEquals(result?.attack_id, "reckless-rush");
  assertEquals(result?.effects[0].damage_class, "recoil");
  assertEquals(result?.effects[0].placed, 10);
  assertEquals(result?.effects[0].shield_prevented, 0);
  assertEquals(source.damage, 15);
  assertEquals(source.shield, 30, "recoil placement must not consume Shield in this Pass C slice");
});

Deno.test("Meltline Charge preserves its frozen 20 recoil amount", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 20,
    damage_class: "recoil",
    source_attack_id: "meltline-charge",
  }], "meltline-charge");
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(
    state,
    { card_id: "test-recoil-creature" },
    1,
    source,
  );
  assertEquals(result?.attack_id, "meltline-charge");
  assertEquals(result?.effects[0].placed, 20);
  assertEquals(source.damage, 25);
  assertEquals(source.shield, 30);
});

Deno.test("non-recoil DIRECT_DAMAGE stays on later compatibility/listener authority", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "effect",
    source_attack_id: "reckless-rush",
  }]);
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 5);
  assertEquals(source.shield, 30);
});

Deno.test("mixed after_damage programs do not partially execute recoil", () => {
  const state = stateWith([
    { op: "DIRECT_DAMAGE", target: "$source_creature", amount: 10, damage_class: "recoil", source_attack_id: "reckless-rush" },
    { op: "HEAL", target: "$source_creature", amount: 20 },
  ]);
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 5);
});

Deno.test("attack-owned recoil requires the source creature target", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$attack_target",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, creature()),
    "tcg_v0_2_attack_recoil_target_unsupported",
  );
});

Deno.test("attack-owned recoil source_attack_id must match the structured attack", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "wrong-attack",
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, creature()),
    "tcg_v0_2_attack_recoil_source_attack_mismatch",
  );
});

Deno.test("malformed owned recoil metadata fails closed", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
    surprise: true,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, creature()),
    "tcg_v0_2_attack_recoil_step_field_unsupported",
  );
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
  }]);
  delete state.runtime_registry_v0_2;
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 5);
});