import {
  runtimeV02PlaceDamage,
  type RuntimeV02DamagePlacementReceipt,
} from "./tcg-match-damage-engine-v0-2.ts";
import {
  runtimeV02PreflightDefeatScan,
  runtimeV02ScanAndQueueDefeats,
  type RuntimeV02DefeatDescribe,
  type RuntimeV02DefeatScanResult,
  type RuntimeV02DefeatState,
} from "./tcg-match-defeat-engine-v0-2.ts";
import {
  runtimeV02CommitCardZoneTransfer,
  runtimeV02PreflightCardZoneTransfer,
  type RuntimeV02CardZoneInstance,
  type RuntimeV02CardZoneTransferReceipt,
} from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02CreatureState } from "./tcg-match-creature-engine-v0-2.ts";

export type RuntimeV02CardCostActionKind =
  | "attack"
  | "ability"
  | "tactic"
  | "essence"
  | "relic"
  | "realm";

export type RuntimeV02CardCostIdentity = {
  controller_seat: 1 | 2;
  action_kind: RuntimeV02CardCostActionKind;
  source_action_id: string;
  source_step_index: number;
  source_card_uid: string;
  source_card_id: string;
  source_creature_uid: string | null;
};

export type RuntimeV02CardCostCreatureRef = {
  controller_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  anchor_uid: string;
  card_id: string;
};

export type RuntimeV02CardCostState<T extends RuntimeV02CardZoneInstance> =
  RuntimeV02DefeatState<T> & Record<string, unknown> & {
    turn_seq: number;
    active_seat: 1 | 2;
    effect_events?: Record<string, unknown>[];
    players: RuntimeV02DefeatState<T>["players"] & Record<string, RuntimeV02DefeatState<T>["players"][string] & {
      hand?: T[];
    }>;
  };

export type RuntimeV02DamageCardCostRequest<T extends RuntimeV02CardZoneInstance> = {
  identity: RuntimeV02CardCostIdentity;
  target: RuntimeV02CardCostCreatureRef;
  amount: number;
  defeat_describe: RuntimeV02DefeatDescribe<T>;
};

export type RuntimeV02HandDiscardCardCostRequest = {
  identity: RuntimeV02CardCostIdentity;
  card_uids: readonly unknown[];
};

export type RuntimeV02CardCostEventBase = {
  event_id: string;
  event: "card_cost_paid";
  turn_seq: number;
  active_seat: 1 | 2;
  controller_seat: 1 | 2;
  action_kind: RuntimeV02CardCostActionKind;
  source_action_id: string;
  source_step_index: number;
  source_card_uid: string;
  source_card_id: string;
  source_creature_uid: string | null;
};

export type RuntimeV02DamageCardCostEvent = RuntimeV02CardCostEventBase & {
  cost_kind: "damage";
  target_controller_seat: 1 | 2;
  target_creature_uid: string;
  requested_amount: number;
  actual_damage_placed: number;
};

export type RuntimeV02HandDiscardCardCostEvent = RuntimeV02CardCostEventBase & {
  cost_kind: "hand_discard";
  discarded_card_uids: string[];
  discarded_count: number;
};

export type RuntimeV02DamageCardCostResult = {
  receipt: RuntimeV02DamagePlacementReceipt;
  event: RuntimeV02DamageCardCostEvent;
  defeat: RuntimeV02DefeatScanResult;
};

export type RuntimeV02HandDiscardCardCostResult<T extends RuntimeV02CardZoneInstance> = {
  cards: T[];
  transfer: RuntimeV02CardZoneTransferReceipt;
  event: RuntimeV02HandDiscardCardCostEvent;
};

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

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

