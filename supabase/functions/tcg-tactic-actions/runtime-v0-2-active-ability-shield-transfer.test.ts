import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
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

function envelope(id: string, name: string, element: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element,
  };
}

function creature(uid: string, cardId: string, shield: number) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
    relic: null,
    damage: 0,
    shield,
    flags: {},
  };
}

function lanternShelterAbility() {
  return {
    id: "lantern-shelter",
    name: "Lantern Shelter",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [
        { predicate: "source_has_shield_at_least", value: 1 },
        {
          predicate: "legal_card_available",
          controller: "self",
          zone: "field",
          filters: {
            card_family: "Creature",
            element: "Tide",
            exclude_source: true,
          },
        },
      ],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: 1,
        filters: { element: "Tide", exclude_source: true },
        as: "shelter_target",
      },
      {
        op: "TRANSFER_SHIELD",
        from: "$source_creature",
        to: "$shelter_target",
        amount: { min: 0, max: 20 },
      },
    ],
  };
}

function state(options: {
  sourceShield?: number;
  targetShield?: number;
  includeTarget?: boolean;
} = {}) {
  const sourceId = "test-abyssalume";
  const targetId = "test-tide-target";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 17,
    active_seat: 1,
    players: {
      "1": {
        vanguard: creature(
          "source-creature",
          sourceId,
          options.sourceShield ?? 30,
        ),
        reserve: [
          options.includeTarget === false
            ? null
            : creature(
              "target-creature",
              targetId,
              options.targetShield ?? 10,
            ),
          null,
          null,
          null,
        ],
        deck: [],
        hand: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        rewards: [],
      },
    },
    card_index: {
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: {
          ...envelope(sourceId, "Abyssalume Test", "Tide"),
          creature: {
            stage: "Adult",
            ability: lanternShelterAbility(),
            attacks: [],
          },
        },
      },
      [targetId]: {
        card_id: targetId,
        definition_v0_2: {
          ...envelope(targetId, "Tide Target", "Tide"),
          creature: { stage: "Standalone", ability: null, attacks: [] },
        },
      },
    },
  } as Record<string, unknown>;
}

Deno.test("Lantern Shelter uses the shared Ability receipt and two-stage target/amount choice", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    {
      where: "vanguard",
      index: null,
      instance: card("source-creature", "test-abyssalume"),
    },
    "shield-target",
  )!;
  assertEquals(pending.kind, "transfer_shield_between_friendly_creatures");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "lantern-shelter"), 1);
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1), {
    id: "shield-target",
    seat: 1,
    kind: "transfer_shield_between_friendly_creatures",
    stage: "target",
    prompt: "Choose one friendly Tide Creature",
    min: 1,
    max: 1,
    options: [{
      id: "creature:reserve:0:target-creature",
      label: "Reserve 1",
    }],
  });

  const targetResolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "shield-target",
    ["creature:reserve:0:target-creature"],
    s,
  ) as any;
  assertEquals({
    kind: targetResolved.kind,
    stage: targetResolved.stage,
    ability_id: targetResolved.ability_id,
    amount_option_count: targetResolved.pending_choice.options.length,
    first_amount: targetResolved.pending_choice.options[0]?.id,
    last_amount: targetResolved.pending_choice.options.at(-1)?.id,
  }, {
    kind: "transfer_shield_between_friendly_creatures",
    stage: "amount_choice_required",
    ability_id: "lantern-shelter",
    amount_option_count: 21,
    first_amount: "shield-amount:0",
    last_amount: "shield-amount:20",
  });

  const amountChoice = targetResolved.pending_choice;
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    amountChoice,
    1,
    amountChoice.id,
    ["shield-amount:20"],
    s,
  ) as any;
  assertEquals({
    kind: resolved.kind,
    stage: resolved.stage,
    ability_id: resolved.ability_id,
    target_creature_uid: resolved.target_creature_uid,
    receipt: resolved.receipt,
  }, {
    kind: "transfer_shield_between_friendly_creatures",
    stage: "complete",
    ability_id: "lantern-shelter",
    target_creature_uid: "target-creature",
    receipt: {
      kind: "shield_transferred",
      requested_amount: 20,
      actual_shield_transferred: 20,
      source_shield_before: 30,
      source_shield_after: 10,
      destination_shield_before: 10,
      destination_shield_after: 30,
    },
  });
  assertEquals((s.players as any)["1"].vanguard.shield, 10);
  assertEquals((s.players as any)["1"].reserve[0].shield, 30);
});

Deno.test("Lantern Shelter amount choice is clamped by source Shield and canonical destination capacity", () => {
  const s = state({ sourceShield: 12, targetShield: 55 });
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    {
      where: "vanguard",
      index: null,
      instance: card("source-creature", "test-abyssalume"),
    },
    "capacity-target",
  )!;
  const targetResolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "capacity-target",
    ["creature:reserve:0:target-creature"],
    s,
  ) as any;
  assertEquals(
    targetResolved.pending_choice.options.map((option: any) => option.id),
    [
      "shield-amount:0",
      "shield-amount:1",
      "shield-amount:2",
      "shield-amount:3",
      "shield-amount:4",
      "shield-amount:5",
    ],
  );
  const amountChoice = targetResolved.pending_choice;
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    amountChoice,
    1,
    amountChoice.id,
    ["shield-amount:5"],
    s,
  ) as any;
  assertEquals(resolved.receipt.actual_shield_transferred, 5);
  assertEquals((s.players as any)["1"].vanguard.shield, 7);
  assertEquals((s.players as any)["1"].reserve[0].shield, 60);
});

Deno.test("Lantern Shelter preflight cannot consume Ability use when source Shield or legal target is missing", () => {
  let s = state({ sourceShield: 0 });
  assertThrows(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      s,
      1,
      {
        where: "vanguard",
        index: null,
        instance: card("source-creature", "test-abyssalume"),
      },
      "no-shield",
    ),
    "source_shield_insufficient",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "lantern-shelter"), 0);

  s = state({ includeTarget: false });
  assertThrows(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      s,
      1,
      {
        where: "vanguard",
        index: null,
        instance: card("source-creature", "test-abyssalume"),
      },
      "no-target",
    ),
    "target_unavailable",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "lantern-shelter"), 0);
});

Deno.test("Lantern Shelter amount stage fails closed when anchored target Shield changes", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    {
      where: "vanguard",
      index: null,
      instance: card("source-creature", "test-abyssalume"),
    },
    "changed-target",
  )!;
  const targetResolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "changed-target",
    ["creature:reserve:0:target-creature"],
    s,
  ) as any;
  const amountChoice = targetResolved.pending_choice;
  (s.players as any)["1"].reserve[0].shield = 59;
  assertThrows(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      amountChoice,
      1,
      amountChoice.id,
      ["shield-amount:20"],
      s,
    ),
    "amount_changed",
  );
});
