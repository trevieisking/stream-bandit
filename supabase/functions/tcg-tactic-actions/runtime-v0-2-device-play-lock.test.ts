import {
  runtimeV02ApplyDevicePlayLock,
  runtimeV02DevicePlayLocked,
  runtimeV02NormalizeDevicePlayLockStep,
  runtimeV02TacticPlayBlockReason,
} from "./runtime-v0-2-device-play-lock.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function state() {
  return {
    turn_seq: 21,
    turn_flags: {},
  } as Record<string, unknown>;
}

const exactStep = {
  op: "SET_DEVICE_PLAY_LOCK",
  player: "self",
  locked: true,
  duration: { expires_on: ["end_of_turn"] },
};

Deno.test("Device play-lock owner accepts the frozen end-of-turn grammar only", () => {
  equal(runtimeV02NormalizeDevicePlayLockStep(exactStep), exactStep);
  throws(
    () => runtimeV02NormalizeDevicePlayLockStep({ ...exactStep, player: "$event_controller" }),
    "tcg_v0_2_device_play_lock_player_invalid",
  );
  throws(
    () => runtimeV02NormalizeDevicePlayLockStep({ ...exactStep, duration: { expires_on: ["controller_aftermath"] } }),
    "tcg_v0_2_device_play_lock_expiry_invalid",
  );
  throws(
    () => runtimeV02NormalizeDevicePlayLockStep({ ...exactStep, extra: true }),
    "tcg_v0_2_device_play_lock_step_field_unsupported:extra",
  );
});

Deno.test("Blackout-style lock blocks only the controller's later Device plays", () => {
  const s = state();
  equal(runtimeV02DevicePlayLocked(s, 1), false);
  equal(runtimeV02ApplyDevicePlayLock(s, 1, true), {
    turn_seq: 21,
    controller_seat: 1,
    locked: true,
    expires: "end_of_turn",
  });
  equal(runtimeV02DevicePlayLocked(s, 1), true);
  equal(runtimeV02DevicePlayLocked(s, 2), false);
  equal(runtimeV02TacticPlayBlockReason(s, 1, "Device"), "device_play_locked");
  equal(runtimeV02TacticPlayBlockReason(s, 1, "Ally"), null);
  equal(runtimeV02TacticPlayBlockReason(s, 1, "Relic"), null);
  equal(runtimeV02TacticPlayBlockReason(s, 1, "Realm"), null);
});

Deno.test("Device play lock expires automatically when Match Flow advances turn_seq", () => {
  const s = state();
  runtimeV02ApplyDevicePlayLock(s, 1, true);
  equal(runtimeV02TacticPlayBlockReason(s, 1, "Device"), "device_play_locked");
  s.turn_seq = 22;
  equal(runtimeV02TacticPlayBlockReason(s, 1, "Device"), null);
});

Deno.test("Device play lock supports an explicit same-turn unlock without affecting the other seat", () => {
  const s = state();
  runtimeV02ApplyDevicePlayLock(s, 1, true);
  runtimeV02ApplyDevicePlayLock(s, 2, true);
  runtimeV02ApplyDevicePlayLock(s, 1, false);
  equal(runtimeV02DevicePlayLocked(s, 1), false);
  equal(runtimeV02DevicePlayLocked(s, 2), true);
});

Deno.test("current-turn malformed play-lock receipts fail closed", () => {
  const s = state();
  (s.turn_flags as any)["1"] = { device_play_lock_turn: "broken" };
  throws(
    () => runtimeV02DevicePlayLocked(s, 1),
    "tcg_v0_2_device_play_lock_receipt_invalid",
  );
});
