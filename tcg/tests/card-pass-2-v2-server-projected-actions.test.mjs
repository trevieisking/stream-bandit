import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const battle=read('tcg-battle-v2.html');
const controller=read('stream-bandit-tcg-v2-battle-controller.js');
const matchActions=read('supabase/functions/tcg-match-actions/index.ts');
const tacticActions=read('supabase/functions/tcg-tactic-actions/index.ts');

test('Battle preflights hand cards through existing authoritative owners before mutation',()=>{
  assert.match(controller,/action = 'play_card_targets'/);
  assert.match(controller,/action = 'evolve_targets'/);
  assert.match(controller,/action = 'attach_essence_targets'/);
  assert.match(controller,/action = 'attach_relic_targets'/);
  assert.match(controller,/action = 'play_tactic_preview'/);
  assert.match(controller,/preflightSelectedHandAction\(instance, intent/);
  assert.match(controller,/await preflightSelectedHandAction\(instance, intent, where, index\)/);
  assert.match(controller,/await preflightSelectedHandAction\(instance, intent, intent === 'play_realm' \? 'realm' : null, null\)/);
  for(const action of ['play_card_targets','evolve_targets','attach_essence_targets','attach_relic_targets']){
    assert.match(matchActions,new RegExp('action===["\\\']'+action+'["\\\']'));
  }
});

test('Tactic owner exposes read-only playability projection and reuses the same legality helper for real play',()=>{
  assert.match(tacticActions,/function tacticPlayability\(state: any, seat: number, uidValue: unknown\)/);
  assert.match(tacticActions,/\["play_tactic", "play_tactic_preview", "resolve_choice"\]/);
  assert.match(tacticActions,/if \(action === "play_tactic_preview"\)/);
  assert.match(tacticActions,/const preview = tacticPlayability\(state, seat, body\.card_uid\)/);
  assert.match(tacticActions,/if \(action === "play_tactic"\)[\s\S]*?const playability = tacticPlayability\(state, seat, body\.card_uid\)/);
  const previewBlock=tacticActions.slice(tacticActions.indexOf('if (action === "play_tactic_preview")'),tacticActions.indexOf('if (action === "play_tactic")'));
  assert.doesNotMatch(previewBlock,/commit\s*\(/);
  assert.doesNotMatch(previewBlock,/splice\s*\(/);
});

test('manual Essence and unusable Tactics become friendly projected guidance instead of blind mutation attempts',()=>{
  assert.match(controller,/manual_essence_already_used_this_turn: 'You already attached your 1 manual Essence this turn/);
  assert.match(controller,/required_tactic_target_unavailable: 'This Tactic has no valid target right now/);
  assert.match(controller,/setActionFailure\(code\)/);
  assert.match(controller,/console\.warn\('\[Stream Bandit TCG action rejected\]'/);
  assert.match(controller,/node\.dataset\.errorCode = raw/);
  assert.match(controller,/projection && projection\.eligible !== true/);
});

test('Withdraw is rendered only from server field_actions projection and submits exact server-owned payment/target data',()=>{
  assert.match(matchActions,/action==="field_actions"/);
  assert.match(matchActions,/withdraw:withdrawal\.ok\?/);
  assert.match(matchActions,/action==="withdraw"/);
  assert.match(controller,/function withdrawProjection\(\)/);
  assert.match(controller,/state\.fieldActions && state\.fieldActions\.withdraw/);
  assert.match(controller,/data-withdraw-essence-uid=/);
  assert.match(controller,/data-withdraw-target-index=/);
  assert.match(controller,/actionBase\('withdraw'\)/);
  assert.match(controller,/reserve_index: Number\(reserveIndex\)/);
  assert.match(controller,/discard_essence_uids: \[\.\.\.state\.selectedWithdrawEssenceUids\]/);
  assert.doesNotMatch(controller,/function withdrawalCost|const withdrawalCost|let withdrawalCost/);
});

test('active Realm remains visible and inspectable on compact/touch layouts',()=>{
  assert.match(battle,/data-sb-tcg-play-bindings="v0-11-server-projected-actions"/);
  assert.match(battle,/\.sb-center-band \.sb-realm\{[\s\S]*?display:block/);
  assert.match(controller,/view\.realm && view\.realm\.card \? String\(view\.realm\.card\.card_id/);
  assert.match(controller,/realm\.textContent = realmCardId \? 'Realm · '/);
  assert.match(controller,/state\.inspectedCard = \{ kind: 'realm' \}/);
  assert.match(controller,/inspected\.kind === 'realm'/);
});

test('Attack remains server-projected while the UX explains resource blocks',()=>{
  assert.match(matchActions,/projectAttackActions/);
  assert.match(controller,/state\.fieldActions && Array\.isArray\(state\.fieldActions\.attacks\)/);
  assert.match(controller,/attack_essence_cost_not_met: 'Needs more matching Essence for this Attack\.'/);
  assert.match(controller,/data-card-intent="attack"/);
});
