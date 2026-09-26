import fs from "node:fs";

const tide = fs.readFileSync("tcg-card-pass-2-tide.md", "utf8");
const owner = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-attack-after-damage-finished-v0-2.ts",
  "utf8",
);
const match = fs.readFileSync(
  "supabase/functions/tcg-match-actions/index.ts",
  "utf8",
);
const healLive = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-heal-listener-live-v0-2.ts",
  "utf8",
);
const battle = fs.readFileSync("stream-bandit-tcg-v2-battle-controller.js", "utf8");

if (!tide.includes('"id":"tide-marevault-heart-of-tides"')) {
  throw new Error("Marevault frozen card missing");
}
for (const marker of [
  '"after_damage_finished":[{"op":"MOVE_ATTACHED_ESSENCE"',
  '"op":"HEAL_EACH","targets":"$vault_heals","amount":30',
  '"op":"OPTIONAL","player":"self"',
  '"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$vault_switch"',
]) {
  if (!tide.includes(marker)) throw new Error(`Marevault frozen program marker missing: ${marker}`);
}
for (const marker of [
  "structuredRuntimeAttackAfterDamageFinishedProgram",
  "runtimeV02ResolveAttackAfterDamageFinishedChoice",
  "applyRuntimeV02EssenceTransfer",
  "applyRuntimeV02HealPacket",
  "runtimeV02ApplyAtomicSwitch",
]) {
  if (!owner.includes(marker)) throw new Error(`mixed Attack owner marker missing: ${marker}`);
}
for (const marker of [
  "runtimeV02InitialAttackAfterDamageFinishedResume",
  'pending.kind==="after_damage_finished_program"',
  'setMovementResume("attack_program"',
  "runtimeV02BeginAttackProgramHealListenerContinuation",
  'resumeKind==="resume_attack_program"',
]) {
  if (!match.includes(marker)) throw new Error(`Match mixed-program wiring marker missing: ${marker}`);
}
if (!healLive.includes('"resume_attack_program"')) {
  throw new Error("Heal Listener mixed-program resume identity missing");
}
for (const marker of [
  "view.pending_attack_choice",
  "choice.min",
  "choice.max",
  "choice.options",
  "resolve_attack_choice",
]) {
  if (!battle.includes(marker)) throw new Error(`generic battle choice transport marker missing: ${marker}`);
}
for (const source of [owner, match, healLive]) {
  if (source.includes("tide-marevault-heart-of-tides") || source.includes("Marevault")) {
    throw new Error("Marevault identity must not be mixed Attack dispatch authority");
  }
}
process.stdout.write("V2.4.93 Marevault after-damage-finished program is generic and engine-owned.\n");
