import {
  runtimeV02ApplyDamageCardCost,
  runtimeV02ApplyHandDiscardCardCost,
} from "./tcg-match-payment-cost-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
function throws(fn: () => unknown, part: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(part)) throw error;
    return;
  }
  throw new Error(`expected ${part}`);
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
  source_step_index: 0,
  source_card_uid: "source",
  source_card_id: "source",
  source_creature_uid: "source",
};
const describe = (cr: any) => ({ max_hp: cr.stack[cr.stack.length - 1].uid === "friend" ? 100 : 300, reward_value: 1, label: cr.stack[cr.stack.length - 1].uid });

Deno.test("Payment cost damage delegates placement, queues defeat consequences, and emits canonical cost event", () => {
  const s = state();
  const result = runtimeV02ApplyDamageCardCost(s, {
    identity,
    target: { controller_seat: 1, where: "reserve", index: 0, anchor_uid: "friend", card_id: "friend" },
    amount: 80,
    defeat_describe: describe,
  });
  equal(result.receipt.actual_damage_placed, 80);
  equal(result.defeat.defeated_count, 1);
  equal(result.event.cost_kind, "damage");
  equal(result.event.actual_damage_placed, 80);
  equal(s.effect_events.filter((e: any) => e.event === "card_cost_paid").length, 1);
});

Deno.test("Payment cost damage preflights future defeat before mutating real state", () => {
  const s = state();
  s.players[1].discard.push(card("friend"));
  throws(() => runtimeV02ApplyDamageCardCost(s, {
    identity,
    target: { controller_seat: 1, where: "reserve", index: 0, anchor_uid: "friend", card_id: "friend" },
    amount: 80,
    defeat_describe: describe,
  }), "destination");
  equal(s.players[1].reserve[0].damage, 20);
  equal(s.effect_events, []);
});

Deno.test("Payment hand-discard cost delegates exact movement to Card-Zone and emits one cost event", () => {
  const s = state();
  const result = runtimeV02ApplyHandDiscardCardCost(s, { identity: { ...identity, source_step_index: 1 }, card_uids: ["h2"] });
  equal(result.event.cost_kind, "hand_discard");
  equal(result.event.discarded_card_uids, ["h2"]);
  equal(s.players[1].hand.map((c: any) => c.uid), ["h1"]);
  equal(s.players[1].discard.map((c: any) => c.uid), ["h2"]);
});

Deno.test("Payment cost events are replay guarded before any second mutation", () => {
  const s = state();
  runtimeV02ApplyHandDiscardCardCost(s, { identity: { ...identity, source_step_index: 2 }, card_uids: ["h1"] });
  throws(() => runtimeV02ApplyHandDiscardCardCost(s, { identity: { ...identity, source_step_index: 2 }, card_uids: ["h2"] }), "event_duplicate");
  equal(s.players[1].hand.map((c: any) => c.uid), ["h2"]);
});
