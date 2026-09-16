import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const controlPath = resolve(repoRoot, 'tcg-release-control-v1.json');
const control = JSON.parse(readFileSync(controlPath, 'utf8'));

function repoPath(pathname) {
  return relative(repoRoot, pathname).split('\\').join('/');
}

function gitBlobSha(pathname) {
  const bytes = readFileSync(pathname);
  return createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
}

function resolveImport(importer, specifier) {
  const clean = specifier.split(/[?#]/, 1)[0];
  const base = resolve(dirname(importer), clean);
  const candidates = extname(base) ? [base] : [base, `${base}.ts`, resolve(base, 'index.ts')];
  const found = candidates.find((candidate) => existsSync(candidate));
  assert.ok(found, `unresolved relative import ${specifier} from ${repoPath(importer)}`);
  assert.equal(found.startsWith(repoRoot), true, `relative import escaped repository: ${specifier}`);
  return found;
}

function directRelativeImports(pathname) {
  const source = readFileSync(pathname, 'utf8');
  const specs = new Set();
  for (const pattern of [
    /\bfrom\s+["'](\.[^"']+)["']/g,
    /\bimport\s*["'](\.[^"']+)["']/g,
    /\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g,
  ]) {
    for (const match of source.matchAll(pattern)) specs.add(match[1]);
  }
  return [...specs].map((specifier) => resolveImport(pathname, specifier));
}

function dependencyClosure(entrypoint) {
  const pending = [resolve(repoRoot, entrypoint)];
  const files = new Set();
  while (pending.length) {
    const pathname = pending.pop();
    if (files.has(pathname)) continue;
    files.add(pathname);
    pending.push(...directRelativeImports(pathname));
  }
  return [...files].sort((a, b) => repoPath(a).localeCompare(repoPath(b)));
}

function closureIdentity(entrypoint) {
  const files = dependencyClosure(entrypoint);
  const rows = files.map((pathname) => ({
    path: repoPath(pathname),
    git_blob_sha: gitBlobSha(pathname),
  }));
  const closureSha256 = createHash('sha256')
    .update(rows.map(({ path, git_blob_sha }) => `${path}:${git_blob_sha}\n`).join(''))
    .digest('hex');
  return { files: rows, closureSha256 };
}

test('release-control contract has one scope, one gate set and one current operation', () => {
  assert.equal(control.schema, 'stream-bandit-tcg-release-control-v1');
  assert.equal(control.control_revision, 1);
  assert.deepEqual(control.release.release_1_scope, {
    launch_elements: 8,
    structured_identities: 193,
    starter_decks: 8,
    owner_families: 40,
  });
  assert.equal(control.release.public_release, false);
  assert.deepEqual(control.gates.map(({ id }) => id), ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']);
  assert.deepEqual(control.private_alpha_baseline.map(({ id }) => id), ['PA-00', 'PA-01', 'PA-02', 'PA-03', 'PA-04', 'PA-05']);
  assert.equal(control.current_operation.id, 'PA-00');
  assert.equal(control.current_operation.decision, 'HOLD');
});

test('release-control static source fingerprints match repository bytes', () => {
  const fingerprints = [
    control.release.page,
    control.source_fingerprints.capability_manifest,
    control.source_fingerprints.element_packages,
    control.source_fingerprints.starter_decks,
  ];
  for (const fingerprint of fingerprints) {
    const pathname = resolve(repoRoot, fingerprint.path);
    assert.equal(gitBlobSha(pathname), fingerprint.git_blob_sha, `${fingerprint.path} fingerprint drifted`);
  }
});

test('all three Edge dependency closures match the exact manifest file set and hashes', () => {
  for (const [slug, expected] of Object.entries(control.source_fingerprints.edge_functions)) {
    const actual = closureIdentity(expected.entrypoint);
    assert.equal(actual.files.length, expected.file_count, `${slug} closure count drifted`);
    assert.equal(actual.closureSha256, expected.closure_sha256, `${slug} closure digest drifted`);
    assert.deepEqual(actual.files, expected.files, `${slug} exact dependency file set drifted`);
    assert.equal(gitBlobSha(resolve(repoRoot, expected.entrypoint)), expected.entrypoint_git_blob_sha, `${slug} entrypoint drifted`);
  }
});

test('master plan and append-only ledger name the same release-control revision', () => {
  const plan = readFileSync(resolve(repoRoot, 'tcg-master-plan-progress.md'), 'utf8');
  const ledger = readFileSync(resolve(repoRoot, 'tcg-master-plan-ledger.md'), 'utf8');
  const currentLedgerRules = ledger.slice(0, ledger.indexOf('## 40 owner families'));

  assert.match(plan, /Release Control v1 \/ private-alpha baseline after accepted RC-02c5/);
  assert.match(plan, /\*\*Release control:\*\* `tcg-release-control-v1\.json`/);
  assert.match(plan, /PA-00 🔎 \| PA-01 ☐ \| PA-02 ☐ \| PA-03 ☐ \| PA-04 ☐ \| PA-05 ☐/);
  assert.doesNotMatch(plan, /Control synchronization rule:/);

  assert.match(ledger, /\*\*Ledger revision:\*\* 6/);
  assert.match(ledger, /Ledger revision 6 \/ Release Control v1 \/ RC-02c5/);
  assert.match(currentLedgerRules, /same commit/);
  assert.doesNotMatch(currentLedgerRules, /synchronize both control files/);
});
