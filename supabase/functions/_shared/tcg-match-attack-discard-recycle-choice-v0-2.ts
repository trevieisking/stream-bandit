import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02CommitCardZoneTransfer,
  runtimeV02PreflightCardZoneTransfer,
  type RuntimeV02CardZoneInstance,
  type RuntimeV02CardZoneTransferPreflight,
} from "./tcg-match-card-zone-engine-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackDiscardRecycleChoiceDescriptor = {
  attack_id: string;
  phase: "after_damage";
  selection: {
    min: 0;
    max: 1;
    zone: "discard";
    filters: { card_family: "Tactic"; tactic_subtype: "Device" };
  };
  destination: "deck_bottom";
  order: "preserve";
};

export type RuntimeV02AttackDiscardRecycleChoiceOption = {
  id: string;
  label: string;
  uid: string;
  card_id: string;
};

export type RuntimeV02PendingAttackDiscardRecycleChoice = {
  id: string;
  seat: 1 | 2;
  kind: "select_discard_device_to_deck_bottom";
  attack_id: string;
  prompt: string;
  min: 0;
  max: 1;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  legal_cards: RuntimeInst[];
  options: RuntimeV02AttackDiscardRecycleChoiceOption[];
};

export type RuntimeV02AttackDiscardRecycleChoiceResolution = {
  attack_id: string;
  choice_id: string;
  selected_count: 0 | 1;
  moved_count: 0 | 1;
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
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_turn_seq_invalid");
  }
  return value;
}

function playerForSeat(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_attack_discard_recycle_choice_player_missing");
  if (!Array.isArray(player.discard) || !Array.isArray(player.deck)) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_player_zones_invalid");
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
  return runtimeInst(source, "tcg_v0_2_attack_discard_recycle_choice_source_identity_invalid");
}

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  const vanguard = objectRecord(player.vanguard);
  if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_source_vanguard_missing");
  }
  return runtimeInst(
    vanguard.stack[vanguard.stack.length - 1],
    "tcg_v0_2_attack_discard_recycle_choice_source_top_invalid",
  );
}

function assertSameInst(actual: RuntimeInst, expected: RuntimeInst, error: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(error);
}

function cardLabel(state: Record<string, unknown>, inst: RuntimeInst): string {
  const definition = runtimeV02Definition(state, inst);
  const name = definition && typeof definition.name === "string" ? definition.name.trim() : "";
  return name || inst.card_id || "Card";
}

function isDeviceTactic(state: Record<string, unknown>, inst: RuntimeInst): boolean {
  const definition = runtimeV02Definition(state, inst);
  if (!definition || String(definition.card_family || "") !== "Tactic") return false;
  const tactic = objectRecord(definition.tactic);
  return String(tactic?.subtype || "") === "Device";
}

function legalDiscardCards(state: Record<string, unknown>, seat: 1 | 2): RuntimeInst[] {
  const player = playerForSeat(state, seat);
  return (player.discard as unknown[])
    .map((value, index) => runtimeInst(value, `tcg_v0_2_attack_discard_recycle_choice_discard_card_invalid:${index}`))
    .filter((inst) => isDeviceTactic(state, inst));
}

/**
 * Recognizes exactly the structured after-damage family used by Mycelial Bloom:
 * SELECT_CARDS(self discard, optional 0..1 Device Tactic) ->
 * MOVE_CARDS(selected, self deck bottom, preserve).
 *
 * This owner is card-id-free and attack-only. Active Abilities (including any
 * SELECT_CARDS program they may use) are deliberately outside this function.
 */
