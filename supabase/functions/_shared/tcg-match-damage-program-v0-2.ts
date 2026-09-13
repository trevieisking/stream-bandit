import {
  runtimeV02DealEffectDamage,
  runtimeV02MoveDamage,
  type RuntimeV02DamageMoveReceipt,
  type RuntimeV02EffectDamageReceipt,
} from "./tcg-match-damage-engine-v0-2.ts";
import {
  runtimeV02PreflightDefeatScan,
  runtimeV02ScanAndQueueDefeats,
  type RuntimeV02DefeatDescribe,
  type RuntimeV02DefeatScanResult,
  type RuntimeV02DefeatState,
} from "./tcg-match-defeat-engine-v0-2.ts";
import {
  applyRuntimeV02HealPacket,
  preflightRuntimeV02HealPacket,
  type RuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
  type RuntimeV02HealActionKind,
} from "./tcg-match-heal-packet-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02CreatureState } from "./tcg-match-creature-engine-v0-2.ts";

export type RuntimeV02DamageProgramCreatureRef = {
  controller_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  anchor_uid: string;
  card_id: string;
  element: string;
};

export type RuntimeV02DamageProgramState<T extends RuntimeV02CardZoneInstance> =
  RuntimeV02DefeatState<T> & Record<string, unknown> & {
    turn_seq: number;
    active_seat: 1 | 2;
    effect_events?: Record<string, unknown>[];
  };

export type RuntimeV02DamageProgramIdentity = {
  source_action_id: string;
  source_step_index: number;
  source_card_uid: string;
  source_card_id: string;
  source_creature_uid: string | null;
  action_kind: Exclude<RuntimeV02HealActionKind, "system">;
  controller_seat: 1 | 2;
};

export type RuntimeV02MoveDamageProgramRequest<T extends RuntimeV02CardZoneInstance> = {
  identity: RuntimeV02DamageProgramIdentity;
  from: RuntimeV02DamageProgramCreatureRef;
  to: RuntimeV02DamageProgramCreatureRef;
  amount: number;
  allow_partial?: boolean;
  allow_opposing_destination?: boolean;
  minimum_moved?: number;
  destination_damage_cap?: number | null;
  defeat_describe: RuntimeV02DefeatDescribe<T>;
};

export type RuntimeV02MoveDamageProgramResult = {
  receipt: RuntimeV02DamageMoveReceipt;
  event: Record<string, unknown>;
  defeat: RuntimeV02DefeatScanResult;
};

export type RuntimeV02DrainVitalityProgramRequest<T extends RuntimeV02CardZoneInstance> = {
  identity: RuntimeV02DamageProgramIdentity;
  target: RuntimeV02DamageProgramCreatureRef;
  heal_target: RuntimeV02DamageProgramCreatureRef;
  amount: number;
  heal_cap: number;
  defeat_describe: RuntimeV02DefeatDescribe<T>;
};

export type RuntimeV02DrainVitalityProgramResult = {
  damage: RuntimeV02EffectDamageReceipt;
  actual_vitality_drained: number;
  actual_heal: number;
  heal_packet: RuntimeV02HealPacket | null;
  effect_damage_event: Record<string, unknown>;
  vitality_event: Record<string, unknown>;
  defeat: RuntimeV02DefeatScanResult;
};

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function nullableString(value: unknown, error: string): string | null {
  if (value == null) return null;
  return requiredString(value, error);
}

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function nonNegativeAmount(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(error);
  return number;
}

