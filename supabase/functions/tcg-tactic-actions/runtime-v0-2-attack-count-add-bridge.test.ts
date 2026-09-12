import { structuredRuntimeAttackMetadata } from "../_shared/tcg-match-attack-v0-2.ts";
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

function creatureEntry(cardId: string, attack: Record<string, unknown>) {
  return {
    card_id: cardId,
    definition: { id: cardId, attack_1: "legacy" },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      creature: { attacks: [attack] },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function stateWith(cardId: string, attack: Record<string, unknown>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: { [cardId]: creatureEntry(cardId, attack) },
  } as Record<string, unknown>;
}

Deno.test("structured fixed attacks expose no count_add formula metadata", () => {
  const attack = structuredRuntimeAttackMetadata(stateWith("fixed", {
    id: "fixed-hit",
    name: "Fixed Hit",
    cost: [{ element: "Ember", amount: 1 }],
    base_damage: 40,
    damage_formula: null,
  }), "fixed", 1);
  assertEquals(attack?.count_add_formula, null);
});

Deno.test("conditional-only formulas remain outside count_add attack metadata authority", () => {
  const attack = structuredRuntimeAttackMetadata(stateWith("conditional", {
    id: "conditional-hit",
    name: "Conditional Hit",
    cost: [{ element: "Shade", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: { predicate: "hand_count_at_least", player: "opponent", count: 5 },
      }],
    },
  }), "conditional", 1);
  assertEquals(attack?.base_damage, 60);
  assertEquals(attack?.count_add_formula, null);
});

Deno.test("structured Ashen Stampede exposes its frozen count_cards formula metadata", () => {
  const attack = structuredRuntimeAttackMetadata(stateWith("pyrohorn", {
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
  }), "pyrohorn", 1);

  assertJsonEquals(attack?.count_add_formula, {
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

Deno.test("structured Total Convergence exposes its frozen distinct-Essence formula metadata", () => {
  const elements = ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"];
  const attack = structuredRuntimeAttackMetadata(stateWith("founder", {
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
  }), "founder", 1);

  assertJsonEquals(attack?.count_add_formula, {
    snapshot: "legal_declaration",
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
  });
});

Deno.test("structured attack lookup fails closed on an unsupported count_add counter", () => {
  assertThrows(() => structuredRuntimeAttackMetadata(stateWith("future", {
    id: "future-count",
    name: "Future Count",
    cost: [{ element: "Any", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 100,
      terms: [{
        kind: "count_add",
        counter: { kind: "opponent_rewards_claimed" },
        amount_per: 20,
        max_count: 6,
      }],
    },
  }), "future", 1), "tcg_v0_2_attack_count_add_counter_kind_unsupported:future-count:0:opponent_rewards_claimed");
});
