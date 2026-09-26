import {
  runtimeV02ExecuteActiveAbilityHiddenSample,
  runtimeV02PrivateActiveAbilityInspectionView,
  structuredRuntimeActiveAbilityHiddenSample,
} from "../_shared/tcg-match-active-ability-hidden-sample-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}
function creature(uid: string, cardId: string, control: string | null = null) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    conditions: {
      scorched: false,
      venomed: 0,
      control,
      modifier: null,
    },
    flags: {},
  };
}
function hiddenSampleAbility() {
  return {
    id: "hidden-sample-shape",
    name: "Hidden Sample Shape",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [
        {
          predicate: "control_condition_present",
          target: "$current_opponent_vanguard",
        },
        {
          predicate: "hand_count_at_least",
          player: "opponent",
          count: 1,
        },
      ],
    },
    costs: [],
    steps: [{
      op: "RANDOM_SAMPLE_HIDDEN_ZONE",
      player: "opponent",
      zone: "hand",
      count: { min: 1, max: 2 },
      rng_owner: "match",
      visibility: "controller_private",
      as: "sampled",
    }],
  };
}
function sourceDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "test-hidden-source",
    name: "Hidden Source",
    card_family: "Creature",
    element: "Shade",
    traits: [],
    pack_only: false,
    deck_limit: { scope: "identity", max: 4 },
    prestige: { starbound: { enabled: false } },
    creature: {
      creature_types: [],
      stage: "Standalone",
      evolves_from_id: null,
      hp: 180,
      withdrawal: 1,
      reward_value: 1,
      resistance: null,
      matchup_override: null,
      ability: hiddenSampleAbility(),
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}
function state(options: {
  control?: string | null;
  opponentHand?: Array<{ uid: string; card_id: string }>;
} = {}) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 31,
    active_seat: 1,
    phase: "play",
    players: {
      "1": {
        vanguard: creature("source-uid", "test-hidden-source"),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: creature(
          "opponent-vanguard-uid",
          "opponent-creature",
          options.control === undefined ? "Dazed" : options.control,
        ),
        reserve: [null, null, null, null],
        hand: options.opponentHand ?? [
          card("hand-a", "card-a"),
          card("hand-b", "card-b"),
          card("hand-c", "card-c"),
        ],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
    card_index: {
      "test-hidden-source": {
        card_id: "test-hidden-source",
        definition_v0_2: sourceDefinition(),
      },
    },
  } as Record<string, unknown> & any;
}
function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-uid", "test-hidden-source"),
  };
}

Deno.test("active hidden-sample descriptor is registry-driven and preserves structured requirement/sample data", () => {
  const match = state();
  const descriptor = structuredRuntimeActiveAbilityHiddenSample(
    match,
    { card_id: "test-hidden-source" },
  );
  if (!descriptor) throw new Error("hidden-sample descriptor required");
  equal(descriptor.ability_id, "hidden-sample-shape");
  equal(descriptor.sample, {
    player: "opponent",
    zone: "hand",
    min: 1,
    max: 2,
    rng_owner: "match",
    visibility: "controller_private",
    as: "sampled",
  });
  equal(descriptor.requirements, hiddenSampleAbility().requirements);
});

Deno.test("active hidden sample uses match RNG without replacement and never mutates or reorders opponent hand", () => {
  const match = state();
  const before = match.players["2"].hand.map((entry: any) => entry.uid);
  const picks = [1, 0];
  let cursor = 0;
  const result = runtimeV02ExecuteActiveAbilityHiddenSample(
    match,
    1,
    source(),
    () => picks[cursor++],
  );
  if (!result) throw new Error("hidden-sample resolution required");
  equal(result, {
    kind: "sample_opponent_hidden_hand",
    ability_id: "hidden-sample-shape",
    sampled_count: 2,
  });
  equal(
    match.players["2"].hand.map((entry: any) => entry.uid),
    before,
    "hidden sampling changed opponent hand order",
  );
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(
    match,
    1,
    "hidden-sample-shape",
  ), 1);
  equal(runtimeV02PrivateActiveAbilityInspectionView(match, 1), {
    turn_seq: 31,
    controller_seat: 1,
    zone_owner_seat: 2,
    zone: "hand",
    cards: [
      { position: 0, uid: "hand-b", card_id: "card-b" },
      { position: 1, uid: "hand-a", card_id: "card-a" },
    ],
  });
  equal(runtimeV02PrivateActiveAbilityInspectionView(match, 2), null);
});

Deno.test("active hidden sample clamps to available hand size while respecting the structured minimum", () => {
  const match = state({
    opponentHand: [card("only-hand-card", "only-card")],
  });
  const result = runtimeV02ExecuteActiveAbilityHiddenSample(
    match,
    1,
    source(),
    () => 0,
  );
  if (!result) throw new Error("hidden-sample resolution required");
  equal(result.sampled_count, 1);
  equal(runtimeV02PrivateActiveAbilityInspectionView(match, 1)?.cards, [
    { position: 0, uid: "only-hand-card", card_id: "only-card" },
  ]);
});

Deno.test("active hidden sample requires opponent control Condition and minimum hand before spending the once-per-turn use", () => {
  let match = state({ control: null });
  throws(
    () => runtimeV02ExecuteActiveAbilityHiddenSample(
      match,
      1,
      source(),
      () => 0,
    ),
    "requirements_not_met",
  );
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(
    match,
    1,
    "hidden-sample-shape",
  ), 0);

  match = state({ opponentHand: [] });
  throws(
    () => runtimeV02ExecuteActiveAbilityHiddenSample(
      match,
      1,
      source(),
      () => 0,
    ),
    "requirements_not_met",
  );
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(
    match,
    1,
    "hidden-sample-shape",
  ), 0);
});

Deno.test("active hidden sample is source/turn/limit bound", () => {
  const match = state();
  const result = runtimeV02ExecuteActiveAbilityHiddenSample(
    match,
    1,
    source(),
    () => 0,
  );
  if (!result) throw new Error("hidden-sample resolution required");

  throws(
    () => runtimeV02ExecuteActiveAbilityHiddenSample(
      match,
      1,
      source(),
      () => 0,
    ),
    "limit_reached",
  );

  const changed = state();
  changed.players["1"].vanguard.stack[0] = card(
    "replacement-source",
    "test-hidden-source",
  );
  throws(
    () => runtimeV02ExecuteActiveAbilityHiddenSample(
      changed,
      1,
      source(),
      () => 0,
    ),
    "source_changed",
  );

  const inactive = state();
  inactive.active_seat = 2;
  throws(
    () => runtimeV02ExecuteActiveAbilityHiddenSample(
      inactive,
      1,
      source(),
      () => 0,
    ),
    "not_active_seat",
  );
});
