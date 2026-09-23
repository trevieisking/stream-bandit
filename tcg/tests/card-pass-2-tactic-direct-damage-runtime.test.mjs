import fs from "node:fs";

const tactic = fs.readFileSync("supabase/functions/tcg-tactic-actions/index.ts", "utf8");
const owner = fs.readFileSync("supabase/functions/_shared/tcg-match-direct-damage-v0-2.ts", "utf8");
const event = fs.readFileSync("supabase/functions/_shared/tcg-match-event-listener-v0-2.ts", "utf8");
const attack = fs.readFileSync("supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts", "utf8");
const match = fs.readFileSync("supabase/functions/tcg-match-actions/index.ts", "utf8");
const ability = fs.readFileSync("supabase/functions/_shared/tcg-match-active-ability-hand-attachment-damage-v0-2.ts", "utf8");

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

const consumers = [];
for (const path of docs) {
  const source = fs.readFileSync(path, "utf8");
  for (const block of source.matchAll(/\`\`\`json\s*([\s\S]*?)\`\`\`/g)) {
    let card;
    try { card = JSON.parse(block[1]); } catch { continue; }
    if (card?.schema !== "sb-tcg-card-v0.2") continue;
    const walk = (value, trail = []) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, [...trail, index]));
        return;
      }
      if (!value || typeof value !== "object") return;
      if (value.op === "DIRECT_DAMAGE") {
        consumers.push({ card_id: card.id, trail, step: value });
      }
      for (const [key, child] of Object.entries(value)) walk(child, [...trail, key]);
    };
    walk(card);
  }
}

if (consumers.length !== 8) {
  throw new Error(`frozen DIRECT_DAMAGE inventory drifted: ${consumers.length} !== 8`);
}
const tacticConsumers = consumers.filter((item) =>
  item.trail.join(".").includes("tactic.program.steps")
);
if (
  tacticConsumers.length !== 1 ||
  tacticConsumers[0].card_id !== "ember-ashen-gamble" ||
  tacticConsumers[0].step.amount !== 20 ||
  tacticConsumers[0].step.damage_class !== "effect"
) {
  throw new Error(`ordinary Tactic DIRECT_DAMAGE inventory drifted: ${JSON.stringify(tacticConsumers)}`);
}

for (const marker of [
  'tcg-match-direct-damage-v0-2.ts',
  'tcg-match-event-listener-v0-2.ts',
  'tcg-match-defeat-engine-v0-2.ts',
  'if (op === "DIRECT_DAMAGE")',
  'runtimeV02NormalizeDirectDamageStep(step)',
  'runtimeV02ApplyDirectDamage(',
  'runtimeV02BeginEventListenerContinuation(',
  'runtimeV02PreflightDefeatScan(state, describe)',
  'runtimeV02ScanAndQueueDefeats(',
  'state.phase = pendingResolution ? "resolution" : "play"',
]) {
  if (!tactic.includes(marker)) throw new Error(`Tactic DIRECT_DAMAGE wiring marker missing: ${marker}`);
}
for (const marker of [
  "runtimeV02ApplyDirectDamage",
  "runtimeV02ApplyEffectDamagePacket",
  "runtimeV02ApplyRecoilDamagePacket",
]) {
  if (!owner.includes(marker)) throw new Error(`DIRECT_DAMAGE owner marker missing: ${marker}`);
}
if (!event.includes('if (op === "DIRECT_DAMAGE")')) {
  throw new Error("Event Listener DIRECT_DAMAGE route missing");
}
if (!attack.includes("structuredRuntimeAfterDamageRecoilEffects")) {
  throw new Error("Attack recoil DIRECT_DAMAGE route missing");
}
if (!ability.includes("runtimeV02ApplyDirectDamage")) {
  throw new Error("active Ability DIRECT_DAMAGE route missing");
}
if (!match.includes("runtimeV02ApplyDirectDamage(s,plan.target,plan.step")) {
  throw new Error("Attack modifier-consume DIRECT_DAMAGE route missing");
}
for (const forbidden of ["ember-ashen-gamble", "Ashen Gamble"]) {
  if (tactic.includes(forbidden) || owner.includes(forbidden)) {
    throw new Error(`card identity leaked into Tactic DIRECT_DAMAGE runtime: ${forbidden}`);
  }
}
process.stdout.write("V2.4.99 all eight DIRECT_DAMAGE consumers have canonical surface ownership.\n");
