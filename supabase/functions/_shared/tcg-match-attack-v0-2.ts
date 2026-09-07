import {
  structuredRuntimeCountAddFormulaMetadata,
  type RuntimeV02CountAddFormulaMetadata,
} from "./tcg-match-attack-formula-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02AttackTargetPermission = {
  controller: "self" | "opponent";
  zone: "vanguard" | "reserve";
  card_family: "Creature";
  selection: "one";
};

export type RuntimeV02AttackRequirement = {
  predicate: "attached_essence_distinct_element_count_at_least";
  target: "$source_creature";
  count: number;
  allowed_elements: string[];
};

export type RuntimeV02AttackRequirementEvaluation =
  | { ok: true }
  | {
    ok: false;
    requirement_index: number;
    predicate: RuntimeV02AttackRequirement["predicate"];
    required: number;
    actual: number;
    allowed_elements: string[];
  };

export type RuntimeV02AttackMetadata = {
  id: string;
  name: string;
  typed: Record<string, number>;
  any: number;
  base_damage: number | null;
  damage_source: "base_damage" | "damage_formula.base" | null;
  count_add_formula: RuntimeV02CountAddFormulaMetadata | null;
  target_permissions: RuntimeV02AttackTargetPermission[];
  requirements: RuntimeV02AttackRequirement[];
  starbound: boolean;
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

function positiveInteger(value: unknown, error: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(error);
  }
  return value;
}

function attackTargetPermissions(
  value: unknown,
  attackId: string,
): RuntimeV02AttackTargetPermission[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`tcg_v0_2_attack_target_permissions_invalid:${attackId}`);
  }

  return value.map((rawPermission, index) => {
    const permission = objectRecord(rawPermission);
    if (!permission) {
      throw new Error(`tcg_v0_2_attack_target_permission_invalid:${attackId}:${index}`);
    }
    const allowedKeys = new Set(["controller", "zone", "card_family", "selection"]);
    const unsupportedKey = Object.keys(permission).find((key) => !allowedKeys.has(key));
    if (unsupportedKey) {
      throw new Error(`tcg_v0_2_attack_target_permission_field_unsupported:${attackId}:${unsupportedKey}`);
    }

    const controller = String(permission.controller || "").trim();
    const zone = String(permission.zone || "").trim();
    const cardFamily = String(permission.card_family || "").trim();
    const selection = String(permission.selection || "").trim();

    if (controller !== "self" && controller !== "opponent") {
      throw new Error(`tcg_v0_2_attack_target_permission_controller_invalid:${attackId}`);
    }
    if (zone !== "vanguard" && zone !== "reserve") {
      throw new Error(`tcg_v0_2_attack_target_permission_zone_invalid:${attackId}`);
    }
    if (cardFamily !== "Creature") {
      throw new Error(`tcg_v0_2_attack_target_permission_family_invalid:${attackId}`);
    }
    if (selection !== "one") {
      throw new Error(`tcg_v0_2_attack_target_permission_selection_invalid:${attackId}`);
    }

    return {
      controller,
      zone,
      card_family: "Creature",
      selection: "one",
    };
  });
}

