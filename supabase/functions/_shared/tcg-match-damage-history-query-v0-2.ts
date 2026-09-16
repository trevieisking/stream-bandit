export type RuntimeV02DamageHistorySource = "damage_packet" | "effect_program" | "card_cost";

export type RuntimeV02DamageHistoryRecord = {
  event_id: string;
  turn_seq: number;
  source: RuntimeV02DamageHistorySource;
  source_controller_seat: 1 | 2 | null;
  source_kind: string | null;
  source_action_id: string;
  source_card_uid: string | null;
  source_card_id: string | null;
  source_creature_uid: string | null;
  target_controller_seat: 1 | 2;
  target_creature_uid: string;
  actual_damage: number;
  card_effect: boolean;
};

export type RuntimeV02DamageHistoryQuery = {
  min_turn_seq?: number;
  max_turn_seq?: number;
  source?: RuntimeV02DamageHistorySource;
  source_controller_seat?: 1 | 2;
  source_kind?: string;
  source_card_uid?: string;
  source_card_id?: string;
  source_creature_uid?: string;
  target_controller_seat?: 1 | 2;
  target_creature_uid?: string;
  min_actual_damage?: number;
  card_effect_only?: boolean;
};

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function nonNegativeAmount(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(error);
  return number;
}

function optionalSeat(value: unknown, error: string): 1 | 2 | null {
  if (value == null) return null;
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function requiredSeat(value: unknown, error: string): 1 | 2 {
  const resolved = optionalSeat(value, error);
  if (resolved == null) throw new Error(error);
  return resolved;
}

function optionalString(value: unknown, error: string): string | null {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function requiredString(value: unknown, error: string): string {
  const text = optionalString(value, error);
  if (text == null) throw new Error(error);
  return text;
}

function objectRecord(value: unknown, error: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(error);
  return value as Record<string, unknown>;
}

function packetRecord(event: Record<string, unknown>, index: number): RuntimeV02DamageHistoryRecord {
  const sourceCardUid = optionalString(
    event.source_card_uid,
    `tcg_v0_2_damage_history_packet_source_card_uid_invalid:${index}`,
  );
  return {
    event_id: requiredString(event.event_id, `tcg_v0_2_damage_history_packet_event_id_required:${index}`),
    turn_seq: nonNegativeInteger(event.turn_seq, `tcg_v0_2_damage_history_packet_turn_invalid:${index}`),
    source: "damage_packet",
    source_controller_seat: optionalSeat(
      event.source_controller_seat,
      `tcg_v0_2_damage_history_packet_source_controller_invalid:${index}`,
    ),
    source_kind: requiredString(event.source_kind, `tcg_v0_2_damage_history_packet_source_kind_required:${index}`),
    source_action_id: requiredString(
      event.source_action_id,
      `tcg_v0_2_damage_history_packet_source_action_id_required:${index}`,
    ),
    source_card_uid: sourceCardUid,
    source_card_id: optionalString(event.source_card_id, `tcg_v0_2_damage_history_packet_source_card_id_invalid:${index}`),
    source_creature_uid: optionalString(
      event.source_creature_uid,
      `tcg_v0_2_damage_history_packet_source_creature_uid_invalid:${index}`,
    ),
    target_controller_seat: requiredSeat(
      event.target_controller_seat,
      `tcg_v0_2_damage_history_packet_target_controller_invalid:${index}`,
    ),
    target_creature_uid: requiredString(
      event.target_creature_uid,
      `tcg_v0_2_damage_history_packet_target_uid_required:${index}`,
    ),
    actual_damage: nonNegativeAmount(
      event.actual_hp_damage,
      `tcg_v0_2_damage_history_packet_actual_damage_invalid:${index}`,
    ),
    card_effect: sourceCardUid != null,
  };
}

function effectProgramRecord(event: Record<string, unknown>, index: number): RuntimeV02DamageHistoryRecord {
  const sourceCardUid = requiredString(
    event.source_card_uid,
    `tcg_v0_2_damage_history_effect_source_card_uid_required:${index}`,
  );
  return {
    event_id: requiredString(event.event_id, `tcg_v0_2_damage_history_effect_event_id_required:${index}`),
    turn_seq: nonNegativeInteger(event.turn_seq, `tcg_v0_2_damage_history_effect_turn_invalid:${index}`),
    source: "effect_program",
    source_controller_seat: requiredSeat(
      event.controller_seat,
      `tcg_v0_2_damage_history_effect_controller_invalid:${index}`,
    ),
    source_kind: optionalString(event.action_kind, `tcg_v0_2_damage_history_effect_action_kind_invalid:${index}`),
    source_action_id: requiredString(
      event.source_action_id,
      `tcg_v0_2_damage_history_effect_source_action_id_required:${index}`,
    ),
    source_card_uid: sourceCardUid,
    source_card_id: optionalString(event.source_card_id, `tcg_v0_2_damage_history_effect_source_card_id_invalid:${index}`),
    source_creature_uid: optionalString(
      event.source_creature_uid,
      `tcg_v0_2_damage_history_effect_source_creature_uid_invalid:${index}`,
    ),
    target_controller_seat: requiredSeat(
      event.target_controller_seat,
      `tcg_v0_2_damage_history_effect_target_controller_invalid:${index}`,
    ),
    target_creature_uid: requiredString(
      event.target_creature_uid,
      `tcg_v0_2_damage_history_effect_target_uid_required:${index}`,
    ),
    actual_damage: nonNegativeAmount(
      event.actual_hp_damage,
      `tcg_v0_2_damage_history_effect_actual_damage_invalid:${index}`,
    ),
    card_effect: true,
  };
}

function cardCostRecord(event: Record<string, unknown>, index: number): RuntimeV02DamageHistoryRecord | null {
  if (String(event.cost_kind || "") !== "damage") return null;
  const sourceCardUid = requiredString(
    event.source_card_uid,
    `tcg_v0_2_damage_history_cost_source_card_uid_required:${index}`,
  );
  return {
    event_id: requiredString(event.event_id, `tcg_v0_2_damage_history_cost_event_id_required:${index}`),
    turn_seq: nonNegativeInteger(event.turn_seq, `tcg_v0_2_damage_history_cost_turn_invalid:${index}`),
    source: "card_cost",
    source_controller_seat: requiredSeat(
      event.controller_seat,
      `tcg_v0_2_damage_history_cost_controller_invalid:${index}`,
    ),
    source_kind: requiredString(event.action_kind, `tcg_v0_2_damage_history_cost_action_kind_required:${index}`),
    source_action_id: requiredString(
      event.source_action_id,
      `tcg_v0_2_damage_history_cost_source_action_id_required:${index}`,
    ),
    source_card_uid: sourceCardUid,
    source_card_id: requiredString(
      event.source_card_id,
      `tcg_v0_2_damage_history_cost_source_card_id_required:${index}`,
    ),
    source_creature_uid: optionalString(
      event.source_creature_uid,
      `tcg_v0_2_damage_history_cost_source_creature_uid_invalid:${index}`,
    ),
    target_controller_seat: requiredSeat(
      event.target_controller_seat,
      `tcg_v0_2_damage_history_cost_target_controller_invalid:${index}`,
    ),
    target_creature_uid: requiredString(
      event.target_creature_uid,
      `tcg_v0_2_damage_history_cost_target_uid_required:${index}`,
    ),
    actual_damage: nonNegativeAmount(
      event.actual_damage_placed,
      `tcg_v0_2_damage_history_cost_actual_damage_invalid:${index}`,
    ),
    card_effect: true,
  };
}

function canonicalDamageRecord(raw: unknown, index: number): RuntimeV02DamageHistoryRecord | null {
  const event = objectRecord(raw, `tcg_v0_2_damage_history_event_invalid:${index}`);
  const kind = String(event.event || "");
  if (kind === "after_damage_packet") return packetRecord(event, index);
  if (kind === "effect_damage_dealt") return effectProgramRecord(event, index);
  if (kind === "card_cost_paid") return cardCostRecord(event, index);
  return null;
}

function eventStream(state: Record<string, unknown>): RuntimeV02DamageHistoryRecord[] {
  if (state.effect_events == null) return [];
  if (!Array.isArray(state.effect_events)) throw new Error("tcg_v0_2_damage_history_event_stream_invalid");
  const records: RuntimeV02DamageHistoryRecord[] = [];
  state.effect_events.forEach((raw, index) => {
    const record = canonicalDamageRecord(raw, index);
    if (record) records.push(record);
  });
  return records;
}

function validatedQuery(query: RuntimeV02DamageHistoryQuery): RuntimeV02DamageHistoryQuery {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new Error("tcg_v0_2_damage_history_query_invalid");
  }
  const minTurn = query.min_turn_seq == null
    ? null
    : nonNegativeInteger(query.min_turn_seq, "tcg_v0_2_damage_history_query_min_turn_invalid");
  const maxTurn = query.max_turn_seq == null
    ? null
    : nonNegativeInteger(query.max_turn_seq, "tcg_v0_2_damage_history_query_max_turn_invalid");
  if (minTurn != null && maxTurn != null && minTurn > maxTurn) {
    throw new Error("tcg_v0_2_damage_history_query_turn_range_invalid");
  }
  if (query.source != null && !["damage_packet", "effect_program", "card_cost"].includes(query.source)) {
    throw new Error("tcg_v0_2_damage_history_query_source_invalid");
  }
  if (query.card_effect_only != null && typeof query.card_effect_only !== "boolean") {
    throw new Error("tcg_v0_2_damage_history_query_card_effect_invalid");
  }
  return {
    ...query,
    ...(minTurn == null ? {} : { min_turn_seq: minTurn }),
    ...(maxTurn == null ? {} : { max_turn_seq: maxTurn }),
    ...(query.source_controller_seat == null
      ? {}
      : { source_controller_seat: requiredSeat(query.source_controller_seat, "tcg_v0_2_damage_history_query_source_controller_invalid") }),
    ...(query.target_controller_seat == null
      ? {}
      : { target_controller_seat: requiredSeat(query.target_controller_seat, "tcg_v0_2_damage_history_query_target_controller_invalid") }),
    ...(query.source_kind == null
      ? {}
      : { source_kind: requiredString(query.source_kind, "tcg_v0_2_damage_history_query_source_kind_invalid") }),
    ...(query.source_card_uid == null
      ? {}
      : { source_card_uid: requiredString(query.source_card_uid, "tcg_v0_2_damage_history_query_source_card_uid_invalid") }),
    ...(query.source_card_id == null
      ? {}
      : { source_card_id: requiredString(query.source_card_id, "tcg_v0_2_damage_history_query_source_card_id_invalid") }),
    ...(query.source_creature_uid == null
      ? {}
      : { source_creature_uid: requiredString(query.source_creature_uid, "tcg_v0_2_damage_history_query_source_creature_uid_invalid") }),
    ...(query.target_creature_uid == null
      ? {}
      : { target_creature_uid: requiredString(query.target_creature_uid, "tcg_v0_2_damage_history_query_target_uid_invalid") }),
    ...(query.min_actual_damage == null
      ? {}
      : { min_actual_damage: nonNegativeAmount(query.min_actual_damage, "tcg_v0_2_damage_history_query_min_damage_invalid") }),
  };
}

/**
 * Read-only owner #20 history query over canonical damage-bearing events.
 *
 * This intentionally excludes damage_moved because movement transfers existing
 * wounds rather than dealing or placing new damage. Card-backed damage packets,
 * generic effect-damage programs and damage paid as a card cost are normalized
 * into one immutable query surface for future cards and sets.
 */
export function runtimeV02QueryDamageHistory(
  state: Record<string, unknown>,
  query: RuntimeV02DamageHistoryQuery = {},
): RuntimeV02DamageHistoryRecord[] {
  const checked = validatedQuery(query);
  return eventStream(state).filter((record) => {
    if (checked.min_turn_seq != null && record.turn_seq < checked.min_turn_seq) return false;
    if (checked.max_turn_seq != null && record.turn_seq > checked.max_turn_seq) return false;
    if (checked.source != null && record.source !== checked.source) return false;
    if (checked.source_controller_seat != null && record.source_controller_seat !== checked.source_controller_seat) return false;
    if (checked.source_kind != null && record.source_kind !== checked.source_kind) return false;
    if (checked.source_card_uid != null && record.source_card_uid !== checked.source_card_uid) return false;
    if (checked.source_card_id != null && record.source_card_id !== checked.source_card_id) return false;
    if (checked.source_creature_uid != null && record.source_creature_uid !== checked.source_creature_uid) return false;
    if (checked.target_controller_seat != null && record.target_controller_seat !== checked.target_controller_seat) return false;
    if (checked.target_creature_uid != null && record.target_creature_uid !== checked.target_creature_uid) return false;
    if (checked.min_actual_damage != null && record.actual_damage < checked.min_actual_damage) return false;
    if (checked.card_effect_only === true && !record.card_effect) return false;
    if (checked.card_effect_only === false && record.card_effect) return false;
    return true;
  }).map((record) => structuredClone(record));
}

export function runtimeV02CountDamageHistory(
  state: Record<string, unknown>,
  query: RuntimeV02DamageHistoryQuery = {},
): number {
  return runtimeV02QueryDamageHistory(state, query).length;
}

export function runtimeV02TotalDamageHistory(
  state: Record<string, unknown>,
  query: RuntimeV02DamageHistoryQuery = {},
): number {
  return runtimeV02QueryDamageHistory(state, query)
    .reduce((sum, record) => sum + record.actual_damage, 0);
}
