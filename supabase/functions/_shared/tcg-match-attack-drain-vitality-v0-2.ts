import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02ApplyDrainVitalityProgram,
  type RuntimeV02DamageProgramCreatureRef,
  type RuntimeV02DamageProgramState,
  type RuntimeV02DrainVitalityProgramResult,
} from "./tcg-match-damage-program-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02AttackDrainCreatureAnchor = {
  controller_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  instance: { uid: string; card_id: string };
};

export type RuntimeV02AttackDrainVitalityDescriptor = {
  attack_id: string;
  phase: "after_damage";
  require_target_remains: boolean;
  amount: number;
  heal_cap: number;
  source_step_index: number;
};

export type RuntimeV02AttackDrainVitalityResult = {
  kind: "attack_drain_vitality";
  attack_id: string;
  condition_met: boolean;
  executed: boolean;
  actual_vitality_drained: number;
  actual_heal: number;
  emitted_packet_ids: string[];
  damage_result: RuntimeV02DrainVitalityProgramResult | null;
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

function positiveAmount(value: unknown, error: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(error);
  return amount;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const allowedSet = new Set(allowed);
  const unsupported = Object.keys(value).find((key) => !allowedSet.has(key));
  if (unsupported) throw new Error(`${error}:${unsupported}`);
}

function exactTargetRemainsPredicate(raw: unknown, attackId: string): void {
  const predicate = objectRecord(raw);
  if (!predicate) {
    throw new Error(`tcg_v0_2_attack_drain_condition_invalid:${attackId}`);
  }
  rejectUnsupportedFields(
    predicate,
    ["predicate"],
    `tcg_v0_2_attack_drain_condition_field_unsupported:${attackId}`,
  );
  if (predicate.predicate !== "target_remains_in_play_after_damage") {
    throw new Error(`tcg_v0_2_attack_drain_condition_unsupported:${attackId}`);
  }
}

function exactDrain(raw: unknown, attackId: string) {
  const step = objectRecord(raw);
  if (!step) throw new Error(`tcg_v0_2_attack_drain_step_invalid:${attackId}`);
  rejectUnsupportedFields(
    step,
    ["op", "target", "amount", "heal_target", "heal_cap"],
    `tcg_v0_2_attack_drain_step_field_unsupported:${attackId}`,
  );
  if (step.op !== "DRAIN_VITALITY") {
    throw new Error(`tcg_v0_2_attack_drain_step_unsupported:${attackId}`);
  }
  if (step.target !== "$attack_target") {
    throw new Error(`tcg_v0_2_attack_drain_target_unsupported:${attackId}`);
  }
  if (step.heal_target !== "$source_creature") {
    throw new Error(`tcg_v0_2_attack_drain_heal_target_unsupported:${attackId}`);
  }
  return {
    amount: positiveAmount(step.amount, `tcg_v0_2_attack_drain_amount_invalid:${attackId}`),
    heal_cap: positiveAmount(step.heal_cap, `tcg_v0_2_attack_drain_heal_cap_invalid:${attackId}`),
  };
}

function containsDrain(raw: unknown): boolean {
  const step = objectRecord(raw);
  if (!step) return false;
  if (step.op === "DRAIN_VITALITY") return true;
  if (step.op !== "IF" || !Array.isArray(step.then)) return false;
  return step.then.some(containsDrain);
}

/**
 * Recognizes the reusable attack after-damage vitality-drain family. The current
 * accepted card evidence needs either a direct DRAIN_VITALITY or the same drain
 * guarded by target_remains_in_play_after_damage. Mixed programs remain outside
 * this owner so another opcode can never be executed only partially.
 */
export function structuredRuntimeAfterDamageDrainVitalityDescriptor(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackDrainVitalityDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_drain_requires_creature");
  }
  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_drain_creature_required");
  const attacks = Array.isArray(creature.attacks) ? creature.attacks : null;
  if (!attacks) throw new Error("tcg_v0_2_attack_drain_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_drain_slot_invalid");
  }
  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_drain_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_drain_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_drain_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;
  if (attack.after_damage.length !== 1) {
    if (attack.after_damage.some(containsDrain)) {
      throw new Error(`tcg_v0_2_attack_drain_mixed_program_unsupported:${attackId}`);
    }
    return null;
  }

  const outer = objectRecord(attack.after_damage[0]);
  if (!outer) throw new Error(`tcg_v0_2_attack_drain_step_invalid:${attackId}`);
  if (outer.op === "DRAIN_VITALITY") {
    const drain = exactDrain(outer, attackId);
    return {
      attack_id: attackId,
      phase: "after_damage",
      require_target_remains: false,
      amount: drain.amount,
      heal_cap: drain.heal_cap,
      source_step_index: 0,
    };
  }
  if (outer.op !== "IF") return null;
  if (!Array.isArray(outer.then) || !outer.then.some(containsDrain)) return null;
  rejectUnsupportedFields(
    outer,
    ["op", "when", "then"],
    `tcg_v0_2_attack_drain_if_field_unsupported:${attackId}`,
  );
  exactTargetRemainsPredicate(outer.when, attackId);
  if (outer.then.length !== 1) {
    throw new Error(`tcg_v0_2_attack_drain_if_program_unsupported:${attackId}`);
  }
  const drain = exactDrain(outer.then[0], attackId);
  return {
    attack_id: attackId,
    phase: "after_damage",
    require_target_remains: true,
    amount: drain.amount,
    heal_cap: drain.heal_cap,
    source_step_index: 0,
  };
}

