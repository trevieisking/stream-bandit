import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02AttackMetadata = {
  id: string;
  name: string;
  typed: Record<string, number>;
  any: number;
  base_damage: number | null;
  damage_source: "base_damage" | "damage_formula.base" | null;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function nonNegativeInteger(value: unknown, error: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(error);
  }
  return value;
}

/**
 * Returns the structured v0.2 attack identity, Essence cost and deterministic
 * baseline damage for a 1-based attack slot.
 *
 * Legacy-only matches deliberately return null so the existing text parser
 * remains the fallback until the v0.2 match snapshot is present. Once a match
 * carries the v0.2 snapshot marker, malformed structured attack metadata fails
 * closed rather than mixing legacy and structured authority.
 */
export function structuredRuntimeAttackMetadata(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackMetadata | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;

  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_requires_creature");
  }
  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_creature_definition_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_list_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_definition_invalid");
  const id = String(attack.id || "").trim();
  const name = String(attack.name || "").trim();
  if (!id) throw new Error("tcg_v0_2_attack_id_required");
  if (!name) throw new Error("tcg_v0_2_attack_name_required");

  if (!Array.isArray(attack.cost)) throw new Error(`tcg_v0_2_attack_cost_required:${id}`);
  const typed: Record<string, number> = {};
  let any = 0;
  for (const rawCost of attack.cost) {
    const cost = objectRecord(rawCost);
    if (!cost) throw new Error(`tcg_v0_2_attack_cost_entry_invalid:${id}`);
    const element = String(cost.element || "").trim();
    if (!element) throw new Error(`tcg_v0_2_attack_cost_element_required:${id}`);
    const amount = nonNegativeInteger(cost.amount, `tcg_v0_2_attack_cost_amount_invalid:${id}`);
    if (element === "Any") any += amount;
    else typed[element] = (typed[element] || 0) + amount;
  }

  let baseDamage: number | null = null;
  let damageSource: RuntimeV02AttackMetadata["damage_source"] = null;
  if (attack.base_damage !== null && attack.base_damage !== undefined) {
    baseDamage = nonNegativeInteger(attack.base_damage, `tcg_v0_2_attack_base_damage_invalid:${id}`);
    damageSource = "base_damage";
  } else if (attack.damage_formula !== null && attack.damage_formula !== undefined) {
    const formula = objectRecord(attack.damage_formula);
    if (!formula) throw new Error(`tcg_v0_2_attack_damage_formula_invalid:${id}`);
    baseDamage = nonNegativeInteger(formula.base, `tcg_v0_2_attack_formula_base_invalid:${id}`);
    damageSource = "damage_formula.base";
  }

  return {
    id,
    name,
    typed,
    any,
    base_damage: baseDamage,
    damage_source: damageSource,
  };
}
