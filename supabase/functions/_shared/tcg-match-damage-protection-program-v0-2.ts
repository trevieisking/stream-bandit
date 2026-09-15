import {
  runtimeV02InstallDamageProtection,
  type RuntimeV02DamageProtectionCreature,
  type RuntimeV02DamageProtectionInstall,
} from "./tcg-match-damage-protection-v0-2.ts";
import type {
  RuntimeV02DamagePacketClass,
  RuntimeV02DamagePacketModification,
} from "./tcg-match-damage-packet-context-v0-2.ts";

export type RuntimeV02DamageProtectionProgramSource = {
  controller_seat: 1 | 2;
  action_id: string;
  card_uid: string;
  card_id: string;
  kind: RuntimeV02DamagePacketModification["source_kind"];
};

export type RuntimeV02DamageProtectionProgramTarget = {
  controller_seat: 1 | 2;
  creature_uid: string;
  creature: RuntimeV02DamageProtectionCreature;
};

export type RuntimeV02DamageProtectionProgramReceipt = {
  protection_id: string;
  installed: boolean;
  target_creature_uid: string;
  damage_classes: RuntimeV02DamagePacketClass[];
  reduce_amount: number;
  max_uses: number;
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
function string(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}
function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}
function amount(value: unknown, error: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(error);
  return n;
}
function classes(raw: unknown): RuntimeV02DamagePacketClass[] {
  if (!Array.isArray(raw) || raw.length < 1) {
    throw new Error("tcg_v0_2_damage_protection_program_classes_required");
  }
  const allowed = new Set(["attack", "effect", "recoil", "condition"]);
  const out: RuntimeV02DamagePacketClass[] = [];
  for (const value of raw) {
    const kind = String(value) as RuntimeV02DamagePacketClass;
    if (!allowed.has(kind)) {
      throw new Error(`tcg_v0_2_damage_protection_program_class_invalid:${String(value)}`);
    }
    if (!out.includes(kind)) out.push(kind);
  }
  return out;
}
function duration(raw: unknown): { max_uses: number; expires_on: "start_of_controller_next_turn" } {
  const value = record(raw);
  if (!value) throw new Error("tcg_v0_2_damage_protection_program_duration_required");
  const expiry = Array.isArray(value.expires_on) ? value.expires_on.map(String) : [];
  if (expiry.length !== 1 || expiry[0] !== "start_of_controller_next_turn") {
    throw new Error("tcg_v0_2_damage_protection_program_expiry_unsupported");
  }
  if (
    value.consume_on != null &&
    String(value.consume_on) !== "matching_damage_packet_reduced"
  ) {
    throw new Error("tcg_v0_2_damage_protection_program_consume_on_unsupported");
  }
  const maxUses = Number(value.max_uses ?? 1);
  if (!Number.isInteger(maxUses) || maxUses < 1) {
    throw new Error("tcg_v0_2_damage_protection_program_max_uses_invalid");
  }
  return { max_uses: maxUses, expires_on: "start_of_controller_next_turn" };
}

export function runtimeV02ApplyDamageProtectionProgram(
  state: Record<string, unknown>,
  sourceRaw: RuntimeV02DamageProtectionProgramSource,
  targetRaw: RuntimeV02DamageProtectionProgramTarget,
  stepRaw: Record<string, unknown>,
): RuntimeV02DamageProtectionProgramReceipt {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_damage_protection_program_turn_invalid");
  }
  if (!record(sourceRaw)) throw new Error("tcg_v0_2_damage_protection_program_source_required");
  if (!record(targetRaw) || !targetRaw.creature || typeof targetRaw.creature !== "object") {
    throw new Error("tcg_v0_2_damage_protection_program_target_required");
  }
  const step = record(stepRaw);
  if (!step || String(step.op || "") !== "ADD_DAMAGE_PROTECTION") {
    throw new Error("tcg_v0_2_damage_protection_program_op_invalid");
  }
  const allowed = new Set([
    "op", "target", "damage_classes", "source_controller", "reduce_amount", "minimum", "duration",
  ]);
  const extra = Object.keys(step).find((key) => !allowed.has(key));
  if (extra) throw new Error(`tcg_v0_2_damage_protection_program_field_unsupported:${extra}`);

  const sourceController = String(step.source_controller || "opponent");
  if (!["any", "self", "opponent"].includes(sourceController)) {
    throw new Error("tcg_v0_2_damage_protection_program_source_controller_invalid");
  }
  const reduceAmount = amount(step.reduce_amount, "tcg_v0_2_damage_protection_program_reduce_invalid");
  if (!(reduceAmount > 0)) throw new Error("tcg_v0_2_damage_protection_program_reduce_required");
  const minimum = amount(step.minimum ?? 0, "tcg_v0_2_damage_protection_program_minimum_invalid");
  const parsedDuration = duration(step.duration);
  const parsedClasses = classes(step.damage_classes);
  const sourceSeat = seat(sourceRaw.controller_seat, "tcg_v0_2_damage_protection_program_source_seat_invalid");
  const targetSeat = seat(targetRaw.controller_seat, "tcg_v0_2_damage_protection_program_target_seat_invalid");
  const sourceActionId = string(sourceRaw.action_id, "tcg_v0_2_damage_protection_program_action_required");
  const sourceUid = string(sourceRaw.card_uid, "tcg_v0_2_damage_protection_program_source_uid_required");
  const sourceCardId = string(sourceRaw.card_id, "tcg_v0_2_damage_protection_program_source_card_id_required");
  const targetUid = string(targetRaw.creature_uid, "tcg_v0_2_damage_protection_program_target_uid_required");
  if (!["ability", "essence", "relic", "realm"].includes(sourceRaw.kind)) {
    throw new Error("tcg_v0_2_damage_protection_program_source_kind_invalid");
  }

  const install: RuntimeV02DamageProtectionInstall = {
    protection_id: `damage-protection:${sourceActionId}:${sourceUid}:${targetUid}`,
    source_action_id: sourceActionId,
    source_uid: sourceUid,
    source_card_id: sourceCardId,
    source_kind: sourceRaw.kind,
    source_controller_seat: sourceSeat,
    target_controller_seat: targetSeat,
    target_creature_uid: targetUid,
    installed_turn_seq: turn,
    damage_classes: parsedClasses,
    source_controller: sourceController as "any" | "self" | "opponent",
    reduce_amount: reduceAmount,
    minimum,
    max_uses: parsedDuration.max_uses,
    expires_on: parsedDuration.expires_on,
  };
  const result = runtimeV02InstallDamageProtection(targetRaw.creature, install);
  return {
    protection_id: result.protection_id,
    installed: result.installed,
    target_creature_uid: targetUid,
    damage_classes: parsedClasses,
    reduce_amount: reduceAmount,
    max_uses: parsedDuration.max_uses,
  };
}
