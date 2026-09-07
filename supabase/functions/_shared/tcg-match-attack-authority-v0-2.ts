import {
  evaluateStructuredRuntimeConditionalAddFormula,
  type RuntimeV02ConditionalAddEvaluationContext,
  type RuntimeV02ConditionalAddFormulaEvaluation,
} from "./tcg-match-attack-conditional-add-evaluator-v0-2.ts";
import {
  evaluateStructuredRuntimeCountAddFormula,
  type RuntimeV02CountAddFormulaEvaluation,
} from "./tcg-match-attack-count-add-evaluator-v0-2.ts";
import type {
  RuntimeV02ConditionalAddFormulaMetadata,
  RuntimeV02ConditionalAddLeafPredicate,
  RuntimeV02ConditionalAddWhen,
  RuntimeV02CountAddFormulaMetadata,
} from "./tcg-match-attack-formula-v0-2.ts";
import {
  evaluateStructuredRuntimeAttackRequirements,
  structuredRuntimeAttackMetadata,
  type RuntimeV02AttackRequirement,
  type RuntimeV02AttackRequirementEvaluation,
  type RuntimeV02AttackTargetPermission,
} from "./tcg-match-attack-v0-2.ts";

export type LegacyAttackCompatibility = {
  name: string;
  raw: string;
  typed: Record<string, number>;
  any: number;
  damage: number;
  effect: string;
  starbound: boolean;
};

export type RuntimeAttackAuthority = LegacyAttackCompatibility & {
  id: string | null;
  metadata_source: "legacy" | "structured_v0_2";
  damage_source: "legacy" | "base_damage" | "damage_formula.base";
  count_add_formula: RuntimeV02CountAddFormulaMetadata | null;
  conditional_add_formula: RuntimeV02ConditionalAddFormulaMetadata | null;
  target_permissions: RuntimeV02AttackTargetPermission[];
  requirements: RuntimeV02AttackRequirement[];
};

function cloneCountAddFormula(
  value: RuntimeV02CountAddFormulaMetadata | null,
): RuntimeV02CountAddFormulaMetadata | null {
  if (value == null) return null;
  return {
    snapshot: value.snapshot,
    terms: value.terms.map((term) => ({
      ...term,
      counter: term.counter.kind === "count_cards"
        ? { ...term.counter, filters: { ...term.counter.filters } }
        : { ...term.counter, allowed_elements: [...term.counter.allowed_elements] },
    })),
  };
}

function cloneConditionalLeaf(
  value: RuntimeV02ConditionalAddLeafPredicate,
): RuntimeV02ConditionalAddLeafPredicate {
  if (value.predicate !== "event_occurred") return { ...value };
  if (value.event === "hidden_information_viewed") {
    return { ...value, filters: { ...value.filters } };
  }
  if (value.event === "damage_prevented") {
    return {
      ...value,
      filters: {
        target: value.filters.target,
        prevention_kind_any: [...value.filters.prevention_kind_any],
      },
    };
  }
  if (value.event === "essence_moved") {
    return { ...value, filters: { ...value.filters } };
  }
  return { ...value };
}

function cloneConditionalWhen(
  value: RuntimeV02ConditionalAddWhen,
): RuntimeV02ConditionalAddWhen {
  return "any" in value
    ? { any: value.any.map((predicate) => cloneConditionalLeaf(predicate)) }
    : cloneConditionalLeaf(value);
}

function cloneConditionalAddFormula(
  value: RuntimeV02ConditionalAddFormulaMetadata | null,
): RuntimeV02ConditionalAddFormulaMetadata | null {
  if (value == null) return null;
  return {
    snapshot: value.snapshot,
    terms: value.terms.map((term) => ({
      ...term,
      when: cloneConditionalWhen(term.when),
    })),
  };
}

function directConditionalLeafReady(predicate: RuntimeV02ConditionalAddLeafPredicate): boolean {
  return predicate.predicate !== "event_occurred" &&
    predicate.predicate !== "event_attack_source_has_attached_essence_kind";
}

function directConditionalWhenReady(when: RuntimeV02ConditionalAddWhen): boolean {
  return "any" in when
    ? when.any.every((predicate) => directConditionalLeafReady(predicate))
    : directConditionalLeafReady(when);
}

function readyConditionalLeaf(predicate: RuntimeV02ConditionalAddLeafPredicate): boolean {
  if (directConditionalLeafReady(predicate)) return true;
  return predicate.predicate === "event_occurred" &&
    predicate.event === "device_resolved" &&
    predicate.controller === "self" &&
    predicate.window === "current_turn" &&
    predicate.min_count === 1;
}

function readyConditionalWhen(when: RuntimeV02ConditionalAddWhen): boolean {
  return "any" in when
    ? when.any.every((predicate) => readyConditionalLeaf(predicate))
    : readyConditionalLeaf(when);
}

