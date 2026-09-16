import type { RuntimeV02CreatureDefeatedEvent } from "./tcg-match-defeat-engine-v0-2.ts";
import type { RuntimeV02EventListenerEvent } from "./tcg-match-event-listener-v0-2.ts";

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
    throw new Error("tcg_v0_2_defeat_listener_turn_invalid");
  }
  return number;
}

/**
 * Pure Owner #28 envelope adapter for canonical Owner #34 defeat records.
 *
 * It freezes the departed Creature identity into the ordinary Event Listener
 * event shape without starting a continuation or mutating gameplay state.
 */
export function runtimeV02AdaptDefeatEventForListener(
  state: Record<string, unknown>,
  raw: RuntimeV02CreatureDefeatedEvent,
): RuntimeV02EventListenerEvent {
  if (!raw || typeof raw !== "object" || raw.event !== "creature_defeated") {
    throw new Error("tcg_v0_2_defeat_listener_event_invalid");
  }
  const ownerSeat = seat(
    raw.owner_seat,
    "tcg_v0_2_defeat_listener_owner_invalid",
  );
  const sourceController = raw.source_controller_seat == null
    ? undefined
    : seat(
      raw.source_controller_seat,
      "tcg_v0_2_defeat_listener_source_controller_invalid",
    );
  const where = String(raw.where || "");
  if (where !== "vanguard" && where !== "reserve") {
    throw new Error("tcg_v0_2_defeat_listener_origin_zone_invalid");
  }
  if (where === "vanguard" && raw.index !== null) {
    throw new Error("tcg_v0_2_defeat_listener_vanguard_index_invalid");
  }
  if (
    where === "reserve" &&
    (!Number.isInteger(raw.index) || Number(raw.index) < 0 ||
      Number(raw.index) > 3)
  ) {
    throw new Error("tcg_v0_2_defeat_listener_reserve_index_invalid");
  }
  const phase = typeof state.phase === "string" && state.phase.trim()
    ? state.phase.trim()
    : "resolution";
  const eventId = requiredString(
    raw.event_id,
    "tcg_v0_2_defeat_listener_event_id_required",
  );
  const sourceActionId = raw.source_action_id == null
    ? eventId
    : requiredString(
      raw.source_action_id,
      "tcg_v0_2_defeat_listener_source_action_id_invalid",
    );
  const actionKind = raw.action_kind == null
    ? "defeat"
    : requiredString(
      raw.action_kind,
      "tcg_v0_2_defeat_listener_action_kind_invalid",
    );
  const sourceCardUid = raw.source_card_uid == null
    ? null
    : requiredString(
      raw.source_card_uid,
      "tcg_v0_2_defeat_listener_source_card_uid_invalid",
    );

  return {
    event_id: eventId,
    event: "creature_defeated",
    subject_uid: requiredString(
      raw.creature_uid,
      "tcg_v0_2_defeat_listener_subject_uid_required",
    ),
    subject_card_id: requiredString(
      raw.card_id,
      "tcg_v0_2_defeat_listener_subject_card_id_required",
    ),
    controller_seat: ownerSeat,
    ...(sourceController == null
      ? {}
      : { source_controller_seat: sourceController }),
    origin_zone: where,
    destination_zone: "discard",
    destination_index: null,
    phase,
    source_action_id: sourceActionId,
    source_card_uid: sourceCardUid,
    action_kind: actionKind,
    turn_seq: turn(raw.turn_seq),
  };
}

export function runtimeV02AdaptDefeatEventsForListener(
  state: Record<string, unknown>,
  events: readonly RuntimeV02CreatureDefeatedEvent[],
): RuntimeV02EventListenerEvent[] {
  if (!Array.isArray(events)) {
    throw new Error("tcg_v0_2_defeat_listener_events_required");
  }
  return events.map((event) =>
    runtimeV02AdaptDefeatEventForListener(state, event)
  );
}
