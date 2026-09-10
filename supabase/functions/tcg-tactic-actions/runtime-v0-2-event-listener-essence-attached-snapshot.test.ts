import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
} from "../_shared/tcg-match-essence-attachment-event-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

type Inst = { uid: string; card_id: string };
type Listener = Record<string, unknown>;

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

function inst(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function triggeredAbility(
  id: string,
  requirements: Record<string, unknown>,
  steps: Record<string, unknown>[],
): Listener {
  return {
    id,
    name: id,
    mode: "triggered",
    event: "essence_attached",
    timing: "any",
    limit: null,
    requirements,
    costs: [],
    steps,
  };
}

function essenceListener(
  id: string,
  requirements: Record<string, unknown>,
  steps: Record<string, unknown>[],
): Listener {
  return {
    id,
    event: "essence_attached",
    timing: "any",
    limit: null,
    requirements,
    steps,
  };
}

function creatureDefinition(
  id: string,
  element: string,
  ability: Listener | null = null,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    creature: {
      stage: "Standalone",
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
  listeners: Listener[],
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
      subtype: "Special",
      provides: [{ element, amount: 1 }],
      listeners,
      continuous: [],
      lifecycle: null,
    },
    tactic: null,
  };
}

function field(card: Inst, essence: Inst[] = [], damage = 0) {
  return {
    stack: [card],
    essence,
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

function stateFor(
  targetAbility: Listener,
  essenceDefinitions: Record<string, ReturnType<typeof essenceDefinition>>,
  attached: Inst[],
  damage: number,
): Record<string, unknown> {
  const target = inst("target-uid", "test-target");
  const ownVanguard = inst("own-vanguard-uid", "test-own-vanguard");
  const opponentVanguard = inst("opponent-vanguard-uid", "test-opponent-vanguard");
  const definitions = [
    creatureDefinition("test-target", "Tide", targetAbility),
    creatureDefinition("test-own-vanguard", "Tide"),
    creatureDefinition("test-opponent-vanguard", "Shade"),
    ...Object.values(essenceDefinitions),
  ];
  return {
    turn_seq: 11,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    card_index: Object.fromEntries(definitions.map((definition) => [
      definition.id,
      { definition_v0_2: definition },
    ])),
    realm: null,
    turn_flags: { "1": {}, "2": {} },
    players: {
      "1": {
        vanguard: field(ownVanguard, [inst("payment-uid", "payment-essence")]),
        reserve: [field(target, attached, damage), null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field(opponentVanguard),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function addPaymentDefinition(
  definitions: Record<string, ReturnType<typeof essenceDefinition>>,
): void {
  definitions["payment-essence"] = essenceDefinition(
    "payment-essence",
    "Tide",
    [],
  );
}

function beginAttachment(
  state: Record<string, unknown>,
  attached: Inst,
) {
  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    1,
    "target-uid",
    attached,
    "hand",
    "manual_essence",
    "normal",
  );
  return runtimeV02BeginEventListenerContinuation(
    state,
    [runtimeV02CreateEssenceAttachedEvent(receipt, { destination_index: 0 })],
  );
}

Deno.test("essence_attached eligible listener stays eligible after an earlier listener heals its target", () => {
  const attached = inst("fresh-essence-uid", "fresh-essence");
  const definitions: Record<string, ReturnType<typeof essenceDefinition>> = {
    "fresh-essence": essenceDefinition("fresh-essence", "Tide", [
      essenceListener(
        "fresh-coat",
        {
          all: [
            { predicate: "source_is_self" },
            { predicate: "target_damaged", target: "$attached_creature" },
          ],
        },
        [{ op: "ADD_SHIELD", target: "$attached_creature", amount: 10 }],
      ),
    ]),
  };
  addPaymentDefinition(definitions);
  const targetAbility = triggeredAbility(
    "first-heal",
    { predicate: "event_attachment_target_is_source" },
    [{ op: "HEAL", target: "$source_creature", amount: 20 }],
  );
  const state = stateFor(targetAbility, definitions, [attached], 20);

  const result = beginAttachment(state, attached);
  equal(result.status, "complete");
  equal((state.players as any)["1"].reserve[0].damage, 0);
  equal((state.players as any)["1"].reserve[0].shield, 10);
  equal(result.processed_listener_keys.length, 2);
  assert(result.processed_listener_keys.some((key) => key.includes("fresh-essence-uid:fresh-coat")));
});

Deno.test("essence_attached ineligible listener is not added after an earlier listener damages its target", () => {
  const attached = inst("fresh-essence-uid", "fresh-essence");
  const definitions: Record<string, ReturnType<typeof essenceDefinition>> = {
    "fresh-essence": essenceDefinition("fresh-essence", "Tide", [
      essenceListener(
        "fresh-coat",
        {
          all: [
            { predicate: "source_is_self" },
            { predicate: "target_damaged", target: "$attached_creature" },
          ],
        },
        [{ op: "ADD_SHIELD", target: "$attached_creature", amount: 10 }],
      ),
    ]),
  };
  addPaymentDefinition(definitions);
  const targetAbility = triggeredAbility(
    "first-damage",
    { predicate: "event_attachment_target_is_source" },
    [{
      op: "DIRECT_DAMAGE",
      target: "$source_creature",
      amount: 10,
      damage_class: "effect",
    }],
  );
  const state = stateFor(targetAbility, definitions, [attached], 0);

  const result = beginAttachment(state, attached);
  equal(result.status, "complete");
  equal((state.players as any)["1"].reserve[0].damage, 10);
  equal((state.players as any)["1"].reserve[0].shield, 0);
  equal(result.processed_listener_keys.length, 1);
  assert(!result.processed_listener_keys.some((key) => key.includes("fresh-coat")));
});

Deno.test("essence_attached exact source identity excludes an older same-controller Essence", () => {
  const older = inst("older-essence-uid", "identity-essence");
  const fresh = inst("fresh-essence-uid", "identity-essence");
  const definitions: Record<string, ReturnType<typeof essenceDefinition>> = {
    "identity-essence": essenceDefinition("identity-essence", "Tide", [
      essenceListener(
        "identity-listener",
        { predicate: "source_is_self" },
        [{ op: "ADD_SHIELD", target: "$attached_creature", amount: 7 }],
      ),
    ]),
  };
  addPaymentDefinition(definitions);
  const targetAbility = triggeredAbility(
    "never",
    { predicate: "event_attachment_target_is_source" },
    [],
  );
  // Make the Creature listener ineligible so this test isolates Essence identity.
  targetAbility.requirements = { not: { predicate: "event_attachment_target_is_source" } };
  const state = stateFor(targetAbility, definitions, [older, fresh], 0);

  const result = beginAttachment(state, fresh);
  equal(result.status, "complete");
  equal((state.players as any)["1"].reserve[0].shield, 7);
  equal(result.processed_listener_keys.length, 1);
  assert(result.processed_listener_keys[0].includes("fresh-essence-uid:identity-listener"));
  assert(!result.processed_listener_keys[0].includes("older-essence-uid"));
});

Deno.test("essence_attached resume consumes the frozen listener program instead of rediscovering registry state", () => {
  const attached = inst("fresh-essence-uid", "fresh-essence");
  const definitions: Record<string, ReturnType<typeof essenceDefinition>> = {
    "fresh-essence": essenceDefinition("fresh-essence", "Tide", [
      essenceListener(
        "frozen-program",
        { predicate: "source_is_self" },
        [{ op: "ADD_SHIELD", target: "$attached_creature", amount: 12 }],
      ),
    ]),
  };
  addPaymentDefinition(definitions);
  const targetAbility = triggeredAbility(
    "pause-first",
    { predicate: "event_attachment_target_is_source" },
    [{
      op: "OPTIONAL",
      player: "self",
      steps: [],
    }],
  );
  const state = stateFor(targetAbility, definitions, [attached], 0);

  const pending = beginAttachment(state, attached);
  equal(pending.status, "player_choice_required");
  equal(pending.pending_choice?.kind, "optional");

  const liveDefinition = ((state.card_index as any)["fresh-essence"].definition_v0_2.essence.listeners[0]);
  liveDefinition.requirements = { not: { predicate: "source_is_self" } };
  liveDefinition.steps = [];

  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["decline"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].reserve[0].shield, 12);
  assert(complete.processed_listener_keys.some((key) => key.includes("fresh-essence-uid:frozen-program")));
});