export function resolveRuntimeAttackAuthority(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  legacy: LegacyAttackCompatibility | null,
): RuntimeAttackAuthority | null {
  const structured = structuredRuntimeAttackMetadata(state, instanceOrId, attackSlot);

  if (structured == null) {
    if (!legacy) return null;
    return {
      ...legacy,
      typed: { ...legacy.typed },
      id: null,
      metadata_source: "legacy",
      damage_source: "legacy",
      count_add_formula: null,
      conditional_add_formula: null,
      target_permissions: [],
      requirements: [],
    };
  }

  if (!legacy) {
    throw new Error(`tcg_v0_2_attack_legacy_compatibility_required:${structured.id}`);
  }
  if (structured.base_damage == null || structured.damage_source == null) {
    throw new Error(`tcg_v0_2_attack_baseline_damage_required:${structured.id}`);
  }

  return {
    raw: legacy.raw,
    effect: legacy.effect,
    starbound: structured.starbound,
    id: structured.id,
    name: structured.name,
    typed: { ...structured.typed },
    any: structured.any,
    damage: structured.base_damage,
    metadata_source: "structured_v0_2",
    damage_source: structured.damage_source,
    count_add_formula: cloneCountAddFormula(structured.count_add_formula),
    conditional_add_formula: cloneConditionalAddFormula(structured.conditional_add_formula),
    target_permissions: structured.target_permissions.map((permission) => ({ ...permission })),
    requirements: structured.requirements.map((requirement) => ({
      ...requirement,
      allowed_elements: [...requirement.allowed_elements],
    })),
  };
}

export function evaluateRuntimeAttackDeclarationRequirements(
  state: Record<string, unknown>,
  sourceCreature: unknown,
  attack: RuntimeAttackAuthority,
): RuntimeV02AttackRequirementEvaluation {
  if (attack.metadata_source !== "structured_v0_2") return { ok: true };
  return evaluateStructuredRuntimeAttackRequirements(state, sourceCreature, attack.requirements);
}

export function evaluateRuntimeAttackCountAddFormula(
  state: Record<string, unknown>,
  sourceCreature: unknown,
  player: unknown,
  attack: RuntimeAttackAuthority,
): RuntimeV02CountAddFormulaEvaluation | null {
  if (attack.metadata_source !== "structured_v0_2") return null;
  if (attack.count_add_formula == null) return null;
  if (!attack.id) {
    throw new Error("tcg_v0_2_attack_count_add_authority_id_required");
  }
  if (attack.damage_source !== "damage_formula.base") {
    throw new Error(
      `tcg_v0_2_attack_count_add_authority_damage_source_invalid:${attack.id}:${attack.damage_source}`,
    );
  }
  return evaluateStructuredRuntimeCountAddFormula(
    state,
    sourceCreature,
    player,
    attack.damage,
    attack.count_add_formula,
    attack.id,
  );
}

/**
 * Evaluates only frozen conditional_add predicates whose truth is already fully
 * represented by declaration-time canonical match state.
 */
export function evaluateRuntimeAttackDirectConditionalAddFormula(
  attack: RuntimeAttackAuthority,
  context: RuntimeV02ConditionalAddEvaluationContext,
): RuntimeV02ConditionalAddFormulaEvaluation | null {
  if (attack.metadata_source !== "structured_v0_2") return null;
  if (attack.conditional_add_formula == null) return null;
  if (!attack.conditional_add_formula.terms.every((term) => directConditionalWhenReady(term.when))) {
    return null;
  }
  if (!attack.id) {
    throw new Error("tcg_v0_2_attack_conditional_add_authority_id_required");
  }
  if (attack.damage_source !== "damage_formula.base") {
    throw new Error(
      `tcg_v0_2_attack_conditional_add_authority_damage_source_invalid:${attack.id}:${attack.damage_source}`,
    );
  }
  return evaluateStructuredRuntimeConditionalAddFormula(
    attack.damage,
    attack.conditional_add_formula,
    context,
    attack.id,
  );
}

/**
 * Runtime-C ready subset: declaration-time state predicates plus the canonical
 * `device_resolved` current-turn signal materialized by tcg-tactic-actions.
 *
 * Reward/deck inspection, prevention, Essence movement and temporary/borrowed
 * attachment predicates remain deliberately excluded until their own canonical
 * runtime owners are proven.
 */
export function evaluateRuntimeAttackReadyConditionalAddFormula(
  attack: RuntimeAttackAuthority,
  context: RuntimeV02ConditionalAddEvaluationContext,
): RuntimeV02ConditionalAddFormulaEvaluation | null {
  if (attack.metadata_source !== "structured_v0_2") return null;
  if (attack.conditional_add_formula == null) return null;
  if (!attack.conditional_add_formula.terms.every((term) => readyConditionalWhen(term.when))) {
    return null;
  }
  if (!attack.id) {
    throw new Error("tcg_v0_2_attack_conditional_add_authority_id_required");
  }
  if (attack.damage_source !== "damage_formula.base") {
    throw new Error(
      `tcg_v0_2_attack_conditional_add_authority_damage_source_invalid:${attack.id}:${attack.damage_source}`,
    );
  }
  return evaluateStructuredRuntimeConditionalAddFormula(
    attack.damage,
    attack.conditional_add_formula,
    context,
    attack.id,
  );
}
