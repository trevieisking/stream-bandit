import type {
  RuntimeV02DamageCreature,
  RuntimeV02EffectDamageReceipt,
} from "./tcg-match-damage-engine-v0-2.ts";

export type RuntimeV02DamagePacketClass = "attack" | "effect" | "recoil" | "condition";
export type RuntimeV02DamagePacketSourceKind =
  | "attack" | "ability" | "tactic" | "essence" | "relic" | "realm"
  | "condition" | "rule" | "system";
export type RuntimeV02DamagePacketContext = {
  packet_id: string;
  damage_class: RuntimeV02DamagePacketClass;
  condition?: string | null;
  source_controller_seat: 1 | 2 | null;
  source_kind: RuntimeV02DamagePacketSourceKind;
  source_action_id: string;
  source_card_uid?: string | null;
  source_card_id?: string | null;
  source_creature_uid?: string | null;
  target_controller_seat: 1 | 2;
  target_creature_uid: string;
  target_zone: "vanguard" | "reserve";
  target_index: number | null;
};
export type RuntimeV02DamagePacketModification = {
  listener_id: string;
  source_uid: string;
  source_card_id: string;
  source_kind: "ability" | "essence" | "relic" | "realm";
  controller_seat: 1 | 2;
  amount_before: number;
  delta: number;
  minimum: number;
  amount_after: number;
};
export type RuntimeV02BeforeDamagePacketResult = {
  packet_id: string;
  requested_amount: number;
  final_amount: number;
  modifications: RuntimeV02DamagePacketModification[];
  limited: Array<{ listener_id: string; source_uid: string }>;
  already_resolved: Array<{ listener_id: string; source_uid: string }>;
};
export type RuntimeV02EffectDamagePacketResult = RuntimeV02BeforeDamagePacketResult & {
  receipt: RuntimeV02EffectDamageReceipt;
};
export type RuntimeV02DamagePacketInstance = {
  uid: string;
  card_id: string;
  effect_flags?: Record<string, unknown>;
};
export type RuntimeV02DamagePacketCreature = RuntimeV02DamageCreature & {
  stack?: RuntimeV02DamagePacketInstance[];
  essence?: RuntimeV02DamagePacketInstance[];
  relic?: RuntimeV02DamagePacketInstance | null;
  flags?: Record<string, unknown>;
};
export type RuntimeV02DamagePacketField = {
  seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  cr: RuntimeV02DamagePacketCreature;
  top: RuntimeV02DamagePacketInstance;
  def: Record<string, unknown>;
};
export type RuntimeV02DamagePacketCandidate = {
  kind: "ability" | "essence" | "relic" | "realm";
  source: RuntimeV02DamagePacketInstance;
  seat: 1 | 2;
  field: RuntimeV02DamagePacketField | null;
  listener: Record<string, unknown>;
};
export type RuntimeV02DamagePacketLookup = (
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
) => Record<string, unknown> | null;
export type RuntimeV02ResolvedDamagePacketContext = RuntimeV02DamagePacketContext & { turn_seq: number };

const CLASSES = new Set(["attack", "effect", "recoil", "condition"]);
const SOURCE_KINDS = new Set([
  "attack", "ability", "tactic", "essence", "relic", "realm", "condition", "rule", "system",
]);

export function runtimeV02DamageObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
export function runtimeV02DamageString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}
export function runtimeV02DamageAmount(value: unknown, error: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error(error);
  return amount;
}
export function runtimeV02DamageSeat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}
export function runtimeV02DamageTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) throw new Error("tcg_v0_2_damage_packet_turn_invalid");
  return value;
}
export function runtimeV02DamageInstance(value: unknown, error: string): RuntimeV02DamagePacketInstance {
  const raw = runtimeV02DamageObject(value);
  if (!raw) throw new Error(error);
  runtimeV02DamageString(raw.uid, `${error}:uid`);
  runtimeV02DamageString(raw.card_id, `${error}:card_id`);
  if (raw.effect_flags != null && !runtimeV02DamageObject(raw.effect_flags)) {
    throw new Error(`${error}:effect_flags`);
  }
  return raw as unknown as RuntimeV02DamagePacketInstance;
}
export function runtimeV02NormalizeDamagePacketContext(
  raw: RuntimeV02DamagePacketContext,
): RuntimeV02DamagePacketContext {
  if (!runtimeV02DamageObject(raw)) throw new Error("tcg_v0_2_damage_packet_context_required");
  const damageClass = String(raw.damage_class || "") as RuntimeV02DamagePacketClass;
  const sourceKind = String(raw.source_kind || "") as RuntimeV02DamagePacketSourceKind;
  if (!CLASSES.has(damageClass)) {
    throw new Error(`tcg_v0_2_damage_packet_class_unsupported:${damageClass}`);
  }
  if (!SOURCE_KINDS.has(sourceKind)) {
    throw new Error(`tcg_v0_2_damage_packet_source_kind_unsupported:${sourceKind}`);
  }
  const zone = String(raw.target_zone || "");
  if (zone !== "vanguard" && zone !== "reserve") {
    throw new Error("tcg_v0_2_damage_packet_target_zone_invalid");
  }
  const index = raw.target_index == null ? null : Number(raw.target_index);
  if (zone === "vanguard" && index !== null) {
    throw new Error("tcg_v0_2_damage_packet_vanguard_index_invalid");
  }
  if (zone === "reserve" && (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3)) {
    throw new Error("tcg_v0_2_damage_packet_reserve_index_invalid");
  }
  return {
    packet_id: runtimeV02DamageString(raw.packet_id, "tcg_v0_2_damage_packet_id_required"),
    damage_class: damageClass,
    condition: raw.condition == null
      ? null
      : runtimeV02DamageString(raw.condition, "tcg_v0_2_damage_packet_condition_invalid"),
    source_controller_seat: raw.source_controller_seat == null
      ? null
      : runtimeV02DamageSeat(raw.source_controller_seat, "tcg_v0_2_damage_packet_source_seat_invalid"),
    source_kind: sourceKind,
    source_action_id: runtimeV02DamageString(raw.source_action_id, "tcg_v0_2_damage_packet_action_id_required"),
    source_card_uid: raw.source_card_uid == null
      ? null
      : runtimeV02DamageString(raw.source_card_uid, "tcg_v0_2_damage_packet_source_card_uid_invalid"),
    source_card_id: raw.source_card_id == null
      ? null
      : runtimeV02DamageString(raw.source_card_id, "tcg_v0_2_damage_packet_source_card_id_invalid"),
    source_creature_uid: raw.source_creature_uid == null
      ? null
      : runtimeV02DamageString(raw.source_creature_uid, "tcg_v0_2_damage_packet_source_creature_uid_invalid"),
    target_controller_seat: runtimeV02DamageSeat(raw.target_controller_seat, "tcg_v0_2_damage_packet_target_seat_invalid"),
    target_creature_uid: runtimeV02DamageString(raw.target_creature_uid, "tcg_v0_2_damage_packet_target_uid_required"),
    target_zone: zone,
    target_index: index,
  };
}