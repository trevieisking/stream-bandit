import assert from 'node:assert/strict';
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
} from '../_shared/tcg-match-essence-attachment-event-v0-2.ts';
import {
  runtimeV02EssenceAttachedSnapshotPredicate,
  runtimeV02SnapshotEssenceAttachedEligibility,
} from '../_shared/tcg-match-essence-attachment-eligibility-v0-2.ts';
import { runtimeV02SnapshotMarker } from '../_shared/tcg-runtime-registry-v0-2.ts';

const schema = 'sb-tcg-card-v0.2';
const effectSchema = 'sb-tcg-effects-v0.2';
const inst = (uid: string, card_id: string) => ({ uid, card_id });
const creatureDef = (id: string, element: string, stage = 'Standalone', withdrawal = 1) => ({
  id, schema, effect_schema: effectSchema, name: id, card_family: 'Creature', element,
  creature: { stage, withdrawal, ability: null }, essence: null, tactic: null,
});
const essenceDef = (id: string, element: string, subtype = 'Basic') => ({
  id, schema, effect_schema: effectSchema, name: id, card_family: 'Essence', element,
  creature: null,
  essence: { subtype, provides: [{ element, amount: 1 }], listeners: [], continuous: [], lifecycle: null },
  tactic: null,
});
const cr = (uid: string, card_id: string, options: Record<string, unknown> = {}) => ({
  stack: [inst(uid, card_id)], essence: options.essence || [], relic: null,
  damage: Number(options.damage || 0), shield: 0,
  conditions: options.conditions || { scorched: false, venomed: 0, control: null, modifier: null }, flags: {},
});
function markedState(options: { blocked?: boolean; payment?: boolean } = {}) {
  const attached = inst('attached-essence-uid', 'gale-snapshot-essence');
  const payment = inst('payment-uid', 'gale-basic-payment');
  const target = cr('target-uid', 'gale-target', {
    essence: [attached], damage: 30,
    conditions: { scorched: false, venomed: 0, control: null, modifier: 'Crushed' },
  });
  const vanguard = cr('vanguard-uid', 'gale-vanguard', {
    essence: options.payment === false ? [] : [payment],
    conditions: { scorched: false, venomed: 0, control: options.blocked ? 'Stunned' : null, modifier: null },
  });
  const opponent = cr('opponent-uid', 'stone-opponent');
  const definitions = {
    'gale-target': creatureDef('gale-target', 'Gale', 'Teen', 1),
    'gale-vanguard': creatureDef('gale-vanguard', 'Gale', 'Standalone', 1),
    'stone-opponent': creatureDef('stone-opponent', 'Stone', 'Standalone', 1),
    'gale-snapshot-essence': essenceDef('gale-snapshot-essence', 'Gale', 'Special'),
    'gale-basic-payment': essenceDef('gale-basic-payment', 'Gale', 'Basic'),
  };
  return {
    attached, target, vanguard,
    state: {
      turn_seq: 9, active_seat: 1, runtime_registry_v0_2: runtimeV02SnapshotMarker(),
      card_index: Object.fromEntries(Object.entries(definitions).map(([id, definition]) => [id, { definition_v0_2: definition }])),
      players: {
        '1': { vanguard, reserve: [target, null, null, null] },
        '2': { vanguard: opponent, reserve: [null, null, null, null] },
      },
      turn_flags: { '1': {} },
    } as Record<string, unknown>,
  };
}

