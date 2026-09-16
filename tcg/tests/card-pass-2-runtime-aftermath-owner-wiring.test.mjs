import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const aftermathOwner = fs.readFileSync('supabase/functions/_shared/tcg-match-aftermath-v0-2.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('dispatcher delegates Aftermath lifecycle semantics while retaining coordination and Card-Zone execution', () => {
  assert.ok(match.includes('import { runtimeV02ResolveAftermath } from "../_shared/tcg-match-aftermath-v0-2.ts";'));
  assert.equal(match.includes('runtimeV02ResolveConditionAftermath } from "../_shared/tcg-match-condition-lifecycle-v0-2.ts"'), false, 'dispatcher must not import condition Aftermath semantics directly');
  assert.equal(match.includes('clearStructuredRuntimeAttachmentAttackBonusesAtAftermath'), false, 'dispatcher must not import structured attachment cleanup directly');
  assert.equal(match.includes('structuredRuntimeAftermathEssenceDisposition'), false, 'dispatcher must not import Essence Aftermath disposition directly');

  const block = slice(match, 'const aftermath=', 'const continueResolution=');
  assert.ok(block.includes('runtimeV02ResolveAftermath(s,who as 1|2'));
  assert.ok(block.includes('for(const message of resolved.log_messages)log(message)'));
  assert.ok(block.includes('runtimeV02ApplyCardZoneTransfer(plan.source_cards,owner.discard,plan.request)'));
  assert.ok(block.includes('const n=scanDefeats()'));
  assert.ok(block.includes('s.resume_after_resolution="turn_advance"'));
  assert.ok(block.includes('advanceTurn()'));

  assert.equal(block.includes('runtimeV02ResolveConditionAftermath'), false, 'dispatcher duplicated Condition Aftermath semantics');
  assert.equal(block.includes('lifecycle_attack_bonus'), false, 'dispatcher duplicated temporary attack cleanup');
  assert.equal(block.includes('lifecycle_withdrawal_cost'), false, 'dispatcher duplicated temporary withdrawal cleanup');
  assert.equal(block.includes('lifecycle_condition_immunity'), false, 'dispatcher duplicated temporary condition-immunity cleanup');
  assert.equal(block.includes('lifecycle_attack_eligibility'), false, 'dispatcher duplicated turn attack-eligibility cleanup');
  assert.equal(block.includes('volt-surge-essence'), false, 'dispatcher duplicated legacy Surge expiry selection');
  assert.equal(block.includes('discard_during_target_aftermath'), false, 'dispatcher duplicated generated Essence expiry selection');

  assert.ok(aftermathOwner.includes('export function runtimeV02ResolveAftermath'));
  assert.ok(aftermathOwner.includes('runtimeV02ResolveConditionAftermath('));
  assert.ok(aftermathOwner.includes('clearStructuredRuntimeAttachmentAttackBonusesAtAftermath('));
  assert.ok(aftermathOwner.includes('structuredRuntimeAftermathEssenceDisposition('));
  assert.ok(aftermathOwner.includes('discard_during_target_aftermath'));
  assert.equal(aftermathOwner.includes('runtimeV02ApplyCardZoneTransfer('), false, 'Aftermath owner must return transfer plans instead of moving cards');
  assert.equal(aftermathOwner.includes('runtimeV02AdvanceTurn('), false, 'Aftermath owner must not take turn lifecycle authority');
});
