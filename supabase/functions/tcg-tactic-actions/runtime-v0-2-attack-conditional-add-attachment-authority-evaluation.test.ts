import {
  evaluateRuntimeAttackReadyConditionalAddFormula,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function legacy() {
  return {
    name: "Gridbreaker",
    raw: "4 Volt — Gridbreaker — 150; if this creature has a temporary or borrowed Essence attached, +20 damage",
    typed: { Volt: 4 },
    any: 0,
    damage: 150,
    effect: "if this creature has a temporary or borrowed Essence attached, +20 damage",
    starbound: false,
  };
}

function gridbreaker() {
  return {
    id: "gridbreaker",
    name: "Gridbreaker",
    cost: [{ element: "Volt", amount: 4 }],
    base_damage: null,
    damage_formula: {
      base: 150,
      snapshot: "legal_declaration",
      terms: [{
        kind: "conditional_add",
        amount: 20,
        when: {
          any: [
            { predicate: "event_attack_source_has_attached_essence_kind", kind: "temporary" },
            { predicate: "event_attack_source_has_attached_essence_kind", kind: "borrowed" },
          ],
        },
      }],
    },
  };
}

function stateWithEssence(essence: Record<string, unknown>) {
  const source = { uid: "dynamozer-1", card_id: "volt-dynamozer" };
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": {
        vanguard: {
          stack: [source],
          essence: [essence],
          relic: null,
          damage: 0,
          shield: 0,
        },
        reserve: [],
      },
      "2": { vanguard: null, reserve: [] },
    },
    card_index: {
      "volt-dynamozer": {
        card_id: "volt-dynamozer",
        definition: { id: "volt-dynamozer", attack_2: legacy().raw },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: "volt-dynamozer",
          name: "Dynamozer",
          card_family: "Creature",
          creature: {
            attacks: [
              {
                id: "dynamo-crash",
                name: "Dynamo Crash",
                cost: [{ element: "Volt", amount: 2 }],
                base_damage: 80,
                damage_formula: null,
              },
              gridbreaker(),
            ],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

function context() {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: [],
    source_attached_essence_kinds: [],
  } as any;
}

function authorityFor(essence: Record<string, unknown>) {
  const authority = resolveRuntimeAttackAuthority(
    stateWithEssence(essence),
    { uid: "dynamozer-1", card_id: "volt-dynamozer" },
    2,
    legacy(),
  );
  if (!authority) throw new Error("Gridbreaker authority required");
  return authority;
}

Deno.test("Gridbreaker snapshots canonical temporary Essence at legal declaration", () => {
  const authority = authorityFor({
    uid: "surge-1",
    card_id: "volt-surge-essence",
    effect_flags: {
      runtime_v0_2_attachment_lifecycle: {
        source_uid: "surge-1",
        kind: "temporary",
        expires: "controller_aftermath",
        destination_on_expire: "discard",
        attached_turn: 7,
      },
    },
  });
  assertJsonEquals(authority.declaration_source_attached_essence_kinds, ["temporary"]);
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(result?.damage, 170);
  assertEquals(result?.terms[0].matched, true);
  assertEquals(result?.terms[0].contribution, 20);
});

Deno.test("Gridbreaker snapshots canonical borrowed Essence at legal declaration", () => {
  const authority = authorityFor({
    uid: "borrowed-1",
    card_id: "volt-basic-essence",
    borrowed: true,
  });
  assertJsonEquals(authority.declaration_source_attached_essence_kinds, ["borrowed"]);
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(result?.damage, 170);
  assertEquals(result?.terms[0].matched, true);
});

Deno.test("Gridbreaker contributes zero for an ordinary attached Essence", () => {
  const authority = authorityFor({ uid: "ordinary-1", card_id: "volt-basic-essence" });
  assertJsonEquals(authority.declaration_source_attached_essence_kinds, []);
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(result?.damage, 150);
  assertEquals(result?.terms[0].matched, false);
  assertEquals(result?.terms[0].contribution, 0);
});

Deno.test("Gridbreaker ignores a forged temporary marker with the wrong source uid", () => {
  const authority = authorityFor({
    uid: "surge-2",
    card_id: "volt-surge-essence",
    effect_flags: {
      runtime_v0_2_attachment_lifecycle: {
        source_uid: "not-surge-2",
        kind: "temporary",
        expires: "controller_aftermath",
        destination_on_expire: "discard",
        attached_turn: 7,
      },
    },
  });
  assertJsonEquals(authority.declaration_source_attached_essence_kinds, []);
  const result = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(result?.damage, 150);
  assertEquals(result?.terms[0].matched, false);
});
