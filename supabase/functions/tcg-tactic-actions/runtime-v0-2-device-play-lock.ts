export type RuntimeV02DevicePlayLockState = {
  turn_seq?: unknown;
  turn_flags?: unknown;
};

export type RuntimeV02DevicePlayLockStep = {
  op: "SET_DEVICE_PLAY_LOCK";
  player: "self" | "opponent";
  locked: boolean;
  duration: { expires_on: ["end_of_turn"] };
};

export type RuntimeV02DevicePlayLockReceipt = {
  turn_seq: number;
  controller_seat: 1 | 2;
  locked: boolean;
  expires: "end_of_turn";
};

const DEVICE_PLAY_LOCK_TURN_KEY = "device_play_lock_turn";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function currentTurn(state: RuntimeV02DevicePlayLockState): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_device_play_lock_turn_seq_invalid");
  }
  return turn;
}

function normalizedSeat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error("tcg_v0_2_device_play_lock_controller_seat_invalid");
  }
  return value;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: readonly string[],
  error: string,
): void {
  const set = new Set(allowed);
  const extra = Object.keys(value).find((key) => !set.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

export function runtimeV02NormalizeDevicePlayLockStep(
  raw: unknown,
): RuntimeV02DevicePlayLockStep {
  const step = objectRecord(raw);
  if (!step) throw new Error("tcg_v0_2_device_play_lock_step_required");
  rejectUnsupportedFields(
    step,
    ["op", "player", "locked", "duration"],
    "tcg_v0_2_device_play_lock_step_field_unsupported",
  );
  if (step.op !== "SET_DEVICE_PLAY_LOCK") {
    throw new Error("tcg_v0_2_device_play_lock_op_invalid");
  }
  const player = String(step.player || "");
  if (player !== "self" && player !== "opponent") {
    throw new Error("tcg_v0_2_device_play_lock_player_invalid");
  }
  if (typeof step.locked !== "boolean") {
    throw new Error("tcg_v0_2_device_play_lock_locked_invalid");
  }
  const duration = objectRecord(step.duration);
  if (!duration) throw new Error("tcg_v0_2_device_play_lock_duration_required");
  rejectUnsupportedFields(
    duration,
    ["expires_on"],
    "tcg_v0_2_device_play_lock_duration_field_unsupported",
  );
  if (
    !Array.isArray(duration.expires_on) ||
    duration.expires_on.length !== 1 ||
    duration.expires_on[0] !== "end_of_turn"
  ) {
    throw new Error("tcg_v0_2_device_play_lock_expiry_invalid");
  }
  return {
    op: "SET_DEVICE_PLAY_LOCK",
    player,
    locked: step.locked,
    duration: { expires_on: ["end_of_turn"] },
  };
}

function controllerFlags(
  state: RuntimeV02DevicePlayLockState,
  seat: 1 | 2,
  create: boolean,
): Record<string, unknown> | null {
  let flags = objectRecord(state.turn_flags);
  if (!flags) {
    if (state.turn_flags != null) {
      throw new Error("tcg_v0_2_device_play_lock_turn_flags_invalid");
    }
    if (!create) return null;
    flags = {};
    state.turn_flags = flags;
  }
  const key = String(seat);
  let controller = objectRecord(flags[key]);
  if (!controller) {
    if (flags[key] != null) {
      throw new Error("tcg_v0_2_device_play_lock_controller_flags_invalid");
    }
    if (!create) return null;
    controller = {};
    flags[key] = controller;
  }
  return controller;
}

export function runtimeV02ApplyDevicePlayLock(
  state: RuntimeV02DevicePlayLockState,
  controllerSeat: 1 | 2,
  locked: boolean,
): RuntimeV02DevicePlayLockReceipt {
  const seat = normalizedSeat(controllerSeat);
  const turn = currentTurn(state);
  if (typeof locked !== "boolean") {
    throw new Error("tcg_v0_2_device_play_lock_locked_invalid");
  }
  const flags = controllerFlags(state, seat, true)!;
  if (locked) flags[DEVICE_PLAY_LOCK_TURN_KEY] = turn;
  else delete flags[DEVICE_PLAY_LOCK_TURN_KEY];
  return {
    turn_seq: turn,
    controller_seat: seat,
    locked,
    expires: "end_of_turn",
  };
}

export function runtimeV02DevicePlayLocked(
  state: RuntimeV02DevicePlayLockState,
  controllerSeat: 1 | 2,
): boolean {
  const seat = normalizedSeat(controllerSeat);
  const turn = currentTurn(state);
  const flags = controllerFlags(state, seat, false);
  if (!flags || flags[DEVICE_PLAY_LOCK_TURN_KEY] == null) return false;
  const lockTurn = Number(flags[DEVICE_PLAY_LOCK_TURN_KEY]);
  if (!Number.isInteger(lockTurn) || lockTurn < 0) {
    throw new Error("tcg_v0_2_device_play_lock_receipt_invalid");
  }
  return lockTurn === turn;
}

export function runtimeV02TacticPlayBlockReason(
  state: RuntimeV02DevicePlayLockState,
  controllerSeat: 1 | 2,
  tacticSubtype: unknown,
): string | null {
  if (String(tacticSubtype || "") !== "Device") return null;
  return runtimeV02DevicePlayLocked(state, controllerSeat)
    ? "device_play_locked"
    : null;
}
