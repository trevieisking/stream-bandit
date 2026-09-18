import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const setup = fs.readFileSync(path.join(root, 'supabase/functions/tcg-private-alpha-api/index.ts'), 'utf8');

function slice(source, start, end, max = 16000) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `missing ${start}`);
  const candidate = source.indexOf(end, from + start.length);
  const to = candidate > from && candidate - from <= max ? candidate : Math.min(source.length, from + max);
  return source.slice(from, to);
}

test('browser mutation envelope carries nonce and expected revision instead of direct database authority', () => {
  const start = controller.indexOf('function actionBase');
  assert.ok(start >= 0);
  const actionBase = controller.slice(start, start + 600);
  assert.match(actionBase, /match_id: state\.matchId/);
  assert.match(actionBase, /client_nonce: crypto\.randomUUID\(\)/);
  assert.match(actionBase, /expected_revision: revision\(\)/);
  assert.doesNotMatch(controller, /\.rpc\(/);
  assert.doesNotMatch(controller, /supabase\.from\(/);
});

test('all three gameplay Edge owners reject stale revisions before commit', () => {
  for (const source of [match, tactic, setup]) {
    assert.match(source, /stale_revision/);
    assert.match(source, /p_expected_revision/);
    assert.match(source, /tcg_server_commit_state/);
  }
});

test('setup placement revalidates turn, hand card, starter legality and destination server-side', () => {
  const branch = slice(setup, 'if(action==="setup_place")', 'if(action==="setup_return")', 8000);
  const order = [
    branch.indexOf('setup_not_your_turn'),
    branch.indexOf('card_not_in_hand'),
    branch.indexOf('starterLegal(meta)'),
    branch.indexOf('illegal_reserve_slot'),
    branch.indexOf('runtimeV02PlaceCreatureFromHand'),
  ];
  assert.ok(order.every((i) => i >= 0));
  assert.ok(order.slice(1).every((i, idx) => i > order[idx]));
});

test('ordinary Creature placement validates destination and Creature legality before placement', () => {
  const branch = slice(match, 'if(action==="play_creature")', 'if(action==="evolve")', 12000);
  const slot = branch.indexOf('empty_reserve_slot_required');
  const starter = branch.indexOf('baby_standalone_or_mythic_required');
  const place = branch.indexOf('runtimeV02PlaceCreatureFromHand');
  assert.ok(slot >= 0 && starter > slot && place > starter);
});

test('Evolution projection is advisory and final evolve revalidates the declaration', () => {
  assert.match(match, /if\(action==="evolve_targets"\)[\s\S]*runtimeV02ListLegalEvolutionTargets/);
  const branch = slice(match, 'if(action==="evolve")', 'if(action==="attach_essence")', 18000);
  const validate = branch.indexOf('runtimeV02ValidateEvolutionDeclaration');
  const mutate = branch.indexOf('runtimeV02EvolveCreatureFromHand');
  assert.ok(validate >= 0 && mutate > validate);
});

test('Essence and Relic projections are advisory and final commits revalidate declarations', () => {
  assert.match(match, /if\(action==="attach_essence_targets"\)[\s\S]*runtimeV02ListManualEssenceAttachmentTargets/);
  assert.match(match, /if\(action==="attach_relic_targets"\)[\s\S]*runtimeV02ListManualRelicAttachmentTargets/);

  const essence = slice(match, 'if(action==="attach_essence")', 'if(action==="attach_relic")', 18000);
  const essenceValidate = essence.indexOf('runtimeV02ValidateManualEssenceAttachmentDeclaration');
  const essenceMutate = essence.indexOf('runtimeV02BeginExternalEssenceAttachmentRoute');
  assert.ok(essenceValidate >= 0 && essenceMutate > essenceValidate);

  const relic = slice(match, 'if(action==="attach_relic")', 'if(action==="play_realm")', 12000);
  const relicValidate = relic.indexOf('runtimeV02ValidateManualRelicAttachmentDeclaration');
  const relicMutate = relic.indexOf('runtimeV02AttachRelicFromHand');
  assert.ok(relicValidate >= 0 && relicMutate > relicValidate);
});

test('Realm final play validates ownership and delegates legality to canonical Realm route', () => {
  const branch = slice(match, 'if(action==="play_realm")', 'if(action==="withdraw")', 12000);
  assert.match(branch, /d\.kind!=="Tactic"\|\|d\.family!=="Realm"/);
  assert.match(branch, /runtimeV02BeginRealmPlayRoute/);
  assert.match(branch, /realm_already_played_this_turn/);
  assert.match(branch, /same_named_realm_cannot_replace_itself/);
});

test('Tactic preview and final play share the same authoritative playability evaluator', () => {
  const calls = tactic.match(/tacticPlayability\(state, seat, body\.card_uid\)/g) || [];
  assert.equal(calls.length, 2);
  const preview = tactic.indexOf('if (action === "play_tactic_legality")');
  const play = tactic.indexOf('if (action === "play_tactic")', preview + 1);
  assert.ok(preview >= 0 && play > preview);
  assert.match(tactic.slice(preview, play), /tacticPlayability\(state, seat, body\.card_uid\)/);
  assert.match(tactic.slice(play, play + 1800), /tacticPlayability\(state, seat, body\.card_uid\)/);
});

test('Attack declaration legality and target resolution remain server-owned before damage', () => {
  const branch = slice(match, 'if(action==="attack")', 'if(action==="end_turn")', 30000);
  const cost = branch.indexOf('canPayAttack');
  const requirements = branch.indexOf('evaluateRuntimeAttackDeclarationRequirements');
  const target = branch.indexOf('runtimeV02ResolveAttackTarget');
  const damage = branch.indexOf('attackDamage(');
  assert.ok(cost >= 0 && requirements > cost && target > requirements && damage > target);
});

test('future Vanguard Ability and Withdraw interactions already terminate at canonical server owners', () => {
  const ability = slice(match, 'if(action==="use_ability")', 'if(action==="resolve_ability_choice")', 18000);
  assert.match(ability, /runtimeV02BeginActiveAbilityLiveRoute/);

  const withdraw = slice(match, 'if(action==="withdraw")', 'if(action==="attack")', 12000);
  assert.match(withdraw, /withdrawal_already_used_this_turn/);
  assert.match(withdraw, /condition_prevents_withdrawal/);
  assert.match(withdraw, /runtimeV02ApplyWithdrawalPaymentAndSwitch/);
});
