import {
  runtimeV02ApplyOpeningChoice,
  runtimeV02ApplyOpeningCoinCall,
  runtimeV02ApplySetupReady,
  type RuntimeV02OpeningChoiceState,
  type RuntimeV02OpeningCoinCallState,
  type RuntimeV02SetupReadyState,
} from "../_shared/tcg-match-flow-engine-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function coinState(overrides: Record<string, unknown> = {}): RuntimeV02OpeningCoinCallState {
  return {
    phase: "opening_coin_call",
    coin_call_seat: 1,
    coin_call: null,
    coin_result: null,
    toss_winner_seat: null,
    marker: "untouched",
    log: ["Match created. Seat 1 must call heads or tails for the opening toss."],
    ...overrides,
  };
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

function deck(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    uid: `card-${index + 1}`,
    card_id: `test-${index + 1}`,
  }));
}

function setupState(
  overrides: Record<string, unknown> = {},
): RuntimeV02SetupReadyState {
  return {
    phase: "setup",
    first_player_seat: 1,
    setup_turn_seat: 1,
    active_seat: null,
    turn_seq: 0,
    personal_turns: { "1": 0, "2": 0 },
    setup_ready: { "1": false, "2": false },
    players: {
      "1": { vanguard: { stack: [{ uid: "p1-v", card_id: "p1" }] }, deck: deck(20) },
      "2": { vanguard: { stack: [{ uid: "p2-v", card_id: "p2" }] }, deck: deck(20) },
    },
    marker: "untouched",
    log: ["setup"],
    ...overrides,
  };
}

Deno.test("Match Flow resolves a correct opening coin call and advances only to turn-order choice", () => {
  const state = coinState();
  let calls = 0;
  const result = runtimeV02ApplyOpeningCoinCall(state, 1, "HEADS", () => {
    calls += 1;
    return "heads";
  });
  assert(result.ok, "opening coin call was rejected");
  assert(calls === 1, "opening coin call must consume exactly one server flip");
  assert(result.coin_call === "heads" && result.coin_result === "heads", "coin result contract changed");
  assert(result.toss_winner_seat === 1, "matching caller did not win the toss");
  assert(state.phase === "opening_choice", "coin result did not advance to turn-order choice");
  assert(state.coin_call === "heads" && state.coin_result === "heads", "public coin state not stored");
  assert(state.toss_winner_seat === 1, "toss winner state mismatch");
  assert(state.marker === "untouched", "unrelated coin-call state changed");
  const log = state.log as string[];
  assert(log.at(-1) === "Seat 1 called heads. Coin landed heads. Seat 1 won the opening toss.", "coin log changed");
});

Deno.test("Match Flow gives the other seat the toss when the caller misses", () => {
  const state = coinState();
  const result = runtimeV02ApplyOpeningCoinCall(state, 1, "tails", () => "heads");
  assert(result.ok, "valid miss was rejected");
  assert(result.toss_winner_seat === 2, "opposing seat did not win a missed call");
  assert(state.coin_call === "tails" && state.coin_result === "heads", "call/result state mismatch");
});

Deno.test("Match Flow rejects invalid coin calls before consuming randomness or mutating", () => {
  for (const [state, controller, call] of [
    [coinState(), 2, "heads"],
    [coinState(), 1, "edge"],
    [coinState({ phase: "opening_choice" }), 1, "heads"],
  ] as const) {
    const before = JSON.stringify(state);
    let calls = 0;
    const result = runtimeV02ApplyOpeningCoinCall(state, controller as 1 | 2, call, () => {
      calls += 1;
      return "heads";
    });
    assert(!result.ok, "illegal opening coin call was accepted");
    assert(calls === 0, "rejected opening coin call consumed randomness");
    assert(JSON.stringify(state) === before, "rejected opening coin call mutated state");
  }
});

Deno.test("Match Flow fails closed on an invalid injected coin result without mutating", () => {
  const state = coinState();
  const before = JSON.stringify(state);
  let message = "";
  try {
    runtimeV02ApplyOpeningCoinCall(state, 1, "heads", (() => "edge") as never);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message === "tcg_v0_2_match_flow_coin_result_invalid", "invalid coin result error changed");
  assert(JSON.stringify(state) === before, "invalid injected coin result mutated state");
});

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

Deno.test("Match Flow locks Seat 1 setup and advances only setup order", () => {
  const state = setupState();
  let distributionCalled = false;
  const result = runtimeV02ApplySetupReady(state, 1, () => {
    distributionCalled = true;
  });
  assert(result.ok && !result.all_ready, "Seat 1 setup did not lock");
  assert(distributionCalled === false, "Seat 1 incorrectly distributed setup cards");
  const ready = state.setup_ready as Record<string, boolean>;
  assert(ready["1"] === true && ready["2"] === false, "setup readiness changed incorrectly");
  assert(state.phase === "setup", "Seat 1 advanced the phase too early");
  assert(state.setup_turn_seat === 2, "Seat 2 did not receive setup turn");
  assert(state.active_seat === null && state.turn_seq === 0, "play lifecycle advanced too early");
  assert(state.marker === "untouched", "unrelated setup state changed");
  const log = state.log as string[];
  assert(log.at(-1) === "Seat 1 setup locked.", "Seat 1 setup log changed");
});

