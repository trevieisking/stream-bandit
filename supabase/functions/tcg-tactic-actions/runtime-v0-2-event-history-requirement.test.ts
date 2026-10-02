import {
  evaluateRuntimeV02EventOccurredRequirement,
} from "../_shared/tcg-match-event-history-query-v0-2.ts";
import { runtimeV02RecordTurnOwner } from "../_shared/tcg-match-turn-history-v0-2.ts";

function equal<T>(actual: T, expected: T, message = "values differ") {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

Deno.test("previous_opponent_turn resolves from explicit ownership history across an extra turn", () => {
  const state: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 4,
    active_seat: 1,
    effect_events: [
      { event: "creature_defeated", turn_seq: 2, controller_seat: 1 },
      { event: "creature_defeated", turn_seq: 3, controller_seat: 2 },
    ],
  };

  runtimeV02RecordTurnOwner(state, 1, 1);
  runtimeV02RecordTurnOwner(state, 2, 2);
  runtimeV02RecordTurnOwner(state, 3, 1);
  runtimeV02RecordTurnOwner(state, 4, 1);

  const result = evaluateRuntimeV02EventOccurredRequirement(
    state,
    1,
    1,
    {
      predicate: "event_occurred",
      event: "creature_defeated",
      controller: "self",
      window: "previous_opponent_turn",
      min_count: 1,
    },
  );

  equal(result.target_turn, 2, "extra turn must not turn previous opponent window into turn 3");
  equal(result.actual_count, 1, "only matching controller events on target turn count");
  equal(result.matched, true, "Reversal Seal requirement should match");
});

Deno.test("previous_opponent_turn ignores matching events from the wrong turn", () => {
  const state: Record<string, unknown> = {
    first_player_seat: 1,
    turn_seq: 4,
    active_seat: 1,
    effect_events: [
      { event: "creature_defeated", turn_seq: 3, controller_seat: 1 },
    ],
  };

  runtimeV02RecordTurnOwner(state, 1, 1);
  runtimeV02RecordTurnOwner(state, 2, 2);
  runtimeV02RecordTurnOwner(state, 3, 1);
  runtimeV02RecordTurnOwner(state, 4, 1);

  const result = evaluateRuntimeV02EventOccurredRequirement(
    state,
    1,
    1,
    {
      predicate: "event_occurred",
      event: "creature_defeated",
      controller: "self",
      window: "previous_opponent_turn",
      min_count: 1,
    },
  );

  equal(result.target_turn, 2);
  equal(result.actual_count, 0);
  equal(result.matched, false);
});
