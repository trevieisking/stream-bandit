import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildWriterGitCasPlan,
  validateCreatedCommitProof,
  WRITER_GIT_CAS_EVIDENCE,
  WRITER_GIT_CAS_SEQUENCE,
} from './writer-git-cas-plan.mjs';

const A = 'a'.repeat(40);
const B = 'b'.repeat(40);
const C = 'c'.repeat(40);
const D = 'd'.repeat(40);
const CONTENT = 'export const safe = true;\n'.repeat(8);

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function fixture(overrides = {}) {
  const request = {
    repo: 'trevieisking/stream-bandit',
    path: 'code-labs/example.js',
    branch: 'fix/example',
    github_base_branch: 'main',
    github_head_branch: 'fix/example',
    github_base_sha: A,
    github_head_sha: B,
    github_head_branch_sha: B,
    github_branch_verified_at: '2026-07-28T12:00:00.000Z',
    expected_github_blob_absent: false,
    expected_github_blob_sha: C,
    expected_content_sha256: await sha256(CONTENT),
    action: 'create_or_update_file',
    content: CONTENT,
    commit_message: 'Update example safely',
    ...overrides.request,
  };
  const live = {
    repo: request.repo,
    branch: request.branch,
    base_sha: request.github_base_sha,
    head_sha: request.github_head_sha,
    merge_base_sha: request.github_base_sha,
    blob_absent: request.expected_github_blob_absent,
    blob_sha: request.expected_github_blob_sha,
    blob_type: 'blob',
    blob_mode: '100644',
    ...overrides.live,
  };
  return { request, live };
}

test('CAS plan binds the commit parent to the exact reviewed head and never force-updates', async () => {
  const { request, live } = await fixture();
  const plan = await buildWriterGitCasPlan(request, live);
  assert.deepEqual(plan.requests.create_commit.body.parents, [B]);
  assert.equal(plan.requests.update_ref.body.force, false);
  assert.equal(plan.expected_parent_sha, B);
});

test('CAS plan uses Git Database writes rather than Repository Contents writes', async () => {
  const { request, live } = await fixture();
  const plan = await buildWriterGitCasPlan(request, live);
  assert.equal(plan.requests.create_blob.path, '/git/blobs');
  assert.equal(plan.requests.create_tree.path, '/git/trees');
  assert.equal(plan.requests.create_commit.path, '/git/commits');
  assert.match(plan.requests.update_ref.path, /^\/git\/refs\/heads\//);
  assert.equal(plan.requests.read_target_blob.read_only, true);
});

test('CAS sequence claims first and verifies immutable evidence before creating Git objects', () => {
  assert.equal(WRITER_GIT_CAS_SEQUENCE[0], 'claim_request');
  assert.ok(WRITER_GIT_CAS_SEQUENCE.indexOf('read_reviewed_parent_tree') < WRITER_GIT_CAS_SEQUENCE.indexOf('verify_immutable_snapshot'));
  assert.ok(WRITER_GIT_CAS_SEQUENCE.indexOf('verify_immutable_snapshot') < WRITER_GIT_CAS_SEQUENCE.indexOf('create_blob'));
  assert.ok(WRITER_GIT_CAS_SEQUENCE.indexOf('create_commit_with_reviewed_parent') < WRITER_GIT_CAS_SEQUENCE.indexOf('update_ref_fast_forward_only'));
});

test('create_file requires immutable absence proof', async () => {
  const { request, live } = await fixture({ request: { action: 'create_file' } });
  await assert.rejects(() => buildWriterGitCasPlan(request, live), /requires proof that the target blob was absent/);
});

test('create_or_update_file rejects an absent target', async () => {
  const { request, live } = await fixture({
    request: { expected_github_blob_absent: true, expected_github_blob_sha: null },
    live: { blob_absent: true, blob_sha: null, blob_type: null, blob_mode: null },
  });
  await assert.rejects(() => buildWriterGitCasPlan(request, live), /requires an existing target blob proof/);
});

test('stale head is rejected before the plan creates Git objects', async () => {
  const { request, live } = await fixture({ live: { head_sha: D } });
  await assert.rejects(() => buildWriterGitCasPlan(request, live), /branch head changed after review/);
});

test('changed merge base is rejected', async () => {
  const { request, live } = await fixture({ live: { merge_base_sha: D } });
  await assert.rejects(() => buildWriterGitCasPlan(request, live), /reviewed base is not the current merge base/);
});

test('changed target blob is rejected', async () => {
  const { request, live } = await fixture({ live: { blob_sha: D } });
  await assert.rejects(() => buildWriterGitCasPlan(request, live), /Target blob changed after review/);
});

test('content hash mismatch is rejected', async () => {
  const { request, live } = await fixture({ request: { content: CONTENT + 'changed' } });
  await assert.rejects(() => buildWriterGitCasPlan(request, live), /content no longer matches/);
});

test('existing executable file mode is preserved', async () => {
  const { request, live } = await fixture({ live: { blob_mode: '100755' } });
  const plan = await buildWriterGitCasPlan(request, live);
  assert.equal(plan.expected_blob_mode, '100755');
  assert.equal(plan.requests.create_tree.body.tree[0].mode, '100755');
});

test('new files use the safe regular-file mode', async () => {
  const { request, live } = await fixture({
    request: { action: 'create_file', expected_github_blob_absent: true, expected_github_blob_sha: null },
    live: { blob_absent: true, blob_sha: null, blob_type: null, blob_mode: null },
  });
  const plan = await buildWriterGitCasPlan(request, live);
  assert.equal(plan.requests.create_tree.body.tree[0].mode, '100644');
});

test('symlink and submodule targets are rejected instead of replaced', async () => {
  for (const target of [
    { blob_type: 'blob', blob_mode: '120000' },
    { blob_type: 'commit', blob_mode: '160000' },
  ]) {
    const { request, live } = await fixture({ live: target });
    await assert.rejects(() => buildWriterGitCasPlan(request, live), /not a writable regular Git blob/);
  }
});

test('created commit proof must retain the exact reviewed parent', async () => {
  const { request, live } = await fixture();
  const plan = await buildWriterGitCasPlan(request, live);
  assert.throws(
    () => validateCreatedCommitProof(plan, { commit_sha: D, parent_sha: A, ref_sha: D }),
    /not bound to the reviewed branch head/,
  );
  assert.deepEqual(
    validateCreatedCommitProof(plan, { commit_sha: D, parent_sha: B, ref_sha: D }),
    { ok: true, commit_sha: D, parent_sha: B, ref_sha: D },
  );
});

test('ref conflict is classified as no branch write applied', async () => {
  const { request, live } = await fixture();
  const plan = await buildWriterGitCasPlan(request, live);
  assert.equal(plan.requests.update_ref.expected_conflict_means, 'branch_head_changed_no_write_applied');
  assert.equal(plan.safety.unreachable_objects_change_branch, false);
});

test('evidence boundary remains source-only', () => {
  assert.deepEqual(WRITER_GIT_CAS_EVIDENCE, {
    source_contract: true,
    github_runtime_tested: false,
    database_runtime_tested: false,
    deployed: false,
  });
});
