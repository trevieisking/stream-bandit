import {
  runtimeV02BeginExternalEssenceAttachmentRoute,
  type RuntimeV02ExternalEssenceAttachmentRoute,
} from "./tcg-match-essence-attachment-route-v0-2.ts";
import {
  runtimeV02ApplyDirectDamage,
  type RuntimeV02DirectDamageResult,
} from "./tcg-match-direct-damage-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };
type Creature = {
  stack: Inst[];
  essence: Inst[];
  relic?: Inst | null;
  damage: number;
  shield: number;
  flags?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
};
type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Creature;
  top: Inst;
  def: Record<string, unknown>;
};

export type RuntimeV02ActiveAbilityHandAttachmentDamageDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  element: string;
  target: {
    controller: "self";
    zone: "field";
    count: 1;
    damaged: true;
  };
  essence: {
    controller: "self";
    zone: "hand";
    card_family: "Essence";
    essence_subtype: "Basic";
    element: string;
  };
  damage_step: {
    op: "DIRECT_DAMAGE";
    target: string;
    amount: number;
    damage_class: "effect";
  };
};

export type RuntimeV02ActiveAbilityHandAttachmentDamageOption =
  | {
      id: string;
      kind: "target";
      label: string;
      anchor_uid: string;
      card_id: string;
      where: FieldWhere;
      index: number | null;
    }
  | {
      id: string;
      kind: "essence";
      label: string;
      uid: string;
      card_id: string;
    };

export type RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice = {
  id: string;
  seat: Seat;
  kind: "select_target_then_hand_essence_direct_damage";
  stage: "target" | "essence";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02ActiveAbilityHandAttachmentDamageDescriptor;
  target_anchor_uid: string | null;
  target_card_id: string | null;
  options: RuntimeV02ActiveAbilityHandAttachmentDamageOption[];
};

export type RuntimeV02ActiveAbilityHandAttachmentDamageResume =
  | {
      kind: "hand_attachment_damage";
      stage: "after_attachment";
      seat: Seat;
      turn_seq: number;
      ability_id: string;
      source_uid: string;
      source_card_id: string;
      target_anchor_uid: string;
      target_card_id: string;
      damage_step: RuntimeV02ActiveAbilityHandAttachmentDamageDescriptor["damage_step"];
    }
  | {
      kind: "hand_attachment_damage";
      stage: "after_damage_event";
      seat: Seat;
      turn_seq: number;
      ability_id: string;
      source_uid: string;
      source_card_id: string;
      target_anchor_uid: string;
      target_card_id: string;
      packet_id: string;
      requested_amount: number;
      final_amount: number;
      actual_hp_damage: number;
    };

export type RuntimeV02ActiveAbilityHandAttachmentDamageChoiceResolution =
  | {
      kind: "hand_attachment_damage";
      stage: "essence_choice_required";
      ability_id: string;
      pending_choice: RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice;
    }
  | {
      kind: "hand_attachment_damage";
      stage: "attachment_resolved";
      ability_id: string;
      selected_essence_count: 1;
      target_where: FieldWhere;
      target_index: number | null;
      attachment_flow: RuntimeV02ExternalEssenceAttachmentRoute["flow"];
      resume: RuntimeV02ActiveAbilityHandAttachmentDamageResume;
    };

export type RuntimeV02ActiveAbilityHandAttachmentDamageResumeResolution =
  | {
      kind: "hand_attachment_damage";
      stage: "direct_damage_resolved";
      ability_id: string;
      requested_amount: number;
      final_amount: number;
      actual_hp_damage: number;
      packet_id: string;
      after_damage_event: RuntimeV02DirectDamageResult["after_damage_event"];
      resume: RuntimeV02ActiveAbilityHandAttachmentDamageResume;
    }
  | {
      kind: "hand_attachment_damage";
      stage: "complete";
      ability_id: string;
      packet_id: string;
      requested_amount: number;
      final_amount: number;
      actual_hp_damage: number;
    };

