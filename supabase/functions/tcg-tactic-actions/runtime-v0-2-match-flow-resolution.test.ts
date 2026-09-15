import {
  runtimeV02ContinueResolution,
  type RuntimeV02ResolutionState,
} from "../_shared/tcg-match-flow-resolution-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function card(uid: string) {
  return { uid, card_id: uid };
}

function creature(uid: string) {
  return { stack: [card(uid)], damage: 0, essence: [] };
}

function state(overrides: Record<string, unknown> = {}): RuntimeV02ResolutionState {
  return {
    phase: "resolution",
    active_seat: 1,
    pending_resolutions: [],
    resume_after_resolution: null,
    deckout_loser: null,
    result: null,
    players: {
      "1": {
        rewards: [card("p1-reward")],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [card("p2-reward")],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
    ...overrides,
  };
}

Deno.test("Match Flow keeps resolution blocked while queued work remains", () => {
  const s = state({
    pending_resolutions: [{ kind: "take_reward", seat: 1, count: 1 }],
    resume_after_resolution: "turn_advance",
    players: {
      "1": {
        rewards: [],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [card("p2-reward")],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
  });

  const result = runtimeV02ContinueResolution(s);

  assert(result.status === "pending_resolution", "queued work did not block continuation");
  assert(result.pending_count === 1, "pending resolution count changed");
  assert(s.phase === "resolution", "queued work changed phase");
  assert(s.resume_after_resolution === "turn_advance", "queued work consumed resume token");
  assert(s.result == null, "queued work evaluated terminal state too early");
});

Deno.test("Match Flow terminal preflight wins before consuming the resume token", () => {
  const s = state({
    resume_after_resolution: "turn_advance",
    players: {
      "1": {
        rewards: [],
        vanguard: creature("p1-v"),
        reserve: [null, null, null, null],
      },
      "2": {
        rewards: [card("p2-reward")],
        vanguard: creature("p2-v"),
        reserve: [null, null, null, null],
      },
    },
  });

  const result = runtimeV02ContinueResolution(s);

  assert(result.status === "terminal", "terminal resolution did not stop");
  assert(s.phase === "complete", "terminal winner evaluation changed");
  assert(s.resume_after_resolution === "turn_advance", "terminal preflight consumed resume token");
  const terminal = s.result as { winner_seat: number; reasons: string[] };
  assert(terminal.winner_seat === 1, "terminal winner changed");
  assert(JSON.stringify(terminal.reasons) === JSON.stringify(["all_rewards_taken"]), "terminal reason changed");
});

Deno.test("Match Flow emits an Aftermath resume decision for the active seat", () => {
  const s = state({ active_seat: 2, resume_after_resolution: "aftermath" });

  const result = runtimeV02ContinueResolution(s);

  assert(result.status === "resume_aftermath", "Aftermath resume route changed");
  assert(result.seat === 2, "Aftermath resume seat changed");
  assert(s.resume_after_resolution === null, "Aftermath resume token was not consumed");
  assert(s.phase === "resolution", "Match Flow executed Aftermath instead of returning a decision");
});

Deno.test("Match Flow emits a turn-advance resume decision without advancing the turn itself", () => {
  const s = state({ resume_after_resolution: "turn_advance" });

  const result = runtimeV02ContinueResolution(s);

  assert(result.status === "resume_turn_advance", "turn resume route changed");
  assert(s.resume_after_resolution === null, "turn resume token was not consumed");
  assert(s.phase === "resolution", "Match Flow executed turn advancement itself");
  assert(s.active_seat === 1, "Match Flow changed active seat during resolution routing");
});

Deno.test("Match Flow returns to play when no specialist resume is pending", () => {
  const s = state({ resume_after_resolution: "legacy_unknown_resume" });

  const result = runtimeV02ContinueResolution(s);

  assert(result.status === "play", "empty resolution did not return to play");
  assert(s.phase === "play", "play phase transition changed");
  assert(s.resume_after_resolution === null, "fallback resume token was not cleared");
});

Deno.test("Match Flow normalizes a missing resolution queue without inventing mechanic work", () => {
  const s = state({ pending_resolutions: undefined });

  const result = runtimeV02ContinueResolution(s);

  assert(result.status === "play", "missing empty queue did not preserve ordinary continuation");
  assert(Array.isArray(s.pending_resolutions), "missing resolution queue was not normalized");
  assert((s.pending_resolutions as unknown[]).length === 0, "normalization invented resolution work");
});

Deno.test("Match Flow rejects malformed resolution queue state before lifecycle mutation", () => {
  const s = state({ pending_resolutions: { bad: true }, resume_after_resolution: "turn_advance" });
  const before = JSON.stringify(s);
  let message = "";

  try {
    runtimeV02ContinueResolution(s);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }

  assert(message === "tcg_v0_2_match_flow_resolution_queue_invalid", "malformed queue guard changed");
  assert(JSON.stringify(s) === before, "malformed queue mutated lifecycle state");
});
