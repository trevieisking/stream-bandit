import fs from "node:fs";
const ember=fs.readFileSync("tcg-card-pass-2-ember.md","utf8");
const owner=fs.readFileSync("supabase/functions/_shared/tcg-match-active-ability-hand-attachment-damage-v0-2.ts","utf8");
const live=fs.readFileSync("supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts","utf8");
const continuation=fs.readFileSync("supabase/functions/_shared/tcg-match-active-ability-continuation-v0-2.ts","utf8");
const match=fs.readFileSync("supabase/functions/tcg-match-actions/index.ts","utf8");

for(const marker of [
  '"id":"ember-magmagecko"',
  '"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"hand"',
  '"op":"DIRECT_DAMAGE","target":"$feed_target","amount":10,"damage_class":"effect"',
]) if(!ember.includes(marker)) throw new Error(`frozen active Ability DIRECT_DAMAGE marker missing: ${marker}`);

for(const marker of [
  "structuredRuntimeActiveAbilityHandAttachmentDamage",
  "select_target_then_hand_essence_direct_damage",
  "runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice",
]) if(!live.includes(marker)) throw new Error(`live Active Ability marker missing: ${marker}`);

for(const marker of [
  "RuntimeV02ActiveAbilityHandAttachmentDamageResume",
  'raw.kind === "hand_attachment_damage"',
  "runtimeV02ResumeActiveAbilityHandAttachmentDamage",
]) if(!continuation.includes(marker)) throw new Error(`continuation marker missing: ${marker}`);

for(const marker of [
  'resolved.kind==="hand_attachment_damage"&&resolved.stage==="essence_choice_required"',
  'resolved.kind==="hand_attachment_damage"&&resolved.stage==="attachment_resolved"',
  'completed.kind==="hand_attachment_damage"',
  "runtimeV02BeginEventListenerContinuation(s,[completed.after_damage_event])",
  'setEventResume("ability",resumeSeat)',
  'setMovementResume("ability",resumeSeat,damageEventFlow.emitted_heal_packet_ids)',
]) if(!match.includes(marker)) throw new Error(`Match hand-damage wiring marker missing: ${marker}`);

if(match.includes("target_anchor_uid:resolved.target_anchor_uid")) throw new Error("private target anchor leaked into public Match receipt");
for(const forbidden of ["ember-magmagecko","Magmagecko","Ember Feed"]) {
  if(owner.includes(forbidden)||live.includes(forbidden)||continuation.includes(forbidden)||match.includes(forbidden)) {
    throw new Error(`card identity leaked into active Ability DIRECT_DAMAGE runtime: ${forbidden}`);
  }
}
process.stdout.write("V2.4.99 active Ability DIRECT_DAMAGE route is generic and canonical.\n");
