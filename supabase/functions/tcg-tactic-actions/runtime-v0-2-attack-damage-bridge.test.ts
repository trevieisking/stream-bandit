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

function relic(cardId: string, continuous: Record<string, unknown>[]) {
  return structuredEntry(cardId, {
    card_family: "Tactic",
    element: "Ember",
    tactic: {
      subtype: "Relic",
      play_requirements: [],
      program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: false, steps: [] },
      listeners: [],
      continuous,
    },
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

const cinderCharm = relic("ember-cinder-charm", [{
  id: "cinder-charm-pressure",
  kind: "attack_damage",
  target: "$attached_creature",
  when: { predicate: "target_element_is", target: "$attached_creature", element: "Ember" },
  value: {
    default: 10,
    cases: [{
      when: { predicate: "target_printed_hp_at_least", target: "$attached_creature", value: 200 },
      amount: 20,
    }],
  },
  filters: {},
}]);

const emberSmall = structuredEntry("ember-small", {
  card_family: "Creature",
  element: "Ember",
  creature: { hp: 190, withdrawal: 1 },
});
const emberLarge = structuredEntry("ember-large", {
  card_family: "Creature",
  element: "Ember",
  creature: { hp: 220, withdrawal: 1 },
});
const galeLarge = structuredEntry("gale-large", {
  card_family: "Creature",
  element: "Gale",
  creature: { hp: 220, withdrawal: 1 },
});

const quartzram = continuousCreature("stone-quartzram", "prismatic-bulwark", [{
  id: "prismatic-bulwark-prism-ram",
  kind: "attack_damage",
  target: "$source_creature",
  when: { predicate: "source_has_shield_at_least", value: 1 },
  amount: 20,
  filters: { attack_id: "prism-ram" },
}]);

const kilnback = continuousCreature("ember-kilnback", "furnace-hide", [{
  id: "furnace-hide-reduction",
  kind: "incoming_attack_damage",
  target: "$source_creature",
  when: { predicate: "source_has_condition", condition: "Scorched" },
  amount: -10,
  filters: { source_controller: "opponent" },
}]);

const wingclipCharm = structuredEntry("gale-wingclip-charm", {
  card_family: "Tactic",
  element: "Gale",
  tactic: {
    subtype: "Relic",
    play_requirements: [],
    program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: false, steps: [] },
    listeners: [],
    continuous: [{
      id: "wingclip-vanguard-pressure",
      kind: "attack_damage",
      target: "$attached_creature",
      when: { predicate: "target_became_vanguard_this_turn", target: "$attached_creature" },
      amount: 20,
      filters: { target_element: "Gale" },
    }],
  },
});

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

Deno.test("Wingclip outgoing Relic damage binds Vanguard timing and target_element to the attached Creature", () => {
  const state = {
    ...markedState({
      "gale-wingclip-charm": wingclipCharm,
      "gale-large": galeLarge,
      "ember-large": emberLarge,
      "stone-test-target": targetEntry,
    }),
    turn_seq: 7,
  } as Record<string, unknown>;
  const target = {
    stack: [{ uid: "target", card_id: "stone-test-target" }],
    essence: [],
    damage: 0,
    shield: 0,
  };
  const context: RuntimeAttackDamageContext = {
    target_zone: "vanguard",
    target_controller: "opponent",
    source_controller: "opponent",
    target_has_any_condition: false,
    target_element: "Stone",
  };
  const makeAttacker = (cardId: string, becameTurn: number) => ({
    stack: [{ uid: "attacker", card_id: cardId }],
    essence: [],
    relic: { uid: "wingclip", card_id: "gale-wingclip-charm" },
    damage: 0,
    shield: 0,
    became_vanguard_turn: becameTurn,
  });

  assertEquals(
    structuredRuntimeOutgoingAttackDamage(state, makeAttacker("gale-large", 7), target, 50, context),
    70,
    "Wingclip should add 20 to an attached Gale Creature that became Vanguard this turn",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(state, makeAttacker("gale-large", 6), target, 50, context),
    50,
    "Wingclip must not add damage when the attached Creature became Vanguard on an earlier turn",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(state, makeAttacker("ember-large", 7), target, 50, context),
    50,
    "Wingclip target_element filter must reject a non-Gale attached Creature even when the attacked target is unrelated",
  );
});

Deno.test("Kilnback incoming Attack damage uses canonical source_has_condition semantics", () => {
  const state = {
    ...markedState({ "ember-kilnback": kilnback }),
    turn_seq: 4,
  } as Record<string, unknown>;
  const attacker = { essence: [], damage: 0, shield: 0 };
  const makeTarget = (scorched: boolean) => ({
    stack: [{ uid: "kilnback", card_id: "ember-kilnback" }],
    essence: [],
    damage: 0,
    shield: 0,
    conditions: { scorched, venomed: 0, control: null, modifier: null },
  });
  const context: RuntimeAttackDamageContext = {
    target_zone: "vanguard",
    target_controller: "opponent",
    source_controller: "opponent",
    target_has_any_condition: false,
  };

  assertEquals(
    structuredRuntimeIncomingAttackDamage(state, attacker, makeTarget(true), 80, context),
    70,
    "Furnace Hide should prevent 10 while Kilnback is Scorched",
  );
  assertEquals(
    structuredRuntimeIncomingAttackDamage(state, attacker, makeTarget(false), 80, context),
    80,
    "Furnace Hide must not prevent damage while Kilnback is not Scorched",
  );
});

Deno.test("attached Relic outgoing Attack damage resolves Cinder Charm generically", () => {
  const target = { essence: [] };
  const context: RuntimeAttackDamageContext = {
    target_zone: "vanguard",
    target_controller: "opponent",
    source_controller: "opponent",
    target_has_any_condition: false,
  };
  const makeAttacker = (cardId: string) => ({
    stack: [{ uid: "attacker", card_id: cardId }],
    essence: [],
    relic: { uid: "cinder", card_id: "ember-cinder-charm" },
    damage: 0,
    shield: 0,
  });
  const state = markedState({
    "ember-cinder-charm": cinderCharm,
    "ember-small": emberSmall,
    "ember-large": emberLarge,
    "gale-large": galeLarge,
  });

  assertEquals(
    structuredRuntimeOutgoingAttackDamage(state, makeAttacker("ember-small"), target, 50, context),
    60,
    "Cinder default should add 10 to an Ember Creature below 200 printed HP",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(state, makeAttacker("ember-large"), target, 50, context),
    70,
    "Cinder 200+ printed-HP case should add 20",
  );
  assertEquals(
    structuredRuntimeOutgoingAttackDamage(state, makeAttacker("gale-large"), target, 50, context),
    50,
    "Cinder target_element_is must reject a non-Ember attached Creature",
  );
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

