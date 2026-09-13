import {
  runtimeV02ResolveDefeatedCreatures,
  type RuntimeV02CreaturePlayerState,
  type RuntimeV02CreatureState,
} from "./tcg-match-creature-engine-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";

export type RuntimeV02DefeatPlayerState<T extends RuntimeV02CardZoneInstance> =
  RuntimeV02CreaturePlayerState<T> & {
    rewards: T[];
  };

export type RuntimeV02DefeatState<T extends RuntimeV02CardZoneInstance> = {
  players: Record<string, RuntimeV02DefeatPlayerState<T>>;
  pending_resolutions?: Record<string, unknown>[];
  turn_seq?: number;
  active_seat?: 1 | 2;
  effect_events?: Record<string, unknown>[];
  runtime_v0_2_event_seq?: number;
};

export type RuntimeV02DefeatDescription = {
  max_hp: number;
  reward_value: number;
  label: string;
};

export type RuntimeV02DefeatDescribe<T extends RuntimeV02CardZoneInstance> = (
  creature: RuntimeV02CreatureState<T>,
  ownerSeat: 1 | 2,
  where: "vanguard" | "reserve",
  index: number | null,
) => RuntimeV02DefeatDescription;

export type RuntimeV02DefeatResolution =
  | { kind: "take_reward"; seat: 1 | 2; count: number; source: string }
  | { kind: "promote"; seat: 1 | 2 };

export type RuntimeV02DefeatScanContext = {
  action_kind?: string | null;
  source_action_id?: string | null;
  source_controller_seat?: 1 | 2 | null;
  source_card_uid?: string | null;
};

// Compatibility contract: keep this public result shape stable. Exact defeated
// instance identity belongs to the canonical defeat event stream, not this summary.
export type RuntimeV02DefeatScanRecord = {
  owner_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  max_hp: number;
  reward_value: number;
  label: string;
};

export type RuntimeV02CreatureDefeatedEvent = {
  event_id: string;
  event: "creature_defeated";
  sequence: number;
  turn_seq: number;
  active_seat: 1 | 2;
  owner_seat: 1 | 2;
  opponent_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  creature_uid: string;
  card_id: string;
  reward_value: number;
  action_kind: string | null;
  source_action_id: string | null;
  source_controller_seat: 1 | 2 | null;
  source_card_uid: string | null;
};

export type RuntimeV02DefeatScanResult = {
  defeated_count: number;
  defeated: RuntimeV02DefeatScanRecord[];
  defeat_receipts: Array<{
    owner_seat: 1 | 2;
    where: "vanguard" | "reserve";
    index: number | null;
    anchor_uid: string;
    discarded_card_uids: string[];
  }>;
  defeat_events: RuntimeV02CreatureDefeatedEvent[];
  queued_resolutions: RuntimeV02DefeatResolution[];
};

type RuntimeV02DefeatCandidate<T extends RuntimeV02CardZoneInstance> = {
  owner_seat: 1 | 2;
  player: RuntimeV02DefeatPlayerState<T>;
  where: "vanguard" | "reserve";
  index: number | null;
  creature: RuntimeV02CreatureState<T>;
  max_hp: number;
};

type RuntimeV02DefeatEventSeed = RuntimeV02DefeatScanRecord & {
  anchor_uid: string;
  card_id: string;
};

type RuntimeV02DefeatPreflight<T extends RuntimeV02CardZoneInstance> = {
  candidates: RuntimeV02DefeatCandidate<T>[];
  defeated: RuntimeV02DefeatScanRecord[];
  event_seeds: RuntimeV02DefeatEventSeed[];
};

function playerFor<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DefeatState<T>,
  seat: 1 | 2,
): RuntimeV02DefeatPlayerState<T> {
  const player = state?.players?.[String(seat)];
  if (!player || !Array.isArray(player.reserve) || !Array.isArray(player.discard) || !Array.isArray(player.rewards)) {
    throw new Error(`tcg_v0_2_defeat_player_invalid:${seat}`);
  }
  return player;
}

function fieldEntries<T extends RuntimeV02CardZoneInstance>(
  player: RuntimeV02DefeatPlayerState<T>,
): Array<{
  where: "vanguard" | "reserve";
  index: number | null;
  creature: RuntimeV02CreatureState<T>;
}> {
  const entries: Array<{
    where: "vanguard" | "reserve";
    index: number | null;
    creature: RuntimeV02CreatureState<T>;
  }> = [];
  if (player.vanguard) entries.push({ where: "vanguard", index: null, creature: player.vanguard });
  for (let index = 0; index < 4; index++) {
    const creature = player.reserve[index];
    if (creature) entries.push({ where: "reserve", index, creature });
  }
  return entries;
}

function requiredCardIdentity<T extends RuntimeV02CardZoneInstance>(
  creature: RuntimeV02CreatureState<T>,
  key: string,
): { anchor_uid: string; card_id: string } {
  if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error(`tcg_v0_2_defeat_stack_required:${key}`);
  }
  const top = creature.stack[creature.stack.length - 1];
  const anchorUid = typeof top?.uid === "string" ? top.uid.trim() : "";
  const cardId = typeof top?.card_id === "string" ? top.card_id.trim() : "";
  if (!anchorUid) throw new Error(`tcg_v0_2_defeat_anchor_uid_required:${key}`);
  if (!cardId) throw new Error(`tcg_v0_2_defeat_card_id_required:${key}`);
  return { anchor_uid: anchorUid, card_id: cardId };
}

