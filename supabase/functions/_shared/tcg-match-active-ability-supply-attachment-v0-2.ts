
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02BeginExternalEssenceAttachmentRoute } from "./tcg-match-essence-attachment-route-v0-2.ts";
import { runtimeV02NormalizeEffectAttachmentState, type RuntimeV02EffectAttachmentState } from "./tcg-match-essence-attachment-state-v0-2.ts";
import type { RuntimeV02EventListenerFlow } from "./tcg-match-event-listener-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };
type Creature = { stack: Inst[]; essence: Inst[]; damage: number; shield: number };

type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Creature;
  top: Inst;
  def: Record<string, unknown>;
};

export type RuntimeV02ActiveAbilitySupplyAttachmentDescriptor = {
  ability_id: string;
  limit: { scope: "turn"; count: 1; owner: "controller" };
  essence_filters: { card_family: "Essence"; essence_subtype: "Basic"; element: string };
  target_filters: { element: string };
  attachment_state: RuntimeV02EffectAttachmentState;
};

export type RuntimeV02ActiveAbilitySupplyAttachmentOption =
  | { id: string; kind: "essence"; label: string; uid: string; card_id: string }
  | { id: string; kind: "target"; label: string; anchor_uid: string; card_id: string; where: FieldWhere; index: number | null };

export type RuntimeV02PendingActiveAbilitySupplyAttachmentChoice = {
  id: string;
  seat: Seat;
  kind: "select_discard_essence_then_friendly_target";
  stage: "essence" | "target";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  essence_filters: RuntimeV02ActiveAbilitySupplyAttachmentDescriptor["essence_filters"];
  target_filters: RuntimeV02ActiveAbilitySupplyAttachmentDescriptor["target_filters"];
  attachment_state: RuntimeV02EffectAttachmentState;
  selected_essence_uid: string | null;
  selected_essence_card_id: string | null;
  options: RuntimeV02ActiveAbilitySupplyAttachmentOption[];
};

export type RuntimeV02ActiveAbilitySupplyAttachmentResume = {
  kind: "effect_attachment_after_attachment";
  seat: Seat;
  turn_seq: number;
  ability_id: string;
  attached_essence_count: 1;
};

export type RuntimeV02ActiveAbilitySupplyAttachmentResolution =
  | { kind: "effect_attachment_supply"; stage: "target_choice_required"; ability_id: string; pending_choice: RuntimeV02PendingActiveAbilitySupplyAttachmentChoice }
  | {
      kind: "effect_attachment_supply";
      stage: "attachment_resolved";
      ability_id: string;
      selected_essence_count: 1;
      target_where: FieldWhere;
      target_index: number | null;
      target_anchor_uid: string;
      attachment_flow: RuntimeV02EventListenerFlow;
      resume: RuntimeV02ActiveAbilitySupplyAttachmentResume;
    };

export type RuntimeV02ActiveAbilitySupplyAttachmentResumeResolution = {
  kind: "effect_attachment_after_attachment";
  ability_id: string;
  attached_essence_count: 1;
};

