import type {
  RuntimeV02DamagePacketClass,
  RuntimeV02DamagePacketModification,
} from "./tcg-match-damage-packet-context-v0-2.ts";

export type RuntimeV02DamageProtectionCreature = {
  flags?: Record<string, unknown>;
};

export type RuntimeV02DamageProtectionInstall = {
  protection_id: string;
  source_action_id: string;
  source_uid: string;
  source_card_id: string;
  source_kind: "ability" | "essence" | "relic" | "realm";
  source_controller_seat: 1 | 2;
  target_controller_seat: 1 | 2;
  target_creature_uid: string;
  installed_turn_seq: number;
  damage_classes: RuntimeV02DamagePacketClass[];
  source_controller: "any" | "opponent" | "self";
  reduce_amount: number;
  minimum: number;
  max_uses: number;
  expires_on: "start_of_controller_next_turn";
};

export type RuntimeV02DamageProtectionContext = {
  turn_seq: number;
  active_seat: 1 | 2;
  source_controller_seat: 1 | 2 | null;
  target_controller_seat: 1 | 2;
  target_creature_uid: string;
  damage_class: RuntimeV02DamagePacketClass;
  packet_id: string;
};

export type RuntimeV02DamageProtectionResult = {
  final_amount: number;
  modifications: RuntimeV02DamagePacketModification[];
};

