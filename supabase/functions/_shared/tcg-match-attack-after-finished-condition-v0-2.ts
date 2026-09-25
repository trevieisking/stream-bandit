import {
  applyRuntimeConditionWithContext,
  type ApplyConditionMode,
  type RuntimeV02ConditionCreature,
} from "./tcg-match-condition-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type RuntimeInst = { uid: string; card_id: string };
type RuntimeCreature = RuntimeV02ConditionCreature & {
  stack: RuntimeInst[];
};

export type RuntimeV02AttackAfterFinishedConditionDescriptor = {
  attack_id: string;
  attack_slot: number;
  phase: "after_attack_finished";
  effect: {
    target: "$current_opponent_vanguard";
    condition: string;
    mode: ApplyConditionMode;
  };
};

export type RuntimeV02AttackAfterFinishedConditionReceipt = {
  kind: "after_attack_finished_condition";
  turn_seq: number;
  source_controller_seat: Seat;
  source_uid: string;
  source_card_id: string;
  source_action_id: string;
  descriptor: RuntimeV02AttackAfterFinishedConditionDescriptor;
};

export type RuntimeV02AttackAfterFinishedConditionResult = {
  attack_id: string;
  phase: "after_attack_finished";
  target: "$current_opponent_vanguard";
  source_uid: string;
  source_card_id: string;
  target_controller_seat: Seat;
  target_creature_uid: string;
  condition: string;
  mode: ApplyConditionMode;
  applied: boolean;
  prevented: boolean;
  reason: string | null;
  condition_slot: "scorched" | "venomed" | "control" | "modifier";
  change_kind: "apply" | "replace" | null;
};

function record(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}

function seat(value: unknown, code: string): Seat {
  if (value === 1 || value === 2) return value;
  throw new Error(code);
}

function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_turn_invalid");
  }
  return value;
}

function top(creature: RuntimeCreature, code: string): RuntimeInst {
  if (!Array.isArray(creature.stack) || creature.stack.length < 1) throw new Error(code);
  const value = record(creature.stack[creature.stack.length - 1], code);
  return {
    uid: requiredString(value.uid, code),
    card_id: requiredString(value.card_id, code),
  };
}

function player(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Record<string, unknown> {
  const players = record(state.players, "tcg_v0_2_attack_after_finished_condition_players_invalid");
  return record(
    players[String(controllerSeat)],
    "tcg_v0_2_attack_after_finished_condition_player_missing",
  );
}

function creature(value: unknown, code: string): RuntimeCreature {
  const row = record(value, code);
  if (!Array.isArray(row.stack)) throw new Error(code);
  return row as unknown as RuntimeCreature;
}

function sourceStillOnField(
  state: Record<string, unknown>,
  receipt: RuntimeV02AttackAfterFinishedConditionReceipt,
): void {
  const owner = player(state, receipt.source_controller_seat);
  const candidates: RuntimeCreature[] = [];
  if (owner.vanguard) {
    candidates.push(
      creature(owner.vanguard, "tcg_v0_2_attack_after_finished_condition_source_vanguard_invalid"),
    );
  }
  if (owner.reserve != null && !Array.isArray(owner.reserve)) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_source_reserve_invalid");
  }
  for (const raw of (owner.reserve as unknown[] | undefined) || []) {
    if (raw) candidates.push(
      creature(raw, "tcg_v0_2_attack_after_finished_condition_source_reserve_creature_invalid"),
    );
  }
  const matched = candidates.filter((candidate) => {
    const current = top(
      candidate,
      "tcg_v0_2_attack_after_finished_condition_source_top_invalid",
    );
    return current.uid === receipt.source_uid &&
      current.card_id === receipt.source_card_id;
  });
  if (matched.length !== 1) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_source_changed");
  }
}

function currentOpponentVanguard(
  state: Record<string, unknown>,
  sourceSeat: Seat,
): { seat: Seat; creature: RuntimeCreature } {
  const opponentSeat: Seat = sourceSeat === 1 ? 2 : 1;
  const opponent = player(state, opponentSeat);
  if (!opponent.vanguard) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_opponent_vanguard_missing");
  }
  return {
    seat: opponentSeat,
    creature: creature(
      opponent.vanguard,
      "tcg_v0_2_attack_after_finished_condition_opponent_vanguard_invalid",
    ),
  };
}

function mode(value: unknown): ApplyConditionMode {
  const normalized = String(value || "");
  if (
    normalized !== "apply_if_empty" &&
    normalized !== "apply_if_empty_or_same"
  ) {
    throw new Error(
      `tcg_v0_2_attack_after_finished_condition_mode_unsupported:${normalized}`,
    );
  }
  return normalized;
}

