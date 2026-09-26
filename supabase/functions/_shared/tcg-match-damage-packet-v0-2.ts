import {
  runtimeV02DealEffectDamage,
  runtimeV02PlaceDamage,
  type RuntimeV02DamageCreature,
  type RuntimeV02DamagePlacementReceipt,
} from "./tcg-match-damage-engine-v0-2.ts";
import {
  runtimeV02DamageObject,
  runtimeV02DamageString,
  runtimeV02DamageTurn,
  runtimeV02NormalizeDamagePacketContext,
  type RuntimeV02BeforeDamagePacketResult,
  type RuntimeV02DamagePacketContext,
  type RuntimeV02DamagePacketLookup,
  type RuntimeV02EffectDamagePacketResult,
} from "./tcg-match-damage-packet-context-v0-2.ts";
import {
  runtimeV02DefaultDamagePacketLookup,
  runtimeV02DamagePacketTargetField,
} from "./tcg-match-damage-packet-source-v0-2.ts";
import { runtimeV02ResolveBeforeDamagePacketInternal } from "./tcg-match-damage-packet-listener-v0-2.ts";
import { runtimeV02ApplyDamageProtections } from "./tcg-match-damage-protection-v0-2.ts";

export type {
  RuntimeV02BeforeDamagePacketResult,
  RuntimeV02DamagePacketClass,
  RuntimeV02DamagePacketContext,
  RuntimeV02DamagePacketModification,
  RuntimeV02DamagePacketSourceKind,
  RuntimeV02EffectDamagePacketResult,
} from "./tcg-match-damage-packet-context-v0-2.ts";

export type RuntimeV02RecoilDamagePacketResult = RuntimeV02BeforeDamagePacketResult & {
  receipt: RuntimeV02DamagePlacementReceipt;
};

function eventStream(state: Record<string, unknown>): Record<string, unknown>[] {
  if (state.effect_events == null) {
    const events: Record<string, unknown>[] = [];
    state.effect_events = events;
    return events;
  }
  if (!Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_damage_packet_event_stream_invalid");
  }
  return state.effect_events as Record<string, unknown>[];
}

function validateEventIds(state: Record<string, unknown>, packetId: string): void {
  if (state.effect_events != null && !Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_damage_packet_event_stream_invalid");
  }
  const events = Array.isArray(state.effect_events)
    ? state.effect_events as Record<string, unknown>[]
    : [];
  const ids = new Set(
    events.map((entry) => String(entry.event_id || "")).filter(Boolean),
  );
  for (const id of [`before-damage:${packetId}`, `after-damage:${packetId}`]) {
    if (ids.has(id)) throw new Error(`tcg_v0_2_damage_packet_event_duplicate:${id}`);
  }
}

function resolveBeforeDamagePacket(
  state: Record<string, unknown>,
  amount: number,
  context: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup,
): RuntimeV02BeforeDamagePacketResult {
  const packet = runtimeV02NormalizeDamagePacketContext(context);
  const target = runtimeV02DamagePacketTargetField(state, packet, lookup);
  const activeSeat = state.active_seat;
  if (activeSeat !== 1 && activeSeat !== 2) {
    throw new Error("tcg_v0_2_damage_packet_active_seat_invalid");
  }
  const stored = runtimeV02ApplyDamageProtections(target.cr, amount, {
    turn_seq: runtimeV02DamageTurn(state),
    active_seat: activeSeat,
    source_controller_seat: packet.source_controller_seat,
    target_controller_seat: packet.target_controller_seat,
    target_creature_uid: packet.target_creature_uid,
    damage_class: packet.damage_class,
    packet_id: packet.packet_id,
  });
  const listeners = runtimeV02ResolveBeforeDamagePacketInternal(
    state,
    stored.final_amount,
    packet,
    lookup,
  );
  return {
    ...listeners,
    requested_amount: Number(amount),
    modifications: [...stored.modifications, ...listeners.modifications],
  };
}

export function runtimeV02PreflightBeforeDamagePacket(
  state: Record<string, unknown>,
  amount: number,
  context: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup = runtimeV02DefaultDamagePacketLookup,
): RuntimeV02BeforeDamagePacketResult {
  if (!runtimeV02DamageObject(state)) {
    throw new Error("tcg_v0_2_damage_packet_state_invalid");
  }
  validateEventIds(
    state,
    runtimeV02DamageString(context?.packet_id, "tcg_v0_2_damage_packet_id_required"),
  );
  const clone = structuredClone(state) as Record<string, unknown>;
  return resolveBeforeDamagePacket(clone, amount, context, lookup);
}

export function runtimeV02ResolveBeforeDamagePacket(
  state: Record<string, unknown>,
  amount: number,
  context: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup = runtimeV02DefaultDamagePacketLookup,
): RuntimeV02BeforeDamagePacketResult {
  if (!runtimeV02DamageObject(state)) {
    throw new Error("tcg_v0_2_damage_packet_state_invalid");
  }
  validateEventIds(
    state,
    runtimeV02DamageString(context?.packet_id, "tcg_v0_2_damage_packet_id_required"),
  );
  runtimeV02PreflightBeforeDamagePacket(state, amount, context, lookup);
  return resolveBeforeDamagePacket(state, amount, context, lookup);
}

