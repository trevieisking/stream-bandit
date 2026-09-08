import { runtimeV02InspectRewardPositions } from "./tcg-match-reward-inspection-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };
type RuntimeFieldWhere = "vanguard" | "reserve";

type RuntimeV02ActiveAbilityLimitEntry = {
  turn_seq: number;
  controller_seat: 1 | 2;
  ability_id: string;
  count: number;
};

export type RuntimeV02ActiveAbilityRewardInspectionDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  rewards: {
    min: 1;
    max: 1;
    visibility: "controller_private";
    return_policy: "same_position";
  };
};

export type RuntimeV02ActiveAbilityRewardChoiceOption = {
  id: string;
  label: string;
  position: number;
  anchor_uid: string;
  anchor_card_id: string;
};

export type RuntimeV02PendingActiveAbilityChoice = {
  id: string;
  seat: 1 | 2;
  kind: "inspect_one_reward";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: RuntimeFieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  options: RuntimeV02ActiveAbilityRewardChoiceOption[];
};

export type RuntimeV02ActiveAbilityRewardResolution = {
  ability_id: string;
  choice_id: string;
  reward_inspected_count: 1;
};

const LIMIT_KEY = "runtime_active_ability_limits_v0_2";

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

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function seat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) throw new Error("tcg_v0_2_active_ability_choice_seat_invalid");
  return value;
}

function currentTurn(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_active_ability_choice_turn_seq_invalid");
  }
  return value;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function assertSameInst(actual: RuntimeInst, expected: RuntimeInst, error: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(error);
}

function playerForSeat(state: Record<string, unknown>, controllerSeat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!player) throw new Error("tcg_v0_2_active_ability_choice_player_missing");
  if (!Array.isArray(player.reserve) || !Array.isArray(player.rewards)) {
    throw new Error("tcg_v0_2_active_ability_choice_player_zones_invalid");
  }
  return player;
}

function sourceTop(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  where: RuntimeFieldWhere,
  index: number | null,
): RuntimeInst {
  const player = playerForSeat(state, controllerSeat);
  let creature: Record<string, unknown> | null = null;
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_active_ability_choice_vanguard_index_invalid");
    creature = objectRecord(player.vanguard);
  } else {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_active_ability_choice_reserve_index_invalid");
    }
    creature = objectRecord((player.reserve as unknown[])[Number(index)]);
  }
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_active_ability_choice_source_missing");
  }
  return runtimeInst(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_active_ability_choice_source_top_invalid",
  );
}