export function structuredRuntimeAfterAttackFinishedConditionEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackAfterFinishedConditionDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_after_finished_condition_requires_creature");
  }
  const creatureDef = record(
    definition.creature,
    "tcg_v0_2_attack_after_finished_condition_creature_required",
  );
  if (!Array.isArray(creatureDef.attacks)) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_attacks_required");
  }
  if (
    !Number.isInteger(attackSlot) ||
    attackSlot < 1 ||
    attackSlot > creatureDef.attacks.length
  ) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_slot_invalid");
  }
  const attack = record(
    creatureDef.attacks[attackSlot - 1],
    "tcg_v0_2_attack_after_finished_condition_attack_invalid",
  );
  const attackId = requiredString(
    attack.id,
    "tcg_v0_2_attack_after_finished_condition_attack_id_required",
  );
  if (attack.after_attack_finished == null) return null;
  if (!Array.isArray(attack.after_attack_finished)) {
    throw new Error(
      `tcg_v0_2_attack_after_finished_condition_program_invalid:${attackId}`,
    );
  }
  if (attack.after_attack_finished.length === 0) return null;
  if (attack.after_attack_finished.length !== 1) return null;
  const step = record(
    attack.after_attack_finished[0],
    `tcg_v0_2_attack_after_finished_condition_step_invalid:${attackId}`,
  );
  if (String(step.op || "") !== "APPLY_CONDITION") return null;
  const allowed = new Set(["op", "target", "condition", "mode"]);
  const extra = Object.keys(step).find((key) => !allowed.has(key));
  if (extra) {
    throw new Error(
      `tcg_v0_2_attack_after_finished_condition_step_field_unsupported:${attackId}:${extra}`,
    );
  }
  if (String(step.target || "") !== "$current_opponent_vanguard") {
    throw new Error(
      `tcg_v0_2_attack_after_finished_condition_target_unsupported:${attackId}`,
    );
  }
  const condition = requiredString(
    step.condition,
    `tcg_v0_2_attack_after_finished_condition_name_required:${attackId}`,
  );
  return {
    attack_id: attackId,
    attack_slot: attackSlot,
    phase: "after_attack_finished",
    effect: {
      target: "$current_opponent_vanguard",
      condition,
      mode: mode(step.mode),
    },
  };
}

export function runtimeV02InstallAttackAfterFinishedConditionContinuation(
  state: Record<string, unknown>,
  source: RuntimeInst,
  attackSlot: number,
  sourceControllerSeatRaw: number,
  sourceActionIdRaw: string,
): RuntimeV02AttackAfterFinishedConditionDescriptor | null {
  const descriptor = structuredRuntimeAfterAttackFinishedConditionEffects(
    state,
    source,
    attackSlot,
  );
  if (!descriptor) return null;
  if (state.pending_attack_after_finished_condition != null) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_continuation_collision");
  }
  const sourceControllerSeat = seat(
    sourceControllerSeatRaw,
    "tcg_v0_2_attack_after_finished_condition_source_seat_invalid",
  );
  const sourceActionId = requiredString(
    sourceActionIdRaw,
    "tcg_v0_2_attack_after_finished_condition_action_required",
  );
  const receipt: RuntimeV02AttackAfterFinishedConditionReceipt = {
    kind: "after_attack_finished_condition",
    turn_seq: turn(state),
    source_controller_seat: sourceControllerSeat,
    source_uid: requiredString(
      source.uid,
      "tcg_v0_2_attack_after_finished_condition_source_uid_required",
    ),
    source_card_id: requiredString(
      source.card_id,
      "tcg_v0_2_attack_after_finished_condition_source_card_id_required",
    ),
    source_action_id: sourceActionId,
    descriptor: structuredClone(descriptor),
  };
  state.pending_attack_after_finished_condition = receipt;
  return descriptor;
}

export function runtimeV02ResolveAttackAfterFinishedConditionContinuation(
  state: Record<string, unknown>,
): RuntimeV02AttackAfterFinishedConditionResult | null {
  const raw = state.pending_attack_after_finished_condition;
  if (raw == null) return null;
  const receipt = record(
    raw,
    "tcg_v0_2_attack_after_finished_condition_continuation_invalid",
  ) as unknown as RuntimeV02AttackAfterFinishedConditionReceipt;
  if (receipt.kind !== "after_attack_finished_condition") {
    throw new Error("tcg_v0_2_attack_after_finished_condition_continuation_kind_invalid");
  }
  const currentTurn = turn(state);
  if (receipt.turn_seq !== currentTurn) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_turn_changed");
  }
  const sourceSeat = seat(
    receipt.source_controller_seat,
    "tcg_v0_2_attack_after_finished_condition_source_seat_invalid",
  );
  if (seat(
    state.active_seat,
    "tcg_v0_2_attack_after_finished_condition_active_seat_invalid",
  ) !== sourceSeat) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_active_seat_changed");
  }
  sourceStillOnField(state, receipt);
  const currentDescriptor = structuredRuntimeAfterAttackFinishedConditionEffects(
    state,
    { card_id: receipt.source_card_id },
    receipt.descriptor.attack_slot,
  );
  if (
    !currentDescriptor ||
    JSON.stringify(currentDescriptor) !== JSON.stringify(receipt.descriptor)
  ) {
    throw new Error("tcg_v0_2_attack_after_finished_condition_program_changed");
  }
  const target = currentOpponentVanguard(state, sourceSeat);
  const result = applyRuntimeConditionWithContext(
    target.creature,
    currentDescriptor.effect.condition,
    currentTurn,
    currentDescriptor.effect.mode,
    {
      turn_seq: currentTurn,
      active_seat: sourceSeat,
      source_controller_seat: sourceSeat,
      target_controller_seat: target.seat,
      card_effect: true,
      source_action_id: requiredString(
        receipt.source_action_id,
        "tcg_v0_2_attack_after_finished_condition_action_required",
      ),
    },
  );
  delete state.pending_attack_after_finished_condition;
  const targetTop = top(
    target.creature,
    "tcg_v0_2_attack_after_finished_condition_target_top_invalid",
  );
  return {
    attack_id: currentDescriptor.attack_id,
    phase: "after_attack_finished",
    target: "$current_opponent_vanguard",
    source_uid: receipt.source_uid,
    source_card_id: receipt.source_card_id,
    target_controller_seat: target.seat,
    target_creature_uid: targetTop.uid,
    condition: currentDescriptor.effect.condition,
    mode: currentDescriptor.effect.mode,
    applied: result.applied,
    prevented: result.prevented,
    reason: result.reason || null,
    condition_slot: result.condition_slot,
    change_kind: result.change_kind,
  };
}
