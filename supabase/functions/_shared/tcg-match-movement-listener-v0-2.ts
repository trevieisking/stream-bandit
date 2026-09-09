import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import { runtimeV02SwitchContextById, type RuntimeV02SwitchMovementEvent } from "./tcg-match-switch-context-v0-2.ts";
import { applyRuntimeV02HealPacket } from "./tcg-match-heal-packet-v0-2.ts";
import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import { recordRuntimeV02EssenceMovement } from "./tcg-match-essence-movement-v0-2.ts";
import { structuredRuntimeWithdrawalBaseCost } from "./tcg-match-withdrawal-v0-2.ts";
import {
  runtimeV02CurrentTurnEssenceAttachmentEvents,
  runtimeV02LatestEssenceAttachmentEventForSource,
} from "./tcg-match-essence-attachment-event-v0-2.ts";
import { applyRuntimeCondition, recordRuntimeEvent, runtimeConditions } from "../tcg-tactic-actions/runtime-v0-2-core.ts";

type Inst = { uid: string; card_id: string; attached_turn?: number; effect_flags?: Record<string, unknown> };
type Cr = {
  stack: Inst[];
  essence: Inst[];
  relic: Inst | null;
  damage: number;
  shield: number;
  condition?: string | null;
  conditions?: Record<string, unknown>;
  flags?: Record<string, unknown>;
  became_vanguard_turn?: number;
};
type Field = { seat: 1 | 2; where: "vanguard" | "reserve"; index: number | null; cr: Cr; top: Inst; def: Record<string, unknown> };
type Candidate = { kind: "ability" | "essence" | "relic" | "realm"; source: Inst; seat: 1 | 2; field: Field | null; listener: Record<string, unknown> };
type WorkItem = { event: RuntimeV02SwitchMovementEvent; source_uid: string; listener_id: string };
type CardRef = { uid: string; card_id: string; zone_owner_seat: 1 | 2 };
type CreatureRef = { seat: 1 | 2; anchor_uid: string };

type Continuation = {
  turn_seq: number;
  work: WorkItem[];
  work_index: number;
  step_cursor: number;
  vars: Record<string, unknown>;
  processed_listener_keys: string[];
  emitted_heal_packet_ids: string[];
};

export type RuntimeV02PendingMovementListenerChoice = {
  id: string;
  seat: 1 | 2;
  turn_seq: number;
  kind: "discard_from_hand" | "order_deck_top" | "move_attached_essence";
  prompt: string;
  min: number;
  max: number;
  mode: "select" | "order";
  options: Array<{ id: string; label: string; data: Record<string, unknown> }>;
  context: Record<string, unknown>;
};

export type RuntimeV02MovementListenerFlow = {
  status: "complete" | "player_choice_required";
  processed_listener_keys: string[];
  emitted_heal_packet_ids: string[];
  pending_choice: RuntimeV02PendingMovementListenerChoice | null;
};

export type RuntimeV02PrivateMovementInspectionView = {
  turn_seq: number;
  controller_seat: 1 | 2;
  zone_owner_seat: 1 | 2;
  zone: "deck_top";
  cards: Array<{ position: number; uid: string; card_id: string }>;
};

const CONTINUATION_KEY = "runtime_v0_2_movement_listener_continuation";
const PENDING_KEY = "pending_movement_listener_choice";
const STATE_KEY = "runtime_v0_2_movement_listener_state";
const PRIVATE_INSPECTION_KEY = "runtime_v0_2_private_movement_inspection";