type Stored = RuntimeV02DamageProtectionInstall & { remaining_uses: number };
const KEY = "runtime_v0_2_damage_protections";
const CLASSES = new Set<RuntimeV02DamagePacketClass>(["attack", "effect", "recoil", "condition"]);
const SOURCE_KINDS = new Set(["ability", "essence", "relic", "realm"]);

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
function integer(value: unknown, error: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new Error(error);
  return n;
}
function amount(value: unknown, error: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(error);
  return n;
}
function normalizeClasses(raw: unknown): RuntimeV02DamagePacketClass[] {
  if (!Array.isArray(raw) || raw.length < 1) {
    throw new Error("tcg_v0_2_damage_protection_classes_required");
  }
  const out: RuntimeV02DamagePacketClass[] = [];
  for (const value of raw) {
    const kind = String(value) as RuntimeV02DamagePacketClass;
    if (!CLASSES.has(kind)) throw new Error(`tcg_v0_2_damage_protection_class_invalid:${String(value)}`);
    if (!out.includes(kind)) out.push(kind);
  }
  return out;
}
function normalizeInstall(raw: RuntimeV02DamageProtectionInstall): Stored {
  if (!record(raw)) throw new Error("tcg_v0_2_damage_protection_install_required");
  const sourceKind = String(raw.source_kind) as RuntimeV02DamageProtectionInstall["source_kind"];
  if (!SOURCE_KINDS.has(sourceKind)) throw new Error("tcg_v0_2_damage_protection_source_kind_invalid");
  const sourceController = String(raw.source_controller) as RuntimeV02DamageProtectionInstall["source_controller"];
  if (!["any", "opponent", "self"].includes(sourceController)) {
    throw new Error("tcg_v0_2_damage_protection_source_controller_invalid");
  }
  if (raw.expires_on !== "start_of_controller_next_turn") {
    throw new Error("tcg_v0_2_damage_protection_expiry_unsupported");
  }
  const maxUses = integer(raw.max_uses, "tcg_v0_2_damage_protection_max_uses_invalid");
  if (maxUses < 1) throw new Error("tcg_v0_2_damage_protection_max_uses_invalid");
  const reduceAmount = amount(raw.reduce_amount, "tcg_v0_2_damage_protection_reduce_invalid");
  if (!(reduceAmount > 0)) throw new Error("tcg_v0_2_damage_protection_reduce_required");
  return {
    protection_id: string(raw.protection_id, "tcg_v0_2_damage_protection_id_required"),
    source_action_id: string(raw.source_action_id, "tcg_v0_2_damage_protection_action_required"),
    source_uid: string(raw.source_uid, "tcg_v0_2_damage_protection_source_uid_required"),
    source_card_id: string(raw.source_card_id, "tcg_v0_2_damage_protection_source_card_id_required"),
    source_kind: sourceKind,
    source_controller_seat: seat(raw.source_controller_seat, "tcg_v0_2_damage_protection_source_seat_invalid"),
    target_controller_seat: seat(raw.target_controller_seat, "tcg_v0_2_damage_protection_target_seat_invalid"),
    target_creature_uid: string(raw.target_creature_uid, "tcg_v0_2_damage_protection_target_uid_required"),
    installed_turn_seq: integer(raw.installed_turn_seq, "tcg_v0_2_damage_protection_install_turn_invalid"),
    damage_classes: normalizeClasses(raw.damage_classes),
    source_controller: sourceController,
    reduce_amount: reduceAmount,
    minimum: amount(raw.minimum, "tcg_v0_2_damage_protection_minimum_invalid"),
    max_uses: maxUses,
    remaining_uses: maxUses,
    expires_on: "start_of_controller_next_turn",
  };
}
function normalizeStored(raw: unknown, index: number): Stored {
  const value = record(raw);
  if (!value) throw new Error(`tcg_v0_2_damage_protection_record_invalid:${index}`);
  const normalized = normalizeInstall(value as unknown as RuntimeV02DamageProtectionInstall);
  const remaining = integer(value.remaining_uses, `tcg_v0_2_damage_protection_remaining_invalid:${index}`);
  if (remaining > normalized.max_uses) throw new Error(`tcg_v0_2_damage_protection_remaining_invalid:${index}`);
  return { ...normalized, remaining_uses: remaining };
}
function ledger(creature: RuntimeV02DamageProtectionCreature): Stored[] {
  const raw = creature.flags?.[KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_damage_protection_ledger_invalid");
  return raw.map(normalizeStored);
}
function write(creature: RuntimeV02DamageProtectionCreature, values: Stored[]): void {
  creature.flags ||= {};
  creature.flags[KEY] = values.map((value) => ({ ...value, damage_classes: [...value.damage_classes] }));
}
function expired(value: Stored, context: RuntimeV02DamageProtectionContext): boolean {
  return context.turn_seq > value.installed_turn_seq && context.active_seat === value.target_controller_seat;
}
function sourceMatches(value: Stored, context: RuntimeV02DamageProtectionContext): boolean {
  if (value.source_controller === "any") return true;
  if (context.source_controller_seat == null) return false;
  if (value.source_controller === "self") return context.source_controller_seat === value.target_controller_seat;
  return context.source_controller_seat !== value.target_controller_seat;
}
function matches(value: Stored, context: RuntimeV02DamageProtectionContext): boolean {
  return value.remaining_uses > 0 && !expired(value, context) &&
    value.target_controller_seat === context.target_controller_seat &&
    value.target_creature_uid === context.target_creature_uid &&
    value.damage_classes.includes(context.damage_class) && sourceMatches(value, context);
}

export function runtimeV02InstallDamageProtection(
  creature: RuntimeV02DamageProtectionCreature,
  install: RuntimeV02DamageProtectionInstall,
): { installed: boolean; protection_id: string } {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_damage_protection_target_required");
  const candidate = normalizeInstall(install);
  const current = ledger(creature);
  const existing = current.find((entry) => entry.protection_id === candidate.protection_id);
  if (existing) {
    const expected = JSON.stringify({ ...candidate, remaining_uses: candidate.max_uses });
    const actual = JSON.stringify({ ...existing, remaining_uses: existing.max_uses });
    if (expected !== actual) throw new Error("tcg_v0_2_damage_protection_id_conflict");
    return { installed: false, protection_id: existing.protection_id };
  }
  current.push(candidate);
  write(creature, current);
  return { installed: true, protection_id: candidate.protection_id };
}

export function runtimeV02ApplyDamageProtections(
  creature: RuntimeV02DamageProtectionCreature,
  baseAmount: number,
  rawContext: RuntimeV02DamageProtectionContext,
): RuntimeV02DamageProtectionResult {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_damage_protection_target_required");
  const context: RuntimeV02DamageProtectionContext = {
    turn_seq: integer(rawContext.turn_seq, "tcg_v0_2_damage_protection_turn_invalid"),
    active_seat: seat(rawContext.active_seat, "tcg_v0_2_damage_protection_active_seat_invalid"),
    source_controller_seat: rawContext.source_controller_seat == null ? null : seat(rawContext.source_controller_seat, "tcg_v0_2_damage_protection_packet_source_seat_invalid"),
    target_controller_seat: seat(rawContext.target_controller_seat, "tcg_v0_2_damage_protection_packet_target_seat_invalid"),
    target_creature_uid: string(rawContext.target_creature_uid, "tcg_v0_2_damage_protection_packet_target_uid_required"),
    damage_class: String(rawContext.damage_class) as RuntimeV02DamagePacketClass,
    packet_id: string(rawContext.packet_id, "tcg_v0_2_damage_protection_packet_id_required"),
  };
  if (!CLASSES.has(context.damage_class)) throw new Error("tcg_v0_2_damage_protection_packet_class_invalid");
  let currentAmount = amount(baseAmount, "tcg_v0_2_damage_protection_packet_amount_invalid");
  const values = ledger(creature).filter((value) => !expired(value, context) && value.remaining_uses > 0);
  const modifications: RuntimeV02DamagePacketModification[] = [];
  if (currentAmount > 0) {
    for (const value of values) {
      if (!matches(value, context)) continue;
      const before = currentAmount;
      currentAmount = Math.max(value.minimum, currentAmount - value.reduce_amount);
      value.remaining_uses -= 1;
      modifications.push({
        listener_id: `stored-protection:${value.protection_id}`,
        source_uid: value.source_uid,
        source_card_id: value.source_card_id,
        source_kind: value.source_kind,
        controller_seat: value.source_controller_seat,
        amount_before: before,
        delta: -value.reduce_amount,
        minimum: value.minimum,
        amount_after: currentAmount,
      });
      if (currentAmount <= 0) break;
    }
  }
  if (creature.flags?.[KEY] != null) write(creature, values.filter((value) => value.remaining_uses > 0));
  return { final_amount: currentAmount, modifications };
}

export function runtimeV02DamageProtectionCount(creature: RuntimeV02DamageProtectionCreature): number {
  return ledger(creature).filter((value) => value.remaining_uses > 0).length;
}
