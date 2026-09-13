import {
  runtimeV02InstallConditionProtection,
  type RuntimeV02ConditionProtectionCreature,
  type RuntimeV02ConditionProtectionInstall,
  type RuntimeV02ConditionProtectionSlot,
} from "./tcg-match-condition-protection-v0-2.ts";

export type RuntimeV02ConditionProtectionProgramSource = {
  controller_seat: 1 | 2;
  action_id: string;
  card_uid: string;
  card_id: string;
};

export type RuntimeV02ConditionProtectionProgramTarget = {
  controller_seat: 1 | 2;
  creature_uid: string;
  creature: RuntimeV02ConditionProtectionCreature;
};

export type RuntimeV02ConditionProtectionProgramReceipt = {
  protection_id: string;
  installed: boolean;
  target_creature_uid: string;
  condition_slot: RuntimeV02ConditionProtectionSlot | null;
  condition_names: string[];
  max_uses: number;
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

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function normalizeNames(raw: unknown): string[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_condition_protection_program_conditions_invalid");
  return [...new Set(raw.map((value) => requiredString(
    value,
    "tcg_v0_2_condition_protection_program_condition_invalid",
  )))];
}

function normalizeSlot(raw: unknown): RuntimeV02ConditionProtectionSlot | null {
  if (raw == null) return null;
  const value = String(raw) as RuntimeV02ConditionProtectionSlot;
  if (!["control", "modifier", "scorched", "venomed"].includes(value)) {
    throw new Error("tcg_v0_2_condition_protection_program_slot_invalid");
  }
  return value;
}

function normalizeDuration(raw: unknown): { max_uses: number; expires_on: "start_of_controller_next_turn" } {
  const duration = objectRecord(raw);
  if (!duration) throw new Error("tcg_v0_2_condition_protection_program_duration_required");
  const expiry = Array.isArray(duration.expires_on)
    ? duration.expires_on.map(String)
    : [];
  if (expiry.length !== 1 || expiry[0] !== "start_of_controller_next_turn") {
    throw new Error("tcg_v0_2_condition_protection_program_expiry_unsupported");
  }
  if (
    duration.consume_on != null &&
    String(duration.consume_on) !== "matching_condition_application_prevented"
  ) {
    throw new Error("tcg_v0_2_condition_protection_program_consume_on_unsupported");
  }
  const maxUses = Number(duration.max_uses ?? 1);
  if (!Number.isInteger(maxUses) || maxUses < 1) {
    throw new Error("tcg_v0_2_condition_protection_program_max_uses_invalid");
  }
  return { max_uses: maxUses, expires_on: "start_of_controller_next_turn" };
}

export function runtimeV02ApplyConditionProtectionProgram(
  state: Record<string, unknown>,
  sourceRaw: RuntimeV02ConditionProtectionProgramSource,
  targetRaw: RuntimeV02ConditionProtectionProgramTarget,
  stepRaw: Record<string, unknown>,
): RuntimeV02ConditionProtectionProgramReceipt {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_condition_protection_program_turn_invalid");
  }
  if (!objectRecord(sourceRaw)) {
    throw new Error("tcg_v0_2_condition_protection_program_source_required");
  }
  if (!objectRecord(targetRaw) || !targetRaw.creature || typeof targetRaw.creature !== "object") {
    throw new Error("tcg_v0_2_condition_protection_program_target_required");
  }
  const step = objectRecord(stepRaw);
  if (!step || String(step.op || "") !== "ADD_CONDITION_PROTECTION") {
    throw new Error("tcg_v0_2_condition_protection_program_op_invalid");
  }
  const allowed = new Set([
    "op",
    "target",
    "condition_slot",
    "conditions",
    "source_controller",
    "card_effect_only",
    "duration",
  ]);
  const extra = Object.keys(step).find((key) => !allowed.has(key));
  if (extra) {
    throw new Error(`tcg_v0_2_condition_protection_program_field_unsupported:${extra}`);
  }

  const sourceController = String(step.source_controller || "opponent");
  if (!["any", "self", "opponent"].includes(sourceController)) {
    throw new Error("tcg_v0_2_condition_protection_program_source_controller_invalid");
  }
  if (step.card_effect_only != null && typeof step.card_effect_only !== "boolean") {
    throw new Error("tcg_v0_2_condition_protection_program_card_effect_only_invalid");
  }
  const conditionNames = normalizeNames(step.conditions);
  const conditionSlot = normalizeSlot(step.condition_slot);
  if (!conditionNames.length && conditionSlot == null) {
    throw new Error("tcg_v0_2_condition_protection_program_filter_required");
  }
  const duration = normalizeDuration(step.duration);
  const sourceControllerSeat = seat(
    sourceRaw.controller_seat,
    "tcg_v0_2_condition_protection_program_source_seat_invalid",
  );
  const targetControllerSeat = seat(
    targetRaw.controller_seat,
    "tcg_v0_2_condition_protection_program_target_seat_invalid",
  );
  const sourceActionId = requiredString(
    sourceRaw.action_id,
    "tcg_v0_2_condition_protection_program_action_required",
  );
  const sourceUid = requiredString(
    sourceRaw.card_uid,
    "tcg_v0_2_condition_protection_program_source_uid_required",
  );
  const sourceCardId = requiredString(
    sourceRaw.card_id,
    "tcg_v0_2_condition_protection_program_source_card_id_required",
  );
  const targetCreatureUid = requiredString(
    targetRaw.creature_uid,
    "tcg_v0_2_condition_protection_program_target_uid_required",
  );

  const install: RuntimeV02ConditionProtectionInstall = {
    protection_id: `condition-protection:${sourceActionId}:${sourceUid}:${targetCreatureUid}`,
    source_action_id: sourceActionId,
    source_uid: sourceUid,
    source_card_id: sourceCardId,
    source_controller_seat: sourceControllerSeat,
    target_controller_seat: targetControllerSeat,
    installed_turn_seq: turn,
    condition_names: conditionNames,
    condition_slot: conditionSlot,
    source_controller: sourceController as "any" | "self" | "opponent",
    card_effect_only: step.card_effect_only !== false,
    max_uses: duration.max_uses,
    expires_on: duration.expires_on,
  };
  const result = runtimeV02InstallConditionProtection(targetRaw.creature, install);
  return {
    protection_id: result.protection_id,
    installed: result.installed,
    target_creature_uid: targetCreatureUid,
    condition_slot: conditionSlot,
    condition_names: conditionNames,
    max_uses: duration.max_uses,
  };
}
