import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
} from "../_shared/tcg-match-essence-attachment-event-v0-2.ts";
import { runtimeConditions } from "../_shared/tcg-match-condition-engine-v0-2.ts";

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

function creatureDefinition(id: string, element: string) {
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
      ability: null,
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
      attach_requirements: [],
      on_attach: [],
      continuous: [],
      lifecycle: null,
      listeners,
    },
    tactic: null,
  };
}

function field(
  card: Inst,
  essence: Inst[] = [],
  conditions: Record<string, unknown> = {
    scorched: false,
    venomed: 0,
    control: null,
    modifier: null,
  },
) {
  return {
    stack: [card],
    essence,
    relic: null,
    damage: 0,
    shield: 0,
    condition: conditions.modifier ?? conditions.control ?? null,
    conditions,
    flags: {},
  };
}

function stateFor(
  listener: Listener,
  targetElement = "Stone",
  conditions: Record<string, unknown> = {
    scorched: true,
    venomed: 0,
    control: null,
    modifier: "Crushed",
  },
): Record<string, unknown> {
  const attached = inst("fault-essence-uid", "stone-fault-essence");
  const target = inst("target-uid", "stone-target");
  const ownVanguard = inst("own-vanguard-uid", "own-vanguard");
  const opponentVanguard = inst("opponent-vanguard-uid", "opponent-vanguard");
  const definitions = [
    creatureDefinition("stone-target", targetElement),
    creatureDefinition("own-vanguard", "Stone"),
    creatureDefinition("opponent-vanguard", "Shade"),
    essenceDefinition("stone-fault-essence", "Stone", [listener]),
  ];
  return {
    turn_seq: 17,
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
        vanguard: field(ownVanguard),
        reserve: [field(target, [attached], conditions), null, null, null],
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

function beginAttachment(state: Record<string, unknown>) {
  const attached = ((state.players as any)["1"].reserve[0].essence as Inst[])[0];
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

const faultListener: Listener = {
  id: "fault-essence-cleanse",
  event: "essence_attached",
  requirements: {
    all: [
      { predicate: "source_is_self" },
      { predicate: "event_origin_zone_is", zone: "hand" },
      {
        predicate: "target_element_is",
        target: "$attached_creature",
        element: "Stone",
      },
      {
        predicate: "target_has_condition",
        target: "$attached_creature",
        condition: "Crushed",
      },
    ],
  },
  limit: null,
  steps: [
    {
      op: "CLEAR_CONDITION",
      target: "$attached_creature",
      condition: "Crushed",
    },
  ],
};

Deno.test("Stone Fault CLEAR_CONDITION delegates to the canonical condition engine", () => {
  const state = stateFor(faultListener);
  const target = (state.players as any)["1"].reserve[0];

  const result = beginAttachment(state);

  equal(result.status, "complete");
  equal(runtimeConditions(target).modifier, null, "Crushed must clear");
  equal(runtimeConditions(target).scorched, true, "unrelated Scorched must remain");
  equal(target.condition, null, "legacy scalar condition shadow must clear with canonical state");
  assert(
    result.processed_listener_keys.some((key) =>
      key.includes("fault-essence-uid:fault-essence-cleanse")
    ),
    "Fault Essence listener receipt must be recorded",
  );
});

Deno.test("canonical condition choice path clears only the selected condition", () => {
  const choiceListener: Listener = {
    id: "condition-choice-regression",
    event: "essence_attached",
    requirements: { predicate: "source_is_self" },
    limit: null,
    steps: [
      {
        op: "CHOOSE_AND_CLEAR_CONDITION",
        target: "$attached_creature",
        allowed: ["Scorched", "Venomed"],
      },
    ],
  };
  const state = stateFor(choiceListener, "Stone", {
    scorched: true,
    venomed: 20,
    control: null,
    modifier: null,
  });
  const target = (state.players as any)["1"].reserve[0];
  const pending = beginAttachment(state);
  equal(pending.status, "player_choice_required");
  assert(pending.pending_choice, "condition choice must be present");

  const resolved = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice.id,
    ["condition:Scorched"],
  );

  equal(resolved.status, "complete");
  equal(runtimeConditions(target).scorched, false, "selected Scorched must clear");
  equal(runtimeConditions(target).venomed, 20, "unselected Venomed must remain");
  assert(
    resolved.processed_listener_keys.some((key) =>
      key.includes("fault-essence-uid:condition-choice-regression")
    ),
    "choice listener receipt must be recorded",
  );
});
