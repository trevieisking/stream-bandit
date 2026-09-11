import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02ApplyAtomicSwitch,
  type RuntimeV02SwitchMovementEvent,
} from "./tcg-match-switch-context-v0-2.ts";
import { applyRuntimeV02HealPacket } from "./tcg-match-heal-packet-v0-2.ts";
import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import { runtimeV02InspectRewardPositions } from "./tcg-match-reward-inspection-v0-2.ts";
import { structuredRuntimeWithdrawalBaseCost } from "./tcg-match-withdrawal-v0-2.ts";
import { registerStructuredRuntimeEssenceAttachmentLifecycleState } from "./tcg-match-surge-lifecycle-v0-2.ts";
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
  type RuntimeV02EssenceAttachedListenerEvent,
} from "./tcg-match-essence-attachment-event-v0-2.ts";
import {
  runtimeV02BuildEssenceAttachedTriggerPlan,
  type RuntimeV02EssenceAttachedCandidateDescriptor,
  type RuntimeV02FrozenEssenceAttachedWorkItem,
} from "./tcg-match-essence-attachment-work-v0-2.ts";
import {
  addRuntimeShield,
  applyRuntimeCondition,
  dealRuntimeEffectDamage,
  runtimeConditions,
  type ApplyConditionMode,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";

type Inst = {
  uid: string;
  card_id: string;
  attached_turn?: number;
  effect_flags?: Record<string, unknown>;
};

type Cr = {
  stack: Inst[];
  essence: Inst[];
  relic: Inst | null;
  damage: number;
  shield: number;
  condition?: string | null;
  conditions?: Record<string, unknown>;
  flags?: Record<string, unknown>;
};

type Field = {
  seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  cr: Cr;
  top: Inst;
  def: Record<string, unknown>;
};

type Candidate = {
  kind: "ability" | "essence" | "relic" | "realm";
  source: Inst;
  seat: 1 | 2;
  field: Field | null;
  listener: Record<string, unknown>;
};

export type RuntimeV02EventListenerEvent = {
  event_id: string;
  event: string;
  subject_uid: string;
  subject_card_id?: string;
  controller_seat: 1 | 2;
  origin_zone: string;
  destination_zone: string;
  destination_index: number | null;
  phase: string;
  source_action_id: string;
  source_card_uid: string | null;
  action_kind: string;
  turn_seq: number;
  attachment_target_uid?: string;
  attachment_kind?: string;
};

type WorkItem = {
  event: RuntimeV02EventListenerEvent;
  source_uid: string;
  listener_id: string;
  frozen_candidate?: RuntimeV02FrozenEssenceAttachedWorkItem;
};

type CardRef = {
  uid: string;
  card_id: string;
  zone_owner_seat: 1 | 2;
  zone: "deck" | "discard" | "rewards" | "hand";
};

type CreatureRef = {
  seat: 1 | 2;
  anchor_uid: string;
};

type Continuation = {
  turn_seq: number;
  work: WorkItem[];
  work_index: number;
  program_loaded: boolean;
  program: Record<string, unknown>[];
  step_cursor: number;
  vars: Record<string, unknown>;
  processed_listener_keys: string[];
  emitted_heal_packet_ids: string[];
  emitted_movement_events: RuntimeV02SwitchMovementEvent[];
};

export type RuntimeV02PendingEventListenerChoice = {
  id: string;
  seat: 1 | 2;
  turn_seq: number;
  event_id: string;
  source_uid: string;
  listener_id: string;
  kind:
    | "optional"
    | "choose_from_set"
    | "select_creature"
    | "select_cards"
    | "inspect_rewards"
    | "clear_condition"
    | "order_cards"
    | "attach_essence";
  prompt: string;
  min: number;
  max: number;
  mode: "select" | "order";
  options: Array<{
    id: string;
    label: string;
    data: Record<string, unknown>;
  }>;
  context: Record<string, unknown>;
};

export type RuntimeV02EventListenerFlow = {
  status: "complete" | "player_choice_required";
  processed_listener_keys: string[];
  emitted_heal_packet_ids: string[];
  emitted_movement_events: RuntimeV02SwitchMovementEvent[];
  pending_choice: RuntimeV02PendingEventListenerChoice | null;
};

export type RuntimeV02PrivateEventInspectionView = {
  turn_seq: number;
  controller_seat: 1 | 2;
  zone_owner_seat: 1 | 2;
  zone: "deck_top" | "hand";
  cards: Array<{ position: number; uid: string; card_id: string }>;
};

const CONTINUATION_KEY = "runtime_v0_2_event_listener_continuation";
const PENDING_KEY = "pending_event_listener_choice";
const STATE_KEY = "runtime_v0_2_event_listener_state";
const PRIVATE_INSPECTION_KEY = "runtime_v0_2_private_event_inspection";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function numberValue(value: unknown, error: string): number {
  const number = Number(value);
  if (Number.isFinite(number)) return number;
  throw new Error(error);
}

function normalizedSeat(
  value: unknown,
  error = "tcg_v0_2_event_listener_seat_invalid",
): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_event_listener_turn_seq_invalid");
  }
  return turn;
}

function list(value: unknown, error: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(error);
  return value;
}

function records(value: unknown, error: string): Record<string, unknown>[] {
  return list(value, error).map((item, index) => {
    const record = objectRecord(item);
    if (!record) throw new Error(`${error}:${index}`);
    return record;
  });
}

function topInst(creature: Cr | null | undefined): Inst | null {
  return creature?.stack?.length
    ? creature.stack[creature.stack.length - 1]
    : null;
}

function definition(
  state: Record<string, unknown>,
  instanceOrId: Inst | string,
): Record<string, unknown> {
  const value = runtimeV02Definition(state, instanceOrId);
  if (!value) throw new Error("tcg_v0_2_event_listener_definition_missing");
  return value;
}

function cardName(
  state: Record<string, unknown>,
  card: { card_id: string },
): string {
  return String(definition(state, card.card_id).name || card.card_id);
}

function allFields(state: Record<string, unknown>): Field[] {
  const players = objectRecord(state.players);
  if (!players) throw new Error("tcg_v0_2_event_listener_players_required");
  const out: Field[] = [];
  for (const seat of [1, 2] as const) {
    const player = objectRecord(players[String(seat)]);
    if (!player) throw new Error("tcg_v0_2_event_listener_player_required");
    if (player.reserve != null && !Array.isArray(player.reserve)) {
      throw new Error("tcg_v0_2_event_listener_reserve_invalid");
    }
    const reserve = Array.isArray(player.reserve) ? player.reserve : [];
    const zones: Array<["vanguard" | "reserve", number | null, unknown]> = [
      ["vanguard", null, player.vanguard],
      ...[0, 1, 2, 3].map((index) =>
        ["reserve", index, reserve[index]] as ["reserve", number, unknown]
      ),
    ];
    for (const [where, index, raw] of zones) {
      if (raw == null) continue;
      const creature = objectRecord(raw) as Cr | null;
      if (
        !creature || !Array.isArray(creature.stack) ||
        creature.stack.length === 0
      ) {
        throw new Error("tcg_v0_2_event_listener_creature_invalid");
      }
      if (!Array.isArray(creature.essence)) {
        throw new Error("tcg_v0_2_event_listener_essence_zone_invalid");
      }
      const top = topInst(creature);
      if (!top?.uid || !top.card_id) {
        throw new Error("tcg_v0_2_event_listener_top_invalid");
      }
      out.push({
        seat,
        where,
        index,
        cr: creature,
        top,
        def: definition(state, top),
      });
    }
  }
  return out;
}

function fieldByUid(
  state: Record<string, unknown>,
  uid: string,
): Field | null {
  return allFields(state).find((field) => field.top.uid === uid) || null;
}

function fieldFromRef(
  state: Record<string, unknown>,
  ref: CreatureRef,
): Field | null {
  const found = fieldByUid(state, ref.anchor_uid);
  return found?.seat === ref.seat ? found : null;
}

function creatureRef(field: Field): CreatureRef {
  return { seat: field.seat, anchor_uid: field.top.uid };
}

function listenerId(candidate: Candidate): string {
  return requiredString(
    candidate.listener.id,
    "tcg_v0_2_event_listener_id_required",
  );
}

function listenerList(
  value: unknown,
  error: string,
): Record<string, unknown>[] {
  if (value == null) return [];
  return records(value, error);
}

