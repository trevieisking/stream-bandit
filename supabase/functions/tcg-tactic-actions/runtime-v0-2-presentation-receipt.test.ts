import {
  runtimeV02BuildMatchPresentationReceipt,
} from "../_shared/tcg-match-presentation-receipt-v0-2.ts";
import {
  runtimeV02PresentationEnvelopeForViewer,
} from "../_shared/tcg-match-presentation-envelope-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

Deno.test("server receipt maker turns authoritative Attack result into ordered public choreography", () => {
  const receipt = runtimeV02BuildMatchPresentationReceipt({
    event_type: "attack",
    revision: 31,
    payload: {
      seat: 1,
      attack_name: "Storm Break",
      damage_dealt: 80,
      shield_prevented: 20,
      target_seat: 2,
      target_where: "vanguard",
      target_index: null,
    },
    state: {
      phase: "resolution",
      pending_resolutions: [{ kind: "take_reward", seat: 1, count: 1 }],
    },
  });
  assertEquals(receipt.receipt_id, "match:31:attack", "receipt id");
  assertEquals(receipt.revision, 31, "revision");
  assertEquals(
    receipt.cues.map((cue) => cue.family).join(","),
    "source_activation,target_focus,attack_windup,impact,damage,shield_delta,reward_followup",
    "attack choreography order",
  );
  assertEquals(receipt.cues.find((cue) => cue.family === "damage")?.state_delta?.damage, 80, "damage receipt");
  assertEquals(receipt.cues.find((cue) => cue.family === "shield_delta")?.state_delta?.shield, -20, "shield receipt");
});

Deno.test("server receipt maker keeps private Ability choice cue seat scoped", () => {
  const receipt = runtimeV02BuildMatchPresentationReceipt({
    event_type: "ability_pending_choice",
    revision: 41,
    payload: {
      seat: 1,
      ability_id: "search-three",
      creature_selection_count: 3,
      pending: true,
    },
    state: { phase: "ability_effect_resolution", active_seat: 1 },
  });
  const player = runtimeV02PresentationEnvelopeForViewer(receipt, 1);
  const opponent = runtimeV02PresentationEnvelopeForViewer(receipt, 2);
  assert(player.cues.some((cue) => cue.family === "choice"), "acting player should receive private choice cue");
  assert(!opponent.cues.some((cue) => cue.family === "choice"), "opponent must not receive private choice cue");
  assert(opponent.cues.some((cue) => cue.family === "notice"), "opponent retains public-safe choice notice");
});

Deno.test("server receipt maker projects physical movement without card identity leakage for Reward take", () => {
  const receipt = runtimeV02BuildMatchPresentationReceipt({
    event_type: "take_reward",
    revision: 52,
    payload: { seat: 2, count: 2 },
    state: { phase: "resolution" },
  });
  const move = receipt.cues.find((cue) => cue.family === "zone_move");
  assert(move, "reward move cue required");
  assertEquals(move.movement?.from.zone, "rewards", "reward source");
  assertEquals(move.movement?.to.zone, "hand", "reward destination");
  assertEquals(move.movement?.count, 2, "reward count");
  assertEquals(move.movement?.card_uids, undefined, "hidden reward identities stay absent");
});

Deno.test("server receipt maker projects generic field movement for evolve and attach", () => {
  const evolve = runtimeV02BuildMatchPresentationReceipt({
    event_type: "evolve",
    revision: 60,
    payload: { seat: 1, where: "vanguard", index: null, to_card_id: "adult-card" },
    state: { phase: "play", active_seat: 1 },
  });
  assertEquals(evolve.cues[0].movement?.from.zone, "hand", "evolution source");
  assertEquals(evolve.cues[0].movement?.to.zone, "vanguard", "evolution destination");

  const attach = runtimeV02BuildMatchPresentationReceipt({
    event_type: "attach_essence",
    revision: 61,
    payload: { seat: 1, where: "reserve", index: 2, card_id: "gale-essence" },
    state: { phase: "play", active_seat: 1 },
  });
  assertEquals(attach.cues[0].movement?.to.zone, "attached_essence", "Essence destination");
  assertEquals(attach.cues[0].intensity, "micro", "ordinary attachment pacing");
});

Deno.test("server receipt maker derives stable id from committed revision and event, not RNG", () => {
  const left = runtimeV02BuildMatchPresentationReceipt({
    event_type: "end_turn",
    revision: 70,
    payload: { seat: 1 },
    state: { phase: "play", active_seat: 2 },
  });
  const right = runtimeV02BuildMatchPresentationReceipt({
    event_type: "end_turn",
    revision: 70,
    payload: { seat: 1 },
    state: { phase: "play", active_seat: 2 },
  });
  assertEquals(left.receipt_id, right.receipt_id, "receipt identity is deterministic");
  assert(!JSON.stringify(left).includes("shuffle_seed"), "receipt carries no RNG seed");
  assert(!JSON.stringify(left).includes("legal_if"), "receipt carries no browser legality");
});