function identity(raw: RuntimeV02CardCostIdentity): RuntimeV02CardCostIdentity {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_card_cost_identity_required");
  const actionKind = String(raw.action_kind || "") as RuntimeV02CardCostActionKind;
  if (!["attack", "ability", "tactic", "essence", "relic", "realm"].includes(actionKind)) {
    throw new Error("tcg_v0_2_card_cost_action_kind_invalid");
  }
  const sourceCreatureUid = raw.source_creature_uid == null
    ? null
    : requiredString(raw.source_creature_uid, "tcg_v0_2_card_cost_source_creature_uid_invalid");
  if ((actionKind === "attack" || actionKind === "ability") && !sourceCreatureUid) {
    throw new Error("tcg_v0_2_card_cost_source_creature_uid_required");
  }
  return {
    controller_seat: seat(raw.controller_seat, "tcg_v0_2_card_cost_controller_invalid"),
    action_kind: actionKind,
    source_action_id: requiredString(raw.source_action_id, "tcg_v0_2_card_cost_action_id_required"),
    source_step_index: nonNegativeInteger(raw.source_step_index, "tcg_v0_2_card_cost_step_index_invalid"),
    source_card_uid: requiredString(raw.source_card_uid, "tcg_v0_2_card_cost_source_card_uid_required"),
    source_card_id: requiredString(raw.source_card_id, "tcg_v0_2_card_cost_source_card_id_required"),
    source_creature_uid: sourceCreatureUid,
  };
}

function creatureRef(raw: RuntimeV02CardCostCreatureRef): RuntimeV02CardCostCreatureRef {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_card_cost_target_ref_required");
  const where = raw.where;
  const index = raw.index == null ? null : Number(raw.index);
  if (where !== "vanguard" && where !== "reserve") throw new Error("tcg_v0_2_card_cost_target_zone_invalid");
  if (where === "vanguard" && index !== null) throw new Error("tcg_v0_2_card_cost_vanguard_index_invalid");
  if (where === "reserve" && (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3)) {
    throw new Error("tcg_v0_2_card_cost_reserve_index_invalid");
  }
  return {
    controller_seat: seat(raw.controller_seat, "tcg_v0_2_card_cost_target_controller_invalid"),
    where,
    index,
    anchor_uid: requiredString(raw.anchor_uid, "tcg_v0_2_card_cost_target_uid_required"),
    card_id: requiredString(raw.card_id, "tcg_v0_2_card_cost_target_card_id_required"),
  };
}

function topCard<T extends RuntimeV02CardZoneInstance>(creature: RuntimeV02CreatureState<T>): T {
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_card_cost_target_stack_required");
  }
  return creature.stack[creature.stack.length - 1];
}

function resolveCreature<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  ref: RuntimeV02CardCostCreatureRef,
): RuntimeV02CreatureState<T> & { damage?: number } {
  const player = state.players?.[String(ref.controller_seat)];
  if (!player) throw new Error("tcg_v0_2_card_cost_target_player_missing");
  const creature = ref.where === "vanguard" ? player.vanguard : player.reserve?.[Number(ref.index)];
  if (!creature) throw new Error("tcg_v0_2_card_cost_target_creature_missing");
  const top = topCard(creature);
  if (top.uid !== ref.anchor_uid || top.card_id !== ref.card_id) {
    throw new Error("tcg_v0_2_card_cost_target_identity_changed");
  }
  return creature as RuntimeV02CreatureState<T> & { damage?: number };
}

function events(state: Record<string, unknown>): Record<string, unknown>[] {
  if (state.effect_events == null) {
    const created: Record<string, unknown>[] = [];
    state.effect_events = created;
    return created;
  }
  if (!Array.isArray(state.effect_events)) throw new Error("tcg_v0_2_card_cost_event_stream_invalid");
  return state.effect_events as Record<string, unknown>[];
}

function preflightEvent(state: Record<string, unknown>, eventId: string): void {
  if (state.effect_events != null && !Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_card_cost_event_stream_invalid");
  }
  const existing = Array.isArray(state.effect_events)
    ? state.effect_events as Record<string, unknown>[]
    : [];
  if (existing.some((entry) => String(entry?.event_id || "") === eventId)) {
    throw new Error(`tcg_v0_2_card_cost_event_duplicate:${eventId}`);
  }
}

function baseEvent<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  id: RuntimeV02CardCostIdentity,
  costKind: "damage" | "hand_discard",
): RuntimeV02CardCostEventBase {
  const turn = nonNegativeInteger(state.turn_seq, "tcg_v0_2_card_cost_turn_invalid");
  const active = seat(state.active_seat, "tcg_v0_2_card_cost_active_seat_invalid");
  return {
    event_id: `card-cost:${turn}:${id.source_action_id}:${id.source_step_index}:${costKind}`,
    event: "card_cost_paid",
    turn_seq: turn,
    active_seat: active,
    controller_seat: id.controller_seat,
    action_kind: id.action_kind,
    source_action_id: id.source_action_id,
    source_step_index: id.source_step_index,
    source_card_uid: id.source_card_uid,
    source_card_id: id.source_card_id,
    source_creature_uid: id.source_creature_uid,
  };
}

