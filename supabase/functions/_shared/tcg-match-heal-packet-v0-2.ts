import {
  healRuntimeDamage,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";

export type RuntimeV02Seat = 1 | 2;

export type RuntimeV02HealActionKind =
  | "attack"
  | "ability"
  | "tactic"
  | "essence"
  | "relic"
  | "realm"
  | "system";

export type RuntimeV02HealPacketSource = {
  controller_seat: RuntimeV02Seat;
  action_kind: RuntimeV02HealActionKind;
  action_id: string;
  card_effect: boolean;
  card_uid: string | null;
  card_id: string | null;
  creature_uid: string | null;
};

export type RuntimeV02HealPacketTarget = {
  controller_seat: RuntimeV02Seat;
  creature_uid: string;
  card_uid: string;
  card_id: string;
  element: string;
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02HealPacketContext = {
  source: RuntimeV02HealPacketSource;
  target: RuntimeV02HealPacketTarget;
};

export type RuntimeV02HealPacket = {
  event: "after_heal_packet";
  id: string;
  sequence: number;
  turn_seq: number;
  active_seat: RuntimeV02Seat;
  controller_seat: RuntimeV02Seat;
  requested_amount: number;
  actual_amount: number;
  source: RuntimeV02HealPacketSource;
  target: RuntimeV02HealPacketTarget;
};

export type RuntimeV02HealPacketResolution = {
  requested_amount: number;
  actual_heal: number;
  packet: RuntimeV02HealPacket | null;
};

const ACTION_KINDS = new Set<RuntimeV02HealActionKind>([
  "attack",
  "ability",
  "tactic",
  "essence",
  "relic",
  "realm",
  "system",
]);

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function seat(value: unknown, error: string): RuntimeV02Seat {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function nonEmpty(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function nullableNonEmpty(value: unknown, error: string): string | null {
  if (value == null) return null;
  return nonEmpty(value, error);
}

function turnSeq(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_heal_packet_turn_seq_invalid");
  }
  return value;
}

function activeSeat(state: Record<string, unknown>): RuntimeV02Seat {
  return seat(state.active_seat, "tcg_v0_2_heal_packet_active_seat_invalid");
}

function eventStream(state: Record<string, unknown>): Record<string, unknown>[] {
  if (state.effect_events == null) {
    const events: Record<string, unknown>[] = [];
    state.effect_events = events;
    return events;
  }
  if (!Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_heal_packet_event_stream_invalid");
  }
  return state.effect_events as Record<string, unknown>[];
}

function nextSequence(state: Record<string, unknown>): number {
  const raw = state.runtime_v0_2_event_seq;
  if (raw == null) return 1;
  const current = Number(raw);
  if (!Number.isInteger(current) || current < 0) {
    throw new Error("tcg_v0_2_heal_packet_event_sequence_invalid");
  }
  return current + 1;
}

function validateSource(raw: RuntimeV02HealPacketSource): RuntimeV02HealPacketSource {
  const source = objectRecord(raw);
  if (!source) throw new Error("tcg_v0_2_heal_packet_source_invalid");
  const controller = seat(source.controller_seat, "tcg_v0_2_heal_packet_source_seat_invalid");
  const actionKind = String(source.action_kind || "") as RuntimeV02HealActionKind;
  if (!ACTION_KINDS.has(actionKind)) {
    throw new Error(`tcg_v0_2_heal_packet_action_kind_invalid:${String(source.action_kind || "")}`);
  }
  const actionId = nonEmpty(source.action_id, "tcg_v0_2_heal_packet_action_id_required");
  if (typeof source.card_effect !== "boolean") {
    throw new Error("tcg_v0_2_heal_packet_card_effect_flag_required");
  }
  const cardEffect = source.card_effect;
  const cardUid = nullableNonEmpty(source.card_uid, "tcg_v0_2_heal_packet_source_card_uid_invalid");
  const cardId = nullableNonEmpty(source.card_id, "tcg_v0_2_heal_packet_source_card_id_invalid");
  const creatureUid = nullableNonEmpty(source.creature_uid, "tcg_v0_2_heal_packet_source_creature_uid_invalid");

  if (cardEffect && (!cardUid || !cardId)) {
    throw new Error("tcg_v0_2_heal_packet_card_effect_source_identity_required");
  }
  if (!cardEffect && actionKind !== "system") {
    throw new Error("tcg_v0_2_heal_packet_non_card_source_must_be_system");
  }
  if (cardEffect && actionKind === "system") {
    throw new Error("tcg_v0_2_heal_packet_card_effect_cannot_be_system");
  }
  if ((actionKind === "attack" || actionKind === "ability") && !creatureUid) {
    throw new Error("tcg_v0_2_heal_packet_creature_source_identity_required");
  }

  return {
    controller_seat: controller,
    action_kind: actionKind,
    action_id: actionId,
    card_effect: cardEffect,
    card_uid: cardUid,
    card_id: cardId,
    creature_uid: creatureUid,
  };
}

function validateTarget(raw: RuntimeV02HealPacketTarget): RuntimeV02HealPacketTarget {
  const target = objectRecord(raw);
  if (!target) throw new Error("tcg_v0_2_heal_packet_target_invalid");
  const controller = seat(target.controller_seat, "tcg_v0_2_heal_packet_target_seat_invalid");
  const creatureUid = nonEmpty(target.creature_uid, "tcg_v0_2_heal_packet_target_creature_uid_required");
  const cardUid = nonEmpty(target.card_uid, "tcg_v0_2_heal_packet_target_card_uid_required");
  const cardId = nonEmpty(target.card_id, "tcg_v0_2_heal_packet_target_card_id_required");
  const element = nonEmpty(target.element, "tcg_v0_2_heal_packet_target_element_required");
  const where = String(target.where || "");
  if (where !== "vanguard" && where !== "reserve") {
    throw new Error("tcg_v0_2_heal_packet_target_zone_invalid");
  }
  const index = target.index == null ? null : Number(target.index);
  if (where === "vanguard" && index !== null) {
    throw new Error("tcg_v0_2_heal_packet_vanguard_index_must_be_null");
  }
  if (where === "reserve" && (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3)) {
    throw new Error("tcg_v0_2_heal_packet_reserve_index_invalid");
  }

  return {
    controller_seat: controller,
    creature_uid: creatureUid,
    card_uid: cardUid,
    card_id: cardId,
    element,
    where,
    index,
  };
}

function isHealPacket(value: unknown): value is RuntimeV02HealPacket {
  const event = objectRecord(value);
  return event?.event === "after_heal_packet" &&
    typeof event.id === "string" &&
    Number.isInteger(Number(event.sequence)) &&
    Number.isInteger(Number(event.turn_seq)) &&
    Number(event.actual_amount) > 0;
}

/**
 * Canonical v0.2 heal-event boundary.
 *
 * The underlying damage mutation stays owned by healRuntimeDamage. This wrapper
 * adds only server-built event authority: a packet is persisted after a real
 * (actual > 0) heal with source/target instance identity and controller/action
 * metadata. Listener matching/execution is deliberately separate from this
 * primitive so nested triggers, limits and player choices can share one later
 * listener dispatcher without changing healing math.
 */
export function applyRuntimeV02HealPacket(
  state: Record<string, unknown>,
  targetCreature: RuntimeCreature,
  amount: number,
  context: RuntimeV02HealPacketContext,
): RuntimeV02HealPacketResolution {
  if (!objectRecord(state)) throw new Error("tcg_v0_2_heal_packet_state_invalid");
  if (!objectRecord(targetCreature)) throw new Error("tcg_v0_2_heal_packet_target_creature_invalid");

  const turn = turnSeq(state);
  const active = activeSeat(state);
  const source = validateSource(context?.source);
  const target = validateTarget(context?.target);
  const requested = Number(amount);
  if (!Number.isFinite(requested) || requested < 0) {
    throw new Error("tcg_v0_2_heal_packet_amount_invalid");
  }

  // Validate ledger/sequence before mutating the Creature so malformed state
  // cannot leave a partially-applied heal behind.
  const events = eventStream(state);
  const sequence = nextSequence(state);
  const actual = healRuntimeDamage(targetCreature, requested);
  if (actual <= 0) {
    return { requested_amount: requested, actual_heal: 0, packet: null };
  }

  const packet: RuntimeV02HealPacket = {
    event: "after_heal_packet",
    id: `heal:${turn}:${sequence}`,
    sequence,
    turn_seq: turn,
    active_seat: active,
    controller_seat: source.controller_seat,
    requested_amount: requested,
    actual_amount: actual,
    source,
    target,
  };
  state.runtime_v0_2_event_seq = sequence;
  events.push(packet as unknown as Record<string, unknown>);
  return { requested_amount: requested, actual_heal: actual, packet };
}

export function runtimeV02CurrentTurnHealPackets(
  state: Record<string, unknown>,
): RuntimeV02HealPacket[] {
  const turn = turnSeq(state);
  if (state.effect_events == null) return [];
  if (!Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_heal_packet_event_stream_invalid");
  }
  return state.effect_events
    .filter(isHealPacket)
    .filter((packet) => packet.turn_seq === turn);
}
