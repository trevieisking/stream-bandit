import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-search-attachment-v0-2.ts'), 'utf8');
const live = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts'), 'utf8');
const continuation = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-continuation-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

test('Prismatic Founder remains the single frozen SEARCH_DECK -> ATTACH_ESSENCE_FROM_SELECTION -> SHUFFLE_DECK consumer', () => {
  const registry = buildSetOneRegistry(root);
  const consumers = [];
  for (const row of registry.definitions) {
    const ability = row.definition?.creature?.ability;
    if (!ability || !Array.isArray(ability.steps)) continue;
    if (ability.steps.some((step) => step?.op === 'ATTACH_ESSENCE_FROM_SELECTION')) {
      consumers.push({ card_id: row.card_id, ability });
    }
  }
  assert.equal(consumers.length, 1);
  assert.equal(consumers[0].card_id, 'prismatic-stream-bandit-prismatic-founder');
  const ability = consumers[0].ability;
  assert.equal(ability.id, 'bandits-current');
  assert.deepEqual(ability.requirements, [
    { predicate: 'source_is_current_friendly_vanguard' },
  ]);
  assert.deepEqual(ability.costs, []);
  assert.equal(ability.steps.length, 3);
  assert.equal(ability.steps[0].op, 'SEARCH_DECK');
  assert.equal(ability.steps[0].destination, 'effect_owned_selection');
  assert.equal(ability.steps[0].as, 'founder_new_essence');
  assert.equal(ability.steps[1].op, 'ATTACH_ESSENCE_FROM_SELECTION');
  assert.equal(ability.steps[1].cards, '$founder_new_essence');
  assert.equal(ability.steps[1].target, '$source_creature');
  assert.equal(ability.steps[2].op, 'SHUFFLE_DECK');
});

test('search-selection attachment owner is identity-free and keeps physical attachment with owner #22', () => {
  for (const token of [
    'prismatic-stream-bandit-prismatic-founder',
    'Prismatic Founder',
    'bandits-current',
    "Bandit's Current",
  ]) {
    assert.equal(owner.includes(token), false, `owner contains card-specific authority: ${token}`);
    assert.equal(live.includes(token), false, `live facade contains card-specific authority: ${token}`);
    assert.equal(continuation.includes(token), false, `continuation contains card-specific authority: ${token}`);
    assert.equal(match.includes(token), false, `Match contains card-specific authority: ${token}`);
  }
  assert.ok(owner.includes('runtimeV02BeginExternalEssenceAttachmentRoute('));
  assert.ok(owner.includes('"deck"'));
  assert.ok(owner.includes('destination: "effect_owned_selection"'));
  assert.ok(owner.includes('runtimeV02ShuffleInPlace('));
});

test('logical effect-owned selection remains private choice provenance rather than a fake physical source zone', () => {
  assert.ok(owner.includes('destination: "effect_owned_selection"'));
  assert.ok(owner.includes('runtimeV02BeginExternalEssenceAttachmentRoute('));
  assert.ok(owner.includes('current.uid,\n    "deck",'));
  assert.equal(owner.includes('"effect_owned_selection",\n    descriptor.ability_id'), false);
  assert.ok(live.includes('RuntimeV02PendingSearchSelectionAttachmentChoice'));
  assert.ok(live.includes('choice.kind === "search_attach_essence_from_selection"'));
  assert.ok(live.includes('runtimeV02PendingSearchSelectionAttachmentChoiceView('));
});

test('live facade consumes the ordinary once-per-turn receipt and resolves the bounded search attachment family', () => {
  const create = live.indexOf('structuredRuntimeSearchSelectionAttachmentActiveAbility(state, instance)');
  const legacy = live.indexOf('structuredRuntimeActiveAbilityDeckPlanning(', create);
  assert.ok(create >= 0, 'bounded search attachment family missing');
  assert.ok(legacy > create, 'search attachment family must be considered before unrelated deck planning');
  assert.ok(live.includes('runtimeV02RecordActiveAbilityUse('));
  assert.ok(live.includes('runtimeV02ResolveSearchSelectionAttachmentChoice('));
});

test('Match reuses the existing attachment listener pipeline and continuation completes with shuffle', () => {
  const resolveStart = match.indexOf('if(action==="resolve_ability_choice")');
  const takeReward = match.indexOf('if(action==="take_reward")', resolveStart);
  assert.ok(resolveStart >= 0 && takeReward > resolveStart, 'Ability resolution block missing');
  const block = match.slice(resolveStart, takeReward);
  assert.ok(block.includes('resolved.kind==="search_selection_attachment"&&resolved.stage==="complete"'));
  assert.ok(block.includes('resolved.kind==="effect_attachment_supply"||resolved.kind==="paid_self_attachment"||resolved.kind==="search_selection_attachment"'));
  assert.ok(block.includes('runtimeV02InstallActiveAbilityContinuation(s,resolved.resume)'));
  assert.ok(block.includes('runtimeV02BeginMovementListenerContinuation('));
  assert.ok(block.includes('continueActiveAbilityAfterNestedListeners('));
  assert.ok(continuation.includes('search_selection_attachment_after_attachment'));
  assert.ok(continuation.includes('runtimeV02ResumeSearchSelectionAttachment(state,continuation)'));
});

test('activation receipt remains count-shaped and does not leak searched card identities', () => {
  const useStart = match.indexOf('if(action==="use_ability")');
  const playCreature = match.indexOf('if(action==="play_creature")', useStart);
  assert.ok(useStart >= 0 && playCreature > useStart, 'use_ability block missing');
  const block = match.slice(useStart, playCreature);
  assert.ok(block.includes('pending.kind==="search_attach_essence_from_selection"?{card_selection_min:pending.min,card_selection_max:pending.max}'));
  for (const secret of [
    'pending.options',
    'pending.source_uid',
    'pending.source_card_id',
    'pending.descriptor',
  ]) {
    assert.equal(block.includes(secret), false, `activation receipt leaks private search field: ${secret}`);
  }
});
