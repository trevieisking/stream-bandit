import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageHealEachEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

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

function stateWith(afterDamage: unknown[], attackId = "canopy-crash") {
  const cardId = "test-heal-each-creature";
  return {
    turn_seq: 19,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "4 Grove — Canopy Crash — 140; heal Reserve" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Heal Each Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Canopy Crash",
              cost: [{ element: "Grove", amount: 4 }],
              base_damage: 140,
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

function canopyProgram() {
  return [{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 4 },
    then: [{
      op: "HEAL_EACH",
      controller: "self",
      zone: "reserve",
      filters: { card_family: "Creature" },
      amount: 20,
    }],
  }];
}

Deno.test("Canopy Crash-style full Reserve healing is registry-driven", () => {
  const reserve = [creature(30), creature(10), creature(0), creature(25)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    stateWith(canopyProgram()),
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result?.attack_id, "canopy-crash");
  assertEquals(result?.effects[0].condition_met, true);
  assertEquals(result?.effects[0].target_count, 4);
  assertEquals(result?.effects[0].actual_heal_total, 50);
  assertEquals(result?.effects[0].targets.map((target) => target.actual_heal).join(","), "20,10,0,20");
  assertEquals(reserve.map((target) => target.damage).join(","), "10,0,0,5");
});

Deno.test("Reserve threshold false remains structurally owned and heals nobody", () => {
  const reserve = [creature(30), creature(10), creature(25), null];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    stateWith(canopyProgram()),
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result?.effects[0].condition_met, false);
  assertEquals(result?.effects[0].target_count, 0);
  assertEquals(result?.effects[0].actual_heal_total, 0);
  assertEquals(reserve.slice(0, 3).map((target: any) => target.damage).join(","), "30,10,25");
});

Deno.test("HEAL_EACH reports actual healing per Reserve target", () => {
  const reserve = [creature(5), creature(20), creature(1), creature(40)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    stateWith(canopyProgram()),
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result?.effects[0].actual_heal_total, 46);
  assertEquals(result?.effects[0].targets.map((target) => target.actual_heal).join(","), "5,20,1,20");
  assertEquals(reserve.map((target) => target.damage).join(","), "0,0,0,20");
});

Deno.test("mixed after_damage programs do not partially execute HEAL_EACH", () => {
  const state = stateWith([
    ...canopyProgram(),
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
  ]);
  const reserve = [creature(30), creature(30), creature(30), creature(30)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    state,
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result, null);
  assertEquals(reserve.map((target) => target.damage).join(","), "30,30,30,30");
});

Deno.test("HEAL_EACH requires self Reserve Creature scope", () => {
  const wrongController = canopyProgram() as any[];
  wrongController[0].then[0].controller = "opponent";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(wrongController),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_controller_unsupported",
  );

  const wrongZone = canopyProgram() as any[];
  wrongZone[0].then[0].zone = "field";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(wrongZone),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_zone_unsupported",
  );
});

Deno.test("unsupported HEAL_EACH filters and amounts fail closed", () => {
  const filtered = canopyProgram() as any[];
  filtered[0].then[0].filters.element = "Grove";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(filtered),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_filter_field_unsupported",
  );

  const invalidAmount = canopyProgram() as any[];
  invalidAmount[0].then[0].amount = 0;
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(invalidAmount),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_amount_invalid",
  );
});

Deno.test("unsupported HEAL_EACH predicate fails closed", () => {
  const program = canopyProgram() as any[];
  program[0].when.predicate = "source_damaged";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(program),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_predicate_unsupported",
  );
});

Deno.test("self-heal and selected-target healing remain outside HEAL_EACH owner", () => {
  const selfHeal = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  assertEquals(
    structuredRuntimeAfterDamageHealEachEffects(
      selfHeal,
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    null,
  );

  const selected = stateWith([
    { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ]);
  assertEquals(
    structuredRuntimeAfterDamageHealEachEffects(
      selected,
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    null,
  );
});

Deno.test("legacy-only matches remain on HEAL_EACH compatibility authority", () => {
  const state = stateWith(canopyProgram());
  delete state.runtime_registry_v0_2;
  const reserve = [creature(30), creature(30), creature(30), creature(30)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    state,
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result, null);
  assertEquals(reserve.map((target) => target.damage).join(","), "30,30,30,30");
});