function elementFor(
  state: Record<string, unknown>,
  cardId: string,
  error: string,
): string {
  const definition = runtimeV02Definition(state, { card_id: cardId });
  const element = typeof definition?.element === "string" ? definition.element.trim() : "";
  if (!element) throw new Error(error);
  return element;
}

function damageRef(
  state: Record<string, unknown>,
  anchor: RuntimeV02AttackDrainCreatureAnchor,
  role: "source" | "target",
): RuntimeV02DamageProgramCreatureRef {
  if (anchor.controller_seat !== 1 && anchor.controller_seat !== 2) {
    throw new Error(`tcg_v0_2_attack_drain_${role}_seat_invalid`);
  }
  if (anchor.where !== "vanguard" && anchor.where !== "reserve") {
    throw new Error(`tcg_v0_2_attack_drain_${role}_zone_invalid`);
  }
  const index = anchor.index == null ? null : Number(anchor.index);
  if (anchor.where === "vanguard" && index !== null) {
    throw new Error(`tcg_v0_2_attack_drain_${role}_vanguard_index_invalid`);
  }
  if (anchor.where === "reserve" && (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3)) {
    throw new Error(`tcg_v0_2_attack_drain_${role}_reserve_index_invalid`);
  }
  const uid = requiredString(anchor.instance?.uid, `tcg_v0_2_attack_drain_${role}_uid_required`);
  const cardId = requiredString(anchor.instance?.card_id, `tcg_v0_2_attack_drain_${role}_card_id_required`);
  return {
    controller_seat: anchor.controller_seat,
    where: anchor.where,
    index,
    anchor_uid: uid,
    card_id: cardId,
    element: elementFor(
      state,
      cardId,
      `tcg_v0_2_attack_drain_${role}_element_missing:${cardId}`,
    ),
  };
}

function boundCreature<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DamageProgramState<T>,
  ref: RuntimeV02DamageProgramCreatureRef,
): Record<string, unknown> | null {
  const player = state.players?.[String(ref.controller_seat)] as Record<string, unknown> | undefined;
  if (!player) return null;
  const reserve = Array.isArray(player.reserve) ? player.reserve : [];
  const raw = ref.where === "vanguard" ? player.vanguard : reserve[Number(ref.index)];
  const creature = objectRecord(raw);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) return null;
  const top = objectRecord(creature.stack[creature.stack.length - 1]);
  if (top?.uid !== ref.anchor_uid || top?.card_id !== ref.card_id) return null;
  return creature;
}

function targetRemainsAfterDamage<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DamageProgramState<T>,
  target: RuntimeV02DamageProgramCreatureRef,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): boolean {
  const creature = boundCreature(state, target);
  if (!creature) return false;
  const description = defeatDescribe(
    creature as never,
    target.controller_seat,
    target.where,
    target.index,
  );
  const maxHp = Number(description.max_hp);
  if (!Number.isFinite(maxHp) || maxHp <= 0) {
    throw new Error("tcg_v0_2_attack_drain_target_max_hp_invalid");
  }
  return Number(creature.damage || 0) < maxHp;
}

/**
 * Resolves only the structured after-damage vitality-drain effect. Attack owns
 * the already-resolved source/target pair; Damage #20 owns effect damage, Heal
 * owns healing and Defeat owns lifecycle consequences.
 */
export function runtimeV02ResolveAfterDamageDrainVitality<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02DamageProgramState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02AttackDrainCreatureAnchor,
  attackSlot: number,
  target: RuntimeV02AttackDrainCreatureAnchor,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02AttackDrainVitalityResult | null {
  const descriptor = structuredRuntimeAfterDamageDrainVitalityDescriptor(
    state as Record<string, unknown>,
    source.instance,
    attackSlot,
  );
  if (!descriptor) return null;
  if (source.controller_seat !== controllerSeat) {
    throw new Error("tcg_v0_2_attack_drain_source_controller_mismatch");
  }
  const sourceRef = damageRef(state as Record<string, unknown>, source, "source");
  const targetRef = damageRef(state as Record<string, unknown>, target, "target");
  const conditionMet = !descriptor.require_target_remains ||
    targetRemainsAfterDamage(state, targetRef, defeatDescribe);
  if (!conditionMet) {
    return {
      kind: "attack_drain_vitality",
      attack_id: descriptor.attack_id,
      condition_met: false,
      executed: false,
      actual_vitality_drained: 0,
      actual_heal: 0,
      emitted_packet_ids: [],
      damage_result: null,
    };
  }

  const damageResult = runtimeV02ApplyDrainVitalityProgram(state, {
    identity: {
      source_action_id: descriptor.attack_id,
      source_step_index: descriptor.source_step_index,
      source_card_uid: sourceRef.anchor_uid,
      source_card_id: sourceRef.card_id,
      source_creature_uid: sourceRef.anchor_uid,
      action_kind: "attack",
      controller_seat: controllerSeat,
    },
    target: targetRef,
    heal_target: sourceRef,
    amount: descriptor.amount,
    heal_cap: descriptor.heal_cap,
    defeat_describe: defeatDescribe,
  });
  return {
    kind: "attack_drain_vitality",
    attack_id: descriptor.attack_id,
    condition_met: true,
    executed: true,
    actual_vitality_drained: damageResult.actual_vitality_drained,
    actual_heal: damageResult.actual_heal,
    emitted_packet_ids: damageResult.heal_packet ? [damageResult.heal_packet.id] : [],
    damage_result: damageResult,
  };
}