/** Payment owner extension for self/friendly damage paid as a card cost. */
export function runtimeV02ApplyDamageCardCost<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  request: RuntimeV02DamageCardCostRequest<T>,
): RuntimeV02DamageCardCostResult {
  const id = identity(request.identity);
  const target = creatureRef(request.target);
  const amount = nonNegativeAmount(request.amount, "tcg_v0_2_card_cost_damage_amount_invalid");
  if (target.controller_seat !== id.controller_seat) {
    throw new Error("tcg_v0_2_card_cost_damage_friendly_target_required");
  }
  runtimeV02PreflightDefeatScan(state, request.defeat_describe);
  const base = baseEvent(state, id, "damage");
  preflightEvent(state, base.event_id);

  const simulated = structuredClone(state) as RuntimeV02CardCostState<T>;
  const simulatedTarget = resolveCreature(simulated, target);
  runtimeV02PlaceDamage(simulatedTarget, amount);
  runtimeV02ScanAndQueueDefeats(simulated, request.defeat_describe, {
    action_kind: id.action_kind,
    source_action_id: id.source_action_id,
    source_controller_seat: id.controller_seat,
    source_card_uid: id.source_card_uid,
  });

  const realTarget = resolveCreature(state, target);
  const receipt = runtimeV02PlaceDamage(realTarget, amount);
  const defeat = runtimeV02ScanAndQueueDefeats(state, request.defeat_describe, {
    action_kind: id.action_kind,
    source_action_id: id.source_action_id,
    source_controller_seat: id.controller_seat,
    source_card_uid: id.source_card_uid,
  });
  const event: RuntimeV02DamageCardCostEvent = {
    ...base,
    cost_kind: "damage",
    target_controller_seat: target.controller_seat,
    target_creature_uid: target.anchor_uid,
    requested_amount: receipt.requested_amount,
    actual_damage_placed: receipt.actual_damage_placed,
  };
  events(state).push(event);
  return { receipt, event, defeat };
}

/** Payment owner extension for exact hand-discard card costs. */
export function runtimeV02ApplyHandDiscardCardCost<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  request: RuntimeV02HandDiscardCardCostRequest,
): RuntimeV02HandDiscardCardCostResult<T> {
  const id = identity(request.identity);
  if (!Array.isArray(request.card_uids) || request.card_uids.length < 1) {
    throw new Error("tcg_v0_2_card_cost_discard_cards_required");
  }
  const player = state.players?.[String(id.controller_seat)];
  if (!player || !Array.isArray(player.hand) || !Array.isArray(player.discard)) {
    throw new Error("tcg_v0_2_card_cost_discard_zones_invalid");
  }
  const cardUids = request.card_uids.map((value, index) =>
    requiredString(value, `tcg_v0_2_card_cost_discard_uid_invalid:${index}`)
  );
  if (new Set(cardUids).size !== cardUids.length) {
    throw new Error("tcg_v0_2_card_cost_discard_uid_duplicate");
  }
  const base = baseEvent(state, id, "hand_discard");
  preflightEvent(state, base.event_id);
  const preflight = runtimeV02PreflightCardZoneTransfer(player.hand, player.discard, {
    cause: "effect",
    action_kind: id.action_kind,
    source_action_id: id.source_action_id,
    source_card_uid: id.source_card_uid,
    source: { controller_seat: id.controller_seat, zone: "hand", owner_card_uid: null },
    destination: { controller_seat: id.controller_seat, zone: "discard", owner_card_uid: null },
    card_uids: cardUids,
    destination_position: "bottom",
  });
  const result = runtimeV02CommitCardZoneTransfer(player.hand, player.discard, preflight);
  const event: RuntimeV02HandDiscardCardCostEvent = {
    ...base,
    cost_kind: "hand_discard",
    discarded_card_uids: [...result.receipt.card_uids],
    discarded_count: result.receipt.count,
  };
  events(state).push(event);
  return { cards: result.cards, transfer: result.receipt, event };
}
