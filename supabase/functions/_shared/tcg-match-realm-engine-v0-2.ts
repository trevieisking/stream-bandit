export type RuntimeV02RealmInstance = {
  uid: string;
  card_id: string;
};

export type RuntimeV02RealmSlot<T extends RuntimeV02RealmInstance = RuntimeV02RealmInstance> = {
  card: T;
  owner_seat: 1 | 2;
  played_turn: number;
};

export type RuntimeV02RealmPlayReceipt = {
  schema: "sb-tcg-realm-transaction-v0.2";
  controller_seat: 1 | 2;
  turn_seq: number;
  source_action_id: string;
  incoming_card_uid: string;
  incoming_card_id: string;
  previous_controller_seat: 1 | 2 | null;
  previous_card_uid: string | null;
  previous_card_id: string | null;
  event_name: "realm_replaced" | null;
};

export type RuntimeV02RealmPlayResult<T extends RuntimeV02RealmInstance> = {
  realm: RuntimeV02RealmSlot<T>;
  replaced_realm: RuntimeV02RealmSlot<T> | null;
  receipt: RuntimeV02RealmPlayReceipt;
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
    throw new Error("tcg_v0_2_realm_turn_seq_invalid");
  }
  return turn;
}

function player(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const current = players ? objectRecord(players[String(seat)]) : null;
  if (!current || !Array.isArray(current.hand) || !Array.isArray(current.discard)) {
    throw new Error("tcg_v0_2_realm_player_zones_invalid");
  }
  return current;
}

function instance<T extends RuntimeV02RealmInstance>(
  value: unknown,
  error: string,
): T {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  requiredString(raw.uid, `${error}:uid`);
  requiredString(raw.card_id, `${error}:card_id`);
  return value as T;
}

function exactHandCard<T extends RuntimeV02RealmInstance>(
  hand: T[],
  wanted: RuntimeV02RealmInstance,
): { card: T; index: number } {
  const matches = hand
    .map((card, index) => ({ card: instance<T>(card, `tcg_v0_2_realm_hand_card_invalid:${index}`), index }))
    .filter(({ card }) => card.uid === wanted.uid);
  if (matches.length === 0) throw new Error("tcg_v0_2_realm_source_card_missing");
  if (matches.length !== 1) throw new Error("tcg_v0_2_realm_source_uid_duplicate");
  if (matches[0].card.card_id !== wanted.card_id) {
    throw new Error("tcg_v0_2_realm_source_identity_changed");
  }
  return matches[0];
}

function currentRealm<T extends RuntimeV02RealmInstance>(
  state: Record<string, unknown>,
): RuntimeV02RealmSlot<T> | null {
  if (state.realm == null) return null;
  const raw = objectRecord(state.realm);
  if (!raw) throw new Error("tcg_v0_2_realm_slot_invalid");
  const ownerSeat = normalizedSeat(raw.owner_seat, "tcg_v0_2_realm_owner_invalid");
  const playedTurn = Number(raw.played_turn);
  if (!Number.isInteger(playedTurn) || playedTurn < 0) {
    throw new Error("tcg_v0_2_realm_played_turn_invalid");
  }
  const card = instance<T>(raw.card, "tcg_v0_2_realm_active_card_invalid");
  return { card, owner_seat: ownerSeat, played_turn: playedTurn };
}

function realmTurnFlag(state: Record<string, unknown>, seat: 1 | 2): number | null {
  if (state.turn_flags == null) return null;
  const root = objectRecord(state.turn_flags);
  if (!root) throw new Error("tcg_v0_2_realm_turn_flags_invalid");
  const raw = root[String(seat)];
  if (raw == null) return null;
  const flags = objectRecord(raw);
  if (!flags) throw new Error("tcg_v0_2_realm_seat_flags_invalid");
  if (flags.realm_turn == null) return null;
  const turn = Number(flags.realm_turn);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_realm_turn_flag_invalid");
  }
  return turn;
}

