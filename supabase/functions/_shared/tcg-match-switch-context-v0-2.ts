import { clearAllRuntimeConditions } from "./tcg-match-condition-engine-v0-2.ts";

export type RuntimeV02SwitchActionKind = "voluntary_withdrawal" | "effect_switch" | "attack";

export type RuntimeV02SwitchContext = {
  switch_id: string;
  controller_seat: 1 | 2;
  outgoing_vanguard_uid: string;
  incoming_vanguard_uid: string;
  reserve_index: number;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: RuntimeV02SwitchActionKind;
  turn_seq: number;
};

export type RuntimeV02ForcedPromotionContext = {
  switch_id: string;
  controller_seat: 1 | 2;
  outgoing_vanguard_uid: null;
  incoming_vanguard_uid: string;
  reserve_index: number;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: "forced_promotion";
  turn_seq: number;
};

export type RuntimeV02BattlefieldPositionContext = RuntimeV02SwitchContext | RuntimeV02ForcedPromotionContext;

export type RuntimeV02SwitchMovementEvent = {
  event: "moved_to_reserve" | "became_vanguard";
  subject_uid: string;
  controller_seat: 1 | 2;
  origin_zone: "vanguard" | "reserve";
  destination_zone: "reserve" | "vanguard";
  reserve_index: number;
  switch_id: string;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: RuntimeV02SwitchActionKind;
  turn_seq: number;
};

export type RuntimeV02ForcedPromotionMovementEvent = {
  event: "became_vanguard";
  subject_uid: string;
  controller_seat: 1 | 2;
  origin_zone: "reserve";
  destination_zone: "vanguard";
  reserve_index: number;
  switch_id: string;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: "forced_promotion";
  turn_seq: number;
};

export type RuntimeV02BattlefieldPositionMovementEvent = RuntimeV02SwitchMovementEvent | RuntimeV02ForcedPromotionMovementEvent;

export type RuntimeV02AtomicSwitchResult = {
  context: RuntimeV02SwitchContext;
  events: [RuntimeV02SwitchMovementEvent, RuntimeV02SwitchMovementEvent];
};

export type RuntimeV02ForcedPromotionResult = {
  context: RuntimeV02ForcedPromotionContext;
  events: [RuntimeV02ForcedPromotionMovementEvent];
};

export type RuntimeV02AtomicSwitchPreflight = {
  controller_seat: 1 | 2;
  outgoing_vanguard_uid: string;
  incoming_vanguard_uid: string;
  reserve_index: number;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: RuntimeV02SwitchActionKind;
  turn_seq: number;
  next_sequence: number;
  switch_id: string;
};

export type RuntimeV02ForcedPromotionPreflight = {
  controller_seat: 1 | 2;
  outgoing_vanguard_uid: null;
  incoming_vanguard_uid: string;
  reserve_index: number;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: "forced_promotion";
  turn_seq: number;
  next_sequence: number;
  switch_id: string;
};

type RuntimeV02SwitchLedger = {
  turn_seq: number;
  sequence: number;
  contexts: RuntimeV02BattlefieldPositionContext[];
  events: RuntimeV02BattlefieldPositionMovementEvent[];
};

type RuntimeV02Creature = Record<string, unknown> & {
  stack: unknown[];
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
  became_vanguard_turn?: number;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function currentTurn(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_switch_turn_seq_invalid");
  }
  return value;
}

function normalizedSeat(value: number): 1 | 2 {
  if (value !== 1 && value !== 2) throw new Error("tcg_v0_2_switch_controller_seat_invalid");
  return value;
}

function normalizedReserveIndex(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 3) {
    throw new Error("tcg_v0_2_switch_reserve_index_invalid");
  }
  return value;
}

function normalizedActionKind(value: unknown): RuntimeV02SwitchActionKind {
  const kind = String(value || "") as RuntimeV02SwitchActionKind;
  if (!["voluntary_withdrawal", "effect_switch", "attack"].includes(kind)) {
    throw new Error("tcg_v0_2_switch_action_kind_invalid");
  }
  return kind;
}

function normalizedSourceCardUid(value: unknown): string | null {
  if (value == null) return null;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error("tcg_v0_2_switch_source_card_uid_invalid");
  return text;
}

function playerForSeat(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_switch_player_missing");
  if (!Array.isArray(player.reserve)) throw new Error("tcg_v0_2_switch_reserve_invalid");
  return player;
}

