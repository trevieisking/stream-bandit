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
    raw: "2 Any — Legacy Attack — 60",
    typed: {},
    any: 2,
    damage: 60,
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

Deno.test("legacy attack authority carries no structured conditional_add metadata", () => {
  const authority = resolveRuntimeAttackAuthority(
    { card_index: { legacy: { definition: { id: "legacy" } } } },
    "legacy",
    1,
    legacy(),
  );
  if (!authority) throw new Error("legacy authority required");
  assertEquals(authority.metadata_source, "legacy");
  assertEquals(authority.conditional_add_formula, null);
});

Deno.test("structured fixed attack authority carries a null conditional_add formula", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("fixed", {
    id: "fixed-hit",
    name: "Fixed Hit",
    cost: [{ element: "Ember", amount: 1 }],
    base_damage: 40,
    damage_formula: null,
  }), "fixed", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  assertEquals(authority.metadata_source, "structured_v0_2");
  assertEquals(authority.conditional_add_formula, null);
});

Deno.test("structured attack authority propagates a direct-state conditional_add formula", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("cindercrest", {
    id: "cinder-spiral",
    name: "Cinder Spiral",
    cost: [{ element: "Ember", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 30,
        when: { predicate: "target_has_condition", condition: "Scorched" },
      }],
    },
  }), "cindercrest", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  assertEquals(authority.damage, 60);
  assertJsonEquals(authority.conditional_add_formula, {
    snapshot: "legal_declaration",
    terms: [{
      kind: "conditional_add",
      amount: 30,
      when: { predicate: "target_has_condition", condition: "Scorched" },
    }],
  });
});

Deno.test("structured attack authority owns nested conditional_add event filters", () => {
  const preventionKinds = ["ability", "relic", "shield"];
  const state = stateWith("citadelhorn", {
    id: "bastion-quake",
    name: "Bastion Quake",
    cost: [{ element: "Stone", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 70,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          predicate: "event_occurred",
          event: "damage_prevented",
          window: "current_turn",
          min_count: 1,
          filters: {
            target: "source_creature",
            prevention_kind_any: preventionKinds,
          },
        },
      }],
    },
  });

  const first = resolveRuntimeAttackAuthority(state, "citadelhorn", 1, legacy());
  const second = resolveRuntimeAttackAuthority(state, "citadelhorn", 1, legacy());
  if (!first?.conditional_add_formula || !second?.conditional_add_formula) {
    throw new Error("structured conditional_add authority required");
  }
  const firstWhen = first.conditional_add_formula.terms[0].when;
  const secondWhen = second.conditional_add_formula.terms[0].when;
  if ("any" in firstWhen || "any" in secondWhen || firstWhen.predicate !== "event_occurred" || secondWhen.predicate !== "event_occurred") {
    throw new Error("damage_prevented event predicate required");
  }
  if (firstWhen.event !== "damage_prevented" || secondWhen.event !== "damage_prevented") {
    throw new Error("damage_prevented event required");
  }

  firstWhen.filters.prevention_kind_any.reverse();
  assertEquals(firstWhen.filters.prevention_kind_any[0], "shield", "first authority copy should be mutable in isolation");
  assertEquals(
    secondWhen.filters.prevention_kind_any[0],
    "ability",
    "authority copies must not share nested prevention-kind arrays",
  );
});

Deno.test("structured attack authority owns conditional_add any-composition arrays", () => {
  const state = stateWith("dynamozer", {
    id: "gridbreaker",
    name: "Gridbreaker",
    cost: [{ element: "Volt", amount: 3 }],
    base_damage: null,
    damage_formula: {
      base: 100,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          any: [
            { predicate: "event_attack_source_has_attached_essence_kind", kind: "temporary" },
            { predicate: "event_attack_source_has_attached_essence_kind", kind: "borrowed" },
          ],
        },
      }],
    },
  });
  const first = resolveRuntimeAttackAuthority(state, "dynamozer", 1, legacy());
  const second = resolveRuntimeAttackAuthority(state, "dynamozer", 1, legacy());
  if (!first?.conditional_add_formula || !second?.conditional_add_formula) {
    throw new Error("structured conditional_add authority required");
  }
  const firstWhen = first.conditional_add_formula.terms[0].when;
  const secondWhen = second.conditional_add_formula.terms[0].when;
  if (!("any" in firstWhen) || !("any" in secondWhen)) throw new Error("any composition required");
  firstWhen.any[0] = { predicate: "source_has_relic" };
  assertEquals(
    secondWhen.any[0].predicate,
    "event_attack_source_has_attached_essence_kind",
    "authority copies must not share any-composition arrays",
  );
});
