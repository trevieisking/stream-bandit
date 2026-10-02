import {
  runtimeV02ApplyCardZoneReorder,
  type RuntimeV02CardZoneInstance,
  type RuntimeV02CardZoneReorderReceipt,
  type RuntimeV02CardZoneReorderRequest,
} from "./tcg-match-card-zone-engine-v0-2.ts";

export type RuntimeV02DeckReorderOccurrence = {
  occurrence_id: string;
  turn_seq: number;
  controller_seat: 1 | 2;
  source_controller_seat: 1 | 2;
  action_kind: string;
  source_action_id: string;
  source_card_uid: string | null;
  destination_position: "top" | "bottom";
  count: number;
  phase: string;
};

export type RuntimeV02DeckReorderOccurrenceContext = {
  source_controller_seat: 1 | 2;
  phase: string;
};

const QUEUE_KEY = "runtime_deck_reorder_occurrences_v0_2";
const SEQUENCE_KEY = "runtime_deck_reorder_occurrence_seq_v0_2";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function seat(value: unknown, code: string): 1 | 2 {
  if (value !== 1 && value !== 2) throw new Error(code);
  return value;
}

function text(value: unknown, code: string): string {
  const out = typeof value === "string" ? value.trim() : "";
  if (!out) throw new Error(code);
  return out;
}

function optionalText(value: unknown, code: string): string | null {
  return value == null ? null : text(value, code);
}

function turn(state: Record<string, unknown>): number {
  const out = Number(state.turn_seq);
  if (!Number.isInteger(out) || out < 0) {
    throw new Error("tcg_v0_2_deck_reorder_event_turn_invalid");
  }
  return out;
}

function normalizeOccurrence(
  raw: unknown,
  index: number,
): RuntimeV02DeckReorderOccurrence {
  const value = record(raw);
  if (!value) {
    throw new Error(`tcg_v0_2_deck_reorder_occurrence_invalid:${index}`);
  }
  const allowed = new Set([
    "occurrence_id",
    "turn_seq",
    "controller_seat",
    "source_controller_seat",
    "action_kind",
    "source_action_id",
    "source_card_uid",
    "destination_position",
    "count",
    "phase",
  ]);
  const extra = Object.keys(value).find((key) => !allowed.has(key));
  if (extra) {
    throw new Error(
      `tcg_v0_2_deck_reorder_occurrence_field_unsupported:${index}:${extra}`,
    );
  }
  const occurrenceTurn = Number(value.turn_seq);
  if (!Number.isInteger(occurrenceTurn) || occurrenceTurn < 0) {
    throw new Error(
      `tcg_v0_2_deck_reorder_occurrence_turn_invalid:${index}`,
    );
  }
  const count = Number(value.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(
      `tcg_v0_2_deck_reorder_occurrence_count_invalid:${index}`,
    );
  }
  const destination = String(value.destination_position || "");
  if (destination !== "top" && destination !== "bottom") {
    throw new Error(
      `tcg_v0_2_deck_reorder_occurrence_destination_invalid:${index}`,
    );
  }
  return {
    occurrence_id: text(
      value.occurrence_id,
      `tcg_v0_2_deck_reorder_occurrence_id_invalid:${index}`,
    ),
    turn_seq: occurrenceTurn,
    controller_seat: seat(
      value.controller_seat,
      `tcg_v0_2_deck_reorder_occurrence_controller_invalid:${index}`,
    ),
    source_controller_seat: seat(
      value.source_controller_seat,
      `tcg_v0_2_deck_reorder_occurrence_source_controller_invalid:${index}`,
    ),
    action_kind: text(
      value.action_kind,
      `tcg_v0_2_deck_reorder_occurrence_action_kind_invalid:${index}`,
    ),
    source_action_id: text(
      value.source_action_id,
      `tcg_v0_2_deck_reorder_occurrence_source_action_invalid:${index}`,
    ),
    source_card_uid: optionalText(
      value.source_card_uid,
      `tcg_v0_2_deck_reorder_occurrence_source_card_invalid:${index}`,
    ),
    destination_position: destination,
    count,
    phase: text(
      value.phase,
      `tcg_v0_2_deck_reorder_occurrence_phase_invalid:${index}`,
    ),
  };
}