function collectCandidates(
  state: Record<string, unknown>,
  eventName: string,
): Candidate[] {
  const out: Candidate[] = [];
  for (const field of allFields(state)) {
    const creature = objectRecord(field.def.creature);
    const ability = objectRecord(creature?.ability);
    if (
      ability && ability.mode === "triggered" &&
      String(ability.event || "") === eventName
    ) {
      out.push({
        kind: "ability",
        source: field.top,
        seat: field.seat,
        field,
        listener: ability,
      });
    }
    for (const source of field.cr.essence) {
      const essence = objectRecord(definition(state, source).essence);
      for (
        const listener of listenerList(
          essence?.listeners,
          "tcg_v0_2_event_listener_essence_list_invalid",
        )
      ) {
        if (String(listener.event || "") === eventName) {
          out.push({
            kind: "essence",
            source,
            seat: field.seat,
            field,
            listener,
          });
        }
      }
    }
    if (field.cr.relic) {
      const source = field.cr.relic;
      const tactic = objectRecord(definition(state, source).tactic);
      for (
        const listener of listenerList(
          tactic?.listeners,
          "tcg_v0_2_event_listener_relic_list_invalid",
        )
      ) {
        if (String(listener.event || "") === eventName) {
          out.push({
            kind: "relic",
            source,
            seat: field.seat,
            field,
            listener,
          });
        }
      }
    }
  }

  const realm = objectRecord(state.realm);
  if (realm) {
    const source = objectRecord(realm.card) as Inst | null;
    if (!source?.uid || !source.card_id) {
      throw new Error("tcg_v0_2_event_listener_realm_source_invalid");
    }
    const tactic = objectRecord(definition(state, source).tactic);
    for (
      const listener of listenerList(
        tactic?.listeners,
        "tcg_v0_2_event_listener_realm_list_invalid",
      )
    ) {
      if (String(listener.event || "") === eventName) {
        out.push({
          kind: "realm",
          source,
          seat: normalizedSeat(
            realm.owner_seat,
            "tcg_v0_2_event_listener_realm_owner_invalid",
          ),
          field: null,
          listener,
        });
      }
    }
  }
  return out;
}

function attachmentCandidateDescriptor(
  candidate: Candidate,
): RuntimeV02EssenceAttachedCandidateDescriptor {
  return {
    kind: candidate.kind,
    source: {
      uid: requiredString(
        candidate.source.uid,
        "tcg_v0_2_attachment_trigger_source_uid_required",
      ),
      card_id: requiredString(
        candidate.source.card_id,
        "tcg_v0_2_attachment_trigger_source_card_id_required",
      ),
    },
    source_controller_seat: candidate.seat,
    source_creature_uid: candidate.field?.top.uid || null,
    listener: candidate.listener,
  };
}

function essenceAttachedEvent(
  event: RuntimeV02EventListenerEvent,
): RuntimeV02EssenceAttachedListenerEvent {
  if (event.event !== "essence_attached") {
    throw new Error("tcg_v0_2_attachment_continuation_event_invalid");
  }
  const subjectCardId = requiredString(
    event.subject_card_id,
    "tcg_v0_2_attachment_continuation_subject_card_id_required",
  );
  const attachmentTargetUid = requiredString(
    event.attachment_target_uid,
    "tcg_v0_2_attachment_continuation_target_uid_required",
  );
  const attachmentKind = requiredString(
    event.attachment_kind,
    "tcg_v0_2_attachment_continuation_kind_required",
  );
  const sourceCardUid = requiredString(
    event.source_card_uid,
    "tcg_v0_2_attachment_continuation_source_card_uid_required",
  );
  if (sourceCardUid !== event.subject_uid) {
    throw new Error("tcg_v0_2_attachment_continuation_subject_source_mismatch");
  }
  if (event.destination_zone !== "field") {
    throw new Error("tcg_v0_2_attachment_continuation_destination_invalid");
  }
  return structuredClone({
    ...event,
    event: "essence_attached",
    subject_card_id: subjectCardId,
    source_card_uid: sourceCardUid,
    attachment_target_uid: attachmentTargetUid,
    attachment_kind: attachmentKind,
  } as RuntimeV02EssenceAttachedListenerEvent);
}

function essenceAttachedWorkItems(
  state: Record<string, unknown>,
  event: RuntimeV02EventListenerEvent,
): WorkItem[] {
  const attachmentEvent = essenceAttachedEvent(event);
  const plan = runtimeV02BuildEssenceAttachedTriggerPlan(
    state,
    attachmentEvent,
    collectCandidates(state, attachmentEvent.event).map(attachmentCandidateDescriptor),
  );
  return plan.work.map((frozen) => ({
    event: structuredClone(plan.snapshot.event),
    source_uid: frozen.source.uid,
    listener_id: frozen.listener_id,
    frozen_candidate: structuredClone(frozen),
  }));
}

function frozenCandidate(
  state: Record<string, unknown>,
  work: WorkItem,
): Candidate | null {
  const frozen = work.frozen_candidate;
  if (!frozen) return null;
  if (
    frozen.source.uid !== work.source_uid ||
    frozen.listener_id !== work.listener_id
  ) {
    throw new Error("tcg_v0_2_attachment_continuation_work_mismatch");
  }
  const field = frozen.source_creature_uid == null
    ? null
    : fieldByUid(state, frozen.source_creature_uid);
  if (field && field.seat !== frozen.source_controller_seat) {
    throw new Error("tcg_v0_2_attachment_continuation_source_seat_mismatch");
  }
  return {
    kind: frozen.kind,
    source: structuredClone(frozen.source),
    seat: frozen.source_controller_seat,
    field,
    listener: structuredClone(frozen.listener),
  };
}

function findCandidate(
  state: Record<string, unknown>,
  work: WorkItem,
): Candidate {
  const frozen = frozenCandidate(state, work);
  if (frozen) return frozen;
  const candidate = collectCandidates(state, work.event.event).find((item) =>
    item.source.uid === work.source_uid &&
    listenerId(item) === work.listener_id
  );
  if (!candidate) {
    throw new Error(
      `tcg_v0_2_event_listener_source_missing:${work.source_uid}:${work.listener_id}`,
    );
  }
  return candidate;
}

function structuredEnabled(state: Record<string, unknown>): boolean {
  const cardIndex = objectRecord(state.card_index);
  if (!cardIndex) return false;
  const first = Object.keys(cardIndex)[0];
  return !!(first && runtimeV02Definition(state, first));
}

function player(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const value = objectRecord(objectRecord(state.players)?.[String(seat)]);
  if (
    !value || !Array.isArray(value.reserve) || !Array.isArray(value.deck) ||
    !Array.isArray(value.hand) || !Array.isArray(value.discard) ||
    !Array.isArray(value.rewards)
  ) {
    throw new Error("tcg_v0_2_event_listener_player_zones_invalid");
  }
  return value;
}

function playerForToken(
  candidate: Candidate,
  token: unknown,
): 1 | 2 {
  const value = String(token || "self");
  if (value === "self") return candidate.seat;
  if (value === "opponent") return candidate.seat === 1 ? 2 : 1;
  throw new Error(`tcg_v0_2_event_listener_player_unsupported:${value}`);
}

function eventSubject(
  state: Record<string, unknown>,
  event: RuntimeV02EventListenerEvent,
): Field {
  const subject = fieldByUid(state, event.subject_uid);
  if (!subject) {
    throw new Error("tcg_v0_2_event_listener_event_subject_missing");
  }
  return subject;
}

function filtersMatch(
  definition: Record<string, unknown>,
  filtersRaw: unknown,
  field?: Field,
  candidate?: Candidate,
): boolean {
  const filters = objectRecord(filtersRaw) || {};
  if (
    filters.card_family != null &&
    String(definition.card_family || "") !== String(filters.card_family)
  ) return false;
  if (
    filters.element != null &&
    String(definition.element || "") !== String(filters.element)
  ) return false;
  if (
    filters.exclude_element != null &&
    String(definition.element || "") === String(filters.exclude_element)
  ) return false;
  if (filters.damaged === true && Number(field?.cr.damage || 0) <= 0) {
    return false;
  }
  if (
    filters.exclude_source === true && field?.top.uid === candidate?.source.uid
  ) {
    return false;
  }
  if (filters.tactic_subtype != null) {
    const tactic = objectRecord(definition.tactic);
    if (String(tactic?.subtype || "") !== String(filters.tactic_subtype)) {
      return false;
    }
  }
  if (filters.essence_subtype != null) {
    const essence = objectRecord(definition.essence);
    const subtype = essence?.subtype ?? definition.essence_subtype ?? definition.subtype;
    if (String(subtype || "") !== String(filters.essence_subtype)) return false;
  }
  return true;
}

function targetField(
  state: Record<string, unknown>,
  continuation: Continuation,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
  raw: unknown,
): Field {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const selector = raw as Record<string, unknown>;
    const controller = String(selector.controller || "");
    const zone = String(selector.zone || "");
    const seat = controller === "self"
      ? candidate.seat
      : controller === "opponent"
      ? (candidate.seat === 1 ? 2 : 1)
      : null;
    if (!seat) {
      throw new Error(
        "tcg_v0_2_event_listener_target_selector_controller_unsupported",
      );
    }
    if (zone === "vanguard") {
      const found = allFields(state).find((field) =>
        field.seat === seat && field.where === "vanguard"
      );
      if (found) return found;
    }
    throw new Error("tcg_v0_2_event_listener_target_selector_unsupported");
  }

  const token = String(raw || "");
  if (
    (token === "$source_creature" || token === "$attached_creature") &&
    candidate.field
  ) return candidate.field;
  if (token === "$event_subject") return eventSubject(state, event);
  if (token === "$current_friendly_vanguard") {
    const found = allFields(state).find((field) =>
      field.seat === candidate.seat && field.where === "vanguard"
    );
    if (found) return found;
  }
  if (token === "$current_opponent_vanguard") {
    const opponent = candidate.seat === 1 ? 2 : 1;
    const found = allFields(state).find((field) =>
      field.seat === opponent && field.where === "vanguard"
    );
    if (found) return found;
  }
  if (token.startsWith("$")) {
    const value = continuation.vars[token.slice(1)];
    if (Array.isArray(value) && value.length === 1) {
      const ref = value[0] as CreatureRef;
      const found = fieldFromRef(state, ref);
      if (found) return found;
    }
  }
  throw new Error(`tcg_v0_2_event_listener_target_unsupported:${token}`);
}