export function structuredRuntimeAfterDamageDiscardRecycleChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackDiscardRecycleChoiceDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_discard_recycle_choice_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_discard_recycle_choice_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_discard_recycle_choice_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_discard_recycle_choice_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_discard_recycle_choice_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 2) return null;

  const select = objectRecord(attack.after_damage[0]);
  const move = objectRecord(attack.after_damage[1]);
  if (!select || !move) return null;
  if (String(select.op || "") !== "SELECT_CARDS" || String(move.op || "") !== "MOVE_CARDS") return null;

  rejectUnsupportedFields(
    select,
    ["op", "player", "zone", "selection", "as"],
    `tcg_v0_2_attack_discard_recycle_choice_select_field_unsupported:${attackId}`,
  );
  if (String(select.player || "") !== "self" || String(select.zone || "") !== "discard") {
    throw new Error(`tcg_v0_2_attack_discard_recycle_choice_select_zone_unsupported:${attackId}`);
  }
  const selection = objectRecord(select.selection);
  if (!selection) throw new Error(`tcg_v0_2_attack_discard_recycle_choice_selection_required:${attackId}`);
  rejectUnsupportedFields(
    selection,
    ["min", "max", "filters"],
    `tcg_v0_2_attack_discard_recycle_choice_selection_field_unsupported:${attackId}`,
  );
  if (Number(selection.min) !== 0 || Number(selection.max) !== 1) {
    throw new Error(`tcg_v0_2_attack_discard_recycle_choice_bounds_unsupported:${attackId}`);
  }
  const filters = objectRecord(selection.filters);
  if (!filters) throw new Error(`tcg_v0_2_attack_discard_recycle_choice_filters_required:${attackId}`);
  rejectUnsupportedFields(
    filters,
    ["card_family", "tactic_subtype"],
    `tcg_v0_2_attack_discard_recycle_choice_filter_field_unsupported:${attackId}`,
  );
  if (String(filters.card_family || "") !== "Tactic" || String(filters.tactic_subtype || "") !== "Device") {
    throw new Error(`tcg_v0_2_attack_discard_recycle_choice_filters_unsupported:${attackId}`);
  }
  const selectedVar = requiredString(select.as, `tcg_v0_2_attack_discard_recycle_choice_variable_required:${attackId}`);

  rejectUnsupportedFields(
    move,
    ["op", "player", "cards", "to", "order"],
    `tcg_v0_2_attack_discard_recycle_choice_move_field_unsupported:${attackId}`,
  );
  if (String(move.player || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_discard_recycle_choice_move_player_unsupported:${attackId}`);
  }
  if (
    String(move.cards || "") !== `$${selectedVar}` ||
    String(move.to || "") !== "deck_bottom" ||
    String(move.order || "") !== "preserve"
  ) {
    throw new Error(`tcg_v0_2_attack_discard_recycle_choice_move_binding_unsupported:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    selection: {
      min: 0,
      max: 1,
      zone: "discard",
      filters: { card_family: "Tactic", tactic_subtype: "Device" },
    },
    destination: "deck_bottom",
    order: "preserve",
  };
}

export function runtimeV02CreateAttackDiscardRecycleChoice(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackDiscardRecycleChoiceDescriptor,
  sourceInstance: unknown,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingAttackDiscardRecycleChoice | null {
  if (descriptor.phase !== "after_damage") throw new Error("tcg_v0_2_attack_discard_recycle_choice_phase_unsupported");
  if (descriptor.selection.min !== 0 || descriptor.selection.max !== 1) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_selection_bounds_unsupported");
  }
  if (!choiceId) throw new Error("tcg_v0_2_attack_discard_recycle_choice_id_required");
  const turn = currentTurn(state);
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_discard_recycle_choice_active_seat_mismatch");
  const source = sourceIdentity(sourceInstance);
  const player = playerForSeat(state, seat);
  assertSameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_discard_recycle_choice_source_vanguard_changed",
  );

  const legalCards = legalDiscardCards(state, seat);
  if (!legalCards.length) return null;
  if (new Set(legalCards.map((card) => card.uid)).size !== legalCards.length) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_legal_uid_duplicate");
  }
  const options = legalCards.map((card) => ({
    id: `card:${card.uid}`,
    label: cardLabel(state, card),
    uid: card.uid,
    card_id: card.card_id,
  }));
  return {
    id: choiceId,
    seat,
    kind: "select_discard_device_to_deck_bottom",
    attack_id: descriptor.attack_id,
    prompt: "You may put one Device Tactic from your discard on the bottom of your deck",
    min: 0,
    max: 1,
    turn_seq: turn,
    source_uid: source.uid,
    source_card_id: source.card_id,
    legal_cards: legalCards,
    options,
  };
}

