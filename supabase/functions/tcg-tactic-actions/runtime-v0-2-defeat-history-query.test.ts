import {
  runtimeV02CountDefeatHistory,
  runtimeV02DefeatedCreatureUids,
  runtimeV02QueryDefeatHistory,
} from "../_shared/tcg-match-defeat-query-v0-2.ts";

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

function defeat(
  sequence: number,
  turnSeq: number,
  activeSeat: 1 | 2,
  ownerSeat: 1 | 2,
  uid: string,
  cardId: string,
) {
  return {
    event_id: `creature-defeated:${turnSeq}:${sequence}:${ownerSeat}:${uid}`,
    event: "creature_defeated",
    sequence,
    turn_seq: turnSeq,
    active_seat: activeSeat,
    owner_seat: ownerSeat,
    opponent_seat: ownerSeat === 1 ? 2 : 1,
    where: "vanguard",
    index: null,
    creature_uid: uid,
    card_id: cardId,
    reward_value: 1,
    action_kind: "attack",
    source_action_id: `attack:${sequence}`,
    source_controller_seat: ownerSeat === 1 ? 2 : 1,
    source_card_uid: `source-${sequence}`,
  };
}

Deno.test("Defeat #34 history query filters explicit owner and turn windows", () => {
  const state: any = {
    turn_seq: 8,
    effect_events: [
      { event: "other_event", event_id: "other" },
      defeat(1, 6, 1, 2, "old-opponent", "old-opponent-card"),
      defeat(2, 7, 2, 1, "friendly-last-opponent-turn", "friendly-a"),
      defeat(3, 8, 1, 1, "friendly-current-turn", "friendly-b"),
      defeat(4, 8, 1, 2, "opponent-current-turn", "opponent-b"),
    ],
  };

  equal(
    runtimeV02QueryDefeatHistory(state, { owner_seat: 1, min_turn_seq: 7, max_turn_seq: 8 })
      .map((event) => event.creature_uid),
    ["friendly-last-opponent-turn", "friendly-current-turn"],
  );
  equal(
    runtimeV02QueryDefeatHistory(state, { owner_seat: 1, active_seat: 2, min_turn_seq: 7, max_turn_seq: 7 })
      .map((event) => event.creature_uid),
    ["friendly-last-opponent-turn"],
  );
  equal(runtimeV02CountDefeatHistory(state, { owner_seat: 2, min_turn_seq: 8 }), 1);
});

Deno.test("Defeat history supports exact/excluded Creature identities for generic listener predicates and discard recovery", () => {
  const state: any = {
    effect_events: [
      defeat(1, 4, 2, 1, "uid-a", "underworld-a"),
      defeat(2, 5, 1, 1, "uid-b", "underworld-b"),
      defeat(3, 5, 1, 2, "uid-c", "fairy-c"),
    ],
  };

  equal(runtimeV02DefeatedCreatureUids(state, { owner_seat: 1 }), ["uid-a", "uid-b"]);
  equal(runtimeV02DefeatedCreatureUids(state, { owner_seat: 1, exclude_creature_uid: "uid-a" }), ["uid-b"]);
  equal(runtimeV02CountDefeatHistory(state, { creature_uid: "uid-b", card_id: "underworld-b" }), 1);
  equal(runtimeV02CountDefeatHistory(state, { source_controller_seat: 1 }), 1);
});

Deno.test("Defeat history is read-only and returned records cannot mutate authoritative history", () => {
  const original = defeat(1, 3, 2, 1, "uid-a", "card-a");
  const state: any = { effect_events: [original] };
  const result = runtimeV02QueryDefeatHistory(state);
  result[0].card_id = "changed";
  equal(state.effect_events[0].card_id, "card-a");
});

Deno.test("Defeat history fails closed on malformed canonical defeat records", () => {
  const malformed: any = defeat(1, 3, 2, 1, "uid-a", "card-a");
  malformed.owner_seat = 9;
  throws(
    () => runtimeV02QueryDefeatHistory({ effect_events: [malformed] }),
    "tcg_v0_2_defeat_history_owner_invalid",
  );
  throws(
    () => runtimeV02QueryDefeatHistory({ effect_events: {} as any }),
    "tcg_v0_2_defeat_history_event_stream_invalid",
  );
});
