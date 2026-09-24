import {
  runtimeV02CountDamageHistory,
  type RuntimeV02DamageHistoryQuery,
} from "./tcg-match-damage-history-query-v0-2.ts";

export type RuntimeV02SourceDamagedRequirement = {
  predicate: "source_damaged";
};

export type RuntimeV02SourceDamagedRequirementEvaluation = {
  predicate: "source_damaged";
  matched: boolean;
  actual_damage: number;
};

export type RuntimeV02SourceHasShieldAtLeastRequirement = {
  predicate: "source_has_shield_at_least";
  value: number;
};

export type RuntimeV02SourceHasShieldAtLeastRequirementEvaluation = {
  predicate: "source_has_shield_at_least";
  matched: boolean;
  required_shield: number;
  actual_shield: number;
};

export type RuntimeV02TargetPrintedHpAtLeastRequirement = {
  predicate: "target_printed_hp_at_least";
  target: string;
  value: number;
};

export type RuntimeV02TargetPrintedHpAtLeastRequirementEvaluation = {
  predicate: "target_printed_hp_at_least";
  matched: boolean;
  target: string;
  required_hp: number;
  actual_hp: number;
};

export type RuntimeV02LegalCardAvailableRequirement = {
  predicate: "legal_card_available";
  controller: string;
  zone: string;
  filters: Record<string, unknown>;
};

export type RuntimeV02LegalCardAvailableRequirementEvaluation = {
  predicate: "legal_card_available";
  matched: boolean;
  controller: string;
  zone: string;
  candidate_count: number;
};

export type RuntimeV02ReserveCountAtLeastRequirement = {
  predicate: "reserve_count_at_least";
  controller: string;
  count: number;
};

export type RuntimeV02ReserveCountAtLeastRequirementEvaluation = {
  predicate: "reserve_count_at_least";
  matched: boolean;
  controller: string;
  required_count: number;
  actual_count: number;
};

export type RuntimeV02DamageHistoryCountRequirement = {
  predicate: "damage_history_count_at_least";
  target: "$source_creature";
  source_controller: "self";
  window: "current_turn";
  min_actual_damage: number;
  card_effect_only: true;
  count: number;
};

export type RuntimeV02SourceRequirementContext = {
  source_creature_uid: string;
  source_controller_seat: 1 | 2;
};

export type RuntimeV02DamageHistoryRequirementEvaluation = {
  predicate: "damage_history_count_at_least";
  matched: boolean;
  required_count: number;
  actual_count: number;
};

function objectRecord(value: unknown, error: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(error);
  return value as Record<string, unknown>;
}

function positiveInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error(error);
  return number;
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const keys = new Set(allowed);
  const unsupported = Object.keys(value).find((key) => !keys.has(key));
  if (unsupported) throw new Error(`${error}:${unsupported}`);
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_requirement_damage_history_turn_invalid");
  }
  return turn;
}

function validatedContext(
  context: RuntimeV02SourceRequirementContext,
): RuntimeV02SourceRequirementContext {
  const value = objectRecord(
    context,
    "tcg_v0_2_requirement_damage_history_context_invalid",
  );
  if (value.source_controller_seat !== 1 && value.source_controller_seat !== 2) {
    throw new Error("tcg_v0_2_requirement_damage_history_controller_invalid");
  }
  return {
    source_creature_uid: requiredString(
      value.source_creature_uid,
      "tcg_v0_2_requirement_damage_history_source_uid_required",
    ),
    source_controller_seat: value.source_controller_seat,
  };
}

export function normalizeRuntimeV02LegalCardAvailableRequirement(
  raw: unknown,
): RuntimeV02LegalCardAvailableRequirement {
  const value = objectRecord(raw, "tcg_v0_2_requirement_legal_card_invalid");
  rejectUnsupportedFields(
    value,
    ["predicate", "controller", "zone", "filters"],
    "tcg_v0_2_requirement_legal_card_field_unsupported",
  );
  if (value.predicate !== "legal_card_available") {
    throw new Error("tcg_v0_2_requirement_legal_card_predicate_invalid");
  }
  const controller = value.controller == null
    ? "self"
    : requiredString(
      value.controller,
      "tcg_v0_2_requirement_legal_card_controller_invalid",
    );
  const zone = requiredString(
    value.zone,
    "tcg_v0_2_requirement_legal_card_zone_invalid",
  );
  const allowedZones = new Set([
    "field",
    "vanguard",
    "reserve",
    "hand",
    "deck",
    "discard",
    "rewards",
  ]);
  if (!allowedZones.has(zone)) {
    throw new Error("tcg_v0_2_requirement_legal_card_zone_unsupported");
  }
  const filters = value.filters == null
    ? {}
    : objectRecord(
      value.filters,
      "tcg_v0_2_requirement_legal_card_filters_invalid",
    );
  return {
    predicate: "legal_card_available",
    controller,
    zone,
    filters: { ...filters },
  };
}

