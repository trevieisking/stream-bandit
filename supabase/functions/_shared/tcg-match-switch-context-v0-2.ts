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

export type RuntimeV02AtomicSwitchResult = {
  context: RuntimeV02SwitchContext;
  events: [RuntimeV02SwitchMovementEvent, RuntimeV02SwitchMovementEvent];
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

type RuntimeV02SwitchLedger = {
  turn_seq: number;
  sequence: number;
  contexts: RuntimeV02SwitchContext[];
  events: RuntimeV02SwitchMovementEvent[];
};

type RuntimeV02Creature = Record<string, unknown> & {
  stack: unknown[];
  conditions?: Record<string, unknown>;
  condition?: string | null;
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

function clearOrdinaryConditions(value: RuntimeV02Creature): void {
  value.conditions = { scorched: false, venomed: 0, control: null, modifier: null };
  value.condition = null;
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

function cloneContext(value: RuntimeV02SwitchContext): RuntimeV02SwitchContext {
  return { ...value };
}

function cloneEvent(value: RuntimeV02SwitchMovementEvent): RuntimeV02SwitchMovementEvent {
  return { ...value };
}

/**
 * Non-mutating validation contract for the canonical Runtime v0.2 atomic switch.
 *
 * This preflight performs every validation that can reject the switch, including
 * existing-ledger validation, and predicts the deterministic switch id without
 * creating the ledger or mutating either battlefield. Orchestrators can therefore
 * validate a downstream switch before another owner commits an irreversible cost.
 */
export function runtimeV02PreflightAtomicSwitch(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  reserveIndex: number,
  input: {
    action_kind: RuntimeV02SwitchActionKind;
    source_action_id: string;
    source_card_uid?: string | null;
  },
): RuntimeV02AtomicSwitchPreflight {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  const turn = currentTurn(state);
  if (!Number.isInteger(reserveIndex) || reserveIndex < 0 || reserveIndex > 3) {
    throw new Error("tcg_v0_2_switch_reserve_index_invalid");
  }
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
 * Canonical atomic Vanguard <-> Reserve switch primitive for Runtime v0.2.
 *
 * The operation reuses the non-mutating preflight contract before any battlefield
 * mutation. One switch writes one private context plus the paired moved_to_reserve /
 * became_vanguard events required by Card Pass 2 Amendment H. Listener dispatch
 * deliberately remains a later owner: this primitive records deterministic
 * canonical event truth without pretending Runtime Pass E parity.
 */
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
  if (ledger.sequence + 1 !== preflight.next_sequence) {
    throw new Error("tcg_v0_2_switch_preflight_stale");
  }
  const sequence = preflight.next_sequence;
  const switchId = preflight.switch_id;
  const context: RuntimeV02SwitchContext = {
    switch_id: switchId,
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
    switch_id: switchId,
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
    switch_id: switchId,
    source_action_id: preflight.source_action_id,
    source_card_uid: preflight.source_card_uid,
    action_kind: preflight.action_kind,
    turn_seq: turn,
  };

  player.vanguard = incoming;
  reserve[reserveIndex] = outgoing;
  clearOrdinaryConditions(outgoing);
  clearOrdinaryConditions(incoming);
  incoming.became_vanguard_turn = turn;

  ledger.sequence = sequence;
  ledger.contexts.push(context);
  ledger.events.push(movedToReserve, becameVanguard);

  return {
    context: cloneContext(context),
    events: [cloneEvent(movedToReserve), cloneEvent(becameVanguard)],
  };
}

export function runtimeV02CurrentTurnSwitchContexts(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02SwitchContext[] {
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  if (!ledger) return [];
  return ledger.contexts
    .filter((entry) => controllerSeat == null || entry.controller_seat === controllerSeat)
    .map(cloneContext);
}

export function runtimeV02CurrentTurnSwitchEvents(
  state: Record<string, unknown>,
  controllerSeat?: 1 | 2,
): RuntimeV02SwitchMovementEvent[] {
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  if (!ledger) return [];
  return ledger.events
    .filter((entry) => controllerSeat == null || entry.controller_seat === controllerSeat)
    .map(cloneEvent);
}

export function runtimeV02SwitchContextById(
  state: Record<string, unknown>,
  switchId: string,
): RuntimeV02SwitchContext | null {
  const id = requiredString(switchId, "tcg_v0_2_switch_id_required");
  const turn = currentTurn(state);
  const ledger = readLedger(state, turn);
  const found = ledger?.contexts.find((entry) => entry.switch_id === id) || null;
  return found ? cloneContext(found) : null;
}
