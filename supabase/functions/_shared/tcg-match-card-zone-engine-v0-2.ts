export type RuntimeV02CardZoneInstance = {
  uid: string;
  card_id: string;
};

export type RuntimeV02CardZoneKind =
  | "deck"
  | "hand"
  | "discard"
  | "rewards"
  | "void"
  | "creature_stack"
  | "attached_essence"
  | "attached_relic";

export type RuntimeV02CardZoneEndpoint = {
  controller_seat: 1 | 2;
  zone: RuntimeV02CardZoneKind;
  owner_card_uid: string | null;
};

export type RuntimeV02CardZoneTransferRequest = {
  cause: "effect" | "rule";
  action_kind: string;
  source_action_id: string;
  source_card_uid: string | null;
  source: RuntimeV02CardZoneEndpoint;
  destination: RuntimeV02CardZoneEndpoint;
  card_uids: readonly unknown[];
  destination_position: "top" | "bottom";
};

export type RuntimeV02CardZoneTransferReceipt = {
  schema: "sb-tcg-card-zone-transfer-v0.2";
  cause: "effect" | "rule";
  action_kind: string;
  source_action_id: string;
  source_card_uid: string | null;
  source: RuntimeV02CardZoneEndpoint;
  destination: RuntimeV02CardZoneEndpoint;
  card_uids: string[];
  destination_position: "top" | "bottom";
  count: number;
};

export type RuntimeV02CardZoneTransferPreflight<T extends RuntimeV02CardZoneInstance> = {
  cards: T[];
  receipt: RuntimeV02CardZoneTransferReceipt;
  source_snapshot: T[];
  destination_snapshot: T[];
};

export type RuntimeV02CardZoneTransferResult<T extends RuntimeV02CardZoneInstance> = {
  cards: T[];
  receipt: RuntimeV02CardZoneTransferReceipt;
};

export type RuntimeV02CardZonePartitionTransferRequest = {
  cause: "effect" | "rule";
  action_kind: string;
  source_action_id: string;
  source_card_uid: string | null;
  source: RuntimeV02CardZoneEndpoint;
  destination: RuntimeV02CardZoneEndpoint;
  source_window: {
    position: "top" | "bottom";
    card_uids: readonly unknown[];
  };
  destination_card_uids: readonly unknown[];
  source_remainder_position: "top" | "bottom";
  destination_position: "top" | "bottom";
};

export type RuntimeV02CardZonePartitionTransferReceipt = {
  schema: "sb-tcg-card-zone-partition-transfer-v0.2";
  cause: "effect" | "rule";
  action_kind: string;
  source_action_id: string;
  source_card_uid: string | null;
  source: RuntimeV02CardZoneEndpoint;
  destination: RuntimeV02CardZoneEndpoint;
  source_window_position: "top" | "bottom";
  source_window_card_uids: string[];
  destination_card_uids: string[];
  source_remainder_card_uids: string[];
  source_remainder_position: "top" | "bottom";
  destination_position: "top" | "bottom";
  moved_count: number;
  remainder_count: number;
};

export type RuntimeV02CardZonePartitionTransferResult<T extends RuntimeV02CardZoneInstance> = {
  cards: T[];
  remainder: T[];
  receipt: RuntimeV02CardZonePartitionTransferReceipt;
};

const OWNER_REQUIRED_ZONES = new Set<RuntimeV02CardZoneKind>([
  "creature_stack",
  "attached_essence",
  "attached_relic",
]);

const SPECIALIST_DESTINATION_ZONES = new Set<RuntimeV02CardZoneKind>([
  "creature_stack",
  "attached_essence",
  "attached_relic",
]);

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function validateEndpoint(endpoint: RuntimeV02CardZoneEndpoint, role: "source" | "destination"): void {
  if (!endpoint || (endpoint.controller_seat !== 1 && endpoint.controller_seat !== 2)) {
    throw new Error(`tcg_v0_2_card_zone_${role}_controller_invalid`);
  }
  if (
    ![
      "deck",
      "hand",
      "discard",
      "rewards",
      "void",
      "creature_stack",
      "attached_essence",
      "attached_relic",
    ].includes(endpoint.zone)
  ) {
    throw new Error(`tcg_v0_2_card_zone_${role}_kind_invalid`);
  }
  if (OWNER_REQUIRED_ZONES.has(endpoint.zone)) {
    requiredString(endpoint.owner_card_uid, `tcg_v0_2_card_zone_${role}_owner_required`);
  } else if (endpoint.owner_card_uid !== null) {
    throw new Error(`tcg_v0_2_card_zone_${role}_owner_forbidden`);
  }
}

