import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageSelectedHealChoice } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import {
  runtimeV02CreateSelectedHealChoice,
  runtimeV02PendingAttackChoiceView,
  runtimeV02ResolveSelectedHealChoice,
  type RuntimeV02FriendlyFieldEntry,
} from "../_shared/tcg-match-attack-choice-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
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

function creature(damage = 0) {
  return {
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function deepCurrentProgram() {
  return [
    { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ];
}

function stateWith(afterDamage: unknown[]) {
  const cardId = "test-deep-current-creature";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Test Tideroar",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: "deep-current",
              name: "Deep Current",
              cost: [{ element: "Tide", amount: 3 }],
              base_damage: 110,
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

function entry(where: "vanguard" | "reserve", index: number | null, anchor: string, label: string, damage: number): RuntimeV02FriendlyFieldEntry {
  return { where, index, anchor_uid: anchor, label, creature: creature(damage) };
}

Deno.test("Deep Current selected heal descriptor is registry-driven and pure", () => {
  const state = stateWith(deepCurrentProgram());
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(state, { card_id: "test-deep-current-creature" }, 1);
  assertEquals(descriptor, {
    attack_id: "deep-current",
    phase: "after_damage",
    selection: { controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    heal: { target: "$heal_target", amount: 30 },
  });
});

Deno.test("pending attack choice exposes only damaged friendly creatures and stays private", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const entries = [
    entry("vanguard", null, "v1", "Tideroar", 40),
    entry("reserve", 0, "r1", "Puddlepip", 0),
    entry("reserve", 2, "r3", "Reefback", 10),
  ];
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  assertEquals(choice.options.map((option) => option.id), ["creature:1:v1", "creature:1:r3"]);
  assertEquals(runtimeV02PendingAttackChoiceView(choice, 2), {
    id: "choice-1",
    seat: 1,
    kind: "select_damaged_friendly_creature_heal",
    waiting: true,
  });
  assertEquals((runtimeV02PendingAttackChoiceView(choice, 1) as any).options.length, 2);
});

Deno.test("no damaged friendly creature means no pending heal choice", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, [entry("vanguard", null, "v1", "Tideroar", 0)], "choice-1");
  assertEquals(choice, null);
});

Deno.test("resolving selected heal is revision-choice bound and reports actual healing", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const entries = [entry("vanguard", null, "v1", "Tideroar", 12), entry("reserve", 0, "r1", "Rillrunner", 50)];
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  const result = runtimeV02ResolveSelectedHealChoice(choice, 1, "choice-1", ["creature:1:v1"], entries);
  assertEquals(result.actual_heal, 12);
  assertEquals(entries[0].creature.damage, 0);
  assertEquals(result.target_where, "vanguard");
  assertEquals(result.target_index, null);
});

Deno.test("selected heal rejects wrong seat, stale choice, unknown option and no-longer-damaged target", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const entries = [entry("vanguard", null, "v1", "Tideroar", 20)];
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 2, "choice-1", ["creature:1:v1"], entries), "not_yours");
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 1, "old-choice", ["creature:1:v1"], entries), "stale_id");
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 1, "choice-1", ["creature:1:missing"], entries), "unknown_option");
  entries[0].creature.damage = 0;
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 1, "choice-1", ["creature:1:v1"], entries), "target_not_damaged");
});

Deno.test("malformed selected-heal metadata fails closed while mixed programs remain outside this owner", () => {
  const wrongController = deepCurrentProgram() as any[];
  wrongController[0].controller = "opponent";
  assertThrows(() => structuredRuntimeAfterDamageSelectedHealChoice(stateWith(wrongController), { card_id: "test-deep-current-creature" }, 1), "controller_unsupported");

  const wrongFilter = deepCurrentProgram() as any[];
  wrongFilter[0].filters.damaged = false;
  assertThrows(() => structuredRuntimeAfterDamageSelectedHealChoice(stateWith(wrongFilter), { card_id: "test-deep-current-creature" }, 1), "damaged_filter_required");

  const wrongTarget = deepCurrentProgram() as any[];
  wrongTarget[1].target = "$other";
  assertThrows(() => structuredRuntimeAfterDamageSelectedHealChoice(stateWith(wrongTarget), { card_id: "test-deep-current-creature" }, 1), "target_mismatch");

  const mixed = [...deepCurrentProgram(), { op: "ADD_SHIELD", target: "$source_creature", amount: 10 }];
  assertEquals(structuredRuntimeAfterDamageSelectedHealChoice(stateWith(mixed), { card_id: "test-deep-current-creature" }, 1), null);
});

Deno.test("legacy-only match state remains on compatibility authority", () => {
  const state = stateWith(deepCurrentProgram());
  delete state.runtime_registry_v0_2;
  assertEquals(structuredRuntimeAfterDamageSelectedHealChoice(state, { card_id: "test-deep-current-creature" }, 1), null);
});
