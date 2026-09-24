import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerEvent,
  type RuntimeV02EventListenerFlow,
} from "./tcg-match-event-listener-v0-2.ts";
import {
  runtimeV02AttachRelicFromHand,
  type RuntimeV02RelicAttachmentResult,
  type RuntimeV02RelicInstance,
  type RuntimeV02RelicPlayerState,
} from "./tcg-match-relic-engine-v0-2.ts";

export type RuntimeV02RelicAttachmentRouteOptions = {
  phase?: string;
  action_kind?: string;
};

export type RuntimeV02RelicAttachmentRouteResult = RuntimeV02RelicAttachmentResult & {
  listener_event: RuntimeV02EventListenerEvent;
  flow: RuntimeV02EventListenerFlow;
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
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_relic_attachment_route_turn_invalid");
  }
  return turn;
}

function player(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02RelicPlayerState<RuntimeV02RelicInstance> {
  const players = objectRecord(state.players);
  const selected = players?.[String(controllerSeat)];
  if (!selected || typeof selected !== "object" || Array.isArray(selected)) {
    throw new Error("tcg_v0_2_relic_attachment_route_player_missing");
  }
  return selected as RuntimeV02RelicPlayerState<RuntimeV02RelicInstance>;
}

/**
 * External orchestration boundary for the Relic Attachment system.
 *
 * Relic owns exact hand -> attached_relic mutation and its canonical receipt.
 * This route adapts that receipt into one generic `relic_attached` event and
 * starts Event Listener ownership. Match remains responsible for phases,
 * Movement/Heal continuation, Defeat scanning and public command responses.
 */
export function runtimeV02BeginRelicAttachmentRoute(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCardUid: string,
  sourceActionId: string,
  options: RuntimeV02RelicAttachmentRouteOptions = {},
): RuntimeV02RelicAttachmentRouteResult {
  const turn = currentTurn(state);
  const actionId = requiredString(
    sourceActionId,
    "tcg_v0_2_relic_attachment_route_source_action_required",
  );
  const phase = requiredString(
    options.phase ?? "play",
    "tcg_v0_2_relic_attachment_route_phase_required",
  );
  const actionKind = requiredString(
    options.action_kind ?? "manual_relic",
    "tcg_v0_2_relic_attachment_route_action_kind_required",
  );
  const result = runtimeV02AttachRelicFromHand(
    player(state, controllerSeat),
    controllerSeat,
    targetCreatureUid,
    sourceCardUid,
  );
  const receipt = result.receipt;
  const listenerEvent: RuntimeV02EventListenerEvent = {
    event_id:
      `relic-attached:${turn}:${controllerSeat}:${receipt.source_card_uid}:${receipt.target_creature_uid}`,
    event: receipt.event_name,
    subject_uid: receipt.source_card_uid,
    subject_card_id: receipt.source_card_id,
    controller_seat: receipt.controller_seat,
    source_controller_seat: receipt.controller_seat,
    origin_zone: receipt.origin_zone,
    destination_zone: "field",
    destination_index: receipt.index,
    phase,
    source_action_id: actionId,
    source_card_uid: receipt.source_card_uid,
    action_kind: actionKind,
    turn_seq: turn,
    attachment_target_uid: receipt.target_creature_uid,
  };
  const flow = runtimeV02BeginEventListenerContinuation(state, [listenerEvent]);
  return {
    ...result,
    listener_event: listenerEvent,
    flow,
  };
}
