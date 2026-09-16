import type { RuntimeV02CreatureDefeatedEvent } from "./tcg-match-defeat-engine-v0-2.ts";

export type RuntimeV02DefeatHistoryQuery = {
  owner_seat?: 1 | 2;
  active_seat?: 1 | 2;
  min_turn_seq?: number;
  max_turn_seq?: number;
  where?: "vanguard" | "reserve";
  creature_uid?: string;
  card_id?: string;
  exclude_creature_uid?: string;
  source_controller_seat?: 1 | 2;
};

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function optionalString(value: unknown, error: string): string | null {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function optionalSeat(value: unknown, error: string): 1 | 2 | null {
  if (value == null) return null;
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function canonicalDefeatEvent(raw: unknown, index: number): RuntimeV02CreatureDefeatedEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`tcg_v0_2_defeat_history_event_invalid:${index}`);
  }
  const event = raw as Record<string, unknown>;
  if (String(event.event || "") !== "creature_defeated") return null;
  const eventId = optionalString(event.event_id, `tcg_v0_2_defeat_history_event_id_required:${index}`)!;
  const sequence = nonNegativeInteger(event.sequence, `tcg_v0_2_defeat_history_sequence_invalid:${index}`);
  const turnSeq = nonNegativeInteger(event.turn_seq, `tcg_v0_2_defeat_history_turn_invalid:${index}`);
  const activeSeat = optionalSeat(event.active_seat, `tcg_v0_2_defeat_history_active_seat_invalid:${index}`)!;
  const ownerSeat = optionalSeat(event.owner_seat, `tcg_v0_2_defeat_history_owner_invalid:${index}`)!;
  const opponentSeat = optionalSeat(event.opponent_seat, `tcg_v0_2_defeat_history_opponent_invalid:${index}`)!;
  if (opponentSeat === ownerSeat) throw new Error(`tcg_v0_2_defeat_history_opponent_same:${index}`);
  const where = String(event.where || "");
  if (where !== "vanguard" && where !== "reserve") throw new Error(`tcg_v0_2_defeat_history_zone_invalid:${index}`);
  const position = event.index == null ? null : Number(event.index);
  if (where === "vanguard" && position !== null) throw new Error(`tcg_v0_2_defeat_history_vanguard_index_invalid:${index}`);
  if (where === "reserve" && (!Number.isInteger(position) || Number(position) < 0 || Number(position) > 3)) {
    throw new Error(`tcg_v0_2_defeat_history_reserve_index_invalid:${index}`);
  }
  const sourceController = optionalSeat(event.source_controller_seat, `tcg_v0_2_defeat_history_source_controller_invalid:${index}`);
  return {
    event_id: eventId,
    event: "creature_defeated",
    sequence,
    turn_seq: turnSeq,
    active_seat: activeSeat,
    owner_seat: ownerSeat,
    opponent_seat: opponentSeat,
    where,
    index: position,
    creature_uid: optionalString(event.creature_uid, `tcg_v0_2_defeat_history_creature_uid_required:${index}`)!,
    card_id: optionalString(event.card_id, `tcg_v0_2_defeat_history_card_id_required:${index}`)!,
    reward_value: nonNegativeInteger(event.reward_value, `tcg_v0_2_defeat_history_reward_invalid:${index}`),
    action_kind: optionalString(event.action_kind, `tcg_v0_2_defeat_history_action_kind_invalid:${index}`),
    source_action_id: optionalString(event.source_action_id, `tcg_v0_2_defeat_history_source_action_id_invalid:${index}`),
    source_controller_seat: sourceController,
    source_card_uid: optionalString(event.source_card_uid, `tcg_v0_2_defeat_history_source_card_uid_invalid:${index}`),
  };
}

function eventStream(state: Record<string, unknown>): RuntimeV02CreatureDefeatedEvent[] {
  if (state.effect_events == null) return [];
  if (!Array.isArray(state.effect_events)) throw new Error("tcg_v0_2_defeat_history_event_stream_invalid");
  const result: RuntimeV02CreatureDefeatedEvent[] = [];
  state.effect_events.forEach((raw, index) => {
    const event = canonicalDefeatEvent(raw, index);
    if (event) result.push(event);
  });
  return result;
}

