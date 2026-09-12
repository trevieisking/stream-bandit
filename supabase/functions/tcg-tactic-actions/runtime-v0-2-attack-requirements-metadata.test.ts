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

function attack(requirements: unknown = []) {
  return {
    id: "total-convergence",
    name: "Total Convergence",
    cost: [{ element: "Any", amount: 3 }],
    base_damage: null,
    damage_formula: { base: 120, terms: [] },
    requirements,
  };
}

function stateWith(requirements: unknown = []) {
  const cardId = "prismatic-founder";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "3 Any — Total Convergence — 120" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Prismatic Founder",
          card_family: "Creature",
          prestige: { starbound: { enabled: false } },
          creature: { attacks: [attack(requirements)] },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

Deno.test("ordinary structured attacks expose an empty declaration-requirement list", () => {
  const metadata = structuredRuntimeAttackMetadata(stateWith([]), "prismatic-founder", 1);
  assertJsonEquals(metadata?.requirements, []);
});

Deno.test("Total Convergence exposes the frozen distinct attached-Essence requirement", () => {
  const requirement = {
    predicate: "attached_essence_distinct_element_count_at_least",
    target: "$source_creature",
    count: 3,
    allowed_elements: ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"],
  };
  const metadata = structuredRuntimeAttackMetadata(stateWith([requirement]), "prismatic-founder", 1);
  assertJsonEquals(metadata?.requirements, [requirement]);
});

Deno.test("structured attack requirement metadata fails closed on an unsupported predicate", () => {
  assertThrows(
    () => structuredRuntimeAttackMetadata(stateWith([{
      predicate: "client_supplied_distinct_element_count",
      target: "$source_creature",
      count: 3,
      allowed_elements: ["Astral", "Ember", "Gale"],
    }]), "prismatic-founder", 1),
    "tcg_v0_2_attack_requirement_predicate_unsupported:total-convergence:client_supplied_distinct_element_count",
  );
});

Deno.test("structured attack requirement metadata fails closed when target is not the source creature", () => {
  assertThrows(
    () => structuredRuntimeAttackMetadata(stateWith([{
      predicate: "attached_essence_distinct_element_count_at_least",
      target: "$current_opponent_vanguard",
      count: 3,
      allowed_elements: ["Astral", "Ember", "Gale"],
    }]), "prismatic-founder", 1),
    "tcg_v0_2_attack_requirement_target_invalid:total-convergence",
  );
});

Deno.test("structured attack requirement metadata rejects non-positive distinct counts", () => {
  assertThrows(
    () => structuredRuntimeAttackMetadata(stateWith([{
      predicate: "attached_essence_distinct_element_count_at_least",
      target: "$source_creature",
      count: 0,
      allowed_elements: ["Astral", "Ember", "Gale"],
    }]), "prismatic-founder", 1),
    "tcg_v0_2_attack_requirement_count_invalid:total-convergence",
  );
});

Deno.test("structured attack requirement metadata rejects duplicate allowed elements", () => {
  assertThrows(
    () => structuredRuntimeAttackMetadata(stateWith([{
      predicate: "attached_essence_distinct_element_count_at_least",
      target: "$source_creature",
      count: 3,
      allowed_elements: ["Astral", "Ember", "Astral"],
    }]), "prismatic-founder", 1),
    "tcg_v0_2_attack_requirement_allowed_elements_duplicate:total-convergence",
  );
});

Deno.test("structured attack requirement arrays preserve server-owned copies of allowed elements", () => {
  const requirement = {
    predicate: "attached_essence_distinct_element_count_at_least",
    target: "$source_creature",
    count: 3,
    allowed_elements: ["Astral", "Ember", "Gale"],
  };
  const metadata = structuredRuntimeAttackMetadata(stateWith([requirement]), "prismatic-founder", 1);
  const exposed = metadata?.requirements[0];
  assertEquals(exposed?.count, 3);
  requirement.allowed_elements[0] = "ClientMutation";
  assertEquals(exposed?.allowed_elements[0], "Astral");
});
