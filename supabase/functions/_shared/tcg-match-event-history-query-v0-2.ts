import { runtimeV02PreviousOpponentTurn } from "./tcg-match-turn-history-v0-2.ts";

export type RuntimeV02EventHistorySeat = 1 | 2;
export type RuntimeV02EventOccurredWindow = "current_turn" | "previous_opponent_turn";

export type RuntimeV02EventOccurredRequirement = {
  predicate: "event_occurred";
  event: string;
  controller: string;
  window: RuntimeV02EventOccurredWindow;
  min_count: number;
};

export type RuntimeV02EventOccurredEvaluation = {
  predicate: "event_occurred";
  matched: boolean;
  event: string;
  controller: string;
  window: RuntimeV02EventOccurredWindow;
  target_turn: number | null;
  required_count: number;
  actual_count: number;
};

function objectRecord(value: unknown, error: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(error);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, error: string): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) throw new Error(error);
  return result;
}

function seat(value: unknown, error: string): RuntimeV02EventHistorySeat {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function positiveInteger(value: unknown, error: string): number {
  const result = Number(value);
  if (!Number.isInteger(result) || result < 1) throw new Error(error);
  return result;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: readonly string[],
): void {
  const allowedSet = new Set(allowed);
  const extra = Object.keys(value).find((key) => !allowedSet.has(key));
  if (extra) throw new Error(`tcg_v0_2_event_history_requirement_field_unsupported:${extra}`);
}

export function normalizeRuntimeV02EventOccurredRequirement(
  raw: unknown,
): RuntimeV02EventOccurredRequirement {
  const value = objectRecord(raw, "tcg_v0_2_event_history_requirement_invalid");
  rejectUnsupportedFields(
    value,
    ["predicate", "event", "controller", "window", "min_count"],
  );
  if (value.predicate !== "event_occurred") {
    throw new Error("tcg_v0_2_event_history_predicate_invalid");
  }
  const event = requiredString(value.event, "tcg_v0_2_event_history_event_required");
  const controller = value.controller == null
    ? "self"
    : requiredString(
      value.controller,
      "tcg_v0_2_event_history_controller_required",
    );
  const window = value.window == null
    ? "current_turn"
    : requiredString(
      value.window,
      "tcg_v0_2_event_history_window_required",
    );
  if (window !== "current_turn" && window !== "previous_opponent_turn") {
    throw new Error("tcg_v0_2_event_history_window_unsupported");
  }
  const minCount = value.min_count == null
    ? 1
    : positiveInteger(
      value.min_count,
      "tcg_v0_2_event_history_min_count_invalid",
    );
  return {
    predicate: "event_occurred",
    event,
    controller,
    window,
    min_count: minCount,
  };
}

function currentTurn(state: Record<string, unknown>): number {
  return positiveInteger(
    state.turn_seq,
    "tcg_v0_2_event_history_current_turn_invalid",
  );
}

function effectEvents(state: Record<string, unknown>): Record<string, unknown>[] {
  if (state.effect_events == null) return [];
  if (!Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_event_history_events_invalid");
  }
  return state.effect_events.map((entry) =>
    objectRecord(entry, "tcg_v0_2_event_history_event_record_invalid")
  );
}

function compatibilityCount(
  state: Record<string, unknown>,
  requirement: RuntimeV02EventOccurredRequirement,
  controllerSeat: RuntimeV02EventHistorySeat,
  targetTurn: number | null,
): number {
  if (
    requirement.window !== "current_turn" ||
    requirement.event !== "device_resolved" ||
    targetTurn == null
  ) return 0;
  const flagsRoot = state.turn_flags == null
    ? {}
    : objectRecord(state.turn_flags, "tcg_v0_2_event_history_turn_flags_invalid");
  const flags = flagsRoot[String(controllerSeat)] == null
    ? {}
    : objectRecord(
      flagsRoot[String(controllerSeat)],
      "tcg_v0_2_event_history_controller_flags_invalid",
    );
  return Number(flags.device_turn ?? -1) === targetTurn ? 1 : 0;
}

/**
 * Shared event-history predicate owner.
 *
 * Callers resolve controller tokens to exact seats before evaluation. The history
 * owner resolves windows and counts immutable event records; it never decides
 * card targeting or mutates match state.
 */
export function evaluateRuntimeV02EventOccurredRequirement(
  state: Record<string, unknown>,
  perspectiveSeatValue: unknown,
  eventControllerSeatValue: unknown,
  rawRequirement: RuntimeV02EventOccurredRequirement,
): RuntimeV02EventOccurredEvaluation {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("tcg_v0_2_event_history_state_required");
  }
  const perspectiveSeat = seat(
    perspectiveSeatValue,
    "tcg_v0_2_event_history_perspective_seat_invalid",
  );
  const eventControllerSeat = seat(
    eventControllerSeatValue,
    "tcg_v0_2_event_history_event_controller_seat_invalid",
  );
  const requirement = normalizeRuntimeV02EventOccurredRequirement(rawRequirement);
  const targetTurn = requirement.window === "current_turn"
    ? currentTurn(state)
    : runtimeV02PreviousOpponentTurn(state, perspectiveSeat);

  const recorded = targetTurn == null
    ? 0
    : effectEvents(state).filter((entry) => {
      if (String(entry.event || "") !== requirement.event) return false;
      if (Number(entry.turn_seq) !== targetTurn) return false;
      const controller = Number(entry.controller_seat ?? entry.seat);
      return controller === eventControllerSeat;
    }).length;

  const actual = Math.max(
    recorded,
    compatibilityCount(
      state,
      requirement,
      eventControllerSeat,
      targetTurn,
    ),
  );

  return {
    predicate: "event_occurred",
    matched: actual >= requirement.min_count,
    event: requirement.event,
    controller: requirement.controller,
    window: requirement.window,
    target_turn: targetTurn,
    required_count: requirement.min_count,
    actual_count: actual,
  };
}