function O(value: unknown): Record<string, unknown> | null { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function S(value: unknown, error: string): string { if (typeof value === "string" && value.trim()) return value.trim(); throw new Error(error); }
function N(value: unknown, error: string): number { const n = Number(value); if (Number.isFinite(n)) return n; throw new Error(error); }
function SEAT(value: unknown, error = "tcg_v0_2_movement_listener_seat_invalid"): 1 | 2 { if (value === 1 || value === 2) return value; throw new Error(error); }
function TURN(state: Record<string, unknown>): number { const n = Number(state.turn_seq); if (!Number.isInteger(n) || n < 0) throw new Error("tcg_v0_2_movement_listener_turn_seq_invalid"); return n; }
function LIST(value: unknown, error: string): unknown[] { if (!Array.isArray(value)) throw new Error(error); return value; }
function topInst(cr: Cr | null | undefined): Inst | null { return cr?.stack?.length ? cr.stack[cr.stack.length - 1] : null; }
function def(state: Record<string, unknown>, inst: Inst | string): Record<string, unknown> { const d = runtimeV02Definition(state, inst); if (!d) throw new Error("tcg_v0_2_movement_listener_definition_missing"); return d; }
function cardName(state: Record<string, unknown>, card: { card_id: string }): string { return String(def(state, card.card_id).name || card.card_id); }
function allFields(state: Record<string, unknown>): Field[] {
  const players = O(state.players); if (!players) throw new Error("tcg_v0_2_movement_listener_players_required");
  const out: Field[] = [];
  for (const seat of [1, 2] as const) {
    const player = O(players[String(seat)]); if (!player) throw new Error("tcg_v0_2_movement_listener_player_required");
    const reserve = player.reserve; if (reserve != null && !Array.isArray(reserve)) throw new Error("tcg_v0_2_movement_listener_reserve_invalid");
    const zones: Array<["vanguard" | "reserve", number | null, unknown]> = [["vanguard", null, player.vanguard], ...[0,1,2,3].map((i) => ["reserve", i, Array.isArray(reserve) ? reserve[i] : null] as ["reserve", number, unknown])];
    for (const [where, index, raw] of zones) {
      if (raw == null) continue;
      const cr = O(raw) as Cr | null;
      if (!cr || !Array.isArray(cr.stack) || cr.stack.length === 0) throw new Error("tcg_v0_2_movement_listener_creature_invalid");
      const top = topInst(cr); if (!top?.uid || !top.card_id) throw new Error("tcg_v0_2_movement_listener_top_invalid");
      out.push({ seat, where, index, cr, top, def: def(state, top) });
    }
  }
  return out;
}
function fieldByUid(state: Record<string, unknown>, uid: string): Field | null { return allFields(state).find((field) => field.top.uid === uid) || null; }
function creatureRef(field: Field): CreatureRef { return { seat: field.seat, anchor_uid: field.top.uid }; }
function fieldFromRef(state: Record<string, unknown>, ref: CreatureRef): Field | null { const field = fieldByUid(state, ref.anchor_uid); return field?.seat === ref.seat ? field : null; }
function listenerId(candidate: Candidate): string { return S(candidate.listener.id, "tcg_v0_2_movement_listener_id_required"); }
function listeners(value: unknown, error: string): Record<string, unknown>[] {
  if (value == null) return [];
  return LIST(value, error).map((raw, index) => O(raw) || (() => { throw new Error(`${error}:${index}`); })());
}
function collectCandidates(state: Record<string, unknown>, eventName: string): Candidate[] {
  const out: Candidate[] = [];
  for (const field of allFields(state)) {
    const creature = O(field.def.creature);
    const ability = O(creature?.ability);
    if (ability && ability.mode === "triggered" && String(ability.event || "") === eventName) out.push({ kind: "ability", source: field.top, seat: field.seat, field, listener: ability });
    if (!Array.isArray(field.cr.essence)) throw new Error("tcg_v0_2_movement_listener_essence_zone_invalid");
    for (const source of field.cr.essence) {
      const essence = O(def(state, source).essence);
      for (const listener of listeners(essence?.listeners, "tcg_v0_2_movement_listener_essence_list_invalid")) if (String(listener.event || "") === eventName) out.push({ kind: "essence", source, seat: field.seat, field, listener });
    }
    if (field.cr.relic) {
      const source = field.cr.relic;
      const tactic = O(def(state, source).tactic);
      for (const listener of listeners(tactic?.listeners, "tcg_v0_2_movement_listener_relic_list_invalid")) if (String(listener.event || "") === eventName) out.push({ kind: "relic", source, seat: field.seat, field, listener });
    }
  }
  const realm = O(state.realm);
  if (realm) {
    const sourceRaw = O(realm.card);
    if (!sourceRaw) throw new Error("tcg_v0_2_movement_listener_realm_card_invalid");
    const source = sourceRaw as Inst;
    if (!source.uid || !source.card_id) throw new Error("tcg_v0_2_movement_listener_realm_source_invalid");
    const tactic = O(def(state, source).tactic);
    for (const listener of listeners(tactic?.listeners, "tcg_v0_2_movement_listener_realm_list_invalid")) if (String(listener.event || "") === eventName) out.push({ kind: "realm", source, seat: SEAT(realm.owner_seat, "tcg_v0_2_movement_listener_realm_owner_invalid"), field: null, listener });
  }
  return out;
}
function findCandidate(state: Record<string, unknown>, work: WorkItem): Candidate {
  const found = collectCandidates(state, work.event.event).find((candidate) => candidate.source.uid === work.source_uid && listenerId(candidate) === work.listener_id);
  if (!found) throw new Error(`tcg_v0_2_movement_listener_source_missing:${work.source_uid}:${work.listener_id}`);
  return found;
}
function structuredEnabled(state: Record<string, unknown>): boolean {
  const cardIndex = O(state.card_index); if (!cardIndex) return false;
  const first = Object.keys(cardIndex)[0]; return !!(first && runtimeV02Definition(state, first));
}
function targetOpponent(state: Record<string, unknown>, seat: 1 | 2): Field | null {
  const player = O(O(state.players)?.[String(seat === 1 ? 2 : 1)]); const cr = player?.vanguard as Cr | null | undefined;
  const top = cr ? topInst(cr) : null; return top ? fieldByUid(state, top.uid) : null;
}
function eventSubject(state: Record<string, unknown>, event: RuntimeV02SwitchMovementEvent): Field { const field = fieldByUid(state, event.subject_uid); if (!field) throw new Error("tcg_v0_2_movement_listener_event_subject_missing"); return field; }
function eventMatchesFilters(state: Record<string, unknown>, event: RuntimeV02SwitchMovementEvent, filters: unknown): boolean {
  const f = O(filters) || {}; const subject = eventSubject(state, event); const d = subject.def;
  if (f.card_family != null && String(d.card_family || "") !== String(f.card_family)) return false;
  if (f.element != null && String(d.element || "") !== String(f.element)) return false;
  if (f.exclude_element != null && String(d.element || "") === String(f.exclude_element)) return false;
  return true;
}
function requirement(state: Record<string, unknown>, raw: unknown, candidate: Candidate, event: RuntimeV02SwitchMovementEvent): boolean {
  const value = O(raw); if (!value) throw new Error("tcg_v0_2_movement_listener_requirement_invalid");
  if (Object.hasOwn(value, "all")) { if (Object.keys(value).length !== 1) throw new Error("tcg_v0_2_movement_listener_all_invalid"); return LIST(value.all, "tcg_v0_2_movement_listener_all_invalid").every((item) => requirement(state, item, candidate, event)); }
  if (Object.hasOwn(value, "any")) { if (Object.keys(value).length !== 1) throw new Error("tcg_v0_2_movement_listener_any_invalid"); const items = LIST(value.any, "tcg_v0_2_movement_listener_any_invalid"); if (!items.length) throw new Error("tcg_v0_2_movement_listener_any_empty"); return items.some((item) => requirement(state, item, candidate, event)); }
  if (Object.hasOwn(value, "not")) { if (Object.keys(value).length !== 1) throw new Error("tcg_v0_2_movement_listener_not_invalid"); return !requirement(state, value.not, candidate, event); }
  const predicate = S(value.predicate, "tcg_v0_2_movement_listener_predicate_required");
  switch (predicate) {
    case "source_is_self": return candidate.seat === event.controller_seat;
    case "event_subject_is_source": return !!candidate.field && candidate.field.top.uid === event.subject_uid;
    case "event_subject_is_attached_creature": return !!candidate.field && candidate.field.top.uid === event.subject_uid;
    case "event_origin_zone_is": return event.origin_zone === String(value.zone || "");
    case "event_destination_zone_is": return event.destination_zone === String(value.zone || "");
    case "event_action_kind_is": return event.action_kind === String(value.action_kind || "");
    case "event_controller_is_active_seat": return event.controller_seat === Number(state.active_seat);
    case "event_controller_is_self": return event.controller_seat === candidate.seat;
    case "event_subject_matches": return eventMatchesFilters(state, event, value.filters);
    case "target_damaged": {
      const target = String(value.target || "");
      if (target !== "$source_creature" && target !== "$attached_creature") throw new Error(`tcg_v0_2_movement_listener_target_damaged_unsupported:${target}`);
      if (!candidate.field) return false;
      return Number(candidate.field.cr.damage || 0) > 0;
    }
    case "control_condition_slot_empty": {
      if (String(value.target || "") !== "$current_opponent_vanguard") throw new Error("tcg_v0_2_movement_listener_condition_slot_target_unsupported");
      const opponent = targetOpponent(state, candidate.seat); return !!opponent && !runtimeConditions(opponent.cr).control;
    }
    case "event_occurred": {
      if (String(value.event || "") !== "essence_attached" || String(value.window || "") !== "current_turn") throw new Error("tcg_v0_2_movement_listener_event_occurred_unsupported");
      const controller = String(value.controller || ""); if (controller !== "self") throw new Error("tcg_v0_2_movement_listener_event_controller_unsupported");
      const filters = O(value.filters) || {};
      const sourceFilter = String(filters.source_card_uid || ""); if (sourceFilter !== "self") throw new Error("tcg_v0_2_movement_listener_attachment_source_filter_unsupported");
      const originZone = String(filters.origin_zone || "");
      const min = Math.max(1, Number(value.min_count || 1));
      return runtimeV02CurrentTurnEssenceAttachmentEvents(state, candidate.seat).filter((attachment) => attachment.source_card_uid === candidate.source.uid && (!originZone || attachment.origin_zone === originZone)).length >= min;
    }
    default: throw new Error(`tcg_v0_2_movement_listener_predicate_unsupported:${predicate}`);
  }
}
function matches(state: Record<string, unknown>, candidate: Candidate, event: RuntimeV02SwitchMovementEvent): boolean {
  const timing = candidate.kind === "ability" ? String(candidate.listener.timing || "any") : "any";
  if (timing === "own_turn" && candidate.seat !== Number(state.active_seat)) return false;
  if (!["own_turn", "any", "passive"].includes(timing)) throw new Error(`tcg_v0_2_movement_listener_timing_unsupported:${timing}`);
  const scope = candidate.listener.controller_scope;
  if (scope != null && scope !== "any" && scope !== "self") throw new Error(`tcg_v0_2_movement_listener_controller_scope_unsupported:${scope}`);
  if (scope === "self" && event.controller_seat !== candidate.seat) return false;
  return candidate.listener.requirements == null || requirement(state, candidate.listener.requirements, candidate, event);
}
function listenerState(state: Record<string, unknown>): { turn_seq: number; receipts: Record<string, unknown>; limits: Record<string, unknown> } {
  const turnSeq = TURN(state); const raw = O(state[STATE_KEY]);
  if (!raw || Number(raw.turn_seq) !== turnSeq) { const fresh = { turn_seq: turnSeq, receipts: {}, limits: {} }; state[STATE_KEY] = fresh; return fresh; }
  const receipts = O(raw.receipts); const limits = O(raw.limits); if (!receipts || !limits) throw new Error("tcg_v0_2_movement_listener_state_invalid");
  return raw as { turn_seq: number; receipts: Record<string, unknown>; limits: Record<string, unknown> };
}
function receiptKey(candidate: Candidate, event: RuntimeV02SwitchMovementEvent): string { return `${event.switch_id}:${event.event}:${candidate.source.uid}:${listenerId(candidate)}`; }
function alreadyResolved(state: Record<string, unknown>, candidate: Candidate, event: RuntimeV02SwitchMovementEvent): boolean { return Object.hasOwn(listenerState(state).receipts, receiptKey(candidate, event)); }
function markResolved(state: Record<string, unknown>, candidate: Candidate, event: RuntimeV02SwitchMovementEvent): void { listenerState(state).receipts[receiptKey(candidate, event)] = { switch_id: event.switch_id, event: event.event, source_uid: candidate.source.uid, listener_id: listenerId(candidate) }; }
function limitKey(state: Record<string, unknown>, candidate: Candidate, event: RuntimeV02SwitchMovementEvent): { key: string; count: number; scope: string } | null {
  const limit = O(candidate.listener.limit); if (!limit) return null;
  const count = Number(limit.count); if (!Number.isInteger(count) || count < 1) throw new Error("tcg_v0_2_movement_listener_limit_count_invalid");
  const scope = String(limit.scope || ""); const owner = String(limit.owner || ""); let ownerKey = "";
  if (owner === "card_instance") ownerKey = `card:${candidate.source.uid}`;
  else if (owner === "controller") ownerKey = `controller:${candidate.seat}`;
  else if (owner === "event_controller") ownerKey = `event-controller:${event.controller_seat}`;
  else if (owner === "attachment") ownerKey = `attachment:${candidate.source.uid}`;
  else throw new Error(`tcg_v0_2_movement_listener_limit_owner_unsupported:${owner}`);
  if (scope === "attachment") {
    if (owner !== "attachment") throw new Error("tcg_v0_2_movement_listener_attachment_scope_owner_invalid");
    const attachment = runtimeV02LatestEssenceAttachmentEventForSource(state, candidate.source.uid);
    if (!attachment) throw new Error("tcg_v0_2_movement_listener_attachment_scope_event_required");
    ownerKey += `:${attachment.id}`;
  } else if (scope !== "turn") throw new Error(`tcg_v0_2_movement_listener_limit_scope_unsupported:${scope}`);
  return { key: `${listenerId(candidate)}:${ownerKey}`, count, scope };
}
function limitUsed(state: Record<string, unknown>, info: { key: string; count: number; scope: string } | null): number {
  if (!info) return 0; const raw = O(listenerState(state).limits[info.key]); if (!raw) return 0;
  const count = Number(raw.count); if (!Number.isInteger(count) || count < 0) throw new Error("tcg_v0_2_movement_listener_limit_state_invalid");
  if (info.scope === "turn" && Number(raw.turn_seq) !== TURN(state)) return 0; return count;
}
function consumeLimit(state: Record<string, unknown>, info: { key: string; count: number; scope: string } | null): void {
  if (!info) return; const used = limitUsed(state, info); if (used >= info.count) throw new Error("tcg_v0_2_movement_listener_limit_already_consumed");
  listenerState(state).limits[info.key] = { count: used + 1, turn_seq: TURN(state), scope: info.scope };
}
function getContinuation(state: Record<string, unknown>): Continuation {
  const raw = O(state[CONTINUATION_KEY]); if (!raw) throw new Error("tcg_v0_2_movement_listener_continuation_required");
  if (Number(raw.turn_seq) !== TURN(state) || !Array.isArray(raw.work) || !Array.isArray(raw.processed_listener_keys) || !Array.isArray(raw.emitted_heal_packet_ids) || !O(raw.vars)) throw new Error("tcg_v0_2_movement_listener_continuation_invalid");
  return raw as unknown as Continuation;
}
function setContinuation(state: Record<string, unknown>, value: Continuation): void { state[CONTINUATION_KEY] = value as unknown as Record<string, unknown>; }
function clearContinuation(state: Record<string, unknown>): void { delete state[CONTINUATION_KEY]; delete state[PENDING_KEY]; }
function currentWork(continuation: Continuation): WorkItem | null { return continuation.work[continuation.work_index] || null; }
function targetForToken(state: Record<string, unknown>, candidate: Candidate, event: RuntimeV02SwitchMovementEvent, raw: unknown): Field {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const selector = raw as Record<string, unknown>;
    const controller = String(selector.controller || ""); const zone = String(selector.zone || "");
    if (zone !== "vanguard") throw new Error("tcg_v0_2_movement_listener_target_selector_zone_unsupported");
    const seat = controller === "self" ? candidate.seat : controller === "opponent" ? (candidate.seat === 1 ? 2 : 1) : null;
    if (!seat) throw new Error("tcg_v0_2_movement_listener_target_selector_controller_unsupported");
    const player = O(O(state.players)?.[String(seat)]); const top = topInst(player?.vanguard as Cr | null); const field = top ? fieldByUid(state, top.uid) : null;
    if (!field) throw new Error("tcg_v0_2_movement_listener_target_missing"); return field;
  }
  const token = String(raw || "");
  if ((token === "$source_creature" || token === "$attached_creature") && candidate.field) return candidate.field;
  if (token === "$event_subject") return eventSubject(state, event);
  if (token === "$current_opponent_vanguard") { const found = targetOpponent(state, candidate.seat); if (found) return found; }
  const switchContext = runtimeV02SwitchContextById(state, event.switch_id);
  if (!switchContext) throw new Error("tcg_v0_2_movement_listener_switch_context_missing");
  if (token === "$switch_incoming_vanguard") { const field = fieldByUid(state, switchContext.incoming_vanguard_uid); if (field) return field; }
  if (token === "$switch_outgoing_vanguard") { const field = fieldByUid(state, switchContext.outgoing_vanguard_uid); if (field) return field; }
  throw new Error(`tcg_v0_2_movement_listener_target_unsupported:${token}`);
}
function playerForToken(candidate: Candidate, token: unknown): 1 | 2 {
  const value = String(token || "self"); if (value === "self") return candidate.seat; if (value === "opponent") return candidate.seat === 1 ? 2 : 1; throw new Error(`tcg_v0_2_movement_listener_player_unsupported:${value}`);
}
function setPrivateInspection(state: Record<string, unknown>, controller: 1 | 2, zoneOwner: 1 | 2, cards: CardRef[]): void {
  const root = O(state[PRIVATE_INSPECTION_KEY]) || {}; root[String(controller)] = { turn_seq: TURN(state), controller_seat: controller, zone_owner_seat: zoneOwner, zone: "deck_top", cards: cards.map((card, position) => ({ position, uid: card.uid, card_id: card.card_id })) }; state[PRIVATE_INSPECTION_KEY] = root;
}
function inspectDeckTop(state: Record<string, unknown>, candidate: Candidate, ownerSeat: 1 | 2, count: number, exactMinimum: number): CardRef[] {
  const player = O(O(state.players)?.[String(ownerSeat)]); if (!player || !Array.isArray(player.deck)) throw new Error("tcg_v0_2_movement_listener_deck_missing");
  if (player.deck.length < exactMinimum) throw new Error("tcg_v0_2_movement_listener_inspection_cards_unavailable");
  const cards = (player.deck as Inst[]).slice(0, Math.min(count, player.deck.length)).map((card) => ({ uid: S(card.uid, "tcg_v0_2_movement_listener_inspection_uid_invalid"), card_id: S(card.card_id, "tcg_v0_2_movement_listener_inspection_card_id_invalid"), zone_owner_seat: ownerSeat }));
  if (cards.length) { recordRuntimeV02HiddenInformationView(state, candidate.seat, "deck_top"); setPrivateInspection(state, candidate.seat, ownerSeat, cards); }
  return cards;
}
function choice(state: Record<string, unknown>, pending: Omit<RuntimeV02PendingMovementListenerChoice, "id" | "turn_seq">): RuntimeV02PendingMovementListenerChoice {
  const installed = { ...pending, id: crypto.randomUUID(), turn_seq: TURN(state) } satisfies RuntimeV02PendingMovementListenerChoice; state[PENDING_KEY] = installed as unknown as Record<string, unknown>; return installed;
}
function pending(state: Record<string, unknown>): RuntimeV02PendingMovementListenerChoice | null { return (O(state[PENDING_KEY]) as unknown as RuntimeV02PendingMovementListenerChoice | null) || null; }
function validateDuration(step: Record<string, unknown>, errorPrefix: string): { expiresOn: string[]; maxUses: number | null } {
  const duration = O(step.duration); if (!duration) throw new Error(`${errorPrefix}_duration_required`);
  const expiresOn = Array.isArray(duration.expires_on) ? duration.expires_on.map(String) : [];
  if (!expiresOn.includes("end_of_turn")) throw new Error(`${errorPrefix}_expiry_unsupported`);
  const raw = duration.max_uses; const maxUses = raw == null ? null : Number(raw); if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) throw new Error(`${errorPrefix}_max_uses_invalid`);
  return { expiresOn, maxUses };
}
function addAttackModifier(state: Record<string, unknown>, target: Field, step: Record<string, unknown>): void {
  const amount = N(step.amount, "tcg_v0_2_movement_listener_attack_modifier_amount_invalid"); if (amount < 0) throw new Error("tcg_v0_2_movement_listener_attack_modifier_negative_unsupported"); validateDuration(step, "tcg_v0_2_movement_listener_attack_modifier");
  target.cr.flags ||= {}; const flags = target.cr.flags as Record<string, unknown>; const prior = O(flags.lifecycle_attack_bonus);
  const currentAmount = prior && Number(prior.turn_seq) === TURN(state) ? Math.max(0, Number(prior.amount || 0)) : 0;
  flags.lifecycle_attack_bonus = { turn_seq: TURN(state), amount: currentAmount + amount, uses: 1, expires: "end_of_turn" };
}
function baseWithdrawalCost(state: Record<string, unknown>, target: Field): number {
  const creature = O(target.def.creature); const printed = Number(creature?.withdrawal ?? target.def.withdrawal ?? target.def.withdraw ?? 0); if (!Number.isFinite(printed) || printed < 0) throw new Error("tcg_v0_2_movement_listener_withdrawal_printed_invalid");
  const conditions = runtimeConditions(target.cr); const structured = structuredRuntimeWithdrawalBaseCost(state, target.cr, printed, String(target.def.element || ""), conditions.modifier === "Crushed"); return structured == null ? printed : structured;
}
function setWithdrawalModifier(state: Record<string, unknown>, target: Field, step: Record<string, unknown>): void {
  validateDuration(step, "tcg_v0_2_movement_listener_withdrawal_modifier"); target.cr.flags ||= {}; const flags = target.cr.flags as Record<string, unknown>; const prior = O(flags.lifecycle_withdrawal_cost);
  let value = prior && Number(prior.turn_seq) === TURN(state) ? Number(prior.value) : baseWithdrawalCost(state, target);
  const mode = String(step.mode || "delta"); if (mode === "set") value = N(step.amount, "tcg_v0_2_movement_listener_withdrawal_modifier_amount_invalid"); else if (mode === "delta") value += N(step.amount ?? step.delta, "tcg_v0_2_movement_listener_withdrawal_modifier_delta_invalid"); else throw new Error(`tcg_v0_2_movement_listener_withdrawal_modifier_mode_unsupported:${mode}`);
  const minimum = step.minimum == null ? 0 : N(step.minimum, "tcg_v0_2_movement_listener_withdrawal_modifier_minimum_invalid"); value = Math.max(minimum, value); flags.lifecycle_withdrawal_cost = { turn_seq: TURN(state), value: Math.max(0, value), expires: "end_of_turn" };
}
function directDamage(target: Field, amount: unknown): number { const n = Math.max(0, N(amount, "tcg_v0_2_movement_listener_direct_damage_amount_invalid")); target.cr.damage = Math.max(0, Number(target.cr.damage || 0)) + n; return n; }
function applyCondition(state: Record<string, unknown>, candidate: Candidate, event: RuntimeV02SwitchMovementEvent, target: Field, step: Record<string, unknown>): void {
  const condition = S(step.condition, "tcg_v0_2_movement_listener_condition_required"); const mode = String(step.mode || "apply") as "apply" | "apply_if_empty" | "apply_if_empty_or_same" | "replace"; const result = applyRuntimeCondition(target.cr, condition, TURN(state), mode);
  if (result.applied) recordRuntimeEvent(state, "condition_changed", { turn_seq: TURN(state), controller_seat: candidate.seat, target_controller_seat: target.seat, subject_uid: target.top.uid, condition, change_kind: mode === "replace" ? "replace" : "apply", source_event: event.event, source_switch_id: event.switch_id, source_listener_id: listenerId(candidate) });
}
function buildMoveEssenceOptions(state: Record<string, unknown>, candidate: Candidate, step: Record<string, unknown>): Array<{ id: string; label: string; data: Record<string, unknown> }> {
  if (!candidate.field) throw new Error("tcg_v0_2_movement_listener_move_essence_source_field_required");
  if (String(step.controller || "self") !== "self") throw new Error("tcg_v0_2_movement_listener_move_essence_controller_unsupported");
  const sourceSelector = O(step.source_selector); const destinationSelector = O(step.destination_selector); if (!sourceSelector || !destinationSelector) throw new Error("tcg_v0_2_movement_listener_move_essence_selector_required");
  if (String(sourceSelector.zone || "field") !== "reserve") throw new Error("tcg_v0_2_movement_listener_move_essence_source_zone_unsupported");
  if (String(destinationSelector.fixed || "") !== "$source_creature") throw new Error("tcg_v0_2_movement_listener_move_essence_destination_unsupported");
  const element = step.element == null ? null : String(step.element); const options: Array<{ id: string; label: string; data: Record<string, unknown> }> = [];
  for (const source of allFields(state).filter((field) => field.seat === candidate.seat && field.where === "reserve")) {
    if (O(sourceSelector.filters)?.exclude_source === true && source.top.uid === candidate.field.top.uid) continue;
    for (const essence of source.cr.essence || []) {
      if (element && String(def(state, essence).element || "") !== element) continue;
      options.push({ id: `move:${essence.uid}:${candidate.field.top.uid}`, label: `${cardName(state, essence)} to ${String(candidate.field.def.name || "Creature")}`, data: { essence_uid: essence.uid, source: creatureRef(source), destination: creatureRef(candidate.field) } });
    }
  }
  return options;
}
function range(raw: unknown): { min: number; max: number } { if (typeof raw === "number") return { min: raw, max: raw }; const r = O(raw) || {}; return { min: Math.max(0, Number(r.min || 0)), max: Math.max(0, Number(r.max || 0)) }; }
function applyMoveEssenceChoice(state: Record<string, unknown>, candidate: Candidate, selected: Array<{ data: Record<string, unknown> }>, sourceActionId: string): void {
  for (const option of selected) {
    const source = fieldFromRef(state, option.data.source as unknown as CreatureRef); const destination = fieldFromRef(state, option.data.destination as unknown as CreatureRef); if (!source || !destination) throw new Error("tcg_v0_2_movement_listener_essence_move_creature_stale");
    const uid = S(option.data.essence_uid, "tcg_v0_2_movement_listener_essence_move_uid_invalid"); const index = source.cr.essence.findIndex((item) => item.uid === uid); if (index < 0) throw new Error("tcg_v0_2_movement_listener_essence_move_source_stale"); const essence = source.cr.essence.splice(index, 1)[0]; destination.cr.essence.push(essence);
    recordRuntimeV02EssenceMovement(state, candidate.seat, source.top.uid, destination.top.uid, essence, sourceActionId);
  }
}
function executeStep(state: Record<string, unknown>, continuation: Continuation, candidate: Candidate, event: RuntimeV02SwitchMovementEvent, step: Record<string, unknown>): "continue" | "choice" {
  const op = String(step.op || "");
  if (op === "DRAW") { const seat = playerForToken(candidate, step.player); const player = O(O(state.players)?.[String(seat)]); if (!player || !Array.isArray(player.deck) || !Array.isArray(player.hand)) throw new Error("tcg_v0_2_movement_listener_draw_zones_missing"); const count = Math.max(0, Number(step.count || 0)); (player.hand as Inst[]).push(...(player.deck as Inst[]).splice(0, Math.min(count, player.deck.length))); continuation.step_cursor++; return "continue"; }
  if (op === "CHOOSE_HAND_TO_DISCARD") { const seat = playerForToken(candidate, step.player); const player = O(O(state.players)?.[String(seat)]); if (!player || !Array.isArray(player.hand)) throw new Error("tcg_v0_2_movement_listener_hand_missing"); const wanted = range(step.count); const options = (player.hand as Inst[]).map((card) => ({ id: `card:${card.uid}`, label: cardName(state, card), data: { uid: card.uid, card_id: card.card_id } })); if (options.length < wanted.min) throw new Error("tcg_v0_2_movement_listener_discard_choice_unavailable"); choice(state, { seat, kind: "discard_from_hand", prompt: "Choose card to discard", min: wanted.min, max: Math.min(wanted.max, options.length), mode: "select", options, context: { zone_seat: seat } }); return "choice"; }
  if (op === "LOOK_TOP") { const owner = playerForToken(candidate, step.player); const count = Math.max(0, Number(step.count || 0)); continuation.vars[String(step.as || "looked")] = inspectDeckTop(state, candidate, owner, count, 0); continuation.step_cursor++; return "continue"; }
  if (op === "INSPECT_ZONE") { if (String(step.zone || "") !== "deck_top" || String(step.return_policy || "") !== "same_position" || String(step.visibility || "") !== "controller_private") throw new Error("tcg_v0_2_movement_listener_inspection_shape_unsupported"); const owner = playerForToken(candidate, step.player); const wanted = range(step.selection); const count = wanted.max; continuation.vars[String(step.as || "looked")] = inspectDeckTop(state, candidate, owner, count, wanted.min); continuation.step_cursor++; return "continue"; }
  if (op === "RETURN_SET_TO_DECK_TOP") { const cards = continuation.vars[String(step.cards || "").replace(/^\$/, "")] as CardRef[] | undefined; if (!Array.isArray(cards)) throw new Error("tcg_v0_2_movement_listener_order_set_missing"); const owner = playerForToken(candidate, step.player); const player = O(O(state.players)?.[String(owner)]); if (!player || !Array.isArray(player.deck)) throw new Error("tcg_v0_2_movement_listener_order_deck_missing"); const top = (player.deck as Inst[]).slice(0, cards.length); const expected = new Set(cards.map((card) => card.uid)); if (top.length !== cards.length || top.some((card) => !expected.has(card.uid))) throw new Error("tcg_v0_2_movement_listener_order_top_set_stale"); if (cards.length <= 1) { continuation.step_cursor++; return "continue"; } if (!String(step.order || "").includes("choice")) throw new Error("tcg_v0_2_movement_listener_order_mode_unsupported"); const options = cards.map((card) => ({ id: `card:${card.uid}`, label: cardName(state, card), data: { uid: card.uid, card_id: card.card_id, zone_owner_seat: owner } })); choice(state, { seat: candidate.seat, kind: "order_deck_top", prompt: "Choose card order", min: options.length, max: options.length, mode: "order", options, context: { zone_seat: owner, card_uids: cards.map((card) => card.uid) } }); return "choice"; }
  if (op === "HEAL") { const target = targetForToken(state, candidate, event, step.target); const amount = Math.max(0, N(step.amount, "tcg_v0_2_movement_listener_heal_amount_invalid")); const packet = applyRuntimeV02HealPacket(state, target.cr, amount, { source: { controller_seat: candidate.seat, action_kind: candidate.kind, action_id: listenerId(candidate), card_effect: true, card_uid: candidate.source.uid, card_id: candidate.source.card_id, creature_uid: candidate.field?.top.uid || null }, target: { controller_seat: target.seat, creature_uid: target.top.uid, card_uid: target.top.uid, card_id: target.top.card_id, element: S(target.def.element, "tcg_v0_2_movement_listener_heal_target_element_required"), where: target.where, index: target.index } }); if (packet.packet?.id) continuation.emitted_heal_packet_ids.push(packet.packet.id); continuation.step_cursor++; return "continue"; }
  if (op === "ADD_ATTACK_DAMAGE_MODIFIER") { addAttackModifier(state, targetForToken(state, candidate, event, step.target), step); continuation.step_cursor++; return "continue"; }
  if (op === "SET_WITHDRAWAL_MODIFIER") { setWithdrawalModifier(state, targetForToken(state, candidate, event, step.target), step); continuation.step_cursor++; return "continue"; }
  if (op === "DIRECT_DAMAGE") { directDamage(targetForToken(state, candidate, event, step.target), step.amount); continuation.step_cursor++; return "continue"; }
  if (op === "APPLY_CONDITION") { applyCondition(state, candidate, event, targetForToken(state, candidate, event, step.target), step); continuation.step_cursor++; return "continue"; }
  if (op === "MOVE_ATTACHED_ESSENCE") { const wanted = range(step.count); const options = buildMoveEssenceOptions(state, candidate, step); if (options.length < wanted.min) throw new Error("tcg_v0_2_movement_listener_essence_move_unavailable"); if (options.length === 0 && wanted.min === 0) { continuation.step_cursor++; return "continue"; } choice(state, { seat: candidate.seat, kind: "move_attached_essence", prompt: "Choose Essence move", min: wanted.min, max: Math.min(wanted.max, options.length), mode: "select", options, context: { source_action_id: `listener:${listenerId(candidate)}` } }); return "choice"; }
  throw new Error(`tcg_v0_2_movement_listener_step_unsupported:${op}`);
}
function continueFlow(state: Record<string, unknown>): RuntimeV02MovementListenerFlow {
  const continuation = getContinuation(state);
  while (continuation.work_index < continuation.work.length) {
    const work = currentWork(continuation)!; const candidate = findCandidate(state, work);
    if (alreadyResolved(state, candidate, work.event) || !matches(state, candidate, work.event)) { continuation.work_index++; continuation.step_cursor = 0; continuation.vars = {}; continue; }
    const limit = limitKey(state, candidate, work.event); if (limit && limitUsed(state, limit) >= limit.count) { continuation.work_index++; continuation.step_cursor = 0; continuation.vars = {}; continue; }
    const steps = LIST(candidate.listener.steps, "tcg_v0_2_movement_listener_steps_required").map((raw) => O(raw) || (() => { throw new Error("tcg_v0_2_movement_listener_step_invalid"); })()); if (!steps.length) throw new Error("tcg_v0_2_movement_listener_steps_empty");
    while (continuation.step_cursor < steps.length) { setContinuation(state, continuation); if (executeStep(state, continuation, candidate, work.event, steps[continuation.step_cursor]) === "choice") { setContinuation(state, continuation); return { status: "player_choice_required", processed_listener_keys: [...continuation.processed_listener_keys], emitted_heal_packet_ids: [...continuation.emitted_heal_packet_ids], pending_choice: pending(state) }; } }
    markResolved(state, candidate, work.event); consumeLimit(state, limit); continuation.processed_listener_keys.push(receiptKey(candidate, work.event)); continuation.work_index++; continuation.step_cursor = 0; continuation.vars = {};
  }
  const flow = { status: "complete" as const, processed_listener_keys: [...continuation.processed_listener_keys], emitted_heal_packet_ids: [...continuation.emitted_heal_packet_ids], pending_choice: null }; clearContinuation(state); return flow;
}

