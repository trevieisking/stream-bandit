import {
  applyRuntimeCondition,
  type ApplyConditionMode,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };
type RuntimeFieldWhere = "vanguard" | "reserve";

export type RuntimeV02AttackOverchargeDiscardDescriptor = {
  attack_id: string;
  phase: "after_damage";
  event: string;
  threshold: number;
  discard: { min: 1; max: 1 };
  condition: {
    target: "$attack_target";
    condition: string;
    mode: ApplyConditionMode;
  };
};

export type RuntimeV02AttackTargetBinding = {
  seat: 1 | 2;
  where: RuntimeFieldWhere;
  index: number | null;
  creature: RuntimeCreature;
};

export type RuntimeV02AttackOverchargeDiscardChoiceOption = {
  id: string;
  label: string;
  uid: string;
  card_id: string;
};

export type RuntimeV02PendingAttackOverchargeDiscardChoice = {
  id: string;
  seat: 1 | 2;
  kind: "discard_attached_essence_then_condition";
  attack_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  event: string;
  threshold: number;
  target_seat: 1 | 2;
  target_where: RuntimeFieldWhere;
  target_index: number | null;
  target_anchor_uid: string;
  target_anchor_card_id: string;
  target_remained_after_damage: boolean;
  condition: string;
  condition_mode: ApplyConditionMode;
  options: RuntimeV02AttackOverchargeDiscardChoiceOption[];
};

export type RuntimeV02AttackOverchargeDiscardResolution = {
  attack_id: string;
  choice_id: string;
  discarded_uid: string;
  discarded_card_id: string;
  target_remained_after_damage: boolean;
  condition: string;
  condition_applied: boolean;
  condition_prevented: boolean;
  condition_reason: string | null;
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
    throw new Error("tcg_v0_2_attack_overcharge_turn_seq_invalid");
  }
  return value;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function assertSameInst(actual: RuntimeInst, expected: RuntimeInst, error: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(error);
}

function playerForSeat(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_attack_overcharge_player_missing");
  if (!Array.isArray(player.reserve) || !Array.isArray(player.discard)) {
    throw new Error("tcg_v0_2_attack_overcharge_player_zones_invalid");
  }
  return player;
}

function runtimeCreature(value: unknown, error: string): RuntimeCreature & Record<string, unknown> {
  const creature = objectRecord(value);
  if (!creature || !Array.isArray(creature.stack) || !Array.isArray(creature.essence)) {
    throw new Error(error);
  }
  return creature as RuntimeCreature & Record<string, unknown>;
}

function topInst(creature: RuntimeCreature & Record<string, unknown>, error: string): RuntimeInst {
  const stack = creature.stack as unknown[];
  if (!stack.length) throw new Error(error);
  return runtimeInst(stack[stack.length - 1], error);
}

function currentVanguard(
  state: Record<string, unknown>,
  seat: 1 | 2,
): RuntimeCreature & Record<string, unknown> {
  const player = playerForSeat(state, seat);
  return runtimeCreature(player.vanguard, "tcg_v0_2_attack_overcharge_source_vanguard_missing");
}

function creatureAt(
  state: Record<string, unknown>,
  seat: 1 | 2,
  where: RuntimeFieldWhere,
  index: number | null,
): RuntimeCreature & Record<string, unknown> {
  const player = playerForSeat(state, seat);
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_attack_overcharge_target_vanguard_index_invalid");
    return runtimeCreature(player.vanguard, "tcg_v0_2_attack_overcharge_target_missing");
  }
  if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
    throw new Error("tcg_v0_2_attack_overcharge_target_reserve_index_invalid");
  }
  return runtimeCreature(
    (player.reserve as unknown[])[Number(index)],
    "tcg_v0_2_attack_overcharge_target_missing",
  );
}

function conditionMode(value: unknown, attackId: string): ApplyConditionMode {
  const mode = String(value || "apply") as ApplyConditionMode;
  if (!["apply", "apply_if_empty", "apply_if_empty_or_same", "replace"].includes(mode)) {
    throw new Error(`tcg_v0_2_attack_overcharge_condition_mode_unsupported:${attackId}:${mode}`);
  }
  return mode;
}

function cardLabel(state: Record<string, unknown>, inst: RuntimeInst): string {
  const definition = runtimeV02Definition(state, inst);
  const name = definition && typeof definition.name === "string" ? definition.name.trim() : "";
  return name || inst.card_id || "Essence";
}

/**
 * Recognizes exactly this data-driven attack family:
 *
 * on_declare: RECORD_EVENT when source attached Essence count reaches a threshold
 * after_damage: IF that current-action event occurred, then discard exactly one
 * attached Essence from the source and condition the actual attack target only
 * when it remained in play after damage.
 *
 * The owner is card-id-free and does not claim generic RECORD_EVENT / IF /
 * DISCARD_ATTACHED_ESSENCE interpreter parity.
 */
