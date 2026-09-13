import { runtimeV02ApplyCardCostSequence } from "./tcg-match-payment-sequence-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  }
}
function throws(fn: () => unknown, contains: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(contains)) throw error;
    return;
  }
  throw new Error(`expected ${contains}`);
}
const card = (uid: string, card_id = uid) => ({ uid, card_id });
const creature = (uid: string, damage = 0) => ({ stack: [card(uid)], essence: [], relic: null, damage, shield: 0 });
function state() {
  return {
    turn_seq: 3,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": { vanguard: creature("source", 0), reserve: [creature("friend", 20), null, null, null], hand: [card("h1"), card("h2")], deck: [], discard: [], rewards: [card("r1")] },
      "2": { vanguard: creature("opp", 0), reserve: [null, null, null, null], hand: [], deck: [], discard: [], rewards: [card("r2")] },
    },
  } as any;
}
const identity = {
  controller_seat: 1 as const,
  action_kind: "ability" as const,
  source_action_id: "ability:test",
  source_card_uid: "source",
  source_card_id: "source",
  source_creature_uid: "source",
};
const describe = (cr: any) => ({ max_hp: cr.stack[cr.stack.length - 1].uid === "friend" ? 100 : 300, reward_value: 1, label: cr.stack[cr.stack.length - 1].uid });
const damage = (amount = 10) => ({
  kind: "damage" as const,
  cost_index: 0,
  target: { controller_seat: 1 as const, where: "reserve" as const, index: 0, anchor_uid: "friend", card_id: "friend" },
  amount,
  defeat_describe: describe,
});
const discard = (uids: string[]) => ({
  kind: "hand_discard" as const,
  cost_index: 1,
  expected_count: uids.length,
  card_uids: uids,
});

Deno.test("Payment sequence commits ordered leaf costs only after whole-plan preflight", () => {
  const s = state();
  const result = runtimeV02ApplyCardCostSequence(s, identity, [damage(), discard(["h2"])]);
  equal(result.map((entry) => [entry.kind, entry.cost_index]), [["damage", 0], ["hand_discard", 1]]);
  equal(s.players[1].reserve[0].damage, 30);
  equal(s.players[1].hand.map((entry: any) => entry.uid), ["h1"]);
  equal(s.players[1].discard.map((entry: any) => entry.uid), ["h2"]);
  equal(s.effect_events.filter((event: any) => event.event === "card_cost_paid").map((event: any) => event.source_step_index), [0, 1]);
});

Deno.test("Payment sequence leaves real state untouched when a later leaf fails", () => {
  const s = state();
  const before = structuredClone(s);
  throws(() => runtimeV02ApplyCardCostSequence(s, identity, [damage(), discard(["missing"])]), "selected_card_missing");
  equal(s, before);
});

Deno.test("Payment sequence validates exact hidden-card count before any mutation", () => {
  const s = state();
  const before = structuredClone(s);
  throws(() => runtimeV02ApplyCardCostSequence(s, identity, [damage(), {
    kind: "hand_discard",
    cost_index: 1,
    expected_count: 2,
    card_uids: ["h1"],
  }]), "discard_exact_count_required");
  equal(s, before);
});

Deno.test("Payment sequence catches later replay collision during preflight before first real leaf", () => {
  const s = state();
  s.effect_events.push({ event_id: "card-cost:3:ability:test:1:hand_discard" });
  const before = structuredClone(s);
  throws(() => runtimeV02ApplyCardCostSequence(s, identity, [damage(), discard(["h1"])]), "event_duplicate");
  equal(s, before);
});

Deno.test("Payment sequence accepts an empty resolved plan as a no-op", () => {
  const s = state();
  const before = structuredClone(s);
  equal(runtimeV02ApplyCardCostSequence(s, identity, []), []);
  equal(s, before);
});
