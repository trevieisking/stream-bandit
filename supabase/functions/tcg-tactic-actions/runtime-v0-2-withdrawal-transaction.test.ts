import { runtimeV02ApplyWithdrawalPaymentAndSwitch } from "../_shared/tcg-match-withdrawal-transaction-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertSame(actual: unknown, expected: unknown, message = "instances differ") {
  if (!Object.is(actual, expected)) throw new Error(message);
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function essence(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function creature(uid: string, attachedEssence: Array<{ uid: string; card_id: string }> = []) {
  return {
    stack: [{ uid, card_id: uid }],
    essence: attachedEssence,
    relic: null,
    damage: 0,
    shield: 0,
    condition: null,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
  };
}

function stateWithReserve(sourceEssence: Array<{ uid: string; card_id: string }> = []) {
  const outgoing = creature("outgoing-vanguard", sourceEssence);
  const incoming = creature("incoming-reserve");
  const discard: Array<{ uid: string; card_id: string }> = [];
  const state: any = {
    turn_seq: 7,
    players: {
      "1": {
        vanguard: outgoing,
        reserve: [incoming, null, null, null],
        discard,
      },
      "2": {
        vanguard: creature("opponent-vanguard"),
        reserve: [null, null, null, null],
        discard: [],
      },
    },
  };
  return { state, outgoing, incoming, discard };
}

Deno.test("withdrawal orchestration rejects an invalid switch before payment can mutate Essence", () => {
  const selected = essence("essence-1", "gale-breeze-essence");
  const { state, outgoing, discard } = stateWithReserve([selected]);
  state.players["1"].reserve[0] = null;
  const beforeEssence = JSON.stringify(outgoing.essence);
  const beforeDiscard = JSON.stringify(discard);

  assertThrows(
    () => runtimeV02ApplyWithdrawalPaymentAndSwitch(state, 1, 0, outgoing.essence, discard, [selected.uid], 1),
    "tcg_v0_2_switch_incoming_reserve_missing",
  );

  assertEquals(JSON.stringify(outgoing.essence), beforeEssence);
  assertEquals(JSON.stringify(discard), beforeDiscard);
  assertEquals(state.runtime_v0_2_switch_ledger, undefined);
});

Deno.test("withdrawal orchestration rejects an invalid payment before Atomic Switch mutates battlefield", () => {
  const selected = essence("essence-1", "gale-breeze-essence");
  const { state, outgoing, incoming, discard } = stateWithReserve([selected]);
  const beforeEssence = JSON.stringify(outgoing.essence);

  assertThrows(
    () => runtimeV02ApplyWithdrawalPaymentAndSwitch(state, 1, 0, outgoing.essence, discard, [], 1),
    "tcg_v0_2_payment_exact_amount_required",
  );

  assertSame(state.players["1"].vanguard, outgoing, "Vanguard changed after payment preflight failure");
  assertSame(state.players["1"].reserve[0], incoming, "Reserve changed after payment preflight failure");
  assertEquals(JSON.stringify(outgoing.essence), beforeEssence);
  assertEquals(discard, []);
  assertEquals(state.runtime_v0_2_switch_ledger, undefined);
});

Deno.test("withdrawal orchestration pays exact Essence through Payment then commits canonical Atomic Switch", () => {
  const kept = essence("essence-1", "gale-breeze-essence");
  const paid = essence("essence-2", "stone-anchor-essence");
  const { state, outgoing, incoming, discard } = stateWithReserve([kept, paid]);

  const result = runtimeV02ApplyWithdrawalPaymentAndSwitch(
    state,
    1,
    0,
    outgoing.essence,
    discard,
    [paid.uid],
    1,
  );

  assertEquals(outgoing.essence.map((entry) => entry.uid), [kept.uid]);
  assertEquals(discard.map((entry) => entry.uid), [paid.uid]);
  assertSame(discard[0], paid, "Payment did not preserve exact Essence instance identity");
  assertSame(state.players["1"].vanguard, incoming, "incoming Reserve did not become Vanguard");
  assertSame(state.players["1"].reserve[0], outgoing, "outgoing Vanguard did not move to Reserve");
  assertEquals(result.payment.essence_uids, [paid.uid]);
  assertSame(result.payment.essence[0], paid, "payment result lost exact Essence identity");
  assertEquals(result.switch_preflight.switch_id, "switch:7:1");
  assertEquals(result.switched.context.switch_id, result.switch_preflight.switch_id);
  assertEquals(result.switched.events.map((entry) => entry.event), ["moved_to_reserve", "became_vanguard"]);
  assertEquals(state.runtime_v0_2_switch_ledger.sequence, 1);
});

Deno.test("withdrawal orchestration supports zero-cost Withdrawal without payment mutation", () => {
  const kept = essence("essence-1", "gale-breeze-essence");
  const { state, outgoing, incoming, discard } = stateWithReserve([kept]);

  const result = runtimeV02ApplyWithdrawalPaymentAndSwitch(
    state,
    1,
    0,
    outgoing.essence,
    discard,
    [],
    0,
  );

  assertEquals(outgoing.essence.map((entry) => entry.uid), [kept.uid]);
  assertEquals(discard, []);
  assertSame(state.players["1"].vanguard, incoming);
  assertSame(state.players["1"].reserve[0], outgoing);
  assertEquals(result.payment.amount, 0);
  assertEquals(result.payment.essence_uids, []);
});

Deno.test("withdrawal orchestration validates an existing switch ledger before payment mutation", () => {
  const selected = essence("essence-1", "gale-breeze-essence");
  const { state, outgoing, discard } = stateWithReserve([selected]);
  state.runtime_v0_2_switch_ledger = { turn_seq: 7, sequence: -1, contexts: [], events: [] };
  const beforeEssence = JSON.stringify(outgoing.essence);
  const beforeDiscard = JSON.stringify(discard);

  assertThrows(
    () => runtimeV02ApplyWithdrawalPaymentAndSwitch(state, 1, 0, outgoing.essence, discard, [selected.uid], 1),
    "tcg_v0_2_switch_ledger_invalid",
  );

  assertEquals(JSON.stringify(outgoing.essence), beforeEssence);
  assertEquals(JSON.stringify(discard), beforeDiscard);
});
