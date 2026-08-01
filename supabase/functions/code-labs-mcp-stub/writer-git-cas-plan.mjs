import { verifyWriterExecutionSnapshot } from './writer-immutable-branch-proof.mjs';

const MAX_CONTENT = 180000;
const SHA40 = /^[a-f0-9]{40}$/;
const WRITABLE_BLOB_MODES = new Set(['100644', '100755']);

function required(value, label) {
  const output = String(value ?? '').trim();
  if (!output) throw new Error(`${label} is required.`);
  return output;
}

async function sha256Text(value) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(String(value ?? '')),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function encodeRef(branch) {
  return branch.split('/').map(encodeURIComponent).join('/');
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function targetMode(proof, live) {
  if (proof.expected_blob_absent) return '100644';
  const type = required(live.blob_type, 'live target type');
  const mode = required(live.blob_mode, 'live target mode');
  if (type !== 'blob' || !WRITABLE_BLOB_MODES.has(mode)) {
    throw new Error('The existing target is not a writable regular Git blob.');
  }
  return mode;
}

export const WRITER_GIT_CAS_SEQUENCE = Object.freeze([
  'claim_request',
  'reload_claimed_request',
  'read_head_ref',
  'read_reviewed_parent_commit',
  'read_reviewed_parent_tree',
  'read_target_blob',
  'verify_immutable_snapshot',
  'create_blob',
  'create_tree_from_reviewed_parent',
  'create_commit_with_reviewed_parent',
  'update_ref_fast_forward_only',
  'verify_updated_ref',
  'open_or_reuse_draft_pr',
  'finalise_receipt',
]);

export async function buildWriterGitCasPlan(request, live) {
  const snapshot = verifyWriterExecutionSnapshot(request, live);
  const proof = snapshot.proof;
  const content = String(request.content ?? '');
  if (!content || content.length > MAX_CONTENT) {
    throw new Error('A complete file under the Writer queue limit is required.');
  }
  const contentHash = await sha256Text(content);
  if (contentHash !== proof.expected_content_sha256) {
    throw new Error('Queued content no longer matches its immutable SHA-256 proof.');
  }

  const action = required(request.action, 'request action');
  if (!['create_file', 'create_or_update_file'].includes(action)) {
    throw new Error('Writer action is not supported by the atomic commit route.');
  }
  if (action === 'create_file' && !proof.expected_blob_absent) {
    throw new Error('create_file requires proof that the target blob was absent.');
  }
  if (action === 'create_or_update_file' && proof.expected_blob_absent) {
    throw new Error('create_or_update_file requires an existing target blob proof.');
  }

  const repository = required(request.repo, 'repository');
  const branchRef = `heads/${encodeRef(proof.head_branch)}`;
  const path = encodePath(proof.path);
  const mode = targetMode(proof, live);

  return {
    version: 'writer-git-cas-v2',
    repository,
    branch: proof.head_branch,
    path: proof.path,
    expected_parent_sha: proof.head_sha,
    expected_base_sha: proof.base_sha,
    expected_blob_sha: proof.expected_blob_sha,
    expected_blob_absent: proof.expected_blob_absent,
    expected_blob_mode: mode,
    expected_content_sha256: proof.expected_content_sha256,
    sequence: [...WRITER_GIT_CAS_SEQUENCE],
    requests: {
      read_head_ref: {
        method: 'GET',
        path: `/git/ref/${branchRef}`,
        expect_object_sha: proof.head_sha,
      },
      read_parent_commit: {
        method: 'GET',
        path: `/git/commits/${proof.head_sha}`,
        expect_commit_sha: proof.head_sha,
      },
      read_parent_tree: {
        method: 'GET',
        path: '/git/trees/$reviewed_parent_tree_sha?recursive=1',
        expect_target_mode: mode,
        expect_target_type: 'blob',
      },
      read_target_blob: {
        method: 'GET',
        path: `/contents/${path}?ref=${encodeURIComponent(proof.head_sha)}`,
        read_only: true,
        expect_blob_sha: proof.expected_blob_sha,
        expect_absent: proof.expected_blob_absent,
      },
      create_blob: {
        method: 'POST',
        path: '/git/blobs',
        body: { content, encoding: 'utf-8' },
      },
      create_tree: {
        method: 'POST',
        path: '/git/trees',
        body: {
          base_tree: '$reviewed_parent_tree_sha',
          tree: [{
            path: proof.path,
            mode,
            type: 'blob',
            sha: '$created_blob_sha',
          }],
        },
      },
      create_commit: {
        method: 'POST',
        path: '/git/commits',
        body: {
          message: String(request.commit_message || `Code Labs update ${proof.path}`).slice(0, 240),
          tree: '$created_tree_sha',
          parents: [proof.head_sha],
        },
      },
      update_ref: {
        method: 'PATCH',
        path: `/git/refs/${branchRef}`,
        body: { sha: '$created_commit_sha', force: false },
        expected_conflict_means: 'branch_head_changed_no_write_applied',
      },
      verify_ref: {
        method: 'GET',
        path: `/git/ref/${branchRef}`,
        expect_object_sha: '$created_commit_sha',
      },
    },
    safety: {
      writes_main: false,
      force_update: false,
      deletes_anything: false,
      modifies_workflows: false,
      one_complete_file: true,
      preserves_existing_file_mode: true,
      rejects_symlink_or_submodule_targets: true,
      unreachable_objects_possible_after_ref_conflict: true,
      unreachable_objects_change_branch: false,
    },
  };
}

export function validateCreatedCommitProof(plan, result) {
  const commitSha = required(result.commit_sha, 'created commit SHA').toLowerCase();
  const parentSha = required(result.parent_sha, 'created commit parent SHA').toLowerCase();
  const refSha = required(result.ref_sha, 'updated ref SHA').toLowerCase();
  if (!SHA40.test(commitSha) || !SHA40.test(parentSha) || !SHA40.test(refSha)) {
    throw new Error('Git commit proof contains an invalid SHA.');
  }
  if (parentSha !== plan.expected_parent_sha) {
    throw new Error('Created commit is not bound to the reviewed branch head.');
  }
  if (refSha !== commitSha) {
    throw new Error('Branch reference does not point to the created commit.');
  }
  return { ok: true, commit_sha: commitSha, parent_sha: parentSha, ref_sha: refSha };
}

export const WRITER_GIT_CAS_EVIDENCE = Object.freeze({
  source_contract: true,
  github_runtime_tested: false,
  database_runtime_tested: false,
  deployed: false,
});
