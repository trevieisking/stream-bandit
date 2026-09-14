import {
  runtimeV02EvaluateWinner,
  type RuntimeV02TerminalState,
} from "../_shared/tcg-match-flow-engine-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function creature(uid: string) {
  return { stack: [{ uid, card_id: uid }], damage: 0, essence: [] };
}

function terminalState(
  overrides: Record<string, unknown> = {},
): RuntimeV02TerminalState {
  return {
    phase: "play",
    deckout_loser: null,
    result: null,
    marker: "untouched",
    players: {
      "1": {
        rewards: [{ uid: "r1", card_id: "reward-1" }],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [{ uid: "r2", card_id: "reward-2" }],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
    ...overrides,
  };
}

Deno.test("Match Flow terminal evaluation leaves a non-terminal match unchanged", () => {
  const state = terminalState();
  const before = JSON.stringify(state);
  const terminal = runtimeV02EvaluateWinner(state);
  assert(terminal === false, "ordinary live match was marked terminal");
  assert(JSON.stringify(state) === before, "non-terminal evaluation mutated state");
});

Deno.test("Match Flow awards Seat 1 victory when Seat 1 has taken all Rewards", () => {
  const state = terminalState({
    players: {
      "1": {
        rewards: [],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [{ uid: "r2", card_id: "reward-2" }],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
  });
  const terminal = runtimeV02EvaluateWinner(state);
  assert(terminal === true, "Reward victory was not terminal");
  assert(state.phase === "complete", "Reward victory did not complete match");
  const result = state.result as { winner_seat: number; reasons: string[] };
  assert(result.winner_seat === 1, "wrong Reward winner");
  assert(JSON.stringify(result.reasons) === JSON.stringify(["all_rewards_taken"]), "Reward reason changed");
  assert(state.marker === "untouched", "unrelated terminal state changed");
});

Deno.test("Match Flow awards victory when the opponent has no Creature", () => {
  const state = terminalState({
    players: {
      "1": {
        rewards: [{ uid: "r1", card_id: "reward-1" }],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [{ uid: "r2", card_id: "reward-2" }],
        vanguard: null,
        reserve: [null, null, null, null],
      },
    },
  });
  const terminal = runtimeV02EvaluateWinner(state);
  assert(terminal === true, "no-Creature victory was not terminal");
  assert(state.phase === "complete", "no-Creature victory did not complete match");
  const result = state.result as { winner_seat: number; reasons: string[] };
  assert(result.winner_seat === 1, "wrong no-Creature winner");
  assert(JSON.stringify(result.reasons) === JSON.stringify(["opponent_has_no_creature"]), "no-Creature reason changed");
});

Deno.test("Match Flow awards victory from the existing deckout loser marker", () => {
  const state = terminalState({ deckout_loser: 2 });
  const terminal = runtimeV02EvaluateWinner(state);
  assert(terminal === true, "deckout was not terminal");
  assert(state.phase === "complete", "deckout did not complete match");
  const result = state.result as { winner_seat: number; reasons: string[] };
  assert(result.winner_seat === 1, "wrong deckout winner");
  assert(JSON.stringify(result.reasons) === JSON.stringify(["opponent_deckout"]), "deckout reason changed");
});

Deno.test("Match Flow preserves reason-count priority when one seat has more simultaneous win reasons", () => {
  const state = terminalState({
    deckout_loser: 2,
    players: {
      "1": {
        rewards: [],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
  });
  const terminal = runtimeV02EvaluateWinner(state);
  assert(terminal === true, "multi-reason victory was not terminal");
  assert(state.phase === "complete", "multi-reason victory did not complete match");
  const result = state.result as { winner_seat: number; reasons: string[] };
  assert(result.winner_seat === 1, "reason-count priority changed");
  assert(
    JSON.stringify(result.reasons) === JSON.stringify(["all_rewards_taken", "opponent_deckout"]),
    "winner reasons changed",
  );
});

Deno.test("Match Flow preserves equal-reason simultaneous victory as overtime pending", () => {
  const state = terminalState({
    players: {
      "1": {
        rewards: [],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
  });
  const terminal = runtimeV02EvaluateWinner(state);
  assert(terminal === true, "simultaneous victory was not terminal for ordinary play");
  assert(state.phase === "overtime_pending", "simultaneous victory did not enter overtime pending");
  const result = state.result as {
    winner_seat: null;
    reasons: Record<string, string[]>;
    reason: string;
  };
  assert(result.winner_seat === null, "overtime incorrectly chose a winner");
  assert(
    JSON.stringify(result.reasons) === JSON.stringify({
      "1": ["all_rewards_taken"],
      "2": ["all_rewards_taken"],
    }),
    "overtime reasons changed",
  );
  assert(result.reason === "simultaneous_win_tie_requires_overtime", "overtime reason changed");
});
