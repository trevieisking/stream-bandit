import {
  runtimeV02AttachRelicFromHand,
  type RuntimeV02RelicInstance,
  type RuntimeV02RelicPlayerState,
} from "../_shared/tcg-match-relic-engine-v0-2.ts";

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

function card(uid: string, cardId: string): RuntimeV02RelicInstance {
  return { uid, card_id: cardId };
}

function creature(anchor: RuntimeV02RelicInstance) {
  return { stack: [anchor], relic: null };
}

function player(hand: RuntimeV02RelicInstance[]): RuntimeV02RelicPlayerState<RuntimeV02RelicInstance> {
  return { hand, vanguard: null, reserve: [null, null, null, null] };
}

Deno.test("Relic owner attaches the exact hand instance to Vanguard", () => {
  const anchor = card("creature-1", "stone-flintkin");
  const relic = card("relic-1", "stone-bastion-plate");
  const state = player([relic]);
  state.vanguard = creature(anchor);

  const result = runtimeV02AttachRelicFromHand(state, 1, anchor.uid, relic.uid);

  assertEquals(state.hand, []);
  assertSame(state.vanguard?.relic, relic);
  assertSame(result.attached_card, relic);
  assertSame(result.creature, state.vanguard);
  assertEquals(result.receipt, {
    schema: "sb-tcg-relic-attachment-v0.2",
    event_name: "relic_attached",
    controller_seat: 1,
    target_creature_uid: anchor.uid,
    source_card_uid: relic.uid,
    source_card_id: relic.card_id,
    origin_zone: "hand",
    where: "vanguard",
    index: null,
  });
});

Deno.test("Relic owner attaches to the exact Reserve slot without touching siblings", () => {
  const first = card("creature-1", "gale-whiffin");
  const target = card("creature-2", "tide-shellip");
  const relic = card("relic-1", "tide-shellguard-pendant");
  const state = player([relic]);
  state.reserve[0] = creature(first);
  state.reserve[2] = creature(target);

  const result = runtimeV02AttachRelicFromHand(state, 2, target.uid, relic.uid);

  assertSame(state.reserve[0]?.relic, null);
  assertSame(state.reserve[2]?.relic, relic);
  assertEquals(result.receipt.where, "reserve");
  assertEquals(result.receipt.index, 2);
});

Deno.test("Relic owner rejects an occupied destination before mutating hand", () => {
  const anchor = card("creature-1", "stone-rampartusk");
  const current = card("relic-old", "stone-faultstone");
  const incoming = card("relic-new", "stone-bastion-plate");
  const state = player([incoming]);
  state.vanguard = { stack: [anchor], relic: current };

  assertThrows(
    () => runtimeV02AttachRelicFromHand(state, 1, anchor.uid, incoming.uid),
    "tcg_v0_2_relic_attachment_destination_occupied",
  );

  assertEquals(state.hand.map((entry) => entry.uid), [incoming.uid]);
  assertSame(state.vanguard.relic, current);
});

Deno.test("Relic owner rejects stale hand or target identity without partial mutation", () => {
  const anchor = card("creature-1", "grove-vinecoil");
  const relic = card("relic-1", "grove-thorn-crown");
  const state = player([relic]);
  state.reserve[1] = creature(anchor);

  assertThrows(
    () => runtimeV02AttachRelicFromHand(state, 1, anchor.uid, "missing"),
    "tcg_v0_2_relic_attachment_source_missing",
  );
  assertThrows(
    () => runtimeV02AttachRelicFromHand(state, 1, "missing", relic.uid),
    "tcg_v0_2_relic_attachment_target_missing",
  );

  assertEquals(state.hand.map((entry) => entry.uid), [relic.uid]);
  assertSame(state.reserve[1]?.relic, null);
});
