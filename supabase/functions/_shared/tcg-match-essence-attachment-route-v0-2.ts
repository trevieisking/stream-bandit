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

export type RuntimeV02ExternalEssenceAttachmentRoute = {
  receipt: RuntimeV02EssenceAttachmentEvent;
  listener_event: RuntimeV02EssenceAttachedListenerEvent;
  flow: RuntimeV02EventListenerFlow;
};

/**
 * Canonical bridge for attachment call sites that are outside the generic
 * event-listener continuation. The physical attachment and lifecycle mutation
 * must already have happened before this function is called.
 *
 * This deliberately composes the existing receipt owner, event adapter and
 * generic continuation instead of introducing another listener engine.
 * Nested attachments created while that continuation is already running must
 * be appended to the existing continuation by its owner rather than recursively
 * beginning a second continuation.
 */
export function runtimeV02BeginExternalEssenceAttachmentRoute(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCard: { uid?: unknown; card_id?: unknown },
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  options: {
    attachment_kind?: string;
    phase?: string;
    action_kind?: string;
    destination_index?: number | null;
  } = {},
): RuntimeV02ExternalEssenceAttachmentRoute {
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
  const flow = runtimeV02BeginEventListenerContinuation(state, [listenerEvent]);
  return {
    receipt: { ...receipt },
    listener_event: structuredClone(listenerEvent),
    flow,
  };
}
