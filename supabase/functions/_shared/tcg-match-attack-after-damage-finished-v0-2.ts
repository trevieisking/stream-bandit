import {
  applyRuntimeV02EssenceTransfer,
  type RuntimeV02EssenceMovement,
} from "./tcg-match-essence-movement-v0-2.ts";
import {
  applyRuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
} from "./tcg-match-heal-packet-v0-2.ts";
import {
  runtimeV02ApplyAtomicSwitch,
  type RuntimeV02AtomicSwitchResult,
} from "./tcg-match-switch-context-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };
type Creature = {
  stack: Inst[];
  essence: Inst[];
  relic?: Inst | null;
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  flags?: Record<string, unknown>;
};
type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Creature;
  top: Inst;
  def: Record<string, unknown>;
};

export type RuntimeV02AttackAfterDamageFinishedDescriptor = {
  attack_id: string;
  phase: "after_damage_finished";
  move: {
    element: string;
    min: number;
    max: number;
    as: string;
  };
  heal_each: {
    element: string;
    damaged: true;
    participated_in_moves: string;
    min: number;
    max: number;
    as: string;
    amount: number;
  };
  optional_switch: {
    min: 0;
    max: 1;
  };
};

export type RuntimeV02AttackAfterDamageFinishedMoveOption = {
  id: string;
  label: string;
  essence_uid: string;
  essence_card_id: string;
  source_anchor_uid: string;
  source_card_id: string;
  destination_anchor_uid: string;
  destination_card_id: string;
};

export type RuntimeV02AttackAfterDamageFinishedHealOption = {
  id: string;
  label: string;
  anchor_uid: string;
  card_id: string;
  where: FieldWhere;
  index: number | null;
};

export type RuntimeV02AttackAfterDamageFinishedSwitchOption = {
  id: string;
  label: string;
  reserve_index: number;
  anchor_uid: string;
  card_id: string;
};

export type RuntimeV02PendingAttackAfterDamageFinishedChoice = {
  id: string;
  seat: Seat;
  kind: "after_damage_finished_program";
  stage: "moves" | "heal_each" | "optional_switch";
  attack_id: string;
  prompt: string;
  min: number;
  max: number;
  turn_seq: number;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02AttackAfterDamageFinishedDescriptor;
  movement_receipts: RuntimeV02EssenceMovement[];
  options: Array<
    | RuntimeV02AttackAfterDamageFinishedMoveOption
    | RuntimeV02AttackAfterDamageFinishedHealOption
    | RuntimeV02AttackAfterDamageFinishedSwitchOption
  >;
};

export type RuntimeV02AttackAfterDamageFinishedResume = {
  kind: "attack_after_damage_finished";
  stage: "start" | "after_moves" | "after_heal";
  turn_seq: number;
  seat: Seat;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02AttackAfterDamageFinishedDescriptor;
  movement_receipts: RuntimeV02EssenceMovement[];
};

export type RuntimeV02AttackAfterDamageFinishedResolution =
  | {
      kind: "after_damage_finished_program";
      stage: "moves_resolved";
      attack_id: string;
      movement_count: number;
      movement_receipts: RuntimeV02EssenceMovement[];
      resume: RuntimeV02AttackAfterDamageFinishedResume;
      emitted_packet_ids: [];
    }
  | {
      kind: "after_damage_finished_program";
      stage: "heal_each_resolved";
      attack_id: string;
      selected_count: number;
      requested_heal_each: number;
      actual_heal_total: number;
      actual_heals: Array<{
        target_uid: string;
        requested_heal: number;
        actual_heal: number;
      }>;
      emitted_packet_ids: string[];
      resume: RuntimeV02AttackAfterDamageFinishedResume;
    }
  | {
      kind: "after_damage_finished_program";
      stage: "optional_switch_resolved";
      attack_id: string;
      selected_count: 0 | 1;
      switch_result: RuntimeV02AtomicSwitchResult | null;
    };

export type RuntimeV02AttackAfterDamageFinishedResumeResolution = {
  kind: "attack_after_damage_finished";
  stage: RuntimeV02AttackAfterDamageFinishedResume["stage"];
  attack_id: string;
  pending_choice: RuntimeV02PendingAttackAfterDamageFinishedChoice;
};

const RESUME_KEY = "pending_attack_after_damage_finished_resume";

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

function currentTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attack_after_finished_turn_invalid");
  }
  return value;
}

function seat(value: unknown, code: string): Seat {
  if (value === 1 || value === 2) return value;
  throw new Error(code);
}

function inst(value: unknown, code: string): Inst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function creature(value: unknown, code: string): Creature {
  const row = objectRecord(value);
  if (!row || !Array.isArray(row.stack) || !row.stack.length || !Array.isArray(row.essence)) {
    throw new Error(code);
  }
  const damage = Number(row.damage ?? 0);
  const shield = Number(row.shield ?? 0);
  if (!Number.isFinite(damage) || damage < 0 || !Number.isFinite(shield) || shield < 0) {
    throw new Error(`${code}:state`);
  }
  return row as unknown as Creature;
}

function top(cr: Creature, code: string): Inst {
  return inst(cr.stack[cr.stack.length - 1], code);
}

function definition(
  state: Record<string, unknown>,
  value: Inst | string,
): Record<string, unknown> {
  const result = runtimeV02Definition(state, value);
  if (!result) throw new Error("tcg_v0_2_attack_after_finished_definition_missing");
  return result;
}

function player(state: Record<string, unknown>, controllerSeat: Seat): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!row || !Array.isArray(row.reserve)) {
    throw new Error("tcg_v0_2_attack_after_finished_player_invalid");
  }
  return row;
}

function fields(state: Record<string, unknown>, controllerSeat: Seat): Field[] {
  const own = player(state, controllerSeat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0, 1, 2, 3].map((index) =>
      ["reserve", index, (own.reserve as unknown[])[index]] as [FieldWhere, number, unknown]
    ),
  ];
  return rows.flatMap(([where, index, raw]) => {
    if (raw == null) return [];
    const cr = creature(raw, "tcg_v0_2_attack_after_finished_field_creature_invalid");
    const card = top(cr, "tcg_v0_2_attack_after_finished_field_top_invalid");
    return [{ where, index, creature: cr, top: card, def: definition(state, card) }];
  });
}

function fieldByAnchor(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  anchorUid: string,
): Field | null {
  return fields(state, controllerSeat).find((field) => field.top.uid === anchorUid) || null;
}

function fieldLabel(field: Field): string {
  return field.where === "vanguard" ? "Vanguard" : `Reserve ${Number(field.index) + 1}`;
}

function sameInst(actual: Inst, expected: Inst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) throw new Error(code);
}

function exactRange(raw: unknown, code: string): { min: number; max: number } {
  const row = objectRecord(raw);
  if (!row) throw new Error(code);
  const keys = Object.keys(row);
  if (keys.some((key) => !["min", "max"].includes(key))) throw new Error(`${code}:field`);
  const min = Number(row.min);
  const max = Number(row.max);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
    throw new Error(code);
  }
  return { min, max };
}

function rejectFields(
  row: Record<string, unknown>,
  allowed: string[],
  code: string,
): void {
  const unsupported = Object.keys(row).find((key) => !allowed.includes(key));
  if (unsupported) throw new Error(`${code}:${unsupported}`);
}

function cardElement(state: Record<string, unknown>, value: Inst): string {
  const def = definition(state, value);
  return requiredString(def.element, "tcg_v0_2_attack_after_finished_element_required");
}

