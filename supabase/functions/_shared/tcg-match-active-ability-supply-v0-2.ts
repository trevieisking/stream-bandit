import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02EvaluateActiveAbilityIf } from "./tcg-match-active-ability-if-v0-2.ts";
import {
  runtimeV02BeginExternalEssenceAttachmentRoute,
} from "./tcg-match-essence-attachment-route-v0-2.ts";
import type { RuntimeV02EventListenerFlow } from "./tcg-match-event-listener-v0-2.ts";
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
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
};

export type RuntimeV02ActiveAbilitySupplyDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  essence_filters: {
    card_family: "Essence";
    essence_subtype: "Basic";
    element: string;
  };
  target_filters: {
    element: string;
  };
  when: {
    predicate: "target_damaged";
    target: string;
  };
  heal_amount: number;
  essence_var: string;
  target_var: string;
};

export type RuntimeV02ActiveAbilitySupplyChoiceOption =
  | {
      id: string;
      kind: "essence";
      label: string;
      uid: string;
      card_id: string;
    }
  | {
      id: string;
      kind: "target";
      label: string;
      anchor_uid: string;
      card_id: string;
      reserve_index: number;
    };

export type RuntimeV02PendingActiveAbilitySupplyChoice = {
  id: string;
  seat: Seat;
  kind: "select_reserve_target_and_optional_discard_essence";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 2;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  essence_var: string;
  target_var: string;
  when: RuntimeV02ActiveAbilitySupplyDescriptor["when"];
  heal_amount: number;
  options: RuntimeV02ActiveAbilitySupplyChoiceOption[];
};

export type RuntimeV02ActiveAbilitySupplyResume = {
  kind: "supply_after_attachment";
  seat: Seat;
  turn_seq: number;
  ability_id: string;
  source_uid: string;
  source_card_id: string;
  target_anchor_uid: string;
  target_card_id: string;
  target_var: string;
  when: RuntimeV02ActiveAbilitySupplyDescriptor["when"];
  heal_amount: number;
  attached_essence_count: 0 | 1;
};

export type RuntimeV02ActiveAbilitySupplyChoiceResolution = {
  kind: "supply_reserve_then_heal";
  ability_id: string;
  choice_id: string;
  selected_essence_count: 0 | 1;
  target_reserve_index: number;
  target_anchor_uid: string;
  attachment_flow: RuntimeV02EventListenerFlow;
  resume: RuntimeV02ActiveAbilitySupplyResume;
};

export type RuntimeV02ActiveAbilitySupplyResumeResolution = {
  kind: "supply_after_attachment";
  ability_id: string;
  target_found: boolean;
  if_matched: boolean;
  requested_heal: number;
  actual_heal: number;
  emitted_packet_ids: string[];
  attached_essence_count: 0 | 1;
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
    throw new Error("tcg_v0_2_active_ability_supply_turn_invalid");
  }
  return turn;
}
function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(seat)]) : null;
  if (
    !row ||
    !Array.isArray(row.reserve) ||
    !Array.isArray(row.discard)
  ) {
    throw new Error("tcg_v0_2_active_ability_supply_player_invalid");
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
function top(creatureValue: Creature, code: string): Inst {
  return inst(creatureValue.stack[creatureValue.stack.length - 1], code);
}
function same(actual: Inst, expected: Inst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(code);
}
function definition(state: Record<string, unknown>, value: Inst): Record<string, unknown> {
  const result = runtimeV02Definition(state, value);
  if (!result) throw new Error("tcg_v0_2_active_ability_supply_definition_missing");
  return result;
}
function label(state: Record<string, unknown>, value: Inst): string {
  return String(definition(state, value).name || value.card_id);
}
function ownField(
  state: Record<string, unknown>,
  seat: Seat,
): Array<{ where: FieldWhere; index: number | null; creature: Creature; top: Inst; def: Record<string, unknown> }> {
  const own = player(state, seat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0, 1, 2, 3].map((index) => ["reserve", index, (own.reserve as unknown[])[index]] as [FieldWhere, number, unknown]),
  ];
  return rows.flatMap(([where, index, raw]) => {
    if (raw == null) return [];
    const cr = creature(raw, "tcg_v0_2_active_ability_supply_field_creature_invalid");
    const card = top(cr, "tcg_v0_2_active_ability_supply_field_top_invalid");
    return [{ where, index, creature: cr, top: card, def: definition(state, card) }];
  });
}
function sourceTop(
  state: Record<string, unknown>,
  seat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const found = ownField(state, seat).find((field) =>
    field.where === where && (where === "vanguard" || field.index === index)
  );
  if (!found) throw new Error("tcg_v0_2_active_ability_supply_source_missing");
  return found.top;
}
function exactLimit(raw: unknown, abilityId: string) {
  const limit = objectRecord(raw);
  if (
    !limit ||
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) throw new Error(`tcg_v0_2_active_ability_supply_limit_unsupported:${abilityId}`);
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}
function filtersMatchSupplyEssence(
  state: Record<string, unknown>,
  value: Inst,
  filters: RuntimeV02ActiveAbilitySupplyDescriptor["essence_filters"],
): boolean {
  const def = definition(state, value);
  const essence = objectRecord(def.essence);
  return String(def.card_family || "") === filters.card_family &&
    String(essence?.subtype || "") === filters.essence_subtype &&
    String(def.element || "") === filters.element;
}
function emptyEventFlow(): RuntimeV02EventListenerFlow {
  return {
    status: "complete",
    processed_listener_keys: [],
    emitted_heal_packet_ids: [],
    emitted_movement_events: [],
    pending_choice: null,
  };
}