function validateIdentity(identity: RuntimeV02DamageProgramIdentity): RuntimeV02DamageProgramIdentity {
  if (!identity || typeof identity !== "object") throw new Error("tcg_v0_2_damage_program_identity_required");
  const controller = identity.controller_seat;
  if (controller !== 1 && controller !== 2) throw new Error("tcg_v0_2_damage_program_controller_invalid");
  const actionKind = String(identity.action_kind || "") as RuntimeV02DamageProgramIdentity["action_kind"];
  if (!["attack", "ability", "tactic", "essence", "relic", "realm"].includes(actionKind)) {
    throw new Error("tcg_v0_2_damage_program_action_kind_invalid");
  }
  const sourceCreatureUid = nullableString(identity.source_creature_uid, "tcg_v0_2_damage_program_source_creature_uid_invalid");
  if ((actionKind === "attack" || actionKind === "ability") && !sourceCreatureUid) {
    throw new Error("tcg_v0_2_damage_program_source_creature_uid_required");
  }
  return {
    source_action_id: requiredString(identity.source_action_id, "tcg_v0_2_damage_program_action_id_required"),
    source_step_index: nonNegativeInteger(identity.source_step_index, "tcg_v0_2_damage_program_step_index_invalid"),
    source_card_uid: requiredString(identity.source_card_uid, "tcg_v0_2_damage_program_source_card_uid_required"),
    source_card_id: requiredString(identity.source_card_id, "tcg_v0_2_damage_program_source_card_id_required"),
    source_creature_uid: sourceCreatureUid,
    action_kind: actionKind,
    controller_seat: controller,
  };
}

function validateRef(ref: RuntimeV02DamageProgramCreatureRef, role: string): RuntimeV02DamageProgramCreatureRef {
  if (!ref || typeof ref !== "object") throw new Error(`tcg_v0_2_damage_program_${role}_ref_required`);
  if (ref.controller_seat !== 1 && ref.controller_seat !== 2) throw new Error(`tcg_v0_2_damage_program_${role}_seat_invalid`);
  if (ref.where !== "vanguard" && ref.where !== "reserve") throw new Error(`tcg_v0_2_damage_program_${role}_zone_invalid`);
  const index = ref.index == null ? null : Number(ref.index);
  if (ref.where === "vanguard" && index !== null) throw new Error(`tcg_v0_2_damage_program_${role}_vanguard_index_invalid`);
  if (ref.where === "reserve" && (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3)) {
    throw new Error(`tcg_v0_2_damage_program_${role}_reserve_index_invalid`);
  }
  return {
    controller_seat: ref.controller_seat,
    where: ref.where,
    index,
    anchor_uid: requiredString(ref.anchor_uid, `tcg_v0_2_damage_program_${role}_anchor_required`),
    card_id: requiredString(ref.card_id, `tcg_v0_2_damage_program_${role}_card_id_required`),
    element: requiredString(ref.element, `tcg_v0_2_damage_program_${role}_element_required`),
  };
}

function topCard<T extends RuntimeV02CardZoneInstance>(creature: RuntimeV02CreatureState<T>): T {
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_damage_program_creature_stack_required");
  }
  return creature.stack[creature.stack.length - 1];
}

function resolveCreature<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DamageProgramState<T>,
  ref: RuntimeV02DamageProgramCreatureRef,
  role: string,
): RuntimeV02CreatureState<T> & { shield?: number } {
  const player = state?.players?.[String(ref.controller_seat)];
  if (!player) throw new Error(`tcg_v0_2_damage_program_${role}_player_missing`);
  const creature = ref.where === "vanguard" ? player.vanguard : player.reserve?.[Number(ref.index)];
  if (!creature) throw new Error(`tcg_v0_2_damage_program_${role}_creature_missing`);
  const top = topCard(creature);
  if (top.uid !== ref.anchor_uid || top.card_id !== ref.card_id) {
    throw new Error(`tcg_v0_2_damage_program_${role}_identity_changed`);
  }
  return creature as RuntimeV02CreatureState<T> & { shield?: number };
}

function eventArray(state: Record<string, unknown>): Record<string, unknown>[] {
  if (state.effect_events == null) {
    const events: Record<string, unknown>[] = [];
    state.effect_events = events;
    return events;
  }
  if (!Array.isArray(state.effect_events)) throw new Error("tcg_v0_2_damage_program_event_stream_invalid");
  return state.effect_events as Record<string, unknown>[];
}

function preflightEventStream(state: Record<string, unknown>, eventIds: string[]) {
  if (state.effect_events != null && !Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_damage_program_event_stream_invalid");
  }
  const events = Array.isArray(state.effect_events) ? state.effect_events as Record<string, unknown>[] : [];
  const existing = new Set(events.map((event) => String(event?.event_id || "")).filter(Boolean));
  for (const id of eventIds) {
    if (existing.has(id)) throw new Error(`tcg_v0_2_damage_program_event_duplicate:${id}`);
  }
}

