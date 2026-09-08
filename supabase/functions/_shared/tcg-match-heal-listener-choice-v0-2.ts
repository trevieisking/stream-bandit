import {
  continueRuntimeV02AfterHealPackets,
  type RuntimeV02HealListenerContinuation,
} from "./tcg-match-heal-listener-continuation-v0-2.ts";
import {
  runtimeV02CurrentTurnHealPackets,
  type RuntimeV02HealPacket,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02HealListenerChoiceStage =
  | "optional_decision"
  | "discard_from_hand";

export type RuntimeV02HealListenerChoiceOption = {
  id: string;
  label: string;
  data: Record<string, unknown>;
};

export type RuntimeV02PendingHealListenerChoice = {
  id: string;
  kind: "after_heal_optional";
  stage: RuntimeV02HealListenerChoiceStage;
  seat: 1 | 2;
  packet_id: string;
  packet_turn_seq: number;
  listener_id: string;
  source_uid: string;
  source_card_id: string;
  source_kind: "ability" | "essence" | "realm";
  source_controller_seat: 1 | 2;
  event_controller_seat: 1 | 2;
  limit_owner: string | null;
  remaining_packet_ids: string[];
  prompt: string;
  min: 1;
  max: 1;
  mode: "select";
  options: RuntimeV02HealListenerChoiceOption[];
};

export type RuntimeV02HealListenerChoiceResolution = {
  accepted: boolean | null;
  drawn: number;
  discarded_uid: string | null;
  pending_choice: RuntimeV02PendingHealListenerChoice | null;
  continuation: RuntimeV02HealListenerContinuation | null;
};

type Inst = {
  uid: string;
  card_id: string;
  effect_flags?: Record<string, unknown>;
};

type LocatedListener = {
  source: Inst;
  listener: Record<string, unknown>;
  source_kind: "ability" | "essence" | "realm";
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function nonEmpty(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function topInstance(creature: unknown): Inst | null {
  const record = objectRecord(creature);
  if (!record || !Array.isArray(record.stack) || record.stack.length === 0) return null;
  const top = objectRecord(record.stack[record.stack.length - 1]);
  if (!top) return null;
  const uid = nonEmpty(top.uid, "tcg_v0_2_heal_choice_source_uid_required");
  const cardId = nonEmpty(top.card_id, "tcg_v0_2_heal_choice_source_card_id_required");
  return top as Inst & { uid: string; card_id: string };
}

function allFieldCreatures(state: Record<string, unknown>) {
  const players = objectRecord(state.players);
  if (!players) throw new Error("tcg_v0_2_heal_choice_players_required");
  const out: Array<{ seat: 1 | 2; creature: Record<string, unknown> }> = [];
  for (const who of [1, 2] as const) {
    const player = objectRecord(players[String(who)]);
    if (!player) throw new Error("tcg_v0_2_heal_choice_player_required");
    if (player.vanguard != null) {
      const creature = objectRecord(player.vanguard);
      if (!creature) throw new Error("tcg_v0_2_heal_choice_vanguard_invalid");
      out.push({ seat: who, creature });
    }
    if (player.reserve != null && !Array.isArray(player.reserve)) {
      throw new Error("tcg_v0_2_heal_choice_reserve_invalid");
    }
    const reserve = Array.isArray(player.reserve) ? player.reserve : [];
    for (let index = 0; index < 4; index++) {
      if (reserve[index] == null) continue;
      const creature = objectRecord(reserve[index]);
      if (!creature) throw new Error("tcg_v0_2_heal_choice_reserve_creature_invalid");
      out.push({ seat: who, creature });
    }
  }
  return out;
}

function definition(state: Record<string, unknown>, source: Inst) {
  const value = runtimeV02Definition(state, source);
  if (!value) throw new Error("tcg_v0_2_heal_choice_definition_missing");
  return value;
}

function listenerById(listeners: unknown, listenerId: string) {
  if (!Array.isArray(listeners)) return null;
  const matches = listeners.filter((raw) => {
    const item = objectRecord(raw);
    return item && String(item.id || "") === listenerId;
  });
  if (matches.length > 1) throw new Error("tcg_v0_2_heal_choice_duplicate_listener_id");
  return matches.length === 1 ? objectRecord(matches[0]) : null;
}

function locateListener(
  state: Record<string, unknown>,
  sourceKind: "ability" | "essence" | "realm",
  sourceUid: string,
  listenerId: string,
): LocatedListener {
  if (sourceKind === "realm") {
    const realm = objectRecord(state.realm);
    const source = realm ? objectRecord(realm.card) as Inst | null : null;
    if (!source || String(source.uid || "") !== sourceUid) {
      throw new Error("tcg_v0_2_heal_choice_realm_source_missing");
    }
    const def = definition(state, source);
    const tactic = objectRecord(def.tactic);
    const listener = listenerById(tactic?.listeners, listenerId);
    if (!listener) throw new Error("tcg_v0_2_heal_choice_listener_missing");
    return { source, listener, source_kind: sourceKind };
  }

  for (const field of allFieldCreatures(state)) {
    const top = topInstance(field.creature);
    if (sourceKind === "ability" && top?.uid === sourceUid) {
      const def = definition(state, top);
      const creature = objectRecord(def.creature);
      const listener = objectRecord(creature?.ability);
      if (!listener || String(listener.id || "") !== listenerId) {
        throw new Error("tcg_v0_2_heal_choice_listener_missing");
      }
      return { source: top, listener, source_kind: sourceKind };
    }
    if (sourceKind === "essence") {
      const essence = field.creature.essence;
      if (essence != null && !Array.isArray(essence)) {
        throw new Error("tcg_v0_2_heal_choice_essence_zone_invalid");
      }
      for (const raw of Array.isArray(essence) ? essence : []) {
        const source = objectRecord(raw) as Inst | null;
        if (!source || String(source.uid || "") !== sourceUid) continue;
        const def = definition(state, source);
        const essenceDef = objectRecord(def.essence);
        const listener = listenerById(essenceDef?.listeners, listenerId);
        if (!listener) throw new Error("tcg_v0_2_heal_choice_listener_missing");
        return { source, listener, source_kind: sourceKind };
      }
    }
  }
  throw new Error("tcg_v0_2_heal_choice_source_missing");
}

function exactOptionalProgram(listener: Record<string, unknown>) {
  if (String(listener.event || "") !== "after_heal_packet") {
    throw new Error("tcg_v0_2_heal_choice_listener_event_invalid");
  }
  if (!Array.isArray(listener.steps) || listener.steps.length !== 1) {
    throw new Error("tcg_v0_2_heal_choice_program_unsupported");
  }
  const optional = objectRecord(listener.steps[0]);
  if (!optional || String(optional.op || "") !== "OPTIONAL") {
    throw new Error("tcg_v0_2_heal_choice_program_unsupported");
  }
  if (String(optional.player || "") !== "$event_controller") {
    throw new Error("tcg_v0_2_heal_choice_optional_player_unsupported");
  }
  if (!Array.isArray(optional.steps) || optional.steps.length !== 2) {
    throw new Error("tcg_v0_2_heal_choice_program_unsupported");
  }
  const draw = objectRecord(optional.steps[0]);
  const discard = objectRecord(optional.steps[1]);
  if (
    !draw ||
    String(draw.op || "") !== "DRAW" ||
    String(draw.player || "") !== "$event_controller" ||
    Number(draw.count) !== 1 ||
    !discard ||
    String(discard.op || "") !== "CHOOSE_HAND_TO_DISCARD" ||
    String(discard.player || "") !== "$event_controller" ||
    Number(discard.count) !== 1
  ) {
    throw new Error("tcg_v0_2_heal_choice_program_unsupported");
  }
  return { optional, draw, discard };
}

function currentPacket(state: Record<string, unknown>, packetId: string): RuntimeV02HealPacket {
  const matches = runtimeV02CurrentTurnHealPackets(state).filter((packet) => packet.id === packetId);
  if (matches.length !== 1) {
    throw new Error(`tcg_v0_2_heal_choice_packet_not_found:${packetId}`);
  }
  return matches[0];
}

function sourceState(source: Inst, make = false) {
  if (source.effect_flags == null) {
    if (!make) return null;
    source.effect_flags = {};
  }
  const flags = objectRecord(source.effect_flags);
  if (!flags) throw new Error("tcg_v0_2_heal_choice_source_flags_invalid");
  return flags;
}

function stateBucket(
  source: Inst,
  name: "runtime_v0_2_listener_receipts" | "runtime_v0_2_listener_limits",
  make = false,
) {
  const flags = sourceState(source, make);
  if (!flags) return null;
  if (flags[name] == null) {
    if (!make) return null;
    flags[name] = {};
  }
  const bucket = objectRecord(flags[name]);
  if (!bucket) throw new Error("tcg_v0_2_heal_choice_listener_state_invalid");
  return bucket;
}

function receiptKey(listenerId: string, packetId: string) {
  return `${listenerId}:${packetId}`;
}

function limitSpec(
  located: LocatedListener,
  packet: RuntimeV02HealPacket,
): { owner: string; count: number; key: string } | null {
  const raw = objectRecord(located.listener.limit);
  if (!raw) return null;
  if (String(raw.scope || "") !== "turn") {
    throw new Error("tcg_v0_2_heal_choice_limit_scope_unsupported");
  }
  const count = Number(raw.count);
  const owner = String(raw.owner || "");
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("tcg_v0_2_heal_choice_limit_count_invalid");
  }
  let ownerKey = "";
  if (owner === "card_instance") ownerKey = `card_instance:${located.source.uid}`;
  else if (owner === "attachment") {
    if (located.source_kind !== "essence") {
      throw new Error("tcg_v0_2_heal_choice_attachment_owner_requires_attachment");
    }
    ownerKey = `attachment:${located.source.uid}`;
  } else if (owner === "event_controller") {
    ownerKey = `event_controller:${packet.controller_seat}`;
  } else {
    throw new Error("tcg_v0_2_heal_choice_limit_owner_unsupported");
  }
  return { owner, count, key: `${String(located.listener.id)}:${ownerKey}` };
}

function assertUnresolved(
  located: LocatedListener,
  packet: RuntimeV02HealPacket,
) {
  const listenerId = nonEmpty(located.listener.id, "tcg_v0_2_heal_choice_listener_id_required");
  const receipt = objectRecord(stateBucket(located.source, "runtime_v0_2_listener_receipts")?.[receiptKey(listenerId, packet.id)]);
  if (receipt) {
    if (
      String(receipt.packet_id || "") !== packet.id ||
      String(receipt.listener_id || "") !== listenerId ||
      Number(receipt.turn_seq) !== packet.turn_seq
    ) {
      throw new Error("tcg_v0_2_heal_choice_receipt_invalid");
    }
    throw new Error("tcg_v0_2_heal_choice_already_resolved");
  }
  const limit = limitSpec(located, packet);
  if (!limit) return;
  const counter = objectRecord(stateBucket(located.source, "runtime_v0_2_listener_limits")?.[limit.key]);
  if (!counter) return;
  const turn = Number(counter.turn_seq);
  const count = Number(counter.count);
  if (!Number.isInteger(turn) || !Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_heal_choice_limit_counter_invalid");
  }
  if (turn === packet.turn_seq && count >= limit.count) {
    throw new Error("tcg_v0_2_heal_choice_limit_already_consumed");
  }
}

function markReceipt(located: LocatedListener, packet: RuntimeV02HealPacket) {
  const listenerId = nonEmpty(located.listener.id, "tcg_v0_2_heal_choice_listener_id_required");
  const bucket = stateBucket(located.source, "runtime_v0_2_listener_receipts", true)!;
  bucket[receiptKey(listenerId, packet.id)] = {
    packet_id: packet.id,
    listener_id: listenerId,
    turn_seq: packet.turn_seq,
  };
}

function consumeLimit(located: LocatedListener, packet: RuntimeV02HealPacket) {
  const limit = limitSpec(located, packet);
  if (!limit) return;
  const bucket = stateBucket(located.source, "runtime_v0_2_listener_limits", true)!;
  const raw = objectRecord(bucket[limit.key]);
  let used = 0;
  if (raw && Number(raw.turn_seq) === packet.turn_seq) used = Number(raw.count);
  if (!Number.isInteger(used) || used < 0 || used >= limit.count) {
    throw new Error("tcg_v0_2_heal_choice_limit_already_consumed");
  }
  bucket[limit.key] = {
    turn_seq: packet.turn_seq,
    count: used + 1,
    owner: limit.owner,
    listener_id: String(located.listener.id),
  };
}

function cardLabel(state: Record<string, unknown>, raw: unknown) {
  const inst = objectRecord(raw) as Inst | null;
  if (!inst) throw new Error("tcg_v0_2_heal_choice_hand_card_invalid");
  const def = runtimeV02Definition(state, inst);
  return String(def?.name || inst.card_id || "Card");
}

function handOptions(state: Record<string, unknown>, chooserSeat: 1 | 2) {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(chooserSeat)]) : null;
  if (!player || !Array.isArray(player.hand)) {
    throw new Error("tcg_v0_2_heal_choice_hand_required");
  }
  return player.hand.map((raw) => {
    const inst = objectRecord(raw) as Inst | null;
    if (!inst) throw new Error("tcg_v0_2_heal_choice_hand_card_invalid");
    const uid = nonEmpty(inst.uid, "tcg_v0_2_heal_choice_hand_uid_required");
    const cardId = nonEmpty(inst.card_id, "tcg_v0_2_heal_choice_hand_card_id_required");
    return {
      id: `card:${uid}`,
      label: cardLabel(state, inst),
      data: { uid, card_id: cardId },
    } satisfies RuntimeV02HealListenerChoiceOption;
  });
}

