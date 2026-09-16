import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateCreatureEnteredPlayEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { TCG_RUNTIME_REGISTRY_V0_2 } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function throws(fn: () => unknown, expected: string): void {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw error;
    return;
  }
  throw new Error(`expected error containing: ${expected}`);
}

type Inst = { uid: string; card_id: string };

function instance(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function creature(card: Inst, damage = 0) {
  return {
    stack: [card],
    essence: [],
    relic: null,
    damage,
    shield: 0,
    condition: null,
    conditions: {
      scorched: false,
      venomed: 0,
      control: null,
      modifier: null,
    },
    flags: {},
  };
}

function creatureDefinition(
  id: string,
  name: string,
  ability: Record<string, unknown> | null = null,
): Record<string, unknown> {
  return {
    schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
    effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
    id,
    name,
    card_family: "Creature",
    element: "Underworld",
    traits: [],
    pack_only: false,
    deck_limit: { scope: "identity", max: 4 },
    prestige: { starbound: { enabled: false } },
    creature: {
      creature_types: [],
      stage: "Baby",
      evolves_from_id: null,
      hp: 100,
      withdrawal: 0,
      reward_value: 1,
      resistance: null,
      matchup_override: null,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function selectorAbility(filters: Record<string, unknown>): Record<string, unknown> {
  return {
    id: "threshold-selector",
    name: "Threshold Selector",
    mode: "triggered",
    event: "creature_entered_play",
    timing: "build",
    limit: null,
    requirements: null,
    costs: [],
    steps: [{
      op: "SELECT_CREATURE",
      controller: "self",
      zone: "field",
      count: 1,
      filters,
      as: "wound_source",
    }],
  };
}

function buildState(filters: Record<string, unknown>): Record<string, unknown> {
  const source = instance("source-uid", "source-card");
  const low = instance("low-uid", "low-card");
  const exact = instance("exact-uid", "exact-card");
  const high = instance("high-uid", "high-card");
  const opponent = instance("opponent-uid", "opponent-card");

  const definitions = [
    creatureDefinition("source-card", "Source", selectorAbility(filters)),
    creatureDefinition("low-card", "Low Nine"),
    creatureDefinition("exact-card", "Exact Ten"),
    creatureDefinition("high-card", "High Thirty"),
    creatureDefinition("opponent-card", "Opponent"),
  ];
  const cardIndex = Object.fromEntries(definitions.map((definition) => [
    String(definition.id),
    { definition_v0_2: definition },
  ]));

  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: {
      registry_id: TCG_RUNTIME_REGISTRY_V0_2.registry_id,
      set_code: TCG_RUNTIME_REGISTRY_V0_2.set_code,
      card_schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
      effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
      card_count: TCG_RUNTIME_REGISTRY_V0_2.card_count,
      registry_sha256: TCG_RUNTIME_REGISTRY_V0_2.sha256,
      runtime_authority: false,
    },
    effect_events: [],
    card_index: cardIndex,
    realm: null,
    players: {
      "1": {
        vanguard: creature(low, 9),
        reserve: [
          creature(source, 0),
          creature(exact, 10),
          creature(high, 30),
          null,
        ],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: creature(opponent, 0),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function begin(state: Record<string, unknown>) {
  const event = runtimeV02CreateCreatureEnteredPlayEvent(
    state,
    1,
    "source-uid",
    0,
  );
  return runtimeV02BeginEventListenerContinuation(state, [event]);
}

Deno.test("Event Listener SELECT_CREATURE damage_at_least excludes 1-9 damage and keeps the exact boundary", () => {
  const flow = begin(buildState({
    exclude_source: true,
    damage_at_least: 10,
  }));

  equal(flow.status, "player_choice_required");
  assert(flow.pending_choice, "expected Creature selection choice");
  equal(flow.pending_choice.kind, "select_creature");
  equal(
    flow.pending_choice.options.map((option) => option.id),
    ["creature:exact-uid", "creature:high-uid"],
  );
});

Deno.test("Event Listener SELECT_CREATURE preserves existing damaged true semantics", () => {
  const flow = begin(buildState({
    exclude_source: true,
    damaged: true,
  }));

  assert(flow.pending_choice, "expected Creature selection choice");
  equal(
    flow.pending_choice.options.map((option) => option.id),
    ["creature:low-uid", "creature:exact-uid", "creature:high-uid"],
  );
});

Deno.test("Event Listener SELECT_CREATURE damage_at_least rejects negative thresholds before offering a choice", () => {
  throws(
    () => begin(buildState({ exclude_source: true, damage_at_least: -1 })),
    "tcg_v0_2_event_listener_damage_at_least_invalid",
  );
});

Deno.test("Event Listener SELECT_CREATURE damage_at_least rejects non-integer thresholds before offering a choice", () => {
  throws(
    () => begin(buildState({ exclude_source: true, damage_at_least: 10.5 })),
    "tcg_v0_2_event_listener_damage_at_least_invalid",
  );
});