Deno.test('essence_attached snapshot covers every frozen attachment predicate and does not drift with later state', () => {
  const { state, attached, target, vanguard } = markedState();
  const receipt = recordRuntimeV02EssenceAttachmentEvent(state, 1, 'target-uid', attached, 'hand', 'manual_essence', 'temporary');
  const event = runtimeV02CreateEssenceAttachedEvent(receipt, { destination_index: 0 });
  const snapshot = runtimeV02SnapshotEssenceAttachedEligibility(state, event);
  const context = { source_uid: attached.uid, source_controller_seat: 1 as const, source_creature_uid: 'target-uid' };
  const yes = (predicate: Record<string, unknown>) =>
    assert.equal(runtimeV02EssenceAttachedSnapshotPredicate(snapshot, predicate, context), true);

  yes({ predicate: 'source_is_self' });
  yes({ predicate: 'event_origin_zone_is', zone: 'hand' });
  yes({ predicate: 'event_controller_is_self' });
  yes({ predicate: 'event_controller_is_active_seat' });
  yes({ predicate: 'event_subject_matches', filters: { card_family: 'Essence', element: 'Gale', essence_subtype: 'Special' } });
  yes({ predicate: 'event_attachment_target_is_source' });
  yes({ predicate: 'event_attachment_kind_is', kind: 'temporary' });
  yes({ predicate: 'target_element_is', target: '$attached_creature', element: 'Gale' });
  yes({ predicate: 'target_zone_is', target: '$attached_creature', zone: 'reserve' });
  yes({ predicate: 'target_stage_in', target: '$attached_creature', stages: ['Teen', 'Adult'] });
  yes({ predicate: 'target_has_condition', target: '$attached_creature', condition: 'Crushed' });
  yes({ predicate: 'target_damaged', target: '$attached_creature' });
  yes({ predicate: 'target_damaged', target: '$source_creature' });
  yes({ predicate: 'voluntary_withdrawal_legal_with_incoming', player: 'self', incoming_target: '$attached_creature' });

  assert.equal(runtimeV02EssenceAttachedSnapshotPredicate(snapshot, { predicate: 'source_is_self' }, { ...context, source_uid: 'older-essence-uid' }), false);
  assert.equal(runtimeV02EssenceAttachedSnapshotPredicate(snapshot, { predicate: 'event_attachment_target_is_source' }, { ...context, source_creature_uid: 'other-uid' }), false);
  assert.equal(runtimeV02EssenceAttachedSnapshotPredicate(
    snapshot,
    { predicate: 'target_damaged', target: '$source_creature' },
    { ...context, source_creature_uid: 'other-uid' },
  ), false);

  target.damage = 0;
  target.conditions = { scorched: false, venomed: 0, control: null, modifier: null };
  const owner = (state.players as Record<string, any>)['1'];
  owner.vanguard = target;
  owner.reserve[0] = vanguard;
  state.active_seat = 2;
  state.turn_flags = { '1': { withdraw_turn: 9 } };

  yes({ predicate: 'event_controller_is_active_seat' });
  yes({ predicate: 'target_zone_is', target: '$attached_creature', zone: 'reserve' });
  yes({ predicate: 'target_has_condition', target: '$attached_creature', condition: 'Crushed' });
  yes({ predicate: 'target_damaged', target: '$attached_creature' });
  yes({ predicate: 'target_damaged', target: '$source_creature' });
  yes({ predicate: 'voluntary_withdrawal_legal_with_incoming', player: 'self', incoming_target: '$attached_creature' });
});

Deno.test('essence_attached snapshot freezes an ineligible withdrawal window as false', () => {
  const { state, attached } = markedState({ blocked: true });
  const receipt = recordRuntimeV02EssenceAttachmentEvent(state, 1, 'target-uid', attached, 'hand', 'manual_essence');
  const snapshot = runtimeV02SnapshotEssenceAttachedEligibility(state, runtimeV02CreateEssenceAttachedEvent(receipt, { destination_index: 0 }));
  const context = { source_uid: attached.uid, source_controller_seat: 1 as const, source_creature_uid: 'target-uid' };
  assert.equal(runtimeV02EssenceAttachedSnapshotPredicate(
    snapshot,
    { predicate: 'voluntary_withdrawal_legal_with_incoming', player: 'self', incoming_target: '$attached_creature' },
    context,
  ), false);
});

Deno.test('essence_attached snapshot rejects a receipt whose subject is not actually attached to the target', () => {
  const { state, attached, target } = markedState();
  target.essence = [];
  const receipt = recordRuntimeV02EssenceAttachmentEvent(state, 1, 'target-uid', attached, 'hand', 'manual_essence');
  assert.throws(
    () => runtimeV02SnapshotEssenceAttachedEligibility(state, runtimeV02CreateEssenceAttachedEvent(receipt, { destination_index: 0 })),
    /tcg_v0_2_attachment_snapshot_subject_not_attached/,
  );
});