function eventCount(
  state: Record<string, unknown>,
  candidate: Candidate,
  name: string,
  controller: 1 | 2,
): number {
  const turn = currentTurn(state);
  const events = Array.isArray(state.effect_events)
    ? state.effect_events as Record<string, unknown>[]
    : [];
  const recorded = events.filter((entry) => {
    if (String(entry.event || "") !== name) return false;
    if (Number(entry.turn_seq) !== turn) return false;
    const seat = Number(entry.controller_seat ?? entry.seat);
    return seat === controller;
  }).length;
  const flags = objectRecord(objectRecord(state.turn_flags)?.[String(controller)]);
  const compatibility = name === "device_resolved" && Number(flags?.device_turn ?? -1) === turn ? 1 : 0;
  void candidate;
  return Math.max(recorded, compatibility);
}

function requirement(
  state: Record<string, unknown>,
  continuation: Continuation,
  raw: unknown,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
): boolean {
  const value = objectRecord(raw);
  if (!value) throw new Error("tcg_v0_2_event_listener_requirement_invalid");
  if (Object.hasOwn(value, "all")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_event_listener_all_invalid");
    }
    return list(value.all, "tcg_v0_2_event_listener_all_invalid").every((
      item,
    ) => requirement(state, continuation, item, candidate, event));
  }
  if (Object.hasOwn(value, "any")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_event_listener_any_invalid");
    }
    const items = list(value.any, "tcg_v0_2_event_listener_any_invalid");
    if (!items.length) throw new Error("tcg_v0_2_event_listener_any_empty");
    return items.some((item) =>
      requirement(state, continuation, item, candidate, event)
    );
  }
  if (Object.hasOwn(value, "not")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_event_listener_not_invalid");
    }
    return !requirement(state, continuation, value.not, candidate, event);
  }

  const predicate = requiredString(
    value.predicate,
    "tcg_v0_2_event_listener_predicate_required",
  );
  switch (predicate) {
    case "source_is_self":
      return candidate.seat === event.controller_seat;
    case "event_subject_is_source":
      return !!candidate.field &&
        candidate.field.top.uid === event.subject_uid;
    case "event_subject_is_attached_creature":
      return !!candidate.field &&
        candidate.field.top.uid === event.subject_uid;
    case "event_origin_zone_is":
      return event.origin_zone === String(value.zone || "");
    case "event_destination_zone_is":
      return event.destination_zone === String(value.zone || "");
    case "event_phase_is":
      return event.phase === String(value.phase || "");
    case "event_action_kind_is":
      return event.action_kind === String(value.action_kind || "");
    case "event_controller_is_self":
      return event.controller_seat === candidate.seat;
    case "event_controller_is_active_seat":
      return event.controller_seat === Number(state.active_seat);
    case "event_subject_matches":
      return filtersMatch(eventSubject(state, event).def, value.filters);
    case "reserve_count_at_least": {
      if (String(value.controller || "") !== "self") {
        throw new Error(
          "tcg_v0_2_event_listener_reserve_controller_unsupported",
        );
      }
      const count = player(state, candidate.seat).reserve as unknown[];
      return count.filter(Boolean).length >= Number(value.count || 0);
    }
    case "friendly_other_creature_matches":
      return allFields(state).some((field) =>
        field.seat === candidate.seat &&
        field.top.uid !== candidate.source.uid &&
        filtersMatch(field.def, value.filters, field, candidate)
      );
    case "legal_card_available": {
      if (
        String(value.controller || "") !== "self" ||
        String(value.zone || "") !== "field"
      ) {
        throw new Error(
          "tcg_v0_2_event_listener_legal_card_available_unsupported",
        );
      }
      return allFields(state).some((field) =>
        field.seat === candidate.seat &&
        filtersMatch(field.def, value.filters, field, candidate)
      );
    }
    case "target_damaged": {
      const target = targetField(
        state,
        continuation,
        candidate,
        event,
        value.target,
      );
      return Number(target.cr.damage || 0) > 0;
    }
    case "hand_count_at_least": {
      const seat = playerForToken(candidate, value.controller);
      return (player(state, seat).hand as Inst[]).length >= Number(value.count || 0);
    }
    case "control_condition_slot_empty": {
      const target = targetField(state, continuation, candidate, event, value.target);
      return runtimeConditions(target.cr).control == null;
    }
    case "event_occurred": {
      if (String(value.window || "") !== "current_turn") {
        throw new Error("tcg_v0_2_event_listener_event_window_unsupported");
      }
      const name = requiredString(value.event, "tcg_v0_2_event_listener_event_name_required");
      const controller = playerForToken(candidate, value.controller);
      const minCount = Number(value.min_count ?? 1);
      if (!Number.isInteger(minCount) || minCount < 1) {
        throw new Error("tcg_v0_2_event_listener_event_min_count_invalid");
      }
      return eventCount(state, candidate, name, controller) >= minCount;
    }
    default:
      throw new Error(
        `tcg_v0_2_event_listener_predicate_unsupported:${predicate}`,
      );
  }
}

function matches(
  state: Record<string, unknown>,
  continuation: Continuation,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
): boolean {
  const timing = candidate.kind === "ability"
    ? String(candidate.listener.timing || "any")
    : "any";
  if (timing === "own_turn" && candidate.seat !== Number(state.active_seat)) {
    return false;
  }
  if (timing === "build" && event.phase !== "build") return false;
  if (!["own_turn", "build", "any", "passive"].includes(timing)) {
    throw new Error(
      `tcg_v0_2_event_listener_timing_unsupported:${timing}`,
    );
  }
  const scope = candidate.listener.controller_scope;
  if (scope != null && scope !== "any" && scope !== "self") {
    throw new Error(
      `tcg_v0_2_event_listener_controller_scope_unsupported:${scope}`,
    );
  }
  if (scope === "self" && event.controller_seat !== candidate.seat) {
    return false;
  }
  return candidate.listener.requirements == null ||
    requirement(
      state,
      continuation,
      candidate.listener.requirements,
      candidate,
      event,
    );
}

function listenerState(
  state: Record<string, unknown>,
): {
  turn_seq: number;
  receipts: Record<string, unknown>;
  limits: Record<string, unknown>;
} {
  const turn = currentTurn(state);
  const raw = objectRecord(state[STATE_KEY]);
  if (!raw || Number(raw.turn_seq) !== turn) {
    const fresh = { turn_seq: turn, receipts: {}, limits: {} };
    state[STATE_KEY] = fresh;
    return fresh;
  }
  const receipts = objectRecord(raw.receipts);
  const limits = objectRecord(raw.limits);
  if (!receipts || !limits) {
    throw new Error("tcg_v0_2_event_listener_state_invalid");
  }
  return raw as {
    turn_seq: number;
    receipts: Record<string, unknown>;
    limits: Record<string, unknown>;
  };
}

function receiptKey(
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
): string {
  return `${event.event_id}:${event.event}:${candidate.source.uid}:${
    listenerId(candidate)
  }`;
}

function alreadyResolved(
  state: Record<string, unknown>,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
): boolean {
  return Object.hasOwn(
    listenerState(state).receipts,
    receiptKey(candidate, event),
  );
}

function markResolved(
  state: Record<string, unknown>,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
): void {
  listenerState(state).receipts[receiptKey(candidate, event)] = {
    event_id: event.event_id,
    event: event.event,
    source_uid: candidate.source.uid,
    listener_id: listenerId(candidate),
  };
}

function limitInfo(
  state: Record<string, unknown>,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
): { key: string; count: number } | null {
  const limit = objectRecord(candidate.listener.limit);
  if (!limit) return null;
  const count = Number(limit.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("tcg_v0_2_event_listener_limit_count_invalid");
  }
  if (String(limit.scope || "") !== "turn") {
    throw new Error("tcg_v0_2_event_listener_limit_scope_unsupported");
  }
  const owner = String(limit.owner || "");
  const ownerKey = owner === "card_instance"
    ? `card:${candidate.source.uid}`
    : owner === "controller"
    ? `controller:${candidate.seat}`
    : owner === "event_controller"
    ? `event-controller:${event.controller_seat}`
    : null;
  if (!ownerKey) {
    throw new Error(
      `tcg_v0_2_event_listener_limit_owner_unsupported:${owner}`,
    );
  }
  return { key: `${listenerId(candidate)}:${ownerKey}`, count };
}

function usedLimit(
  state: Record<string, unknown>,
  info: { key: string; count: number } | null,
): number {
  if (!info) return 0;
  const raw = objectRecord(listenerState(state).limits[info.key]);
  if (!raw || Number(raw.turn_seq) !== currentTurn(state)) return 0;
  const count = Number(raw.count);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_event_listener_limit_state_invalid");
  }
  return count;
}

