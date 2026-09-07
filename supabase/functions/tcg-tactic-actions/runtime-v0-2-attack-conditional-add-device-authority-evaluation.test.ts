import {
  evaluateRuntimeAttackReadyConditionalAddFormula,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function legacy() {
  return {
    name: "Legacy Attack",
    raw: "2 Volt — Legacy Attack — 60; if you played a Device this turn, +20 damage",
    typed: { Volt: 2 },
    any: 0,
    damage: 60,
    effect: "if you played a Device this turn, +20 damage",
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

function context(events: Array<Record<string, unknown>> = [], overrides: Record<string, unknown> = {}) {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: events,
    source_attached_essence_kinds: [],
    ...overrides,
  } as any;
}

function deviceAuthority(cardId: string, attackId: string) {
  const authority = resolveRuntimeAttackAuthority(stateWith(cardId, {
    id: attackId,
    name: attackId,
    cost: [{ element: "Volt", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      snapshot: "legal_declaration",
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
  }), cardId, 1, legacy());
  if (!authority) throw new Error(`${attackId} authority required`);
  return authority;
}

Deno.test("Runtime-C ready authority evaluates all three frozen Device conditional attacks", () => {
  for (const [cardId, attackId] of [
    ["volt-arcprowler", "relay-strike"],
    ["volt-coilclank", "charged-tool"],
    ["volt-copperkite", "copper-arc"],
  ]) {
    const authority = deviceAuthority(cardId, attackId);
    const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(
      authority,
      context([{ event: "device_resolved", controller: "self" }]),
    );
    assertEquals(evaluation?.damage, 80, `${attackId} Device bonus`);
    assertEquals(evaluation?.terms[0].matched, true, `${attackId} matched`);
    assertEquals(evaluation?.terms[0].contribution, 20, `${attackId} contribution`);
  }
});

Deno.test("Device conditional attacks contribute zero when no Device resolved this turn", () => {
  const authority = deviceAuthority("volt-arcprowler", "relay-strike");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(evaluation?.damage, 60);
  assertEquals(evaluation?.terms[0].matched, false);
  assertEquals(evaluation?.terms[0].contribution, 0);
});

Deno.test("Runtime-C ready authority still evaluates the previously proven direct-state subset", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("ember-cindercrest", {
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
  }), "ember-cindercrest", 1, legacy());
  if (!authority) throw new Error("direct authority required");
  assertEquals(
    evaluateRuntimeAttackReadyConditionalAddFormula(
      authority,
      context([], { target_conditions: ["Scorched"] }),
    )?.damage,
    90,
  );
});

Deno.test("unproven event-history predicates remain outside Runtime-C ready authority", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("stone-citadelhorn", {
    id: "bastion-quake",
    name: "Bastion Quake",
    cost: [{ element: "Stone", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 70,
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
            prevention_kind_any: ["ability", "relic", "shield"],
          },
        },
      }],
    },
  }), "stone-citadelhorn", 1, legacy());
  if (!authority) throw new Error("prevention authority required");
  assertEquals(
    evaluateRuntimeAttackReadyConditionalAddFormula(
      authority,
      context([{ event: "damage_prevented", target: "source_creature", prevention_kind: "shield" }]),
    ),
    null,
  );
});

Deno.test("temporary/borrowed Gridbreaker predicate is Runtime-C ready from declaration attachment state", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("volt-dynamozer", {
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
  }), "volt-dynamozer", 1, legacy());
  if (!authority) throw new Error("Gridbreaker authority required");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(
    authority,
    context([], { source_attached_essence_kinds: ["temporary"] }),
  );
  assertEquals(evaluation?.damage, 170);
  assertEquals(evaluation?.terms[0].matched, true);
  assertEquals(evaluation?.terms[0].contribution, 20);
});
