import {
  evaluateStructuredRuntimeAttackRequirements,
  structuredRuntimeAttackMetadata,
} from "../_shared/tcg-match-attack-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

const REQUIREMENT = {
  predicate: "damage_history_count_at_least",
  target: "$source_creature",
  source_controller: "self",
  window: "current_turn",
  min_actual_damage: 1,
  card_effect_only: true,
  count: 1,
} as const;

const SOURCE = {
  stack: [{ uid: "bloodbasilisk-uid", card_id: "underworld-bloodbasilisk" }],
  essence: [],
  relic: null,
  damage: 20,
  shield: 0,
};

function cardEntry() {
  return {
    card_id: "underworld-bloodbasilisk",
    definition: { id: "underworld-bloodbasilisk" },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: "underworld-bloodbasilisk",
      name: "Bloodbasilisk",
      card_family: "Creature",
      element: "Underworld",
      prestige: { starbound: { enabled: false } },
      creature: {
        attacks: [{
          id: "red-ledger",
          name: "Red Ledger",
          cost: [{ element: "Underworld", amount: 4 }],
          base_damage: 140,
          damage_formula: null,
          requirements: [REQUIREMENT],
        }],
      },
      essence: null,
      tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function state(effectEvents: unknown[]) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    players: {
      "1": { vanguard: SOURCE, reserve: [] },
      "2": { vanguard: null, reserve: [] },
    },
    card_index: { "underworld-bloodbasilisk": cardEntry() },
    effect_events: effectEvents,
  } as Record<string, unknown>;
}

function costEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: "card_cost_paid",
    event_id: "cost-1",
    turn_seq: 7,
    cost_kind: "damage",
    controller_seat: 1,
    action_kind: "ability",
    source_action_id: "paid-in-blood",
    source_card_uid: "bloodbasilisk-card-uid",
    source_card_id: "underworld-bloodbasilisk",
    source_creature_uid: "bloodbasilisk-uid",
    target_controller_seat: 1,
    target_creature_uid: "bloodbasilisk-uid",
    actual_damage_placed: 20,
    ...overrides,
  };
}

Deno.test("attack metadata accepts the shared generic damage-history predicate", () => {
  const metadata = structuredRuntimeAttackMetadata(state([]), "underworld-bloodbasilisk", 1);
  if (!metadata) throw new Error("structured metadata required");
  assertEquals(metadata.requirements, [REQUIREMENT]);
});

Deno.test("Red Ledger-style attack requirement accepts current-turn self card-cost damage", () => {
  const current = state([costEvent()]);
  const metadata = structuredRuntimeAttackMetadata(current, "underworld-bloodbasilisk", 1);
  if (!metadata) throw new Error("structured metadata required");
  assertEquals(
    evaluateStructuredRuntimeAttackRequirements(current, SOURCE, metadata.requirements),
    { ok: true },
  );
});

Deno.test("attack damage-history requirement fails closed when no qualifying history exists", () => {
  const current = state([
    costEvent({ controller_seat: 2, event_id: "opponent" }),
    costEvent({ turn_seq: 6, event_id: "prior" }),
    {
      event: "damage_moved",
      event_id: "moved",
      turn_seq: 7,
      source_controller_seat: 1,
      target_controller_seat: 1,
      target_creature_uid: "bloodbasilisk-uid",
      actual_damage_moved: 60,
    },
  ]);
  const metadata = structuredRuntimeAttackMetadata(current, "underworld-bloodbasilisk", 1);
  if (!metadata) throw new Error("structured metadata required");
  assertEquals(
    evaluateStructuredRuntimeAttackRequirements(current, SOURCE, metadata.requirements),
    {
      ok: false,
      requirement_index: 0,
      predicate: "damage_history_count_at_least",
      required: 1,
      actual: 0,
      min_actual_damage: 1,
    },
  );
});
