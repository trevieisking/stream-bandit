import { runtimeV02PendingAttackChoiceView } from "../_shared/tcg-match-attack-choice-v0-2.ts";
import {
  runtimeV02AttackOverchargeTriggered,
  runtimeV02CreateAttackOverchargeDiscardChoice,
  runtimeV02ResolveAttackOverchargeDiscardChoice,
  structuredRuntimeAfterDamageOverchargeDiscardCondition,
} from "../_shared/tcg-match-attack-overcharge-discard-choice-v0-2.ts";
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

function essenceDefinition(id: string, name: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Essence",
    element: "Volt",
    essence: { subtype: "Basic", provides: [{ element: "Volt", amount: 1 }] },
  };
}

function overchargeProgram() {
  return {
    on_declare: [
      {
        op: "RECORD_EVENT",
        event: "charged-strike-ready",
        when: { predicate: "event_attack_source_attached_essence_count_at_least", count: 4 },
      },
    ],
    before_damage: [],
    after_damage: [
      {
        op: "IF",
        when: {
          predicate: "event_occurred",
          event: "charged-strike-ready",
          controller: "self",
          window: "current_action",
          min_count: 1,
        },
        then: [
          {
            op: "DISCARD_ATTACHED_ESSENCE",
            target: "$source_creature",
            selection: { min: 1, max: 1, filters: {} },
          },
          {
            op: "IF",
            when: { predicate: "target_remains_in_play_after_damage" },
            then: [
              {
                op: "APPLY_CONDITION",
                target: "$attack_target",
                condition: "Stunned",
                mode: "apply_if_empty",
              },
            ],
          },
        ],
      },
    ],
  };
}

function stateWith(
  essenceCount = 4,
  targetControl: string | null = null,
  program = overchargeProgram(),
) {
  const sourceId = "test-overcharge-creature";
  const targetId = "test-target-creature";
  const essence = Array.from({ length: essenceCount }, (_, index) => card(`ess-${index + 1}`, `essence-${index + 1}`));
  const sourceDefinition = {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: sourceId,
    name: "Test Overcharger",
    card_family: "Creature",
    element: "Volt",
    creature: {
      stage: "Adult",
      hp: 250,
      attacks: [
        {
          id: "plain-hit",
          name: "Plain Hit",
          cost: [],
          base_damage: 40,
          damage_formula: null,
          requirements: [],
          on_declare: [],
          before_damage: [],
          after_damage: [],
        },
        {
          id: "charged-strike",
          name: "Charged Strike",
          cost: [],
          base_damage: 100,
          damage_formula: null,
          requirements: [],
          ...program,
        },
      ],
    },
  };
  const targetDefinition = {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: targetId,
    name: "Target Creature",
    card_family: "Creature",
    element: "Gale",
    creature: { stage: "Standalone", hp: 200, attacks: [] },
  };
  const cardIndex: Record<string, unknown> = {
    [sourceId]: { card_id: sourceId, definition_v0_2: sourceDefinition },
    [targetId]: { card_id: targetId, definition_v0_2: targetDefinition },
  };
  for (let i = 0; i < essenceCount; i++) {
    const id = `essence-${i + 1}`;
    cardIndex[id] = { card_id: id, definition_v0_2: essenceDefinition(id, `Volt Essence ${i + 1}`) };
  }
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 9,
    active_seat: 1,
    players: {
      "1": {
        vanguard: {
          stack: [card("source-1", sourceId)],
          essence,
          relic: null,
          damage: 0,
          shield: 0,
          conditions: { scorched: false, venomed: 0, control: null, modifier: null },
        },
        reserve: [null, null, null, null],
        discard: [],
      },
      "2": {
        vanguard: {
          stack: [card("target-1", targetId)],
          essence: [],
          relic: null,
          damage: 100,
          shield: 0,
          conditions: { scorched: false, venomed: 0, control: targetControl, modifier: null },
        },
        reserve: [null, null, null, null],
        discard: [],
      },
    },
    card_index: cardIndex,
  } as Record<string, unknown>;
}

function sourceCreature(state: Record<string, unknown>) {
  return (state.players as any)["1"].vanguard;
}

