import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

type Inst = { uid: string; card_id: string };

const marker = {
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  registry_sha256:
    "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
  runtime_authority: false,
  source: "test",
};

function creatureDefinition(
  id: string,
  ability: Record<string, unknown> | null,
): Record<string, unknown> {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element: "Shade",
    creature: {
      stage: "Standalone",
      withdrawal: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function field(card: Inst): Record<string, unknown> {
  return {
    stack: [card],
    essence: [],
    relic: null,
    damage: 0,
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

function stateFor(predicate: string): Record<string, unknown> {
  const source = { uid: "source-uid", card_id: "test-listener-source" };
  const opponent = { uid: "opponent-uid", card_id: "test-opponent" };
  const sourceDefinition = creatureDefinition(source.card_id, {
    id: "test-controller-predicate-listener",
    name: "Controller Predicate Listener",
    mode: "triggered",
    event: "deck_cards_discarded",
    timing: "any",
    limit: null,
    requirements: { predicate },
    costs: [],
    steps: [{ op: "DRAW_FIXED", player: "self", count: 0 }],
  });
  const opponentDefinition = creatureDefinition(opponent.card_id, null);
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    card_index: {
      [source.card_id]: { definition_v0_2: sourceDefinition },
      [opponent.card_id]: { definition_v0_2: opponentDefinition },
    },
    realm: null,
    players: {
      "1": {
        vanguard: field(source),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function deckDiscardEvent(
  controllerSeat: 1 | 2,
  sourceControllerSeat: 1 | 2,
): RuntimeV02EventListenerEvent {
  return {
    event_id:
      `deck-cards-discarded:7:${controllerSeat}:${sourceControllerSeat}:source-uid`,
    event: "deck_cards_discarded",
    subject_uid: "source-uid",
    subject_card_id: "test-listener-source",
    controller_seat: controllerSeat,
    source_controller_seat: sourceControllerSeat,
    origin_zone: "deck",
    destination_zone: "discard",
    destination_index: null,
    phase: "attack",
    source_action_id: "test-attack",
    source_card_uid: "source-uid",
    action_kind: "attack",
    turn_seq: 7,
  };
}

function processed(
  predicate: string,
  controllerSeat: 1 | 2,
  sourceControllerSeat: 1 | 2,
): number {
  const state = stateFor(predicate);
  const result = runtimeV02BeginEventListenerContinuation(state, [
    deckDiscardEvent(controllerSeat, sourceControllerSeat),
  ]);
  equal(result.status, "complete");
  return result.processed_listener_keys.length;
}

Deno.test(
  "event_controller_is_opponent compares the affected controller with the listener controller",
  () => {
    equal(processed("event_controller_is_opponent", 2, 2), 1);
    equal(processed("event_controller_is_opponent", 1, 2), 0);
  },
);

Deno.test(
  "source_controller_is_self compares the effect source controller independently",
  () => {
    equal(processed("source_controller_is_self", 2, 1), 1);
    equal(processed("source_controller_is_self", 2, 2), 0);
  },
);

Deno.test(
  "affected and source controller predicates remain separate in one requirement",
  () => {
    const predicateState = stateFor("event_controller_is_opponent");
    const definition = ((predicateState.card_index as Record<string, any>)[
      "test-listener-source"
    ].definition_v0_2.creature.ability) as Record<string, unknown>;
    definition.requirements = {
      all: [
        { predicate: "event_controller_is_opponent" },
        { predicate: "source_controller_is_self" },
      ],
    };

    const matching = runtimeV02BeginEventListenerContinuation(predicateState, [
      deckDiscardEvent(2, 1),
    ]);
    equal(matching.processed_listener_keys.length, 1);

    equal(
      processed("source_controller_is_self", 2, 2),
      0,
      "opponent source must not satisfy source_controller_is_self",
    );
  },
);
