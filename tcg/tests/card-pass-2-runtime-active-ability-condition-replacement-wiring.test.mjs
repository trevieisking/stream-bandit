import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const owner = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-active-ability-condition-replacement-v0-2.ts",
  "utf8",
);
const router = fs.readFileSync(
  "supabase/functions/_shared/tcg-match-active-ability-live-route-v0-2.ts",
  "utf8",
);
const match = fs.readFileSync(
  "supabase/functions/tcg-match-actions/index.ts",
  "utf8",
);

test("active condition replacement delegates turn-limit/payment and Condition semantics to canonical owners", () => {
  assert.ok(owner.includes("runtimeV02BeginActiveAbilityActivationCost("));
  assert.ok(owner.includes("applyRuntimeConditionWithContext("));
  assert.ok(owner.includes('"replace"'));
  assert.ok(owner.includes('"control_condition_present"'));
  assert.ok(owner.includes('"REPLACE_CONTROL_CONDITION"'));
  assert.ok(owner.includes('target: "$current_opponent_vanguard"'));
  assert.ok(owner.includes("runtimeConditions(opponent).control"));
  assert.ok(owner.includes("structuredClone("));
});

test("single live Ability router exposes condition replacement as its own immediate family", () => {
  assert.ok(router.includes("runtimeV02ExecuteActiveAbilityConditionReplacement("));
  assert.ok(router.includes('kind: "condition_replacement"'));
  assert.ok(match.includes('routed.kind==="condition_replacement"'));
  assert.ok(match.includes("resolution.previous_condition"));
  assert.ok(match.includes("resolution.requested_condition"));
  assert.ok(match.includes("resolution.resulting_condition"));
  assert.ok(match.includes("resolution.protection_id"));
});

test("condition replacement runtime remains card-identity free", () => {
  for (const forbidden of [
    "shade-hollowcrown",
    "Hollowcrown",
    "hollow-command",
    "Hollow Command",
  ]) {
    assert.equal(owner.includes(forbidden), false, "owner must not dispatch by card identity: " + forbidden);
    assert.equal(router.includes(forbidden), false, "router must not dispatch by card identity: " + forbidden);
    assert.equal(match.includes(forbidden), false, "Match must not dispatch by card identity: " + forbidden);
  }
});
