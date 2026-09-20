import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gale=fs.readFileSync('tcg-card-pass-2-gale.md','utf8');
const owner=fs.readFileSync('supabase/functions/_shared/tcg-match-attack-switch-choice-v0-2.ts','utf8');
const match=fs.readFileSync('supabase/functions/tcg-match-actions/index.ts','utf8');
const battle=fs.readFileSync('stream-bandit-tcg-v2-battle-controller.js','utf8');

test('Slipwing Backdraft is the frozen conditional Reserve-switch Attack shape',()=>{
  assert.match(gale,/"id":"gale-slipwing"/);
  assert.match(gale,/"id":"backdraft","name":"Backdraft"[sS]*?"op":"IF","when":{"predicate":"reserve_count_at_least","controller":"self","count":1}[sS]*?"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"[sS]*?"op":"SWITCH_WITH_VANGUARD","player":"self","target":"\$switch_target","action_kind":"attack"/);
});

test('Attack Reserve switch owner delegates IF and movement to existing shared owners',()=>{
  assert.match(owner,/runtimeV02EvaluateAttackIf\(descriptor\.when/);
  assert.match(owner,/runtimeV02ApplyAtomicSwitch\(/);
  assert.match(owner,/action_kind: "attack"/);
  assert.doesNotMatch(owner,/gale-slipwing|Slipwing|Backdraft/);
});

test('Match creates a mandatory server Attack choice and disables structured printed-English fallback',()=>{
  assert.match(match,/structuredRuntimeAfterDamageReserveSwitchChoice\(/);
  assert.match(match,/runtimeV02CreateAttackReserveSwitchChoice\(/);
  assert.match(match,/pendingReserveSwitchChoice\)\{s\.pending_attack_choice=pendingReserveSwitchChoice;s\.phase="attack_effect_resolution"/);
  assert.match(match,/pending\.kind==="select_friendly_reserve_to_switch"/);
  assert.match(match,/runtimeV02ResolveAttackReserveSwitchChoice\(/);
  assert.match(match,/runtimeV02BeginMovementListenerContinuation\(s,resolved\.switch_result\.events\)/);
  assert.match(match,/const wantsSwitch=structuredReserveSwitchChoice==null&&\(ef\.includes/);
});

test('Battle generic server-choice overlay routes pending Attack choices back to Match',()=>{
  assert.match(battle,/if \(view\.pending_attack_choice\) return \{ source: 'match', endpoint: API_MATCH, action: 'resolve_attack_choice', choice: view\.pending_attack_choice \}/);
  assert.match(battle,/view\.pending_attack_choice/);
  assert.match(battle,/actionBase\(routed\.action\)/);
  assert.match(battle,/choice_ids: ids/);
});
