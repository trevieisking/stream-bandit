import fs from 'node:fs';

const target = 'supabase/functions/tcg-match-actions/index.ts';
const attachmentRouteTarget = 'supabase/functions/_shared/tcg-match-essence-attachment-route-v0-2.ts';
const attachmentEngineTarget = 'supabase/functions/_shared/tcg-match-essence-attachment-engine-v0-2.ts';
const source = fs.readFileSync(target, 'utf8');
const attachmentRouteSource = fs.readFileSync(attachmentRouteTarget, 'utf8');
const attachmentEngineSource = fs.readFileSync(attachmentEngineTarget, 'utf8');

const attackImport = 'import { structuredRuntimeIncomingAttackDamage, structuredRuntimeOutgoingAttackDamage } from "../_shared/tcg-match-attack-damage-v0-2.ts";\n';
const surgeImportLegacy = 'import { applyStructuredRuntimeEssenceAttachmentLifecycle, clearStructuredRuntimeAttachmentAttackBonusesAtAftermath, structuredRuntimeAftermathEssenceDisposition, structuredRuntimeAttachmentAttackBonus } from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";\n';
const surgeImportCanonicalAttachment = 'import { clearStructuredRuntimeAttachmentAttackBonusesAtAftermath, registerStructuredRuntimeEssenceAttachmentLifecycleState, structuredRuntimeAftermathEssenceDisposition, structuredRuntimeAttachmentAttackBonus } from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";\n';
const surgeImportEngineOwned = 'import { clearStructuredRuntimeAttachmentAttackBonusesAtAftermath, structuredRuntimeAftermathEssenceDisposition, structuredRuntimeAttachmentAttackBonus } from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";\n';
const attachmentRouteImport = 'import { runtimeV02BeginExternalEssenceAttachmentRoute } from "../_shared/tcg-match-essence-attachment-route-v0-2.ts";\n';

const attackLegacy = 'function attackDamage(cr:Cr,target:Cr,s:any,base:number,ctx:{target_zone:string,target_controller:"self"|"opponent",source_controller:"self"|"opponent"}){let n=Math.max(0,base);const af=(cr.flags||{}) as any;n+=Number(af.next_attack_bonus||0);af.next_attack_bonus=0;const lifecycle=af.lifecycle_attack_bonus;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)){n+=Math.max(0,Number(lifecycle.amount||0));const uses=Math.max(1,Number(lifecycle.uses||1));if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus}const structuredContext={...ctx,target_has_any_condition:hasCondition(target)};const outgoing=structuredRuntimeOutgoingAttackDamage(s,cr,target,n,structuredContext);if(outgoing==null){for(const e of cr.essence||[])if(e.card_id==="shade-whisper-essence"&&hasCondition(target))n+=10}else n=outgoing;const q=conditions(target);if(q.modifier==="Crushed"){n+=20;q.modifier=null}const incoming=structuredRuntimeIncomingAttackDamage(s,cr,target,n,structuredContext);if(incoming==null){for(const e of target.essence||[])if(e.card_id==="stone-anchor-essence")n=Math.max(0,n-10)}else n=incoming;const shield=Math.max(0,Number(target.shield||0)),blocked=Math.min(shield,n);target.shield=shield-blocked;target.damage=Number(target.damage||0)+(n-blocked);return{dealt:n-blocked,blocked}}';
const attackWired = 'function attackDamage(cr:Cr,target:Cr,s:any,base:number,ctx:{target_zone:string,target_controller:"self"|"opponent",source_controller:"self"|"opponent"}){let n=Math.max(0,base);const af=(cr.flags||{}) as any;n+=Number(af.next_attack_bonus||0);af.next_attack_bonus=0;const lifecycle=af.lifecycle_attack_bonus;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)){n+=Math.max(0,Number(lifecycle.amount||0));const uses=Math.max(1,Number(lifecycle.uses||1));if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus}const structuredAttachmentBonus=structuredRuntimeAttachmentAttackBonus(s,cr,Number(s.turn_seq||0));if(structuredAttachmentBonus!=null)n+=structuredAttachmentBonus;const structuredContext={...ctx,target_has_any_condition:hasCondition(target)};const outgoing=structuredRuntimeOutgoingAttackDamage(s,cr,target,n,structuredContext);if(outgoing==null){for(const e of cr.essence||[])if(e.card_id==="shade-whisper-essence"&&hasCondition(target))n+=10}else n=outgoing;const q=conditions(target);if(q.modifier==="Crushed"){n+=20;q.modifier=null}const incoming=structuredRuntimeIncomingAttackDamage(s,cr,target,n,structuredContext);if(incoming==null){for(const e of target.essence||[])if(e.card_id==="stone-anchor-essence")n=Math.max(0,n-10)}else n=incoming;const shield=Math.max(0,Number(target.shield||0)),blocked=Math.min(shield,n);target.shield=shield-blocked;target.damage=Number(target.damage||0)+(n-blocked);return{dealt:n-blocked,blocked}}';