function validateDiscard<T extends RuntimeV02RealmInstance>(
  discard: T[],
  incomingUid: string,
): void {
  const seen = new Set<string>();
  for (let index = 0; index < discard.length; index += 1) {
    const card = instance<T>(discard[index], `tcg_v0_2_realm_discard_card_invalid:${index}`);
    if (seen.has(card.uid)) throw new Error(`tcg_v0_2_realm_discard_uid_duplicate:${card.uid}`);
    seen.add(card.uid);
  }
  if (seen.has(incomingUid)) {
    throw new Error(`tcg_v0_2_realm_discard_uid_collision:${incomingUid}`);
  }
}

function setRealmTurnFlag(
  state: Record<string, unknown>,
  seat: 1 | 2,
  turn: number,
): void {
  const root = objectRecord(state.turn_flags) || {};
  const flags = objectRecord(root[String(seat)]) || {};
  flags.realm_turn = turn;
  root[String(seat)] = flags;
  state.turn_flags = root;
}

/**
 * Canonical Realm family (#18) shared-slot transaction.
 *
 * The caller owns action authentication, phase legality, and public HTTP error
 * mapping. This owner validates and commits only Realm-specific state: exact
 * hand identity, once-per-turn placement, same-name replacement, prior-Realm
 * discard, shared-slot replacement, and a deterministic event handoff receipt.
 * It intentionally does not execute Realm programs/listeners or ordinary
 * Card-Zone transactions; the shared Realm slot is specialist state.
 */
export function runtimeV02ApplyRealmPlayTransaction<T extends RuntimeV02RealmInstance>(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  sourceCardRaw: RuntimeV02RealmInstance,
  sourceActionIdRaw: unknown = "play_realm",
): RuntimeV02RealmPlayResult<T> {
  const controllerSeat = normalizedSeat(controllerSeatRaw, "tcg_v0_2_realm_controller_invalid");
  const turn = currentTurn(state);
  const sourceActionId = requiredString(sourceActionIdRaw, "tcg_v0_2_realm_source_action_id_required");
  const wanted = instance<RuntimeV02RealmInstance>(sourceCardRaw, "tcg_v0_2_realm_source_card_invalid");
  const controller = player(state, controllerSeat);
  const hand = controller.hand as T[];
  const selected = exactHandCard(hand, wanted);

  if (realmTurnFlag(state, controllerSeat) === turn) {
    throw new Error("tcg_v0_2_realm_already_played_this_turn");
  }

  const previous = currentRealm<T>(state);
  if (previous?.card.card_id === selected.card.card_id) {
    throw new Error("tcg_v0_2_realm_same_named_replacement_forbidden");
  }
  if (previous?.card.uid === selected.card.uid) {
    throw new Error("tcg_v0_2_realm_slot_source_uid_collision");
  }

  let previousDiscard: T[] | null = null;
  if (previous) {
    previousDiscard = player(state, previous.owner_seat).discard as T[];
    validateDiscard(previousDiscard, previous.card.uid);
  }

  // All validation above is non-mutating. From here the synchronous transaction
  // cannot fail under the validated array/state shapes.
  hand.splice(selected.index, 1);
  if (previous && previousDiscard) previousDiscard.push(previous.card);

  const nextRealm: RuntimeV02RealmSlot<T> = {
    card: selected.card,
    owner_seat: controllerSeat,
    played_turn: turn,
  };
  state.realm = nextRealm as unknown as Record<string, unknown>;
  setRealmTurnFlag(state, controllerSeat, turn);

  const receipt: RuntimeV02RealmPlayReceipt = {
    schema: "sb-tcg-realm-transaction-v0.2",
    controller_seat: controllerSeat,
    turn_seq: turn,
    source_action_id: sourceActionId,
    incoming_card_uid: selected.card.uid,
    incoming_card_id: selected.card.card_id,
    previous_controller_seat: previous?.owner_seat ?? null,
    previous_card_uid: previous?.card.uid ?? null,
    previous_card_id: previous?.card.card_id ?? null,
    event_name: previous ? "realm_replaced" : null,
  };

  return {
    realm: nextRealm,
    replaced_realm: previous,
    receipt,
  };
}
