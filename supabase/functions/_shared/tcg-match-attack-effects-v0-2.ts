import {
  applyRuntimeCondition,
  placeRuntimeDamage,
  type ApplyConditionMode,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02AttackConditionTarget =
  | "$source_creature"
  | "$attack_target"
  | "$current_opponent_vanguard";

export type RuntimeV02AttackConditionEffectResult = {
  target: RuntimeV02AttackConditionTarget;
  condition: string;
  mode: ApplyConditionMode;
  applied: boolean;
  prevented: boolean;
  reason: string | null;
};

export type RuntimeV02AttackConditionPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackConditionEffectResult[];
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

function currentTurn(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attack_condition_turn_seq_invalid");
  }
  return value;
}

function mode(value: unknown, attackId: string, index: number): ApplyConditionMode {
  if (value == null) return "apply";
  const normalized = String(value) as ApplyConditionMode;
  if (!["apply", "apply_if_empty", "apply_if_empty_or_same", "replace"].includes(normalized)) {
    throw new Error(`tcg_v0_2_attack_condition_mode_unsupported:${attackId}:${index}:${String(value)}`);
  }
  return normalized;
}

function targetToken(value: unknown, attackId: string, index: number): RuntimeV02AttackConditionTarget {
  const target = String(value || "") as RuntimeV02AttackConditionTarget;
  if (
    target !== "$source_creature" &&
    target !== "$attack_target" &&
    target !== "$current_opponent_vanguard"
  ) {
    throw new Error(`tcg_v0_2_attack_condition_target_unsupported:${attackId}:${index}:${String(value)}`);
  }
  return target;
}

function resolveTarget(
  target: RuntimeV02AttackConditionTarget,
  sourceCreature: RuntimeCreature,
  attackTarget: RuntimeCreature,
  currentOpponentVanguard: RuntimeCreature | null | undefined,
): RuntimeCreature {
  if (target === "$source_creature") return sourceCreature;
  if (target === "$attack_target") return attackTarget;
  if (!currentOpponentVanguard) throw new Error("tcg_v0_2_attack_condition_opponent_vanguard_missing");
  return currentOpponentVanguard;
}

/**
 * Owns only structured v0.2 after-damage programs made entirely from
 * APPLY_CONDITION steps. Mixed programs deliberately return null so the current
 * compatibility path remains authoritative until the other opcodes migrate.
 *
 * Marked v0.2 metadata is fail-closed: malformed condition steps throw instead
 * of falling through to printed English.
 */
export function structuredRuntimeAfterDamageConditionEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
  attackTarget: RuntimeCreature,
  currentOpponentVanguard: RuntimeCreature | null | undefined,
): RuntimeV02AttackConditionPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_condition_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_condition_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_condition_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_condition_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_condition_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_condition_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_condition_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_condition_step_invalid:${attackId}:${index}`);
    if (String(step.op || "") !== "APPLY_CONDITION") return null;
    rejectUnsupportedFields(
      step,
      ["op", "target", "condition", "mode"],
      `tcg_v0_2_attack_condition_step_field_unsupported:${attackId}:${index}`,
    );
    const condition = typeof step.condition === "string" ? step.condition.trim() : "";
    if (!condition) throw new Error(`tcg_v0_2_attack_condition_name_required:${attackId}:${index}`);
    return {
      target: targetToken(step.target, attackId, index),
      condition,
      mode: mode(step.mode, attackId, index),
    };
  });

  if (normalized.some((step) => step == null)) return null;

  const turn = currentTurn(state);
  const effects = normalized.map((raw) => {
    const step = raw!;
    const target = resolveTarget(step.target, sourceCreature, attackTarget, currentOpponentVanguard);
    const result = applyRuntimeCondition(target, step.condition, turn, step.mode);
    return {
      target: step.target,
      condition: step.condition,
      mode: step.mode,
      applied: result.applied,
      prevented: result.prevented,
      reason: result.reason || null,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects };
}


export type RuntimeV02AttackRecoilEffectResult = {
  target: "$source_creature";
  damage_class: "recoil";
  amount: number;
  source_attack_id: string;
  placed: number;
  shield_prevented: 0;
};

export type RuntimeV02AttackRecoilPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackRecoilEffectResult[];
};

/**
 * Owns only structured v0.2 attack after-damage programs made entirely from
 * attack-owned DIRECT_DAMAGE recoil instructions aimed at the source creature.
 *
 * This intentionally preserves the current recoil placement rule: recoil adds
 * directly to accumulated damage and does not consume Shield. Damage-packet
 * listeners remain a separate later runtime pass; this owner does not pretend
 * those listener lifecycles are complete.
 *
 * Mixed programs and non-recoil DIRECT_DAMAGE return null so compatibility
 * authority remains whole rather than partially executing a structured list.
 */
export function structuredRuntimeAfterDamageRecoilEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
): RuntimeV02AttackRecoilPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_recoil_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_recoil_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_recoil_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_recoil_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_recoil_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_recoil_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_recoil_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_recoil_step_invalid:${attackId}:${index}`);
    if (String(step.op || "") !== "DIRECT_DAMAGE") return null;
    if (String(step.damage_class || "") !== "recoil") return null;
    rejectUnsupportedFields(
      step,
      ["op", "target", "amount", "damage_class", "source_attack_id"],
      `tcg_v0_2_attack_recoil_step_field_unsupported:${attackId}:${index}`,
    );
    if (String(step.target || "") !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_recoil_target_unsupported:${attackId}:${index}`);
    }
    const amount = Number(step.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_recoil_amount_invalid:${attackId}:${index}`);
    }
    const sourceAttackId = typeof step.source_attack_id === "string" ? step.source_attack_id.trim() : "";
    if (sourceAttackId !== attackId) {
      throw new Error(`tcg_v0_2_attack_recoil_source_attack_mismatch:${attackId}:${index}`);
    }
    return { amount, source_attack_id: sourceAttackId };
  });

  if (normalized.some((step) => step == null)) return null;

  const effects = normalized.map((raw) => {
    const step = raw!;
    const placed = placeRuntimeDamage(sourceCreature, step.amount);
    return {
      target: "$source_creature" as const,
      damage_class: "recoil" as const,
      amount: step.amount,
      source_attack_id: step.source_attack_id,
      placed,
      shield_prevented: 0 as const,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects };
}
