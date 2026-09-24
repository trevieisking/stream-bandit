import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02BeginExternalEssenceAttachmentRoute,
} from "./tcg-match-essence-attachment-route-v0-2.ts";
import type { RuntimeV02EventListenerFlow } from "./tcg-match-event-listener-v0-2.ts";
import {
  recordRuntimeV02HiddenInformationView,
} from "./tcg-match-hidden-information-v0-2.ts";
import { runtimeV02ShuffleInPlace } from "./tcg-match-randomization-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

export type RuntimeV02SearchSelectionAttachmentDescriptor = {
  ability_id: string;
  limit: { scope: "turn"; count: 1; owner: "controller" };
  search: {
    player: "self";
    reveal: "public";
    min: 0;
    max: 1;
    card_family: "Essence";
    essence_subtype: "Basic";
    query: "attached_essence_elements";
    target: "$source_creature";
    distinct: true;
    allowed_elements: string[];
    declared_target_count: 1;
    hidden_fail_allowed: true;
    destination: "effect_owned_selection";
    as: string;
  };
  attach: {
    cards: string;
    target: "$source_creature";
    manual_attachment: false;
    attachment_kind: "normal";
  };
  shuffle: { player: "self" };
};

export type RuntimeV02SearchSelectionAttachmentOption = {
  id: string;
  label: string;
  uid: string;
  card_id: string;
  element: string;
};

export type RuntimeV02PendingSearchSelectionAttachmentChoice = {
  id: string;
  seat: Seat;
  kind: "search_attach_essence_from_selection";
  ability_id: string;
  prompt: string;
  min: 0;
  max: 0 | 1;
  turn_seq: number;
  source_where: "vanguard";
  source_index: null;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02SearchSelectionAttachmentDescriptor;
  options: RuntimeV02SearchSelectionAttachmentOption[];
};

export type RuntimeV02SearchSelectionAttachmentResume = {
  kind: "search_selection_attachment_after_attachment";
  seat: Seat;
  turn_seq: number;
  ability_id: string;
  selected_essence_count: 1;
};

export type RuntimeV02SearchSelectionAttachmentResolution =
  | {
      kind: "search_selection_attachment";
      stage: "complete";
      ability_id: string;
      selected_essence_count: 0;
      attached_essence_count: 0;
      shuffled: true;
      emitted_packet_ids: [];
    }
  | {
      kind: "search_selection_attachment";
      stage: "attachment_resolved";
      ability_id: string;
      selected_essence_count: 1;
      attached_essence_count: 1;
      target_where: "vanguard";
      target_index: null;
      target_anchor_uid: string;
      attachment_flow: RuntimeV02EventListenerFlow;
      resume: RuntimeV02SearchSelectionAttachmentResume;
    };

