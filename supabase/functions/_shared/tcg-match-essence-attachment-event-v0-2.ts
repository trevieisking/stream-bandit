export type RuntimeV02EssenceAttachmentOriginZone = "hand" | "discard" | "deck" | "effect_owned_selection";

export type RuntimeV02EssenceAttachmentEvent = {
  id: string;
  turn_seq: number;
  controller_seat: 1 | 2;
  target_creature_uid: string;
  source_card_uid: string;
  source_card_id: string;
  origin_zone: RuntimeV02EssenceAttachmentOriginZone;
  attachment_kind: string;
  source_action_id: string;
};

/**
 * Structural adapter consumed by the shared Runtime Pass E listener engine.
 * The attachment ledger remains the canonical receipt owner; this shape merely
 * presents one immutable receipt as the generic `essence_attached` event.
 */
export type RuntimeV02EssenceAttachedListenerEvent = {
  event_id: string;
  event: "essence_attached";
  subject_uid: string;
  subject_card_id: string;
  controller_seat: 1 | 2;
  origin_zone: RuntimeV02EssenceAttachmentOriginZone;
  destination_zone: "field";
  destination_index: number | null;
  phase: string;
  source_action_id: string;
  source_card_uid: string;
  action_kind: string;
  turn_seq: number;
  attachment_target_uid: string;
  attachment_kind: string;
};

const LEDGER_KEY = "runtime_v0_2_essence_attachment_events";

