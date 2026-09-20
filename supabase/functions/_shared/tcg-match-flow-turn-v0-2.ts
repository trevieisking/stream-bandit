import {
  runtimeV02EvaluateWinner,
  type RuntimeV02MatchFlowSeat,
  type RuntimeV02TerminalState,
} from "./tcg-match-flow-engine-v0-2.ts";

export type RuntimeV02TurnAdvanceState = RuntimeV02TerminalState & {
  phase?: unknown;
  active_seat?: unknown;
  turn_seq?: unknown;
  personal_turns?: unknown;
  log?: unknown;
};

export type RuntimeV02TurnDrawPlan = {
  controller_seat: RuntimeV02MatchFlowSeat;
  card_uid: string;
  source_action_id: "turn_start_draw";
};

export type RuntimeV02TurnDraw = (plan: RuntimeV02TurnDrawPlan) => void;

export type RuntimeV02TurnAdvanceResult =
  | {
    status: "terminal";
    active_seat: RuntimeV02MatchFlowSeat;
    turn_seq: number;
  }
  | {
    status: "deckout";
    active_seat: RuntimeV02MatchFlowSeat;
    turn_seq: number;
    deckout_loser: RuntimeV02MatchFlowSeat;
  }
  | {
    status: "advanced";
    active_seat: RuntimeV02MatchFlowSeat;
    turn_seq: number;
    personal_turn: number;
    draw: RuntimeV02TurnDrawPlan;
  };

function isSeat(value: unknown): value is RuntimeV02MatchFlowSeat {
  return value === 1 || value === 2;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredTurn(value: unknown): number {
  const turn = Number(value);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_match_flow_turn_seq_invalid");
  }
  return turn;
}

function requiredCardUid(value: unknown): string {
  const uid = typeof value === "string" ? value.trim() : "";
  if (!uid) throw new Error("tcg_v0_2_match_flow_turn_draw_card_uid_required");
  return uid;
}

/**
 * Canonical Match Flow owner for ordinary turn progression.
 *
 * Match Flow owns terminal preflight, active-seat rotation, turn sequence,
 * personal-turn counters, deckout timing and the turn-start lifecycle log.
 * It never moves the drawn card. The caller injects exactly one Card-Zone draw
 * transaction for a non-empty deck. Lifecycle mutation is committed only after
 * that transaction succeeds, so a Card-Zone failure cannot leave a half-started
 * turn. The existing deckout behavior is preserved: the next seat becomes active,
 * its turn counters advance, then deckout is recorded and terminal state evaluated.
 */
export function runtimeV02AdvanceTurn(
  state: RuntimeV02TurnAdvanceState,
  draw: RuntimeV02TurnDraw,
): RuntimeV02TurnAdvanceResult {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("tcg_v0_2_match_flow_turn_state_required");
  }

  const currentSeat = state.active_seat;
  if (!isSeat(currentSeat)) {
    throw new Error("tcg_v0_2_match_flow_active_seat_invalid");
  }
  const currentTurn = requiredTurn(state.turn_seq);

  if (runtimeV02EvaluateWinner(state)) {
    return {
      status: "terminal",
      active_seat: currentSeat,
      turn_seq: currentTurn,
    };
  }

  const players = objectRecord(state.players);
  const personalTurns = objectRecord(state.personal_turns);
  if (!players || !personalTurns) {
    throw new Error("tcg_v0_2_match_flow_turn_players_required");
  }
  if (!Array.isArray(state.log)) {
    throw new Error("tcg_v0_2_match_flow_log_required");
  }

  const nextSeat: RuntimeV02MatchFlowSeat = currentSeat === 1 ? 2 : 1;
  const nextPlayer = objectRecord(players[String(nextSeat)]);
  if (!nextPlayer || !Array.isArray(nextPlayer.deck)) {
    throw new Error("tcg_v0_2_match_flow_turn_deck_required");
  }

  const nextTurn = currentTurn + 1;
  const nextPersonalTurn = Number(personalTurns[String(nextSeat)] || 0) + 1;
  if (!Number.isInteger(nextPersonalTurn) || nextPersonalTurn < 1) {
    throw new Error("tcg_v0_2_match_flow_personal_turn_invalid");
  }

  if (nextPlayer.deck.length === 0) {
    state.active_seat = nextSeat;
    state.turn_seq = nextTurn;
    personalTurns[String(nextSeat)] = nextPersonalTurn;
    state.deckout_loser = nextSeat;
    runtimeV02EvaluateWinner(state);
    return {
      status: "deckout",
      active_seat: nextSeat,
      turn_seq: nextTurn,
      deckout_loser: nextSeat,
    };
  }

  if (typeof draw !== "function") {
    throw new Error("tcg_v0_2_match_flow_turn_draw_required");
  }
  const first = nextPlayer.deck[0] as Record<string, unknown> | null | undefined;
  const plan: RuntimeV02TurnDrawPlan = {
    controller_seat: nextSeat,
    card_uid: requiredCardUid(first?.uid),
    source_action_id: "turn_start_draw",
  };

  draw(plan);

  state.active_seat = nextSeat;
  state.turn_seq = nextTurn;
  personalTurns[String(nextSeat)] = nextPersonalTurn;
  state.phase = "play";
  state.log.push(`Seat ${nextSeat} begins personal turn ${nextPersonalTurn}.`);

  return {
    status: "advanced",
    active_seat: nextSeat,
    turn_seq: nextTurn,
    personal_turn: nextPersonalTurn,
    draw: plan,
  };
}