function validatedDescription(raw: RuntimeV02DefeatDescription, key: string): RuntimeV02DefeatDescription {
  if (!raw || typeof raw !== "object") throw new Error(`tcg_v0_2_defeat_description_invalid:${key}`);
  const maxHp = Number(raw.max_hp);
  if (!Number.isFinite(maxHp) || maxHp <= 0) throw new Error(`tcg_v0_2_defeat_max_hp_invalid:${key}`);
  const rewardValue = Number(raw.reward_value);
  if (!Number.isInteger(rewardValue) || rewardValue < 1) throw new Error(`tcg_v0_2_defeat_reward_value_invalid:${key}`);
  const label = typeof raw.label === "string" ? raw.label.trim() : "";
  if (!label) throw new Error(`tcg_v0_2_defeat_label_required:${key}`);
  return { max_hp: maxHp, reward_value: rewardValue, label };
}

function validateResolutionQueue<T extends RuntimeV02CardZoneInstance>(state: RuntimeV02DefeatState<T>) {
  if (state.pending_resolutions != null && !Array.isArray(state.pending_resolutions)) {
    throw new Error("tcg_v0_2_defeat_resolution_queue_invalid");
  }
}

function eventLedgerEnabled<T extends RuntimeV02CardZoneInstance>(state: RuntimeV02DefeatState<T>): boolean {
  return state.turn_seq != null || state.active_seat != null || state.effect_events != null || state.runtime_v0_2_event_seq != null;
}

function validateEventState<T extends RuntimeV02CardZoneInstance>(state: RuntimeV02DefeatState<T>) {
  if (!eventLedgerEnabled(state)) return;
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) throw new Error("tcg_v0_2_defeat_turn_seq_invalid");
  if (state.active_seat !== 1 && state.active_seat !== 2) throw new Error("tcg_v0_2_defeat_active_seat_invalid");
  if (state.effect_events != null && !Array.isArray(state.effect_events)) {
    throw new Error("tcg_v0_2_defeat_event_stream_invalid");
  }
  if (state.runtime_v0_2_event_seq != null) {
    const sequence = Number(state.runtime_v0_2_event_seq);
    if (!Number.isInteger(sequence) || sequence < 0) {
      throw new Error("tcg_v0_2_defeat_event_sequence_invalid");
    }
  }
}

function collectDefeatPreflight<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DefeatState<T>,
  describe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02DefeatPreflight<T> {
  if (!state || typeof state !== "object" || typeof describe !== "function") {
    throw new Error("tcg_v0_2_defeat_scan_context_required");
  }
  validateResolutionQueue(state);
  validateEventState(state);

  const candidates: RuntimeV02DefeatCandidate<T>[] = [];
  const defeated: RuntimeV02DefeatScanRecord[] = [];
  const eventSeeds: RuntimeV02DefeatEventSeed[] = [];

  for (const seat of [1, 2] as const) {
    const player = playerFor(state, seat);
    for (const entry of fieldEntries(player)) {
      const key = `${seat}:${entry.where}:${entry.index == null ? "vanguard" : entry.index}`;
      const description = validatedDescription(describe(entry.creature, seat, entry.where, entry.index), key);
      const damage = Number(entry.creature.damage || 0);
      if (!Number.isFinite(damage) || damage < 0) throw new Error(`tcg_v0_2_defeat_damage_invalid:${key}`);
      if (damage < description.max_hp) continue;
      const identity = requiredCardIdentity(entry.creature, key);
      const record: RuntimeV02DefeatScanRecord = {
        owner_seat: seat,
        where: entry.where,
        index: entry.index,
        max_hp: description.max_hp,
        reward_value: description.reward_value,
        label: description.label,
      };

      candidates.push({
        owner_seat: seat,
        player,
        where: entry.where,
        index: entry.index,
        creature: entry.creature,
        max_hp: description.max_hp,
      });
      defeated.push(record);
      eventSeeds.push({ ...record, anchor_uid: identity.anchor_uid, card_id: identity.card_id });
    }
  }

  return { candidates, defeated, event_seeds: eventSeeds };
}

function normalizedContext(context: RuntimeV02DefeatScanContext): Required<RuntimeV02DefeatScanContext> {
  const actionKind = context.action_kind == null ? null : String(context.action_kind).trim();
  const sourceActionId = context.source_action_id == null ? null : String(context.source_action_id).trim();
  const sourceCardUid = context.source_card_uid == null ? null : String(context.source_card_uid).trim();
  const sourceController = context.source_controller_seat == null ? null : context.source_controller_seat;
  if (actionKind === "") throw new Error("tcg_v0_2_defeat_action_kind_invalid");
  if (sourceActionId === "") throw new Error("tcg_v0_2_defeat_source_action_id_invalid");
  if (sourceCardUid === "") throw new Error("tcg_v0_2_defeat_source_card_uid_invalid");
  if (sourceController != null && sourceController !== 1 && sourceController !== 2) {
    throw new Error("tcg_v0_2_defeat_source_controller_invalid");
  }
  return {
    action_kind: actionKind,
    source_action_id: sourceActionId,
    source_controller_seat: sourceController,
    source_card_uid: sourceCardUid,
  };
}

