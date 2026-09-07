import type {
  RuntimeV02ConditionalAddFormulaMetadata,
  RuntimeV02ConditionalAddLeafPredicate,
  RuntimeV02ConditionalAddWhen,
} from "./tcg-match-attack-formula-v0-2.ts";

export type RuntimeV02ConditionalAddEventSignal =
  | { event: "reward_inspected" | "device_resolved"; controller: "self" }
  | {
    event: "hidden_information_viewed";
    controller: "self";
    zone: "deck_top" | "deck";
  }
  | {
    event: "damage_prevented";
    target: "source_creature";
    prevention_kind: "ability" | "relic" | "shield";
  }
  | {
    event: "essence_moved";
    controller: "self";
    element: string;
  };

export type RuntimeV02ConditionalAddEvaluationContext = {
  source_conditions: string[];
  target_conditions: string[];
  source_became_vanguard_this_turn: boolean;
  self_reserve_count: number;
  opponent_hand_count: number;
  source_has_relic: boolean;
  current_turn_events: RuntimeV02ConditionalAddEventSignal[];
  source_attached_essence_kinds: Array<"temporary" | "borrowed">;
};

export type RuntimeV02ConditionalAddTermEvaluation = {
  kind: "conditional_add";
  amount: number;
  matched: boolean;
  matched_predicate_count: number;
  contribution: number;
};

