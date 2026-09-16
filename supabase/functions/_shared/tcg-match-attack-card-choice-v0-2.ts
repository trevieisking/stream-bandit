import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02ApplyCardZonePartitionTransfer,
  type RuntimeV02CardZoneInstance,
} from "./tcg-match-card-zone-engine-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackTopDeckCardChoiceDescriptor = {
  attack_id: string;
  phase: "after_damage";
  look_count: number;
  selection: { min: 1; max: 1 };
  chosen_destination: "hand";
  remainder_destination: "deck_bottom";
  remainder_order: "preserve";
};

export type RuntimeV02AttackTopDeckCardChoiceOption = {
  id: string;
  label: string;
  uid: string;
  card_id: string;
};

export type RuntimeV02PendingAttackTopDeckCardChoice = {
  id: string;
  seat: 1 | 2;
  kind: "choose_from_looked_set";
  attack_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  look_count: number;
  top_cards: RuntimeInst[];
  options: RuntimeV02AttackTopDeckCardChoiceOption[];
};

export type RuntimeV02AttackTopDeckCardChoiceResolution = {
  attack_id: string;
  choice_id: string;
  chosen_uid: string;
  chosen_card_id: string;
  looked_count: number;
  chosen_count: 1;
  remainder_count: number;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const keys = new Set(allowed);
  const extra = Object.keys(value).find((key) => !keys.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function currentTurn(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attack_card_choice_turn_seq_invalid");
  }
  return value;
}

function playerForSeat(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_attack_card_choice_player_missing");
  if (!Array.isArray(player.deck) || !Array.isArray(player.hand)) {
    throw new Error("tcg_v0_2_attack_card_choice_player_zones_invalid");
  }
  return player;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  const uid = requiredString(raw.uid, `${error}:uid`);
  const cardId = requiredString(raw.card_id, `${error}:card_id`);
  return { uid, card_id: cardId };
}

function sourceIdentity(source: unknown): RuntimeInst {
  return runtimeInst(source, "tcg_v0_2_attack_card_choice_source_identity_invalid");
}

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  const vanguard = objectRecord(player.vanguard);
  if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_card_choice_source_vanguard_missing");
  }
  return runtimeInst(
    vanguard.stack[vanguard.stack.length - 1],
    "tcg_v0_2_attack_card_choice_source_top_invalid",
  );
}

function assertSameInst(actual: RuntimeInst, expected: RuntimeInst, error: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(error);
}

function cardLabel(state: Record<string, unknown>, inst: RuntimeInst): string {
  const index = objectRecord(state.card_index);
  const entry = index ? objectRecord(index[inst.card_id]) : null;
  const definitionV02 = entry ? objectRecord(entry.definition_v0_2) : null;
  const definition = entry ? objectRecord(entry.definition) : null;
  const chosen = definitionV02 || definition || entry;
  const name = chosen && typeof chosen.name === "string" ? chosen.name.trim() : "";
  return name || inst.card_id || "Card";
}

/**
 * Recognizes exactly the structured after-damage family:
 * LOOK_TOP(self, N) -> CHOOSE_FROM_SET(exactly one) -> MOVE_CARDS(chosen, hand)
 * -> PUT_REMAINDER_ON_DECK_BOTTOM(preserve).
 *
 * The owner is card-id-free. Other private selection programs remain outside
 * this slice and either continue through their existing owner or fail closed.
 */
