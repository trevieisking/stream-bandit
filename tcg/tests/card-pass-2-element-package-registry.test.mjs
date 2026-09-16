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

const launchElements = ['Astral', 'Ember', 'Gale', 'Grove', 'Shade', 'Stone', 'Tide', 'Volt'];

test('element-package manifest exposes exactly eight launch packages and preserves Fairy + Underworld as future concepts', () => {
  assert.equal(elementPackages(manifest).length, 8);
  assert.deepEqual(elementPackages(manifest).map((pkg) => pkg.element), launchElements);
  assert.deepEqual(pendingElementPackages(manifest), []);
  assert.equal(manifest.current_target.full_element_count, 8);
  assert.equal(manifest.current_target.starter_count, 8);
  assert.equal(manifest.current_target.structured_identity_count, 193);
  assert.deepEqual(manifest.current_target.required_additions, []);
  assert.deepEqual(manifest.future_expansion_concepts.map((entry) => entry.element), ['Fairy', 'Underworld']);
  assert.ok(manifest.future_expansion_concepts.every((entry) => entry.state === 'future_concept_only'));
  assert.ok(manifest.future_expansion_concepts.every((entry) => entry.structured_candidate_file === null));
  assert.ok(manifest.future_expansion_concepts.every((entry) => entry.launch_blocker === false));
  assert.equal(manifest.classification.Martial.kind, 'creature_type');
  assert.equal(manifest.classification.Martial.is_full_element, false);
});

test('current launch registry source discovery remains byte-order compatible with the eight structured elements plus Founder', () => {
  assert.deepEqual(registryElementSourceFiles(manifest), launchElements.map((element) =>
    `tcg-card-pass-2-${element.toLowerCase()}.md`
  ));
  assert.deepEqual(registrySourceFiles(manifest), [
    ...launchElements.map((element) => `tcg-card-pass-2-${element.toLowerCase()}.md`),
    'tcg-card-pass-2-founder-structured.md',
  ]);
});

test('all eight launch packages carry existing starter bindings while future concepts do not claim launch recipes', () => {
  const starters = starterDescriptors(manifest);
  assert.equal(starters.length, 8);
  assert.equal(starters.filter((entry) => entry.state === 'existing').length, 8);
  assert.deepEqual(starters.map((entry) => entry.element), launchElements);
  assert.equal(manifest.future_expansion_concepts.find((entry) => entry.element === 'Fairy')?.starter_concept?.name, 'Gracebound');
  assert.equal(manifest.future_expansion_concepts.find((entry) => entry.element === 'Fairy')?.starter_concept?.recipe_manifest, null);
  assert.equal(manifest.future_expansion_concepts.find((entry) => entry.element === 'Underworld')?.starter_concept?.name, 'Debtbound');
  assert.equal(manifest.future_expansion_concepts.find((entry) => entry.element === 'Underworld')?.starter_concept?.recipe_manifest, null);
});

test('adding a completed future full element is data-only for package discovery', () => {
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

test('package contract carries the reusable 24-identity / exact-starter shape for future completed elements', () => {
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
