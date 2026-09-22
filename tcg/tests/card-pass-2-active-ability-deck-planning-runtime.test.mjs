import fs from "node:fs";

const astral = fs.readFileSync("tcg-card-pass-2-astral.md", "utf8");
const planning = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-active-ability-deck-planning-v0-2.ts",
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

for (const marker of [
  '"id":"astral-celestyr-dream-cartographer"',
  '"id":"dream-cartographer"',
  '"op":"LOOK_TOP","player":"self","count":4,"as":"looked"',
  '"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"as":"bottom"',
  '"op":"MOVE_CARDS","player":"self","cards":"$bottom","to":"deck_bottom"',
  '"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"self","source":"$looked","except":"$bottom","order":"player_choice"',
]) {
  if (!astral.includes(marker)) {
    throw new Error(`Celestyr frozen active-Ability marker missing: ${marker}`);
  }
}

for (const marker of [
  "structuredRuntimeActiveAbilityDeckPlanning",
  "runtimeV02CreateActiveAbilityDeckPlanningChoice",
  "runtimeV02ResolveActiveAbilityDeckPlanningChoice",
  '"plan_own_deck_top"',
  "runtimeV02ApplyCardZoneReorder",
  "runtimeV02BindDeckTopSet",
  "runtimeV02RebindBoundDeckSet",
]) {
  if (!planning.includes(marker) && !live.includes(marker)) {
    throw new Error(`Celestyr deck-planning runtime marker missing: ${marker}`);
  }
}

for (const marker of [
  'pending.kind==="plan_own_deck_top"?{card_selection_min:pending.min,card_selection_max:pending.max}',
  'if(resolved.kind==="plan_own_deck_top")',
  'resolved.stage==="order_required"',
  'pending_ability_choice:runtimeV02PendingActiveAbilityLiveChoiceView(resolved.pending_choice,seat as 1|2)',
  "moved_to_deck_bottom_count:resolved.moved_to_deck_bottom_count",
  "reordered_remainder_count:resolved.reordered_remainder_count",
]) {
  if (!match.includes(marker)) {
    throw new Error(`Match deck-planning wiring marker missing: ${marker}`);
  }
}

for (const source of [planning, live]) {
  for (const forbidden of [
    "astral-celestyr-dream-cartographer",
    "Celestyr",
    "Dream Cartographer",
  ]) {
    if (source.includes(forbidden)) {
      throw new Error(`card identity leaked into generic deck-planning owner: ${forbidden}`);
    }
  }
}

const start = match.indexOf('if(resolved.kind==="plan_own_deck_top")');
const end = match.indexOf(
  'if(resolved.kind==="redistribute_attached_essence_then_conditional_heal")',
  start,
);
if (start < 0 || end < 0) {
  throw new Error("Match deck-planning branch boundary missing");
}
const branch = match.slice(start, end);
for (const forbidden of [
  "astral-celestyr-dream-cartographer",
  "Celestyr",
  "Dream Cartographer",
  "card_id:resolved",
  "card_uid:resolved",
  "source_uid:resolved",
]) {
  if (branch.includes(forbidden)) {
    throw new Error(`deck-planning branch leaks identity: ${forbidden}`);
  }
}

process.stdout.write(
  "V2.4.98 Celestyr deck planning is operation-shaped, private, and Card-Zone-owned for mutation.\n",
);