export function structuredRuntimeAfterDamageTopDeckCardChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackTopDeckCardChoiceDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_card_choice_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_card_choice_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_card_choice_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_card_choice_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_card_choice_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_card_choice_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_card_choice_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 4) return null;

  const look = objectRecord(attack.after_damage[0]);
  const choose = objectRecord(attack.after_damage[1]);
  const move = objectRecord(attack.after_damage[2]);
  const remainder = objectRecord(attack.after_damage[3]);
  if (!look || !choose || !move || !remainder) return null;
  if (
    String(look.op || "") !== "LOOK_TOP" ||
    String(choose.op || "") !== "CHOOSE_FROM_SET" ||
    String(move.op || "") !== "MOVE_CARDS" ||
    String(remainder.op || "") !== "PUT_REMAINDER_ON_DECK_BOTTOM"
  ) return null;

  rejectUnsupportedFields(
    look,
    ["op", "player", "count", "as"],
    `tcg_v0_2_attack_card_choice_look_field_unsupported:${attackId}`,
  );
  if (String(look.player || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_card_choice_look_player_unsupported:${attackId}`);
  }
  const lookCount = Number(look.count);
  if (!Number.isInteger(lookCount) || lookCount <= 0) {
    throw new Error(`tcg_v0_2_attack_card_choice_look_count_invalid:${attackId}`);
  }
  const lookedVar = requiredString(look.as, `tcg_v0_2_attack_card_choice_look_variable_required:${attackId}`);

  rejectUnsupportedFields(
    choose,
    ["op", "source", "min", "max", "as"],
    `tcg_v0_2_attack_card_choice_choose_field_unsupported:${attackId}`,
  );
  if (String(choose.source || "") !== `$${lookedVar}`) {
    throw new Error(`tcg_v0_2_attack_card_choice_choose_source_mismatch:${attackId}`);
  }
  if (Number(choose.min) !== 1 || Number(choose.max) !== 1) {
    throw new Error(`tcg_v0_2_attack_card_choice_choose_bounds_unsupported:${attackId}`);
  }
  const chosenVar = requiredString(choose.as, `tcg_v0_2_attack_card_choice_choose_variable_required:${attackId}`);

  rejectUnsupportedFields(
    move,
    ["op", "player", "cards", "to"],
    `tcg_v0_2_attack_card_choice_move_field_unsupported:${attackId}`,
  );
  if (String(move.player || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_card_choice_move_player_unsupported:${attackId}`);
  }
  if (String(move.cards || "") !== `$${chosenVar}` || String(move.to || "") !== "hand") {
    throw new Error(`tcg_v0_2_attack_card_choice_move_binding_unsupported:${attackId}`);
  }

  rejectUnsupportedFields(
    remainder,
    ["op", "player", "source", "except", "order"],
    `tcg_v0_2_attack_card_choice_remainder_field_unsupported:${attackId}`,
  );
  if (String(remainder.player || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_card_choice_remainder_player_unsupported:${attackId}`);
  }
  if (
    String(remainder.source || "") !== `$${lookedVar}` ||
    String(remainder.except || "") !== `$${chosenVar}` ||
    String(remainder.order || "") !== "preserve"
  ) {
    throw new Error(`tcg_v0_2_attack_card_choice_remainder_binding_unsupported:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    look_count: lookCount,
    selection: { min: 1, max: 1 },
    chosen_destination: "hand",
    remainder_destination: "deck_bottom",
    remainder_order: "preserve",
  };
}

export function runtimeV02CreateTopDeckCardChoice(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackTopDeckCardChoiceDescriptor,
  sourceInstance: unknown,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingAttackTopDeckCardChoice {
  if (descriptor.phase !== "after_damage") throw new Error("tcg_v0_2_attack_card_choice_phase_unsupported");
  if (descriptor.selection.min !== 1 || descriptor.selection.max !== 1) {
    throw new Error("tcg_v0_2_attack_card_choice_selection_bounds_unsupported");
  }
  if (!choiceId) throw new Error("tcg_v0_2_attack_card_choice_id_required");
  const turn = currentTurn(state);
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_card_choice_active_seat_mismatch");
  const source = sourceIdentity(sourceInstance);
  const player = playerForSeat(state, seat);
  assertSameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_card_choice_source_vanguard_changed",
  );

  const deck = player.deck as unknown[];
  const lookedCount = Math.min(descriptor.look_count, deck.length);
  if (lookedCount < 1) throw new Error("tcg_v0_2_attack_card_choice_required_option_unavailable");
  const topCards = deck.slice(0, lookedCount).map((value, index) =>
    runtimeInst(value, `tcg_v0_2_attack_card_choice_top_card_invalid:${index}`)
  );
  if (new Set(topCards.map((card) => card.uid)).size !== topCards.length) {
    throw new Error("tcg_v0_2_attack_card_choice_top_card_uid_duplicate");
  }

  recordRuntimeV02HiddenInformationView(state, seat, "deck_top");
  const options = topCards.map((card) => ({
    id: `card:${card.uid}`,
    label: cardLabel(state, card),
    uid: card.uid,
    card_id: card.card_id,
  }));
  return {
    id: choiceId,
    seat,
    kind: "choose_from_looked_set",
    attack_id: descriptor.attack_id,
    prompt: "Choose one of the looked-at cards",
    min: 1,
    max: 1,
    turn_seq: turn,
    source_uid: source.uid,
    source_card_id: source.card_id,
    look_count: descriptor.look_count,
    top_cards: topCards,
    options,
  };
}

