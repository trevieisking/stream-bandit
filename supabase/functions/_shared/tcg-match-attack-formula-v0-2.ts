export type RuntimeV02CountCardsCounter = {
  kind: "count_cards";
  controller: "self";
  zone: "field";
  filters: {
    card_family: "Creature";
    damaged: true;
  };
};

export type RuntimeV02DistinctAttachedEssenceElementsCounter = {
  kind: "distinct_attached_essence_elements";
  target: "$source_creature";
  allowed_elements: string[];
};

export type RuntimeV02CountAddCounter =
  | RuntimeV02CountCardsCounter
  | RuntimeV02DistinctAttachedEssenceElementsCounter;

export type RuntimeV02CountAddTerm = {
  kind: "count_add";
  counter: RuntimeV02CountAddCounter;
  amount_per: number;
  max_count: number;
};

export type RuntimeV02CountAddFormulaMetadata = {
  snapshot: "legal_declaration";
  terms: RuntimeV02CountAddTerm[];
};

export type RuntimeV02ConditionalAddEventOccurredPredicate =
  | {
    predicate: "event_occurred";
    event: "reward_inspected" | "device_resolved";
    controller: "self";
    window: "current_turn";
    min_count: 1;
  }
  | {
    predicate: "event_occurred";
    event: "hidden_information_viewed";
    controller: "self";
    window: "current_turn";
    min_count: 1;
    filters: { zone: "deck_top" | "deck" };
  }
  | {
    predicate: "event_occurred";
    event: "damage_prevented";
    window: "current_turn";
    min_count: 1;
    filters: {
      target: "source_creature";
      prevention_kind_any: ["ability", "relic", "shield"];
    };
  }
  | {
    predicate: "event_occurred";
    event: "essence_moved";
    controller: "self";
    window: "current_turn";
    min_count: 1;
    filters: { element: "Tide" };
  };

export type RuntimeV02ConditionalAddLeafPredicate =
  | { predicate: "source_has_condition"; condition: "Scorched" }
  | { predicate: "target_has_condition"; condition: "Scorched" | "Venomed" | "Mindbound" }
  | { predicate: "target_has_any_condition" }
  | { predicate: "source_became_vanguard_this_turn" }
  | { predicate: "reserve_count_at_least"; controller: "self"; count: 3 }
  | { predicate: "hand_count_at_least"; player: "opponent"; count: 5 }
  | { predicate: "source_has_relic" }
  | RuntimeV02ConditionalAddEventOccurredPredicate
  | { predicate: "event_attack_source_has_attached_essence_kind"; kind: "temporary" | "borrowed" };

export type RuntimeV02ConditionalAddWhen =
  | RuntimeV02ConditionalAddLeafPredicate
  | { any: RuntimeV02ConditionalAddLeafPredicate[] };

export type RuntimeV02ConditionalAddTerm = {
  kind: "conditional_add";
  amount: number;
  when: RuntimeV02ConditionalAddWhen;
};

export type RuntimeV02ConditionalAddFormulaMetadata = {
  snapshot: "legal_declaration";
  terms: RuntimeV02ConditionalAddTerm[];
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function positiveInteger(value: unknown, error: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(error);
  }
  return value;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  errorPrefix: string,
): void {
  const keys = new Set(allowed);
  const unsupported = Object.keys(value).find((key) => !keys.has(key));
  if (unsupported) throw new Error(`${errorPrefix}:${unsupported}`);
}

