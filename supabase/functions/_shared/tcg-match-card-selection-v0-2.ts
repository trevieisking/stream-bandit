import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
export type RuntimeV02CardSelectionZone = "discard";

export type RuntimeV02SelectedCardRef = {
  uid: string;
  card_id: string;
  zone_owner_seat: Seat;
  zone: RuntimeV02CardSelectionZone;
};

export type RuntimeV02SelectCardsDescriptor = {
  player: "self";
  zone: RuntimeV02CardSelectionZone;
  min: number;
  max: number;
  filters: Record<string, unknown>;
  as: string;
};

export type RuntimeV02CardSelectionOption = {
  id: string;
  label: string;
  ref: RuntimeV02SelectedCardRef;
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

function range(raw: unknown): { min: number; max: number } {
  const row = objectRecord(raw);
  if (!row) throw new Error("tcg_v0_2_select_cards_selection_invalid");
  if (Object.keys(row).some((key) => !["min", "max", "filters"].includes(key))) {
    throw new Error("tcg_v0_2_select_cards_selection_field_unsupported");
  }
  const min = Number(row.min);
  const max = Number(row.max);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
    throw new Error("tcg_v0_2_select_cards_count_invalid");
  }
  return { min, max };
}

function player(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!row || !Array.isArray(row.discard)) {
    throw new Error("tcg_v0_2_select_cards_player_invalid");
  }
  return row;
}

function definition(
  state: Record<string, unknown>,
  card: { uid: string; card_id: string },
): Record<string, unknown> {
  const def = runtimeV02Definition(state, card);
  if (!def) throw new Error("tcg_v0_2_select_cards_definition_missing");
  return def;
}

function matchesFilters(
  state: Record<string, unknown>,
  card: { uid: string; card_id: string },
  filters: Record<string, unknown>,
): boolean {
  const unsupported = Object.keys(filters).find((key) =>
    !["card_family", "tactic_subtype", "essence_subtype", "element"].includes(key)
  );
  if (unsupported) {
    throw new Error(`tcg_v0_2_select_cards_filter_unsupported:${unsupported}`);
  }
  const def = definition(state, card);
  if (
    filters.card_family != null &&
    String(def.card_family || "") !== String(filters.card_family)
  ) return false;
  if (
    filters.element != null &&
    String(def.element || "") !== String(filters.element)
  ) return false;
  if (filters.tactic_subtype != null) {
    const tactic = objectRecord(def.tactic);
    const subtype = String(tactic?.subtype || def.tactic_subtype || "");
    if (subtype !== String(filters.tactic_subtype)) return false;
  }
  if (filters.essence_subtype != null) {
    const essence = objectRecord(def.essence);
    const subtype = String(essence?.subtype || def.essence_subtype || "");
    if (subtype !== String(filters.essence_subtype)) return false;
  }
  return true;
}

function discard(
  state: Record<string, unknown>,
  ownerSeat: Seat,
): Array<{ uid: string; card_id: string }> {
  return (player(state, ownerSeat).discard as unknown[]).map((raw, index) => {
    const row = objectRecord(raw);
    if (!row) throw new Error(`tcg_v0_2_select_cards_discard_card_invalid:${index}`);
    return {
      uid: requiredString(row.uid, "tcg_v0_2_select_cards_card_uid_required"),
      card_id: requiredString(
        row.card_id,
        "tcg_v0_2_select_cards_card_id_required",
      ),
    };
  });
}

