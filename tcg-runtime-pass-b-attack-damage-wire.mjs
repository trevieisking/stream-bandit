import fs from 'node:fs';

const target = 'supabase/functions/tcg-match-actions/index.ts';
const source = fs.readFileSync(target, 'utf8');

const withdrawalImport = 'import { structuredRuntimeWithdrawalBaseCost } from "../_shared/tcg-match-withdrawal-v0-2.ts";\n';
const bridgeImport = 'import { structuredRuntimeIncomingAttackDamage, structuredRuntimeOutgoingAttackDamage } from "../_shared/tcg-match-attack-damage-v0-2.ts";\n';

const legacy = 'function attackDamage(cr:Cr,target:Cr,s:any,base:number){let n=Math.max(0,base);const af=(cr.flags||{}) as any;n+=Number(af.next_attack_bonus||0);af.next_attack_bonus=0;const lifecycle=af.lifecycle_attack_bonus;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)){n+=Math.max(0,Number(lifecycle.amount||0));const uses=Math.max(1,Number(lifecycle.uses||1));if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus}for(const e of cr.essence||[])if(e.card_id==="shade-whisper-essence"&&hasCondition(target))n+=10;const q=conditions(target);if(q.modifier==="Crushed"){n+=20;q.modifier=null}for(const e of target.essence||[])if(e.card_id==="stone-anchor-essence")n=Math.max(0,n-10);const shield=Math.max(0,Number(target.shield||0)),blocked=Math.min(shield,n);target.shield=shield-blocked;target.damage=Number(target.damage||0)+(n-blocked);return{dealt:n-blocked,blocked}}';

const wired = 'function attackDamage(cr:Cr,target:Cr,s:any,base:number,ctx:{target_zone:string,target_controller:"self"|"opponent",source_controller:"self"|"opponent"}){let n=Math.max(0,base);const af=(cr.flags||{}) as any;n+=Number(af.next_attack_bonus||0);af.next_attack_bonus=0;const lifecycle=af.lifecycle_attack_bonus;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)){n+=Math.max(0,Number(lifecycle.amount||0));const uses=Math.max(1,Number(lifecycle.uses||1));if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus}const structuredContext={...ctx,target_has_any_condition:hasCondition(target)};const outgoing=structuredRuntimeOutgoingAttackDamage(s,cr,target,n,structuredContext);if(outgoing==null){for(const e of cr.essence||[])if(e.card_id==="shade-whisper-essence"&&hasCondition(target))n+=10}else n=outgoing;const q=conditions(target);if(q.modifier==="Crushed"){n+=20;q.modifier=null}const incoming=structuredRuntimeIncomingAttackDamage(s,cr,target,n,structuredContext);if(incoming==null){for(const e of target.essence||[])if(e.card_id==="stone-anchor-essence")n=Math.max(0,n-10)}else n=incoming;const shield=Math.max(0,Number(target.shield||0)),blocked=Math.min(shield,n);target.shield=shield-blocked;target.damage=Number(target.damage||0)+(n-blocked);return{dealt:n-blocked,blocked}}';
const surgeBonus = 'const structuredAttachmentBonus=structuredRuntimeAttachmentAttackBonus(s,cr,Number(s.turn_seq||0));if(structuredAttachmentBonus!=null)n+=structuredAttachmentBonus;';
const wiredWithSurge = wired.replace('const structuredContext=', surgeBonus + 'const structuredContext=');

const legacyCall = 'const dmg=attackDamage(p.vanguard,target,s,atk.damage+bonus);';
const wiredCall = 'const relation=targetSeat===seat?"self":"opponent";const dmg=attackDamage(p.vanguard,target,s,atk.damage+bonus,{target_zone:targetWhere,target_controller:relation,source_controller:relation});';
const countAddWiredCall = 'const formulaBase=countAddEvaluation?.damage??atk.damage;const formulaBonus=Math.max(0,formulaBase-atk.damage);const relation=targetSeat===seat?"self":"opponent";const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus,{target_zone:targetWhere,target_controller:relation,source_controller:relation});';
const combinedFormulaWiredCall = 'const countFormulaBonus=countAddEvaluation?Math.max(0,countAddEvaluation.damage-atk.damage):0;const conditionalFormulaBonus=conditionalAddEvaluation?Math.max(0,conditionalAddEvaluation.damage-atk.damage):0;const formulaBonus=countFormulaBonus+conditionalFormulaBonus;const formulaBase=atk.damage+formulaBonus;const relation=targetSeat===seat?"self":"opponent";const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus,{target_zone:targetWhere,target_controller:relation,source_controller:relation});';

let next = source;
if (!next.includes(bridgeImport)) {
  if (!next.includes(withdrawalImport)) throw new Error('match_actions_attack_damage_import_anchor_changed');
  next = next.replace(withdrawalImport, withdrawalImport + bridgeImport);
}

if (next.includes(legacy)) next = next.replace(legacy, wired);
else if (!next.includes(wired) && !next.includes(wiredWithSurge)) throw new Error('match_actions_attack_damage_function_changed');

if (next.includes(legacyCall)) next = next.replace(legacyCall, wiredCall);
else if (!next.includes(wiredCall) && !next.includes(countAddWiredCall) && !next.includes(combinedFormulaWiredCall)) throw new Error('match_actions_attack_damage_call_changed');

const wiredVariants = [wired, wiredWithSurge].filter((candidate) => next.includes(candidate));
const wiredCallVariants = [wiredCall, countAddWiredCall, combinedFormulaWiredCall].filter((candidate) => next.includes(candidate));
if (!next.includes(bridgeImport) || wiredVariants.length !== 1 || wiredCallVariants.length !== 1) throw new Error('match_actions_attack_damage_wiring_incomplete');
if (next.indexOf(wiredVariants[0]) !== next.lastIndexOf(wiredVariants[0])) throw new Error('match_actions_attack_damage_wiring_duplicate');
if (next.indexOf(wiredCallVariants[0]) !== next.lastIndexOf(wiredCallVariants[0])) throw new Error('match_actions_attack_damage_call_duplicate');

if (process.argv.includes('--check')) {
  if (next !== source) throw new Error('match_actions_attack_damage_wiring_not_materialized');
  process.stdout.write('Runtime Pass B attack-damage wiring is materialized.\n');
} else {
  fs.writeFileSync(target, next, 'utf8');
  process.stdout.write(next === source ? 'Runtime Pass B attack-damage wiring already materialized.\n' : 'Runtime Pass B attack-damage wiring materialized.\n');
}
