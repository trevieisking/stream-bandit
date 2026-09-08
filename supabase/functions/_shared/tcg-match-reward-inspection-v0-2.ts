import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02RewardInspectionEvent = {
  turn_seq: number;
  controller_seat: 1 | 2;
};

export type RuntimeV02PrivateRewardInspectionCard = {
  position: number;
  uid: string;
  card_id: string;
};

export type RuntimeV02PrivateRewardInspectionView = {
  turn_seq: number;
  controller_seat: 1 | 2;
  cards: RuntimeV02PrivateRewardInspectionCard[];
};

const LEDGER_KEY = "runtime_reward_inspections_v0_2";
const PRIVATE_VIEW_KEY = "runtime_private_reward_inspection_v0_2";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const keys = new Set(allowed);
  const extra = Object.keys(value).find((key) => !keys.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function turnSeq(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_reward_inspection_turn_seq_invalid");
  }
  return value;
}

function seat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error("tcg_v0_2_reward_inspection_controller_seat_invalid");
  }
  return value;
}

function normalizeEvent(raw: unknown, index: number): RuntimeV02RewardInspectionEvent {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_reward_inspection_event_invalid:${index}`);
  rejectUnsupportedFields(
    value,
    ["turn_seq", "controller_seat"],
    `tcg_v0_2_reward_inspection_event_field_unsupported:${index}`,
  );
  const eventTurn = value.turn_seq;
  if (typeof eventTurn !== "number" || !Number.isInteger(eventTurn) || eventTurn < 0) {
    throw new Error(`tcg_v0_2_reward_inspection_event_turn_invalid:${index}`);
  }
  return { turn_seq: eventTurn, controller_seat: seat(value.controller_seat) };
}

function ledger(state: Record<string, unknown>): RuntimeV02RewardInspectionEvent[] {
  const raw = state[LEDGER_KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_reward_inspection_ledger_invalid");
  return raw.map((entry, index) => normalizeEvent(entry, index));
}

function normalizePrivateCard(raw: unknown, index: number): RuntimeV02PrivateRewardInspectionCard {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_reward_private_card_invalid:${index}`);
  rejectUnsupportedFields(
    value,
    ["position", "uid", "card_id"],
    `tcg_v0_2_reward_private_card_field_unsupported:${index}`,
  );
  const position = value.position;
  const uid = typeof value.uid === "string" ? value.uid : "";
  const cardId = typeof value.card_id === "string" ? value.card_id : "";
  if (typeof position !== "number" || !Number.isInteger(position) || position < 0 || !uid || !cardId) {
    throw new Error(`tcg_v0_2_reward_private_card_shape_invalid:${index}`);
  }
  return { position, uid, card_id: cardId };
}

function privateInspection(state: Record<string, unknown>): RuntimeV02PrivateRewardInspectionView | null {
  const raw = state[PRIVATE_VIEW_KEY];
  if (raw == null) return null;
  const value = objectRecord(raw);
  if (!value) throw new Error("tcg_v0_2_reward_private_view_invalid");
  rejectUnsupportedFields(
    value,
    ["turn_seq", "controller_seat", "cards"],
    "tcg_v0_2_reward_private_view_field_unsupported",
  );
  const viewTurn = value.turn_seq;
  if (typeof viewTurn !== "number" || !Number.isInteger(viewTurn) || viewTurn < 0) {
    throw new Error("tcg_v0_2_reward_private_view_turn_invalid");
  }
  if (!Array.isArray(value.cards)) throw new Error("tcg_v0_2_reward_private_view_cards_invalid");
  return {
    turn_seq: viewTurn,
    controller_seat: seat(value.controller_seat),
    cards: value.cards.map((card, index) => normalizePrivateCard(card, index)),
  };
}

function positions(value: unknown): number[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error("tcg_v0_2_reward_inspection_positions_invalid");
  const out = value.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry < 0) {
      throw new Error(`tcg_v0_2_reward_inspection_position_invalid:${index}`);
    }
    return entry;
  });
  if (new Set(out).size !== out.length) throw new Error("tcg_v0_2_reward_inspection_positions_duplicate");
  return out;
}

