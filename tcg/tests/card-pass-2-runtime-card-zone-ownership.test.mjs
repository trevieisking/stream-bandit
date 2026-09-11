import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('supabase/functions/_shared/tcg-match-card-zone-engine-v0-2.ts', 'utf8');
const overcharge = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-overcharge-discard-choice-v0-2.ts', 'utf8');
const recycle = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-discard-recycle-choice-v0-2.ts', 'utf8');
const serverTop = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-server-top-deck-v0-2.ts', 'utf8');
const topChoice = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-card-choice-v0-2.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const tactic = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');

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
  assert.ok(engine.includes('export function runtimeV02ApplyCardZonePartitionTransfer'));
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
    'dream-ray',
    'Dream Ray',
    'mycelial-bloom',
    'Mycelial Bloom',
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

test('private top-deck card choice keeps hidden/choice legality while Card-Zone owns the atomic chosen/remainder partition', () => {
  assert.ok(topChoice.includes('recordRuntimeV02HiddenInformationView(state, seat, "deck_top")'));
  const start = topChoice.indexOf('export function runtimeV02ResolveTopDeckCardChoice(');
  assert.notEqual(start, -1, 'missing top-deck choice resolver');
  const block = topChoice.slice(start);
  const topSetAt = block.indexOf('const currentTop = deck.slice(');
  const selectedAt = block.indexOf('const chosenIndex = currentTop.findIndex(');
  const partitionAt = block.indexOf('runtimeV02ApplyCardZonePartitionTransfer(');
  assert.ok(topSetAt >= 0 && selectedAt > topSetAt && partitionAt > selectedAt, 'top-set and selected identity checks must precede Card-Zone partition mutation');
  assert.ok(block.includes('tcg_v0_2_attack_card_choice_top_set_changed'));
  assert.ok(block.includes('tcg_v0_2_attack_card_choice_selected_card_changed'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "attack"'));
  assert.ok(block.includes('source_action_id: choice.attack_id'));
  assert.ok(block.includes('source_card_uid: choice.source_uid'));
  assert.ok(block.includes('source_window: {'));
  assert.ok(block.includes('position: "top"'));
  assert.ok(block.includes('card_uids: currentTop.map((card) => card.uid)'));
  assert.ok(block.includes('destination_card_uids: [option.uid]'));
  assert.ok(block.includes('source_remainder_position: "bottom"'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    '(player.deck as unknown[]).splice(',
    '(player.hand as unknown[]).push(',
    '(player.deck as unknown[]).push(',
    'deck.splice(',
    'hand.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Top-deck choice regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('tactic DRAW and DRAW_FIXED keep count/deckout authority while Card-Zone owns deck-top to hand movement', () => {
  assert.ok(tactic.includes('from "../_shared/tcg-match-card-zone-engine-v0-2.ts";'));
  const block = functionSlice(
    tactic,
    'if (op === "DRAW" || op === "DRAW_FIXED") {',
    'if (op === "DISCARD_HAND") {',
  );

  const availableAt = block.indexOf('const available = Math.min(count, player.deck.length);');
  const topSelectionAt = block.indexOf('const drawUids = (player.deck as Inst[]).slice(0, available).map((inst) => inst.uid);');
  const transferAt = block.indexOf('runtimeV02ApplyCardZoneTransfer(');
  const deckoutAt = block.indexOf('if (op === "DRAW_FIXED" && step.deckout_on_incomplete && available < count) state.deckout_loser = seat;');
  assert.ok(availableAt >= 0 && topSelectionAt > availableAt && transferAt > topSelectionAt, 'tactic draw count and top-card selection must precede Card-Zone movement');
  assert.ok(deckoutAt > transferAt, 'DRAW_FIXED deckout rule must remain after the movement attempt');
  assert.ok(block.includes('if (available > 0)'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "tactic"'));
  assert.ok(block.includes('source_action_id: effect.id'));
  assert.ok(block.includes('source_card_uid: effect.source_card.uid'));
  assert.ok(block.includes('source: { controller_seat: seat as 1 | 2, zone: "deck", owner_card_uid: null }'));
  assert.ok(block.includes('destination: { controller_seat: seat as 1 | 2, zone: "hand", owner_card_uid: null }'));
  assert.ok(block.includes('card_uids: drawUids'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'player.hand.push(',
    'player.deck.splice(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Tactic draw regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('tactic DISCARD_HAND keeps target-player sequencing while Card-Zone owns whole-hand to discard movement', () => {
  const block = functionSlice(
    tactic,
    'if (op === "DISCARD_HAND") {',
    'if (op === "LOOK_TOP") {',
  );

  const seatAt = block.indexOf('const seat = playerSeat(ownerSeat, step.player || "self", vars);');
  const snapshotAt = block.indexOf('const discardUids = (player.hand as Inst[]).map((inst) => inst.uid);');
  const transferAt = block.indexOf('runtimeV02ApplyCardZoneTransfer(');
  const cursorAt = block.indexOf('effect.cursor++;');
  assert.ok(seatAt >= 0 && snapshotAt > seatAt && transferAt > snapshotAt, 'DISCARD_HAND must resolve target player and exact hand before Card-Zone movement');
  assert.ok(cursorAt > transferAt, 'Tactic interpreter must retain sequencing after Card-Zone movement');
  assert.ok(block.includes('if (discardUids.length > 0)'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "tactic"'));
  assert.ok(block.includes('source_action_id: effect.id'));
  assert.ok(block.includes('source_card_uid: effect.source_card.uid'));
  assert.ok(block.includes('source: { controller_seat: seat as 1 | 2, zone: "hand", owner_card_uid: null }'));
  assert.ok(block.includes('destination: { controller_seat: seat as 1 | 2, zone: "discard", owner_card_uid: null }'));
  assert.ok(block.includes('card_uids: discardUids'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'player.discard.push(',
    'player.hand.splice(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Tactic DISCARD_HAND regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('tactic selected-hand choices keep choice legality and frozen identity while Card-Zone owns atomic hand movement', () => {
  assert.ok(tactic.includes('runtimeV02PreflightCardZoneTransfer'));
  assert.ok(tactic.includes('runtimeV02CommitCardZoneTransfer'));
  const block = functionSlice(
    tactic,
    '} else if (apply === "hand_to_discard" || apply === "hand_to_bottom") {',
    '} else if (apply === "search_deck") {',
  );

  const preflightAt = block.indexOf('runtimeV02PreflightCardZoneTransfer(');
  const identityAt = block.indexOf('current.card_id !== String(option.data.card_id)');
  const commitAt = block.indexOf('runtimeV02CommitCardZoneTransfer(');
  assert.ok(preflightAt >= 0 && identityAt > preflightAt, 'selected-hand choices must verify frozen identity after Card-Zone preflight');
  assert.ok(commitAt > identityAt, 'selected-hand choices must commit only after frozen identity validation');
  assert.ok(block.includes('selected_hand_zone_seat_invalid'));
  assert.ok(block.includes('selected_hand_card_missing'));
  assert.ok(block.includes('selected_hand_card_changed'));
  assert.ok(block.includes('const destinationKind = apply === "hand_to_discard" ? "discard" : "deck";'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "tactic"'));
  assert.ok(block.includes('source_action_id: effect.id'));
  assert.ok(block.includes('source_card_uid: effect.source_card.uid'));
  assert.ok(block.includes('source: { controller_seat: zoneSeat as 1 | 2, zone: "hand", owner_card_uid: null }'));
  assert.ok(block.includes('destination: { controller_seat: zoneSeat as 1 | 2, zone: destinationKind, owner_card_uid: null }'));
  assert.ok(block.includes('card_uids: selectedUids'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'removeByUid(player.hand',
    'player.hand.splice(',
    'player.discard.push(',
    'player.deck.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `selected-hand resolver regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('tactic SEARCH_DECK keeps hidden/search choice authority while Card-Zone owns atomic selected deck-to-hand movement', () => {
  const searchBlock = functionSlice(
    tactic,
    'if (op === "SEARCH_DECK") {',
    'if (op === "SEARCH_DECK_GROUP") {',
  );
  assert.ok(searchBlock.includes('cardOptions(state, player.deck, step.selection?.filters, ownerSeat)'));
  assert.ok(searchBlock.includes('choiceBounds(step.selection, options.length, true)'));
  assert.ok(searchBlock.includes('recordRuntimeV02HiddenInformationView(state, seat as 1 | 2, "deck")'));
  assert.ok(searchBlock.includes('reveal: step.reveal || null'));

  const block = functionSlice(
    tactic,
    '} else if (apply === "search_deck") {',
    '} else if (apply === "move_from_zone") {',
  );
  const preflightAt = block.indexOf('runtimeV02PreflightCardZoneTransfer(');
  const identityAt = block.indexOf('current.card_id !== String(option.data.card_id)');
  const commitAt = block.indexOf('runtimeV02CommitCardZoneTransfer(');
  assert.ok(preflightAt >= 0 && identityAt > preflightAt, 'search result identity must be checked after Card-Zone preflight');
  assert.ok(commitAt > identityAt, 'search movement must commit only after frozen identity validation');
  assert.ok(block.includes('selected_deck_zone_seat_invalid'));
  assert.ok(block.includes('tactic_search_destination_unsupported'));
  assert.ok(block.includes('if (selected.length > 0)'));
  assert.ok(block.includes('selected_deck_card_missing'));
  assert.ok(block.includes('selected_deck_card_changed'));
  assert.ok(block.includes('cause: "effect"'));
  assert.ok(block.includes('action_kind: "tactic"'));
  assert.ok(block.includes('source_action_id: effect.id'));
  assert.ok(block.includes('source_card_uid: effect.source_card.uid'));
  assert.ok(block.includes('source: { controller_seat: zoneSeat as 1 | 2, zone: "deck", owner_card_uid: null }'));
  assert.ok(block.includes('destination: { controller_seat: zoneSeat as 1 | 2, zone: "hand", owner_card_uid: null }'));
  assert.ok(block.includes('card_uids: selectedUids'));
  assert.ok(block.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'removeByUid(player.deck',
    'player.deck.splice(',
    'player.hand.push(',
    'moveCardsToDestination(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Tactic SEARCH_DECK regained Card-Zone mutation authority: ${forbidden}`);
  }
});