function consumeLimit(
  state: Record<string, unknown>,
  info: { key: string; count: number } | null,
): void {
  if (!info) return;
  const used = usedLimit(state, info);
  if (used >= info.count) {
    throw new Error("tcg_v0_2_event_listener_limit_already_consumed");
  }
  listenerState(state).limits[info.key] = {
    count: used + 1,
    turn_seq: currentTurn(state),
    scope: "turn",
  };
}

function getContinuation(state: Record<string, unknown>): Continuation {
  const raw = objectRecord(state[CONTINUATION_KEY]);
  if (
    !raw || Number(raw.turn_seq) !== currentTurn(state) ||
    !Array.isArray(raw.work) || !Array.isArray(raw.program) ||
    typeof raw.program_loaded !== "boolean" ||
    !Array.isArray(raw.processed_listener_keys) ||
    !Array.isArray(raw.emitted_heal_packet_ids) ||
    !Array.isArray(raw.emitted_movement_events) ||
    !objectRecord(raw.vars)
  ) {
    throw new Error("tcg_v0_2_event_listener_continuation_invalid");
  }
  return raw as unknown as Continuation;
}

function setContinuation(
  state: Record<string, unknown>,
  continuation: Continuation,
): void {
  state[CONTINUATION_KEY] = continuation as unknown as Record<string, unknown>;
}

function clearContinuation(state: Record<string, unknown>): void {
  delete state[CONTINUATION_KEY];
  delete state[PENDING_KEY];
}

function currentWork(continuation: Continuation): WorkItem | null {
  return continuation.work[continuation.work_index] || null;
}

function range(raw: unknown): { min: number; max: number } {
  if (typeof raw === "number") return { min: raw, max: raw };
  const value = objectRecord(raw) || {};
  const min = Math.max(0, Number(value.min || 0));
  const max = Math.max(min, Number(value.max ?? min));
  return { min, max };
}

function setPrivateInspection(
  state: Record<string, unknown>,
  controller: 1 | 2,
  zoneOwner: 1 | 2,
  zone: "deck_top" | "hand",
  cards: CardRef[],
): void {
  const root = objectRecord(state[PRIVATE_INSPECTION_KEY]) || {};
  root[String(controller)] = {
    turn_seq: currentTurn(state),
    controller_seat: controller,
    zone_owner_seat: zoneOwner,
    zone,
    cards: cards.map((card, position) => ({
      position,
      uid: card.uid,
      card_id: card.card_id,
    })),
  };
  state[PRIVATE_INSPECTION_KEY] = root;
}

function inspectDeckTop(
  state: Record<string, unknown>,
  candidate: Candidate,
  ownerSeat: 1 | 2,
  count: number,
  exactMinimum: number,
): CardRef[] {
  const owner = player(state, ownerSeat);
  const deck = owner.deck as Inst[];
  if (deck.length < exactMinimum) {
    throw new Error("tcg_v0_2_event_listener_inspection_cards_unavailable");
  }
  const cards = deck.slice(0, Math.min(count, deck.length)).map((card) => ({
    uid: requiredString(
      card.uid,
      "tcg_v0_2_event_listener_inspection_uid_invalid",
    ),
    card_id: requiredString(
      card.card_id,
      "tcg_v0_2_event_listener_inspection_card_id_invalid",
    ),
    zone_owner_seat: ownerSeat,
    zone: "deck" as const,
  }));
  if (cards.length) {
    recordRuntimeV02HiddenInformationView(
      state,
      candidate.seat,
      "deck_top",
    );
    setPrivateInspection(state, candidate.seat, ownerSeat, "deck_top", cards);
  }
  return cards;
}

function randomSampleHiddenZone(
  state: Record<string, unknown>,
  candidate: Candidate,
  step: Record<string, unknown>,
): CardRef[] {
  const ownerSeat = playerForToken(candidate, step.player);
  if (String(step.zone || "") !== "hand") {
    throw new Error("tcg_v0_2_event_listener_hidden_sample_zone_unsupported");
  }
  if (String(step.rng_owner || "") !== "match") {
    throw new Error("tcg_v0_2_event_listener_hidden_sample_rng_owner_unsupported");
  }
  if (String(step.visibility || "") !== "controller_private") {
    throw new Error("tcg_v0_2_event_listener_hidden_sample_visibility_unsupported");
  }
  const wanted = range(step.count);
  const hand = player(state, ownerSeat).hand as Inst[];
  if (hand.length < wanted.min) {
    throw new Error("tcg_v0_2_event_listener_hidden_sample_unavailable");
  }
  const count = Math.min(wanted.max, hand.length);
  const pool = hand.map((card) => ({
    uid: requiredString(card.uid, "tcg_v0_2_event_listener_hidden_sample_uid_invalid"),
    card_id: requiredString(card.card_id, "tcg_v0_2_event_listener_hidden_sample_card_id_invalid"),
    zone_owner_seat: ownerSeat,
    zone: "hand" as const,
  }));
  const sampled: CardRef[] = [];
  while (sampled.length < count && pool.length) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const index = random[0] % pool.length;
    sampled.push(pool.splice(index, 1)[0]);
  }
  if (sampled.length) {
    setPrivateInspection(state, candidate.seat, ownerSeat, "hand", sampled);
  }
  return sampled;
}

function installChoice(
  state: Record<string, unknown>,
  continuation: Continuation,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
  pending: Omit<
    RuntimeV02PendingEventListenerChoice,
    "id" | "turn_seq" | "event_id" | "source_uid" | "listener_id"
  >,
): RuntimeV02PendingEventListenerChoice {
  const choice = {
    ...pending,
    id: crypto.randomUUID(),
    turn_seq: currentTurn(state),
    event_id: event.event_id,
    source_uid: candidate.source.uid,
    listener_id: listenerId(candidate),
  } satisfies RuntimeV02PendingEventListenerChoice;
  state[PENDING_KEY] = choice as unknown as Record<string, unknown>;
  setContinuation(state, continuation);
  return choice;
}

function pendingChoice(
  state: Record<string, unknown>,
): RuntimeV02PendingEventListenerChoice | null {
  return objectRecord(state[PENDING_KEY]) as
    | RuntimeV02PendingEventListenerChoice
    | null;
}

function cardRefsFromVar(
  continuation: Continuation,
  token: unknown,
): CardRef[] {
  const key = String(token || "").replace(/^\$/, "");
  const value = continuation.vars[key];
  if (!Array.isArray(value)) {
    throw new Error(
      `tcg_v0_2_event_listener_card_set_missing:${String(token || "")}`,
    );
  }
  return value as CardRef[];
}

function creatureOptions(
  state: Record<string, unknown>,
  candidate: Candidate,
  step: Record<string, unknown>,
): Array<{
  id: string;
  label: string;
  data: Record<string, unknown>;
}> {
  const controller = String(step.controller || "self");
  const seat = controller === "self"
    ? candidate.seat
    : controller === "opponent"
    ? (candidate.seat === 1 ? 2 : 1)
    : null;
  if (!seat) {
    throw new Error(
      "tcg_v0_2_event_listener_creature_controller_unsupported",
    );
  }
  const zone = String(step.zone || "field");
  if (!["field", "reserve", "vanguard"].includes(zone)) {
    throw new Error("tcg_v0_2_event_listener_creature_zone_unsupported");
  }
  return allFields(state)
    .filter((field) =>
      field.seat === seat &&
      (zone === "field" || field.where === zone) &&
      filtersMatch(field.def, step.filters, field, candidate)
    )
    .map((field) => ({
      id: `creature:${field.top.uid}`,
      label: String(field.def.name || "Creature"),
      data: { ref: creatureRef(field) },
    }));
}

function zoneCards(
  state: Record<string, unknown>,
  ownerSeat: 1 | 2,
  zone: CardRef["zone"],
): Inst[] {
  const owner = player(state, ownerSeat);
  if (zone === "deck") return owner.deck as Inst[];
  if (zone === "discard") return owner.discard as Inst[];
  if (zone === "hand") return owner.hand as Inst[];
  if (zone === "rewards") return owner.rewards as Inst[];
  throw new Error("tcg_v0_2_event_listener_card_zone_unsupported");
}

function cardOptions(
  state: Record<string, unknown>,
  candidate: Candidate,
  step: Record<string, unknown>,
): Array<{
  id: string;
  label: string;
  data: Record<string, unknown>;
}> {
  const ownerSeat = playerForToken(candidate, step.player);
  const zone = String(step.zone || "") as CardRef["zone"];
  if (zone !== "discard" && zone !== "hand") {
    throw new Error("tcg_v0_2_event_listener_card_zone_unsupported");
  }
  const cards = zoneCards(state, ownerSeat, zone);
  const selection = objectRecord(step.selection);
  const filters = selection?.filters;
  return cards
    .filter((card) => filtersMatch(definition(state, card), filters))
    .map((card) => ({
      id: `card:${card.uid}`,
      label: cardName(state, card),
      data: {
        ref: {
          uid: card.uid,
          card_id: card.card_id,
          zone_owner_seat: ownerSeat,
          zone,
        } satisfies CardRef,
      },
    }));
}

