export type RuntimeV02AttackEligibilityRule = {
  op: "SET_ATTACK_ELIGIBILITY";
  scope: "controller_turn";
  rule: "only_final_vanguard_may_attack";
};

export type RuntimeV02AttackEligibilityReceipt = {
  turn_seq: number;
  mode: "final_vanguard_only";
  anchor_uid: string;
  expires: "end_of_turn";
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function normalizedSeat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error("tcg_v0_2_attack_eligibility_controller_seat_invalid");
  }
  return value;
}

function currentTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attack_eligibility_turn_invalid");
  }
  return value;
}

function creatureStack(value: unknown): Record<string, unknown>[] {
  const creature = objectRecord(value);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_eligibility_vanguard_required");
  }
  return creature.stack.map((entry) => {
    const instance = objectRecord(entry);
    if (!instance || typeof instance.uid !== "string" || !instance.uid) {
      throw new Error("tcg_v0_2_attack_eligibility_vanguard_instance_invalid");
    }
    return instance;
  });
}

function currentVanguardAnchor(value: unknown): string {
  const stack = creatureStack(value);
  return String(stack[stack.length - 1].uid);
}

export function runtimeV02NormalizeAttackEligibilityRule(
  raw: unknown,
): RuntimeV02AttackEligibilityRule {
  const step = objectRecord(raw);
  if (!step) {
    throw new Error("tcg_v0_2_attack_eligibility_rule_required");
  }
  for (const key of Object.keys(step)) {
    if (!["op", "scope", "rule"].includes(key)) {
      throw new Error(`tcg_v0_2_attack_eligibility_field_unsupported:${key}`);
    }
  }
  if (String(step.op || "") !== "SET_ATTACK_ELIGIBILITY") {
    throw new Error("tcg_v0_2_attack_eligibility_op_invalid");
  }
  if (String(step.scope || "") !== "controller_turn") {
    throw new Error("tcg_v0_2_attack_eligibility_scope_invalid");
  }
  if (String(step.rule || "") !== "only_final_vanguard_may_attack") {
    throw new Error("tcg_v0_2_attack_eligibility_rule_invalid");
  }
  return {
    op: "SET_ATTACK_ELIGIBILITY",
    scope: "controller_turn",
    rule: "only_final_vanguard_may_attack",
  };
}

export function runtimeV02InstallAttackEligibilityRule(
  state: Record<string, unknown>,
  controllerSeatRaw: unknown,
  currentVanguard: unknown,
  rawRule: unknown,
): RuntimeV02AttackEligibilityReceipt {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  runtimeV02NormalizeAttackEligibilityRule(rawRule);
  const receipt: RuntimeV02AttackEligibilityReceipt = {
    turn_seq: currentTurn(state),
    mode: "final_vanguard_only",
    anchor_uid: currentVanguardAnchor(currentVanguard),
    expires: "end_of_turn",
  };

  if (state.turn_flags == null) state.turn_flags = {};
  const turnFlags = objectRecord(state.turn_flags);
  if (!turnFlags) {
    throw new Error("tcg_v0_2_attack_eligibility_turn_flags_invalid");
  }
  const seatKey = String(controllerSeat);
  if (turnFlags[seatKey] == null) turnFlags[seatKey] = {};
  const seatFlags = objectRecord(turnFlags[seatKey]);
  if (!seatFlags) {
    throw new Error("tcg_v0_2_attack_eligibility_seat_flags_invalid");
  }
  seatFlags.lifecycle_attack_eligibility = { ...receipt };
  return { ...receipt };
}

export function runtimeV02AttackEligibilityBlockReason(
  state: Record<string, unknown>,
  controllerSeatRaw: unknown,
  currentVanguard: unknown,
): string | null {
  const controllerSeat = normalizedSeat(controllerSeatRaw);
  if (state.turn_flags == null) return null;
  const turnFlags = objectRecord(state.turn_flags);
  if (!turnFlags) {
    throw new Error("tcg_v0_2_attack_eligibility_turn_flags_invalid");
  }
  const seatFlagsRaw = turnFlags[String(controllerSeat)];
  if (seatFlagsRaw == null) return null;
  const seatFlags = objectRecord(seatFlagsRaw);
  if (!seatFlags) {
    throw new Error("tcg_v0_2_attack_eligibility_seat_flags_invalid");
  }
  const rawReceipt = seatFlags.lifecycle_attack_eligibility;
  if (rawReceipt == null) return null;
  const receipt = objectRecord(rawReceipt);
  if (!receipt) {
    throw new Error("tcg_v0_2_attack_eligibility_receipt_invalid");
  }

  const receiptTurn = Number(receipt.turn_seq);
  if (!Number.isInteger(receiptTurn) || receiptTurn < 0) {
    throw new Error("tcg_v0_2_attack_eligibility_receipt_turn_invalid");
  }
  if (receiptTurn !== currentTurn(state)) return null;
  if (
    receipt.mode !== "final_vanguard_only" ||
    receipt.expires !== "end_of_turn"
  ) {
    throw new Error("tcg_v0_2_attack_eligibility_receipt_mode_invalid");
  }
  const anchorUid = typeof receipt.anchor_uid === "string"
    ? receipt.anchor_uid
    : "";
  if (!anchorUid) {
    throw new Error("tcg_v0_2_attack_eligibility_receipt_anchor_invalid");
  }
  const stack = creatureStack(currentVanguard);
  return stack.some((instance) => instance.uid === anchorUid)
    ? null
    : "only_final_vanguard_may_attack_this_turn";
}