export type RuntimeV02SearchSelectionAttachmentResumeResolution = {
  kind: "search_selection_attachment_after_attachment";
  ability_id: string;
  selected_essence_count: 1;
  attached_essence_count: 1;
  shuffled: true;
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
    throw new Error("tcg_v0_2_search_attachment_turn_invalid");
  }
  return value;
}
function rejectFields(
  row: Record<string, unknown>,
  allowed: string[],
  code: string,
): void {
  const extra = Object.keys(row).find((key) => !allowed.includes(key));
  if (extra) throw new Error(`${code}:${extra}`);
}
function exactLimit(
  raw: unknown,
  abilityId: string,
): { scope: "turn"; count: 1; owner: "controller" } {
  const row = obj(raw);
  if (!row) {
    throw new Error(`tcg_v0_2_search_attachment_limit_required:${abilityId}`);
  }
  rejectFields(
    row,
    ["scope", "count", "owner"],
    `tcg_v0_2_search_attachment_limit_field_unsupported:${abilityId}`,
  );
  if (
    row.scope !== "turn" ||
    Number(row.count) !== 1 ||
    row.owner !== "controller"
  ) {
    throw new Error(`tcg_v0_2_search_attachment_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn", count: 1, owner: "controller" };
}
function inst(raw: unknown, code: string): Inst {
  const row = obj(raw);
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
    !Array.isArray(row.deck) ||
    !Array.isArray(row.reserve)
  ) {
    throw new Error("tcg_v0_2_search_attachment_player_invalid");
  }
  return row;
}
function sourceCreature(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Record<string, unknown> {
  const own = player(state, controllerSeat);
  const creature = obj(own.vanguard);
  if (
    !creature ||
    !Array.isArray(creature.stack) ||
    creature.stack.length < 1 ||
    !Array.isArray(creature.essence)
  ) {
    throw new Error("tcg_v0_2_search_attachment_source_vanguard_missing");
  }
  return creature;
}
function sourceTop(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Inst {
  const creature = sourceCreature(state, controllerSeat);
  const stack = creature.stack as unknown[];
  return inst(
    stack[stack.length - 1],
    "tcg_v0_2_search_attachment_source_top_invalid",
  );
}
function sameSource(actual: Inst, expected: Inst): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error("tcg_v0_2_search_attachment_source_changed");
  }
}
function definition(
  state: Record<string, unknown>,
  card: Inst,
): Record<string, unknown> {
  const value = runtimeV02Definition(state, card);
  if (!value) {
    throw new Error("tcg_v0_2_search_attachment_definition_missing");
  }
  return value;
}
function essenceSubtype(def: Record<string, unknown>): string {
  const essence = obj(def.essence);
  return String(essence?.subtype || def.essence_subtype || "");
}
function essenceElement(def: Record<string, unknown>): string {
  return String(def.element || "");
}
function attachedElements(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Set<string> {
  const creature = sourceCreature(state, controllerSeat);
  const result = new Set<string>();
  for (const raw of creature.essence as unknown[]) {
    const card = inst(raw, "tcg_v0_2_search_attachment_attached_essence_invalid");
    const element = essenceElement(definition(state, card));
    if (element) result.add(element);
  }
  return result;
}
function searchOptions(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02SearchSelectionAttachmentDescriptor,
): RuntimeV02SearchSelectionAttachmentOption[] {
  const attached = attachedElements(state, controllerSeat);
  const allowed = new Set(descriptor.search.allowed_elements);
  return (player(state, controllerSeat).deck as unknown[])
    .map((raw, index) =>
      inst(raw, `tcg_v0_2_search_attachment_deck_card_invalid:${index}`)
    )
    .flatMap((card) => {
      const def = definition(state, card);
      if (String(def.card_family || "") !== descriptor.search.card_family) return [];
      if (essenceSubtype(def) !== descriptor.search.essence_subtype) return [];
      const element = essenceElement(def);
      if (!element || !allowed.has(element) || attached.has(element)) return [];
      return [{
        id: `card:${card.uid}`,
        label: String(def.name || card.card_id),
        uid: card.uid,
        card_id: card.card_id,
        element,
      }];
    });
}
function abilityDefinition(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): Record<string, unknown> | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creature = obj(def.creature);
  return obj(creature?.ability);
}
function stringArray(raw: unknown, code: string): string[] {
  if (!Array.isArray(raw) || raw.length < 1) throw new Error(code);
  const values = raw.map((value, index) =>
    req(value, `${code}:${index}`)
  );
  if (new Set(values).size !== values.length) {
    throw new Error(`${code}:duplicate`);
  }
  return values;
}

export function structuredRuntimeSearchSelectionAttachmentActiveAbility(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02SearchSelectionAttachmentDescriptor | null {
  const ability = abilityDefinition(state, instanceOrId);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") {
    return null;
  }
  const abilityId = req(
    ability.id,
    "tcg_v0_2_search_attachment_ability_id_required",
  );
  rejectFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_search_attachment_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null) return null;
  const limit = exactLimit(ability.limit, abilityId);

  if (!Array.isArray(ability.requirements) || ability.requirements.length !== 1) {
    return null;
  }
  const requirement = obj(ability.requirements[0]);
  if (!requirement || requirement.predicate !== "source_is_current_friendly_vanguard") {
    return null;
  }
  rejectFields(
    requirement,
    ["predicate"],
    `tcg_v0_2_search_attachment_requirement_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;
  if (!Array.isArray(ability.steps) || ability.steps.length !== 3) return null;

  const search = obj(ability.steps[0]);
  const attach = obj(ability.steps[1]);
  const shuffle = obj(ability.steps[2]);
  if (!search || !attach || !shuffle) return null;

  if (
    search.op !== "SEARCH_DECK" ||
    search.player !== "self" ||
    search.reveal !== "public" ||
    Number(search.declared_target_count) !== 1 ||
    search.hidden_fail_allowed !== true ||
    search.destination !== "effect_owned_selection"
  ) return null;
  rejectFields(
    search,
    [
      "op",
      "player",
      "reveal",
      "selection",
      "declared_target_count",
      "hidden_fail_allowed",
      "destination",
      "as",
    ],
    `tcg_v0_2_search_attachment_search_field_unsupported:${abilityId}`,
  );
  const selection = obj(search.selection);
  if (!selection || Number(selection.min) !== 0 || Number(selection.max) !== 1) {
    return null;
  }
  rejectFields(
    selection,
    ["min", "max", "filters"],
    `tcg_v0_2_search_attachment_selection_field_unsupported:${abilityId}`,
  );
  const filters = obj(selection.filters);
  if (
    !filters ||
    filters.card_family !== "Essence" ||
    filters.essence_subtype !== "Basic"
  ) return null;
  rejectFields(
    filters,
    ["card_family", "essence_subtype", "element_not_in_query"],
    `tcg_v0_2_search_attachment_filter_field_unsupported:${abilityId}`,
  );
  const query = obj(filters.element_not_in_query);
  if (
    !query ||
    query.query !== "attached_essence_elements" ||
    query.target !== "$source_creature" ||
    query.distinct !== true
  ) return null;
  rejectFields(
    query,
    ["query", "target", "distinct", "allowed_elements"],
    `tcg_v0_2_search_attachment_query_field_unsupported:${abilityId}`,
  );
  const allowedElements = stringArray(
    query.allowed_elements,
    `tcg_v0_2_search_attachment_allowed_elements_invalid:${abilityId}`,
  );
  const token = req(
    search.as,
    `tcg_v0_2_search_attachment_selection_token_required:${abilityId}`,
  );

  if (
    attach.op !== "ATTACH_ESSENCE_FROM_SELECTION" ||
    attach.cards !== `$${token}` ||
    attach.target !== "$source_creature" ||
    attach.manual_attachment !== false
  ) return null;
  rejectFields(
    attach,
    ["op", "cards", "target", "manual_attachment", "attachment_state"],
    `tcg_v0_2_search_attachment_attach_field_unsupported:${abilityId}`,
  );
  const attachmentState = obj(attach.attachment_state);
  if (
    !attachmentState ||
    attachmentState.kind !== "normal" ||
    attachmentState.expires !== "none" ||
    attachmentState.destination_on_expire !== "none"
  ) return null;
  rejectFields(
    attachmentState,
    ["kind", "expires", "destination_on_expire"],
    `tcg_v0_2_search_attachment_state_field_unsupported:${abilityId}`,
  );

  if (shuffle.op !== "SHUFFLE_DECK" || shuffle.player !== "self") return null;
  rejectFields(
    shuffle,
    ["op", "player"],
    `tcg_v0_2_search_attachment_shuffle_field_unsupported:${abilityId}`,
  );

  return {
    ability_id: abilityId,
    limit,
    search: {
      player: "self",
      reveal: "public",
      min: 0,
      max: 1,
      card_family: "Essence",
      essence_subtype: "Basic",
      query: "attached_essence_elements",
      target: "$source_creature",
      distinct: true,
      allowed_elements: allowedElements,
      declared_target_count: 1,
      hidden_fail_allowed: true,
      destination: "effect_owned_selection",
      as: token,
    },
    attach: {
      cards: `$${token}`,
      target: "$source_creature",
      manual_attachment: false,
      attachment_kind: "normal",
    },
    shuffle: { player: "self" },
  };
}

export function runtimeV02CreateSearchSelectionAttachmentChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02SearchSelectionAttachmentDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingSearchSelectionAttachmentChoice {
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_search_attachment_not_active_seat");
  }
  if (source.where !== "vanguard" || source.index !== null) {
    throw new Error("tcg_v0_2_search_attachment_source_must_be_vanguard");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) >= descriptor.limit.count
  ) {
    throw new Error("tcg_v0_2_search_attachment_limit_reached");
  }
  const sourceInstance = inst(
    source.instance,
    "tcg_v0_2_search_attachment_source_invalid",
  );
  sameSource(sourceTop(state, controllerSeat), sourceInstance);
  const options = searchOptions(state, controllerSeat, descriptor);
  recordRuntimeV02HiddenInformationView(state, controllerSeat, "deck", {
    action_kind: "ability",
    source_controller_seat: controllerSeat,
    source_action_id: descriptor.ability_id,
    source_card_uid: sourceInstance.uid,
    source_creature_uid: sourceInstance.uid,
    phase: String(state.phase || "play"),
  });
  return {
    id: req(choiceId, "tcg_v0_2_search_attachment_choice_id_required"),
    seat: controllerSeat,
    kind: "search_attach_essence_from_selection",
    ability_id: descriptor.ability_id,
    prompt: "Search your deck for up to one eligible Basic Essence",
    min: 0,
    max: options.length > 0 ? 1 : 0,
    turn_seq: turn(state),
    source_where: "vanguard",
    source_index: null,
    source_uid: sourceInstance.uid,
    source_card_id: sourceInstance.card_id,
    descriptor: structuredClone(descriptor),
    options,
  };
}

