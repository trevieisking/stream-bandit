import {
  recordRuntimeV02HiddenInformationView,
  runtimeV02CurrentTurnHiddenInformationViews,
} from "../_shared/tcg-match-hidden-information-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

Deno.test("hidden-information ledger is optional for legacy/current states", () => {
  assertJsonEquals(runtimeV02CurrentTurnHiddenInformationViews({ turn_seq: 4 }, 1), []);
});

Deno.test("hidden-information ledger records only turn seat and deck zone metadata", () => {
  const state: Record<string, unknown> = { turn_seq: 7 };
  assertJsonEquals(recordRuntimeV02HiddenInformationView(state, 1, "deck_top"), [
    { turn_seq: 7, controller_seat: 1, zone: "deck_top" },
  ]);
  assertJsonEquals(recordRuntimeV02HiddenInformationView(state, 1, "deck"), [
    { turn_seq: 7, controller_seat: 1, zone: "deck_top" },
    { turn_seq: 7, controller_seat: 1, zone: "deck" },
  ]);
  assertJsonEquals(state.runtime_hidden_information_views_v0_2, [
    { turn_seq: 7, controller_seat: 1, zone: "deck_top" },
    { turn_seq: 7, controller_seat: 1, zone: "deck" },
  ]);
});

Deno.test("hidden-information ledger de-duplicates identical current-turn views", () => {
  const state: Record<string, unknown> = { turn_seq: 8 };
  recordRuntimeV02HiddenInformationView(state, 1, "deck_top");
  recordRuntimeV02HiddenInformationView(state, 1, "deck_top");
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1).length, 1);
});

Deno.test("hidden-information reads are isolated by seat", () => {
  const state: Record<string, unknown> = { turn_seq: 9 };
  recordRuntimeV02HiddenInformationView(state, 1, "deck_top");
  recordRuntimeV02HiddenInformationView(state, 2, "deck");
  assertJsonEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1), [
    { turn_seq: 9, controller_seat: 1, zone: "deck_top" },
  ]);
  assertJsonEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 2), [
    { turn_seq: 9, controller_seat: 2, zone: "deck" },
  ]);
});

Deno.test("recording a new turn prunes old hidden-information metadata", () => {
  const state: Record<string, unknown> = { turn_seq: 10 };
  recordRuntimeV02HiddenInformationView(state, 1, "deck_top");
  state.turn_seq = 11;
  recordRuntimeV02HiddenInformationView(state, 1, "deck");
  assertJsonEquals(state.runtime_hidden_information_views_v0_2, [
    { turn_seq: 11, controller_seat: 1, zone: "deck" },
  ]);
  assertJsonEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1), [
    { turn_seq: 11, controller_seat: 1, zone: "deck" },
  ]);
});

Deno.test("hidden-information return values cannot mutate canonical ledger state", () => {
  const state: Record<string, unknown> = { turn_seq: 12 };
  const written = recordRuntimeV02HiddenInformationView(state, 1, "deck_top");
  written[0].zone = "deck";
  const read = runtimeV02CurrentTurnHiddenInformationViews(state, 1);
  read[0].zone = "deck";
  assertJsonEquals(state.runtime_hidden_information_views_v0_2, [
    { turn_seq: 12, controller_seat: 1, zone: "deck_top" },
  ]);
});

Deno.test("hidden-information ledger fails closed on malformed state or entries", () => {
  assertThrows(
    () => runtimeV02CurrentTurnHiddenInformationViews({ turn_seq: -1 }, 1),
    "tcg_v0_2_hidden_information_turn_seq_invalid",
  );
  assertThrows(
    () => recordRuntimeV02HiddenInformationView({ turn_seq: 1 }, 3 as 1, "deck"),
    "tcg_v0_2_hidden_information_controller_seat_invalid",
  );
  assertThrows(
    () => recordRuntimeV02HiddenInformationView({ turn_seq: 1 }, 1, "hand" as "deck"),
    "tcg_v0_2_hidden_information_zone_invalid",
  );
  assertThrows(
    () => runtimeV02CurrentTurnHiddenInformationViews({ turn_seq: 1, runtime_hidden_information_views_v0_2: {} }, 1),
    "tcg_v0_2_hidden_information_ledger_invalid",
  );
  assertThrows(
    () => runtimeV02CurrentTurnHiddenInformationViews({
      turn_seq: 1,
      runtime_hidden_information_views_v0_2: [{ turn_seq: 1, controller_seat: 1, zone: "deck", card_id: "must-not-be-stored" }],
    }, 1),
    "tcg_v0_2_hidden_information_entry_field_unsupported:0:card_id",
  );
});
