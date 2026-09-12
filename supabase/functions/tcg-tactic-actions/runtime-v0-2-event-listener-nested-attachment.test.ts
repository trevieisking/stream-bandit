import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateCreatureEvolvedEvent,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02CurrentTurnEssenceAttachmentEvents } from "../_shared/tcg-match-essence-attachment-event-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

type Inst = {
  uid: string;
  card_id: string;
  attached_turn?: number;
  effect_flags?: Record<string, unknown>;
};

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

function inst(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function creatureDefinition(
  id: string,
  ability: Record<string, unknown> | null = null,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element: "Volt",
    creature: {
      stage: "Teen",
      hp: 160,
      withdrawal: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function attachedEssenceDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "test-trigger-essence",
    name: "Test Trigger Essence",
    card_family: "Essence",
    element: "Volt",
    creature: null,
    essence: {
      subtype: "Basic",
      provides: [{ element: "Volt", amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      listeners: [{
        id: "test-nested-attach-shield",
        event: "essence_attached",
        timing: "any",
        limit: null,
        requirements: {
          all: [
            { predicate: "source_is_self" },
            { predicate: "event_origin_zone_is", zone: "hand" },
            { predicate: "event_attachment_target_is_source" },
            { predicate: "target_damaged", target: "$attached_creature" },
          ],
        },
        steps: [{ op: "ADD_SHIELD", target: "$attached_creature", amount: 10 }],
      }],
      continuous: [],
      lifecycle: null,
    },
    tactic: null,
  };
}

function rootAbility(afterAttach: Record<string, unknown>) {
  return {
    id: "test-root-attach",
    name: "test-root-attach",
    mode: "triggered",
    event: "creature_evolved",
    timing: "own_turn",
    limit: null,
    requirements: { all: [{ predicate: "event_subject_is_source" }] },
    costs: [],
    steps: [
      {
        op: "ATTACH_ESSENCE_FROM_ZONE",
        player: "self",
        zone: "hand",
        selection: {
          min: 1,
          max: 1,
          filters: {
            card_family: "Essence",
            essence_subtype: "Basic",
            element: "Volt",
          },
        },
        target: "$source_creature",
        manual_attachment: false,
      },
      afterAttach,
    ],
  };
}

function field(card: Inst, damage = 0, essence: Inst[] = []) {
  return {
    stack: [card],
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
    entered_turn: 6,
    evolved_turn: 7,
  };
}

function stateWith(
  damage: number,
  afterAttach: Record<string, unknown>,
  oldAttached: Inst[] = [],
): Record<string, unknown> {
  const sourceDefinition = creatureDefinition(
    "test-source-creature",
    rootAbility(afterAttach),
  );
  const essenceDefinition = attachedEssenceDefinition();
  const ownVanguardDefinition = creatureDefinition("test-own-vanguard");
  const opponentVanguardDefinition = creatureDefinition("test-opponent-vanguard");
  const definitions = [
    sourceDefinition,
    essenceDefinition,
    ownVanguardDefinition,
    opponentVanguardDefinition,
  ];
  const cardIndex = Object.fromEntries(
    definitions.map((definition) => [
      definition.id,
      { definition_v0_2: definition },
    ]),
  );
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    turn_flags: {},
    card_index: cardIndex,
    realm: null,
    players: {
      "1": {
        vanguard: field(inst("own-vanguard-uid", "test-own-vanguard")),
        reserve: [
          field(
            inst("source-creature-uid", "test-source-creature"),
            damage,
            oldAttached,
          ),
          null,
          null,
          null,
        ],
        hand: [inst("new-essence-uid", "test-trigger-essence")],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field(inst("opponent-vanguard-uid", "test-opponent-vanguard")),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function beginRoot(state: Record<string, unknown>) {
  const event = runtimeV02CreateCreatureEvolvedEvent(
    state,
    1,
    "source-creature-uid",
    "reserve",
    0,
  );
  return runtimeV02BeginEventListenerContinuation(state, [event]);
}

function resolveAttachment(state: Record<string, unknown>) {
  const pending = beginRoot(state);
  equal(pending.status, "player_choice_required", "root attachment must pause for choice");
  equal(pending.pending_choice?.kind, "attach_essence", "root pending choice must be attachment");
  assert(pending.pending_choice, "attachment choice must exist");
  return runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice.id,
    ["card:new-essence-uid"],
  );
}

Deno.test("effect-driven attachment appends nested essence_attached work to the same continuation and freezes positive eligibility", () => {
  const state = stateWith(
    20,
    { op: "HEAL", target: "$source_creature", amount: 20 },
  );
  const done = resolveAttachment(state);
  equal(done.status, "complete", "nested attachment flow must complete in one continuation");
  const source = (state.players as any)["1"].reserve[0];
  equal(source.damage, 0, "parent listener must heal after the attachment snapshot");
  equal(source.shield, 10, "nested listener must remain eligible from trigger-time damaged snapshot");
  equal(source.essence.length, 1, "selected Essence must remain attached");
  equal(source.essence[0].uid, "new-essence-uid", "wrong Essence attached");
  equal(done.processed_listener_keys.length, 2, "root and nested listener must each resolve once");
  equal((state as any).runtime_v0_2_event_listener_continuation, undefined, "completed flow must clear the single continuation");
  equal((state as any).pending_event_listener_choice, undefined, "completed flow must clear pending choice state");
  const events = runtimeV02CurrentTurnEssenceAttachmentEvents(state, 1);
  equal(events.length, 1, "effect-driven attachment must record one canonical receipt");
  equal(events[0].source_card_uid, "new-essence-uid", "receipt must bind exact attached instance");
  equal(events[0].origin_zone, "hand", "receipt must preserve attachment origin");
  equal(events[0].attachment_kind, "normal", "ordinary effect-driven attachment kind must remain normal");
});

Deno.test("effect-driven nested listener stays ineligible when trigger-time target was undamaged even if parent later damages it", () => {
  const state = stateWith(
    0,
    {
      op: "DIRECT_DAMAGE",
      target: "$source_creature",
      amount: 10,
      damage_class: "effect",
    },
  );
  const done = resolveAttachment(state);
  equal(done.status, "complete", "negative snapshot flow must complete");
  const source = (state.players as any)["1"].reserve[0];
  equal(source.damage, 10, "parent listener must damage after attachment snapshot");
  equal(source.shield, 0, "later damage must not retroactively make nested listener eligible");
  equal(done.processed_listener_keys.length, 1, "only root listener should resolve when nested trigger was ineligible");
  const events = runtimeV02CurrentTurnEssenceAttachmentEvents(state, 1);
  equal(events.length, 1, "canonical attachment receipt must still be recorded");
});

Deno.test("source_is_self binds the newly attached Essence instance so an older same-controller copy cannot cross-trigger", () => {
  const old = inst("old-essence-uid", "test-trigger-essence");
  old.attached_turn = 6;
  const state = stateWith(
    20,
    { op: "HEAL", target: "$source_creature", amount: 20 },
    [old],
  );
  const done = resolveAttachment(state);
  equal(done.status, "complete", "exact-source flow must complete");
  const source = (state.players as any)["1"].reserve[0];
  equal(source.essence.length, 2, "old and newly attached Essence instances must coexist");
  equal(source.shield, 10, "only the newly attached exact source instance may trigger");
  equal(done.processed_listener_keys.length, 2, "root plus exactly one nested listener must resolve");
  assert(
    done.processed_listener_keys.some((key) => key.includes("new-essence-uid")),
    "newly attached instance receipt must resolve",
  );
  assert(
    !done.processed_listener_keys.some((key) => key.includes("old-essence-uid")),
    "older same-controller Essence must not cross-trigger",
  );
});
