import { runtimeV02CreateDeckCardsDiscardedEvent } from "../_shared/tcg-match-deck-discard-event-v0-2.ts";

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function throws(fn: () => unknown, expected: string): void {
  try {
    fn();
  } catch (error) {
    equal(error instanceof Error ? error.message : String(error), expected);
    return;
  }
  throw new Error(`expected error: ${expected}`);
}

type Inst = { uid: string; card_id: string };

function instance(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function state(discard: Inst[] = []): Record<string, unknown> {
  return {
    turn_seq: 12,
    effect_events: [],
    players: {
      "1": { discard: [] },
      "2": { discard },
    },
  };
}

Deno.test("deck-discard event records affected and source controllers separately", () => {
  const first = instance("discarded-a", "card-a");
  const second = instance("discarded-b", "card-b");
  const current = state([first, second]);
  const event = runtimeV02CreateDeckCardsDiscardedEvent(current, {
    discarded_controller_seat: 2,
    source_controller_seat: 1,
    source_action_id: "pressure-break",
    source_card: { uid: "source-uid", card_id: "source-card" },
    action_kind: "attack",
    phase: "after_damage",
    discarded_card_uids: [first.uid, second.uid],
  });

  equal(event.event, "deck_cards_discarded");
  equal(event.controller_seat, 2);
  equal(event.source_controller_seat, 1);
  equal(event.origin_zone, "deck");
  equal(event.destination_zone, "discard");
  equal(event.source_action_id, "pressure-break");
  equal(event.source_card_uid, "source-uid");
  equal(event.event_count, 2);
  equal(event.discarded_card_uids.join(","), "discarded-a,discarded-b");
  const recorded = current.effect_events as Record<string, unknown>[];
  equal(recorded.length, 1);
  equal(recorded[0].event, "deck_cards_discarded");
  equal(recorded[0].controller_seat, 2);
  equal(recorded[0].source_controller_seat, 1);
});

Deno.test("deck-discard event is idempotent by exact event id", () => {
  const first = instance("discarded-a", "card-a");
  const current = state([first]);
  const input = {
    discarded_controller_seat: 2 as const,
    source_controller_seat: 1 as const,
    source_action_id: "pressure-break",
    source_card: { uid: "source-uid", card_id: "source-card" },
    action_kind: "attack",
    phase: "after_damage",
    discarded_card_uids: [first.uid],
  };
  const firstEvent = runtimeV02CreateDeckCardsDiscardedEvent(current, input);
  const secondEvent = runtimeV02CreateDeckCardsDiscardedEvent(current, input);
  equal(firstEvent.event_id, secondEvent.event_id);
  equal((current.effect_events as unknown[]).length, 1);
});

Deno.test("deck-discard event refuses to claim cards not already in the Discard Pile", () => {
  const current = state([instance("discarded-a", "card-a")]);
  throws(
    () => runtimeV02CreateDeckCardsDiscardedEvent(current, {
      discarded_controller_seat: 2,
      source_controller_seat: 1,
      source_action_id: "pressure-break",
      source_card: { uid: "source-uid", card_id: "source-card" },
      action_kind: "attack",
      phase: "after_damage",
      discarded_card_uids: ["missing"],
    }),
    "tcg_v0_2_deck_discard_event_card_not_in_discard:missing",
  );
});

Deno.test("deck-discard event requires one or more exact unique moved card UIDs", () => {
  const current = state([instance("discarded-a", "card-a")]);
  throws(
    () => runtimeV02CreateDeckCardsDiscardedEvent(current, {
      discarded_controller_seat: 2,
      source_controller_seat: 1,
      source_action_id: "pressure-break",
      source_card: { uid: "source-uid", card_id: "source-card" },
      action_kind: "attack",
      phase: "after_damage",
      discarded_card_uids: [],
    }),
    "tcg_v0_2_deck_discard_event_card_uids_required",
  );
  throws(
    () => runtimeV02CreateDeckCardsDiscardedEvent(current, {
      discarded_controller_seat: 2,
      source_controller_seat: 1,
      source_action_id: "pressure-break",
      source_card: { uid: "source-uid", card_id: "source-card" },
      action_kind: "attack",
      phase: "after_damage",
      discarded_card_uids: ["discarded-a", "discarded-a"],
    }),
    "tcg_v0_2_deck_discard_event_card_uid_duplicate",
  );
});
