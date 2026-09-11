import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerFlow,
} from "./tcg-match-event-listener-v0-2.ts";
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
  type RuntimeV02EssenceAttachedListenerEvent,
  type RuntimeV02EssenceAttachmentEvent,
  type RuntimeV02EssenceAttachmentOriginZone,
} from "./tcg-match-essence-attachment-event-v0-2.ts";
import {
  runtimeV02ApplyEssenceAttachmentTransaction,
  type RuntimeV02AttachmentInstance,
  type RuntimeV02EssenceAttachmentTransaction,
  type RuntimeV02EssenceAttachmentTransactionOptions,
} from "./tcg-match-essence-attachment-engine-v0-2.ts";

export {
  runtimeV02ApplyEssenceAttachmentTransaction,
  type RuntimeV02EssenceAttachmentTransaction,
} from "./tcg-match-essence-attachment-engine-v0-2.ts";

export type RuntimeV02EssenceAttachmentRouteOptions = RuntimeV02EssenceAttachmentTransactionOptions;

export type RuntimeV02ExternalEssenceAttachmentRoute = {
  receipt: RuntimeV02EssenceAttachmentEvent;
  listener_event: RuntimeV02EssenceAttachedListenerEvent;
  flow: RuntimeV02EventListenerFlow;
  attached_card?: RuntimeV02AttachmentInstance;
  lifecycle_registered?: boolean | null;
};

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function receiptAndEvent(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCard: { uid?: unknown; card_id?: unknown },
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  options: RuntimeV02EssenceAttachmentRouteOptions,
): { receipt: RuntimeV02EssenceAttachmentEvent; listenerEvent: RuntimeV02EssenceAttachedListenerEvent } {
  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    controllerSeat,
    targetCreatureUid,
    sourceCard,
    originZone,
    sourceActionId,
    options.attachment_kind ?? "normal",
  );
  const listenerEvent = runtimeV02CreateEssenceAttachedEvent(receipt, {
    phase: options.phase,
    action_kind: options.action_kind,
    destination_index: options.destination_index,
  });
  return { receipt, listenerEvent };
}

/**
 * External orchestration boundary for the Essence Attachment system.
 *
 * UID callers delegate physical mutation to the Attachment Engine, then this
 * route begins the existing generic Event Listener continuation. The
 * already-attached object form is a temporary migration bridge only; it will
 * be removed after every external producer uses the engine-owned transaction.
 */
export function runtimeV02BeginExternalEssenceAttachmentRoute(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCardOrUid: { uid?: unknown; card_id?: unknown } | string,
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  options: RuntimeV02EssenceAttachmentRouteOptions = {},
): RuntimeV02ExternalEssenceAttachmentRoute {
  const controller = seat(controllerSeat, "tcg_v0_2_attachment_route_controller_seat_invalid");

  if (typeof sourceCardOrUid !== "string") {
    const { receipt, listenerEvent } = receiptAndEvent(
      state,
      controller,
      targetCreatureUid,
      sourceCardOrUid,
      originZone,
      sourceActionId,
      options,
    );
    const flow = runtimeV02BeginEventListenerContinuation(state, [listenerEvent]);
    return {
      receipt: { ...receipt },
      listener_event: structuredClone(listenerEvent),
      flow,
    };
  }

  const transaction: RuntimeV02EssenceAttachmentTransaction = runtimeV02ApplyEssenceAttachmentTransaction(
    state,
    controller,
    targetCreatureUid,
    sourceCardOrUid,
    originZone,
    sourceActionId,
    options,
  );
  const flow = runtimeV02BeginEventListenerContinuation(state, [transaction.listener_event]);
  return {
    ...transaction,
    flow,
  };
}