const attachLegacy = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;const td=top(cr,s);\n   if(d.id===';
const attachEngineBoundary = 'const td=top(cr,s);const structuredAttachment=s.runtime_registry_v0_2!=null;\n   if(structuredAttachment){';
const attachRouteCall = 'runtimeV02BeginExternalEssenceAttachmentRoute(s,seat as 1|2,targetInst.uid,uid,"hand","manual_essence"';
const attachmentEngineLifecycleImport = 'import { registerStructuredRuntimeEssenceAttachmentLifecycleState } from "./tcg-match-surge-lifecycle-v0-2.ts";';
const attachmentEngineLifecycleCall = 'const lifecycleRegistered = registerStructuredRuntimeEssenceAttachmentLifecycleState(';
const attachmentRouteEngineCall = 'runtimeV02ApplyEssenceAttachmentTransaction(';

const aftermathLegacy = 'const kept:Inst[]=[];for(const e of x.cr.essence||[]){const ef=(e.effect_flags||{}) as any;const generated=ef.discard_during_target_aftermath===true;const surge=x.where==="vanguard"&&e.card_id==="volt-surge-essence"&&Number(e.attached_turn??-1)===turn;if(generated||surge)owner.discard.push(e);else kept.push(e)}x.cr.essence=kept';
const aftermathDirectWired = 'clearStructuredRuntimeAttachmentAttackBonusesAtAftermath(s,x.cr,turn);const kept:Inst[]=[];for(const e of x.cr.essence||[]){const ef=(e.effect_flags||{}) as any;const generated=ef.discard_during_target_aftermath===true;const structuredDisposition=structuredRuntimeAftermathEssenceDisposition(s,e,turn);const legacySurge=structuredDisposition==null&&x.where==="vanguard"&&e.card_id==="volt-surge-essence"&&Number(e.attached_turn??-1)===turn;if(generated||structuredDisposition==="discard"||legacySurge)owner.discard.push(e);else kept.push(e)}x.cr.essence=kept';
const aftermathCardZoneWired = 'clearStructuredRuntimeAttachmentAttackBonusesAtAftermath(s,x.cr,turn);const discardEssenceUids:string[]=[];for(const e of x.cr.essence||[]){const ef=(e.effect_flags||{}) as any;const generated=ef.discard_during_target_aftermath===true;const structuredDisposition=structuredRuntimeAftermathEssenceDisposition(s,e,turn);const legacySurge=structuredDisposition==null&&x.where==="vanguard"&&e.card_id==="volt-surge-essence"&&Number(e.attached_turn??-1)===turn;if(generated||structuredDisposition==="discard"||legacySurge)discardEssenceUids.push(e.uid)}if(discardEssenceUids.length){const ownerCardUid=String(x.cr.stack?.[x.cr.stack.length-1]?.uid||"");if(!ownerCardUid)throw new Error("tcg_v0_2_aftermath_essence_owner_required");runtimeV02ApplyCardZoneTransfer(x.cr.essence,owner.discard,{cause:"effect",action_kind:"aftermath",source_action_id:"aftermath_essence_disposition",source_card_uid:ownerCardUid,source:{controller_seat:who as 1|2,zone:"attached_essence",owner_card_uid:ownerCardUid},destination:{controller_seat:who as 1|2,zone:"discard",owner_card_uid:null},card_uids:discardEssenceUids,destination_position:"bottom"})}';

let next = source;
if (!next.includes(surgeImportEngineOwned)) {
  if (next.includes(surgeImportCanonicalAttachment)) {
    next = next.replace(surgeImportCanonicalAttachment, surgeImportEngineOwned);
  } else if (next.includes(surgeImportLegacy)) {
    next = next.replace(surgeImportLegacy, surgeImportEngineOwned);
  } else {
    if (!next.includes(attackImport)) throw new Error('match_actions_surge_import_anchor_changed');
    next = next.replace(attackImport, attackImport + surgeImportEngineOwned);
  }
}

if (next.includes(attackLegacy)) next = next.replace(attackLegacy, attackWired);
else if (!next.includes(attackWired)) throw new Error('match_actions_surge_attack_damage_anchor_changed');

// Essence attachment lifecycle authority moved out of Match Actions. Do not
// re-materialize the historical direct helper path: verify the canonical
// Route -> Attachment Engine -> Surge lifecycle chain instead.
if (next.includes(attachLegacy)) throw new Error('match_actions_surge_attach_requires_attachment_engine_route');
if (!next.includes(attachmentRouteImport)) throw new Error('match_actions_attachment_route_import_missing');
if (!next.includes(attachEngineBoundary)) throw new Error('match_actions_attachment_engine_boundary_missing');
if (!next.includes(attachRouteCall)) throw new Error('match_actions_attachment_route_call_missing');
if (next.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState')) {
  throw new Error('match_actions_regained_attachment_lifecycle_authority');
}
if (!attachmentRouteSource.includes(attachmentRouteEngineCall)) {
  throw new Error('attachment_route_engine_delegate_missing');
}
if (!attachmentEngineSource.includes(attachmentEngineLifecycleImport)) {
  throw new Error('attachment_engine_surge_lifecycle_import_missing');
}
if (!attachmentEngineSource.includes(attachmentEngineLifecycleCall)) {
  throw new Error('attachment_engine_surge_lifecycle_call_missing');
}

if (next.includes(aftermathLegacy)) next = next.replace(aftermathLegacy, aftermathCardZoneWired);
else if (next.includes(aftermathDirectWired)) next = next.replace(aftermathDirectWired, aftermathCardZoneWired);
else if (!next.includes(aftermathCardZoneWired)) throw new Error('match_actions_surge_aftermath_anchor_changed');

for (const required of [surgeImportEngineOwned, attackWired, aftermathCardZoneWired, attachmentRouteImport, attachEngineBoundary, attachRouteCall]) {
  if (!next.includes(required)) throw new Error('match_actions_surge_wiring_incomplete');
  if (next.indexOf(required) !== next.lastIndexOf(required)) throw new Error('match_actions_surge_wiring_duplicate');
}

if (process.argv.includes('--check')) {
  if (next !== source) throw new Error('match_actions_surge_wiring_not_materialized');
  process.stdout.write('Runtime Pass B Surge lifecycle wiring is materialized through canonical engine ownership.\n');
} else {
  fs.writeFileSync(target, next, 'utf8');
  process.stdout.write(next === source
    ? 'Runtime Pass B Surge lifecycle wiring already materialized through canonical engine ownership.\n'
    : 'Runtime Pass B Surge lifecycle wiring materialized without restoring direct attachment ownership.\n');
}
