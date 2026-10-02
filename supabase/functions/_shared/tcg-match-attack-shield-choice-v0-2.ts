import {
  addRuntimeShield,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackSelectedShieldEachDescriptor = {
  attack_id: string;
  phase: "after_damage";
  source_shield: {
    target: "$source_creature";
    amount: number;
  };
  selection: {
    controller: "self";
    zone: "field";
    min: number;
    max: number;
    filters: {
      element?: string;
      exclude_source?: boolean;
    };
    as: string;
  };
  shield_each: {
    targets: string;
    amount: number;
  };
};

export type RuntimeV02AttackShieldChoiceOption = {
  id: string;
  label: string;
  anchor_uid: string;
  card_id: string;
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02PendingAttackShieldEachChoice = {
  id: string;
  seat: 1 | 2;
  kind: "select_friendly_creatures_add_shield_each";
  attack_id: string;
  prompt: string;
  min: number;
  max: number;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  amount: number;
  filters: {
    element?: string;
    exclude_source?: boolean;
  };
  source_shield_requested: number;
  source_shield_actual_gain: number;
  options: RuntimeV02AttackShieldChoiceOption[];
};

export type RuntimeV02AttackShieldChoiceBeginResult = {
  attack_id: string;
  source_shield_requested: number;
  source_shield_actual_gain: number;
  pending_choice: RuntimeV02PendingAttackShieldEachChoice | null;
};

export type RuntimeV02AttackShieldChoiceResolution = {
  attack_id: string;
  choice_id: string;
  selected_count: number;
  amount: number;
  actual_gain_total: number;
  targets: Array<{
    option_id: string;
    target_where: "vanguard" | "reserve";
    target_index: number | null;
    target_anchor_uid: string;
    target_card_id: string;
    actual_gain: number;
  }>;
};

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

function requiredString(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}

function positiveAmount(value: unknown, code: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(code);
  return amount;
}

function runtimeInst(value: unknown, code: string): RuntimeInst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function sameInst(actual: RuntimeInst, expected: RuntimeInst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error(code);
  }
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_attack_shield_choice_turn_invalid");
  }
  return turn;
}

function playerForSeat(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player || !Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_attack_shield_choice_player_invalid");
  }
  return player;
}

function fieldCreature(
  player: Record<string, unknown>,
  where: "vanguard" | "reserve",
  index: number | null,
): RuntimeCreature {
  const raw = where === "vanguard"
    ? player.vanguard
    : (player.reserve as unknown[])[Number(index)];
  const creature = objectRecord(raw);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_attack_shield_choice_creature_missing");
  }
  return creature as RuntimeCreature;
}

function topInst(
  creature: RuntimeCreature,
  code: string,
): RuntimeInst {
  const stack = (creature as unknown as { stack?: unknown[] }).stack;
  if (!Array.isArray(stack) || stack.length < 1) throw new Error(code);
  return runtimeInst(stack[stack.length - 1], code);
}

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  return topInst(
    fieldCreature(player, "vanguard", null),
    "tcg_v0_2_attack_shield_choice_source_top_invalid",
  );
}

function definitionElement(
  state: Record<string, unknown>,
  inst: RuntimeInst,
): string {
  const definition = runtimeV02Definition(state, inst);
  return definition && typeof definition.element === "string"
    ? definition.element.trim()
    : "";
}

function labelFor(
  state: Record<string, unknown>,
  inst: RuntimeInst,
): string {
  const definition = runtimeV02Definition(state, inst);
  const name = definition && typeof definition.name === "string"
    ? definition.name.trim()
    : "";
  return name || inst.card_id || "Creature";
}

function filterMatches(
  state: Record<string, unknown>,
  inst: RuntimeInst,
  source: RuntimeInst,
  filters: RuntimeV02AttackSelectedShieldEachDescriptor["selection"]["filters"],
): boolean {
  if (filters.exclude_source === true && inst.uid === source.uid) return false;
  if (filters.element && definitionElement(state, inst) !== filters.element) return false;
  return true;
}

function fieldOptions(
  state: Record<string, unknown>,
  seat: 1 | 2,
  player: Record<string, unknown>,
  source: RuntimeInst,
  filters: RuntimeV02AttackSelectedShieldEachDescriptor["selection"]["filters"],
): RuntimeV02AttackShieldChoiceOption[] {
  const out: RuntimeV02AttackShieldChoiceOption[] = [];
  const candidates: Array<["vanguard" | "reserve", number | null, unknown]> = [
    ["vanguard", null, player.vanguard],
    ...[0, 1, 2, 3].map((index) =>
      ["reserve", index, (player.reserve as unknown[])[index]] as ["reserve", number, unknown]
    ),
  ];
  for (const [where, index, raw] of candidates) {
    if (!raw) continue;
    const creature = fieldCreature(player, where, index);
    const inst = topInst(
      creature,
      `tcg_v0_2_attack_shield_choice_option_top_invalid:${where}:${index ?? "vanguard"}`,
    );
    if (!filterMatches(state, inst, source, filters)) continue;
    out.push({
      id: `creature:${seat}:${inst.uid}`,
      label: labelFor(state, inst),
      anchor_uid: inst.uid,
      card_id: inst.card_id,
      where,
      index,
    });
  }
  return out;
}

