import {
  runtimeV02ApplyCardZonePartitionTransfer,
  runtimeV02ApplyCardZoneReorder,
} from "../_shared/tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02InspectDeckTopEffectOwnedSet,
  runtimeV02InspectionProvenanceAfterRemoval,
  runtimeV02NormalizeInspectZoneStep,
  runtimeV02RebindInspectionRemainder,
} from "../_shared/tcg-match-inspection-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function state() {
  return {
    turn_seq: 41,
    players: {
      "1": { deck: [], rewards: [] },
      "2": {
        deck: [
          { uid: "x", card_id: "x-card" },
          { uid: "y", card_id: "y-card" },
          { uid: "z", card_id: "z-card" },
          { uid: "q", card_id: "q-card" },
        ],
        discard: [],
        rewards: [],
      },
    },
  } as Record<string, any>;
}

Deno.test("effect-owned top-deck inspection delegates selected discard and remainder order to Card-Zone", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeInspectZoneStep({
    op: "INSPECT_ZONE",
    player: "opponent",
    zone: "deck_top",
    selection: { min: 3, max: 3, filters: {} },
    visibility: "controller_private",
    return_policy: "effect_owned_set",
    as: "looked",
  });
  const inspected = runtimeV02InspectDeckTopEffectOwnedSet(
    s, 1, 2, descriptor,
  );
  const player = (s.players as any)["2"];
  equal(player.deck.map((card:any)=>card.uid), ["x","y","z","q"]);

  runtimeV02ApplyCardZonePartitionTransfer(
    player.deck,
    player.discard,
    {
      cause: "effect",
      action_kind: "tactic",
      source_action_id: "seer-test",
      source_card_uid: "seer-source",
      source: { controller_seat: 2, zone: "deck", owner_card_uid: null },
      destination: { controller_seat: 2, zone: "discard", owner_card_uid: null },
      source_window: {
        position: "top",
        card_uids: inspected.cards.map((card) => card.uid),
      },
      destination_card_uids: ["y"],
      source_remainder_position: "top",
      destination_position: "bottom",
    },
  );
  const provenance = runtimeV02InspectionProvenanceAfterRemoval(
    inspected.provenance,
    ["y"],
  );
  equal(player.deck.map((card:any)=>card.uid), ["x","z","q"]);
  equal(player.discard.map((card:any)=>card.uid), ["y"]);
  equal(runtimeV02RebindInspectionRemainder(s, provenance).map((card)=>card.uid), ["x","z"]);

  runtimeV02ApplyCardZoneReorder(player.deck, {
    cause: "effect",
    action_kind: "tactic",
    source_action_id: "seer-test",
    source_card_uid: "seer-source",
    zone: { controller_seat: 2, zone: "deck", owner_card_uid: null },
    card_uids: ["z","x"],
    destination_position: "top",
  });
  equal(player.deck.map((card:any)=>card.uid), ["z","x","q"]);
});
