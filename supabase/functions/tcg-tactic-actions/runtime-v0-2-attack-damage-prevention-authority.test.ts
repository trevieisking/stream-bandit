import {
  evaluateRuntimeAttackReadyConditionalAddFormula,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import {
  runtimeV02CurrentTurnDamagePreventionEvents,
  runtimeV02PreviousOpponentTurnDamagePreventionEvents,
  structuredRuntimeIncomingAttackDamage,
  type RuntimeAttackDamageContext,
} from "../_shared/tcg-match-attack-damage-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

const source = { uid: "citadelhorn-source", card_id: "stone-citadelhorn" };
const relic = { uid: "stone-relic", card_id: "stone-test-relic" };

const attackContext: RuntimeAttackDamageContext = {
  target_zone: "vanguard",
  target_controller: "opponent",
  source_controller: "opponent",
  target_has_any_condition: false,
};

function fortressHeart(limit: unknown = null) {
  return {
    id: "fortress-heart",
    name: "Fortress Heart",
    mode: "continuous",
    event: null,
    timing: "passive",
    limit,
    requirements: [],
    costs: [],
    steps: [],
    continuous: [{
      id: "fortress-heart-reduction",
      kind: "incoming_attack_damage",
      target: "$source_creature",
      when: { predicate: "source_has_relic" },
      amount: -20,
      filters: { source_controller: "opponent" },
    }],
  };
}

function bastionQuake() {
  return {
    id: "bastion-quake",
    name: "Bastion Quake",
    cost: [{ element: "Stone", amount: 5 }],
    damage_element: "source_creature",
    base_damage: null,
    damage_formula: {
      base: 150,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          predicate: "event_occurred",
          event: "damage_prevented",
          window: "previous_opponent_turn",
          min_count: 1,
          filters: {
            target: "source_creature",
            prevention_kind_any: ["ability", "relic", "shield"],
          },
        },
      }],
    },
    requirements: [],
    on_declare: [],
    before_damage: [],
    after_damage: [],
  };
}

function state(options: { relic?: boolean; shield?: number; abilityLimit?: unknown } = {}) {
  const creature = {
    stack: [source],
    essence: [],
    relic: options.relic === false ? null : relic,
    shield: options.shield || 0,
    damage: 0,
    flags: {},
  };
  return {
    turn_seq: 7,
    active_seat: 2,
    personal_turns: { "1": 3, "2": 4 },
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": { vanguard: creature, reserve: [] },
      "2": { vanguard: null, reserve: [] },
    },
    card_index: {
      "stone-citadelhorn": {
        card_id: "stone-citadelhorn",
        definition: {
          id: "stone-citadelhorn",
          attack_1: "5 Stone — Bastion Quake — 150; if you prevented damage this turn, +20 damage",
        },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: "stone-citadelhorn",
          name: "Citadelhorn",
          card_family: "Creature",
          element: "Stone",
          prestige: { starbound: { enabled: false } },
          creature: {
            ability: fortressHeart(options.abilityLimit ?? null),
            attacks: [bastionQuake()],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

function sourceCreature(s: Record<string, unknown>) {
  return (s.players as any)["1"].vanguard as any;
}

function legacy() {
  return {
    name: "Bastion Quake",
    raw: "5 Stone — Bastion Quake — 150; if you prevented damage this turn, +20 damage",
    typed: { Stone: 5 },
    any: 0,
    damage: 150,
    effect: "if you prevented damage this turn, +20 damage",
    starbound: false,
  };
}

function evaluationContext() {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: true,
    current_turn_events: [],
    previous_opponent_turn_events: [],
    source_attached_essence_kinds: [],
  } as any;
}

Deno.test("Fortress Heart records canonical Ability prevention only while Citadelhorn has a Relic", () => {
  const withRelic = state({ relic: true });
  const target = sourceCreature(withRelic);
  assertEquals(structuredRuntimeIncomingAttackDamage(withRelic, { essence: [] }, target, 100, attackContext), 80);
  assertJsonEquals(runtimeV02CurrentTurnDamagePreventionEvents(withRelic, source), [
    { event: "damage_prevented", target: "source_creature", prevention_kind: "ability" },
  ]);

  const withoutRelic = state({ relic: false });
  const unarmoured = sourceCreature(withoutRelic);
  assertEquals(structuredRuntimeIncomingAttackDamage(withoutRelic, { essence: [] }, unarmoured, 100, attackContext), 100);
  assertJsonEquals(runtimeV02CurrentTurnDamagePreventionEvents(withoutRelic, source), []);
});

Deno.test("Shield prevention is recorded without consuming Shield inside the shared damage helper", () => {
  const s = state({ relic: false, shield: 30 });
  const target = sourceCreature(s);
  assertEquals(structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext), 100);
  assertEquals(target.shield, 30, "match owner must remain the sole Shield consumer");
  assertJsonEquals(runtimeV02CurrentTurnDamagePreventionEvents(s, source), [
    { event: "damage_prevented", target: "source_creature", prevention_kind: "shield" },
  ]);
});

Deno.test("Ability and Shield prevention kinds coexist without duplicate current-turn events", () => {
  const s = state({ relic: true, shield: 30 });
  const target = sourceCreature(s);
  assertEquals(structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext), 80);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);
  assertJsonEquals(runtimeV02CurrentTurnDamagePreventionEvents(s, source), [
    { event: "damage_prevented", target: "source_creature", prevention_kind: "ability" },
    { event: "damage_prevented", target: "source_creature", prevention_kind: "shield" },
  ]);
});

