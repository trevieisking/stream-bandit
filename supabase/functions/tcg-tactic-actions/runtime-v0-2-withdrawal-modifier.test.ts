import {
  runtimeV02ConsumeWithdrawalModifiers,
  runtimeV02ExpireWithdrawalModifiersAtAftermath,
  runtimeV02InstallWithdrawalModifier,
  runtimeV02ResolveWithdrawalModifierCost,
} from "../_shared/tcg-match-withdrawal-modifier-v0-2.ts";
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
function creature(uid = "target", condition: string | null = null, essence: any[] = []) {
  return {
    stack: [{ uid, card_id: uid }],
    essence,
    relic: null,
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: condition },
    flags: {},
  } as any;
}
function entry(id: string, definition: Record<string, unknown>) {
  return {
    card_id: id,
    definition: { id },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      ...definition,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function state(target: any, p2: any = creature("p2")) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 10,
    active_seat: 1,
    personal_turns: { "1": 4, "2": 3 },
    players: {
      "1": { vanguard: target, reserve: [null, null, null, null] },
      "2": { vanguard: p2, reserve: [null, null, null, null] },
    },
    card_index: {
      target: entry("target", {
        card_family: "Creature",
        element: "Gale",
        creature: { stage: "Standalone", withdrawal: 2, attacks: [], ability: null },
        essence: null,
        tactic: null,
      }),
      p2: entry("p2", {
        card_family: "Creature",
        element: "Stone",
        creature: { stage: "Standalone", withdrawal: 2, attacks: [], ability: null },
        essence: null,
        tactic: null,
      }),
      "stone-granite-essence": entry("stone-granite-essence", {
        card_family: "Essence",
        element: "Stone",
        creature: null,
        tactic: null,
        essence: {
          subtype: "Special",
          provides: [{ element: "Stone", amount: 1 }],
          continuous: [{
            id: "granite-tax-immunity",
            kind: "withdrawal_increase_immunity",
            target: "$attached_creature",
            when: { predicate: "target_element_is", target: "$attached_creature", element: "Stone" },
            filters: { blocked_sources: ["opponent_card_effect", "opponent_condition"] },
          }],
          listeners: [],
        },
      }),
    },
  } as Record<string, any>;
}
function step(overrides: Record<string, unknown> = {}) {
  return {
    op: "SET_WITHDRAWAL_MODIFIER",
    target: "$source_creature",
    mode: "set",
    amount: 0,
    minimum: 0,
    duration: { expires_on: ["end_of_turn"], max_uses: 1, consume_on: "legal_voluntary_withdrawal_declared" },
    ...overrides,
  } as Record<string, unknown>;
}
function install(s: Record<string, any>, target: any, raw: Record<string, unknown>, source = 1 as 1 | 2, targetSeat = 1 as 1 | 2) {
  return runtimeV02InstallWithdrawalModifier(s, target, raw, {
    source_controller_seat: source,
    target_controller_seat: targetSeat,
    source_card_uid: "source-card",
    source_action_id: "test-source",
  });
}

Deno.test("set modifier installs centrally, resolves and consumes one legal withdrawal", () => {
  const target = creature();
  const s = state(target);
  install(s, target, step());
  const resolved = runtimeV02ResolveWithdrawalModifierCost(s, target, 1, "Gale", 2);
  equal(resolved.cost, 0);
  equal(resolved.consumable_modifier_ids.length, 1);
  equal(runtimeV02ConsumeWithdrawalModifiers(target, resolved.consumable_modifier_ids, "legal_voluntary_withdrawal_declared").length, 1);
  equal(runtimeV02ResolveWithdrawalModifierCost(s, target, 1, "Gale", 2).cost, 2);
});

Deno.test("delta modifiers stack in installation order with minimum floor", () => {
  const target = creature();
  const s = state(target);
  install(s, target, step({ mode: "delta", amount: -1 }));
  install(s, target, step({
    target: "$source_creature",
    mode: "delta",
    amount: -5,
    duration: { expires_on: ["end_of_turn"], max_uses: null },
  }), 1, 1);
  equal(runtimeV02ResolveWithdrawalModifierCost(s, target, 1, "Gale", 3).cost, 0);
});

Deno.test("Undertow-style conditional increase is capped and opponent-card immunity blocks it", () => {
  const granite = { uid: "granite", card_id: "stone-granite-essence" };
  const target = creature("target", "Drenched", [granite]);
  const s = state(creature("source"), target);
  const undertow = step({
    target: "$current_opponent_vanguard",
    mode: "delta",
    amount: {
      default: 1,
      cases: [{ when: { predicate: "target_has_condition", target: "$current_opponent_vanguard", condition: "Drenched" }, amount: 2 }],
    },
    maximum_after_this_source: 4,
    source_category: "self_card_effect",
    duration: { expires_on: ["target_controller_aftermath_started"], max_uses: null },
  });
  install(s, target, undertow, 1, 2);
  const blocked = runtimeV02ResolveWithdrawalModifierCost(s, target, 2, "Stone", 3);
  equal(blocked.cost, 3);
  equal(blocked.applications[0].blocked_by_increase_immunity, true);

  target.essence = [];
  const applied = runtimeV02ResolveWithdrawalModifierCost(s, target, 2, "Stone", 3);
  equal(applied.cost, 4);
  equal(applied.applications[0].requested_delta, 2);
  equal(applied.applications[0].applied_delta, 1);
});

Deno.test("target-controller aftermath modifier persists into target next turn then expires at aftermath start", () => {
  const target = creature("p2");
  const s = state(creature("source"), target);
  install(s, target, step({
    target: "$current_opponent_vanguard",
    mode: "delta",
    amount: 1,
    duration: { expires_on: ["target_controller_aftermath_started"], max_uses: null },
  }), 1, 2);
  s.turn_seq = 11;
  s.active_seat = 2;
  s.personal_turns["2"] = 4;
  equal(runtimeV02ResolveWithdrawalModifierCost(s, target, 2, "Stone", 2).cost, 3);
  equal(runtimeV02ExpireWithdrawalModifiersAtAftermath(s, 2).length, 1);
  equal(runtimeV02ResolveWithdrawalModifierCost(s, target, 2, "Stone", 2).cost, 2);
});

Deno.test("controller-aftermath and end-of-turn records expire through Aftermath owner", () => {
  const target = creature();
  const s = state(target);
  install(s, target, step({
    duration: { expires_on: ["controller_aftermath"], max_uses: null },
  }));
  equal(runtimeV02ExpireWithdrawalModifiersAtAftermath(s, 1).length, 1);
  equal(runtimeV02ResolveWithdrawalModifierCost(s, target, 1, "Gale", 2).cost, 2);
});

Deno.test("frozen withdrawal-modifier grammar fails closed on undeclared fields and expiry", () => {
  const target = creature();
  const s = state(target);
  throws(() => install(s, target, step({ mystery: 1 })), "step_field_unsupported:mystery");
  throws(
    () => install(s, target, step({ duration: { expires_on: ["next_week"], max_uses: null } })),
    "expiry_unsupported:next_week",
  );
});