function baseEventId(state: Record<string, unknown>, identity: RuntimeV02DamageProgramIdentity): string {
  const turn = nonNegativeInteger(state.turn_seq, "tcg_v0_2_damage_program_turn_invalid");
  return `${turn}:${identity.source_action_id}:${identity.source_step_index}`;
}

function cloneForPreflight<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DamageProgramState<T>,
): RuntimeV02DamageProgramState<T> {
  return structuredClone(state) as RuntimeV02DamageProgramState<T>;
}

function healContext(
  identity: RuntimeV02DamageProgramIdentity,
  target: RuntimeV02DamageProgramCreatureRef,
): RuntimeV02HealPacketContext {
  return {
    source: {
      controller_seat: identity.controller_seat,
      action_kind: identity.action_kind,
      action_id: identity.source_action_id,
      card_effect: true,
      card_uid: identity.source_card_uid,
      card_id: identity.source_card_id,
      creature_uid: identity.source_creature_uid,
    },
    target: {
      controller_seat: target.controller_seat,
      creature_uid: target.anchor_uid,
      card_uid: target.anchor_uid,
      card_id: target.card_id,
      element: target.element,
      where: target.where,
      index: target.index,
    },
  };
}

/** Generic sb-tcg-effects-v0.2 MOVE_DAMAGE executor. */
export function runtimeV02ApplyMoveDamageProgram<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DamageProgramState<T>,
  request: RuntimeV02MoveDamageProgramRequest<T>,
): RuntimeV02MoveDamageProgramResult {
  const identity = validateIdentity(request.identity);
  const from = validateRef(request.from, "move_source");
  const to = validateRef(request.to, "move_destination");
  const amount = nonNegativeAmount(request.amount, "tcg_v0_2_damage_program_move_amount_invalid");
  const minimumMoved = nonNegativeAmount(request.minimum_moved ?? 0, "tcg_v0_2_damage_program_move_minimum_invalid");
  if (from.anchor_uid === to.anchor_uid) throw new Error("tcg_v0_2_damage_program_move_same_creature");
  runtimeV02PreflightDefeatScan(state, request.defeat_describe);

  const eventId = `damage-moved:${baseEventId(state, identity)}:${from.anchor_uid}:${to.anchor_uid}`;
  preflightEventStream(state, [eventId]);

  const simulated = cloneForPreflight(state);
  const simulatedFrom = resolveCreature(simulated, from, "move_source");
  const simulatedTo = resolveCreature(simulated, to, "move_destination");
  runtimeV02MoveDamage(simulatedFrom, simulatedTo, amount, {
    allow_partial: request.allow_partial === true,
    minimum_moved: minimumMoved,
    source_controller_seat: from.controller_seat,
    destination_controller_seat: to.controller_seat,
    allow_opposing_destination: request.allow_opposing_destination === true,
    destination_damage_cap: request.destination_damage_cap ?? null,
  });
  runtimeV02ScanAndQueueDefeats(simulated, request.defeat_describe);

  const realFrom = resolveCreature(state, from, "move_source");
  const realTo = resolveCreature(state, to, "move_destination");
  const receipt = runtimeV02MoveDamage(realFrom, realTo, amount, {
    allow_partial: request.allow_partial === true,
    minimum_moved: minimumMoved,
    source_controller_seat: from.controller_seat,
    destination_controller_seat: to.controller_seat,
    allow_opposing_destination: request.allow_opposing_destination === true,
    destination_damage_cap: request.destination_damage_cap ?? null,
  });
  const defeat = runtimeV02ScanAndQueueDefeats(state, request.defeat_describe);
  const event = {
    event_id: eventId,
    event: "damage_moved",
    turn_seq: Number(state.turn_seq),
    source_action_id: identity.source_action_id,
    source_step_index: identity.source_step_index,
    source_card_uid: identity.source_card_uid,
    controller_seat: identity.controller_seat,
    source_creature_uid: from.anchor_uid,
    destination_creature_uid: to.anchor_uid,
    source_controller_seat: from.controller_seat,
    destination_controller_seat: to.controller_seat,
    requested_amount: receipt.requested_amount,
    actual_damage_moved: receipt.actual_damage_moved,
  };
  eventArray(state).push(event);
  return { receipt, event, defeat };
}

