import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import { runtimeV02InspectRewardPositions } from "./tcg-match-reward-inspection-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackInspectionChoiceDescriptor = {
  attack_id: string;
  phase: "after_damage";
  deck_top: {
    count: 1;
    visibility: "controller_private";
    return_policy: "same_position";
  };
  rewards: {
    min: 1;
    max: 1;
    visibility: "controller_private";
    return_policy: "same_position";
  };
};

export type RuntimeV02AttackInspectionChoiceOption = {
  id: string;
  label: string;
  position: number;
  anchor_uid: string;
  anchor_card_id: string;
};

export type RuntimeV02PendingAttackInspectionChoice = {
  id: string;
  seat: 1 | 2;
  kind: "inspect_deck_top_then_choose_reward";
  attack_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  deck_top_card: RuntimeInst;
  options: RuntimeV02AttackInspectionChoiceOption[];
};

export type RuntimeV02AttackInspectionChoiceResolution = {
  attack_id: string;
  choice_id: string;
  deck_top_inspected_count: 1;
  reward_inspected_count: 1;
  reward_position: number;
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
    throw new Error("tcg_v0_2_attack_inspection_choice_turn_seq_invalid");
  }
  return value;
}

function playerForSeat(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_attack_inspection_choice_player_missing");
  if (!Array.isArray(player.deck) || !Array.isArray(player.rewards)) {
    throw new Error("tcg_v0_2_attack_inspection_choice_player_zones_invalid");
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

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  const vanguard = objectRecord(player.vanguard);
  if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_inspection_choice_source_vanguard_missing");
  }
  return runtimeInst(
    vanguard.stack[vanguard.stack.length - 1],
    "tcg_v0_2_attack_inspection_choice_source_top_invalid",
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

function validateInspectStep(
  raw: unknown,
  attackId: string,
  expectedZone: "deck_top" | "rewards",
): Record<string, unknown> {
  const step = objectRecord(raw);
  if (!step || String(step.op || "") !== "INSPECT_ZONE") {
    throw new Error(`tcg_v0_2_attack_inspection_choice_step_invalid:${attackId}:${expectedZone}`);
  }
  rejectUnsupportedFields(
    step,
    ["op", "player", "zone", "selection", "visibility", "return_policy", "as"],
    `tcg_v0_2_attack_inspection_choice_step_field_unsupported:${attackId}:${expectedZone}`,
  );
  if (
    String(step.player || "") !== "self" || String(step.zone || "") !== expectedZone ||
    String(step.visibility || "") !== "controller_private" ||
    String(step.return_policy || "") !== "same_position"
  ) {
    throw new Error(`tcg_v0_2_attack_inspection_choice_step_shape_unsupported:${attackId}:${expectedZone}`);
  }
  requiredString(step.as, `tcg_v0_2_attack_inspection_choice_variable_required:${attackId}:${expectedZone}`);
  const selection = objectRecord(step.selection);
  if (!selection) {
    throw new Error(`tcg_v0_2_attack_inspection_choice_selection_invalid:${attackId}:${expectedZone}`);
  }
  rejectUnsupportedFields(
    selection,
    ["min", "max", "filters"],
    `tcg_v0_2_attack_inspection_choice_selection_field_unsupported:${attackId}:${expectedZone}`,
  );
  const filters = objectRecord(selection.filters);
  if (!filters || Object.keys(filters).length !== 0) {
    throw new Error(`tcg_v0_2_attack_inspection_choice_filters_unsupported:${attackId}:${expectedZone}`);
  }
  if (Number(selection.min) !== 1 || Number(selection.max) !== 1) {
    throw new Error(`tcg_v0_2_attack_inspection_choice_bounds_unsupported:${attackId}:${expectedZone}`);
  }
  return step;
}

/**
 * Recognizes exactly the ordered after-damage family:
 * inspect own deck top 1 in place, then choose/inspect one own Reward in place.
 * The owner is card-id-free and does not claim unrelated INSPECT_ZONE programs.
 */
export function structuredRuntimeAfterDamageInspectionChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackInspectionChoiceDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_inspection_choice_requires_creature");
  }
  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_inspection_choice_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_inspection_choice_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_inspection_choice_slot_invalid");
  }
  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_inspection_choice_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_inspection_choice_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_inspection_choice_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 2) return null;
  const first = objectRecord(attack.after_damage[0]);
  const second = objectRecord(attack.after_damage[1]);
  if (String(first?.op || "") !== "INSPECT_ZONE" || String(second?.op || "") !== "INSPECT_ZONE") return null;
  if (String(first?.zone || "") !== "deck_top" || String(second?.zone || "") !== "rewards") return null;

  const deckTop = validateInspectStep(first, attackId, "deck_top");
  const rewards = validateInspectStep(second, attackId, "rewards");
  if (String(deckTop.as || "") === String(rewards.as || "")) {
    throw new Error(`tcg_v0_2_attack_inspection_choice_variables_must_differ:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    deck_top: { count: 1, visibility: "controller_private", return_policy: "same_position" },
    rewards: { min: 1, max: 1, visibility: "controller_private", return_policy: "same_position" },
  };
}

export function runtimeV02CreateAttackInspectionChoice(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackInspectionChoiceDescriptor,
  sourceInstance: unknown,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingAttackInspectionChoice {
  if (descriptor.phase !== "after_damage") throw new Error("tcg_v0_2_attack_inspection_choice_phase_unsupported");
  if (descriptor.deck_top.count !== 1 || descriptor.rewards.min !== 1 || descriptor.rewards.max !== 1) {
    throw new Error("tcg_v0_2_attack_inspection_choice_descriptor_bounds_unsupported");
  }
  if (!choiceId) throw new Error("tcg_v0_2_attack_inspection_choice_id_required");
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_inspection_choice_active_seat_mismatch");
  const player = playerForSeat(state, seat);
  const source = runtimeInst(sourceInstance, "tcg_v0_2_attack_inspection_choice_source_identity_invalid");
  assertSameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_inspection_choice_source_vanguard_changed",
  );

  const deck = player.deck as unknown[];
  if (deck.length < 1) throw new Error("tcg_v0_2_attack_inspection_choice_deck_top_unavailable");
  const topCard = runtimeInst(deck[0], "tcg_v0_2_attack_inspection_choice_deck_top_invalid");
  const rewards = player.rewards as unknown[];
  if (rewards.length < 1) throw new Error("tcg_v0_2_attack_inspection_choice_reward_unavailable");
  const rewardCards = rewards.map((value, index) =>
    runtimeInst(value, `tcg_v0_2_attack_inspection_choice_reward_invalid:${index}`)
  );
  if (new Set(rewardCards.map((card) => card.uid)).size !== rewardCards.length) {
    throw new Error("tcg_v0_2_attack_inspection_choice_reward_uid_duplicate");
  }

  recordRuntimeV02HiddenInformationView(state, seat, "deck_top");
  const options = rewardCards.map((card, position) => ({
    id: `reward:${position}`,
    label: `Reward ${position + 1}`,
    position,
    anchor_uid: card.uid,
    anchor_card_id: card.card_id,
  }));
  return {
    id: choiceId,
    seat,
    kind: "inspect_deck_top_then_choose_reward",
    attack_id: descriptor.attack_id,
    prompt: `Top card: ${cardLabel(state, topCard)}. Choose one Reward to inspect`,
    min: 1,
    max: 1,
    turn_seq: currentTurn(state),
    source_uid: source.uid,
    source_card_id: source.card_id,
    deck_top_card: topCard,
    options,
  };
}

function validatePending(choice: RuntimeV02PendingAttackInspectionChoice): void {
  if (choice.kind !== "inspect_deck_top_then_choose_reward") {
    throw new Error("tcg_v0_2_attack_inspection_choice_kind_unsupported");
  }
  if (!choice.id || !choice.attack_id || !choice.source_uid || !choice.source_card_id) {
    throw new Error("tcg_v0_2_attack_inspection_choice_pending_identity_invalid");
  }
  if (!Number.isInteger(choice.turn_seq) || choice.turn_seq < 0) {
    throw new Error("tcg_v0_2_attack_inspection_choice_pending_turn_invalid");
  }
  runtimeInst(choice.deck_top_card, "tcg_v0_2_attack_inspection_choice_pending_deck_top_invalid");
  if (!Array.isArray(choice.options) || choice.options.length < 1) {
    throw new Error("tcg_v0_2_attack_inspection_choice_pending_options_invalid");
  }
  const anchors = new Set<string>();
  for (let i = 0; i < choice.options.length; i++) {
    const option = choice.options[i];
    if (
      !option || option.position !== i || option.id !== `reward:${i}` ||
      !option.anchor_uid || !option.anchor_card_id
    ) {
      throw new Error("tcg_v0_2_attack_inspection_choice_pending_option_invalid");
    }
    if (anchors.has(option.anchor_uid)) {
      throw new Error("tcg_v0_2_attack_inspection_choice_pending_reward_uid_duplicate");
    }
    anchors.add(option.anchor_uid);
  }
}

export function runtimeV02ResolveAttackInspectionChoice(
  choice: RuntimeV02PendingAttackInspectionChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackInspectionChoiceResolution {
  validatePending(choice);
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_inspection_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_attack_inspection_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_attack_inspection_choice_exactly_one_required");
  }
  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_attack_inspection_choice_unknown_option");
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_attack_inspection_choice_turn_changed");
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_inspection_choice_active_seat_changed");

  const player = playerForSeat(state, seat);
  assertSameInst(
    currentVanguardTop(player),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_attack_inspection_choice_source_vanguard_changed",
  );
  const deck = player.deck as unknown[];
  if (deck.length < 1) throw new Error("tcg_v0_2_attack_inspection_choice_deck_top_changed");
  assertSameInst(
    runtimeInst(deck[0], "tcg_v0_2_attack_inspection_choice_current_deck_top_invalid"),
    choice.deck_top_card,
    "tcg_v0_2_attack_inspection_choice_deck_top_changed",
  );

  const rewards = player.rewards as unknown[];
  if (rewards.length !== choice.options.length) {
    throw new Error("tcg_v0_2_attack_inspection_choice_reward_set_changed");
  }
  for (const candidate of choice.options) {
    const current = runtimeInst(
      rewards[candidate.position],
      `tcg_v0_2_attack_inspection_choice_current_reward_invalid:${candidate.position}`,
    );
    assertSameInst(
      current,
      { uid: candidate.anchor_uid, card_id: candidate.anchor_card_id },
      "tcg_v0_2_attack_inspection_choice_reward_set_changed",
    );
  }

  const inspected = runtimeV02InspectRewardPositions(state, seat, [option.position]);
  if (inspected.cards.length !== 1) {
    throw new Error("tcg_v0_2_attack_inspection_choice_reward_inspection_failed");
  }
  assertSameInst(
    { uid: inspected.cards[0].uid, card_id: inspected.cards[0].card_id },
    { uid: option.anchor_uid, card_id: option.anchor_card_id },
    "tcg_v0_2_attack_inspection_choice_reward_inspection_changed",
  );

  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    deck_top_inspected_count: 1,
    reward_inspected_count: 1,
    reward_position: option.position,
  };
}