function appendDefeatEvents<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DefeatState<T>,
  defeated: RuntimeV02DefeatEventSeed[],
  context: RuntimeV02DefeatScanContext,
): RuntimeV02CreatureDefeatedEvent[] {
  if (!defeated.length || !eventLedgerEnabled(state)) return [];
  const turn = Number(state.turn_seq);
  const activeSeat = state.active_seat;
  if (!Number.isInteger(turn) || turn < 0) throw new Error("tcg_v0_2_defeat_turn_seq_invalid");
  if (activeSeat !== 1 && activeSeat !== 2) throw new Error("tcg_v0_2_defeat_active_seat_invalid");
  if (state.effect_events == null) state.effect_events = [];
  const stream = state.effect_events as Record<string, unknown>[];
  let sequence = Number(state.runtime_v0_2_event_seq ?? 0);
  const source = normalizedContext(context);
  const emitted: RuntimeV02CreatureDefeatedEvent[] = [];

  for (const record of defeated) {
    sequence += 1;
    const event: RuntimeV02CreatureDefeatedEvent = {
      event_id: `creature-defeated:${turn}:${sequence}:${record.owner_seat}:${record.anchor_uid}`,
      event: "creature_defeated",
      sequence,
      turn_seq: turn,
      active_seat: activeSeat,
      owner_seat: record.owner_seat,
      opponent_seat: record.owner_seat === 1 ? 2 : 1,
      where: record.where,
      index: record.index,
      creature_uid: record.anchor_uid,
      card_id: record.card_id,
      reward_value: record.reward_value,
      action_kind: source.action_kind,
      source_action_id: source.source_action_id,
      source_controller_seat: source.source_controller_seat,
      source_card_uid: source.source_card_uid,
    };
    stream.push(event as unknown as Record<string, unknown>);
    emitted.push(event);
  }
  state.runtime_v0_2_event_seq = sequence;
  return emitted;
}

/**
 * Non-mutating owner #34 preflight. Compound damage transactions use this before
 * changing HP so malformed battlefield descriptions, resolution-queue state or
 * structured event-ledger state cannot be discovered only after damage applied.
 */
export function runtimeV02PreflightDefeatScan<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DefeatState<T>,
  describe: RuntimeV02DefeatDescribe<T>,
): { defeated_count: number; defeated: RuntimeV02DefeatScanRecord[] } {
  const preflight = collectDefeatPreflight(state, describe);
  return { defeated_count: preflight.defeated.length, defeated: structuredClone(preflight.defeated) };
}

/**
 * Canonical owner #34 defeat-lifecycle orchestration.
 * Creature #13 owns the physical defeated-creature transaction and delegates card
 * movement to Card-Zone #30. This owner scans in stable seat / field order, resolves
 * exact defeated candidates, records canonical defeat history when structured event
 * context is present, then queues Reward taking and forced Vanguard promotion.
 */
export function runtimeV02ScanAndQueueDefeats<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02DefeatState<T>,
  describe: RuntimeV02DefeatDescribe<T>,
  context: RuntimeV02DefeatScanContext = {},
): RuntimeV02DefeatScanResult {
  const preflight = collectDefeatPreflight(state, describe);
  normalizedContext(context);
  const physical = preflight.candidates.length > 0
    ? runtimeV02ResolveDefeatedCreatures(preflight.candidates)
    : null;
  const defeatEvents = appendDefeatEvents(state, preflight.event_seeds, context);

  if (state.pending_resolutions == null) state.pending_resolutions = [];
  const queue = state.pending_resolutions as Record<string, unknown>[];
  const queued: RuntimeV02DefeatResolution[] = [];

  for (const record of preflight.defeated) {
    const receiver = (record.owner_seat === 1 ? 2 : 1) as 1 | 2;
    const receiverPlayer = playerFor(state, receiver);
    const available = receiverPlayer.rewards.length;
    if (available < 1) continue;
    const resolution: RuntimeV02DefeatResolution = {
      kind: "take_reward",
      seat: receiver,
      count: Math.min(record.reward_value, available),
      source: record.label,
    };
    queue.push(resolution);
    queued.push(resolution);
  }

  for (const seat of [1, 2] as const) {
    const player = playerFor(state, seat);
    if (!player.vanguard && player.reserve.some(Boolean)) {
      const resolution: RuntimeV02DefeatResolution = { kind: "promote", seat };
      queue.push(resolution);
      queued.push(resolution);
    }
  }

  return {
    defeated_count: preflight.defeated.length,
    defeated: preflight.defeated,
    defeat_receipts: physical?.defeats || [],
    defeat_events: defeatEvents,
    queued_resolutions: queued,
  };
}