/** Generic sb-tcg-effects-v0.2 DRAIN_VITALITY executor. */
export function runtimeV02ApplyDrainVitalityProgram<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DamageProgramState<T>,
  request: RuntimeV02DrainVitalityProgramRequest<T>,
): RuntimeV02DrainVitalityProgramResult {
  const identity = validateIdentity(request.identity);
  const target = validateRef(request.target, "drain_target");
  const healTarget = validateRef(request.heal_target, "drain_heal_target");
  if (target.anchor_uid === healTarget.anchor_uid) throw new Error("tcg_v0_2_damage_program_drain_same_creature");
  const amount = nonNegativeAmount(request.amount, "tcg_v0_2_damage_program_drain_amount_invalid");
  const healCap = nonNegativeAmount(request.heal_cap, "tcg_v0_2_damage_program_drain_heal_cap_invalid");
  const maximumHeal = Math.min(amount, healCap);
  const context = healContext(identity, healTarget);
  preflightRuntimeV02HealPacket(state, maximumHeal, context);
  runtimeV02PreflightDefeatScan(state, request.defeat_describe);

  const base = baseEventId(state, identity);
  const damageEventId = `effect-damage:${base}:${target.anchor_uid}`;
  const vitalityEventId = `vitality-drained:${base}:${target.anchor_uid}:${healTarget.anchor_uid}`;
  preflightEventStream(state, [damageEventId, vitalityEventId]);

  const simulated = cloneForPreflight(state);
  const simulatedTarget = resolveCreature(simulated, target, "drain_target");
  runtimeV02DealEffectDamage(simulatedTarget, amount);
  runtimeV02ScanAndQueueDefeats(simulated, request.defeat_describe);
  resolveCreature(simulated, healTarget, "drain_heal_target");

  const realTarget = resolveCreature(state, target, "drain_target");
  const damage = runtimeV02DealEffectDamage(realTarget, amount);
  const defeat = runtimeV02ScanAndQueueDefeats(state, request.defeat_describe);
  const liveHealTarget = resolveCreature(state, healTarget, "drain_heal_target");
  const requestedHeal = Math.min(damage.actual_hp_damage, healCap);

  const effectDamageEvent = {
    event_id: damageEventId,
    event: "effect_damage_dealt",
    turn_seq: Number(state.turn_seq),
    source_action_id: identity.source_action_id,
    source_step_index: identity.source_step_index,
    source_card_uid: identity.source_card_uid,
    controller_seat: identity.controller_seat,
    target_creature_uid: target.anchor_uid,
    target_controller_seat: target.controller_seat,
    requested_amount: damage.requested_amount,
    shield_prevented: damage.shield_prevented,
    actual_hp_damage: damage.actual_hp_damage,
  };
  eventArray(state).push(effectDamageEvent);

  const heal = applyRuntimeV02HealPacket(state, liveHealTarget, requestedHeal, context);
  const vitalityEvent = {
    event_id: vitalityEventId,
    event: "vitality_drained",
    turn_seq: Number(state.turn_seq),
    source_action_id: identity.source_action_id,
    source_step_index: identity.source_step_index,
    source_card_uid: identity.source_card_uid,
    controller_seat: identity.controller_seat,
    target_creature_uid: target.anchor_uid,
    heal_target_creature_uid: healTarget.anchor_uid,
    requested_amount: amount,
    actual_hp_damage: damage.actual_hp_damage,
    actual_vitality_drained: damage.actual_hp_damage,
    requested_heal: requestedHeal,
    actual_heal: heal.actual_heal,
  };
  eventArray(state).push(vitalityEvent);

  return {
    damage,
    actual_vitality_drained: damage.actual_hp_damage,
    actual_heal: heal.actual_heal,
    heal_packet: heal.packet,
    effect_damage_event: effectDamageEvent,
    vitality_event: vitalityEvent,
    defeat,
  };
}
