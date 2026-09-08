import { healRuntimeDamage, type RuntimeCreature } from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import type { RuntimeV02AttackSelectedHealChoice } from "./tcg-match-attack-effects-v0-2.ts";

export type RuntimeV02FriendlyFieldEntry = {
  where: "vanguard" | "reserve";
  index: number | null;
  creature: RuntimeCreature;
  anchor_uid: string;
  label: string;
};

export type RuntimeV02AttackSelectedHealChoiceOption = {
  id: string;
  label: string;
  anchor_uid: string;
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02PendingAttackChoice = {
  id: string;
  seat: 1 | 2;
  kind: "select_damaged_friendly_creature_heal";
  attack_id: string;
  prompt: string;
  min: 1;
  max: 1;
  amount: number;
  options: RuntimeV02AttackSelectedHealChoiceOption[];
};

export type RuntimeV02AttackSelectedHealResolution = {
  attack_id: string;
  choice_id: string;
  option_id: string;
  target_where: "vanguard" | "reserve";
  target_index: number | null;
  target_anchor_uid: string;
  target_label: string;
  amount: number;
  actual_heal: number;
};

function validateDescriptor(descriptor: RuntimeV02AttackSelectedHealChoice): void {
  if (descriptor.phase !== "after_damage") throw new Error("tcg_v0_2_attack_choice_phase_unsupported");
  if (descriptor.selection.controller !== "self") throw new Error("tcg_v0_2_attack_choice_controller_unsupported");
  if (descriptor.selection.zone !== "field") throw new Error("tcg_v0_2_attack_choice_zone_unsupported");
  if (descriptor.selection.count !== 1) throw new Error("tcg_v0_2_attack_choice_count_unsupported");
  if (descriptor.selection.filters.damaged !== true) throw new Error("tcg_v0_2_attack_choice_damaged_filter_required");
  if (!descriptor.selection.as || descriptor.heal.target !== `$${descriptor.selection.as}`) {
    throw new Error("tcg_v0_2_attack_choice_variable_mismatch");
  }
  if (!Number.isFinite(descriptor.heal.amount) || descriptor.heal.amount <= 0) {
    throw new Error("tcg_v0_2_attack_choice_amount_invalid");
  }
}

function validateEntries(entries: RuntimeV02FriendlyFieldEntry[]): void {
  const anchors = entries.map((entry) => String(entry.anchor_uid || ""));
  if (anchors.some((anchor) => !anchor)) throw new Error("tcg_v0_2_attack_choice_anchor_required");
  if (new Set(anchors).size !== anchors.length) throw new Error("tcg_v0_2_attack_choice_anchor_duplicate");
}

export function runtimeV02CreateSelectedHealChoice(
  seat: 1 | 2,
  descriptor: RuntimeV02AttackSelectedHealChoice,
  entries: RuntimeV02FriendlyFieldEntry[],
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingAttackChoice | null {
  validateDescriptor(descriptor);
  validateEntries(entries);
  if (!choiceId) throw new Error("tcg_v0_2_attack_choice_id_required");

  const legal = entries.filter((entry) => Math.max(0, Number(entry.creature.damage || 0)) > 0);
  if (!legal.length) return null;
  const options = legal.map((entry) => ({
    id: `creature:${seat}:${entry.anchor_uid}`,
    label: entry.label || "Creature",
    anchor_uid: entry.anchor_uid,
    where: entry.where,
    index: entry.index,
  }));
  return {
    id: choiceId,
    seat,
    kind: "select_damaged_friendly_creature_heal",
    attack_id: descriptor.attack_id,
    prompt: "Choose a damaged friendly creature",
    min: 1,
    max: 1,
    amount: descriptor.heal.amount,
    options,
  };
}

export function runtimeV02PendingAttackChoiceView(
  choice: RuntimeV02PendingAttackChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

export function runtimeV02ResolveSelectedHealChoice(
  choice: RuntimeV02PendingAttackChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  entries: RuntimeV02FriendlyFieldEntry[],
): RuntimeV02AttackSelectedHealResolution {
  validateEntries(entries);
  if (choice.kind !== "select_damaged_friendly_creature_heal") {
    throw new Error("tcg_v0_2_attack_choice_kind_unsupported");
  }
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_attack_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_attack_choice_exactly_one_required");
  }
  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_attack_choice_unknown_option");
  const entry = entries.find((candidate) => candidate.anchor_uid === option.anchor_uid);
  if (!entry) throw new Error("tcg_v0_2_attack_choice_target_missing");
  if (entry.where !== option.where || entry.index !== option.index) {
    throw new Error("tcg_v0_2_attack_choice_target_position_changed");
  }
  if (Math.max(0, Number(entry.creature.damage || 0)) <= 0) {
    throw new Error("tcg_v0_2_attack_choice_target_not_damaged");
  }
  const actualHeal = healRuntimeDamage(entry.creature, choice.amount);
  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    option_id: option.id,
    target_where: entry.where,
    target_index: entry.index,
    target_anchor_uid: entry.anchor_uid,
    target_label: entry.label || option.label || "Creature",
    amount: choice.amount,
    actual_heal: actualHeal,
  };
}
