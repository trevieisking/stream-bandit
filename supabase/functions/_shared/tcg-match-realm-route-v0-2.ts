import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerFlow,
} from "./tcg-match-event-listener-v0-2.ts";
import {
  runtimeV02ApplyRealmPlayTransaction,
  type RuntimeV02RealmInstance,
  type RuntimeV02RealmPlayResult,
} from "./tcg-match-realm-engine-v0-2.ts";
import {
  runtimeV02CreateRealmReplacedEvent,
  type RuntimeV02RealmReplacedEvent,
} from "./tcg-match-realm-replaced-event-v0-2.ts";

export type RuntimeV02RealmRouteOptions = {
  phase?: string;
  action_kind?: string;
};

export type RuntimeV02RealmRouteResult<
  T extends RuntimeV02RealmInstance = RuntimeV02RealmInstance,
> = RuntimeV02RealmPlayResult<T> & {
  replacement_event: RuntimeV02RealmReplacedEvent | null;
  flow: RuntimeV02EventListenerFlow;
};

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function completeEventFlow(): RuntimeV02EventListenerFlow {
  return {
    status: "complete",
    processed_listener_keys: [],
    emitted_heal_packet_ids: [],
    emitted_movement_events: [],
    pending_choice: null,
  };
}

/**
 * External orchestration boundary for Realm play/replacement.
 *
 * Realm Engine owns the specialist shared-slot transaction. Realm Replacement
 * Event owns post-transaction replacement context. Generic Event Listener owns
 * triggered listener execution. This route only sequences those owners; it does
 * not mutate hand/discard/Realm itself and does not execute Movement/Heal work.
 */
export function runtimeV02BeginRealmPlayRoute<
  T extends RuntimeV02RealmInstance = RuntimeV02RealmInstance,
>(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  sourceCard: RuntimeV02RealmInstance,
  sourceActionId: string = "play_realm",
  options: RuntimeV02RealmRouteOptions = {},
): RuntimeV02RealmRouteResult<T> {
  const phase = requiredString(
    options.phase ?? "play",
    "tcg_v0_2_realm_route_phase_required",
  );
  const actionKind = requiredString(
    options.action_kind ?? "realm",
    "tcg_v0_2_realm_route_action_kind_required",
  );
  const actionId = requiredString(
    sourceActionId,
    "tcg_v0_2_realm_route_source_action_id_required",
  );

  // Validate routing context before the engine is allowed to mutate state.
  const transaction = runtimeV02ApplyRealmPlayTransaction<T>(
    state,
    controllerSeat,
    sourceCard,
    actionId,
  );

  if (transaction.receipt.event_name !== "realm_replaced") {
    return {
      ...transaction,
      replacement_event: null,
      flow: completeEventFlow(),
    };
  }

  const replacementEvent = runtimeV02CreateRealmReplacedEvent(
    state,
    transaction.receipt,
    {
      phase,
      action_kind: actionKind,
    },
  );
  const flow = runtimeV02BeginEventListenerContinuation(state, [replacementEvent]);

  return {
    ...transaction,
    replacement_event: replacementEvent,
    flow,
  };
}
