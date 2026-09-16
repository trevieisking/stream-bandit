import assert from 'node:assert/strict';
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
  runtimeV02CurrentTurnEssenceAttachmentEvents,
} from '../_shared/tcg-match-essence-attachment-event-v0-2.ts';

Deno.test('essence attachment receipt adapts deterministically to the generic Runtime Pass E event shape', () => {
  const state: Record<string, unknown> = { turn_seq: 7 };
  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    1,
    'host-creature-uid',
    { uid: 'essence-uid', card_id: 'tide-flow-essence' },
    'hand',
    'manual_essence',
    'normal',
  );

  const event = runtimeV02CreateEssenceAttachedEvent(receipt, {
    phase: 'play',
    action_kind: 'manual_essence',
    destination_index: 2,
  });

  assert.deepEqual(event, {
    event_id: 'essence-attachment:7:1',
    event: 'essence_attached',
    subject_uid: 'essence-uid',
    subject_card_id: 'tide-flow-essence',
    controller_seat: 1,
    origin_zone: 'hand',
    destination_zone: 'field',
    destination_index: 2,
    phase: 'play',
    source_action_id: 'manual_essence',
    source_card_uid: 'essence-uid',
    action_kind: 'manual_essence',
    turn_seq: 7,
    attachment_target_uid: 'host-creature-uid',
    attachment_kind: 'normal',
  });

  assert.deepEqual(runtimeV02CurrentTurnEssenceAttachmentEvents(state), [receipt]);
});

Deno.test('essence attachment adapter is pure and preserves the canonical receipt', () => {
  const state: Record<string, unknown> = { turn_seq: 4 };
  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    2,
    'target-uid',
    { uid: 'borrowed-uid', card_id: 'volt-basic-volt-essence' },
    'discard',
    'ability:living-circuit',
    'borrowed',
  );
  const before = structuredClone(state);

  const event = runtimeV02CreateEssenceAttachedEvent(receipt, {
    phase: 'event_listener_resolution',
    action_kind: 'ability',
  });

  assert.equal(event.event, 'essence_attached');
  assert.equal(event.subject_uid, receipt.source_card_uid);
  assert.equal(event.subject_card_id, receipt.source_card_id);
  assert.equal(event.attachment_target_uid, receipt.target_creature_uid);
  assert.equal(event.attachment_kind, 'borrowed');
  assert.equal(event.destination_index, null);
  assert.deepEqual(state, before);
});

Deno.test('essence attachment adapter rejects an impossible reserve index', () => {
  const state: Record<string, unknown> = { turn_seq: 1 };
  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    1,
    'target-uid',
    { uid: 'essence-uid', card_id: 'ember-basic-ember-essence' },
    'hand',
    'manual_essence',
  );

  assert.throws(
    () => runtimeV02CreateEssenceAttachedEvent(receipt, { destination_index: 4 }),
    /tcg_v0_2_attachment_listener_destination_index_invalid/,
  );
});
