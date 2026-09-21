import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02EvaluateActiveAbilityIf } from "./tcg-match-active-ability-if-v0-2.ts";
import {
  applyRuntimeV02EssenceTransfer,
  type RuntimeV02EssenceMovement,
} from "./tcg-match-essence-movement-v0-2.ts";
import {
  applyRuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

type Creature = {
  stack: Inst[];
  essence: Inst[];
  relic: Inst | null;
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
};

type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Creature;
  top: Inst;
  def: Record<string, unknown>;
};

export type RuntimeV02ActiveAbilityEssenceRedistributionDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  move: {
    element: string;
    min: number;
    max: number;
    source_zone: "field";
    destination_zone: "field";
    require_destination_different_creature: true;
    as: string;
  };
  when: {
    predicate: "essence_move_count_at_least";
    moves: string;
    count: number;
  };
  heal: {
    target_element: string;
    target_damaged: true;
    participated_in_moves: string;
    as: string;
    amount: number;
  };
};

export type RuntimeV02ActiveAbilityEssenceRedistributionMoveOption = {
  id: string;
  kind: "move";
  label: string;
  essence_uid: string;
  essence_card_id: string;
  source_anchor_uid: string;
  source_card_id: string;
  source_where: FieldWhere;
  source_index: number | null;
  destination_anchor_uid: string;
  destination_card_id: string;
  destination_where: FieldWhere;
  destination_index: number | null;
};

export type RuntimeV02ActiveAbilityEssenceRedistributionHealOption = {
  id: string;
  kind: "heal_target";
  label: string;
  anchor_uid: string;
  card_id: string;
  where: FieldWhere;
  index: number | null;
};

export type RuntimeV02PendingActiveAbilityEssenceRedistributionChoice = {
  id: string;
  seat: Seat;
  kind: "redistribute_attached_essence_then_conditional_heal";
  ability_id: string;
  prompt: string;
  min: 0;
  max: number;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  move_element: string;
  move_min: number;
  move_max: number;
  move_var: string;
  when: RuntimeV02ActiveAbilityEssenceRedistributionDescriptor["when"];
  heal: RuntimeV02ActiveAbilityEssenceRedistributionDescriptor["heal"];
  move_options: RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[];
  heal_options: RuntimeV02ActiveAbilityEssenceRedistributionHealOption[];
};

export type RuntimeV02ActiveAbilityEssenceRedistributionResolution = {
  kind: "redistribute_attached_essence_then_conditional_heal";
  ability_id: string;
  choice_id: string;
  movement_count: number;
  movement_receipts: RuntimeV02EssenceMovement[];
  if_matched: boolean;
  heal_target_uid: string | null;
  requested_heal: number;
  actual_heal: number;
  emitted_packet_ids: string[];
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

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_ability_redistribution_turn_invalid");
  }
  return turn;
}

function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(seat)]) : null;
  if (!row || !Array.isArray(row.reserve)) {
    throw new Error("tcg_v0_2_active_ability_redistribution_player_invalid");
  }
  return row;
}

function inst(value: unknown, code: string): Inst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function creature(value: unknown, code: string): Creature {
  const row = objectRecord(value);
  if (
    !row ||
    !Array.isArray(row.stack) ||
    row.stack.length < 1 ||
    !Array.isArray(row.essence)
  ) throw new Error(code);
  const damage = Number(row.damage ?? 0);
  const shield = Number(row.shield ?? 0);
  if (!Number.isFinite(damage) || damage < 0 || !Number.isFinite(shield) || shield < 0) {
    throw new Error(`${code}:state`);
  }
  return row as unknown as Creature;
}

function top(cr: Creature, code: string): Inst {
  return inst(cr.stack[cr.stack.length - 1], code);
}

function definition(
  state: Record<string, unknown>,
  value: Inst | string,
): Record<string, unknown> {
  const result = runtimeV02Definition(state, value);
  if (!result) {
    throw new Error("tcg_v0_2_active_ability_redistribution_definition_missing");
  }
  return result;
}

