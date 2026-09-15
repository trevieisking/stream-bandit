import {
  runtimeV02ResolveAfterDamageDeckDiscard,
  structuredRuntimeAfterDamageDeckDiscard,
} from "../_shared/tcg-match-attack-deck-discard-v0-2.ts";

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function throws(fn: () => unknown, expected: string): void {
  try {
    fn();
  } catch (error) {
    equal(error instanceof Error ? error.message : String(error), expected);
    return;
  }
  throw new Error(`expected error: ${expected}`);
}

type Inst = { uid: string; card_id: string };

const marker = {
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  registry_sha256:
    "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
  runtime_authority: false,
  source: "test",
};

function instance(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function sourceDefinition(options: { count?: number; reveal?: string } = {}) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "test-deck-discarder",
    name: "Test Deck Discarder",
    card_family: "Creature",
    element: "Shade",
    creature: {
      stage: "Adult",
      attacks: [{
        id: "pressure-break",
        name: "Pressure Break",
        cost: [],
        base_damage: 80,
        after_damage: [{
          op: "IF",
          when: { predicate: "target_has_any_condition" },
          then: [{
            op: "DISCARD_DECK_TOP",
            player: "opponent",
            count: options.count ?? 2,
            reveal: options.reveal ?? "public",
          }],
        }],
      }],
    },
    essence: null,
    tactic: null,
  };
}

function state(opponentDeck: Inst[] = [], opponentDiscard: Inst[] = []) {
  const source = instance("source-uid", "test-deck-discarder");
  return {
    turn_seq: 9,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    card_index: {
      "test-deck-discarder": { definition_v0_2: sourceDefinition() },
    },
    players: {
      "1": {
        vanguard: { stack: [source] },
        deck: [],
        discard: [],
      },
      "2": {
        vanguard: { stack: [instance("opponent-vanguard", "opponent-creature")] },
        deck: opponentDeck,
        discard: opponentDiscard,
      },
    },
  } as Record<string, unknown>;
}

Deno.test("structured attack deck-discard owner recognizes the generic target-condition family", () => {
  const current = state();
  const descriptor = structuredRuntimeAfterDamageDeckDiscard(
    current,
    { card_id: "test-deck-discarder" },
    1,
  );
  assert(descriptor);
  equal(descriptor.attack_id, "pressure-break");
  equal(descriptor.when.predicate, "target_has_any_condition");
  equal(descriptor.when.target, "$attack_target");
  equal(descriptor.discard.player, "opponent");
  equal(descriptor.discard.count, 2);
  equal(descriptor.discard.reveal, "public");
});

Deno.test("structured attack deck discard preserves top order and object identity through Card-Zone", () => {
  const first = instance("first", "card-a");
  const second = instance("second", "card-b");
  const third = instance("third", "card-c");
  const oldDiscard = instance("old", "card-old");
  const current = state([first, second, third], [oldDiscard]);
  const descriptor = structuredRuntimeAfterDamageDeckDiscard(
    current,
    { card_id: "test-deck-discarder" },
    1,
  );
  assert(descriptor);

  const result = runtimeV02ResolveAfterDamageDeckDiscard(
    current,
    1,
    descriptor,
    { uid: "source-uid", card_id: "test-deck-discarder" },
    true,
  );

  equal(result.condition_met, true);
  equal(result.requested_count, 2);
  equal(result.moved_count, 2);
  equal(result.discarded_controller_seat, 2);
  equal(result.event_name, "deck_cards_discarded");
  equal(result.discarded_card_uids.join(","), "first,second");
  const opponent = (current.players as any)["2"];
  equal(opponent.deck.length, 1);
  equal(opponent.deck[0], third);
  equal(opponent.discard.length, 3);
  equal(opponent.discard[0], oldDiscard);
  equal(opponent.discard[1], first);
  equal(opponent.discard[2], second);
  equal((current as any).deckout_loser, undefined);
});

Deno.test("structured attack deck discard does nothing when target condition is not met", () => {
  const first = instance("first", "card-a");
  const current = state([first]);
  const descriptor = structuredRuntimeAfterDamageDeckDiscard(
    current,
    { card_id: "test-deck-discarder" },
    1,
  );
  assert(descriptor);

  const result = runtimeV02ResolveAfterDamageDeckDiscard(
    current,
    1,
    descriptor,
    { uid: "source-uid", card_id: "test-deck-discarder" },
    false,
  );
  equal(result.condition_met, false);
  equal(result.moved_count, 0);
  equal(result.event_name, null);
  equal(((current.players as any)["2"].deck as Inst[])[0], first);
  equal((current.players as any)["2"].discard.length, 0);
});

Deno.test("structured attack deck discard moves only available cards and never creates deckout", () => {
  const only = instance("only", "card-a");
  const current = state([only]);
  const descriptor = structuredRuntimeAfterDamageDeckDiscard(
    current,
    { card_id: "test-deck-discarder" },
    1,
  );
  assert(descriptor);

  const result = runtimeV02ResolveAfterDamageDeckDiscard(
    current,
    1,
    descriptor,
    { uid: "source-uid", card_id: "test-deck-discarder" },
    true,
  );
  equal(result.moved_count, 1);
  equal((current.players as any)["2"].deck.length, 0);
  equal((current.players as any)["2"].discard[0], only);
  equal((current as any).deckout_loser, undefined);
});

Deno.test("structured attack deck-discard owner fails closed after recognizing malformed family", () => {
  const current = state();
  (current.card_index as any)["test-deck-discarder"].definition_v0_2 = sourceDefinition({ reveal: "private" });
  throws(
    () => structuredRuntimeAfterDamageDeckDiscard(current, { card_id: "test-deck-discarder" }, 1),
    "tcg_v0_2_attack_deck_discard_reveal_unsupported:pressure-break",
  );
});