function attackRequirements(
  value: unknown,
  attackId: string,
): RuntimeV02AttackRequirement[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`tcg_v0_2_attack_requirements_invalid:${attackId}`);
  }

  return value.map((rawRequirement, index) => {
    const requirement = objectRecord(rawRequirement);
    if (!requirement) {
      throw new Error(`tcg_v0_2_attack_requirement_invalid:${attackId}:${index}`);
    }
    const allowedKeys = new Set(["predicate", "target", "count", "allowed_elements"]);
    const unsupportedKey = Object.keys(requirement).find((key) => !allowedKeys.has(key));
    if (unsupportedKey) {
      throw new Error(`tcg_v0_2_attack_requirement_field_unsupported:${attackId}:${unsupportedKey}`);
    }

    const predicate = String(requirement.predicate || "").trim();
    if (predicate !== "attached_essence_distinct_element_count_at_least") {
      throw new Error(`tcg_v0_2_attack_requirement_predicate_unsupported:${attackId}:${predicate || "missing"}`);
    }

    const target = String(requirement.target || "").trim();
    if (target !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_requirement_target_invalid:${attackId}`);
    }

    const count = positiveInteger(
      requirement.count,
      `tcg_v0_2_attack_requirement_count_invalid:${attackId}`,
    );
    if (!Array.isArray(requirement.allowed_elements) || requirement.allowed_elements.length === 0) {
      throw new Error(`tcg_v0_2_attack_requirement_allowed_elements_invalid:${attackId}`);
    }
    const allowedElements = requirement.allowed_elements.map((value, elementIndex) => {
      const element = typeof value === "string" ? value.trim() : "";
      if (!element) {
        throw new Error(`tcg_v0_2_attack_requirement_allowed_element_invalid:${attackId}:${elementIndex}`);
      }
      return element;
    });
    if (new Set(allowedElements).size !== allowedElements.length) {
      throw new Error(`tcg_v0_2_attack_requirement_allowed_elements_duplicate:${attackId}`);
    }

    return {
      predicate: "attached_essence_distinct_element_count_at_least",
      target: "$source_creature",
      count,
      allowed_elements: [...allowedElements],
    };
  });
}

function structuredEssenceProvidedElements(
  state: Record<string, unknown>,
  rawInstance: unknown,
): string[] {
  const instance = objectRecord(rawInstance);
  const cardId = String(instance?.card_id || "").trim();
  if (!instance || !cardId) {
    throw new Error("tcg_v0_2_attack_requirement_essence_instance_invalid");
  }

  const definition = runtimeV02Definition(state, { card_id: cardId });
  if (!definition) {
    throw new Error(`tcg_v0_2_attack_requirement_essence_definition_required:${cardId}`);
  }
  if (String(definition.card_family || "") !== "Essence") {
    throw new Error(`tcg_v0_2_attack_requirement_attachment_not_essence:${cardId}`);
  }
  const essence = objectRecord(definition.essence);
  if (!essence) {
    throw new Error(`tcg_v0_2_attack_requirement_essence_metadata_required:${cardId}`);
  }
  if (!Array.isArray(essence.provides)) {
    throw new Error(`tcg_v0_2_attack_requirement_essence_provides_required:${cardId}`);
  }

  return essence.provides.map((rawProvide, index) => {
    const provide = objectRecord(rawProvide);
    if (!provide) {
      throw new Error(`tcg_v0_2_attack_requirement_essence_provide_invalid:${cardId}:${index}`);
    }
    const element = String(provide.element || "").trim();
    if (!element) {
      throw new Error(`tcg_v0_2_attack_requirement_essence_element_required:${cardId}:${index}`);
    }
    positiveInteger(
      provide.amount,
      `tcg_v0_2_attack_requirement_essence_amount_invalid:${cardId}:${index}`,
    );
    return element;
  });
}

export function evaluateStructuredRuntimeAttackRequirements(
  state: Record<string, unknown>,
  rawSourceCreature: unknown,
  requirements: RuntimeV02AttackRequirement[],
): RuntimeV02AttackRequirementEvaluation {
  if (!Array.isArray(requirements)) {
    throw new Error("tcg_v0_2_attack_requirement_list_invalid");
  }
  if (requirements.length === 0) return { ok: true };

  const sourceCreature = objectRecord(rawSourceCreature);
  if (!sourceCreature || !Array.isArray(sourceCreature.essence)) {
    throw new Error("tcg_v0_2_attack_requirement_source_essence_required");
  }

  for (let index = 0; index < requirements.length; index += 1) {
    const requirement = requirements[index];
    const allowed = new Set(requirement.allowed_elements);
    const represented = new Set<string>();

    for (const attached of sourceCreature.essence) {
      for (const element of structuredEssenceProvidedElements(state, attached)) {
        if (allowed.has(element)) represented.add(element);
      }
    }

    if (represented.size < requirement.count) {
      return {
        ok: false,
        requirement_index: index,
        predicate: requirement.predicate,
        required: requirement.count,
        actual: represented.size,
        allowed_elements: [...requirement.allowed_elements],
      };
    }
  }

  return { ok: true };
}

function structuredAttackStarbound(
  definition: Record<string, unknown>,
  creature: Record<string, unknown>,
  attacks: unknown[],
  attackId: string,
): boolean {
  const prestige = objectRecord(definition.prestige);
  if (!prestige || prestige.starbound === null || prestige.starbound === undefined) return false;
  const starbound = objectRecord(prestige.starbound);
  if (!starbound) {
    throw new Error(`tcg_v0_2_attack_starbound_metadata_invalid:${attackId}`);
  }
  if (typeof starbound.enabled !== "boolean") {
    throw new Error(`tcg_v0_2_attack_starbound_enabled_required:${attackId}`);
  }
  if (!starbound.enabled) return false;

  const actionKind = String(starbound.action_kind || "").trim();
  const actionId = String(starbound.action_id || "").trim();
  const sharedUsageKey = String(starbound.shared_usage_key || "").trim();
  const consume = String(starbound.consume || "").trim();

  if (actionKind !== "attack" && actionKind !== "ability") {
    throw new Error(`tcg_v0_2_attack_starbound_action_kind_invalid:${attackId}`);
  }
  if (!actionId) {
    throw new Error(`tcg_v0_2_attack_starbound_action_id_required:${attackId}`);
  }
  if (sharedUsageKey !== "starbound") {
    throw new Error(`tcg_v0_2_attack_starbound_usage_key_invalid:${attackId}`);
  }
  if (consume !== "legal_declaration_or_activation") {
    throw new Error(`tcg_v0_2_attack_starbound_consume_invalid:${attackId}`);
  }

  if (actionKind === "attack") {
    const actionExists = attacks.some((rawAttack) => {
      const candidate = objectRecord(rawAttack);
      return candidate && String(candidate.id || "").trim() === actionId;
    });
    if (!actionExists) {
      throw new Error(`tcg_v0_2_attack_starbound_action_missing:${actionId}`);
    }
    return actionId === attackId;
  }

  const ability = objectRecord(creature.ability);
  if (!ability || String(ability.id || "").trim() !== actionId) {
    throw new Error(`tcg_v0_2_attack_starbound_ability_missing:${actionId}`);
  }
  return false;
}

/**
 * Returns the structured v0.2 attack identity, Essence cost, deterministic
 * baseline damage, additive attack-target permissions, declaration requirement
 * metadata, count-add formula metadata and Starbound ownership for a 1-based slot.
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
  const countAddFormula = structuredRuntimeCountAddFormulaMetadata(attack.damage_formula, id);

  return {
    id,
    name,
    typed,
    any,
    base_damage: baseDamage,
    damage_source: damageSource,
    count_add_formula: countAddFormula,
    target_permissions: attackTargetPermissions(attack.target_permissions, id),
    requirements: attackRequirements(attack.requirements, id),
    starbound: structuredAttackStarbound(definition, creature, attacks, id),
  };
}
