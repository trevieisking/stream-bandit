from pathlib import Path

path = Path("supabase/functions/tcg-match-actions/index.ts")
source = path.read_text()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


import_anchor = 'import { runtimeV02ResolveAttackTarget, type RuntimeV02AttackTargetPermission } from "../_shared/tcg-match-attack-v0-2.ts";'
source = replace_once(
    source,
    import_anchor,
    import_anchor
    + "\n"
    + 'import { runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration, runtimeV02ExpireAttackDamageModifiersAtEndOfTurn } from "../_shared/tcg-match-attack-modifier-v0-2.ts";\n'
    + 'import { runtimeV02DealEffectDamage } from "../_shared/tcg-match-damage-engine-v0-2.ts";',
    "attack modifier imports",
)

scan_anchor = "  const scanDefeats=()=>{const defeated:any[]=[];"
scan_replacement = '''  const flushAttackModifierRiders=()=>{const raw=s.pending_attack_modifier_riders;if(raw==null)return[];if(!Array.isArray(raw))throw new Error("tcg_v0_2_attack_modifier_rider_queue_invalid");const plans:{target:Cr;amount:number;modifier_id:string;rider_id:string}[]=[];for(const rider of raw){if(!rider||typeof rider!=="object"||rider.timing!=="after_attack_effects_before_defeat_scan")throw new Error("tcg_v0_2_attack_modifier_rider_invalid");const targetUid=String(rider.modifier_target_uid||"");let target:Cr|null=null;for(const who of [1,2]){for(const field of allCr(s.players[String(who)])){const inst=field.cr.stack?.[field.cr.stack.length-1];if(inst?.uid===targetUid){target=field.cr;break}}if(target)break}if(!target)throw new Error("tcg_v0_2_attack_modifier_rider_target_missing");if(!Array.isArray(rider.steps)||rider.steps.length<1)throw new Error("tcg_v0_2_attack_modifier_rider_steps_invalid");for(const step of rider.steps){if(!step||step.op!=="DIRECT_DAMAGE"||step.target!=="$modifier_target"||(step.damage_class!=null&&step.damage_class!=="effect"))throw new Error("tcg_v0_2_attack_modifier_rider_step_unsupported");const amount=Number(step.amount);if(!Number.isFinite(amount)||amount<0)throw new Error("tcg_v0_2_attack_modifier_rider_amount_invalid");plans.push({target,amount,modifier_id:String(rider.modifier_id||""),rider_id:String(rider.id||"")})}}const receipts=plans.map((plan)=>({modifier_id:plan.modifier_id,rider_id:plan.rider_id,...runtimeV02DealEffectDamage(plan.target,plan.amount)}));delete s.pending_attack_modifier_riders;return receipts};
  const scanDefeats=()=>{const attackModifierRiderReceipts=flushAttackModifierRiders();if(attackModifierRiderReceipts.length)log(`Resolved ${attackModifierRiderReceipts.length} Attack modifier completion rider(s).`);const defeated:any[]=[];'''
source = replace_once(source, scan_anchor, scan_replacement, "defeat-scan rider boundary")

aftermath_anchor = "for(const plan of resolved.transfer_plans)runtimeV02ApplyCardZoneTransfer(plan.source_cards,owner.discard,plan.request);const n=scanDefeats();"
aftermath_replacement = "for(const plan of resolved.transfer_plans)runtimeV02ApplyCardZoneTransfer(plan.source_cards,owner.discard,plan.request);const expiredAttackModifierIds=allCr(owner).flatMap((field)=>runtimeV02ExpireAttackDamageModifiersAtEndOfTurn(s,field.cr,Number(s.turn_seq||0))?.removed_modifier_ids||[]);if(expiredAttackModifierIds.length)log(`Expired ${expiredAttackModifierIds.length} unused Attack modifier(s) at end of turn.`);const n=scanDefeats();"
source = replace_once(source, aftermath_anchor, aftermath_replacement, "end-turn modifier expiry")

damage_anchor = 'const formulaBase=atk.damage+formulaBonus;const relation=targetSeat===seat?"self":"opponent";const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus,{target_zone:targetWhere,target_controller:relation,source_controller:relation});'
damage_replacement = 'const formulaBase=atk.damage+formulaBonus;const relation=targetSeat===seat?"self":"opponent";const attackSourceUid=String(p.vanguard.stack?.[p.vanguard.stack.length-1]?.uid||"");if(!attackSourceUid)throw new Error("tcg_v0_2_attack_modifier_source_uid_required");const attackActionId=`attack:${Number(s.turn_seq||0)}:${seat}:${String(atk.id||slot)}:${attackSourceUid}`;const attackModifierConsumption=runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(s,p.vanguard,{consuming_action_id:attackActionId,target_uid:attackSourceUid,turn_seq:Number(s.turn_seq||0),base_damage:formulaBase+bonus});if(attackModifierConsumption?.bound_riders.length){if(s.pending_attack_modifier_riders!=null){if(!Array.isArray(s.pending_attack_modifier_riders))throw new Error("tcg_v0_2_attack_modifier_rider_queue_invalid");if(s.pending_attack_modifier_riders.length)throw new Error("tcg_v0_2_attack_modifier_rider_queue_busy")}s.pending_attack_modifier_riders=structuredClone(attackModifierConsumption.bound_riders)}const declaredAttackDamage=attackModifierConsumption?.damage??(formulaBase+bonus);const dmg=attackDamage(p.vanguard,target,s,declaredAttackDamage,{target_zone:targetWhere,target_controller:relation,source_controller:relation});'
source = replace_once(source, damage_anchor, damage_replacement, "legal attack declaration modifier consumption")

path.write_text(source)
