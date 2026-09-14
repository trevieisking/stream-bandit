import {
  runtimeV02EvaluateWinner,
  type RuntimeV02MatchFlowSeat,
  type RuntimeV02TerminalState,
} from "./tcg-match-flow-engine-v0-2.ts";

export type RuntimeV02ResolutionState = RuntimeV02TerminalState & {
  active_seat?: unknown;
  pending_resolutions?: unknown;
  resume_after_resolution?: unknown;
};

export type RuntimeV02ResolutionContinuationResult =
  | {
    status: "pending_resolution";
    pending_count: number;
  }
  | {
    status: "terminal";
  }
  | {
    status: "resume_aftermath";
    seat: RuntimeV02MatchFlowSeat;
  }
  | {
    status: "resume_turn_advance";
  }
  | {
    status: "play";
  };

function isSeat(value: unknown): value is RuntimeV02MatchFlowSeat {
  return value === 1 || value === 2;
}

function resolutionQueue(state: RuntimeV02ResolutionState): unknown[] {
  if (state.pending_resolutions == null) {
    const queue: unknown[] = [];
    state.pending_resolutions = queue;
    return queue;
  }
  if (!Array.isArray(state.pending_resolutions)) {
    throw new Error("tcg_v0_2_match_flow_resolution_queue_invalid");
  }
  return state.pending_resolutions;
}

/**
 * Canonical Match Flow owner for the empty-resolution-queue lifecycle boundary.
 *
 * Match Flow owns only the decision of whether resolution remains blocked on queued
 * work, terminates the match, resumes Aftermath, resumes turn advancement, or
 * returns to ordinary play. Reward taking, forced promotion, Defeat, Aftermath,
 * Turn, Card-Zone and listener mechanics remain with their specialist owners.
 *
 * The returned resume decision is intentionally declarative: callers must invoke
 * the corresponding specialist owner. This keeps Match Flow authoritative over
 * lifecycle routing without becoming a second gameplay-mechanic engine.
 */
export function runtimeV02ContinueResolution(
  state: RuntimeV02ResolutionState,
): RuntimeV02ResolutionContinuationResult {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("tcg_v0_2_match_flow_resolution_state_required");
  }

  const queue = resolutionQueue(state);
  if (queue.length > 0) {
    return {
      status: "pending_resolution",
      pending_count: queue.length,
    };
  }

  if (runtimeV02EvaluateWinner(state)) {
    return { status: "terminal" };
  }

  const resume = String(state.resume_after_resolution || "");
  if (resume === "aftermath" && !isSeat(state.active_seat)) {
    throw new Error("tcg_v0_2_match_flow_resolution_active_seat_invalid");
  }

  state.resume_after_resolution = null;

  if (resume === "aftermath") {
    return {
      status: "resume_aftermath",
      seat: state.active_seat as RuntimeV02MatchFlowSeat,
    };
  }
  if (resume === "turn_advance") {
    return { status: "resume_turn_advance" };
  }

  state.phase = "play";
  return { status: "play" };
}
