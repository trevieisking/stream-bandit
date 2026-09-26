import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CurrentTurnHiddenInformationViews,
} from "../_shared/tcg-match-hidden-information-v0-2.ts";
import {
  runtimeV02ScheduledActions,
} from "../_shared/tcg-match-scheduled-action-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) {
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
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}
function definition(id: string, name: string, ability: Record<string, unknown> | null = null) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element: "Shade",
    creature: {
      stage: "Adult",
      hp: 200,
      withdrawal: 1,
      reward_value: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}
function readingAbility() {
  return {
    id: "deck-reading-shape",
    name: "Deck Reading Shape",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [
      {
        op: "INSPECT_ZONE",
        player: "opponent",
        zone: "deck_top",
        selection: { min: 1, max: 1, filters: {} },
        visibility: "controller_private",
        return_policy: "same_position",
        as: "looked",
      },
      { op: "CHOOSE_FROM_SET", source: "$looked", min: 0, max: 1, as: "bottom" },
      { op: "MOVE_CARDS", player: "opponent", cards: "$bottom", to: "deck_bottom" },
      {
        op: "IF",
        when: { predicate: "selected_count_at_least", set: "$bottom", count: 1 },
        then: [{
          op: "SCHEDULE_ACTION",
          owner: "self",
          trigger: "controller_aftermath_finished",
          match_must_be_active: true,
          steps: [{
            op: "DRAW_FIXED",
            player: "opponent",
            count: 1,
            deckout_on_incomplete: true,
          }],
        }],
      },
    ],
  };
}
function state() {
  const sourceId = "test-reader";
  const topId = "test-top";
  const nextId = "test-next";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 5,
    active_seat: 1,
    phase: "play",
    card_index: {
      [sourceId]: { definition_v0_2: definition(sourceId, "Reader", readingAbility()) },
      [topId]: { definition_v0_2: definition(topId, "Known Top") },
      [nextId]: { definition_v0_2: definition(nextId, "Next Card") },
    },
    players: {
      "1": {
        vanguard: creature("source-uid", sourceId),
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: creature("opp-uid", nextId),
        reserve: [null, null, null, null],
        deck: [card("top-uid", topId), card("next-uid", nextId)],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
  } as Record<string, unknown> & any;
}
function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-uid", "test-reader"),
  };
}

Deno.test("deck-reading active Ability opens one controller-private optional top-card choice and records its use", () => {
  const match = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(match, 1, source(), "read-choice");
  if (!pending || pending.kind !== "inspect_opponent_deck_top_then_optional_bottom") {
    throw new Error("deck-reading choice required");
  }
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(match, 1, "deck-reading-shape"), 1);
  equal(runtimeV02CurrentTurnHiddenInformationViews(match, 1), [{
    turn_seq: 5,
    controller_seat: 1,
    zone: "deck_top",
  }]);
  equal(runtimeV02CurrentTurnHiddenInformationViews(match, 2), []);
  equal(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 2), {
    id: "read-choice",
    seat: 1,
    kind: pending.kind,
    waiting: true,
  });
  const own = runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1) as any;
  equal(own.min, 0);
  equal(own.max, 1);
  equal(own.options[0].card_id, "test-top");
});

Deno.test("selecting the inspected card reorders the exact opponent deck card and schedules the deferred fixed draw", () => {
  const match = state();
  const top = match.players["2"].deck[0];
  const pending = runtimeV02CreateActiveAbilityLiveChoice(match, 1, source(), "read-choice");
  if (!pending || pending.kind !== "inspect_opponent_deck_top_then_optional_bottom") {
    throw new Error("deck-reading choice required");
  }
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    pending.id,
    [pending.option.id],
    match,
  );
  equal(resolved.kind, "inspect_opponent_deck_top_then_optional_bottom");
  equal((resolved as any).selected_count, 1);
  equal((resolved as any).moved_to_deck_bottom_count, 1);
  equal(match.players["2"].deck.map((row: any) => row.uid), ["next-uid", "top-uid"]);
  if (!Object.is(match.players["2"].deck[1], top)) throw new Error("deck reorder cloned inspected card");
  equal(runtimeV02ScheduledActions(match).length, 1);
  equal(runtimeV02ScheduledActions(match)[0].steps[0].op, "DRAW_FIXED");
});

Deno.test("declining the optional bottom move leaves deck order unchanged and shared Ability IF schedules nothing", () => {
  const match = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(match, 1, source(), "read-choice");
  if (!pending || pending.kind !== "inspect_opponent_deck_top_then_optional_bottom") {
    throw new Error("deck-reading choice required");
  }
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    pending.id,
    [],
    match,
  );
  equal((resolved as any).selected_count, 0);
  equal((resolved as any).scheduled_action_id, null);
  equal(match.players["2"].deck.map((row: any) => row.uid), ["top-uid", "next-uid"]);
  equal(runtimeV02ScheduledActions(match), []);
});

Deno.test("deck-reading pending choice fails closed when the opponent deck top changes", () => {
  const match = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(match, 1, source(), "read-choice");
  if (!pending || pending.kind !== "inspect_opponent_deck_top_then_optional_bottom") {
    throw new Error("deck-reading choice required");
  }
  match.players["2"].deck.reverse();
  throws(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      pending,
      1,
      pending.id,
      [pending.option.id],
      match,
    ),
    "top_changed",
  );
});
