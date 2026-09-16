import {
  applyRuntimeV02HealPacket,
  type RuntimeV02HealPacketResolution,
  type RuntimeV02Seat,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import type { RuntimeCreature } from "../tcg-tactic-actions/runtime-v0-2-core.ts";

export type RuntimeV02AttackSelectedHealPacketContext = {
  controller_seat: RuntimeV02Seat;
  target_creature: RuntimeCreature;
  target_anchor_uid: string;
  target_where: "vanguard" | "reserve";
  target_index: number | null;
};

type BoundSource = {
  seat: RuntimeV02Seat;
  creature: RuntimeCreature;
  uid: string;
  card_id: string;
};

type BoundFieldTarget = {
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
  throw new Error("tcg_v0_2_attack_selected_heal_packet_controller_seat_invalid");
}

function location(
  whereValue: unknown,
  indexValue: unknown,
): { where: "vanguard" | "reserve"; index: number | null } {
  const where = String(whereValue || "");
  const index = indexValue == null ? null : Number(indexValue);
  if (where === "vanguard") {
    if (index !== null) {
      throw new Error("tcg_v0_2_attack_selected_heal_packet_vanguard_index_must_be_null");
    }
    return { where, index: null };
  }
  if (where === "reserve") {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_attack_selected_heal_packet_reserve_index_invalid");
    }
    return { where, index: Number(index) };
  }
  throw new Error("tcg_v0_2_attack_selected_heal_packet_zone_invalid");
}

function bindSource(
  state: Record<string, unknown>,
  controllerSeat: RuntimeV02Seat,
): BoundSource {
  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(controllerSeat)]);
  if (!player) throw new Error("tcg_v0_2_attack_selected_heal_packet_player_missing");
  const sourceCreature = objectRecord(player.vanguard);
  if (!sourceCreature || !Array.isArray(sourceCreature.stack) || sourceCreature.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_source_vanguard_required");
  }
  const top = objectRecord(sourceCreature.stack[sourceCreature.stack.length - 1]);
  if (!top) throw new Error("tcg_v0_2_attack_selected_heal_packet_source_top_invalid");
  const uid = nonEmpty(top.uid, "tcg_v0_2_attack_selected_heal_packet_source_uid_required");
  const cardId = nonEmpty(top.card_id, "tcg_v0_2_attack_selected_heal_packet_source_card_id_required");
  const definition = runtimeV02Definition(state, { card_id: cardId });
  if (!definition || String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_source_definition_invalid");
  }
  return {
    seat: controllerSeat,
    creature: player.vanguard as RuntimeCreature,
    uid,
    card_id: cardId,
  };
}

function bindFriendlyFieldTarget(
  state: Record<string, unknown>,
  controllerSeat: RuntimeV02Seat,
  context: RuntimeV02AttackSelectedHealPacketContext,
): BoundFieldTarget {
  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(controllerSeat)]);
  if (!player) throw new Error("tcg_v0_2_attack_selected_heal_packet_player_missing");
  const { where, index } = location(context?.target_where, context?.target_index);
  let fieldCreature: unknown;
  if (where === "vanguard") {
    fieldCreature = player.vanguard;
  } else {
    if (!Array.isArray(player.reserve)) {
      throw new Error("tcg_v0_2_attack_selected_heal_packet_reserve_invalid");
    }
    fieldCreature = player.reserve[index!];
  }
  if (!fieldCreature || fieldCreature !== context.target_creature) {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_target_binding_mismatch");
  }
  const creature = objectRecord(fieldCreature);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_target_stack_invalid");
  }
  const top = objectRecord(creature.stack[creature.stack.length - 1]);
  if (!top) throw new Error("tcg_v0_2_attack_selected_heal_packet_target_top_invalid");
  const uid = nonEmpty(top.uid, "tcg_v0_2_attack_selected_heal_packet_target_uid_required");
  const anchor = nonEmpty(
    context.target_anchor_uid,
    "tcg_v0_2_attack_selected_heal_packet_target_anchor_required",
  );
  if (uid !== anchor) {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_target_anchor_mismatch");
  }
  const cardId = nonEmpty(top.card_id, "tcg_v0_2_attack_selected_heal_packet_target_card_id_required");
  const definition = runtimeV02Definition(state, { card_id: cardId });
  if (!definition || String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_target_definition_invalid");
  }
  const element = nonEmpty(
    definition.element,
    "tcg_v0_2_attack_selected_heal_packet_target_element_required",
  );
  return { where, index, uid, card_id: cardId, element };
}

function assertAttackOwnedBySource(
  state: Record<string, unknown>,
  source: BoundSource,
  attackId: string,
): void {
  const definition = runtimeV02Definition(state, { card_id: source.card_id });
  const creature = objectRecord(definition?.creature);
  if (!creature || !Array.isArray(creature.attacks)) {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_source_attacks_invalid");
  }
  const ownsAttack = creature.attacks.some((rawAttack) => {
    const attack = objectRecord(rawAttack);
    return attack != null && String(attack.id || "") === attackId;
  });
  if (!ownsAttack) {
    throw new Error("tcg_v0_2_attack_selected_heal_packet_source_attack_mismatch");
  }
}

/**
 * Applies one selected friendly-Creature attack heal through the canonical heal
 * packet boundary. Source authority is derived from the controller's current
 * Vanguard and checked against the pending attack id; the chosen target is
 * rebound to the exact current field object and top-card anchor before healing.
 *
 * The underlying damage change still has one owner: healRuntimeDamage inside
 * applyRuntimeV02HealPacket. This module is deliberately separate from the
 * record-only self-heal/HEAL_EACH attack adapter so already-applied heal paths
 * can never acquire a second mutation owner. Listener dispatch remains a
 * separate deterministic lifecycle pass.
 */
export function applyRuntimeV02AttackSelectedHealPacket(
  state: Record<string, unknown>,
  attackIdValue: string,
  amount: number,
  context: RuntimeV02AttackSelectedHealPacketContext,
): RuntimeV02HealPacketResolution {
  const attackId = nonEmpty(
    attackIdValue,
    "tcg_v0_2_attack_selected_heal_packet_attack_id_required",
  );
  const controllerSeat = seat(context?.controller_seat);
  const source = bindSource(state, controllerSeat);
  assertAttackOwnedBySource(state, source, attackId);
  const target = bindFriendlyFieldTarget(state, controllerSeat, context);

  return applyRuntimeV02HealPacket(
    state,
    context.target_creature,
    amount,
    {
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
        creature_uid: target.uid,
        card_uid: target.uid,
        card_id: target.card_id,
        element: target.element,
        where: target.where,
        index: target.index,
      },
    },
  );
}
