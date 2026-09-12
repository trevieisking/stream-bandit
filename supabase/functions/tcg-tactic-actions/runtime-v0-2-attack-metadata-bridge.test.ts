import { structuredRuntimeAttackMetadata } from "../_shared/tcg-match-attack-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
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

function creatureEntry(cardId: string, attacks: Record<string, unknown>[]) {
  return {
    card_id: cardId,
    definition: { id: cardId, attacks: ["legacy attack text"] },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      creature: { attacks },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function stateWith(entries: Record<string, Record<string, unknown>>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: entries,
  } as Record<string, unknown>;
}

Deno.test("legacy-only match keeps attack metadata on legacy fallback", () => {
  const state = {
    card_index: {
      "ember-test": { card_id: "ember-test", definition: { id: "ember-test", attacks: ["Legacy | cost: Ember 1 | dmg: 20"] } },
    },
  } as Record<string, unknown>;
  assertEquals(structuredRuntimeAttackMetadata(state, "ember-test", 1), null);
});

Deno.test("structured fixed attack exposes stable id, typed cost and base damage", () => {
  const state = stateWith({
    "ember-test": creatureEntry("ember-test", [{
      id: "ember-claw",
      name: "Ember Claw",
      cost: [{ element: "Ember", amount: 1 }],
      base_damage: 40,
      damage_formula: null,
    }]),
  });
  const attack = structuredRuntimeAttackMetadata(state, "ember-test", 1);
  assertEquals(attack?.id, "ember-claw");
  assertEquals(attack?.name, "Ember Claw");
  assertJsonEquals(attack?.typed, { Ember: 1 });
  assertEquals(attack?.any, 0);
  assertEquals(attack?.base_damage, 40);
  assertEquals(attack?.damage_source, "base_damage");
  assertJsonEquals(attack?.target_permissions, []);
});

Deno.test("structured formula attack exposes Any cost and formula baseline without evaluating terms", () => {
  const state = stateWith({
    "ember-formula": creatureEntry("ember-formula", [{
      id: "cinder-spiral",
      name: "Cinder Spiral",
      cost: [{ element: "Ember", amount: 2 }, { element: "Any", amount: 1 }],
      base_damage: null,
      damage_formula: {
        base: 120,
        terms: [{ kind: "conditional_add", amount: 30, when: { predicate: "target_has_condition", condition: "Scorched" } }],
      },
    }]),
  });
  const attack = structuredRuntimeAttackMetadata(state, "ember-formula", 1);
  assertJsonEquals(attack?.typed, { Ember: 2 });
  assertEquals(attack?.any, 1);
  assertEquals(attack?.base_damage, 120);
  assertEquals(attack?.damage_source, "damage_formula.base");
});

Deno.test("structured duplicate typed cost rows aggregate deterministically", () => {
  const state = stateWith({
    "mixed-cost": creatureEntry("mixed-cost", [{
      id: "mixed-cost-attack",
      name: "Mixed Cost Attack",
      cost: [{ element: "Ember", amount: 1 }, { element: "Ember", amount: 2 }, { element: "Any", amount: 1 }],
      base_damage: 70,
      damage_formula: null,
    }]),
  });
  const attack = structuredRuntimeAttackMetadata(state, "mixed-cost", 1);
  assertJsonEquals(attack?.typed, { Ember: 3 });
  assertEquals(attack?.any, 1);
});

Deno.test("structured Sky Rend exposes the frozen additional opponent Reserve target permission", () => {
  const state = stateWith({
    "gale-skyrend": creatureEntry("gale-skyrend", [{
      id: "sky-rend",
      name: "Sky Rend",
      cost: [{ element: "Gale", amount: 2 }, { element: "Any", amount: 1 }],
      base_damage: 110,
      damage_formula: null,
      target_permissions: [{
        controller: "opponent",
        zone: "reserve",
        card_family: "Creature",
        selection: "one",
      }],
    }]),
  });
  const attack = structuredRuntimeAttackMetadata(state, "gale-skyrend", 1);
  assertJsonEquals(attack?.target_permissions, [{
    controller: "opponent",
    zone: "reserve",
    card_family: "Creature",
    selection: "one",
  }]);
});

Deno.test("marked target_permissions must be an array", () => {
  const state = stateWith({
    "broken-targets": creatureEntry("broken-targets", [{
      id: "broken-targets-attack",
      name: "Broken Targets",
      cost: [{ element: "Gale", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
      target_permissions: {
        controller: "opponent",
        zone: "reserve",
        card_family: "Creature",
        selection: "one",
      },
    }]),
  });
  assertThrows(
    () => structuredRuntimeAttackMetadata(state, "broken-targets", 1),
    "tcg_v0_2_attack_target_permissions_invalid:broken-targets-attack",
  );
});

Deno.test("future target permission filter fields fail closed until separately implemented", () => {
  const state = stateWith({
    "future-targets": creatureEntry("future-targets", [{
      id: "future-targets-attack",
      name: "Future Targets",
      cost: [{ element: "Gale", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
      target_permissions: [{
        controller: "opponent",
        zone: "reserve",
        card_family: "Creature",
        selection: "one",
        trait: "Winged",
      }],
    }]),
  });
  assertThrows(
    () => structuredRuntimeAttackMetadata(state, "future-targets", 1),
    "tcg_v0_2_attack_target_permission_field_unsupported:future-targets-attack:trait",
  );
});

Deno.test("selection all fails closed until multi-target attack support is implemented", () => {
  const state = stateWith({
    "all-targets": creatureEntry("all-targets", [{
      id: "all-targets-attack",
      name: "All Targets",
      cost: [{ element: "Gale", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
      target_permissions: [{
        controller: "opponent",
        zone: "reserve",
        card_family: "Creature",
        selection: "all",
      }],
    }]),
  });
  assertThrows(
    () => structuredRuntimeAttackMetadata(state, "all-targets", 1),
    "tcg_v0_2_attack_target_permission_selection_invalid:all-targets-attack",
  );
});

Deno.test("marked malformed attack metadata fails closed", () => {
  const state = stateWith({
    "broken-attack": creatureEntry("broken-attack", [{
      id: "broken",
      name: "Broken",
      cost: [{ element: "Ember", amount: -1 }],
      base_damage: 20,
      damage_formula: null,
    }]),
  });
  assertThrows(
    () => structuredRuntimeAttackMetadata(state, "broken-attack", 1),
    "tcg_v0_2_attack_cost_amount_invalid:broken",
  );
});

Deno.test("marked attack slot outside frozen order fails closed", () => {
  const state = stateWith({
    "one-attack": creatureEntry("one-attack", [{
      id: "only-attack",
      name: "Only Attack",
      cost: [{ element: "Ember", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
    }]),
  });
  assertThrows(
    () => structuredRuntimeAttackMetadata(state, "one-attack", 2),
    "tcg_v0_2_attack_slot_invalid",
  );
});

Deno.test("marked mixed structured and legacy card indexes fail closed instead of mixing engines", () => {
  const state = stateWith({
    "structured": creatureEntry("structured", [{
      id: "structured-attack",
      name: "Structured Attack",
      cost: [{ element: "Ember", amount: 1 }],
      base_damage: 20,
      damage_formula: null,
    }]),
    "legacy-only": {
      card_id: "legacy-only",
      definition: { id: "legacy-only", attacks: ["Legacy | cost: Ember 1 | dmg: 20"] },
    },
  });
  assertThrows(
    () => structuredRuntimeAttackMetadata(state, "structured", 1),
    "tcg_v0_2_snapshot_definition_missing:legacy-only",
  );
});
