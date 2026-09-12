import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateCreatureEnteredPlayEvent,
  runtimeV02PendingEventListenerChoiceView,
  runtimeV02PrivateEventInspectionView,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02PrivateRewardInspectionView } from "../_shared/tcg-match-reward-inspection-v0-2.ts";

function assert(
  condition: unknown,
  message = "assertion failed",
): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(
  actual: unknown,
  expected: unknown,
  message = "values differ",
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}: expected ${String(expected)}, got ${String(actual)}`,
    );
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

type Ability = Record<string, unknown>;
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

function creatureDefinition(
  id: string,
  name: string,
  element: string,
  ability: Ability | null = null,
  withdrawal = 1,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element,
    creature: {
      stage: "Baby",
      withdrawal,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function tacticDefinition(
  id: string,
  name: string,
  subtype: string,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Tactic",
    element: "Volt",
    creature: null,
    essence: null,
    tactic: {
      subtype,
      program: { steps: [] },
      listeners: [],
      continuous: [],
    },
  };
}

function instance(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function field(card: Inst, damage = 0) {
  return {
    stack: [card],
    essence: [],
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
    entered_turn: 7,
    evolved_turn: -1,
  };
}

function ability(
  id: string,
  requirements: Record<string, unknown>,
  steps: Record<string, unknown>[],
): Ability {
  return {
    id,
    name: id,
    mode: "triggered",
    event: "creature_entered_play",
    timing: "build",
    limit: null,
    requirements,
    costs: [],
    steps,
  };
}

function baseState(
  sourceDefinition: Record<string, unknown>,
  options: {
    sourceDamage?: number;
    vanguardDamage?: number;
    extraReserve?: Array<
      { inst: Inst; definition: Record<string, unknown>; damage?: number }
    >;
    deck?: Inst[];
    deckDefinitions?: Record<string, unknown>[];
    discard?: Inst[];
    discardDefinitions?: Record<string, unknown>[];
    rewards?: Inst[];
    rewardDefinitions?: Record<string, unknown>[];
    opponentDeck?: Inst[];
    opponentDeckDefinitions?: Record<string, unknown>[];
    vanguardConditions?: { control?: string | null; modifier?: string | null };
  } = {},
): Record<string, unknown> {
  const source = instance("source-uid", String(sourceDefinition.id));
  const ownVanguard = instance("own-vanguard-uid", "test-own-vanguard");
  const opponentVanguard = instance(
    "opponent-vanguard-uid",
    "test-opponent-vanguard",
  );
  const definitions = [
    sourceDefinition,
    creatureDefinition(
      "test-own-vanguard",
      "Own Vanguard",
      String(sourceDefinition.element || "Gale"),
      null,
      2,
    ),
    creatureDefinition("test-opponent-vanguard", "Opponent Vanguard", "Shade"),
    ...(options.deckDefinitions || []),
    ...(options.discardDefinitions || []),
    ...(options.rewardDefinitions || []),
    ...(options.opponentDeckDefinitions || []),
    ...(options.extraReserve || []).map((entry) => entry.definition),
  ];
  const cardIndex = Object.fromEntries(definitions.map((definition) => [
    String(definition.id),
    { definition_v0_2: definition },
  ]));
  const reserve: unknown[] = [
    field(source, options.sourceDamage || 0),
    null,
    null,
    null,
  ];
  for (const [index, entry] of (options.extraReserve || []).entries()) {
    reserve[index + 1] = field(entry.inst, entry.damage || 0);
  }
  const vanguard: any = field(ownVanguard, options.vanguardDamage || 0);
  vanguard.conditions.control = options.vanguardConditions?.control || null;
  vanguard.conditions.modifier = options.vanguardConditions?.modifier || null;
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    card_index: cardIndex,
    realm: null,
    players: {
      "1": {
        vanguard,
        reserve,
        hand: [],
        deck: options.deck || [],
        discard: options.discard || [],
        rewards: options.rewards || [],
      },
      "2": {
        vanguard: field(opponentVanguard),
        reserve: [null, null, null, null],
        hand: [],
        deck: options.opponentDeck || [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function begin(state: Record<string, unknown>) {
  const event = runtimeV02CreateCreatureEnteredPlayEvent(
    state,
    1,
    "source-uid",
    0,
  );
  return runtimeV02BeginEventListenerContinuation(state, [event]);
}

Deno.test("creature-entered Whiffin installs one source-agnostic withdrawal modifier", () => {
  const source = creatureDefinition(
    "gale-whiffin",
    "Whiffin",
    "Gale",
    ability("featherdraft", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "SET_WITHDRAWAL_MODIFIER",
      target: "$current_friendly_vanguard",
      mode: "delta",
      amount: -1,
      minimum: 0,
      duration: {
        expires_on: ["end_of_turn"],
        max_uses: 1,
        consume_on: "legal_voluntary_withdrawal_declared",
      },
    }]),
  );
  const state = baseState(source);
  const result = begin(state);
  equal(result.status, "complete");
  equal(
    (state.players as any)["1"].vanguard.flags.lifecycle_withdrawal_cost.value,
    1,
  );
  equal(result.processed_listener_keys.length, 1);
});

Deno.test("Moonbit Reward inspection is a private resumable choice", () => {
  const reward = instance("reward-uid", "test-reward");
  const source = creatureDefinition(
    "astral-moonbit",
    "Moonbit",
    "Astral",
    ability("moon-glimpse", {
      all: [
        { predicate: "source_is_self" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "INSPECT_ZONE",
      player: "self",
      zone: "rewards",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "controller_private",
      return_policy: "same_position",
      as: "inspected_rewards",
    }]),
  );
  const state = baseState(source, {
    rewards: [reward],
    rewardDefinitions: [
      tacticDefinition("test-reward", "Hidden Reward", "Device"),
    ],
  });
  const pending = begin(state);
  equal(pending.status, "player_choice_required");
  equal(
    (runtimeV02PendingEventListenerChoiceView(pending.pending_choice, 2) as any)
      .waiting,
    true,
  );
  throws(
    () =>
      runtimeV02ResolveEventListenerChoice(
        state,
        2,
        pending.pending_choice!.id,
        ["reward:0"],
      ),
    "tcg_v0_2_event_listener_choice_not_yours",
  );
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["reward:0"],
  );
  equal(complete.status, "complete");
  equal(((state.players as any)["1"].rewards as unknown[]).length, 1);
  equal(
    runtimeV02PrivateRewardInspectionView(state, 1)?.cards[0].card_id,
    "test-reward",
  );
  equal(runtimeV02PrivateRewardInspectionView(state, 2), null);
});

Deno.test("Stardot top-card choice moves the chosen card without replaying LOOK_TOP", () => {
  const top = instance("top-uid", "test-top");
  const next = instance("next-uid", "test-next");
  const source = creatureDefinition(
    "astral-stardot",
    "Stardot",
    "Astral",
    ability("star-sense", {
      all: [
        { predicate: "source_is_self" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [
      { op: "LOOK_TOP", player: "self", count: 1, as: "looked" },
      {
        op: "CHOOSE_FROM_SET",
        source: "$looked",
        min: 0,
        max: 1,
        as: "bottom",
      },
      { op: "MOVE_CARDS", player: "self", cards: "$bottom", to: "deck_bottom" },
      {
        op: "RETURN_REMAINDER_TO_DECK_TOP",
        player: "self",
        source: "$looked",
        except: "$bottom",
        order: "preserve",
      },
    ]),
  );
  const state = baseState(source, {
    deck: [top, next],
    deckDefinitions: [
      tacticDefinition("test-top", "Top", "Device"),
      tacticDefinition("test-next", "Next", "Device"),
    ],
  });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "choose_from_set");
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["card:top-uid"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].deck[0].uid, "next-uid");
  equal((state.players as any)["1"].deck[1].uid, "top-uid");
  equal(
    runtimeV02PrivateEventInspectionView(state, 1)?.cards[0].card_id,
    "test-top",
  );
  equal(runtimeV02PrivateEventInspectionView(state, 2), null);
});

Deno.test("Cinderburrow selects a damaged Ember Creature and emits a canonical heal packet", () => {
  const damaged = instance("damaged-uid", "test-damaged-ember");
  const source = creatureDefinition(
    "ember-cinderburrow",
    "Cinderburrow",
    "Ember",
    ability("ash-tunnel", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "IF",
      when: {
        predicate: "legal_card_available",
        controller: "self",
        zone: "field",
        filters: {
          card_family: "Creature",
          element: "Ember",
          damaged: true,
        },
      },
      then: [
        {
          op: "SELECT_CREATURE",
          controller: "self",
          zone: "field",
          count: 1,
          filters: { element: "Ember", damaged: true },
          as: "heal_target",
        },
        { op: "HEAL", target: "$heal_target", amount: 10 },
      ],
    }]),
  );
  const state = baseState(source, {
    extraReserve: [{
      inst: damaged,
      definition: creatureDefinition(
        "test-damaged-ember",
        "Damaged Ember",
        "Ember",
      ),
      damage: 30,
    }],
  });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "select_creature");
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["creature:damaged-uid"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].reserve[1].damage, 20);
  equal(complete.emitted_heal_packet_ids.length, 1);
});

Deno.test("Gustfox optional switch delegates to the canonical atomic switch owner", () => {
  const source = creatureDefinition(
    "gale-gustfox",
    "Gustfox",
    "Gale",
    ability("quickstep", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "OPTIONAL",
      player: "self",
      steps: [{
        op: "SWITCH_WITH_VANGUARD",
        player: "self",
        target: "$source_creature",
        action_kind: "effect_switch",
      }],
    }]),
  );
  const state = baseState(source);
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "optional");
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["accept"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.stack[0].uid, "source-uid");
  equal(complete.emitted_movement_events.length, 2);
  equal(complete.emitted_movement_events[0].event, "moved_to_reserve");
  equal(complete.emitted_movement_events[1].event, "became_vanguard");
});

Deno.test("declining an optional listener completes without replaying its prompt", () => {
  const source = creatureDefinition(
    "gale-gustfox",
    "Gustfox",
    "Gale",
    ability("quickstep", {
      all: [{ predicate: "event_subject_is_source" }],
    }, [{
      op: "OPTIONAL",
      player: "self",
      steps: [{
        op: "SWITCH_WITH_VANGUARD",
        player: "self",
        target: "$source_creature",
        action_kind: "effect_switch",
      }],
    }]),
  );
  const state = baseState(source);
  const pending = begin(state);
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["decline"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.stack[0].uid, "own-vanguard-uid");
  equal(complete.emitted_movement_events.length, 0);
});

Deno.test("Zephyrhare selects another Gale Reserve before its atomic switch", () => {
  const leapTarget = instance("leap-target-uid", "test-leap-target");
  const source = creatureDefinition(
    "gale-zephyrhare",
    "Zephyrhare",
    "Gale",
    ability("windbound-leap", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
        { predicate: "reserve_count_at_least", controller: "self", count: 2 },
      ],
    }, [{
      op: "OPTIONAL",
      player: "self",
      steps: [
        {
          op: "SELECT_CREATURE",
          controller: "self",
          zone: "reserve",
          count: 1,
          filters: { element: "Gale", exclude_source: true },
          as: "leap_target",
        },
        {
          op: "SWITCH_WITH_VANGUARD",
          player: "self",
          target: "$leap_target",
          action_kind: "effect_switch",
        },
      ],
    }]),
  );
  const state = baseState(source, {
    extraReserve: [{
      inst: leapTarget,
      definition: creatureDefinition(
        "test-leap-target",
        "Leap Target",
        "Gale",
      ),
    }],
  });
  const optional = begin(state);
  const chooseCreature = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    optional.pending_choice!.id,
    ["accept"],
  );
  equal(chooseCreature.pending_choice?.kind, "select_creature");
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    chooseCreature.pending_choice!.id,
    ["creature:leap-target-uid"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.stack[0].uid, "leap-target-uid");
  equal(complete.emitted_movement_events.length, 2);
});

Deno.test("Gloamkin inspects only the controller-private opponent deck top", () => {
  const opponentTop = instance("opponent-top-uid", "test-opponent-top");
  const source = creatureDefinition(
    "shade-gloamkin",
    "Gloamkin",
    "Shade",
    ability("gloom-glimpse", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "INSPECT_ZONE",
      player: "opponent",
      zone: "deck_top",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "controller_private",
      return_policy: "same_position",
      as: "glimpse",
    }]),
  );
  const state = baseState(source, {
    opponentDeck: [opponentTop],
    opponentDeckDefinitions: [
      tacticDefinition("test-opponent-top", "Opponent Secret", "Device"),
    ],
  });
  const complete = begin(state);
  equal(complete.status, "complete");
  equal((state.players as any)["2"].deck[0].uid, "opponent-top-uid");
  const privateView = runtimeV02PrivateEventInspectionView(state, 1);
  equal(privateView?.zone_owner_seat, 2);
  equal(privateView?.cards[0].card_id, "test-opponent-top");
  equal(runtimeV02PrivateEventInspectionView(state, 2), null);
});

Deno.test("Bloomhare uses canonical healing only when another friendly Grove exists", () => {
  const other = instance("other-grove-uid", "test-other-grove");
  const source = creatureDefinition(
    "grove-bloomhare",
    "Bloomhare",
    "Grove",
    ability("spring-growth", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "IF",
      when: {
        all: [
          {
            predicate: "friendly_other_creature_matches",
            filters: { element: "Grove" },
          },
          {
            predicate: "target_damaged",
            target: "$current_friendly_vanguard",
          },
        ],
      },
      then: [{
        op: "HEAL",
        target: "$current_friendly_vanguard",
        amount: 20,
      }],
    }]),
  );
  const state = baseState(source, {
    vanguardDamage: 40,
    extraReserve: [{
      inst: other,
      definition: creatureDefinition(
        "test-other-grove",
        "Other Grove",
        "Grove",
      ),
    }],
  });
  const complete = begin(state);
  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.damage, 20);
  equal(complete.emitted_heal_packet_ids.length, 1);
});

Deno.test("Vinecoil optional clear removes only a legal current condition", () => {
  const source = creatureDefinition(
    "grove-vinecoil",
    "Vinecoil",
    "Grove",
    ability("binding-growth", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
        { predicate: "event_phase_is", phase: "build" },
      ],
    }, [{
      op: "OPTIONAL",
      player: "self",
      steps: [{
        op: "CHOOSE_AND_CLEAR_CONDITION",
        target: "$current_friendly_vanguard",
        allowed: ["Rooted", "Crushed"],
      }],
    }]),
  );
  const state = baseState(source, {
    vanguardConditions: { control: "Rooted", modifier: "Crushed" },
  });
  const optional = begin(state);
  const chooseCondition = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    optional.pending_choice!.id,
    ["accept"],
  );
  equal(chooseCondition.pending_choice?.kind, "clear_condition");
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    chooseCondition.pending_choice!.id,
    ["condition:Rooted"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.conditions.control, null);
  equal((state.players as any)["1"].vanguard.conditions.modifier, "Crushed");
});

Deno.test("Tinkit chooses a Device from discard and moves it to deck bottom", () => {
  const device = instance("device-uid", "test-device");
  const source = creatureDefinition(
    "volt-tinkit",
    "Tinkit",
    "Volt",
    ability("salvage-spark", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_origin_zone_is", zone: "hand" },
        { predicate: "event_destination_zone_is", zone: "reserve" },
      ],
    }, [
      {
        op: "SELECT_CARDS",
        player: "self",
        zone: "discard",
        selection: {
          min: 0,
          max: 1,
          filters: {
            card_family: "Tactic",
            tactic_subtype: "Device",
          },
        },
        as: "salvaged",
      },
      {
        op: "MOVE_CARDS",
        player: "self",
        cards: "$salvaged",
        to: "deck_bottom",
        order: "preserve",
      },
    ]),
  );
  const state = baseState(source, {
    discard: [device],
    discardDefinitions: [
      tacticDefinition("test-device", "Device", "Device"),
    ],
  });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "select_cards");
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["card:device-uid"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].discard.length, 0);
  equal((state.players as any)["1"].deck[0].uid, "device-uid");
});

Deno.test("unmarked legacy matches preserve raw play behavior", () => {
  const source = creatureDefinition(
    "gale-whiffin",
    "Whiffin",
    "Gale",
    ability("featherdraft", {
      all: [{ predicate: "event_subject_is_source" }],
    }, [{
      op: "SET_WITHDRAWAL_MODIFIER",
      target: "$current_friendly_vanguard",
      mode: "delta",
      amount: -1,
      minimum: 0,
      duration: { expires_on: ["end_of_turn"], max_uses: 1 },
    }]),
  );
  const state = baseState(source);
  delete state.runtime_registry_v0_2;
  const event = runtimeV02CreateCreatureEnteredPlayEvent(
    state,
    1,
    "source-uid",
    0,
  );
  const complete = runtimeV02BeginEventListenerContinuation(state, [event]);
  equal(complete.status, "complete");
  equal(
    (state.players as any)["1"].vanguard.flags.lifecycle_withdrawal_cost,
    undefined,
  );
});