export function runtimeV02BeginMovementListenerContinuation(state: Record<string, unknown>, events: RuntimeV02SwitchMovementEvent[]): RuntimeV02MovementListenerFlow {
  if (state[CONTINUATION_KEY] != null || state[PENDING_KEY] != null) throw new Error("tcg_v0_2_movement_listener_continuation_already_pending");
  if (!structuredEnabled(state)) return { status: "complete", processed_listener_keys: [], emitted_heal_packet_ids: [], pending_choice: null };
  if (!Array.isArray(events)) throw new Error("tcg_v0_2_movement_listener_events_required"); const turnSeq = TURN(state); const work: WorkItem[] = [];
  for (const event of events) { if (Number(event.turn_seq) !== turnSeq) throw new Error("tcg_v0_2_movement_listener_event_turn_stale"); if (event.event !== "moved_to_reserve" && event.event !== "became_vanguard") throw new Error("tcg_v0_2_movement_listener_event_kind_invalid"); for (const candidate of collectCandidates(state, event.event)) work.push({ event: { ...event }, source_uid: candidate.source.uid, listener_id: listenerId(candidate) }); }
  setContinuation(state, { turn_seq: turnSeq, work, work_index: 0, step_cursor: 0, vars: {}, processed_listener_keys: [], emitted_heal_packet_ids: [] }); return continueFlow(state);
}