function validateDuration(
  step: Record<string, unknown>,
): void {
  const duration = objectRecord(step.duration);
  if (
    !duration || !Array.isArray(duration.expires_on) ||
    !duration.expires_on.map(String).includes("end_of_turn")
  ) {
    throw new Error(
      "tcg_v0_2_event_listener_withdrawal_modifier_expiry_unsupported",
    );
  }
  if (
    duration.max_uses != null &&
    (!Number.isInteger(Number(duration.max_uses)) ||
      Number(duration.max_uses) < 1)
  ) {
    throw new Error(
      "tcg_v0_2_event_listener_withdrawal_modifier_max_uses_invalid",
    );
  }
}

function baseWithdrawalCost(
  state: Record<string, unknown>,
  target: Field,
): number {
  const creature = objectRecord(target.def.creature);
  const printed = Number(
    creature?.withdrawal ?? target.def.withdrawal ?? target.def.withdraw ?? 0,
  );
  if (!Number.isFinite(printed) || printed < 0) {
    throw new Error(
      "tcg_v0_2_event_listener_withdrawal_printed_invalid",
    );
  }
  const conditions = runtimeConditions(target.cr);
  const structured = structuredRuntimeWithdrawalBaseCost(
    state,
    target.cr,
    printed,
    String(target.def.element || ""),
    conditions.modifier === "Crushed",
  );
  return structured == null ? printed : structured;
}

function setWithdrawalModifier(
  state: Record<string, unknown>,
  target: Field,
  step: Record<string, unknown>,
): void {
  validateDuration(step);
  target.cr.flags ||= {};
  const flags = target.cr.flags as Record<string, unknown>;
  const prior = objectRecord(flags.lifecycle_withdrawal_cost);
  let value = prior && Number(prior.turn_seq) === currentTurn(state)
    ? Number(prior.value)
    : baseWithdrawalCost(state, target);
  const mode = String(step.mode || "delta");
  if (mode === "set") {
    value = numberValue(
      step.amount,
      "tcg_v0_2_event_listener_withdrawal_modifier_amount_invalid",
    );
  } else if (mode === "delta") {
    value += numberValue(
      step.amount ?? step.delta,
      "tcg_v0_2_event_listener_withdrawal_modifier_delta_invalid",
    );
  } else {
    throw new Error(
      `tcg_v0_2_event_listener_withdrawal_modifier_mode_unsupported:${mode}`,
    );
  }
  const minimum = step.minimum == null ? 0 : numberValue(
    step.minimum,
    "tcg_v0_2_event_listener_withdrawal_modifier_minimum_invalid",
  );
  flags.lifecycle_withdrawal_cost = {
    turn_seq: currentTurn(state),
    value: Math.max(minimum, value, 0),
    expires: "end_of_turn",
  };
}

function removeCardRef(
  state: Record<string, unknown>,
  ref: CardRef,
): Inst {
  const zone = zoneCards(state, ref.zone_owner_seat, ref.zone);
  const index = zone.findIndex((card) =>
    card.uid === ref.uid && card.card_id === ref.card_id
  );
  if (index < 0) {
    throw new Error("tcg_v0_2_event_listener_selected_card_stale");
  }
  return zone.splice(index, 1)[0];
}

function moveCards(
  state: Record<string, unknown>,
  continuation: Continuation,
  candidate: Candidate,
  step: Record<string, unknown>,
): void {
  if (String(step.to || "") !== "deck_bottom") {
    throw new Error("tcg_v0_2_event_listener_move_destination_unsupported");
  }
  const refs = cardRefsFromVar(continuation, step.cards);
  if (step.order != null && String(step.order) !== "preserve") {
    throw new Error("tcg_v0_2_event_listener_move_order_unsupported");
  }
  const moved = refs.map((ref) => removeCardRef(state, ref));
  const ownerSeat = refs[0]?.zone_owner_seat ?? candidate.seat;
  if (refs.some((ref) => ref.zone_owner_seat !== ownerSeat)) {
    throw new Error("tcg_v0_2_event_listener_move_owner_mismatch");
  }
  (player(state, ownerSeat).deck as Inst[]).push(...moved);
}

function returnRemainderToDeckTop(
  state: Record<string, unknown>,
  continuation: Continuation,
  step: Record<string, unknown>,
): void {
  if (String(step.order || "") !== "preserve") {
    throw new Error(
      "tcg_v0_2_event_listener_remainder_order_unsupported",
    );
  }
  const source = cardRefsFromVar(continuation, step.source);
  const except = step.except == null
    ? []
    : cardRefsFromVar(continuation, step.except);
  const exceptUids = new Set(except.map((card) => card.uid));
  const remainder = source.filter((card) => !exceptUids.has(card.uid));
  if (!remainder.length) return;
  reorderDeckTop(state, remainder);
}

function reorderDeckTop(
  state: Record<string, unknown>,
  refs: CardRef[],
): void {
  if (!refs.length) return;
  const ownerSeat = refs[0].zone_owner_seat;
  if (refs.some((ref) => ref.zone !== "deck" || ref.zone_owner_seat !== ownerSeat)) {
    throw new Error("tcg_v0_2_event_listener_remainder_source_invalid");
  }
  const deck = player(state, ownerSeat).deck as Inst[];
  const byUid = new Map(deck.map((card) => [card.uid, card]));
  const ordered = refs.map((ref) => {
    const card = byUid.get(ref.uid);
    if (!card || card.card_id !== ref.card_id) {
      throw new Error("tcg_v0_2_event_listener_remainder_stale");
    }
    return card;
  });
  const uids = new Set(refs.map((card) => card.uid));
  const rest = deck.filter((card) => !uids.has(card.uid));
  deck.splice(0, deck.length, ...ordered, ...rest);
}

function clearCondition(
  target: Field,
  condition: string,
): void {
  const conditions = runtimeConditions(target.cr);
  if (condition === "Scorched") conditions.scorched = false;
  else if (condition === "Venomed") conditions.venomed = 0;
  else if (conditions.control === condition) conditions.control = null;
  else if (conditions.modifier === condition) conditions.modifier = null;
  else throw new Error("tcg_v0_2_event_listener_condition_stale");
  target.cr.condition = null;
}