function obj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
function req(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}
function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_turn_invalid");
  }
  return value;
}
function seat(value: unknown, code: string): Seat {
  if (value === 1 || value === 2) return value;
  throw new Error(code);
}
function reject(
  row: Record<string, unknown>,
  allowed: string[],
  code: string,
): void {
  const unsupported = Object.keys(row).find((key) => !allowed.includes(key));
  if (unsupported) throw new Error(`${code}:${unsupported}`);
}
function instance(value: unknown, code: string): Inst {
  const row = obj(value);
  if (!row) throw new Error(code);
  return {
    uid: req(row.uid, `${code}:uid`),
    card_id: req(row.card_id, `${code}:card_id`),
  };
}
function player(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Record<string, unknown> {
  const players = obj(state.players);
  const row = players ? obj(players[String(controllerSeat)]) : null;
  if (
    !row ||
    !Array.isArray(row.hand) ||
    !Array.isArray(row.reserve)
  ) throw new Error("tcg_v0_2_active_ability_hand_damage_player_invalid");
  return row;
}
function fieldRows(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Field[] {
  const own = player(state, controllerSeat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0, 1, 2, 3].map((index) =>
      ["reserve", index, (own.reserve as unknown[])[index]] as [
        FieldWhere,
        number,
        unknown,
      ]
    ),
  ];
  const out: Field[] = [];
  for (const [where, index, raw] of rows) {
    if (raw == null) continue;
    const cr = obj(raw);
    if (
      !cr ||
      !Array.isArray(cr.stack) ||
      cr.stack.length < 1 ||
      !Array.isArray(cr.essence)
    ) {
      throw new Error("tcg_v0_2_active_ability_hand_damage_creature_invalid");
    }
    const top = instance(
      cr.stack[cr.stack.length - 1],
      "tcg_v0_2_active_ability_hand_damage_top_invalid",
    );
    const def = runtimeV02Definition(state, top);
    if (!def) {
      throw new Error(
        "tcg_v0_2_active_ability_hand_damage_definition_missing",
      );
    }
    out.push({
      where,
      index,
      creature: cr as unknown as Creature,
      top,
      def,
    });
  }
  return out;
}
function fieldByAnchor(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  anchorUid: string,
): Field | null {
  return fieldRows(state, controllerSeat).find((field) =>
    field.top.uid === anchorUid
  ) || null;
}
function sourceTop(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const field = fieldRows(state, controllerSeat).find((candidate) =>
    candidate.where === where && candidate.index === index
  );
  if (!field) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_source_missing");
  }
  return field.top;
}
function same(
  actual: Inst,
  expected: Inst,
  code: string,
): void {
  if (
    actual.uid !== expected.uid ||
    actual.card_id !== expected.card_id
  ) throw new Error(code);
}
function cardLabel(
  state: Record<string, unknown>,
  card: Inst,
): string {
  const def = runtimeV02Definition(state, card);
  return String(def?.name || card.card_id);
}
function targetOptions(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  element: string,
): RuntimeV02ActiveAbilityHandAttachmentDamageOption[] {
  return fieldRows(state, controllerSeat)
    .filter((field) =>
      String(field.def.element || "") === element &&
      Number(field.creature.damage || 0) > 0
    )
    .map((field) => ({
      id: `target:${field.top.uid}`,
      kind: "target" as const,
      label: String(field.def.name || field.top.card_id),
      anchor_uid: field.top.uid,
      card_id: field.top.card_id,
      where: field.where,
      index: field.index,
    }));
}
function essenceOptions(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  element: string,
): RuntimeV02ActiveAbilityHandAttachmentDamageOption[] {
  const own = player(state, controllerSeat);
  return (own.hand as unknown[]).flatMap((raw) => {
    const card = instance(
      raw,
      "tcg_v0_2_active_ability_hand_damage_hand_card_invalid",
    );
    const def = runtimeV02Definition(state, card);
    const essence = obj(def?.essence);
    if (
      !def ||
      String(def.card_family || "") !== "Essence" ||
      String(def.element || "") !== element ||
      String(essence?.subtype || "") !== "Basic"
    ) return [];
    return [{
      id: `essence:${card.uid}`,
      kind: "essence" as const,
      label: cardLabel(state, card),
      uid: card.uid,
      card_id: card.card_id,
    }];
  });
}
function actionId(
  resume: {
    turn_seq: number;
    ability_id: string;
    source_uid: string;
  },
): string {
  return `active-ability:${resume.turn_seq}:${resume.source_uid}:${resume.ability_id}`;
}
function validatePending(
  choice: RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): string {
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_choice_stale_id");
  }
  if (
    !Array.isArray(choiceIds) ||
    choiceIds.length !== 1 ||
    new Set(choiceIds).size !== 1
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_exactly_one_required",
    );
  }
  if (choice.turn_seq !== turn(state)) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_active_seat_changed",
    );
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      choice.ability_id,
    ) !== 1
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_limit_receipt_missing",
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
    "tcg_v0_2_active_ability_hand_damage_source_changed",
  );
  const option = choice.options.find((candidate) =>
    candidate.id === choiceIds[0]
  );
  if (!option) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_option_unknown");
  }
  return choiceIds[0];
}

