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

export type RuntimeV02SetupReadyState = Record<string, unknown> & {
  phase?: unknown;
  first_player_seat?: unknown;
  setup_turn_seat?: unknown;
  active_seat?: unknown;
  turn_seq?: unknown;
  personal_turns?: unknown;
  setup_ready?: unknown;
  players?: unknown;
  log?: unknown;
};

export type RuntimeV02SetupDistributionPlan = {
  active_seat: RuntimeV02MatchFlowSeat;
  reward_count_each: 6;
  opening_draw_count: 1;
};

export type RuntimeV02SetupDistribution = (
  plan: RuntimeV02SetupDistributionPlan,
) => void;

export type RuntimeV02SetupReadyResult =
  | {
    ok: true;
    all_ready: false;
    active_seat: null;
  }
  | {
    ok: true;
    all_ready: true;
    active_seat: RuntimeV02MatchFlowSeat;
    distribution: RuntimeV02SetupDistributionPlan;
  }
  | {
    ok: false;
    error:
      | "setup_not_your_turn"
      | "vanguard_required"
      | "deck_depleted_before_rewards"
      | "deck_depleted_before_start_draw";
  };

function isSeat(value: unknown): value is RuntimeV02MatchFlowSeat {
  return value === 1 || value === 2;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
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

/**
 * Canonical Match Flow owner for setup readiness and the setup -> play boundary.
 *
 * Match Flow owns readiness, setup order, deck-count preconditions and lifecycle
 * progression. It never moves cards itself. On the final setup confirmation it
 * calls exactly one injected distribution transaction; the caller must route that
 * transaction through the canonical Card-Zone owner. All lifecycle mutation is
 * delayed until that transaction returns successfully, preventing half-advanced
 * setup state when distribution fails.
 */
export function runtimeV02ApplySetupReady(
  state: RuntimeV02SetupReadyState,
  controllerSeat: RuntimeV02MatchFlowSeat,
  distribute?: RuntimeV02SetupDistribution,
): RuntimeV02SetupReadyResult {
  if (
    !state ||
    typeof state !== "object" ||
    Array.isArray(state) ||
    !isSeat(controllerSeat) ||
    state.phase !== "setup" ||
    state.setup_turn_seat !== controllerSeat
  ) {
    return { ok: false, error: "setup_not_your_turn" };
  }

  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!players || !player) {
    throw new Error("tcg_v0_2_match_flow_players_required");
  }
  if (!player.vanguard) {
    return { ok: false, error: "vanguard_required" };
  }

  const setupReady = objectRecord(state.setup_ready);
  if (!setupReady) {
    throw new Error("tcg_v0_2_match_flow_setup_ready_required");
  }
  if (!Array.isArray(state.log)) {
    throw new Error("tcg_v0_2_match_flow_log_required");
  }

  if (controllerSeat === 1) {
    setupReady["1"] = true;
    state.setup_turn_seat = 2;
    state.log.push("Seat 1 setup locked.");
    return { ok: true, all_ready: false, active_seat: null };
  }

  const firstPlayerSeat = state.first_player_seat;
  if (!isSeat(firstPlayerSeat)) {
    throw new Error("tcg_v0_2_match_flow_first_player_seat_invalid");
  }
  const p1 = objectRecord(players["1"]);
  const p2 = objectRecord(players["2"]);
  if (!p1 || !p2 || !Array.isArray(p1.deck) || !Array.isArray(p2.deck)) {
    throw new Error("tcg_v0_2_match_flow_setup_decks_required");
  }
  if (p1.deck.length < 6 || p2.deck.length < 6) {
    return { ok: false, error: "deck_depleted_before_rewards" };
  }

  const activePlayer = firstPlayerSeat === 1 ? p1 : p2;
  if ((activePlayer.deck as unknown[]).length < 7) {
    return { ok: false, error: "deck_depleted_before_start_draw" };
  }

  const personalTurns = objectRecord(state.personal_turns);
  if (!personalTurns) {
    throw new Error("tcg_v0_2_match_flow_personal_turns_required");
  }
  if (typeof distribute !== "function") {
    throw new Error("tcg_v0_2_match_flow_setup_distribution_required");
  }

  const distribution: RuntimeV02SetupDistributionPlan = {
    active_seat: firstPlayerSeat,
    reward_count_each: 6,
    opening_draw_count: 1,
  };

  distribute(distribution);

  setupReady["2"] = true;
  state.phase = "play";
  state.setup_turn_seat = null;
  state.active_seat = firstPlayerSeat;
  state.turn_seq = 1;
  personalTurns[String(firstPlayerSeat)] = 1;
  state.log.push(
    `Seat 2 setup locked. Seat ${firstPlayerSeat} begins turn 1 and draws.`,
  );

  return {
    ok: true,
    all_ready: true,
    active_seat: firstPlayerSeat,
    distribution,
  };
}
