import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-paid-attachment-v0-2.ts'), 'utf8');
const router = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-live-route-v0-2.ts'), 'utf8');
const live = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-live-v0-2.ts'), 'utf8');
const continuation = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-active-ability-continuation-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

test('Dynamozer remains the frozen paid self-attachment consumer', () => {
  const registry = buildSetOneRegistry(root);
  const row = registry.definitions.find((entry) => entry.card_id === 'volt-dynamozer');
  assert.ok(row, 'missing frozen Dynamozer');
  const ability = row.definition?.creature?.ability;
  assert.equal(ability?.id, 'overcharge-engine');
  assert.deepEqual(ability?.costs, [{
    op: 'CHOOSE_HAND_TO_DISCARD',
    player: 'self',
    count: 1,
    filters: { card_family: 'Tactic', tactic_subtype: 'Device' },
  }]);
  assert.deepEqual(ability?.steps, [{
    op: 'ATTACH_ESSENCE_FROM_ZONE',
    player: 'self',
    zone: 'discard',
    selection: {
      min: 1,
      max: 1,
      filters: { card_family: 'Essence', essence_subtype: 'Basic', element: 'Volt' },
    },
    target: '$source_creature',
    manual_attachment: false,
    attachment_state: {
      kind: 'temporary',
      expires: 'controller_aftermath',
      destination_on_expire: 'discard',
    },
  }]);
});

test('paid self-attachment owner stays identity-free and delegates canonical Payment and Essence Attachment ownership', () => {
  for (const token of ['volt-dynamozer', 'Dynamozer', 'overcharge-engine', 'Overcharge Engine']) {
    assert.equal(owner.includes(token), false, `paid attachment owner contains card-specific authority: ${token}`);
    assert.equal(router.includes(token), false, `active Ability router contains card-specific authority: ${token}`);
    assert.equal(live.includes(token), false, `active Ability private-choice facade contains card-specific authority: ${token}`);
    assert.equal(match.includes(token), false, `Match route contains card-specific authority: ${token}`);
  }
  assert.ok(owner.includes('runtimeV02BeginActiveAbilityActivationCost('));
  assert.ok(owner.includes('runtimeV02ResumeActiveAbilityActivationCost('));
  assert.ok(owner.includes('runtimeV02NormalizeEffectAttachmentState('));
  assert.ok(owner.includes('runtimeV02BeginExternalEssenceAttachmentRoute('));
});

test('single active Ability router gives paid attachment first-class private-choice routing before legacy fallthrough', () => {
  const paid = router.indexOf('runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute(');
  const legacy = router.indexOf('runtimeV02CreateActiveAbilityLiveChoice(', paid);
  assert.ok(paid >= 0, 'paid attachment live route missing');
  assert.ok(legacy > paid, 'paid attachment must route before generic private-choice fallthrough');
  assert.ok(router.includes('kind: "private_choice"'));
  assert.ok(router.includes('choice: paidAttachment.pending_choice'));
  assert.ok(live.includes('RuntimeV02PendingPaidSelfAttachmentChoice'));
  assert.ok(live.includes('choice.kind === "paid_self_attachment"'));
  assert.ok(live.includes('runtimeV02PendingPaidSelfAttachmentChoiceView(choice, viewerSeat)'));
});

test('Match resolves paid cost and Essence choices before reusing the existing attachment continuation', () => {
  const resolveStart = match.indexOf('if(action==="resolve_ability_choice")');
  const takeReward = match.indexOf('if(action==="take_reward")', resolveStart);
  assert.ok(resolveStart >= 0 && takeReward > resolveStart, 'Ability resolution block missing');
  const block = match.slice(resolveStart, takeReward);
  assert.ok(block.includes('pending.kind==="paid_self_attachment"'));
  assert.ok(block.includes('runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute('));
  assert.ok(block.includes('paid.status==="player_choice_required"'));
  assert.ok(block.includes('s.pending_ability_choice=paid.pending_choice'));
  assert.ok(block.includes('resolved.kind==="effect_attachment_supply"||resolved.kind==="paid_self_attachment"'));
  assert.ok(block.includes('runtimeV02InstallActiveAbilityContinuation(s,resolved.resume)'));
  assert.ok(block.includes('runtimeV02BeginMovementListenerContinuation('));
  assert.ok(block.includes('continueActiveAbilityAfterNestedListeners('));
  assert.ok(continuation.includes('effect_attachment_after_attachment'));
  assert.ok(continuation.includes('runtimeV02ResumeActiveAbilitySupplyAttachment('));
});

test('paid attachment activation receipt stays selection-shaped and does not expose private card identities', () => {
  const useStart = match.indexOf('if(action==="use_ability")');
  const playCreature = match.indexOf('if(action==="play_creature")', useStart);
  assert.ok(useStart >= 0 && playCreature > useStart, 'use_ability block missing');
  const block = match.slice(useStart, playCreature);
  assert.ok(block.includes('pending.kind==="plan_own_deck_top"||pending.kind==="paid_self_attachment"'));
  assert.ok(block.includes('card_selection_min:pending.min'));
  assert.ok(block.includes('card_selection_max:pending.max'));
  for (const secret of ['pending.options', 'pending.source_uid', 'pending.source_card_id', 'pending.cost_filters', 'pending.essence_filters']) {
    assert.equal(block.includes(secret), false, `activation receipt leaks private paid attachment field: ${secret}`);
  }
});
