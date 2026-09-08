import {
  recordRuntimeV02HealPacket,
  type RuntimeV02HealPacket,
  type RuntimeV02Seat,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import type {
  RuntimeV02AttackHealEachPhaseResult,
  RuntimeV02AttackSelfHealPhaseResult,
} from "./tcg-match-attack-effects-v0-2.ts";
import type { RuntimeCreature } from "../tcg-tactic-actions/runtime-v0-2-core.ts";

export type RuntimeV02AttackSelfHealPacketContext = {
  controller_seat: RuntimeV02Seat;
  source_instance: { uid: string; card_id: string };
  source_creature: RuntimeCreature;
  source_where: "vanguard" | "reserve";
  source_index: number | null;
};

export type RuntimeV02AttackHealEachPacketContext = RuntimeV02AttackSelfHealPacketContext & {
  friendly_reserve: Array<RuntimeCreature | null | undefined>;
};

type BoundSource = {
  seat: RuntimeV02Seat;
  where: "vanguard" | "reserve";
  index: number | null;
  uid: string;
  card_id: string;
  element: string;
};

type BoundReserveTarget = {
  index: number;
  uid: string;
  card_id: string;
  element: string;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function nonEmpty(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function seat(value: unknown): RuntimeV02Seat {
  if (value === 1 || value === 2) return value;
  throw new Error("tcg_v0_2_attack_heal_packet_controller_seat_invalid");
}

function location(
  whereValue: unknown,
  indexValue: unknown,
): { where: "vanguard" | "reserve"; index: number | null } {
  const where = String(whereValue || "");
  const index = indexValue == null ? null : Number(indexValue);
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_attack_heal_packet_vanguard_index_must_be_null");
    return { where, index: null };
  }
  if (where === "reserve") {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_attack_heal_packet_reserve_index_invalid");
    }
    return { where, index: Number(index) };
  }
  throw new Error("tcg_v0_2_attack_heal_packet_zone_invalid");
}

function bindSource(
  state: Record<string, unknown>,
  context: RuntimeV02AttackSelfHealPacketContext,
): BoundSource {
  const controllerSeat = seat(context?.controller_seat);
  const sourceInstance = objectRecord(context?.source_instance);
  if (!sourceInstance) throw new Error("tcg_v0_2_attack_heal_packet_source_instance_invalid");
  const uid = nonEmpty(sourceInstance.uid, "tcg_v0_2_attack_heal_packet_source_uid_required");
  const cardId = nonEmpty(sourceInstance.card_id, "tcg_v0_2_attack_heal_packet_source_card_id_required");
  const { where, index } = location(context?.source_where, context?.source_index);

  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(controllerSeat)]);
  if (!player) throw new Error("tcg_v0_2_attack_heal_packet_player_missing");
  let fieldCreature: unknown;
  if (where === "vanguard") {
    fieldCreature = player.vanguard;
  } else {
    if (!Array.isArray(player.reserve)) throw new Error("tcg_v0_2_attack_heal_packet_reserve_invalid");
    fieldCreature = player.reserve[index!];
  }
  if (!fieldCreature || fieldCreature !== context.source_creature) {
    throw new Error("tcg_v0_2_attack_heal_packet_source_creature_binding_mismatch");
  }

  const creature = objectRecord(fieldCreature);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_heal_packet_source_stack_invalid");
  }
  const top = objectRecord(creature.stack[creature.stack.length - 1]);
  if (!top) throw new Error("tcg_v0_2_attack_heal_packet_source_top_invalid");
  if (
    nonEmpty(top.uid, "tcg_v0_2_attack_heal_packet_top_uid_required") !== uid ||
    nonEmpty(top.card_id, "tcg_v0_2_attack_heal_packet_top_card_id_required") !== cardId
  ) {
    throw new Error("tcg_v0_2_attack_heal_packet_source_identity_mismatch");
  }

  const definition = runtimeV02Definition(state, { card_id: cardId });
  if (!definition || String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_heal_packet_source_definition_invalid");
  }
  const element = nonEmpty(definition.element, "tcg_v0_2_attack_heal_packet_source_element_required");
  return { seat: controllerSeat, where, index, uid, card_id: cardId, element };
}