export function runtimeV02NormalizeSelectCardsStep(
  raw: unknown,
): RuntimeV02SelectCardsDescriptor {
  const step = objectRecord(raw);
  if (!step || step.op !== "SELECT_CARDS") {
    throw new Error("tcg_v0_2_select_cards_step_required");
  }
  const unsupported = Object.keys(step).find((key) =>
    !["op", "player", "zone", "selection", "as"].includes(key)
  );
  if (unsupported) {
    throw new Error(`tcg_v0_2_select_cards_step_field_unsupported:${unsupported}`);
  }
  if (step.player !== "self") {
    throw new Error("tcg_v0_2_select_cards_player_unsupported");
  }
  if (step.zone !== "discard") {
    throw new Error("tcg_v0_2_select_cards_zone_unsupported");
  }
  const selection = objectRecord(step.selection);
  if (!selection) throw new Error("tcg_v0_2_select_cards_selection_invalid");
  const bounds = range(selection);
  const filters = objectRecord(selection.filters) || {};
  // Validate filter grammar even when no cards are currently present.
  const unsupportedFilter = Object.keys(filters).find((key) =>
    !["card_family", "tactic_subtype", "essence_subtype", "element"].includes(key)
  );
  if (unsupportedFilter) {
    throw new Error(
      `tcg_v0_2_select_cards_filter_unsupported:${unsupportedFilter}`,
    );
  }
  return {
    player: "self",
    zone: "discard",
    min: bounds.min,
    max: bounds.max,
    filters: structuredClone(filters),
    as: requiredString(step.as, "tcg_v0_2_select_cards_var_required"),
  };
}

export function runtimeV02CardSelectionOptions(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  descriptor: RuntimeV02SelectCardsDescriptor,
): RuntimeV02CardSelectionOption[] {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_select_cards_controller_invalid",
  );
  return discard(state, controllerSeat)
    .filter((card) => matchesFilters(state, card, descriptor.filters))
    .map((card) => ({
      id: `card:${card.uid}`,
      label: String(definition(state, card).name || card.card_id),
      ref: {
        uid: card.uid,
        card_id: card.card_id,
        zone_owner_seat: controllerSeat,
        zone: descriptor.zone,
      },
    }));
}

export function runtimeV02RebindSelectedCards(
  state: Record<string, unknown>,
  refs: RuntimeV02SelectedCardRef[],
): RuntimeV02SelectedCardRef[] {
  const seen = new Set<string>();
  return refs.map((ref, index) => {
    if (!ref || typeof ref !== "object") {
      throw new Error(`tcg_v0_2_select_cards_ref_invalid:${index}`);
    }
    const ownerSeat = seat(
      ref.zone_owner_seat,
      "tcg_v0_2_select_cards_ref_seat_invalid",
    );
    if (ref.zone !== "discard") {
      throw new Error("tcg_v0_2_select_cards_ref_zone_unsupported");
    }
    const uid = requiredString(ref.uid, "tcg_v0_2_select_cards_ref_uid_required");
    const cardId = requiredString(
      ref.card_id,
      "tcg_v0_2_select_cards_ref_card_id_required",
    );
    if (seen.has(uid)) throw new Error("tcg_v0_2_select_cards_ref_duplicate");
    seen.add(uid);
    const current = discard(state, ownerSeat).find((card) => card.uid === uid);
    if (!current || current.card_id !== cardId) {
      throw new Error("tcg_v0_2_select_cards_card_stale");
    }
    return {
      uid,
      card_id: cardId,
      zone_owner_seat: ownerSeat,
      zone: "discard",
    };
  });
}

export function runtimeV02ResolveSelectCards(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  descriptor: RuntimeV02SelectCardsDescriptor,
  selected: RuntimeV02SelectedCardRef[],
): RuntimeV02SelectedCardRef[] {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_select_cards_controller_invalid",
  );
  if (!Array.isArray(selected)) {
    throw new Error("tcg_v0_2_select_cards_selected_invalid");
  }
  if (selected.length < descriptor.min || selected.length > descriptor.max) {
    throw new Error("tcg_v0_2_select_cards_choice_count_invalid");
  }
  const rebound = runtimeV02RebindSelectedCards(state, selected);
  for (const ref of rebound) {
    if (ref.zone_owner_seat !== controllerSeat) {
      throw new Error("tcg_v0_2_select_cards_owner_changed");
    }
    const current = discard(state, controllerSeat).find((card) =>
      card.uid === ref.uid && card.card_id === ref.card_id
    );
    if (!current || !matchesFilters(state, current, descriptor.filters)) {
      throw new Error("tcg_v0_2_select_cards_filter_stale");
    }
  }
  return rebound;
}
