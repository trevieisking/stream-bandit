import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const runtimeCore = fs.readFileSync(
  path.join(root, 'supabase', 'functions', 'tcg-tactic-actions', 'runtime-v0-2-core.ts'),
  'utf8',
);
const grammar = JSON.parse(
  fs.readFileSync(path.join(root, 'tcg-card-pass-2-effect-grammar-v0.2.json'), 'utf8'),
);

test('runtime core delegates Damage and Shield mutation to canonical owner #20', () => {
  assert.match(runtimeCore, /from "\.\.\/_shared\/tcg-match-damage-engine-v0-2\.ts"/);
  for (const ownerCall of [
    'runtimeV02DealEffectDamage',
    'runtimeV02PlaceDamage',
    'runtimeV02AddShield',
    'runtimeV02MoveDamage',
    'runtimeV02TransferShield',
  ]) {
    assert.ok(runtimeCore.includes(ownerCall), `runtime core missing canonical ${ownerCall} delegation`);
  }

  assert.doesNotMatch(
    runtimeCore,
    /(?:creature|source|destination)\.(?:shield)\s*=/,
    'runtime core must not retain direct Shield mutation authority',
  );

  const damageAssignments = [...runtimeCore.matchAll(/(?:creature|source|destination)\.damage\s*=/g)];
  assert.equal(
    damageAssignments.length,
    1,
    'only Heal compatibility may retain direct damage reduction until Heal owner migration removes it',
  );
  assert.match(
    runtimeCore,
    /export function healRuntimeDamage[\s\S]*?creature\.damage = next;/,
    'the sole temporary direct damage assignment must remain inside Heal compatibility only',
  );
});

test('legacy moveRuntimeDamage compatibility preserves partial movement through owner #20', () => {
  assert.match(
    runtimeCore,
    /runtimeV02MoveDamage\(source, destination, amount, \{ allow_partial: true \}\)\.actual_damage_moved/,
  );
});

test('MOVE_DAMAGE grammar matches binding Amendment N field names and opt-ins', () => {
  const contract = grammar.operations.MOVE_DAMAGE;
  assert.deepEqual(contract.required, ['from', 'to', 'amount']);
  assert.deepEqual(contract.optional, [
    'allow_partial',
    'minimum_moved',
    'allow_opposing_destination',
    'destination_damage_cap',
    'as',
  ]);
  assert.equal(contract.required.includes('source'), false);
  assert.equal(contract.required.includes('destination'), false);
});

test('DRAIN_VITALITY remains one generic grammar operation for the later owner wiring slice', () => {
  const contract = grammar.operations.DRAIN_VITALITY;
  assert.deepEqual(contract.required, ['target', 'amount']);
  assert.deepEqual(contract.optional, ['heal_target', 'heal_cap', 'as']);
});