function selectedOptions(pendingChoice: RuntimeV02PendingMovementListenerChoice, ids: string[]): Array<{ id: string; label: string; data: Record<string, unknown> }> {
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw new Error("tcg_v0_2_movement_listener_choice_ids_invalid"); if (ids.length < pendingChoice.min || ids.length > pendingChoice.max) throw new Error("tcg_v0_2_movement_listener_choice_count_invalid"); const map = new Map(pendingChoice.options.map((option) => [option.id, option])); const selected = ids.map((id) => map.get(id)); if (selected.some((value) => !value)) throw new Error("tcg_v0_2_movement_listener_choice_unknown_option"); if (pendingChoice.mode === "order" && ids.length !== pendingChoice.options.length) throw new Error("tcg_v0_2_movement_listener_choice_order_incomplete"); return selected as Array<{ id: string; label: string; data: Record<string, unknown> }>;
}
export function runtimeV02ResolveMovementListenerChoice(state: Record<string, unknown>, actorSeat: 1 | 2, choiceId: string, choiceIds: string[]): RuntimeV02MovementListenerFlow {
  const pendingChoice = pending(state); if (!pendingChoice) throw new Error("tcg_v0_2_movement_listener_choice_required"); if (pendingChoice.turn_seq !== TURN(state)) throw new Error("tcg_v0_2_movement_listener_choice_turn_stale"); if (pendingChoice.seat !== SEAT(actorSeat)) throw new Error("tcg_v0_2_movement_listener_choice_not_yours"); if (pendingChoice.id !== S(choiceId, "tcg_v0_2_movement_listener_choice_id_required")) throw new Error("tcg_v0_2_movement_listener_choice_stale_id");
  const selected = selectedOptions(pendingChoice, choiceIds); const continuation = getContinuation(state); const work = currentWork(continuation); if (!work) throw new Error("tcg_v0_2_movement_listener_choice_work_missing"); const candidate = findCandidate(state, work);
  if (pendingChoice.kind === "discard_from_hand") { const seat = SEAT(pendingChoice.context.zone_seat); const player = O(O(state.players)?.[String(seat)]); if (!player || !Array.isArray(player.hand) || !Array.isArray(player.discard)) throw new Error("tcg_v0_2_movement_listener_choice_hand_zones_missing"); for (const option of selected) { const uid = S(option.data.uid, "tcg_v0_2_movement_listener_choice_card_uid_invalid"); const index = (player.hand as Inst[]).findIndex((card) => card.uid === uid); if (index < 0) throw new Error("tcg_v0_2_movement_listener_choice_hand_stale"); (player.discard as Inst[]).push((player.hand as Inst[]).splice(index, 1)[0]); } }
  else if (pendingChoice.kind === "order_deck_top") { const seat = SEAT(pendingChoice.context.zone_seat); const player = O(O(state.players)?.[String(seat)]); if (!player || !Array.isArray(player.deck)) throw new Error("tcg_v0_2_movement_listener_choice_deck_missing"); const expected = Array.isArray(pendingChoice.context.card_uids) ? pendingChoice.context.card_uids.map(String) : []; const top = (player.deck as Inst[]).slice(0, expected.length); if (top.length !== expected.length || new Set(top.map((card) => card.uid)).size !== expected.length || top.some((card) => !expected.includes(card.uid))) throw new Error("tcg_v0_2_movement_listener_choice_deck_stale"); const byUid = new Map(top.map((card) => [card.uid, card])); const ordered = selected.map((option) => byUid.get(S(option.data.uid, "tcg_v0_2_movement_listener_choice_card_uid_invalid"))!); (player.deck as Inst[]).splice(0, expected.length, ...ordered); }
  else if (pendingChoice.kind === "move_attached_essence") applyMoveEssenceChoice(state, candidate, selected, S(pendingChoice.context.source_action_id, "tcg_v0_2_movement_listener_choice_source_action_required"));
  else throw new Error("tcg_v0_2_movement_listener_choice_kind_unsupported");
  delete state[PENDING_KEY]; continuation.step_cursor++; setContinuation(state, continuation); return continueFlow(state);
}