export function evaluateRuntimeV02LegalCardAvailableRequirement(
  candidateCount: unknown,
  rawRequirement: RuntimeV02LegalCardAvailableRequirement,
): RuntimeV02LegalCardAvailableRequirementEvaluation {
  const requirement = normalizeRuntimeV02LegalCardAvailableRequirement(rawRequirement);
  const count = Number(candidateCount);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_requirement_legal_card_candidate_count_invalid");
  }
  return {
    predicate: "legal_card_available",
    matched: count > 0,
    controller: requirement.controller,
    zone: requirement.zone,
    candidate_count: count,
  };
}

export function normalizeRuntimeV02ReserveCountAtLeastRequirement(
  raw: unknown,
): RuntimeV02ReserveCountAtLeastRequirement {
  const value = objectRecord(raw, "tcg_v0_2_requirement_reserve_count_invalid");
  rejectUnsupportedFields(
    value,
    ["predicate", "controller", "count"],
    "tcg_v0_2_requirement_reserve_count_field_unsupported",
  );
  if (value.predicate !== "reserve_count_at_least") {
    throw new Error("tcg_v0_2_requirement_reserve_count_predicate_invalid");
  }
  const controller = value.controller == null
    ? "self"
    : requiredString(
      value.controller,
      "tcg_v0_2_requirement_reserve_count_controller_invalid",
    );
  return {
    predicate: "reserve_count_at_least",
    controller,
    count: positiveInteger(
      value.count,
      "tcg_v0_2_requirement_reserve_count_threshold_invalid",
    ),
  };
}

export function evaluateRuntimeV02ReserveCountAtLeastRequirement(
  reserve: unknown,
  rawRequirement: RuntimeV02ReserveCountAtLeastRequirement,
): RuntimeV02ReserveCountAtLeastRequirementEvaluation {
  const requirement = normalizeRuntimeV02ReserveCountAtLeastRequirement(rawRequirement);
  if (!Array.isArray(reserve)) {
    throw new Error("tcg_v0_2_requirement_reserve_count_zone_invalid");
  }
  const actual = reserve.filter(Boolean).length;
  return {
    predicate: "reserve_count_at_least",
    matched: actual >= requirement.count,
    controller: requirement.controller,
    required_count: requirement.count,
    actual_count: actual,
  };
}

export function normalizeRuntimeV02SourceDamagedRequirement(
  raw: unknown,
): RuntimeV02SourceDamagedRequirement {
  const value = objectRecord(raw, "tcg_v0_2_requirement_source_damaged_invalid");
  rejectUnsupportedFields(
    value,
    ["predicate"],
    "tcg_v0_2_requirement_source_damaged_field_unsupported",
  );
  if (value.predicate !== "source_damaged") {
    throw new Error("tcg_v0_2_requirement_source_damaged_predicate_invalid");
  }
  return { predicate: "source_damaged" };
}

export function evaluateRuntimeV02SourceDamagedRequirement(
  sourceCreature: unknown,
  rawRequirement: RuntimeV02SourceDamagedRequirement,
): RuntimeV02SourceDamagedRequirementEvaluation {
  normalizeRuntimeV02SourceDamagedRequirement(rawRequirement);
  const source = objectRecord(
    sourceCreature,
    "tcg_v0_2_requirement_source_damaged_source_invalid",
  );
  const damage = Number(source.damage ?? 0);
  if (!Number.isFinite(damage) || damage < 0) {
    throw new Error("tcg_v0_2_requirement_source_damaged_damage_invalid");
  }
  return {
    predicate: "source_damaged",
    matched: damage > 0,
    actual_damage: damage,
  };
}

export function normalizeRuntimeV02SourceHasShieldAtLeastRequirement(
  raw: unknown,
): RuntimeV02SourceHasShieldAtLeastRequirement {
  const value = objectRecord(raw, "tcg_v0_2_requirement_source_shield_invalid");
  rejectUnsupportedFields(
    value,
    ["predicate", "value"],
    "tcg_v0_2_requirement_source_shield_field_unsupported",
  );
  if (value.predicate !== "source_has_shield_at_least") {
    throw new Error("tcg_v0_2_requirement_source_shield_predicate_invalid");
  }
  const threshold = Number(value.value);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new Error("tcg_v0_2_requirement_source_shield_value_invalid");
  }
  return { predicate: "source_has_shield_at_least", value: threshold };
}

export function evaluateRuntimeV02SourceHasShieldAtLeastRequirement(
  sourceCreature: unknown,
  rawRequirement: RuntimeV02SourceHasShieldAtLeastRequirement,
): RuntimeV02SourceHasShieldAtLeastRequirementEvaluation {
  const requirement = normalizeRuntimeV02SourceHasShieldAtLeastRequirement(rawRequirement);
  const source = objectRecord(
    sourceCreature,
    "tcg_v0_2_requirement_source_shield_source_invalid",
  );
  const shield = Number(source.shield ?? 0);
  if (!Number.isFinite(shield) || shield < 0) {
    throw new Error("tcg_v0_2_requirement_source_shield_amount_invalid");
  }
  return {
    predicate: "source_has_shield_at_least",
    matched: shield >= requirement.value,
    required_shield: requirement.value,
    actual_shield: shield,
  };
}