function executeStep(
  state: Record<string, unknown>,
  continuation: Continuation,
  candidate: Candidate,
  event: RuntimeV02EventListenerEvent,
  step: Record<string, unknown>,
): "continue" | "choice" {
  const op = String(step.op || "");

  if (op === "IF") {
    const branch = requirement(
        state,
        continuation,
        step.when,
        candidate,
        event,
      )
      ? records(step.then || [], "tcg_v0_2_event_listener_if_then_invalid")
      : records(step.else || [], "tcg_v0_2_event_listener_if_else_invalid");
    continuation.program.splice(continuation.step_cursor, 1, ...branch);
    return "continue";
  }

  if (op === "OPTIONAL") {
    installChoice(state, continuation, candidate, event, {
      seat: playerForToken(candidate, step.player),
      kind: "optional",
      prompt: "Use optional effect?",
      min: 1,
      max: 1,
      mode: "select",
      options: [
        { id: "accept", label: "Yes", data: { accepted: true } },
        { id: "decline", label: "No", data: { accepted: false } },
      ],
      context: {},
    });
    return "choice";
  }

  if (op === "LOOK_TOP") {
    const owner = playerForToken(candidate, step.player);
    const count = Math.max(0, Number(step.count || 0));
    continuation.vars[String(step.as || "looked")] = inspectDeckTop(
      state,
      candidate,
      owner,
      count,
      0,
    );
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "INSPECT_ZONE") {
    const owner = playerForToken(candidate, step.player);
    const wanted = range(step.selection);
    if (
      String(step.visibility || "") !== "controller_private" ||
      String(step.return_policy || "") !== "same_position"
    ) {
      throw new Error(
        "tcg_v0_2_event_listener_inspection_shape_unsupported",
      );
    }
    if (String(step.zone || "") === "deck_top") {
      continuation.vars[String(step.as || "inspected")] = inspectDeckTop(
        state,
        candidate,
        owner,
        wanted.max,
        wanted.min,
      );
      continuation.step_cursor++;
      return "continue";
    }
    if (String(step.zone || "") === "rewards") {
      if (owner !== candidate.seat) {
        throw new Error(
          "tcg_v0_2_event_listener_reward_owner_unsupported",
        );
      }
      const rewards = player(state, owner).rewards as Inst[];
      if (rewards.length < wanted.min) {
        throw new Error(
          "tcg_v0_2_event_listener_reward_cards_unavailable",
        );
      }
      const options = rewards.map((_card, position) => ({
        id: `reward:${position}`,
        label: `Reward ${position + 1}`,
        data: { position },
      }));
      installChoice(state, continuation, candidate, event, {
        seat: candidate.seat,
        kind: "inspect_rewards",
        prompt: "Choose Reward Card to inspect",
        min: wanted.min,
        max: Math.min(wanted.max, options.length),
        mode: "select",
        options,
        context: { as: String(step.as || "inspected_rewards") },
      });
      return "choice";
    }
    throw new Error(
      "tcg_v0_2_event_listener_inspection_zone_unsupported",
    );
  }

  if (op === "RANDOM_SAMPLE_HIDDEN_ZONE") {
    continuation.vars[String(step.as || "sampled")] = randomSampleHiddenZone(state, candidate, step);
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "CHOOSE_FROM_SET") {
    const source = cardRefsFromVar(continuation, step.source);
    const wanted = {
      min: Math.max(0, Number(step.min || 0)),
      max: Math.max(0, Number(step.max || 0)),
    };
    if (source.length < wanted.min) {
      throw new Error("tcg_v0_2_event_listener_choose_set_unavailable");
    }
    const options = source.map((card) => ({
      id: `card:${card.uid}`,
      label: cardName(state, card),
      data: { ref: card },
    }));
    if (!options.length && wanted.min === 0) {
      continuation.vars[String(step.as || "chosen")] = [];
      continuation.step_cursor++;
      return "continue";
    }
    installChoice(state, continuation, candidate, event, {
      seat: candidate.seat,
      kind: "choose_from_set",
      prompt: "Choose card",
      min: wanted.min,
      max: Math.min(wanted.max, options.length),
      mode: "select",
      options,
      context: {
        as: String(step.as || "chosen"),
        source: String(step.source || ""),
      },
    });
    return "choice";
  }

  if (op === "SELECT_CREATURE") {
    const options = creatureOptions(state, candidate, step);
    const wanted = range(step.count);
    if (options.length < wanted.min) {
      throw new Error(
        "tcg_v0_2_event_listener_creature_choice_unavailable",
      );
    }
    if (!options.length && wanted.min === 0) {
      continuation.vars[String(step.as || "selected_creature")] = [];
      continuation.step_cursor++;
      return "continue";
    }
    installChoice(state, continuation, candidate, event, {
      seat: candidate.seat,
      kind: "select_creature",
      prompt: "Choose Creature",
      min: wanted.min,
      max: Math.min(wanted.max, options.length),
      mode: "select",
      options,
      context: { as: String(step.as || "selected_creature") },
    });
    return "choice";
  }

  if (op === "SELECT_CARDS") {
    const options = cardOptions(state, candidate, step);
    const wanted = range(objectRecord(step.selection) || {});
    if (options.length < wanted.min) {
      throw new Error("tcg_v0_2_event_listener_card_choice_unavailable");
    }
    if (!options.length && wanted.min === 0) {
      continuation.vars[String(step.as || "selected_cards")] = [];
      continuation.step_cursor++;
      return "continue";
    }
    installChoice(state, continuation, candidate, event, {
      seat: candidate.seat,
      kind: "select_cards",
      prompt: "Choose card",
      min: wanted.min,
      max: Math.min(wanted.max, options.length),
      mode: "select",
      options,
      context: { as: String(step.as || "selected_cards") },
    });
    return "choice";
  }

  if (op === "MOVE_CARDS") {
    moveCards(state, continuation, candidate, step);
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "RETURN_REMAINDER_TO_DECK_TOP") {
    returnRemainderToDeckTop(state, continuation, step);
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "RETURN_SET_TO_DECK_TOP") {
    if (String(step.order || "") !== "player_choice") {
      throw new Error("tcg_v0_2_event_listener_set_order_unsupported");
    }
    const refs = cardRefsFromVar(continuation, step.cards);
    if (refs.length <= 1) {
      reorderDeckTop(state, refs);
      continuation.step_cursor++;
      return "continue";
    }
    const options = refs.map((card) => ({
      id: `card:${card.uid}`,
      label: cardName(state, card),
      data: { ref: card },
    }));
    installChoice(state, continuation, candidate, event, {
      seat: playerForToken(candidate, step.player),
      kind: "order_cards",
      prompt: "Choose card order",
      min: options.length,
      max: options.length,
      mode: "order",
      options,
      context: { source: String(step.cards || "") },
    });
    return "choice";
  }

  if (op === "DRAW") {
    const seat = playerForToken(candidate, step.player);
    const owner = player(state, seat);
    const deck = owner.deck as Inst[];
    const hand = owner.hand as Inst[];
    const count = Math.max(0, Number(step.count || 0));
    hand.push(...deck.splice(0, Math.min(count, deck.length)));
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "HEAL") {
    const target = targetField(
      state,
      continuation,
      candidate,
      event,
      step.target,
    );
    const amount = Math.max(
      0,
      numberValue(
        step.amount,
        "tcg_v0_2_event_listener_heal_amount_invalid",
      ),
    );
    const packet = applyRuntimeV02HealPacket(state, target.cr, amount, {
      source: {
        controller_seat: candidate.seat,
        action_kind: candidate.kind,
        action_id: listenerId(candidate),
        card_effect: true,
        card_uid: candidate.source.uid,
        card_id: candidate.source.card_id,
        creature_uid: candidate.field?.top.uid || null,
      },
      target: {
        controller_seat: target.seat,
        creature_uid: target.top.uid,
        card_uid: target.top.uid,
        card_id: target.top.card_id,
        element: requiredString(
          target.def.element,
          "tcg_v0_2_event_listener_heal_target_element_required",
        ),
        where: target.where,
        index: target.index,
      },
    });
    if (packet.packet?.id) {
      continuation.emitted_heal_packet_ids.push(packet.packet.id);
    }
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "ADD_SHIELD") {
    const target = targetField(state, continuation, candidate, event, step.target);
    addRuntimeShield(target.cr, Math.max(0, numberValue(step.amount, "tcg_v0_2_event_listener_shield_amount_invalid")));
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "DIRECT_DAMAGE") {
    if (step.damage_class != null && String(step.damage_class) !== "effect") {
      throw new Error("tcg_v0_2_event_listener_direct_damage_class_unsupported");
    }
    const target = targetField(state, continuation, candidate, event, step.target);
    dealRuntimeEffectDamage(target.cr, Math.max(0, numberValue(step.amount, "tcg_v0_2_event_listener_direct_damage_amount_invalid")));
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "APPLY_CONDITION") {
    const target = targetField(state, continuation, candidate, event, step.target);
    const condition = requiredString(step.condition, "tcg_v0_2_event_listener_condition_required");
    const rawMode = String(step.mode || "apply");
    if (!["apply", "apply_if_empty", "apply_if_empty_or_same", "replace"].includes(rawMode)) {
      throw new Error("tcg_v0_2_event_listener_condition_mode_unsupported");
    }
    applyRuntimeCondition(target.cr, condition, currentTurn(state), rawMode as ApplyConditionMode);
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "ATTACH_ESSENCE_FROM_ZONE") {
    if (step.manual_attachment !== false) {
      throw new Error("tcg_v0_2_event_listener_attachment_must_be_effect_driven");
    }
    const zone = String(step.zone || "");
    if (zone !== "hand" && zone !== "discard") {
      throw new Error("tcg_v0_2_event_listener_attachment_zone_unsupported");
    }
    const options = cardOptions(state, candidate, step);
    const wanted = range(objectRecord(step.selection) || {});
    if (options.length < wanted.min) {
      throw new Error("tcg_v0_2_event_listener_attachment_choice_unavailable");
    }
    if (!options.length && wanted.min === 0) {
      continuation.step_cursor++;
      return "continue";
    }
    const target = targetField(state, continuation, candidate, event, step.target);
    installChoice(state, continuation, candidate, event, {
      seat: candidate.seat,
      kind: "attach_essence",
      prompt: "Choose Essence to attach",
      min: wanted.min,
      max: Math.min(wanted.max, options.length),
      mode: "select",
      options,
      context: {
        target: creatureRef(target),
        attachment_state: step.attachment_state || null,
      },
    });
    return "choice";
  }

  if (op === "SET_WITHDRAWAL_MODIFIER") {
    setWithdrawalModifier(
      state,
      targetField(
        state,
        continuation,
        candidate,
        event,
        step.target,
      ),
      step,
    );
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "SWITCH_WITH_VANGUARD") {
    if (String(step.player || "self") !== "self") {
      throw new Error(
        "tcg_v0_2_event_listener_switch_player_unsupported",
      );
    }
    const target = targetField(
      state,
      continuation,
      candidate,
      event,
      step.target,
    );
    if (
      target.seat !== candidate.seat || target.where !== "reserve" ||
      target.index == null
    ) {
      throw new Error(
        "tcg_v0_2_event_listener_switch_target_invalid",
      );
    }
    const switched = runtimeV02ApplyAtomicSwitch(
      state,
      candidate.seat,
      target.index,
      {
        action_kind: "effect_switch",
        source_action_id: listenerId(candidate),
        source_card_uid: candidate.source.uid,
      },
    );
    continuation.emitted_movement_events.push(...switched.events);
    continuation.step_cursor++;
    return "continue";
  }

  if (op === "CHOOSE_AND_CLEAR_CONDITION") {
    const target = targetField(
      state,
      continuation,
      candidate,
      event,
      step.target,
    );
    const allowed = list(
      step.allowed,
      "tcg_v0_2_event_listener_clear_allowed_invalid",
    ).map(String);
    const current = runtimeConditions(target.cr);
    const present = allowed.filter((condition) =>
      (condition === "Scorched" && current.scorched) ||
      (condition === "Venomed" && Number(current.venomed || 0) > 0) ||
      current.control === condition ||
      current.modifier === condition
    );
    if (!present.length) {
      continuation.step_cursor++;
      return "continue";
    }
    if (present.length === 1) {
      clearCondition(target, present[0]);
      continuation.step_cursor++;
      return "continue";
    }
    installChoice(state, continuation, candidate, event, {
      seat: candidate.seat,
      kind: "clear_condition",
      prompt: "Choose condition to clear",
      min: 1,
      max: 1,
      mode: "select",
      options: present.map((condition) => ({
        id: `condition:${condition}`,
        label: condition,
        data: { condition },
      })),
      context: { target: creatureRef(target) },
    });
    return "choice";
  }

  throw new Error(`tcg_v0_2_event_listener_step_unsupported:${op}`);
}