export function runtimeV02PendingMovementListenerChoiceView(raw: RuntimeV02PendingMovementListenerChoice | null | undefined, viewerSeat: 1 | 2): Record<string, unknown> | null {
  if (!raw) return null; const viewer = SEAT(viewerSeat); if (raw.seat !== viewer) return { id: raw.id, seat: raw.seat, kind: raw.kind, waiting: true };
  return { id: raw.id, seat: raw.seat, kind: raw.kind, prompt: raw.prompt, min: raw.min, max: raw.max, mode: raw.mode, options: raw.options.map((option) => ({ id: option.id, label: option.label })) };
}

export function runtimeV02PrivateMovementInspectionView(state: Record<string, unknown>, viewerSeat: 1 | 2): RuntimeV02PrivateMovementInspectionView | null {
  const root = O(state[PRIVATE_INSPECTION_KEY]); const raw = O(root?.[String(SEAT(viewerSeat))]); if (!raw || Number(raw.turn_seq) !== TURN(state) || Number(raw.controller_seat) !== viewerSeat || raw.zone !== "deck_top" || !Array.isArray(raw.cards)) return null;
  return { turn_seq: TURN(state), controller_seat: SEAT(raw.controller_seat), zone_owner_seat: SEAT(raw.zone_owner_seat), zone: "deck_top", cards: raw.cards.map((cardRaw, index) => { const card = O(cardRaw); if (!card) throw new Error(`tcg_v0_2_movement_listener_private_card_invalid:${index}`); return { position: Number(card.position), uid: S(card.uid, `tcg_v0_2_movement_listener_private_card_uid_invalid:${index}`), card_id: S(card.card_id, `tcg_v0_2_movement_listener_private_card_id_invalid:${index}`) }; }) };
}
