import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('supabase/functions/_shared/tcg-match-card-zone-engine-v0-2.ts', 'utf8');
const overcharge = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-overcharge-discard-choice-v0-2.ts', 'utf8');
const recycle = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-discard-recycle-choice-v0-2.ts', 'utf8');
const serverTop = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-server-top-deck-v0-2.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Card-Zone Engine is generic, card-id-free and cannot absorb specialist attachment destinations', () => {
  assert.ok(engine.includes('export function runtimeV02PreflightCardZoneTransfer'));
  assert.ok(engine.includes('export function runtimeV02ApplyCardZoneTransfer'));
  assert.ok(engine.includes('tcg_v0_2_card_zone_specialist_destination_owned'));
  assert.ok(engine.includes('sourceZone.splice(0, sourceZone.length, ...remaining)'));
  assert.ok(engine.includes('destinationZone.push(...current.cards)'));

  for (const forbidden of [
    'volt-stormmane',
    'Stormmane',
    'storm-break',
    'Storm Break',
    'gale-breeze-essence',
    'stone-anchor-essence',
  ]) {
    assert.equal(engine.includes(forbidden), false, `Card-Zone owner contains card/name authority: ${forbidden}`);
  }
});

test('legacy Stormmane keeps mechanic legality and public error while delegating physical movement to Card-Zone Engine', () => {
  assert.ok(match.includes('import { runtimeV02ApplyCardZoneTransfer } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";'));
  const block = functionSlice(
    match,
    'if(atk.metadata_source==="legacy"&&ad?.id==="volt-stormmane"',
    'const targetHpAfterDamage=',
  );

  assert.ok(block.includes('runtimeV02ApplyCardZoneTransfer('));
  assert.ok(block.includes('cause:"effect"'));
  assert.ok(block.includes('source:{controller_seat:seat as 1|2,zone:"attached_essence"'));
  assert.ok(block.includes('destination:{controller_seat:seat as 1|2,zone:"discard"'));
  assert.ok(block.includes('card_uids:[uid]'));
  assert.ok(block.includes('destination_position:"bottom"'));
  assert.ok(block.includes('stormmane_attached_essence_discard_required'));
  assert.ok(block.includes('essence_discarded_turn=Number(s.turn_seq||0)'));
  assert.ok(block.indexOf('runtimeV02ApplyCardZoneTransfer(') < block.indexOf('essence_discarded_turn='));

  for (const forbidden of [
    'p.vanguard.essence.findIndex(',
    'p.vanguard.essence.splice(',
    'p.discard.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Stormmane regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('Stormmane delegation remains one bounded legacy caller and does not absorb structured Overcharge resolution', () => {
  const legacyStart = match.indexOf('if(atk.metadata_source==="legacy"&&ad?.id==="volt-stormmane"');
  const legacyEnd = match.indexOf('const targetHpAfterDamage=', legacyStart);
  const call = 'runtimeV02ApplyCardZoneTransfer(';
  assert.equal(match.slice(legacyStart, legacyEnd).split(call).length - 1, 1);
  assert.equal(match.slice(0, legacyStart).includes(call), false);
  assert.equal(match.slice(legacyEnd).includes(call), false);
});

test('structured Overcharge keeps effect identity while delegating physical movement to Card-Zone preflight and commit', () => {
  assert.ok(overcharge.includes('runtimeV02PreflightCardZoneTransfer'));
  assert.ok(overcharge.includes('runtimeV02CommitCardZoneTransfer'));
  const block = functionSlice(
    overcharge,
    'const option = choice.options.find',
    'let conditionApplied = false;',
  );

  const preflightAt = block.indexOf('runtimeV02PreflightCardZoneTransfer(');
  const identityAt = block.indexOf('assertSameInst(selected, { uid: option.uid, card_id: option.card_id }');
  const commitAt = block.indexOf('runtimeV02CommitCardZoneTransfer(');
  assert.ok(preflightAt >= 0 && identityAt > preflightAt, 'Overcharge identity must be checked after Card-Zone preflight');
  assert.ok(commitAt > identityAt, 'Card-Zone commit must wait for Overcharge frozen-identity validation');
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('zone: "attached_essence"'));
  assert.ok(block.includes('zone: "discard"'));
  assert.ok(block.includes('card_uids: [option.uid]'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'essence.findIndex(',
    'essence.splice(',
    '(controller.discard as unknown[]).push(',
    'discard.push(',
    '.discard.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Overcharge regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('structured discard recycle keeps attack choice authority while delegating discard to deck-bottom movement to Card-Zone', () => {
  assert.ok(recycle.includes('runtimeV02PreflightCardZoneTransfer'));
  assert.ok(recycle.includes('runtimeV02CommitCardZoneTransfer'));
  const block = functionSlice(
    recycle,
    'export function runtimeV02ResolveAttackDiscardRecycleChoice(',
    'return { attack_id: choice.attack_id, choice_id: choice.id, selected_count: 1, moved_count: 1 };',
  );

  const preflightAt = block.indexOf('runtimeV02PreflightCardZoneTransfer(');
  const commitAt = block.indexOf('runtimeV02CommitCardZoneTransfer(');
  assert.ok(preflightAt >= 0 && commitAt > preflightAt, 'Discard recycle must commit only through Card-Zone after preflight');
  assert.ok(block.includes('{ uid: option.uid, card_id: option.card_id }'));
  assert.ok(block.includes('tcg_v0_2_attack_discard_recycle_choice_selected_card_changed'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "attack"'));
  assert.ok(block.includes('source_action_id: choice.attack_id'));
  assert.ok(block.includes('source_card_uid: choice.source_uid'));
  assert.ok(block.includes('zone: "discard"'));
  assert.ok(block.includes('zone: "deck"'));
  assert.ok(block.includes('card_uids: [option.uid]'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'discard.findIndex(',
    'discard.splice(',
    '(player.deck as unknown[]).push(',
    'deck.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Discard recycle regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('server-only top-deck attack keeps inspection authority while delegating deck-top to hand movement to Card-Zone', () => {
  const start = serverTop.indexOf('export function runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(');
  assert.notEqual(start, -1, 'missing server top-deck resolver');
  const block = serverTop.slice(start);
  const inspectAt = block.indexOf('const topCard = runtimeInst(deck[0]');
  const matchAt = block.indexOf('const matched = String(topDefinition.element');
  const moveAt = block.indexOf('runtimeV02ApplyCardZoneTransfer(');
  assert.ok(inspectAt >= 0 && matchAt > inspectAt && moveAt > matchAt, 'server inspection/filtering must remain before Card-Zone movement');
  assert.ok(block.includes('descriptor.inspect.visibility !== "server_only"'));
  assert.ok(block.includes('runtimeV02Definition(state, topCard)'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "attack"'));
  assert.ok(block.includes('source_action_id: descriptor.attack_id'));
  assert.ok(block.includes('source_card_uid: source.uid'));
  assert.ok(block.includes('zone: "deck"'));
  assert.ok(block.includes('zone: "hand"'));
  assert.ok(block.includes('card_uids: [topCard.uid]'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'hand.push(',
    'deck.shift(',
    'deck.splice(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Server top-deck resolver regained Card-Zone mutation authority: ${forbidden}`);
  }
});