export function runtimeV02PendingSearchSelectionAttachmentChoiceView(
  choice: RuntimeV02PendingSearchSelectionAttachmentChoice | null | undefined,
  viewerSeat: Seat,
): Record<string, unknown> | null {
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
      card_id: option.card_id,
    })),
  };
}

function validatePending(
  choice: RuntimeV02PendingSearchSelectionAttachmentChoice,
  controllerSeat: Seat,
  choiceId: string,
  state: Record<string, unknown>,
): RuntimeV02SearchSelectionAttachmentDescriptor {
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_search_attachment_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_search_attachment_choice_stale_id");
  }
  if (turn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_search_attachment_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_search_attachment_active_seat_changed");
  }
  sameSource(sourceTop(state, controllerSeat), {
    uid: choice.source_uid,
    card_id: choice.source_card_id,
  });
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      choice.ability_id,
    ) !== 1
  ) {
    throw new Error("tcg_v0_2_search_attachment_limit_receipt_missing");
  }
  const current = structuredRuntimeSearchSelectionAttachmentActiveAbility(
    state,
    { card_id: choice.source_card_id },
  );
  if (
    !current ||
    current.ability_id !== choice.ability_id ||
    JSON.stringify(current) !== JSON.stringify(choice.descriptor)
  ) {
    throw new Error("tcg_v0_2_search_attachment_definition_changed");
  }
  return current;
}

