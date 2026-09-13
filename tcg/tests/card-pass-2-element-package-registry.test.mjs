import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  elementPackages,
  loadElementPackageManifest,
  pendingElementPackages,
  registryElementSourceFiles,
  registrySourceFiles,
  starterDescriptors,
  validateElementPackageManifest,
} from '../../tcg-element-package-registry-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const manifest = loadElementPackageManifest(root);

const existingElements = ['Astral', 'Ember', 'Gale', 'Grove', 'Shade', 'Stone', 'Tide', 'Volt'];

test('element-package manifest preserves eight current packages and adds Fairy + Underworld as current required packages', () => {
  assert.equal(elementPackages(manifest).length, 10);
  assert.deepEqual(elementPackages(manifest).map((pkg) => pkg.element), [
    ...existingElements,
    'Fairy',
    'Underworld',
  ]);
  assert.deepEqual(pendingElementPackages(manifest).map((pkg) => pkg.element), ['Fairy', 'Underworld']);
  assert.deepEqual(manifest.current_target.required_additions, ['Fairy', 'Underworld']);
  assert.equal(manifest.classification.Martial.kind, 'creature_type');
  assert.equal(manifest.classification.Martial.is_full_element, false);
});

test('current frozen registry source discovery remains byte-order compatible with the existing eight plus Founder', () => {
  assert.deepEqual(registryElementSourceFiles(manifest), existingElements.map((element) =>
    `tcg-card-pass-2-${element.toLowerCase()}.md`
  ));
  assert.deepEqual(registrySourceFiles(manifest), [
    ...existingElements.map((element) => `tcg-card-pass-2-${element.toLowerCase()}.md`),
    'tcg-card-pass-2-founder-structured.md',
  ]);
});

test('all ten full-element packages carry starter bindings, including Gracebound and Debtbound', () => {
  const starters = starterDescriptors(manifest);
  assert.equal(starters.length, 10);
  assert.equal(starters.find((entry) => entry.element === 'Fairy')?.name, 'Gracebound');
  assert.equal(starters.find((entry) => entry.element === 'Underworld')?.name, 'Debtbound');
  assert.equal(starters.filter((entry) => entry.state === 'existing').length, 8);
  assert.equal(starters.filter((entry) => entry.state === 'designed_pending_structure').length, 2);
});

test('adding another full element is data-only for package discovery', () => {
  const synthetic = structuredClone(manifest);
  synthetic.current_target.full_element_count += 1;
  synthetic.current_target.starter_count += 1;
  synthetic.packages.push({
    package_id: 'element-aurora-test',
    element: 'AuroraTest',
    state: 'structured',
    design_authority: 'tcg-card-pass-2-aurora-test.md',
    structured_candidate_file: 'tcg-card-pass-2-aurora-test.md',
    starter: {
      starter_id: 'deck-aurora-test',
      name: 'Aurora Test',
      state: 'ready',
      recipe_manifest: 'tcg-starters-aurora-test.json',
    },
  });

  validateElementPackageManifest(synthetic);
  assert.equal(elementPackages(synthetic).at(-1).element, 'AuroraTest');
  assert.equal(registryElementSourceFiles(synthetic).at(-1), 'tcg-card-pass-2-aurora-test.md');
  assert.equal(starterDescriptors(synthetic).at(-1).name, 'Aurora Test');
});

test('package contract carries the reusable 24-identity / exact-starter shape', () => {
  assert.deepEqual(manifest.package_contract, {
    identities: 24,
    creatures: 11,
    essence: 4,
    tactics: 9,
    pack_only: 3,
    starter_cards: 60,
    starter_identities: 21,
    starter_creature_cards: 22,
    starter_essence_cards: 18,
    starter_tactic_cards: 20,
    mythic_identities: 1,
    starbound_identities: 1,
  });
});
