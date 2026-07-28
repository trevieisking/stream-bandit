import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normaliseWriterBranchProof,
  verifyWriterExecutionSnapshot,
  WRITER_BRANCH_PROOF_EVIDENCE,
} from './writer-immutable-branch-proof.mjs';

const A = 'a'.repeat(40);
const B = 'b'.repeat(40);
const C = 'c'.repeat(40);
const H = 'd'.repeat(64);

function request(overrides = {}) {
  return {
    repo: 'trevieisking/stream-bandit',
    path: 'supabase/functions/code-labs-mcp-stub/main.ts',
    branch: 'fix/example',
    github_base_branch: 'main',
    github_head_branch: 'fix/example',
    github_base_sha: A,
    github_head_sha: B,
    github_head_branch_sha: B,
    github_branch_verified_at: '2026-07-28T12:00:00Z',
    expected_github_blob_absent: false,
    expected_github_blob_sha: C,
    expected_content_sha256: H,
    ...overrides,
  };
}

function live(overrides = {}) {
  return {
    repo: 'trevieisking/stream-bandit',
    branch: 'fix/example',
    base_sha: A,
    merge_base_sha: A,
    head_sha: B,
    blob_absent: false,
    blob_sha: C,
    ...overrides,
  };
}

test('accepts exact immutable branch proof', () => {
  const out = normaliseWriterBranchProof(request());
  assert.equal(out.base_sha, A);
  assert.equal(out.head_sha, B);
});

test('fills the compatibility alias from github_head_sha', () => {
  const out = normaliseWriterBranchProof(request({ github_head_branch_sha: null }));
  assert.equal(out.head_branch_sha, B);
});

test('rejects a protected head branch', () => {
  assert.throws(
    () => normaliseWriterBranchProof(request({ branch: 'main', github_head_branch: 'main' })),
    /protected/,
  );
});

test('rejects mismatched head branch name', () => {
  assert.throws(
    () => normaliseWriterBranchProof(request({ github_head_branch: 'fix/other' })),
    /must equal branch/,
  );
});

test('rejects mismatched compatibility alias', () => {
  assert.throws(
    () => normaliseWriterBranchProof(request({ github_head_branch_sha: C })),
    /must match/,
  );
});

test('accepts a matching live execution snapshot', () => {
  assert.equal(verifyWriterExecutionSnapshot(request(), live()).ok, true);
});

test('rejects a stale live branch head', () => {
  assert.throws(
    () => verifyWriterExecutionSnapshot(request(), live({ head_sha: C })),
    /head changed/,
  );
});

test('rejects a changed base SHA', () => {
  assert.throws(
    () => verifyWriterExecutionSnapshot(request(), live({ base_sha: C })),
    /base changed/,
  );
});

test('rejects a wrong merge base', () => {
  assert.throws(
    () => verifyWriterExecutionSnapshot(request(), live({ merge_base_sha: C })),
    /merge base/,
  );
});

test('rejects a changed target blob', () => {
  assert.throws(
    () => verifyWriterExecutionSnapshot(request(), live({ blob_sha: A })),
    /blob changed/,
  );
});

test('rejects changed target presence', () => {
  assert.throws(
    () => verifyWriterExecutionSnapshot(request(), live({ blob_absent: true, blob_sha: null })),
    /presence changed/,
  );
});

test('records the remaining evidence boundary', () => {
  assert.equal(WRITER_BRANCH_PROOF_EVIDENCE.source_contract, true);
  assert.equal(WRITER_BRANCH_PROOF_EVIDENCE.database_integration, false);
  assert.equal(WRITER_BRANCH_PROOF_EVIDENCE.github_race_closed, false);
  assert.equal(WRITER_BRANCH_PROOF_EVIDENCE.deployment_authorised, false);
});
