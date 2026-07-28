import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const writerUrl = new URL('./github-writer.ts', import.meta.url);

async function writerSource() {
  return await readFile(writerUrl, 'utf8');
}

function position(source, marker, label) {
  const index = source.indexOf(marker);
  assert.ok(index >= 0, `${label} is missing: ${marker}`);
  return index;
}

test('V50 Writer imports the immutable snapshot and Git CAS route', async () => {
  const source = await writerSource();
  assert.match(source, /writer-immutable-branch-proof\.mjs/);
  assert.match(source, /writer-git-cas-plan\.mjs/);
  assert.match(source, /verifyWriterExecutionSnapshot/);
  assert.match(source, /buildWriterGitCasPlan/);
  assert.match(source, /validateCreatedCommitProof/);
});

test('V50 Writer no longer commits through Repository Contents PUT', async () => {
  const source = await writerSource();
  assert.doesNotMatch(
    source,
    /repoPath\s*\+\s*["'`]\/contents\/[\s\S]{0,900}method:\s*["'`]PUT["'`]/,
    'Repository Contents PUT cannot atomically bind the commit parent to the reviewed branch head.',
  );
});

test('V50 Writer creates a parent-bound commit and updates the branch without force', async () => {
  const source = await writerSource();
  for (const marker of [
    '/git/blobs',
    '/git/trees',
    '/git/commits',
    '/git/refs/heads/',
    'force: false',
    'parents: [plan.expected_parent_sha]',
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('V50 Writer claims once and rechecks immutable proof before creating Git objects', async () => {
  const source = await writerSource();
  const claim = position(source, 'const request = await claimRequest(', 'Writer claim');
  const snapshot = position(source, 'verifyWriterExecutionSnapshot(request, live);', 'Immutable snapshot verification');
  const createBlob = position(source, 'repoPath + "/git/blobs"', 'Git blob creation');
  const updateRef = position(source, 'repoPath + "/git/refs/heads/"', 'Git ref update');
  assert.ok(snapshot > claim, 'Immutable live proof must be checked after the request is claimed.');
  assert.ok(createBlob > snapshot, 'No Git object may be created before immutable live proof passes.');
  assert.ok(updateRef > createBlob, 'The reference update must follow object creation.');
});

test('V50 Writer verifies base, head, merge base, blob identity, type and mode', async () => {
  const source = await writerSource();
  for (const marker of [
    'const baseSha = exactSha(',
    'const headSha = exactSha(',
    'comparison?.merge_base_commit?.sha',
    'blob_absent: entry == null',
    'blob_sha: entry == null ? null : exactSha(entry.sha',
    'blob_mode: entry == null ? null : String(entry.mode',
    'blob_type: entry == null ? null : String(entry.type',
    'tree?.truncated',
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('V50 Writer preflights the draft PR route before Git object creation and before ref advance', async () => {
  const source = await writerSource();
  const firstPreflight = position(source, 'stage = "pr_preflight";', 'First PR preflight');
  const createBlob = position(source, 'stage = "git_blob";', 'Git blob stage');
  const secondPreflight = source.indexOf('stage = "pr_preflight";', firstPreflight + 1);
  const refUpdate = position(source, 'stage = "ref_update_no_write";', 'Reference update stage');
  assert.ok(firstPreflight < createBlob, 'The draft PR route must be checked before creating Git objects.');
  assert.ok(secondPreflight > createBlob, 'The draft PR route must be checked again after commit creation.');
  assert.ok(secondPreflight < refUpdate, 'The final PR-state check must occur before branch advancement.');
  assert.match(source, /pull\.draft !== true/);
  assert.match(source, /pulls\.length > 1/);
});

test('V50 Writer preserves file mode and rejects unsafe Git object targets through the CAS plan', async () => {
  const source = await writerSource();
  assert.match(source, /target_blob_mode: plan\.expected_blob_mode/);
  assert.match(source, /mode: plan\.expected_blob_mode/);
  assert.match(source, /buildWriterGitCasPlan\(request, live\)/);
});

test('V50 Writer reconciles ambiguous non-forced ref updates without overwriting a moved branch', async () => {
  const source = await writerSource();
  assert.match(source, /force: false/);
  assert.match(source, /if \(reconciledSha === createdCommitSha\)/);
  assert.match(source, /else if \(reconciledSha === plan\.expected_parent_sha\)/);
  assert.match(source, /stage = "ref_update_conflict"/);
  assert.match(source, /stage = "ref_update_unknown"/);
});

test('V50 Writer persists commit proof before pull-request work', async () => {
  const source = await writerSource();
  const checkpoint = position(source, 'await persistCommitCheckpoint(', 'Commit checkpoint');
  const draftPr = position(source, 'stage = "draft_pr";', 'Draft PR stage');
  assert.ok(checkpoint < draftPr, 'Durable commit proof must be saved before opening or reusing a PR.');
  assert.match(source, /writer_phase: "github_committed"/);
});

test('V50 Writer retains one-file, non-main, draft-only and no-force safeguards', async () => {
  const source = await writerSource();
  assert.match(source, /pending\.direct_main_write !== false/);
  assert.match(source, /pending\.branch_pr_only !== true/);
  assert.match(source, /pending\.deletes_anything !== false/);
  assert.match(source, /draft: true/);
  assert.match(source, /maintainer_can_modify: false/);
  assert.doesNotMatch(source, /force:\s*true/);
});

test('evidence boundary: the routing gate is green source evidence, not runtime proof', () => {
  const evidence = {
    source_gate: true,
    current_writer_expected_to_pass: true,
    github_runtime: false,
    database_runtime: false,
    deployment_authorised: false,
  };
  assert.equal(evidence.source_gate, true);
  assert.equal(evidence.current_writer_expected_to_pass, true);
  assert.equal(evidence.github_runtime, false);
  assert.equal(evidence.database_runtime, false);
  assert.equal(evidence.deployment_authorised, false);
});