function countCardsCounter(
  value: Record<string, unknown>,
  attackId: string,
  termIndex: number,
): RuntimeV02CountCardsCounter {
  rejectUnsupportedFields(
    value,
    ["kind", "controller", "zone", "filters"],
    `tcg_v0_2_attack_count_add_counter_field_unsupported:${attackId}:${termIndex}`,
  );
  if (String(value.controller || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_count_add_count_cards_controller_invalid:${attackId}:${termIndex}`);
  }
  if (String(value.zone || "") !== "field") {
    throw new Error(`tcg_v0_2_attack_count_add_count_cards_zone_invalid:${attackId}:${termIndex}`);
  }

  const filters = objectRecord(value.filters);
  if (!filters) {
    throw new Error(`tcg_v0_2_attack_count_add_count_cards_filters_required:${attackId}:${termIndex}`);
  }
  rejectUnsupportedFields(
    filters,
    ["card_family", "damaged"],
    `tcg_v0_2_attack_count_add_count_cards_filter_unsupported:${attackId}:${termIndex}`,
  );
  if (String(filters.card_family || "") !== "Creature") {
    throw new Error(`tcg_v0_2_attack_count_add_count_cards_family_invalid:${attackId}:${termIndex}`);
  }
  if (filters.damaged !== true) {
    throw new Error(`tcg_v0_2_attack_count_add_count_cards_damaged_invalid:${attackId}:${termIndex}`);
  }

  return {
    kind: "count_cards",
    controller: "self",
    zone: "field",
    filters: { card_family: "Creature", damaged: true },
  };
}

function distinctAttachedEssenceElementsCounter(
  value: Record<string, unknown>,
  attackId: string,
  termIndex: number,
): RuntimeV02DistinctAttachedEssenceElementsCounter {
  rejectUnsupportedFields(
    value,
    ["kind", "target", "allowed_elements"],
    `tcg_v0_2_attack_count_add_counter_field_unsupported:${attackId}:${termIndex}`,
  );
  if (String(value.target || "") !== "$source_creature") {
    throw new Error(`tcg_v0_2_attack_count_add_distinct_target_invalid:${attackId}:${termIndex}`);
  }
  if (!Array.isArray(value.allowed_elements) || value.allowed_elements.length === 0) {
    throw new Error(`tcg_v0_2_attack_count_add_distinct_allowed_elements_invalid:${attackId}:${termIndex}`);
  }

  const allowedElements = value.allowed_elements.map((rawElement, elementIndex) => {
    const element = typeof rawElement === "string" ? rawElement.trim() : "";
    if (!element) {
      throw new Error(`tcg_v0_2_attack_count_add_distinct_allowed_element_invalid:${attackId}:${termIndex}:${elementIndex}`);
    }
    return element;
  });
  if (new Set(allowedElements).size !== allowedElements.length) {
    throw new Error(`tcg_v0_2_attack_count_add_distinct_allowed_elements_duplicate:${attackId}:${termIndex}`);
  }

  return {
    kind: "distinct_attached_essence_elements",
    target: "$source_creature",
    allowed_elements: [...allowedElements],
  };
}

function countAddTerm(
  rawTerm: unknown,
  attackId: string,
  termIndex: number,
): RuntimeV02CountAddTerm {
  const term = objectRecord(rawTerm);
  if (!term) {
    throw new Error(`tcg_v0_2_attack_count_add_term_invalid:${attackId}:${termIndex}`);
  }
  rejectUnsupportedFields(
    term,
    ["kind", "counter", "amount_per", "max_count"],
    `tcg_v0_2_attack_count_add_term_field_unsupported:${attackId}:${termIndex}`,
  );
  if (String(term.kind || "") !== "count_add") {
    throw new Error(`tcg_v0_2_attack_count_add_term_kind_invalid:${attackId}:${termIndex}`);
  }

  const counter = objectRecord(term.counter);
  if (!counter) {
    throw new Error(`tcg_v0_2_attack_count_add_counter_required:${attackId}:${termIndex}`);
  }
  const kind = String(counter.kind || "");
  const normalizedCounter = kind === "count_cards"
    ? countCardsCounter(counter, attackId, termIndex)
    : kind === "distinct_attached_essence_elements"
    ? distinctAttachedEssenceElementsCounter(counter, attackId, termIndex)
    : (() => {
      throw new Error(`tcg_v0_2_attack_count_add_counter_kind_unsupported:${attackId}:${termIndex}:${kind || "missing"}`);
    })();

  return {
    kind: "count_add",
    counter: normalizedCounter,
    amount_per: positiveInteger(
      term.amount_per,
      `tcg_v0_2_attack_count_add_amount_per_invalid:${attackId}:${termIndex}`,
    ),
    max_count: positiveInteger(
      term.max_count,
      `tcg_v0_2_attack_count_add_max_count_invalid:${attackId}:${termIndex}`,
    ),
  };
}

/**
 * Normalizes only the count_add subset of a structured v0.2 attack formula.
 *
 * Current Set One uses exactly two server-owned counter shapes:
 * - count public friendly damaged Creatures on the field (Ashen Stampede);
 * - count distinct supplied attached Essence elements (Total Convergence).
 *
 * Other formula term kinds remain owned by later Runtime Pass C ticks. A formula
 * with no count_add term therefore returns null rather than claiming authority.
 */
export function structuredRuntimeCountAddFormulaMetadata(
  value: unknown,
  attackId: string,
): RuntimeV02CountAddFormulaMetadata | null {
  if (value === null || value === undefined) return null;
  const formula = objectRecord(value);
  if (!formula) throw new Error(`tcg_v0_2_attack_count_add_formula_invalid:${attackId}`);
  if (!Array.isArray(formula.terms)) {
    throw new Error(`tcg_v0_2_attack_count_add_formula_terms_invalid:${attackId}`);
  }

  const indexedCountAddTerms = formula.terms
    .map((rawTerm, index) => ({ rawTerm, index, term: objectRecord(rawTerm) }))
    .filter(({ term }) => String(term?.kind || "") === "count_add");
  if (indexedCountAddTerms.length === 0) return null;

  const snapshot = formula.snapshot == null ? "legal_declaration" : String(formula.snapshot);
  if (snapshot !== "legal_declaration") {
    throw new Error(`tcg_v0_2_attack_count_add_snapshot_unsupported:${attackId}:${snapshot}`);
  }

  return {
    snapshot: "legal_declaration",
    terms: indexedCountAddTerms.map(({ rawTerm, index }) => countAddTerm(rawTerm, attackId, index)),
  };
}

function conditionalEventOccurredPredicate(
  value: Record<string, unknown>,
  attackId: string,
  termIndex: number,
  predicatePath: string,
): RuntimeV02ConditionalAddEventOccurredPredicate {
  const event = String(value.event || "");
  const prefix = `tcg_v0_2_attack_conditional_add_event:${attackId}:${termIndex}:${predicatePath}`;

  if (event === "reward_inspected" || event === "device_resolved") {
    rejectUnsupportedFields(value, ["predicate", "event", "controller", "window", "min_count"], `${prefix}_field_unsupported`);
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}_controller_invalid`);
    if (String(value.window || "") !== "current_turn") throw new Error(`${prefix}_window_invalid`);
    if (value.min_count !== 1) throw new Error(`${prefix}_min_count_invalid`);
    return {
      predicate: "event_occurred",
      event,
      controller: "self",
      window: "current_turn",
      min_count: 1,
    };
  }

  if (event === "hidden_information_viewed") {
    rejectUnsupportedFields(value, ["predicate", "event", "controller", "window", "min_count", "filters"], `${prefix}_field_unsupported`);
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}_controller_invalid`);
    if (String(value.window || "") !== "current_turn") throw new Error(`${prefix}_window_invalid`);
    if (value.min_count !== 1) throw new Error(`${prefix}_min_count_invalid`);
    const filters = objectRecord(value.filters);
    if (!filters) throw new Error(`${prefix}_filters_required`);
    rejectUnsupportedFields(filters, ["zone"], `${prefix}_filter_unsupported`);
    const zone = String(filters.zone || "");
    if (zone !== "deck_top" && zone !== "deck") throw new Error(`${prefix}_zone_invalid`);
    return {
      predicate: "event_occurred",
      event: "hidden_information_viewed",
      controller: "self",
      window: "current_turn",
      min_count: 1,
      filters: { zone },
    };
  }

  if (event === "damage_prevented") {
    rejectUnsupportedFields(value, ["predicate", "event", "window", "min_count", "filters"], `${prefix}_field_unsupported`);
    if (String(value.window || "") !== "current_turn") throw new Error(`${prefix}_window_invalid`);
    if (value.min_count !== 1) throw new Error(`${prefix}_min_count_invalid`);
    const filters = objectRecord(value.filters);
    if (!filters) throw new Error(`${prefix}_filters_required`);
    rejectUnsupportedFields(filters, ["target", "prevention_kind_any"], `${prefix}_filter_unsupported`);
    if (String(filters.target || "") !== "source_creature") throw new Error(`${prefix}_target_invalid`);
    const kinds = filters.prevention_kind_any;
    if (!Array.isArray(kinds) || kinds.length !== 3 || kinds[0] !== "ability" || kinds[1] !== "relic" || kinds[2] !== "shield") {
      throw new Error(`${prefix}_prevention_kinds_invalid`);
    }
    return {
      predicate: "event_occurred",
      event: "damage_prevented",
      window: "current_turn",
      min_count: 1,
      filters: {
        target: "source_creature",
        prevention_kind_any: ["ability", "relic", "shield"],
      },
    };
  }

  if (event === "essence_moved") {
    rejectUnsupportedFields(value, ["predicate", "event", "controller", "window", "min_count", "filters"], `${prefix}_field_unsupported`);
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}_controller_invalid`);
    if (String(value.window || "") !== "current_turn") throw new Error(`${prefix}_window_invalid`);
    if (value.min_count !== 1) throw new Error(`${prefix}_min_count_invalid`);
    const filters = objectRecord(value.filters);
    if (!filters) throw new Error(`${prefix}_filters_required`);
    rejectUnsupportedFields(filters, ["element"], `${prefix}_filter_unsupported`);
    if (String(filters.element || "") !== "Tide") throw new Error(`${prefix}_element_invalid`);
    return {
      predicate: "event_occurred",
      event: "essence_moved",
      controller: "self",
      window: "current_turn",
      min_count: 1,
      filters: { element: "Tide" },
    };
  }

  throw new Error(`${prefix}_event_unsupported:${event || "missing"}`);
}

