import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
export type RuntimeV02BoundSetCardRef = { uid: string; card_id: string };

export type RuntimeV02ChooseFromSetDescriptor = {
  source_token: string;
  min: number;
  max: number;
  filters: Record<string, unknown>;
  as: string;
  grammar: "source_range" | "set_selection";
};

export type RuntimeV02BoundDeckSetProvenance = {
  controller_seat: Seat;
  zone_owner_seat: Seat;
  zone: "deck_top";
  cards: RuntimeV02BoundSetCardRef[];
  removed_uids: string[];
};

export type RuntimeV02BoundSetChoiceOption = {
  id: string;
  label: string;
  ref: RuntimeV02BoundSetCardRef;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}

function seat(value: unknown, code: string): Seat {
  if (value === 1 || value === 2) return value;
  throw new Error(code);
}

function runtimeInst(value: unknown, code: string): RuntimeV02BoundSetCardRef {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function player(state: Record<string, unknown>, ownerSeat: Seat): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(ownerSeat)]) : null;
  if (!row || !Array.isArray(row.deck)) {
    throw new Error("tcg_v0_2_bound_set_player_invalid");
  }
  return row;
}

function range(minRaw: unknown, maxRaw: unknown): { min: number; max: number } {
  const min = Number(minRaw);
  const max = Number(maxRaw);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
    throw new Error("tcg_v0_2_choose_from_set_count_invalid");
  }
  return { min, max };
}

function normalizeFlatFilters(
  raw: unknown,
  code: string,
): Record<string, unknown> {
  if (raw == null) return {};
  const row = objectRecord(raw);
  if (!row) throw new Error(code);
  const unsupported = Object.keys(row).find((key) =>
    !["card_family", "element", "tactic_subtype"].includes(key)
  );
  if (unsupported) throw new Error(`${code}:${unsupported}`);
  return structuredClone(row);
}

function normalizeFilters(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  const row = objectRecord(raw);
  if (!row) throw new Error("tcg_v0_2_choose_from_set_filters_invalid");
  const keys = Object.keys(row);
  if (keys.length === 1 && keys[0] === "any") {
    if (!Array.isArray(row.any) || row.any.length < 1) {
      throw new Error("tcg_v0_2_choose_from_set_filters_any_invalid");
    }
    return {
      any: row.any.map((item, index) =>
        normalizeFlatFilters(
          item,
          `tcg_v0_2_choose_from_set_filter_any_unsupported:${index}`,
        )
      ),
    };
  }
  return normalizeFlatFilters(
    row,
    "tcg_v0_2_choose_from_set_filter_unsupported",
  );
}

function definition(
  state: Record<string, unknown>,
  card: RuntimeV02BoundSetCardRef,
): Record<string, unknown> {
  const def = runtimeV02Definition(state, card);
  if (!def) throw new Error("tcg_v0_2_choose_from_set_definition_missing");
  return def;
}

function matchesFlatFilter(
  state: Record<string, unknown>,
  card: RuntimeV02BoundSetCardRef,
  filter: Record<string, unknown>,
): boolean {
  const def = definition(state, card);
  if (
    filter.card_family != null &&
    String(def.card_family || "") !== String(filter.card_family)
  ) return false;
  if (
    filter.element != null &&
    String(def.element || "") !== String(filter.element)
  ) return false;
  if (filter.tactic_subtype != null) {
    const tactic = objectRecord(def.tactic);
    if (String(tactic?.subtype || "") !== String(filter.tactic_subtype)) {
      return false;
    }
  }
  return true;
}

function matchesFilters(
  state: Record<string, unknown>,
  card: RuntimeV02BoundSetCardRef,
  filters: Record<string, unknown>,
): boolean {
  if (Array.isArray(filters.any)) {
    return filters.any.some((item) =>
      matchesFlatFilter(
        state,
        card,
        objectRecord(item) || {},
      )
    );
  }
  return matchesFlatFilter(state, card, filters);
}

function sameCard(
  left: RuntimeV02BoundSetCardRef,
  right: RuntimeV02BoundSetCardRef,
): boolean {
  return left.uid === right.uid && left.card_id === right.card_id;
}

