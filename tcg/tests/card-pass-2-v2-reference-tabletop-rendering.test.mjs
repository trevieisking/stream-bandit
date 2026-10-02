import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..','..');
const battle=fs.readFileSync(path.join(root,'tcg-battle-v2.html'),'utf8');
const controller=fs.readFileSync(path.join(root,'stream-bandit-tcg-v2-battle-controller.js'),'utf8');
const renderer=fs.readFileSync(path.join(root,'stream-bandit-tcg-card-renderer-v2-4-51.js'),'utf8');
const contract=JSON.parse(fs.readFileSync(path.join(root,'tcg-battle-client-interaction-v1.json'),'utf8'));

test('V2.4.133 renders one continuous Bench instead of four permanent Reserve boxes',()=>{
  assert.match(battle,/data-sb-tcg-battle-layout="tabletop-v0-12-single-bench"/);
  assert.match(battle,/\.sb-reserve\.sb-bench-zone\{/);
  assert.match(battle,/\.sb-bench-cards\{/);
  assert.match(controller,/function renderBench\(target, player, ownerLabel, own\)/);
  assert.match(controller,/function reserveCapacity\(player\)/);
  assert.match(controller,/reserve_capacity/);
  assert.match(controller,/function firstOpenBenchIndex\(player\)/);
  assert.doesNotMatch(controller,/\[0, 1, 2, 3\]\.map/);
  assert.doesNotMatch(controller,/Reserve ' \+ \(index \+ 1\)/);
  assert.equal(contract.board.bench_presentation,'single_continuous_zone');
  assert.match(contract.board.bench_capacity,/future_expandable/);
});

test('printed card face is clean and runtime legality lives outside it',()=>{
  assert.match(renderer,/2\.4\.133-clean-tabletop-card-face/);
  assert.doesNotMatch(renderer,/ABILITY READY/);
  assert.doesNotMatch(renderer,/Turn ends after full resolution/);
  assert.match(renderer,/data-card-attack-ready=/);
  assert.match(renderer,/Attack is not currently available/);
  assert.doesNotMatch(controller,/function liveCreatureStatus/);
  assert.match(controller,/function liveCreatureTokens\(creature\)/);
  assert.match(controller,/function inspectorActionDock/);
  assert.match(controller,/sb-inspector-action-dock/);
  assert.match(battle,/\.sb-card-battle-tokens\{/);
  assert.equal(contract.board.dynamic_runtime_text_inside_printed_card,false);
});

test('Reward cards stay physical and Reward choice is full screen',()=>{
  assert.match(controller,/function renderRewardStack\(target, count\)/);
  assert.match(controller,/Array\.from\(\{ length: 6 \}/);
  assert.match(controller,/function renderRewardChoiceOverlay\(view\)/);
  assert.match(battle,/id="rewardChoiceOverlay"/);
  assert.match(battle,/\.sb-reward-choice-overlay\{/);
  assert.match(battle,/\.sb-reward-choice-grid\{[\s\S]*?repeat\(6/);
  assert.match(battle,/stream_bandit_stag_icon_32\.png/);
  assert.equal(contract.board.reward_cards_per_player,6);
  assert.equal(contract.board.reward_choice_presentation,'fullscreen_face_down_reward_card_overlay');
});

test('phone hand is the only horizontally scrolling tabletop rail',()=>{
  assert.match(battle,/overscroll-behavior-x:contain;touch-action:pan-x/);
  assert.match(battle,/-webkit-overflow-scrolling:touch/);
  assert.match(battle,/\.sb-hand::-webkit-scrollbar\{display:none\}/);
  assert.match(battle,/\.sb-hand-card\{[\s\S]*?height:154px!important/);
  assert.match(contract.board.mobile_hand_behavior,/swipe_left_right_only/);
  assert.equal(contract.input_modes.mobile_page_scroll_required,false);
});

test('presentation correction keeps server action transports authoritative',()=>{
  assert.match(controller,/runPlayHandTarget/);
  assert.match(controller,/actionBase\('take_reward'\)/);
  assert.match(controller,/actionBase\('promote'\)/);
  assert.match(controller,/actionBase\('attack'\)/);
  assert.match(controller,/runAbilityIntent/);
  assert.doesNotMatch(controller,/Math\.random\s*\(/);
  assert.equal(contract.authority.server_authoritative,true);
});
