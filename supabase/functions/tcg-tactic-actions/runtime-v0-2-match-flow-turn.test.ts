import {
  runtimeV02AdvanceTurn,
  type RuntimeV02TurnAdvanceState,
} from "../_shared/tcg-match-flow-turn-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function card(uid: string) {
  return { uid, card_id: uid };
}

function creature(uid: string) {
  return { stack: [card(uid)], damage: 0, essence: [] };
}

function state(overrides: Record<string, unknown> = {}): RuntimeV02TurnAdvanceState {
  return {
    phase: "play",
    active_seat: 1,
    turn_seq: 4,
    personal_turns: { "1": 2, "2": 2 },
    deckout_loser: null,
    result: null,
    marker: "untouched",
    log: ["prior"],
    players: {
      "1": {
        rewards: [card("p1-reward")],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
        deck: [card("p1-draw")],
      },
      "2": {
        rewards: [card("p2-reward")],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
        deck: [card("p2-draw"), card("p2-next")],
      },
    },
    ...overrides,
  };
}

Deno.test("Match Flow advances Seat 1 to Seat 2 and delegates exactly one draw", () => {
  const s = state();
  let calls = 0;
  const result = runtimeV02AdvanceTurn(s, (plan) => {
    calls += 1;
    assert(plan.controller_seat === 2, "wrong draw seat");
    assert(plan.card_uid === "p2-draw", "wrong draw card");
    assert(plan.source_action_id === "turn_start_draw", "draw source changed");
    assert(s.active_seat === 1 && s.turn_seq === 4, "lifecycle advanced before Card-Zone draw completed");
  });
  assert(result.status === "advanced", "ordinary turn did not advance");
  assert(calls === 1, "turn start did not request exactly one draw");
  assert(s.active_seat === 2 && s.turn_seq === 5, "turn lifecycle incorrect");
  const turns = s.personal_turns as Record<string, number>;
  assert(turns["1"] === 2 && turns["2"] === 3, "personal turn counters incorrect");
  const log = s.log as string[];
  assert(log.at(-1) === "Seat 2 begins personal turn 3.", "turn-start log changed");
  assert(s.marker === "untouched", "unrelated turn state changed");
});

Deno.test("Match Flow exits resolution when a completed Reward/promotion chain advances the turn", () => {
  const s = state({
    phase: "resolution",
    active_seat: 2,
    turn_seq: 12,
    personal_turns: { "1": 6, "2": 6 },
  });
  let drawSeat = 0;
  const result = runtimeV02AdvanceTurn(s, (plan) => {
    drawSeat = plan.controller_seat;
  });
  assert(result.status === "advanced", "resolved lethal Attack did not advance");
  assert(drawSeat === 1, "resolved lethal Attack drew for the wrong next player");
  assert(s.active_seat === 1 && s.turn_seq === 13, "resolved lethal Attack did not rotate the turn");
  assert(s.phase === "play", "resolved lethal Attack left the match stuck in resolution");
});

Deno.test("Match Flow advances Seat 2 back to Seat 1", () => {
  const s = state({ active_seat: 2, turn_seq: 9, personal_turns: { "1": 4, "2": 5 } });
  let drawSeat = 0;
  const result = runtimeV02AdvanceTurn(s, (plan) => {
    drawSeat = plan.controller_seat;
  });
  assert(result.status === "advanced", "Seat 2 turn did not advance");
  assert(drawSeat === 1, "turn rotation did not return to Seat 1");
  assert(s.active_seat === 1 && s.turn_seq === 10, "Seat 1 lifecycle incorrect");
  const turns = s.personal_turns as Record<string, number>;
  assert(turns["1"] === 5 && turns["2"] === 5, "Seat 1 personal turn count incorrect");
});

Deno.test("Match Flow terminal preflight stops turn rotation and draw", () => {
  const terminalPlayers = {
    "1": {
      rewards: [],
      vanguard: creature("p1-v"),
      reserve: [null, null, null, null],
      deck: [card("p1-draw")],
    },
    "2": {
      rewards: [card("p2-reward")],
      vanguard: creature("p2-v"),
      reserve: [null, null, null, null],
      deck: [card("p2-draw")],
    },
  };
  const s = state({ players: terminalPlayers });
  let calls = 0;
  const result = runtimeV02AdvanceTurn(s, () => {
    calls += 1;
  });
  assert(result.status === "terminal", "terminal match tried to advance");
  assert(calls === 0, "terminal match requested a draw");
  assert(s.active_seat === 1 && s.turn_seq === 4, "terminal preflight rotated turn");
  const turns = s.personal_turns as Record<string, number>;
  assert(turns["2"] === 2, "terminal preflight changed personal turn");
  assert(s.phase === "complete", "terminal preflight did not preserve winner evaluation");
});

Deno.test("Match Flow preserves deckout timing and evaluates winner without drawing", () => {
  const players = {
    "1": {
      rewards: [card("p1-reward")],
      vanguard: creature("p1-v"),
      reserve: [null, null, null, null],
      deck: [card("p1-draw")],
    },
    "2": {
      rewards: [card("p2-reward")],
      vanguard: creature("p2-v"),
      reserve: [null, null, null, null],
      deck: [],
    },
  };
  const s = state({ players });
  let calls = 0;
  const result = runtimeV02AdvanceTurn(s, () => {
    calls += 1;
  });
  assert(result.status === "deckout", "empty next deck did not deck out");
  assert(calls === 0, "deckout requested a Card-Zone draw");
  assert(s.active_seat === 2 && s.turn_seq === 5, "deckout lifecycle timing changed");
  const turns = s.personal_turns as Record<string, number>;
  assert(turns["2"] === 3, "deckout personal turn timing changed");
  assert(s.deckout_loser === 2, "deckout loser marker changed");
  assert(s.phase === "complete", "deckout did not complete match");
  const terminal = s.result as { winner_seat: number; reasons: string[] };
  assert(terminal.winner_seat === 1, "deckout winner changed");
  assert(JSON.stringify(terminal.reasons) === JSON.stringify(["opponent_deckout"]), "deckout reason changed");
});

Deno.test("Match Flow does not half-advance lifecycle when Card-Zone draw fails", () => {
  const s = state();
  const before = JSON.stringify(s);
  let threw = false;
  try {
    runtimeV02AdvanceTurn(s, () => {
      throw new Error("card_zone_turn_draw_failed");
    });
  } catch (error) {
    threw = error instanceof Error && error.message === "card_zone_turn_draw_failed";
  }
  assert(threw, "draw failure was swallowed");
  assert(JSON.stringify(s) === before, "draw failure half-advanced turn lifecycle");
});

Deno.test("Match Flow rejects an invalid active seat before mutation", () => {
  const s = state({ active_seat: null });
  const before = JSON.stringify(s);
  let message = "";
  try {
    runtimeV02AdvanceTurn(s, () => {});
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message === "tcg_v0_2_match_flow_active_seat_invalid", "invalid active-seat guard changed");
  assert(JSON.stringify(s) === before, "invalid active seat mutated state");
});