function flow(
  continuation: Continuation,
  pending: RuntimeV02PendingEventListenerChoice | null,
): RuntimeV02EventListenerFlow {
  return {
    status: pending ? "player_choice_required" : "complete",
    processed_listener_keys: [...continuation.processed_listener_keys],
    emitted_heal_packet_ids: [...continuation.emitted_heal_packet_ids],
    emitted_movement_events: continuation.emitted_movement_events.map((
      event,
    ) => ({
      ...event,
    })),
    pending_choice: pending,
  };
}

function continueFlow(
  state: Record<string, unknown>,
): RuntimeV02EventListenerFlow {
  const continuation = getContinuation(state);
  while (continuation.work_index < continuation.work.length) {
    const work = currentWork(continuation)!;
    const candidate = findCandidate(state, work);

    if (!continuation.program_loaded) {
      if (
        alreadyResolved(state, candidate, work.event) ||
        (!work.frozen_candidate &&
          !matches(state, continuation, candidate, work.event))
      ) {
        continuation.work_index++;
        continuation.step_cursor = 0;
        continuation.vars = {};
        continue;
      }
      const limit = limitInfo(state, candidate, work.event);
      if (limit && usedLimit(state, limit) >= limit.count) {
        continuation.work_index++;
        continuation.step_cursor = 0;
        continuation.vars = {};
        continue;
      }
      continuation.program = records(
        candidate.listener.steps,
        "tcg_v0_2_event_listener_steps_required",
      ).map((step) => structuredClone(step));
      continuation.program_loaded = true;
      if (!continuation.program.length) {
        throw new Error("tcg_v0_2_event_listener_steps_empty");
      }
    }

    while (continuation.step_cursor < continuation.program.length) {
      setContinuation(state, continuation);
      const result = executeStep(
        state,
        continuation,
        candidate,
        work.event,
        continuation.program[continuation.step_cursor],
      );
      if (result === "choice") {
        return flow(continuation, pendingChoice(state));
      }
    }

    const limit = limitInfo(state, candidate, work.event);
    markResolved(state, candidate, work.event);
    consumeLimit(state, limit);
    continuation.processed_listener_keys.push(
      receiptKey(candidate, work.event),
    );
    continuation.work_index++;
    continuation.program_loaded = false;
    continuation.program = [];
    continuation.step_cursor = 0;
    continuation.vars = {};
  }

  const complete = flow(continuation, null);
  clearContinuation(state);
  return complete;
}

function recordEvent(
  state: Record<string, unknown>,
  event: RuntimeV02EventListenerEvent,
): void {
  if (!structuredEnabled(state)) return;
  const events = Array.isArray(state.effect_events)
    ? state.effect_events as Record<string, unknown>[]
    : (state.effect_events = []) as Record<string, unknown>[];
  if (!events.some((entry) => entry.event_id === event.event_id)) {
    events.push({ ...event });
  }
}

export function runtimeV02CreateCreatureEnteredPlayEvent(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  subjectUidRaw: unknown,
  reserveIndex: number,
): RuntimeV02EventListenerEvent {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  const turn = currentTurn(state);
  const subjectUid = requiredString(
    subjectUidRaw,
    "tcg_v0_2_event_listener_subject_uid_required",
  );
  if (!Number.isInteger(reserveIndex) || reserveIndex < 0 || reserveIndex > 3) {
    throw new Error(
      "tcg_v0_2_event_listener_destination_index_invalid",
    );
  }
  const reserve = player(state, controllerSeat).reserve as unknown[];
  const destination = objectRecord(reserve[reserveIndex]);
  const stack = Array.isArray(destination?.stack) ? destination.stack : [];
  const top = objectRecord(stack[stack.length - 1]);
  if (String(top?.uid || "") !== subjectUid) {
    throw new Error(
      "tcg_v0_2_event_listener_subject_destination_mismatch",
    );
  }
  const event: RuntimeV02EventListenerEvent = {
    event_id: `creature-entered:${turn}:${controllerSeat}:${subjectUid}`,
    event: "creature_entered_play",
    subject_uid: subjectUid,
    controller_seat: controllerSeat,
    origin_zone: "hand",
    destination_zone: "reserve",
    destination_index: reserveIndex,
    phase: "build",
    source_action_id: "play_creature",
    source_card_uid: subjectUid,
    action_kind: "play_creature",
    turn_seq: turn,
  };
  recordEvent(state, event);
  return { ...event };
}

export function runtimeV02CreateCreatureEvolvedEvent(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  subjectUidRaw: unknown,
  destinationZoneRaw: unknown,
  destinationIndexRaw: number | null,
): RuntimeV02EventListenerEvent {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  const turn = currentTurn(state);
  const subjectUid = requiredString(subjectUidRaw, "tcg_v0_2_event_listener_subject_uid_required");
  const destinationZone = String(destinationZoneRaw || "");
  if (destinationZone !== "vanguard" && destinationZone !== "reserve") {
    throw new Error("tcg_v0_2_event_listener_evolve_destination_zone_invalid");
  }
  const destinationIndex = destinationZone === "reserve" ? Number(destinationIndexRaw) : null;
  if (destinationZone === "reserve" && (!Number.isInteger(destinationIndex) || Number(destinationIndex) < 0 || Number(destinationIndex) > 3)) {
    throw new Error("tcg_v0_2_event_listener_destination_index_invalid");
  }
  if (destinationZone === "vanguard" && destinationIndexRaw != null) {
    throw new Error("tcg_v0_2_event_listener_vanguard_index_invalid");
  }
  const destination = allFields(state).find((field) =>
    field.seat === controllerSeat && field.where === destinationZone &&
    (destinationZone === "vanguard" || field.index === destinationIndex)
  );
  if (!destination || destination.top.uid !== subjectUid) {
    throw new Error("tcg_v0_2_event_listener_subject_destination_mismatch");
  }
  const event: RuntimeV02EventListenerEvent = {
    event_id: `creature-evolved:${turn}:${controllerSeat}:${subjectUid}`,
    event: "creature_evolved",
    subject_uid: subjectUid,
    controller_seat: controllerSeat,
    origin_zone: "hand",
    destination_zone: destinationZone,
    destination_index: destinationIndex,
    phase: "build",
    source_action_id: "evolve",
    source_card_uid: subjectUid,
    action_kind: "evolve",
    turn_seq: turn,
  };
  recordEvent(state, event);
  return { ...event };
}

export function runtimeV02BeginEventListenerContinuation(
  state: Record<string, unknown>,
  events: RuntimeV02EventListenerEvent[],
): RuntimeV02EventListenerFlow {
  if (state[CONTINUATION_KEY] != null || state[PENDING_KEY] != null) {
    throw new Error(
      "tcg_v0_2_event_listener_continuation_already_pending",
    );
  }
  if (!structuredEnabled(state)) {
    return {
      status: "complete",
      processed_listener_keys: [],
      emitted_heal_packet_ids: [],
      emitted_movement_events: [],
      pending_choice: null,
    };
  }
  if (!Array.isArray(events)) {
    throw new Error("tcg_v0_2_event_listener_events_required");
  }
  const turn = currentTurn(state);
  const work: WorkItem[] = [];
  for (const event of events) {
    if (
      Number(event.turn_seq) !== turn || !event.event_id || !event.event ||
      !event.subject_uid
    ) {
      throw new Error("tcg_v0_2_event_listener_event_invalid");
    }
    if (event.event === "essence_attached") {
      work.push(...essenceAttachedWorkItems(state, event));
      continue;
    }
    for (const candidate of collectCandidates(state, event.event)) {
      work.push({
        event: { ...event },
        source_uid: candidate.source.uid,
        listener_id: listenerId(candidate),
      });
    }
  }
  setContinuation(state, {
    turn_seq: turn,
    work,
    work_index: 0,
    program_loaded: false,
    program: [],
    step_cursor: 0,
    vars: {},
    processed_listener_keys: [],
    emitted_heal_packet_ids: [],
    emitted_movement_events: [],
  });
  return continueFlow(state);
}

function selectedOptions(
  pending: RuntimeV02PendingEventListenerChoice,
  ids: string[],
): Array<{
  id: string;
  label: string;
  data: Record<string, unknown>;
}> {
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length) {
    throw new Error("tcg_v0_2_event_listener_choice_ids_invalid");
  }
  if (ids.length < pending.min || ids.length > pending.max) {
    throw new Error("tcg_v0_2_event_listener_choice_count_invalid");
  }
  if (pending.mode === "order" && ids.length !== pending.options.length) {
    throw new Error("tcg_v0_2_event_listener_order_choice_incomplete");
  }
  const options = new Map(pending.options.map((option) => [option.id, option]));
  const selected = ids.map((id) => options.get(id));
  if (selected.some((option) => !option)) {
    throw new Error("tcg_v0_2_event_listener_choice_unknown_option");
  }
  return selected as Array<{
    id: string;
    label: string;
    data: Record<string, unknown>;
  }>;
}

