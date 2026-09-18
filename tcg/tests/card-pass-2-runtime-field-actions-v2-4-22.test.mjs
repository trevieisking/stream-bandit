import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

test('field_actions is read-only and simulates Ability only on cloned canonical state', () => {
  const start = match.indexOf('if(action==="field_actions")');
  const end = match.indexOf('if(action==="evolve_targets")', start);
  assert.ok(start >= 0 && end > start);
  const branch = match.slice(start, end);
  assert.match(match, /const simulation=structuredClone\(s\)/);
  assert.match(branch, /ability_sources:projectAbilitySources\(\)/);
  assert.match(branch, /withdraw:withdrawal\.ok/);
  assert.doesNotMatch(branch, /commit\(/);
  assert.doesNotMatch(branch, /runtimeV02ApplyWithdrawalPaymentAndSwitch/);
});

test('Ability projection and real use_ability share the canonical live route helper', () => {
  assert.match(match, /const beginActiveAbilityRoute=/);
  assert.match(match, /runtimeV02BeginActiveAbilityLiveRoute\(state,controllerSeat/);
  const uses = match.match(/beginActiveAbilityRoute\(/g) || [];
  assert.ok(uses.length >= 2);
  const action = match.indexOf('if(action==="use_ability")');
  assert.ok(action >= 0);
  assert.match(match.slice(action, action + 1800), /beginActiveAbilityRoute\(s,seat as 1\|2,where,idx\)/);
});

test('Withdrawal projection and real withdraw share one declaration planner', () => {
  assert.match(match, /const withdrawalDeclaration=/);
  const uses = match.match(/withdrawalDeclaration\(/g) || [];
  assert.ok(uses.length >= 2);
  const action = match.indexOf('if(action==="withdraw")');
  assert.ok(action >= 0);
  const branch = match.slice(action, action + 3000);
  assert.match(branch, /plan=withdrawalDeclaration\(body\.reserve_index,true\)/);
  assert.match(branch, /runtimeV02ApplyWithdrawalPaymentAndSwitch/);
});

test('Withdrawal projection carries exact current cost, occupied Reserve anchors and attached Essence payment options', () => {
  const start = match.indexOf('const withdrawalDeclaration=');
  const end = match.indexOf('if(action==="field_actions")', start);
  assert.ok(start >= 0 && end > start);
  const plan = match.slice(start, end);
  assert.match(plan, /withdrawalCost\(p\.vanguard,s\)/);
  assert.match(plan, /legalTargets=.*reserve_index:index,anchor_uid/);
  assert.match(plan, /paymentOptions=.*uid:String\(entry\.uid/);
  assert.match(plan, /cost>paymentOptions\.length/);
  assert.match(plan, /condition_prevents_withdrawal/);
  assert.match(plan, /withdrawal_already_used_this_turn/);
});

test('V2.4.22 is server seam only; browser Ability Withdraw controls are not added yet', () => {
  assert.doesNotMatch(controller, /actionBase\('field_actions'\)/);
  assert.doesNotMatch(controller, /data-card-intent="use_ability"/);
  assert.doesNotMatch(controller, /data-card-intent="withdraw"/);
});
