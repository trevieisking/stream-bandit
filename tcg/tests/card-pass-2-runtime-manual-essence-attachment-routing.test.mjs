import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const lifecycle = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-surge-lifecycle-v0-2.ts'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-essence-attachment-engine-v0-2.ts'), 'utf8');
const route = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-essence-attachment-route-v0-2.ts'), 'utf8');

function assertInOrder(source, needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = source.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('manual Essence attachment uses the canonical external attachment route in marked v0.2 matches', () => {
  assert.ok(match.includes('runtimeV02BeginExternalEssenceAttachmentRoute'));
  assert.equal(match.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState'), false);
  assert.ok(route.includes('runtimeV02ApplyEssenceAttachmentTransaction('));
  assert.ok(engine.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState('));
  assert.ok(engine.includes('recordRuntimeV02EssenceAttachmentEvent('));
  assert.ok(engine.includes('runtimeV02CreateEssenceAttachedEvent('));
  assert.ok(route.includes('runtimeV02BeginEventListenerContinuation(state, [transaction.listener_event])'));

  const start = match.indexOf('if(action==="attach_essence")');
  const end = match.indexOf('if(action==="attach_relic")', start);
  assert.ok(start >= 0 && end > start, 'manual attachment action block missing');
  const block = match.slice(start, end);
  const legacyMutation = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;';
  const legacyAt = block.indexOf(legacyMutation);
  assert.notEqual(legacyAt, -1, 'legacy fallback mutation must remain isolated after the structured return');
  const structuredBlock = block.slice(0, legacyAt);

  assertInOrder(structuredBlock, [
    'const structuredAttachment=s.runtime_registry_v0_2!=null',
    'runtimeV02BeginExternalEssenceAttachmentRoute(',
    'flags.manual_essence_turn=turn',
    'const eventFlow=routed.flow',
  ], 'marked manual attachment route');
  assert.ok(structuredBlock.includes('targetInst.uid,uid,"hand","manual_essence"'));
  assert.ok(structuredBlock.includes('attachment_kind:"normal"'));
  assert.ok(structuredBlock.includes('action_kind:"manual_essence"'));
  assert.ok(structuredBlock.includes('destination_index:where==="reserve"?idx:null'));
  for (const forbidden of [
    'removeHand(p,uid)',
    'x.attached_turn=turn',
    'cr.essence.push(x)',
    'registerStructuredRuntimeEssenceAttachmentLifecycleState(',
    'recordRuntimeV02EssenceAttachmentEvent(',
  ]) {
    assert.equal(structuredBlock.includes(forbidden), false, `match action bypasses canonical Attachment owner: ${forbidden}`);
  }
});

test('manual attachment reuses event, movement and heal continuation owners and can resume private choices', () => {
  const start = match.indexOf('if(action==="attach_essence")');
  const end = match.indexOf('if(action==="attach_relic")', start);
  const block = match.slice(start, end);
  assertInOrder(block, [
    'const eventFlow=routed.flow',
    'if(eventFlow.status==="player_choice_required")',
    'setEventResume("attach_essence",seat)',
    'runtimeV02BeginMovementListenerContinuation(',
    'setMovementResume("attach_essence",seat,eventFlow.emitted_heal_packet_ids)',
    'runtimeV02BeginMovementHealListenerContinuation(',
    'scanDefeats()',
  ], 'manual attachment continuation chain');
  assert.ok(match.includes('kind:"play_creature"|"evolve"|"attach_essence"'));
  assert.ok(match.includes('kind!=="play_creature"&&kind!=="evolve"&&kind!=="attach_essence"'));
  assert.ok(match.includes('kind:"withdrawal"|"attack"|"play_creature"|"evolve"|"attach_essence"'));
  assert.ok(match.includes('resume.kind==="withdrawal"||resume.kind==="play_creature"||resume.kind==="evolve"||resume.kind==="attach_essence"'));
});

test('card-specific manual attachment fallbacks are fenced to legacy matches', () => {
  const start = match.indexOf('if(action==="attach_essence")');
  const end = match.indexOf('if(action==="attach_relic")', start);
  const block = match.slice(start, end);
  const structuredStart = block.indexOf('if(structuredAttachment){');
  const legacyMutation = block.indexOf('const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;');
  const legacyStart = block.indexOf('if(d.id==="ember-smolder-essence"');
  assert.ok(structuredStart >= 0 && legacyMutation > structuredStart && legacyStart > legacyMutation, 'legacy fallback must follow the completed structured branch');
  const structuredBlock = block.slice(structuredStart, legacyMutation);
  for (const token of [
    'ember-smolder-essence',
    'ember-hearth-essence',
    'tide-calm-essence',
    'grove-bloom-essence',
    'stone-fault-essence',
    'tide-puddlepip',
  ]) {
    assert.equal(structuredBlock.includes(token), false, `structured attachment branch contains card-specific authority: ${token}`);
  }
  assert.ok(structuredBlock.includes('return json({version:VERSION,result:await commit("attach_essence"'));
});

test('lifecycle-only registration is separated from triggered essence_attached listener execution', () => {
  assert.ok(lifecycle.includes('export function registerStructuredRuntimeEssenceAttachmentLifecycleState('));
  assert.ok(lifecycle.includes('Triggered `essence_attached` listener steps are deliberately excluded'));
  assert.ok(lifecycle.includes('const lifecycleRegistered = registerStructuredRuntimeEssenceAttachmentLifecycleState('));
  assert.ok(engine.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState('));
  assert.equal(match.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState('), false);
});