export function runtimeV02ResolveSearchSelectionAttachmentChoice(
  choice: RuntimeV02PendingSearchSelectionAttachmentChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02SearchSelectionAttachmentResolution {
  const descriptor = validatePending(choice, controllerSeat, choiceId, state);
  if (
    !Array.isArray(choiceIds) ||
    new Set(choiceIds).size !== choiceIds.length ||
    choiceIds.length < choice.min ||
    choiceIds.length > choice.max
  ) {
    throw new Error("tcg_v0_2_search_attachment_choice_shape_invalid");
  }
  if (choiceIds.length === 0) {
    runtimeV02ShuffleInPlace(player(state, controllerSeat).deck as Inst[]);
    return {
      kind: "search_selection_attachment",
      stage: "complete",
      ability_id: descriptor.ability_id,
      selected_essence_count: 0,
      attached_essence_count: 0,
      shuffled: true,
      emitted_packet_ids: [],
    };
  }

  const selectedAtChoice = choice.options.find((option) =>
    option.id === choiceIds[0]
  );
  if (!selectedAtChoice) {
    throw new Error("tcg_v0_2_search_attachment_option_invalid");
  }
  const current = searchOptions(state, controllerSeat, descriptor).find((option) =>
    option.uid === selectedAtChoice.uid &&
    option.card_id === selectedAtChoice.card_id &&
    option.element === selectedAtChoice.element
  );
  if (!current) {
    throw new Error("tcg_v0_2_search_attachment_selected_card_changed");
  }

  const routed = runtimeV02BeginExternalEssenceAttachmentRoute(
    state,
    controllerSeat,
    choice.source_uid,
    current.uid,
    "deck",
    descriptor.ability_id,
    {
      attachment_kind: descriptor.attach.attachment_kind,
      phase: "play",
      action_kind: "ability",
      destination_index: null,
      source_owner_seat: controllerSeat,
      source_card_id: current.card_id,
    },
  );
  return {
    kind: "search_selection_attachment",
    stage: "attachment_resolved",
    ability_id: descriptor.ability_id,
    selected_essence_count: 1,
    attached_essence_count: 1,
    target_where: "vanguard",
    target_index: null,
    target_anchor_uid: choice.source_uid,
    attachment_flow: routed.flow,
    resume: {
      kind: "search_selection_attachment_after_attachment",
      seat: controllerSeat,
      turn_seq: choice.turn_seq,
      ability_id: descriptor.ability_id,
      selected_essence_count: 1,
    },
  };
}

export function runtimeV02ResumeSearchSelectionAttachment(
  state: Record<string, unknown>,
  resume: RuntimeV02SearchSelectionAttachmentResume,
): RuntimeV02SearchSelectionAttachmentResumeResolution {
  if (resume.kind !== "search_selection_attachment_after_attachment") {
    throw new Error("tcg_v0_2_search_attachment_resume_kind_invalid");
  }
  if (turn(state) !== resume.turn_seq) {
    throw new Error("tcg_v0_2_search_attachment_resume_turn_changed");
  }
  if (Number(state.active_seat) !== resume.seat) {
    throw new Error("tcg_v0_2_search_attachment_resume_active_seat_changed");
  }
  runtimeV02ShuffleInPlace(player(state, resume.seat).deck as Inst[]);
  return {
    kind: resume.kind,
    ability_id: resume.ability_id,
    selected_essence_count: 1,
    attached_essence_count: 1,
    shuffled: true,
  };
}