function bindFriendlyReserve(
  state: Record<string, unknown>,
  context: RuntimeV02AttackHealEachPacketContext,
  source: BoundSource,
): Array<RuntimeCreature | null | undefined> {
  if (source.where !== "vanguard" || source.index !== null) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_source_must_be_vanguard");
  }
  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(source.seat)]);
  if (!player || !Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_reserve_invalid");
  }
  if (!Array.isArray(context?.friendly_reserve) || player.reserve !== context.friendly_reserve) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_reserve_binding_mismatch");
  }
  return player.reserve as Array<RuntimeCreature | null | undefined>;
}

function bindReserveTarget(
  state: Record<string, unknown>,
  reserve: Array<RuntimeCreature | null | undefined>,
  index: number,
): BoundReserveTarget {
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_target_index_invalid");
  }
  const creature = objectRecord(reserve[index]);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_target_creature_invalid");
  }
  const top = objectRecord(creature.stack[creature.stack.length - 1]);
  if (!top) throw new Error("tcg_v0_2_attack_heal_each_packet_target_top_invalid");
  const uid = nonEmpty(top.uid, "tcg_v0_2_attack_heal_each_packet_target_uid_required");
  const cardId = nonEmpty(top.card_id, "tcg_v0_2_attack_heal_each_packet_target_card_id_required");
  const definition = runtimeV02Definition(state, { card_id: cardId });
  if (!definition || String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_heal_each_packet_target_definition_invalid");
  }
  const element = nonEmpty(definition.element, "tcg_v0_2_attack_heal_each_packet_target_element_required");
  return { index, uid, card_id: cardId, element };
}

/**
 * Converts already-resolved structured attack self-healing into canonical
 * after_heal_packet authority without changing Creature damage a second time.
 *
 * Metadata-only resolver calls deliberately return no packet authority until a
 * real source-instance UID is supplied. Live match actions provide the exact
 * top instance; explicit adapter tests may bind that instance in a later step.
 * The binding is then server-built from the canonical field object, exact top
 * card identity and v0.2 registry definition. Listener dispatch remains
 * separate; this adapter records only authoritative packets from the attack.
 */
export function recordRuntimeV02AttackSelfHealPackets(
  state: Record<string, unknown>,
  result: RuntimeV02AttackSelfHealPhaseResult | null,
  context: RuntimeV02AttackSelfHealPacketContext,
): RuntimeV02HealPacket[] {
  if (result == null) return [];
  if (result.phase !== "after_damage") {
    throw new Error("tcg_v0_2_attack_heal_packet_phase_invalid");
  }
  const attackId = nonEmpty(result.attack_id, "tcg_v0_2_attack_heal_packet_attack_id_required");
  if (!Array.isArray(result.effects)) throw new Error("tcg_v0_2_attack_heal_packet_effects_invalid");
  const sourceIdentity = objectRecord(context?.source_instance);
  if (
    !sourceIdentity ||
    typeof sourceIdentity.uid !== "string" ||
    !sourceIdentity.uid.trim()
  ) {
    return [];
  }
  const source = bindSource(state, context);
  const packets: RuntimeV02HealPacket[] = [];

  for (const effect of result.effects) {
    if (!effect || effect.target !== "$source_creature") {
      throw new Error("tcg_v0_2_attack_heal_packet_target_unsupported");
    }
    const requested = Number(effect.amount);
    const actual = Number(effect.actual_heal);
    if (!Number.isFinite(requested) || requested <= 0) {
      throw new Error("tcg_v0_2_attack_heal_packet_requested_amount_invalid");
    }
    const packet = recordRuntimeV02HealPacket(state, requested, actual, {
      source: {
        controller_seat: source.seat,
        action_kind: "attack",
        action_id: attackId,
        card_effect: true,
        card_uid: source.uid,
        card_id: source.card_id,
        creature_uid: source.uid,
      },
      target: {
        controller_seat: source.seat,
        creature_uid: source.uid,
        card_uid: source.uid,
        card_id: source.card_id,
        element: source.element,
        where: source.where,
        index: source.index,
      },
    });
    if (packet) packets.push(packet);
  }

  return packets;
}

/**
 * Converts an already-resolved structured HEAL_EACH attack into one canonical
 * packet per Reserve Creature that actually healed. Validation is completed for
 * the entire effect/result before any packet is appended, preventing malformed
 * target metadata from leaving a partially-recorded listener event stream.
 */
