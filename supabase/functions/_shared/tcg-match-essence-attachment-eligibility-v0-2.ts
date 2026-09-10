import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeWithdrawalBaseCost } from "./tcg-match-withdrawal-v0-2.ts";
import { runtimeConditions } from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import type { RuntimeV02EssenceAttachedListenerEvent } from "./tcg-match-essence-attachment-event-v0-2.ts";

export type RuntimeV02EssenceAttachedEligibilitySnapshot = {
  event: RuntimeV02EssenceAttachedListenerEvent;
  active_seat: 1 | 2;
  target: {
    controller_seat: 1 | 2;
    uid: string;
    zone: "vanguard" | "reserve";
    index: number | null;
    element: string;
    stage: string;
    damaged: boolean;
    conditions: string[];
  };
  subject: {
    uid: string;
    card_id: string;
    card_family: string;
    element: string;
    essence_subtype: string | null;
  };
  voluntary_withdrawal_legal_with_incoming: boolean;
};

export type RuntimeV02EssenceAttachedPredicateContext = {
  source_uid: string;
  source_controller_seat: 1 | 2;
  source_creature_uid: string | null;
};

type Inst = { uid: string; card_id: string };
type Cr = {
  stack: Inst[];
  essence: Inst[];
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  condition?: string | null;
};
type Field = {
  seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  cr: Cr;
  top: Inst;
};

function O(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
function S(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}
function SEAT(value: unknown, error = "tcg_v0_2_attachment_snapshot_seat_invalid"): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}
function TURN(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attachment_snapshot_turn_seq_invalid");
  }
  return value;
}
function player(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const value = O(O(state.players)?.[String(seat)]);
  if (!value || !Array.isArray(value.reserve)) {
    throw new Error("tcg_v0_2_attachment_snapshot_player_invalid");
  }
  return value;
}
function creature(value: unknown): Cr | null {
  const raw = O(value);
  if (!raw || !Array.isArray(raw.stack) || !raw.stack.length || !Array.isArray(raw.essence)) return null;
  const stack = raw.stack as Inst[];
  const essence = raw.essence as Inst[];
  const top = stack[stack.length - 1];
  if (!top?.uid || !top.card_id || essence.some((item) => !item?.uid || !item.card_id)) return null;
  return raw as unknown as Cr;
}
function fields(state: Record<string, unknown>): Field[] {
  const out: Field[] = [];
  for (const seat of [1, 2] as const) {
    const owner = player(state, seat);
    const values: Array<["vanguard" | "reserve", number | null, unknown]> = [
      ["vanguard", null, owner.vanguard],
      ...[0, 1, 2, 3].map((index) => ["reserve", index, (owner.reserve as unknown[])[index]] as ["reserve", number, unknown]),
    ];
    for (const [where, index, raw] of values) {
      if (raw == null) continue;
      const cr = creature(raw);
      if (!cr) throw new Error("tcg_v0_2_attachment_snapshot_creature_invalid");
      out.push({ seat, where, index, cr, top: cr.stack[cr.stack.length - 1] });
    }
  }
  return out;
}
function targetField(state: Record<string, unknown>, event: RuntimeV02EssenceAttachedListenerEvent): Field {
  const found = fields(state).find((field) => field.top.uid === event.attachment_target_uid);
  if (!found) throw new Error("tcg_v0_2_attachment_snapshot_target_missing");
  if (found.seat !== event.controller_seat) {
    throw new Error("tcg_v0_2_attachment_snapshot_target_controller_mismatch");
  }
  return found;
}
function conditionNames(cr: Cr): string[] {
  const current = runtimeConditions(cr);
  const names: string[] = [];
  if (current.scorched) names.push("Scorched");
  if (current.venomed > 0) names.push("Venomed");
  if (current.control) names.push(current.control);
  if (current.modifier) names.push(current.modifier);
  return names;
}
function printedWithdrawal(definition: Record<string, unknown>): number {
  const cr = O(definition.creature);
  const value = Number(cr?.withdrawal ?? definition.withdrawal ?? definition.withdraw ?? 0);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("tcg_v0_2_attachment_snapshot_withdrawal_printed_invalid");
  }
  return value;
}
function withdrawalLegal(state: Record<string, unknown>, controllerSeat: 1 | 2, incoming: Field): boolean {
  if (Number(state.active_seat) !== controllerSeat || incoming.where !== "reserve") return false;
  const owner = player(state, controllerSeat);
  const flags = O(O(state.turn_flags)?.[String(controllerSeat)]);
  if (Number(flags?.withdraw_turn ?? -1) === TURN(state)) return false;
  const vanguard = creature(owner.vanguard);
  if (!vanguard) return false;
  const conditions = runtimeConditions(vanguard);
  if (conditions.control === "Stunned" || conditions.control === "Rooted") return false;
  const top = vanguard.stack[vanguard.stack.length - 1];
  const definition = runtimeV02Definition(state, top);
  if (!definition) throw new Error("tcg_v0_2_attachment_snapshot_vanguard_definition_missing");
  const element = S(definition.element, "tcg_v0_2_attachment_snapshot_vanguard_element_missing");
  const base = printedWithdrawal(definition);
  const structured = structuredRuntimeWithdrawalBaseCost(
    state,
    vanguard,
    base,
    element,
    conditions.modifier === "Crushed",
  );
  const cost = Math.max(0, structured == null ? base : structured);
  return vanguard.essence.length >= cost;
}
function subjectMatches(snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot, filtersRaw: unknown): boolean {
  const filters = O(filtersRaw) || {};
  if (filters.card_family != null && snapshot.subject.card_family !== String(filters.card_family)) return false;
  if (filters.element != null && snapshot.subject.element !== String(filters.element)) return false;
  if (filters.essence_subtype != null && snapshot.subject.essence_subtype !== String(filters.essence_subtype)) return false;
  return true;
}
function targetReferenceMatchesSnapshot(
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot,
  value: unknown,
  context: RuntimeV02EssenceAttachedPredicateContext,
  error: string,
): boolean {
  if (value == null || String(value) === "$attached_creature") return true;
  if (String(value) === "$source_creature") {
    return context.source_creature_uid === snapshot.target.uid;
  }
  throw new Error(error);
}

