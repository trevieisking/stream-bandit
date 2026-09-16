import assert from 'node:assert/strict';
import {
  recordRuntimeV02EssenceAttachmentEvent,
  runtimeV02CreateEssenceAttachedEvent,
} from '../_shared/tcg-match-essence-attachment-event-v0-2.ts';
import {
  runtimeV02BuildEssenceAttachedTriggerPlan,
  runtimeV02EssenceAttachedCandidateEligibleAtTrigger,
  type RuntimeV02EssenceAttachedCandidateDescriptor,
} from '../_shared/tcg-match-essence-attachment-work-v0-2.ts';
import { runtimeV02SnapshotMarker } from '../_shared/tcg-runtime-registry-v0-2.ts';

const schema = 'sb-tcg-card-v0.2';
const effectSchema = 'sb-tcg-effects-v0.2';
const inst = (uid: string, card_id: string) => ({ uid, card_id });
const creatureDef = (id: string, element: string, stage = 'Standalone', withdrawal = 1) => ({
  id, schema, effect_schema: effectSchema, name: id, card_family: 'Creature', element,
  creature: { stage, withdrawal, ability: null }, essence: null, tactic: null,
});
const essenceDef = (id: string, element: string, subtype = 'Special') => ({
  id, schema, effect_schema: effectSchema, name: id, card_family: 'Essence', element,
  creature: null,
  essence: { subtype, provides: [{ element, amount: 1 }], listeners: [], continuous: [], lifecycle: null },
  tactic: null,
});
const cr = (uid: string, card_id: string, essence: Array<{ uid: string; card_id: string }> = []) => ({
  stack: [inst(uid, card_id)], essence, relic: null, damage: 20, shield: 0,
  conditions: { scorched: false, venomed: 0, control: null, modifier: null }, flags: {},
});

function fixture(kind = 'normal') {
  const attached = inst('attached-uid', 'gale-attached');
  const older = inst('older-uid', 'gale-older');
  const payment = inst('payment-uid', 'gale-payment');
  const target = cr('target-uid', 'gale-target', [older, attached]);
  const vanguard = cr('vanguard-uid', 'gale-vanguard', [payment]);
  const other = cr('other-uid', 'gale-other');
  const opponent = cr('opponent-uid', 'stone-opponent');
  const definitions = {
    'gale-attached': essenceDef('gale-attached', 'Gale'),
    'gale-older': essenceDef('gale-older', 'Gale'),
    'gale-payment': essenceDef('gale-payment', 'Gale', 'Basic'),
    'gale-target': creatureDef('gale-target', 'Gale', 'Teen', 1),
    'gale-vanguard': creatureDef('gale-vanguard', 'Gale', 'Standalone', 1),
    'gale-other': creatureDef('gale-other', 'Gale'),
    'stone-opponent': creatureDef('stone-opponent', 'Stone'),
  };
  const state = {
    turn_seq: 12,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: Object.fromEntries(Object.entries(definitions).map(([id, definition]) => [id, { definition_v0_2: definition }])),
    players: {
      '1': { vanguard, reserve: [target, other, null, null] },
      '2': { vanguard: opponent, reserve: [null, null, null, null] },
    },
    turn_flags: { '1': {} },
  } as Record<string, unknown>;
  const receipt = recordRuntimeV02EssenceAttachmentEvent(
    state,
    1,
    'target-uid',
    attached,
    'hand',
    'manual_essence',
    kind,
  );
  const event = runtimeV02CreateEssenceAttachedEvent(receipt, { destination_index: 0 });
  return { state, attached, older, target, vanguard, event };
}

function candidate(
  source: { uid: string; card_id: string },
  sourceCreatureUid: string | null,
  listener: Record<string, unknown>,
  sourceSeat: 1 | 2 = 1,
  kind: RuntimeV02EssenceAttachedCandidateDescriptor['kind'] = 'essence',
): RuntimeV02EssenceAttachedCandidateDescriptor {
  return {
    kind,
    source,
    source_controller_seat: sourceSeat,
    source_creature_uid: sourceCreatureUid,
    listener,
  };
}

