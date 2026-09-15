import type {
  RuntimeV02DamageCardCostEvent,
  RuntimeV02HandDiscardCardCostEvent,
} from "./tcg-match-payment-cost-v0-2.ts";
import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerEvent,
  type RuntimeV02EventListenerFlow,
} from "./tcg-match-event-listener-v0-2.ts";

export type RuntimeV02CardCostEvent =
  | RuntimeV02DamageCardCostEvent
  | RuntimeV02HandDiscardCardCostEvent;

function requiredString(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function turn(value: unknown): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new Error("tcg_v0_2_cost_listener_turn_invalid");
  }
  return number;
}

/**
 * Owner #28 adapter for canonical Payment/Cost receipts.
 *
 * The cost ledger keeps one stable `card_cost_paid` domain event. Listener data
 * receives a more precise event name so cards can subscribe to damage costs or
 * hand-discard costs without teaching the listener engine a parallel cost-kind
 * predicate. Original action/source identity is preserved unchanged.
 */
export function runtimeV02AdaptCardCostEventForListener(
  state: Record<string, unknown>,
  raw: RuntimeV02CardCostEvent,
): RuntimeV02EventListenerEvent {
  if (!raw || typeof raw !== "object" || raw.event !== "card_cost_paid") {
    throw new Error("tcg_v0_2_cost_listener_event_invalid");
  }
  const controller = seat(raw.controller_seat, "tcg_v0_2_cost_listener_controller_invalid");
  const phase = typeof state.phase === "string" && state.phase.trim()
    ? state.phase.trim()
    : "resolution";
  const eventId = requiredString(raw.event_id, "tcg_v0_2_cost_listener_event_id_required");
  const sourceCardUid = requiredString(raw.source_card_uid, "tcg_v0_2_cost_listener_source_card_uid_required");
  const sourceCreatureUid = raw.source_creature_uid == null
    ? null
    : requiredString(raw.source_creature_uid, "tcg_v0_2_cost_listener_source_creature_uid_invalid");

  if (raw.cost_kind === "damage") {
    return {
      event_id: eventId,
      event: "damage_card_cost_paid",
      subject_uid: requiredString(raw.target_creature_uid, "tcg_v0_2_cost_listener_damage_target_uid_required"),
      controller_seat: controller,
      source_controller_seat: controller,
      origin_zone: "field",
      destination_zone: "field",
      destination_index: null,
      phase,
      source_action_id: requiredString(raw.source_action_id, "tcg_v0_2_cost_listener_source_action_id_required"),
      source_card_uid: sourceCardUid,
      action_kind: requiredString(raw.action_kind, "tcg_v0_2_cost_listener_action_kind_required"),
      turn_seq: turn(raw.turn_seq),
    };
  }

  if (raw.cost_kind === "hand_discard") {
    return {
      event_id: eventId,
      event: "hand_discard_card_cost_paid",
      subject_uid: sourceCreatureUid || sourceCardUid,
      subject_card_id: requiredString(raw.source_card_id, "tcg_v0_2_cost_listener_source_card_id_required"),
      controller_seat: controller,
      source_controller_seat: controller,
      origin_zone: "hand",
      destination_zone: "discard",
      destination_index: null,
      phase,
      source_action_id: requiredString(raw.source_action_id, "tcg_v0_2_cost_listener_source_action_id_required"),
      source_card_uid: sourceCardUid,
      action_kind: requiredString(raw.action_kind, "tcg_v0_2_cost_listener_action_kind_required"),
      turn_seq: turn(raw.turn_seq),
    };
  }

  throw new Error("tcg_v0_2_cost_listener_kind_unsupported");
}

export function runtimeV02AdaptCardCostEventsForListener(
  state: Record<string, unknown>,
  events: readonly RuntimeV02CardCostEvent[],
): RuntimeV02EventListenerEvent[] {
  if (!Array.isArray(events)) throw new Error("tcg_v0_2_cost_listener_events_required");
  return events.map((event) => runtimeV02AdaptCardCostEventForListener(state, event));
}

export function runtimeV02BeginCardCostEventListenerContinuation(
  state: Record<string, unknown>,
  events: readonly RuntimeV02CardCostEvent[],
): RuntimeV02EventListenerFlow {
  return runtimeV02BeginEventListenerContinuation(
    state,
    runtimeV02AdaptCardCostEventsForListener(state, events),
  );
}
