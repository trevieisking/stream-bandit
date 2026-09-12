import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const owner = fs.readFileSync(
  'supabase/functions/_shared/tcg-match-attack-deck-discard-v0-2.ts',
  'utf8',
);

const dispatcher = fs.readFileSync(
  'supabase/functions/tcg-match-actions/index.ts',
  'utf8',
);

test('Attack Deck-Discard owner is generic and delegates physical movement to Card-Zone', () => {
  assert.ok(owner.includes('export function structuredRuntimeAfterDamageDeckDiscard'));
  assert.ok(owner.includes('export function runtimeV02ResolveAfterDamageDeckDiscard'));
  assert.ok(owner.includes('runtimeV02ApplyCardZoneTransfer(deck, discard'));
  assert.ok(owner.includes('predicate: "target_has_any_condition"'));
  assert.ok(owner.includes('player: "opponent"'));
  assert.ok(owner.includes('event_name: selected.length > 0 ? "deck_cards_discarded" : null'));
  assert.ok(owner.includes('destination_position: "bottom"'));

  for (const forbidden of [
    'Nightmaw',
    'nightmaw',
    'dread-crush',
    'Dread Crush',
    '.shift(',
    '.splice(',
    '.push(',
    'deckout_loser',
    'runtimeV02BeginEventListenerContinuation',
    'deck_bottom',
    'runtimeV02Shuffle',
  ]) {
    assert.equal(
      owner.includes(forbidden),
      false,
      `Attack Deck-Discard owner absorbed forbidden authority: ${forbidden}`,
    );
  }
});

test('Attack Deck-Discard owner preserves discard-pile semantics and event handoff boundary', () => {
  assert.ok(owner.includes('zone: "deck"'));
  assert.ok(owner.includes('zone: "discard"'));
  assert.ok(owner.includes('cause: "effect"'));
  assert.ok(owner.includes('action_kind: "attack"'));
  assert.ok(owner.includes('reveal: "public"'));
  assert.ok(owner.includes('event_name: "deck_cards_discarded" | null'));
  assert.equal(owner.includes('zone: "hand"'), false);
  assert.equal(owner.includes('zone: "rewards"'), false);
  assert.equal(owner.includes('zone: "void"'), false);
});

test('attack dispatcher preserves the accepted deck-discard event-to-heal owner chain', () => {
  assert.ok(
    dispatcher.includes(
      'from "../_shared/tcg-match-attack-deck-discard-v0-2.ts"',
    ),
  );
  assert.ok(
    dispatcher.includes(
      'from "../_shared/tcg-match-deck-discard-event-v0-2.ts"',
    ),
  );

  const attack = dispatcher.slice(dispatcher.indexOf('if(action==="attack")'));
  const orderedCalls = [
    'runtimeV02ResolveAfterDamageDeckDiscard(',
    'runtimeV02CreateDeckCardsDiscardedEvent(',
    'runtimeV02BeginEventListenerContinuation(',
    'runtimeV02BeginAttackHealListenerContinuation(',
  ].map((call) => attack.indexOf(call));
  assert.ok(orderedCalls.every((index) => index >= 0), orderedCalls.join(','));
  assert.deepEqual([...orderedCalls].sort((a, b) => a - b), orderedCalls);

  assert.match(
    attack,
    /if\(structuredDeckDiscard==null&&ef\.includes\("top 2 cards of the opponent's deck"\)/,
  );
  assert.ok(attack.includes('setEventResume("attack",seat)'));
  assert.ok(
    dispatcher.includes(
      'resume.kind==="attack"?runtimeV02BeginAttackHealListenerContinuation',
    ),
  );
  assert.ok(
    dispatcher.includes(
      'else if(resume.kind==="attack")aftermath(resume.seat)',
    ),
  );
  assert.equal(
    (attack.match(/top 2 cards of the opponent's deck/g) || []).length,
    1,
    'legacy fallback must remain singular and guarded',
  );

  for (const forbidden of ['Nightmaw', 'nightmaw', 'Dread Crush', 'Dread Hunger']) {
    assert.equal(
      dispatcher.includes(forbidden),
      false,
      `dispatcher gained card-specific deck-discard routing: ${forbidden}`,
    );
  }
});
