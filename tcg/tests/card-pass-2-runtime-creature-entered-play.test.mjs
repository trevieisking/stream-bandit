import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const helper = fs.readFileSync(
  path.join(root, 'supabase/functions/_shared/tcg-match-event-listener-v0-2.ts'),
  'utf8',
);
const match = fs.readFileSync(
  path.join(root, 'supabase/functions/tcg-match-actions/index.ts'),
  'utf8',
);
const load = fs.readFileSync(
  path.join(root, 'supabase/migrations/20260906190000_tcg_v0_2_set_one_shadow_registry_load.sql'),
  'utf8',
);

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
    walkSteps(raw.steps, out);
    walkSteps(raw.then, out);
    walkSteps(raw.else, out);
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

test('the complete frozen creature_entered_play family is exactly inventoried', () => {
  const cards = frozenDefinitions()
    .filter((definition) =>
      definition.creature?.ability?.mode === 'triggered' &&
      definition.creature?.ability?.event === 'creature_entered_play'
    )
    .map((definition) => definition.id)
    .sort();

  assert.deepEqual(cards, [
    'astral-moonbit',
    'astral-stardot',
    'ember-cinderburrow',
    'gale-gustfox',
    'gale-whiffin',
    'gale-zephyrhare',
    'grove-bloomhare',
    'grove-vinecoil',
    'shade-gloamkin',
    'volt-tinkit',
  ]);
});

test('the generic listener owns every operation and predicate used by the full frozen family', () => {
  const abilities = frozenDefinitions()
    .map((definition) => definition.creature?.ability)
    .filter((ability) => ability?.event === 'creature_entered_play');
  const operations = [...abilities.reduce(
    (set, ability) => walkSteps(ability.steps, set),
    new Set(),
  )].sort();
  const predicates = [...abilities.reduce(
    (set, ability) => walkRequirements(ability.requirements, set),
    new Set(),
  )].sort();

  for (const operation of operations) {
    assert.ok(
      helper.includes(`op === "${operation}"`),
      `generic event listener is missing frozen operation ${operation}`,
    );
  }
  for (const predicate of predicates) {
    assert.ok(
      helper.includes(`case "${predicate}"`),
      `generic event listener is missing frozen predicate ${predicate}`,
    );
  }
});

test('the event continuation is card-id-free and reuses canonical owners', () => {
  for (const forbidden of [
    'astral-moonbit',
    'astral-stardot',
    'ember-cinderburrow',
    'gale-gustfox',
    'gale-whiffin',
    'gale-zephyrhare',
    'grove-bloomhare',
    'grove-vinecoil',
    'shade-gloamkin',
    'volt-tinkit',
    'Moonbit',
    'Stardot',
    'Cinderburrow',
    'Gustfox',
    'Whiffin',
    'Zephyrhare',
    'Bloomhare',
    'Vinecoil',
    'Gloamkin',
    'Tinkit',
  ]) {
    assert.equal(
      helper.includes(forbidden),
      false,
      `generic event listener contains card-specific authority: ${forbidden}`,
    );
  }

  for (const owner of [
    'runtimeV02ApplyAtomicSwitch',
    'applyRuntimeV02HealPacket',
    'recordRuntimeV02HiddenInformationView',
    'runtimeV02InspectRewardPositions',
    'structuredRuntimeWithdrawalBaseCost',
  ]) {
    assert.ok(helper.includes(owner), `canonical owner not reused: ${owner}`);
  }
  assert.ok(helper.includes('runtime_v0_2_event_listener_continuation'));
  assert.ok(helper.includes('pending_event_listener_choice'));
  assert.ok(helper.includes('event_id'));
  assert.ok(helper.includes('source_uid'));
  assert.ok(helper.includes('listener_id'));
  assert.ok(helper.includes('step_cursor'));
});

test('play_creature emits after placement and resumes the same command without replay', () => {
  assert.ok(match.includes('tcg-match-event-listener-v0-2.ts'));
  assert.ok(match.includes('pending_event_listener_choice:runtimeV02PendingEventListenerChoiceView'));
  assert.ok(match.includes('private_event_inspection:runtimeV02PrivateEventInspectionView'));
  assert.ok(match.includes('if(action==="resolve_event_listener_choice")'));

  const playStart = match.indexOf('if(action==="play_creature")');
  const playEnd = match.indexOf('if(action==="evolve")', playStart);
  assert.ok(playStart >= 0 && playEnd > playStart);
  const play = match.slice(playStart, playEnd);
  const placement = play.indexOf('p.reserve[idx]={stack:[x]');
  const createEvent = play.indexOf('runtimeV02CreateCreatureEnteredPlayEvent');
  const begin = play.indexOf('runtimeV02BeginEventListenerContinuation');
  const commit = play.lastIndexOf('commit("play_creature"');
  assert.ok(placement >= 0 && createEvent > placement);
  assert.ok(begin > createEvent);
  assert.ok(commit > begin);
  assert.ok(play.includes('setEventResume(seat)'));
  assert.ok(play.includes('setMovementResume("play_creature"'));
  assert.ok(play.includes('runtimeV02BeginMovementHealListenerContinuation'));
});

test('unmarked matches retain the old play mutation while generic work fails closed to no-op', () => {
  const createStart = helper.indexOf('export function runtimeV02CreateCreatureEnteredPlayEvent');
  const beginStart = helper.indexOf('export function runtimeV02BeginEventListenerContinuation');
  const resolveStart = helper.indexOf('export function runtimeV02ResolveEventListenerChoice');
  assert.ok(createStart >= 0 && beginStart > createStart && resolveStart > beginStart);
  const createBlock = helper.slice(createStart, beginStart);
  const beginBlock = helper.slice(beginStart, resolveStart);
  assert.ok(createBlock.includes('if (structuredEnabled(state))'));
  assert.ok(beginBlock.includes('if (!structuredEnabled(state))'));
  assert.ok(beginBlock.includes('processed_listener_keys: []'));
  assert.ok(beginBlock.includes('emitted_heal_packet_ids: []'));
  assert.ok(beginBlock.includes('emitted_movement_events: []'));
});

