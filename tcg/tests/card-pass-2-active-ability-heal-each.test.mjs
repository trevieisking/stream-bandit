import fs from "node:fs";

const grove = fs.readFileSync("tcg-card-pass-2-grove.md", "utf8");
const selected = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-active-ability-selected-heal-v0-2.ts",
  "utf8",
);
const live = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts",
  "utf8",
);
const match = fs.readFileSync(
  "supabase/functions/tcg-match-actions/index.ts",
  "utf8",
);

if (!grove.includes('"id":"grove-elderbloom-first-canopy"')) {
  throw new Error("Elderbloom frozen card missing");
}
for (const marker of [
  '"op":"SELECT_CREATURE","controller":"self","zone":"field","count":{"min":0,"max":2},"filters":{"damaged":true},"as":"canopy_targets"',
  '"op":"HEAL_EACH","targets":"$canopy_targets","amount":20',
]) {
  if (!grove.includes(marker)) throw new Error(`Elderbloom frozen marker missing: ${marker}`);
}
for (const marker of [
  "structuredRuntimeActiveAbilitySelectedHealEach",
  "runtimeV02BuildActiveAbilitySelectedHealEachChoice",
  "runtimeV02ResolveActiveAbilitySelectedHealEachChoice",
  "heal_each_selected_damaged_friendly_creature",
]) {
  if (!selected.includes(marker) && !live.includes(marker)) {
    throw new Error(`active selected HEAL_EACH owner marker missing: ${marker}`);
  }
}
if (!match.includes('resolved.kind==="heal_each_selected_damaged_friendly_creature"')) {
  throw new Error("Match active-Ability HEAL_EACH listener wiring missing");
}
for (const source of [selected, live, match]) {
  if (
    source.includes("grove-elderbloom-first-canopy") ||
    source.includes("Elderbloom") ||
    source.includes("First Canopy")
  ) {
    throw new Error("Elderbloom identity must not be active HEAL_EACH dispatch authority");
  }
}
process.stdout.write("V2.4.93 Elderbloom active HEAL_EACH route is generic and canonical.\n");
