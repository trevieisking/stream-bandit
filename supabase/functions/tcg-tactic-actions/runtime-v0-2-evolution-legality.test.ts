import {
  runtimeV02ListLegalEvolutionTargets,
  runtimeV02ValidateEvolutionDeclaration,
} from "../_shared/tcg-match-evolution-legality-v0-2.ts";

type Inst = { uid: string; card_id: string };
const definitions: Record<string, Record<string, unknown>> = {
  baby: { id: "baby", kind: "Creature", stage: "Baby", evolves_from_id: null },
  teen: { id: "teen", kind: "Creature", stage: "Teen", evolves_from_id: "baby" },
  adult: { id: "adult", kind: "Creature", stage: "Adult", evolves_from_id: "teen" },
  essence: { id: "essence", kind: "Essence" },
};
const def = (instance: Inst) => definitions[instance.card_id] ?? null;
const creature = (uid: string, card_id: string, entered_turn = 1, evolved_turn = -1) => ({
  stack: [{ uid, card_id }],
  essence: [],
  relic: null,
  damage: 0,
  shield: 0,
  condition: null,
  conditions: { scorched: false, venomed: 0, control: null, modifier: null },
  flags: {},
  entered_turn,
  evolved_turn,
});
const player = () => ({
  hand: [
    { uid: "teen-hand", card_id: "teen" },
    { uid: "adult-hand", card_id: "adult" },
    { uid: "essence-hand", card_id: "essence" },
  ],
  vanguard: creature("baby-v", "baby"),
  reserve: [
    creature("baby-r1", "baby"),
    creature("teen-r2", "teen"),
    creature("fresh-baby", "baby", 4, -1),
    creature("used-baby", "baby", 1, 4),
  ],
});

Deno.test("evolution target projection is server-legality driven and non-mutating", () => {
  const p = player();
  const before = JSON.stringify(p);
  const result = runtimeV02ListLegalEvolutionTargets(p, "teen-hand", 4, 2, def);
  if (!result.eligible) throw new Error("teen should be evolution eligible");
  const targets = result.legal_targets.map((target) => [target.where, target.index, target.anchor_uid]);
  if (JSON.stringify(targets) !== JSON.stringify([
    ["vanguard", null, "baby-v"],
    ["reserve", 0, "baby-r1"],
  ])) throw new Error("legal evolution targets mismatch");
  if (JSON.stringify(p) !== before) throw new Error("evolution preflight mutated player state");
});

Deno.test("evolution target projection preserves card and first-turn fences", () => {
  const p = player();
  const firstTurn = runtimeV02ListLegalEvolutionTargets(p, "teen-hand", 4, 1, def);
  if (firstTurn.eligible || firstTurn.reason !== "evolution_locked_on_first_personal_turn") {
    throw new Error("first-turn evolution fence missing");
  }
  const wrongFamily = runtimeV02ListLegalEvolutionTargets(p, "essence-hand", 4, 2, def);
  if (wrongFamily.eligible || wrongFamily.reason !== "teen_or_adult_required") {
    throw new Error("evolution card-family fence missing");
  }
});

Deno.test("final evolution declaration preserves existing public errors", () => {
  const p = player();
  const cases = [
    [
      runtimeV02ValidateEvolutionDeclaration(p, "teen-hand", "reserve", 9, 4, 2, def),
      "target_creature_not_found",
    ],
    [
      runtimeV02ValidateEvolutionDeclaration(p, "essence-hand", "vanguard", null, 4, 2, def),
      "teen_or_adult_required",
    ],
    [
      runtimeV02ValidateEvolutionDeclaration(p, "adult-hand", "vanguard", null, 4, 2, def),
      "evolution_predecessor_mismatch",
    ],
    [
      runtimeV02ValidateEvolutionDeclaration(p, "teen-hand", "reserve", 2, 4, 2, def),
      "stack_entered_or_evolved_this_turn",
    ],
    [
      runtimeV02ValidateEvolutionDeclaration(p, "teen-hand", "reserve", 3, 4, 2, def),
      "one_evolution_per_stack_per_turn",
    ],
  ] as const;
  for (const [result, expected] of cases) {
    if (result.ok || result.error !== expected) throw new Error(`expected ${expected}`);
  }
  const legal = runtimeV02ValidateEvolutionDeclaration(p, "teen-hand", "vanguard", null, 4, 2, def);
  if (!legal.ok || legal.where !== "vanguard" || legal.index !== null) throw new Error("legal evolution declaration rejected");
});
