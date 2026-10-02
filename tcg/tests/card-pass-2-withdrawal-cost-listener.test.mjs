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
  if (value.op === "MODIFY_CURRENT_WITHDRAWAL_COST") {
    hits.operations.push(card.id);
  }
  if (value.predicate === "event_active_seat_is_controller") {
    hits.predicates.push(card.id);
  }
  if (value.event === "before_voluntary_withdrawal_cost") {
    hits.events.push(card.id);
  }
  for (const child of Object.values(value)) walk(card, child, hits);
}

const hits = { operations: [], predicates: [], events: [] };
for (const path of cardDocs) {
  for (const card of cardsFrom(path)) walk(card, card, hits);
}

for (const key of Object.keys(hits)) {
  hits[key] = [...new Set(hits[key])].sort();
  if (JSON.stringify(hits[key]) !== JSON.stringify(["gale-highwind-spires"])) {
    throw new Error(`unexpected ${key} inventory: ${JSON.stringify(hits[key])}`);
  }
}

const listener = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-event-listener-v0-2.ts",
  "utf8",
);
const match = fs.readFileSync(
  "supabase/functions/tcg-match-actions/index.ts",
  "utf8",
);

for (const marker of [
  "runtimeV02ResolveVoluntaryWithdrawalCostListeners",
  '"before_voluntary_withdrawal_cost"',
  '"MODIFY_CURRENT_WITHDRAWAL_COST"',
  '"event_active_seat_is_controller"',
  '"event_controller"',
]) {
  if (!listener.includes(marker)) {
    throw new Error(`event-listener withdrawal-cost marker missing: ${marker}`);
  }
}
if (!listener.includes('!["op", "delta", "minimum"].includes(key)')) {
  throw new Error("withdrawal-cost opcode must accept only grammar-declared delta + minimum");
}
if (listener.includes('["op", "delta", "minimum", "maximum"]')) {
  throw new Error("withdrawal-cost opcode must not widen into undeclared maximum");
}

for (const marker of [
  "runtimeV02ResolveVoluntaryWithdrawalCostListeners",
  "consumeCostListeners?s:structuredClone(s)",
  "withdrawalDeclaration(null,false,false)",
  "withdrawalDeclaration(body.reserve_index,true,true)",
  "runtimeV02ApplyWithdrawalPaymentAndSwitch",
]) {
  if (!match.includes(marker)) {
    throw new Error(`match withdrawal-cost wiring marker missing: ${marker}`);
  }
}

for (const source of [listener, match]) {
  if (source.includes("gale-highwind-spires") || source.includes("Highwind Spires")) {
    throw new Error("Highwind identity must not be runtime dispatch authority");
  }
}

const modifierCall = match.indexOf("runtimeV02ResolveVoluntaryWithdrawalCostListeners");
const paymentCall = match.indexOf("runtimeV02ApplyWithdrawalPaymentAndSwitch(s,seat as 1|2");
if (modifierCall < 0 || paymentCall < 0 || modifierCall > paymentCall) {
  throw new Error("withdrawal cost listener must resolve before Payment/Atomic Switch transaction");
}

process.stdout.write(
  "V2.4.90 withdrawal-cost listener frozen inventory and owner wiring are canonical.\n",
);
