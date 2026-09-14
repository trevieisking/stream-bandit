import {
  runtimeV02ApplyOpeningChoice,
  type RuntimeV02OpeningChoiceState,
} from "../_shared/tcg-match-flow-engine-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function baseState(overrides: Record<string, unknown> = {}): RuntimeV02OpeningChoiceState {
  return {
    phase: "opening_choice",
    toss_winner_seat: 1,
    first_player_seat: null,
    setup_turn_seat: null,
    active_seat: null,
    turn_seq: 0,
    marker: "untouched",
    log: ["Match created. Seat 1 won the opening toss."],
    ...overrides,
  };
}

Deno.test("Match Flow opening choice lets toss winner Seat 1 choose first", () => {
  const state = baseState();
  const result = runtimeV02ApplyOpeningChoice(state, 1, "first");
  assert(result.ok, "opening choice was rejected");
  assert(result.first_player_seat === 1, "Seat 1 was not selected first");
  assert(state.first_player_seat === 1, "state first player mismatch");
  assert(state.phase === "setup", "phase did not advance to setup");
  assert(state.setup_turn_seat === 1, "setup must still start with Seat 1");
  assert(state.marker === "untouched", "unrelated state changed");
  const log = state.log as string[];
  assert(log.at(-1) === "Seat 1 chose to go first.", "opening choice log changed");
});

Deno.test("Match Flow opening choice lets toss winner Seat 1 choose second", () => {
  const state = baseState();
  const result = runtimeV02ApplyOpeningChoice(state, 1, "second");
  assert(result.ok, "opening choice was rejected");
  assert(result.first_player_seat === 2, "Seat 2 was not selected first");
  assert(state.first_player_seat === 2, "state first player mismatch");
  assert(state.phase === "setup", "phase did not advance to setup");
  assert(state.setup_turn_seat === 1, "setup order changed");
  const log = state.log as string[];
  assert(log.at(-1) === "Seat 1 chose to go second.", "opening choice log changed");
});

Deno.test("Match Flow preserves setup order when Seat 2 wins toss and chooses first", () => {
  const state = baseState({
    toss_winner_seat: 2,
    log: ["Match created. Seat 2 won the opening toss."],
  });
  const result = runtimeV02ApplyOpeningChoice(state, 2, "first");
  assert(result.ok, "Seat 2 opening choice was rejected");
  assert(result.first_player_seat === 2, "Seat 2 was not selected first");
  assert(state.setup_turn_seat === 1, "existing Seat 1-first setup rule changed");
  const log = state.log as string[];
  assert(log.at(-1) === "Seat 2 chose to go first.", "Seat 2 log changed");
});

Deno.test("Match Flow rejects a non-winner or wrong-phase opening choice without mutation", () => {
  for (const state of [baseState(), baseState({ phase: "setup" })]) {
    const before = JSON.stringify(state);
    const controller = state.phase === "opening_choice" ? 2 : 1;
    const result = runtimeV02ApplyOpeningChoice(state, controller, "first");
    assert(!result.ok, "illegal opening choice was accepted");
    assert(result.error === "opening_choice_not_allowed", "protocol error changed");
    assert(JSON.stringify(state) === before, "rejected opening choice mutated state");
  }
});

Deno.test("Match Flow rejects an invalid first/second choice without mutation", () => {
  const state = baseState();
  const before = JSON.stringify(state);
  const result = runtimeV02ApplyOpeningChoice(state, 1, "later");
  assert(!result.ok, "invalid choice was accepted");
  assert(result.error === "choice_must_be_first_or_second", "protocol error changed");
  assert(JSON.stringify(state) === before, "invalid choice mutated state");
});
