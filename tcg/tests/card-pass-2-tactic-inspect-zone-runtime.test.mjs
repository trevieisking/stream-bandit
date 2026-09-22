import fs from "node:fs";

const docs = [
  "tcg-card-pass-2-astral.md",
  "tcg-card-pass-2-ember.md",
  "tcg-card-pass-2-gale.md",
  "tcg-card-pass-2-grove.md",
  "tcg-card-pass-2-shade.md",
  "tcg-card-pass-2-stone.md",
  "tcg-card-pass-2-tide.md",
  "tcg-card-pass-2-volt.md",
];

let count = 0;
for (const path of docs) {
  const text = fs.readFileSync(path, "utf8");
  count += (text.match(/"op":"INSPECT_ZONE"/g) || []).length;
}
if (count !== 13) throw new Error(`frozen INSPECT_ZONE inventory drifted: ${count} !== 13`);

const astral = fs.readFileSync("tcg-card-pass-2-astral.md", "utf8");
const shade = fs.readFileSync("tcg-card-pass-2-shade.md", "utf8");
for (const marker of [
  '"id":"astral-parallax-window"',
  '"zone":"rewards","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position"',
]) if (!astral.includes(marker)) throw new Error(`Parallax marker missing: ${marker}`);
for (const marker of [
  '"id":"shade-seer-nyx"',
  '"zone":"deck_top","selection":{"min":3,"max":3,"filters":{}},"visibility":"controller_private","return_policy":"effect_owned_set"',
  '"op":"CHOOSE_FROM_SET","source":"$looked","min":1,"max":1',
  '"op":"MOVE_CARDS","player":"opponent","cards":"$discarded","to":"discard"',
  '"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"opponent","source":"$looked","except":"$discarded","order":"controller_choice"',
]) if (!shade.includes(marker)) throw new Error(`Seer marker missing: ${marker}`);

const tactic = fs.readFileSync("supabase/functions/tcg-tactic-actions/index.ts", "utf8");
const owner = fs.readFileSync("supabase/functions/_shared/tcg-match-inspection-v0-2.ts", "utf8");
for (const marker of [
  "runtimeV02NormalizeInspectZoneStep",
  'if (op === "INSPECT_ZONE")',
  "runtimeV02RewardInspectionChoiceOptions",
  "runtimeV02ResolveRewardInspectionChoice",
  "runtimeV02InspectDeckTopEffectOwnedSet",
  "runtimeV02ApplyCardZonePartitionTransfer",
  "runtimeV02ApplyCardZoneReorder",
  "runtimeV02RebindInspectionRemainder",
  'kind: "order_inspected_deck_top"',
  'apply: "order_inspected_deck_top"',
  "private_reward_inspection: runtimeV02PrivateRewardInspectionView",
]) if (!tactic.includes(marker)) throw new Error(`Tactic inspection marker missing: ${marker}`);

for (const marker of [
  "runtimeV02NormalizeInspectZoneStep",
  "runtimeV02InspectDeckTopEffectOwnedSet",
  "runtimeV02ResolveRewardInspectionChoice",
]) if (!owner.includes(marker)) throw new Error(`Inspection owner marker missing: ${marker}`);

for (const forbidden of [
  "astral-parallax-window",
  "Parallax Window",
  "shade-seer-nyx",
  "Seer Nyx",
]) {
  if (tactic.includes(forbidden) || owner.includes(forbidden)) {
    throw new Error(`card identity leaked into inspection dispatch: ${forbidden}`);
  }
}

process.stdout.write("V2.4.97 Tactic INSPECT_ZONE uses canonical private inspection and Card-Zone ownership.\n");
