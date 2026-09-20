import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import type { RuntimeV02ConditionCreature } from "./tcg-match-condition-engine-v0-2.ts";
import { runtimeV02EvaluateAttackIf } from "./tcg-match-attack-if-v0-2.ts";
import {
  runtimeV02ApplyAtomicSwitch,
  type RuntimeV02AtomicSwitchResult,
} from "./tcg-match-switch-context-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackReserveSwitchDescriptor = {
  attack_id: string;
  phase: "after_damage";
  when: {
    predicate: "reserve_count_at_least";
    controller: "self";
    count: number;
  };
  selection: {
    controller: "self";
    zone: "reserve";
    count: 1;
    as: string;
  };
  switch: {
    player: "self";
    target: string;
    action_kind: "attack";
  };
};

export type RuntimeV02AttackReserveSwitchChoiceOption = {
  id: string;
  label: string;
  reserve_index: number;
  anchor_uid: string;
  card_id: string;
};

export type RuntimeV02PendingAttackReserveSwitchChoice = {
  id: string;
  seat: 1 | 2;
  kind: "select_friendly_reserve_to_switch";
  attack_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  options: RuntimeV02AttackReserveSwitchChoiceOption[];
};

export type RuntimeV02AttackReserveSwitchResolution = {
  attack_id: string;
  choice_id: string;
  option_id: string;
  reserve_index: number;
  switch_result: RuntimeV02AtomicSwitchResult;
};

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

function runtimeInst(value: unknown, code: string): RuntimeInst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function conditionCreature(value: unknown, code: string): RuntimeV02ConditionCreature {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  const damage = Number(row.damage ?? 0);
  const shield = Number(row.shield ?? 0);
  if (!Number.isFinite(damage) || damage < 0 || !Number.isFinite(shield) || shield < 0) {
    throw new Error(`${code}:state`);
  }
  return row as RuntimeV02ConditionCreature;
}

function playerForSeat(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player || !Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_attack_switch_player_invalid");
  }
  return player;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_attack_switch_turn_invalid");
  }
  return turn;
}

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  const vanguard = objectRecord(player.vanguard);
  if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_switch_source_vanguard_missing");
  }
  return runtimeInst(
    vanguard.stack[vanguard.stack.length - 1],
    "tcg_v0_2_attack_switch_source_top_invalid",
  );
}

function topInst(creature: unknown, index: number): RuntimeInst {
  const row = objectRecord(creature);
  if (!row || !Array.isArray(row.stack) || row.stack.length === 0) {
    throw new Error(`tcg_v0_2_attack_switch_reserve_creature_invalid:${index}`);
  }
  return runtimeInst(
    row.stack[row.stack.length - 1],
    `tcg_v0_2_attack_switch_reserve_top_invalid:${index}`,
  );
}

function sameInst(actual: RuntimeInst, expected: RuntimeInst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error(code);
  }
}

function labelFor(state: Record<string, unknown>, inst: RuntimeInst): string {
  const definition = runtimeV02Definition(state, inst);
  const name = definition && typeof definition.name === "string"
    ? definition.name.trim()
    : "";
  return name || inst.card_id || "Reserve Creature";
}

export function structuredRuntimeAfterDamageReserveSwitchChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackReserveSwitchDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_switch_requires_creature");
  }
  const creature = objectRecord(definition.creature);
  if (!creature || !Array.isArray(creature.attacks)) {
    throw new Error("tcg_v0_2_attack_switch_attacks_required");
  }
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > creature.attacks.length) {
    throw new Error("tcg_v0_2_attack_switch_slot_invalid");
  }
  const attack = objectRecord(creature.attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_switch_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_switch_attack_id_required");
  const afterDamage = attack.after_damage;
  if (!Array.isArray(afterDamage) || afterDamage.length !== 1) return null;

  const outer = objectRecord(afterDamage[0]);
  if (!outer || String(outer.op || "") !== "IF" || outer.else != null) return null;
  const when = objectRecord(outer.when);
  if (
    !when ||
    String(when.predicate || "") !== "reserve_count_at_least" ||
    String(when.controller || "") !== "self"
  ) return null;
  const threshold = Number(when.count);
  if (!Number.isInteger(threshold) || threshold < 1) {
    throw new Error(`tcg_v0_2_attack_switch_reserve_threshold_invalid:${attackId}`);
  }

  const then = outer.then;
  if (!Array.isArray(then) || then.length !== 2) return null;
  const select = objectRecord(then[0]);
  const switchStep = objectRecord(then[1]);
  if (
    !select ||
    String(select.op || "") !== "SELECT_CREATURE" ||
    String(select.controller || "") !== "self" ||
    String(select.zone || "") !== "reserve" ||
    Number(select.count) !== 1
  ) return null;
  const filters = objectRecord(select.filters);
  if (!filters || Object.keys(filters).length !== 0) return null;
  const as = requiredString(select.as, `tcg_v0_2_attack_switch_selection_var_required:${attackId}`);
  if (
    !switchStep ||
    String(switchStep.op || "") !== "SWITCH_WITH_VANGUARD" ||
    String(switchStep.player || "") !== "self" ||
    String(switchStep.target || "") !== `$${as}` ||
    String(switchStep.action_kind || "") !== "attack"
  ) return null;

  return {
    attack_id: attackId,
    phase: "after_damage",
    when: {
      predicate: "reserve_count_at_least",
      controller: "self",
      count: threshold,
    },
    selection: {
      controller: "self",
      zone: "reserve",
      count: 1,
      as,
    },
    switch: {
      player: "self",
      target: `$${as}`,
      action_kind: "attack",
    },
  };
}

