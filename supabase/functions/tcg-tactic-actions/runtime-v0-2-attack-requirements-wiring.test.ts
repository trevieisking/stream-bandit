import {
  evaluateRuntimeAttackDeclarationRequirements,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
type _TcgMatchActionsCompileContract = typeof import("../tcg-match-actions/index.ts");

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function legacy() {
  return {
    name: "Legacy Attack",
    raw: "3 Any — Legacy Attack — 120",
    typed: {},
    any: 3,
    damage: 120,
    effect: "",
    starbound: false,
  };
}

const REQUIREMENT = {
  predicate: "attached_essence_distinct_element_count_at_least",
  target: "$source_creature",
  count: 3,
  allowed_elements: ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"],
};

function cardEntry(cardId: string, definitionV02: Record<string, unknown>) {
  return {
    card_id: cardId,
    definition: { id: cardId, attack_1: legacy().raw },
    definition_v0_2: definitionV02,
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function creatureEntry(cardId: string) {
  return cardEntry(cardId, {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: cardId,
    name: "Prismatic Founder",
    card_family: "Creature",
    prestige: { starbound: { enabled: false } },
    creature: {
      attacks: [{
        id: "total-convergence",
        name: "Total Convergence",
        cost: [{ element: "Any", amount: 3 }],
        base_damage: null,
        damage_formula: { base: 120, terms: [] },
        requirements: [REQUIREMENT],
      }],
    },
  });
}

function essenceEntry(cardId: string, element: string) {
  return cardEntry(cardId, {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: cardId,
    name: cardId,
    card_family: "Essence",
    creature: null,
    essence: {
      subtype: "Basic",
      provides: [{ element, amount: 1 }],
    },
    tactic: null,
  });
}

function structuredState() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      "prismatic-founder": creatureEntry("prismatic-founder"),
      "essence-astral-a": essenceEntry("essence-astral-a", "Astral"),
      "essence-astral-b": essenceEntry("essence-astral-b", "Astral"),
      "essence-ember": essenceEntry("essence-ember", "Ember"),
      "essence-gale": essenceEntry("essence-gale", "Gale"),
    },
  } as Record<string, unknown>;
}

function attached(cardId: string) {
  return { uid: `${cardId}-uid`, card_id: cardId };
}

Deno.test("legacy attack authority carries no structured requirements and preserves legacy declaration behavior", () => {
  const attack = resolveRuntimeAttackAuthority(
    { card_index: { "legacy-card": { definition: { id: "legacy-card" } } } },
    "legacy-card",
    1,
    legacy(),
  );
  if (!attack) throw new Error("legacy attack authority required");
  assertJsonEquals(attack.requirements, []);
  assertJsonEquals(evaluateRuntimeAttackDeclarationRequirements({}, {}, attack), { ok: true });
});

Deno.test("marked v0.2 attack authority propagates frozen declaration requirements", () => {
  const state = structuredState();
  const attack = resolveRuntimeAttackAuthority(state, "prismatic-founder", 1, legacy());
  if (!attack) throw new Error("structured attack authority required");
  assertJsonEquals(attack.requirements, [REQUIREMENT]);
});

Deno.test("structured declaration authority rejects duplicate-element payment before Starbound consumption", () => {
  const state = structuredState();
  const attack = resolveRuntimeAttackAuthority(state, "prismatic-founder", 1, legacy());
  if (!attack) throw new Error("structured attack authority required");
  const result = evaluateRuntimeAttackDeclarationRequirements(
    state,
    { essence: [attached("essence-astral-a"), attached("essence-astral-b"), attached("essence-ember")] },
    attack,
  );
  assertEquals(result.ok, false);
  if (result.ok) throw new Error("expected failed declaration requirement");
  assertEquals(result.required, 3);
  assertEquals(result.actual, 2);
  assertEquals(result.predicate, "attached_essence_distinct_element_count_at_least");
});

Deno.test("structured declaration authority accepts three distinct allowed attached Essence elements", () => {
  const state = structuredState();
  const attack = resolveRuntimeAttackAuthority(state, "prismatic-founder", 1, legacy());
  if (!attack) throw new Error("structured attack authority required");
  const result = evaluateRuntimeAttackDeclarationRequirements(
    state,
    { essence: [attached("essence-astral-a"), attached("essence-ember"), attached("essence-gale")] },
    attack,
  );
  assertJsonEquals(result, { ok: true });
});

Deno.test("tcg-match-actions checks structured requirements after cost legality and before Starbound consumption", async () => {
  const source = await Deno.readTextFile(new URL("../tcg-match-actions/index.ts", import.meta.url));
  const attackBranch = source.indexOf('if(action==="attack")');
  const costGate = source.indexOf("if(!canPayAttack(p.vanguard,s,atk))", attackBranch);
  const requirementGate = source.indexOf("evaluateRuntimeAttackDeclarationRequirements(s,p.vanguard,atk)", attackBranch);
  const requirementError = source.indexOf('error:"attack_requirements_not_met"', attackBranch);
  const starboundGate = source.indexOf("if(atk.starbound)", attackBranch);

  if (attackBranch < 0) throw new Error("attack branch not found");
  if (costGate < 0) throw new Error("attack cost gate not found");
  if (requirementGate < 0) throw new Error("structured declaration requirement gate not found");
  if (requirementError < 0) throw new Error("structured declaration requirement error not found");
  if (starboundGate < 0) throw new Error("Starbound gate not found");
  if (!(costGate < requirementGate && requirementGate <= requirementError && requirementError < starboundGate)) {
    throw new Error("structured declaration requirements must run after cost legality and before Starbound consumption");
  }
});
