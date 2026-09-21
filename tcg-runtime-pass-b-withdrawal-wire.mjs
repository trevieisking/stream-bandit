import fs from 'node:fs';

const target = 'supabase/functions/tcg-match-actions/index.ts';
const source = fs.readFileSync(target, 'utf8');

const importAnchor = 'import { createClient } from "jsr:@supabase/supabase-js@2";\n';
const bridgeImport = 'import { structuredRuntimeWithdrawalBaseCost } from "../_shared/tcg-match-withdrawal-v0-2.ts";\n';

const legacy = 'function withdrawalCost(cr:Cr,s:any){const d=top(cr,s);let n=Math.max(0,Number(d?.withdraw||0));let lockIncrease=false;for(const e of cr.essence||[]){const id=e.card_id;if(id==="gale-breeze-essence"||id==="grove-root-essence")n=Math.max(0,n-1);if(id==="stone-anchor-essence")n+=1;if(id==="stone-granite-essence")lockIncrease=true}if(conditions(cr).modifier==="Crushed"&&!lockIncrease)n+=1;const f=(cr.flags||{}) as any;if(Number.isFinite(Number(f.withdrawal_cost_override)))n=Math.max(0,Number(f.withdrawal_cost_override));const lifecycle=f.lifecycle_withdrawal_cost;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)&&Number.isFinite(Number(lifecycle.value)))n=Math.max(0,Number(lifecycle.value));return n}';

const wired = 'function withdrawalCost(cr:Cr,s:any){const d=top(cr,s);let n=Math.max(0,Number(d?.withdraw||0));const crushed=conditions(cr).modifier==="Crushed";const structured=structuredRuntimeWithdrawalBaseCost(s,cr,n,String(d?.element||""),crushed);if(structured==null){let lockIncrease=false;for(const e of cr.essence||[]){const id=e.card_id;if(id==="gale-breeze-essence"||id==="grove-root-essence")n=Math.max(0,n-1);if(id==="stone-anchor-essence")n+=1;if(id==="stone-granite-essence")lockIncrease=true}if(crushed&&!lockIncrease)n+=1}else n=structured;const f=(cr.flags||{}) as any;if(Number.isFinite(Number(f.withdrawal_cost_override)))n=Math.max(0,Number(f.withdrawal_cost_override));const lifecycle=f.lifecycle_withdrawal_cost;if(lifecycle&&Number(lifecycle.turn_seq)===Number(s.turn_seq||0)&&Number.isFinite(Number(lifecycle.value)))n=Math.max(0,Number(lifecycle.value));return n}';

let next = source;
if (!next.includes(bridgeImport)) {
  if (!next.startsWith(importAnchor)) throw new Error('match_actions_import_anchor_changed');
  next = next.replace(importAnchor, importAnchor + bridgeImport);
}

const lifecycleImport = 'import { runtimeV02ConsumeWithdrawalModifiers, runtimeV02ResolveWithdrawalModifierCost } from "../_shared/tcg-match-withdrawal-modifier-v0-2.ts";\n';
const lifecycleFunction = 'function withdrawalCostPlan(cr:Cr,s:any,controllerSeat:1|2)';
const lifecycleStructuredBase = 'const structured=structuredRuntimeWithdrawalBaseCost(s,cr,n,String(d?.element||""),crushed)';
const lifecycleResolve = 'runtimeV02ResolveWithdrawalModifierCost(s,cr,controllerSeat,String(d?.element||""),n)';

if (next.includes(legacy)) next = next.replace(legacy, wired);
const passBWired = next.includes(wired);
const lifecycleWired =
  next.includes(lifecycleImport) &&
  next.includes(lifecycleFunction) &&
  next.includes(lifecycleStructuredBase) &&
  next.includes(lifecycleResolve);
if (!passBWired && !lifecycleWired) throw new Error('match_actions_withdrawal_function_changed');

if (!next.includes(bridgeImport)) throw new Error('match_actions_withdrawal_wiring_incomplete');
if (passBWired && next.indexOf(wired) !== next.lastIndexOf(wired)) throw new Error('match_actions_withdrawal_wiring_duplicate');
if (lifecycleWired) {
  if (next.indexOf(lifecycleFunction) !== next.lastIndexOf(lifecycleFunction)) {
    throw new Error('match_actions_withdrawal_lifecycle_duplicate');
  }
  if (next.indexOf(lifecycleResolve) !== next.lastIndexOf(lifecycleResolve)) {
    throw new Error('match_actions_withdrawal_lifecycle_resolver_duplicate');
  }
}

if (process.argv.includes('--check')) {
  if (next !== source) throw new Error('match_actions_withdrawal_wiring_not_materialized');
  process.stdout.write('Runtime Pass B withdrawal wiring is materialized.\n');
} else {
  fs.writeFileSync(target, next, 'utf8');
  process.stdout.write(next === source ? 'Runtime Pass B withdrawal wiring already materialized.\n' : 'Runtime Pass B withdrawal wiring materialized.\n');
}
