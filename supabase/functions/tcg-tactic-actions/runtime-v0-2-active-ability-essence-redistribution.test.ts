import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  structuredRuntimeActiveAbilityEssenceRedistribution,
} from "../_shared/tcg-match-active-ability-essence-redistribution-v0-2.ts";
import {
  runtimeV02CurrentTurnEssenceMovements,
} from "../_shared/tcg-match-essence-movement-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function same(actual: unknown, expected: unknown, message = "instances differ") {
  if (!Object.is(actual, expected)) throw new Error(message);
}
function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}
function creature(
  uid: string,
  cardId: string,
  damage = 0,
  essence: Array<{ uid: string; card_id: string }> = [],
) {
  return {
    stack: [card(uid, cardId)],
    essence: [...essence],
    relic: null,
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}
function envelope(
  id: string,
  name: string,
  family: "Creature" | "Essence",
  element: string,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: family,
    element,
    traits: [],
  };
}
function redistributionAbility() {
  return {
    id: "heart-shape",
    name: "Heart Shape",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [
      {
        op: "MOVE_ATTACHED_ESSENCE",
        controller: "self",
        element: "Tide",
        count: { min: 0, max: 2 },
        source_selector: {
          zone: "field",
          filters: { card_family: "Creature" },
        },
        destination_selector: {
          zone: "field",
          filters: { card_family: "Creature" },
        },
        require_destination_different_creature: true,
        as: "heart_moves",
      },
      {
        op: "IF",
        when: {
          predicate: "essence_move_count_at_least",
          moves: "$heart_moves",
          count: 2,
        },
        then: [
          {
            op: "SELECT_CREATURE",
            controller: "self",
            zone: "field",
            count: 1,
            filters: {
              element: "Tide",
              damaged: true,
              participated_in_moves: "$heart_moves",
            },
            as: "heart_heal",
          },
          {
            op: "HEAL",
            target: "$heart_heal",
            amount: 20,
          },
        ],
      },
    ],
  };
}
function state() {
  const sourceId = "test-heart-source";
  const tideAId = "test-tide-a";
  const tideBId = "test-tide-b";
  const tideCId = "test-tide-c";
  const essenceId = "test-tide-essence";
  const creatureDef = (id: string, name: string, ability: Record<string, unknown> | null = null) => ({
    ...envelope(id, name, "Creature", "Tide"),
    creature: {
      stage: "Standalone",
      hp: 200,
      withdrawal: 1,
      reward_value: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  });
  const essenceDef = {
    ...envelope(essenceId, "Tide Essence", "Essence", "Tide"),
    creature: null,
    essence: {
      subtype: "Basic",
      provides: [{ element: "Tide", amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      continuous: [],
      listeners: [],
      lifecycle: null,
    },
    tactic: null,
  };
  const essenceA = card("essence-a", essenceId);
  const essenceB = card("essence-b", essenceId);
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 21,
    active_seat: 1,
    phase: "play",
    players: {
      "1": {
        vanguard: creature(
          "source-uid",
          sourceId,
          30,
          [essenceA],
        ),
        reserve: [
          creature("tide-a-uid", tideAId, 40, [essenceB]),
          creature("tide-b-uid", tideBId, 15),
          creature("tide-c-uid", tideCId, 25),
          null,
        ],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
    card_index: {
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: creatureDef(sourceId, "Heart Source", redistributionAbility()),
      },
      [tideAId]: {
        card_id: tideAId,
        definition_v0_2: creatureDef(tideAId, "Tide A"),
      },
      [tideBId]: {
        card_id: tideBId,
        definition_v0_2: creatureDef(tideBId, "Tide B"),
      },
      [tideCId]: {
        card_id: tideCId,
        definition_v0_2: creatureDef(tideCId, "Tide C"),
      },
      [essenceId]: {
        card_id: essenceId,
        definition_v0_2: essenceDef,
      },
    },
  } as Record<string, unknown> & any;
}
function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-uid", "test-heart-source"),
  };
}
function pending(match: any) {
  const choice = runtimeV02CreateActiveAbilityLiveChoice(
    match,
    1,
    source(),
    "heart-choice",
  );
  if (!choice || choice.kind !== "redistribute_attached_essence_then_conditional_heal") {
    throw new Error("redistribution choice required");
  }
  return choice;
}
const moveAtoA = "move:essence-a:source-uid:tide-a-uid";
const moveAtoB = "move:essence-a:source-uid:tide-b-uid";
const moveBtoB = "move:essence-b:tide-a-uid:tide-b-uid";
const healB = "heal:tide-b-uid";
const healC = "heal:tide-c-uid";

Deno.test("active Essence redistribution descriptor is registry-driven and parameterized", () => {
  const match = state();
  const descriptor = structuredRuntimeActiveAbilityEssenceRedistribution(
    match,
    { card_id: "test-heart-source" },
  );
  if (!descriptor) throw new Error("redistribution descriptor required");
  equal(descriptor.ability_id, "heart-shape");
  equal(descriptor.move, {
    element: "Tide",
    min: 0,
    max: 2,
    source_zone: "field",
    destination_zone: "field",
    require_destination_different_creature: true,
    as: "heart_moves",
  });
  equal(descriptor.when, {
    predicate: "essence_move_count_at_least",
    moves: "$heart_moves",
    count: 2,
  });
  equal(descriptor.heal, {
    target_element: "Tide",
    target_damaged: true,
    participated_in_moves: "$heart_moves",
    as: "heart_heal",
    amount: 20,
  });
});

Deno.test("redistribution choice is private and records the canonical once-per-turn use", () => {
  const match = state();
  const choice = pending(match);
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(match, 1, "heart-shape"), 1);
  equal(runtimeV02PendingActiveAbilityLiveChoiceView(choice, 2), {
    id: "heart-choice",
    seat: 1,
    kind: choice.kind,
    waiting: true,
  });
  const own = runtimeV02PendingActiveAbilityLiveChoiceView(choice, 1) as any;
  equal(own.min, 0);
  equal(own.max, 3);
  if (!own.options.some((option: any) => option.id === moveAtoA)) {
    throw new Error("expected first legal movement option");
  }
  if (!own.options.some((option: any) => option.id === moveBtoB)) {
    throw new Error("expected second legal movement option");
  }
  if (!own.options.some((option: any) => option.id === healB)) {
    throw new Error("expected damaged Tide heal option");
  }
});