export type RuntimeV02ConditionalAddFormulaEvaluation = {
  snapshot: "legal_declaration";
  base_damage: number;
  damage: number;
  terms: RuntimeV02ConditionalAddTermEvaluation[];
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

function stringList(value: unknown, error: string): string[] {
  if (!Array.isArray(value)) throw new Error(error);
  return value.map((entry, index) => {
    if (typeof entry !== "string" || !entry.trim()) throw new Error(`${error}:${index}`);
    return entry;
  });
}

function normalizeEventSignal(
  raw: unknown,
  attackId: string,
  index: number,
): RuntimeV02ConditionalAddEventSignal {
  const value = objectRecord(raw);
  const prefix = `tcg_v0_2_attack_conditional_add_context_event_invalid:${attackId}:${index}`;
  if (!value) throw new Error(prefix);
  const event = String(value.event || "");

  if (event === "reward_inspected" || event === "device_resolved") {
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}:controller`);
    return { event, controller: "self" };
  }
  if (event === "hidden_information_viewed") {
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}:controller`);
    const zone = String(value.zone || "");
    if (zone !== "deck_top" && zone !== "deck") throw new Error(`${prefix}:zone`);
    return { event, controller: "self", zone };
  }
  if (event === "damage_prevented") {
    if (String(value.target || "") !== "source_creature") throw new Error(`${prefix}:target`);
    const preventionKind = String(value.prevention_kind || "");
    if (preventionKind !== "ability" && preventionKind !== "relic" && preventionKind !== "shield") {
      throw new Error(`${prefix}:prevention_kind`);
    }
    return {
      event,
      target: "source_creature",
      prevention_kind: preventionKind,
    };
  }
  if (event === "essence_moved") {
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}:controller`);
    const element = typeof value.element === "string" ? value.element.trim() : "";
    if (!element) throw new Error(`${prefix}:element`);
    return { event, controller: "self", element };
  }

  throw new Error(`${prefix}:event:${event || "missing"}`);
}

function normalizeContext(
  raw: RuntimeV02ConditionalAddEvaluationContext,
  attackId: string,
): RuntimeV02ConditionalAddEvaluationContext {
  const context = objectRecord(raw);
  if (!context) throw new Error(`tcg_v0_2_attack_conditional_add_context_invalid:${attackId}`);
  if (typeof context.source_became_vanguard_this_turn !== "boolean") {
    throw new Error(`tcg_v0_2_attack_conditional_add_context_source_vanguard_invalid:${attackId}`);
  }
  if (typeof context.source_has_relic !== "boolean") {
    throw new Error(`tcg_v0_2_attack_conditional_add_context_source_relic_invalid:${attackId}`);
  }

  const attachmentKinds = stringList(
    context.source_attached_essence_kinds,
    `tcg_v0_2_attack_conditional_add_context_attachment_kinds_invalid:${attackId}`,
  ).map((kind, index) => {
    if (kind !== "temporary" && kind !== "borrowed") {
      throw new Error(`tcg_v0_2_attack_conditional_add_context_attachment_kind_invalid:${attackId}:${index}:${kind}`);
    }
    return kind;
  }) as Array<"temporary" | "borrowed">;

  if (!Array.isArray(context.current_turn_events)) {
    throw new Error(`tcg_v0_2_attack_conditional_add_context_events_invalid:${attackId}`);
  }

  return {
    source_conditions: stringList(
      context.source_conditions,
      `tcg_v0_2_attack_conditional_add_context_source_conditions_invalid:${attackId}`,
    ),
    target_conditions: stringList(
      context.target_conditions,
      `tcg_v0_2_attack_conditional_add_context_target_conditions_invalid:${attackId}`,
    ),
    source_became_vanguard_this_turn: context.source_became_vanguard_this_turn,
    self_reserve_count: nonNegativeInteger(
      context.self_reserve_count,
      `tcg_v0_2_attack_conditional_add_context_reserve_count_invalid:${attackId}`,
    ),
    opponent_hand_count: nonNegativeInteger(
      context.opponent_hand_count,
      `tcg_v0_2_attack_conditional_add_context_hand_count_invalid:${attackId}`,
    ),
    source_has_relic: context.source_has_relic,
    current_turn_events: context.current_turn_events.map((event, index) => normalizeEventSignal(event, attackId, index)),
    source_attached_essence_kinds: [...attachmentKinds],
  };
}

function eventPredicateMatches(
  predicate: Extract<RuntimeV02ConditionalAddLeafPredicate, { predicate: "event_occurred" }>,
  context: RuntimeV02ConditionalAddEvaluationContext,
): boolean {
  return context.current_turn_events.some((event) => {
    if (event.event !== predicate.event) return false;

    if (predicate.event === "reward_inspected" || predicate.event === "device_resolved") {
      return "controller" in event && event.controller === "self";
    }
    if (predicate.event === "hidden_information_viewed") {
      return event.event === "hidden_information_viewed" &&
        event.controller === "self" &&
        event.zone === predicate.filters.zone;
    }
    if (predicate.event === "damage_prevented") {
      return event.event === "damage_prevented" &&
        event.target === "source_creature" &&
        predicate.filters.prevention_kind_any.includes(event.prevention_kind);
    }
    if (predicate.event === "essence_moved") {
      return event.event === "essence_moved" &&
        event.controller === "self" &&
        event.element === predicate.filters.element;
    }
    return false;
  });
}

function leafMatches(
  predicate: RuntimeV02ConditionalAddLeafPredicate,
  context: RuntimeV02ConditionalAddEvaluationContext,
): boolean {
  if (predicate.predicate === "source_has_condition") {
    return context.source_conditions.includes(predicate.condition);
  }
  if (predicate.predicate === "target_has_condition") {
    return context.target_conditions.includes(predicate.condition);
  }
  if (predicate.predicate === "target_has_any_condition") {
    return context.target_conditions.length > 0;
  }
  if (predicate.predicate === "source_became_vanguard_this_turn") {
    return context.source_became_vanguard_this_turn;
  }
  if (predicate.predicate === "reserve_count_at_least") {
    return context.self_reserve_count >= predicate.count;
  }
  if (predicate.predicate === "hand_count_at_least") {
    return context.opponent_hand_count >= predicate.count;
  }
  if (predicate.predicate === "source_has_relic") {
    return context.source_has_relic;
  }
  if (predicate.predicate === "event_occurred") {
    return eventPredicateMatches(predicate, context);
  }
  if (predicate.predicate === "event_attack_source_has_attached_essence_kind") {
    return context.source_attached_essence_kinds.includes(predicate.kind);
  }
  const exhaustive: never = predicate;
  throw new Error(`tcg_v0_2_attack_conditional_add_predicate_unreachable:${String(exhaustive)}`);
}

function whenMatches(
  when: RuntimeV02ConditionalAddWhen,
  context: RuntimeV02ConditionalAddEvaluationContext,
): { matched: boolean; matchedPredicateCount: number } {
  if ("any" in when) {
    const matchedPredicateCount = when.any.filter((predicate) => leafMatches(predicate, context)).length;
    return { matched: matchedPredicateCount > 0, matchedPredicateCount };
  }
  const matched = leafMatches(when, context);
  return { matched, matchedPredicateCount: matched ? 1 : 0 };
}

/**
 * Pure deterministic evaluator for the frozen Set One conditional_add formula subset.
 *
 * The caller owns construction of a declaration-time context from canonical match
 * state. This function deliberately does not read legacy English card text or
 * invent event history. That adapter/wiring remains a separate guarded runtime tick.
 */
export function evaluateStructuredRuntimeConditionalAddFormula(
  baseDamage: number,
  formula: RuntimeV02ConditionalAddFormulaMetadata,
  rawContext: RuntimeV02ConditionalAddEvaluationContext,
  attackId: string,
): RuntimeV02ConditionalAddFormulaEvaluation {
  const base = nonNegativeInteger(
    baseDamage,
    `tcg_v0_2_attack_conditional_add_base_damage_invalid:${attackId}`,
  );
  if (!formula || formula.snapshot !== "legal_declaration" || !Array.isArray(formula.terms)) {
    throw new Error(`tcg_v0_2_attack_conditional_add_formula_evaluation_invalid:${attackId}`);
  }
  const context = normalizeContext(rawContext, attackId);
  const terms = formula.terms.map((term, index) => {
    if (!term || term.kind !== "conditional_add") {
      throw new Error(`tcg_v0_2_attack_conditional_add_term_evaluation_invalid:${attackId}:${index}`);
    }
    const amount = nonNegativeInteger(
      term.amount,
      `tcg_v0_2_attack_conditional_add_term_amount_invalid:${attackId}:${index}`,
    );
    const match = whenMatches(term.when, context);
    return {
      kind: "conditional_add" as const,
      amount,
      matched: match.matched,
      matched_predicate_count: match.matchedPredicateCount,
      contribution: match.matched ? amount : 0,
    };
  });

  return {
    snapshot: "legal_declaration",
    base_damage: base,
    damage: base + terms.reduce((total, term) => total + term.contribution, 0),
    terms,
  };
}