export function structuredRuntimeAfterDamageSelectedShieldEachChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackSelectedShieldEachDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_shield_choice_requires_creature");
  }
  const creature = objectRecord(definition.creature);
  if (!creature || !Array.isArray(creature.attacks)) {
    throw new Error("tcg_v0_2_attack_shield_choice_attacks_required");
  }
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > creature.attacks.length) {
    throw new Error("tcg_v0_2_attack_shield_choice_slot_invalid");
  }
  const attack = objectRecord(creature.attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_shield_choice_attack_invalid");
  const attackId = requiredString(
    attack.id,
    "tcg_v0_2_attack_shield_choice_attack_id_required",
  );
  if (!Array.isArray(attack.after_damage) || attack.after_damage.length !== 3) {
    return null;
  }

  const sourceShield = objectRecord(attack.after_damage[0]);
  const select = objectRecord(attack.after_damage[1]);
  const shieldEach = objectRecord(attack.after_damage[2]);
  if (
    !sourceShield || String(sourceShield.op || "") !== "ADD_SHIELD" ||
    !select || String(select.op || "") !== "SELECT_CREATURE" ||
    !shieldEach || String(shieldEach.op || "") !== "ADD_SHIELD_EACH"
  ) {
    return null;
  }

  rejectUnsupportedFields(
    sourceShield,
    ["op", "target", "amount"],
    `tcg_v0_2_attack_shield_choice_source_step_field_unsupported:${attackId}`,
  );
  if (String(sourceShield.target || "") !== "$source_creature") {
    throw new Error(`tcg_v0_2_attack_shield_choice_source_target_unsupported:${attackId}`);
  }
  const sourceAmount = positiveAmount(
    sourceShield.amount,
    `tcg_v0_2_attack_shield_choice_source_amount_invalid:${attackId}`,
  );

  rejectUnsupportedFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_attack_shield_choice_select_field_unsupported:${attackId}`,
  );
  if (String(select.controller || "") !== "self" || String(select.zone || "") !== "field") {
    throw new Error(`tcg_v0_2_attack_shield_choice_selection_scope_unsupported:${attackId}`);
  }
  const count = objectRecord(select.count);
  if (!count) throw new Error(`tcg_v0_2_attack_shield_choice_count_required:${attackId}`);
  rejectUnsupportedFields(
    count,
    ["min", "max"],
    `tcg_v0_2_attack_shield_choice_count_field_unsupported:${attackId}`,
  );
  const min = Number(count.min);
  const max = Number(count.max);
  if (
    !Number.isInteger(min) || !Number.isInteger(max) ||
    min < 0 || max < min || max > 5
  ) {
    throw new Error(`tcg_v0_2_attack_shield_choice_count_invalid:${attackId}`);
  }
  const filtersRaw = objectRecord(select.filters);
  if (!filtersRaw) {
    throw new Error(`tcg_v0_2_attack_shield_choice_filters_required:${attackId}`);
  }
  rejectUnsupportedFields(
    filtersRaw,
    ["element", "exclude_source"],
    `tcg_v0_2_attack_shield_choice_filter_field_unsupported:${attackId}`,
  );
  const element = filtersRaw.element == null
    ? undefined
    : requiredString(
      filtersRaw.element,
      `tcg_v0_2_attack_shield_choice_filter_element_invalid:${attackId}`,
    );
  if (
    filtersRaw.exclude_source != null &&
    typeof filtersRaw.exclude_source !== "boolean"
  ) {
    throw new Error(`tcg_v0_2_attack_shield_choice_filter_exclude_source_invalid:${attackId}`);
  }
  const excludeSource = filtersRaw.exclude_source === true;
  const variable = requiredString(
    select.as,
    `tcg_v0_2_attack_shield_choice_variable_required:${attackId}`,
  );

  rejectUnsupportedFields(
    shieldEach,
    ["op", "targets", "amount"],
    `tcg_v0_2_attack_shield_choice_each_step_field_unsupported:${attackId}`,
  );
  if (String(shieldEach.targets || "") !== `$${variable}`) {
    throw new Error(`tcg_v0_2_attack_shield_choice_variable_mismatch:${attackId}`);
  }
  const eachAmount = positiveAmount(
    shieldEach.amount,
    `tcg_v0_2_attack_shield_choice_each_amount_invalid:${attackId}`,
  );

  return {
    attack_id: attackId,
    phase: "after_damage",
    source_shield: { target: "$source_creature", amount: sourceAmount },
    selection: {
      controller: "self",
      zone: "field",
      min,
      max,
      filters: {
        ...(element ? { element } : {}),
        ...(filtersRaw.exclude_source != null ? { exclude_source: excludeSource } : {}),
      },
      as: variable,
    },
    shield_each: {
      targets: `$${variable}`,
      amount: eachAmount,
    },
  };
}

export function runtimeV02BeginAttackSelectedShieldEachChoice(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackSelectedShieldEachDescriptor,
  sourceInstance: unknown,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02AttackShieldChoiceBeginResult {
  if (descriptor.phase !== "after_damage") {
    throw new Error("tcg_v0_2_attack_shield_choice_phase_invalid");
  }
  if (state.active_seat !== seat) {
    throw new Error("tcg_v0_2_attack_shield_choice_active_seat_mismatch");
  }
  const turn = currentTurn(state);
  const player = playerForSeat(state, seat);
  const source = runtimeInst(
    sourceInstance,
    "tcg_v0_2_attack_shield_choice_source_invalid",
  );
  sameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_shield_choice_source_vanguard_changed",
  );
  const sourceCreature = fieldCreature(player, "vanguard", null);
  const options = fieldOptions(
    state,
    seat,
    player,
    source,
    descriptor.selection.filters,
  );
  if (options.length < descriptor.selection.min) {
    throw new Error("tcg_v0_2_attack_shield_choice_minimum_unavailable");
  }
  const max = Math.min(descriptor.selection.max, options.length);
  const needsChoice = max > 0 || descriptor.selection.min > 0;
  if (needsChoice && !choiceId) {
    throw new Error("tcg_v0_2_attack_shield_choice_id_required");
  }

  // All program shape, source binding and legal-option checks complete before
  // the first mutation. Program order then applies the source Shield before the
  // optional selection is exposed.
  const sourceActual = addRuntimeShield(
    sourceCreature,
    descriptor.source_shield.amount,
  );
  const pending = needsChoice
    ? {
      id: choiceId,
      seat,
      kind: "select_friendly_creatures_add_shield_each" as const,
      attack_id: descriptor.attack_id,
      prompt: max === 1
        ? "Choose up to 1 friendly Creature to gain Shield"
        : `Choose up to ${max} friendly Creatures to gain Shield`,
      min: descriptor.selection.min,
      max,
      turn_seq: turn,
      source_uid: source.uid,
      source_card_id: source.card_id,
      amount: descriptor.shield_each.amount,
      filters: structuredClone(descriptor.selection.filters),
      source_shield_requested: descriptor.source_shield.amount,
      source_shield_actual_gain: sourceActual,
      options,
    }
    : null;

  return {
    attack_id: descriptor.attack_id,
    source_shield_requested: descriptor.source_shield.amount,
    source_shield_actual_gain: sourceActual,
    pending_choice: pending,
  };
}

export function runtimeV02ResolveAttackSelectedShieldEachChoice(
  choice: RuntimeV02PendingAttackShieldEachChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackShieldChoiceResolution {
  if (choice.kind !== "select_friendly_creatures_add_shield_each") {
    throw new Error("tcg_v0_2_attack_shield_choice_kind_invalid");
  }
  if (choice.seat !== seat) {
    throw new Error("tcg_v0_2_attack_shield_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_attack_shield_choice_stale_id");
  }
  if (!Array.isArray(choiceIds) || new Set(choiceIds).size !== choiceIds.length) {
    throw new Error("tcg_v0_2_attack_shield_choice_selection_invalid");
  }
  if (choiceIds.length < choice.min || choiceIds.length > choice.max) {
    throw new Error("tcg_v0_2_attack_shield_choice_count_out_of_bounds");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_attack_shield_choice_turn_changed");
  }
  if (state.active_seat !== seat) {
    throw new Error("tcg_v0_2_attack_shield_choice_active_seat_changed");
  }

  const player = playerForSeat(state, seat);
  const source = { uid: choice.source_uid, card_id: choice.source_card_id };
  sameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_shield_choice_source_vanguard_changed",
  );

  const selected = choiceIds.map((id) => {
    const option = choice.options.find((candidate) => candidate.id === id);
    if (!option) {
      throw new Error("tcg_v0_2_attack_shield_choice_unknown_option");
    }
    const creature = fieldCreature(player, option.where, option.index);
    const current = topInst(
      creature,
      "tcg_v0_2_attack_shield_choice_target_top_invalid",
    );
    sameInst(
      current,
      { uid: option.anchor_uid, card_id: option.card_id },
      "tcg_v0_2_attack_shield_choice_target_changed",
    );
    if (!filterMatches(state, current, source, choice.filters)) {
      throw new Error("tcg_v0_2_attack_shield_choice_target_no_longer_legal");
    }
    return { option, creature, current };
  });

  // Every selected target is rebound and revalidated before any Shield mutation.
  const targets = selected.map(({ option, creature, current }) => {
    const actualGain = addRuntimeShield(creature, choice.amount);
    return {
      option_id: option.id,
      target_where: option.where,
      target_index: option.index,
      target_anchor_uid: current.uid,
      target_card_id: current.card_id,
      actual_gain: actualGain,
    };
  });

  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    selected_count: targets.length,
    amount: choice.amount,
    actual_gain_total: targets.reduce((sum, target) => sum + target.actual_gain, 0),
    targets,
  };
}
