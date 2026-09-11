import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('supabase/functions/_shared/tcg-match-essence-attachment-engine-v0-2.ts', 'utf8');
const route = fs.readFileSync('supabase/functions/_shared/tcg-match-essence-attachment-route-v0-2.ts', 'utf8');
const eventListener = fs.readFileSync('supabase/functions/_shared/tcg-match-event-listener-v0-2.ts', 'utf8');
const tactic = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');
const matchActions = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

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

test('external Attachment Route is UID-only and orchestrates Engine then Event Listener without owning attachment state', () => {
  assert.ok(route.includes('RuntimeV02ExternalEssenceAttachmentRoute = RuntimeV02EssenceAttachmentTransaction & {'));
  assert.ok(route.includes('sourceCardUid: string,'));
  assert.ok(route.includes('runtimeV02ApplyEssenceAttachmentTransaction('));
  assert.ok(route.includes('runtimeV02BeginEventListenerContinuation(state, [transaction.listener_event])'));
  for (const forbidden of [
    '{ uid?: unknown; card_id?: unknown } | string',
    'sourceCardOrUid',
    'typeof sourceCardOrUid',
    'recordRuntimeV02EssenceAttachmentEvent(',
    'runtimeV02CreateEssenceAttachedEvent(',
    'zone.splice(sourceIndex, 1)',
    'attached.attached_turn =',
    'targetField.creature.essence.push(',
    'registerStructuredRuntimeEssenceAttachmentLifecycleState(',
  ]) {
    assert.equal(route.includes(forbidden), false, `route regained compatibility or attachment authority: ${forbidden}`);
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

test('Tactic discard attachment delegates UID identity, mutation and event dispatch to Attachment Route', () => {
  assert.ok(tactic.includes('import { runtimeV02BeginExternalEssenceAttachmentRoute } from "../_shared/tcg-match-essence-attachment-route-v0-2.ts";'));
  const block = functionSlice(
    tactic,
    '} else if (apply === "attach_essence_from_zone") {',
    '} else if (apply === "repeat_optional") {',
  );
  assert.ok(block.includes('runtimeV02BeginExternalEssenceAttachmentRoute('));
  assert.ok(block.includes('String(option.data.uid),'));
  assert.ok(block.includes('source_owner_seat: sourceSeat as 1 | 2'));
  assert.ok(block.includes('source_card_id: String(option.data.card_id)'));
  assert.ok(block.includes('attachmentHealPacketIds.push(...(routed.flow.emitted_heal_packet_ids || []))'));
  assert.ok(block.includes('attachmentMovementEvents.push(...(routed.flow.emitted_movement_events || []))'));
  assert.ok(block.includes('tcg_v0_2_tactic_attachment_event_choice_not_yet_supported'));
  for (const forbidden of [
    'removeByUid(player.discard',
    'inst.attached_turn =',
    'target.cr.essence.push(',
    'recordRuntimeV02EssenceAttachmentEvent(',
    'runtimeV02CreateEssenceAttachedEvent(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Tactic attachment path regained Attachment Engine authority: ${forbidden}`);
  }
});

test('manual structured hand attachment delegates UID identity, mutation and event dispatch to Attachment Route while legacy fallback stays isolated', () => {
  assert.ok(matchActions.includes('import { runtimeV02BeginExternalEssenceAttachmentRoute } from "../_shared/tcg-match-essence-attachment-route-v0-2.ts";'));
  assert.equal(
    matchActions.includes('registerStructuredRuntimeEssenceAttachmentLifecycleState'),
    false,
    'Match Actions must not own structured Essence attachment lifecycle registration',
  );

  const block = functionSlice(
    matchActions,
    '  if(action==="attach_essence"){',
    '  if(action==="attach_relic"){',
  );
  const legacyMutation = 'const x=removeHand(p,uid)!;x.attached_turn=turn;cr.essence.push(x);flags.manual_essence_turn=turn;';
  const legacyAt = block.indexOf(legacyMutation);
  assert.notEqual(legacyAt, -1, 'legacy fallback mutation must remain isolated until compatibility removal');

  const structured = block.slice(0, legacyAt);
  const routeAt = structured.indexOf('runtimeV02BeginExternalEssenceAttachmentRoute(');
  const flagAt = structured.indexOf('flags.manual_essence_turn=turn;');
  assert.notEqual(routeAt, -1, 'structured manual attachment must enter Attachment Route');
  assert.ok(structured.includes('targetInst.uid,uid,"hand","manual_essence"'));
  assert.ok(flagAt > routeAt, 'once-per-turn flag must be set only after the canonical attachment transaction succeeds');

  for (const forbidden of [
    'removeHand(p,uid)',
    'x.attached_turn=turn',
    'cr.essence.push(x)',
    'registerStructuredRuntimeEssenceAttachmentLifecycleState(',
  ]) {
    assert.equal(structured.includes(forbidden), false, `manual structured path regained Attachment Engine authority: ${forbidden}`);
  }
});