function validatePending(choice: RuntimeV02PendingAttackDiscardRecycleChoice): void {
  if (choice.kind !== "select_discard_device_to_deck_bottom") {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_kind_unsupported");
  }
  if (!choice.id || !choice.attack_id) throw new Error("tcg_v0_2_attack_discard_recycle_choice_pending_identity_invalid");
  if (!Number.isInteger(choice.turn_seq) || choice.turn_seq < 0) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_pending_turn_invalid");
  }
  if (!Array.isArray(choice.legal_cards) || choice.legal_cards.length < 1) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_pending_legal_cards_invalid");
  }
  if (!Array.isArray(choice.options) || choice.options.length !== choice.legal_cards.length) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_pending_options_invalid");
  }
  const uids = new Set<string>();
  for (let i = 0; i < choice.legal_cards.length; i++) {
    const card = runtimeInst(choice.legal_cards[i], `tcg_v0_2_attack_discard_recycle_choice_pending_card_invalid:${i}`);
    if (uids.has(card.uid)) throw new Error("tcg_v0_2_attack_discard_recycle_choice_pending_uid_duplicate");
    uids.add(card.uid);
    const option = choice.options[i];
    if (!option || option.id !== `card:${card.uid}` || option.uid !== card.uid || option.card_id !== card.card_id) {
      throw new Error("tcg_v0_2_attack_discard_recycle_choice_pending_option_mismatch");
    }
  }
}

export function runtimeV02ResolveAttackDiscardRecycleChoice(
  choice: RuntimeV02PendingAttackDiscardRecycleChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackDiscardRecycleChoiceResolution {
  validatePending(choice);
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_discard_recycle_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_attack_discard_recycle_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length > 1 || new Set(choiceIds).size !== choiceIds.length) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_zero_or_one_required");
  }
  const option = choiceIds.length === 1
    ? choice.options.find((candidate) => candidate.id === choiceIds[0])
    : null;
  if (choiceIds.length === 1 && !option) throw new Error("tcg_v0_2_attack_discard_recycle_choice_unknown_option");
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_attack_discard_recycle_choice_turn_changed");
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_discard_recycle_choice_active_seat_changed");

  const player = playerForSeat(state, seat);
  assertSameInst(
    currentVanguardTop(player),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_attack_discard_recycle_choice_source_vanguard_changed",
  );

  const currentLegal = legalDiscardCards(state, seat);
  if (currentLegal.length !== choice.legal_cards.length) {
    throw new Error("tcg_v0_2_attack_discard_recycle_choice_discard_set_changed");
  }
  for (let i = 0; i < currentLegal.length; i++) {
    assertSameInst(currentLegal[i], choice.legal_cards[i], "tcg_v0_2_attack_discard_recycle_choice_discard_set_changed");
  }

  if (!option) {
    return { attack_id: choice.attack_id, choice_id: choice.id, selected_count: 0, moved_count: 0 };
  }

  const discard = player.discard as RuntimeV02CardZoneInstance[];
  const deck = player.deck as RuntimeV02CardZoneInstance[];
  let transferPreflight: RuntimeV02CardZoneTransferPreflight<RuntimeV02CardZoneInstance>;
  try {
    transferPreflight = runtimeV02PreflightCardZoneTransfer(discard, deck, {
      cause: "effect",
      action_kind: "attack",
      source_action_id: choice.attack_id,
      source_card_uid: choice.source_uid,
      source: {
        controller_seat: seat,
        zone: "discard",
        owner_card_uid: null,
      },
      destination: {
        controller_seat: seat,
        zone: "deck",
        owner_card_uid: null,
      },
      card_uids: [option.uid],
      destination_position: "bottom",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("tcg_v0_2_card_zone_selected_card_missing:")) {
      throw new Error("tcg_v0_2_attack_discard_recycle_choice_selected_card_changed");
    }
    throw error;
  }
  const moved = runtimeInst(
    transferPreflight.cards[0],
    "tcg_v0_2_attack_discard_recycle_choice_selected_card_invalid",
  );
  assertSameInst(
    moved,
    { uid: option.uid, card_id: option.card_id },
    "tcg_v0_2_attack_discard_recycle_choice_selected_card_changed",
  );
  runtimeV02CommitCardZoneTransfer(discard, deck, transferPreflight);
  return { attack_id: choice.attack_id, choice_id: choice.id, selected_count: 1, moved_count: 1 };
}