function creature(value: unknown, error: string): RuntimeV02Creature {
  const raw = objectRecord(value);
  if (!raw || !Array.isArray(raw.stack) || raw.stack.length === 0) throw new Error(error);
  return raw as RuntimeV02Creature;
}

function topUid(value: RuntimeV02Creature, error: string): string {
  const stack = value.stack;
  const top = objectRecord(stack[stack.length - 1]);
  return requiredString(top?.uid, error);
}

function readLedger(state: Record<string, unknown>, turn: number): RuntimeV02SwitchLedger | null {
  const raw = objectRecord(state.runtime_v0_2_switch_ledger);
  if (!raw || Number(raw.turn_seq) !== turn) return null;
  const sequence = Number(raw.sequence);
  if (!Number.isInteger(sequence) || sequence < 0 || !Array.isArray(raw.contexts) || !Array.isArray(raw.events)) {
    throw new Error("tcg_v0_2_switch_ledger_invalid");
  }
  return raw as unknown as RuntimeV02SwitchLedger;
}

function ensureLedger(state: Record<string, unknown>, turn: number): RuntimeV02SwitchLedger {
  const existing = readLedger(state, turn);
  if (existing) return existing;
  const ledger: RuntimeV02SwitchLedger = { turn_seq: turn, sequence: 0, contexts: [], events: [] };
  state.runtime_v0_2_switch_ledger = ledger;
  return ledger;
}

function cloneSwitchContext(value: RuntimeV02SwitchContext): RuntimeV02SwitchContext {
  return { ...value };
}

function clonePositionContext(value: RuntimeV02BattlefieldPositionContext): RuntimeV02BattlefieldPositionContext {
  return { ...value };
}

function cloneSwitchEvent(value: RuntimeV02SwitchMovementEvent): RuntimeV02SwitchMovementEvent {
  return { ...value };
}

function clonePositionEvent(value: RuntimeV02BattlefieldPositionMovementEvent): RuntimeV02BattlefieldPositionMovementEvent {
  return { ...value };
}

function isForcedPromotionContext(value: RuntimeV02BattlefieldPositionContext): value is RuntimeV02ForcedPromotionContext {
  return value.action_kind === "forced_promotion";
}

function isForcedPromotionEvent(value: RuntimeV02BattlefieldPositionMovementEvent): value is RuntimeV02ForcedPromotionMovementEvent {
  return value.action_kind === "forced_promotion";
}

/**
 * Non-mutating validation contract for the canonical Runtime v0.2 atomic switch.
 */
export function runtimeV02PreflightAtomicSwitch(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  reserveIndexRaw: number,
  input: {
    action_kind: RuntimeV02SwitchActionKind;
    source_action_id: string;
    source_card_uid?: string | null;
  },
): RuntimeV02AtomicSwitchPreflight {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  const turn = currentTurn(state);
  const reserveIndex = normalizedReserveIndex(reserveIndexRaw);
  const actionKind = normalizedActionKind(input?.action_kind);
  const sourceActionId = requiredString(input?.source_action_id, "tcg_v0_2_switch_source_action_id_required");
  const sourceCardUid = normalizedSourceCardUid(input?.source_card_uid);
  const player = playerForSeat(state, controllerSeat);
  const reserve = player.reserve as unknown[];
  const outgoing = creature(player.vanguard, "tcg_v0_2_switch_outgoing_vanguard_missing");
  const incoming = creature(reserve[reserveIndex], "tcg_v0_2_switch_incoming_reserve_missing");
  const outgoingUid = topUid(outgoing, "tcg_v0_2_switch_outgoing_anchor_missing");
  const incomingUid = topUid(incoming, "tcg_v0_2_switch_incoming_anchor_missing");
  if (outgoingUid === incomingUid) throw new Error("tcg_v0_2_switch_anchor_collision");

  const ledger = readLedger(state, turn);
  const nextSequence = (ledger?.sequence || 0) + 1;

  return {
    controller_seat: controllerSeat,
    outgoing_vanguard_uid: outgoingUid,
    incoming_vanguard_uid: incomingUid,
    reserve_index: reserveIndex,
    source_action_id: sourceActionId,
    source_card_uid: sourceCardUid,
    action_kind: actionKind,
    turn_seq: turn,
    next_sequence: nextSequence,
    switch_id: `switch:${turn}:${nextSequence}`,
  };
}

/**
 * Non-mutating validation for forced post-defeat Reserve -> empty Vanguard.
 * This is a Battlefield Position operation, not a normal two-sided switch.
 */
