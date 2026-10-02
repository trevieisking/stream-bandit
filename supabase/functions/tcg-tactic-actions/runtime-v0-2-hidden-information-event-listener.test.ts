import {
  runtimeV02AdaptHiddenInformationOccurrencesForListener,
  runtimeV02BeginEventListenerContinuation,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import {
  recordRuntimeV02HiddenInformationView,
  runtimeV02TakeHiddenInformationOccurrences,
} from "../_shared/tcg-match-hidden-information-v0-2.ts";
import {
  runtimeV02ResolveWithdrawalModifierCost,
} from "../_shared/tcg-match-withdrawal-modifier-v0-2.ts";

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

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function jsonEqual(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function inst(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function triggeredAbility(
  id: string,
  requirements: Record<string, unknown>,
  steps: Record<string, unknown>[],
  limit: Record<string, unknown> | null = {
    scope: "turn",
    count: 1,
    owner: "controller",
  },
) {
  return {
    id,
    name: id,
    mode: "triggered",
    event: "hidden_information_viewed",
    timing: "own_turn",
    limit,
    requirements,
    costs: [],
    steps,
  };
}

function creatureDefinition(
  id: string,
  ability: Record<string, unknown> | null = null,
  withdrawal = 2,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element: "Astral",
    creature: {
      stage: "Standalone",
      hp: 180,
      withdrawal,
      reward_value: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function tacticDefinition(
  id: string,
  subtype: string,
  listeners: Record<string, unknown>[] = [],
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Tactic",
    element: "Astral",
    creature: null,
    essence: null,
    tactic: {
      subtype,
      program: { schema: "sb-tcg-effects-v0.2", steps: [] },
      listeners,
      continuous: [],
    },
  };
}

function field(card: Inst, damage = 0, relic: Inst | null = null) {
  return {
    stack: [card],
    essence: [],
    relic,
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
  vanguardDefinition: Record<string, unknown>,
  options: {
    damage?: number;
    hand?: Inst[];
    deck?: Inst[];
    extraDefinitions?: Record<string, unknown>[];
    relic?: { inst: Inst; definition: Record<string, unknown> };
    realm?: { inst: Inst; definition: Record<string, unknown>; ownerSeat?: 1 | 2 };
    opponentDeck?: Inst[];
  } = {},
): Record<string, unknown> {
  const vanguard = inst("source-creature-uid", String(vanguardDefinition.id));
  const opponent = inst("opponent-creature-uid", "test-opponent");
  const definitions = [
    vanguardDefinition,
    creatureDefinition("test-opponent"),
    ...(options.extraDefinitions || []),
    ...(options.relic ? [options.relic.definition] : []),
    ...(options.realm ? [options.realm.definition] : []),
  ];
  const cardIndex = Object.fromEntries(definitions.map((definition) => [
    String(definition.id),
    { definition_v0_2: definition },
  ]));
  return {
    turn_seq: 7,
    active_seat: 1,
    phase: "play",
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    card_index: cardIndex,
    realm: options.realm
      ? { card: options.realm.inst, owner_seat: options.realm.ownerSeat || 1 }
      : null,
    players: {
      "1": {
        vanguard: field(
          vanguard,
          options.damage || 0,
          options.relic?.inst || null,
        ),
        reserve: [null, null, null, null],
        hand: options.hand || [],
        deck: options.deck || [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
        hand: [],
        deck: options.opponentDeck || [],
        discard: [],
        rewards: [],
      },
    },
  };
}

function hiddenFlow(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  zone: "deck_top" | "deck",
  source: {
    actionKind?: string;
    sourceControllerSeat?: 1 | 2;
    sourceActionId?: string;
    sourceCardUid?: string;
    sourceCreatureUid?: string | null;
    phase?: string;
  } = {},
) {
  recordRuntimeV02HiddenInformationView(state, controllerSeat, zone, {
    action_kind: source.actionKind || "ability",
    source_controller_seat: source.sourceControllerSeat || controllerSeat,
    source_action_id: source.sourceActionId || "hidden-source-action",
    source_card_uid: source.sourceCardUid || (
      controllerSeat === 1 ? "source-creature-uid" : "opponent-creature-uid"
    ),
    source_creature_uid: source.sourceCreatureUid === undefined
      ? (controllerSeat === 1 ? "source-creature-uid" : "opponent-creature-uid")
      : source.sourceCreatureUid,
    phase: source.phase || "play",
  });
  const occurrences = runtimeV02TakeHiddenInformationOccurrences(state);
  const events = runtimeV02AdaptHiddenInformationOccurrencesForListener(
    state,
    occurrences,
  );
  return runtimeV02BeginEventListenerContinuation(state, events);
}

Deno.test("Orbitortoise event_zone_is responds to deck/deck_top but controller limit consumes once", () => {
  const definition = creatureDefinition(
    "astral-orbitortoise",
    triggeredAbility(
      "forecast-shell",
      {
        all: [
          { predicate: "event_controller_is_self" },
          {
            any: [
              { predicate: "event_zone_is", zone: "deck_top" },
              { predicate: "event_zone_is", zone: "deck" },
            ],
          },
        ],
      },
      [{
        op: "ADD_SHIELD",
        target: "$source_creature",
        amount: 10,
        source_contribution_cap: 20,
        source_key: "ability:forecast-shell",
      }],
    ),
  );
  const state = stateFor(definition);
  const first = hiddenFlow(state, 1, "deck_top");
  equal(first.status, "complete");
  equal((state.players as any)["1"].vanguard.shield, 10);

  const second = hiddenFlow(state, 1, "deck");
  equal(second.status, "complete");
  equal((state.players as any)["1"].vanguard.shield, 10);
  equal((state.effect_events as any[]).filter((event) =>
    event.event === "hidden_information_viewed"
  ).length, 2);
});

Deno.test("Prismowl hidden-view listener draws then resumes a private hand-discard choice", () => {
  const definition = creatureDefinition(
    "astral-prismowl",
    triggeredAbility(
      "wide-eyes",
      { all: [{ predicate: "event_controller_is_self" }] },
      [
        { op: "DRAW", player: "self", count: 1 },
        { op: "CHOOSE_HAND_TO_DISCARD", player: "self", count: 1 },
      ],
    ),
  );
  const keep = inst("keep-uid", "keep-card");
  const drawn = inst("drawn-uid", "drawn-card");
  const state = stateFor(definition, {
    hand: [keep],
    deck: [drawn],
    extraDefinitions: [
      tacticDefinition("keep-card", "Device"),
      tacticDefinition("drawn-card", "Device"),
    ],
  });

  const pending = hiddenFlow(state, 1, "deck_top");
  equal(pending.status, "player_choice_required");
  equal(pending.pending_choice?.kind, "discard_from_hand");
  equal((state.players as any)["1"].hand.length, 2);

  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    1,
    pending.pending_choice!.id,
    ["card:keep-uid"],
  );
  equal(complete.status, "complete");
  jsonEqual(
    (state.players as any)["1"].hand.map((card: Inst) => card.uid),
    ["drawn-uid"],
  );
  jsonEqual(
    (state.players as any)["1"].discard.map((card: Inst) => card.uid),
    ["keep-uid"],
  );
});

Deno.test("Starwhale hidden-view listener installs the accepted withdrawal modifier", () => {
  const definition = creatureDefinition(
    "astral-starwhale",
    triggeredAbility(
      "star-current",
      {
        all: [
          { predicate: "event_controller_is_self" },
          { predicate: "event_zone_is", zone: "deck_top" },
        ],
      },
      [{
        op: "SET_WITHDRAWAL_MODIFIER",
        target: "$source_creature",
        delta: -1,
        minimum: 0,
        duration: { expires_on: ["end_of_turn"], max_uses: null },
      }],
    ),
    3,
  );
  const state = stateFor(definition);
  const flow = hiddenFlow(state, 1, "deck_top");
  equal(flow.status, "complete");
  const result = runtimeV02ResolveWithdrawalModifierCost(
    state,
    (state.players as any)["1"].vanguard,
    1,
    "Astral",
    3,
  );
  equal(result.cost, 2);
});

Deno.test("Celestial Observatory resolves OPTIONAL for event controller and rebinds current deck top", () => {
  const vanguard = creatureDefinition("test-own");
  const realmDefinition = tacticDefinition(
    "astral-celestial-observatory",
    "Realm",
    [{
      id: "celestial-observatory-topshift",
      event: "hidden_information_viewed",
      controller_scope: "any",
      requirements: {
        all: [{ predicate: "event_zone_is", zone: "deck_top" }],
      },
      limit: { scope: "turn", count: 1, owner: "event_controller" },
      steps: [{
        op: "OPTIONAL",
        player: "$event_controller",
        steps: [{
          op: "MOVE_ZONE_POSITION",
          player: "$event_controller",
          zone: "deck",
          from: "top",
          to: "bottom",
          count: 1,
          visibility: "no_additional_reveal",
        }],
      }],
    }],
  );
  const oldTop = inst("old-top-uid", "old-top");
  const second = inst("second-uid", "second");
  const inserted = inst("inserted-uid", "inserted");
  const state = stateFor(vanguard, {
    realm: {
      inst: inst("realm-uid", "astral-celestial-observatory"),
      definition: realmDefinition,
      ownerSeat: 1,
    },
    opponentDeck: [oldTop, second],
  });

  const pending = hiddenFlow(state, 2, "deck_top", {
    sourceControllerSeat: 2,
    sourceCardUid: "opponent-creature-uid",
    sourceCreatureUid: "opponent-creature-uid",
  });
  equal(pending.status, "player_choice_required");
  equal(pending.pending_choice?.kind, "optional");
  equal(pending.pending_choice?.seat, 2);

  (state.players as any)["2"].deck.unshift(inserted);
  const complete = runtimeV02ResolveEventListenerChoice(
    state,
    2,
    pending.pending_choice!.id,
    ["accept"],
  );
  equal(complete.status, "complete");
  jsonEqual(
    (state.players as any)["2"].deck.map((card: Inst) => card.uid),
    ["old-top-uid", "second-uid", "inserted-uid"],
  );

  const history = JSON.stringify(state.effect_events);
  if (history.includes("old-top-uid") || history.includes("inserted-uid")) {
    throw new Error("hidden-view event history leaked viewed/current deck card identity");
  }

  const secondOccurrence = hiddenFlow(state, 2, "deck_top", {
    sourceControllerSeat: 2,
    sourceCardUid: "opponent-creature-uid",
    sourceCreatureUid: "opponent-creature-uid",
  });
  equal(secondOccurrence.status, "complete");
});

Deno.test("Dreamglass source_is_attached_creature heals only matching Ability/Attack hidden views", () => {
  const vanguardDefinition = creatureDefinition("astral-source");
  const relicDefinition = tacticDefinition(
    "astral-dreamglass",
    "Relic",
    [{
      id: "dreamglass-foresight-heal",
      event: "hidden_information_viewed",
      requirements: {
        all: [
          { predicate: "source_is_attached_creature" },
          { predicate: "source_controller_is_self" },
          {
            any: [
              { predicate: "event_action_kind_is", action_kind: "ability" },
              { predicate: "event_action_kind_is", action_kind: "attack" },
            ],
          },
        ],
      },
      limit: { scope: "turn", count: 1, owner: "controller" },
      steps: [{ op: "HEAL", target: "$attached_creature", amount: 10 }],
    }],
  );
  const state = stateFor(vanguardDefinition, {
    damage: 30,
    relic: {
      inst: inst("dreamglass-uid", "astral-dreamglass"),
      definition: relicDefinition,
    },
  });

  const matching = hiddenFlow(state, 1, "deck_top", {
    actionKind: "ability",
    sourceControllerSeat: 1,
    sourceCardUid: "source-creature-uid",
    sourceCreatureUid: "source-creature-uid",
  });
  equal(matching.status, "complete");
  equal((state.players as any)["1"].vanguard.damage, 20);
  equal(matching.emitted_heal_packet_ids.length, 1);

  const nonMatchingState = stateFor(vanguardDefinition, {
    damage: 30,
    relic: {
      inst: inst("dreamglass-uid-2", "astral-dreamglass"),
      definition: relicDefinition,
    },
  });
  const nonMatching = hiddenFlow(nonMatchingState, 1, "deck_top", {
    actionKind: "tactic",
    sourceControllerSeat: 1,
    sourceCardUid: "source-creature-uid",
    sourceCreatureUid: null,
  });
  equal(nonMatching.status, "complete");
  equal((nonMatchingState.players as any)["1"].vanguard.damage, 30);
  equal(nonMatching.emitted_heal_packet_ids.length, 0);
});
