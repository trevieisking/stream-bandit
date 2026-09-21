import {
  runtimeV02BeginAttackSelectedShieldEachChoice,
  runtimeV02ResolveAttackSelectedShieldEachChoice,
  structuredRuntimeAfterDamageSelectedShieldEachChoice,
} from "../_shared/tcg-match-attack-shield-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(label);
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

function definition(id: string, name: string, element: string, attacks: unknown[] = []) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element,
    traits: [],
    prestige: { starbound: { enabled: false } },
    creature: {
      stage: "Standalone",
      hp: 200,
      withdrawal: 1,
      reward_value: 1,
      resistance: null,
      matchup_override: null,
      ability: null,
      attacks,
    },
    essence: null,
    tactic: null,
  };
}

function crownAttack() {
  return {
    id: "crown-of-stone",
    name: "Crown of Stone",
    cost: [{ element: "Stone", amount: 5 }],
    damage_element: "source_creature",
    base_damage: 160,
    damage_formula: null,
    requirements: [],
    on_declare: [],
    before_damage: [],
    after_damage: [
      { op: "ADD_SHIELD", target: "$source_creature", amount: 30 },
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: { min: 0, max: 2 },
        filters: { element: "Stone", exclude_source: true },
        as: "fortify_targets",
      },
      { op: "ADD_SHIELD_EACH", targets: "$fortify_targets", amount: 20 },
    ],
  };
}

function field(uid: string, cardId: string, shield = 0) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