function conditionalLeafPredicate(
  rawValue: unknown,
  attackId: string,
  termIndex: number,
  predicatePath: string,
): RuntimeV02ConditionalAddLeafPredicate {
  const value = objectRecord(rawValue);
  if (!value) {
    throw new Error(`tcg_v0_2_attack_conditional_add_predicate_invalid:${attackId}:${termIndex}:${predicatePath}`);
  }
  const predicate = String(value.predicate || "");
  const prefix = `tcg_v0_2_attack_conditional_add_predicate:${attackId}:${termIndex}:${predicatePath}`;

  if (predicate === "event_occurred") {
    return conditionalEventOccurredPredicate(value, attackId, termIndex, predicatePath);
  }
  if (predicate === "source_has_condition") {
    rejectUnsupportedFields(value, ["predicate", "condition"], `${prefix}_field_unsupported`);
    if (String(value.condition || "") !== "Scorched") throw new Error(`${prefix}_condition_invalid`);
    return { predicate: "source_has_condition", condition: "Scorched" };
  }
  if (predicate === "target_has_condition") {
    rejectUnsupportedFields(value, ["predicate", "condition"], `${prefix}_field_unsupported`);
    const condition = String(value.condition || "");
    if (condition !== "Scorched" && condition !== "Venomed" && condition !== "Mindbound") {
      throw new Error(`${prefix}_condition_invalid`);
    }
    return { predicate: "target_has_condition", condition };
  }
  if (predicate === "target_has_any_condition") {
    rejectUnsupportedFields(value, ["predicate"], `${prefix}_field_unsupported`);
    return { predicate: "target_has_any_condition" };
  }
  if (predicate === "source_became_vanguard_this_turn") {
    rejectUnsupportedFields(value, ["predicate"], `${prefix}_field_unsupported`);
    return { predicate: "source_became_vanguard_this_turn" };
  }
  if (predicate === "reserve_count_at_least") {
    rejectUnsupportedFields(value, ["predicate", "controller", "count"], `${prefix}_field_unsupported`);
    if (String(value.controller || "") !== "self") throw new Error(`${prefix}_controller_invalid`);
    if (value.count !== 3) throw new Error(`${prefix}_count_invalid`);
    return { predicate: "reserve_count_at_least", controller: "self", count: 3 };
  }
  if (predicate === "hand_count_at_least") {
    rejectUnsupportedFields(value, ["predicate", "player", "count"], `${prefix}_field_unsupported`);
    if (String(value.player || "") !== "opponent") throw new Error(`${prefix}_player_invalid`);
    if (value.count !== 5) throw new Error(`${prefix}_count_invalid`);
    return { predicate: "hand_count_at_least", player: "opponent", count: 5 };
  }
  if (predicate === "source_has_relic") {
    rejectUnsupportedFields(value, ["predicate"], `${prefix}_field_unsupported`);
    return { predicate: "source_has_relic" };
  }
  if (predicate === "event_attack_source_has_attached_essence_kind") {
    rejectUnsupportedFields(value, ["predicate", "kind"], `${prefix}_field_unsupported`);
    const kind = String(value.kind || "");
    if (kind !== "temporary" && kind !== "borrowed") throw new Error(`${prefix}_kind_invalid`);
    return { predicate: "event_attack_source_has_attached_essence_kind", kind };
  }

  throw new Error(`${prefix}_unsupported:${predicate || "missing"}`);
}

