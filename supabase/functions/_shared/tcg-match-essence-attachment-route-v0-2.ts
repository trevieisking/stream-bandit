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
import { registerStructuredRuntimeEssenceAttachmentLifecycleState } from "./tcg-match-surge-lifecycle-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeV02AttachmentInstance = {
  uid: string;
  card_id: string;
  attached_turn?: number;
  effect_flags?: Record<string, unknown>;
};

type RuntimeV02AttachmentCreature = {
  stack: RuntimeV02AttachmentInstance[];
  essence: RuntimeV02AttachmentInstance[];
};

type RuntimeV02AttachmentTarget = {
  creature: RuntimeV02AttachmentCreature;
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02ExternalEssenceAttachmentRoute = {
  receipt: RuntimeV02EssenceAttachmentEvent;
  listener_event: RuntimeV02EssenceAttachedListenerEvent;
  flow: RuntimeV02EventListenerFlow;
  attached_card?: RuntimeV02AttachmentInstance;
  lifecycle_registered?: boolean | null;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown, error: string): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) throw new Error(error);
  return result;
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attachment_route_turn_seq_invalid");
  }
  return value;
}

function player(state: Record<string, unknown>, ownerSeat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const value = players ? objectRecord(players[String(ownerSeat)]) : null;
  if (!value || !Array.isArray(value.reserve)) {
    throw new Error("tcg_v0_2_attachment_route_player_invalid");
  }
  return value;
}

function creature(value: unknown): RuntimeV02AttachmentCreature | null {
  const raw = objectRecord(value);
  if (!raw || !Array.isArray(raw.stack) || raw.stack.length < 1 || !Array.isArray(raw.essence)) return null;
  const stack = raw.stack as RuntimeV02AttachmentInstance[];
  const essence = raw.essence as RuntimeV02AttachmentInstance[];
  if (stack.some((item) => !item?.uid || !item.card_id) || essence.some((item) => !item?.uid || !item.card_id)) {
    throw new Error("tcg_v0_2_attachment_route_creature_instance_invalid");
  }
  return raw as unknown as RuntimeV02AttachmentCreature;
}

function target(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
): RuntimeV02AttachmentTarget {
  const owner = player(state, controllerSeat);
  const targetUid = text(targetCreatureUid, "tcg_v0_2_attachment_route_target_required");
  const candidates: Array<["vanguard" | "reserve", number | null, unknown]> = [
    ["vanguard", null, owner.vanguard],
    ...[0, 1, 2, 3].map((index) => [
      "reserve",
      index,
      (owner.reserve as unknown[])[index],
    ] as ["reserve", number, unknown]),
  ];
  for (const [where, index, raw] of candidates) {
    if (raw == null) continue;
    const found = creature(raw);
    if (!found) throw new Error("tcg_v0_2_attachment_route_creature_invalid");
    const top = found.stack[found.stack.length - 1];
    if (top.uid === targetUid) return { creature: found, where, index };
  }
  throw new Error("tcg_v0_2_attachment_route_target_missing");
}

function sourceZone(
  state: Record<string, unknown>,
  sourceOwnerSeat: 1 | 2,
  originZone: RuntimeV02EssenceAttachmentOriginZone,
): RuntimeV02AttachmentInstance[] {
  const owner = player(state, sourceOwnerSeat);
  if (originZone === "effect_owned_selection") {
    throw new Error("tcg_v0_2_attachment_route_effect_owned_selection_requires_explicit_owner");
  }
  const raw = owner[originZone];
  if (!Array.isArray(raw)) {
    throw new Error(`tcg_v0_2_attachment_route_source_zone_invalid:${originZone}`);
  }
  return raw as RuntimeV02AttachmentInstance[];
}

function validateEssenceDefinition(state: Record<string, unknown>, instance: RuntimeV02AttachmentInstance): void {
  const definition = runtimeV02Definition(state, instance);
  if (!definition) throw new Error("tcg_v0_2_attachment_route_definition_required");
  if (String(definition.card_family || "") !== "Essence") {
    throw new Error("tcg_v0_2_attachment_route_source_not_essence");
  }
}

