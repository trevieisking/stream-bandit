import fs from 'node:fs';
import path from 'node:path';

export const ELEMENT_PACKAGE_MANIFEST_FILE = 'tcg-element-packages-v0.2.json';

function requiredString(value, error) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(error);
  return text;
}

function positiveInteger(value, error) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(error);
  return number;
}

function validateStarter(starter, packageId) {
  if (!starter || typeof starter !== 'object' || Array.isArray(starter)) {
    throw new Error(`${packageId}: starter descriptor required`);
  }
  const name = requiredString(starter.name, `${packageId}: starter name required`);
  const state = requiredString(starter.state, `${packageId}: starter state required`);
  if (!['existing', 'designed_pending_structure', 'structured_pending_recipe', 'ready'].includes(state)) {
    throw new Error(`${packageId}: unsupported starter state ${state}`);
  }
  const starterId = starter.starter_id == null ? null : requiredString(starter.starter_id, `${packageId}: starter id invalid`);
  const recipeManifest = starter.recipe_manifest == null ? null : requiredString(starter.recipe_manifest, `${packageId}: recipe manifest invalid`);
  if ((state === 'existing' || state === 'ready') && (!starterId || !recipeManifest)) {
    throw new Error(`${packageId}: bound starter requires id and recipe manifest`);
  }
  return { starter_id: starterId, name, state, recipe_manifest: recipeManifest };
}

export function validateElementPackageManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('tcg_element_package_manifest_required');
  }
  if (manifest.schema !== 'sb-tcg-element-packages-v0.2') {
    throw new Error('tcg_element_package_manifest_schema_invalid');
  }
  if (!Array.isArray(manifest.packages) || manifest.packages.length < 1) {
    throw new Error('tcg_element_package_manifest_packages_required');
  }
  if (!Array.isArray(manifest.set_anchor_sources)) {
    throw new Error('tcg_element_package_manifest_anchor_sources_invalid');
  }

  const contract = manifest.package_contract || {};
  for (const key of [
    'identities', 'creatures', 'essence', 'tactics', 'pack_only',
    'starter_cards', 'starter_identities', 'starter_creature_cards',
    'starter_essence_cards', 'starter_tactic_cards', 'mythic_identities',
    'starbound_identities',
  ]) positiveInteger(contract[key], `tcg_element_package_contract_invalid:${key}`);

  const packageIds = new Set();
  const elements = new Set();
  for (const raw of manifest.packages) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('tcg_element_package_invalid');
    }
    const packageId = requiredString(raw.package_id, 'tcg_element_package_id_required');
    const element = requiredString(raw.element, `${packageId}: element required`);
    if (packageIds.has(packageId)) throw new Error(`tcg_element_package_id_duplicate:${packageId}`);
    if (elements.has(element)) throw new Error(`tcg_element_package_element_duplicate:${element}`);
    packageIds.add(packageId);
    elements.add(element);

    const state = requiredString(raw.state, `${packageId}: state required`);
    if (!['designed_pending_structure', 'structured'].includes(state)) {
      throw new Error(`${packageId}: unsupported package state ${state}`);
    }
    requiredString(raw.design_authority, `${packageId}: design authority required`);
    const source = raw.structured_candidate_file == null
      ? null
      : requiredString(raw.structured_candidate_file, `${packageId}: structured candidate file invalid`);
    if (state === 'structured' && !source) throw new Error(`${packageId}: structured package requires candidate file`);
    if (state !== 'structured' && source) throw new Error(`${packageId}: unstructured package cannot advertise candidate file`);
    validateStarter(raw.starter, packageId);
  }

  const targetCount = positiveInteger(manifest.current_target?.full_element_count, 'tcg_element_package_target_count_invalid');
  const starterCount = positiveInteger(manifest.current_target?.starter_count, 'tcg_element_package_target_starter_count_invalid');
  if (targetCount !== manifest.packages.length) {
    throw new Error(`tcg_element_package_target_count_mismatch:${targetCount}:${manifest.packages.length}`);
  }
  if (starterCount !== manifest.packages.length) {
    throw new Error(`tcg_element_package_target_starter_count_mismatch:${starterCount}:${manifest.packages.length}`);
  }
  return manifest;
}

export function loadElementPackageManifest(root = process.cwd()) {
  const file = path.join(root, ELEMENT_PACKAGE_MANIFEST_FILE);
  return validateElementPackageManifest(JSON.parse(fs.readFileSync(file, 'utf8')));
}

export function elementPackages(manifest) {
  return [...validateElementPackageManifest(manifest).packages];
}

export function structuredElementPackages(manifest) {
  return elementPackages(manifest).filter((pkg) => pkg.state === 'structured');
}

export function pendingElementPackages(manifest) {
  return elementPackages(manifest).filter((pkg) => pkg.state !== 'structured');
}

export function registryElementSourceFiles(manifest) {
  return structuredElementPackages(manifest).map((pkg) => pkg.structured_candidate_file);
}

export function registrySourceFiles(manifest) {
  const checked = validateElementPackageManifest(manifest);
  return [
    ...registryElementSourceFiles(checked),
    ...checked.set_anchor_sources.map((source, index) => requiredString(source, `tcg_element_package_anchor_source_invalid:${index}`)),
  ];
}

export function starterDescriptors(manifest) {
  return elementPackages(manifest).map((pkg) => ({
    package_id: pkg.package_id,
    element: pkg.element,
    ...validateStarter(pkg.starter, pkg.package_id),
  }));
}