Deno.test("zero moves and one move remain legal and do not cross the two-move IF threshold", () => {
  let match = state();
  let result = runtimeV02ResolveActiveAbilityLiveChoice(
    pending(match),
    1,
    "heart-choice",
    [],
    match,
  );
  if (result.kind !== "redistribute_attached_essence_then_conditional_heal") {
    throw new Error("redistribution resolution required");
  }
  equal(result.movement_count, 0);
  equal(result.if_matched, false);
  equal(result.actual_heal, 0);
  equal(runtimeV02CurrentTurnEssenceMovements(match, 1), []);

  match = state();
  const essenceA = match.players["1"].vanguard.essence[0];
  result = runtimeV02ResolveActiveAbilityLiveChoice(
    pending(match),
    1,
    "heart-choice",
    [moveAtoB],
    match,
  );
  if (result.kind !== "redistribute_attached_essence_then_conditional_heal") {
    throw new Error("redistribution resolution required");
  }
  equal(result.movement_count, 1);
  equal(result.if_matched, false);
  equal(result.actual_heal, 0);
  equal(match.players["1"].vanguard.essence, []);
  same(
    match.players["1"].reserve[1].essence[0],
    essenceA,
    "one-move resolution cloned the Essence",
  );
  equal(runtimeV02CurrentTurnEssenceMovements(match, 1).length, 1);
});

