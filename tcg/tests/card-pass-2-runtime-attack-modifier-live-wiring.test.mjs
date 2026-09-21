import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const matchActions = fs.readFileSync("supabase/functions/tcg-match-actions/index.ts", "utf8");
const owner = fs.readFileSync("supabase/functions/_shared/tcg-match-attack-modifier-v0-2.ts", "utf8");
const damageOwner = fs.readFileSync("supabase/functions/_shared/tcg-match-attack-damage-v0-2.ts", "utf8");

test("Attack #14 live path consumes the canonical modifier owner only after legal declaration setup", () => {
  assert.ok(owner.includes("export function runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration("));
  assert.ok(matchActions.includes("tcg-match-attack-modifier-v0-2.ts"));
  const consume = matchActions.indexOf("runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(s,p.vanguard");
  const damage = matchActions.indexOf("const dmg=attackDamage(p.vanguard,target,s,declaredAttackDamage", consume);
  assert.ok(consume > 0 && damage > consume, "canonical modifier consumption must feed final attack damage");
  const block = matchActions.slice(consume, damage);
  assert.ok(block.includes("base_damage:formulaBase+bonus"));
  assert.ok(block.includes("target_uid:attackSourceUid"));
  assert.ok(block.includes("attackModifierConsumption?.damage??(formulaBase+bonus)"));
  assert.ok(block.includes("pending_attack_modifier_riders"));
});

test("Attack modifier completion riders flush atomically at defeat-scan boundary through Damage owner", () => {
  assert.ok(matchActions.includes("tcg-match-damage-engine-v0-2.ts"));
  const start = matchActions.indexOf("const flushAttackModifierRiders=");
  const end = matchActions.indexOf("const scanDefeats=", start);
  assert.ok(start > 0 && end > start, "missing bounded completion-rider helper");
  const helper = matchActions.slice(start, end);
  assert.ok(helper.includes('rider.timing!=="after_attack_effects_before_defeat_scan"'));
  assert.ok(helper.includes('step.op!=="DIRECT_DAMAGE"'));
  assert.ok(helper.includes('step.target!=="$modifier_target"'));
  assert.ok(helper.includes("runtimeV02DealEffectDamage(plan.target,plan.amount)"));
  assert.ok(helper.includes("delete s.pending_attack_modifier_riders"));
  for (const forbidden of ["ember-pyrohorn", "Ash Crown", "crownfire", "ashen-stampede"]) {
    assert.equal(helper.includes(forbidden), false, `completion rider wiring must remain card-ID/name-free: ${forbidden}`);
  }
  assert.ok(matchActions.includes("const scanDefeats=()=>{const attackModifierRiderReceipts=flushAttackModifierRiders();"));
});

test("unused Attack modifiers expire through Attack #14 at end of turn", () => {
  assert.ok(owner.includes("export function runtimeV02ExpireAttackDamageModifiersAtEndOfTurn("));
  const aftermath = matchActions.indexOf("const aftermath=(who:number)=>");
  const continuation = matchActions.indexOf("const continueResolution=", aftermath);
  assert.ok(aftermath > 0 && continuation > aftermath);
  const block = matchActions.slice(aftermath, continuation);
  assert.ok(block.includes("runtimeV02ExpireAttackDamageModifiersAtEndOfTurn"));
  assert.ok(block.indexOf("runtimeV02ExpireAttackDamageModifiersAtEndOfTurn") < block.indexOf("scanDefeats()"));
});

test("legacy matches preserve prior damage when structured Attack modifier owner is inactive", () => {
  assert.ok(owner.includes("if (!assertRuntimeV02MatchSnapshot(state)) return null;"));
  assert.ok(matchActions.includes("attackModifierConsumption?.damage??(formulaBase+bonus)"));
});

test("Creature continuous outgoing Attack damage stays generic and Match-owned", () => {
  assert.ok(damageOwner.includes("function outgoingSelfAbilityEffects("));
  assert.ok(damageOwner.includes("evaluateRuntimeV02SourceDamagedRequirement("));
  assert.ok(damageOwner.includes("evaluateRuntimeV02SourceHasShieldAtLeastRequirement("));
  assert.ok(damageOwner.includes('name === "control_condition_present"'));
  assert.ok(damageOwner.includes('predicate.target !== "$current_opponent_vanguard"'));
  assert.ok(damageOwner.includes("current_opponent_vanguard_control_condition"));
  assert.ok(damageOwner.includes("attack_id: context.attack_id"));

  assert.ok(matchActions.includes("runtimeConditions(currentOpponentVanguard).control"));
  assert.ok(matchActions.includes("attack_id:String(atk.id||"));
  assert.ok(matchActions.includes("current_opponent_vanguard_control_condition"));

  for (const forbidden of [
    "ember-glowcub",
    "shade-murkmite",
    "stone-quartzram",
    "warm-blood",
    "murk-sense",
    "prismatic-bulwark",
  ]) {
    assert.equal(damageOwner.includes(forbidden), false, "Attack Damage owner must remain card-ID/name-free: " + forbidden);
    assert.equal(matchActions.includes(forbidden), false, "Match wiring must remain card-ID/name-free: " + forbidden);
  }
});

