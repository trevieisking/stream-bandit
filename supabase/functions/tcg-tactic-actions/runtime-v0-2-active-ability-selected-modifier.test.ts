import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import { runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration } from "../_shared/tcg-match-attack-modifier-v0-2.ts";
import {
  runtimeV02ApplyDamageProtections,
  runtimeV02DamageProtectionCount,
} from "../_shared/tcg-match-damage-protection-v0-2.ts";
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

function creature(uid: string, cardId: string, damage = 0) {
  return { stack: [card(uid, cardId)], essence: [], relic: null, damage, shield: 0, flags: {} };
}

function attackModifierAbility() {
  return {
    id: "test-crown-pressure",
    name: "Crown Pressure",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [{
        predicate: "legal_card_available",
        controller: "self",
        zone: "field",
        filters: { card_family: "Creature", element: "Ember", damaged: true },
      }],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: 1,
        filters: { element: "Ember", damaged: true },
        as: "target",
      },
      {
        op: "ADD_ATTACK_DAMAGE_MODIFIER",
        target: "$target",
        amount: 30,
        duration: { expires_on: ["end_of_turn"], max_uses: 1, consume_on: "legal_attack_declared" },
        on_consume: {
          bind_to_consuming_action: true,
          timing: "after_attack_effects_before_defeat_scan",
          steps: [{ op: "DIRECT_DAMAGE", target: "$modifier_target", amount: 20, damage_class: "effect" }],
        },
      },
    ],
  };
}

function incomingModifierAbility() {
  return {
    id: "test-warden-guard",
    name: "Warden Guard",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [{
        predicate: "legal_card_available",
        controller: "self",
        zone: "field",
        filters: { card_family: "Creature", element: "Stone", exclude_source: true },
      }],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: 1,
        filters: { element: "Stone", exclude_source: true },
        as: "target",
      },
      {
        op: "ADD_INCOMING_ATTACK_DAMAGE_MODIFIER",
        target: "$target",
        amount: -40,
        filters: { source_controller: "opponent" },
        duration: { expires_on: ["opponent_next_turn_end"], max_uses: 1, consume_on: "successful_prevention" },
        minimum_prevention_to_consume: 1,
      },
    ],
  };
}

function selectedModifierState(kind: "attack" | "incoming", withTarget = true) {
  const sourceId = kind === "attack" ? "test-ember-source" : "test-stone-source";
  const targetId = kind === "attack" ? "test-ember-target" : "test-stone-target";
  const element = kind === "attack" ? "Ember" : "Stone";
  const source = creature("source-creature", sourceId, 0);
  const target = withTarget ? creature("target-creature", targetId, kind === "attack" ? 20 : 0) : null;
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 11,
    active_seat: 1,
    players: {
      "1": {
        vanguard: source,
        reserve: [target, null, null, null],
        deck: [],
        hand: [],
        rewards: [],
      },
      "2": {
        vanguard: creature("opponent-creature", "test-opponent", 0),
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
          ...envelope(sourceId, "Test Source", element),
          creature: {
            stage: "Standalone",
            ability: kind === "attack" ? attackModifierAbility() : incomingModifierAbility(),
            attacks: [],
          },
        },
      },
      [targetId]: {
        card_id: targetId,
        definition_v0_2: {
          ...envelope(targetId, "Test Target", element),
          creature: { stage: "Standalone", ability: null, attacks: [] },
        },
      },
      "test-opponent": {
        card_id: "test-opponent",
        definition_v0_2: {
          ...envelope("test-opponent", "Opponent", "Tide"),
          creature: { stage: "Standalone", ability: null, attacks: [] },
        },
      },
    },
  } as Record<string, unknown>;
}