export function runtimeV02NormalizeChooseFromSetStep(
  raw: unknown,
): RuntimeV02ChooseFromSetDescriptor {
  const step = objectRecord(raw);
  if (!step || step.op !== "CHOOSE_FROM_SET") {
    throw new Error("tcg_v0_2_choose_from_set_step_required");
  }
  const variable = requiredString(
    step.as,
    "tcg_v0_2_choose_from_set_variable_required",
  );

  if (step.source != null) {
    const unsupported = Object.keys(step).find((key) =>
      !["op", "source", "min", "max", "filters", "as"].includes(key)
    );
    if (unsupported) {
      throw new Error(
        `tcg_v0_2_choose_from_set_source_field_unsupported:${unsupported}`,
      );
    }
    const source = requiredString(
      step.source,
      "tcg_v0_2_choose_from_set_source_required",
    );
    if (!source.startsWith("$")) {
      throw new Error("tcg_v0_2_choose_from_set_source_variable_required");
    }
    const bounds = range(step.min, step.max);
    return {
      source_token: source.slice(1),
      min: bounds.min,
      max: bounds.max,
      filters: normalizeFilters(step.filters),
      as: variable,
      grammar: "source_range",
    };
  }

  const unsupported = Object.keys(step).find((key) =>
    !["op", "player", "set", "selection", "as"].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_choose_from_set_selection_field_unsupported:${unsupported}`,
    );
  }
  if (step.player !== "self") {
    throw new Error("tcg_v0_2_choose_from_set_player_unsupported");
  }
  const source = requiredString(
    step.set,
    "tcg_v0_2_choose_from_set_set_required",
  );
  if (!source.startsWith("$")) {
    throw new Error("tcg_v0_2_choose_from_set_set_variable_required");
  }
  const selection = objectRecord(step.selection);
  if (!selection) {
    throw new Error("tcg_v0_2_choose_from_set_selection_required");
  }
  const selectionUnsupported = Object.keys(selection).find((key) =>
    !["min", "max", "filters"].includes(key)
  );
  if (selectionUnsupported) {
    throw new Error(
      `tcg_v0_2_choose_from_set_selection_option_unsupported:${selectionUnsupported}`,
    );
  }
  const bounds = range(selection.min, selection.max);
  return {
    source_token: source.slice(1),
    min: bounds.min,
    max: bounds.max,
    filters: normalizeFilters(selection.filters),
    as: variable,
    grammar: "set_selection",
  };
}

export function runtimeV02BindDeckTopSet(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  zoneOwnerSeatRaw: number,
  countRaw: number,
): {
  cards: RuntimeV02BoundSetCardRef[];
  provenance: RuntimeV02BoundDeckSetProvenance;
} {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_bound_set_controller_invalid",
  );
  const zoneOwnerSeat = seat(
    zoneOwnerSeatRaw,
    "tcg_v0_2_bound_set_owner_invalid",
  );
  const count = Number(countRaw);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_bound_set_count_invalid");
  }
  const deck = player(state, zoneOwnerSeat).deck as unknown[];
  const cards = deck.slice(0, Math.min(count, deck.length)).map((raw, index) =>
    runtimeInst(raw, `tcg_v0_2_bound_set_deck_card_invalid:${index}`)
  );
  if (new Set(cards.map((card) => card.uid)).size !== cards.length) {
    throw new Error("tcg_v0_2_bound_set_uid_duplicate");
  }
  if (cards.length > 0) {
    recordRuntimeV02HiddenInformationView(state, controllerSeat, "deck_top");
  }
  return {
    cards: cards.map((card) => ({ ...card })),
    provenance: {
      controller_seat: controllerSeat,
      zone_owner_seat: zoneOwnerSeat,
      zone: "deck_top",
      cards: cards.map((card) => ({ ...card })),
      removed_uids: [],
    },
  };
}

export function runtimeV02NormalizeBoundDeckSetProvenance(
  raw: unknown,
): RuntimeV02BoundDeckSetProvenance {
  const row = objectRecord(raw);
  if (!row) throw new Error("tcg_v0_2_bound_set_provenance_invalid");
  const unsupported = Object.keys(row).find((key) =>
    ![
      "controller_seat",
      "zone_owner_seat",
      "zone",
      "cards",
      "removed_uids",
    ].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_bound_set_provenance_field_unsupported:${unsupported}`,
    );
  }
  const controller = seat(
    row.controller_seat,
    "tcg_v0_2_bound_set_provenance_controller_invalid",
  );
  const owner = seat(
    row.zone_owner_seat,
    "tcg_v0_2_bound_set_provenance_owner_invalid",
  );
  if (
    row.zone !== "deck_top" ||
    !Array.isArray(row.cards) ||
    !Array.isArray(row.removed_uids)
  ) throw new Error("tcg_v0_2_bound_set_provenance_shape_invalid");
  const cards = row.cards.map((value, index) =>
    runtimeInst(value, `tcg_v0_2_bound_set_provenance_card_invalid:${index}`)
  );
  if (new Set(cards.map((card) => card.uid)).size !== cards.length) {
    throw new Error("tcg_v0_2_bound_set_provenance_card_duplicate");
  }
  const removed = row.removed_uids.map((value, index) =>
    requiredString(
      value,
      `tcg_v0_2_bound_set_provenance_removed_uid_invalid:${index}`,
    )
  );
  if (
    new Set(removed).size !== removed.length ||
    removed.some((uid) => !cards.some((card) => card.uid === uid))
  ) {
    throw new Error("tcg_v0_2_bound_set_provenance_removed_invalid");
  }
  return {
    controller_seat: controller,
    zone_owner_seat: owner,
    zone: "deck_top",
    cards: cards.map((card) => ({ ...card })),
    removed_uids: [...removed],
  };
}