Deno.test("two exact moves require a damaged participating heal target and emit a canonical Ability Heal packet", () => {
  const match = state();
  const essenceA = match.players["1"].vanguard.essence[0];
  const essenceB = match.players["1"].reserve[0].essence[0];
  const choice = pending(match);
  const result = runtimeV02ResolveActiveAbilityLiveChoice(
    choice,
    1,
    choice.id,
    [moveAtoA, moveBtoB, healB],
    match,
  );
  if (result.kind !== "redistribute_attached_essence_then_conditional_heal") {
    throw new Error("redistribution resolution required");
  }
  equal(result.movement_count, 2);
  equal(result.if_matched, true);
  equal(result.requested_heal, 20);
  equal(result.actual_heal, 15);
  equal(result.emitted_packet_ids, ["heal:21:1"]);
  equal(match.players["1"].vanguard.essence, []);
  equal(match.players["1"].reserve[0].essence.length, 1);
  same(
    match.players["1"].reserve[0].essence[0],
    essenceA,
    "first Essence instance was not preserved",
  );
  same(
    match.players["1"].reserve[1].essence[0],
    essenceB,
    "second Essence instance was not preserved",
  );
  equal(match.players["1"].reserve[1].damage, 0);
  equal(runtimeV02CurrentTurnEssenceMovements(match, 1).map((movement) => ({
    essence_uid: movement.essence_uid,
    source: movement.source_creature_uid,
    destination: movement.destination_creature_uid,
    source_action_id: movement.source_action_id,
  })), [
    {
      essence_uid: "essence-a",
      source: "source-uid",
      destination: "tide-a-uid",
      source_action_id: "heart-shape",
    },
    {
      essence_uid: "essence-b",
      source: "tide-a-uid",
      destination: "tide-b-uid",
      source_action_id: "heart-shape",
    },
  ]);
  const packet = match.effect_events[0];
  equal({
    event: packet.event,
    action_kind: packet.source.action_kind,
    action_id: packet.source.action_id,
    source_card_id: packet.source.card_id,
    target_card_id: packet.target.card_id,
    target_where: packet.target.where,
    target_index: packet.target.index,
    actual_amount: packet.actual_amount,
  }, {
    event: "after_heal_packet",
    action_kind: "ability",
    action_id: "heart-shape",
    source_card_id: "test-heart-source",
    target_card_id: "test-tide-b",
    target_where: "reserve",
    target_index: 1,
    actual_amount: 15,
  });
});

Deno.test("two moves cannot heal a damaged Tide Creature that did not participate", () => {
  const match = state();
  const before = JSON.stringify(match.players["1"]);
  const choice = pending(match);
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      [moveAtoA, moveBtoB, healC],
      match,
    ),
    "heal_target_not_participant",
  );
  equal(JSON.stringify(match.players["1"]), before);
  equal(runtimeV02CurrentTurnEssenceMovements(match, 1), []);
});

Deno.test("the same Essence cannot satisfy two moves and the two-move transaction fails before mutation", () => {
  const match = state();
  const before = JSON.stringify(match.players["1"]);
  const choice = pending(match);
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      [moveAtoA, moveAtoB, healB],
      match,
    ),
    "essence_reused",
  );
  equal(JSON.stringify(match.players["1"]), before);
  equal(runtimeV02CurrentTurnEssenceMovements(match, 1), []);
});

Deno.test("a stale second movement fails before the first movement can partially apply", () => {
  const match = state();
  const choice = pending(match);
  const essenceA = match.players["1"].vanguard.essence[0];
  match.players["1"].reserve[0].essence = [];
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      [moveAtoA, moveBtoB, healB],
      match,
    ),
    "move_changed",
  );
  same(match.players["1"].vanguard.essence[0], essenceA);
  equal(runtimeV02CurrentTurnEssenceMovements(match, 1), []);
});