/** Captures every mutable fact used by frozen Set One essence_attached requirements. */
export function runtimeV02SnapshotEssenceAttachedEligibility(
  state: Record<string, unknown>,
  event: RuntimeV02EssenceAttachedListenerEvent,
): RuntimeV02EssenceAttachedEligibilitySnapshot {
  if (event.event !== "essence_attached" || event.turn_seq !== TURN(state)) {
    throw new Error("tcg_v0_2_attachment_snapshot_event_invalid");
  }
  const target = targetField(state, event);
  const subject = target.cr.essence.find((item) => item.uid === event.subject_uid);
  if (!subject || subject.card_id !== event.subject_card_id) {
    throw new Error("tcg_v0_2_attachment_snapshot_subject_not_attached");
  }
  const targetDefinition = runtimeV02Definition(state, target.top);
  const subjectDefinition = runtimeV02Definition(state, subject);
  if (!targetDefinition || !subjectDefinition) {
    throw new Error("tcg_v0_2_attachment_snapshot_definition_missing");
  }
  const cardFamily = S(subjectDefinition.card_family, "tcg_v0_2_attachment_snapshot_subject_family_missing");
  if (cardFamily !== "Essence") throw new Error("tcg_v0_2_attachment_snapshot_subject_not_essence");
  const targetElement = S(targetDefinition.element, "tcg_v0_2_attachment_snapshot_target_element_missing");
  const subjectElement = S(subjectDefinition.element, "tcg_v0_2_attachment_snapshot_subject_element_missing");
  const targetCreature = O(targetDefinition.creature);
  const stage = S(
    targetCreature?.stage ?? targetDefinition.creature_stage ?? targetDefinition.stage,
    "tcg_v0_2_attachment_snapshot_target_stage_missing",
  );
  const essenceDefinition = O(subjectDefinition.essence);
  const subtype = essenceDefinition?.subtype ?? subjectDefinition.essence_subtype ?? subjectDefinition.subtype;
  return structuredClone({
    event: { ...event },
    active_seat: SEAT(state.active_seat),
    target: {
      controller_seat: target.seat,
      uid: target.top.uid,
      zone: target.where,
      index: target.index,
      element: targetElement,
      stage,
      damaged: Number(target.cr.damage || 0) > 0,
      conditions: conditionNames(target.cr),
    },
    subject: {
      uid: subject.uid,
      card_id: subject.card_id,
      card_family: cardFamily,
      element: subjectElement,
      essence_subtype: subtype == null ? null : String(subtype),
    },
    voluntary_withdrawal_legal_with_incoming: withdrawalLegal(state, event.controller_seat, target),
  } satisfies RuntimeV02EssenceAttachedEligibilitySnapshot);
}

