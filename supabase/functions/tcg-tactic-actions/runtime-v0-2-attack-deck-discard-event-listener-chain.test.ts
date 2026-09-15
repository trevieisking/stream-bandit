import {
  runtimeV02ResolveAfterDamageDeckDiscard,
  structuredRuntimeAfterDamageDeckDiscard,
} from "../_shared/tcg-match-attack-deck-discard-v0-2.ts";
import { runtimeV02CreateDeckCardsDiscardedEvent } from "../_shared/tcg-match-deck-discard-event-v0-2.ts";
import { runtimeV02BeginEventListenerContinuation } from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02BeginAttackHealListenerContinuation } from "../_shared/tcg-match-heal-listener-live-v0-2.ts";

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

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

const instance = (uid: string, card_id: string): Inst => ({ uid, card_id });

function creatureDefinition(
  id: string,
  ability: Record<string, unknown> | null,
  attacks: Record<string, unknown>[] = [],
): Record<string, unknown> {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element: "Shade",
    creature: {
      stage: "Adult",
      withdrawal: 1,
      ability,
      attacks,
    },
    essence: null,
    tactic: null,
  };
}

function field(card: Inst, damage = 0): Record<string, unknown> {
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

function sourceDefinition(): Record<string, unknown> {
  return creatureDefinition(
    "test-deck-discard-healer",
    {
      id: "hunger-listener",
      name: "Hunger Listener",
      mode: "triggered",
      event: "deck_cards_discarded",
      timing: "own_turn",
      limit: { count: 1, scope: "turn", owner: "card_instance" },
      requirements: {
        all: [
          { predicate: "event_controller_is_opponent" },
          { predicate: "source_controller_is_self" },
          { predicate: "target_damaged", target: "$source_creature" },
        ],
      },
      costs: [],
      steps: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
    },
    [{
      id: "condition-pressure",
      name: "Condition Pressure",
      cost: [],
      base_damage: 90,
      after_damage: [{
        op: "IF",
        when: {
          predicate: "target_has_any_condition",
          target: "$attack_target",
        },
        then: [{
          op: "DISCARD_DECK_TOP",
          player: "opponent",
          count: 2,
          reveal: "public",
        }],
      }],
    }],
  );
}

function state(deck: Inst[], damage = 30): Record<string, unknown> {
  const source = instance("source-uid", "test-deck-discard-healer");
  const opponent = instance("opponent-uid", "test-opponent");
  return {
    turn_seq: 14,
    active_seat: 1,
    phase: "attack",
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    card_index: {
      [source.card_id]: { definition_v0_2: sourceDefinition() },
      [opponent.card_id]: {
        definition_v0_2: creatureDefinition(opponent.card_id, null),
      },
    },
    realm: null,
    players: {
      "1": {
        vanguard: field(source, damage),
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
        deck,
        discard: [],
        rewards: [],
      },
    },
  };
}

function runChain(current: Record<string, unknown>, targetHasCondition: boolean) {
  const source = (current.players as any)["1"].vanguard.stack[0] as Inst;
  const descriptor = structuredRuntimeAfterDamageDeckDiscard(current, source, 1);
  assert(descriptor, "structured deck-discard descriptor required");
  const discard = runtimeV02ResolveAfterDamageDeckDiscard(
    current,
    1,
    descriptor,
    source,
    targetHasCondition,
  );
  if (discard.event_name == null) {
    const heal = runtimeV02BeginAttackHealListenerContinuation(current, [], 1);
    return { discard, event: null, eventFlow: null, heal };
  }
  const event = runtimeV02CreateDeckCardsDiscardedEvent(current, {
    discarded_controller_seat: discard.discarded_controller_seat,
    source_controller_seat: 1,
    source_action_id: discard.attack_id,
    source_card: source,
    action_kind: "attack",
    phase: "after_damage",
    discarded_card_uids: discard.discarded_card_uids,
  });
  const eventFlow = runtimeV02BeginEventListenerContinuation(current, [event]);
  equal(eventFlow.status, "complete");
  const heal = runtimeV02BeginAttackHealListenerContinuation(
    current,
    eventFlow.emitted_heal_packet_ids,
    1,
  );
  return { discard, event, eventFlow, heal };
}

Deno.test("attack deck-discard chains exact Card-Zone movement through event and heal listeners", () => {
  const first = instance("first", "card-a");
  const second = instance("second", "card-b");
  const third = instance("third", "card-c");
  const current = state([first, second, third]);
  const result = runChain(current, true);
  const opponent = (current.players as any)["2"];
  equal(result.discard.discarded_card_uids.join(","), "first,second");
  equal(opponent.deck[0], third);
  equal(opponent.discard[0], first, "first moved instance identity changed");
  equal(opponent.discard[1], second, "second moved instance identity changed");
  equal(result.event?.controller_seat, 2);
  equal(result.event?.source_controller_seat, 1);
  equal(result.event?.event_count, 2);
  equal(result.eventFlow?.processed_listener_keys.length, 1);
  equal(result.eventFlow?.emitted_heal_packet_ids.length, 1);
  equal((current.players as any)["1"].vanguard.damage, 20);
  equal(result.heal.status, "complete");
  equal((current as any).pending_heal_listener_resume, undefined);
});

Deno.test("failed target condition creates no discard event and no listener heal", () => {
  const first = instance("first", "card-a");
  const current = state([first]);
  const result = runChain(current, false);
  equal(result.discard.moved_count, 0);
  equal(result.event, null);
  equal(result.eventFlow, null);
  equal((current.effect_events as unknown[]).length, 0);
  equal((current.players as any)["2"].deck[0], first);
  equal((current.players as any)["1"].vanguard.damage, 30);
  equal(result.heal.status, "complete");
});

Deno.test("partial deck discard emits one exact event, heals once, and never creates deckout", () => {
  const only = instance("only", "card-a");
  const current = state([only]);
  const result = runChain(current, true);
  equal(result.discard.moved_count, 1);
  equal(result.event?.event_count, 1);
  equal((current.players as any)["2"].discard[0], only);
  equal((current.players as any)["1"].vanguard.damage, 20);
  equal((current as any).deckout_loser, undefined);
});

Deno.test("an empty opponent deck emits no event and cannot trigger the listener", () => {
  const current = state([]);
  const result = runChain(current, true);
  equal(result.discard.condition_met, true);
  equal(result.discard.moved_count, 0);
  equal(result.event, null);
  equal((current.effect_events as unknown[]).length, 0);
  equal((current.players as any)["1"].vanguard.damage, 30);
});

Deno.test("card-instance once-per-turn listener receipt blocks a second deck-discard heal", () => {
  const cards = [
    instance("first", "card-a"),
    instance("second", "card-b"),
    instance("third", "card-c"),
    instance("fourth", "card-d"),
  ];
  const current = state(cards);
  const first = runChain(current, true);
  equal(first.eventFlow?.emitted_heal_packet_ids.length, 1);
  equal((current.players as any)["1"].vanguard.damage, 20);
  const second = runChain(current, true);
  equal(second.discard.discarded_card_uids.join(","), "third,fourth");
  equal(second.eventFlow?.processed_listener_keys.length, 0);
  equal(second.eventFlow?.emitted_heal_packet_ids.length, 0);
  equal((current.players as any)["1"].vanguard.damage, 20);
});
