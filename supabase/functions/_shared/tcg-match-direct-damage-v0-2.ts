import {
  runtimeV02ApplyEffectDamagePacket,
  runtimeV02ApplyRecoilDamagePacket,
  type RuntimeV02DamagePacketContext,
  type RuntimeV02EffectDamagePacketResult,
  type RuntimeV02RecoilDamagePacketResult,
} from "./tcg-match-damage-packet-v0-2.ts";
import type { RuntimeV02DamageCreature } from "./tcg-match-damage-engine-v0-2.ts";
import type { RuntimeV02EventListenerEvent } from "./tcg-match-event-listener-v0-2.ts";

export type RuntimeV02DirectDamageClass = "effect" | "recoil";

export type RuntimeV02DirectDamageDescriptor = {
  target: string;
  amount: number;
  damage_class: RuntimeV02DirectDamageClass;
  source_attack_id: string | null;
};

export type RuntimeV02DirectDamageResult = {
  descriptor: RuntimeV02DirectDamageDescriptor;
  packet:
    | RuntimeV02EffectDamagePacketResult
    | RuntimeV02RecoilDamagePacketResult;
  after_damage_event: RuntimeV02EventListenerEvent;
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

export function runtimeV02NormalizeDirectDamageStep(
  raw: unknown,
): RuntimeV02DirectDamageDescriptor {
  const step = objectRecord(raw);
  if (!step || step.op !== "DIRECT_DAMAGE") {
    throw new Error("tcg_v0_2_direct_damage_step_required");
  }
  const unsupported = Object.keys(step).find((key) =>
    !["op", "target", "amount", "damage_class", "source_attack_id"].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_direct_damage_step_field_unsupported:${unsupported}`,
    );
  }
  const target = requiredString(
    step.target,
    "tcg_v0_2_direct_damage_target_required",
  );
  const amount = Number(step.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("tcg_v0_2_direct_damage_amount_invalid");
  }
  const damageClass = String(step.damage_class || "");
  if (damageClass !== "effect" && damageClass !== "recoil") {
    throw new Error(
      `tcg_v0_2_direct_damage_class_unsupported:${damageClass}`,
    );
  }
  const sourceAttackId = step.source_attack_id == null
    ? null
    : requiredString(
      step.source_attack_id,
      "tcg_v0_2_direct_damage_source_attack_id_invalid",
    );
  if (damageClass === "effect" && sourceAttackId != null) {
    throw new Error("tcg_v0_2_direct_damage_effect_attack_id_unsupported");
  }
  if (damageClass === "recoil" && sourceAttackId == null) {
    throw new Error("tcg_v0_2_direct_damage_recoil_attack_id_required");
  }
  return {
    target,
    amount,
    damage_class: damageClass,
    source_attack_id: sourceAttackId,
  };
}

function afterDamageEvent(
  state: Record<string, unknown>,
  packetId: string,
): RuntimeV02EventListenerEvent {
  const events = state.effect_events;
  if (!Array.isArray(events)) {
    throw new Error("tcg_v0_2_direct_damage_event_stream_required");
  }
  const event = events.find((entry) =>
    entry && typeof entry === "object" &&
    String((entry as Record<string, unknown>).event_id || "") ===
      `after-damage:${packetId}`
  );
  if (!event || typeof event !== "object") {
    throw new Error("tcg_v0_2_direct_damage_after_event_missing");
  }
  return structuredClone(event as RuntimeV02EventListenerEvent);
}

/**
 * Owner #20 DIRECT_DAMAGE submodule.
 *
 * Producers resolve target variables and construct source/target packet context;
 * this submodule owns only the frozen DIRECT_DAMAGE grammar and delegates
 * physical mutation/protection/listener packet semantics to Damage Packet.
 */
export function runtimeV02ApplyDirectDamage(
  state: Record<string, unknown>,
  targetCreature: RuntimeV02DamageCreature,
  rawStep: unknown,
  context: RuntimeV02DamagePacketContext,
  expectedTarget?: string,
  expectedAttackId?: string | null,
): RuntimeV02DirectDamageResult {
  const descriptor = runtimeV02NormalizeDirectDamageStep(rawStep);
  if (expectedTarget != null && descriptor.target !== expectedTarget) {
    throw new Error("tcg_v0_2_direct_damage_target_binding_mismatch");
  }
  if (
    expectedAttackId !== undefined &&
    descriptor.source_attack_id !== expectedAttackId
  ) {
    throw new Error("tcg_v0_2_direct_damage_source_attack_mismatch");
  }
  if (context.damage_class !== descriptor.damage_class) {
    throw new Error("tcg_v0_2_direct_damage_packet_class_mismatch");
  }
  const packet = descriptor.damage_class === "effect"
    ? runtimeV02ApplyEffectDamagePacket(
      state,
      targetCreature,
      descriptor.amount,
      context,
    )
    : runtimeV02ApplyRecoilDamagePacket(
      state,
      targetCreature,
      descriptor.amount,
      context,
    );
  return {
    descriptor,
    packet,
    after_damage_event: afterDamageEvent(state, context.packet_id),
  };
}