function validateZone<T extends RuntimeV02CardZoneInstance>(
  zone: T[],
  role: "source" | "destination",
): Map<string, T> {
  if (!Array.isArray(zone)) throw new Error(`tcg_v0_2_card_zone_${role}_invalid`);
  const byUid = new Map<string, T>();
  for (let index = 0; index < zone.length; index += 1) {
    const card = zone[index];
    if (!card || typeof card !== "object") {
      throw new Error(`tcg_v0_2_card_zone_${role}_card_invalid:${index}`);
    }
    const uid = requiredString(card.uid, `tcg_v0_2_card_zone_${role}_card_uid_invalid:${index}`);
    requiredString(card.card_id, `tcg_v0_2_card_zone_${role}_card_id_invalid:${index}`);
    if (byUid.has(uid)) throw new Error(`tcg_v0_2_card_zone_${role}_uid_duplicate:${uid}`);
    byUid.set(uid, card);
  }
  return byUid;
}

function normalizedReceipt(request: RuntimeV02CardZoneTransferRequest, cardUids: string[]): RuntimeV02CardZoneTransferReceipt {
  if (request.cause !== "effect" && request.cause !== "rule") {
    throw new Error("tcg_v0_2_card_zone_cause_invalid");
  }
  const actionKind = requiredString(request.action_kind, "tcg_v0_2_card_zone_action_kind_required");
  const sourceActionId = requiredString(request.source_action_id, "tcg_v0_2_card_zone_source_action_id_required");
  const sourceCardUid = request.source_card_uid === null
    ? null
    : requiredString(request.source_card_uid, "tcg_v0_2_card_zone_source_card_uid_invalid");
  if (request.destination_position !== "top" && request.destination_position !== "bottom") {
    throw new Error("tcg_v0_2_card_zone_destination_position_invalid");
  }
  validateEndpoint(request.source, "source");
  validateEndpoint(request.destination, "destination");
  if (SPECIALIST_DESTINATION_ZONES.has(request.destination.zone)) {
    throw new Error("tcg_v0_2_card_zone_specialist_destination_owned");
  }
  return {
    schema: "sb-tcg-card-zone-transfer-v0.2",
    cause: request.cause,
    action_kind: actionKind,
    source_action_id: sourceActionId,
    source_card_uid: sourceCardUid,
    source: { ...request.source },
    destination: { ...request.destination },
    card_uids: [...cardUids],
    destination_position: request.destination_position,
    count: cardUids.length,
  };
}

/**
 * Canonical non-payment card-zone transaction preflight.
 *
 * Callers own mechanic legality and selection. Payment and attachment owners
 * remain separate; this owner only proves an exact, collision-free movement.
 */
export function runtimeV02PreflightCardZoneTransfer<T extends RuntimeV02CardZoneInstance>(
  sourceZone: T[],
  destinationZone: T[],
  request: RuntimeV02CardZoneTransferRequest,
): RuntimeV02CardZoneTransferPreflight<T> {
  if (sourceZone === destinationZone) throw new Error("tcg_v0_2_card_zone_same_array_unsupported");
  if (!Array.isArray(request.card_uids) || request.card_uids.length < 1) {
    throw new Error("tcg_v0_2_card_zone_card_uids_required");
  }
  const cardUids = request.card_uids.map((value, index) =>
    requiredString(value, `tcg_v0_2_card_zone_card_uid_invalid:${index}`)
  );
  if (new Set(cardUids).size !== cardUids.length) {
    throw new Error("tcg_v0_2_card_zone_card_uid_duplicate");
  }

  const sourceByUid = validateZone(sourceZone, "source");
  const destinationByUid = validateZone(destinationZone, "destination");
  const cards = cardUids.map((uid) => {
    const card = sourceByUid.get(uid);
    if (!card) throw new Error(`tcg_v0_2_card_zone_selected_card_missing:${uid}`);
    if (destinationByUid.has(uid)) throw new Error(`tcg_v0_2_card_zone_destination_uid_collision:${uid}`);
    return card;
  });

  return {
    cards,
    receipt: normalizedReceipt(request, cardUids),
    source_snapshot: [...sourceZone],
    destination_snapshot: [...destinationZone],
  };
}

