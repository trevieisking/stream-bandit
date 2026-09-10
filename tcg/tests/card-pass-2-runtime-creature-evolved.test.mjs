import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const helper = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-event-listener-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const load = fs.readFileSync(path.join(root, 'supabase/migrations/20260906190000_tcg_v0_2_set_one_shadow_registry_load.sql'), 'utf8');

function frozenDefinitions() {
  const definitions = [];
  for (const line of load.split(/\n/)) {
    const found = line.match(/, '(\{.*\})'::jsonb\),?$/);
    if (found) definitions.push(JSON.parse(found[1].replace(/''/g, "'")));
  }
  return definitions;
}
function walkSteps(steps, out = new Set()) {
  for (const raw of steps || []) {
    if (!raw || typeof raw !== 'object') continue;
    if (typeof raw.op === 'string') out.add(raw.op);
    walkSteps(raw.steps, out); walkSteps(raw.then, out); walkSteps(raw.else, out);
  }
  return out;
}
function walkRequirements(raw, out = new Set()) {
  if (!raw || typeof raw !== 'object') return out;
  if (typeof raw.predicate === 'string') out.add(raw.predicate);
  for (const item of raw.all || []) walkRequirements(item, out);
  for (const item of raw.any || []) walkRequirements(item, out);
  if (raw.not) walkRequirements(raw.not, out);
  return out;
}
const evolved = () => frozenDefinitions().filter((definition) => definition.creature?.ability?.mode === 'triggered' && definition.creature?.ability?.event === 'creature_evolved');

const ids = [
  'astral-comettail','astral-orbitail','ember-bristleflare','grove-briarback','grove-capscout',
  'shade-duskstalker','shade-veiljaw','stone-cragroller','tide-reefback','volt-arcprowler','volt-coilclank',
];
const names = ['Comettail','Orbitail','Bristleflare','Briarback','Capscout','Duskstalker','Veiljaw','Cragroller','Reefback','Arcprowler','Coilclank'];

test('the complete frozen creature_evolved family is exactly inventoried', () => {
  assert.deepEqual(evolved().map((definition) => definition.id).sort(), [...ids].sort());
});

test('the generic listener owns every operation and predicate used by the full frozen evolved family', () => {
  const abilities = evolved().map((definition) => definition.creature.ability);
  const operations = [...abilities.reduce((set, ability) => walkSteps(ability.steps, set), new Set())].sort();
  const predicates = [...abilities.reduce((set, ability) => walkRequirements(ability.requirements, set), new Set())].sort();
  assert.deepEqual(operations, ['ADD_SHIELD','APPLY_CONDITION','ATTACH_ESSENCE_FROM_ZONE','DIRECT_DAMAGE','DRAW','HEAL','IF','INSPECT_ZONE','LOOK_TOP','MOVE_CARDS','OPTIONAL','RANDOM_SAMPLE_HIDDEN_ZONE','RETURN_SET_TO_DECK_TOP','SELECT_CARDS']);
  assert.deepEqual(predicates, ['control_condition_slot_empty','event_occurred','event_subject_is_source','hand_count_at_least','source_is_self']);
  for (const operation of operations) assert.ok(helper.includes(`op === "${operation}"`), `missing operation ${operation}`);
  for (const predicate of predicates) assert.ok(helper.includes(`case "${predicate}"`), `missing predicate ${predicate}`);
});

test('evolved continuation is card-id-free and reuses canonical rule owners', () => {
  for (const forbidden of [...ids, ...names]) assert.equal(helper.includes(forbidden), false, `card-specific authority leaked into generic listener: ${forbidden}`);
  for (const owner of [
    'applyRuntimeCondition','dealRuntimeEffectDamage','addRuntimeShield','applyRuntimeV02HealPacket',
    'runtimeV02InspectRewardPositions','recordRuntimeV02HiddenInformationView',
    'applyStructuredRuntimeEssenceAttachmentLifecycle','recordRuntimeV02EssenceAttachmentEvent',
  ]) assert.ok(helper.includes(owner), `canonical owner not reused: ${owner}`);
  assert.ok(helper.includes('crypto.getRandomValues'));
  assert.ok(helper.includes('pending_event_listener_choice'));
  assert.ok(helper.includes('runtime_v0_2_event_listener_continuation'));
});

test('evolve emits after stack mutation and uses one resumable generic continuation', () => {
  assert.ok(match.includes('runtimeV02CreateCreatureEvolvedEvent'));
  assert.ok(match.includes('setEventResume("evolve",seat)'));
  assert.ok(match.includes('setMovementResume("evolve",seat,eventFlow.emitted_heal_packet_ids)'));
  const start = match.indexOf('if(action==="evolve")');
  const end = match.indexOf('if(action==="attach_essence")', start);
  assert.ok(start >= 0 && end > start);
  const block = match.slice(start, end);
  assert.ok(block.indexOf('cr.stack.push(x)') < block.indexOf('runtimeV02CreateCreatureEvolvedEvent'));
  assert.ok(block.includes('runtimeV02BeginEventListenerContinuation'));
  assert.ok(block.includes('runtimeV02BeginMovementHealListenerContinuation'));
  assert.ok(block.includes('if(!structuredEvolution)'));
  assert.ok(block.indexOf('structuredRuntimeEvolutionRewardInspection') < block.indexOf('runtimeV02BeginEventListenerContinuation'));
  assert.ok(block.includes('evolve_pending_event_listener_choice'));
});

test('structured evolve does not route through old card-specific effects', () => {
  const start = match.indexOf('if(action==="evolve")');
  const end = match.indexOf('if(action==="attach_essence")', start);
  const block = match.slice(start, end);
  const legacyStart = block.indexOf('if(!structuredEvolution)');
  const genericStart = block.indexOf('runtimeV02BeginEventListenerContinuation');
  assert.ok(legacyStart >= 0 && genericStart > legacyStart);
  for (const legacyId of ['tide-reefback','stone-cragroller','grove-briarback','shade-veiljaw']) {
    const at = block.indexOf(legacyId);
    assert.ok(at > legacyStart && at < genericStart, `${legacyId} must remain legacy-only`);
  }
});

test('Device occurrence reuses the accepted persisted tactic turn signal without changing tactic runtime', () => {
  assert.ok(helper.includes('name === "device_resolved"'));
  assert.ok(helper.includes('flags?.device_turn'));
  assert.ok(helper.includes('Math.max(recorded, compatibility)'));
});