function conditionalWhen(
  rawValue: unknown,
  attackId: string,
  termIndex: number,
): RuntimeV02ConditionalAddWhen {
  const value = objectRecord(rawValue);
  if (!value) throw new Error(`tcg_v0_2_attack_conditional_add_when_invalid:${attackId}:${termIndex}`);

  if (Array.isArray(value.any)) {
    rejectUnsupportedFields(value, ["any"], `tcg_v0_2_attack_conditional_add_when_field_unsupported:${attackId}:${termIndex}`);
    if (value.any.length === 0) throw new Error(`tcg_v0_2_attack_conditional_add_any_empty:${attackId}:${termIndex}`);
    return {
      any: value.any.map((predicate, index) => conditionalLeafPredicate(predicate, attackId, termIndex, `any.${index}`)),
    };
  }

  if ("all" in value || "not" in value) {
    throw new Error(`tcg_v0_2_attack_conditional_add_composition_unsupported:${attackId}:${termIndex}`);
  }
  return conditionalLeafPredicate(value, attackId, termIndex, "leaf");
}

function conditionalAddTerm(
  rawTerm: unknown,
  attackId: string,
  termIndex: number,
): RuntimeV02ConditionalAddTerm {
  const term = objectRecord(rawTerm);
  if (!term) throw new Error(`tcg_v0_2_attack_conditional_add_term_invalid:${attackId}:${termIndex}`);
  rejectUnsupportedFields(
    term,
    ["kind", "amount", "when"],
    `tcg_v0_2_attack_conditional_add_term_field_unsupported:${attackId}:${termIndex}`,
  );
  if (String(term.kind || "") !== "conditional_add") {
    throw new Error(`tcg_v0_2_attack_conditional_add_term_kind_invalid:${attackId}:${termIndex}`);
  }
  return {
    kind: "conditional_add",
    amount: positiveInteger(term.amount, `tcg_v0_2_attack_conditional_add_amount_invalid:${attackId}:${termIndex}`),
    when: conditionalWhen(term.when, attackId, termIndex),
  };
}

