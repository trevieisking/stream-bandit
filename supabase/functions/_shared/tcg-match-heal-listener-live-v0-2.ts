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

export type RuntimeV02HealListenerFlow = {
  status: "complete" | "player_choice_required";
  continuation: RuntimeV02HealListenerContinuation | null;
  pending_choice: RuntimeV02PendingHealListenerChoice | null;
};

export type RuntimeV02AttackHealListenerFlow = RuntimeV02HealListenerFlow;
export type RuntimeV02AbilityHealListenerFlow = RuntimeV02HealListenerFlow;

export type RuntimeV02AttackHealListenerChoiceResolution =
  RuntimeV02HealListenerChoiceResolution & {
    resume_ready: boolean;
    resume_seat: 1 | 2 | null;
  };

export type RuntimeV02AbilityHealListenerChoiceResolution =
  RuntimeV02HealListenerChoiceResolution & {
    resume_ready: boolean;
    resume_seat: 1 | 2 | null;
  };

type RuntimeV02HealListenerResumeKind =
  | "scan_defeats_then_aftermath"
  | "return_to_play";

type RuntimeV02HealListenerResume = {
  kind: RuntimeV02HealListenerResumeKind;
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
  expectedKind: RuntimeV02HealListenerResumeKind,
): RuntimeV02HealListenerResume {
  const raw = objectRecord(state.pending_heal_listener_resume);
  if (!raw) throw new Error("tcg_v0_2_heal_live_resume_required");
  const kind = String(raw.kind || "");
  if (kind !== expectedKind) {
    throw new Error("tcg_v0_2_heal_live_resume_kind_invalid");
  }
  const resumeTurn = Number(raw.turn_seq);
  const currentTurn = turn(state);
  if (!Number.isInteger(resumeTurn) || resumeTurn !== currentTurn) {
    throw new Error("tcg_v0_2_heal_live_resume_turn_stale");
  }
  return {
    kind: expectedKind,
    seat: seat(raw.seat, "tcg_v0_2_heal_live_resume_seat_invalid"),
    turn_seq: resumeTurn,
  };
}

function beginHealListenerContinuation(
  state: Record<string, unknown>,
  packetIds: string[],
  resumeSeat: 1 | 2,
  resumeKind: RuntimeV02HealListenerResumeKind,
): RuntimeV02HealListenerFlow {
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
    kind: resumeKind,
    seat: resumeSeat,
    turn_seq: turn(state),
  } satisfies RuntimeV02HealListenerResume;
  return {
    status: "player_choice_required",
    continuation,
    pending_choice: pending,
  };
}

function resolveHealListenerChoiceWithResume(
  state: Record<string, unknown>,
  actorSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  expectedKind: RuntimeV02HealListenerResumeKind,
): RuntimeV02HealListenerChoiceResolution & {
  resume_ready: boolean;
  resume_seat: 1 | 2 | null;
} {
  const resume = resumeState(state, expectedKind);
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
  return beginHealListenerContinuation(
    state,
    packetIds,
    attackSeat,
    "scan_defeats_then_aftermath",
  );
}

/**
 * Starts the exact same canonical after_heal_packet listener continuation for
 * an active-Ability heal boundary. If a private listener choice is required,
 * the shared resume receipt records only that tcg-match-actions must return the
 * actor to ordinary play after the canonical packet queue is fully resolved.
 * This module deliberately does not mutate phase or own any post-Ability rule.
 */
export function runtimeV02BeginAbilityHealListenerContinuation(
  state: Record<string, unknown>,
  packetIds: string[],
  abilitySeat: 1 | 2,
): RuntimeV02AbilityHealListenerFlow {
  return beginHealListenerContinuation(
    state,
    packetIds,
    abilitySeat,
    "return_to_play",
  );
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
  return resolveHealListenerChoiceWithResume(
    state,
    actorSeat,
    choiceId,
    choiceIds,
    "scan_defeats_then_aftermath",
  );
}

/**
 * Resolves one private after-heal listener choice for an active Ability. The
 * shared listener/choice owners remain unchanged; this wrapper only validates
 * the Ability-specific resume receipt and releases the actor seat when the full
 * canonical queue is complete so tcg-match-actions can restore phase "play".
 */
export function runtimeV02ResolveAbilityHealListenerChoice(
  state: Record<string, unknown>,
  actorSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
): RuntimeV02AbilityHealListenerChoiceResolution {
  return resolveHealListenerChoiceWithResume(
    state,
    actorSeat,
    choiceId,
    choiceIds,
    "return_to_play",
  );
}