function normalizeLimitEntry(raw: unknown, index: number): RuntimeV02ActiveAbilityLimitEntry {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_active_ability_limit_entry_invalid:${index}`);
  rejectUnsupportedFields(
    value,
    ["turn_seq", "controller_seat", "ability_id", "count"],
    `tcg_v0_2_active_ability_limit_entry_field_unsupported:${index}`,
  );
  const turnSeq = value.turn_seq;
  const count = value.count;
  if (typeof turnSeq !== "number" || !Number.isInteger(turnSeq) || turnSeq < 0) {
    throw new Error(`tcg_v0_2_active_ability_limit_turn_invalid:${index}`);
  }
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1) {
    throw new Error(`tcg_v0_2_active_ability_limit_count_invalid:${index}`);
  }
  return {
    turn_seq: turnSeq,
    controller_seat: seat(value.controller_seat),
    ability_id: requiredString(value.ability_id, `tcg_v0_2_active_ability_limit_id_invalid:${index}`),
    count,
  };
}

function limitLedger(state: Record<string, unknown>): RuntimeV02ActiveAbilityLimitEntry[] {
  const raw = state[LIMIT_KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_active_ability_limit_ledger_invalid");
  return raw.map((entry, index) => normalizeLimitEntry(entry, index));
}

export function runtimeV02CurrentTurnActiveAbilityUseCount(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  abilityId: string,
): number {
  const turn = currentTurn(state);
  const controller = seat(controllerSeat);
  const id = requiredString(abilityId, "tcg_v0_2_active_ability_limit_ability_id_required");
  return limitLedger(state)
    .filter((entry) => entry.turn_seq === turn && entry.controller_seat === controller && entry.ability_id === id)
    .reduce((sum, entry) => sum + entry.count, 0);
}

export function runtimeV02RecordActiveAbilityUse(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  abilityId: string,
): void {
  const turn = currentTurn(state);
  const controller = seat(controllerSeat);
  const id = requiredString(abilityId, "tcg_v0_2_active_ability_limit_ability_id_required");
  const current = limitLedger(state).filter((entry) => entry.turn_seq === turn);
  const existing = current.find((entry) => entry.controller_seat === controller && entry.ability_id === id);
  if (existing) throw new Error("tcg_v0_2_active_ability_choice_turn_limit_reached");
  current.push({ turn_seq: turn, controller_seat: controller, ability_id: id, count: 1 });
  state[LIMIT_KEY] = current.map((entry) => ({ ...entry }));
}

/**
 * Recognizes exactly the current reusable active-Ability family:
 * own-turn, controller once-per-turn, no requirements/costs, inspect exactly
 * one own Reward privately and return it to the same position.
 */
export function structuredRuntimeActiveAbilityRewardInspection(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityRewardInspectionDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = creature ? objectRecord(creature.ability) : null;
  if (!ability || String(ability.mode || "") !== "active") return null;
  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!steps || steps.length !== 1) return null;
  const step = objectRecord(steps[0]);
  if (
    !step || String(step.op || "") !== "INSPECT_ZONE" ||
    String(step.player || "") !== "self" || String(step.zone || "") !== "rewards"
  ) return null;

  const abilityId = requiredString(ability.id, "tcg_v0_2_active_ability_choice_ability_id_required");
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_choice_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || String(ability.timing || "") !== "own_turn") {
    throw new Error(`tcg_v0_2_active_ability_choice_timing_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.requirements) || ability.requirements.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_choice_requirements_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_choice_costs_unsupported:${abilityId}`);
  }

  const limit = objectRecord(ability.limit);
  if (!limit) throw new Error(`tcg_v0_2_active_ability_choice_limit_required:${abilityId}`);
  rejectUnsupportedFields(
    limit,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_ability_choice_limit_field_unsupported:${abilityId}`,
  );
  if (limit.scope !== "turn" || Number(limit.count) !== 1 || limit.owner !== "controller") {
    throw new Error(`tcg_v0_2_active_ability_choice_limit_unsupported:${abilityId}`);
  }

  rejectUnsupportedFields(
    step,
    ["op", "player", "zone", "selection", "visibility", "return_policy", "as"],
    `tcg_v0_2_active_ability_choice_step_field_unsupported:${abilityId}`,
  );
  if (step.visibility !== "controller_private" || step.return_policy !== "same_position") {
    throw new Error(`tcg_v0_2_active_ability_choice_step_shape_unsupported:${abilityId}`);
  }
  requiredString(step.as, `tcg_v0_2_active_ability_choice_variable_required:${abilityId}`);
  const selection = objectRecord(step.selection);
  if (!selection) throw new Error(`tcg_v0_2_active_ability_choice_selection_invalid:${abilityId}`);
  rejectUnsupportedFields(
    selection,
    ["min", "max", "filters"],
    `tcg_v0_2_active_ability_choice_selection_field_unsupported:${abilityId}`,
  );
  const filters = objectRecord(selection.filters);
  if (!filters || Object.keys(filters).length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_choice_filters_unsupported:${abilityId}`);
  }
  if (Number(selection.min) !== 1 || Number(selection.max) !== 1) {
    throw new Error(`tcg_v0_2_active_ability_choice_bounds_unsupported:${abilityId}`);
  }

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    rewards: { min: 1, max: 1, visibility: "controller_private", return_policy: "same_position" },
  };
}

export function runtimeV02CreateActiveAbilityRewardChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilityRewardInspectionDescriptor,
  source: { where: RuntimeFieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityChoice {
  const controller = seat(controllerSeat);
  if (!choiceId) throw new Error("tcg_v0_2_active_ability_choice_id_required");
  if (descriptor.timing !== "own_turn") throw new Error("tcg_v0_2_active_ability_choice_timing_unsupported");
  if (
    descriptor.limit.scope !== "turn" || descriptor.limit.count !== 1 || descriptor.limit.owner !== "controller"
  ) throw new Error("tcg_v0_2_active_ability_choice_limit_unsupported");
  if (state.active_seat !== controller) throw new Error("tcg_v0_2_active_ability_choice_not_active_seat");
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, descriptor.ability_id) !== 0) {
    throw new Error("tcg_v0_2_active_ability_choice_turn_limit_reached");
  }

  const instance = runtimeInst(source.instance, "tcg_v0_2_active_ability_choice_source_identity_invalid");
  assertSameInst(
    sourceTop(state, controller, source.where, source.index),
    instance,
    "tcg_v0_2_active_ability_choice_source_changed",
  );
  const player = playerForSeat(state, controller);
  const rewards = player.rewards as unknown[];
  if (rewards.length < 1) throw new Error("tcg_v0_2_active_ability_choice_reward_unavailable");
  const rewardCards = rewards.map((value, index) =>
    runtimeInst(value, `tcg_v0_2_active_ability_choice_reward_invalid:${index}`)
  );
  if (new Set(rewardCards.map((card) => card.uid)).size !== rewardCards.length) {
    throw new Error("tcg_v0_2_active_ability_choice_reward_uid_duplicate");
  }
  const options = rewardCards.map((card, position) => ({
    id: `reward:${position}`,
    label: `Reward ${position + 1}`,
    position,
    anchor_uid: card.uid,
    anchor_card_id: card.card_id,
  }));

  runtimeV02RecordActiveAbilityUse(state, controller, descriptor.ability_id);
  return {
    id: choiceId,
    seat: controller,
    kind: "inspect_one_reward",
    ability_id: descriptor.ability_id,
    prompt: "Choose one Reward to inspect",
    min: 1,
    max: 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: instance.uid,
    source_card_id: instance.card_id,
    options,
  };
}

export function runtimeV02PendingActiveAbilityChoiceView(
  choice: RuntimeV02PendingActiveAbilityChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
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
    options: choice.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

function validatePending(choice: RuntimeV02PendingActiveAbilityChoice): void {
  if (choice.kind !== "inspect_one_reward") throw new Error("tcg_v0_2_active_ability_choice_kind_unsupported");
  if (!choice.id || !choice.ability_id || !choice.source_uid || !choice.source_card_id) {
    throw new Error("tcg_v0_2_active_ability_choice_pending_identity_invalid");
  }
  if (!Number.isInteger(choice.turn_seq) || choice.turn_seq < 0) {
    throw new Error("tcg_v0_2_active_ability_choice_pending_turn_invalid");
  }
  if (choice.source_where === "vanguard") {
    if (choice.source_index !== null) throw new Error("tcg_v0_2_active_ability_choice_pending_source_invalid");
  } else if (
    choice.source_where !== "reserve" || !Number.isInteger(choice.source_index) ||
    Number(choice.source_index) < 0 || Number(choice.source_index) > 3
  ) throw new Error("tcg_v0_2_active_ability_choice_pending_source_invalid");
  if (!Array.isArray(choice.options) || choice.options.length < 1) {
    throw new Error("tcg_v0_2_active_ability_choice_pending_options_invalid");
  }
  const anchors = new Set<string>();
  for (let i = 0; i < choice.options.length; i++) {
    const option = choice.options[i];
    if (
      !option || option.position !== i || option.id !== `reward:${i}` ||
      !option.anchor_uid || !option.anchor_card_id
    ) throw new Error("tcg_v0_2_active_ability_choice_pending_option_invalid");
    if (anchors.has(option.anchor_uid)) throw new Error("tcg_v0_2_active_ability_choice_pending_reward_uid_duplicate");
    anchors.add(option.anchor_uid);
  }
}

export function runtimeV02ResolveActiveAbilityRewardChoice(
  choice: RuntimeV02PendingActiveAbilityChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityRewardResolution {
  validatePending(choice);
  const controller = seat(controllerSeat);
  if (choice.seat !== controller) throw new Error("tcg_v0_2_active_ability_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_active_ability_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_active_ability_choice_exactly_one_required");
  }
  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_active_ability_choice_unknown_option");
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_active_ability_choice_turn_changed");
  if (state.active_seat !== controller) throw new Error("tcg_v0_2_active_ability_choice_active_seat_changed");
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, choice.ability_id) !== 1) {
    throw new Error("tcg_v0_2_active_ability_choice_limit_receipt_missing");
  }

  assertSameInst(
    sourceTop(state, controller, choice.source_where, choice.source_index),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_active_ability_choice_source_changed",
  );
  const player = playerForSeat(state, controller);
  const rewards = player.rewards as unknown[];
  if (rewards.length !== choice.options.length) {
    throw new Error("tcg_v0_2_active_ability_choice_reward_set_changed");
  }
  for (const candidate of choice.options) {
    const current = runtimeInst(
      rewards[candidate.position],
      `tcg_v0_2_active_ability_choice_current_reward_invalid:${candidate.position}`,
    );
    assertSameInst(
      current,
      { uid: candidate.anchor_uid, card_id: candidate.anchor_card_id },
      "tcg_v0_2_active_ability_choice_reward_set_changed",
    );
  }

  const inspected = runtimeV02InspectRewardPositions(state, controller, [option.position]);
  if (inspected.cards.length !== 1) throw new Error("tcg_v0_2_active_ability_choice_reward_inspection_failed");
  assertSameInst(
    { uid: inspected.cards[0].uid, card_id: inspected.cards[0].card_id },
    { uid: option.anchor_uid, card_id: option.anchor_card_id },
    "tcg_v0_2_active_ability_choice_reward_inspection_changed",
  );
  return {
    ability_id: choice.ability_id,
    choice_id: choice.id,
    reward_inspected_count: 1,
  };
}
