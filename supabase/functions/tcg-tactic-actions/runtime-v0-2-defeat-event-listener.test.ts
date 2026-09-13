import {
  runtimeV02ScanAndQueueDefeats,
} from "../_shared/tcg-match-defeat-engine-v0-2.ts";
import {
  runtimeV02AdaptDefeatEventForListener,
  runtimeV02BeginDefeatEventListenerContinuation,
} from "../_shared/tcg-match-event-listener-defeat-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function instance(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

const marker = {
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  registry_sha256: "test",
  runtime_authority: false,
  source: "test",
};

function creatureDefinition(
  id: string,
  element: string,
  ability: Record<string, unknown> | null = null,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    creature: { stage: "Standalone", withdrawal: 1, ability, attacks: [] },
    essence: null,
    tactic: null,
  };
}

function field(card: ReturnType<typeof instance>, damage = 0, shield = 0) {
  return {
    stack: [card],
    essence: [],
    relic: null,
    damage,
    shield,
    condition: null,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

function triggeredDefeatAbility(
  id: string,
  requirements: Record<string, unknown>,
) {
  return {
    id,
    name: id,
    mode: "triggered",
    event: "creature_defeated",
    timing: "any",
    limit: { scope: "turn", count: 1, owner: "card_instance" },
    requirements,
    costs: [],
    steps: [{ op: "ADD_SHIELD", target: "$source_creature", amount: 20 }],
  };
}

function stateForFriendlyDefeat() {
  const watcher = instance("watcher-uid", "test-watcher");
  const victim = instance("victim-uid", "test-victim");
  const opponent = instance("opponent-uid", "test-opponent");
  const watcherDefinition = creatureDefinition(
    watcher.card_id,
    "Underworld",
    triggeredDefeatAbility("shared-defeat-watch", {
      all: [
        { predicate: "event_controller_is_self" },
        { not: { predicate: "event_subject_is_source" } },
      ],
    }),
  );
  const victimDefinition = creatureDefinition(victim.card_id, "Underworld");
  const opponentDefinition = creatureDefinition(opponent.card_id, "Fairy");
  const definitions = [watcherDefinition, victimDefinition, opponentDefinition];
  return {
    turn_seq: 9,
    active_seat: 2,
    phase: "resolution",
    runtime_registry_v0_2: { ...marker },
    runtime_v0_2_event_seq: 0,
    effect_events: [],
    card_index: Object.fromEntries(definitions.map((definition) => [
      definition.id,
      { definition_v0_2: definition },
    ])),
    realm: null,
    pending_resolutions: [],
    players: {
      "1": {
        vanguard: field(victim, 100),
        reserve: [field(watcher), null, null, null],
        hand: [], deck: [], discard: [], rewards: [instance("reward-1", "reward-1")],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
        hand: [], deck: [], discard: [], rewards: [instance("reward-2", "reward-2")],
      },
    },
  } as any;
}

const describe = (creature: any) => ({
  max_hp: 100,
  reward_value: 1,
  label: String(creature.stack?.[creature.stack.length - 1]?.card_id || "Creature"),
});

Deno.test("#34 defeat event adapts into the ordinary #28 listener envelope after the subject leaves play", () => {
  const state = stateForFriendlyDefeat();
  const defeated = runtimeV02ScanAndQueueDefeats(state, describe, {
    action_kind: "attack",
    source_action_id: "attack:test",
    source_controller_seat: 2,
    source_card_uid: "opponent-uid",
  });
  equal(defeated.defeat_events.length, 1);
  equal(state.players["1"].vanguard, null);

  const adapted = runtimeV02AdaptDefeatEventForListener(state, defeated.defeat_events[0]);
  equal(adapted.event, "creature_defeated");
  equal(adapted.subject_uid, "victim-uid");
  equal(adapted.subject_card_id, "test-victim");
  equal(adapted.controller_seat, 1);
  equal(adapted.source_controller_seat, 2);
  equal(adapted.origin_zone, "vanguard");
  equal(adapted.destination_zone, "discard");
  equal(adapted.action_kind, "attack");
});

Deno.test("surviving generic listener reacts to another friendly creature defeat exactly once", () => {
  const state = stateForFriendlyDefeat();
  const defeated = runtimeV02ScanAndQueueDefeats(state, describe);
  const watcher = state.players["1"].reserve[0];
  equal(watcher.shield, 0);

  const first = runtimeV02BeginDefeatEventListenerContinuation(state, defeated.defeat_events);
  equal(first.status, "complete");
  equal(first.processed_listener_keys.length, 1);
  equal(watcher.shield, 20);

  const replay = runtimeV02BeginDefeatEventListenerContinuation(state, defeated.defeat_events);
  equal(replay.status, "complete");
  equal(replay.processed_listener_keys.length, 0);
  equal(watcher.shield, 20, "receipt/limit replay guard failed");
});

Deno.test("defeat bridge preserves event-controller semantics for opponent reactions", () => {
  const state = stateForFriendlyDefeat();
  const watcherDefinition = (state.card_index["test-watcher"].definition_v0_2 as any);
  watcherDefinition.creature.ability = triggeredDefeatAbility("opponent-defeat-watch", {
    all: [{ predicate: "event_controller_is_opponent" }],
  });
  // Move the watcher to the other player so Seat 1's defeated Creature is opposing.
  const watcher = state.players["1"].reserve[0];
  state.players["1"].reserve[0] = null;
  state.players["2"].reserve[0] = watcher;

  const defeated = runtimeV02ScanAndQueueDefeats(state, describe);
  const flow = runtimeV02BeginDefeatEventListenerContinuation(state, defeated.defeat_events);
  equal(flow.processed_listener_keys.length, 1);
  equal(watcher.shield, 20);
});
