import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const live = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function promoteBlock() {
  const start = live.indexOf('if(action==="promote")');
  const end = live.indexOf('if(s.phase!=="play"', start);
  assert.ok(start >= 0, 'promote action branch must exist');
  assert.ok(end > start, 'promote action branch must end before the ordinary play gate');
  return live.slice(start, end);
}

test('forced KO promotion delegates battlefield mutation and preserves the existing resolution queue', () => {
  const block = promoteBlock();
  assert.match(block, /runtimeV02ApplyForcedPromotion\(s,seat as 1\|2,idx,\{source_action_id:"promote",source_card_uid:null\}\)/);
  assert.match(block, /runtimeV02BeginMovementListenerContinuation\(s,promoted\.events\)/);
  assert.match(block, /setMovementResume\("forced_promotion",seat\)/);
  assert.match(block, /runtimeV02BeginResolutionMovementHealListenerContinuation\(s,movementFlow\.emitted_heal_packet_ids,seat as 1\|2\)/);
  assert.match(block, /scanDefeats\(\);s\.phase="resolution";continueResolution\(\)/);
  assert.ok(block.indexOf('queue().shift()') < block.indexOf('runtimeV02BeginMovementListenerContinuation(s,promoted.events)'), 'promotion queue item must be consumed before listener continuation');
  assert.doesNotMatch(block, /p\.vanguard=p\.reserve\[idx\]/);
  assert.doesNotMatch(block, /p\.reserve\[idx\]=null/);
  assert.doesNotMatch(block, /clearOrdinaryConditions\(p\.vanguard\)/);
});

test('forced-promotion movement and heal private choices resume the same resolution queue', () => {
  assert.match(live, /kind:"withdrawal"\|"attack"\|"attack_program"\|"play_creature"\|"evolve"\|"attach_essence"\|"attach_relic"\|"play_realm"\|"forced_promotion"/);
  assert.match(live, /if\(resume\.kind==="forced_promotion"\)\{/);
  assert.match(live, /runtimeV02BeginResolutionMovementHealListenerContinuation\(s,packetIds,resume\.seat\)/);
  assert.match(live, /resumeKind==="resume_resolution_queue"\)resolved=runtimeV02ResolveResolutionMovementHealListenerChoice/);
  assert.match(live, /if\(resumeKind==="resume_resolution_queue"\)\{scanDefeats\(\);s\.phase="resolution";continueResolution\(\)/);
});
