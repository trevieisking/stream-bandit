import fs from "node:fs";

const tactic = fs.readFileSync(
  "supabase/functions/tcg-tactic-actions/index.ts",
  "utf8",
);
const owner = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-bound-set-choice-v0-2.ts",
  "utf8",
);
const astral = fs.readFileSync("tcg-card-pass-2-astral.md", "utf8");
const gale = fs.readFileSync("tcg-card-pass-2-gale.md", "utf8");
const volt = fs.readFileSync("tcg-card-pass-2-volt.md", "utf8");

for (const marker of [
  '"id":"astral-future-draw"',
  '"op":"CHOOSE_FROM_SET","source":"$looked","min":1,"max":1,"as":"chosen"',
  '"id":"gale-scout-zeph"',
  '"set":"$looked","selection":{"min":0,"max":2,"filters":{"card_family":"Creature","element":"Gale"}}',
  '"destination":"hand"',
  '"set":"$looked","exclude":"$chosen","order":"player_choice"',
  '"id":"volt-circuit-scanner"',
  '"filters":{"any":[{"element":"Volt","card_family":"Creature"},{"card_family":"Tactic","tactic_subtype":"Device"}]}',
]) {
  if (![astral, gale, volt].some((source) => source.includes(marker))) {
    throw new Error(`frozen V2.4.98 Tactic marker missing: ${marker}`);
  }
}

for (const marker of [
  "tcg-match-bound-set-choice-v0-2.ts",
  "runtimeV02NormalizeChooseFromSetStep",
  "runtimeV02BindDeckTopSet",
  "runtimeV02RebindBoundDeckSet",
  "runtimeV02BoundSetChoiceOptions",
  "runtimeV02ResolveBoundSetChoice",
  'kind: "choose_bound_set"',
  'apply: "bind_bound_set_choice"',
  "runtimeV02ApplyCardZonePartitionTransfer",
  "runtimeV02ApplyCardZoneReorder",
  "runtimeV02BoundDeckSetAfterRemoval",
  'apply: "order_bound_deck_remainder"',
  "step.to ?? step.destination",
  "step.source || step.set || step.cards",
  "step.except ?? step.exclude",
]) {
  if (!tactic.includes(marker)) {
    throw new Error(`Tactic bound-set wiring marker missing: ${marker}`);
  }
}

if (!tactic.includes('vars[variable] = player.deck.splice(0, count)')) {
  throw new Error("unrelated accepted LOOK_TOP fallback must remain");
}

for (const marker of [
  "runtimeV02NormalizeChooseFromSetStep",
  "runtimeV02BindDeckTopSet",
  "runtimeV02RebindBoundDeckSet",
  "runtimeV02BoundSetChoiceOptions",
  "runtimeV02ResolveBoundSetChoice",
]) {
  if (!owner.includes(marker)) {
    throw new Error(`owner-31 bound-set marker missing: ${marker}`);
  }
}

for (const forbidden of [
  "astral-future-draw",
  "Future Draw",
  "gale-scout-zeph",
  "Scout Zeph",
  "volt-circuit-scanner",
  "Circuit Scanner",
]) {
  if (tactic.includes(forbidden) || owner.includes(forbidden)) {
    throw new Error(`card identity leaked into V2.4.98 runtime dispatch: ${forbidden}`);
  }
}

process.stdout.write(
  "V2.4.98 affected Tactic CHOOSE_FROM_SET families use owner-31 binding and owner-30 mutation.\n",
);
