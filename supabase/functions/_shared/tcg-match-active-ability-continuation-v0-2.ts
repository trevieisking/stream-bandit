import {
  runtimeV02ResumeActiveAbilitySupply,
  type RuntimeV02ActiveAbilitySupplyResume,
  type RuntimeV02ActiveAbilitySupplyResumeResolution,
} from "./tcg-match-active-ability-supply-v0-2.ts";

export type RuntimeV02ActiveAbilityContinuation =
  | RuntimeV02ActiveAbilitySupplyResume;

export type RuntimeV02ActiveAbilityContinuationResolution =
  | RuntimeV02ActiveAbilitySupplyResumeResolution;

const KEY = "runtime_v0_2_active_ability_continuation";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function currentTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_active_ability_continuation_turn_invalid");
  }
  return value;
}

export function runtimeV02InstallActiveAbilityContinuation(
  state: Record<string, unknown>,
  continuation: RuntimeV02ActiveAbilityContinuation,
): void {
  if (state[KEY] != null) {
    throw new Error("tcg_v0_2_active_ability_continuation_already_pending");
  }
  if (Number(continuation.turn_seq) !== currentTurn(state)) {
    throw new Error("tcg_v0_2_active_ability_continuation_turn_stale");
  }
  if (continuation.seat !== 1 && continuation.seat !== 2) {
    throw new Error("tcg_v0_2_active_ability_continuation_seat_invalid");
  }
  state[KEY] = structuredClone(continuation);
}

export function runtimeV02ActiveAbilityContinuationPending(
  state: Record<string, unknown>,
): boolean {
  return state[KEY] != null;
}

export function runtimeV02ReadActiveAbilityContinuation(
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityContinuation {
  const raw = objectRecord(state[KEY]);
  if (!raw) throw new Error("tcg_v0_2_active_ability_continuation_required");
  if (Number(raw.turn_seq) !== currentTurn(state)) {
    throw new Error("tcg_v0_2_active_ability_continuation_turn_stale");
  }
  if (raw.kind === "supply_after_attachment") {
    return structuredClone(raw) as RuntimeV02ActiveAbilitySupplyResume;
  }
  throw new Error(
    `tcg_v0_2_active_ability_continuation_kind_unsupported:${String(raw.kind || "")}`,
  );
}

export function runtimeV02ResumeActiveAbilityContinuation(
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityContinuationResolution {
  const continuation = runtimeV02ReadActiveAbilityContinuation(state);
  let resolved: RuntimeV02ActiveAbilityContinuationResolution;
  if (continuation.kind === "supply_after_attachment") {
    resolved = runtimeV02ResumeActiveAbilitySupply(state, continuation);
  } else {
    throw new Error("tcg_v0_2_active_ability_continuation_kind_unreachable");
  }
  delete state[KEY];
  return resolved;
}
