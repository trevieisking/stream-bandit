import {
  runtimeV02ResolveAftermath,
  type RuntimeV02AftermathCreature,
  type RuntimeV02AftermathState,
} from "../_shared/tcg-match-aftermath-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function card(uid: string, cardId = uid) {
  return { uid, card_id: cardId };
}

function creature(uid: string): RuntimeV02AftermathCreature {
  return {
    stack: [card(uid)],
    essence: [],
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

function state(): RuntimeV02AftermathState {
  return {
    turn_seq: 4,
    phase: "aftermath",
    marker: "untouched",
    turn_flags: { "1": {}, "2": {} },
    players: {
      "1": { vanguard: creature("p1-v"), reserve: [null, null, null, null] },
      "2": { vanguard: creature("p2-v"), reserve: [null, null, null, null] },
    },
  };
}

Deno.test("Aftermath delegates Condition semantics and preserves condition log wording", () => {
  const s = state();
  const vanguard = s.players["1"].vanguard!;
  vanguard.conditions = { scorched: true, venomed: 10, control: null, modifier: "Drenched" };
  const rolls: Array<"heads" | "tails"> = ["tails", "heads"];
  const damage: number[] = [];

  const result = runtimeV02ResolveAftermath(
    s,
    1,
    () => rolls.shift() ?? "heads",
    (_target, request) => damage.push(request.amount),
  );

  assert(damage.length === 2 && damage[0] === 20 && damage[1] === 10, "Condition damage requests changed");
  assert(result.log_messages[0] === "Scorched dealt 20 to Seat 1's Vanguard (tails).", "Scorched log changed");
  assert(result.log_messages[1] === "Venomed dealt 10 to Seat 1's Vanguard.", "Venomed log changed");
  assert(result.condition_result?.venomed_next === 20, "Venomed escalation left Condition owner");
  assert((s as Record<string, unknown>).phase === "aftermath", "Aftermath foundation took phase authority");
  assert((s as Record<string, unknown>).marker === "untouched", "unrelated state changed");
});

Deno.test("Aftermath clears only current-turn temporary lifecycle flags", () => {
  const s = state();
  const vanguard = s.players["1"].vanguard!;
  const reserve = creature("p1-r");
  s.players["1"].reserve = [reserve, null, null, null];
  vanguard.flags = {
    lifecycle_attack_bonus: { turn_seq: 4, amount: 20 },
    lifecycle_withdrawal_cost: { turn_seq: 4, amount: 0 },
    lifecycle_condition_immunity: { turn_seq: 4 },
    keep_me: true,
  };
  reserve.flags = {
    lifecycle_attack_bonus: { turn_seq: 3, amount: 10 },
    lifecycle_withdrawal_cost: { turn_seq: 3, amount: 1 },
  };
  s.turn_flags = {
    "1": { lifecycle_attack_eligibility: { turn_seq: 4 }, keep_me: "yes" },
    "2": {},
  };

  runtimeV02ResolveAftermath(s, 1, () => "heads", () => {});

  assert(vanguard.flags?.lifecycle_attack_bonus == null, "current attack bonus survived Aftermath");
  assert(vanguard.flags?.lifecycle_withdrawal_cost == null, "current withdrawal override survived Aftermath");
  assert(vanguard.flags?.lifecycle_condition_immunity == null, "current condition immunity survived Aftermath");
  assert(vanguard.flags?.keep_me === true, "unrelated creature flag changed");
  assert(reserve.flags?.lifecycle_attack_bonus != null, "older attack bonus was cleared");
  assert(reserve.flags?.lifecycle_withdrawal_cost != null, "older withdrawal override was cleared");
  assert(s.turn_flags?.["1"].lifecycle_attack_eligibility == null, "current attack eligibility survived Aftermath");
  assert(s.turn_flags?.["1"].keep_me === "yes", "unrelated turn flag changed");
});

Deno.test("Aftermath plans Essence discard through Card-Zone without moving cards", () => {
  const s = state();
  const vanguard = s.players["1"].vanguard!;
  const generated = { ...card("generated"), effect_flags: { discard_during_target_aftermath: true } };
  const surge = { ...card("surge", "volt-surge-essence"), attached_turn: 4 };
  const keep = { ...card("keep"), attached_turn: 4 };
  vanguard.essence = [generated, surge, keep];

  const reserve = creature("p1-r");
  reserve.essence = [{ ...card("reserve-surge", "volt-surge-essence"), attached_turn: 4 }];
  s.players["1"].reserve = [reserve, null, null, null];

  const result = runtimeV02ResolveAftermath(s, 1, () => "heads", () => {});

  assert(vanguard.essence.length === 3, "Aftermath moved attached Essence directly");
  assert(reserve.essence.length === 1, "Aftermath moved Reserve Essence directly");
  assert(result.transfer_plans.length === 1, "unexpected number of Card-Zone plans");
  const plan = result.transfer_plans[0];
  assert(plan.source_cards === vanguard.essence, "Card-Zone source identity changed");
  assert(plan.request.cause === "effect" && plan.request.action_kind === "aftermath", "Card-Zone cause changed");
  assert(plan.request.source_action_id === "aftermath_essence_disposition", "Card-Zone source action changed");
  assert(plan.request.source_card_uid === "p1-v", "owner card identity changed");
  assert(plan.request.source.controller_seat === 1 && plan.request.source.zone === "attached_essence", "source zone changed");
  assert(plan.request.source.owner_card_uid === "p1-v", "source owner binding changed");
  assert(plan.request.destination.controller_seat === 1 && plan.request.destination.zone === "discard", "destination changed");
  assert(plan.request.destination.owner_card_uid === null, "discard owner binding changed");
  assert(plan.request.card_uids.join(",") === "generated,surge", "discard selection changed");
  assert(plan.request.destination_position === "bottom", "discard position changed");
});

Deno.test("legacy Volt Surge fallback remains Vanguard-only", () => {
  const s = state();
  const vanguard = s.players["1"].vanguard!;
  vanguard.essence = [{ ...card("surge", "volt-surge-essence"), attached_turn: 4 }];
  const reserve = creature("p1-r");
  reserve.essence = [{ ...card("reserve-surge", "volt-surge-essence"), attached_turn: 4 }];
  s.players["1"].reserve = [reserve, null, null, null];

  const result = runtimeV02ResolveAftermath(s, 1, () => "heads", () => {});
  assert(result.transfer_plans.length === 1, "legacy Surge scope changed");
  assert(result.transfer_plans[0].request.card_uids.join(",") === "surge", "Reserve Surge incorrectly expired");
});

Deno.test("Aftermath fails closed before an Essence discard plan without an owner card UID", () => {
  const s = state();
  const vanguard = s.players["1"].vanguard!;
  vanguard.stack = [];
  vanguard.essence = [{ ...card("generated"), effect_flags: { discard_during_target_aftermath: true } }];

  let message = "";
  try {
    runtimeV02ResolveAftermath(s, 1, () => "heads", () => {});
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message === "tcg_v0_2_aftermath_essence_owner_required", "missing-owner failure contract changed");
  assert(vanguard.essence.length === 1, "failed Aftermath mutated Essence before rejection");
});

Deno.test("Aftermath foundation does not advance turns, resolve defeats, or create phase authority", () => {
  const s = state();
  (s as Record<string, unknown>).active_seat = 1;
  (s as Record<string, unknown>).resume_after_resolution = "sentinel";
  (s as Record<string, unknown>).pending_resolutions = [{ kind: "sentinel" }];

  runtimeV02ResolveAftermath(s, 1, () => "heads", () => {});

  assert((s as Record<string, unknown>).active_seat === 1, "Aftermath foundation advanced the turn");
  assert(s.turn_seq === 4, "Aftermath foundation changed turn sequence");
  assert((s as Record<string, unknown>).phase === "aftermath", "Aftermath foundation changed phase");
  assert((s as Record<string, unknown>).resume_after_resolution === "sentinel", "Aftermath foundation changed resolution resume");
  const queue = (s as Record<string, unknown>).pending_resolutions as unknown[];
  assert(queue.length === 1, "Aftermath foundation changed the resolution queue");
});