export function runtimeV02CreateAttackReserveSwitchChoice(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackReserveSwitchDescriptor,
  sourceInstance: unknown,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingAttackReserveSwitchChoice | null {
  if (!choiceId) throw new Error("tcg_v0_2_attack_switch_choice_id_required");
  if (descriptor.phase !== "after_damage") {
    throw new Error("tcg_v0_2_attack_switch_choice_phase_invalid");
  }
  if (state.active_seat !== seat) {
    throw new Error("tcg_v0_2_attack_switch_active_seat_mismatch");
  }
  const turn = currentTurn(state);
  const player = playerForSeat(state, seat);
  const source = runtimeInst(sourceInstance, "tcg_v0_2_attack_switch_source_invalid");
  sameInst(
    currentVanguardTop(player),
    source,
    "tcg_v0_2_attack_switch_source_vanguard_changed",
  );

  const reserve = player.reserve as unknown[];
  const sourceCreature = conditionCreature(
    player.vanguard,
    "tcg_v0_2_attack_switch_source_creature_invalid",
  );
  const predicateMatched = runtimeV02EvaluateAttackIf(descriptor.when, {
    source_creature: sourceCreature,
    attack_target: sourceCreature,
    self_reserve: reserve,
    opponent_reserve: [],
    variables: {},
    current_action_events: {},
    target_remains_in_play_after_damage: true,
    card_matches: () => false,
  });
  if (!predicateMatched) return null;

  const options: RuntimeV02AttackReserveSwitchChoiceOption[] = [];
  reserve.forEach((raw, reserveIndex) => {
    if (!raw) return;
    const inst = topInst(raw, reserveIndex);
    options.push({
      id: `reserve:${reserveIndex}:${inst.uid}`,
      label: labelFor(state, inst),
      reserve_index: reserveIndex,
      anchor_uid: inst.uid,
      card_id: inst.card_id,
    });
  });
  if (!options.length) {
    throw new Error("tcg_v0_2_attack_switch_choice_no_legal_reserve");
  }

  return {
    id: choiceId,
    seat,
    kind: "select_friendly_reserve_to_switch",
    attack_id: descriptor.attack_id,
    prompt: "Choose a Reserve Creature to become your Vanguard",
    min: 1,
    max: 1,
    turn_seq: turn,
    source_uid: source.uid,
    source_card_id: source.card_id,
    options,
  };
}

export function runtimeV02ResolveAttackReserveSwitchChoice(
  choice: RuntimeV02PendingAttackReserveSwitchChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackReserveSwitchResolution {
  if (choice.kind !== "select_friendly_reserve_to_switch") {
    throw new Error("tcg_v0_2_attack_switch_choice_kind_invalid");
  }
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_switch_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_attack_switch_choice_stale_id");
  }
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_attack_switch_choice_exactly_one_required");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_attack_switch_choice_turn_changed");
  }
  if (state.active_seat !== seat) {
    throw new Error("tcg_v0_2_attack_switch_choice_active_seat_changed");
  }

  const player = playerForSeat(state, seat);
  sameInst(
    currentVanguardTop(player),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_attack_switch_choice_source_vanguard_changed",
  );

  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_attack_switch_choice_unknown_option");
  const reserve = player.reserve as unknown[];
  const current = reserve[option.reserve_index];
  if (!current) throw new Error("tcg_v0_2_attack_switch_choice_reserve_changed");
  const currentTop = topInst(current, option.reserve_index);
  sameInst(
    currentTop,
    { uid: option.anchor_uid, card_id: option.card_id },
    "tcg_v0_2_attack_switch_choice_reserve_changed",
  );

  const switchResult = runtimeV02ApplyAtomicSwitch(
    state,
    seat,
    option.reserve_index,
    {
      action_kind: "attack",
      source_action_id: choice.attack_id,
      source_card_uid: choice.source_uid,
    },
  );

  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    option_id: option.id,
    reserve_index: option.reserve_index,
    switch_result: switchResult,
  };
}