export function structuredRuntimeActiveAbilitySupply(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilitySupplyDescriptor | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creatureDef = objectRecord(def.creature);
  const ability = objectRecord(creatureDef?.ability);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") return null;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;

  const requirements = objectRecord(ability.requirements);
  const all = Array.isArray(requirements?.all) ? requirements!.all.map(objectRecord) : [];
  if (all.length !== 2 || all.some((item) => !item)) return null;
  const legal = all.find((item) => item!.predicate === "legal_card_available");
  const reserve = all.find((item) => item!.predicate === "reserve_count_at_least");
  if (
    !legal ||
    legal!.controller !== "self" ||
    legal!.zone !== "discard" ||
    !reserve ||
    reserve!.controller !== "self" ||
    Number(reserve!.count) !== 1
  ) return null;
  const essenceFilters = objectRecord(legal!.filters);
  if (
    !essenceFilters ||
    essenceFilters.card_family !== "Essence" ||
    essenceFilters.essence_subtype !== "Basic" ||
    typeof essenceFilters.element !== "string" ||
    !essenceFilters.element
  ) return null;

  const steps = Array.isArray(ability.steps) ? ability.steps.map(objectRecord) : [];
  if (steps.length !== 4 || steps.some((step) => !step)) return null;
  const selectCards = steps[0]!;
  const selectTarget = steps[1]!;
  const attach = steps[2]!;
  const conditional = steps[3]!;
  if (
    selectCards.op !== "SELECT_CARDS" ||
    selectCards.player !== "self" ||
    selectCards.zone !== "discard"
  ) return null;
  const selection = objectRecord(selectCards.selection);
  const selectFilters = objectRecord(selection?.filters);
  if (
    !selection ||
    Number(selection.min) !== 0 ||
    Number(selection.max) !== 1 ||
    JSON.stringify(selectFilters) !== JSON.stringify(essenceFilters)
  ) return null;
  const essenceVar = requiredString(
    selectCards.as,
    "tcg_v0_2_active_ability_supply_essence_var_required",
  );

  if (
    selectTarget.op !== "SELECT_CREATURE" ||
    selectTarget.controller !== "self" ||
    selectTarget.zone !== "reserve" ||
    Number(selectTarget.count) !== 1
  ) return null;
  const targetFilters = objectRecord(selectTarget.filters);
  if (!targetFilters || typeof targetFilters.element !== "string" || !targetFilters.element) return null;
  const targetVar = requiredString(
    selectTarget.as,
    "tcg_v0_2_active_ability_supply_target_var_required",
  );

  if (
    attach.op !== "ATTACH_ESSENCE_FROM_ZONE" ||
    attach.player !== "self" ||
    attach.zone !== "discard" ||
    String(attach.cards || "") !== `$${essenceVar}` ||
    String(attach.target || "") !== `$${targetVar}` ||
    attach.manual_attachment !== false
  ) return null;

  if (conditional.op !== "IF" || conditional.else != null) return null;
  const when = objectRecord(conditional.when);
  const then = Array.isArray(conditional.then) ? conditional.then.map(objectRecord) : [];
  if (
    !when ||
    when.predicate !== "target_damaged" ||
    String(when.target || "") !== `$${targetVar}` ||
    then.length !== 1 ||
    !then[0] ||
    then[0]!.op !== "HEAL" ||
    String(then[0]!.target || "") !== `$${targetVar}`
  ) return null;
  const healAmount = Number(then[0]!.amount);
  if (!Number.isFinite(healAmount) || healAmount <= 0) {
    throw new Error("tcg_v0_2_active_ability_supply_heal_amount_invalid");
  }

  return {
    ability_id: requiredString(ability.id, "tcg_v0_2_active_ability_supply_id_required"),
    timing: "own_turn",
    limit: exactLimit(ability.limit, String(ability.id || "")),
    essence_filters: {
      card_family: "Essence",
      essence_subtype: "Basic",
      element: String(essenceFilters.element),
    },
    target_filters: { element: String(targetFilters.element) },
    when: {
      predicate: "target_damaged",
      target: `$${targetVar}`,
    },
    heal_amount: healAmount,
    essence_var: essenceVar,
    target_var: targetVar,
  };
}

export function runtimeV02CreateActiveAbilitySupplyChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilitySupplyDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilitySupplyChoice {
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_supply_not_active_seat");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) >= descriptor.limit.count
  ) throw new Error("tcg_v0_2_active_ability_supply_limit_reached");

  const sourceInstance = inst(source.instance, "tcg_v0_2_active_ability_supply_source_invalid");
  same(
    sourceTop(state, controllerSeat, source.where, source.index),
    sourceInstance,
    "tcg_v0_2_active_ability_supply_source_changed",
  );
  const own = player(state, controllerSeat);
  const essenceOptions = (own.discard as unknown[])
    .map((raw, index) => inst(raw, `tcg_v0_2_active_ability_supply_discard_invalid:${index}`))
    .filter((card) => filtersMatchSupplyEssence(state, card, descriptor.essence_filters))
    .map((card) => ({
      id: `essence:${card.uid}`,
      kind: "essence" as const,
      label: `Essence — ${label(state, card)}`,
      uid: card.uid,
      card_id: card.card_id,
    }));
  if (!essenceOptions.length) {
    throw new Error("tcg_v0_2_active_ability_supply_eligible_essence_required");
  }

  const targets = ownField(state, controllerSeat)
    .filter((field) => field.where === "reserve" && String(field.def.element || "") === descriptor.target_filters.element)
    .map((field) => ({
      id: `target:${field.top.uid}`,
      kind: "target" as const,
      label: `Target — ${String(field.def.name || field.top.card_id)}`,
      anchor_uid: field.top.uid,
      card_id: field.top.card_id,
      reserve_index: Number(field.index),
    }));
  if (!targets.length) {
    throw new Error("tcg_v0_2_active_ability_supply_legal_target_required");
  }

  return {
    id: requiredString(choiceId, "tcg_v0_2_active_ability_supply_choice_id_required"),
    seat: controllerSeat,
    kind: "select_reserve_target_and_optional_discard_essence",
    ability_id: descriptor.ability_id,
    prompt: "Choose one Reserve target and optionally one eligible Essence from your discard",
    min: 1,
    max: 2,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceInstance.uid,
    source_card_id: sourceInstance.card_id,
    essence_var: descriptor.essence_var,
    target_var: descriptor.target_var,
    when: structuredClone(descriptor.when),
    heal_amount: descriptor.heal_amount,
    options: [...targets, ...essenceOptions],
  };
}

export function runtimeV02PendingActiveAbilitySupplyChoiceView(
  choice: RuntimeV02PendingActiveAbilitySupplyChoice | null | undefined,
  viewerSeat: Seat,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
  };
}

