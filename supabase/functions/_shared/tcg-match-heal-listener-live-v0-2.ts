import {
  continueRuntimeV02AfterHealPackets,
  type RuntimeV02HealListenerContinuation,
} from "./tcg-match-heal-listener-continuation-v0-2.ts";
import {
  runtimeV02InstallHealListenerChoice,
  runtimeV02PendingHealListenerChoiceView,
  runtimeV02ResolveHealListenerChoice,
  type RuntimeV02HealListenerChoiceResolution,
  type RuntimeV02PendingHealListenerChoice,
} from "./tcg-match-heal-listener-choice-v0-2.ts";

export { runtimeV02PendingHealListenerChoiceView };
export type { RuntimeV02PendingHealListenerChoice };

export type RuntimeV02AttackHealListenerFlow = {
  status: "complete" | "player_choice_required";
  continuation: RuntimeV02HealListenerContinuation | null;
  pending_choice: RuntimeV02PendingHealListenerChoice | null;
};

export type RuntimeV02AttackHealListenerChoiceResolution =
  RuntimeV02HealListenerChoiceResolution & {
    resume_ready: boolean;
    resume_seat: 1 | 2 | null;
  };

type RuntimeV02AttackHealListenerResume = {
  kind: "scan_defeats_then_aftermath";
  seat: 1 | 2;
  turn_seq: number;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_heal_live_turn_seq_invalid");
  }
  return value;
}

function resumeState(
  state: Record<string, unknown>,
): RuntimeV02AttackHealListenerResume {
  const raw = objectRecord(state.pending_heal_listener_resume);
  if (!raw) throw new Error("tcg_v0_2_heal_live_resume_required");
  if (String(raw.kind || "") !== "scan_defeats_then_aftermath") {
    throw new Error("tcg_v0_2_heal_live_resume_kind_invalid");
  }
  const resumeTurn = Number(raw.turn_seq);
  const currentTurn = turn(state);
  if (!Number.isInteger(resumeTurn) || resumeTurn !== currentTurn) {
    throw new Error("tcg_v0_2_heal_live_resume_turn_stale");
  }
  return {
    kind: "scan_defeats_then_aftermath",
    seat: seat(raw.seat, "tcg_v0_2_heal_live_resume_seat_invalid"),
    turn_seq: resumeTurn,
  };
}

/**
 * Starts canonical after_heal_packet listener continuation for an attack-owned
 * heal boundary. This module does not own phases, defeat scanning or Aftermath;
 * tcg-match-actions remains the sole in-battle orchestration owner for those.
 */
export function runtimeV02BeginAttackHealListenerContinuation(
  state: Record<string, unknown>,
  packetIds: string[],
  attackSeat: 1 | 2,
): RuntimeV02AttackHealListenerFlow {
  if (!Array.isArray(packetIds)) {
    throw new Error("tcg_v0_2_heal_live_packet_ids_required");
  }
  if (state.pending_heal_listener_choice != null) {
    throw new Error("tcg_v0_2_heal_live_choice_already_pending");
  }
  if (state.pending_heal_listener_resume != null) {
    throw new Error("tcg_v0_2_heal_live_resume_already_pending");
  }

  if (packetIds.length === 0) {
    return { status: "complete", continuation: null, pending_choice: null };
  }

  const continuation = continueRuntimeV02AfterHealPackets(state, packetIds);
  if (!continuation) {
    throw new Error("tcg_v0_2_heal_live_continuation_unavailable");
  }
  if (continuation.status === "complete") {
    return { status: "complete", continuation, pending_choice: null };
  }

  const pending = runtimeV02InstallHealListenerChoice(state, continuation);
  state.pending_heal_listener_resume = {
    kind: "scan_defeats_then_aftermath",
    seat: attackSeat,
    turn_seq: turn(state),
  } satisfies RuntimeV02AttackHealListenerResume;
  return {
    status: "player_choice_required",
    continuation,
    pending_choice: pending,
  };
}

/**
 * Resolves one private after-heal listener choice. If the choice owner resumes
 * into another deferred listener, the attack resume receipt is preserved. Only
 * when the entire canonical packet queue is clear is the receipt released back
 * to tcg-match-actions so it can scan defeats and run the attacker's Aftermath.
 */
export function runtimeV02ResolveAttackHealListenerChoice(
  state: Record<string, unknown>,
  actorSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
): RuntimeV02AttackHealListenerChoiceResolution {
  const resume = resumeState(state);
  const resolution = runtimeV02ResolveHealListenerChoice(
    state,
    actorSeat,
    choiceId,
    choiceIds,
  );
  if (resolution.pending_choice) {
    return {
      ...resolution,
      resume_ready: false,
      resume_seat: null,
    };
  }

  delete state.pending_heal_listener_resume;
  return {
    ...resolution,
    resume_ready: true,
    resume_seat: resume.seat,
  };
}
