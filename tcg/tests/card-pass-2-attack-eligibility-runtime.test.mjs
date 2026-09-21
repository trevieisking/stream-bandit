import fs from "node:fs";

const cardDocs = [
  "tcg-card-pass-2-astral.md",
  "tcg-card-pass-2-ember.md",
  "tcg-card-pass-2-gale.md",
  "tcg-card-pass-2-grove.md",
  "tcg-card-pass-2-shade.md",
  "tcg-card-pass-2-stone.md",
  "tcg-card-pass-2-tide.md",
  "tcg-card-pass-2-volt.md",
];

function cardsFrom(path) {
  const text = fs.readFileSync(path, "utf8");
  const cards = [];
  for (const match of text.matchAll(/\`\`\`json\s*([\s\S]*?)\`\`\`/g)) {
    try {
      const card = JSON.parse(match[1]);
      if (card?.schema === "sb-tcg-card-v0.2") cards.push(card);
    } catch {}
  }
  return cards;
}

const consumers = [];
let pilot = null;
for (const path of cardDocs) {
  for (const card of cardsFrom(path)) {
    const program = card?.tactic?.program?.steps;
    if (Array.isArray(program)) {
      for (const step of program) {
        if (step?.op === "SET_ATTACK_ELIGIBILITY") consumers.push(card.id);
      }
    }
    if (card.id === "gale-pilot-sera") pilot = card;
  }
}

const unique = [...new Set(consumers)].sort();
if (JSON.stringify(unique) !== JSON.stringify(["gale-pilot-sera"])) {
  throw new Error(`unexpected SET_ATTACK_ELIGIBILITY inventory: ${JSON.stringify(unique)}`);
}
if (!pilot) throw new Error("Pilot Sera frozen definition missing");

const steps = pilot.tactic?.program?.steps;
if (!Array.isArray(steps) || steps.length !== 2) {
  throw new Error("Pilot Sera program shape changed");
}
if (steps[0]?.op !== "REPEAT_OPTIONAL" || Number(steps[0]?.max) !== 2) {
  throw new Error("Pilot Sera repeated-switch prefix changed");
}
const rule = steps[1];
if (
  JSON.stringify(Object.keys(rule).sort()) !==
    JSON.stringify(["op", "rule", "scope"]) ||
  rule.op !== "SET_ATTACK_ELIGIBILITY" ||
  rule.scope !== "controller_turn" ||
  rule.rule !== "only_final_vanguard_may_attack"
) {
  throw new Error(`Pilot Sera attack-eligibility grammar drifted: ${JSON.stringify(rule)}`);
}

const owner = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-attack-eligibility-v0-2.ts",
  "utf8",
);
const tactic = fs.readFileSync(
  "supabase/functions/tcg-tactic-actions/index.ts",
  "utf8",
);
const match = fs.readFileSync(
  "supabase/functions/tcg-match-actions/index.ts",
  "utf8",
);

for (const marker of [
  "runtimeV02NormalizeAttackEligibilityRule",
  "runtimeV02InstallAttackEligibilityRule",
  "runtimeV02AttackEligibilityBlockReason",
  '"controller_turn"',
  '"only_final_vanguard_may_attack"',
  '"final_vanguard_only"',
  '"end_of_turn"',
]) {
  if (!owner.includes(marker)) throw new Error(`Attack Eligibility owner marker missing: ${marker}`);
}

if (!tactic.includes("runtimeV02NormalizeAttackEligibilityRule(step)")) {
  throw new Error("Tactic preflight does not validate canonical Attack Eligibility grammar");
}
if (!tactic.includes("runtimeV02InstallAttackEligibilityRule(")) {
  throw new Error("Tactic execution does not delegate Attack Eligibility installation");
}
if (tactic.includes("lifecycle_attack_eligibility")) {
  throw new Error("Tactic interpreter must not own Attack Eligibility state directly");
}

const calls = match.match(/runtimeV02AttackEligibilityBlockReason\(/g) || [];
if (calls.length !== 2) {
  throw new Error(`expected projection + authoritative Attack Eligibility owner calls, got ${calls.length}`);
}
if (match.includes("lifecycle_attack_eligibility")) {
  throw new Error("Match must not interpret Attack Eligibility receipt fields directly");
}
if (!match.includes("error:eligibilityReason")) {
  throw new Error("authoritative Attack route does not return canonical eligibility block reason");
}

for (const source of [owner, tactic, match]) {
  if (source.includes("gale-pilot-sera") || source.includes("Pilot Sera")) {
    throw new Error("Pilot Sera identity must not be runtime dispatch authority");
  }
}

process.stdout.write(
  "V2.4.91 Pilot Sera Attack Eligibility inventory, grammar and owner wiring are canonical.\n",
);