function fields(state: Record<string, unknown>, seat: Seat): Field[] {
  const own = player(state, seat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0, 1, 2, 3].map((index) =>
      ["reserve", index, (own.reserve as unknown[])[index]] as [FieldWhere, number, unknown]
    ),
  ];
  return rows.flatMap(([where, index, raw]) => {
    if (raw == null) return [];
    const cr = creature(
      raw,
      "tcg_v0_2_active_ability_redistribution_field_creature_invalid",
    );
    const card = top(
      cr,
      "tcg_v0_2_active_ability_redistribution_field_top_invalid",
    );
    return [{
      where,
      index,
      creature: cr,
      top: card,
      def: definition(state, card),
    }];
  });
}

function fieldByAnchor(
  state: Record<string, unknown>,
  seat: Seat,
  anchorUid: string,
): Field | null {
  return fields(state, seat).find((field) => field.top.uid === anchorUid) || null;
}

function sourceTop(
  state: Record<string, unknown>,
  seat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const field = fields(state, seat).find((candidate) =>
    candidate.where === where &&
    (where === "vanguard" || candidate.index === index)
  );
  if (!field) {
    throw new Error("tcg_v0_2_active_ability_redistribution_source_missing");
  }
  return field.top;
}

function same(actual: Inst, expected: Inst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error(code);
  }
}

function exactLimit(raw: unknown, abilityId: string) {
  const limit = objectRecord(raw);
  if (
    !limit ||
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) {
    throw new Error(
      `tcg_v0_2_active_ability_redistribution_limit_unsupported:${abilityId}`,
    );
  }
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}

function exactRange(raw: unknown, code: string): { min: number; max: number } {
  const range = objectRecord(raw);
  if (!range) throw new Error(code);
  const min = Number(range.min);
  const max = Number(range.max);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min
  ) throw new Error(code);
  return { min, max };
}

function essenceElement(
  state: Record<string, unknown>,
  value: Inst,
): string {
  const def = definition(state, value);
  if (String(def.card_family || "") !== "Essence") {
    throw new Error("tcg_v0_2_active_ability_redistribution_attachment_not_essence");
  }
  return requiredString(
    def.element,
    "tcg_v0_2_active_ability_redistribution_essence_element_required",
  );
}

function fieldLabel(field: Field): string {
  return field.where === "vanguard"
    ? "Vanguard"
    : `Reserve ${Number(field.index) + 1}`;
}