function targetBinding(state: Record<string, unknown>) {
  return {
    seat: 2 as const,
    where: "vanguard" as const,
    index: null,
    creature: (state.players as any)["2"].vanguard,
  };
}

Deno.test("overcharge family is registry-driven and leaves the plain sibling attack outside its owner", () => {
  const state = stateWith();
  assertEquals(structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 1), null);
  assertEquals(
    structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2),
    {
      attack_id: "charged-strike",
      phase: "after_damage",
      event: "charged-strike-ready",
      threshold: 4,
      discard: { min: 1, max: 1 },
      condition: { target: "$attack_target", condition: "Stunned", mode: "apply_if_empty" },
    },
  );
});

Deno.test("declaration threshold is snapshotted before damage and creates a private attached-Essence choice", () => {
  let state = stateWith(3);
  let descriptor = structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2)!;
  assertEquals(runtimeV02AttackOverchargeTriggered(descriptor, sourceCreature(state) as any), false);
  assertEquals(
    runtimeV02CreateAttackOverchargeDiscardChoice(
      state,
      1,
      descriptor,
      card("source-1", "test-overcharge-creature"),
      targetBinding(state),
      true,
      false,
      "choice-low",
    ),
    null,
  );

  state = stateWith(4);
  descriptor = structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2)!;
  assertEquals(runtimeV02AttackOverchargeTriggered(descriptor, sourceCreature(state) as any), true);
  const pending = runtimeV02CreateAttackOverchargeDiscardChoice(
    state,
    1,
    descriptor,
    card("source-1", "test-overcharge-creature"),
    targetBinding(state),
    true,
    true,
    "choice-1",
  )!;
  assertEquals(pending.options.map((option) => option.id), ["essence:ess-1", "essence:ess-2", "essence:ess-3", "essence:ess-4"]);
  assertEquals(runtimeV02PendingAttackChoiceView(pending, 2), {
    id: "choice-1",
    seat: 1,
    kind: "discard_attached_essence_then_condition",
    waiting: true,
  });
  assertEquals(runtimeV02PendingAttackChoiceView(pending, 1), {
    id: "choice-1",
    seat: 1,
    kind: "discard_attached_essence_then_condition",
    prompt: "Choose one attached Essence to discard",
    min: 1,
    max: 1,
    options: [
      { id: "essence:ess-1", label: "Volt Essence 1" },
      { id: "essence:ess-2", label: "Volt Essence 2" },
      { id: "essence:ess-3", label: "Volt Essence 3" },
      { id: "essence:ess-4", label: "Volt Essence 4" },
    ],
  });
});

Deno.test("resolution discards exactly the selected attached Essence then applies the condition when the target survived", () => {
  const state = stateWith(4);
  const descriptor = structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2)!;
  const pending = runtimeV02CreateAttackOverchargeDiscardChoice(
    state,
    1,
    descriptor,
    card("source-1", "test-overcharge-creature"),
    targetBinding(state),
    true,
    true,
    "choice-1",
  )!;
  const resolved = runtimeV02ResolveAttackOverchargeDiscardChoice(pending, 1, "choice-1", ["essence:ess-2"], state);
  assertEquals(resolved, {
    attack_id: "charged-strike",
    choice_id: "choice-1",
    discarded_uid: "ess-2",
    discarded_card_id: "essence-2",
    target_remained_after_damage: true,
    condition: "Stunned",
    condition_applied: true,
    condition_prevented: false,
    condition_reason: null,
  });
  assertEquals((state.players as any)["1"].vanguard.essence.map((item: any) => item.uid), ["ess-1", "ess-3", "ess-4"]);
  assertEquals((state.players as any)["1"].discard.map((item: any) => item.uid), ["ess-2"]);
  assertEquals((state.players as any)["2"].vanguard.conditions.control, "Stunned");
});