function obj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function req(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}
function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) throw new Error("tcg_v0_2_active_ability_supply_attachment_turn_invalid");
  return value;
}
function instance(value: unknown, code: string): Inst {
  const row = obj(value);
  if (!row) throw new Error(code);
  return { uid: req(row.uid, code + ":uid"), card_id: req(row.card_id, code + ":card_id") };
}
function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = obj(state.players);
  const row = players ? obj(players[String(seat)]) : null;
  if (!row || !Array.isArray(row.reserve) || !Array.isArray(row.discard)) {
    throw new Error("tcg_v0_2_active_ability_supply_attachment_player_invalid");
  }
  return row;
}
function definition(state: Record<string, unknown>, value: Inst): Record<string, unknown> {
  const def = runtimeV02Definition(state, value);
  if (!def) throw new Error("tcg_v0_2_active_ability_supply_attachment_definition_missing");
  return def;
}
function fields(state: Record<string, unknown>, seat: Seat): Field[] {
  const own = player(state, seat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0,1,2,3].map(function(index){ return ["reserve", index, (own.reserve as unknown[])[index]] as [FieldWhere, number, unknown]; }),
  ];
  const out: Field[] = [];
  for (const row of rows) {
    const where = row[0], index = row[1], raw = row[2];
    const cr = obj(raw);
    if (!cr) continue;
    if (!Array.isArray(cr.stack) || cr.stack.length < 1 || !Array.isArray(cr.essence)) {
      throw new Error("tcg_v0_2_active_ability_supply_attachment_field_invalid");
    }
    const top = instance(cr.stack[cr.stack.length - 1], "tcg_v0_2_active_ability_supply_attachment_top_invalid");
    out.push({ where, index, creature: cr as unknown as Creature, top, def: definition(state, top) });
  }
  return out;
}
function sourceTop(state: Record<string, unknown>, seat: Seat, where: FieldWhere, index: number | null): Inst {
  const found = fields(state, seat).find(function(field){ return field.where === where && (where === "vanguard" || field.index === index); });
  if (!found) throw new Error("tcg_v0_2_active_ability_supply_attachment_source_missing");
  return found.top;
}
function same(actual: Inst, expected: Inst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(code);
}
function limit(raw: unknown, abilityId: string) {
  const row = obj(raw);
  if (!row || row.scope !== "turn" || Number(row.count) !== 1 || row.owner !== "controller") {
    throw new Error("tcg_v0_2_active_ability_supply_attachment_limit_unsupported:" + abilityId);
  }
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}
function essenceMatches(state: Record<string, unknown>, card: Inst, filters: RuntimeV02ActiveAbilitySupplyAttachmentDescriptor["essence_filters"]): boolean {
  const def = definition(state, card);
  const essence = obj(def.essence);
  return String(def.card_family || "") === "Essence" &&
    String(essence && essence.subtype || "") === "Basic" &&
    String(def.element || "") === filters.element;
}
function essenceOptions(state: Record<string, unknown>, seat: Seat, filters: RuntimeV02ActiveAbilitySupplyAttachmentDescriptor["essence_filters"]): RuntimeV02ActiveAbilitySupplyAttachmentOption[] {
  return (player(state, seat).discard as unknown[])
    .map(function(raw, index){ return instance(raw, "tcg_v0_2_active_ability_supply_attachment_discard_invalid:" + index); })
    .filter(function(card){ return essenceMatches(state, card, filters); })
    .map(function(card){
      return { id: "essence:" + card.uid, kind: "essence" as const, label: "Essence — " + String(definition(state, card).name || card.card_id), uid: card.uid, card_id: card.card_id };
    });
}
function targetOptions(state: Record<string, unknown>, seat: Seat, filters: RuntimeV02ActiveAbilitySupplyAttachmentDescriptor["target_filters"]): RuntimeV02ActiveAbilitySupplyAttachmentOption[] {
  return fields(state, seat)
    .filter(function(field){ return String(field.def.element || "") === filters.element; })
    .map(function(field){
      return {
        id: "target:" + field.top.uid,
        kind: "target" as const,
        label: "Target — " + String(field.def.name || field.top.card_id),
        anchor_uid: field.top.uid,
        card_id: field.top.card_id,
        where: field.where,
        index: field.where === "reserve" ? field.index : null,
      };
    });
}

export function structuredRuntimeActiveAbilitySupplyAttachment(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilitySupplyAttachmentDescriptor | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creature = obj(def.creature);
  const ability = obj(creature && creature.ability);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") return null;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;

  const requirements = obj(ability.requirements);
  const all = Array.isArray(requirements && requirements.all) ? (requirements!.all as unknown[]).map(obj) : [];
  if (all.length !== 2 || all.some(function(item){ return !item; })) return null;
  const discardReq = all.find(function(item){ return item && item.predicate === "legal_card_available" && item.controller === "self" && item.zone === "discard"; });
  const fieldReq = all.find(function(item){ return item && item.predicate === "legal_card_available" && item.controller === "self" && item.zone === "field"; });
  if (!discardReq || !fieldReq) return null;
  const ef = obj(discardReq.filters), ff = obj(fieldReq.filters);
  if (!ef || ef.card_family !== "Essence" || ef.essence_subtype !== "Basic" || typeof ef.element !== "string" || !ef.element) return null;
  if (!ff || ff.card_family !== "Creature" || typeof ff.element !== "string" || !ff.element) return null;

  const steps = Array.isArray(ability.steps) ? (ability.steps as unknown[]).map(obj) : [];
  if (steps.length !== 3 || steps.some(function(step){ return !step; })) return null;
  const selectCards = steps[0]!, selectTarget = steps[1]!, attach = steps[2]!;
  const selection = obj(selectCards.selection), sf = obj(selection && selection.filters);
  if (
    selectCards.op !== "SELECT_CARDS" || selectCards.player !== "self" || selectCards.zone !== "discard" ||
    !selection || Number(selection.min) !== 1 || Number(selection.max) !== 1 ||
    !sf || sf.card_family !== "Essence" || sf.essence_subtype !== "Basic" || String(sf.element || "") !== String(ef.element)
  ) return null;
  const essenceVar = req(selectCards.as, "tcg_v0_2_active_ability_supply_attachment_essence_var_required");

  const tf = obj(selectTarget.filters);
  if (
    selectTarget.op !== "SELECT_CREATURE" || selectTarget.controller !== "self" || selectTarget.zone !== "field" ||
    Number(selectTarget.count) !== 1 || !tf || Object.keys(tf).some(function(key){ return key !== "element"; }) ||
    String(tf.element || "") !== String(ff.element)
  ) return null;
  const targetVar = req(selectTarget.as, "tcg_v0_2_active_ability_supply_attachment_target_var_required");

  if (
    attach.op !== "ATTACH_ESSENCE_FROM_ZONE" || attach.player !== "self" || attach.zone !== "discard" ||
    String(attach.cards || "") !== "$" + essenceVar || String(attach.target || "") !== "$" + targetVar ||
    attach.manual_attachment !== false
  ) return null;
  const normalized = runtimeV02NormalizeEffectAttachmentState(attach.attachment_state);
  if (!normalized.state) return null;

  return {
    ability_id: req(ability.id, "tcg_v0_2_active_ability_supply_attachment_id_required"),
    limit: limit(ability.limit, String(ability.id || "")),
    essence_filters: { card_family: "Essence", essence_subtype: "Basic", element: String(ef.element) },
    target_filters: { element: String(tf.element) },
    attachment_state: normalized.state,
  };
}

