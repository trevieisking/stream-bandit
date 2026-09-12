import {
  evaluateRuntimeAttackDirectConditionalAddFormula,
  resolveRuntimeAttackAuthority,
  type RuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
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

function context(overrides: Record<string, unknown> = {}) {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: [],
    source_attached_essence_kinds: [],
    ...overrides,
  };
}

Deno.test("legacy and fixed attacks stay outside direct conditional_add evaluation", () => {
  const legacyAuthority = resolveRuntimeAttackAuthority(
    { card_index: { legacy: { definition: { id: "legacy" } } } },
    "legacy",
    1,
    legacy(),
  );
  if (!legacyAuthority) throw new Error("legacy authority required");
  assertEquals(evaluateRuntimeAttackDirectConditionalAddFormula(legacyAuthority, context()), null);

  const fixed = resolveRuntimeAttackAuthority(stateWith("fixed", {
    id: "fixed-hit",
    name: "Fixed Hit",
    cost: [{ element: "Ember", amount: 1 }],
    base_damage: 40,
    damage_formula: null,
  }), "fixed", 1, legacy());
  if (!fixed) throw new Error("fixed authority required");
  assertEquals(evaluateRuntimeAttackDirectConditionalAddFormula(fixed, context()), null);
});

Deno.test("direct target-condition formula evaluates from declaration context", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("cindercrest", {
    id: "cinder-spiral",
    name: "Cinder Spiral",
    cost: [{ element: "Ember", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      terms: [{
        kind: "conditional_add",
        amount: 30,
        when: { predicate: "target_has_condition", condition: "Scorched" },
      }],
    },
  }), "cindercrest", 1, legacy());
  if (!authority) throw new Error("structured authority required");

  assertEquals(
    evaluateRuntimeAttackDirectConditionalAddFormula(
      authority,
      context({ target_conditions: ["Scorched"] }),
    )?.damage,
    90,
  );
  assertEquals(
    evaluateRuntimeAttackDirectConditionalAddFormula(authority, context())?.damage,
    60,
  );
});

Deno.test("direct source/reserve/hand/relic/Vanguard predicates are runtime-ready", () => {
  const cases: Array<{
    id: string;
    when: Record<string, unknown>;
    patch: Record<string, unknown>;
  }> = [
    ["burrow-burst", { predicate: "source_has_condition", condition: "Scorched" }, { source_conditions: ["Scorched"] }],
    ["tailwind-strike", { predicate: "source_became_vanguard_this_turn" }, { source_became_vanguard_this_turn: true }],
    ["thorn-rush", { predicate: "reserve_count_at_least", controller: "self", count: 3 }, { self_reserve_count: 3 }],
    ["hidden-step", { predicate: "hand_count_at_least", player: "opponent", count: 5 }, { opponent_hand_count: 5 }],
    ["wall-break", { predicate: "source_has_relic" }, { source_has_relic: true }],
    ["thought-rend", { predicate: "target_has_any_condition" }, { target_conditions: ["Dazed"] }],
  ].map(([id, when, patch]) => ({ id, when, patch })) as Array<{ id: string; when: Record<string, unknown>; patch: Record<string, unknown> }>;

  for (const item of cases) {
    const authority = resolveRuntimeAttackAuthority(stateWith(item.id, {
      id: item.id,
      name: item.id,
      cost: [{ element: "Any", amount: 1 }],
      base_damage: null,
      damage_formula: {
        base: 50,
        terms: [{ kind: "conditional_add", amount: 20, when: item.when }],
      },
    }), item.id, 1, legacy());
    if (!authority) throw new Error(`${item.id} authority required`);
    assertEquals(
      evaluateRuntimeAttackDirectConditionalAddFormula(authority, context(item.patch))?.damage,
      70,
      `${item.id} damage`,
    );
  }
});

Deno.test("event-history conditional_add formulas deliberately preserve legacy fallback", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("arcprowler", {
    id: "relay-strike",
    name: "Relay Strike",
    cost: [{ element: "Volt", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          predicate: "event_occurred",
          event: "device_resolved",
          controller: "self",
          window: "current_turn",
          min_count: 1,
        },
      }],
    },
  }), "arcprowler", 1, legacy());
  if (!authority) throw new Error("event authority required");
  assertEquals(
    evaluateRuntimeAttackDirectConditionalAddFormula(
      authority,
      context({ current_turn_events: [{ event: "device_resolved", controller: "self" }] }),
    ),
    null,
  );
});

Deno.test("temporary/borrowed attachment-kind formula deliberately preserves legacy fallback", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("dynamozer", {
    id: "gridbreaker",
    name: "Gridbreaker",
    cost: [{ element: "Volt", amount: 4 }],
    base_damage: null,
    damage_formula: {
      base: 150,
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
  }), "dynamozer", 1, legacy());
  if (!authority) throw new Error("Gridbreaker authority required");
  assertEquals(
    evaluateRuntimeAttackDirectConditionalAddFormula(
      authority,
      context({ source_attached_essence_kinds: ["temporary"] }),
    ),
    null,
  );
});

Deno.test("direct conditional_add authority fails closed on an impossible damage-source pairing", () => {
  const malformed = {
    ...legacy(),
    id: "malformed-direct",
    metadata_source: "structured_v0_2",
    damage_source: "base_damage",
    damage: 60,
    count_add_formula: null,
    conditional_add_formula: {
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: { predicate: "source_has_relic" },
      }],
    },
    target_permissions: [],
    requirements: [],
  } as RuntimeAttackAuthority;

  assertThrows(
    () => evaluateRuntimeAttackDirectConditionalAddFormula(
      malformed,
      context({ source_has_relic: true }),
    ),
    "tcg_v0_2_attack_conditional_add_authority_damage_source_invalid:malformed-direct:base_damage",
  );
});
