import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { structuredRuntimeAttachmentAttackBonus } from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

type Inst = { uid: string; card_id: string };

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

function creatureDefinition(
  id: string,
  element: string,
  ability: Record<string, unknown> | null = null,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    creature: {
      stage: "Teen",
      hp: 180,
      withdrawal: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function essenceDefinition(
  id: string,
  element: string,
  listeners: Record<string, unknown>[] = [],
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Essence",
    element,
    creature: null,
    essence: {
      subtype: "Basic",
      provides: [{ element, amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      listeners,
      continuous: [],
      lifecycle: null,
    },
    tactic: null,
  };
}

function field(top: Inst, essence: Inst[], damage = 0) {
  return {
    stack: [top],
    essence: [...essence],
    relic: null,
    damage,
    shield: 0,
    condition: null,
    conditions: {
      scorched: false,
      venomed: 0,
      control: null,
      modifier: null,
    },
    flags: {},
  };
}

function stateWith(
  sourceDefinition: Record<string, unknown>,
  essences: Array<{ inst: Inst; definition: Record<string, unknown> }>,
  damage = 0,
): Record<string, unknown> {
  const source = { uid: "source-creature-uid", card_id: String(sourceDefinition.id) };
  const definitions = [sourceDefinition, ...essences.map((entry) => entry.definition)];
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    turn_flags: {},
    realm: null,
    card_index: Object.fromEntries(
      definitions.map((definition) => [
        String(definition.id),
        { definition_v0_2: definition },
      ]),
    ),
    players: {
      "1": {
        vanguard: field(source, essences.map((entry) => entry.inst), damage),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function attachmentEvent(
  subject: Inst,
  attachmentKind = "normal",
  eventId = `attach:${subject.uid}`,
): RuntimeV02EventListenerEvent {
  return {
    event_id: eventId,
    event: "essence_attached",
    subject_uid: subject.uid,
    subject_card_id: subject.card_id,
    controller_seat: 1,
    origin_zone: "hand",
    destination_zone: "field",
    destination_index: null,
    phase: "build",
    source_action_id: "attach_essence",
    source_card_uid: subject.uid,
    action_kind: "essence_attachment",
    turn_seq: 7,
    attachment_target_uid: "source-creature-uid",
    attachment_kind: attachmentKind,
  };
}

function modifierRecords(state: Record<string, unknown>): Record<string, unknown>[] {
  const source = (state.players as any)["1"].vanguard;
  const raw = source.flags?.runtime_v0_2_attack_modifiers;
  assert(Array.isArray(raw), "canonical attack modifier ledger must exist");
  return raw;
}

Deno.test("Smolder-style essence_attached listener delegates +10 next-attack state to the canonical attack modifier owner", () => {
  const listener = {
    id: "smolder-attach-pressure",
    event: "essence_attached",
    timing: "any",
    limit: null,
    requirements: {
      all: [
        { predicate: "source_is_self" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "target_element_is", target: "$attached_creature", element: "Ember" },
        { predicate: "target_damaged", target: "$attached_creature" },
      ],
    },
    steps: [{
      op: "ADD_ATTACK_DAMAGE_MODIFIER",
      target: "$attached_creature",
      amount: 10,
      duration: {
        expires_on: ["end_of_turn"],
        max_uses: 1,
        consume_on: "legal_attack_declared",
      },
    }],
  };
  const smolder = { uid: "smolder-uid", card_id: "test-smolder" };
  const state = stateWith(
    creatureDefinition("test-ember-creature", "Ember"),
    [{ inst: smolder, definition: essenceDefinition("test-smolder", "Ember", [listener]) }],
    20,
  );

  const flow = runtimeV02BeginEventListenerContinuation(state, [attachmentEvent(smolder)]);
  equal(flow.status, "complete", "Smolder listener must complete");
  equal(flow.processed_listener_keys.length, 1, "Smolder listener must resolve once");

  const modifiers = modifierRecords(state);
  equal(modifiers.length, 1, "exactly one attack modifier must be stored");
  equal(modifiers[0].source_uid, "smolder-uid", "modifier must bind exact Essence instance");
  equal(modifiers[0].amount, 10, "Smolder amount must remain +10");
  equal(modifiers[0].max_uses, 1, "Smolder must remain one-use");
  equal(
    structuredRuntimeAttachmentAttackBonus(state, (state.players as any)["1"].vanguard, 7),
    10,
    "attack owner must expose the stored +10 bonus",
  );
});

Deno.test("Surge-style essence_attached listener delegates its full-turn +20 through the same attack modifier system", () => {
  const listener = {
    id: "surge-attach-burst",
    event: "essence_attached",
    timing: "any",
    limit: null,
    requirements: {
      all: [
        { predicate: "source_is_self" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "target_element_is", target: "$attached_creature", element: "Volt" },
      ],
    },
    steps: [{
      op: "ADD_ATTACK_DAMAGE_MODIFIER",
      target: "$attached_creature",
      amount: 20,
      duration: {
        expires_on: ["end_of_turn"],
        max_uses: null,
      },
    }],
  };
  const surge = { uid: "surge-uid", card_id: "test-surge" };
  const state = stateWith(
    creatureDefinition("test-volt-creature", "Volt"),
    [{ inst: surge, definition: essenceDefinition("test-surge", "Volt", [listener]) }],
  );

  const flow = runtimeV02BeginEventListenerContinuation(state, [attachmentEvent(surge)]);
  equal(flow.status, "complete", "Surge listener must complete");
  const modifiers = modifierRecords(state);
  equal(modifiers.length, 1, "Surge must add one modifier record");
  equal(modifiers[0].source_uid, "surge-uid", "Surge modifier must bind exact Essence UID");
  equal(modifiers[0].amount, 20, "Surge amount must remain +20");
  equal(modifiers[0].max_uses, null, "Surge must remain reusable for the turn");
  equal(
    structuredRuntimeAttachmentAttackBonus(state, (state.players as any)["1"].vanguard, 7),
    20,
    "attack owner must expose the stored +20 bonus",
  );
});

Deno.test("Power Rail-style Creature ability uses the same attack modifier owner and its once-per-turn card-instance limit", () => {
  const ability = {
    id: "power-rail",
    name: "Power Rail",
    mode: "triggered",
    event: "essence_attached",
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "card_instance" },
    requirements: {
      all: [
        { predicate: "event_attachment_target_is_source" },
        {
          any: [
            { predicate: "event_attachment_kind_is", kind: "temporary" },
            { predicate: "event_attachment_kind_is", kind: "borrowed" },
          ],
        },
        { predicate: "event_subject_matches", filters: { element: "Volt" } },
      ],
    },
    costs: [],
    steps: [{
      op: "ADD_ATTACK_DAMAGE_MODIFIER",
      target: "$source_creature",
      amount: 20,
      duration: {
        expires_on: ["end_of_turn"],
        max_uses: 1,
        consume_on: "legal_attack_declared",
      },
    }],
  };
  const first = { uid: "temp-volt-1", card_id: "test-volt-essence" };
  const second = { uid: "temp-volt-2", card_id: "test-volt-essence" };
  const state = stateWith(
    creatureDefinition("test-railhorn", "Volt", ability),
    [
      { inst: first, definition: essenceDefinition("test-volt-essence", "Volt") },
      { inst: second, definition: essenceDefinition("test-volt-essence", "Volt") },
    ],
  );

  const flow = runtimeV02BeginEventListenerContinuation(state, [
    attachmentEvent(first, "temporary", "attach:rail:1"),
    attachmentEvent(second, "temporary", "attach:rail:2"),
  ]);
  equal(flow.status, "complete", "Power Rail events must complete");
  equal(flow.processed_listener_keys.length, 1, "Power Rail card-instance limit must allow only one trigger this turn");

  const modifiers = modifierRecords(state);
  equal(modifiers.length, 1, "Power Rail must store only one modifier record");
  equal(modifiers[0].source_uid, "source-creature-uid", "Power Rail modifier source must be the Creature instance");
  equal(modifiers[0].amount, 20, "Power Rail amount must remain +20");
  equal(modifiers[0].max_uses, 1, "Power Rail must remain one-use");
});