function legalMoveOptions(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  element: string,
): RuntimeV02AttackAfterDamageFinishedMoveOption[] {
  const current = fields(state, controllerSeat).filter((field) =>
    String(field.def.element || "") === element
  );
  const out: RuntimeV02AttackAfterDamageFinishedMoveOption[] = [];
  for (const source of current) {
    for (const rawEssence of source.creature.essence) {
      const essence = inst(rawEssence, "tcg_v0_2_attack_after_finished_essence_invalid");
      const essenceDef = definition(state, essence);
      if (
        String(essenceDef.card_family || "") !== "Essence" ||
        String(essenceDef.element || "") !== element
      ) continue;
      for (const destination of current) {
        if (destination.top.uid === source.top.uid) continue;
        out.push({
          id: `move:${essence.uid}:${source.top.uid}:${destination.top.uid}`,
          label: `Move ${String(essenceDef.name || essence.card_id)}: ${fieldLabel(source)} -> ${fieldLabel(destination)}`,
          essence_uid: essence.uid,
          essence_card_id: essence.card_id,
          source_anchor_uid: source.top.uid,
          source_card_id: source.top.card_id,
          destination_anchor_uid: destination.top.uid,
          destination_card_id: destination.top.card_id,
        });
      }
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function movementParticipants(moves: RuntimeV02EssenceMovement[]): Set<string> {
  return new Set(moves.flatMap((move) => [
    move.source_creature_uid,
    move.destination_creature_uid,
  ]));
}

function legalHealOptions(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02AttackAfterDamageFinishedDescriptor,
  moves: RuntimeV02EssenceMovement[],
): RuntimeV02AttackAfterDamageFinishedHealOption[] {
  const participants = movementParticipants(moves);
  return fields(state, controllerSeat)
    .filter((field) =>
      participants.has(field.top.uid) &&
      String(field.def.element || "") === descriptor.heal_each.element &&
      Number(field.creature.damage || 0) > 0
    )
    .map((field) => ({
      id: `heal:${field.top.uid}`,
      label: `Heal ${fieldLabel(field)}`,
      anchor_uid: field.top.uid,
      card_id: field.top.card_id,
      where: field.where,
      index: field.index,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function legalSwitchOptions(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): RuntimeV02AttackAfterDamageFinishedSwitchOption[] {
  const own = player(state, controllerSeat);
  return (own.reserve as unknown[]).flatMap((raw, index) => {
    if (raw == null) return [];
    const cr = creature(raw, "tcg_v0_2_attack_after_finished_switch_creature_invalid");
    const card = top(cr, "tcg_v0_2_attack_after_finished_switch_top_invalid");
    return [{
      id: `switch:${index}:${card.uid}`,
      label: String(definition(state, card).name || `Reserve ${index + 1}`),
      reserve_index: index,
      anchor_uid: card.uid,
      card_id: card.card_id,
    }];
  });
}

function assertSourceInPlay(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  sourceUid: string,
  sourceCardId: string,
): void {
  const source = fieldByAnchor(state, controllerSeat, sourceUid);
  if (!source || source.top.card_id !== sourceCardId) {
    throw new Error("tcg_v0_2_attack_after_finished_source_changed");
  }
}

function preflightMoves(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  moves: RuntimeV02AttackAfterDamageFinishedMoveOption[],
  attackId: string,
): void {
  const probe = structuredClone(state);
  for (const move of moves) {
    const source = fieldByAnchor(probe, controllerSeat, move.source_anchor_uid);
    const destination = fieldByAnchor(probe, controllerSeat, move.destination_anchor_uid);
    if (!source || !destination) {
      throw new Error("tcg_v0_2_attack_after_finished_move_field_changed");
    }
    sameInst(
      source.top,
      { uid: move.source_anchor_uid, card_id: move.source_card_id },
      "tcg_v0_2_attack_after_finished_move_source_changed",
    );
    sameInst(
      destination.top,
      { uid: move.destination_anchor_uid, card_id: move.destination_card_id },
      "tcg_v0_2_attack_after_finished_move_destination_changed",
    );
    applyRuntimeV02EssenceTransfer(
      probe,
      controllerSeat,
      move.source_anchor_uid,
      move.destination_anchor_uid,
      source.creature.essence,
      destination.creature.essence,
      move.essence_uid,
      attackId,
    );
  }
}

export function structuredRuntimeAttackAfterDamageFinishedProgram(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackAfterDamageFinishedDescriptor | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creatureDef = objectRecord(def.creature);
  const attacks = creatureDef?.attacks;
  if (!Array.isArray(attacks)) return null;
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_after_finished_slot_invalid");
  }
  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_after_finished_attack_invalid");
  const attackId = requiredString(
    attack.id,
    "tcg_v0_2_attack_after_finished_attack_id_required",
  );
  const steps = attack.after_damage_finished;
  if (!Array.isArray(steps) || steps.length !== 4) return null;
  const move = objectRecord(steps[0]);
  const select = objectRecord(steps[1]);
  const healEach = objectRecord(steps[2]);
  const optional = objectRecord(steps[3]);
  if (!move || !select || !healEach || !optional) return null;
  if (
    move.op !== "MOVE_ATTACHED_ESSENCE" ||
    move.controller !== "self" ||
    move.require_destination_different_creature !== true
  ) return null;
  rejectFields(
    move,
    [
      "op", "controller", "element", "count", "source_selector",
      "destination_selector", "require_destination_different_creature", "as",
    ],
    `tcg_v0_2_attack_after_finished_move_field_unsupported:${attackId}`,
  );
  const element = requiredString(
    move.element,
    `tcg_v0_2_attack_after_finished_move_element_required:${attackId}`,
  );
  const moveRange = exactRange(
    move.count,
    `tcg_v0_2_attack_after_finished_move_count_invalid:${attackId}`,
  );
  const sourceSelector = objectRecord(move.source_selector);
  const destinationSelector = objectRecord(move.destination_selector);
  const sourceFilters = objectRecord(sourceSelector?.filters);
  const destinationFilters = objectRecord(destinationSelector?.filters);
  if (
    sourceSelector?.zone !== "field" ||
    destinationSelector?.zone !== "field" ||
    sourceFilters?.card_family !== "Creature" ||
    destinationFilters?.card_family !== "Creature" ||
    sourceFilters?.element !== element ||
    destinationFilters?.element !== element
  ) return null;
  const moveVar = requiredString(
    move.as,
    `tcg_v0_2_attack_after_finished_move_var_required:${attackId}`,
  );

  if (select.op !== "SELECT_CREATURE" || select.controller !== "self" || select.zone !== "field") {
    return null;
  }
  rejectFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_attack_after_finished_select_field_unsupported:${attackId}`,
  );
  const healRange = exactRange(
    select.count,
    `tcg_v0_2_attack_after_finished_heal_count_invalid:${attackId}`,
  );
  const healFilters = objectRecord(select.filters);
  if (
    !healFilters ||
    healFilters.element !== element ||
    healFilters.damaged !== true ||
    healFilters.participated_in_moves !== `$${moveVar}`
  ) return null;
  const healVar = requiredString(
    select.as,
    `tcg_v0_2_attack_after_finished_heal_var_required:${attackId}`,
  );

  if (
    healEach.op !== "HEAL_EACH" ||
    healEach.targets !== `$${healVar}`
  ) return null;
  rejectFields(
    healEach,
    ["op", "targets", "amount"],
    `tcg_v0_2_attack_after_finished_heal_each_field_unsupported:${attackId}`,
  );
  const amount = Number(healEach.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`tcg_v0_2_attack_after_finished_heal_amount_invalid:${attackId}`);
  }

  if (optional.op !== "OPTIONAL" || optional.player !== "self") return null;
  rejectFields(
    optional,
    ["op", "player", "steps"],
    `tcg_v0_2_attack_after_finished_optional_field_unsupported:${attackId}`,
  );
  if (!Array.isArray(optional.steps) || optional.steps.length !== 2) return null;
  const switchSelect = objectRecord(optional.steps[0]);
  const switchStep = objectRecord(optional.steps[1]);
  if (
    !switchSelect ||
    switchSelect.op !== "SELECT_CREATURE" ||
    switchSelect.controller !== "self" ||
    switchSelect.zone !== "reserve" ||
    Number(switchSelect.count) !== 1
  ) return null;
  const switchFilters = objectRecord(switchSelect.filters);
  if (!switchFilters || Object.keys(switchFilters).length !== 0) return null;
  const switchVar = requiredString(
    switchSelect.as,
    `tcg_v0_2_attack_after_finished_switch_var_required:${attackId}`,
  );
  if (
    !switchStep ||
    switchStep.op !== "SWITCH_WITH_VANGUARD" ||
    switchStep.player !== "self" ||
    switchStep.target !== `$${switchVar}`
  ) return null;

  return {
    attack_id: attackId,
    phase: "after_damage_finished",
    move: { element, min: moveRange.min, max: moveRange.max, as: moveVar },
    heal_each: {
      element,
      damaged: true,
      participated_in_moves: `$${moveVar}`,
      min: healRange.min,
      max: healRange.max,
      as: healVar,
      amount,
    },
    optional_switch: { min: 0, max: 1 },
  };
}

export function runtimeV02InitialAttackAfterDamageFinishedResume(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02AttackAfterDamageFinishedDescriptor,
  sourceInstance: unknown,
): RuntimeV02AttackAfterDamageFinishedResume {
  const controller = seat(
    controllerSeat,
    "tcg_v0_2_attack_after_finished_controller_invalid",
  );
  const source = inst(
    sourceInstance,
    "tcg_v0_2_attack_after_finished_source_invalid",
  );
  assertSourceInPlay(state, controller, source.uid, source.card_id);
  return {
    kind: "attack_after_damage_finished",
    stage: "start",
    turn_seq: currentTurn(state),
    seat: controller,
    source_uid: source.uid,
    source_card_id: source.card_id,
    descriptor: structuredClone(descriptor),
    movement_receipts: [],
  };
}

export function runtimeV02InstallAttackAfterDamageFinishedContinuation(
  state: Record<string, unknown>,
  resume: RuntimeV02AttackAfterDamageFinishedResume,
): void {
  if (state[RESUME_KEY] != null) {
    throw new Error("tcg_v0_2_attack_after_finished_resume_already_pending");
  }
  state[RESUME_KEY] = structuredClone(resume);
}

export function runtimeV02HasAttackAfterDamageFinishedContinuation(
  state: Record<string, unknown>,
): boolean {
  return state[RESUME_KEY] != null;
}

function choiceBase(
  resume: RuntimeV02AttackAfterDamageFinishedResume,
  stage: RuntimeV02PendingAttackAfterDamageFinishedChoice["stage"],
  prompt: string,
  min: number,
  max: number,
  options: RuntimeV02PendingAttackAfterDamageFinishedChoice["options"],
  choiceId: string,
): RuntimeV02PendingAttackAfterDamageFinishedChoice {
  if (!choiceId) throw new Error("tcg_v0_2_attack_after_finished_choice_id_required");
  return {
    id: choiceId,
    seat: resume.seat,
    kind: "after_damage_finished_program",
    stage,
    attack_id: resume.descriptor.attack_id,
    prompt,
    min,
    max,
    turn_seq: resume.turn_seq,
    source_uid: resume.source_uid,
    source_card_id: resume.source_card_id,
    descriptor: structuredClone(resume.descriptor),
    movement_receipts: resume.movement_receipts.map((entry) => ({ ...entry })),
    options,
  };
}

export function runtimeV02ResumeAttackAfterDamageFinishedProgram(
  state: Record<string, unknown>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02AttackAfterDamageFinishedResumeResolution {
  const raw = objectRecord(state[RESUME_KEY]);
  if (!raw) throw new Error("tcg_v0_2_attack_after_finished_resume_required");
  const resume = structuredClone(raw) as RuntimeV02AttackAfterDamageFinishedResume;
  if (resume.kind !== "attack_after_damage_finished") {
    throw new Error("tcg_v0_2_attack_after_finished_resume_kind_invalid");
  }
  if (resume.turn_seq !== currentTurn(state)) {
    throw new Error("tcg_v0_2_attack_after_finished_resume_turn_stale");
  }
  if (Number(state.active_seat) !== resume.seat) {
    throw new Error("tcg_v0_2_attack_after_finished_active_seat_changed");
  }
  assertSourceInPlay(
    state,
    resume.seat,
    resume.source_uid,
    resume.source_card_id,
  );
  delete state[RESUME_KEY];

  if (resume.stage === "start") {
    const options = legalMoveOptions(
      state,
      resume.seat,
      resume.descriptor.move.element,
    );
    return {
      kind: resume.kind,
      stage: resume.stage,
      attack_id: resume.descriptor.attack_id,
      pending_choice: choiceBase(
        resume,
        "moves",
        "Choose attached Essence moves",
        resume.descriptor.move.min,
        Math.min(resume.descriptor.move.max, options.length),
        options,
        choiceId,
      ),
    };
  }

  if (resume.stage === "after_moves") {
    const options = legalHealOptions(
      state,
      resume.seat,
      resume.descriptor,
      resume.movement_receipts,
    );
    if (options.length) {
      return {
        kind: resume.kind,
        stage: resume.stage,
        attack_id: resume.descriptor.attack_id,
        pending_choice: choiceBase(
          resume,
          "heal_each",
          "Choose damaged moved Creatures to heal",
          resume.descriptor.heal_each.min,
          Math.min(resume.descriptor.heal_each.max, options.length),
          options,
          choiceId,
        ),
      };
    }
  }

  const switchOptions = legalSwitchOptions(state, resume.seat);
  return {
    kind: resume.kind,
    stage: resume.stage,
    attack_id: resume.descriptor.attack_id,
    pending_choice: choiceBase(
      resume,
      "optional_switch",
      "Optionally choose a Reserve Creature to switch with your Vanguard",
      0,
      Math.min(1, switchOptions.length),
      switchOptions,
      choiceId,
    ),
  };
}

function validateChoice(
  choice: RuntimeV02PendingAttackAfterDamageFinishedChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): void {
  if (choice.kind !== "after_damage_finished_program") {
    throw new Error("tcg_v0_2_attack_after_finished_choice_kind_invalid");
  }
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_attack_after_finished_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_attack_after_finished_choice_stale_id");
  }
  if (!Array.isArray(choiceIds) || new Set(choiceIds).size !== choiceIds.length) {
    throw new Error("tcg_v0_2_attack_after_finished_choice_ids_invalid");
  }
  if (choice.turn_seq !== currentTurn(state)) {
    throw new Error("tcg_v0_2_attack_after_finished_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_attack_after_finished_active_seat_changed");
  }
  assertSourceInPlay(
    state,
    controllerSeat,
    choice.source_uid,
    choice.source_card_id,
  );
}

export function runtimeV02ResolveAttackAfterDamageFinishedChoice(
  choice: RuntimeV02PendingAttackAfterDamageFinishedChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02AttackAfterDamageFinishedResolution {
  validateChoice(choice, controllerSeat, choiceId, choiceIds, state);

  if (choice.stage === "moves") {
    if (choiceIds.length < choice.min || choiceIds.length > choice.max) {
      throw new Error("tcg_v0_2_attack_after_finished_move_choice_shape_invalid");
    }
    const byId = new Map(
      (choice.options as RuntimeV02AttackAfterDamageFinishedMoveOption[])
        .map((option) => [option.id, option]),
    );
    const moves = choiceIds.map((id) => byId.get(id))
      .filter((option): option is RuntimeV02AttackAfterDamageFinishedMoveOption =>
        Boolean(option)
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    if (moves.length !== choiceIds.length) {
      throw new Error("tcg_v0_2_attack_after_finished_unknown_move_option");
    }
    if (new Set(moves.map((move) => move.essence_uid)).size !== moves.length) {
      throw new Error("tcg_v0_2_attack_after_finished_essence_reused");
    }
    const current = new Set(
      legalMoveOptions(state, controllerSeat, choice.descriptor.move.element)
        .map((option) => option.id),
    );
    for (const move of moves) {
      if (!current.has(move.id)) {
        throw new Error("tcg_v0_2_attack_after_finished_move_changed");
      }
    }
    preflightMoves(state, controllerSeat, moves, choice.attack_id);
    const receipts: RuntimeV02EssenceMovement[] = [];
    for (const move of moves) {
      const source = fieldByAnchor(state, controllerSeat, move.source_anchor_uid);
      const destination = fieldByAnchor(
        state,
        controllerSeat,
        move.destination_anchor_uid,
      );
      if (!source || !destination) {
        throw new Error("tcg_v0_2_attack_after_finished_move_field_changed");
      }
      receipts.push(
        applyRuntimeV02EssenceTransfer(
          state,
          controllerSeat,
          move.source_anchor_uid,
          move.destination_anchor_uid,
          source.creature.essence,
          destination.creature.essence,
          move.essence_uid,
          choice.attack_id,
        ).movement,
      );
    }
    return {
      kind: choice.kind,
      stage: "moves_resolved",
      attack_id: choice.attack_id,
      movement_count: receipts.length,
      movement_receipts: receipts.map((entry) => ({ ...entry })),
      resume: {
        kind: "attack_after_damage_finished",
        stage: "after_moves",
        turn_seq: choice.turn_seq,
        seat: controllerSeat,
        source_uid: choice.source_uid,
        source_card_id: choice.source_card_id,
        descriptor: structuredClone(choice.descriptor),
        movement_receipts: receipts.map((entry) => ({ ...entry })),
      },
      emitted_packet_ids: [],
    };
  }

  if (choice.stage === "heal_each") {
    if (choiceIds.length < choice.min || choiceIds.length > choice.max) {
      throw new Error("tcg_v0_2_attack_after_finished_heal_choice_shape_invalid");
    }
    const options = choice.options as RuntimeV02AttackAfterDamageFinishedHealOption[];
    const current = legalHealOptions(
      state,
      controllerSeat,
      choice.descriptor,
      choice.movement_receipts,
    );
    const currentById = new Map(current.map((option) => [option.id, option]));
    const selected = choiceIds.map((id) => currentById.get(id))
      .filter((option): option is RuntimeV02AttackAfterDamageFinishedHealOption =>
        Boolean(option)
      );
    if (
      selected.length !== choiceIds.length ||
      selected.some((option) => !options.some((prior) => prior.id === option.id))
    ) {
      throw new Error("tcg_v0_2_attack_after_finished_heal_target_changed");
    }

    // Rebind every selected target before mutating any of them.
    const rebound = selected.map((option) => {
      const field = fieldByAnchor(state, controllerSeat, option.anchor_uid);
      if (
        !field ||
        field.top.card_id !== option.card_id ||
        field.where !== option.where ||
        field.index !== option.index ||
        Number(field.creature.damage || 0) <= 0
      ) {
        throw new Error("tcg_v0_2_attack_after_finished_heal_target_changed");
      }
      return field;
    });

    const actualHeals: Array<{
      target_uid: string;
      requested_heal: number;
      actual_heal: number;
    }> = [];
    const packetIds: string[] = [];
    let total = 0;
    for (const field of rebound) {
      const context: RuntimeV02HealPacketContext = {
        source: {
          controller_seat: controllerSeat,
          action_kind: "attack",
          action_id: choice.attack_id,
          card_effect: true,
          card_uid: choice.source_uid,
          card_id: choice.source_card_id,
          creature_uid: choice.source_uid,
        },
        target: {
          controller_seat: controllerSeat,
          creature_uid: field.top.uid,
          card_uid: field.top.uid,
          card_id: field.top.card_id,
          element: cardElement(state, field.top),
          where: field.where,
          index: field.index,
        },
      };
      const resolved = applyRuntimeV02HealPacket(
        state,
        field.creature,
        choice.descriptor.heal_each.amount,
        context,
      );
      total += resolved.actual_heal;
      actualHeals.push({
        target_uid: field.top.uid,
        requested_heal: resolved.requested_amount,
        actual_heal: resolved.actual_heal,
      });
      if (resolved.packet) packetIds.push(resolved.packet.id);
    }
    return {
      kind: choice.kind,
      stage: "heal_each_resolved",
      attack_id: choice.attack_id,
      selected_count: rebound.length,
      requested_heal_each: choice.descriptor.heal_each.amount,
      actual_heal_total: total,
      actual_heals: actualHeals,
      emitted_packet_ids: packetIds,
      resume: {
        kind: "attack_after_damage_finished",
        stage: "after_heal",
        turn_seq: choice.turn_seq,
        seat: controllerSeat,
        source_uid: choice.source_uid,
        source_card_id: choice.source_card_id,
        descriptor: structuredClone(choice.descriptor),
        movement_receipts: choice.movement_receipts.map((entry) => ({ ...entry })),
      },
    };
  }

  if (choice.stage !== "optional_switch") {
    throw new Error("tcg_v0_2_attack_after_finished_choice_stage_invalid");
  }
  if (choiceIds.length > 1) {
    throw new Error("tcg_v0_2_attack_after_finished_switch_choice_shape_invalid");
  }
  if (choiceIds.length === 0) {
    return {
      kind: choice.kind,
      stage: "optional_switch_resolved",
      attack_id: choice.attack_id,
      selected_count: 0,
      switch_result: null,
    };
  }
  const option = (choice.options as RuntimeV02AttackAfterDamageFinishedSwitchOption[])
    .find((candidate) => candidate.id === choiceIds[0]);
  if (!option) {
    throw new Error("tcg_v0_2_attack_after_finished_switch_option_unknown");
  }
  const currentOptions = legalSwitchOptions(state, controllerSeat);
  const current = currentOptions.find((candidate) => candidate.id === option.id);
  if (
    !current ||
    current.anchor_uid !== option.anchor_uid ||
    current.card_id !== option.card_id ||
    current.reserve_index !== option.reserve_index
  ) {
    throw new Error("tcg_v0_2_attack_after_finished_switch_target_changed");
  }
  const switched = runtimeV02ApplyAtomicSwitch(
    state,
    controllerSeat,
    option.reserve_index,
    {
      action_kind: "attack",
      source_action_id: choice.attack_id,
      source_card_uid: choice.source_uid,
    },
  );
  return {
    kind: choice.kind,
    stage: "optional_switch_resolved",
    attack_id: choice.attack_id,
    selected_count: 1,
    switch_result: switched,
  };
}
