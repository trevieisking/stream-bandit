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