export function runtimeV02CreateActiveAbilitySupplyAttachmentChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilitySupplyAttachmentDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilitySupplyAttachmentChoice {
  if (Number(state.active_seat) !== controllerSeat) throw new Error("tcg_v0_2_active_ability_supply_attachment_not_active_seat");
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controllerSeat, descriptor.ability_id) >= 1) {
    throw new Error("tcg_v0_2_active_ability_supply_attachment_limit_reached");
  }
  const src = instance(source.instance, "tcg_v0_2_active_ability_supply_attachment_source_invalid");
  same(sourceTop(state, controllerSeat, source.where, source.index), src, "tcg_v0_2_active_ability_supply_attachment_source_changed");
  const essences = essenceOptions(state, controllerSeat, descriptor.essence_filters);
  const targets = targetOptions(state, controllerSeat, descriptor.target_filters);
  if (!essences.length) throw new Error("tcg_v0_2_active_ability_supply_attachment_eligible_essence_required");
  if (!targets.length) throw new Error("tcg_v0_2_active_ability_supply_attachment_legal_target_required");
  return {
    id: req(choiceId, "tcg_v0_2_active_ability_supply_attachment_choice_id_required"),
    seat: controllerSeat,
    kind: "select_discard_essence_then_friendly_target",
    stage: "essence",
    ability_id: descriptor.ability_id,
    prompt: "Choose one eligible Essence from your discard",
    min: 1,
    max: 1,
    turn_seq: turn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: src.uid,
    source_card_id: src.card_id,
    essence_filters: structuredClone(descriptor.essence_filters),
    target_filters: structuredClone(descriptor.target_filters),
    attachment_state: structuredClone(descriptor.attachment_state),
    selected_essence_uid: null,
    selected_essence_card_id: null,
    options: essences,
  };
}

export function runtimeV02PendingActiveAbilitySupplyAttachmentChoiceView(
  choice: RuntimeV02PendingActiveAbilitySupplyAttachmentChoice | null | undefined,
  viewerSeat: Seat,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    stage: choice.stage,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map(function(option){ return { id: option.id, label: option.label }; }),
  };
}

