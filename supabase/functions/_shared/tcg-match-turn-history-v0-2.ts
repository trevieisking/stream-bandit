export type RuntimeV02TurnHistorySeat = 1 | 2;

export type RuntimeV02TurnOwnerRecord = {
  turn_seq: number;
  active_seat: RuntimeV02TurnHistorySeat;
};

type RuntimeV02TurnHistoryState = Record<string, unknown> & {
  turn_seq?: unknown;
  active_seat?: unknown;
  first_player_seat?: unknown;
  turn_owner_history?: unknown;
};

function seat(value: unknown, error: string): RuntimeV02TurnHistorySeat {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function turn(value: unknown, error: string): number {
  const result = Number(value);
  if (!Number.isInteger(result) || result < 1) throw new Error(error);
  return result;
}

function explicitHistory(state: RuntimeV02TurnHistoryState): RuntimeV02TurnOwnerRecord[] {
  if (state.turn_owner_history == null) return [];
  if (!Array.isArray(state.turn_owner_history)) {
    throw new Error("tcg_v0_2_turn_history_invalid");
  }
  const records = state.turn_owner_history.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("tcg_v0_2_turn_history_record_invalid");
    }
    const value = raw as Record<string, unknown>;
    return {
      turn_seq: turn(value.turn_seq, "tcg_v0_2_turn_history_turn_invalid"),
      active_seat: seat(value.active_seat, "tcg_v0_2_turn_history_seat_invalid"),
    };
  });
  for (let index = 1; index < records.length; index += 1) {
    if (records[index].turn_seq <= records[index - 1].turn_seq) {
      throw new Error("tcg_v0_2_turn_history_order_invalid");
    }
  }
  return records;
}

function legacyAlternatingHistory(
  state: RuntimeV02TurnHistoryState,
  throughTurn: number,
): RuntimeV02TurnOwnerRecord[] {
  const first = seat(
    state.first_player_seat,
    "tcg_v0_2_turn_history_first_player_required",
  );
  const out: RuntimeV02TurnOwnerRecord[] = [];
  for (let seq = 1; seq <= throughTurn; seq += 1) {
    const odd = seq % 2 === 1;
    out.push({
      turn_seq: seq,
      active_seat: odd ? first : first === 1 ? 2 : 1,
    });
  }
  return out;
}

/**
 * Canonical turn-owner history writer.
 *
 * Turn lifecycle owners call this exactly when a new turn becomes active.
 * Re-recording the same turn/seat is idempotent; conflicting ownership fails closed.
 */
export function runtimeV02RecordTurnOwner(
  state: RuntimeV02TurnHistoryState,
  turnSeqValue: unknown,
  activeSeatValue: unknown,
): RuntimeV02TurnOwnerRecord {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("tcg_v0_2_turn_history_state_required");
  }
  const record: RuntimeV02TurnOwnerRecord = {
    turn_seq: turn(turnSeqValue, "tcg_v0_2_turn_history_turn_invalid"),
    active_seat: seat(activeSeatValue, "tcg_v0_2_turn_history_seat_invalid"),
  };
  const history = explicitHistory(state);
  const existing = history.find((item) => item.turn_seq === record.turn_seq);
  if (existing) {
    if (existing.active_seat !== record.active_seat) {
      throw new Error("tcg_v0_2_turn_history_owner_conflict");
    }
    return { ...existing };
  }
  if (history.length && record.turn_seq <= history[history.length - 1].turn_seq) {
    throw new Error("tcg_v0_2_turn_history_append_only");
  }
  const next = [...history, record];
  state.turn_owner_history = next.map((item) => ({ ...item }));
  return { ...record };
}

/**
 * Returns the most recent prior turn controlled by the opposing seat.
 *
 * Explicit history is authoritative and supports extra turns. Legacy states created
 * before this owner existed fall back to alternating first-player parity; those
 * states predate structured Timefold support, so the fallback cannot erase a
 * previously recorded extra turn.
 */
export function runtimeV02PreviousOpponentTurn(
  state: RuntimeV02TurnHistoryState,
  controllerSeatValue: unknown,
): number | null {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("tcg_v0_2_turn_history_state_required");
  }
  const controller = seat(
    controllerSeatValue,
    "tcg_v0_2_turn_history_controller_invalid",
  );
  const currentTurn = turn(
    state.turn_seq,
    "tcg_v0_2_turn_history_current_turn_invalid",
  );
  const history = explicitHistory(state);
  const records = history.length
    ? history
    : legacyAlternatingHistory(state, currentTurn);
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    if (record.turn_seq >= currentTurn) continue;
    if (record.active_seat !== controller) return record.turn_seq;
  }
  return null;
}

export function runtimeV02TurnOwnerAt(
  state: RuntimeV02TurnHistoryState,
  turnSeqValue: unknown,
): RuntimeV02TurnHistorySeat | null {
  const target = turn(
    turnSeqValue,
    "tcg_v0_2_turn_history_query_turn_invalid",
  );
  const history = explicitHistory(state);
  if (history.length) {
    return history.find((record) => record.turn_seq === target)?.active_seat ?? null;
  }
  return legacyAlternatingHistory(state, target)[target - 1]?.active_seat ?? null;
}