export function runtimeV02ResolveActiveAbilitySupplyChoice(
  choice: RuntimeV02PendingActiveAbilitySupplyChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilitySupplyChoiceResolution {
  if (choice.kind !== "select_reserve_target_and_optional_discard_essence") {
    throw new Error("tcg_v0_2_active_ability_supply_choice_kind_invalid");
  }
  if (choice.seat !== controllerSeat) throw new Error("tcg_v0_2_active_ability_supply_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_active_ability_supply_choice_stale_id");
  if (
    !Array.isArray(choiceIds) ||
    new Set(choiceIds).size !== choiceIds.length ||
    choiceIds.length < 1 ||
    choiceIds.length > 2
  ) throw new Error("tcg_v0_2_active_ability_supply_choice_count_invalid");
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_active_ability_supply_turn_changed");
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_supply_active_seat_changed");
  }
  same(
    sourceTop(state, controllerSeat, choice.source_where, choice.source_index),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_active_ability_supply_source_changed",
  );

  const selected = choiceIds.map((id) => choice.options.find((option) => option.id === id));
  if (selected.some((option) => !option)) throw new Error("tcg_v0_2_active_ability_supply_unknown_option");
  const options = selected as RuntimeV02ActiveAbilitySupplyChoiceOption[];
  const targets = options.filter((option) => option.kind === "target") as Extract<RuntimeV02ActiveAbilitySupplyChoiceOption,{kind:"target"}>[];
  const essences = options.filter((option) => option.kind === "essence") as Extract<RuntimeV02ActiveAbilitySupplyChoiceOption,{kind:"essence"}>[];
  if (targets.length !== 1 || essences.length > 1) {
    throw new Error("tcg_v0_2_active_ability_supply_choice_shape_invalid");
  }
  const targetOption = targets[0];
  const targetField = ownField(state, controllerSeat).find((field) =>
    field.where === "reserve" &&
    field.index === targetOption.reserve_index &&
    field.top.uid === targetOption.anchor_uid &&
    field.top.card_id === targetOption.card_id
  );
  if (!targetField) throw new Error("tcg_v0_2_active_ability_supply_target_changed");

  let attachmentFlow = emptyEventFlow();
  if (essences.length === 1) {
    const selectedEssence = essences[0];
    const own = player(state, controllerSeat);
    const current = (own.discard as unknown[])
      .map((raw, index) => inst(raw, `tcg_v0_2_active_ability_supply_discard_invalid:${index}`))
      .find((card) => card.uid === selectedEssence.uid && card.card_id === selectedEssence.card_id);
    if (!current) throw new Error("tcg_v0_2_active_ability_supply_essence_changed");
    const routed = runtimeV02BeginExternalEssenceAttachmentRoute(
      state,
      controllerSeat,
      targetOption.anchor_uid,
      selectedEssence.uid,
      "discard",
      choice.ability_id,
      {
        attachment_kind: "normal",
        phase: "play",
        action_kind: "ability",
        destination_index: targetOption.reserve_index,
        source_owner_seat: controllerSeat,
        source_card_id: selectedEssence.card_id,
      },
    );
    attachmentFlow = routed.flow;
  }

  return {
    kind: "supply_reserve_then_heal",
    ability_id: choice.ability_id,
    choice_id: choice.id,
    selected_essence_count: essences.length as 0 | 1,
    target_reserve_index: targetOption.reserve_index,
    target_anchor_uid: targetOption.anchor_uid,
    attachment_flow: attachmentFlow,
    resume: {
      kind: "supply_after_attachment",
      seat: controllerSeat,
      turn_seq: choice.turn_seq,
      ability_id: choice.ability_id,
      source_uid: choice.source_uid,
      source_card_id: choice.source_card_id,
      target_anchor_uid: targetOption.anchor_uid,
      target_card_id: targetOption.card_id,
      target_var: choice.target_var,
      when: structuredClone(choice.when),
      heal_amount: choice.heal_amount,
      attached_essence_count: essences.length as 0 | 1,
    },
  };
}

export function runtimeV02ResumeActiveAbilitySupply(
  state: Record<string, unknown>,
  resume: RuntimeV02ActiveAbilitySupplyResume,
): RuntimeV02ActiveAbilitySupplyResumeResolution {
  if (resume.kind !== "supply_after_attachment") {
    throw new Error("tcg_v0_2_active_ability_supply_resume_kind_invalid");
  }
  if (currentTurn(state) !== resume.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_supply_resume_turn_changed");
  }
  if (Number(state.active_seat) !== resume.seat) {
    throw new Error("tcg_v0_2_active_ability_supply_resume_active_seat_changed");
  }
  const found = ownField(state, resume.seat).find((field) =>
    field.top.uid === resume.target_anchor_uid &&
    field.top.card_id === resume.target_card_id
  );
  if (!found) {
    return {
      kind: resume.kind,
      ability_id: resume.ability_id,
      target_found: false,
      if_matched: false,
      requested_heal: resume.heal_amount,
      actual_heal: 0,
      emitted_packet_ids: [],
      attached_essence_count: resume.attached_essence_count,
    };
  }

  const matched = runtimeV02EvaluateActiveAbilityIf(resume.when, {
    sets: {},
    creatures: { [resume.target_var]: found.creature },
    essence_moves: {},
  });
  if (!matched) {
    return {
      kind: resume.kind,
      ability_id: resume.ability_id,
      target_found: true,
      if_matched: false,
      requested_heal: resume.heal_amount,
      actual_heal: 0,
      emitted_packet_ids: [],
      attached_essence_count: resume.attached_essence_count,
    };
  }

  const targetDefinition = found.def;
  const context: RuntimeV02HealPacketContext = {
    source: {
      controller_seat: resume.seat,
      action_kind: "ability",
      action_id: resume.ability_id,
      card_effect: true,
      card_uid: resume.source_uid,
      card_id: resume.source_card_id,
      creature_uid: resume.source_uid,
    },
    target: {
      controller_seat: resume.seat,
      creature_uid: found.top.uid,
      card_uid: found.top.uid,
      card_id: found.top.card_id,
      element: requiredString(
        targetDefinition.element,
        "tcg_v0_2_active_ability_supply_target_element_required",
      ),
      where: found.where,
      index: found.where === "reserve" ? found.index : null,
    },
  };
  const healed = applyRuntimeV02HealPacket(
    state,
    resume.heal_amount,
    found.creature,
    context,
  );
  return {
    kind: resume.kind,
    ability_id: resume.ability_id,
    target_found: true,
    if_matched: true,
    requested_heal: resume.heal_amount,
    actual_heal: healed.actual_heal,
    emitted_packet_ids: healed.packet ? [healed.packet.id] : [],
    attached_essence_count: resume.attached_essence_count,
  };
}