type Ledger = { turn_seq: number; sequence: number; events: RuntimeV02EssenceAttachmentEvent[] };

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function text(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}
function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) throw new Error("tcg_v0_2_attachment_event_turn_seq_invalid");
  return value;
}
function seat(value: unknown): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error("tcg_v0_2_attachment_event_controller_seat_invalid");
}
function origin(value: unknown): RuntimeV02EssenceAttachmentOriginZone {
  if (value === "hand" || value === "discard" || value === "deck" || value === "effect_owned_selection") return value;
  throw new Error("tcg_v0_2_attachment_event_origin_zone_invalid");
}
function normalizeEvent(raw: unknown, index: number): RuntimeV02EssenceAttachmentEvent {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_attachment_event_entry_invalid:${index}`);
  const allowed = new Set(["id", "turn_seq", "controller_seat", "target_creature_uid", "source_card_uid", "source_card_id", "origin_zone", "attachment_kind", "source_action_id"]);
  const extra = Object.keys(value).find((key) => !allowed.has(key));
  if (extra) throw new Error(`tcg_v0_2_attachment_event_field_unsupported:${index}:${extra}`);
  const eventTurn = Number(value.turn_seq);
  if (!Number.isInteger(eventTurn) || eventTurn < 0) throw new Error(`tcg_v0_2_attachment_event_turn_invalid:${index}`);
  return {
    id: text(value.id, `tcg_v0_2_attachment_event_id_invalid:${index}`),
    turn_seq: eventTurn,
    controller_seat: seat(value.controller_seat),
    target_creature_uid: text(value.target_creature_uid, `tcg_v0_2_attachment_event_target_invalid:${index}`),
    source_card_uid: text(value.source_card_uid, `tcg_v0_2_attachment_event_source_uid_invalid:${index}`),
    source_card_id: text(value.source_card_id, `tcg_v0_2_attachment_event_source_card_id_invalid:${index}`),
    origin_zone: origin(value.origin_zone),
    attachment_kind: text(value.attachment_kind, `tcg_v0_2_attachment_event_kind_invalid:${index}`),
    source_action_id: text(value.source_action_id, `tcg_v0_2_attachment_event_action_invalid:${index}`),
  };
}
function ledger(state: Record<string, unknown>): Ledger {
  const currentTurn = turn(state);
  const raw = objectRecord(state[LEDGER_KEY]);
  if (!raw || Number(raw.turn_seq) !== currentTurn) return { turn_seq: currentTurn, sequence: 0, events: [] };
  if (!Number.isInteger(Number(raw.sequence)) || Number(raw.sequence) < 0 || !Array.isArray(raw.events)) {
    throw new Error("tcg_v0_2_attachment_event_ledger_invalid");
  }
  return { turn_seq: currentTurn, sequence: Number(raw.sequence), events: raw.events.map(normalizeEvent) };
}
function save(state: Record<string, unknown>, value: Ledger): void {
  state[LEDGER_KEY] = { turn_seq: value.turn_seq, sequence: value.sequence, events: value.events.map((event) => ({ ...event })) };
}

export function recordRuntimeV02EssenceAttachmentEvent(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCard: { uid?: unknown; card_id?: unknown },
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  attachmentKind = "normal",
): RuntimeV02EssenceAttachmentEvent {
  const current = ledger(state);
  const source = objectRecord(sourceCard);
  const event: RuntimeV02EssenceAttachmentEvent = {
    id: `essence-attachment:${current.turn_seq}:${current.sequence + 1}`,
    turn_seq: current.turn_seq,
    controller_seat: seat(controllerSeat),
    target_creature_uid: text(targetCreatureUid, "tcg_v0_2_attachment_event_target_required"),
    source_card_uid: text(source?.uid, "tcg_v0_2_attachment_event_source_uid_required"),
    source_card_id: text(source?.card_id, "tcg_v0_2_attachment_event_source_card_id_required"),
    origin_zone: origin(originZone),
    attachment_kind: text(attachmentKind, "tcg_v0_2_attachment_event_kind_required"),
    source_action_id: text(sourceActionId, "tcg_v0_2_attachment_event_action_required"),
  };
  current.sequence += 1;
  current.events.push(event);
  save(state, current);
  return { ...event };
}

/**
 * Converts the canonical attachment receipt into the generic Runtime Pass E
 * event shape without re-recording the attachment or mutating match state.
 * Eligibility is intentionally evaluated by the listener engine immediately
 * when this event is enqueued; later listener mutations must not rewrite the
 * original attachment receipt.
 */
export function runtimeV02CreateEssenceAttachedEvent(
  attachment: RuntimeV02EssenceAttachmentEvent,
  options: {
    phase?: string;
    action_kind?: string;
    destination_index?: number | null;
  } = {},
): RuntimeV02EssenceAttachedListenerEvent {
  const normalized = normalizeEvent(attachment, 0);
  const phase = options.phase == null
    ? "play"
    : text(options.phase, "tcg_v0_2_attachment_listener_phase_invalid");
  const actionKind = options.action_kind == null
    ? "essence_attachment"
    : text(options.action_kind, "tcg_v0_2_attachment_listener_action_kind_invalid");
  const rawIndex = options.destination_index;
  let destinationIndex: number | null = null;
  if (rawIndex != null) {
    const parsed = Number(rawIndex);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 3) {
      throw new Error("tcg_v0_2_attachment_listener_destination_index_invalid");
    }
    destinationIndex = parsed;
  }
  return {
    event_id: normalized.id,
    event: "essence_attached",
    subject_uid: normalized.source_card_uid,
    subject_card_id: normalized.source_card_id,
    controller_seat: normalized.controller_seat,
    origin_zone: normalized.origin_zone,
    destination_zone: "field",
    destination_index: destinationIndex,
    phase,
    source_action_id: normalized.source_action_id,
    source_card_uid: normalized.source_card_uid,
    action_kind: actionKind,
    turn_seq: normalized.turn_seq,
    attachment_target_uid: normalized.target_creature_uid,
    attachment_kind: normalized.attachment_kind,
  };
}

export function runtimeV02CurrentTurnEssenceAttachmentEvents(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02EssenceAttachmentEvent[] {
  const current = ledger(state);
  const wanted = controllerSeat == null ? null : seat(controllerSeat);
  return current.events.filter((event) => wanted == null || event.controller_seat === wanted).map((event) => ({ ...event }));
}

export function runtimeV02LatestEssenceAttachmentEventForSource(
  state: Record<string, unknown>,
  sourceCardUid: string,
): RuntimeV02EssenceAttachmentEvent | null {
  const uid = text(sourceCardUid, "tcg_v0_2_attachment_event_source_uid_required");
  const events = ledger(state).events.filter((event) => event.source_card_uid === uid);
  return events.length ? { ...events[events.length - 1] } : null;
}