/**
 * Operation-shaped owner for:
 * SELECT_CREATURE damaged same-element field ->
 * ATTACH_ESSENCE_FROM_ZONE hand exact Basic same-element ->
 * DIRECT_DAMAGE that selected Creature.
 *
 * This is an Active Ability #15 submodule. Essence Attachment #22 owns physical
 * attachment and Direct Damage/Damage Packet #20 owns damage mutation.
 */
export function structuredRuntimeActiveAbilityHandAttachmentDamage(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityHandAttachmentDamageDescriptor | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creature = obj(def.creature);
  const ability = obj(creature?.ability);
  if (
    !ability ||
    ability.mode !== "active" ||
    ability.event !== null ||
    ability.timing !== "own_turn"
  ) return null;
  reject(
    ability,
    [
      "id",
      "name",
      "mode",
      "event",
      "timing",
      "limit",
      "requirements",
      "costs",
      "steps",
    ],
    "tcg_v0_2_active_ability_hand_damage_ability_field_unsupported",
  );
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    return null;
  }
  const abilityId = req(
    ability.id,
    "tcg_v0_2_active_ability_hand_damage_ability_id_required",
  );
  const limit = obj(ability.limit);
  if (
    !limit ||
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) return null;

  const requirements = obj(ability.requirements);
  const all = Array.isArray(requirements?.all)
    ? (requirements!.all as unknown[]).map(obj)
    : [];
  if (all.length !== 2 || all.some((item) => !item)) return null;
  const handReq = all.find((item) =>
    item?.predicate === "legal_card_available" &&
    item.controller === "self" &&
    item.zone === "hand"
  );
  const fieldReq = all.find((item) =>
    item?.predicate === "legal_card_available" &&
    item.controller === "self" &&
    item.zone === "field"
  );
  if (!handReq || !fieldReq) return null;
  const handFilters = obj(handReq.filters);
  const fieldFilters = obj(fieldReq.filters);
  if (
    !handFilters ||
    handFilters.card_family !== "Essence" ||
    handFilters.essence_subtype !== "Basic" ||
    typeof handFilters.element !== "string" ||
    !handFilters.element ||
    !fieldFilters ||
    fieldFilters.card_family !== "Creature" ||
    typeof fieldFilters.element !== "string" ||
    fieldFilters.element !== handFilters.element ||
    fieldFilters.damaged !== true
  ) return null;
  const element = String(handFilters.element);

  const steps = Array.isArray(ability.steps)
    ? (ability.steps as unknown[]).map(obj)
    : [];
  if (steps.length !== 3 || steps.some((step) => !step)) return null;
  const select = steps[0]!;
  const attach = steps[1]!;
  const damage = steps[2]!;

  const selectFilters = obj(select.filters);
  if (
    select.op !== "SELECT_CREATURE" ||
    select.controller !== "self" ||
    select.zone !== "field" ||
    Number(select.count) !== 1 ||
    !selectFilters ||
    selectFilters.element !== element ||
    selectFilters.damaged !== true ||
    Object.keys(selectFilters).some((key) =>
      !["element", "damaged"].includes(key)
    )
  ) return null;
  const targetVar = req(
    select.as,
    "tcg_v0_2_active_ability_hand_damage_target_var_required",
  );

  const selection = obj(attach.selection);
  const essenceFilters = obj(selection?.filters);
  if (
    attach.op !== "ATTACH_ESSENCE_FROM_ZONE" ||
    attach.player !== "self" ||
    attach.zone !== "hand" ||
    !selection ||
    Number(selection.min) !== 1 ||
    Number(selection.max) !== 1 ||
    !essenceFilters ||
    essenceFilters.card_family !== "Essence" ||
    essenceFilters.essence_subtype !== "Basic" ||
    essenceFilters.element !== element ||
    String(attach.target || "") !== `$${targetVar}`
  ) return null;
  reject(
    attach,
    ["op", "player", "zone", "selection", "target"],
    `tcg_v0_2_active_ability_hand_damage_attach_field_unsupported:${abilityId}`,
  );

  if (
    damage.op !== "DIRECT_DAMAGE" ||
    String(damage.target || "") !== `$${targetVar}` ||
    damage.damage_class !== "effect"
  ) return null;
  reject(
    damage,
    ["op", "target", "amount", "damage_class"],
    `tcg_v0_2_active_ability_hand_damage_direct_field_unsupported:${abilityId}`,
  );
  const amount = Number(damage.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(
      `tcg_v0_2_active_ability_hand_damage_amount_invalid:${abilityId}`,
    );
  }

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    element,
    target: {
      controller: "self",
      zone: "field",
      count: 1,
      damaged: true,
    },
    essence: {
      controller: "self",
      zone: "hand",
      card_family: "Essence",
      essence_subtype: "Basic",
      element,
    },
    damage_step: {
      op: "DIRECT_DAMAGE",
      target: `$${targetVar}`,
      amount,
      damage_class: "effect",
    },
  };
}

