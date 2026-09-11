import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('supabase/functions/_shared/tcg-match-essence-attachment-engine-v0-2.ts', 'utf8');
const route = fs.readFileSync('supabase/functions/_shared/tcg-match-essence-attachment-route-v0-2.ts', 'utf8');
const eventListener = fs.readFileSync('supabase/functions/_shared/tcg-match-event-listener-v0-2.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Essence Attachment Engine is the sole physical attachment transaction owner', () => {
  assert.ok(engine.includes('export function runtimeV02ApplyEssenceAttachmentTransaction('));
  assert.ok(engine.includes('const attached = zone.splice(sourceIndex, 1)[0];'));
  assert.ok(engine.includes('attached.attached_turn = currentTurn;'));
  assert.ok(engine.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState('));
  assert.ok(engine.includes('targetField.creature.essence.push(attached);'));
  assert.ok(engine.includes('recordRuntimeV02EssenceAttachmentEvent('));
  assert.ok(engine.includes('runtimeV02CreateEssenceAttachedEvent('));

  assert.equal(
    engine.includes('tcg-match-event-listener-v0-2.ts'),
    false,
    'physical Attachment Engine must not depend on Event Listener or create a module cycle',
  );
});

test('external Attachment Route orchestrates Engine then Event Listener without owning physical mutation', () => {
  assert.ok(route.includes('runtimeV02ApplyEssenceAttachmentTransaction('));
  assert.ok(route.includes('runtimeV02BeginEventListenerContinuation(state, [transaction.listener_event])'));
  for (const forbidden of [
    'zone.splice(sourceIndex, 1)',
    'attached.attached_turn =',
    'targetField.creature.essence.push(',
    'registerStructuredRuntimeEssenceAttachmentLifecycleState(',
  ]) {
    assert.equal(route.includes(forbidden), false, `route regained physical attachment authority: ${forbidden}`);
  }
});

test('nested Event attachment delegates mutation to Attachment Engine and appends returned event to its existing continuation', () => {
  assert.ok(eventListener.includes('import { runtimeV02ApplyEssenceAttachmentTransaction } from "./tcg-match-essence-attachment-engine-v0-2.ts";'));
  const block = functionSlice(
    eventListener,
    '} else if (pending.kind === "attach_essence") {',
    '} else if (pending.kind === "inspect_rewards") {',
  );
  assert.ok(block.includes('runtimeV02ApplyEssenceAttachmentTransaction('));
  assert.ok(block.includes('source_owner_seat: ref.zone_owner_seat'));
  assert.ok(block.includes('source_card_id: ref.card_id'));
  assert.ok(block.includes('continuation.work.push(...essenceAttachedWorkItems(state, transaction.listener_event))'));
  for (const forbidden of [
    'removeCardRef(state, ref)',
    'target.cr.essence.push(',
    'registerStructuredRuntimeEssenceAttachmentLifecycleState(',
    'recordRuntimeV02EssenceAttachmentEvent(',
    'runtimeV02CreateEssenceAttachedEvent(',
  ]) {
    assert.equal(block.includes(forbidden), false, `nested Event path regained Attachment Engine authority: ${forbidden}`);
  }
});
