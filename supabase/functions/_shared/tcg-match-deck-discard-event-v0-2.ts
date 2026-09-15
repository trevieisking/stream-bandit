export type RuntimeV02DeckDiscardEventInstance = {
  uid: string;
  card_id: string;
};

export type RuntimeV02DeckCardsDiscardedEvent = {
  event_id: string;
  event: "deck_cards_discarded";
  subject_uid: string;
  subject_card_id: string;
  controller_seat: 1 | 2;
  source_controller_seat: 1 | 2;
  origin_zone: "deck";
  destination_zone: "discard";
  destination_index: null;
  phase: string;
  source_action_id: string;
  source_card_uid: string;
  action_kind: string;
  turn_seq: number;
  discarded_card_uids: string[];
  event_count: number;
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
    throw new Error("tcg_v0_2_deck_discard_event_turn_seq_invalid");
  }
  return turn;
}

function player(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const current = players ? objectRecord(players[String(seat)]) : null;
  if (!current || !Array.isArray(current.discard)) {
    throw new Error("tcg_v0_2_deck_discard_event_player_discard_invalid");
  }
  return current;
}

function normalizedInstance(
  value: unknown,
  error: string,
): RuntimeV02DeckDiscardEventInstance {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function normalizedDiscardedUids(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error("tcg_v0_2_deck_discard_event_card_uids_required");
  }
  const uids = value.map((uid, index) =>
    requiredString(uid, `tcg_v0_2_deck_discard_event_card_uid_invalid:${index}`)
  );
  if (new Set(uids).size !== uids.length) {
    throw new Error("tcg_v0_2_deck_discard_event_card_uid_duplicate");
  }
  return uids;
}

function recordEvent(
  state: Record<string, unknown>,
  event: RuntimeV02DeckCardsDiscardedEvent,
): void {
  const events = Array.isArray(state.effect_events)
    ? state.effect_events as Record<string, unknown>[]
    : (state.effect_events = []) as Record<string, unknown>[];
  if (!events.some((entry) => entry.event_id === event.event_id)) {
    events.push(structuredClone(event) as unknown as Record<string, unknown>);
  }
}

/**
 * Canonical event for cards already moved from a player's deck to that same
 * player's Discard Pile. This owner records event context only; it never moves
 * cards, decides attack legality, creates deckout, or resolves listeners.
 */
export function runtimeV02CreateDeckCardsDiscardedEvent(
  state: Record<string, unknown>,
  input: {
    discarded_controller_seat: 1 | 2;
    source_controller_seat: 1 | 2;
    source_action_id: string;
    source_card: RuntimeV02DeckDiscardEventInstance;
    action_kind: string;
    phase: string;
    discarded_card_uids: readonly unknown[];
  },
): RuntimeV02DeckCardsDiscardedEvent {
  const turn = currentTurn(state);
  const discardedControllerSeat = normalizedSeat(
    input.discarded_controller_seat,
    "tcg_v0_2_deck_discard_event_controller_invalid",
  );
  const sourceControllerSeat = normalizedSeat(
    input.source_controller_seat,
    "tcg_v0_2_deck_discard_event_source_controller_invalid",
  );
  const sourceActionId = requiredString(
    input.source_action_id,
    "tcg_v0_2_deck_discard_event_source_action_id_required",
  );
  const sourceCard = normalizedInstance(
    input.source_card,
    "tcg_v0_2_deck_discard_event_source_card_invalid",
  );
  const actionKind = requiredString(
    input.action_kind,
    "tcg_v0_2_deck_discard_event_action_kind_required",
  );
  const phase = requiredString(
    input.phase,
    "tcg_v0_2_deck_discard_event_phase_required",
  );
  const discardedCardUids = normalizedDiscardedUids(input.discarded_card_uids);

  const discard = player(state, discardedControllerSeat).discard as unknown[];
  const discardUids = new Set(discard.map((card, index) =>
    normalizedInstance(card, `tcg_v0_2_deck_discard_event_discard_card_invalid:${index}`).uid
  ));
  for (const uid of discardedCardUids) {
    if (!discardUids.has(uid)) {
      throw new Error(`tcg_v0_2_deck_discard_event_card_not_in_discard:${uid}`);
    }
  }

  const event: RuntimeV02DeckCardsDiscardedEvent = {
    event_id: [
      "deck-cards-discarded",
      turn,
      discardedControllerSeat,
      sourceControllerSeat,
      actionKind,
      sourceActionId,
      sourceCard.uid,
      ...discardedCardUids,
    ].join(":"),
    event: "deck_cards_discarded",
    subject_uid: sourceCard.uid,
    subject_card_id: sourceCard.card_id,
    controller_seat: discardedControllerSeat,
    source_controller_seat: sourceControllerSeat,
    origin_zone: "deck",
    destination_zone: "discard",
    destination_index: null,
    phase,
    source_action_id: sourceActionId,
    source_card_uid: sourceCard.uid,
    action_kind: actionKind,
    turn_seq: turn,
    discarded_card_uids: [...discardedCardUids],
    event_count: discardedCardUids.length,
  };
  recordEvent(state, event);
  return structuredClone(event);
}
