import {
  runtimeV02BuildActiveAbilitySelectedHealEachChoice,
  runtimeV02PendingActiveAbilitySelectedHealEachChoiceView,
  runtimeV02ResolveActiveAbilitySelectedHealEachChoice,
  structuredRuntimeActiveAbilitySelectedHealEach,
} from "../_shared/tcg-match-active-ability-selected-heal-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
  runtimeV02RecordActiveAbilityUse,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
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
function inst(uid: string, cardId: string) { return { uid, card_id: cardId }; }
function creature(uid: string, cardId: string, damage = 0) {
  return { stack: [inst(uid, cardId)], essence: [], relic: null, damage, shield: 0 };
}
function ability() {
  return {
    id: "first-canopy",
    name: "First Canopy",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: { all: [{ predicate: "reserve_count_at_least", controller: "self", count: 3 }] },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: { min: 0, max: 2 },
        filters: { damaged: true },
        as: "canopy_targets",
      },
      { op: "HEAL_EACH", targets: "$canopy_targets", amount: 20 },
    ],
  };
}
function definition(id: string, element: string, activeAbility: Record<string, unknown> | null = null) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Creature",
      element,
      creature: { stage: "Standalone", hp: 100, withdrawal: 1, reward_value: 1, ability: activeAbility, attacks: [] },
      essence: null,
      tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 21,
    active_seat: 1,
    effect_events: [],
    players: {
      "1": {
        vanguard: creature("elder-uid", "test-elderbloom", 10),
        reserve: [
          creature("r1", "test-grove-a", 15),
          creature("r2", "test-tide-b", 30),
          creature("r3", "test-grove-c", 0),
          null,
        ],
        deck: [], hand: [], discard: [], rewards: [],
      },
      "2": {
        vanguard: creature("opp", "test-opponent", 0),
        reserve: [null, null, null, null],
        deck: [], hand: [], discard: [], rewards: [],
      },
    },
    card_index: {
      "test-elderbloom": definition("test-elderbloom", "Grove", ability()),
      "test-grove-a": definition("test-grove-a", "Grove"),
      "test-tide-b": definition("test-tide-b", "Tide"),
      "test-grove-c": definition("test-grove-c", "Grove"),
      "test-opponent": definition("test-opponent", "Stone"),
    },
  } as Record<string, any>;
}
function source() {
  return { where: "vanguard" as const, index: null, instance: inst("elder-uid", "test-elderbloom") };
}

Deno.test("Elderbloom-shaped selected HEAL_EACH is recognized generically", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilitySelectedHealEach(s, { card_id: "test-elderbloom" });
  equal(descriptor, {
    ability_id: "first-canopy",
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    reserve_count_at_least: 3,
    target: { controller: "self", zone: "field", min: 0, max: 2, damaged: true },
    heal_amount: 20,
  });
});

Deno.test("bounded multi-target choice is private, anchored and may select zero", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilitySelectedHealEach(s, { card_id: "test-elderbloom" })!;
  const choice = runtimeV02BuildActiveAbilitySelectedHealEachChoice(
    s, 1, descriptor, source(), "canopy-choice",
  );
  equal(choice.min, 0);
  equal(choice.max, 2);
  equal(choice.options.map((x) => x.id), [
    "creature:vanguard:elder-uid",
    "creature:reserve:0:r1",
    "creature:reserve:1:r2",
  ]);
  equal(runtimeV02PendingActiveAbilitySelectedHealEachChoiceView(choice, 2), {
    id: "canopy-choice", seat: 1, kind: "heal_each_selected_damaged_friendly_creature", waiting: true,
  });

  runtimeV02RecordActiveAbilityUse(s, 1, "first-canopy");
  const zero = runtimeV02ResolveActiveAbilitySelectedHealEachChoice(
    choice, 1, "canopy-choice", [], s,
  );
  equal(zero.selected_count, 0);
  equal(zero.actual_heal_total, 0);
  equal(zero.emitted_packet_ids, []);
  equal((s.effect_events as unknown[]).length, 0);
});

Deno.test("multi-target resolution preflights all selections then emits one canonical packet per healed Creature", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilitySelectedHealEach(s, { card_id: "test-elderbloom" })!;
  const choice = runtimeV02BuildActiveAbilitySelectedHealEachChoice(
    s, 1, descriptor, source(), "canopy-choice",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, "first-canopy");
  const resolved = runtimeV02ResolveActiveAbilitySelectedHealEachChoice(
    choice,
    1,
    "canopy-choice",
    ["creature:reserve:0:r1", "creature:reserve:1:r2"],
    s,
  );
  equal(resolved.selected_count, 2);
  equal(resolved.requested_heal_each, 20);
  equal(resolved.actual_heal_total, 35);
  equal(resolved.actual_heals, [
    { target_uid: "r1", requested_heal: 20, actual_heal: 15 },
    { target_uid: "r2", requested_heal: 20, actual_heal: 20 },
  ]);
  equal(resolved.emitted_packet_ids, ["heal:21:1", "heal:21:2"]);
  equal((s.players as any)["1"].reserve[0].damage, 0);
  equal((s.players as any)["1"].reserve[1].damage, 10);
  equal((s.effect_events as any[]).map((e) => e.source?.action_kind), ["ability", "ability"]);
});

Deno.test("a stale target set fails before any selected target is healed", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilitySelectedHealEach(s, { card_id: "test-elderbloom" })!;
  const choice = runtimeV02BuildActiveAbilitySelectedHealEachChoice(
    s, 1, descriptor, source(), "canopy-choice",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, "first-canopy");
  (s.players as any)["1"].reserve[1].damage = 0;
  const before = (s.players as any)["1"].reserve[0].damage;
  throws(
    () => runtimeV02ResolveActiveAbilitySelectedHealEachChoice(
      choice, 1, "canopy-choice", ["creature:reserve:0:r1", "creature:reserve:1:r2"], s,
    ),
    "target_set_changed",
  );
  equal((s.players as any)["1"].reserve[0].damage, before);
  equal((s.effect_events as any[]).length, 0);
});

Deno.test("live active-Ability facade uses the same selected-heal owner and canonical once-per-turn receipt", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s, 1, source(), "live-canopy-choice",
  )!;
  equal(pending.kind, "heal_each_selected_damaged_friendly_creature");
  equal(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "first-canopy"), 1);
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "live-canopy-choice",
    ["creature:reserve:0:r1", "creature:reserve:1:r2"],
    s,
  );
  equal(resolved.kind, "heal_each_selected_damaged_friendly_creature");
  if (resolved.kind !== "heal_each_selected_damaged_friendly_creature") {
    throw new Error("heal-each live resolution required");
  }
  equal(resolved.actual_heal_total, 35);
  equal(resolved.emitted_packet_ids, ["heal:21:1", "heal:21:2"]);
});
