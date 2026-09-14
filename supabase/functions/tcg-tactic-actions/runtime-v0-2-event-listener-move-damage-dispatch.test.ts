import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateCreatureEnteredPlayEvent,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

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
  hp: number,
  ability: Record<string, unknown> | null = null,
  rewardValue = 1,
): Record<string, unknown> {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
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
      hp,
      withdrawal: 0,
      reward_value: rewardValue,
      resistance: null,
      matchup_override: null,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function selectedMoveAbility(): Record<string, unknown> {
  return {
    id: "generic-selected-move-damage",
    name: "Generic Selected Move Damage",
    mode: "triggered",
    event: "creature_entered_play",
    timing: "build",
    limit: null,
    requirements: null,
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: 1,
        filters: {
          exclude_source: true,
          damage_at_least: 10,
        },
        as: "wound_source",
      },
      {
        op: "MOVE_DAMAGE",
        from: "$wound_source",
        to: "$source_creature",
        amount: 10,
        as: "moved_damage",
      },
    ],
  };
}

function hostileMoveAbility(): Record<string, unknown> {
  return {
    id: "generic-hostile-move-damage",
    name: "Generic Hostile Move Damage",
    mode: "triggered",
    event: "creature_entered_play",
    timing: "build",
    limit: null,
    requirements: null,
    costs: [],
    steps: [{
      op: "MOVE_DAMAGE",
      from: "$current_friendly_vanguard",
      to: "$current_opponent_vanguard",
      amount: 10,
      allow_opposing_destination: true,
    }],
  };
}

function defeatWatcherAbility(): Record<string, unknown> {
  return {
    id: "generic-defeat-shield-watcher",
    name: "Generic Defeat Shield Watcher",
    mode: "triggered",
    event: "creature_defeated",
    timing: "any",
    limit: null,
    requirements: { predicate: "event_controller_is_opponent" },
    costs: [],
    steps: [{
      op: "ADD_SHIELD",
      target: "$source_creature",
      amount: 10,
    }],
  };
}

function buildState(options: {
  moverAbility: Record<string, unknown>;
  opponentDamage?: number;
  includeWatcher?: boolean;
}): Record<string, unknown> {
  const wounded = instance("wounded-uid", "wounded-card");
  const mover = instance("mover-uid", "mover-card");
  const watcher = instance("watcher-uid", "watcher-card");
  const opposing = instance("opposing-uid", "opposing-card");
  const opposingBackup = instance("opposing-backup-uid", "opposing-backup-card");

  const definitions = [
    creatureDefinition("wounded-card", "Wounded Ally", 120),
    creatureDefinition("mover-card", "Mover", 100, options.moverAbility),
    creatureDefinition(
      "watcher-card",
      "Defeat Watcher",
      100,
      options.includeWatcher ? defeatWatcherAbility() : null,
    ),
    creatureDefinition("opposing-card", "Opposing Vanguard", 100),
    creatureDefinition("opposing-backup-card", "Opposing Backup", 100),
  ];

  return {
    turn_seq: 7,
    active_seat: 1,
    phase: "build",
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: Object.fromEntries(definitions.map((definition) => [
      String(definition.id),
      { definition_v0_2: definition },
    ])),
    realm: null,
    effect_events: [],
    pending_resolutions: [],
    players: {
      "1": {
        vanguard: creature(wounded, 20),
        reserve: [
          creature(mover, 0),
          options.includeWatcher ? creature(watcher, 0) : null,
          null,
          null,
        ],
        hand: [],
        deck: [],
        discard: [],
        rewards: [
          instance("p1-reward-1", "reward-card-1"),
          instance("p1-reward-2", "reward-card-2"),
        ],
      },
      "2": {
        vanguard: creature(opposing, options.opponentDamage ?? 0),
        reserve: [creature(opposingBackup, 0), null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [
          instance("p2-reward-1", "reward-card-3"),
          instance("p2-reward-2", "reward-card-4"),
        ],
      },
    },
  };
}

function begin(state: Record<string, unknown>) {
  const event = runtimeV02CreateCreatureEnteredPlayEvent(
    state,
    1,
    "mover-uid",
    0,
  );
  return runtimeV02BeginEventListenerContinuation(state, [event]);
}

Deno.test("Event Listener MOVE_DAMAGE dispatch resumes selected Creature binding and delegates exact transfer", () => {
  const state = buildState({ moverAbility: selectedMoveAbility() });
  const waiting = begin(state);

  equal(waiting.status, "player_choice_required");
  assert(waiting.pending_choice, "expected Creature selection choice");
  equal(waiting.pending_choice.kind, "select_creature");
  equal(
    waiting.pending_choice.options.map((option) => option.id),
    ["creature:wounded-uid"],
  );

  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    waiting.pending_choice.id,
    ["creature:wounded-uid"],
  );

  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.damage, 10);
  equal((state.players as any)["1"].reserve[0].damage, 10);
  equal(complete.processed_listener_keys.length, 1);
  assert(
    complete.processed_listener_keys[0].endsWith(":generic-selected-move-damage"),
    "selected MOVE_DAMAGE listener should resolve once",
  );
  equal(
    (state.effect_events as any[]).map((event) => event.event),
    ["creature_entered_play", "damage_moved"],
  );
  assert(
    state.runtime_v0_2_event_listener_continuation == null,
    "continuation should clear after selected MOVE_DAMAGE completes",
  );
});

Deno.test("Event Listener MOVE_DAMAGE dispatch queues defeat listeners into the same continuation exactly once", () => {
  const state = buildState({
    moverAbility: hostileMoveAbility(),
    opponentDamage: 95,
    includeWatcher: true,
  });

  const complete = begin(state);

  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.damage, 10);
  equal((state.players as any)["1"].reserve[1].shield, 10);
  equal((state.players as any)["2"].vanguard, null);
  equal((state.players as any)["2"].discard.map((card: Inst) => card.uid), [
    "opposing-uid",
  ]);
  equal(state.pending_resolutions, [
    { kind: "take_reward", seat: 1, count: 1, source: "Opposing Vanguard" },
    { kind: "promote", seat: 2 },
  ]);
  equal(complete.processed_listener_keys.length, 2);
  assert(
    complete.processed_listener_keys.some((key) =>
      key.endsWith(":generic-hostile-move-damage")
    ),
    "MOVE_DAMAGE source listener should resolve once",
  );
  assert(
    complete.processed_listener_keys.some((key) =>
      key.endsWith(":generic-defeat-shield-watcher")
    ),
    "nested defeat watcher should resolve once",
  );
  assert(
    state.runtime_v0_2_event_listener_continuation == null,
    "nested defeat work should finish inside the original continuation",
  );
  assert(
    state.pending_event_listener_choice == null,
    "nested defeat work should not create a second continuation choice",
  );
});