Deno.test("damage-prevention markers are current-turn only", () => {
  const s = state({ relic: false, shield: 20 });
  const target = sourceCreature(s);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);
  assertEquals(runtimeV02CurrentTurnDamagePreventionEvents(s, source).length, 1);
  s.turn_seq = 8;
  assertJsonEquals(runtimeV02CurrentTurnDamagePreventionEvents(s, source), []);
});

Deno.test("previous-opponent prevention becomes readable on the controller turn and survives controller extra turns", () => {
  const s = state({ relic: true, shield: 20 });
  const target = sourceCreature(s);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);

  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), [], "opponent turn must not expose previous-opponent history to the defender yet");

  s.turn_seq = 8;
  s.active_seat = 1;
  (s.personal_turns as any)["1"] = 4;
  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), [
    { event: "damage_prevented", target: "source_creature", prevention_kind: "ability" },
    { event: "damage_prevented", target: "source_creature", prevention_kind: "shield" },
  ]);

  s.turn_seq = 9;
  (s.personal_turns as any)["1"] = 5;
  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), [
    { event: "damage_prevented", target: "source_creature", prevention_kind: "ability" },
    { event: "damage_prevented", target: "source_creature", prevention_kind: "shield" },
  ], "controller extra turns must keep the same previous opponent turn");
});

Deno.test("previous-opponent prevention becomes stale when the opponent starts a later personal turn", () => {
  const s = state({ relic: false, shield: 20 });
  const target = sourceCreature(s);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);

  s.turn_seq = 8;
  s.active_seat = 1;
  (s.personal_turns as any)["1"] = 4;
  assertEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source).length, 1);

  s.turn_seq = 9;
  s.active_seat = 2;
  (s.personal_turns as any)["2"] = 5;
  s.turn_seq = 10;
  s.active_seat = 1;
  (s.personal_turns as any)["1"] = 5;
  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), []);
});

Deno.test("self-sourced Shield prevention never becomes previous-opponent-turn history", () => {
  const s = state({ relic: false, shield: 20 });
  s.active_seat = 1;
  const target = sourceCreature(s);
  const selfContext: RuntimeAttackDamageContext = {
    ...attackContext,
    target_controller: "self",
    source_controller: "self",
  };
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, selfContext);
  assertEquals(runtimeV02CurrentTurnDamagePreventionEvents(s, source).length, 1);
  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), []);
});

Deno.test("limited or future self-Ability prevention shapes remain fail-closed", () => {
  const s = state({ relic: true, abilityLimit: { scope: "turn", count: 1, owner: "card_instance" } });
  const target = sourceCreature(s);
  assertEquals(structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext), 100);
  assertJsonEquals(runtimeV02CurrentTurnDamagePreventionEvents(s, source), []);
});

Deno.test("Bastion Quake reads prevention from the previous opponent turn and reaches 170", () => {
  const s = state({ relic: true, shield: 0 });
  const target = sourceCreature(s);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);
  s.active_seat = 1;
  s.turn_seq = 8;
  (s.personal_turns as any)["1"] = 4;
  assertEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source).length, 1);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Bastion Quake authority required");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(authority, evaluationContext());
  assertEquals(evaluation?.damage, 170);
  assertEquals(evaluation?.terms[0].matched, true);
  assertEquals(evaluation?.terms[0].contribution, 20);
});

Deno.test("Bastion Quake previous-opponent prevention survives a controller extra turn", () => {
  const s = state({ relic: false, shield: 20 });
  const target = sourceCreature(s);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);
  s.active_seat = 1;
  s.turn_seq = 9;
  (s.personal_turns as any)["1"] = 5;
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Bastion Quake authority required");
  assertEquals(evaluateRuntimeAttackReadyConditionalAddFormula(authority, evaluationContext())?.damage, 170);
});

Deno.test("Bastion Quake prevention expires when the opponent begins a newer personal turn", () => {
  const s = state({ relic: false, shield: 20 });
  const target = sourceCreature(s);
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, attackContext);
  (s.personal_turns as any)["2"] = 5;
  s.active_seat = 1;
  s.turn_seq = 10;
  (s.personal_turns as any)["1"] = 4;
  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), []);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Bastion Quake authority required");
  assertEquals(evaluateRuntimeAttackReadyConditionalAddFormula(authority, evaluationContext())?.damage, 150);
});

Deno.test("Bastion Quake does not treat self-sourced prevention as previous-opponent prevention", () => {
  const s = state({ relic: false, shield: 20 });
  s.active_seat = 1;
  const target = sourceCreature(s);
  const selfContext: RuntimeAttackDamageContext = { ...attackContext, target_controller: "self", source_controller: "self" };
  structuredRuntimeIncomingAttackDamage(s, { essence: [] }, target, 100, selfContext);
  assertJsonEquals(runtimeV02PreviousOpponentTurnDamagePreventionEvents(s, source), []);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Bastion Quake authority required");
  assertEquals(evaluateRuntimeAttackReadyConditionalAddFormula(authority, evaluationContext())?.damage, 150);
});