function fixture() {
  const source = field("source-uid", "source-stone", 35);
  const stoneA = field("stone-a-uid", "stone-a", 45);
  const stoneB = field("stone-b-uid", "stone-b", 55);
  const ember = field("ember-uid", "ember-a", 0);
  const state: any = {
    turn_seq: 14,
    active_seat: 1,
    phase: "play",
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      "source-stone": { definition_v0_2: definition("source-stone", "Mountain Warden", "Stone", [crownAttack()]) },
      "stone-a": { definition_v0_2: definition("stone-a", "Stone Ally A", "Stone") },
      "stone-b": { definition_v0_2: definition("stone-b", "Stone Ally B", "Stone") },
      "ember-a": { definition_v0_2: definition("ember-a", "Ember Ally", "Ember") },
    },
    players: {
      "1": {
        vanguard: source,
        reserve: [stoneA, stoneB, ember, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field("opp-uid", "ember-a", 0),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
  return { state, source, stoneA, stoneB, ember };
}

Deno.test("Crown-style mixed after-damage Shield program is parsed generically", () => {
  const { state } = fixture();
  const descriptor = structuredRuntimeAfterDamageSelectedShieldEachChoice(
    state,
    { card_id: "source-stone" },
    1,
  );
  assert(descriptor, "descriptor required");
  equal(descriptor.attack_id, "crown-of-stone");
  equal(descriptor.source_shield, { target: "$source_creature", amount: 30 });
  equal(descriptor.selection, {
    controller: "self",
    zone: "field",
    min: 0,
    max: 2,
    filters: { element: "Stone", exclude_source: true },
    as: "fortify_targets",
  });
  equal(descriptor.shield_each, { targets: "$fortify_targets", amount: 20 });
});

Deno.test("Crown-style begin applies source Shield and exposes only legal filtered targets", () => {
  const { state, source } = fixture();
  const descriptor = structuredRuntimeAfterDamageSelectedShieldEachChoice(
    state,
    { card_id: "source-stone" },
    1,
  );
  assert(descriptor, "descriptor required");
  const begun = runtimeV02BeginAttackSelectedShieldEachChoice(
    state,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source-stone" },
    "shield-choice",
  );
  equal(begun.source_shield_requested, 30);
  equal(begun.source_shield_actual_gain, 25);
  equal(source.shield, 60);
  assert(begun.pending_choice, "pending choice required");
  equal(begun.pending_choice.min, 0);
  equal(begun.pending_choice.max, 2);
  equal(
    begun.pending_choice.options.map((option) => option.anchor_uid),
    ["stone-a-uid", "stone-b-uid"],
    "source and non-Stone targets must be excluded",
  );
});

Deno.test("Crown-style multi-select resolves up to two targets through the shared Shield cap", () => {
  const { state, stoneA, stoneB } = fixture();
  const descriptor = structuredRuntimeAfterDamageSelectedShieldEachChoice(
    state,
    { card_id: "source-stone" },
    1,
  );
  assert(descriptor, "descriptor required");
  const begun = runtimeV02BeginAttackSelectedShieldEachChoice(
    state,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source-stone" },
    "shield-choice",
  );
  const choice = begun.pending_choice;
  assert(choice, "pending choice required");
  const resolved = runtimeV02ResolveAttackSelectedShieldEachChoice(
    choice,
    1,
    choice.id,
    choice.options.map((option) => option.id),
    state,
  );
  equal(resolved.selected_count, 2);
  equal(resolved.actual_gain_total, 20);
  equal(stoneA.shield, 60);
  equal(stoneB.shield, 60);
  equal(resolved.targets.map((target) => target.actual_gain), [15, 5]);
});

Deno.test("Crown-style optional choice accepts zero selected targets", () => {
  const { state, stoneA, stoneB } = fixture();
  const descriptor = structuredRuntimeAfterDamageSelectedShieldEachChoice(
    state,
    { card_id: "source-stone" },
    1,
  );
  assert(descriptor, "descriptor required");
  const begun = runtimeV02BeginAttackSelectedShieldEachChoice(
    state,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source-stone" },
    "shield-choice",
  );
  const choice = begun.pending_choice;
  assert(choice, "pending choice required");
  const resolved = runtimeV02ResolveAttackSelectedShieldEachChoice(
    choice,
    1,
    choice.id,
    [],
    state,
  );
  equal(resolved.selected_count, 0);
  equal(resolved.actual_gain_total, 0);
  equal(stoneA.shield, 45);
  equal(stoneB.shield, 55);
});

Deno.test("Crown-style resolution rebinds every selected target before any target Shield mutation", () => {
  const { state, stoneA, stoneB } = fixture();
  const descriptor = structuredRuntimeAfterDamageSelectedShieldEachChoice(
    state,
    { card_id: "source-stone" },
    1,
  );
  assert(descriptor, "descriptor required");
  const begun = runtimeV02BeginAttackSelectedShieldEachChoice(
    state,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source-stone" },
    "shield-choice",
  );
  const choice = begun.pending_choice;
  assert(choice, "pending choice required");
  stoneB.stack[0] = { uid: "replacement-uid", card_id: "stone-b" };
  throws(
    () => runtimeV02ResolveAttackSelectedShieldEachChoice(
      choice,
      1,
      choice.id,
      choice.options.map((option) => option.id),
      state,
    ),
    "tcg_v0_2_attack_shield_choice_target_changed",
  );
  equal(stoneA.shield, 45, "first selected target must remain unchanged after second target goes stale");
  equal(stoneB.shield, 55, "stale target must remain unchanged");
});

Deno.test("Crown-style choice rejects stale turn and source movement", () => {
  const { state } = fixture();
  const descriptor = structuredRuntimeAfterDamageSelectedShieldEachChoice(
    state,
    { card_id: "source-stone" },
    1,
  );
  assert(descriptor, "descriptor required");
  const begun = runtimeV02BeginAttackSelectedShieldEachChoice(
    state,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source-stone" },
    "shield-choice",
  );
  const choice = begun.pending_choice;
  assert(choice, "pending choice required");
  state.turn_seq = 15;
  throws(
    () => runtimeV02ResolveAttackSelectedShieldEachChoice(choice, 1, choice.id, [], state),
    "tcg_v0_2_attack_shield_choice_turn_changed",
  );
});

Deno.test("mixed Shield family remains card-identity free", () => {
  const source = Deno.readTextFileSync(
    new URL("../_shared/tcg-match-attack-shield-choice-v0-2.ts", import.meta.url),
  );
  if (/stone-crowncrag|stone-reversal-seal|crown-of-stone/.test(source)) {
    throw new Error("card identity leaked into generic Attack shield-choice owner");
  }
});
