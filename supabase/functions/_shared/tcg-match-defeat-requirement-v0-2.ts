import {
  runtimeV02CountDefeatHistory,
  type RuntimeV02DefeatHistoryQuery,
} from "./tcg-match-defeat-query-v0-2.ts";

export type RuntimeV02DefeatSeatToken = "self" | "opponent" | "any";
export type RuntimeV02DefeatHistoryWindow =
  | "current_turn"
  | "previous_turn"
  | "previous_opponent_turn"
  | "since_previous_own_turn_end"
  | "match";

export type RuntimeV02DefeatHistoryRequirement = {
  predicate: "defeat_history_count_at_least";
  window: RuntimeV02DefeatHistoryWindow;
  min_count: number;
  owner?: RuntimeV02DefeatSeatToken;
  active_turn?: RuntimeV02DefeatSeatToken;
  source_controller?: RuntimeV02DefeatSeatToken;
  where?: "vanguard" | "reserve";
  creature_uid?: string;
  card_id?: string;
  exclude_source?: boolean;
};

export type RuntimeV02DefeatHistoryRequirementContext = {
  perspective_seat: 1 | 2;
  source_creature_uid?: string | null;
};

function requiredSeat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function currentTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_defeat_requirement_turn_invalid");
  }
  return value;
}

function currentActiveSeat(state: Record<string, unknown>): 1 | 2 {
  return requiredSeat(state.active_seat, "tcg_v0_2_defeat_requirement_active_seat_invalid");
}

function opponent(seat: 1 | 2): 1 | 2 {
  return seat === 1 ? 2 : 1;
}

function seatFromToken(
  token: unknown,
  perspective: 1 | 2,
  error: string,
): 1 | 2 | null {
  const value = token == null ? "any" : String(token);
  if (value === "any") return null;
  if (value === "self") return perspective;
  if (value === "opponent") return opponent(perspective);
  throw new Error(error);
}

function optionalString(value: unknown, error: string): string | null {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function positiveInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(error);
  return number;
}

function windowQuery(
  state: Record<string, unknown>,
  perspective: 1 | 2,
  window: RuntimeV02DefeatHistoryWindow,
): RuntimeV02DefeatHistoryQuery | null {
  const turn = currentTurn(state);
  const activeSeat = currentActiveSeat(state);

  if (window === "match") return {};
  if (window === "current_turn") {
    return { min_turn_seq: turn, max_turn_seq: turn };
  }
  if (window === "previous_turn") {
    if (turn < 1) return null;
    return { min_turn_seq: turn - 1, max_turn_seq: turn - 1 };
  }
  if (window === "previous_opponent_turn") {
    // The private-alpha turn model alternates seats. This window is intentionally
    // valid only while the perspective player is the active seat, which is the
    // context used by own-turn attacks/abilities/tactics that ask about the
    // opponent's immediately preceding turn.
    if (activeSeat !== perspective || turn < 1) return null;
    return {
      min_turn_seq: turn - 1,
      max_turn_seq: turn - 1,
      active_seat: opponent(perspective),
    };
  }
  if (window === "since_previous_own_turn_end") {
    // During the perspective player's turn this covers the intervening opponent
    // turn plus the current turn so far. It fails closed outside that context.
    if (activeSeat !== perspective) return null;
    return {
      min_turn_seq: Math.max(0, turn - 1),
      max_turn_seq: turn,
    };
  }
  throw new Error(`tcg_v0_2_defeat_requirement_window_unsupported:${String(window)}`);
}

function normalizedRequirement(
  raw: RuntimeV02DefeatHistoryRequirement,
): RuntimeV02DefeatHistoryRequirement {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("tcg_v0_2_defeat_requirement_invalid");
  }
  if (raw.predicate !== "defeat_history_count_at_least") {
    throw new Error("tcg_v0_2_defeat_requirement_predicate_invalid");
  }
  const window = String(raw.window || "") as RuntimeV02DefeatHistoryWindow;
  if (![
    "current_turn",
    "previous_turn",
    "previous_opponent_turn",
    "since_previous_own_turn_end",
    "match",
  ].includes(window)) {
    throw new Error(`tcg_v0_2_defeat_requirement_window_unsupported:${window}`);
  }
  if (raw.where != null && raw.where !== "vanguard" && raw.where !== "reserve") {
    throw new Error("tcg_v0_2_defeat_requirement_zone_invalid");
  }
  return {
    ...raw,
    window,
    min_count: positiveInteger(raw.min_count, "tcg_v0_2_defeat_requirement_min_count_invalid"),
    ...(raw.creature_uid == null
      ? {}
      : { creature_uid: optionalString(raw.creature_uid, "tcg_v0_2_defeat_requirement_creature_uid_invalid")! }),
    ...(raw.card_id == null
      ? {}
      : { card_id: optionalString(raw.card_id, "tcg_v0_2_defeat_requirement_card_id_invalid")! }),
  };
}

/**
 * Generic requirement adapter over owner #34 defeat history.
 *
 * This module does not know card names or element names. Requirement evaluators
 * supply the perspective/source context and can therefore reuse the same predicate
 * for attacks, abilities, Tactics, Essence, Relics, Realms and future card sets.
 */
export function runtimeV02EvaluateDefeatHistoryRequirement(
  state: Record<string, unknown>,
  raw: RuntimeV02DefeatHistoryRequirement,
  context: RuntimeV02DefeatHistoryRequirementContext,
): boolean {
  const requirement = normalizedRequirement(raw);
  const perspective = requiredSeat(
    context?.perspective_seat,
    "tcg_v0_2_defeat_requirement_perspective_invalid",
  );
  const base = windowQuery(state, perspective, requirement.window);
  if (!base) return false;

  const ownerSeat = seatFromToken(
    requirement.owner,
    perspective,
    "tcg_v0_2_defeat_requirement_owner_invalid",
  );
  const activeSeat = seatFromToken(
    requirement.active_turn,
    perspective,
    "tcg_v0_2_defeat_requirement_active_turn_invalid",
  );
  const sourceController = seatFromToken(
    requirement.source_controller,
    perspective,
    "tcg_v0_2_defeat_requirement_source_controller_invalid",
  );
  const sourceUid = optionalString(
    context?.source_creature_uid,
    "tcg_v0_2_defeat_requirement_source_uid_invalid",
  );

  const query: RuntimeV02DefeatHistoryQuery = {
    ...base,
    ...(ownerSeat == null ? {} : { owner_seat: ownerSeat }),
    ...(activeSeat == null ? {} : { active_seat: activeSeat }),
    ...(sourceController == null ? {} : { source_controller_seat: sourceController }),
    ...(requirement.where == null ? {} : { where: requirement.where }),
    ...(requirement.creature_uid == null ? {} : { creature_uid: requirement.creature_uid }),
    ...(requirement.card_id == null ? {} : { card_id: requirement.card_id }),
    ...(requirement.exclude_source !== true || sourceUid == null
      ? {}
      : { exclude_creature_uid: sourceUid }),
  };

  return runtimeV02CountDefeatHistory(state, query) >= requirement.min_count;
}
