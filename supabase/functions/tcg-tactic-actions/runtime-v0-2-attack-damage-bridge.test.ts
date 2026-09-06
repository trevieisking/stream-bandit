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
