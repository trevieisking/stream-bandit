import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageTimefoldEffect } from "../_shared/tcg-match-attack-effects-v0-2.ts";

function equal(actual: unknown, expected: unknown) { if (!Object.is(actual, expected)) throw new Error(`expected ${String(expected)}, got ${String(actual)}`); }
function throws(fn: () => unknown, fragment: string) { try { fn(); } catch (error) { const m=error instanceof Error?error.message:String(error); if(!m.includes(fragment))throw error; return; } throw new Error(`expected ${fragment}`); }
function stateWith(afterDamage: unknown[]) {
  const cardId="test-timefold-creature";
  return { runtime_registry_v0_2: runtimeV02SnapshotMarker(), card_index: { [cardId]: { card_id: cardId, definition_v0_2: { schema:"sb-tcg-card-v0.2", effect_schema:"sb-tcg-effects-v0.2", id:cardId, name:"Timefold Creature", card_family:"Creature", creature:{ attacks:[{ id:"second-horizon", name:"Second Horizon", cost:[], base_damage:160, damage_formula:null, requirements:[], on_declare:[], before_damage:[], after_damage:afterDamage }] } }, definition_v0_2_rules_version:"sb-tcg-card-v0.2" } } } as Record<string,unknown>;
}
Deno.test("TIMEFOLD descriptor is registry-driven and exact", () => {
  const r=structuredRuntimeAfterDamageTimefoldEffect(stateWith([{op:"TIMEFOLD"}]),{card_id:"test-timefold-creature"},1);
  equal(r?.attack_id,"second-horizon"); equal(r?.phase,"after_damage");
});
Deno.test("non-TIMEFOLD after_damage remains outside TIMEFOLD ownership", () => {
  equal(structuredRuntimeAfterDamageTimefoldEffect(stateWith([{op:"HEAL",target:"$source_creature",amount:20}]),{card_id:"test-timefold-creature"},1),null);
});
Deno.test("mixed or extended TIMEFOLD metadata fails closed", () => {
  throws(()=>structuredRuntimeAfterDamageTimefoldEffect(stateWith([{op:"TIMEFOLD"},{op:"DRAW",player:"self",count:1}]),{card_id:"test-timefold-creature"},1),"tcg_v0_2_attack_timefold_program_unsupported");
  throws(()=>structuredRuntimeAfterDamageTimefoldEffect(stateWith([{op:"TIMEFOLD",surprise:true}]),{card_id:"test-timefold-creature"},1),"tcg_v0_2_attack_timefold_step_field_unsupported");
});
