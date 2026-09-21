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

function walk(card, value, hits) {
  if (Array.isArray(value)) {
    for (const item of value) walk(card, item, hits);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (value.op === "SET_WITHDRAWAL_MODIFIER") hits.push(card.id);
  for (const child of Object.values(value)) walk(card, child, hits);
}

const hits = [];
for (const path of cardDocs) for (const card of cardsFrom(path)) walk(card, card, hits);
const actual = [...new Set(hits)].sort();
const expected = [
  "astral-starwhale",
  "gale-featherstep",
  "gale-jetstream-essence",
  "gale-pinionserpent",
  "gale-slipwing",
  "gale-whiffin",
  "stone-keeper-tor",
  "tide-undertow-net",
  "volt-copperkite",
].sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`unexpected SET_WITHDRAWAL_MODIFIER inventory: ${JSON.stringify(actual)}`);
}

const owner = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-withdrawal-modifier-v0-2.ts",
  "utf8",
);
const event = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-event-listener-v0-2.ts",
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
const aftermath = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-aftermath-v0-2.ts",
  "utf8",
);

for (const marker of [
  "runtimeV02InstallWithdrawalModifier",
  "runtimeV02ResolveWithdrawalModifierCost",
  "runtimeV02ConsumeWithdrawalModifiers",
  "runtimeV02ExpireWithdrawalModifiersAtAftermath",
]) {
  if (!owner.includes(marker)) throw new Error(`Withdrawal modifier owner marker missing: ${marker}`);
}

if (!event.includes("runtimeV02InstallWithdrawalModifier(state, target.cr, step")) {
  throw new Error("Event Listener must delegate SET_WITHDRAWAL_MODIFIER installation");
}
if (event.includes("function setWithdrawalModifier(") || event.includes("event_listener_withdrawal_modifier_expiry_unsupported")) {
  throw new Error("Event Listener duplicate Withdrawal-modifier owner remains");
}

if (!tactic.includes('if (op === "SET_WITHDRAWAL_MODIFIER")')) {
  throw new Error("Tactic structured SET_WITHDRAWAL_MODIFIER route missing");
}
if (!tactic.includes("runtimeV02InstallWithdrawalModifier(state, found.cr, step")) {
  throw new Error("Tactic must delegate structured Withdrawal-modifier installation");
}
if (!tactic.includes('if (op === "SET_WITHDRAWAL_COST")')) {
  throw new Error("legacy SET_WITHDRAWAL_COST compatibility route must remain");
}

const planStart = match.indexOf("const withdrawalDeclaration=");
const planEnd = match.indexOf('if(action==="field_actions")', planStart);
const plan = match.slice(planStart, planEnd);
for (const marker of [
  "withdrawalCostPlan(p.vanguard,s,seat as 1|2)",
  "runtimeV02ResolveVoluntaryWithdrawalCostListeners",
  "runtimeV02ConsumeWithdrawalModifiers",
]) {
  if (!plan.includes(marker)) throw new Error(`Match withdrawal lifecycle marker missing: ${marker}`);
}
const sharedResolve = match.indexOf("runtimeV02ResolveWithdrawalModifierCost");
const highwindResolve = plan.indexOf("runtimeV02ResolveVoluntaryWithdrawalCostListeners");
if (sharedResolve < 0 || highwindResolve < 0) {
  throw new Error("Withdrawal modifier or current-cost resolver missing");
}
if (!match.includes("s.runtime_registry_v0_2!=null&&f.runtime_v0_2_withdrawal_modifier_state")) {
  throw new Error("Match must not manufacture empty structured modifier state");
}
if (!plan.includes('consumeCostListeners&&lifecyclePlan.modifier_ids.length')) {
  throw new Error("authoritative legal withdrawal must consume declared one-use lifecycle modifiers");
}

const expireCall = aftermath.indexOf("runtimeV02ExpireWithdrawalModifiersAtAftermath(state, seat)");
const conditionAftermath = aftermath.indexOf("runtimeV02ResolveConditionAftermath(");
if (expireCall < 0 || conditionAftermath < 0 || expireCall > conditionAftermath) {
  throw new Error("target-controller Withdrawal modifiers must expire at Aftermath start");
}

for (const id of expected) {
  if (owner.includes(id) || event.includes(id) || tactic.includes(id)) {
    throw new Error(`card identity must not be Withdrawal-modifier dispatch authority: ${id}`);
  }
}

process.stdout.write(
  "V2.4.92 frozen Withdrawal-modifier inventory and shared-owner wiring are canonical.\n",
);