function legalMoveOptions(
  state: Record<string, unknown>,
  seat: Seat,
  element: string,
): RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[] {
  const current = fields(state, seat);
  const out: RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[] = [];
  for (const source of current) {
    for (const rawEssence of source.creature.essence) {
      const essence = inst(
        rawEssence,
        "tcg_v0_2_active_ability_redistribution_essence_invalid",
      );
      if (essenceElement(state, essence) !== element) continue;
      for (const destination of current) {
        if (destination.top.uid === source.top.uid) continue;
        out.push({
          id: `move:${essence.uid}:${source.top.uid}:${destination.top.uid}`,
          kind: "move",
          label: `Move ${String(definition(state, essence).name || essence.card_id)}: ${fieldLabel(source)} -> ${fieldLabel(destination)}`,
          essence_uid: essence.uid,
          essence_card_id: essence.card_id,
          source_anchor_uid: source.top.uid,
          source_card_id: source.top.card_id,
          source_where: source.where,
          source_index: source.index,
          destination_anchor_uid: destination.top.uid,
          destination_card_id: destination.top.card_id,
          destination_where: destination.where,
          destination_index: destination.index,
        });
      }
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function legalHealOptions(
  state: Record<string, unknown>,
  seat: Seat,
  element: string,
): RuntimeV02ActiveAbilityEssenceRedistributionHealOption[] {
  return fields(state, seat)
    .filter((field) =>
      String(field.def.element || "") === element &&
      Number(field.creature.damage || 0) > 0
    )
    .map((field) => ({
      id: `heal:${field.top.uid}`,
      kind: "heal_target" as const,
      label: `Heal ${fieldLabel(field)}`,
      anchor_uid: field.top.uid,
      card_id: field.top.card_id,
      where: field.where,
      index: field.index,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function movementParticipants(
  moves: RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[],
): Set<string> {
  return new Set(
    moves.flatMap((move) => [
      move.source_anchor_uid,
      move.destination_anchor_uid,
    ]),
  );
}

function preflightMoves(
  state: Record<string, unknown>,
  seat: Seat,
  moves: RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[],
  sourceActionId: string,
): void {
  const probe = structuredClone(state);
  for (const move of moves) {
    const source = fieldByAnchor(probe, seat, move.source_anchor_uid);
    const destination = fieldByAnchor(probe, seat, move.destination_anchor_uid);
    if (!source || !destination) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_move_field_changed",
      );
    }
    same(
      source.top,
      { uid: move.source_anchor_uid, card_id: move.source_card_id },
      "tcg_v0_2_active_ability_redistribution_move_source_changed",
    );
    same(
      destination.top,
      {
        uid: move.destination_anchor_uid,
        card_id: move.destination_card_id,
      },
      "tcg_v0_2_active_ability_redistribution_move_destination_changed",
    );
    applyRuntimeV02EssenceTransfer(
      probe,
      seat,
      move.source_anchor_uid,
      move.destination_anchor_uid,
      source.creature.essence,
      destination.creature.essence,
      move.essence_uid,
      sourceActionId,
    );
  }
}

export function structuredRuntimeActiveAbilityEssenceRedistribution(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityEssenceRedistributionDescriptor | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creatureDef = objectRecord(def.creature);
  const ability = objectRecord(creatureDef?.ability);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") return null;
  if (!Array.isArray(ability.requirements) || ability.requirements.length !== 0) return null;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;

  const steps = Array.isArray(ability.steps) ? ability.steps.map(objectRecord) : [];
  if (steps.length !== 2 || steps.some((step) => !step)) return null;
  const move = steps[0]!;
  const conditional = steps[1]!;
  if (
    move.op !== "MOVE_ATTACHED_ESSENCE" ||
    move.controller !== "self" ||
    typeof move.element !== "string" ||
    !move.element ||
    move.require_destination_different_creature !== true
  ) return null;
  const count = exactRange(
    move.count,
    "tcg_v0_2_active_ability_redistribution_move_count_invalid",
  );
  const sourceSelector = objectRecord(move.source_selector);
  const destinationSelector = objectRecord(move.destination_selector);
  const sourceFilters = objectRecord(sourceSelector?.filters);
  const destinationFilters = objectRecord(destinationSelector?.filters);
  if (
    sourceSelector?.zone !== "field" ||
    destinationSelector?.zone !== "field" ||
    sourceFilters?.card_family !== "Creature" ||
    destinationFilters?.card_family !== "Creature"
  ) return null;
  const moveVar = requiredString(
    move.as,
    "tcg_v0_2_active_ability_redistribution_move_var_required",
  );

  if (conditional.op !== "IF" || conditional.else != null) return null;
  const when = objectRecord(conditional.when);
  const then = Array.isArray(conditional.then) ? conditional.then.map(objectRecord) : [];
  if (
    !when ||
    when.predicate !== "essence_move_count_at_least" ||
    String(when.moves || "") !== `$${moveVar}` ||
    !Number.isInteger(Number(when.count)) ||
    Number(when.count) < 1 ||
    then.length !== 2 ||
    !then[0] ||
    !then[1]
  ) return null;
  const select = then[0]!;
  const heal = then[1]!;
  if (
    select.op !== "SELECT_CREATURE" ||
    select.controller !== "self" ||
    select.zone !== "field" ||
    Number(select.count) !== 1
  ) return null;
  const healFilters = objectRecord(select.filters);
  if (
    !healFilters ||
    typeof healFilters.element !== "string" ||
    !healFilters.element ||
    healFilters.damaged !== true ||
    String(healFilters.participated_in_moves || "") !== `$${moveVar}`
  ) return null;
  const healVar = requiredString(
    select.as,
    "tcg_v0_2_active_ability_redistribution_heal_var_required",
  );
  if (
    heal.op !== "HEAL" ||
    String(heal.target || "") !== `$${healVar}`
  ) return null;
  const amount = Number(heal.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_heal_amount_invalid",
    );
  }

  return {
    ability_id: requiredString(
      ability.id,
      "tcg_v0_2_active_ability_redistribution_id_required",
    ),
    timing: "own_turn",
    limit: exactLimit(ability.limit, String(ability.id || "")),
    move: {
      element: String(move.element),
      min: count.min,
      max: count.max,
      source_zone: "field",
      destination_zone: "field",
      require_destination_different_creature: true,
      as: moveVar,
    },
    when: {
      predicate: "essence_move_count_at_least",
      moves: `$${moveVar}`,
      count: Number(when.count),
    },
    heal: {
      target_element: String(healFilters.element),
      target_damaged: true,
      participated_in_moves: `$${moveVar}`,
      as: healVar,
      amount,
    },
  };
}

export function runtimeV02CreateActiveAbilityEssenceRedistributionChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilityEssenceRedistributionDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityEssenceRedistributionChoice {
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_not_active_seat",
    );
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) >= descriptor.limit.count
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_limit_reached",
    );
  }
  const sourceInstance = inst(
    source.instance,
    "tcg_v0_2_active_ability_redistribution_source_invalid",
  );
  same(
    sourceTop(state, controllerSeat, source.where, source.index),
    sourceInstance,
    "tcg_v0_2_active_ability_redistribution_source_changed",
  );

  const moveOptions = legalMoveOptions(
    state,
    controllerSeat,
    descriptor.move.element,
  );
  const healOptions = legalHealOptions(
    state,
    controllerSeat,
    descriptor.heal.target_element,
  );

  return {
    id: requiredString(
      choiceId,
      "tcg_v0_2_active_ability_redistribution_choice_id_required",
    ),
    seat: controllerSeat,
    kind: "redistribute_attached_essence_then_conditional_heal",
    ability_id: descriptor.ability_id,
    prompt: "Choose up to the allowed Essence moves; if the threshold is met, also choose one eligible participating Creature to heal",
    min: descriptor.move.min,
    max: descriptor.move.max + 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceInstance.uid,
    source_card_id: sourceInstance.card_id,
    move_element: descriptor.move.element,
    move_min: descriptor.move.min,
    move_max: descriptor.move.max,
    move_var: descriptor.move.as,
    when: structuredClone(descriptor.when),
    heal: structuredClone(descriptor.heal),
    move_options: moveOptions,
    heal_options: healOptions,
  };
}

