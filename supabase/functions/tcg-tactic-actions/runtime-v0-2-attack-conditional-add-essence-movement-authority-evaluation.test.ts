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
    name: "Deep Current",
    raw: "3 Tide — Deep Current — 110; if you moved Tide Essence this turn, +20 damage",
    typed: { Tide: 3 },
    any: 0,
    damage: 110,
    effect: "if you moved Tide Essence this turn, +20 damage",
    starbound: false,
  };
}

function stateWithMovements(movements: Array<Record<string, unknown>> = []) {
  const cardId = "tide-tideroar";
  return {
    turn_seq: 7,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    runtime_essence_movements_v0_2: movements,
    players: {
      "1": {
        vanguard: {
          stack: [{ uid: "tideroar-instance", card_id: cardId }],
          essence: [],
        },
        reserve: [],
      },
    },
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: legacy().raw },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Tideroar",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: "deep-current",
              name: "Deep Current",
              cost: [{ element: "Tide", amount: 3 }],
              base_damage: null,
              damage_formula: {
                base: 110,
                snapshot: "legal_declaration",
                terms: [{
                  kind: "conditional_add",
                  amount: 20,
                  when: {
                    predicate: "event_occurred",
                    event: "essence_moved",
                    controller: "self",
                    window: "current_turn",
                    min_count: 1,
                    filters: { element: "Tide" },
                  },
                }],
              },
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

function context() {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: [],
    source_attached_essence_kinds: [],
  } as any;
}

function movement(overrides: Record<string, unknown> = {}) {
  return {
    turn_seq: 7,
    controller_seat: 1,
    source_creature_uid: "friendly-a",
    destination_creature_uid: "friendly-b",
    essence_uid: "tide-essence-1",
    element: "Tide",
    source_action_id: "tactic:tide-marina-wayfinder",
    ...overrides,
  };
}

function authority(state: Record<string, unknown>) {
  const result = resolveRuntimeAttackAuthority(
    state,
    { uid: "tideroar-instance", card_id: "tide-tideroar" },
    1,
    legacy(),
  );
  if (!result) throw new Error("Deep Current authority required");
  return result;
}

Deno.test("Deep Current consumes canonical current-turn Tide Essence movement", () => {
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(
    authority(stateWithMovements([movement()])),
    context(),
  );
  assertEquals(evaluation?.damage, 130);
  assertEquals(evaluation?.terms[0].matched, true);
  assertEquals(evaluation?.terms[0].contribution, 20);
});

Deno.test("Deep Current contributes zero when no Essence moved this turn", () => {
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(
    authority(stateWithMovements()),
    context(),
  );
  assertEquals(evaluation?.damage, 110);
  assertEquals(evaluation?.terms[0].matched, false);
  assertEquals(evaluation?.terms[0].contribution, 0);
});

Deno.test("Deep Current ignores movement of a non-Tide Essence", () => {
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(
    authority(stateWithMovements([movement({ element: "Volt" })])),
    context(),
  );
  assertEquals(evaluation?.damage, 110);
  assertEquals(evaluation?.terms[0].matched, false);
});

Deno.test("Deep Current ignores other-seat and prior-turn movements", () => {
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(
    authority(stateWithMovements([
      movement({ controller_seat: 2 }),
      movement({ turn_seq: 6, essence_uid: "old-tide" }),
    ])),
    context(),
  );
  assertEquals(evaluation?.damage, 110);
  assertEquals(evaluation?.terms[0].matched, false);
});
