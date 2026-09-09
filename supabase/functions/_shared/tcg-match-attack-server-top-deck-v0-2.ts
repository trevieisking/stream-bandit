import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackServerTopDeckConditionalMoveDescriptor = {
  attack_id: string;
  phase: "after_damage";
  inspect: {
    player: "self";
    zone: "deck_top";
    min: 1;
    max: 1;
    visibility: "server_only";
    return_policy: "same_position";
  };
  match_filters: { element: string };
  destination: "hand";
};

export type RuntimeV02AttackServerTopDeckConditionalMoveResolution = {
  attack_id: string;
  inspected_count: 0 | 1;
  matched: boolean;
  moved_count: 0 | 1;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const accepted = new Set(allowed);
  const extra = Object.keys(value).find((key) => !accepted.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function playerForSeat(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_attack_server_top_deck_player_missing");
  if (!Array.isArray(player.deck) || !Array.isArray(player.hand)) {
    throw new Error("tcg_v0_2_attack_server_top_deck_player_zones_invalid");
  }
  return player;
}

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  const vanguard = objectRecord(player.vanguard);
  if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_server_top_deck_source_vanguard_missing");
  }
  return runtimeInst(
    vanguard.stack[vanguard.stack.length - 1],
    "tcg_v0_2_attack_server_top_deck_source_top_invalid",
  );
}

function assertSameInst(actual: RuntimeInst, expected: RuntimeInst, error: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(error);
}

/**
 * Recognizes exactly the deterministic server-only after-damage family:
 * inspect own top card in place -> IF card_matches(element) -> move that card to hand.
 *
 * This is intentionally narrower than generic INSPECT_ZONE / IF / card_matches
 * interpreter parity and contains no Set One card identity.
 */
export function structuredRuntimeAfterDamageServerTopDeckConditionalMove(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackServerTopDeckConditionalMoveDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_server_top_deck_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_server_top_deck_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_server_top_deck_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_server_top_deck_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_server_top_deck_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_server_top_deck_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 2) return null;

  const inspect = objectRecord(attack.after_damage[0]);
  const conditional = objectRecord(attack.after_damage[1]);
  if (String(inspect?.op || "") !== "INSPECT_ZONE" || String(conditional?.op || "") !== "IF") return null;
  if (String(inspect?.zone || "") !== "deck_top") return null;

  rejectUnsupportedFields(
    inspect!,
    ["op", "player", "zone", "selection", "visibility", "return_policy", "as"],
    `tcg_v0_2_attack_server_top_deck_inspect_field_unsupported:${attackId}`,
  );
  if (
    String(inspect!.player || "") !== "self" ||
    String(inspect!.visibility || "") !== "server_only" ||
    String(inspect!.return_policy || "") !== "same_position"
  ) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_inspect_shape_unsupported:${attackId}`);
  }
  const inspectedVar = requiredString(
    inspect!.as,
    `tcg_v0_2_attack_server_top_deck_inspect_variable_required:${attackId}`,
  );
  const selection = objectRecord(inspect!.selection);
  if (!selection) throw new Error(`tcg_v0_2_attack_server_top_deck_selection_required:${attackId}`);
  rejectUnsupportedFields(
    selection,
    ["min", "max", "filters"],
    `tcg_v0_2_attack_server_top_deck_selection_field_unsupported:${attackId}`,
  );
  if (Number(selection.min) !== 1 || Number(selection.max) !== 1) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_selection_bounds_unsupported:${attackId}`);
  }
  const inspectFilters = objectRecord(selection.filters);
  if (!inspectFilters || Object.keys(inspectFilters).length !== 0) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_selection_filters_unsupported:${attackId}`);
  }

  rejectUnsupportedFields(
    conditional!,
    ["op", "when", "then"],
    `tcg_v0_2_attack_server_top_deck_if_field_unsupported:${attackId}`,
  );
  const when = objectRecord(conditional!.when);
  if (!when) throw new Error(`tcg_v0_2_attack_server_top_deck_if_when_required:${attackId}`);
  rejectUnsupportedFields(
    when,
    ["predicate", "card", "filters"],
    `tcg_v0_2_attack_server_top_deck_predicate_field_unsupported:${attackId}`,
  );
  if (
    String(when.predicate || "") !== "card_matches" ||
    String(when.card || "") !== `$${inspectedVar}`
  ) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_predicate_shape_unsupported:${attackId}`);
  }
  const matchFilters = objectRecord(when.filters);
  if (!matchFilters) throw new Error(`tcg_v0_2_attack_server_top_deck_match_filters_required:${attackId}`);
  rejectUnsupportedFields(
    matchFilters,
    ["element"],
    `tcg_v0_2_attack_server_top_deck_match_filter_unsupported:${attackId}`,
  );
  const element = requiredString(
    matchFilters.element,
    `tcg_v0_2_attack_server_top_deck_match_element_required:${attackId}`,
  );

  if (!Array.isArray(conditional!.then) || conditional!.then.length !== 1) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_then_shape_unsupported:${attackId}`);
  }
  const move = objectRecord(conditional!.then[0]);
  if (!move || String(move.op || "") !== "MOVE_CARDS") {
    throw new Error(`tcg_v0_2_attack_server_top_deck_move_required:${attackId}`);
  }
  rejectUnsupportedFields(
    move,
    ["op", "player", "cards", "to"],
    `tcg_v0_2_attack_server_top_deck_move_field_unsupported:${attackId}`,
  );
  if (
    String(move.player || "") !== "self" ||
    String(move.cards || "") !== `$${inspectedVar}` ||
    String(move.to || "") !== "hand"
  ) {
    throw new Error(`tcg_v0_2_attack_server_top_deck_move_shape_unsupported:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    inspect: {
      player: "self",
      zone: "deck_top",
      min: 1,
      max: 1,
      visibility: "server_only",
      return_policy: "same_position",
    },
    match_filters: { element },
    destination: "hand",
  };
}

