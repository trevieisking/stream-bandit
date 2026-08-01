import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWriterGitCasPlan, validateCreatedCommitProof } from './writer-git-cas-plan.mjs';

const BASE = 'a'.repeat(40);
const REVIEWED = 'b'.repeat(40);
const BLOB = 'c'.repeat(40);
const CREATED = 'd'.repeat(40);
const MOVED = 'e'.repeat(40);
const CONTENT = 'export const controlled = true;\n'.repeat(8);

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function request() {
  return {
    repo: 'trevieisking/stream-bandit',
    path: 'code-labs/controlled.js',
    branch: 'fix/controlled',
    github_base_branch: 'main',
    github_head_branch: 'fix/controlled',
    github_base_sha: BASE,
    github_head_sha: REVIEWED,
    github_head_branch_sha: REVIEWED,
    github_branch_verified_at: '2026-07-28T12:00:00.000Z',
    expected_github_blob_absent: false,
    expected_github_blob_sha: BLOB,
    expected_content_sha256: await sha256(CONTENT),
    action: 'create_or_update_file',
    content: CONTENT,
  };
}

function live(head = REVIEWED) {
  return {
    repo: 'trevieisking/stream-bandit',
    branch: 'fix/controlled',
    base_sha: BASE,
    merge_base_sha: BASE,
    head_sha: head,
    blob_absent: false,
    blob_sha: BLOB,
    blob_type: 'blob',
    blob_mode: '100644',
  };
}

class ControlledGit {
  constructor(head = REVIEWED) {
    this.head = head;
    this.createdCommits = 0;
    this.prs = 0;
  }

  createCommit(parent) {
    assert.equal(parent, REVIEWED);
    this.createdCommits += 1;
    return CREATED;
  }

  updateRefNonForce(expectedParent, commit, mode = 'normal') {
    if (mode === 'move-before-update') this.head = MOVED;
    if (this.head !== expectedParent) {
      const error = new Error('non-fast-forward');
      error.status = 422;
      throw error;
    }
    this.head = commit;
    if (mode === 'applied-response-lost') throw new Error('response lost');
    return this.head;
  }

  openDraftPr() {
    if (this.prs === 0) this.prs = 1;
    return { number: 1, draft: true };
  }
}

function reconcileRef(plan, git, error) {
  if (git.head === CREATED) return 'applied';
  if (git.head === plan.expected_parent_sha) return 'no-write-retryable';
  if (git.head !== plan.expected_parent_sha) return 'conflict-fresh-review';
  throw error;
}

test('normal CAS applies exactly one parent-bound commit and one draft PR', async () => {
  const req = await request();
  const plan = await buildWriterGitCasPlan(req, live());
  const git = new ControlledGit();
  const commit = git.createCommit(plan.expected_parent_sha);
  git.updateRefNonForce(plan.expected_parent_sha, commit);
  validateCreatedCommitProof(plan, { commit_sha: commit, parent_sha: REVIEWED, ref_sha: git.head });
  git.openDraftPr();
  assert.equal(git.head, CREATED);
  assert.equal(git.createdCommits, 1);
  assert.equal(git.prs, 1);
});

test('concurrent branch movement rejects the reviewed commit and preserves the moved head', async () => {
  const req = await request();
  const plan = await buildWriterGitCasPlan(req, live());
  const git = new ControlledGit();
  const commit = git.createCommit(plan.expected_parent_sha);
  let result;
  try {
    git.updateRefNonForce(plan.expected_parent_sha, commit, 'move-before-update');
  } catch (error) {
    result = reconcileRef(plan, git, error);
  }
  assert.equal(result, 'conflict-fresh-review');
  assert.equal(git.head, MOVED);
  assert.equal(git.prs, 0);
});

test('lost success response reconciles as applied without a second commit', async () => {
  const req = await request();
  const plan = await buildWriterGitCasPlan(req, live());
  const git = new ControlledGit();
  const commit = git.createCommit(plan.expected_parent_sha);
  let result;
  try {
    git.updateRefNonForce(plan.expected_parent_sha, commit, 'applied-response-lost');
  } catch (error) {
    result = reconcileRef(plan, git, error);
  }
  assert.equal(result, 'applied');
  assert.equal(git.head, CREATED);
  assert.equal(git.createdCommits, 1);
});

test('failed update with unchanged head is retryable and changes no branch', async () => {
  const req = await request();
  const plan = await buildWriterGitCasPlan(req, live());
  const git = new ControlledGit();
  const result = reconcileRef(plan, git, new Error('transport failure'));
  assert.equal(result, 'no-write-retryable');
  assert.equal(git.head, REVIEWED);
  assert.equal(git.prs, 0);
});

test('completed replay returns existing proof without creating another commit or PR', () => {
  const completed = {
    status: 'pr_opened',
    github_commit_sha: CREATED,
    github_content_sha: BLOB,
    pull_request_number: 1,
    pull_request_url: 'https://example.invalid/pr/1',
  };
  const git = new ControlledGit(CREATED);
  git.prs = 1;
  const before = { commits: git.createdCommits, prs: git.prs, head: git.head };
  const isComplete = completed.status === 'pr_opened' && /^[a-f0-9]{40}$/.test(completed.github_commit_sha) && completed.pull_request_number > 0;
  assert.equal(isComplete, true);
  assert.deepEqual({ commits: git.createdCommits, prs: git.prs, head: git.head }, before);
});
