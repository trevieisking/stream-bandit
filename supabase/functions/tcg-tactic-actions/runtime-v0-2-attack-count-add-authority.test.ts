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

function legacy() {
  return {
    name: "Legacy Attack",
    raw: "3 Any — Legacy Attack — 120",
    typed: {},
    any: 3,
    damage: 120,
    effect: "",
    starbound: false,
  };
}

function stateWith(cardId: string, attack: Record<string, unknown>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: legacy().raw },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: cardId,
          card_family: "Creature",
          creature: { attacks: [attack] },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

Deno.test("legacy attack authority carries no structured count_add metadata", () => {
  const authority = resolveRuntimeAttackAuthority(
    { card_index: { legacy: { definition: { id: "legacy" } } } },
    "legacy",
    1,
    legacy(),
  );
  if (!authority) throw new Error("legacy authority required");
  assertEquals(authority.metadata_source, "legacy");
  assertEquals(authority.count_add_formula, null);
});

Deno.test("structured fixed attack authority carries a null count_add formula", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("fixed", {
    id: "fixed-hit",
    name: "Fixed Hit",
    cost: [{ element: "Ember", amount: 1 }],
    base_damage: 40,
    damage_formula: null,
  }), "fixed", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  assertEquals(authority.metadata_source, "structured_v0_2");
  assertEquals(authority.count_add_formula, null);
});

Deno.test("structured attack authority propagates Ashen Stampede count_cards metadata", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("pyrohorn", {
    id: "ashen-stampede",
    name: "Ashen Stampede",
    cost: [{ element: "Ember", amount: 4 }],
    base_damage: null,
    damage_formula: {
      base: 160,
      snapshot: "legal_declaration",
      terms: [{
        kind: "count_add",
        counter: {
          kind: "count_cards",
          controller: "self",
          zone: "field",
          filters: { card_family: "Creature", damaged: true },
        },
        amount_per: 10,
        max_count: 4,
      }],
    },
  }), "pyrohorn", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  assertEquals(authority.damage, 160);
  assertJsonEquals(authority.count_add_formula, {
    snapshot: "legal_declaration",
    terms: [{
      kind: "count_add",
      counter: {
        kind: "count_cards",
        controller: "self",
        zone: "field",
        filters: { card_family: "Creature", damaged: true },
      },
      amount_per: 10,
      max_count: 4,
    }],
  });
});

Deno.test("structured attack authority propagates and owns Total Convergence distinct-element metadata", () => {
  const elements = ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"];
  const state = stateWith("founder", {
    id: "total-convergence",
    name: "Total Convergence",
    cost: [{ element: "Any", amount: 3 }],
    base_damage: null,
    damage_formula: {
      base: 120,
      terms: [{
        kind: "count_add",
        counter: {
          kind: "distinct_attached_essence_elements",
          target: "$source_creature",
          allowed_elements: elements,
        },
        amount_per: 20,
        max_count: 8,
      }],
    },
  });
  const first = resolveRuntimeAttackAuthority(state, "founder", 1, legacy());
  const second = resolveRuntimeAttackAuthority(state, "founder", 1, legacy());
  if (!first?.count_add_formula || !second?.count_add_formula) throw new Error("structured count_add authority required");

  assertJsonEquals(first.count_add_formula, second.count_add_formula);
  const firstCounter = first.count_add_formula.terms[0].counter;
  const secondCounter = second.count_add_formula.terms[0].counter;
  if (firstCounter.kind !== "distinct_attached_essence_elements" || secondCounter.kind !== "distinct_attached_essence_elements") {
    throw new Error("distinct attached-Essence counter required");
  }
  firstCounter.allowed_elements[0] = "Mutated";
  assertEquals(secondCounter.allowed_elements[0], "Astral", "authority copies must not share allowed-element arrays");
});
