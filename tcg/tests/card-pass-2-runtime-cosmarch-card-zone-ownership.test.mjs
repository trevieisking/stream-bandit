import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

test('legacy Cosmarch keeps Known Horizon legality while Card-Zone owns Deck to Hand movement', () => {
  const start = match.indexOf('if(atk.metadata_source==="legacy"&&ad?.id==="astral-cosmarch"');
  const end = match.indexOf('if(structuredSelectedHealChoice==null&&ad?.id==="tide-tideroar"', start);
  assert.notEqual(start, -1, 'missing legacy Cosmarch fallback');
  assert.notEqual(end, -1, 'missing bounded legacy Cosmarch block end');

  const block = match.slice(start, end);
  const predicateAt = block.indexOf('td?.element==="Astral"');
  const transferAt = block.indexOf('runtimeV02ApplyCardZoneTransfer(');
  const flagAt = block.indexOf('flags.looked_deck_turn=Number(s.turn_seq||0)');

  assert.ok(predicateAt >= 0, 'Cosmarch must keep the Astral top-card predicate');
  assert.ok(transferAt > predicateAt, 'Card-Zone movement must occur only after the Astral predicate passes');
  assert.ok(flagAt > transferAt, 'looked-deck turn state must remain after the successful movement');
  assert.equal(block.split('runtimeV02ApplyCardZoneTransfer(').length - 1, 1);

  assert.ok(block.includes('const legacyTopUid=String(p.deck[0]?.uid||"")'));
  assert.ok(block.includes('cause:"effect"'));
  assert.ok(block.includes('action_kind:"attack"'));
  assert.ok(block.includes('source_action_id:String(atk.id||`attack-${slot}`)'));
  assert.ok(block.includes('source_card_uid:attackSourceCard.uid'));
  assert.ok(block.includes('source:{controller_seat:seat as 1|2,zone:"deck",owner_card_uid:null}'));
  assert.ok(block.includes('destination:{controller_seat:seat as 1|2,zone:"hand",owner_card_uid:null}'));
  assert.ok(block.includes('card_uids:[legacyTopUid]'));
  assert.ok(block.includes('destination_position:"bottom"'));

  for (const forbidden of [
    'p.hand.push(',
    'p.deck.shift(',
    'p.deck.splice(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Cosmarch regained Card-Zone mutation authority: ${forbidden}`);
  }

  assert.equal(block.includes('runtimeV02ResolveAfterDamageServerTopDeckConditionalMove'), false,
    'legacy fallback must not absorb the structured Known Horizon resolver');
});
