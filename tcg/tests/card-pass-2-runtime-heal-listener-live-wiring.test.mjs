import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const liveSource = readFileSync('supabase/functions/_shared/tcg-match-heal-listener-live-v0-2.ts', 'utf8');
const matchSource = readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

test('live heal-listener coordinator delegates continuation and private choice without taking gameplay ownership', () => {
  for (const token of [
    'continueRuntimeV02AfterHealPackets',
    'runtimeV02InstallHealListenerChoice',
    'runtimeV02ResolveHealListenerChoice',
    'pending_heal_listener_resume',
    'scan_defeats_then_aftermath',
  ]) {
    assert.ok(liveSource.includes(token), `missing live handoff token ${token}`);
  }
  for (const forbidden of ['scanDefeats', 'aftermath(', 'healRuntimeDamage', 'addRuntimeShield']) {
    assert.equal(liveSource.includes(forbidden), false, `shared live coordinator took forbidden gameplay ownership: ${forbidden}`);
  }
  for (const cardId of ['tide-moonlit-reef', 'tide-shellip', 'grove-symbiote-essence', 'tide-tideroar']) {
    assert.equal(liveSource.includes(cardId), false, `generic live coordinator contains card-specific authority: ${cardId}`);
  }
});

test('match owner exposes the heal choice only through the private viewer and accepts its action before the ordinary play gate', () => {
  assert.ok(matchSource.includes('tcg-match-heal-listener-live-v0-2.ts'));
  assert.ok(matchSource.includes('pending_heal_listener_choice:runtimeV02PendingHealListenerChoiceView'));
  const resolveChoice = matchSource.indexOf('if(action==="resolve_heal_listener_choice")');
  const playGate = matchSource.indexOf('if(s.phase!=="play"||Number(s.active_seat)!==seat)');
  assert.ok(resolveChoice >= 0, 'live private heal-listener choice action is missing');
  assert.ok(playGate > resolveChoice, 'private heal-listener choice must resolve before the ordinary play-phase gate');
});

test('selected attack healing continues canonical packets before defeat scanning and Aftermath', () => {
  const start = matchSource.indexOf('if(action==="resolve_attack_choice")');
  const end = matchSource.indexOf('if(action==="resolve_heal_listener_choice")');
  assert.ok(start >= 0 && end > start, 'selected-heal live action slice is missing');
  const slice = matchSource.slice(start, end);
  const continuation = slice.indexOf('runtimeV02BeginAttackHealListenerContinuation(s,resolved.emitted_packet_ids');
  const defeatScan = slice.indexOf('const n=scanDefeats()');
  assert.ok(continuation >= 0, 'selected heal must hand emitted packets to the canonical continuation');
  assert.ok(defeatScan > continuation, 'selected-heal listener continuation must finish or pause before defeat scanning');
  assert.ok(slice.includes('s.phase="heal_listener_choice_resolution"'));
});

test('direct structured self-heal and HEAL_EACH packets enter one ordered continuation before final attack resolution', () => {
  const start = matchSource.indexOf('const structuredHealPacketIds=');
  assert.ok(start >= 0, 'structured attack heal packet collection is missing');
  const slice = matchSource.slice(start);
  assert.ok(slice.includes('structuredSelfHealEffects?.emitted_packet_ids'));
  assert.ok(slice.includes('structuredHealEachEffects?.emitted_packet_ids'));
  const continuation = slice.indexOf('runtimeV02BeginAttackHealListenerContinuation(s,structuredHealPacketIds');
  const defeatScan = slice.indexOf('const n=scanDefeats()');
  assert.ok(continuation >= 0, 'direct structured heal packets must enter the canonical continuation');
  assert.ok(defeatScan > continuation, 'direct heal-listener continuation must finish or pause before final defeat scanning');
});

test('public command audit carries only listener status/packet ids while private choice options stay viewer-owned', () => {
  assert.ok(matchSource.includes('const healListenerAudit=(flow:any)=>({status:flow.status,processed_packet_ids:flow.continuation?.processed_packet_ids||[],emitted_packet_ids:flow.continuation?.emitted_packet_ids||[]})'));
  const choiceAction = matchSource.slice(
    matchSource.indexOf('if(action==="resolve_heal_listener_choice")'),
    matchSource.indexOf('if(action==="take_reward")'),
  );
  assert.equal(choiceAction.includes('.options'), false, 'public heal-listener choice command payload must not serialize private hand options');
  assert.ok(choiceAction.includes('runtimeV02PendingHealListenerChoiceView(resolved.pending_choice,seat as 1|2)'));
});

test('tcg-match-actions remains the sole owner of post-listener defeat scanning and Aftermath resume', () => {
  assert.ok(matchSource.includes('const scanDefeats=()=>'));
  assert.ok(matchSource.includes('const aftermath=(who:number)=>'));
  assert.ok(matchSource.includes('aftermath(resolved.resume_seat)'));
  assert.equal(liveSource.includes('const scanDefeats'), false);
  assert.equal(liveSource.includes('const aftermath'), false);
});

test('legacy attack parser remains byte-semantically unchanged by the live listener wiring', () => {
  assert.ok(matchSource.includes('else typed[e]=(typed[e]||0)+n'));
  assert.equal(matchSource.includes('else typed[e]=(typed[e]||0)+1*n'), false);
});