function projectedDiscardAvailable(state: Record<string, unknown>, chooserSeat: 1 | 2) {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(chooserSeat)]) : null;
  if (!player || !Array.isArray(player.hand) || !Array.isArray(player.deck)) {
    throw new Error("tcg_v0_2_heal_choice_player_zones_required");
  }
  return player.hand.length + (player.deck.length > 0 ? 1 : 0) >= 1;
}

function pendingFromContinuation(
  state: Record<string, unknown>,
  continuation: RuntimeV02HealListenerContinuation,
): RuntimeV02PendingHealListenerChoice {
  if (continuation.status !== "player_choice_required") {
    throw new Error("tcg_v0_2_heal_choice_continuation_not_blocked");
  }
  const packetId = nonEmpty(continuation.blocked_packet_id, "tcg_v0_2_heal_choice_blocked_packet_required");
  if (!Array.isArray(continuation.deferred) || continuation.deferred.length !== 1) {
    throw new Error("tcg_v0_2_heal_choice_exactly_one_deferred_listener_required");
  }
  const deferred = objectRecord(continuation.deferred[0]);
  if (!deferred || String(deferred.reason || "") !== "player_choice_required") {
    throw new Error("tcg_v0_2_heal_choice_deferred_invalid");
  }
  const listenerId = nonEmpty(deferred.listener_id, "tcg_v0_2_heal_choice_listener_id_required");
  const sourceUid = nonEmpty(deferred.source_uid, "tcg_v0_2_heal_choice_source_uid_required");
  const sourceCardId = nonEmpty(deferred.source_card_id, "tcg_v0_2_heal_choice_source_card_id_required");
  const sourceKindRaw = String(deferred.source_kind || "");
  if (!["ability", "essence", "realm"].includes(sourceKindRaw)) {
    throw new Error("tcg_v0_2_heal_choice_source_kind_unsupported");
  }
  const sourceKind = sourceKindRaw as "ability" | "essence" | "realm";
  const chooserSeat = seat(deferred.chooser_seat, "tcg_v0_2_heal_choice_chooser_seat_invalid");
  const sourceController = seat(deferred.controller_seat, "tcg_v0_2_heal_choice_source_controller_invalid");
  const packet = currentPacket(state, packetId);
  if (chooserSeat !== packet.controller_seat) {
    throw new Error("tcg_v0_2_heal_choice_event_controller_mismatch");
  }
  const located = locateListener(state, sourceKind, sourceUid, listenerId);
  if (String(located.source.card_id || "") !== sourceCardId) {
    throw new Error("tcg_v0_2_heal_choice_source_card_mismatch");
  }
  exactOptionalProgram(located.listener);
  assertUnresolved(located, packet);
  const spec = limitSpec(located, packet);
  const advertisedOwner = deferred.limit_owner == null ? null : String(deferred.limit_owner);
  if ((spec?.owner || null) !== advertisedOwner) {
    throw new Error("tcg_v0_2_heal_choice_limit_owner_mismatch");
  }
  const options: RuntimeV02HealListenerChoiceOption[] = [
    { id: "decline", label: "Decline", data: { decision: "decline" } },
  ];
  if (projectedDiscardAvailable(state, chooserSeat)) {
    options.push({ id: "accept", label: "Accept", data: { decision: "accept" } });
  }
  return {
    id: crypto.randomUUID(),
    kind: "after_heal_optional",
    stage: "optional_decision",
    seat: chooserSeat,
    packet_id: packet.id,
    packet_turn_seq: packet.turn_seq,
    listener_id: listenerId,
    source_uid: sourceUid,
    source_card_id: sourceCardId,
    source_kind: sourceKind,
    source_controller_seat: sourceController,
    event_controller_seat: packet.controller_seat,
    limit_owner: spec?.owner || null,
    remaining_packet_ids: [...continuation.remaining_packet_ids],
    prompt: "Use optional heal effect?",
    min: 1,
    max: 1,
    mode: "select",
    options,
  };
}

