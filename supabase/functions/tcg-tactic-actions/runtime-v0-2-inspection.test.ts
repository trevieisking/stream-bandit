import {
  runtimeV02InspectDeckTopEffectOwnedSet,
  runtimeV02InspectionProvenanceAfterRemoval,
  runtimeV02NormalizeInspectZoneStep,
  runtimeV02RebindInspectionRemainder,
  runtimeV02ResolveRewardInspectionChoice,
  runtimeV02RewardInspectionChoiceOptions,
} from "../_shared/tcg-match-inspection-v0-2.ts";
import { runtimeV02PrivateRewardInspectionView } from "../_shared/tcg-match-reward-inspection-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function state() {
  return {
    turn_seq: 12,
    players: {
      "1": {
        deck: [
          { uid: "a", card_id: "a-card" },
          { uid: "b", card_id: "b-card" },
          { uid: "c", card_id: "c-card" },
          { uid: "d", card_id: "d-card" },
        ],
        rewards: [
          { uid: "r1", card_id: "reward-one" },
          { uid: "r2", card_id: "reward-two" },
        ],
      },
      "2": {
        deck: [
          { uid: "x", card_id: "x-card" },
          { uid: "y", card_id: "y-card" },
          { uid: "z", card_id: "z-card" },
          { uid: "q", card_id: "q-card" },
        ],
        rewards: [],
      },
    },
  } as Record<string, any>;
}
const rewardStep = {
  op: "INSPECT_ZONE",
  player: "self",
  zone: "rewards",
  selection: { min: 1, max: 1, filters: {} },
  visibility: "controller_private",
  return_policy: "same_position",
  as: "inspected_reward",
};
const deckStep = {
  op: "INSPECT_ZONE",
  player: "opponent",
  zone: "deck_top",
  selection: { min: 3, max: 3, filters: {} },
  visibility: "controller_private",
  return_policy: "effect_owned_set",
  as: "looked",
};

Deno.test("inspection owner recognizes both frozen Tactic families without card identity", () => {
  equal(runtimeV02NormalizeInspectZoneStep(rewardStep), {
    player: "self", zone: "rewards", min: 1, max: 1,
    visibility: "controller_private", return_policy: "same_position",
    as: "inspected_reward",
  });
  equal(runtimeV02NormalizeInspectZoneStep(deckStep), {
    player: "opponent", zone: "deck_top", min: 3, max: 3,
    visibility: "controller_private", return_policy: "effect_owned_set",
    as: "looked",
  });
});

Deno.test("Reward inspection options hide identity until selected then reuse Reward owner", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeInspectZoneStep(rewardStep);
  const options = runtimeV02RewardInspectionChoiceOptions(s, 1, 1, descriptor);
  equal(options.map((option) => ({ id: option.id, label: option.label })), [
    { id: "reward:0", label: "Reward 1" },
    { id: "reward:1", label: "Reward 2" },
  ]);
  const view = runtimeV02ResolveRewardInspectionChoice(
    s, 1, 1, descriptor, options[1],
  );
  equal(view.cards, [{ position: 1, uid: "r2", card_id: "reward-two" }]);
  equal(runtimeV02PrivateRewardInspectionView(s, 1)?.cards, view.cards);
  equal(runtimeV02PrivateRewardInspectionView(s, 2), null);
  equal((s.players as any)["1"].rewards.map((x:any)=>x.uid), ["r1","r2"]);
});

Deno.test("effect-owned deck inspection records private view metadata without moving cards", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeInspectZoneStep(deckStep);
  const before = JSON.stringify((s.players as any)["2"].deck);
  const inspected = runtimeV02InspectDeckTopEffectOwnedSet(s, 1, 2, descriptor);
  equal(inspected.cards.map((card) => card.uid), ["x","y","z"]);
  equal(inspected.provenance.removed_uids, []);
  equal(JSON.stringify((s.players as any)["2"].deck), before);
  equal((s as any).runtime_hidden_information_views_v0_2, [
    { turn_seq: 12, controller_seat: 1, zone: "deck_top" },
  ]);
});

Deno.test("inspection provenance fails closed when the current top window changes", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeInspectZoneStep(deckStep);
  const inspected = runtimeV02InspectDeckTopEffectOwnedSet(s, 1, 2, descriptor);
  equal(runtimeV02RebindInspectionRemainder(s, inspected.provenance).map((x)=>x.uid), ["x","y","z"]);
  [(s.players as any)["2"].deck[0], (s.players as any)["2"].deck[1]] =
    [(s.players as any)["2"].deck[1], (s.players as any)["2"].deck[0]];
  throws(
    () => runtimeV02RebindInspectionRemainder(s, inspected.provenance),
    "deck_top_changed",
  );
});

Deno.test("provenance can track a selected removal and rebind only the exact top remainder", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeInspectZoneStep(deckStep);
  const inspected = runtimeV02InspectDeckTopEffectOwnedSet(s, 1, 2, descriptor);
  (s.players as any)["2"].deck.splice(1, 1);
  const next = runtimeV02InspectionProvenanceAfterRemoval(
    inspected.provenance,
    ["y"],
  );
  equal(runtimeV02RebindInspectionRemainder(s, next).map((x)=>x.uid), ["x","z"]);
});

Deno.test("inspection grammar fails closed outside frozen visibility/return families", () => {
  throws(
    () => runtimeV02NormalizeInspectZoneStep({
      ...deckStep,
      visibility: "public",
    }),
    "shape_unsupported",
  );
  throws(
    () => runtimeV02NormalizeInspectZoneStep({
      ...rewardStep,
      selection: { min: 0, max: 2, filters: {} },
    }),
    "shape_unsupported",
  );
});
