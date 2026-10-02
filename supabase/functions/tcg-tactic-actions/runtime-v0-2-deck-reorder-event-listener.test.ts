import {
  runtimeV02ApplyDeckReorderWithOccurrence,
  runtimeV02TakeDeckReorderOccurrences,
} from "../_shared/tcg-match-deck-reorder-event-v0-2.ts";
import {
  runtimeV02AdaptDeckReorderOccurrencesForListener,
  runtimeV02BeginEventListenerContinuation,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import {
  runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration,
} from "../_shared/tcg-match-attack-modifier-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function inst(uid: string, card_id: string) { return { uid, card_id }; }

const marker = {
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  registry_sha256: "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
  runtime_authority: false,
  source: "test",
};

function novaListener(extraRequirement: Record<string, unknown> | null = null) {
  return {
    id: "nova-essence-reorder-burst",
    event: "deck_reordered",
    requirements: {
      all: [
        { predicate: "event_controller_is_self" },
        extraRequirement ?? { predicate: "event_count_at_least", count: 2 },
      ],
    },
    limit: { scope: "attachment", count: 1, owner: "attachment" },
    steps: [{
      op: "ADD_ATTACK_DAMAGE_MODIFIER",
      target: "$attached_creature",
      amount: 20,
      duration: {
        expires_on: ["end_of_turn"],
        max_uses: 1,
        consume_on: "legal_attack_declared",
      },
    }],
  };
}
function creatureDefinition(id: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element: "Astral",
    creature: { stage: "Standalone", hp: 180, withdrawal: 1, ability: null, attacks: [] },
    essence: null,
    tactic: null,
  };
}
function essenceDefinition(id: string, requirement: Record<string, unknown> | null = null) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Essence",
    element: "Astral",
    creature: null,
    essence: {
      subtype: "Special",
      provides: [{ element: "Astral", amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      continuous: [],
      lifecycle: null,
      listeners: [novaListener(requirement)],
    },
    tactic: null,
  };
}
function state(requirement: Record<string, unknown> | null = null) {
  const source = inst("creature-1", "test-astral-creature");
  const nova = { ...inst("nova-1", "test-nova"), effect_flags: {} };
  return {
    turn_seq: 9,
    active_seat: 1,
    phase: "play",
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    card_index: {
      "test-astral-creature": { definition_v0_2: creatureDefinition("test-astral-creature") },
      "test-nova": { definition_v0_2: essenceDefinition("test-nova", requirement) },
    },
    players: {
      "1": {
        vanguard: {
          stack: [source],
          essence: [nova],
          relic: null,
          damage: 0,
          shield: 0,
          conditions: { scorched: false, venomed: 0, control: null, modifier: null },
          flags: {},
        },
        reserve: [null, null, null, null],
        deck: [inst("a","a"),inst("b","b"),inst("c","c"),inst("d","d")],
        hand: [], discard: [], rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [inst("x","x"),inst("y","y"),inst("z","z")],
        hand: [], discard: [], rewards: [],
      },
    },
  } as Record<string, any>;
}
function reorder(
  s: Record<string, any>,
  controller: 1 | 2,
  count: number,
  sourceController: 1 | 2 = 1,
) {
  const deck = s.players[String(controller)].deck;
  return runtimeV02ApplyDeckReorderWithOccurrence(
    s,
    deck,
    {
      cause: "effect",
      action_kind: "ability",
      source_action_id: "test-reorder",
      source_card_uid: "source-effect",
      zone: { controller_seat: controller, zone: "deck", owner_card_uid: null },
      card_uids: deck.slice(0, count).map((card: any) => card.uid),
      destination_position: "bottom",
    },
    { source_controller_seat: sourceController, phase: "ability_effect_resolution" },
  );
}
function drain(s: Record<string, any>) {
  const occurrences = runtimeV02TakeDeckReorderOccurrences(s);
  const events = runtimeV02AdaptDeckReorderOccurrencesForListener(s, occurrences);
  return { occurrences, events, flow: runtimeV02BeginEventListenerContinuation(s, events) };
}
function modifiers(s: Record<string, any>) {
  return s.players["1"].vanguard.flags.runtime_v0_2_attack_modifiers || [];
}

Deno.test("deck reorder adapter preserves Card-Zone mutation but never stores reordered card identity", () => {
  const s = state();
  const beforeA = s.players["1"].deck[0];
  const result = reorder(s, 1, 2);
  equal(result.receipt.count, 2);
  equal(s.players["1"].deck.map((x: any) => x.uid), ["c","d","a","b"]);
  assert(Object.is(s.players["1"].deck[2], beforeA), "Card-Zone must preserve instance identity");
  const occurrences = runtimeV02TakeDeckReorderOccurrences(s);
  equal(occurrences.length, 1);
  equal(occurrences[0].count, 2);
  equal(occurrences[0].controller_seat, 1);
  assert(!Object.hasOwn(occurrences[0] as any, "card_uids"), "occurrence must not leak reordered UIDs");
});

Deno.test("Nova-style deck_reordered count 2 adds one canonical +20 next-attack modifier", () => {
  const s = state();
  reorder(s, 1, 2);
  const { events, flow } = drain(s);
  equal(events[0].event, "deck_reordered");
  equal(events[0].count, 2);
  equal(events[0].subject_uid, "deck:1");
  equal(flow.status, "complete");
  equal(flow.processed_listener_keys.length, 1);
  equal(modifiers(s).length, 1);
  equal(modifiers(s)[0].amount, 20);
  const consumed = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    s,
    s.players["1"].vanguard,
    {
      consuming_action_id: "attack-1",
      target_uid: "creature-1",
      turn_seq: 9,
      base_damage: 40,
    },
  );
  equal(consumed?.bonus_damage, 20);
  equal(consumed?.damage, 60);
});

Deno.test("event_count_at_least is the current reorder count, not historical event frequency", () => {
  const s = state();
  reorder(s, 1, 1);
  let result = drain(s);
  equal(result.events[0].count, 1);
  equal(result.flow.processed_listener_keys.length, 0);
  equal(modifiers(s).length, 0);

  reorder(s, 1, 2);
  result = drain(s);
  equal(result.events[0].count, 2);
  equal(result.flow.processed_listener_keys.length, 1);
  equal(modifiers(s).length, 1);
});

Deno.test("Nova-style attachment limit and event controller ownership stay canonical", () => {
  const s = state();
  reorder(s, 1, 2);
  let result = drain(s);
  equal(result.flow.processed_listener_keys.length, 1);
  reorder(s, 1, 2);
  result = drain(s);
  equal(result.flow.processed_listener_keys.length, 0);
  equal(modifiers(s).length, 1);

  const opponent = state();
  reorder(opponent, 2, 2, 1);
  result = drain(opponent);
  equal(result.events[0].controller_seat, 2);
  equal(result.events[0].source_controller_seat, 1);
  equal(result.flow.processed_listener_keys.length, 0);
  equal(modifiers(opponent).length, 0);
});

Deno.test("event_count_at_least rejects undeclared grammar fields", () => {
  const s = state({ predicate: "event_count_at_least", count: 2, window: "turn" });
  reorder(s, 1, 2);
  const occurrences = runtimeV02TakeDeckReorderOccurrences(s);
  const events = runtimeV02AdaptDeckReorderOccurrencesForListener(s, occurrences);
  let message = "";
  try {
    runtimeV02BeginEventListenerContinuation(s, events);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(
    message.includes("tcg_v0_2_event_listener_event_count_field_unsupported:window"),
    "undeclared event_count_at_least field must fail closed",
  );
});
