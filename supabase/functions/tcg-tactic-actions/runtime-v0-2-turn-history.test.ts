import {
  runtimeV02PreviousOpponentTurn,
  runtimeV02RecordTurnOwner,
  runtimeV02TurnOwnerAt,
} from "../_shared/tcg-match-turn-history-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
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

Deno.test("turn history appends canonical ownership and is idempotent for the same turn", () => {
  const state: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 1,
  };
  const first = runtimeV02RecordTurnOwner(state, 1, 1);
  equal(first.turn_seq, 1);
  equal(first.active_seat, 1);
  equal((state.turn_owner_history as unknown[]).length, 1);

  runtimeV02RecordTurnOwner(state, 1, 1);
  equal((state.turn_owner_history as unknown[]).length, 1);

  state.turn_seq = 2;
  runtimeV02RecordTurnOwner(state, 2, 2);
  equal((state.turn_owner_history as unknown[]).length, 2);
  equal(runtimeV02TurnOwnerAt(state, 2), 2);
});

Deno.test("turn history rejects conflicting or genuinely out-of-order ownership", () => {
  const conflictState: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 2,
    turn_owner_history: [
      { turn_seq: 1, active_seat: 1 },
      { turn_seq: 2, active_seat: 2 },
    ],
  };
  throws(
    () => runtimeV02RecordTurnOwner(conflictState, 2, 1),
    "tcg_v0_2_turn_history_owner_conflict",
  );

  const gapState: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 3,
    turn_owner_history: [
      { turn_seq: 1, active_seat: 1 },
      { turn_seq: 3, active_seat: 1 },
    ],
  };
  throws(
    () => runtimeV02RecordTurnOwner(gapState, 2, 2),
    "tcg_v0_2_turn_history_append_only",
  );
});

Deno.test("legacy pre-history states reconstruct ordinary alternating turn ownership", () => {
  const state: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 4,
    active_seat: 2,
  };
  equal(runtimeV02TurnOwnerAt(state, 1), 1);
  equal(runtimeV02TurnOwnerAt(state, 2), 2);
  equal(runtimeV02TurnOwnerAt(state, 3), 1);
  equal(runtimeV02TurnOwnerAt(state, 4), 2);
  equal(runtimeV02PreviousOpponentTurn(state, 2), 3);
});

Deno.test("previous opponent turn uses explicit ownership and survives same-seat extra turns", () => {
  const state: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 4,
    active_seat: 1,
    turn_owner_history: [
      { turn_seq: 1, active_seat: 1 },
      { turn_seq: 2, active_seat: 2 },
      { turn_seq: 3, active_seat: 1 },
      { turn_seq: 4, active_seat: 1 },
    ],
  };
  equal(
    runtimeV02PreviousOpponentTurn(state, 1),
    2,
    "same-seat extra turn must not redefine previous opponent turn as turn 3",
  );
  equal(runtimeV02PreviousOpponentTurn(state, 2), 3);
});

Deno.test("previous opponent turn is null before the opponent has owned a turn", () => {
  const state: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 1,
    active_seat: 1,
    turn_owner_history: [{ turn_seq: 1, active_seat: 1 }],
  };
  equal(runtimeV02PreviousOpponentTurn(state, 1), null);
});
