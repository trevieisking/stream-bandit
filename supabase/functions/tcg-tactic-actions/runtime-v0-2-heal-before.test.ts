import {
  runtimeV02ApplyBeforeHealModifiers,
  runtimeV02PreflightBeforeHealModifiers,
} from "../_shared/tcg-match-heal-before-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
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

function creatureDefinition(id: string, element: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    creature: {
      stage: "Standalone",
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function sapstoneDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "grove-sapstone-charm",
    name: "Sapstone Charm",
    card_family: "Tactic",
    element: "Grove",
    creature: null,
    essence: null,
    tactic: {
      subtype: "Relic",
      listeners: [{
        id: "sapstone-heal-amplifier",
        event: "before_heal_packet",
        requirements: {
          all: [
            { predicate: "heal_packet_target_is_attached_creature" },
            {
              not: {
                predicate: "heal_packet_source_action_kind_is",
                action_kind: "rule",
              },
            },
          ],
        },
        limit: { scope: "turn", count: 1, owner: "attachment" },
        steps: [{ op: "MODIFY_CURRENT_HEAL", delta: 10, minimum: 0 }],
      }],
    },
  };
}

function invalidUnlimitedRelicDefinition() {
  const value = sapstoneDefinition();
  value.id = "invalid-unlimited-relic";
  value.name = "Invalid Unlimited Relic";
  value.tactic.listeners[0].id = "invalid-unlimited";
  value.tactic.listeners[0].limit = null as any;
  return value;
}

function cardIndex(definitions: Record<string, unknown>[]) {
  return Object.fromEntries(definitions.map((definition: any) => [
    definition.id,
    { definition_v0_2: definition },
  ]));
}

function field(card: { uid: string; card_id: string }, damage = 0, relic: any = null) {
  return {
    stack: [card],
    essence: [],
    relic,
    damage,
    shield: 0,
    conditions: {},
    flags: {},
  };
}

function state(relicDefinition = sapstoneDefinition()) {
  const target = { uid: "target-uid", card_id: "fairy-target" };
  const opponent = { uid: "opponent-uid", card_id: "opponent-target" };
  const relic = { uid: "relic-uid", card_id: String(relicDefinition.id) };
  const definitions = [
    creatureDefinition("fairy-target", "Fairy"),
    creatureDefinition("opponent-target", "Underworld"),
    relicDefinition,
  ];
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: cardIndex(definitions),
    players: {
      "1": {
        vanguard: field(target, 50, relic),
        reserve: [null, null, null, null],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
      },
    },
  } as Record<string, unknown>;
}

function context(actionKind = "tactic", cardEffect = true) {
  return {
    source: {
      controller_seat: 1 as const,
      action_kind: actionKind,
      action_id: "test-heal",
      card_effect: cardEffect,
      card_uid: cardEffect ? "healer-card-uid" : null,
      card_id: cardEffect ? "healer-card" : null,
      creature_uid: null,
    },
    target: {
      controller_seat: 1 as const,
      creature_uid: "target-uid",
      card_uid: "target-uid",
      card_id: "fairy-target",
      element: "Fairy",
      where: "vanguard" as const,
      index: null,
    },
  };
}

Deno.test("before-heal owner applies Sapstone-style attachment modifier once per turn", () => {
  const s = state();
  runtimeV02PreflightBeforeHealModifiers(s, 20, 50, context());
  const first = runtimeV02ApplyBeforeHealModifiers(s, 20, 50, context());
  equal(first.modified_amount, 30);
  equal(first.applied.length, 1);
  equal(first.applied[0].source_kind, "relic");

  const second = runtimeV02ApplyBeforeHealModifiers(s, 20, 50, context());
  equal(second.modified_amount, 20);
  equal(second.applied.length, 0);
});

Deno.test("before-heal owner resets attachment limit on a later turn", () => {
  const s = state();
  runtimeV02ApplyBeforeHealModifiers(s, 20, 50, context());
  s.turn_seq = 8;
  const next = runtimeV02ApplyBeforeHealModifiers(s, 20, 50, context());
  equal(next.modified_amount, 30);
  equal(next.applied.length, 1);
});

Deno.test("before-heal owner honors the structured rule-heal exclusion", () => {
  const s = state();
  const result = runtimeV02ApplyBeforeHealModifiers(
    s,
    20,
    50,
    context("rule", false),
  );
  equal(result.modified_amount, 20);
  equal(result.applied.length, 0);
});

Deno.test("before-heal owner does not consume first-use modifier when target has no damage", () => {
  const s = state();
  const noDamage = runtimeV02ApplyBeforeHealModifiers(s, 20, 0, context());
  equal(noDamage.modified_amount, 20);
  equal(noDamage.applied.length, 0);
  const later = runtimeV02ApplyBeforeHealModifiers(s, 20, 20, context());
  equal(later.modified_amount, 30);
});

Deno.test("before-heal owner fails closed on an unlimited modifier program", () => {
  const s = state(invalidUnlimitedRelicDefinition());
  throws(
    () => runtimeV02PreflightBeforeHealModifiers(s, 20, 50, context()),
    "tcg_v0_2_before_heal_limit_required",
  );
});
