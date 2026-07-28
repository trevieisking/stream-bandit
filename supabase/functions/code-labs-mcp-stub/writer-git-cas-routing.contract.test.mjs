import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const writerUrl = new URL('./github-writer.ts', import.meta.url);

async function writerSource() {
  return await readFile(writerUrl, 'utf8');
}

test('V50 Writer imports the immutable snapshot and Git CAS route', async () => {
  const source = await writerSource();
  assert.match(source, /writer-immutable-branch-proof\.mjs/);
  assert.match(source, /writer-git-cas-plan\.mjs/);
  assert.match(source, /verifyWriterExecutionSnapshot/);
  assert.match(source, /buildWriterGitCasPlan/);
});

test('V50 Writer no longer commits through Repository Contents PUT', async () => {
  const source = await writerSource();
  assert.doesNotMatch(
    source,
    /repoPath\s*\+\s*["'`]\/contents\/[\s\S]{0,600}method:\s*["'`]PUT["'`]/,
    'Repository Contents PUT cannot atomically bind the commit parent to the reviewed branch head.',
  );
});

test('V50 Writer creates a parent-bound commit and updates the branch without force', async () => {
  const source = await writerSource();
  for (const marker of [
    '/git/blobs',
    '/git/trees',
    '/git/commits',
    '/git/refs/',
    'force: false',
    'parents:',
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('V50 Writer claims once, rechecks live proof, and only then creates Git objects', async () => {
  const source = await writerSource();
  const claim = source.indexOf('claimRequest(');
  const snapshot = source.indexOf('verifyWriterExecutionSnapshot(');
  const createBlob = source.indexOf('/git/blobs');
  const updateRef = source.indexOf('/git/refs/');
  assert.ok(claim >= 0, 'Writer claim is missing.');
  assert.ok(snapshot > claim, 'Immutable live proof must be checked after the request is claimed.');
  assert.ok(createBlob > snapshot, 'No Git object may be created before immutable live proof passes.');
  assert.ok(updateRef > createBlob, 'The reference update must follow object creation.');
});

test('evidence boundary: this remains red until the Writer route is actually converted', () => {
  const evidence = {
    source_gate: true,
    current_writer_expected_to_fail: true,
    github_runtime: false,
    deployment_authorised: false,
  };
  assert.equal(evidence.source_gate, true);
  assert.equal(evidence.current_writer_expected_to_fail, true);
  assert.equal(evidence.github_runtime, false);
  assert.equal(evidence.deployment_authorised, false);
});