export function runtimeV02PreflightForcedPromotion(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  reserveIndexRaw: number,
  input: {
    source_action_id: string;
    source_card_uid?: string | null;
  },
): RuntimeV02ForcedPromotionPreflight {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  const turn = currentTurn(state);
  const reserveIndex = normalizedReserveIndex(reserveIndexRaw);
  const sourceActionId = requiredString(input?.source_action_id, "tcg_v0_2_switch_source_action_id_required");
  const sourceCardUid = normalizedSourceCardUid(input?.source_card_uid);
  const player = playerForSeat(state, controllerSeat);
  if (player.vanguard != null) throw new Error("tcg_v0_2_forced_promotion_vanguard_occupied");
  const reserve = player.reserve as unknown[];
  const incoming = creature(reserve[reserveIndex], "tcg_v0_2_switch_incoming_reserve_missing");
  const incomingUid = topUid(incoming, "tcg_v0_2_switch_incoming_anchor_missing");
  const ledger = readLedger(state, turn);
  const nextSequence = (ledger?.sequence || 0) + 1;

  return {
    controller_seat: controllerSeat,
    outgoing_vanguard_uid: null,
    incoming_vanguard_uid: incomingUid,
    reserve_index: reserveIndex,
    source_action_id: sourceActionId,
    source_card_uid: sourceCardUid,
    action_kind: "forced_promotion",
    turn_seq: turn,
    next_sequence: nextSequence,
    switch_id: `switch:${turn}:${nextSequence}`,
  };
}

/** Canonical atomic Vanguard <-> Reserve switch primitive for Runtime v0.2. */
export function runtimeV02ApplyAtomicSwitch(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  reserveIndex: number,
  input: {
    action_kind: RuntimeV02SwitchActionKind;
    source_action_id: string;
    source_card_uid?: string | null;
  },
): RuntimeV02AtomicSwitchResult {
  const preflight = runtimeV02PreflightAtomicSwitch(state, controllerSeatRaw, reserveIndex, input);
  const controllerSeat = preflight.controller_seat;
  const turn = preflight.turn_seq;
  const player = playerForSeat(state, controllerSeat);
  const reserve = player.reserve as unknown[];
  const outgoing = creature(player.vanguard, "tcg_v0_2_switch_outgoing_vanguard_missing");
  const incoming = creature(reserve[reserveIndex], "tcg_v0_2_switch_incoming_reserve_missing");

  const ledger = ensureLedger(state, turn);
  if (ledger.sequence + 1 !== preflight.next_sequence) throw new Error("tcg_v0_2_switch_preflight_stale");
  const context: RuntimeV02SwitchContext = {
    switch_id: preflight.switch_id,
    controller_seat: controllerSeat,
    outgoing_vanguard_uid: preflight.outgoing_vanguard_uid,
    incoming_vanguard_uid: preflight.incoming_vanguard_uid,
    reserve_index: reserveIndex,
    source_action_id: preflight.source_action_id,
    source_card_uid: preflight.source_card_uid,
    action_kind: preflight.action_kind,
    turn_seq: turn,
  };
  const movedToReserve: RuntimeV02SwitchMovementEvent = {
    event: "moved_to_reserve",
    subject_uid: preflight.outgoing_vanguard_uid,
    controller_seat: controllerSeat,
    origin_zone: "vanguard",
    destination_zone: "reserve",
    reserve_index: reserveIndex,
    switch_id: preflight.switch_id,
    source_action_id: preflight.source_action_id,
    source_card_uid: preflight.source_card_uid,
    action_kind: preflight.action_kind,
    turn_seq: turn,
  };
  const becameVanguard: RuntimeV02SwitchMovementEvent = {
    event: "became_vanguard",
    subject_uid: preflight.incoming_vanguard_uid,
    controller_seat: controllerSeat,
    origin_zone: "reserve",
    destination_zone: "vanguard",
    reserve_index: reserveIndex,
    switch_id: preflight.switch_id,
    source_action_id: preflight.source_action_id,
    source_card_uid: preflight.source_card_uid,
    action_kind: preflight.action_kind,
    turn_seq: turn,
  };

  player.vanguard = incoming;
  reserve[reserveIndex] = outgoing;
  clearAllRuntimeConditions(outgoing);
  clearAllRuntimeConditions(incoming);
  incoming.became_vanguard_turn = turn;

  ledger.sequence = preflight.next_sequence;
  ledger.contexts.push(context);
  ledger.events.push(movedToReserve, becameVanguard);

  return { context: cloneSwitchContext(context), events: [cloneSwitchEvent(movedToReserve), cloneSwitchEvent(becameVanguard)] };
}

