export type RuntimeV02MatchFlowSeat = 1 | 2;
export type RuntimeV02OpeningChoice = "first" | "second";

export type RuntimeV02OpeningChoiceState = Record<string, unknown> & {
  phase?: unknown;
  toss_winner_seat?: unknown;
  first_player_seat?: unknown;
  setup_turn_seat?: unknown;
  log?: unknown;
};

export type RuntimeV02OpeningChoiceResult =
  | {
    ok: true;
    first_player_seat: RuntimeV02MatchFlowSeat;
  }
  | {
    ok: false;
    error: "opening_choice_not_allowed" | "choice_must_be_first_or_second";
  };

function isSeat(value: unknown): value is RuntimeV02MatchFlowSeat {
  return value === 1 || value === 2;
}

/**
 * Canonical Match Flow owner for the opening toss winner's first/second choice.
 *
 * This transition owns only lifecycle state. It deliberately does not move cards,
 * place Creatures, resolve effects, or invoke any other mechanic owner.
 * Invalid requests are non-mutating so callers can preserve the existing protocol
 * errors while Match Flow becomes the single source of lifecycle truth.
 */
export function runtimeV02ApplyOpeningChoice(
  state: RuntimeV02OpeningChoiceState,
  controllerSeat: RuntimeV02MatchFlowSeat,
  rawChoice: unknown,
): RuntimeV02OpeningChoiceResult {
  if (
    !state ||
    typeof state !== "object" ||
    Array.isArray(state) ||
    !isSeat(controllerSeat) ||
    state.phase !== "opening_choice" ||
    state.toss_winner_seat !== controllerSeat
  ) {
    return { ok: false, error: "opening_choice_not_allowed" };
  }

  const choice = typeof rawChoice === "string" ? rawChoice : "";
  if (choice !== "first" && choice !== "second") {
    return { ok: false, error: "choice_must_be_first_or_second" };
  }

  if (!Array.isArray(state.log)) {
    throw new Error("tcg_v0_2_match_flow_log_required");
  }

  const firstPlayerSeat: RuntimeV02MatchFlowSeat = choice === "first"
    ? controllerSeat
    : controllerSeat === 1
    ? 2
    : 1;

  state.first_player_seat = firstPlayerSeat;
  state.phase = "setup";
  state.setup_turn_seat = 1;
  state.log.push(`Seat ${controllerSeat} chose to go ${choice}.`);

  return { ok: true, first_player_seat: firstPlayerSeat };
}
