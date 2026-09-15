import type {
  RuntimeV02CountAddFormulaMetadata,
  RuntimeV02CountAddTerm,
} from "./tcg-match-attack-formula-v0-2.ts";
import { structuredRuntimeDistinctAttachedEssenceElements } from "./tcg-match-essence-query-v0-2.ts";

export type RuntimeV02CountAddTermEvaluation = {
  kind: "count_add";
  counter_kind: RuntimeV02CountAddTerm["counter"]["kind"];
  observed_count: number;
  applied_count: number;
  amount_per: number;
  max_count: number;
  contribution: number;
};

export type RuntimeV02CountAddFormulaEvaluation = {
  snapshot: "legal_declaration";
  base_damage: number;
  damage: number;
  terms: RuntimeV02CountAddTermEvaluation[];
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

function friendlyFieldCreatures(rawPlayer: unknown, attackId: string): unknown[] {
  const player = objectRecord(rawPlayer);
  if (!player) throw new Error(`tcg_v0_2_attack_count_add_player_state_invalid:${attackId}`);
  if (!Array.isArray(player.reserve)) {
    throw new Error(`tcg_v0_2_attack_count_add_reserve_state_invalid:${attackId}`);
  }

  const field: unknown[] = [];
  if (player.vanguard != null) field.push(player.vanguard);
  for (const creature of player.reserve) if (creature != null) field.push(creature);
  return field;
}

function countDamagedFriendlyFieldCreatures(rawPlayer: unknown, attackId: string): number {
  let count = 0;
  const field = friendlyFieldCreatures(rawPlayer, attackId);
  for (let index = 0; index < field.length; index += 1) {
    const creature = objectRecord(field[index]);
    if (!creature) {
      throw new Error(`tcg_v0_2_attack_count_add_field_creature_invalid:${attackId}:${index}`);
    }
    const damage = creature.damage == null
      ? 0
      : nonNegativeInteger(
        creature.damage,
        `tcg_v0_2_attack_count_add_field_creature_damage_invalid:${attackId}:${index}`,
      );
    if (damage > 0) count += 1;
  }
  return count;
}

function termObservedCount(
  state: Record<string, unknown>,
  rawSourceCreature: unknown,
  rawPlayer: unknown,
  term: RuntimeV02CountAddTerm,
  attackId: string,
): number {
  if (term.counter.kind === "count_cards") {
    return countDamagedFriendlyFieldCreatures(rawPlayer, attackId);
  }
  if (term.counter.kind === "distinct_attached_essence_elements") {
    return structuredRuntimeDistinctAttachedEssenceElements(
      state,
      rawSourceCreature,
      term.counter.allowed_elements,
      "tcg_v0_2_attack_count_add",
    ).length;
  }
  const unreachable = term.counter as { kind?: unknown };
  throw new Error(`tcg_v0_2_attack_count_add_counter_kind_unreachable:${attackId}:${String(unreachable.kind || "missing")}`);
}

/**
 * Evaluates the already-normalized count_add subset at legal declaration time.
 * rawPlayer and rawSourceCreature must come from canonical server match state,
 * never request-body counters or client-computed values.
 */
export function evaluateStructuredRuntimeCountAddFormula(
  state: Record<string, unknown>,
  rawSourceCreature: unknown,
  rawPlayer: unknown,
  baseDamage: number,
  formula: RuntimeV02CountAddFormulaMetadata,
  attackId: string,
): RuntimeV02CountAddFormulaEvaluation {
  const base = nonNegativeInteger(
    baseDamage,
    `tcg_v0_2_attack_count_add_base_damage_invalid:${attackId}`,
  );
  if (formula.snapshot !== "legal_declaration") {
    throw new Error(`tcg_v0_2_attack_count_add_evaluation_snapshot_invalid:${attackId}:${String(formula.snapshot)}`);
  }
  if (!Array.isArray(formula.terms)) {
    throw new Error(`tcg_v0_2_attack_count_add_evaluation_terms_invalid:${attackId}`);
  }

  let damage = base;
  const terms: RuntimeV02CountAddTermEvaluation[] = [];
  for (let index = 0; index < formula.terms.length; index += 1) {
    const term = formula.terms[index];
    if (!term || term.kind !== "count_add") {
      throw new Error(`tcg_v0_2_attack_count_add_evaluation_term_invalid:${attackId}:${index}`);
    }
    const amountPer = positiveInteger(
      term.amount_per,
      `tcg_v0_2_attack_count_add_evaluation_amount_invalid:${attackId}:${index}`,
    );
    const maxCount = positiveInteger(
      term.max_count,
      `tcg_v0_2_attack_count_add_evaluation_cap_invalid:${attackId}:${index}`,
    );
    const observedCount = nonNegativeInteger(
      termObservedCount(state, rawSourceCreature, rawPlayer, term, attackId),
      `tcg_v0_2_attack_count_add_evaluation_count_invalid:${attackId}:${index}`,
    );
    const appliedCount = Math.min(observedCount, maxCount);
    const contribution = appliedCount * amountPer;
    if (!Number.isSafeInteger(contribution)) {
      throw new Error(`tcg_v0_2_attack_count_add_evaluation_contribution_unsafe:${attackId}:${index}`);
    }
    damage += contribution;
    if (!Number.isSafeInteger(damage)) {
      throw new Error(`tcg_v0_2_attack_count_add_evaluation_damage_unsafe:${attackId}:${index}`);
    }
    terms.push({
      kind: "count_add",
      counter_kind: term.counter.kind,
      observed_count: observedCount,
      applied_count: appliedCount,
      amount_per: amountPer,
      max_count: maxCount,
      contribution,
    });
  }

  return {
    snapshot: "legal_declaration",
    base_damage: base,
    damage,
    terms,
  };
}