export function runtimeV02ApplyEffectDamagePacket(
  state: Record<string, unknown>,
  targetCreature: RuntimeV02DamageCreature,
  amount: number,
  context: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup = runtimeV02DefaultDamagePacketLookup,
): RuntimeV02EffectDamagePacketResult {
  if (context?.damage_class !== "effect") {
    throw new Error("tcg_v0_2_effect_damage_packet_class_required");
  }
  const packet = runtimeV02NormalizeDamagePacketContext(context);
  const target = runtimeV02DamagePacketTargetField(state, packet, lookup);
  if (target.cr !== targetCreature) {
    throw new Error("tcg_v0_2_effect_damage_packet_target_reference_mismatch");
  }
  validateEventIds(state, packet.packet_id);

  const preview = runtimeV02PreflightBeforeDamagePacket(
    state,
    amount,
    packet,
    lookup,
  );
  runtimeV02DealEffectDamage(
    structuredClone(targetCreature) as RuntimeV02DamageCreature,
    preview.final_amount,
  );
  const before = runtimeV02ResolveBeforeDamagePacket(
    state,
    amount,
    packet,
    lookup,
  );
  const receipt = runtimeV02DealEffectDamage(targetCreature, before.final_amount);

  const common = {
    packet_id: packet.packet_id,
    turn_seq: runtimeV02DamageTurn(state),
    damage_class: packet.damage_class,
    condition: packet.condition ?? null,
    source_controller_seat: packet.source_controller_seat,
    source_kind: packet.source_kind,
    source_action_id: packet.source_action_id,
    source_card_uid: packet.source_card_uid ?? null,
    source_card_id: packet.source_card_id ?? null,
    source_creature_uid: packet.source_creature_uid ?? null,
    target_controller_seat: packet.target_controller_seat,
    target_creature_uid: packet.target_creature_uid,
    target_zone: packet.target_zone,
    target_index: packet.target_index,
    subject_uid: packet.target_creature_uid,
    controller_seat: packet.target_controller_seat,
    origin_zone: packet.target_zone,
    destination_zone: packet.target_zone,
    destination_index: packet.target_index,
    phase: "damage_packet",
    action_kind: packet.source_kind,
  };
  const events = eventStream(state);
  events.push({
    event_id: `before-damage:${packet.packet_id}`,
    event: "before_damage_packet",
    ...common,
    requested_amount: before.requested_amount,
    final_amount: before.final_amount,
    modifications: before.modifications.map((entry) => ({ ...entry })),
  });
  events.push({
    event_id: `after-damage:${packet.packet_id}`,
    event: "after_damage_packet",
    ...common,
    requested_amount: before.requested_amount,
    final_packet_amount: before.final_amount,
    shield_prevented: receipt.shield_prevented,
    actual_hp_damage: receipt.actual_hp_damage,
  });
  return { ...before, receipt };
}


/**
 * Recoil uses the same before-damage packet/protection/listener pipeline as
 * other packet classes, but physical mutation remains damage placement so
 * Shield is not consumed.
 */
export function runtimeV02ApplyRecoilDamagePacket(
  state: Record<string, unknown>,
  targetCreature: RuntimeV02DamageCreature,
  amount: number,
  context: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup = runtimeV02DefaultDamagePacketLookup,
): RuntimeV02RecoilDamagePacketResult {
  if (context?.damage_class !== "recoil") {
    throw new Error("tcg_v0_2_recoil_damage_packet_class_required");
  }
  const packet = runtimeV02NormalizeDamagePacketContext(context);
  const target = runtimeV02DamagePacketTargetField(state, packet, lookup);
  if (target.cr !== targetCreature) {
    throw new Error("tcg_v0_2_recoil_damage_packet_target_reference_mismatch");
  }
  validateEventIds(state, packet.packet_id);

  const preview = runtimeV02PreflightBeforeDamagePacket(
    state,
    amount,
    packet,
    lookup,
  );
  runtimeV02PlaceDamage(
    structuredClone(targetCreature) as RuntimeV02DamageCreature,
    preview.final_amount,
  );
  const before = runtimeV02ResolveBeforeDamagePacket(
    state,
    amount,
    packet,
    lookup,
  );
  const receipt = runtimeV02PlaceDamage(targetCreature, before.final_amount);

  const common = {
    packet_id: packet.packet_id,
    turn_seq: runtimeV02DamageTurn(state),
    damage_class: packet.damage_class,
    condition: packet.condition ?? null,
    source_controller_seat: packet.source_controller_seat,
    source_kind: packet.source_kind,
    source_action_id: packet.source_action_id,
    source_card_uid: packet.source_card_uid ?? null,
    source_card_id: packet.source_card_id ?? null,
    source_creature_uid: packet.source_creature_uid ?? null,
    target_controller_seat: packet.target_controller_seat,
    target_creature_uid: packet.target_creature_uid,
    target_zone: packet.target_zone,
    target_index: packet.target_index,
    subject_uid: packet.target_creature_uid,
    controller_seat: packet.target_controller_seat,
    origin_zone: packet.target_zone,
    destination_zone: packet.target_zone,
    destination_index: packet.target_index,
    phase: "damage_packet",
    action_kind: packet.source_kind,
  };
  const events = eventStream(state);
  events.push({
    event_id: `before-damage:${packet.packet_id}`,
    event: "before_damage_packet",
    ...common,
    requested_amount: before.requested_amount,
    final_amount: before.final_amount,
    modifications: before.modifications.map((entry) => ({ ...entry })),
  });
  events.push({
    event_id: `after-damage:${packet.packet_id}`,
    event: "after_damage_packet",
    ...common,
    requested_amount: before.requested_amount,
    final_packet_amount: before.final_amount,
    shield_prevented: 0,
    actual_hp_damage: receipt.actual_damage_placed,
  });
  return { ...before, receipt };
}
