import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateCreatureEnteredPlayEvent,
  runtimeV02CreateDeviceResolvedEvent,
  runtimeV02CreateEssenceDiscardedEvents,
  runtimeV02PendingEventListenerChoiceView,
  runtimeV02PrivateEventInspectionView,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02ApplyCardZoneTransfer } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";
import { runtimeV02PrivateRewardInspectionView } from "../_shared/tcg-match-reward-inspection-v0-2.ts";
import { runtimeV02ResolveWithdrawalModifierCost } from "../_shared/tcg-match-withdrawal-modifier-v0-2.ts";
import {
  runtimeV02ConditionProtectionCount,
  runtimeV02InstallConditionProtection,
} from "../_shared/tcg-match-condition-protection-v0-2.ts";
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
} from "../_shared/tcg-match-essence-attachment-event-v0-2.ts";
import { runtimeV02InstallWithdrawalModifier } from "../_shared/tcg-match-withdrawal-modifier-v0-2.ts";
import { runtimeV02QuoteVoluntaryWithdrawal } from "../_shared/tcg-match-withdrawal-v0-2.ts";
import { runtimeV02ResolveVoluntaryWithdrawalCostListeners } from "../_shared/tcg-match-event-listener-v0-2.ts";

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
type Inst = {
  uid: string;
  card_id: string;
  borrowed?: boolean;
  effect_flags?: Record<string, unknown>;
};

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