Deno.test("survival and occupied control-slot semantics stay exact", () => {
  let state = stateWith(4, "Dazed");
  let descriptor = structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2)!;
  let pending = runtimeV02CreateAttackOverchargeDiscardChoice(
    state,
    1,
    descriptor,
    card("source-1", "test-overcharge-creature"),
    targetBinding(state),
    true,
    true,
    "choice-occupied",
  )!;
  let resolved = runtimeV02ResolveAttackOverchargeDiscardChoice(pending, 1, "choice-occupied", ["essence:ess-1"], state);
  assertEquals(resolved.condition_applied, false);
  assertEquals(resolved.condition_reason, "slot_occupied");
  assertEquals((state.players as any)["2"].vanguard.conditions.control, "Dazed");

  state = stateWith(4);
  descriptor = structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2)!;
  pending = runtimeV02CreateAttackOverchargeDiscardChoice(
    state,
    1,
    descriptor,
    card("source-1", "test-overcharge-creature"),
    targetBinding(state),
    false,
    true,
    "choice-lethal",
  )!;
  resolved = runtimeV02ResolveAttackOverchargeDiscardChoice(pending, 1, "choice-lethal", ["essence:ess-1"], state);
  assertEquals(resolved.target_remained_after_damage, false);
  assertEquals(resolved.condition_applied, false);
  assertEquals((state.players as any)["2"].vanguard.conditions.control, null);
  assertEquals((state.players as any)["1"].discard.map((item: any) => item.uid), ["ess-1"]);
});

Deno.test("pending choice rejects wrong seat, stale id, turn, source, target and Essence drift", () => {
  const base = () => {
    const state = stateWith(4);
    const descriptor = structuredRuntimeAfterDamageOverchargeDiscardCondition(state, { card_id: "test-overcharge-creature" }, 2)!;
    const pending = runtimeV02CreateAttackOverchargeDiscardChoice(
      state,
      1,
      descriptor,
      card("source-1", "test-overcharge-creature"),
      targetBinding(state),
      true,
      true,
      "choice-1",
    )!;
    return { state, pending };
  };

  let pair = base();
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 2, "choice-1", ["essence:ess-1"], pair.state), "not_yours");
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 1, "old", ["essence:ess-1"], pair.state), "stale_id");
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 1, "choice-1", ["missing"], pair.state), "unknown_option");

  pair = base();
  pair.state.turn_seq = 10;
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 1, "choice-1", ["essence:ess-1"], pair.state), "turn_changed");

  pair = base();
  (pair.state.players as any)["1"].vanguard.stack[0] = card("source-2", "test-overcharge-creature");
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 1, "choice-1", ["essence:ess-1"], pair.state), "source_vanguard_changed");

  pair = base();
  (pair.state.players as any)["2"].vanguard.stack[0] = card("target-2", "test-target-creature");
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 1, "choice-1", ["essence:ess-1"], pair.state), "target_changed");

  pair = base();
  (pair.state.players as any)["1"].vanguard.essence[0] = card("ess-replaced", "essence-1");
  assertThrows(() => runtimeV02ResolveAttackOverchargeDiscardChoice(pair.pending, 1, "choice-1", ["essence:ess-1"], pair.state), "selected_essence_changed");
});

Deno.test("malformed near-family programs fail closed while unrelated and legacy snapshots remain outside the owner", () => {
  const mismatch = overchargeProgram() as any;
  mismatch.after_damage[0].when.event = "different-event";
  assertThrows(
    () => structuredRuntimeAfterDamageOverchargeDiscardCondition(stateWith(4, null, mismatch), { card_id: "test-overcharge-creature" }, 2),
    "outer_when_shape_unsupported",
  );

  const badSelection = overchargeProgram() as any;
  badSelection.after_damage[0].then[0].selection.max = 2;
  assertThrows(
    () => structuredRuntimeAfterDamageOverchargeDiscardCondition(stateWith(4, null, badSelection), { card_id: "test-overcharge-creature" }, 2),
    "selection_shape_unsupported",
  );

  const unrelated = overchargeProgram() as any;
  unrelated.on_declare[0].op = "DRAW";
  assertEquals(
    structuredRuntimeAfterDamageOverchargeDiscardCondition(stateWith(4, null, unrelated), { card_id: "test-overcharge-creature" }, 2),
    null,
  );

  const legacy = stateWith();
  delete legacy.runtime_registry_v0_2;
  assertEquals(
    structuredRuntimeAfterDamageOverchargeDiscardCondition(legacy, { card_id: "test-overcharge-creature" }, 2),
    null,
  );
});
