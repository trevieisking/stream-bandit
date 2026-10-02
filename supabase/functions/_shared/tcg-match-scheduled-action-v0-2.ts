import {
  runtimeV02ApplyCardZoneTransfer,
  type RuntimeV02CardZoneInstance,
} from "./tcg-match-card-zone-engine-v0-2.ts";

type Seat = 1 | 2;

export type RuntimeV02ScheduledDrawFixedStep = {
  op: "DRAW_FIXED";
  player: "self" | "opponent";
  count: number;
  deckout_on_incomplete: boolean;
};

export type RuntimeV02ScheduledSourceDiscardStep = {
  op: "DISCARD_SOURCE";
  source_zone: "attached_relic";
};

export type RuntimeV02ScheduledActionStep =
  | RuntimeV02ScheduledDrawFixedStep
  | RuntimeV02ScheduledSourceDiscardStep;

export type RuntimeV02ScheduledActionInput = {
  owner_seat: Seat;
  source_action_id: string;
  source_card_uid: string;
  trigger: "controller_aftermath_finished" | "after_attack_finished";
  match_must_be_active: boolean;
  steps: RuntimeV02ScheduledActionStep[];
};

export type RuntimeV02ScheduledActionEntry = RuntimeV02ScheduledActionInput & {
  id: string;
  scheduled_turn_seq: number;
};

export type RuntimeV02ScheduledActionResolution = {
  id: string;
  owner_seat: Seat;
  source_action_id: string;
  executed: boolean;
  skipped_match_inactive: boolean;
  draws: Array<{
    seat: Seat;
    requested: number;
    drawn: number;
    deckout: boolean;
  }>;
};

type RuntimePlayer = {
  deck: RuntimeV02CardZoneInstance[];
  hand: RuntimeV02CardZoneInstance[];
};

type RuntimeState = Record<string, unknown> & {
  turn_seq: number;
  active_seat: Seat;
  phase?: string;
  deckout_loser?: Seat;
  players: Record<string, RuntimePlayer>;
};

const LEDGER_KEY = "runtime_v0_2_scheduled_actions";

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

function seat(value: unknown, code: string): Seat {
  if (value !== 1 && value !== 2) throw new Error(code);
  return value;
}

function turnSeq(state: RuntimeState): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_scheduled_action_turn_invalid");
  }
  return turn;
}

function player(state: RuntimeState, who: Seat): RuntimePlayer {
  const raw = objectRecord(state.players?.[String(who)]);
  if (!raw || !Array.isArray(raw.deck) || !Array.isArray(raw.hand)) {
    throw new Error("tcg_v0_2_scheduled_action_player_invalid");
  }
  return raw as unknown as RuntimePlayer;
}

function normalizeStep(raw: unknown, index: number): RuntimeV02ScheduledActionStep {
  const step = objectRecord(raw);
  if (!step) throw new Error(`tcg_v0_2_scheduled_action_step_unsupported:${index}`);
  if (step.op === "DRAW_FIXED") {
    const allowed = new Set(["op", "player", "count", "deckout_on_incomplete"]);
    const extra = Object.keys(step).find((key) => !allowed.has(key));
    if (extra) {
      throw new Error(`tcg_v0_2_scheduled_action_step_field_unsupported:${index}:${extra}`);
    }
    if (step.player !== "self" && step.player !== "opponent") {
      throw new Error(`tcg_v0_2_scheduled_action_player_token_invalid:${index}`);
    }
    const count = Number(step.count);
    if (!Number.isInteger(count) || count < 1) {
      throw new Error(`tcg_v0_2_scheduled_action_draw_count_invalid:${index}`);
    }
    if (typeof step.deckout_on_incomplete !== "boolean") {
      throw new Error(`tcg_v0_2_scheduled_action_deckout_flag_invalid:${index}`);
    }
    return {
      op: "DRAW_FIXED",
      player: step.player,
      count,
      deckout_on_incomplete: step.deckout_on_incomplete,
    };
  }
  if (step.op === "DISCARD_SOURCE") {
    const allowed = new Set(["op", "source_zone"]);
    const extra = Object.keys(step).find((key) => !allowed.has(key));
    if (extra) {
      throw new Error(`tcg_v0_2_scheduled_action_step_field_unsupported:${index}:${extra}`);
    }
    if (step.source_zone !== "attached_relic") {
      throw new Error(`tcg_v0_2_scheduled_action_discard_source_zone_unsupported:${index}`);
    }
    return { op: "DISCARD_SOURCE", source_zone: "attached_relic" };
  }
  throw new Error(`tcg_v0_2_scheduled_action_step_unsupported:${index}`);
}