/**
 * Normalizes only the conditional_add subset used by the frozen 193-card Set One.
 *
 * This is metadata authority only. It does not evaluate predicates or change
 * attack damage. Predicate support is intentionally restricted to the exact
 * Set One formula vocabulary; unsupported/future shapes fail closed.
 */
export function structuredRuntimeConditionalAddFormulaMetadata(
  value: unknown,
  attackId: string,
): RuntimeV02ConditionalAddFormulaMetadata | null {
  if (value === null || value === undefined) return null;
  const formula = objectRecord(value);
  if (!formula) throw new Error(`tcg_v0_2_attack_conditional_add_formula_invalid:${attackId}`);
  if (!Array.isArray(formula.terms)) {
    throw new Error(`tcg_v0_2_attack_conditional_add_formula_terms_invalid:${attackId}`);
  }

  const indexedTerms = formula.terms
    .map((rawTerm, index) => ({ rawTerm, index, term: objectRecord(rawTerm) }))
    .filter(({ term }) => String(term?.kind || "") === "conditional_add");
  if (indexedTerms.length === 0) return null;

  const snapshot = formula.snapshot == null ? "legal_declaration" : String(formula.snapshot);
  if (snapshot !== "legal_declaration") {
    throw new Error(`tcg_v0_2_attack_conditional_add_snapshot_unsupported:${attackId}:${snapshot}`);
  }

  return {
    snapshot: "legal_declaration",
    terms: indexedTerms.map(({ rawTerm, index }) => conditionalAddTerm(rawTerm, attackId, index)),
  };
}