export function runtimeV02PendingActiveAbilityEssenceRedistributionChoiceView(
  choice: RuntimeV02PendingActiveAbilityEssenceRedistributionChoice | null | undefined,
  viewerSeat: Seat,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return {
      id: choice.id,
      seat: choice.seat,
      kind: choice.kind,
      waiting: true,
    };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: [
      ...choice.move_options.map((option) => ({
        id: option.id,
        label: option.label,
        kind: option.kind,
      })),
      ...choice.heal_options.map((option) => ({
        id: option.id,
        label: option.label,
        kind: option.kind,
      })),
    ],
  };
}

export function runtimeV02ResolveActiveAbilityEssenceRedistributionChoice(
  choice: RuntimeV02PendingActiveAbilityEssenceRedistributionChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityEssenceRedistributionResolution {
  if (choice.kind !== "redistribute_attached_essence_then_conditional_heal") {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_choice_kind_invalid",
    );
  }
  if (choice.seat !== controllerSeat) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_choice_not_yours",
    );
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_choice_stale_id",
    );
  }
  if (
    !Array.isArray(choiceIds) ||
    new Set(choiceIds).size !== choiceIds.length
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_choice_ids_invalid",
    );
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_turn_changed",
    );
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_active_seat_changed",
    );
  }
  same(
    sourceTop(
      state,
      controllerSeat,
      choice.source_where,
      choice.source_index,
    ),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_active_ability_redistribution_source_changed",
  );

  const moveById = new Map(choice.move_options.map((option) => [option.id, option]));
  const healById = new Map(choice.heal_options.map((option) => [option.id, option]));
  const selectedMoves = choiceIds
    .map((id) => moveById.get(id))
    .filter((option): option is RuntimeV02ActiveAbilityEssenceRedistributionMoveOption => Boolean(option))
    .sort((a, b) => a.id.localeCompare(b.id));
  const selectedHeals = choiceIds
    .map((id) => healById.get(id))
    .filter((option): option is RuntimeV02ActiveAbilityEssenceRedistributionHealOption => Boolean(option));

  if (selectedMoves.length + selectedHeals.length !== choiceIds.length) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_unknown_option",
    );
  }
  const threshold = Number(choice.when.count);
  if (
    selectedMoves.length < choice.move_min ||
    selectedMoves.length > choice.move_max ||
    selectedHeals.length > 1
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_choice_shape_invalid",
    );
  }
  if (new Set(selectedMoves.map((move) => move.essence_uid)).size !== selectedMoves.length) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_essence_reused",
    );
  }

  const thresholdMatched = selectedMoves.length >= threshold;
  if (!thresholdMatched && selectedHeals.length !== 0) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_heal_without_threshold",
    );
  }

  const participants = movementParticipants(selectedMoves);
  if (thresholdMatched) {
    if (selectedHeals.length !== 1) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_heal_target_required",
      );
    }
    const heal = selectedHeals[0];
    if (!participants.has(heal.anchor_uid)) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_heal_target_not_participant",
      );
    }
    const current = fieldByAnchor(state, controllerSeat, heal.anchor_uid);
    if (
      !current ||
      current.top.card_id !== heal.card_id ||
      String(current.def.element || "") !== choice.heal.target_element ||
      Number(current.creature.damage || 0) <= 0
    ) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_heal_target_changed",
      );
    }
  }

  const currentMoveIds = new Set(
    legalMoveOptions(state, controllerSeat, choice.move_element)
      .map((option) => option.id),
  );
  for (const move of selectedMoves) {
    if (!currentMoveIds.has(move.id)) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_move_changed",
      );
    }
  }

  preflightMoves(
    state,
    controllerSeat,
    selectedMoves,
    choice.ability_id,
  );

  const movementReceipts: RuntimeV02EssenceMovement[] = [];
  for (const move of selectedMoves) {
    const source = fieldByAnchor(
      state,
      controllerSeat,
      move.source_anchor_uid,
    );
    const destination = fieldByAnchor(
      state,
      controllerSeat,
      move.destination_anchor_uid,
    );
    if (!source || !destination) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_move_field_changed",
      );
    }
    const applied = applyRuntimeV02EssenceTransfer(
      state,
      controllerSeat,
      move.source_anchor_uid,
      move.destination_anchor_uid,
      source.creature.essence,
      destination.creature.essence,
      move.essence_uid,
      choice.ability_id,
    );
    movementReceipts.push(applied.movement);
  }

  const ifMatched = runtimeV02EvaluateActiveAbilityIf(choice.when, {
    sets: {},
    creatures: {},
    essence_moves: { [choice.move_var]: movementReceipts },
  });
  if (ifMatched !== thresholdMatched) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_if_mismatch",
    );
  }

  let healTargetUid: string | null = null;
  let actualHeal = 0;
  let emittedPacketIds: string[] = [];
  if (ifMatched) {
    const selected = selectedHeals[0];
    const target = fieldByAnchor(
      state,
      controllerSeat,
      selected.anchor_uid,
    );
    if (!target) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_heal_target_changed",
      );
    }
    const context: RuntimeV02HealPacketContext = {
      source: {
        controller_seat: controllerSeat,
        action_kind: "ability",
        action_id: choice.ability_id,
        card_effect: true,
        card_uid: choice.source_uid,
        card_id: choice.source_card_id,
        creature_uid: choice.source_uid,
      },
      target: {
        controller_seat: controllerSeat,
        creature_uid: target.top.uid,
        card_uid: target.top.uid,
        card_id: target.top.card_id,
        element: requiredString(
          target.def.element,
          "tcg_v0_2_active_ability_redistribution_target_element_required",
        ),
        where: target.where,
        index: target.where === "reserve" ? target.index : null,
      },
    };
    const healed = applyRuntimeV02HealPacket(
      state,
      target.creature,
      choice.heal.amount,
      context,
    );
    healTargetUid = target.top.uid;
    actualHeal = healed.actual_heal;
    emittedPacketIds = healed.packet ? [healed.packet.id] : [];
  }

  return {
    kind: choice.kind,
    ability_id: choice.ability_id,
    choice_id: choice.id,
    movement_count: movementReceipts.length,
    movement_receipts: movementReceipts.map((movement) => ({ ...movement })),
    if_matched: ifMatched,
    heal_target_uid: healTargetUid,
    requested_heal: ifMatched ? choice.heal.amount : 0,
    actual_heal: actualHeal,
    emitted_packet_ids: emittedPacketIds,
  };
}