export function runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackServerTopDeckConditionalMoveDescriptor,
  sourceInstance: unknown,
): RuntimeV02AttackServerTopDeckConditionalMoveResolution {
  if (descriptor.phase !== "after_damage") throw new Error("tcg_v0_2_attack_server_top_deck_phase_unsupported");
  if (
    descriptor.inspect.player !== "self" || descriptor.inspect.zone !== "deck_top" ||
    descriptor.inspect.min !== 1 || descriptor.inspect.max !== 1 ||
    descriptor.inspect.visibility !== "server_only" ||
    descriptor.inspect.return_policy !== "same_position" || descriptor.destination !== "hand"
  ) {
    throw new Error("tcg_v0_2_attack_server_top_deck_descriptor_invalid");
  }
  if (state.active_seat !== seat) throw new Error("tcg_v0_2_attack_server_top_deck_active_seat_mismatch");

  const player = playerForSeat(state, seat);
  const source = runtimeInst(sourceInstance, "tcg_v0_2_attack_server_top_deck_source_identity_invalid");
  assertSameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_server_top_deck_source_vanguard_changed",
  );

  const deck = player.deck as unknown[];
  const hand = player.hand as unknown[];
  if (deck.length === 0) {
    return { attack_id: descriptor.attack_id, inspected_count: 0, matched: false, moved_count: 0 };
  }

  const topCard = runtimeInst(deck[0], "tcg_v0_2_attack_server_top_deck_top_card_invalid");
  const topDefinition = runtimeV02Definition(state, topCard);
  if (!topDefinition) throw new Error("tcg_v0_2_attack_server_top_deck_top_definition_required");
  const matched = String(topDefinition.element || "") === descriptor.match_filters.element;
  if (matched) hand.push(deck.shift());
  return {
    attack_id: descriptor.attack_id,
    inspected_count: 1,
    matched,
    moved_count: matched ? 1 : 0,
  };
}
