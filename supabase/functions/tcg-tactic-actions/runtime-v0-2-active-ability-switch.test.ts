import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  evaluateRuntimeV02SourceInPlayRequirement,
  normalizeRuntimeV02SourceInPlayRequirement,
} from "../_shared/tcg-match-requirement-evaluator-v0-2.ts";
import {
  runtimeV02ResumeActiveAbilitySwitch,
} from "../_shared/tcg-match-active-ability-switch-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function eq(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
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

function creature(uid: string, cardId: string) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    flags: {},
  };
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

function stormShepherdAbility() {
  return {
    id: "storm-shepherd",
    name: "Storm Shepherd",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [
        { predicate: "source_in_play" },
        {
          predicate: "legal_card_available",
          controller: "self",
          zone: "reserve",
          filters: { card_family: "Creature", element: "Gale" },
        },
      ],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "reserve",
        count: 1,
        filters: { element: "Gale" },
        as: "switch_target",
      },
      {
        op: "SWITCH_WITH_VANGUARD",
        player: "self",
        target: "$switch_target",
        action_kind: "effect_switch",
      },
    ],
  };
}

function state(options: {
  sourceWhere?: "vanguard" | "reserve";
  targetElement?: string;
  includeSecondReserve?: boolean;
} = {}) {
  const sourceWhere = options.sourceWhere ?? "vanguard";
  const sourceId = "test-aeralith";
  const targetId = "test-gale-target";
  const vanguardId = "test-gale-vanguard";
  const source = creature("source-creature", sourceId);
  const vanguard = sourceWhere === "vanguard"
    ? source
    : creature("vanguard-creature", vanguardId);
  const reserve = [
    sourceWhere === "reserve" ? source : creature("target-creature", targetId),
    options.includeSecondReserve === false
      ? null
      : sourceWhere === "reserve"
      ? creature("target-creature", targetId)
      : null,
    null,
    null,
  ];
  const targetElement = options.targetElement ?? "Gale";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 23,
    active_seat: 1,
    players: {
      "1": {
        vanguard,
        reserve,
        deck: [],
        hand: [],
        discard: [],
        void: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        discard: [],
        void: [],
        rewards: [],
      },
    },
    card_index: {
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: {
          ...envelope(sourceId, "Aeralith Test", "Gale"),
          creature: {
            stage: "Standalone",
            ability: stormShepherdAbility(),
            attacks: [],
          },
        },
      },
      [targetId]: {
        card_id: targetId,
        definition_v0_2: {
          ...envelope(targetId, "Gale Target", targetElement),
          creature: { stage: "Standalone", ability: null, attacks: [] },
        },
      },
      [vanguardId]: {
        card_id: vanguardId,
        definition_v0_2: {
          ...envelope(vanguardId, "Gale Vanguard", "Gale"),
          creature: { stage: "Standalone", ability: null, attacks: [] },
        },
      },
    },
  } as Record<string, unknown>;
}

Deno.test("source_in_play is a strict shared state predicate", () => {
  eq(normalizeRuntimeV02SourceInPlayRequirement({ predicate: "source_in_play" }), {
    predicate: "source_in_play",
  });
  eq(
    evaluateRuntimeV02SourceInPlayRequirement(
      creature("source", "test"),
      { predicate: "source_in_play" },
    ),
    { predicate: "source_in_play", matched: true },
  );
  eq(
    evaluateRuntimeV02SourceInPlayRequirement(
      null,
      { predicate: "source_in_play" },
    ),
    { predicate: "source_in_play", matched: false },
  );
  throws(
    () => normalizeRuntimeV02SourceInPlayRequirement({
      predicate: "source_in_play",
      zone: "vanguard",
    }),
    "tcg_v0_2_requirement_source_in_play_field_unsupported:zone",
  );
});

Deno.test("Storm Shepherd switches a chosen Gale Reserve through the canonical atomic switch owner", () => {
  const s = state({ includeSecondReserve: false });
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    {
      where: "vanguard",
      index: null,
      instance: card("source-creature", "test-aeralith"),
    },
    "switch-choice",
  )!;
  eq(pending.kind, "switch_with_vanguard");
  eq(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "storm-shepherd"), 1);
  eq(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1), {
    id: "switch-choice",
    seat: 1,
    kind: "switch_with_vanguard",
    prompt: "Choose one friendly Gale Reserve Creature",
    min: 1,
    max: 1,
    options: [{
      id: "creature:reserve:0:target-creature",
      label: "Reserve 1",
    }],
  });

  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "switch-choice",
    ["creature:reserve:0:target-creature"],
    s,
  ) as any;

  eq(resolved.kind, "switch_with_vanguard");
  eq(resolved.movement_events.map((event: any) => event.event), [
    "moved_to_reserve",
    "became_vanguard",
  ]);
  eq((s.players as any)["1"].vanguard.stack[0].uid, "target-creature");
  eq((s.players as any)["1"].reserve[0].stack[0].uid, "source-creature");
  eq(resolved.resume.kind, "switch_after_movement");
  eq(runtimeV02ResumeActiveAbilitySwitch(s, resolved.resume), {
    kind: "switch_after_movement",
    ability_id: "storm-shepherd",
    switch_id: resolved.switch_id,
    target_reserve_index: 0,
  });
});

Deno.test("Storm Shepherd can activate from Reserve and select itself as the incoming Vanguard", () => {
  const s = state({ sourceWhere: "reserve", includeSecondReserve: false });
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    {
      where: "reserve",
      index: 0,
      instance: card("source-creature", "test-aeralith"),
    },
    "reserve-source",
  )!;
  eq((pending as any).options.map((option: any) => option.id), [
    "creature:reserve:0:source-creature",
  ]);
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "reserve-source",
    ["creature:reserve:0:source-creature"],
    s,
  ) as any;
  eq((s.players as any)["1"].vanguard.stack[0].uid, "source-creature");
  eq((s.players as any)["1"].reserve[0].stack[0].uid, "vanguard-creature");
  eq(resolved.target_reserve_index, 0);
});

Deno.test("Storm Shepherd target preflight fails without consuming an Ability receipt", () => {
  const s = state({
    targetElement: "Stone",
    includeSecondReserve: false,
  });
  throws(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      s,
      1,
      {
        where: "vanguard",
        index: null,
        instance: card("source-creature", "test-aeralith"),
      },
      "no-target",
    ),
    "tcg_v0_2_active_ability_switch_target_unavailable",
  );
  eq(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "storm-shepherd"), 0);
});

Deno.test("Storm Shepherd fails closed if the chosen Reserve anchor changes", () => {
  const s = state({ includeSecondReserve: false });
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    {
      where: "vanguard",
      index: null,
      instance: card("source-creature", "test-aeralith"),
    },
    "stale-target",
  )!;
  (s.players as any)["1"].reserve[0] = creature("replacement", "test-gale-target");
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      pending,
      1,
      "stale-target",
      ["creature:reserve:0:target-creature"],
      s,
    ),
    "tcg_v0_2_active_ability_switch_target_changed",
  );
});