/** Evaluates attachment-specific requirements strictly from trigger-time snapshot truth. */
export function runtimeV02EssenceAttachedSnapshotPredicate(
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot,
  raw: unknown,
  context: RuntimeV02EssenceAttachedPredicateContext,
): boolean | null {
  const value = O(raw);
  if (!value) throw new Error("tcg_v0_2_attachment_snapshot_predicate_invalid");
  const predicate = S(value.predicate, "tcg_v0_2_attachment_snapshot_predicate_required");
  switch (predicate) {
    case "source_is_self":
      return context.source_uid === snapshot.event.subject_uid;
    case "event_origin_zone_is":
      return snapshot.event.origin_zone === String(value.zone || "");
    case "event_controller_is_self":
      return context.source_controller_seat === snapshot.event.controller_seat;
    case "event_controller_is_active_seat":
      return snapshot.event.controller_seat === snapshot.active_seat;
    case "event_subject_matches":
      return subjectMatches(snapshot, value.filters);
    case "event_attachment_target_is_source":
      return context.source_creature_uid === snapshot.event.attachment_target_uid;
    case "event_attachment_kind_is":
      return snapshot.event.attachment_kind === String(value.kind || "");
    case "target_element_is":
      return targetReferenceMatchesSnapshot(
        snapshot,
        value.target,
        context,
        "tcg_v0_2_attachment_snapshot_target_element_target_unsupported",
      ) && snapshot.target.element === String(value.element || "");
    case "target_zone_is":
      return targetReferenceMatchesSnapshot(
        snapshot,
        value.target,
        context,
        "tcg_v0_2_attachment_snapshot_target_zone_target_unsupported",
      ) && snapshot.target.zone === String(value.zone || "");
    case "target_stage_in":
      if (!Array.isArray(value.stages)) throw new Error("tcg_v0_2_attachment_snapshot_target_stages_invalid");
      return targetReferenceMatchesSnapshot(
        snapshot,
        value.target,
        context,
        "tcg_v0_2_attachment_snapshot_target_stage_target_unsupported",
      ) && value.stages.map(String).includes(snapshot.target.stage);
    case "target_has_condition":
      return targetReferenceMatchesSnapshot(
        snapshot,
        value.target,
        context,
        "tcg_v0_2_attachment_snapshot_target_condition_target_unsupported",
      ) && snapshot.target.conditions.includes(String(value.condition || ""));
    case "target_damaged":
      return targetReferenceMatchesSnapshot(
        snapshot,
        value.target,
        context,
        "tcg_v0_2_attachment_snapshot_target_damaged_target_unsupported",
      ) && snapshot.target.damaged;
    case "voluntary_withdrawal_legal_with_incoming":
      if (String(value.player || "self") !== "self" || String(value.incoming_target || "") !== "$attached_creature") {
        throw new Error("tcg_v0_2_attachment_snapshot_withdrawal_shape_unsupported");
      }
      return snapshot.voluntary_withdrawal_legal_with_incoming;
    default:
      return null;
  }
}
