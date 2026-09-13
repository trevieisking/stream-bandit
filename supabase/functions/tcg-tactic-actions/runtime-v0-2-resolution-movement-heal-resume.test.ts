import {
  runtimeV02BeginResolutionMovementHealListenerContinuation,
  runtimeV02ResolveResolutionMovementHealListenerChoice,
} from "../_shared/tcg-match-heal-listener-live-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

Deno.test("resolution movement heal continuation completes immediately when no heal packets were emitted", () => {
  const state: Record<string, unknown> = { turn_seq: 21 };

  const result = runtimeV02BeginResolutionMovementHealListenerContinuation(
    state,
    [],
    1,
  );

  assertEquals(result, {
    status: "complete",
    continuation: null,
    pending_choice: null,
  });
  assertEquals(state.pending_heal_listener_resume, undefined);
});

Deno.test("resolution movement heal resolver cannot consume an ordinary movement-to-play resume receipt", () => {
  const state: Record<string, unknown> = {
    turn_seq: 21,
    pending_heal_listener_resume: {
      kind: "scan_defeats_then_play",
      seat: 1,
      turn_seq: 21,
    },
  };

  assertThrows(
    () => runtimeV02ResolveResolutionMovementHealListenerChoice(
      state,
      1,
      "choice-1",
      [],
    ),
    "tcg_v0_2_heal_live_resume_kind_invalid",
  );
});

Deno.test("resolution movement heal resolver preserves the current-turn stale-choice fence", () => {
  const state: Record<string, unknown> = {
    turn_seq: 21,
    pending_heal_listener_resume: {
      kind: "resume_resolution_queue",
      seat: 1,
      turn_seq: 20,
    },
  };

  assertThrows(
    () => runtimeV02ResolveResolutionMovementHealListenerChoice(
      state,
      1,
      "choice-1",
      [],
    ),
    "tcg_v0_2_heal_live_resume_turn_stale",
  );
});

Deno.test("resolution movement heal resolver validates the preserved actor seat before touching choice state", () => {
  const state: Record<string, unknown> = {
    turn_seq: 21,
    pending_heal_listener_resume: {
      kind: "resume_resolution_queue",
      seat: 3,
      turn_seq: 21,
    },
  };

  assertThrows(
    () => runtimeV02ResolveResolutionMovementHealListenerChoice(
      state,
      1,
      "choice-1",
      [],
    ),
    "tcg_v0_2_heal_live_resume_seat_invalid",
  );
});
