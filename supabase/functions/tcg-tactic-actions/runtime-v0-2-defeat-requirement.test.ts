import {
  runtimeV02EvaluateDefeatHistoryRequirement,
} from "../_shared/tcg-match-defeat-requirement-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function event(
  sequence: number,
  turnSeq: number,
  activeSeat: 1 | 2,
  ownerSeat: 1 | 2,
  creatureUid: string,
  cardId: string,
  sourceControllerSeat: 1 | 2 | null = null,
) {
  return {
    event_id: `defeat:${turnSeq}:${sequence}:${creatureUid}`,
    event: "creature_defeated",
    sequence,
    turn_seq: turnSeq,
    active_seat: activeSeat,
    owner_seat: ownerSeat,
    opponent_seat: ownerSeat === 1 ? 2 : 1,
    where: "vanguard",
    index: null,
    creature_uid: creatureUid,
    card_id: cardId,
    reward_value: 1,
    action_kind: "attack",
    source_action_id: "test-attack",
    source_controller_seat: sourceControllerSeat,
    source_card_uid: "source-card",
  };
}

function state(turnSeq = 7, activeSeat: 1 | 2 = 1) {
  return {
    turn_seq: turnSeq,
    active_seat: activeSeat,
    effect_events: [
      event(1, 4, 2, 1, "old-own", "underworld-old"),
      event(2, 6, 2, 1, "recent-own", "underworld-recent", 2),
      event(3, 7, 1, 2, "current-opponent", "fairy-current", 1),
      event(4, 7, 1, 1, "source-uid", "underworld-source", 2),
    ],
  } as Record<string, unknown>;
}

Deno.test("defeat-history requirement resolves current-turn ownership from perspective", () => {
  equal(runtimeV02EvaluateDefeatHistoryRequirement(
    state(),
    {
      predicate: "defeat_history_count_at_least",
      window: "current_turn",
      owner: "opponent",
      min_count: 1,
    },
    { perspective_seat: 1, source_creature_uid: "source-uid" },
  ), true);
});

Deno.test("defeat-history requirement resolves the immediately previous opponent turn", () => {
  equal(runtimeV02EvaluateDefeatHistoryRequirement(
    state(),
    {
      predicate: "defeat_history_count_at_least",
      window: "previous_opponent_turn",
      owner: "self",
      min_count: 1,
    },
    { perspective_seat: 1, source_creature_uid: "source-uid" },
  ), true);
});

Deno.test("defeat-history requirement can cover since previous own turn ended", () => {
  equal(runtimeV02EvaluateDefeatHistoryRequirement(
    state(),
    {
      predicate: "defeat_history_count_at_least",
      window: "since_previous_own_turn_end",
      owner: "self",
      min_count: 2,
    },
    { perspective_seat: 1, source_creature_uid: "source-uid" },
  ), true);
});

Deno.test("defeat-history requirement excludes the source creature generically", () => {
  equal(runtimeV02EvaluateDefeatHistoryRequirement(
    state(),
    {
      predicate: "defeat_history_count_at_least",
      window: "current_turn",
      owner: "self",
      min_count: 1,
      exclude_source: true,
    },
    { perspective_seat: 1, source_creature_uid: "source-uid" },
  ), false);
});

Deno.test("defeat-history requirement can bind exact card identity across the match", () => {
  equal(runtimeV02EvaluateDefeatHistoryRequirement(
    state(),
    {
      predicate: "defeat_history_count_at_least",
      window: "match",
      owner: "self",
      card_id: "underworld-old",
      min_count: 1,
    },
    { perspective_seat: 1, source_creature_uid: null },
  ), true);
});

Deno.test("previous-opponent-turn window fails closed outside the perspective own turn", () => {
  equal(runtimeV02EvaluateDefeatHistoryRequirement(
    state(7, 2),
    {
      predicate: "defeat_history_count_at_least",
      window: "previous_opponent_turn",
      owner: "self",
      min_count: 1,
    },
    { perspective_seat: 1, source_creature_uid: "source-uid" },
  ), false);
});
