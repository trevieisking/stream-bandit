import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerFlow,
} from "./tcg-match-event-listener-v0-2.ts";
import type { RuntimeV02EssenceAttachmentOriginZone } from "./tcg-match-essence-attachment-event-v0-2.ts";
import {
  runtimeV02ApplyEssenceAttachmentTransaction,
  type RuntimeV02EssenceAttachmentTransaction,
  type RuntimeV02EssenceAttachmentTransactionOptions,
} from "./tcg-match-essence-attachment-engine-v0-2.ts";

export {
  runtimeV02ApplyEssenceAttachmentTransaction,
  type RuntimeV02EssenceAttachmentTransaction,
} from "./tcg-match-essence-attachment-engine-v0-2.ts";

export type RuntimeV02EssenceAttachmentRouteOptions = RuntimeV02EssenceAttachmentTransactionOptions;

export type RuntimeV02ExternalEssenceAttachmentRoute = RuntimeV02EssenceAttachmentTransaction & {
  flow: RuntimeV02EventListenerFlow;
};

/**
 * External orchestration boundary for the Essence Attachment system.
 *
 * External callers provide source-card UID identity only. The Attachment Engine
 * owns physical source removal, exact-instance attachment, attachment metadata,
 * lifecycle registration, canonical receipt and listener-event creation. This
 * route only starts the existing generic Event Listener continuation after the
 * engine-owned transaction succeeds.
 */
export function runtimeV02BeginExternalEssenceAttachmentRoute(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCardUid: string,
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  options: RuntimeV02EssenceAttachmentRouteOptions = {},
): RuntimeV02ExternalEssenceAttachmentRoute {
  const transaction = runtimeV02ApplyEssenceAttachmentTransaction(
    state,
    controllerSeat,
    targetCreatureUid,
    sourceCardUid,
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
