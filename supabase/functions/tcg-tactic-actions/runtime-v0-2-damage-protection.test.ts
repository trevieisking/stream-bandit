import {
  runtimeV02ApplyDamageProtections,
  runtimeV02DamageProtectionCount,
  runtimeV02InstallDamageProtection,
} from "./tcg-match-damage-protection-v0-2.ts";

function equal(actual: unknown, expected: unknown, label="mismatch") { if (JSON.stringify(actual)!==JSON.stringify(expected)) throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`); }
function install(cr:any, overrides:Record<string,unknown>={}) {
  return runtimeV02InstallDamageProtection(cr, {
    protection_id:"protect:seraphic:target",source_action_id:"ability:veil",source_uid:"seraph-uid",source_card_id:"generic-seraph",source_kind:"ability",source_controller_seat:1,target_controller_seat:1,target_creature_uid:"target",installed_turn_seq:5,damage_classes:["effect"],source_controller:"opponent",reduce_amount:30,minimum:0,max_uses:1,expires_on:"start_of_controller_next_turn",...overrides,
  } as any);
}
const context=(overrides:Record<string,unknown>={})=>({turn_seq:6,active_seat:2 as const,source_controller_seat:2 as const,target_controller_seat:1 as const,target_creature_uid:"target",damage_class:"effect" as const,packet_id:"p1",...overrides});

Deno.test("temporary damage protection reduces one matching opposing effect packet",()=>{const cr:any={flags:{}};install(cr);const r=runtimeV02ApplyDamageProtections(cr,50,context());equal(r.final_amount,20);equal(r.modifications.length,1);equal(runtimeV02DamageProtectionCount(cr),0)});
Deno.test("temporary damage protection ignores friendly and non-matching packets",()=>{for(const c of [context({source_controller_seat:1}),context({damage_class:"attack"})]){const cr:any={flags:{}};install(cr);equal(runtimeV02ApplyDamageProtections(cr,50,c as any).final_amount,50);equal(runtimeV02DamageProtectionCount(cr),1)}});
Deno.test("temporary damage protection expires at target controller next turn",()=>{const cr:any={flags:{}};install(cr);equal(runtimeV02ApplyDamageProtections(cr,50,context({turn_seq:7,active_seat:1}) as any).final_amount,50);equal(runtimeV02DamageProtectionCount(cr),0)});
Deno.test("multiple stored protections resolve deterministically in install order",()=>{const cr:any={flags:{}};install(cr,{protection_id:"p1",reduce_amount:30});install(cr,{protection_id:"p2",source_uid:"other",reduce_amount:20});const r=runtimeV02ApplyDamageProtections(cr,40,context());equal(r.final_amount,0);equal(r.modifications.map(m=>m.source_uid),["seraph-uid","other"])});