function validatePending(
  state: Record<string, unknown>,
  pending: RuntimeV02PendingHealListenerChoice,
) {
  if (pending.kind !== "after_heal_optional") {
    throw new Error("tcg_v0_2_heal_choice_kind_invalid");
  }
  const packet = currentPacket(state, pending.packet_id);
  if (packet.turn_seq !== pending.packet_turn_seq || packet.controller_seat !== pending.event_controller_seat) {
    throw new Error("tcg_v0_2_heal_choice_packet_stale");
  }
  const located = locateListener(state, pending.source_kind, pending.source_uid, pending.listener_id);
  if (String(located.source.card_id || "") !== pending.source_card_id) {
    throw new Error("tcg_v0_2_heal_choice_source_card_mismatch");
  }
  exactOptionalProgram(located.listener);
  assertUnresolved(located, packet);
  const spec = limitSpec(located, packet);
  if ((spec?.owner || null) !== pending.limit_owner) {
    throw new Error("tcg_v0_2_heal_choice_limit_owner_mismatch");
  }
  return { packet, located };
}

function selectPendingOption(
  pending: RuntimeV02PendingHealListenerChoice,
  choiceIds: string[],
) {
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_heal_choice_exactly_one_option_required");
  }
  const option = pending.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_heal_choice_unknown_option");
  return option;
}

