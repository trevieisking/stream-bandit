export type RuntimeV02ConditionProtectionCreature = {
  flags?: Record<string, unknown>;
};

export type RuntimeV02ConditionProtectionSlot = "control" | "modifier" | "scorched" | "venomed";

export type RuntimeV02ConditionProtectionInstall = {
  protection_id: string;
  source_action_id: string;
  source_uid: string;
  source_card_id: string;
  source_controller_seat: 1 | 2;
  target_controller_seat: 1 | 2;
  installed_turn_seq: number;
  condition_names?: string[] | null;
  condition_slot?: RuntimeV02ConditionProtectionSlot | null;
  source_controller: "any" | "opponent" | "self";
  card_effect_only: boolean;
  max_uses: number;
  expires_on: "start_of_controller_next_turn";
};

export type RuntimeV02ConditionApplicationContext = {
  turn_seq: number;
  active_seat: 1 | 2;
  source_controller_seat: 1 | 2 | null;
  target_controller_seat: 1 | 2;
  card_effect: boolean;
  new_application: boolean;
  condition: string;
  condition_slot: RuntimeV02ConditionProtectionSlot;
  source_action_id: string;
};

export type RuntimeV02ConditionProtectionReceipt = {
  prevented: boolean;
  protection_id: string | null;
  source_uid: string | null;
  source_card_id: string | null;
  remaining_uses: number | null;
};

type StoredProtection = RuntimeV02ConditionProtectionInstall & {
  remaining_uses: number;
};

const KEY = "runtime_v0_2_condition_protections";