export function recordRuntimeV02AttackHealEachPackets(
  state: Record<string, unknown>,
  result: RuntimeV02AttackHealEachPhaseResult | null,
  context: RuntimeV02AttackHealEachPacketContext,
): RuntimeV02HealPacket[] {
  if (result == null) return [];
  if (result.phase !== "after_damage") {
    throw new Error("tcg_v0_2_attack_heal_each_packet_phase_invalid");
  }
  const attackId = nonEmpty(result.attack_id, "tcg_v0_2_attack_heal_each_packet_attack_id_required");
  if (!Array.isArray(result.effects)) {
    throw new Error("tcg_v0_2_attack_heal_each_packet_effects_invalid");
  }
  const sourceIdentity = objectRecord(context?.source_instance);
  if (
    !sourceIdentity ||
    typeof sourceIdentity.uid !== "string" ||
    !sourceIdentity.uid.trim()
  ) {
    return [];
  }
  const source = bindSource(state, context);
  const reserve = bindFriendlyReserve(state, context, source);
  const records: Array<{ requested: number; actual: number; target: BoundReserveTarget }> = [];

  for (const effect of result.effects) {
    if (!effect || effect.controller !== "self" || effect.zone !== "reserve") {
      throw new Error("tcg_v0_2_attack_heal_each_packet_scope_invalid");
    }
    if (!effect.filters || effect.filters.card_family !== "Creature") {
      throw new Error("tcg_v0_2_attack_heal_each_packet_filters_invalid");
    }
    if (typeof effect.condition_met !== "boolean") {
      throw new Error("tcg_v0_2_attack_heal_each_packet_condition_invalid");
    }
    const requested = Number(effect.amount);
    if (!Number.isFinite(requested) || requested <= 0) {
      throw new Error("tcg_v0_2_attack_heal_each_packet_requested_amount_invalid");
    }
    if (!Array.isArray(effect.targets)) {
      throw new Error("tcg_v0_2_attack_heal_each_packet_targets_invalid");
    }
    if (!Number.isInteger(Number(effect.target_count)) || Number(effect.target_count) !== effect.targets.length) {
      throw new Error("tcg_v0_2_attack_heal_each_packet_target_count_mismatch");
    }
    if (!effect.condition_met && effect.targets.length !== 0) {
      throw new Error("tcg_v0_2_attack_heal_each_packet_false_condition_has_targets");
    }

    const seen = new Set<number>();
    let actualTotal = 0;
    for (const rawTarget of effect.targets) {
      const target = objectRecord(rawTarget);
      if (!target) throw new Error("tcg_v0_2_attack_heal_each_packet_target_invalid");
      const index = Number(target.reserve_index);
      if (!Number.isInteger(index) || index < 0 || index > 3 || seen.has(index)) {
        throw new Error("tcg_v0_2_attack_heal_each_packet_target_index_invalid");
      }
      seen.add(index);
      const actual = Number(target.actual_heal);
      if (!Number.isFinite(actual) || actual < 0 || actual > requested) {
        throw new Error("tcg_v0_2_attack_heal_each_packet_actual_amount_invalid");
      }
      actualTotal += actual;
      const boundTarget = bindReserveTarget(state, reserve, index);
      if (actual > 0) records.push({ requested, actual, target: boundTarget });
    }
    if (Number(effect.actual_heal_total) !== actualTotal) {
      throw new Error("tcg_v0_2_attack_heal_each_packet_actual_total_mismatch");
    }
  }

  const packets: RuntimeV02HealPacket[] = [];
  for (const record of records) {
    const packet = recordRuntimeV02HealPacket(state, record.requested, record.actual, {
      source: {
        controller_seat: source.seat,
        action_kind: "attack",
        action_id: attackId,
        card_effect: true,
        card_uid: source.uid,
        card_id: source.card_id,
        creature_uid: source.uid,
      },
      target: {
        controller_seat: source.seat,
        creature_uid: record.target.uid,
        card_uid: record.target.uid,
        card_id: record.target.card_id,
        element: record.target.element,
        where: "reserve",
        index: record.target.index,
      },
    });
    if (packet) packets.push(packet);
  }
  return packets;
}
