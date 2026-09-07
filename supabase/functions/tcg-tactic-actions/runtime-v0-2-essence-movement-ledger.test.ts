import {
  recordRuntimeV02EssenceMovement,
  runtimeV02CurrentTurnEssenceMovements,
} from "../_shared/tcg-match-essence-movement-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

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

function legacyState(turnSeq = 7): Record<string, unknown> {
  return {
    turn_seq: turnSeq,
    card_index: {
      "tide-basic-tide-essence": {
        definition: { id: "tide-basic-tide-essence", kind: "Essence", element: "Tide" },
      },
      "volt-basic-volt-essence": {
        definition: { id: "volt-basic-volt-essence", kind: "Essence", element: "Volt" },
      },
    },
  };
}

function structuredState(): Record<string, unknown> {
  return {
    turn_seq: 13,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      "tide-basic-tide-essence": {
        definition: { id: "tide-basic-tide-essence", kind: "Essence", element: "Volt" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: "tide-basic-tide-essence",
          card_family: "Essence",
          element: "Tide",
        },
      },
    },
  };
}

Deno.test("Essence-movement ledger is optional for legacy/current states", () => {
  assertJsonEquals(runtimeV02CurrentTurnEssenceMovements({ turn_seq: 4 }, 1), []);
});

Deno.test("Essence-movement ledger records exact current-turn public movement metadata", () => {
  const state = legacyState();
  assertJsonEquals(
    recordRuntimeV02EssenceMovement(
      state,
      1,
      "source-creature",
      "destination-creature",
      { uid: "essence-1", card_id: "tide-basic-tide-essence" },
      "tactic:tide-marina-wayfinder",
    ),
    [{
      turn_seq: 7,
      controller_seat: 1,
      source_creature_uid: "source-creature",
      destination_creature_uid: "destination-creature",
      essence_uid: "essence-1",
      element: "Tide",
      source_action_id: "tactic:tide-marina-wayfinder",
    }],
  );
});

Deno.test("Essence-movement ledger de-duplicates the same applied move", () => {
  const state = legacyState(8);
  for (let i = 0; i < 2; i++) {
    recordRuntimeV02EssenceMovement(
      state,
      1,
      "source",
      "destination",
      { uid: "essence-1", card_id: "tide-basic-tide-essence" },
      "tactic:tide-marina-wayfinder",
    );
  }
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 1).length, 1);
});

Deno.test("Essence-movement reads are isolated by seat and current turn", () => {
  const state = legacyState(9);
  recordRuntimeV02EssenceMovement(state, 1, "a", "b", { uid: "e1", card_id: "tide-basic-tide-essence" }, "tactic:a");
  recordRuntimeV02EssenceMovement(state, 2, "c", "d", { uid: "e2", card_id: "volt-basic-volt-essence" }, "tactic:b");
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 1).length, 1);
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 1)[0].element, "Tide");
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 2)[0].element, "Volt");

  state.turn_seq = 10;
  recordRuntimeV02EssenceMovement(state, 1, "e", "f", { uid: "e3", card_id: "tide-basic-tide-essence" }, "tactic:c");
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 1).length, 1);
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 2).length, 0);
});

Deno.test("Essence-movement return values cannot mutate canonical ledger state", () => {
  const state = legacyState(11);
  const written = recordRuntimeV02EssenceMovement(state, 1, "a", "b", { uid: "e1", card_id: "tide-basic-tide-essence" }, "tactic:a");
  written[0].element = "Volt";
  const read = runtimeV02CurrentTurnEssenceMovements(state, 1);
  read[0].element = "Volt";
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 1)[0].element, "Tide");
});

Deno.test("marked v0.2 movement element comes from the structured Essence definition", () => {
  const state = structuredState();
  recordRuntimeV02EssenceMovement(
    state,
    1,
    "a",
    "b",
    { uid: "e1", card_id: "tide-basic-tide-essence" },
    "tactic:tide-marina-wayfinder",
  );
  assertEquals(runtimeV02CurrentTurnEssenceMovements(state, 1)[0].element, "Tide");
});

Deno.test("Essence-movement ledger fails closed on malformed identity or movement state", () => {
  assertThrows(
    () => runtimeV02CurrentTurnEssenceMovements({ turn_seq: -1 }, 1),
    "tcg_v0_2_essence_movement_turn_seq_invalid",
  );
  assertThrows(
    () => recordRuntimeV02EssenceMovement(legacyState(), 3 as 1, "a", "b", { uid: "e1", card_id: "tide-basic-tide-essence" }, "tactic:a"),
    "tcg_v0_2_essence_movement_controller_seat_invalid",
  );
  assertThrows(
    () => recordRuntimeV02EssenceMovement(legacyState(), 1, "a", "a", { uid: "e1", card_id: "tide-basic-tide-essence" }, "tactic:a"),
    "tcg_v0_2_essence_movement_same_creature",
  );
  assertThrows(
    () => runtimeV02CurrentTurnEssenceMovements({ turn_seq: 1, runtime_essence_movements_v0_2: {} }, 1),
    "tcg_v0_2_essence_movement_ledger_invalid",
  );
  assertThrows(
    () => runtimeV02CurrentTurnEssenceMovements({
      turn_seq: 1,
      runtime_essence_movements_v0_2: [{
        turn_seq: 1,
        controller_seat: 1,
        source_creature_uid: "a",
        destination_creature_uid: "b",
        essence_uid: "e",
        element: "Tide",
        source_action_id: "tactic:a",
        hidden_card_id: "must-not-be-stored",
      }],
    }, 1),
    "tcg_v0_2_essence_movement_entry_field_unsupported:0:hidden_card_id",
  );
});
