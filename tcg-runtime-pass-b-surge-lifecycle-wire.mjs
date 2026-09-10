import fs from 'node:fs';

const target = 'supabase/functions/tcg-match-actions/index.ts';
const source = fs.readFileSync(target, 'utf8');

const attackImport = 'import { structuredRuntimeIncomingAttackDamage, structuredRuntimeOutgoingAttackDamage } from "../_shared/tcg-match-attack-damage-v0-2.ts";\n';
const surgeImport = 'import { applyStructuredRuntimeEssenceAttachmentLifecycle, clearStructuredRuntimeAttachmentAttackBonusesAtAftermath, structuredRuntimeAftermathEssenceDisposition, structuredRuntimeAttachmentAttackBonus } from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";\n';
const surgeImportCanonicalAttachment = 'import { clearStructuredRuntimeAttachmentAttackBonusesAtAftermath, registerStructuredRuntimeEssenceAttachmentLifecycleState, structuredRuntimeAftermathEssenceDisposition, structuredRuntimeAttachmentAttackBonus } from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";\n';

const attackLegacy = 'function attackDamage(cr:Cr,target:Cr,s:any,base:number,ctx:{target_zone:string,target_controller:"self"|"opponent",source_controller:"self"|"opponent"}){let n=Math.max(0,base);const af=(cr.flags||{}) as any;n+=Number(af.next_attack_bonus||0);af.next_attack_bonus=0;const lifecycle=af.lifecycle_attack_bonus;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)){n+=Math.max(0,Number(lifecycle.amount||0));const uses=Math.max(1,Number(lifecycle.uses||1));if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus}const structuredContext={...ctx,target_has_any_condition:hasCondition(target)};const outgoing=structuredRuntimeOutgoingAttackDamage(s,cr,target,n,structuredContext);if(outgoing==null){for(const e of cr.essence||[])if(e.card_id==="shade-whisper-essence"&&hasCondition(target))n+=10}else n=outgoing;const q=conditions(target);if(q.modifier==="Crushed"){n+=20;q.modifier=null}const incoming=structuredRuntimeIncomingAttackDamage(s,cr,target,n,structuredContext);if(incoming==null){for(const e of target.essence||[])if(e.card_id==="stone-anchor-essence")n=Math.max(0,n-10)}else n=incoming;const shield=Math.max(0,Number(target.shield||0)),blocked=Math.min(shield,n);target.shield=shield-blocked;target.damage=Number(target.damage||0)+(n-blocked);return{dealt:n-blocked,blocked}}';
const attackWired = 'function attackDamage(cr:Cr,target:Cr,s:any,base:number,ctx:{target_zone:string,target_controller:"self"|"opponent",source_controller:"self"|"opponent"}){let n=Math.max(0,base);const af=(cr.flags||{}) as any;n+=Number(af.next_attack_bonus||0);af.next_attack_bonus=0;const lifecycle=af.lifecycle_attack_bonus;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)){n+=Math.max(0,Number(lifecycle.amount||0));const uses=Math.max(1,Number(lifecycle.uses||1));if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus}const structuredAttachmentBonus=structuredRuntimeAttachmentAttackBonus(s,cr,Number(s.turn_seq||0));if(structuredAttachmentBonus!=null)n+=structuredAttachmentBonus;const structuredContext={...ctx,target_has_any_condition:hasCondition(target)};const outgoing=structuredRuntimeOutgoingAttackDamage(s,cr,target,n,structuredContext);if(outgoing==null){for(const e of cr.essence||[])if(e.card_id==="shade-whisper-essence"&&hasCondition(target))n+=10}else n=outgoing;const q=conditions(target);if(q.modifier==="Crushed"){n+=20;q.modifier=null}const incoming=structuredRuntimeIncomingAttackDamage(s,cr,target,n,structuredContext);if(incoming==null){for(const e of target.essence||[])if(e.card_id==="stone-anchor-essence")n=Math.max(0,n-10)}else n=incoming;const shield=Math.max(0,Number(target.shield||0)),blocked=Math.min(shield,n);target.shield=shield-blocked;target.damage=Number(target.damage||0)+(n-blocked);return{dealt:n-blocked,blocked}}';

