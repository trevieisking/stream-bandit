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

test('selected-heal Ability owner remains the canonical packet producer while live listener wiring is still deliberately blocked', () => {
  assert.ok(selectedHeal.includes('applyRuntimeV02HealPacket('));
  assert.equal(selectedHeal.includes('runtimeV02BeginAbilityHealListenerContinuation'), false, 'selected-heal semantic owner must not become listener orchestration owner');
  assert.equal(selectedHeal.includes('runtimeV02ResolveAbilityHealListenerChoice'), false, 'selected-heal semantic owner must not become listener choice owner');
  assert.equal(match.includes('runtimeV02BeginAbilityHealListenerContinuation'), false, 'Networked Growth must remain not live-wired in this checkpoint');
  assert.equal(match.includes('runtimeV02ResolveAbilityHealListenerChoice'), false, 'Ability listener resolution must remain outside match owner until the next bounded tick');
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