function record(value: unknown): Record<string, unknown> | null {
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

function turn(value: unknown, error: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new Error(error);
  return n;
}

function uses(value: unknown, error: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(error);
  return n;
}

function normalizeInstall(raw: RuntimeV02ConditionProtectionInstall): StoredProtection {
  if (!record(raw)) throw new Error("tcg_v0_2_condition_protection_install_required");
  const names = raw.condition_names == null
    ? []
    : Array.isArray(raw.condition_names)
    ? [...new Set(raw.condition_names.map((value) => requiredString(value, "tcg_v0_2_condition_protection_name_invalid")))]
    : (() => { throw new Error("tcg_v0_2_condition_protection_names_invalid"); })();
  const slot = raw.condition_slot == null ? null : String(raw.condition_slot) as RuntimeV02ConditionProtectionSlot;
  if (slot != null && !["control", "modifier", "scorched", "venomed"].includes(slot)) {
    throw new Error("tcg_v0_2_condition_protection_slot_invalid");
  }
  if (!names.length && slot == null) throw new Error("tcg_v0_2_condition_protection_filter_required");
  if (!["any", "opponent", "self"].includes(String(raw.source_controller))) {
    throw new Error("tcg_v0_2_condition_protection_source_controller_invalid");
  }
  if (raw.expires_on !== "start_of_controller_next_turn") {
    throw new Error("tcg_v0_2_condition_protection_expiry_unsupported");
  }
  const maxUses = uses(raw.max_uses, "tcg_v0_2_condition_protection_max_uses_invalid");
  return {
    protection_id: requiredString(raw.protection_id, "tcg_v0_2_condition_protection_id_required"),
    source_action_id: requiredString(raw.source_action_id, "tcg_v0_2_condition_protection_action_required"),
    source_uid: requiredString(raw.source_uid, "tcg_v0_2_condition_protection_source_uid_required"),
    source_card_id: requiredString(raw.source_card_id, "tcg_v0_2_condition_protection_source_card_id_required"),
    source_controller_seat: seat(raw.source_controller_seat, "tcg_v0_2_condition_protection_source_seat_invalid"),
    target_controller_seat: seat(raw.target_controller_seat, "tcg_v0_2_condition_protection_target_seat_invalid"),
    installed_turn_seq: turn(raw.installed_turn_seq, "tcg_v0_2_condition_protection_install_turn_invalid"),
    condition_names: names,
    condition_slot: slot,
    source_controller: raw.source_controller,
    card_effect_only: raw.card_effect_only === true,
    max_uses: maxUses,
    remaining_uses: maxUses,
    expires_on: "start_of_controller_next_turn",
  };
}

function normalizeStored(raw: unknown, index: number): StoredProtection {
  const value = record(raw);
  if (!value) throw new Error(`tcg_v0_2_condition_protection_record_invalid:${index}`);
  const normalized = normalizeInstall(value as unknown as RuntimeV02ConditionProtectionInstall);
  const remaining = Number(value.remaining_uses);
  if (!Number.isInteger(remaining) || remaining < 0 || remaining > normalized.max_uses) {
    throw new Error(`tcg_v0_2_condition_protection_remaining_invalid:${index}`);
  }
  return { ...normalized, remaining_uses: remaining };
}

function ledger(creature: RuntimeV02ConditionProtectionCreature): StoredProtection[] {
  const raw = creature.flags?.[KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_condition_protection_ledger_invalid");
  return raw.map(normalizeStored);
}

function writeLedger(creature: RuntimeV02ConditionProtectionCreature, values: StoredProtection[]): void {
  creature.flags ||= {};
  creature.flags[KEY] = values.map((value) => ({ ...value, condition_names: [...(value.condition_names || [])] }));
}

function expired(value: StoredProtection, context: RuntimeV02ConditionApplicationContext): boolean {
  return context.turn_seq > value.installed_turn_seq && context.active_seat === value.target_controller_seat;
}

function sourceMatches(value: StoredProtection, context: RuntimeV02ConditionApplicationContext): boolean {
  if (value.source_controller === "any") return true;
  if (context.source_controller_seat == null) return false;
  if (value.source_controller === "self") return context.source_controller_seat === value.target_controller_seat;
  return context.source_controller_seat !== value.target_controller_seat;
}

function protectionMatches(value: StoredProtection, context: RuntimeV02ConditionApplicationContext): boolean {
  if (value.remaining_uses < 1 || expired(value, context) || !context.new_application) return false;
  if (value.target_controller_seat !== context.target_controller_seat) return false;
  if (value.card_effect_only && !context.card_effect) return false;
  if (!sourceMatches(value, context)) return false;
  const names = value.condition_names || [];
  const nameMatch = names.length > 0 && names.includes(context.condition);
  const slotMatch = value.condition_slot != null && value.condition_slot === context.condition_slot;
  return nameMatch || slotMatch;
}

export function runtimeV02InstallConditionProtection(
  creature: RuntimeV02ConditionProtectionCreature,
  install: RuntimeV02ConditionProtectionInstall,
): { installed: boolean; protection_id: string } {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_condition_protection_target_required");
  const candidate = normalizeInstall(install);
  const current = ledger(creature);
  const existing = current.find((entry) => entry.protection_id === candidate.protection_id);
  if (existing) {
    const expected = JSON.stringify({ ...candidate, remaining_uses: candidate.max_uses });
    const actual = JSON.stringify({ ...existing, remaining_uses: existing.max_uses });
    if (actual !== expected) throw new Error("tcg_v0_2_condition_protection_id_conflict");
    return { installed: false, protection_id: existing.protection_id };
  }
  current.push(candidate);
  writeLedger(creature, current);
  return { installed: true, protection_id: candidate.protection_id };
}

export function runtimeV02ConsumeConditionProtection(
  creature: RuntimeV02ConditionProtectionCreature,
  rawContext: RuntimeV02ConditionApplicationContext,
): RuntimeV02ConditionProtectionReceipt {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_condition_protection_target_required");
  if (!record(rawContext)) throw new Error("tcg_v0_2_condition_application_context_required");
  const context: RuntimeV02ConditionApplicationContext = {
    turn_seq: turn(rawContext.turn_seq, "tcg_v0_2_condition_application_turn_invalid"),
    active_seat: seat(rawContext.active_seat, "tcg_v0_2_condition_application_active_seat_invalid"),
    source_controller_seat: rawContext.source_controller_seat == null
      ? null
      : seat(rawContext.source_controller_seat, "tcg_v0_2_condition_application_source_seat_invalid"),
    target_controller_seat: seat(rawContext.target_controller_seat, "tcg_v0_2_condition_application_target_seat_invalid"),
    card_effect: rawContext.card_effect === true,
    new_application: rawContext.new_application === true,
    condition: requiredString(rawContext.condition, "tcg_v0_2_condition_application_condition_required"),
    condition_slot: rawContext.condition_slot,
    source_action_id: requiredString(rawContext.source_action_id, "tcg_v0_2_condition_application_action_required"),
  };
  if (!["control", "modifier", "scorched", "venomed"].includes(context.condition_slot)) {
    throw new Error("tcg_v0_2_condition_application_slot_invalid");
  }
  const current = ledger(creature).filter((value) => !expired(value, context) && value.remaining_uses > 0);
  const match = current.find((value) => protectionMatches(value, context));
  if (!match) {
    if (creature.flags?.[KEY] != null) writeLedger(creature, current);
    return { prevented: false, protection_id: null, source_uid: null, source_card_id: null, remaining_uses: null };
  }
  match.remaining_uses -= 1;
  writeLedger(creature, current.filter((value) => value.remaining_uses > 0));
  return {
    prevented: true,
    protection_id: match.protection_id,
    source_uid: match.source_uid,
    source_card_id: match.source_card_id,
    remaining_uses: match.remaining_uses,
  };
}

export function runtimeV02ConditionProtectionCount(
  creature: RuntimeV02ConditionProtectionCreature,
): number {
  return ledger(creature).filter((value) => value.remaining_uses > 0).length;
}