function receiptAndEvent(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCard: RuntimeV02AttachmentInstance | { uid?: unknown; card_id?: unknown },
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  options: {
    attachment_kind?: string;
    phase?: string;
    action_kind?: string;
    destination_index?: number | null;
  },
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
 * Canonical attachment route.
 *
 * Passing a source-card UID selects the authoritative transaction path: this
 * owner resolves the canonical source zone and target creature from match
 * state, validates the Essence, sets attachment metadata/lifecycle, transfers
 * the exact instance, creates the attachment receipt/event, and begins the
 * existing generic event continuation.
 *
 * Passing an already-attached source-card object preserves the older bridge
 * contract while existing callers are migrated. That compatibility path owns
 * receipt/event/continuation only and must be retired once every external
 * attachment caller uses the UID transaction path.
 *
 * Nested attachments created while an event-listener continuation is already
 * running must use this module's transaction semantics but append their event
 * to the existing continuation rather than recursively begin another one.
 */
export function runtimeV02BeginExternalEssenceAttachmentRoute(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCardOrUid: { uid?: unknown; card_id?: unknown } | string,
  originZone: RuntimeV02EssenceAttachmentOriginZone,
  sourceActionId: string,
  options: {
    attachment_kind?: string;
    phase?: string;
    action_kind?: string;
    destination_index?: number | null;
    source_owner_seat?: 1 | 2;
    effect_flags?: Record<string, unknown>;
  } = {},
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

  const currentTurn = turn(state);
  const targetField = target(state, controller, targetCreatureUid);
  if (options.destination_index !== undefined && options.destination_index !== targetField.index) {
    throw new Error("tcg_v0_2_attachment_route_destination_index_mismatch");
  }
  const sourceOwner = options.source_owner_seat == null
    ? controller
    : seat(options.source_owner_seat, "tcg_v0_2_attachment_route_source_owner_seat_invalid");
  const zone = sourceZone(state, sourceOwner, originZone);
  const sourceUid = text(sourceCardOrUid, "tcg_v0_2_attachment_route_source_uid_required");
  const sourceIndex = zone.findIndex((item) => item?.uid === sourceUid);
  if (sourceIndex < 0) throw new Error("tcg_v0_2_attachment_route_source_missing");
  const source = zone[sourceIndex];
  if (!source?.card_id) throw new Error("tcg_v0_2_attachment_route_source_instance_invalid");
  if (targetField.creature.essence.some((item) => item.uid === sourceUid)) {
    throw new Error("tcg_v0_2_attachment_route_source_already_attached");
  }
  validateEssenceDefinition(state, source);

  // Validate lifecycle shape against a clone before mutating canonical zones.
  const lifecycleProbe = structuredClone(source);
  const lifecycleRegistered = registerStructuredRuntimeEssenceAttachmentLifecycleState(
    state,
    lifecycleProbe,
    currentTurn,
  );

  const attached = zone.splice(sourceIndex, 1)[0];
  attached.attached_turn = currentTurn;
  if (options.effect_flags != null) {
    attached.effect_flags = {
      ...(attached.effect_flags || {}),
      ...structuredClone(options.effect_flags),
    };
  }
  registerStructuredRuntimeEssenceAttachmentLifecycleState(state, attached, currentTurn);
  targetField.creature.essence.push(attached);

  const { receipt, listenerEvent } = receiptAndEvent(
    state,
    controller,
    targetCreatureUid,
    attached,
    originZone,
    sourceActionId,
    {
      ...options,
      destination_index: targetField.index,
    },
  );
  const flow = runtimeV02BeginEventListenerContinuation(state, [listenerEvent]);
  return {
    receipt: { ...receipt },
    listener_event: structuredClone(listenerEvent),
    flow,
    attached_card: attached,
    lifecycle_registered: lifecycleRegistered,
  };
}