export function structuredRuntimeAfterDamageOverchargeDiscardCondition(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackOverchargeDiscardDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_overcharge_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_overcharge_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_overcharge_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_overcharge_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_overcharge_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_overcharge_attack_id_required");
  if (!Array.isArray(attack.on_declare) || !Array.isArray(attack.before_damage) || !Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_overcharge_phases_required:${attackId}`);
  }
  if (attack.on_declare.length !== 1 || attack.before_damage.length !== 0 || attack.after_damage.length !== 1) {
    return null;
  }

  const record = objectRecord(attack.on_declare[0]);
  const outerIf = objectRecord(attack.after_damage[0]);
  if (String(record?.op || "") !== "RECORD_EVENT" || String(outerIf?.op || "") !== "IF") return null;

  rejectUnsupportedFields(record!, ["op", "event", "when"], `tcg_v0_2_attack_overcharge_record_field_unsupported:${attackId}`);
  const event = requiredString(record!.event, `tcg_v0_2_attack_overcharge_event_required:${attackId}`);
  const recordWhen = objectRecord(record!.when);
  if (!recordWhen) throw new Error(`tcg_v0_2_attack_overcharge_record_when_required:${attackId}`);
  rejectUnsupportedFields(recordWhen, ["predicate", "count"], `tcg_v0_2_attack_overcharge_record_when_field_unsupported:${attackId}`);
  if (String(recordWhen.predicate || "") !== "event_attack_source_attached_essence_count_at_least") {
    return null;
  }
  const threshold = Number(recordWhen.count);
  if (!Number.isInteger(threshold) || threshold < 1) {
    throw new Error(`tcg_v0_2_attack_overcharge_threshold_invalid:${attackId}`);
  }

  rejectUnsupportedFields(outerIf!, ["op", "when", "then"], `tcg_v0_2_attack_overcharge_outer_if_field_unsupported:${attackId}`);
  const outerWhen = objectRecord(outerIf!.when);
  if (!outerWhen) throw new Error(`tcg_v0_2_attack_overcharge_outer_when_required:${attackId}`);
  rejectUnsupportedFields(
    outerWhen,
    ["predicate", "event", "controller", "window", "min_count"],
    `tcg_v0_2_attack_overcharge_outer_when_field_unsupported:${attackId}`,
  );
  if (
    String(outerWhen.predicate || "") !== "event_occurred" ||
    String(outerWhen.event || "") !== event ||
    String(outerWhen.controller || "") !== "self" ||
    String(outerWhen.window || "") !== "current_action" ||
    Number(outerWhen.min_count) !== 1
  ) {
    throw new Error(`tcg_v0_2_attack_overcharge_outer_when_shape_unsupported:${attackId}`);
  }

  const then = outerIf!.then;
  if (!Array.isArray(then) || then.length !== 2) {
    throw new Error(`tcg_v0_2_attack_overcharge_then_shape_unsupported:${attackId}`);
  }
  const discard = objectRecord(then[0]);
  const surviveIf = objectRecord(then[1]);
  if (String(discard?.op || "") !== "DISCARD_ATTACHED_ESSENCE" || String(surviveIf?.op || "") !== "IF") {
    throw new Error(`tcg_v0_2_attack_overcharge_then_ops_unsupported:${attackId}`);
  }

  rejectUnsupportedFields(discard!, ["op", "target", "selection"], `tcg_v0_2_attack_overcharge_discard_field_unsupported:${attackId}`);
  if (String(discard!.target || "") !== "$source_creature") {
    throw new Error(`tcg_v0_2_attack_overcharge_discard_target_unsupported:${attackId}`);
  }
  const selection = objectRecord(discard!.selection);
  if (!selection) throw new Error(`tcg_v0_2_attack_overcharge_selection_required:${attackId}`);
  rejectUnsupportedFields(selection, ["min", "max", "filters"], `tcg_v0_2_attack_overcharge_selection_field_unsupported:${attackId}`);
  const filters = objectRecord(selection.filters);
  if (!filters || Object.keys(filters).length !== 0 || Number(selection.min) !== 1 || Number(selection.max) !== 1) {
    throw new Error(`tcg_v0_2_attack_overcharge_selection_shape_unsupported:${attackId}`);
  }

  rejectUnsupportedFields(surviveIf!, ["op", "when", "then"], `tcg_v0_2_attack_overcharge_survive_if_field_unsupported:${attackId}`);
  const surviveWhen = objectRecord(surviveIf!.when);
  if (!surviveWhen) throw new Error(`tcg_v0_2_attack_overcharge_survive_when_required:${attackId}`);
  rejectUnsupportedFields(surviveWhen, ["predicate"], `tcg_v0_2_attack_overcharge_survive_when_field_unsupported:${attackId}`);
  if (String(surviveWhen.predicate || "") !== "target_remains_in_play_after_damage") {
    throw new Error(`tcg_v0_2_attack_overcharge_survive_predicate_unsupported:${attackId}`);
  }
  const surviveThen = surviveIf!.then;
  if (!Array.isArray(surviveThen) || surviveThen.length !== 1) {
    throw new Error(`tcg_v0_2_attack_overcharge_survive_then_shape_unsupported:${attackId}`);
  }
  const condition = objectRecord(surviveThen[0]);
  if (String(condition?.op || "") !== "APPLY_CONDITION") {
    throw new Error(`tcg_v0_2_attack_overcharge_condition_op_unsupported:${attackId}`);
  }
  rejectUnsupportedFields(condition!, ["op", "target", "condition", "mode"], `tcg_v0_2_attack_overcharge_condition_field_unsupported:${attackId}`);
  if (String(condition!.target || "") !== "$attack_target") {
    throw new Error(`tcg_v0_2_attack_overcharge_condition_target_unsupported:${attackId}`);
  }
  const conditionName = requiredString(condition!.condition, `tcg_v0_2_attack_overcharge_condition_required:${attackId}`);
  const mode = conditionMode(condition!.mode, attackId);

  return {
    attack_id: attackId,
    phase: "after_damage",
    event,
    threshold,
    discard: { min: 1, max: 1 },
    condition: { target: "$attack_target", condition: conditionName, mode },
  };
}

export function runtimeV02AttackOverchargeTriggered(
  descriptor: RuntimeV02AttackOverchargeDiscardDescriptor,
  sourceCreature: RuntimeCreature & Record<string, unknown>,
): boolean {
  if (!Number.isInteger(descriptor.threshold) || descriptor.threshold < 1) {
    throw new Error("tcg_v0_2_attack_overcharge_descriptor_threshold_invalid");
  }
  if (!Array.isArray(sourceCreature.essence)) {
    throw new Error("tcg_v0_2_attack_overcharge_source_essence_invalid");
  }
  return sourceCreature.essence.length >= descriptor.threshold;
}

export function runtimeV02CreateAttackOverchargeDiscardChoice(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackOverchargeDiscardDescriptor,
  sourceInstance: unknown,
  target: RuntimeV02AttackTargetBinding,
  targetRemainedAfterDamage: boolean,
  triggeredAtDeclaration: boolean,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingAttackOverchargeDiscardChoice | null {
  if (!triggeredAtDeclaration) return null;
  if (!choiceId) throw new Error("tcg_v0_2_attack_overcharge_choice_id_required");
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_overcharge_active_seat_mismatch");
  const turn = currentTurn(state);
  const source = runtimeInst(sourceInstance, "tcg_v0_2_attack_overcharge_source_identity_invalid");
  const sourceCreature = currentVanguard(state, seat);
  assertSameInst(
    topInst(sourceCreature, "tcg_v0_2_attack_overcharge_source_top_invalid"),
    source,
    "tcg_v0_2_attack_overcharge_source_vanguard_changed",
  );

  const canonicalTarget = creatureAt(state, target.seat, target.where, target.index);
  const providedTargetTop = topInst(
    target.creature as RuntimeCreature & Record<string, unknown>,
    "tcg_v0_2_attack_overcharge_target_top_invalid",
  );
  const canonicalTargetTop = topInst(canonicalTarget, "tcg_v0_2_attack_overcharge_target_top_invalid");
  assertSameInst(canonicalTargetTop, providedTargetTop, "tcg_v0_2_attack_overcharge_target_changed");

  const essence = (sourceCreature.essence as unknown[]).map((raw, index) =>
    runtimeInst(raw, `tcg_v0_2_attack_overcharge_essence_invalid:${index}`)
  );
  if (essence.length < descriptor.threshold) {
    throw new Error("tcg_v0_2_attack_overcharge_declaration_snapshot_invalid");
  }
  if (new Set(essence.map((inst) => inst.uid)).size !== essence.length) {
    throw new Error("tcg_v0_2_attack_overcharge_essence_uid_duplicate");
  }
  const options = essence.map((inst) => ({
    id: `essence:${inst.uid}`,
    label: cardLabel(state, inst),
    uid: inst.uid,
    card_id: inst.card_id,
  }));
  if (!options.length) throw new Error("tcg_v0_2_attack_overcharge_discard_option_unavailable");

  return {
    id: choiceId,
    seat,
    kind: "discard_attached_essence_then_condition",
    attack_id: descriptor.attack_id,
    prompt: "Choose one attached Essence to discard",
    min: 1,
    max: 1,
    turn_seq: turn,
    source_uid: source.uid,
    source_card_id: source.card_id,
    event: descriptor.event,
    threshold: descriptor.threshold,
    target_seat: target.seat,
    target_where: target.where,
    target_index: target.index,
    target_anchor_uid: canonicalTargetTop.uid,
    target_anchor_card_id: canonicalTargetTop.card_id,
    target_remained_after_damage: Boolean(targetRemainedAfterDamage),
    condition: descriptor.condition.condition,
    condition_mode: descriptor.condition.mode,
    options,
  };
}

function validatePending(choice: RuntimeV02PendingAttackOverchargeDiscardChoice): void {
  if (choice.kind !== "discard_attached_essence_then_condition") {
    throw new Error("tcg_v0_2_attack_overcharge_choice_kind_unsupported");
  }
  if (!choice.id || !choice.attack_id || !choice.source_uid || !choice.source_card_id || !choice.event) {
    throw new Error("tcg_v0_2_attack_overcharge_pending_identity_invalid");
  }
  if (!Number.isInteger(choice.turn_seq) || choice.turn_seq < 0 || !Number.isInteger(choice.threshold) || choice.threshold < 1) {
    throw new Error("tcg_v0_2_attack_overcharge_pending_snapshot_invalid");
  }
  if (!choice.target_anchor_uid || !choice.target_anchor_card_id) {
    throw new Error("tcg_v0_2_attack_overcharge_pending_target_invalid");
  }
  if (!Array.isArray(choice.options) || choice.options.length < 1) {
    throw new Error("tcg_v0_2_attack_overcharge_pending_options_invalid");
  }
  const uids = new Set<string>();
  for (const option of choice.options) {
    if (!option || option.id !== `essence:${option.uid}` || !option.uid || !option.card_id) {
      throw new Error("tcg_v0_2_attack_overcharge_pending_option_invalid");
    }
    if (uids.has(option.uid)) throw new Error("tcg_v0_2_attack_overcharge_pending_option_duplicate");
    uids.add(option.uid);
  }
}

export function runtimeV02ResolveAttackOverchargeDiscardChoice(
  choice: RuntimeV02PendingAttackOverchargeDiscardChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackOverchargeDiscardResolution {
  validatePending(choice);
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_overcharge_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_attack_overcharge_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_attack_overcharge_exactly_one_required");
  }
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_attack_overcharge_turn_changed");
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_overcharge_active_seat_changed");

  const sourceCreature = currentVanguard(state, seat);
  assertSameInst(
    topInst(sourceCreature, "tcg_v0_2_attack_overcharge_source_top_invalid"),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_attack_overcharge_source_vanguard_changed",
  );
  const target = creatureAt(state, choice.target_seat, choice.target_where, choice.target_index);
  assertSameInst(
    topInst(target, "tcg_v0_2_attack_overcharge_target_top_invalid"),
    { uid: choice.target_anchor_uid, card_id: choice.target_anchor_card_id },
    "tcg_v0_2_attack_overcharge_target_changed",
  );

  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_attack_overcharge_unknown_option");
  const essence = sourceCreature.essence as unknown[];
  const essenceIndex = essence.findIndex((raw) => objectRecord(raw)?.uid === option.uid);
  if (essenceIndex < 0) throw new Error("tcg_v0_2_attack_overcharge_selected_essence_changed");
  const selected = runtimeInst(essence[essenceIndex], "tcg_v0_2_attack_overcharge_selected_essence_invalid");
  assertSameInst(selected, { uid: option.uid, card_id: option.card_id }, "tcg_v0_2_attack_overcharge_selected_essence_changed");

  const controller = playerForSeat(state, seat);
  const [discardedRaw] = essence.splice(essenceIndex, 1);
  (controller.discard as unknown[]).push(discardedRaw);

  let conditionApplied = false;
  let conditionPrevented = false;
  let conditionReason: string | null = null;
  if (choice.target_remained_after_damage) {
    const result = applyRuntimeCondition(target, choice.condition, choice.turn_seq, choice.condition_mode);
    conditionApplied = result.applied;
    conditionPrevented = result.prevented;
    conditionReason = result.reason || null;
  }

  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    discarded_uid: selected.uid,
    discarded_card_id: selected.card_id,
    target_remained_after_damage: choice.target_remained_after_damage,
    condition: choice.condition,
    condition_applied: conditionApplied,
    condition_prevented: conditionPrevented,
    condition_reason: conditionReason,
  };
}