/** Canonical forced post-defeat Reserve -> empty Vanguard transition. */
export function runtimeV02ApplyForcedPromotion(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  reserveIndex: number,
  input: {
    source_action_id: string;
    source_card_uid?: string | null;
  },
): RuntimeV02ForcedPromotionResult {
  const preflight = runtimeV02PreflightForcedPromotion(state, controllerSeatRaw, reserveIndex, input);
  const controllerSeat = preflight.controller_seat;
  const turn = preflight.turn_seq;
  const player = playerForSeat(state, controllerSeat);
  const reserve = player.reserve as unknown[];
  const incoming = creature(reserve[reserveIndex], "tcg_v0_2_switch_incoming_reserve_missing");

  const ledger = ensureLedger(state, turn);
  if (ledger.sequence + 1 !== preflight.next_sequence) throw new Error("tcg_v0_2_switch_preflight_stale");
  const context: RuntimeV02ForcedPromotionContext = {
    switch_id: preflight.switch_id,
    controller_seat: controllerSeat,
    outgoing_vanguard_uid: null,
    incoming_vanguard_uid: preflight.incoming_vanguard_uid,
    reserve_index: reserveIndex,
    source_action_id: preflight.source_action_id,
    source_card_uid: preflight.source_card_uid,
    action_kind: "forced_promotion",
    turn_seq: turn,
  };
  const becameVanguard: RuntimeV02ForcedPromotionMovementEvent = {
    event: "became_vanguard",
    subject_uid: preflight.incoming_vanguard_uid,
    controller_seat: controllerSeat,
    origin_zone: "reserve",
    destination_zone: "vanguard",
    reserve_index: reserveIndex,
    switch_id: preflight.switch_id,
    source_action_id: preflight.source_action_id,
    source_card_uid: preflight.source_card_uid,
    action_kind: "forced_promotion",
    turn_seq: turn,
  };

  player.vanguard = incoming;
  reserve[reserveIndex] = null;
  clearAllRuntimeConditions(incoming);
  incoming.became_vanguard_turn = turn;

  ledger.sequence = preflight.next_sequence;
  ledger.contexts.push(context);
  ledger.events.push(becameVanguard);

  return { context: { ...context }, events: [{ ...becameVanguard }] };
}

export function runtimeV02CurrentTurnSwitchContexts(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02SwitchContext[] {
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  if (!ledger) return [];
  return ledger.contexts
    .filter((entry): entry is RuntimeV02SwitchContext => !isForcedPromotionContext(entry))
    .filter((entry) => controllerSeat == null || entry.controller_seat === controllerSeat)
    .map(cloneSwitchContext);
}

export function runtimeV02CurrentTurnBattlefieldPositionContexts(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02BattlefieldPositionContext[] {
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  if (!ledger) return [];
  return ledger.contexts
    .filter((entry) => controllerSeat == null || entry.controller_seat === controllerSeat)
    .map(clonePositionContext);
}

export function runtimeV02CurrentTurnSwitchEvents(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02SwitchMovementEvent[] {
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  if (!ledger) return [];
  return ledger.events
    .filter((entry): entry is RuntimeV02SwitchMovementEvent => !isForcedPromotionEvent(entry))
    .filter((entry) => controllerSeat == null || entry.controller_seat === controllerSeat)
    .map(cloneSwitchEvent);
}

export function runtimeV02CurrentTurnBattlefieldPositionEvents(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02BattlefieldPositionMovementEvent[] {
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  if (!ledger) return [];
  return ledger.events
    .filter((entry) => controllerSeat == null || entry.controller_seat === controllerSeat)
    .map(clonePositionEvent);
}

export function runtimeV02SwitchContextById(
  state: Record<string, unknown>,
  switchId: string,
): RuntimeV02SwitchContext | null {
  const id = requiredString(switchId, "tcg_v0_2_switch_id_required");
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  const found = ledger?.contexts.find((entry) => entry.switch_id === id && !isForcedPromotionContext(entry)) || null;
  return found ? cloneSwitchContext(found as RuntimeV02SwitchContext) : null;
}

export function runtimeV02BattlefieldPositionContextById(
  state: Record<string, unknown>,
  switchId: string,
): RuntimeV02BattlefieldPositionContext | null {
  const id = requiredString(switchId, "tcg_v0_2_switch_id_required");
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  const found = ledger?.contexts.find((entry) => entry.switch_id === id) || null;
  return found ? clonePositionContext(found) : null;
}
