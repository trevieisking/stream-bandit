import {
  evaluateRuntimeAttackDirectConditionalAddFormula,
  evaluateRuntimeAttackReadyConditionalAddFormula,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

const CARD_ID = "underworld-history-proof";
const SOURCE_UID = "underworld-history-proof:uid";

function legacy() {
  return {
    name: "Legacy Attack",
    raw: "4 Underworld — Legacy Attack — 140",
    typed: { Underworld: 4 },
    any: 0,
    damage: 140,
    effect: "",
    starbound: false,
  };
}

function damageHistoryWhen(minActualDamage = 1, count = 1) {
  return {
    predicate: "damage_history_count_at_least",
    target: "$source_creature",
    source_controller: "self",
    window: "current_turn",
    min_actual_damage: minActualDamage,
    card_effect_only: true,
    count,
  };
}

function stateWith(events: Record<string, unknown>[], minActualDamage = 1, count = 1) {
  const source = { uid: SOURCE_UID, card_id: CARD_ID };
  const state = {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 9,
    effect_events: events,
    players: {
      "1": {
        vanguard: {
          stack: [source],
          essence: [],
          relic: null,
          damage: 20,
          shield: 0,
        },
        reserve: [],
      },
      "2": { vanguard: null, reserve: [] },
    },
    card_index: {
      [CARD_ID]: {
        card_id: CARD_ID,
        definition: { id: CARD_ID, attack_1: legacy().raw },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: CARD_ID,
          name: "Underworld History Proof",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: "history-ledger",
              name: "History Ledger",
              cost: [{ element: "Underworld", amount: 4 }],
              base_damage: null,
              damage_formula: {
                base: 140,
                snapshot: "legal_declaration",
                terms: [{
                  kind: "conditional_add",
                  amount: 20,
                  when: damageHistoryWhen(minActualDamage, count),
                }],
              },
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
  return { state, source };
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
  };
}

function cardCostDamage(
  turnSeq: number,
  controllerSeat: 1 | 2,
  amount: number,
): Record<string, unknown> {
  return {
    event: "card_cost_paid",
    event_id: `cost:${turnSeq}:${controllerSeat}:${amount}`,
    turn_seq: turnSeq,
    cost_kind: "damage",
    controller_seat: controllerSeat,
    action_kind: "ability",
    source_action_id: "generic-self-damage-cost",
    source_card_uid: SOURCE_UID,
    source_card_id: CARD_ID,
    source_creature_uid: SOURCE_UID,
    target_controller_seat: 1,
    target_creature_uid: SOURCE_UID,
    actual_damage_placed: amount,
  };
}

function effectDamage(
  eventId: string,
  turnSeq: number,
  controllerSeat: 1 | 2,
  amount: number,
): Record<string, unknown> {
  return {
    event: "effect_damage_dealt",
    event_id: eventId,
    turn_seq: turnSeq,
    controller_seat: controllerSeat,
    action_kind: "ability",
    source_action_id: "generic-effect-damage",
    source_card_uid: SOURCE_UID,
    source_card_id: CARD_ID,
    source_creature_uid: SOURCE_UID,
    target_controller_seat: 1,
    target_creature_uid: SOURCE_UID,
    actual_hp_damage: amount,
  };
}

function evaluate(
  events: Record<string, unknown>[],
  minActualDamage = 1,
  count = 1,
) {
  const { state, source } = stateWith(events, minActualDamage, count);
  const authority = resolveRuntimeAttackAuthority(state, source, 1, legacy());
  if (!authority) throw new Error("structured history authority required");
  return {
    authority,
    ready: evaluateRuntimeAttackReadyConditionalAddFormula(authority, context()),
    direct: evaluateRuntimeAttackDirectConditionalAddFormula(authority, context()),
  };
}

Deno.test("current-turn own card-cost damage satisfies generic Damage #20 attack formula history", () => {
  const result = evaluate([cardCostDamage(9, 1, 20)]);
  assertEquals(result.ready?.damage, 160);
  assertEquals(result.ready?.terms[0].matched, true);
  assertEquals(result.authority.declaration_damage_history_evidence?.[0]?.actual_count, 1);
  assertEquals(result.direct, null, "damage history must not masquerade as direct-state evidence");
});

Deno.test("previous-turn or opponent-owned card damage cannot satisfy self current-turn history", () => {
  assertEquals(evaluate([cardCostDamage(8, 1, 20)]).ready?.damage, 140, "previous turn must fail");
  assertEquals(evaluate([cardCostDamage(9, 2, 20)]).ready?.damage, 140, "opponent source must fail");
});

Deno.test("damage_moved is wound transfer only and never satisfies fresh card-effect damage history", () => {
  const moved = {
    event: "damage_moved",
    event_id: "move:9:1",
    turn_seq: 9,
    source_controller_seat: 1,
    source_creature_uid: SOURCE_UID,
    target_controller_seat: 1,
    target_creature_uid: SOURCE_UID,
    actual_damage_moved: 20,
  };
  assertEquals(evaluate([moved]).ready?.damage, 140);
});

Deno.test("minimum damage is per canonical damage event rather than a sum of smaller wounds", () => {
  const twoFives = [
    effectDamage("effect:9:1", 9, 1, 5),
    effectDamage("effect:9:2", 9, 1, 5),
  ];
  assertEquals(evaluate(twoFives, 10, 1).ready?.damage, 140, "two 5-damage events must not fake one 10-damage event");
  assertEquals(evaluate([effectDamage("effect:9:10", 9, 1, 10)], 10, 1).ready?.damage, 160, "one 10-damage event must satisfy threshold");
});

Deno.test("history count remains generic and can require multiple qualifying events", () => {
  const events = [
    effectDamage("effect:9:a", 9, 1, 10),
    effectDamage("effect:9:b", 9, 1, 20),
  ];
  assertEquals(evaluate(events, 10, 2).ready?.damage, 160);
  assertEquals(evaluate(events.slice(0, 1), 10, 2).ready?.damage, 140);
});