Deno.test("Match Flow final setup runs one distribution transaction before entering play", () => {
  const state = setupState({
    first_player_seat: 2,
    setup_turn_seat: 2,
    setup_ready: { "1": true, "2": false },
  });
  let calls = 0;
  const result = runtimeV02ApplySetupReady(state, 2, (plan) => {
    calls += 1;
    assert(plan.active_seat === 2, "distribution active seat changed");
    assert(plan.reward_count_each === 6, "reward count changed");
    assert(plan.opening_draw_count === 1, "opening draw count changed");
    assert(state.phase === "setup", "flow advanced before distribution completed");
    const ready = state.setup_ready as Record<string, boolean>;
    assert(ready["2"] === false, "Seat 2 readiness mutated before distribution completed");
  });
  assert(result.ok && result.all_ready, "final setup did not complete");
  assert(calls === 1, "final setup did not run exactly one distribution transaction");
  assert(result.active_seat === 2, "first player did not become active");
  const ready = state.setup_ready as Record<string, boolean>;
  const turns = state.personal_turns as Record<string, number>;
  assert(ready["2"] === true, "Seat 2 readiness not committed");
  assert(state.phase === "play", "setup did not advance to play");
  assert(state.setup_turn_seat === null, "setup turn was not cleared");
  assert(state.active_seat === 2 && state.turn_seq === 1, "turn one lifecycle incorrect");
  assert(turns["2"] === 1 && turns["1"] === 0, "personal turn counters changed incorrectly");
  const log = state.log as string[];
  assert(log.at(-1) === "Seat 2 setup locked. Seat 2 begins turn 1 and draws.", "final setup log changed");
});

Deno.test("Match Flow rejects setup permission and Vanguard failures without mutation", () => {
  const wrongTurn = setupState({ setup_turn_seat: 2 });
  const wrongTurnBefore = JSON.stringify(wrongTurn);
  const wrongTurnResult = runtimeV02ApplySetupReady(wrongTurn, 1);
  assert(!wrongTurnResult.ok && wrongTurnResult.error === "setup_not_your_turn", "setup turn error changed");
  assert(JSON.stringify(wrongTurn) === wrongTurnBefore, "wrong-turn setup mutated state");

  const noVanguard = setupState({
    players: {
      "1": { vanguard: null, deck: deck(20) },
      "2": { vanguard: { stack: [] }, deck: deck(20) },
    },
  });
  const noVanguardBefore = JSON.stringify(noVanguard);
  const noVanguardResult = runtimeV02ApplySetupReady(noVanguard, 1);
  assert(!noVanguardResult.ok && noVanguardResult.error === "vanguard_required", "Vanguard error changed");
  assert(JSON.stringify(noVanguard) === noVanguardBefore, "missing-Vanguard setup mutated state");
});

Deno.test("Match Flow preserves setup deck depletion protocol without distribution", () => {
  for (const [state, error] of [
    [setupState({
      setup_turn_seat: 2,
      setup_ready: { "1": true, "2": false },
      players: {
        "1": { vanguard: { stack: [] }, deck: deck(5) },
        "2": { vanguard: { stack: [] }, deck: deck(20) },
      },
    }), "deck_depleted_before_rewards"],
    [setupState({
      first_player_seat: 1,
      setup_turn_seat: 2,
      setup_ready: { "1": true, "2": false },
      players: {
        "1": { vanguard: { stack: [] }, deck: deck(6) },
        "2": { vanguard: { stack: [] }, deck: deck(20) },
      },
    }), "deck_depleted_before_start_draw"],
  ] as const) {
    const before = JSON.stringify(state);
    let calls = 0;
    const result = runtimeV02ApplySetupReady(state, 2, () => {
      calls += 1;
    });
    assert(!result.ok && result.error === error, `setup deck error changed: ${error}`);
    assert(calls === 0, "distribution ran after failed deck precondition");
    assert(JSON.stringify(state) === before, "failed setup deck precondition mutated state");
  }
});

Deno.test("Match Flow does not advance lifecycle when Card-Zone distribution fails", () => {
  const state = setupState({
    setup_turn_seat: 2,
    setup_ready: { "1": true, "2": false },
  });
  const before = JSON.stringify(state);
  let threw = false;
  try {
    runtimeV02ApplySetupReady(state, 2, () => {
      throw new Error("card_zone_distribution_failed");
    });
  } catch (error) {
    threw = error instanceof Error && error.message === "card_zone_distribution_failed";
  }
  assert(threw, "distribution failure was swallowed");
  assert(JSON.stringify(state) === before, "distribution failure half-advanced Match Flow state");
});
