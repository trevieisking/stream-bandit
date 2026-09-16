import {
  runtimeV02ApplyAttachedEssencePayment,
  runtimeV02ValidateAttachedEssencePayment,
} from "../_shared/tcg-match-payment-v0-2.ts";

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

Deno.test("payment owner consumes exact selected attached Essence in request order and preserves instance identity", () => {
  const e1 = essence("essence-1", "gale-breeze-essence");
  const e2 = essence("essence-2", "stone-anchor-essence");
  const e3 = essence("essence-3", "grove-root-essence");
  const oldDiscard = essence("old-discard", "tide-flow-essence");
  const source = [e1, e2, e3];
  const discard = [oldDiscard];

  const result = runtimeV02ApplyAttachedEssencePayment(source, discard, ["essence-3", "essence-1"], 2);

  assertEquals(source.map((entry) => entry.uid), ["essence-2"]);
  assertEquals(discard.map((entry) => entry.uid), ["old-discard", "essence-3", "essence-1"]);
  assertEquals(result.amount, 2);
  assertEquals(result.essence_uids, ["essence-3", "essence-1"]);
  assertSame(result.essence[0], e3, "first paid Essence lost instance identity");
  assertSame(result.essence[1], e1, "second paid Essence lost instance identity");
  assertSame(discard[1], e3, "discard did not receive the exact selected instance");
  assertSame(discard[2], e1, "discard did not receive the exact selected instance");
});

Deno.test("payment owner accepts an exact zero-cost payment without mutation", () => {
  const e1 = essence("essence-1", "gale-breeze-essence");
  const source = [e1];
  const discard: typeof source = [];
  const beforeSource = JSON.stringify(source);
  const beforeDiscard = JSON.stringify(discard);

  const plan = runtimeV02ValidateAttachedEssencePayment(source, discard, [], 0);
  const result = runtimeV02ApplyAttachedEssencePayment(source, discard, [], 0);

  assertEquals(plan, { amount: 0, essence_uids: [], essence: [] });
  assertEquals(result, { amount: 0, essence_uids: [], essence: [] });
  assertEquals(JSON.stringify(source), beforeSource);
  assertEquals(JSON.stringify(discard), beforeDiscard);
});

Deno.test("payment owner rejects wrong counts and duplicate selections before mutation", () => {
  for (const [uids, amount, error] of [
    [["essence-1"], 2, "tcg_v0_2_payment_exact_amount_required"],
    [["essence-1", "essence-1"], 2, "tcg_v0_2_payment_exact_amount_required"],
  ] as const) {
    const source = [essence("essence-1", "gale-breeze-essence"), essence("essence-2", "stone-anchor-essence")];
    const discard = [essence("old-discard", "tide-flow-essence")];
    const beforeSource = JSON.stringify(source);
    const beforeDiscard = JSON.stringify(discard);

    assertThrows(() => runtimeV02ApplyAttachedEssencePayment(source, discard, uids, amount), error);
    assertEquals(JSON.stringify(source), beforeSource, `source mutated for ${error}`);
    assertEquals(JSON.stringify(discard), beforeDiscard, `discard mutated for ${error}`);
  }
});

Deno.test("payment owner rejects missing, duplicated-source and already-discarded UIDs before mutation", () => {
  const cases: Array<{
    source: Array<{ uid: string; card_id: string }>;
    discard: Array<{ uid: string; card_id: string }>;
    uid: string;
    error: string;
  }> = [
    {
      source: [essence("essence-1", "gale-breeze-essence")],
      discard: [],
      uid: "missing",
      error: "tcg_v0_2_payment_source_missing:missing",
    },
    {
      source: [essence("essence-1", "gale-breeze-essence"), essence("essence-1", "stone-anchor-essence")],
      discard: [],
      uid: "essence-1",
      error: "tcg_v0_2_payment_source_duplicate:essence-1",
    },
    {
      source: [essence("essence-1", "gale-breeze-essence")],
      discard: [essence("essence-1", "gale-breeze-essence")],
      uid: "essence-1",
      error: "tcg_v0_2_payment_destination_duplicate:essence-1",
    },
  ];

  for (const testCase of cases) {
    const beforeSource = JSON.stringify(testCase.source);
    const beforeDiscard = JSON.stringify(testCase.discard);
    assertThrows(
      () => runtimeV02ApplyAttachedEssencePayment(testCase.source, testCase.discard, [testCase.uid], 1),
      testCase.error,
    );
    assertEquals(JSON.stringify(testCase.source), beforeSource, `source mutated for ${testCase.error}`);
    assertEquals(JSON.stringify(testCase.discard), beforeDiscard, `discard mutated for ${testCase.error}`);
  }
});

Deno.test("payment owner rejects invalid zones and amounts before mutation", () => {
  const source = [essence("essence-1", "gale-breeze-essence")];
  const before = JSON.stringify(source);

  assertThrows(
    () => runtimeV02ApplyAttachedEssencePayment(source, source, ["essence-1"], 1),
    "tcg_v0_2_payment_same_zone",
  );
  assertEquals(JSON.stringify(source), before);

  const discard: typeof source = [];
  assertThrows(
    () => runtimeV02ApplyAttachedEssencePayment(source, discard, ["essence-1"], -1),
    "tcg_v0_2_payment_amount_invalid",
  );
  assertEquals(JSON.stringify(source), before);
  assertEquals(discard, []);
});
