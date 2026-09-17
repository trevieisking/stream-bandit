import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../../supabase/migrations/20260917143500_tcg_setup_legal_deck_validation.sql', import.meta.url),
  'utf8',
);
const privateAlpha = await readFile(
  new URL('../../supabase/functions/tcg-private-alpha-api/index.ts', import.meta.url),
  'utf8',
);

const setupRecipeTypes = [
  'Creature — Baby',
  'Creature — Standalone',
  'Creature — Mythic',
];

test('G0R-08 validator uses the exact opening/setup recipe types owned by the runtime', () => {
  for (const recipeType of setupRecipeTypes) {
    assert.match(migration, new RegExp(recipeType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(privateAlpha, new RegExp(recipeType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(privateAlpha, /function starterLegal\([^)]*\)\{[^}]*Creature — Baby[^}]*Creature — Standalone[^}]*Creature — Mythic[^}]*\}/);
});

test('G0R-08 rejects decks with zero setup-eligible Creature copies', () => {
  assert.match(migration, /v_setup_eligible integer := 0/);
  assert.match(migration, /select coalesce\(sum\(dc\.quantity\),0\)::int into v_setup_eligible/);
  assert.match(migration, /if v_setup_eligible = 0 then v_errors := v_errors \|\| jsonb_build_array\('deck_requires_setup_eligible_creature'\); end if;/);
});

test('G0R-08 keeps setup eligibility restricted to active structured cards', () => {
  assert.match(
    migration,
    /join public\.tcg_card_definitions cd\s+on cd\.card_id = dc\.card_id\s+and cd\.is_active/,
  );
  assert.match(migration, /coalesce\(cd\.definition->>'recipe_type',''\) in \(/);
});

test('G0R-08 preserves the existing validator error fence', () => {
  const existingErrors = [
    'deck_must_contain_exactly_60_cards',
    'deck_contains_unknown_or_inactive_card',
    'deck_exceeds_owned_card_quantities',
    'deck_exceeds_four_copy_identity_limit',
    'deck_exceeds_one_copy_mythic_identity_limit',
    'deck_contains_cards_outside_declared_elements',
  ];

  for (const error of existingErrors) {
    assert.match(migration, new RegExp(error));
  }
});

test('G0R-08 returns setup-eligible copy count as validation evidence', () => {
  assert.match(migration, /'setup_eligible_creature_copies', v_setup_eligible/);
});