Deno.test("selected outgoing active modifier uses the canonical Ability receipt and Attack #14 owner", () => {
  const state = selectedModifierState("attack");
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    state,
    1,
    { where: "vanguard", index: null, instance: card("source-creature", "test-ember-source") },
    "attack-modifier-choice",
  )!;
  assertEquals(pending.kind, "modify_one_friendly_creature");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "test-crown-pressure"), 1);
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1), {
    id: "attack-modifier-choice",
    seat: 1,
    kind: "modify_one_friendly_creature",
    prompt: "Choose one Ember Creature",
    min: 1,
    max: 1,
    options: [{ id: "creature:reserve:0:target-creature", label: "Reserve 1" }],
  });
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 2), {
    id: "attack-modifier-choice",
    seat: 1,
    kind: "modify_one_friendly_creature",
    waiting: true,
  });
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "attack-modifier-choice",
    ["creature:reserve:0:target-creature"],
    state,
  );
  assertEquals({
    kind: resolved.kind,
    ability_id: resolved.ability_id,
    modifier_kind: (resolved as any).modifier_kind,
    target_creature_uid: (resolved as any).target_creature_uid,
  }, {
    kind: "modify_one_friendly_creature",
    ability_id: "test-crown-pressure",
    modifier_kind: "attack_damage",
    target_creature_uid: "target-creature",
  });
  const target = (state.players as any)["1"].reserve[0];
  const consumed = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    target,
    {
      consuming_action_id: "attack:test",
      target_uid: "target-creature",
      turn_seq: 11,
      base_damage: 50,
    },
  )!;
  assertEquals({
    bonus_damage: consumed.bonus_damage,
    damage: consumed.damage,
    riders: consumed.bound_riders.length,
    rider_steps: consumed.bound_riders[0]?.steps,
  }, {
    bonus_damage: 30,
    damage: 80,
    riders: 1,
    rider_steps: [{ op: "DIRECT_DAMAGE", target: "$modifier_target", amount: 20, damage_class: "effect" }],
  });
});

Deno.test("selected incoming active modifier delegates to Damage Protection and survives through the opponent turn", () => {
  const state = selectedModifierState("incoming");
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    state,
    1,
    { where: "vanguard", index: null, instance: card("source-creature", "test-stone-source") },
    "incoming-modifier-choice",
  )!;
  assertEquals(pending.kind, "modify_one_friendly_creature");
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1), {
    id: "incoming-modifier-choice",
    seat: 1,
    kind: "modify_one_friendly_creature",
    prompt: "Choose one Stone Creature",
    min: 1,
    max: 1,
    options: [{ id: "creature:reserve:0:target-creature", label: "Reserve 1" }],
  });
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "incoming-modifier-choice",
    ["creature:reserve:0:target-creature"],
    state,
  );
  assertEquals({
    kind: resolved.kind,
    ability_id: resolved.ability_id,
    modifier_kind: (resolved as any).modifier_kind,
    target_creature_uid: (resolved as any).target_creature_uid,
  }, {
    kind: "modify_one_friendly_creature",
    ability_id: "test-warden-guard",
    modifier_kind: "incoming_attack_damage",
    target_creature_uid: "target-creature",
  });
  const target = (state.players as any)["1"].reserve[0];
  assertEquals(runtimeV02DamageProtectionCount(target), 1);
  const applied = runtimeV02ApplyDamageProtections(target, 70, {
    turn_seq: 12,
    active_seat: 2,
    source_controller_seat: 2,
    target_controller_seat: 1,
    target_creature_uid: "target-creature",
    damage_class: "attack",
    packet_id: "attack:test:12",
  });
  assertEquals({ final_amount: applied.final_amount, modifications: applied.modifications.length }, {
    final_amount: 30,
    modifications: 1,
  });
  assertEquals(runtimeV02DamageProtectionCount(target), 0);
});

Deno.test("selected modifier preflight cannot consume the Ability receipt when no legal target exists", () => {
  const state = selectedModifierState("incoming", false);
  assertThrows(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      state,
      1,
      { where: "vanguard", index: null, instance: card("source-creature", "test-stone-source") },
      "no-target",
    ),
    "target_unavailable",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "test-warden-guard"), 0);
});

Deno.test("selected modifier resolution fails closed when the anchored target set changes", () => {
  const state = selectedModifierState("incoming");
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    state,
    1,
    { where: "vanguard", index: null, instance: card("source-creature", "test-stone-source") },
    "stale-target",
  )!;
  (state.players as any)["1"].reserve[0] = null;
  assertThrows(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      pending,
      1,
      "stale-target",
      ["creature:reserve:0:target-creature"],
      state,
    ),
    "target_set_changed",
  );
});