function validatePending(choice: RuntimeV02PendingAttackTopDeckCardChoice): void {
  if (choice.kind !== "choose_from_looked_set") {
    throw new Error("tcg_v0_2_attack_card_choice_kind_unsupported");
  }
  if (!choice.id || !choice.attack_id) throw new Error("tcg_v0_2_attack_card_choice_pending_identity_invalid");
  if (!Number.isInteger(choice.turn_seq) || choice.turn_seq < 0) {
    throw new Error("tcg_v0_2_attack_card_choice_pending_turn_invalid");
  }
  if (!Number.isInteger(choice.look_count) || choice.look_count <= 0) {
    throw new Error("tcg_v0_2_attack_card_choice_pending_look_count_invalid");
  }
  if (!Array.isArray(choice.top_cards) || choice.top_cards.length < 1 || choice.top_cards.length > choice.look_count) {
    throw new Error("tcg_v0_2_attack_card_choice_pending_top_cards_invalid");
  }
  if (!Array.isArray(choice.options) || choice.options.length !== choice.top_cards.length) {
    throw new Error("tcg_v0_2_attack_card_choice_pending_options_invalid");
  }
  const uids = new Set<string>();
  for (let i = 0; i < choice.top_cards.length; i++) {
    const card = runtimeInst(choice.top_cards[i], `tcg_v0_2_attack_card_choice_pending_top_card_invalid:${i}`);
    if (uids.has(card.uid)) throw new Error("tcg_v0_2_attack_card_choice_pending_top_card_uid_duplicate");
    uids.add(card.uid);
    const option = choice.options[i];
    if (!option || option.id !== `card:${card.uid}` || option.uid !== card.uid || option.card_id !== card.card_id) {
      throw new Error("tcg_v0_2_attack_card_choice_pending_option_mismatch");
    }
  }
}

export function runtimeV02ResolveTopDeckCardChoice(
  choice: RuntimeV02PendingAttackTopDeckCardChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackTopDeckCardChoiceResolution {
  validatePending(choice);
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_card_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_attack_card_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_attack_card_choice_exactly_one_required");
  }
  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_attack_card_choice_unknown_option");
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_attack_card_choice_turn_changed");
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_card_choice_active_seat_changed");

  const player = playerForSeat(state, seat);
  assertSameInst(
    currentVanguardTop(player),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_attack_card_choice_source_vanguard_changed",
  );

  const deck = player.deck as RuntimeV02CardZoneInstance[];
  const hand = player.hand as RuntimeV02CardZoneInstance[];
  if (deck.length < choice.top_cards.length) throw new Error("tcg_v0_2_attack_card_choice_top_set_changed");
  const currentTop = deck.slice(0, choice.top_cards.length).map((value, index) =>
    runtimeInst(value, `tcg_v0_2_attack_card_choice_current_top_invalid:${index}`)
  );
  for (let i = 0; i < currentTop.length; i++) {
    assertSameInst(currentTop[i], choice.top_cards[i], "tcg_v0_2_attack_card_choice_top_set_changed");
  }
  const chosenIndex = currentTop.findIndex((card) => card.uid === option.uid && card.card_id === option.card_id);
  if (chosenIndex < 0) throw new Error("tcg_v0_2_attack_card_choice_selected_card_changed");

  const partition = runtimeV02ApplyCardZonePartitionTransfer(deck, hand, {
    cause: "effect",
    action_kind: "attack",
    source_action_id: choice.attack_id,
    source_card_uid: choice.source_uid,
    source: {
      controller_seat: seat,
      zone: "deck",
      owner_card_uid: null,
    },
    destination: {
      controller_seat: seat,
      zone: "hand",
      owner_card_uid: null,
    },
    source_window: {
      position: "top",
      card_uids: currentTop.map((card) => card.uid),
    },
    destination_card_uids: [option.uid],
    source_remainder_position: "bottom",
    destination_position: "bottom",
  });
  const chosen = runtimeInst(
    partition.cards[0],
    "tcg_v0_2_attack_card_choice_selected_card_changed",
  );
  assertSameInst(
    chosen,
    { uid: option.uid, card_id: option.card_id },
    "tcg_v0_2_attack_card_choice_selected_card_changed",
  );

  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    chosen_uid: chosen.uid,
    chosen_card_id: chosen.card_id,
    looked_count: currentTop.length,
    chosen_count: 1,
    remainder_count: partition.remainder.length,
  };
}
