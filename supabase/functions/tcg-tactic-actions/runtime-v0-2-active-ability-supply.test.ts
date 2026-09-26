import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02ResumeActiveAbilitySupply,
  structuredRuntimeActiveAbilitySupply,
} from "../_shared/tcg-match-active-ability-supply-v0-2.ts";
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
function creature(uid: string, cardId: string, damage = 0) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
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
  cardFamily: "Creature" | "Essence",
  element: string,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: cardFamily,
    element,
    traits: [],
  };
}
function supplyAbility() {
  return {
    id: "undertow-shape",
    name: "Undertow Shape",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [
        {
          predicate: "legal_card_available",
          controller: "self",
          zone: "discard",
          filters: {
            card_family: "Essence",
            essence_subtype: "Basic",
            element: "Tide",
          },
        },
        {
          predicate: "reserve_count_at_least",
          controller: "self",
          count: 1,
        },
      ],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CARDS",
        player: "self",
        zone: "discard",
        selection: {
          min: 0,
          max: 1,
          filters: {
            card_family: "Essence",
            essence_subtype: "Basic",
            element: "Tide",
          },
        },
        as: "supply_essence",
      },
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "reserve",
        count: 1,
        filters: { element: "Tide" },
        as: "supply_target",
      },
      {
        op: "ATTACH_ESSENCE_FROM_ZONE",
        player: "self",
        zone: "discard",
        cards: "$supply_essence",
        target: "$supply_target",
        manual_attachment: false,
      },
      {
        op: "IF",
        when: { predicate: "target_damaged", target: "$supply_target" },
        then: [{ op: "HEAL", target: "$supply_target", amount: 10 }],
      },
    ],
  };
}
function state(options: { targetDamage?: number } = {}) {
  const sourceId = "test-supply-source";
  const targetId = "test-tide-target";
  const offElementId = "test-grove-target";
  const essenceId = "test-basic-tide";
  const sourceDefinition = {
    ...envelope(sourceId, "Supply Source", "Creature", "Tide"),
    creature: {
      stage: "Standalone",
      hp: 130,
      withdrawal: 1,
      reward_value: 1,
      ability: supplyAbility(),
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
  const targetDefinition = {
    ...envelope(targetId, "Tide Target", "Creature", "Tide"),
    creature: {
      stage: "Standalone",
      hp: 120,
      withdrawal: 1,
      reward_value: 1,
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
  const offElementDefinition = {
    ...envelope(offElementId, "Grove Target", "Creature", "Grove"),
    creature: {
      stage: "Standalone",
      hp: 120,
      withdrawal: 1,
      reward_value: 1,
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
  const essenceDefinition = {
    ...envelope(essenceId, "Basic Tide Essence", "Essence", "Tide"),
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
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 14,
    active_seat: 1,
    phase: "play",
    players: {
      "1": {
        vanguard: creature("source-uid", sourceId, 0),
        reserve: [
          creature("target-uid", targetId, options.targetDamage ?? 30),
          creature("grove-uid", offElementId, 20),
          null,
          null,
        ],
        deck: [],
        hand: [],
        discard: [card("essence-uid", essenceId)],
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
      [sourceId]: { card_id: sourceId, definition_v0_2: sourceDefinition },
      [targetId]: { card_id: targetId, definition_v0_2: targetDefinition },
      [offElementId]: { card_id: offElementId, definition_v0_2: offElementDefinition },
      [essenceId]: { card_id: essenceId, definition_v0_2: essenceDefinition },
    },
  } as Record<string, unknown> & any;
}
function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-uid", "test-supply-source"),
  };
}
function pending(match: any) {
  const choice = runtimeV02CreateActiveAbilityLiveChoice(
    match,
    1,
    source(),
    "supply-choice",
  );
  if (!choice || choice.kind !== "select_reserve_target_and_optional_discard_essence") {
    throw new Error("supply choice required");
  }
  return choice;
}

Deno.test("active supply descriptor is registry-driven and parameterized rather than card-id specific", () => {
  const match = state();
  const descriptor = structuredRuntimeActiveAbilitySupply(
    match,
    { card_id: "test-supply-source" },
  );
  if (!descriptor) throw new Error("supply descriptor required");
  equal(descriptor.ability_id, "undertow-shape");
  equal(descriptor.essence_filters, {
    card_family: "Essence",
    essence_subtype: "Basic",
    element: "Tide",
  });
  equal(descriptor.target_filters, { element: "Tide" });
  equal(descriptor.when, {
    predicate: "target_damaged",
    target: "$supply_target",
  });
  equal(descriptor.heal_amount, 10);
});

Deno.test("supply live choice is private, includes exactly the legal Tide Reserve target and eligible discard Essence, and consumes the canonical turn use", () => {
  const match = state();
  const choice = pending(match);
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(match, 1, "undertow-shape"), 1);
  equal(runtimeV02PendingActiveAbilityLiveChoiceView(choice, 2), {
    id: "supply-choice",
    seat: 1,
    kind: choice.kind,
    waiting: true,
  });
  const own = runtimeV02PendingActiveAbilityLiveChoiceView(choice, 1) as any;
  equal(own.min, 1);
  equal(own.max, 2);
  equal(own.options.map((option: any) => option.id), [
    "target:target-uid",
    "essence:essence-uid",
  ]);
});

Deno.test("selecting target plus Essence attaches the exact discard instance before the Ability IF resumes", () => {
  const match = state({ targetDamage: 30 });
  const essence = match.players["1"].discard[0];
  const choice = pending(match);
  const result = runtimeV02ResolveActiveAbilityLiveChoice(
    choice,
    1,
    choice.id,
    ["target:target-uid", "essence:essence-uid"],
    match,
  );
  if (result.kind !== "supply_reserve_then_heal") {
    throw new Error("supply resolution required");
  }
  equal(result.selected_essence_count, 1);
  equal(result.target_reserve_index, 0);
  equal(match.players["1"].discard, []);
  equal(match.players["1"].reserve[0].essence.length, 1);
  same(match.players["1"].reserve[0].essence[0], essence, "attachment cloned discard Essence");
  equal(result.attachment_flow.status, "complete");

  const resumed = runtimeV02ResumeActiveAbilitySupply(match, result.resume);
  equal(resumed.if_matched, true);
  equal(resumed.requested_heal, 10);
  equal(resumed.actual_heal, 10);
  equal(resumed.emitted_packet_ids, ["heal:14:1"]);
  equal(match.players["1"].reserve[0].damage, 20);
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
    action_id: "undertow-shape",
    source_card_id: "test-supply-source",
    target_card_id: "test-tide-target",
    target_where: "reserve",
    target_index: 0,
    actual_amount: 10,
  });
});

Deno.test("declining the optional Essence still targets the Reserve and the shared target_damaged IF controls healing", () => {
  let match = state({ targetDamage: 8 });
  let choice = pending(match);
  let result = runtimeV02ResolveActiveAbilityLiveChoice(
    choice,
    1,
    choice.id,
    ["target:target-uid"],
    match,
  );
  if (result.kind !== "supply_reserve_then_heal") throw new Error("supply resolution required");
  equal(result.selected_essence_count, 0);
  equal(match.players["1"].discard.length, 1);
  equal(match.players["1"].reserve[0].essence.length, 0);
  let resumed = runtimeV02ResumeActiveAbilitySupply(match, result.resume);
  equal(resumed.if_matched, true);
  equal(resumed.actual_heal, 8);
  equal(match.players["1"].reserve[0].damage, 0);

  match = state({ targetDamage: 0 });
  choice = pending(match);
  result = runtimeV02ResolveActiveAbilityLiveChoice(
    choice,
    1,
    choice.id,
    ["target:target-uid"],
    match,
  );
  if (result.kind !== "supply_reserve_then_heal") throw new Error("supply resolution required");
  resumed = runtimeV02ResumeActiveAbilitySupply(match, result.resume);
  equal(resumed.if_matched, false);
  equal(resumed.actual_heal, 0);
  equal(resumed.emitted_packet_ids, []);
  equal(match.effect_events, undefined);
});

Deno.test("supply resolution is choice-shape, turn, source, target and discard-instance bound", () => {
  let match = state();
  let choice = pending(match);
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      ["essence:essence-uid"],
      match,
    ),
    "choice_shape_invalid",
  );

  match = state();
  choice = pending(match);
  match.turn_seq = 15;
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      ["target:target-uid"],
      match,
    ),
    "turn_changed",
  );

  match = state();
  choice = pending(match);
  match.players["1"].reserve[0].stack[0] = card("replacement-target", "test-tide-target");
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      ["target:target-uid"],
      match,
    ),
    "target_changed",
  );

  match = state();
  choice = pending(match);
  match.players["1"].discard = [];
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      choice,
      1,
      choice.id,
      ["target:target-uid", "essence:essence-uid"],
      match,
    ),
    "essence_changed",
  );
});
