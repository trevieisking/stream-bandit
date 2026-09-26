export type RuntimeV02HiddenInformationZone = "deck_top" | "deck";

export type RuntimeV02HiddenInformationView = {
  turn_seq: number;
  controller_seat: 1 | 2;
  zone: RuntimeV02HiddenInformationZone;
};

export type RuntimeV02HiddenInformationSourceContext = {
  action_kind: string;
  source_controller_seat: 1 | 2;
  source_action_id: string;
  source_card_uid: string;
  source_creature_uid: string | null;
  phase: string;
};

export type RuntimeV02HiddenInformationOccurrence = {
  occurrence_id: string;
  turn_seq: number;
  controller_seat: 1 | 2;
  zone: RuntimeV02HiddenInformationZone;
  action_kind: string;
  source_controller_seat: 1 | 2;
  source_action_id: string;
  source_card_uid: string;
  source_creature_uid: string | null;
  phase: string;
};

const LEDGER_KEY = "runtime_hidden_information_views_v0_2";
const OCCURRENCE_QUEUE_KEY = "runtime_hidden_information_occurrences_v0_2";
const OCCURRENCE_SEQUENCE_KEY = "runtime_hidden_information_occurrence_seq_v0_2";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function optionalString(value: unknown, error: string): string | null {
  if (value == null) return null;
  return requiredString(value, error);
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

function normalizeSourceContext(
  raw: RuntimeV02HiddenInformationSourceContext,
): RuntimeV02HiddenInformationSourceContext {
  const value = objectRecord(raw);
  if (!value) throw new Error("tcg_v0_2_hidden_information_source_context_invalid");
  const allowedKeys = new Set([
    "action_kind",
    "source_controller_seat",
    "source_action_id",
    "source_card_uid",
    "source_creature_uid",
    "phase",
  ]);
  const unsupportedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupportedKey) {
    throw new Error(`tcg_v0_2_hidden_information_source_context_field_unsupported:${unsupportedKey}`);
  }
  return {
    action_kind: requiredString(
      value.action_kind,
      "tcg_v0_2_hidden_information_action_kind_required",
    ),
    source_controller_seat: seat(value.source_controller_seat),
    source_action_id: requiredString(
      value.source_action_id,
      "tcg_v0_2_hidden_information_source_action_id_required",
    ),
    source_card_uid: requiredString(
      value.source_card_uid,
      "tcg_v0_2_hidden_information_source_card_uid_required",
    ),
    source_creature_uid: optionalString(
      value.source_creature_uid,
      "tcg_v0_2_hidden_information_source_creature_uid_invalid",
    ),
    phase: requiredString(
      value.phase,
      "tcg_v0_2_hidden_information_phase_required",
    ),
  };
}

function normalizeOccurrence(
  raw: unknown,
  index: number,
): RuntimeV02HiddenInformationOccurrence {
  const value = objectRecord(raw);
  if (!value) {
    throw new Error(`tcg_v0_2_hidden_information_occurrence_invalid:${index}`);
  }
  const allowedKeys = new Set([
    "occurrence_id",
    "turn_seq",
    "controller_seat",
    "zone",
    "action_kind",
    "source_controller_seat",
    "source_action_id",
    "source_card_uid",
    "source_creature_uid",
    "phase",
  ]);
  const unsupportedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupportedKey) {
    throw new Error(
      `tcg_v0_2_hidden_information_occurrence_field_unsupported:${index}:${unsupportedKey}`,
    );
  }
  const occurrenceTurn = Number(value.turn_seq);
  if (!Number.isInteger(occurrenceTurn) || occurrenceTurn < 0) {
    throw new Error(
      `tcg_v0_2_hidden_information_occurrence_turn_invalid:${index}`,
    );
  }
  return {
    occurrence_id: requiredString(
      value.occurrence_id,
      `tcg_v0_2_hidden_information_occurrence_id_invalid:${index}`,
    ),
    turn_seq: occurrenceTurn,
    controller_seat: seat(value.controller_seat),
    zone: zone(value.zone),
    action_kind: requiredString(
      value.action_kind,
      `tcg_v0_2_hidden_information_occurrence_action_kind_invalid:${index}`,
    ),
    source_controller_seat: seat(value.source_controller_seat),
    source_action_id: requiredString(
      value.source_action_id,
      `tcg_v0_2_hidden_information_occurrence_source_action_id_invalid:${index}`,
    ),
    source_card_uid: requiredString(
      value.source_card_uid,
      `tcg_v0_2_hidden_information_occurrence_source_card_uid_invalid:${index}`,
    ),
    source_creature_uid: optionalString(
      value.source_creature_uid,
      `tcg_v0_2_hidden_information_occurrence_source_creature_uid_invalid:${index}`,
    ),
    phase: requiredString(
      value.phase,
      `tcg_v0_2_hidden_information_occurrence_phase_invalid:${index}`,
    ),
  };
}

