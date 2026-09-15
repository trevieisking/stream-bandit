import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const validator = JSON.parse(fs.readFileSync('tcg-card-pass-2-validator-v0.2.json', 'utf8'));
const migration = fs.readFileSync('supabase/migrations/20260905105500_tcg_economy_and_copy_limit_alignment.sql', 'utf8');

const normalized = migration.replace(/\s+/g, ' ');

test('deck validator follows canonical identity copy limits and Essence allowance', () => {
  assert.equal(validator.global_rules.normal_identity_deck_limit, 4);
  assert.equal(validator.global_rules.mythic_identity_deck_limit, 1);
  assert.equal(validator.global_rules.essence_uses_separate_global_allowance, true);

  assert.match(normalized, /group by cd\.card_id/i, 'copy limits must aggregate by gameplay identity');
  assert.match(normalized, /cd\.card_family\s*=\s*'Essence'/i, 'Essence must use its separate allowance');
  assert.match(normalized, /not x\.essence and not x\.mythic and x\.qty > 4/i, 'ordinary non-Essence identity max must be four');
  assert.match(normalized, /x\.mythic and x\.qty > 1/i, 'Mythic identity max must be one');

  assert.equal(/v_mythic_total/i.test(migration), false, 'global one-Mythic-total authority must be removed');
  assert.equal(/v_legendary_total|v_legendary_dup/i.test(migration), false, 'Legendary deck caps are obsolete');
  assert.equal(migration.includes('deck_exceeds_one_mythic_limit'), false, 'obsolete global Mythic error must be removed');
  assert.equal(migration.includes('deck_violates_legendary_limit'), false, 'obsolete Legendary error must be removed');
});

test('economy alignment remains exactly three currencies and preserves unrelated deck guards', () => {
  for (const currency of ['battle_pass_tokens', 'trade_tokens', 'shop_coins']) {
    assert.ok(migration.includes(currency), `missing canonical currency ${currency}`);
  }
  assert.ok(migration.includes('tcg_legacy_currency_balance_requires_explicit_conversion_plan'));
  assert.ok(migration.includes('deck_must_contain_exactly_60_cards'));
  assert.ok(migration.includes('deck_exceeds_owned_card_quantities'));
  assert.ok(migration.includes('deck_contains_cards_outside_declared_elements'));
});