export function runtimeV02ResolveEventListenerChoice(
  state: Record<string, unknown>,
  actorSeatRaw: number,
  choiceId: string,
  choiceIds: string[],
): RuntimeV02EventListenerFlow {
  const pending = pendingChoice(state);
  if (!pending) {
    throw new Error("tcg_v0_2_event_listener_choice_required");
  }
  const actorSeat = normalizedSeat(actorSeatRaw);
  if (pending.turn_seq !== currentTurn(state)) {
    throw new Error("tcg_v0_2_event_listener_choice_turn_stale");
  }
  if (pending.seat !== actorSeat) {
    throw new Error("tcg_v0_2_event_listener_choice_not_yours");
  }
  if (
    pending.id !== requiredString(
      choiceId,
      "tcg_v0_2_event_listener_choice_id_required",
    )
  ) {
    throw new Error("tcg_v0_2_event_listener_choice_stale_id");
  }

  const continuation = getContinuation(state);
  const work = currentWork(continuation);
  if (!work || work.event.event_id !== pending.event_id) {
    throw new Error("tcg_v0_2_event_listener_choice_work_stale");
  }
  const candidate = findCandidate(state, work);
  if (
    candidate.source.uid !== pending.source_uid ||
    listenerId(candidate) !== pending.listener_id
  ) {
    throw new Error("tcg_v0_2_event_listener_choice_source_stale");
  }
  const step = continuation.program[continuation.step_cursor];
  if (!step) {
    throw new Error("tcg_v0_2_event_listener_choice_step_stale");
  }
  const selected = selectedOptions(pending, choiceIds);

  if (pending.kind === "optional") {
    const accepted = selected[0]?.data.accepted === true;
    const nested = accepted
      ? records(
        step.steps || [],
        "tcg_v0_2_event_listener_optional_steps_invalid",
      ).map((item) => structuredClone(item))
      : [];
    continuation.program.splice(continuation.step_cursor, 1, ...nested);
  } else if (pending.kind === "select_creature") {
    const refs = selected.map((option) => option.data.ref as CreatureRef);
    for (const ref of refs) {
      if (!fieldFromRef(state, ref)) {
        throw new Error(
          "tcg_v0_2_event_listener_choice_creature_stale",
        );
      }
    }
    continuation.vars[String(pending.context.as || "selected_creature")] = refs;
    continuation.step_cursor++;
  } else if (
    pending.kind === "select_cards" ||
    pending.kind === "choose_from_set"
  ) {
    const refs = selected.map((option) => option.data.ref as CardRef);
    if (pending.kind === "choose_from_set") {
      const source = cardRefsFromVar(continuation, pending.context.source);
      const sourceUids = new Set(source.map((card) => card.uid));
      if (refs.some((card) => !sourceUids.has(card.uid))) {
        throw new Error(
          "tcg_v0_2_event_listener_choice_card_set_stale",
        );
      }
    } else {
      for (const ref of refs) {
        const zone = zoneCards(state, ref.zone_owner_seat, ref.zone);
        if (!zone.some((card) => card.uid === ref.uid && card.card_id === ref.card_id)) {
          throw new Error("tcg_v0_2_event_listener_choice_card_stale");
        }
      }
    }
    continuation.vars[String(pending.context.as || "selected_cards")] = refs;
    continuation.step_cursor++;
  } else if (pending.kind === "order_cards") {
    const refs = selected.map((option) => option.data.ref as CardRef);
    const source = cardRefsFromVar(continuation, pending.context.source);
    const sourceUids = new Set(source.map((card) => card.uid));
    if (refs.length !== source.length || refs.some((card) => !sourceUids.has(card.uid))) {
      throw new Error("tcg_v0_2_event_listener_order_choice_stale");
    }
    reorderDeckTop(state, refs);
    continuation.step_cursor++;
  } else if (pending.kind === "attach_essence") {
    const target = fieldFromRef(state, pending.context.target as CreatureRef);
    if (!target) throw new Error("tcg_v0_2_event_listener_attachment_target_stale");
    const attachmentState = objectRecord(pending.context.attachment_state);
    if (attachmentState) {
      if (
        String(attachmentState.kind || "") !== "temporary" ||
        String(attachmentState.expires || "") !== "controller_aftermath" ||
        String(attachmentState.destination_on_expire || "") !== "discard"
      ) {
        throw new Error("tcg_v0_2_event_listener_attachment_state_unsupported");
      }
    }
    for (const option of selected) {
      const ref = option.data.ref as CardRef;
      if (ref.zone !== "hand" && ref.zone !== "discard") {
        throw new Error("tcg_v0_2_event_listener_attachment_zone_unsupported");
      }
      const inst = removeCardRef(state, ref);
      inst.attached_turn = currentTurn(state);
      if (attachmentState) {
        inst.effect_flags = {
          ...(inst.effect_flags || {}),
          discard_during_target_aftermath: true,
        };
      }
      target.cr.essence.push(inst);
      registerStructuredRuntimeEssenceAttachmentLifecycleState(
        state,
        inst,
        currentTurn(state),
      );
      const receipt = recordRuntimeV02EssenceAttachmentEvent(
        state,
        candidate.seat,
        target.top.uid,
        inst,
        ref.zone,
        listenerId(candidate),
        attachmentState ? String(attachmentState.kind) : "normal",
      );
      const nestedEvent = runtimeV02CreateEssenceAttachedEvent(receipt, {
        phase: work.event.phase,
        action_kind: "effect_driven",
        destination_index: target.where === "reserve" ? target.index : null,
      });
      continuation.work.push(...essenceAttachedWorkItems(state, nestedEvent));
    }
    continuation.step_cursor++;
  } else if (pending.kind === "inspect_rewards") {
    const positions = selected.map((option) => Number(option.data.position));
    const inspected = runtimeV02InspectRewardPositions(
      state,
      candidate.seat,
      positions,
    );
    continuation.vars[String(pending.context.as || "inspected_rewards")] =
      inspected.cards.map((card) => ({
        ...card,
        zone_owner_seat: candidate.seat,
        zone: "rewards",
      } satisfies CardRef));
    continuation.step_cursor++;
  } else if (pending.kind === "clear_condition") {
    const target = fieldFromRef(
      state,
      pending.context.target as CreatureRef,
    );
    if (!target) {
      throw new Error(
        "tcg_v0_2_event_listener_choice_condition_target_stale",
      );
    }
    clearCondition(
      target,
      requiredString(
        selected[0]?.data.condition,
        "tcg_v0_2_event_listener_choice_condition_invalid",
      ),
    );
    continuation.step_cursor++;
  } else {
    throw new Error(
      "tcg_v0_2_event_listener_choice_kind_unsupported",
    );
  }

  delete state[PENDING_KEY];
  setContinuation(state, continuation);
  return continueFlow(state);
}

export function runtimeV02PendingEventListenerChoiceView(
  raw: RuntimeV02PendingEventListenerChoice | null | undefined,
  viewerSeatRaw: number,
): Record<string, unknown> | null {
  if (!raw) return null;
  const viewerSeat = normalizedSeat(viewerSeatRaw);
  if (raw.seat !== viewerSeat) {
    return {
      id: raw.id,
      seat: raw.seat,
      kind: raw.kind,
      waiting: true,
    };
  }
  return {
    id: raw.id,
    seat: raw.seat,
    kind: raw.kind,
    prompt: raw.prompt,
    min: raw.min,
    max: raw.max,
    mode: raw.mode,
    options: raw.options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
  };
}

export function runtimeV02PrivateEventInspectionView(
  state: Record<string, unknown>,
  viewerSeatRaw: number,
): RuntimeV02PrivateEventInspectionView | null {
  const viewerSeat = normalizedSeat(viewerSeatRaw);
  const root = objectRecord(state[PRIVATE_INSPECTION_KEY]);
  const raw = objectRecord(root?.[String(viewerSeat)]);
  if (
    !raw || Number(raw.turn_seq) !== currentTurn(state) ||
    Number(raw.controller_seat) !== viewerSeat ||
    Number(raw.zone_owner_seat) !== 1 &&
      Number(raw.zone_owner_seat) !== 2 ||
    !["deck_top", "hand"].includes(String(raw.zone || "")) ||
    !Array.isArray(raw.cards)
  ) return null;
  return {
    turn_seq: currentTurn(state),
    controller_seat: viewerSeat,
    zone_owner_seat: normalizedSeat(raw.zone_owner_seat),
    zone: String(raw.zone) as "deck_top" | "hand",
    cards: raw.cards.map((cardRaw, index) => {
      const card = objectRecord(cardRaw);
      if (!card) {
        throw new Error(
          `tcg_v0_2_event_listener_private_card_invalid:${index}`,
        );
      }
      return {
        position: Number(card.position),
        uid: requiredString(
          card.uid,
          `tcg_v0_2_event_listener_private_card_uid_invalid:${index}`,
        ),
        card_id: requiredString(
          card.card_id,
          `tcg_v0_2_event_listener_private_card_id_invalid:${index}`,
        ),
      };
    }),
  };
}