function ledger(state: Record<string, unknown>): RuntimeV02HiddenInformationView[] {
  const raw = state[LEDGER_KEY];
  if (raw === null || raw === undefined) return [];
  if (!Array.isArray(raw)) {
    throw new Error("tcg_v0_2_hidden_information_ledger_invalid");
  }
  return raw.map((entry, index) => normalizeEntry(entry, index));
}

function occurrenceQueue(
  state: Record<string, unknown>,
): RuntimeV02HiddenInformationOccurrence[] {
  const raw = state[OCCURRENCE_QUEUE_KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error("tcg_v0_2_hidden_information_occurrence_queue_invalid");
  }
  return raw.map((entry, index) => normalizeOccurrence(entry, index));
}

function nextOccurrenceSequence(state: Record<string, unknown>): number {
  const raw = state[OCCURRENCE_SEQUENCE_KEY];
  const current = raw == null ? 0 : Number(raw);
  if (!Number.isInteger(current) || current < 0) {
    throw new Error("tcg_v0_2_hidden_information_occurrence_sequence_invalid");
  }
  const next = current + 1;
  state[OCCURRENCE_SEQUENCE_KEY] = next;
  return next;
}

/**
 * Records current-turn hidden-information history and, when source context is
 * supplied, a distinct trigger occurrence.
 *
 * History remains de-duplicated by controller/zone for current-turn queries.
 * Trigger occurrences are never de-duplicated: listener receipts and limits
 * decide whether later views have gameplay effect. Neither record contains any
 * viewed/search-result card identity, ordering or private option payload.
 */
export function recordRuntimeV02HiddenInformationView(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  rawZone: RuntimeV02HiddenInformationZone,
  rawSource?: RuntimeV02HiddenInformationSourceContext,
): RuntimeV02HiddenInformationView[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  const normalizedZone = zone(rawZone);
  const current = ledger(state).filter((entry) => entry.turn_seq === currentTurn);
  if (!current.some((entry) =>
    entry.controller_seat === controller && entry.zone === normalizedZone
  )) {
    current.push({
      turn_seq: currentTurn,
      controller_seat: controller,
      zone: normalizedZone,
    });
  }
  state[LEDGER_KEY] = current.map((entry) => ({ ...entry }));

  if (rawSource != null) {
    const source = normalizeSourceContext(rawSource);
    const pending = occurrenceQueue(state);
    if (pending.some((entry) => entry.turn_seq !== currentTurn)) {
      throw new Error("tcg_v0_2_hidden_information_occurrence_queue_stale");
    }
    const sequence = nextOccurrenceSequence(state);
    pending.push({
      occurrence_id:
        `hidden-information-viewed:${currentTurn}:${sequence}:${controller}`,
      turn_seq: currentTurn,
      controller_seat: controller,
      zone: normalizedZone,
      ...source,
    });
    state[OCCURRENCE_QUEUE_KEY] = pending.map((entry) => ({ ...entry }));
  }

  return current.map((entry) => ({ ...entry }));
}

/**
 * Reads only this seat's current-turn hidden-information history metadata.
 * Old turns and the other seat are never returned.
 */
export function runtimeV02CurrentTurnHiddenInformationViews(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02HiddenInformationView[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  return ledger(state)
    .filter((entry) =>
      entry.turn_seq === currentTurn && entry.controller_seat === controller
    )
    .map((entry) => ({ ...entry }));
}

/**
 * Returns the unconsumed hidden-view trigger occurrences without mutating them.
 * This is private canonical state and must never be projected to player views.
 */
export function runtimeV02PendingHiddenInformationOccurrences(
  state: Record<string, unknown>,
): RuntimeV02HiddenInformationOccurrence[] {
  const currentTurn = turnSeq(state);
  const pending = occurrenceQueue(state);
  if (pending.some((entry) => entry.turn_seq !== currentTurn)) {
    throw new Error("tcg_v0_2_hidden_information_occurrence_queue_stale");
  }
  return pending.map((entry) => ({ ...entry }));
}

/**
 * Atomically removes the current hidden-view occurrence queue for an
 * orchestration owner to adapt into Event Listener events.
 */
export function runtimeV02TakeHiddenInformationOccurrences(
  state: Record<string, unknown>,
): RuntimeV02HiddenInformationOccurrence[] {
  const pending = runtimeV02PendingHiddenInformationOccurrences(state);
  delete state[OCCURRENCE_QUEUE_KEY];
  return pending;
}
