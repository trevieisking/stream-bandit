import fs from "node:fs";

const docs = [
  "tcg-card-pass-2-ember.md",
  "tcg-card-pass-2-gale.md",
  "tcg-card-pass-2-shade.md",
  "tcg-card-pass-2-tide.md",
];
const expected = [
  "ember-sootwing",
  "gale-skyweaver",
  "gale-tempestalon",
  "gale-aeralith-storm-shepherd",
  "shade-wispbat",
  "tide-mistmarten",
].sort();

const found = [];
for (const path of docs) {
  const text = fs.readFileSync(path, "utf8");
  for (const match of text.matchAll(/```json\s*([\s\S]*?)```/g)) {
    const card = JSON.parse(match[1]);
    const attacks = card?.creature?.attacks || [];
    for (const attack of attacks) {
      const rows = Array.isArray(attack.after_damage) ? attack.after_damage : [];
      if (rows.length !== 1 || rows[0]?.op !== "OPTIONAL") continue;
      const steps = Array.isArray(rows[0].steps) ? rows[0].steps : [];
      if (
        steps.length === 2 &&
        steps[0]?.op === "SELECT_CREATURE" &&
        steps[0]?.controller === "self" &&
        steps[0]?.zone === "reserve" &&
        Number(steps[0]?.count) === 1 &&
        steps[1]?.op === "SWITCH_WITH_VANGUARD" &&
        steps[1]?.player === "self"
      ) found.push(card.id);
    }
  }
}
found.sort();
if (JSON.stringify(found) !== JSON.stringify(expected)) {
  throw new Error(`frozen ordinary Attack OPTIONAL switch inventory drifted: ${JSON.stringify(found)}`);
}

const owner = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-attack-switch-choice-v0-2.ts",
  "utf8",
);
const match = fs.readFileSync(
  "supabase/functions/tcg-match-actions/index.ts",
  "utf8",
);
const battle = fs.readFileSync("stream-bandit-tcg-v2-battle-controller.js", "utf8");

for (const marker of [
  'String(outer.op || "") === "OPTIONAL"',
  'consent: "optional"',
  'min: optional ? 0 : 1',
  "reserveMatchesFilters",
  "runtimeV02ApplyAtomicSwitch(",
]) {
  if (!owner.includes(marker)) throw new Error(`Attack OPTIONAL owner marker missing: ${marker}`);
}
if (!match.includes('if(!resolved.switch_result){')) {
  throw new Error("Match OPTIONAL decline completion branch missing");
}
if (!match.includes('const wantsSwitch=structuredReserveSwitchChoice==null&&')) {
  throw new Error("structured OPTIONAL route must continue disabling legacy switch fallback");
}
for (const marker of [
  "const min = Math.max(0, Number(choice.min || 0));",
  "const canConfirm = count >= min && count <= max;",
  "choice_ids: ids",
]) {
  if (!battle.includes(marker)) throw new Error(`generic Battle OPTIONAL choice transport marker missing: ${marker}`);
}
for (const id of expected) {
  if (owner.includes(id) || match.includes(id)) {
    throw new Error(`card identity leaked into Attack OPTIONAL runtime dispatch: ${id}`);
  }
}
process.stdout.write("V2.4.96 ordinary Attack OPTIONAL switches are generic and server-owned.\n");
