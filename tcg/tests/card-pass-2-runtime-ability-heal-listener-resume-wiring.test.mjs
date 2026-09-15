import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const live = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-heal-listener-live-v0-2.ts'), 'utf8');
const selectedHeal = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-selected-heal-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

function count(source, needle) {
  return source.split(needle).length - 1;
}

function blockBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert.notEqual(start, -1, `missing start marker: ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.notEqual(end, -1, `missing end marker: ${endNeedle}`);
  return source.slice(start, end);
}

test('one live heal-listener coordinator owns both attack and Ability resume receipts', () => {
  assert.ok(live.includes('export function runtimeV02BeginAttackHealListenerContinuation('));
  assert.ok(live.includes('export function runtimeV02ResolveAttackHealListenerChoice('));
  assert.ok(live.includes('export function runtimeV02BeginAbilityHealListenerContinuation('));
  assert.ok(live.includes('export function runtimeV02ResolveAbilityHealListenerChoice('));
  assert.ok(live.includes('| "scan_defeats_then_aftermath"'));
  assert.ok(live.includes('| "return_to_play"'));
  assert.equal(count(live, 'state.pending_heal_listener_resume ='), 1, 'resume receipt must have one write owner');
  assert.equal(count(live, 'delete state.pending_heal_listener_resume'), 1, 'resume receipt must have one release owner');
});

test('Ability resume contract delegates the same continuation and private choice machinery without taking phase authority', () => {
  assert.ok(live.includes('continueRuntimeV02AfterHealPackets'));
  assert.ok(live.includes('runtimeV02InstallHealListenerChoice'));
  assert.ok(live.includes('runtimeV02ResolveHealListenerChoice'));
  assert.equal(live.includes('state.phase'), false, 'shared listener coordinator must not mutate match phase');
  assert.equal(live.includes('scanDefeats('), false, 'shared listener coordinator must not scan defeats');
  assert.equal(live.includes('aftermath('), false, 'shared listener coordinator must not execute Aftermath');
});

test('Ability and attack resolvers validate distinct resume kinds before delegating private choice mutation', () => {
  const helperStart = live.indexOf('function resolveHealListenerChoiceWithResume(');
  const attackStart = live.indexOf('export function runtimeV02ResolveAttackHealListenerChoice(');
  const abilityStart = live.indexOf('export function runtimeV02ResolveAbilityHealListenerChoice(');
  assert.ok(helperStart >= 0 && attackStart > helperStart && abilityStart > attackStart);
  const helper = live.slice(helperStart, attackStart);
  assert.ok(helper.indexOf('const resume = resumeState(state, expectedKind);') < helper.indexOf('runtimeV02ResolveHealListenerChoice('));
  assert.ok(live.slice(attackStart, abilityStart).includes('"scan_defeats_then_aftermath"'));
  assert.ok(live.slice(abilityStart).includes('"return_to_play"'));
});

test('Networked Growth live orchestration begins canonical Ability heal listeners while its semantic owner stays packet-only', () => {
  const resolveAbility = blockBetween(match, 'if(action==="resolve_ability_choice")', 'if(action==="take_reward")');
  assert.ok(selectedHeal.includes('applyRuntimeV02HealPacket('));
  assert.equal(selectedHeal.includes('runtimeV02BeginAbilityHealListenerContinuation'), false, 'selected-heal semantic owner must not become listener orchestration owner');
  assert.equal(selectedHeal.includes('runtimeV02ResolveAbilityHealListenerChoice'), false, 'selected-heal semantic owner must not become listener choice owner');
  assert.ok(resolveAbility.includes('runtimeV02BeginAbilityHealListenerContinuation('));
  assert.ok(resolveAbility.includes('pending_heal_listener_choice:true'));
  assert.equal(resolveAbility.includes('scanDefeats('), false, 'active Ability completion must not enter attack defeat scanning');
  assert.equal(resolveAbility.includes('aftermath('), false, 'active Ability completion must not run attack Aftermath');
});

test('match owner resumes Ability listener choices to play while attack listener choices keep defeat and Aftermath continuation', () => {
  const resolveListener = blockBetween(match, 'if(action==="resolve_heal_listener_choice")', 'if(action==="resolve_ability_choice")');
  assert.ok(resolveListener.includes('const resumeKind=String(s.pending_heal_listener_resume?.kind||"")'));
  assert.ok(resolveListener.includes('if(resumeKind==="return_to_play")resolved=runtimeV02ResolveAbilityHealListenerChoice('));
  assert.ok(resolveListener.includes('else if(resumeKind==="scan_defeats_then_aftermath")resolved=runtimeV02ResolveAttackHealListenerChoice('));

  const playResumeStart = resolveListener.indexOf('if(resumeKind==="return_to_play"){s.phase="play"');
  const attackResumeStart = resolveListener.indexOf('const n=scanDefeats()', playResumeStart);
  assert.ok(playResumeStart >= 0 && attackResumeStart > playResumeStart, 'Ability play resume must precede the attack-only defeat path');
  const playResume = resolveListener.slice(playResumeStart, attackResumeStart);
  assert.ok(playResume.includes('s.phase="play"'));
  assert.ok(playResume.includes('resume_kind:resumeKind'));
  assert.equal(playResume.includes('scanDefeats('), false, 'return-to-play branch must not scan defeats');
  assert.equal(playResume.includes('aftermath('), false, 'return-to-play branch must not execute Aftermath');

  const attackResume = resolveListener.slice(attackResumeStart);
  assert.ok(attackResume.includes('scanDefeats()'));
  assert.ok(attackResume.includes('aftermath(resolved.resume_seat)'));
});

test('generic Ability heal listener resume owner contains no frozen Set One card authority', () => {
  for (const token of [
    'grove-myceliarch',
    'networked-growth',
    'tide-shellip',
    'tidepool-shell',
    'grove-symbiote',
    'symbiote-reciprocal-heal',
    'moonlit-reef',
    'moonlit-reef-filter',
  ]) {
    assert.equal(live.includes(token), false, `generic live listener coordinator contains card-specific authority: ${token}`);
  }
});
