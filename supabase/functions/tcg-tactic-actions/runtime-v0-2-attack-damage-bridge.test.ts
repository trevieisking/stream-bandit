import {
  structuredRuntimeIncomingAttackDamage,
  structuredRuntimeOutgoingAttackDamage,
  type RuntimeAttackDamageContext,
} from "../_shared/tcg-match-attack-damage-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

function structuredEntry(cardId: string, definition: Record<string, unknown>) {
  return {
    card_id: cardId,
    definition: { id: cardId, recipe_type: "legacy" },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: definition.card_family || "Essence",
      ...definition,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function markedState(entries: Record<string, Record<string, unknown>>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: entries,
  } as Record<string, unknown>;
}

function essence(cardId: string, continuous: Record<string, unknown>[]) {
  return structuredEntry(cardId, {
    card_family: "Essence",
    essence: { continuous },
  });
}

function continuousCreature(
  cardId: string,
  abilityId: string,
  continuous: Record<string, unknown>[],
) {
  return structuredEntry(cardId, {
    card_family: "Creature",
    creature: {
      withdrawal: 1,
      ability: {
        id: abilityId,
        mode: "continuous",
        timing: "passive",
        limit: null,
        continuous,
      },
    },
  });
}

const whisper = essence("shade-whisper-essence", [{
  id: "whisper-conditioned-pressure",
  kind: "attack_damage",
  target: "$attached_creature",
  when: { predicate: "target_has_any_condition", target: "$current_opponent_vanguard" },
  amount: 10,
  filters: { target_zone: "vanguard", target_controller: "opponent" },
}]);

const anchor = essence("stone-anchor-essence", [{
  id: "anchor-armour",
  kind: "incoming_attack_damage",
  target: "$attached_creature",
  when: null,
  amount: -10,
  filters: { source_controller: "opponent" },
}]);

const attackerEntry = structuredEntry("shade-test-attacker", {
  card_family: "Creature",
  element: "Shade",
  creature: { withdrawal: 1 },
});

const targetEntry = structuredEntry("stone-test-target", {
  card_family: "Creature",
  element: "Stone",
  creature: { withdrawal: 2 },
});

const opponentVanguardConditioned: RuntimeAttackDamageContext = {
  target_zone: "vanguard",
  target_controller: "opponent",
  source_controller: "opponent",
  target_has_any_condition: true,
};

const glowcub = continuousCreature("ember-glowcub", "warm-blood", [{
  id: "warm-blood-spark-pounce",
  kind: "attack_damage",
  target: "$source_creature",
  when: { predicate: "source_damaged" },
  amount: 10,
  filters: { attack_id: "spark-pounce" },
}]);

const murkmite = continuousCreature("shade-murkmite", "murk-sense", [{
  id: "murk-sense-murk-nip",
  kind: "attack_damage",
  target: "$source_creature",
  when: {
    predicate: "control_condition_present",
    target: "$current_opponent_vanguard",
  },
  amount: 10,
  filters: { attack_id: "murk-nip" },
}]);

const quartzram = continuousCreature("stone-quartzram", "prismatic-bulwark", [{
  id: "prismatic-bulwark-prism-ram",
  kind: "attack_damage",
  target: "$source_creature",
  when: { predicate: "source_has_shield_at_least", value: 1 },
  amount: 20,
  filters: { attack_id: "prism-ram" },
}]);

Deno.test("legacy-only match keeps attack-damage resolver on legacy fallback", () => {
  const state = {
    card_index: {
      "shade-whisper-essence": { card_id: "shade-whisper-essence", definition: { id: "shade-whisper-essence" } },
    },
  } as Record<string, unknown>;
  const attacker = { essence: [{ uid: "w", card_id: "shade-whisper-essence" }] };
  const target = { essence: [] };
  assertEquals(structuredRuntimeOutgoingAttackDamage(state, attacker, target, 80, opponentVanguardConditioned), null);
  assertEquals(structuredRuntimeIncomingAttackDamage(state, attacker, target, 80, opponentVanguardConditioned), null);
});

Deno.test("structured Whisper adds 10 only against a conditioned opposing Vanguard", () => {
  const state = markedState({
    "shade-test-attacker": attackerEntry,
    "stone-test-target": targetEntry,
    "shade-whisper-essence": whisper,
  });
  const attacker = { essence: [{ uid: "w", card_id: "shade-whisper-essence" }] };
  const target = { essence: [] };

  assertEquals(structuredRuntimeOutgoingAttackDamage(state, attacker, target, 80, opponentVanguardConditioned), 90);
  assertEquals(structuredRuntimeOutgoingAttackDamage(state, attacker, target, 80, {
    ...opponentVanguardConditioned,
    target_has_any_condition: false,
  }), 80);
  assertEquals(structuredRuntimeOutgoingAttackDamage(state, attacker, target, 80, {
    ...opponentVanguardConditioned,
    target_zone: "reserve",
  }), 80);
  assertEquals(structuredRuntimeOutgoingAttackDamage(state, attacker, target, 80, {
    ...opponentVanguardConditioned,
    target_controller: "self",
    source_controller: "self",
  }), 80);
});

Deno.test("structured Anchor reduces only opponent-sourced incoming attack damage and respects zero floor", () => {
  const state = markedState({
    "shade-test-attacker": attackerEntry,
    "stone-test-target": targetEntry,
    "stone-anchor-essence": anchor,
  });
  const attacker = { essence: [] };
  const target = { essence: [{ uid: "a1", card_id: "stone-anchor-essence" }, { uid: "a2", card_id: "stone-anchor-essence" }] };

  assertEquals(structuredRuntimeIncomingAttackDamage(state, attacker, target, 80, opponentVanguardConditioned), 60);
  assertEquals(structuredRuntimeIncomingAttackDamage(state, attacker, target, 5, opponentVanguardConditioned), 0);
  assertEquals(structuredRuntimeIncomingAttackDamage(state, attacker, target, 80, {
    ...opponentVanguardConditioned,
    target_controller: "self",
    source_controller: "self",
  }), 80);
});

Deno.test("structured outgoing and incoming layers preserve Crushed timing between Whisper and Anchor", () => {
  const state = markedState({
    "shade-test-attacker": attackerEntry,
    "stone-test-target": targetEntry,
    "shade-whisper-essence": whisper,
    "stone-anchor-essence": anchor,
  });
  const attacker = { essence: [{ uid: "w", card_id: "shade-whisper-essence" }] };
  const target = { essence: [{ uid: "a", card_id: "stone-anchor-essence" }] };

  const outgoing = structuredRuntimeOutgoingAttackDamage(state, attacker, target, 80, opponentVanguardConditioned);
  assertEquals(outgoing, 90);
  const afterCrushed = Number(outgoing) + 20;
  assertEquals(structuredRuntimeIncomingAttackDamage(state, attacker, target, afterCrushed, opponentVanguardConditioned), 100);
});

Deno.test("marked mixed structured and legacy card indexes fail closed instead of mixing attack engines", () => {
  const state = markedState({
    "shade-test-attacker": attackerEntry,
    "stone-test-target": targetEntry,
    "shade-whisper-essence": {
      card_id: "shade-whisper-essence",
      definition: { id: "shade-whisper-essence" },
    },
  });
  assertThrows(
    () => structuredRuntimeOutgoingAttackDamage(
      state,
      { essence: [{ uid: "w", card_id: "shade-whisper-essence" }] },
      { essence: [] },
      80,
      opponentVanguardConditioned,
    ),
    "tcg_v0_2_snapshot_definition_missing:shade-whisper-essence",
  );
});

Deno.test("Creature-owned continuous outgoing Attack damage is generic across Release 1 predicates", () => {
  const state = markedState({
    "ember-glowcub": glowcub,
    "shade-murkmite": murkmite,
    "stone-quartzram": quartzram,
    "stone-test-target": targetEntry,
  });
  const target = {
    stack: [{ uid: "target", card_id: "stone-test-target" }],
    essence: [],
    damage: 0,
    shield: 0,
  };

  const baseContext: RuntimeAttackDamageContext = {
    target_zone: "reserve",
    target_controller: "opponent",
    source_controller: "opponent",
    target_has_any_condition: false,
    current_opponent_vanguard_control_condition: null,
  };

  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "glow", card_id: "ember-glowcub" }],
        essence: [],
        damage: 10,
        shield: 0,
      },
      target,
      20,
      { ...baseContext, attack_id: "spark-pounce" },
    ),
    30,
    "Glowcub should use canonical source_damaged evaluation",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "glow", card_id: "ember-glowcub" }],
        essence: [],
        damage: 0,
        shield: 0,
      },
      target,
      20,
      { ...baseContext, attack_id: "spark-pounce" },
    ),
    20,
    "Glowcub should not gain damage while undamaged",
  );

  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "murk", card_id: "shade-murkmite" }],
        essence: [],
        damage: 0,
        shield: 0,
      },
      target,
      20,
      {
        ...baseContext,
        attack_id: "murk-nip",
        current_opponent_vanguard_control_condition: "Blinded",
      },
    ),
    30,
    "Murkmite should read current opponent Vanguard control state, not the attacked zone",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "murk", card_id: "shade-murkmite" }],
        essence: [],
        damage: 0,
        shield: 0,
      },
      target,
      20,
      { ...baseContext, attack_id: "murk-nip" },
    ),
    20,
    "Murkmite should not gain damage without a control condition",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "murk", card_id: "shade-murkmite" }],
        essence: [],
        damage: 0,
        shield: 0,
      },
      target,
      20,
      {
        ...baseContext,
        attack_id: "other-attack",
        current_opponent_vanguard_control_condition: "Blinded",
      },
    ),
    20,
    "Creature continuous filters must bind to the exact attack id",
  );

  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "quartz", card_id: "stone-quartzram" }],
        essence: [],
        damage: 0,
        shield: 10,
      },
      target,
      20,
      { ...baseContext, attack_id: "prism-ram" },
    ),
    40,
    "Quartzram should use canonical source_has_shield_at_least evaluation",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(
      state,
      {
        stack: [{ uid: "quartz", card_id: "stone-quartzram" }],
        essence: [],
        damage: 0,
        shield: 0,
      },
      target,
      20,
      { ...baseContext, attack_id: "prism-ram" },
    ),
    20,
    "Quartzram should not gain damage without Shield",
  );
});