export function runtimeV02CreateActiveAbilityHandAttachmentDamageChoice(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  descriptor: RuntimeV02ActiveAbilityHandAttachmentDamageDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_active_ability_hand_damage_controller_invalid",
  );
  if (!choiceId) {
    throw new Error("tcg_v0_2_active_ability_hand_damage_choice_id_required");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_not_active_seat",
    );
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) !== 0
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_limit_reached",
    );
  }
  const sourceInstance = instance(
    source.instance,
    "tcg_v0_2_active_ability_hand_damage_source_invalid",
  );
  same(
    sourceTop(state, controllerSeat, source.where, source.index),
    sourceInstance,
    "tcg_v0_2_active_ability_hand_damage_source_changed",
  );
  const targets = targetOptions(state, controllerSeat, descriptor.element);
  const essences = essenceOptions(state, controllerSeat, descriptor.element);
  if (!targets.length) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_target_unavailable",
    );
  }
  if (!essences.length) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_essence_unavailable",
    );
  }
  return {
    id: choiceId,
    seat: controllerSeat,
    kind: "select_target_then_hand_essence_direct_damage",
    stage: "target",
    ability_id: descriptor.ability_id,
    prompt: "Choose a damaged friendly Creature",
    min: 1,
    max: 1,
    turn_seq: turn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceInstance.uid,
    source_card_id: sourceInstance.card_id,
    descriptor: structuredClone(descriptor),
    target_anchor_uid: null,
    target_card_id: null,
    options: targets,
  };
}

export function runtimeV02PendingActiveAbilityHandAttachmentDamageChoiceView(
  choice:
    | RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice
    | null
    | undefined,
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
    stage: choice.stage,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
  };
}

export function runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
  choice: RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice,
  controllerSeatRaw: number,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityHandAttachmentDamageChoiceResolution {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_active_ability_hand_damage_controller_invalid",
  );
  const selectedId = validatePending(
    choice,
    controllerSeat,
    choiceId,
    choiceIds,
    state,
  );

  if (choice.stage === "target") {
    const option = choice.options.find((candidate) =>
      candidate.kind === "target" && candidate.id === selectedId
    );
    if (!option || option.kind !== "target") {
      throw new Error(
        "tcg_v0_2_active_ability_hand_damage_target_option_invalid",
      );
    }
    const current = fieldByAnchor(
      state,
      controllerSeat,
      option.anchor_uid,
    );
    if (
      !current ||
      current.top.card_id !== option.card_id ||
      String(current.def.element || "") !== choice.descriptor.element ||
      Number(current.creature.damage || 0) <= 0
    ) {
      throw new Error(
        "tcg_v0_2_active_ability_hand_damage_target_changed",
      );
    }
    const essences = essenceOptions(
      state,
      controllerSeat,
      choice.descriptor.element,
    );
    if (!essences.length) {
      throw new Error(
        "tcg_v0_2_active_ability_hand_damage_essence_unavailable",
      );
    }
    return {
      kind: "hand_attachment_damage",
      stage: "essence_choice_required",
      ability_id: choice.ability_id,
      pending_choice: {
        ...structuredClone(choice),
        id: crypto.randomUUID(),
        stage: "essence",
        prompt: "Choose a Basic Essence from your hand to attach",
        target_anchor_uid: current.top.uid,
        target_card_id: current.top.card_id,
        options: essences,
      },
    };
  }

  if (choice.stage !== "essence") {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_choice_stage_invalid",
    );
  }
  if (!choice.target_anchor_uid || !choice.target_card_id) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_target_identity_required",
    );
  }
  const target = fieldByAnchor(
    state,
    controllerSeat,
    choice.target_anchor_uid,
  );
  if (
    !target ||
    target.top.card_id !== choice.target_card_id ||
    String(target.def.element || "") !== choice.descriptor.element ||
    Number(target.creature.damage || 0) <= 0
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_target_changed",
    );
  }
  const option = choice.options.find((candidate) =>
    candidate.kind === "essence" && candidate.id === selectedId
  );
  if (!option || option.kind !== "essence") {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_essence_option_invalid",
    );
  }
  const currentEssence = essenceOptions(
    state,
    controllerSeat,
    choice.descriptor.element,
  ).find((candidate) =>
    candidate.kind === "essence" &&
    candidate.uid === option.uid &&
    candidate.card_id === option.card_id
  );
  if (!currentEssence) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_essence_changed",
    );
  }

  const resume: RuntimeV02ActiveAbilityHandAttachmentDamageResume = {
    kind: "hand_attachment_damage",
    stage: "after_attachment",
    seat: controllerSeat,
    turn_seq: choice.turn_seq,
    ability_id: choice.ability_id,
    source_uid: choice.source_uid,
    source_card_id: choice.source_card_id,
    target_anchor_uid: target.top.uid,
    target_card_id: target.top.card_id,
    damage_step: structuredClone(choice.descriptor.damage_step),
  };
  const routed = runtimeV02BeginExternalEssenceAttachmentRoute(
    state,
    controllerSeat,
    target.top.uid,
    option.uid,
    "hand",
    actionId(resume),
    {
      attachment_kind: "effect_generated",
      phase: "effect_resolution",
      action_kind: "effect_driven",
      destination_index: target.index,
      source_owner_seat: controllerSeat,
      source_card_id: option.card_id,
    },
  );
  return {
    kind: "hand_attachment_damage",
    stage: "attachment_resolved",
    ability_id: choice.ability_id,
    selected_essence_count: 1,
    target_where: target.where,
    target_index: target.index,
    attachment_flow: routed.flow,
    resume,
  };
}