function resume(
  state: Record<string, unknown>,
  packetIds: string[],
): {
  continuation: RuntimeV02HealListenerContinuation | null;
  pending: RuntimeV02PendingHealListenerChoice | null;
} {
  if (packetIds.length === 0) return { continuation: null, pending: null };
  const continuation = continueRuntimeV02AfterHealPackets(state, packetIds);
  if (!continuation) throw new Error("tcg_v0_2_heal_choice_resume_unavailable");
  if (continuation.status === "player_choice_required") {
    return { continuation, pending: pendingFromContinuation(state, continuation) };
  }
  return { continuation, pending: null };
}

export function runtimeV02InstallHealListenerChoice(
  state: Record<string, unknown>,
  continuation: RuntimeV02HealListenerContinuation,
): RuntimeV02PendingHealListenerChoice {
  if (state.pending_heal_listener_choice != null) {
    throw new Error("tcg_v0_2_heal_choice_already_pending");
  }
  const pending = pendingFromContinuation(state, continuation);
  state.pending_heal_listener_choice = pending;
  return pending;
}

export function runtimeV02PendingHealListenerChoiceView(
  pending: RuntimeV02PendingHealListenerChoice | null,
  viewerSeat: 1 | 2,
) {
  if (!pending) return null;
  if (pending.seat !== viewerSeat) {
    return {
      id: pending.id,
      seat: pending.seat,
      kind: pending.kind,
      stage: pending.stage,
      waiting: true,
    };
  }
  return {
    id: pending.id,
    seat: pending.seat,
    kind: pending.kind,
    stage: pending.stage,
    prompt: pending.prompt,
    min: pending.min,
    max: pending.max,
    mode: pending.mode,
    options: pending.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

export function runtimeV02ResolveHealListenerChoice(
  state: Record<string, unknown>,
  actorSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
): RuntimeV02HealListenerChoiceResolution {
  const pending = state.pending_heal_listener_choice as RuntimeV02PendingHealListenerChoice | null;
  if (!pending) throw new Error("tcg_v0_2_heal_choice_not_pending");
  if (pending.seat !== actorSeat) throw new Error("tcg_v0_2_heal_choice_not_yours");
  if (nonEmpty(choiceId, "tcg_v0_2_heal_choice_id_required") !== pending.id) {
    throw new Error("tcg_v0_2_heal_choice_stale_id");
  }
  const { packet, located } = validatePending(state, pending);
  const selected = selectPendingOption(pending, choiceIds);

  if (pending.stage === "optional_decision") {
    const decision = String(selected.data.decision || "");
    if (decision === "decline") {
      markReceipt(located, packet);
      delete state.pending_heal_listener_choice;
      const resumed = resume(state, pending.remaining_packet_ids);
      if (resumed.pending) state.pending_heal_listener_choice = resumed.pending;
      return {
        accepted: false,
        drawn: 0,
        discarded_uid: null,
        pending_choice: resumed.pending,
        continuation: resumed.continuation,
      };
    }
    if (decision !== "accept") throw new Error("tcg_v0_2_heal_choice_decision_invalid");
    if (!projectedDiscardAvailable(state, pending.seat)) {
      throw new Error("tcg_v0_2_heal_choice_accept_unavailable");
    }
    const players = objectRecord(state.players)!;
    const player = objectRecord(players[String(pending.seat)])!;
    if (!Array.isArray(player.deck) || !Array.isArray(player.hand)) {
      throw new Error("tcg_v0_2_heal_choice_player_zones_required");
    }
    const drawn = Math.min(1, player.deck.length);
    player.hand.push(...player.deck.splice(0, drawn));
    const options = handOptions(state, pending.seat);
    if (options.length < 1) throw new Error("tcg_v0_2_heal_choice_discard_unavailable");
    const next: RuntimeV02PendingHealListenerChoice = {
      ...pending,
      id: crypto.randomUUID(),
      stage: "discard_from_hand",
      prompt: "Choose one card to discard",
      options,
    };
    state.pending_heal_listener_choice = next;
    return {
      accepted: true,
      drawn,
      discarded_uid: null,
      pending_choice: next,
      continuation: null,
    };
  }

  if (pending.stage !== "discard_from_hand") {
    throw new Error("tcg_v0_2_heal_choice_stage_invalid");
  }
  const uid = nonEmpty(selected.data.uid, "tcg_v0_2_heal_choice_discard_uid_required");
  const cardId = nonEmpty(selected.data.card_id, "tcg_v0_2_heal_choice_discard_card_id_required");
  const players = objectRecord(state.players)!;
  const player = objectRecord(players[String(pending.seat)])!;
  if (!Array.isArray(player.hand) || !Array.isArray(player.discard)) {
    throw new Error("tcg_v0_2_heal_choice_player_zones_required");
  }
  const index = player.hand.findIndex((raw) => {
    const inst = objectRecord(raw);
    return String(inst?.uid || "") === uid && String(inst?.card_id || "") === cardId;
  });
  if (index < 0) throw new Error("tcg_v0_2_heal_choice_selected_hand_card_missing");

  // Validate every listener-state bucket before changing the hand so malformed
  // counters/receipts cannot leave a partial discard behind.
  sourceState(located.source, false);
  stateBucket(located.source, "runtime_v0_2_listener_receipts", false);
  stateBucket(located.source, "runtime_v0_2_listener_limits", false);
  assertUnresolved(located, packet);

  const [discarded] = player.hand.splice(index, 1);
  player.discard.push(discarded);
  markReceipt(located, packet);
  consumeLimit(located, packet);
  delete state.pending_heal_listener_choice;
  const resumed = resume(state, pending.remaining_packet_ids);
  if (resumed.pending) state.pending_heal_listener_choice = resumed.pending;
  return {
    accepted: true,
    drawn: 0,
    discarded_uid: uid,
    pending_choice: resumed.pending,
    continuation: resumed.continuation,
  };
}
