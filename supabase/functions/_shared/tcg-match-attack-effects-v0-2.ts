import {
  addRuntimeShield,
  applyRuntimeCondition,
  healRuntimeDamage,
  placeRuntimeDamage,
  type ApplyConditionMode,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  recordRuntimeV02AttackHealEachPackets,
  recordRuntimeV02AttackSelfHealPackets,
  type RuntimeV02AttackHealEachPacketContext,
} from "./tcg-match-attack-heal-packet-v0-2.ts";

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

export type RuntimeV02AttackShieldEffectResult = {
  target: "$source_creature";
  amount: number;
  actual_gain: number;
  shield_cap: 60;
};

export type RuntimeV02AttackShieldPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackShieldEffectResult[];
};

/**
 * Owns only structured v0.2 attack after-damage programs made entirely from
 * ADD_SHIELD instructions aimed at the source creature.
 *
 * Shield addition itself is delegated to addRuntimeShield so Tactic, legacy
 * match actions and structured attacks share the same 60-Shield cap owner.
 * shield_gained listeners remain a separate later runtime pass; this slice
 * preserves the current state transition without claiming listener parity.
 *
 * Mixed programs deliberately return null so compatibility authority remains
 * whole rather than partially executing a structured list.
 */
export function structuredRuntimeAfterDamageShieldEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
): RuntimeV02AttackShieldPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_shield_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_shield_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_shield_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_shield_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_shield_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_shield_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_shield_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_shield_step_invalid:${attackId}:${index}`);
    if (String(step.op || "") !== "ADD_SHIELD") return null;
    rejectUnsupportedFields(
      step,
      ["op", "target", "amount"],
      `tcg_v0_2_attack_shield_step_field_unsupported:${attackId}:${index}`,
    );
    if (String(step.target || "") !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_shield_target_unsupported:${attackId}:${index}`);
    }
    const amount = Number(step.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_shield_amount_invalid:${attackId}:${index}`);
    }
    return { amount };
  });

  if (normalized.some((step) => step == null)) return null;

  const resolved = normalized.map((raw) => {
    const step = raw!;
    const actualGain = addRuntimeShield(sourceCreature, step.amount);
    return {
      target: "$source_creature" as const,
      amount: step.amount,
      actual_gain: actualGain,
      shield_cap: 60 as const,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects: resolved };
}

export type RuntimeV02AttackSelfHealPredicate =
  | { predicate: "source_damaged" }
  | { predicate: "source_has_shield_at_least"; value: number };

export type RuntimeV02AttackSelfHealEffectResult = {
  target: "$source_creature";
  when: RuntimeV02AttackSelfHealPredicate;
  amount: number;
  condition_met: boolean;
  actual_heal: number;
};

export type RuntimeV02AttackSelfHealPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackSelfHealEffectResult[];
  emitted_packet_ids: string[];
};

function selfHealCandidate(step: Record<string, unknown>): boolean {
  if (String(step.op || "") !== "IF") return false;
  const then = step.then;
  if (!Array.isArray(then) || then.length === 0) return false;
  return then.every((raw) => {
    const item = objectRecord(raw);
    return item != null && String(item.op || "") === "HEAL";
  });
}

function selfHealPredicate(
  raw: unknown,
  attackId: string,
  index: number,
): RuntimeV02AttackSelfHealPredicate {
  const when = objectRecord(raw);
  if (!when) throw new Error(`tcg_v0_2_attack_self_heal_predicate_invalid:${attackId}:${index}`);
  const predicate = String(when.predicate || "");
  if (predicate === "source_damaged") {
    rejectUnsupportedFields(
      when,
      ["predicate"],
      `tcg_v0_2_attack_self_heal_predicate_field_unsupported:${attackId}:${index}`,
    );
    return { predicate: "source_damaged" };
  }
  if (predicate === "source_has_shield_at_least") {
    rejectUnsupportedFields(
      when,
      ["predicate", "value"],
      `tcg_v0_2_attack_self_heal_predicate_field_unsupported:${attackId}:${index}`,
    );
    const value = Number(when.value);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`tcg_v0_2_attack_self_heal_shield_threshold_invalid:${attackId}:${index}`);
    }
    return { predicate: "source_has_shield_at_least", value };
  }
  throw new Error(`tcg_v0_2_attack_self_heal_predicate_unsupported:${attackId}:${index}:${predicate}`);
}

function selfHealConditionMatches(
  when: RuntimeV02AttackSelfHealPredicate,
  sourceCreature: RuntimeCreature,
): boolean {
  if (when.predicate === "source_damaged") {
    return Math.max(0, Number(sourceCreature.damage || 0)) > 0;
  }
  return Math.max(0, Number(sourceCreature.shield || 0)) >= when.value;
}

function selfHealPacketContext(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  sourceCreature: RuntimeCreature,
) {
  const players = objectRecord(state.players);
  // Shared effect-unit tests intentionally exercise the resolver without a full
  // match envelope. Real match states always carry players; once present, the
  // source must bind to exactly one canonical battlefield location.
  if (!players) return null;
  const sourceInstance = objectRecord(instanceOrId);
  if (!sourceInstance) {
    throw new Error("tcg_v0_2_attack_self_heal_packet_source_instance_required");
  }
  const matches: Array<{
    seat: 1 | 2;
    where: "vanguard" | "reserve";
    index: number | null;
  }> = [];
  for (const controllerSeat of [1, 2] as const) {
    const player = objectRecord(players[String(controllerSeat)]);
    if (!player) throw new Error("tcg_v0_2_attack_self_heal_packet_player_missing");
    if (player.vanguard === sourceCreature) {
      matches.push({ seat: controllerSeat, where: "vanguard", index: null });
    }
    if (player.reserve != null && !Array.isArray(player.reserve)) {
      throw new Error("tcg_v0_2_attack_self_heal_packet_reserve_invalid");
    }
    if (Array.isArray(player.reserve)) {
      for (let index = 0; index < player.reserve.length; index += 1) {
        if (player.reserve[index] === sourceCreature) {
          matches.push({ seat: controllerSeat, where: "reserve", index });
        }
      }
    }
  }
  if (matches.length !== 1) {
    throw new Error("tcg_v0_2_attack_self_heal_packet_source_location_ambiguous");
  }
  const found = matches[0];
  return {
    controller_seat: found.seat,
    source_instance: {
      uid: String(sourceInstance.uid || ""),
      card_id: String(sourceInstance.card_id || ""),
    },
    source_creature: sourceCreature,
    source_where: found.where,
    source_index: found.index,
  };
}

/**
 * Owns only deterministic structured v0.2 attack after-damage programs made
 * entirely from IF -> HEAL $source_creature steps using source_damaged or
 * source_has_shield_at_least predicates.
 *
 * HEAL_EACH, selected-target healing and mixed programs deliberately remain on
 * compatibility/choice authority. Healing itself delegates to healRuntimeDamage
 * so Tactic, legacy match actions and structured attacks share one state owner.
 * after_heal_packet listeners remain a later runtime pass for dispatch; this
 * slice now records the canonical packet IDs without healing a second time.
 */
export function structuredRuntimeAfterDamageSelfHealEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
): RuntimeV02AttackSelfHealPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_self_heal_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_self_heal_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_self_heal_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_self_heal_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_self_heal_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_self_heal_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_self_heal_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_self_heal_step_invalid:${attackId}:${index}`);
    if (!selfHealCandidate(step)) return null;
    rejectUnsupportedFields(
      step,
      ["op", "when", "then"],
      `tcg_v0_2_attack_self_heal_step_field_unsupported:${attackId}:${index}`,
    );
    const then = step.then as unknown[];
    if (then.length !== 1) {
      throw new Error(`tcg_v0_2_attack_self_heal_then_count_unsupported:${attackId}:${index}`);
    }
    const heal = objectRecord(then[0]);
    if (!heal) throw new Error(`tcg_v0_2_attack_self_heal_heal_step_invalid:${attackId}:${index}`);
    rejectUnsupportedFields(
      heal,
      ["op", "target", "amount"],
      `tcg_v0_2_attack_self_heal_heal_field_unsupported:${attackId}:${index}`,
    );
    if (String(heal.target || "") !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_self_heal_target_unsupported:${attackId}:${index}`);
    }
    const amount = Number(heal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_self_heal_amount_invalid:${attackId}:${index}`);
    }
    return {
      when: selfHealPredicate(step.when, attackId, index),
      amount,
    };
  });

  if (normalized.some((step) => step == null)) return null;

  const resolved = normalized.map((raw) => {
    const step = raw!;
    const conditionMet = selfHealConditionMatches(step.when, sourceCreature);
    const actualHeal = conditionMet ? healRuntimeDamage(sourceCreature, step.amount) : 0;
    return {
      target: "$source_creature" as const,
      when: step.when,
      amount: step.amount,
      condition_met: conditionMet,
      actual_heal: actualHeal,
    };
  });

  const result: RuntimeV02AttackSelfHealPhaseResult = {
    attack_id: attackId,
    phase: "after_damage",
    effects: resolved,
    emitted_packet_ids: [],
  };
  const packetContext = selfHealPacketContext(state, instanceOrId, sourceCreature);
  if (packetContext) {
    result.emitted_packet_ids = recordRuntimeV02AttackSelfHealPackets(
      state,
      result,
      packetContext,
    ).map((packet) => packet.id);
  }
  return result;
}