export function recordRuntimeV02RewardInspection(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02RewardInspectionEvent[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  const current = ledger(state).filter((entry) => entry.turn_seq === currentTurn);
  if (!current.some((entry) => entry.controller_seat === controller)) {
    current.push({ turn_seq: currentTurn, controller_seat: controller });
  }
  state[LEDGER_KEY] = current.map((entry) => ({ ...entry }));
  return current.map((entry) => ({ ...entry }));
}

export function runtimeV02CurrentTurnRewardInspections(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02RewardInspectionEvent[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  return ledger(state)
    .filter((entry) => entry.turn_seq === currentTurn && entry.controller_seat === controller)
    .map((entry) => ({ ...entry }));
}

export function runtimeV02PrivateRewardInspectionView(
  state: Record<string, unknown>,
  viewerSeat: 1 | 2,
): RuntimeV02PrivateRewardInspectionView | null {
  const view = privateInspection(state);
  if (!view || view.turn_seq !== turnSeq(state) || view.controller_seat !== seat(viewerSeat)) return null;
  return {
    turn_seq: view.turn_seq,
    controller_seat: view.controller_seat,
    cards: view.cards.map((card) => ({ ...card })),
  };
}

/**
 * Executes only the frozen private Reward-inspection shape on a structured
 * creature_evolved trigger. Reward cards remain in place. Public/canonical
 * event history stores only turn + controller; inspected identities are held
 * only by the controller-private view adapter.
 */
export function structuredRuntimeEvolutionRewardInspection(
  state: Record<string, unknown>,
  evolvedInstance: { card_id?: unknown } | null | undefined,
  controllerSeat: 1 | 2,
  rawPositions: unknown,
): { inspected_count: number; ability_id: string } | null {
  const definition = runtimeV02Definition(state, evolvedInstance);
  if (!definition) return null;
  const creature = objectRecord(definition.creature);
  const ability = objectRecord(creature?.ability);
  if (!ability || ability.mode !== "triggered" || ability.event !== "creature_evolved") return null;

  const steps = Array.isArray(ability.steps) ? ability.steps : [];
  const rewardInspectSteps = steps.filter((rawStep) => {
    const step = objectRecord(rawStep);
    return step?.op === "INSPECT_ZONE" && step.zone === "rewards";
  });
  if (rewardInspectSteps.length === 0) return null;

  const abilityId = typeof ability.id === "string" && ability.id ? ability.id : "unknown";
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_reward_inspection_ability_field_unsupported:${abilityId}`,
  );
  if (ability.timing !== "own_turn" || ability.limit !== null) {
    throw new Error(`tcg_v0_2_reward_inspection_ability_timing_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_reward_inspection_ability_cost_unsupported:${abilityId}`);
  }
  if (steps.length !== 1 || rewardInspectSteps.length !== 1) {
    throw new Error(`tcg_v0_2_reward_inspection_ability_shape_unsupported:${abilityId}`);
  }

  const requirements = objectRecord(ability.requirements);
  const all = Array.isArray(requirements?.all) ? requirements.all : [];
  const onlyRequirement = objectRecord(all[0]);
  if (
    !requirements || Object.keys(requirements).length !== 1 || all.length !== 1 ||
    !onlyRequirement || Object.keys(onlyRequirement).length !== 1 ||
    onlyRequirement.predicate !== "source_is_self"
  ) {
    throw new Error(`tcg_v0_2_reward_inspection_requirements_unsupported:${abilityId}`);
  }

  const step = objectRecord(rewardInspectSteps[0])!;
  rejectUnsupportedFields(
    step,
    ["op", "player", "zone", "selection", "visibility", "return_policy", "as"],
    `tcg_v0_2_reward_inspection_step_field_unsupported:${abilityId}`,
  );
  if (
    step.player !== "self" || step.visibility !== "controller_private" ||
    step.return_policy !== "same_position"
  ) {
    throw new Error(`tcg_v0_2_reward_inspection_step_shape_unsupported:${abilityId}`);
  }

  const selection = objectRecord(step.selection);
  if (!selection) throw new Error(`tcg_v0_2_reward_inspection_selection_invalid:${abilityId}`);
  rejectUnsupportedFields(
    selection,
    ["min", "max", "filters", "distinct"],
    `tcg_v0_2_reward_inspection_selection_field_unsupported:${abilityId}`,
  );
  const filters = objectRecord(selection.filters);
  if (!filters || Object.keys(filters).length !== 0) {
    throw new Error(`tcg_v0_2_reward_inspection_selection_filters_unsupported:${abilityId}`);
  }
  const min = selection.min;
  const max = selection.max;
  if (
    typeof min !== "number" || !Number.isInteger(min) || min < 0 ||
    typeof max !== "number" || !Number.isInteger(max) || max < min ||
    (max > 1 && selection.distinct !== true)
  ) {
    throw new Error(`tcg_v0_2_reward_inspection_selection_invalid:${abilityId}`);
  }

  const chosen = positions(rawPositions);
  if (chosen.length < min || chosen.length > max) {
    throw new Error(`tcg_v0_2_reward_inspection_count_invalid:${abilityId}:${chosen.length}`);
  }

  const controller = seat(controllerSeat);
  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(controller)]);
  const rewards = Array.isArray(player?.rewards) ? player.rewards : null;
  if (!rewards) throw new Error("tcg_v0_2_reward_inspection_rewards_missing");

  const cards = chosen.map((position, index) => {
    if (position >= rewards.length) {
      throw new Error(`tcg_v0_2_reward_inspection_position_out_of_range:${index}`);
    }
    const instance = objectRecord(rewards[position]);
    const uid = typeof instance?.uid === "string" ? instance.uid : "";
    const cardId = typeof instance?.card_id === "string" ? instance.card_id : "";
    if (!uid || !cardId) throw new Error(`tcg_v0_2_reward_inspection_reward_invalid:${position}`);
    return { position, uid, card_id: cardId };
  });

  if (cards.length > 0) {
    recordRuntimeV02RewardInspection(state, controller);
    state[PRIVATE_VIEW_KEY] = {
      turn_seq: turnSeq(state),
      controller_seat: controller,
      cards: cards.map((card) => ({ ...card })),
    };
  }
  return { inspected_count: cards.length, ability_id: abilityId };
}

/**
 * Generic server-owned Reward inspection primitive for already-validated
 * structured effects. It never moves Reward cards. Public state records only
 * the current-turn inspection event; card identities remain in the existing
 * controller-private Reward inspection view.
 */
export function runtimeV02InspectRewardPositions(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  rawPositions: unknown,
): RuntimeV02PrivateRewardInspectionView {
  const chosen = positions(rawPositions);
  const controller = seat(controllerSeat);
  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(controller)]);
  const rewards = Array.isArray(player?.rewards) ? player.rewards : null;
  if (!rewards) throw new Error("tcg_v0_2_reward_inspection_rewards_missing");

  const cards = chosen.map((position, index) => {
    if (position >= rewards.length) {
      throw new Error(`tcg_v0_2_reward_inspection_position_out_of_range:${index}`);
    }
    const instance = objectRecord(rewards[position]);
    const uid = typeof instance?.uid === "string" ? instance.uid : "";
    const cardId = typeof instance?.card_id === "string" ? instance.card_id : "";
    if (!uid || !cardId) throw new Error(`tcg_v0_2_reward_inspection_reward_invalid:${position}`);
    return { position, uid, card_id: cardId };
  });

  if (cards.length > 0) {
    recordRuntimeV02RewardInspection(state, controller);
    state[PRIVATE_VIEW_KEY] = {
      turn_seq: turnSeq(state),
      controller_seat: controller,
      cards: cards.map((card) => ({ ...card })),
    };
  }

  return {
    turn_seq: turnSeq(state),
    controller_seat: controller,
    cards: cards.map((card) => ({ ...card })),
  };
}