function essenceDefinition(
  id: string,
  name: string,
  element: string,
  listeners: Record<string, unknown>[] = [],
  continuous: Record<string, unknown>[] = [],
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Essence",
    element,
    creature: null,
    essence: {
      subtype: "Special",
      provides: [{ element, amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      continuous,
      lifecycle: null,
      listeners,
    },
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



function realmDefinition(
  id: string,
  name: string,
  listeners: Record<string, unknown>[] = [],
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
      subtype: "Realm",
      program: { steps: [] },
      listeners,
      continuous: [],
    },
  };
}

function relicDefinition(
  id: string,
  name: string,
  listeners: Record<string, unknown>[] = [],
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
      subtype: "Relic",
      program: { steps: [] },
      listeners,
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
  const vanguard = (state.players as any)["1"].vanguard;
  const resolved = runtimeV02ResolveWithdrawalModifierCost(
    state,
    vanguard,
    1,
    "Gale",
    2,
  );
  equal(resolved.cost, 1);
  equal(resolved.applications.length, 1);
  equal(resolved.consumable_modifier_ids.length, 1);
  equal(vanguard.flags.lifecycle_withdrawal_cost, undefined);
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


Deno.test("Draft Essence quotes and executes the complete canonical voluntary Withdrawal chain", () => {
  const draft = instance("draft-uid", "gale-draft-essence");
  const breeze = instance("breeze-uid", "gale-breeze-essence");
  const payment = instance("payment-uid", "gale-basic-payment");
  const outgoing = instance("outgoing-uid", "gale-outgoing");
  const incoming = instance("incoming-uid", "gale-incoming");
  const opponent = instance("opponent-uid", "test-opponent-vanguard");
  const realm = instance("realm-uid", "test-withdrawal-realm");

  const draftDefinition = essenceDefinition(
    "gale-draft-essence",
    "Draft Essence",
    "Gale",
    [{
      id: "draft-attach-withdrawal",
      event: "essence_attached",
      requirements: {
        all: [
          { predicate: "source_is_self" },
          { predicate: "event_origin_zone_is", zone: "hand" },
          {
            predicate: "target_element_is",
            target: "$attached_creature",
            element: "Gale",
          },
          {
            predicate: "target_zone_is",
            target: "$attached_creature",
            zone: "reserve",
          },
          {
            predicate: "voluntary_withdrawal_legal_with_incoming",
            player: "self",
            incoming_target: "$attached_creature",
          },
        ],
      },
      limit: null,
      steps: [{
        op: "OPTIONAL",
        player: "self",
        steps: [{
          op: "PERFORM_VOLUNTARY_WITHDRAWAL",
          player: "self",
          incoming_target: "$attached_creature",
        }],
      }],
    }],
  );
  const breezeDefinition = essenceDefinition(
    "gale-breeze-essence",
    "Breeze Essence",
    "Gale",
    [],
    [{
      id: "breeze-withdrawal",
      kind: "withdrawal",
      target: "$attached_creature",
      when: null,
      amount: -1,
      minimum: 0,
      filters: { action_kind: "voluntary_withdrawal" },
    }],
  );
  const paymentDefinition = essenceDefinition(
    "gale-basic-payment",
    "Basic Gale Essence",
    "Gale",
  );
  const realmDefinition: any = tacticDefinition(
    "test-withdrawal-realm",
    "Withdrawal Realm",
    "Realm",
  );
  realmDefinition.tactic.listeners = [{
    id: "first-withdrawal-reducer",
    event: "before_voluntary_withdrawal_cost",
    controller_scope: "any",
    requirements: {
      all: [{ predicate: "event_active_seat_is_controller" }],
    },
    limit: { scope: "turn", count: 1, owner: "event_controller" },
    steps: [{
      op: "MODIFY_CURRENT_WITHDRAWAL_COST",
      delta: -1,
      minimum: 0,
    }],
  }];

  const outgoingField: any = field(outgoing);
  outgoingField.essence = [breeze, payment];
  const incomingField: any = field(incoming);
  incomingField.essence = [draft];
  const definitions = [
    creatureDefinition("gale-outgoing", "Outgoing", "Gale", null, 4),
    creatureDefinition("gale-incoming", "Incoming", "Gale", null, 1),
    creatureDefinition(
      "test-opponent-vanguard",
      "Opponent",
      "Shade",
      null,
      1,
    ),
    draftDefinition,
    breezeDefinition,
    paymentDefinition,
    realmDefinition,
  ];
  const state: Record<string, unknown> = {
    turn_seq: 7,
    active_seat: 1,
    personal_turns: { "1": 3, "2": 3 },
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    turn_flags: { "1": {} },
    card_index: Object.fromEntries(definitions.map((definition) => [
      String(definition.id),
      { definition_v0_2: definition },
    ])),
    realm: { owner_seat: 1, card: realm },
    players: {
      "1": {
        vanguard: outgoingField,
        reserve: [incomingField, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };

  runtimeV02InstallWithdrawalModifier(
    state,
    outgoingField,
    {
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
    },
    {
      source_controller_seat: 1,
      target_controller_seat: 1,
      source_card_uid: "test-modifier-source",
      source_action_id: "test-modifier",
    },
  );

  const preview = runtimeV02QuoteVoluntaryWithdrawal(state, {
    controller_seat: 1,
    reserve_index: 0,
    incoming_target_uid: "incoming-uid",
    require_target: true,
    consume_cost_listeners: false,
    action_id: "withdraw",
    resolve_cost_listeners: runtimeV02ResolveVoluntaryWithdrawalCostListeners,
  });
  equal(preview.ok, true);
  equal(preview.cost, 1);
  equal(preview.payment_options.length, 2);

  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    1,
    "incoming-uid",
    draft,
    "hand",
    "manual_essence",
  );
  const attachedEvent = runtimeV02CreateEssenceAttachedEvent(
    receipt,
    { destination_index: 0 },
  );
  const optional = runtimeV02BeginEventListenerContinuation(
    state,
    [attachedEvent as any],
  );
  equal(optional.pending_choice?.kind, "optional");

  const pay = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    optional.pending_choice!.id,
    ["accept"],
  );
  equal(pay.pending_choice?.kind, "withdrawal_payment");
  equal(pay.pending_choice?.min, 1);
  equal(pay.pending_choice?.max, 1);
  equal((state.players as any)["1"].vanguard.stack[0].uid, "outgoing-uid");
  equal((state.players as any)["1"].discard.length, 0);

  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pay.pending_choice!.id,
    ["essence:payment-uid"],
  );
  equal(complete.status, "complete");
  equal((state.players as any)["1"].vanguard.stack[0].uid, "incoming-uid");
  equal((state.players as any)["1"].reserve[0].stack[0].uid, "outgoing-uid");
  equal((state.players as any)["1"].reserve[0].essence.length, 1);
  equal((state.players as any)["1"].reserve[0].essence[0].uid, "breeze-uid");
  equal((state.players as any)["1"].discard.length, 1);
  equal((state.players as any)["1"].discard[0].uid, "payment-uid");
  equal((state.turn_flags as any)["1"].withdraw_turn, 7);
  equal(complete.emitted_movement_events.length, 2);
  equal(complete.emitted_movement_events[0].event, "moved_to_reserve");
  equal(complete.emitted_movement_events[1].event, "became_vanguard");

  const secondQuote = runtimeV02QuoteVoluntaryWithdrawal(state, {
    controller_seat: 1,
    reserve_index: 0,
    incoming_target_uid: "outgoing-uid",
    require_target: true,
    consume_cost_listeners: false,
    action_id: "withdraw",
    resolve_cost_listeners: runtimeV02ResolveVoluntaryWithdrawalCostListeners,
  });
  equal(secondQuote.ok, false);
  equal(secondQuote.error, "withdrawal_already_used_this_turn");
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


Deno.test("triggered APPLY_CONDITION uses source-aware Condition protection", () => {
  const source = creatureDefinition(
    "test-condition-trigger",
    "Condition Trigger",
    "Shade",
    ability("condition-trigger", {
      all: [{ predicate: "event_subject_is_source" }],
    }, [{
      op: "APPLY_CONDITION",
      target: "$current_opponent_vanguard",
      condition: "Dazed",
      mode: "apply_if_empty",
    }]),
  );
  const state = baseState(source);
  const target = (state.players as any)["2"].vanguard;
  runtimeV02InstallConditionProtection(target, {
    protection_id: "event-condition-protection",
    source_action_id: "protection-source",
    source_uid: "protection-source-uid",
    source_card_id: "protection-source-card",
    source_controller_seat: 2,
    target_controller_seat: 2,
    installed_turn_seq: 7,
    condition_names: [],
    condition_slot: "control",
    source_controller: "opponent",
    card_effect_only: true,
    max_uses: 1,
    expires_on: "start_of_controller_next_turn",
  });
  const complete = begin(state);
  equal(complete.status, "complete");
  equal(target.conditions.control, null);
  equal(runtimeV02ConditionProtectionCount(target), 0);
});


Deno.test("Event Listener active-seat controller predicate matches only the authoritative active seat", () => {
  const source = creatureDefinition(
    "gale-active-seat-proof",
    "Active Seat Proof",
    "Gale",
    ability("active-seat-proof", {
      all: [
        { predicate: "event_subject_is_source" },
        { predicate: "event_controller_is_active_seat" },
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

  const active = baseState(source);
  const matched = begin(active);
  equal(matched.status, "complete");
  equal(matched.processed_listener_keys.length, 1);
  const activeCost = runtimeV02ResolveWithdrawalModifierCost(
    active,
    (active.players as any)["1"].vanguard,
    1,
    "Gale",
    2,
  );
  equal(activeCost.cost, 1);

  const inactive = baseState(source);
  (inactive as any).active_seat = 2;
  const rejected = begin(inactive);
  equal(rejected.status, "complete");
  equal(rejected.processed_listener_keys.length, 0);
  const inactiveCost = runtimeV02ResolveWithdrawalModifierCost(
    inactive,
    (inactive.players as any)["1"].vanguard,
    1,
    "Gale",
    2,
  );
  equal(inactiveCost.cost, 2);
});

Deno.test("Event Listener schema-valid any_turn timing remains eligible when the source controller is not the active seat", () => {
  const source = creatureDefinition(
    "stone-any-turn-proof",
    "Any Turn Proof",
    "Stone",
    ability("any-turn-proof", {
      all: [{ predicate: "event_subject_is_source" }],
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
  (source as any).creature.ability.timing = "any_turn";

  const state = baseState(source);
  (state as any).active_seat = 2;
  const matched = begin(state);
  equal(matched.status, "complete");
  equal(matched.processed_listener_keys.length, 1);
});

Deno.test("Event Listener subject filters resolve the current event subject definition", () => {
  const matchingSource = creatureDefinition(
    "gale-subject-filter-proof",
    "Subject Filter Proof",
    "Gale",
    ability("subject-filter-proof", {
      all: [{
        predicate: "event_subject_matches",
        filters: { card_family: "Creature", element: "Gale" },
      }],
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
  const matchingState = baseState(matchingSource);
  const matched = begin(matchingState);
  equal(matched.status, "complete");
  equal(matched.processed_listener_keys.length, 1);

  const rejectingSource = creatureDefinition(
    "gale-subject-filter-reject",
    "Subject Filter Reject",
    "Gale",
    ability("subject-filter-reject", {
      all: [{
        predicate: "event_subject_matches",
        filters: { card_family: "Creature", element: "Ember" },
      }],
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
  const rejectingState = baseState(rejectingSource);
  const rejected = begin(rejectingState);
  equal(rejected.status, "complete");
  equal(rejected.processed_listener_keys.length, 0);
});

Deno.test("Orbit Ring source_element_is follows the attack source Creature element", () => {
  const reserveDummy = creatureDefinition(
    "astral-orbit-source-dummy",
    "Orbit Source Dummy",
    "Astral",
    null,
  );
  const orbitRing = {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "astral-orbit-ring",
    name: "Orbit Ring",
    card_family: "Tactic",
    element: "Astral",
    creature: null,
    essence: null,
    tactic: {
      subtype: "Relic",
      program: { steps: [] },
      continuous: [],
      listeners: [{
        id: "orbit-ring-after-attack",
        event: "attack_finished",
        requirements: {
          all: [
            { predicate: "source_is_attached_creature" },
            { predicate: "source_controller_is_self" },
            { predicate: "source_element_is", element: "Astral" },
          ],
        },
        limit: null,
        steps: [{
          op: "SET_WITHDRAWAL_MODIFIER",
          target: "$attached_creature",
          mode: "delta",
          amount: -1,
          minimum: 0,
          duration: { expires_on: ["end_of_turn"], max_uses: 1 },
        }],
      }],
    },
  };
  const attackFinished = {
    event_id: "attack-finished:7:1:orbit-proof",
    event: "attack_finished",
    subject_uid: "own-vanguard-uid",
    controller_seat: 1 as const,
    source_controller_seat: 1 as const,
    origin_zone: "vanguard",
    destination_zone: "vanguard",
    destination_index: null,
    phase: "attack_finished",
    source_action_id: "orbit-proof-attack",
    source_card_uid: "own-vanguard-uid",
    action_kind: "attack",
    turn_seq: 7,
    attack_id: "orbit-proof-attack",
    source_creature_uid: "own-vanguard-uid",
  };

  const matching = baseState(reserveDummy);
  (matching.players as any)["1"].vanguard.relic =
    instance("orbit-ring-uid", "astral-orbit-ring");
  (matching.card_index as any)["astral-orbit-ring"] = {
    definition_v0_2: orbitRing,
  };
  const matched = runtimeV02BeginEventListenerContinuation(
    matching,
    [attackFinished],
  );
  equal(matched.status, "complete");
  equal(matched.processed_listener_keys.length, 1);

  const rejecting = baseState(reserveDummy);
  (rejecting.players as any)["1"].vanguard.relic =
    instance("orbit-ring-uid", "astral-orbit-ring");
  (rejecting.card_index as any)["astral-orbit-ring"] = {
    definition_v0_2: orbitRing,
  };
  (rejecting.card_index as any)["test-own-vanguard"].definition_v0_2.element =
    "Gale";
  const rejected = runtimeV02BeginEventListenerContinuation(
    rejecting,
    [attackFinished],
  );
  equal(rejected.status, "complete");
  equal(rejected.processed_listener_keys.length, 0);
});

function installVoltDiscardListenerFixture(
  state: Record<string, unknown>,
  pulseUid: string,
  sourceControllerSeat: 1 | 2,
): {
  pulse: Inst;
  host: any;
  player: any;
  receipt: ReturnType<typeof runtimeV02ApplyCardZoneTransfer>["receipt"];
} {
  const pulseDefinition = essenceDefinition(
    "volt-pulse-essence",
    "Pulse Essence",
    "Volt",
    [{
      id: "pulse-discharge-draw",
      event: "essence_discarded",
      requirements: {
        all: [
          { predicate: "event_subject_is_source" },
          { predicate: "essence_discarded_source_controller_is_self" },
          { predicate: "essence_discarded_by_own_card_effect" },
        ],
      },
      limit: { scope: "turn", count: 1, owner: "controller" },
      steps: [{ op: "DRAW", player: "self", count: 1 }],
    }],
  );
  const dynamoDefinition = relicDefinition(
    "volt-dynamo-lens",
    "Dynamo Lens",
    [{
      id: "dynamo-lens-draw",
      event: "essence_discarded",
      requirements: {
        all: [
          {
            predicate:
              "event_previous_attachment_target_is_attached_creature",
          },
          {
            any: [
              {
                predicate: "essence_discarded_attachment_kind_is",
                kind: "temporary",
              },
              {
                predicate: "essence_discarded_attachment_kind_is",
                kind: "borrowed",
              },
            ],
          },
        ],
      },
      limit: { scope: "turn", count: 1, owner: "attachment" },
      steps: [{ op: "DRAW", player: "self", count: 1 }],
    }],
  );
  const drawDefinitionA = tacticDefinition("draw-a", "Draw A", "Device");
  const drawDefinitionB = tacticDefinition("draw-b", "Draw B", "Device");
  const drawDefinitionC = tacticDefinition("draw-c", "Draw C", "Device");
  const cardIndex = state.card_index as Record<string, unknown>;
  cardIndex["volt-pulse-essence"] = { definition_v0_2: pulseDefinition };
  cardIndex["volt-dynamo-lens"] = { definition_v0_2: dynamoDefinition };
  cardIndex["draw-a"] = { definition_v0_2: drawDefinitionA };
  cardIndex["draw-b"] = { definition_v0_2: drawDefinitionB };
  cardIndex["draw-c"] = { definition_v0_2: drawDefinitionC };

  const player = (state.players as any)["1"];
  const host = player.reserve[0];
  const pulse: Inst = {
    uid: pulseUid,
    card_id: "volt-pulse-essence",
    effect_flags: {
      discard_during_target_aftermath: true,
      runtime_v0_2_effect_attachment_state: {
        kind: "temporary",
        expires: "controller_aftermath",
        destination_on_expire: "discard",
      },
    },
  };
  host.essence = [pulse];
  host.relic = instance("dynamo-uid", "volt-dynamo-lens");
  player.deck = [
    instance("draw-a-uid", "draw-a"),
    instance("draw-b-uid", "draw-b"),
    instance("draw-c-uid", "draw-c"),
  ];

  const transfer = runtimeV02ApplyCardZoneTransfer(
    host.essence,
    player.discard,
    {
      cause: "effect",
      action_kind: "aftermath",
      source_action_id: "aftermath_essence_disposition",
      source_card_uid:
        sourceControllerSeat === 1 ? "source-uid" : "opponent-vanguard-uid",
      source: {
        controller_seat: 1,
        zone: "attached_essence",
        owner_card_uid: "source-uid",
      },
      destination: {
        controller_seat: 1,
        zone: "discard",
        owner_card_uid: null,
      },
      card_uids: [pulse.uid],
      destination_position: "bottom",
    },
  );
  return { pulse, host, player, receipt: transfer.receipt };
}

Deno.test("Pulse Essence and Dynamo Lens consume one canonical Essence-discard event", () => {
  const state = baseState(
    creatureDefinition("volt-host", "Volt Host", "Volt"),
  );
  const fixture = installVoltDiscardListenerFixture(state, "pulse-uid", 1);
  const events = runtimeV02CreateEssenceDiscardedEvents(state, {
    receipt: fixture.receipt,
    source_controller_seat: 1,
    phase: "aftermath",
  });
  equal(events.length, 1);
  equal(events[0].event, "essence_discarded");
  equal(events[0].subject_uid, "pulse-uid");
  equal(events[0].previous_attachment_target_uid, "source-uid");
  equal(events[0].attachment_kind, "temporary");
  equal(events[0].source_controller_seat, 1);
  equal(events[0].card_effect, true);

  const complete = runtimeV02BeginEventListenerContinuation(state, events);
  equal(complete.status, "complete");
  equal(complete.processed_listener_keys.length, 2);
  equal(fixture.player.hand.length, 2);
  equal(fixture.player.deck.length, 1);
});

Deno.test("opponent-controlled Essence discard blocks Pulse but still satisfies Dynamo attachment metadata", () => {
  const state = baseState(
    creatureDefinition("volt-host-opponent-effect", "Volt Host", "Volt"),
  );
  const fixture = installVoltDiscardListenerFixture(
    state,
    "pulse-opponent-effect-uid",
    2,
  );
  const events = runtimeV02CreateEssenceDiscardedEvents(state, {
    receipt: fixture.receipt,
    source_controller_seat: 2,
    phase: "aftermath",
  });
  const complete = runtimeV02BeginEventListenerContinuation(state, events);
  equal(complete.status, "complete");
  equal(complete.processed_listener_keys.length, 1);
  equal(fixture.player.hand.length, 1);
  equal(fixture.player.deck.length, 2);
});

Deno.test("Pulse controller and Dynamo attachment turn limits suppress repeated Essence-discard draws", () => {
  const state = baseState(
    creatureDefinition("volt-host-limits", "Volt Host", "Volt"),
  );
  const first = installVoltDiscardListenerFixture(state, "pulse-first-uid", 1);
  const firstEvents = runtimeV02CreateEssenceDiscardedEvents(state, {
    receipt: first.receipt,
    source_controller_seat: 1,
    phase: "aftermath",
  });
  const firstComplete = runtimeV02BeginEventListenerContinuation(
    state,
    firstEvents,
  );
  equal(firstComplete.processed_listener_keys.length, 2);
  equal(first.player.hand.length, 2);

  const secondPulse: Inst = {
    uid: "pulse-second-uid",
    card_id: "volt-pulse-essence",
    effect_flags: {
      runtime_v0_2_effect_attachment_state: {
        kind: "borrowed",
        expires: "controller_aftermath",
        destination_on_expire: "discard",
      },
    },
  };
  first.host.essence = [secondPulse];
  const secondTransfer = runtimeV02ApplyCardZoneTransfer(
    first.host.essence,
    first.player.discard,
    {
      cause: "effect",
      action_kind: "aftermath",
      source_action_id: "aftermath_essence_disposition",
      source_card_uid: "source-uid",
      source: {
        controller_seat: 1,
        zone: "attached_essence",
        owner_card_uid: "source-uid",
      },
      destination: {
        controller_seat: 1,
        zone: "discard",
        owner_card_uid: null,
      },
      card_uids: [secondPulse.uid],
      destination_position: "bottom",
    },
  );
  const secondEvents = runtimeV02CreateEssenceDiscardedEvents(state, {
    receipt: secondTransfer.receipt,
    source_controller_seat: 1,
    phase: "aftermath",
  });
  equal(secondEvents[0].attachment_kind, "borrowed");
  const secondComplete = runtimeV02BeginEventListenerContinuation(
    state,
    secondEvents,
  );
  equal(secondComplete.status, "complete");
  equal(secondComplete.processed_listener_keys.length, 0);
  equal(first.player.hand.length, 2);
  equal(first.player.deck.length, 1);
});

function installStormgridFixture(state: Record<string, unknown>) {
  const stormgrid = realmDefinition(
    "volt-stormgrid-city",
    "Stormgrid City",
    [{
      id: "stormgrid-recycle",
      event: "device_resolved",
      controller_scope: "any",
      limit: { scope: "turn", count: 1, owner: "event_controller" },
      requirements: { predicate: "event_controller_is_active_seat" },
      steps: [{
        op: "OPTIONAL",
        player: "$event_controller",
        steps: [{
          op: "SET_RESOLVING_CARD_DESTINATION",
          card: "$resolving_card",
          destination: "deck_bottom",
        }],
      }],
    }],
  );
  const device = tacticDefinition(
    "volt-test-device",
    "Test Device",
    "Device",
  );
  const cardIndex = state.card_index as Record<string, unknown>;
  cardIndex["volt-stormgrid-city"] = { definition_v0_2: stormgrid };
  cardIndex["volt-test-device"] = { definition_v0_2: device };
  state.realm = {
    card: instance("stormgrid-uid", "volt-stormgrid-city"),
    owner_seat: 2,
    played_turn: 6,
  };
  const effect = {
    id: "device-effect-1",
    owner_seat: 1,
    source_card: instance("device-uid", "volt-test-device"),
    source_name: "Test Device",
    source_card_id: "volt-test-device",
    source_subtype: "Device",
    discard_after_resolve: true,
    resolving_card_destination: "discard",
    device_resolved_event_started: true,
    steps: [],
    cursor: 0,
    vars: {},
  };
  state.effect_resolution = effect;
  return effect;
}

Deno.test("Stormgrid City can replace the exact resolving Device destination with deck bottom", () => {
  const state = baseState(
    creatureDefinition("volt-stormgrid-host", "Stormgrid Host", "Volt"),
  );
  const effect = installStormgridFixture(state);
  const event = runtimeV02CreateDeviceResolvedEvent(state, {
    controller_seat: 1,
    resolving_card_uid: effect.source_card.uid,
    resolving_card_id: effect.source_card.card_id,
    source_action_id: effect.id,
    phase: "effect_resolution",
    destination: "discard",
  });

  const pending = runtimeV02BeginEventListenerContinuation(state, [event]);
  equal(pending.status, "player_choice_required");
  assert(pending.pending_choice, "Stormgrid optional choice required");
  equal(pending.pending_choice.seat, 1);
  equal(pending.pending_choice.kind, "optional");

  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice.id,
    ["accept"],
  );
  equal(complete.status, "complete");
  equal(effect.resolving_card_destination, "deck_bottom");
  equal(event.destination_zone, "discard");
  const history = state.effect_events as any[];
  equal(history.length, 1);
  equal(history[0].destination_zone, "deck_bottom");
  equal(complete.processed_listener_keys.length, 1);
});

Deno.test("Stormgrid City decline preserves discard and consumes the existing event-controller turn limit", () => {
  const state = baseState(
    creatureDefinition("volt-stormgrid-decline-host", "Stormgrid Host", "Volt"),
  );
  const effect = installStormgridFixture(state);
  const first = runtimeV02CreateDeviceResolvedEvent(state, {
    controller_seat: 1,
    resolving_card_uid: effect.source_card.uid,
    resolving_card_id: effect.source_card.card_id,
    source_action_id: effect.id,
    phase: "effect_resolution",
  });
  const pending = runtimeV02BeginEventListenerContinuation(state, [first]);
  assert(pending.pending_choice, "Stormgrid optional choice required");
  const declined = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice.id,
    ["decline"],
  );
  equal(declined.status, "complete");
  equal(effect.resolving_card_destination, "discard");

  const secondCard = instance("device-uid-2", "volt-test-device");
  effect.id = "device-effect-2";
  effect.source_card = secondCard;
  const second = runtimeV02CreateDeviceResolvedEvent(state, {
    controller_seat: 1,
    resolving_card_uid: secondCard.uid,
    resolving_card_id: secondCard.card_id,
    source_action_id: effect.id,
    phase: "effect_resolution",
  });
  const suppressed = runtimeV02BeginEventListenerContinuation(state, [second]);
  equal(suppressed.status, "complete");
  equal(suppressed.processed_listener_keys.length, 0);
});

Deno.test("Stormgrid resolving-card destination fails closed if the resolving Device identity changes", () => {
  const state = baseState(
    creatureDefinition("volt-stormgrid-stale-host", "Stormgrid Host", "Volt"),
  );
  const effect = installStormgridFixture(state);
  const event = runtimeV02CreateDeviceResolvedEvent(state, {
    controller_seat: 1,
    resolving_card_uid: effect.source_card.uid,
    resolving_card_id: effect.source_card.card_id,
    source_action_id: effect.id,
    phase: "effect_resolution",
  });
  const pending = runtimeV02BeginEventListenerContinuation(state, [event]);
  assert(pending.pending_choice, "Stormgrid optional choice required");
  effect.source_card = instance("changed-device-uid", "volt-test-device");
  throws(
    () => runtimeV02ResolveEventListenerChoice(
      state,
      1,
      pending.pending_choice!.id,
      ["accept"],
    ),
    "tcg_v0_2_resolving_card_destination_source_stale",
  );
});