export type RuntimeV02AttackHealEachPredicate = {
  predicate: "reserve_count_at_least";
  controller: "self";
  count: number;
};

export type RuntimeV02AttackHealEachTargetResult = {
  reserve_index: number;
  actual_heal: number;
};

export type RuntimeV02AttackHealEachEffectResult = {
  when: RuntimeV02AttackHealEachPredicate;
  controller: "self";
  zone: "reserve";
  filters: { card_family: "Creature" };
  amount: number;
  condition_met: boolean;
  target_count: number;
  actual_heal_total: number;
  targets: RuntimeV02AttackHealEachTargetResult[];
};

export type RuntimeV02AttackHealEachPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackHealEachEffectResult[];
  emitted_packet_ids: string[];
};

function healEachCandidate(step: Record<string, unknown>): boolean {
  if (String(step.op || "") !== "IF") return false;
  const then = step.then;
  if (!Array.isArray(then) || then.length === 0) return false;
  return then.every((raw) => {
    const item = objectRecord(raw);
    return item != null && String(item.op || "") === "HEAL_EACH";
  });
}

function healEachPredicate(
  raw: unknown,
  attackId: string,
  index: number,
): RuntimeV02AttackHealEachPredicate {
  const when = objectRecord(raw);
  if (!when) throw new Error(`tcg_v0_2_attack_heal_each_predicate_invalid:${attackId}:${index}`);
  rejectUnsupportedFields(
    when,
    ["predicate", "controller", "count"],
    `tcg_v0_2_attack_heal_each_predicate_field_unsupported:${attackId}:${index}`,
  );
  if (String(when.predicate || "") !== "reserve_count_at_least") {
    throw new Error(`tcg_v0_2_attack_heal_each_predicate_unsupported:${attackId}:${index}:${String(when.predicate || "")}`);
  }
  if (String(when.controller || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_heal_each_predicate_controller_unsupported:${attackId}:${index}`);
  }
  const count = Number(when.count);
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`tcg_v0_2_attack_heal_each_count_invalid:${attackId}:${index}`);
  }
  return { predicate: "reserve_count_at_least", controller: "self", count };
}

function healEachPacketContext(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  friendlyReserve: Array<RuntimeCreature | null | undefined>,
): RuntimeV02AttackHealEachPacketContext | null {
  const players = objectRecord(state.players);
  // Shared effect-unit tests intentionally omit the match envelope. Once a real
  // match supplies players, HEAL_EACH must bind the exact attacking Vanguard
  // and the exact controller-owned Reserve before any healing is applied.
  if (!players) return null;
  const sourceInstance = objectRecord(instanceOrId);
  if (!sourceInstance) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_source_instance_required");
  }
  const uid = String(sourceInstance.uid || "").trim();
  const cardId = String(sourceInstance.card_id || "").trim();
  if (!uid || !cardId) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_source_identity_required");
  }

  const matches: Array<RuntimeV02AttackHealEachPacketContext> = [];
  for (const controllerSeat of [1, 2] as const) {
    const player = objectRecord(players[String(controllerSeat)]);
    if (!player) throw new Error("tcg_v0_2_attack_heal_each_packet_player_missing");
    if (!Array.isArray(player.reserve)) {
      throw new Error("tcg_v0_2_attack_heal_each_packet_reserve_invalid");
    }
    if (player.reserve !== friendlyReserve) continue;
    const sourceCreature = player.vanguard as RuntimeCreature | null | undefined;
    const vanguard = objectRecord(sourceCreature);
    if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) continue;
    const top = objectRecord(vanguard.stack[vanguard.stack.length - 1]);
    if (!top) continue;
    if (String(top.uid || "").trim() !== uid || String(top.card_id || "").trim() !== cardId) continue;
    matches.push({
      controller_seat: controllerSeat,
      source_instance: { uid, card_id: cardId },
      source_creature: sourceCreature as RuntimeCreature,
      source_where: "vanguard",
      source_index: null,
      friendly_reserve: friendlyReserve,
    });
  }
  if (matches.length !== 1) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_source_location_ambiguous");
  }
  return matches[0];
}

/**
 * Owns only deterministic structured v0.2 attack after-damage programs made
 * entirely from IF reserve_count_at_least(self) -> HEAL_EACH self Reserve
 * Creature steps.
 *
 * Selected-target healing, other zones/filters and mixed programs deliberately
 * remain on compatibility/choice authority. Every heal delegates to the same
 * healRuntimeDamage primitive used by Tactics and self-healing attacks. This
 * slice records one canonical after_heal_packet ID per Creature that actually
 * healed; listener dispatch remains a separate deterministic lifecycle pass.
 */
export function structuredRuntimeAfterDamageHealEachEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  friendlyReserve: Array<RuntimeCreature | null | undefined>,
): RuntimeV02AttackHealEachPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_heal_each_requires_creature");
  }
  if (!Array.isArray(friendlyReserve)) {
    throw new Error("tcg_v0_2_attack_heal_each_reserve_required");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_heal_each_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_heal_each_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_heal_each_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_heal_each_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_heal_each_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_heal_each_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_heal_each_step_invalid:${attackId}:${index}`);
    if (!healEachCandidate(step)) return null;
    rejectUnsupportedFields(
      step,
      ["op", "when", "then"],
      `tcg_v0_2_attack_heal_each_step_field_unsupported:${attackId}:${index}`,
    );
    const then = step.then as unknown[];
    if (then.length !== 1) {
      throw new Error(`tcg_v0_2_attack_heal_each_then_count_unsupported:${attackId}:${index}`);
    }
    const heal = objectRecord(then[0]);
    if (!heal) throw new Error(`tcg_v0_2_attack_heal_each_heal_step_invalid:${attackId}:${index}`);
    rejectUnsupportedFields(
      heal,
      ["op", "controller", "zone", "filters", "amount"],
      `tcg_v0_2_attack_heal_each_heal_field_unsupported:${attackId}:${index}`,
    );
    if (String(heal.controller || "") !== "self") {
      throw new Error(`tcg_v0_2_attack_heal_each_controller_unsupported:${attackId}:${index}`);
    }
    if (String(heal.zone || "") !== "reserve") {
      throw new Error(`tcg_v0_2_attack_heal_each_zone_unsupported:${attackId}:${index}`);
    }
    const filters = objectRecord(heal.filters);
    if (!filters) throw new Error(`tcg_v0_2_attack_heal_each_filters_required:${attackId}:${index}`);
    rejectUnsupportedFields(
      filters,
      ["card_family"],
      `tcg_v0_2_attack_heal_each_filter_field_unsupported:${attackId}:${index}`,
    );
    if (String(filters.card_family || "") !== "Creature") {
      throw new Error(`tcg_v0_2_attack_heal_each_card_family_unsupported:${attackId}:${index}`);
    }
    const amount = Number(heal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_heal_each_amount_invalid:${attackId}:${index}`);
    }
    return {
      when: healEachPredicate(step.when, attackId, index),
      amount,
    };
  });

  if (normalized.some((step) => step == null)) return null;

  const packetContext = healEachPacketContext(state, instanceOrId, friendlyReserve);
  const occupied = friendlyReserve
    .map((target, reserveIndex) => ({ target, reserveIndex }))
    .filter((entry): entry is { target: RuntimeCreature; reserveIndex: number } => entry.target != null);

  const effects = normalized.map((raw) => {
    const step = raw!;
    const conditionMet = occupied.length >= step.when.count;
    const targets = conditionMet
      ? occupied.map(({ target, reserveIndex }) => ({
        reserve_index: reserveIndex,
        actual_heal: healRuntimeDamage(target, step.amount),
      }))
      : [];
    return {
      when: step.when,
      controller: "self" as const,
      zone: "reserve" as const,
      filters: { card_family: "Creature" as const },
      amount: step.amount,
      condition_met: conditionMet,
      target_count: targets.length,
      actual_heal_total: targets.reduce((sum, target) => sum + target.actual_heal, 0),
      targets,
    };
  });

  const result: RuntimeV02AttackHealEachPhaseResult = {
    attack_id: attackId,
    phase: "after_damage",
    effects,
    emitted_packet_ids: [],
  };
  if (packetContext) {
    result.emitted_packet_ids = recordRuntimeV02AttackHealEachPackets(
      state,
      result,
      packetContext,
    ).map((packet) => packet.id);
  }
  return result;
}

export type RuntimeV02AttackSelectedHealChoice = {
  attack_id: string;
  phase: "after_damage";
  selection: {
    controller: "self";
    zone: "field";
    count: 1;
    filters: { damaged: true };
    as: string;
  };
  heal: {
    target: string;
    amount: number;
  };
};

/**
 * Owns only the deterministic structured after-damage choice program:
 * SELECT_CREATURE(self, field, exactly one damaged creature) followed by
 * HEAL $selected. It describes the choice but deliberately does not select or
 * heal a target; the revision-checked attack-choice owner performs that work.
 *
 * Mixed programs and other selectors remain outside this owner. Marked v0.2
 * metadata that matches this program family but is malformed fails closed.
 * after_heal_packet listeners remain a separate later lifecycle pass.
 */
export function structuredRuntimeAfterDamageSelectedHealChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackSelectedHealChoice | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_selected_heal_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_selected_heal_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_selected_heal_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_selected_heal_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_selected_heal_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_selected_heal_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_selected_heal_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 2) return null;

  const select = objectRecord(attack.after_damage[0]);
  const heal = objectRecord(attack.after_damage[1]);
  if (!select || !heal) return null;
  if (String(select.op || "") !== "SELECT_CREATURE" || String(heal.op || "") !== "HEAL") return null;

  rejectUnsupportedFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_attack_selected_heal_select_field_unsupported:${attackId}`,
  );
  if (String(select.controller || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_selected_heal_controller_unsupported:${attackId}`);
  }
  if (String(select.zone || "") !== "field") {
    throw new Error(`tcg_v0_2_attack_selected_heal_zone_unsupported:${attackId}`);
  }
  if (Number(select.count) !== 1 || !Number.isInteger(Number(select.count))) {
    throw new Error(`tcg_v0_2_attack_selected_heal_count_unsupported:${attackId}`);
  }
  const filters = objectRecord(select.filters);
  if (!filters) throw new Error(`tcg_v0_2_attack_selected_heal_filters_required:${attackId}`);
  rejectUnsupportedFields(
    filters,
    ["damaged"],
    `tcg_v0_2_attack_selected_heal_filter_field_unsupported:${attackId}`,
  );
  if (filters.damaged !== true) {
    throw new Error(`tcg_v0_2_attack_selected_heal_damaged_filter_required:${attackId}`);
  }
  const variable = typeof select.as === "string" ? select.as.trim() : "";
  if (!variable) throw new Error(`tcg_v0_2_attack_selected_heal_variable_required:${attackId}`);

  rejectUnsupportedFields(
    heal,
    ["op", "target", "amount"],
    `tcg_v0_2_attack_selected_heal_heal_field_unsupported:${attackId}`,
  );
  const target = `$${variable}`;
  if (String(heal.target || "") !== target) {
    throw new Error(`tcg_v0_2_attack_selected_heal_target_mismatch:${attackId}`);
  }
  const amount = Number(heal.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`tcg_v0_2_attack_selected_heal_amount_invalid:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    selection: {
      controller: "self",
      zone: "field",
      count: 1,
      filters: { damaged: true },
      as: variable,
    },
    heal: { target, amount },
  };
}
