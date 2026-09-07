const source = await Deno.readTextFile(new URL("../tcg-match-actions/index.ts", import.meta.url));

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertIncludes(value: string, expected: string, message: string) {
  assert(value.includes(expected), `${message}: missing ${expected}`);
}

function assertInOrder(value: string, needles: string[], message: string) {
  let cursor = -1;
  for (const needle of needles) {
    const next = value.indexOf(needle, cursor + 1);
    if (next < 0) throw new Error(`${message}: missing ${needle}`);
    if (next <= cursor) throw new Error(`${message}: out of order ${needle}`);
    cursor = next;
  }
}

Deno.test("count_add snapshot is wired after declaration requirements and before Starbound consumption", () => {
  assertInOrder(source, [
    "const requirementCheck=evaluateRuntimeAttackDeclarationRequirements(s,p.vanguard,atk)",
    "const countAddEvaluation=evaluateRuntimeAttackCountAddFormula(s,p.vanguard,p,atk)",
    "if(atk.starbound)",
    "const cq=conditions(p.vanguard)",
  ], "count_add legal-declaration snapshot ordering changed");
});

Deno.test("structured count_add damage replaces only its matching legacy Pyrohorn bonus path", () => {
  assertIncludes(
    source,
    "if(countAddEvaluation==null&&ef.includes(\"friendly damaged creature\"))",
    "legacy friendly-damaged Creature bonus must be gated by structured count_add authority",
  );
  assertIncludes(
    source,
    "const formulaBase=countAddEvaluation?.damage??atk.damage",
    "structured formula damage must become the attack damage baseline",
  );
  assertIncludes(
    source,
    "attackDamage(p.vanguard,target,s,formulaBase+bonus",
    "damage pipeline must receive structured formula damage plus remaining legacy-only bonuses",
  );
});

Deno.test("attack event keeps structured formula contribution auditable", () => {
  assertIncludes(source, "formula_bonus_damage:formulaBonus", "formula bonus audit field missing");
  assertIncludes(source, "bonus_damage:formulaBonus+bonus", "total bonus audit field missing");
  assertIncludes(source, "structured_count_add:countAddEvaluation", "count_add evaluation audit payload missing");
});
