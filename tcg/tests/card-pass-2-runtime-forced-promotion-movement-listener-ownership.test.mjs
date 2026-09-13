import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const movement = fs.readFileSync('supabase/functions/_shared/tcg-match-movement-listener-v0-2.ts', 'utf8');
const position = fs.readFileSync('supabase/functions/_shared/tcg-match-switch-context-v0-2.ts', 'utf8');

test('Movement Listener consumes the general Battlefield Position context for forced promotion without inventing another owner', () => {
  assert.ok(movement.includes('runtimeV02BattlefieldPositionContextById'));
  assert.ok(movement.includes('type RuntimeV02BattlefieldPositionMovementEvent'));
  assert.ok(movement.includes('RuntimeV02MovementListenerEvent = RuntimeV02BattlefieldPositionMovementEvent | RuntimeV02EssenceMovedEvent'));
  assert.equal(movement.includes('runtimeV02SwitchContextById'), false, 'Movement Listener must not use the switch-only context reader for forced promotion');
  assert.ok(position.includes('export function runtimeV02BattlefieldPositionContextById'));
  assert.ok(position.includes('export type RuntimeV02BattlefieldPositionMovementEvent'));
});

test('forced promotion context is rebound to the promoted Vanguard and the vacated Reserve slot before listener targeting', () => {
  assert.ok(movement.includes('function positionContextForEvent('));
  assert.ok(movement.includes('vanguardTop?.uid !== context.incoming_vanguard_uid'));
  assert.ok(movement.includes('if (context.outgoing_vanguard_uid == null)'));
  assert.ok(movement.includes('if (reserveCreature != null) throw new Error("tcg_v0_2_movement_listener_switch_context_stale")'));
  assert.ok(movement.includes('reserveTop?.uid !== context.outgoing_vanguard_uid'));
});

test('forced promotion never fabricates a switch outgoing Vanguard target while incoming Vanguard targeting remains canonical', () => {
  assert.ok(movement.includes('const switchContext = positionContextForEvent(state, event)'));
  assert.ok(movement.includes('token === "$switch_incoming_vanguard"'));
  assert.ok(movement.includes('if (switchContext.outgoing_vanguard_uid == null) throw new Error("tcg_v0_2_movement_listener_switch_outgoing_unavailable")'));
  assert.ok(movement.includes('token === "$switch_outgoing_vanguard"'));
});

test('ordinary switch movement remains accepted through the same Movement Listener event family', () => {
  assert.ok(movement.includes('event.event === "moved_to_reserve" || event.event === "became_vanguard"'));
  assert.ok(movement.includes('event_action_kind_is'));
  assert.ok(movement.includes('event.origin_zone'));
  assert.ok(movement.includes('event.destination_zone'));
});