const attachLegacy = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;const td=top(cr,s);\n   if(d.id===';
const attachWired = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;const td=top(cr,s);const structuredLifecycle=applyStructuredRuntimeEssenceAttachmentLifecycle(s,cr,x,String(td?.element||""),"hand",turn);void structuredLifecycle;\n   if(d.id===';
const attachWired79b = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;const td=top(cr,s);const structuredLifecycle=applyStructuredRuntimeEssenceAttachmentLifecycle(s,cr,x,String(td?.element||""),"hand",turn);if(structuredLifecycle!=null){const targetInst=cr.stack?.length?cr.stack[cr.stack.length-1]:null;if(!targetInst)throw new Error("tcg_v0_2_attachment_target_anchor_required");recordRuntimeV02EssenceAttachmentEvent(s,seat as 1|2,targetInst.uid,x,"hand","manual_essence")}\n   if(d.id===';
const attachWiredCanonical = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;const td=top(cr,s);const structuredAttachment=s.runtime_registry_v0_2!=null;\n   if(structuredAttachment){';

const aftermathLegacy = 'const kept:Inst[]=[];for(const e of x.cr.essence||[]){const ef=(e.effect_flags||{}) as any;const generated=ef.discard_during_target_aftermath===true;const surge=x.where==="vanguard"&&e.card_id==="volt-surge-essence"&&Number(e.attached_turn??-1)===turn;if(generated||surge)owner.discard.push(e);else kept.push(e)}x.cr.essence=kept';
const aftermathWired = 'clearStructuredRuntimeAttachmentAttackBonusesAtAftermath(s,x.cr,turn);const kept:Inst[]=[];for(const e of x.cr.essence||[]){const ef=(e.effect_flags||{}) as any;const generated=ef.discard_during_target_aftermath===true;const structuredDisposition=structuredRuntimeAftermathEssenceDisposition(s,e,turn);const legacySurge=structuredDisposition==null&&x.where==="vanguard"&&e.card_id==="volt-surge-essence"&&Number(e.attached_turn??-1)===turn;if(generated||structuredDisposition==="discard"||legacySurge)owner.discard.push(e);else kept.push(e)}x.cr.essence=kept';

let next = source;
if (!next.includes(surgeImport) && !next.includes(surgeImportCanonicalAttachment)) {
  if (!next.includes(attackImport)) throw new Error('match_actions_surge_import_anchor_changed');
  next = next.replace(attackImport, attackImport + surgeImport);
}

if (next.includes(attackLegacy)) next = next.replace(attackLegacy, attackWired);
else if (!next.includes(attackWired)) throw new Error('match_actions_surge_attack_damage_anchor_changed');

if (next.includes(attachLegacy)) next = next.replace(attachLegacy, attachWired);
else if (!next.includes(attachWired) && !next.includes(attachWired79b) && !next.includes(attachWiredCanonical)) throw new Error('match_actions_surge_attach_anchor_changed');

if (next.includes(aftermathLegacy)) next = next.replace(aftermathLegacy, aftermathWired);
else if (!next.includes(aftermathWired)) throw new Error('match_actions_surge_aftermath_anchor_changed');

const materializedImport = next.includes(surgeImportCanonicalAttachment) ? surgeImportCanonicalAttachment : surgeImport;
for (const required of [materializedImport, attackWired, aftermathWired]) {
  if (!next.includes(required)) throw new Error('match_actions_surge_wiring_incomplete');
  if (next.indexOf(required) !== next.lastIndexOf(required)) throw new Error('match_actions_surge_wiring_duplicate');
}
const materializedAttach = next.includes(attachWiredCanonical) ? attachWiredCanonical : next.includes(attachWired79b) ? attachWired79b : attachWired;
if (!next.includes(materializedAttach)) throw new Error('match_actions_surge_wiring_incomplete');
if (next.indexOf(materializedAttach) !== next.lastIndexOf(materializedAttach)) throw new Error('match_actions_surge_wiring_duplicate');

if (process.argv.includes('--check')) {
  if (next !== source) throw new Error('match_actions_surge_wiring_not_materialized');
  process.stdout.write('Runtime Pass B Surge lifecycle wiring is materialized.\n');
} else {
  fs.writeFileSync(target, next, 'utf8');
  process.stdout.write(next === source ? 'Runtime Pass B Surge lifecycle wiring already materialized.\n' : 'Runtime Pass B Surge lifecycle wiring materialized.\n');
}