export function runtimeV02RebindBoundDeckSet(
  state: Record<string, unknown>,
  raw: unknown,
): RuntimeV02BoundSetCardRef[] {
  const provenance = runtimeV02NormalizeBoundDeckSetProvenance(raw);
  const removed = new Set(provenance.removed_uids);
  const expected = provenance.cards.filter((card) => !removed.has(card.uid));
  const deck = player(state, provenance.zone_owner_seat).deck as unknown[];
  if (deck.length < expected.length) {
    throw new Error("tcg_v0_2_bound_set_deck_top_changed");
  }
  const current = deck.slice(0, expected.length).map((rawCard, index) =>
    runtimeInst(rawCard, `tcg_v0_2_bound_set_current_card_invalid:${index}`)
  );
  for (let index = 0; index < expected.length; index += 1) {
    if (!sameCard(current[index], expected[index])) {
      throw new Error("tcg_v0_2_bound_set_deck_top_changed");
    }
  }
  return current.map((card) => ({ ...card }));
}

export function runtimeV02BoundDeckSetAfterRemoval(
  raw: unknown,
  removedUids: string[],
): RuntimeV02BoundDeckSetProvenance {
  const provenance = runtimeV02NormalizeBoundDeckSetProvenance(raw);
  if (!Array.isArray(removedUids)) {
    throw new Error("tcg_v0_2_bound_set_removed_uids_invalid");
  }
  const next = [...provenance.removed_uids];
  for (const value of removedUids) {
    const uid = requiredString(
      value,
      "tcg_v0_2_bound_set_removed_uid_invalid",
    );
    if (!provenance.cards.some((card) => card.uid === uid)) {
      throw new Error("tcg_v0_2_bound_set_removed_uid_outside_set");
    }
    if (!next.includes(uid)) next.push(uid);
  }
  return { ...provenance, removed_uids: next };
}

export function runtimeV02BoundSetChoiceOptions(
  state: Record<string, unknown>,
  descriptor: RuntimeV02ChooseFromSetDescriptor,
  source: RuntimeV02BoundSetCardRef[],
): RuntimeV02BoundSetChoiceOption[] {
  if (!Array.isArray(source)) {
    throw new Error("tcg_v0_2_choose_from_set_source_invalid");
  }
  const cards = source.map((card, index) =>
    runtimeInst(card, `tcg_v0_2_choose_from_set_source_card_invalid:${index}`)
  );
  return cards
    .filter((card) => matchesFilters(state, card, descriptor.filters))
    .map((card) => ({
      id: `card:${card.uid}`,
      label: String(definition(state, card).name || card.card_id),
      ref: { ...card },
    }));
}

export function runtimeV02ResolveBoundSetChoice(
  state: Record<string, unknown>,
  descriptor: RuntimeV02ChooseFromSetDescriptor,
  source: RuntimeV02BoundSetCardRef[],
  selected: RuntimeV02BoundSetCardRef[],
): RuntimeV02BoundSetCardRef[] {
  if (!Array.isArray(selected)) {
    throw new Error("tcg_v0_2_choose_from_set_selected_invalid");
  }
  if (
    selected.length < descriptor.min ||
    selected.length > descriptor.max ||
    new Set(selected.map((card) => card.uid)).size !== selected.length
  ) {
    throw new Error("tcg_v0_2_choose_from_set_choice_count_invalid");
  }
  const normalizedSource = source.map((card, index) =>
    runtimeInst(card, `tcg_v0_2_choose_from_set_source_card_invalid:${index}`)
  );
  return selected.map((raw, index) => {
    const card = runtimeInst(
      raw,
      `tcg_v0_2_choose_from_set_selected_card_invalid:${index}`,
    );
    const current = normalizedSource.find((candidate) =>
      candidate.uid === card.uid && candidate.card_id === card.card_id
    );
    if (!current) {
      throw new Error("tcg_v0_2_choose_from_set_selected_stale");
    }
    if (!matchesFilters(state, current, descriptor.filters)) {
      throw new Error("tcg_v0_2_choose_from_set_selected_filter_stale");
    }
    return { ...current };
  });
}
