import {
  recordRuntimeV02HealPacket,
  type RuntimeV02HealPacket,
  type RuntimeV02Seat,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import type { RuntimeV02AttackSelfHealPhaseResult } from "./tcg-match-attack-effects-v0-2.ts";
import type { RuntimeCreature } from "../tcg-tactic-actions/runtime-v0-2-core.ts";

export type RuntimeV02AttackSelfHealPacketContext = {
  controller_seat: RuntimeV02Seat;
  source_instance: { uid: string; card_id: string };
  source_creature: RuntimeCreature;
  source_where: "vanguard" | "reserve";
  source_index: number | null;
};

type BoundSource = {
  seat: RuntimeV02Seat;
  where: "vanguard" | "reserve";
  index: number | null;
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