function requestFromReceipt(receipt: RuntimeV02CardZoneTransferReceipt): RuntimeV02CardZoneTransferRequest {
  return {
    cause: receipt.cause,
    action_kind: receipt.action_kind,
    source_action_id: receipt.source_action_id,
    source_card_uid: receipt.source_card_uid,
    source: { ...receipt.source },
    destination: { ...receipt.destination },
    card_uids: [...receipt.card_uids],
    destination_position: receipt.destination_position,
  };
}

function sameSnapshot<T extends RuntimeV02CardZoneInstance>(actual: T[], expected: T[]): boolean {
  return actual.length === expected.length && actual.every((card, index) => Object.is(card, expected[index]));
}

/**
 * Commits an already validated synchronous preflight. Exact zone snapshots are
 * rechecked so effect-specific owners can validate their own frozen identity
 * between Card-Zone preflight and Card-Zone mutation without taking mutation
 * authority back from this engine.
 */
export function runtimeV02CommitCardZoneTransfer<T extends RuntimeV02CardZoneInstance>(
  sourceZone: T[],
  destinationZone: T[],
  preflight: RuntimeV02CardZoneTransferPreflight<T>,
): RuntimeV02CardZoneTransferResult<T> {
  const current = runtimeV02PreflightCardZoneTransfer(
    sourceZone,
    destinationZone,
    requestFromReceipt(preflight.receipt),
  );
  if (
    !sameSnapshot(sourceZone, preflight.source_snapshot) ||
    !sameSnapshot(destinationZone, preflight.destination_snapshot) ||
    current.cards.some((card, index) => !Object.is(card, preflight.cards[index]))
  ) {
    throw new Error("tcg_v0_2_card_zone_preflight_stale");
  }

  const selected = new Set(current.receipt.card_uids);
  const remaining = sourceZone.filter((card) => !selected.has(card.uid));
  sourceZone.splice(0, sourceZone.length, ...remaining);
  if (current.receipt.destination_position === "top") {
    destinationZone.splice(0, 0, ...current.cards);
  } else {
    destinationZone.push(...current.cards);
  }

  return { cards: current.cards, receipt: current.receipt };
}

/**
 * Applies one atomic non-payment transfer after all source and destination
 * validation succeeds. Moved instances are never cloned.
 */
export function runtimeV02ApplyCardZoneTransfer<T extends RuntimeV02CardZoneInstance>(
  sourceZone: T[],
  destinationZone: T[],
  request: RuntimeV02CardZoneTransferRequest,
): RuntimeV02CardZoneTransferResult<T> {
  const preflight = runtimeV02PreflightCardZoneTransfer(sourceZone, destinationZone, request);
  return runtimeV02CommitCardZoneTransfer(sourceZone, destinationZone, preflight);
}

/**
 * Atomically partitions one exact positional source window: selected cards move
 * to a distinct destination while the unselected window remainder is placed at
 * the requested end of the source zone. This supports generic look/search and
 * choose/remainder programs without giving callers direct zone mutation.
 */
