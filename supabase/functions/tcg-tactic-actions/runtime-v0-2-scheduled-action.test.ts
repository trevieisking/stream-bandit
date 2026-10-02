import {
  runtimeV02ResolveControllerAftermathScheduledActions,
  runtimeV02ScheduleAction,
  runtimeV02ScheduledActions,
} from "../_shared/tcg-match-scheduled-action-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function same(actual: unknown, expected: unknown, message = "instances differ") {
  if (!Object.is(actual, expected)) throw new Error(message);
}
function card(uid: string) {
  return { uid, card_id: uid };
}
function state(deck2 = [card("draw-1")]) {
  return {
    turn_seq: 12,
    active_seat: 1 as const,
    phase: "play",
    players: {
      "1": { deck: [], hand: [] },
      "2": { deck: [...deck2], hand: [] },
    },
  } as Record<string, unknown> & any;
}
function schedule(match: any) {
  return runtimeV02ScheduleAction(match, {
    owner_seat: 1,
    source_action_id: "night-reading",
    source_card_uid: "source-uid",
    trigger: "controller_aftermath_finished",
    match_must_be_active: true,
    steps: [{
      op: "DRAW_FIXED",
      player: "opponent",
      count: 1,
      deckout_on_incomplete: true,
    }],
  }, "scheduled-1");
}

Deno.test("scheduled action resolves after the controller Aftermath through Card-Zone identity movement", () => {
  const match = state();
  const drawn = match.players["2"].deck[0];
  schedule(match);
  equal(runtimeV02ScheduledActions(match).length, 1);

  const resolved = runtimeV02ResolveControllerAftermathScheduledActions(match, 1);
  equal(resolved.length, 1);
  equal(resolved[0].draws, [{ seat: 2, requested: 1, drawn: 1, deckout: false }]);
  equal(match.players["2"].deck, []);
  equal(match.players["2"].hand.length, 1);
  same(match.players["2"].hand[0], drawn, "scheduled draw cloned the card");
  equal(runtimeV02ScheduledActions(match), []);
});

Deno.test("scheduled fixed draw marks deckout on incomplete resolution", () => {
  const match = state([]);
  schedule(match);
  const resolved = runtimeV02ResolveControllerAftermathScheduledActions(match, 1);
  equal(resolved[0].draws[0], { seat: 2, requested: 1, drawn: 0, deckout: true });
  equal(match.deckout_loser, 2);
  equal(runtimeV02ScheduledActions(match), []);
});

Deno.test("scheduled action stays queued for a different Aftermath owner", () => {
  const match = state();
  schedule(match);
  equal(runtimeV02ResolveControllerAftermathScheduledActions(match, 2), []);
  equal(runtimeV02ScheduledActions(match).length, 1);
});

Deno.test("match-must-be-active scheduled action is consumed without mutation once match is terminal", () => {
  const match = state();
  schedule(match);
  match.phase = "complete";
  const resolved = runtimeV02ResolveControllerAftermathScheduledActions(match, 1);
  equal(resolved[0].executed, false);
  equal(resolved[0].skipped_match_inactive, true);
  equal(match.players["2"].deck.length, 1);
  equal(match.players["2"].hand.length, 0);
  equal(runtimeV02ScheduledActions(match), []);
});
