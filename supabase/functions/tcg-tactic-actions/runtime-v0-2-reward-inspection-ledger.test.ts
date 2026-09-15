import {
  runtimeV02CurrentTurnRewardInspections,
  runtimeV02PrivateRewardInspectionView,
  structuredRuntimeEvolutionRewardInspection,
} from "../_shared/tcg-match-reward-inspection-v0-2.ts";
import {
  evaluateRuntimeAttackReadyConditionalAddFormula,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
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

const source = { uid: "comettail-source", card_id: "astral-comettail" };

function comettailDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "astral-comettail",
    name: "Comettail",
    card_family: "Creature",
    element: "Astral",
    prestige: { starbound: { enabled: false } },
    creature: {
      ability: {
        id: "comet-survey",
        name: "Comet Survey",
        mode: "triggered",
        event: "creature_evolved",
        timing: "own_turn",
        limit: null,
        requirements: { all: [{ predicate: "source_is_self" }] },
        costs: [],
        steps: [{
          op: "INSPECT_ZONE",
          player: "self",
          zone: "rewards",
          selection: { min: 0, max: 2, filters: {}, distinct: true },
          visibility: "controller_private",
          return_policy: "same_position",
          as: "inspected_rewards",
        }],
      },
      attacks: [{
        id: "reward-arc",
        name: "Reward Arc",
        cost: [{ element: "Astral", amount: 3 }],
        base_damage: null,
        damage_formula: {
          base: 80,
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
      }],
    },
  };
}

function rewardDefinition(id: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    prestige: { starbound: { enabled: false } },
    creature: { attacks: [] },
  };
}

function state() {
  const rewards = [
    { uid: "reward-a", card_id: "reward-a" },
    { uid: "reward-b", card_id: "reward-b" },
    { uid: "reward-c", card_id: "reward-c" },
  ];
  return {
    turn_seq: 7,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": { rewards, vanguard: { stack: [source], essence: [], relic: null }, reserve: [] },
      "2": { rewards: [], vanguard: null, reserve: [] },
    },
    card_index: {
      "astral-comettail": {
        card_id: "astral-comettail",
        definition: {
          id: "astral-comettail",
          attack_1: "3 Astral — Reward Arc — 80; if you looked at a Reward card this match, +20 damage",
        },
        definition_v0_2: comettailDefinition(),
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
      "reward-a": { definition: { id: "reward-a" }, definition_v0_2: rewardDefinition("reward-a") },
      "reward-b": { definition: { id: "reward-b" }, definition_v0_2: rewardDefinition("reward-b") },
      "reward-c": { definition: { id: "reward-c" }, definition_v0_2: rewardDefinition("reward-c") },
    },
  } as Record<string, unknown>;
}

function legacy() {
  return {
    name: "Reward Arc",
    raw: "3 Astral — Reward Arc — 80; if you looked at a Reward card this match, +20 damage",
    typed: { Astral: 3 },
    any: 0,
    damage: 80,
    effect: "if you looked at a Reward card this match, +20 damage",
    starbound: false,
  };
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

Deno.test("Comet Survey inspects chosen Reward positions without moving Rewards or leaking identities into event history", () => {
  const s = state();
  const before = JSON.stringify((s.players as any)["1"].rewards);
  const result = structuredRuntimeEvolutionRewardInspection(s, source, 1, [0, 2]);
  assertJsonEquals(result, { inspected_count: 2, ability_id: "comet-survey" });
  assertEquals(JSON.stringify((s.players as any)["1"].rewards), before, "Reward zone must not move");
  assertJsonEquals(runtimeV02CurrentTurnRewardInspections(s, 1), [{ turn_seq: 7, controller_seat: 1 }]);
  const ledgerText = JSON.stringify((s as any).runtime_reward_inspections_v0_2);
  assertEquals(ledgerText.includes("reward-a"), false, "event ledger leaked Reward identity");
  assertEquals(ledgerText.includes("reward-c"), false, "event ledger leaked Reward identity");
});

Deno.test("private Reward inspection is visible only to its controller", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, [1]);
  assertJsonEquals(runtimeV02PrivateRewardInspectionView(s, 1), {
    turn_seq: 7,
    controller_seat: 1,
    cards: [{ position: 1, uid: "reward-b", card_id: "reward-b" }],
  });
  assertEquals(runtimeV02PrivateRewardInspectionView(s, 2), null);
});

Deno.test("zero-card optional Comet Survey does not fabricate reward_inspected", () => {
  const s = state();
  assertJsonEquals(structuredRuntimeEvolutionRewardInspection(s, source, 1, []), {
    inspected_count: 0,
    ability_id: "comet-survey",
  });
  assertJsonEquals(runtimeV02CurrentTurnRewardInspections(s, 1), []);
  assertEquals(runtimeV02PrivateRewardInspectionView(s, 1), null);
});

Deno.test("Reward inspection validates unique in-range positions and frozen selection count", () => {
  assertThrows(() => structuredRuntimeEvolutionRewardInspection(state(), source, 1, [0, 0]), "positions_duplicate");
  assertThrows(() => structuredRuntimeEvolutionRewardInspection(state(), source, 1, [9]), "position_out_of_range");
  assertThrows(() => structuredRuntimeEvolutionRewardInspection(state(), source, 1, [0, 1, 2]), "count_invalid");
});

Deno.test("Reward Arc snapshots canonical current-turn Reward inspection and reaches 100", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, [0]);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Reward Arc authority required");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(evaluation?.damage, 100);
  assertEquals(evaluation?.terms[0].matched, true);
  assertEquals(evaluation?.terms[0].contribution, 20);
});

Deno.test("Reward Arc remains 80 when Comet Survey inspects zero cards", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, []);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Reward Arc authority required");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(evaluation?.damage, 80);
  assertEquals(evaluation?.terms[0].matched, false);
});

Deno.test("Reward inspection is current-turn and seat isolated", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, [0]);
  assertEquals(runtimeV02CurrentTurnRewardInspections(s, 1).length, 1);
  assertEquals(runtimeV02CurrentTurnRewardInspections(s, 2).length, 0);
  s.turn_seq = 8;
  assertJsonEquals(runtimeV02CurrentTurnRewardInspections(s, 1), []);
  assertEquals(runtimeV02PrivateRewardInspectionView(s, 1), null);
});