function validatedQuery(query: RuntimeV02DefeatHistoryQuery): Required<Pick<RuntimeV02DefeatHistoryQuery, never>> & RuntimeV02DefeatHistoryQuery {
  if (!query || typeof query !== "object" || Array.isArray(query)) throw new Error("tcg_v0_2_defeat_history_query_invalid");
  const ownerSeat = optionalSeat(query.owner_seat, "tcg_v0_2_defeat_history_query_owner_invalid");
  const activeSeat = optionalSeat(query.active_seat, "tcg_v0_2_defeat_history_query_active_invalid");
  const sourceController = optionalSeat(query.source_controller_seat, "tcg_v0_2_defeat_history_query_source_controller_invalid");
  const min = query.min_turn_seq == null ? null : nonNegativeInteger(query.min_turn_seq, "tcg_v0_2_defeat_history_query_min_turn_invalid");
  const max = query.max_turn_seq == null ? null : nonNegativeInteger(query.max_turn_seq, "tcg_v0_2_defeat_history_query_max_turn_invalid");
  if (min != null && max != null && min > max) throw new Error("tcg_v0_2_defeat_history_query_turn_range_invalid");
  if (query.where != null && query.where !== "vanguard" && query.where !== "reserve") throw new Error("tcg_v0_2_defeat_history_query_zone_invalid");
  return {
    ...query,
    ...(ownerSeat == null ? {} : { owner_seat: ownerSeat }),
    ...(activeSeat == null ? {} : { active_seat: activeSeat }),
    ...(sourceController == null ? {} : { source_controller_seat: sourceController }),
    ...(min == null ? {} : { min_turn_seq: min }),
    ...(max == null ? {} : { max_turn_seq: max }),
    ...(query.creature_uid == null ? {} : { creature_uid: optionalString(query.creature_uid, "tcg_v0_2_defeat_history_query_creature_uid_invalid")! }),
    ...(query.card_id == null ? {} : { card_id: optionalString(query.card_id, "tcg_v0_2_defeat_history_query_card_id_invalid")! }),
    ...(query.exclude_creature_uid == null ? {} : { exclude_creature_uid: optionalString(query.exclude_creature_uid, "tcg_v0_2_defeat_history_query_exclude_uid_invalid")! }),
  };
}

/**
 * Read-only query surface for owner #34 defeat history.
 * Consumers express explicit controller/turn windows; this owner never guesses card
 * intent from names or display text. Returned records are clones so queries cannot
 * mutate the authoritative event stream.
 */
export function runtimeV02QueryDefeatHistory(
  state: Record<string, unknown>,
  query: RuntimeV02DefeatHistoryQuery = {},
): RuntimeV02CreatureDefeatedEvent[] {
  const checked = validatedQuery(query);
  return eventStream(state).filter((event) => {
    if (checked.owner_seat != null && event.owner_seat !== checked.owner_seat) return false;
    if (checked.active_seat != null && event.active_seat !== checked.active_seat) return false;
    if (checked.min_turn_seq != null && event.turn_seq < checked.min_turn_seq) return false;
    if (checked.max_turn_seq != null && event.turn_seq > checked.max_turn_seq) return false;
    if (checked.where != null && event.where !== checked.where) return false;
    if (checked.creature_uid != null && event.creature_uid !== checked.creature_uid) return false;
    if (checked.card_id != null && event.card_id !== checked.card_id) return false;
    if (checked.exclude_creature_uid != null && event.creature_uid === checked.exclude_creature_uid) return false;
    if (checked.source_controller_seat != null && event.source_controller_seat !== checked.source_controller_seat) return false;
    return true;
  }).map((event) => structuredClone(event));
}

export function runtimeV02CountDefeatHistory(
  state: Record<string, unknown>,
  query: RuntimeV02DefeatHistoryQuery = {},
): number {
  return runtimeV02QueryDefeatHistory(state, query).length;
}

export function runtimeV02DefeatedCreatureUids(
  state: Record<string, unknown>,
  query: RuntimeV02DefeatHistoryQuery = {},
): string[] {
  return runtimeV02QueryDefeatHistory(state, query).map((event) => event.creature_uid);
}