Deno.test('essence_attached trigger plan freezes only eligible work before later mutations', () => {
  const { state, attached, older, target, vanguard, event } = fixture();
  const attachedListener = {
    id: 'attached-only',
    event: 'essence_attached',
    requirements: {
      all: [
        { predicate: 'source_is_self' },
        { predicate: 'event_origin_zone_is', zone: 'hand' },
        { predicate: 'target_element_is', target: '$attached_creature', element: 'Gale' },
        { predicate: 'target_zone_is', target: '$attached_creature', zone: 'reserve' },
        { predicate: 'target_damaged', target: '$attached_creature' },
      ],
    },
    steps: [{ op: 'HEAL', target: '$attached_creature', amount: 20 }],
  };
  const creatureListener = {
    id: 'target-creature-trigger',
    event: 'essence_attached',
    timing: 'own_turn',
    requirements: {
      all: [
        { predicate: 'event_attachment_target_is_source' },
        { predicate: 'event_subject_matches', filters: { card_family: 'Essence', element: 'Gale' } },
        { predicate: 'event_controller_is_active_seat' },
      ],
    },
    steps: [{ op: 'ADD_SHIELD', target: '$source_creature', amount: 10 }],
  };
  const candidates = [
    candidate(attached, 'target-uid', attachedListener),
    candidate(older, 'target-uid', attachedListener),
    candidate(inst('target-uid', 'gale-target'), 'target-uid', creatureListener, 1, 'ability'),
    candidate(inst('other-uid', 'gale-other'), 'other-uid', creatureListener, 1, 'ability'),
  ];

  const plan = runtimeV02BuildEssenceAttachedTriggerPlan(state, event, candidates);
  assert.deepEqual(plan.work.map((item) => item.listener_id), [
    'attached-only',
    'target-creature-trigger',
  ]);
  assert.equal(plan.snapshot.target.zone, 'reserve');
  assert.equal(plan.snapshot.target.damaged, true);
  assert.equal(plan.snapshot.active_seat, 1);

  target.damage = 0;
  const owner = (state.players as Record<string, any>)['1'];
  owner.vanguard = target;
  owner.reserve[0] = vanguard;
  state.active_seat = 2;
  attachedListener.id = 'mutated-after-trigger';

  assert.deepEqual(plan.work.map((item) => item.listener_id), [
    'attached-only',
    'target-creature-trigger',
  ]);
  assert.equal(plan.work[0].listener.id, 'attached-only');
  assert.equal(plan.snapshot.target.zone, 'reserve');
  assert.equal(plan.snapshot.target.damaged, true);
  assert.equal(plan.snapshot.active_seat, 1);
});

Deno.test('essence_attached trigger planner handles nested any/not and temporary-or-borrowed attachment windows', () => {
  const { state, event } = fixture('borrowed');
  const source = inst('target-uid', 'gale-target');
  const listener = {
    id: 'borrowed-window',
    event: 'essence_attached',
    timing: 'own_turn',
    requirements: {
      all: [
        { predicate: 'event_attachment_target_is_source' },
        {
          any: [
            { predicate: 'event_attachment_kind_is', kind: 'temporary' },
            { predicate: 'event_attachment_kind_is', kind: 'borrowed' },
          ],
        },
        { not: { predicate: 'target_has_condition', target: '$attached_creature', condition: 'Crushed' } },
      ],
    },
    steps: [{ op: 'ADD_ATTACK_DAMAGE_MODIFIER', target: '$source_creature', amount: 20 }],
  };
  const plan = runtimeV02BuildEssenceAttachedTriggerPlan(
    state,
    event,
    [candidate(source, 'target-uid', listener, 1, 'ability')],
  );
  assert.equal(plan.work.length, 1);
  assert.equal(plan.work[0].listener_id, 'borrowed-window');
});

Deno.test('essence_attached trigger eligibility rejects unsupported mutable predicates instead of falling back live', () => {
  const { state, attached, event } = fixture();
  const base = runtimeV02BuildEssenceAttachedTriggerPlan(state, event, []);
  assert.throws(
    () => runtimeV02EssenceAttachedCandidateEligibleAtTrigger(
      base.snapshot,
      candidate(attached, 'target-uid', {
        id: 'unsupported',
        event: 'essence_attached',
        requirements: { all: [{ predicate: 'future_mutable_predicate' }] },
        steps: [],
      }),
    ),
    /tcg_v0_2_attachment_trigger_predicate_unsupported:future_mutable_predicate/,
  );
});