export function runtimeV02ResolveActiveAbilitySupplyAttachmentChoice(
  choice: RuntimeV02PendingActiveAbilitySupplyAttachmentChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilitySupplyAttachmentResolution {
  if (choice.seat !== controllerSeat) throw new Error("tcg_v0_2_active_ability_supply_attachment_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_active_ability_supply_attachment_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_active_ability_supply_attachment_choice_count_invalid");
  }
  if (turn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_active_ability_supply_attachment_turn_changed");
  if (Number(state.active_seat) !== controllerSeat) throw new Error("tcg_v0_2_active_ability_supply_attachment_active_seat_changed");
  same(sourceTop(state, controllerSeat, choice.source_where, choice.source_index), { uid: choice.source_uid, card_id: choice.source_card_id }, "tcg_v0_2_active_ability_supply_attachment_source_changed");
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controllerSeat, choice.ability_id) !== 1) {
    throw new Error("tcg_v0_2_active_ability_supply_attachment_limit_receipt_missing");
  }

  if (choice.stage === "essence") {
    const selected = choice.options.find(function(option){ return option.id === choiceIds[0] && option.kind === "essence"; });
    if (!selected || selected.kind !== "essence") throw new Error("tcg_v0_2_active_ability_supply_attachment_essence_option_invalid");
    const current = essenceOptions(state, controllerSeat, choice.essence_filters).find(function(option){
      return option.kind === "essence" && option.uid === selected.uid && option.card_id === selected.card_id;
    });
    if (!current || current.kind !== "essence") throw new Error("tcg_v0_2_active_ability_supply_attachment_essence_changed");
    const targets = targetOptions(state, controllerSeat, choice.target_filters);
    if (!targets.length) throw new Error("tcg_v0_2_active_ability_supply_attachment_target_changed");
    return {
      kind: "effect_attachment_supply",
      stage: "target_choice_required",
      ability_id: choice.ability_id,
      pending_choice: {
        ...choice,
        id: crypto.randomUUID(),
        stage: "target",
        prompt: "Choose one friendly Creature",
        selected_essence_uid: current.uid,
        selected_essence_card_id: current.card_id,
        options: targets,
      },
    };
  }

  if (!choice.selected_essence_uid || !choice.selected_essence_card_id) {
    throw new Error("tcg_v0_2_active_ability_supply_attachment_stage_invalid");
  }
  const essence = essenceOptions(state, controllerSeat, choice.essence_filters).find(function(option){
    return option.kind === "essence" && option.uid === choice.selected_essence_uid && option.card_id === choice.selected_essence_card_id;
  });
  if (!essence || essence.kind !== "essence") throw new Error("tcg_v0_2_active_ability_supply_attachment_essence_changed");
  const selectedTarget = choice.options.find(function(option){ return option.id === choiceIds[0] && option.kind === "target"; });
  if (!selectedTarget || selectedTarget.kind !== "target") throw new Error("tcg_v0_2_active_ability_supply_attachment_target_option_invalid");
  const target = targetOptions(state, controllerSeat, choice.target_filters).find(function(option){
    return option.kind === "target" &&
      option.anchor_uid === selectedTarget.anchor_uid &&
      option.card_id === selectedTarget.card_id &&
      option.where === selectedTarget.where &&
      option.index === selectedTarget.index;
  });
  if (!target || target.kind !== "target") throw new Error("tcg_v0_2_active_ability_supply_attachment_target_changed");

  const attachment = runtimeV02NormalizeEffectAttachmentState(choice.attachment_state);
  const routed = runtimeV02BeginExternalEssenceAttachmentRoute(
    state,
    controllerSeat,
    target.anchor_uid,
    essence.uid,
    "discard",
    choice.ability_id,
    {
      ...attachment.transaction,
      phase: "play",
      action_kind: "ability",
      destination_index: target.where === "reserve" ? target.index : null,
      source_owner_seat: controllerSeat,
      source_card_id: essence.card_id,
    },
  );
  return {
    kind: "effect_attachment_supply",
    stage: "attachment_resolved",
    ability_id: choice.ability_id,
    selected_essence_count: 1,
    target_where: target.where,
    target_index: target.where === "reserve" ? target.index : null,
    target_anchor_uid: target.anchor_uid,
    attachment_flow: routed.flow,
    resume: {
      kind: "effect_attachment_after_attachment",
      seat: controllerSeat,
      turn_seq: choice.turn_seq,
      ability_id: choice.ability_id,
      attached_essence_count: 1,
    },
  };
}

export function runtimeV02ResumeActiveAbilitySupplyAttachment(
  state: Record<string, unknown>,
  resume: RuntimeV02ActiveAbilitySupplyAttachmentResume,
): RuntimeV02ActiveAbilitySupplyAttachmentResumeResolution {
  if (resume.kind !== "effect_attachment_after_attachment") throw new Error("tcg_v0_2_active_ability_supply_attachment_resume_kind_invalid");
  if (turn(state) !== resume.turn_seq) throw new Error("tcg_v0_2_active_ability_supply_attachment_resume_turn_changed");
  if (Number(state.active_seat) !== resume.seat) throw new Error("tcg_v0_2_active_ability_supply_attachment_resume_active_seat_changed");
  return { kind: resume.kind, ability_id: resume.ability_id, attached_essence_count: 1 };
}
