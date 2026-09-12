import type { RuntimeV02RealmPlayReceipt } from "./tcg-match-realm-engine-v0-2.ts";

export type RuntimeV02RealmReplacedEvent = {
  event_id: string;
  event: "realm_replaced";
  subject_uid: string;
  subject_card_id: string;
  controller_seat: 1 | 2;
  source_controller_seat: 1 | 2;
  origin_zone: "realm";
  destination_zone: "realm";
  destination_index: null;
  phase: string;
  source_action_id: string;
  source_card_uid: string;
  action_kind: string;
  turn_seq: number;
  previous_controller_seat: 1 | 2;
  previous_card_uid: string;
  previous_card_id: string;
  incoming_controller_seat: 1 | 2;
  incoming_card_uid: string;
  incoming_card_id: string;
  event_count: 1;
};

type RealmInstance = {
  uid: string;
  card_id: string;
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

function normalizedSeat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_realm_replaced_event_turn_seq_invalid");
  }
  return turn;
}

function normalizedInstance(value: unknown, error: string): RealmInstance {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function discardForSeat(
  state: Record<string, unknown>,
  seat: 1 | 2,
): unknown[] {
  const players = objectRecord(state.players);
  const current = players ? objectRecord(players[String(seat)]) : null;
  if (!current || !Array.isArray(current.discard)) {
    throw new Error("tcg_v0_2_realm_replaced_event_player_discard_invalid");
  }
  return current.discard;
}

function assertCurrentRealm(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  turn: number,
  incoming: RealmInstance,
): void {
  const realm = objectRecord(state.realm);
  if (!realm) {
    throw new Error("tcg_v0_2_realm_replaced_event_active_realm_missing");
  }
  const ownerSeat = normalizedSeat(
    realm.owner_seat,
    "tcg_v0_2_realm_replaced_event_active_owner_invalid",
  );
  if (ownerSeat !== controllerSeat) {
    throw new Error("tcg_v0_2_realm_replaced_event_active_owner_mismatch");
  }
  const playedTurn = Number(realm.played_turn);
  if (!Number.isInteger(playedTurn) || playedTurn !== turn) {
    throw new Error("tcg_v0_2_realm_replaced_event_active_turn_mismatch");
  }
  const card = normalizedInstance(
    realm.card,
    "tcg_v0_2_realm_replaced_event_active_card_invalid",
  );
  if (card.uid !== incoming.uid || card.card_id !== incoming.card_id) {
    throw new Error("tcg_v0_2_realm_replaced_event_active_identity_mismatch");
  }
}

function assertPreviousRealmDiscarded(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  previous: RealmInstance,
): void {
  const discard = discardForSeat(state, controllerSeat);
  const matches = discard
    .map((card, index) =>
      normalizedInstance(
        card,
        `tcg_v0_2_realm_replaced_event_discard_card_invalid:${index}`,
      )
    )
    .filter((card) => card.uid === previous.uid);
  if (matches.length === 0) {
    throw new Error("tcg_v0_2_realm_replaced_event_previous_not_discarded");
  }
  if (matches.length !== 1) {
    throw new Error("tcg_v0_2_realm_replaced_event_previous_uid_duplicate");
  }
  if (matches[0].card_id !== previous.card_id) {
    throw new Error("tcg_v0_2_realm_replaced_event_previous_identity_mismatch");
  }
}

function recordEvent(
  state: Record<string, unknown>,
  event: RuntimeV02RealmReplacedEvent,
): void {
  const events = Array.isArray(state.effect_events)
    ? state.effect_events as Record<string, unknown>[]
    : (state.effect_events = []) as Record<string, unknown>[];
  if (!events.some((entry) => entry.event_id === event.event_id)) {
    events.push(structuredClone(event) as unknown as Record<string, unknown>);
  }
}

/**
 * Canonical context event for a Realm replacement that has already committed.
 *
 * Realm Engine owns the shared-slot mutation. This owner only proves the
 * post-transaction state, records old/new Realm identity/controller context,
 * and returns an immutable event for the Generic Event Listener Engine.
 */
export function runtimeV02CreateRealmReplacedEvent(
  state: Record<string, unknown>,
  receipt: RuntimeV02RealmPlayReceipt,
  input: {
    phase: string;
    action_kind: string;
  },
): RuntimeV02RealmReplacedEvent {
  const turn = currentTurn(state);
  if (!receipt || receipt.schema !== "sb-tcg-realm-transaction-v0.2") {
    throw new Error("tcg_v0_2_realm_replaced_event_receipt_invalid");
  }
  if (receipt.event_name !== "realm_replaced") {
    throw new Error("tcg_v0_2_realm_replaced_event_replacement_required");
  }
  if (receipt.turn_seq !== turn) {
    throw new Error("tcg_v0_2_realm_replaced_event_receipt_turn_mismatch");
  }

  const controllerSeat = normalizedSeat(
    receipt.controller_seat,
    "tcg_v0_2_realm_replaced_event_controller_invalid",
  );
  const previousControllerSeat = normalizedSeat(
    receipt.previous_controller_seat,
    "tcg_v0_2_realm_replaced_event_previous_controller_invalid",
  );
  const sourceActionId = requiredString(
    receipt.source_action_id,
    "tcg_v0_2_realm_replaced_event_source_action_id_required",
  );
  const phase = requiredString(
    input?.phase,
    "tcg_v0_2_realm_replaced_event_phase_required",
  );
  const actionKind = requiredString(
    input?.action_kind,
    "tcg_v0_2_realm_replaced_event_action_kind_required",
  );
  const incoming: RealmInstance = {
    uid: requiredString(
      receipt.incoming_card_uid,
      "tcg_v0_2_realm_replaced_event_incoming_uid_required",
    ),
    card_id: requiredString(
      receipt.incoming_card_id,
      "tcg_v0_2_realm_replaced_event_incoming_card_id_required",
    ),
  };
  const previous: RealmInstance = {
    uid: requiredString(
      receipt.previous_card_uid,
      "tcg_v0_2_realm_replaced_event_previous_uid_required",
    ),
    card_id: requiredString(
      receipt.previous_card_id,
      "tcg_v0_2_realm_replaced_event_previous_card_id_required",
    ),
  };

  if (incoming.uid === previous.uid) {
    throw new Error("tcg_v0_2_realm_replaced_event_uid_collision");
  }
  if (incoming.card_id === previous.card_id) {
    throw new Error("tcg_v0_2_realm_replaced_event_same_named_replacement_invalid");
  }

  // The replacement event is valid only after Realm Engine has made the new
  // Realm authoritative and the previous Realm is already in its old owner's
  // discard. This prevents the replaced Realm from remaining a live listener.
  assertCurrentRealm(state, controllerSeat, turn, incoming);
  assertPreviousRealmDiscarded(state, previousControllerSeat, previous);

  const event: RuntimeV02RealmReplacedEvent = {
    event_id: [
      "realm-replaced",
      turn,
      controllerSeat,
      previousControllerSeat,
      actionKind,
      sourceActionId,
      previous.uid,
      incoming.uid,
    ].join(":"),
    event: "realm_replaced",
    subject_uid: incoming.uid,
    subject_card_id: incoming.card_id,
    controller_seat: controllerSeat,
    source_controller_seat: controllerSeat,
    origin_zone: "realm",
    destination_zone: "realm",
    destination_index: null,
    phase,
    source_action_id: sourceActionId,
    source_card_uid: incoming.uid,
    action_kind: actionKind,
    turn_seq: turn,
    previous_controller_seat: previousControllerSeat,
    previous_card_uid: previous.uid,
    previous_card_id: previous.card_id,
    incoming_controller_seat: controllerSeat,
    incoming_card_uid: incoming.uid,
    incoming_card_id: incoming.card_id,
    event_count: 1,
  };
  recordEvent(state, event);
  return structuredClone(event);
}
