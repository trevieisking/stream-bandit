import { resolveRuntimeAttackAuthority } from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

function legacy(overrides: Record<string, unknown> = {}) {
  return {
    name: "Legacy Name",
    raw: "1 Ember — Legacy Name — 30; target becomes Scorched",
    typed: { Ember: 1 },
    any: 0,
    damage: 30,
    effect: "target becomes Scorched",
    starbound: true,
    ...overrides,
  };
}

function creatureEntry(cardId: string, attacks: Record<string, unknown>[]) {
  return {
    card_id: cardId,
    definition: { id: cardId, attack_1: legacy().raw, attack_2: legacy().raw },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      creature: { attacks },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function stateWith(entries: Record<string, Record<string, unknown>>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: entries,
  } as Record<string, unknown>;
}

Deno.test("legacy-only match preserves the exact legacy attack authority", () => {
  const legacyAttack = legacy();
  const state = { card_index: { "legacy-card": { definition: { id: "legacy-card" } } } };
  const attack = resolveRuntimeAttackAuthority(state, "legacy-card", 1, legacyAttack);
  assertEquals(attack?.metadata_source, "legacy");
  assertEquals(attack?.damage_source, "legacy");
  assertEquals(attack?.id, null);
  assertEquals(attack?.name, legacyAttack.name);
  assertJsonEquals(attack?.typed, legacyAttack.typed);
  assertEquals(attack?.any, legacyAttack.any);
  assertEquals(attack?.damage, legacyAttack.damage);
  assertEquals(attack?.effect, legacyAttack.effect);
  assertEquals(attack?.starbound, legacyAttack.starbound);
});

Deno.test("marked v0.2 match makes structured identity cost and fixed base authoritative", () => {
  const state = stateWith({
    "ember-test": creatureEntry("ember-test", [{
      id: "structured-claw",
      name: "Structured Claw",
      cost: [{ element: "Ember", amount: 2 }, { element: "Any", amount: 1 }],
      base_damage: 70,
      damage_formula: null,
    }]),
  });
  const attack = resolveRuntimeAttackAuthority(state, "ember-test", 1, legacy({
    name: "Wrong Legacy Name",
    typed: { Tide: 9 },
    any: 9,
    damage: 999,
  }));
  assertEquals(attack?.metadata_source, "structured_v0_2");
  assertEquals(attack?.damage_source, "base_damage");
  assertEquals(attack?.id, "structured-claw");
  assertEquals(attack?.name, "Structured Claw");
  assertJsonEquals(attack?.typed, { Ember: 2 });
  assertEquals(attack?.any, 1);
  assertEquals(attack?.damage, 70);
});

Deno.test("marked v0.2 match preserves only legacy effect and Starbound compatibility fields", () => {
  const compat = legacy({ effect: "legacy compatibility effect", starbound: true });
  const state = stateWith({
    "astral-test": creatureEntry("astral-test", [{
      id: "structured-star",
      name: "Structured Star",
      cost: [{ element: "Astral", amount: 1 }],
      base_damage: 50,
      damage_formula: null,
    }]),
  });
  const attack = resolveRuntimeAttackAuthority(state, "astral-test", 1, compat);
  assertEquals(attack?.effect, "legacy compatibility effect");
  assertEquals(attack?.starbound, true);
  assertEquals(attack?.raw, compat.raw);
});

Deno.test("formula attack uses only the structured formula baseline in C2a", () => {
  const state = stateWith({
    "formula-card": creatureEntry("formula-card", [{
      id: "formula-hit",
      name: "Formula Hit",
      cost: [{ element: "Astral", amount: 2 }],
      base_damage: null,
      damage_formula: {
        base: 80,
        terms: [{ kind: "conditional_add", amount: 30, when: { predicate: "target_has_condition" } }],
      },
    }]),
  });
  const attack = resolveRuntimeAttackAuthority(state, "formula-card", 1, legacy({ damage: 999 }));
  assertEquals(attack?.damage, 80);
  assertEquals(attack?.damage_source, "damage_formula.base");
});

Deno.test("marked v0.2 attack fails closed when legacy compatibility is unavailable", () => {
  const state = stateWith({
    "compat-required": creatureEntry("compat-required", [{
      id: "needs-compat",
      name: "Needs Compat",
      cost: [{ element: "Ember", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
    }]),
  });
  assertThrows(
    () => resolveRuntimeAttackAuthority(state, "compat-required", 1, null),
    "tcg_v0_2_attack_legacy_compatibility_required:needs-compat",
  );
});

Deno.test("marked v0.2 attack fails closed when no deterministic baseline exists", () => {
  const state = stateWith({
    "missing-baseline": creatureEntry("missing-baseline", [{
      id: "missing-baseline-hit",
      name: "Missing Baseline Hit",
      cost: [{ element: "Ember", amount: 1 }],
      base_damage: null,
      damage_formula: null,
    }]),
  });
  assertThrows(
    () => resolveRuntimeAttackAuthority(state, "missing-baseline", 1, legacy()),
    "tcg_v0_2_attack_baseline_damage_required:missing-baseline-hit",
  );
});

Deno.test("marked mixed structured and legacy snapshots still fail closed", () => {
  const state = stateWith({
    "structured": creatureEntry("structured", [{
      id: "structured-hit",
      name: "Structured Hit",
      cost: [{ element: "Ember", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
    }]),
    "legacy-only": { card_id: "legacy-only", definition: { id: "legacy-only" } },
  });
  assertThrows(
    () => resolveRuntimeAttackAuthority(state, "structured", 1, legacy()),
    "tcg_v0_2_snapshot_definition_missing:legacy-only",
  );
});
