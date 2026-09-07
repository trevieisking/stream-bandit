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
    raw: "2 Astral — Predicted Hit — 60; if you looked at your deck this turn, +20 damage",
    typed: { Astral: 2 },
    any: 0,
    damage: 60,
    effect: "if you looked at your deck this turn, +20 damage",
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

function context(events: Array<Record<string, unknown>> = []) {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: events,
    source_attached_essence_kinds: [],
  } as any;
}

function predictedHitAuthority() {
  const authority = resolveRuntimeAttackAuthority(stateWith("astral-orbitail", {
    id: "predicted-hit",
    name: "Predicted Hit",
    cost: [{ element: "Astral", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          any: [
            {
              predicate: "event_occurred",
              event: "hidden_information_viewed",
              controller: "self",
              window: "current_turn",
              min_count: 1,
              filters: { zone: "deck_top" },
            },
            {
              predicate: "event_occurred",
              event: "hidden_information_viewed",
              controller: "self",
              window: "current_turn",
              min_count: 1,
              filters: { zone: "deck" },
            },
          ],
        },
      }],
    },
  }), "astral-orbitail", 1, legacy());
  if (!authority) throw new Error("Predicted Hit authority required");
  return authority;
}

Deno.test("Predicted Hit accepts canonical deck_top hidden-information view", () => {
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(
    predictedHitAuthority(),
    context([{ event: "hidden_information_viewed", controller: "self", zone: "deck_top" }]),
  );
  assertEquals(result?.damage, 80);
  assertEquals(result?.terms[0].matched, true);
  assertEquals(result?.terms[0].contribution, 20);
});

Deno.test("Predicted Hit accepts canonical deck hidden-information view", () => {
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(
    predictedHitAuthority(),
    context([{ event: "hidden_information_viewed", controller: "self", zone: "deck" }]),
  );
  assertEquals(result?.damage, 80);
  assertEquals(result?.terms[0].matched, true);
});

Deno.test("Predicted Hit contributes zero without a current-turn deck view", () => {
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(predictedHitAuthority(), context());
  assertEquals(result?.damage, 60);
  assertEquals(result?.terms[0].matched, false);
  assertEquals(result?.terms[0].contribution, 0);
});

Deno.test("Reward inspection remains outside Runtime-C ready authority", () => {
  const authority = resolveRuntimeAttackAuthority(stateWith("astral-comettail", {
    id: "reward-arc",
    name: "Reward Arc",
    cost: [{ element: "Astral", amount: 2 }],
    base_damage: null,
    damage_formula: {
      base: 60,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          predicate: "event_occurred",
          event: "reward_inspected",
          controller: "self",
          window: "current_turn",
          min_count: 1,
        },
      }],
    },
  }), "astral-comettail", 1, legacy());
  if (!authority) throw new Error("Reward Arc authority required");
  assertEquals(
    evaluateRuntimeAttackReadyConditionalAddFormula(
      authority,
      context([{ event: "reward_inspected", controller: "self" }]),
    ),
    null,
  );
});