function ledger(state: RuntimeState): RuntimeV02ScheduledActionEntry[] {
  const raw = state[LEDGER_KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_scheduled_action_ledger_invalid");
  return raw as RuntimeV02ScheduledActionEntry[];
}

function activeMatch(state: RuntimeState): boolean {
  return state.phase !== "complete" && state.phase !== "overtime_pending";
}

export function runtimeV02ScheduleAction(
  state: RuntimeState,
  input: RuntimeV02ScheduledActionInput,
  id: string = crypto.randomUUID(),
): RuntimeV02ScheduledActionEntry {
  const owner = seat(input.owner_seat, "tcg_v0_2_scheduled_action_owner_invalid");
  const sourceActionId = requiredString(
    input.source_action_id,
    "tcg_v0_2_scheduled_action_source_action_id_required",
  );
  const sourceCardUid = requiredString(
    input.source_card_uid,
    "tcg_v0_2_scheduled_action_source_card_uid_required",
  );
  if (input.trigger !== "controller_aftermath_finished" && input.trigger !== "after_attack_finished") {
    throw new Error("tcg_v0_2_scheduled_action_trigger_unsupported");
  }
  if (typeof input.match_must_be_active !== "boolean") {
    throw new Error("tcg_v0_2_scheduled_action_active_guard_invalid");
  }
  if (!Array.isArray(input.steps) || input.steps.length < 1) {
    throw new Error("tcg_v0_2_scheduled_action_steps_required");
  }
  const steps = input.steps.map(normalizeStep);
  if (
    input.trigger === "controller_aftermath_finished" &&
    steps.some((step) => step.op !== "DRAW_FIXED")
  ) {
    throw new Error("tcg_v0_2_scheduled_action_aftermath_step_unsupported");
  }
  if (
    input.trigger === "after_attack_finished" &&
    steps.some((step) => step.op !== "DISCARD_SOURCE")
  ) {
    throw new Error("tcg_v0_2_scheduled_action_after_attack_step_unsupported");
  }
  if (!id) throw new Error("tcg_v0_2_scheduled_action_id_required");

  const entry: RuntimeV02ScheduledActionEntry = {
    id,
    owner_seat: owner,
    source_action_id: sourceActionId,
    source_card_uid: sourceCardUid,
    trigger: input.trigger,
    match_must_be_active: input.match_must_be_active,
    steps,
    scheduled_turn_seq: turnSeq(state),
  };
  const next = ledger(state);
  if (next.some((candidate) => candidate.id === entry.id)) {
    throw new Error("tcg_v0_2_scheduled_action_id_duplicate");
  }
  state[LEDGER_KEY] = [...next, structuredClone(entry)];
  return structuredClone(entry);
}

export function runtimeV02ScheduledActions(
  state: RuntimeState,
): RuntimeV02ScheduledActionEntry[] {
  return ledger(state).map((entry) => structuredClone(entry));
}

export function runtimeV02ResolveControllerAftermathScheduledActions(
  state: RuntimeState,
  controllerSeat: Seat,
): RuntimeV02ScheduledActionResolution[] {
  const controller = seat(
    controllerSeat,
    "tcg_v0_2_scheduled_action_aftermath_owner_invalid",
  );
  const turn = turnSeq(state);
  const current = ledger(state);
  const keep: RuntimeV02ScheduledActionEntry[] = [];
  const resolved: RuntimeV02ScheduledActionResolution[] = [];

  for (const entry of current) {
    if (
      entry.trigger !== "controller_aftermath_finished" ||
      entry.owner_seat !== controller ||
      entry.scheduled_turn_seq !== turn
    ) {
      keep.push(entry);
      continue;
    }

    const resolution: RuntimeV02ScheduledActionResolution = {
      id: entry.id,
      owner_seat: entry.owner_seat,
      source_action_id: entry.source_action_id,
      executed: false,
      skipped_match_inactive: false,
      draws: [],
    };

    if (entry.match_must_be_active && !activeMatch(state)) {
      resolution.skipped_match_inactive = true;
      resolved.push(resolution);
      continue;
    }

    for (const step of entry.steps.map(normalizeStep)) {
      if (step.op !== "DRAW_FIXED") {
        throw new Error("tcg_v0_2_scheduled_action_aftermath_step_unsupported");
      }
      const targetSeat: Seat = step.player === "self"
        ? controller
        : controller === 1 ? 2 : 1;
      const target = player(state, targetSeat);
      const requested = step.count;
      const available = Math.min(requested, target.deck.length);
      if (available > 0) {
        const cardUids = target.deck
          .slice(0, available)
          .map((card, index) =>
            requiredString(
              card.uid,
              `tcg_v0_2_scheduled_action_draw_uid_invalid:${index}`,
            )
          );
        runtimeV02ApplyCardZoneTransfer(target.deck, target.hand, {
          cause: "effect",
          action_kind: "scheduled_action",
          source_action_id: entry.source_action_id,
          source_card_uid: entry.source_card_uid,
          source: {
            controller_seat: targetSeat,
            zone: "deck",
            owner_card_uid: null,
          },
          destination: {
            controller_seat: targetSeat,
            zone: "hand",
            owner_card_uid: null,
          },
          card_uids: cardUids,
          destination_position: "bottom",
        });
      }
      const deckout = step.deckout_on_incomplete && available < requested;
      if (deckout) state.deckout_loser = targetSeat;
      resolution.draws.push({
        seat: targetSeat,
        requested,
        drawn: available,
        deckout,
      });
    }
    resolution.executed = true;
    resolved.push(resolution);
  }

  state[LEDGER_KEY] = keep.map((entry) => structuredClone(entry));
  return resolved;
}

export type RuntimeV02AfterAttackScheduledActionResolution = {
  id: string;
  owner_seat: Seat;
  source_action_id: string;
  executed: boolean;
  skipped_match_inactive: boolean;
  source_discards: Array<{
    controller_seat: Seat;
    source_card_uid: string;
    source_zone: "attached_relic";
  }>;
};

/**
 * Resolve lifecycle work whose exact trigger is after_attack_finished.
 *
 * This owner decides only trigger/turn/source timing. The returned discard plan is
 * intentionally physical-mutation-free so Match can delegate attached Relic removal
 * to the canonical Relic owner.
 */
export function runtimeV02ResolveAfterAttackFinishedScheduledActions(
  state: RuntimeState,
): RuntimeV02AfterAttackScheduledActionResolution[] {
  const turn = turnSeq(state);
  const current = ledger(state);
  const keep: RuntimeV02ScheduledActionEntry[] = [];
  const resolved: RuntimeV02AfterAttackScheduledActionResolution[] = [];

  for (const entry of current) {
    if (entry.trigger !== "after_attack_finished" || entry.scheduled_turn_seq !== turn) {
      keep.push(entry);
      continue;
    }

    const resolution: RuntimeV02AfterAttackScheduledActionResolution = {
      id: entry.id,
      owner_seat: entry.owner_seat,
      source_action_id: entry.source_action_id,
      executed: false,
      skipped_match_inactive: false,
      source_discards: [],
    };

    if (entry.match_must_be_active && !activeMatch(state)) {
      resolution.skipped_match_inactive = true;
      resolved.push(resolution);
      continue;
    }

    for (const step of entry.steps.map(normalizeStep)) {
      if (step.op !== "DISCARD_SOURCE") {
        throw new Error("tcg_v0_2_scheduled_action_after_attack_step_unsupported");
      }
      resolution.source_discards.push({
        controller_seat: entry.owner_seat,
        source_card_uid: entry.source_card_uid,
        source_zone: step.source_zone,
      });
    }
    resolution.executed = true;
    resolved.push(resolution);
  }

  state[LEDGER_KEY] = keep.map((entry) => structuredClone(entry));
  return resolved;
}