export function normalizeRuntimeV02TargetPrintedHpAtLeastRequirement(
  raw: unknown,
): RuntimeV02TargetPrintedHpAtLeastRequirement {
  const value = objectRecord(raw, "tcg_v0_2_requirement_target_printed_hp_invalid");
  rejectUnsupportedFields(
    value,
    ["predicate", "target", "value"],
    "tcg_v0_2_requirement_target_printed_hp_field_unsupported",
  );
  if (value.predicate !== "target_printed_hp_at_least") {
    throw new Error("tcg_v0_2_requirement_target_printed_hp_predicate_invalid");
  }
  const target = requiredString(
    value.target,
    "tcg_v0_2_requirement_target_printed_hp_target_required",
  );
  const threshold = Number(value.value);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new Error("tcg_v0_2_requirement_target_printed_hp_threshold_invalid");
  }
  return { predicate: "target_printed_hp_at_least", target, value: threshold };
}

export function evaluateRuntimeV02TargetPrintedHpAtLeastRequirement(
  printedHp: unknown,
  rawRequirement: RuntimeV02TargetPrintedHpAtLeastRequirement,
): RuntimeV02TargetPrintedHpAtLeastRequirementEvaluation {
  const requirement = normalizeRuntimeV02TargetPrintedHpAtLeastRequirement(rawRequirement);
  const hp = Number(printedHp);
  if (!Number.isFinite(hp) || hp < 0) {
    throw new Error("tcg_v0_2_requirement_target_printed_hp_value_invalid");
  }
  return {
    predicate: "target_printed_hp_at_least",
    matched: hp >= requirement.value,
    target: requirement.target,
    required_hp: requirement.value,
    actual_hp: hp,
  };
}

export function normalizeRuntimeV02DamageHistoryCountRequirement(
  raw: unknown,
): RuntimeV02DamageHistoryCountRequirement {
  const value = objectRecord(
    raw,
    "tcg_v0_2_requirement_damage_history_invalid",
  );
  rejectUnsupportedFields(
    value,
    [
      "predicate",
      "target",
      "source_controller",
      "window",
      "min_actual_damage",
      "card_effect_only",
      "count",
    ],
    "tcg_v0_2_requirement_damage_history_field_unsupported",
  );
  if (value.predicate !== "damage_history_count_at_least") {
    throw new Error("tcg_v0_2_requirement_damage_history_predicate_invalid");
  }
  if (value.target !== "$source_creature") {
    throw new Error("tcg_v0_2_requirement_damage_history_target_unsupported");
  }
  if (value.source_controller !== "self") {
    throw new Error("tcg_v0_2_requirement_damage_history_source_controller_unsupported");
  }
  if (value.window !== "current_turn") {
    throw new Error("tcg_v0_2_requirement_damage_history_window_unsupported");
  }
  if (value.card_effect_only !== true) {
    throw new Error("tcg_v0_2_requirement_damage_history_card_effect_required");
  }
  return {
    predicate: "damage_history_count_at_least",
    target: "$source_creature",
    source_controller: "self",
    window: "current_turn",
    min_actual_damage: positiveInteger(
      value.min_actual_damage,
      "tcg_v0_2_requirement_damage_history_min_damage_invalid",
    ),
    card_effect_only: true,
    count: positiveInteger(
      value.count,
      "tcg_v0_2_requirement_damage_history_count_invalid",
    ),
  };
}

export function runtimeV02DamageHistoryRequirementQuery(
  state: Record<string, unknown>,
  rawRequirement: RuntimeV02DamageHistoryCountRequirement,
  rawContext: RuntimeV02SourceRequirementContext,
): RuntimeV02DamageHistoryQuery {
  const requirement = normalizeRuntimeV02DamageHistoryCountRequirement(rawRequirement);
  const context = validatedContext(rawContext);
  const turn = currentTurn(state);
  return {
    min_turn_seq: turn,
    max_turn_seq: turn,
    source_controller_seat: context.source_controller_seat,
    target_controller_seat: context.source_controller_seat,
    target_creature_uid: context.source_creature_uid,
    min_actual_damage: requirement.min_actual_damage,
    card_effect_only: true,
  };
}

export function evaluateRuntimeV02DamageHistoryCountRequirement(
  state: Record<string, unknown>,
  rawRequirement: RuntimeV02DamageHistoryCountRequirement,
  rawContext: RuntimeV02SourceRequirementContext,
): RuntimeV02DamageHistoryRequirementEvaluation {
  const requirement = normalizeRuntimeV02DamageHistoryCountRequirement(rawRequirement);
  const query = runtimeV02DamageHistoryRequirementQuery(state, requirement, rawContext);
  const actual = runtimeV02CountDamageHistory(state, query);
  return {
    predicate: "damage_history_count_at_least",
    matched: actual >= requirement.count,
    required_count: requirement.count,
    actual_count: actual,
  };
}