export function runtimeV02ResumeActiveAbilityHandAttachmentDamage(
  state: Record<string, unknown>,
  resume: RuntimeV02ActiveAbilityHandAttachmentDamageResume,
): RuntimeV02ActiveAbilityHandAttachmentDamageResumeResolution {
  if (resume.kind !== "hand_attachment_damage") {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_resume_kind_invalid",
    );
  }
  if (resume.turn_seq !== turn(state)) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_resume_turn_changed",
    );
  }
  if (Number(state.active_seat) !== resume.seat) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_resume_active_seat_changed",
    );
  }
  const source = fieldByAnchor(state, resume.seat, resume.source_uid);
  if (!source || source.top.card_id !== resume.source_card_id) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_resume_source_changed",
    );
  }

  if (resume.stage === "after_damage_event") {
    return {
      kind: "hand_attachment_damage",
      stage: "complete",
      ability_id: resume.ability_id,
      packet_id: resume.packet_id,
      requested_amount: resume.requested_amount,
      final_amount: resume.final_amount,
      actual_hp_damage: resume.actual_hp_damage,
    };
  }
  if (resume.stage !== "after_attachment") {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_resume_stage_invalid",
    );
  }
  const target = fieldByAnchor(
    state,
    resume.seat,
    resume.target_anchor_uid,
  );
  if (!target || target.top.card_id !== resume.target_card_id) {
    throw new Error(
      "tcg_v0_2_active_ability_hand_damage_resume_target_changed",
    );
  }
  const sourceActionId = actionId(resume);
  const packetId = `${sourceActionId}:direct-damage`;
  const resolved = runtimeV02ApplyDirectDamage(
    state,
    target.creature,
    resume.damage_step,
    {
      packet_id: packetId,
      damage_class: "effect",
      source_controller_seat: resume.seat,
      source_kind: "ability",
      source_action_id: sourceActionId,
      source_card_uid: resume.source_uid,
      source_card_id: resume.source_card_id,
      source_creature_uid: resume.source_uid,
      target_controller_seat: resume.seat,
      target_creature_uid: target.top.uid,
      target_zone: target.where,
      target_index: target.index,
    },
    resume.damage_step.target,
    null,
  );
  const next: RuntimeV02ActiveAbilityHandAttachmentDamageResume = {
    kind: "hand_attachment_damage",
    stage: "after_damage_event",
    seat: resume.seat,
    turn_seq: resume.turn_seq,
    ability_id: resume.ability_id,
    source_uid: resume.source_uid,
    source_card_id: resume.source_card_id,
    target_anchor_uid: target.top.uid,
    target_card_id: target.top.card_id,
    packet_id,
    requested_amount: resolved.packet.requested_amount,
    final_amount: resolved.packet.final_amount,
    actual_hp_damage: resolved.packet.receipt.actual_hp_damage,
  };
  return {
    kind: "hand_attachment_damage",
    stage: "direct_damage_resolved",
    ability_id: resume.ability_id,
    requested_amount: resolved.packet.requested_amount,
    final_amount: resolved.packet.final_amount,
    actual_hp_damage: resolved.packet.receipt.actual_hp_damage,
    packet_id,
    after_damage_event: resolved.after_damage_event,
    resume: next,
  };
}
