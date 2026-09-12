export type RuntimeV02HiddenInformationZone = "deck_top" | "deck";

export type RuntimeV02HiddenInformationView = {
  turn_seq: number;
  controller_seat: 1 | 2;
  zone: RuntimeV02HiddenInformationZone;
};

const LEDGER_KEY = "runtime_hidden_information_views_v0_2";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function turnSeq(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_hidden_information_turn_seq_invalid");
  }
  return value;
}

function seat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error("tcg_v0_2_hidden_information_controller_seat_invalid");
  }
  return value;
}

function zone(value: unknown): RuntimeV02HiddenInformationZone {
  if (value !== "deck_top" && value !== "deck") {
    throw new Error("tcg_v0_2_hidden_information_zone_invalid");
  }
  return value;
}

function normalizeEntry(raw: unknown, index: number): RuntimeV02HiddenInformationView {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_hidden_information_entry_invalid:${index}`);
  const allowedKeys = new Set(["turn_seq", "controller_seat", "zone"]);
  const unsupportedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupportedKey) {
    throw new Error(`tcg_v0_2_hidden_information_entry_field_unsupported:${index}:${unsupportedKey}`);
  }
  const entryTurn = value.turn_seq;
  if (typeof entryTurn !== "number" || !Number.isInteger(entryTurn) || entryTurn < 0) {
    throw new Error(`tcg_v0_2_hidden_information_entry_turn_invalid:${index}`);
  }
  return {
    turn_seq: entryTurn,
    controller_seat: seat(value.controller_seat),
    zone: zone(value.zone),
  };
}

function ledger(state: Record<string, unknown>): RuntimeV02HiddenInformationView[] {
  const raw = state[LEDGER_KEY];
  if (raw === null || raw === undefined) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_hidden_information_ledger_invalid");
  return raw.map((entry, index) => normalizeEntry(entry, index));
}

/**
 * Records only the fact that a seat viewed its deck/deck-top during the current
 * turn. No card uid, card id, ordering, choice option or other hidden value is
 * stored. Entries are de-duplicated and old-turn entries are pruned whenever a
 * new view is recorded.
 */
export function recordRuntimeV02HiddenInformationView(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  rawZone: RuntimeV02HiddenInformationZone,
): RuntimeV02HiddenInformationView[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  const normalizedZone = zone(rawZone);
  const current = ledger(state).filter((entry) => entry.turn_seq === currentTurn);
  if (!current.some((entry) =>
    entry.controller_seat === controller && entry.zone === normalizedZone
  )) {
    current.push({ turn_seq: currentTurn, controller_seat: controller, zone: normalizedZone });
  }
  state[LEDGER_KEY] = current.map((entry) => ({ ...entry }));
  return current.map((entry) => ({ ...entry }));
}

/**
 * Reads only this seat's current-turn hidden-information view metadata.
 * Old turns and the other seat are never returned.
 */
export function runtimeV02CurrentTurnHiddenInformationViews(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02HiddenInformationView[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  return ledger(state)
    .filter((entry) => entry.turn_seq === currentTurn && entry.controller_seat === controller)
    .map((entry) => ({ ...entry }));
}