export function runtimeV02ApplyCardZonePartitionTransfer<T extends RuntimeV02CardZoneInstance>(
  sourceZone: T[],
  destinationZone: T[],
  request: RuntimeV02CardZonePartitionTransferRequest,
): RuntimeV02CardZonePartitionTransferResult<T> {
  if (sourceZone === destinationZone) throw new Error("tcg_v0_2_card_zone_partition_same_array_unsupported");
  if (!request.source_window || !Array.isArray(request.source_window.card_uids) || request.source_window.card_uids.length < 1) {
    throw new Error("tcg_v0_2_card_zone_partition_window_uids_required");
  }
  if (request.source_window.position !== "top" && request.source_window.position !== "bottom") {
    throw new Error("tcg_v0_2_card_zone_partition_window_position_invalid");
  }
  if (!Array.isArray(request.destination_card_uids) || request.destination_card_uids.length < 1) {
    throw new Error("tcg_v0_2_card_zone_partition_destination_uids_required");
  }
  if (request.source_remainder_position !== "top" && request.source_remainder_position !== "bottom") {
    throw new Error("tcg_v0_2_card_zone_partition_remainder_position_invalid");
  }

  const windowUids = request.source_window.card_uids.map((value, index) =>
    requiredString(value, `tcg_v0_2_card_zone_partition_window_uid_invalid:${index}`)
  );
  if (new Set(windowUids).size !== windowUids.length) {
    throw new Error("tcg_v0_2_card_zone_partition_window_uid_duplicate");
  }
  const destinationUids = request.destination_card_uids.map((value, index) =>
    requiredString(value, `tcg_v0_2_card_zone_partition_destination_uid_invalid:${index}`)
  );
  if (new Set(destinationUids).size !== destinationUids.length) {
    throw new Error("tcg_v0_2_card_zone_partition_destination_uid_duplicate");
  }
  const windowUidSet = new Set(windowUids);
  for (const uid of destinationUids) {
    if (!windowUidSet.has(uid)) {
      throw new Error(`tcg_v0_2_card_zone_partition_destination_outside_window:${uid}`);
    }
  }

  const baseReceipt = normalizedReceipt({
    cause: request.cause,
    action_kind: request.action_kind,
    source_action_id: request.source_action_id,
    source_card_uid: request.source_card_uid,
    source: request.source,
    destination: request.destination,
    card_uids: destinationUids,
    destination_position: request.destination_position,
  }, destinationUids);
  validateZone(sourceZone, "source");
  const destinationByUid = validateZone(destinationZone, "destination");

  if (sourceZone.length < windowUids.length) {
    throw new Error("tcg_v0_2_card_zone_partition_window_changed");
  }
  const window = request.source_window.position === "top"
    ? sourceZone.slice(0, windowUids.length)
    : sourceZone.slice(sourceZone.length - windowUids.length);
  for (let index = 0; index < windowUids.length; index += 1) {
    if (window[index].uid !== windowUids[index]) {
      throw new Error("tcg_v0_2_card_zone_partition_window_changed");
    }
  }

  const windowByUid = new Map(window.map((card) => [card.uid, card] as const));
  const cards = destinationUids.map((uid) => {
    if (destinationByUid.has(uid)) throw new Error(`tcg_v0_2_card_zone_destination_uid_collision:${uid}`);
    const card = windowByUid.get(uid);
    if (!card) throw new Error(`tcg_v0_2_card_zone_partition_destination_outside_window:${uid}`);
    return card;
  });
  const selected = new Set(destinationUids);
  const remainder = window.filter((card) => !selected.has(card.uid));
  const outside = request.source_window.position === "top"
    ? sourceZone.slice(window.length)
    : sourceZone.slice(0, sourceZone.length - window.length);
  const nextSource = request.source_remainder_position === "top"
    ? [...remainder, ...outside]
    : [...outside, ...remainder];

  sourceZone.splice(0, sourceZone.length, ...nextSource);
  if (baseReceipt.destination_position === "top") {
    destinationZone.splice(0, 0, ...cards);
  } else {
    destinationZone.push(...cards);
  }

  return {
    cards,
    remainder,
    receipt: {
      schema: "sb-tcg-card-zone-partition-transfer-v0.2",
      cause: baseReceipt.cause,
      action_kind: baseReceipt.action_kind,
      source_action_id: baseReceipt.source_action_id,
      source_card_uid: baseReceipt.source_card_uid,
      source: baseReceipt.source,
      destination: baseReceipt.destination,
      source_window_position: request.source_window.position,
      source_window_card_uids: windowUids,
      destination_card_uids: destinationUids,
      source_remainder_card_uids: remainder.map((card) => card.uid),
      source_remainder_position: request.source_remainder_position,
      destination_position: baseReceipt.destination_position,
      moved_count: cards.length,
      remainder_count: remainder.length,
    },
  };
}