function queue(state: Record<string, unknown>): RuntimeV02DeckReorderOccurrence[] {
  const raw = state[QUEUE_KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error("tcg_v0_2_deck_reorder_occurrence_queue_invalid");
  }
  return raw.map((entry, index) => normalizeOccurrence(entry, index));
}

function nextSequenceValue(state: Record<string, unknown>): number {
  const raw = state[SEQUENCE_KEY];
  const current = raw == null ? 0 : Number(raw);
  if (!Number.isInteger(current) || current < 0) {
    throw new Error("tcg_v0_2_deck_reorder_occurrence_sequence_invalid");
  }
  return current + 1;
}

/**
 * Delegates physical same-zone deck mutation to Card-Zone owner #30, then
 * records a private metadata-only occurrence for Event Listener owner #28.
 * Reordered card identities are deliberately never copied into the occurrence.
 */
export function runtimeV02ApplyDeckReorderWithOccurrence<
  T extends RuntimeV02CardZoneInstance,
>(
  state: Record<string, unknown>,
  zoneCards: T[],
  request: RuntimeV02CardZoneReorderRequest,
  rawContext: RuntimeV02DeckReorderOccurrenceContext,
): { cards: T[]; receipt: RuntimeV02CardZoneReorderReceipt } {
  const currentTurn = turn(state);
  if (request.zone.zone !== "deck" || request.zone.owner_card_uid != null) {
    throw new Error("tcg_v0_2_deck_reorder_event_zone_unsupported");
  }
  const controller = seat(
    request.zone.controller_seat,
    "tcg_v0_2_deck_reorder_event_controller_invalid",
  );
  const sourceController = seat(
    rawContext.source_controller_seat,
    "tcg_v0_2_deck_reorder_event_source_controller_invalid",
  );
  const phase = text(
    rawContext.phase,
    "tcg_v0_2_deck_reorder_event_phase_required",
  );
  const pending = queue(state);
  if (pending.some((entry) => entry.turn_seq !== currentTurn)) {
    throw new Error("tcg_v0_2_deck_reorder_occurrence_queue_stale");
  }
  const sequence = nextSequenceValue(state);

  const result = runtimeV02ApplyCardZoneReorder(zoneCards, request);
  if (result.receipt.count < 1) {
    throw new Error("tcg_v0_2_deck_reorder_event_empty_receipt");
  }
  const occurrence: RuntimeV02DeckReorderOccurrence = {
    occurrence_id:
      `deck-reordered:${currentTurn}:${sequence}:${controller}`,
    turn_seq: currentTurn,
    controller_seat: controller,
    source_controller_seat: sourceController,
    action_kind: result.receipt.action_kind,
    source_action_id: result.receipt.source_action_id,
    source_card_uid: result.receipt.source_card_uid,
    destination_position: result.receipt.destination_position,
    count: result.receipt.count,
    phase,
  };
  state[SEQUENCE_KEY] = sequence;
  state[QUEUE_KEY] = [...pending, occurrence].map((entry) => ({ ...entry }));
  return result;
}

export function runtimeV02PendingDeckReorderOccurrences(
  state: Record<string, unknown>,
): RuntimeV02DeckReorderOccurrence[] {
  const currentTurn = turn(state);
  const pending = queue(state);
  if (pending.some((entry) => entry.turn_seq !== currentTurn)) {
    throw new Error("tcg_v0_2_deck_reorder_occurrence_queue_stale");
  }
  return pending.map((entry) => ({ ...entry }));
}

export function runtimeV02TakeDeckReorderOccurrences(
  state: Record<string, unknown>,
): RuntimeV02DeckReorderOccurrence[] {
  const pending = runtimeV02PendingDeckReorderOccurrences(state);
  delete state[QUEUE_KEY];
  return pending;
}
