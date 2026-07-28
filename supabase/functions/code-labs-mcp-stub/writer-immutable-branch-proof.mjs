const SHA40 = /^[a-f0-9]{40}$/;
const SHA64 = /^[a-f0-9]{64}$/;
const PROTECTED = new Set(['main','master','production','live','gh-pages']);

function required(value, label) {
  const out = String(value ?? '').trim();
  if (!out) throw new Error(`${label} is required.`);
  return out;
}

function sha40(value, label) {
  const out = required(value, label).toLowerCase();
  if (!SHA40.test(out)) throw new Error(`${label} must be an exact 40-character Git SHA.`);
  return out;
}

function sha64(value, label) {
  const out = required(value, label).toLowerCase();
  if (!SHA64.test(out)) throw new Error(`${label} must be an exact SHA-256 hash.`);
  return out;
}

function safeBranch(value, label) {
  const out = required(value, label);
  if (!/^[A-Za-z0-9._/-]{3,80}$/.test(out) || out.startsWith('/') || out.endsWith('/') || out.includes('//') || out.includes('..') || PROTECTED.has(out.toLowerCase())) {
    throw new Error(`${label} is malformed or protected.`);
  }
  return out;
}

function safePath(value) {
  const out = required(value, 'path').replace(/^\/+/, '');
  if (out.startsWith('.') || out.includes('..') || out.includes('\\') || out.startsWith('.github/') || /\.(env|pem|key|p12|pfx)$/i.test(out)) {
    throw new Error('path is protected or unsafe.');
  }
  return out;
}

function exactTime(value, label) {
  const out = required(value, label);
  if (Number.isNaN(Date.parse(out))) throw new Error(`${label} is invalid.`);
  return out;
}

export function normaliseWriterBranchProof(request) {
  const branch = safeBranch(request.branch, 'branch');
  const baseBranch = required(request.github_base_branch, 'github_base_branch');
  const headBranch = safeBranch(request.github_head_branch, 'github_head_branch');
  if (headBranch !== branch) throw new Error('github_head_branch must equal branch.');
  if (headBranch === baseBranch) throw new Error('head and base branches must differ.');
  const baseSha = sha40(request.github_base_sha, 'github_base_sha');
  const headSha = sha40(request.github_head_sha, 'github_head_sha');
  const alias = request.github_head_branch_sha == null || request.github_head_branch_sha === ''
    ? headSha
    : sha40(request.github_head_branch_sha, 'github_head_branch_sha');
  if (alias !== headSha) throw new Error('github_head_branch_sha must match github_head_sha.');
  return {
    branch,
    path: safePath(request.path),
    base_branch: baseBranch,
    head_branch: headBranch,
    base_sha: baseSha,
    head_sha: headSha,
    head_branch_sha: alias,
    verified_at: exactTime(request.github_branch_verified_at, 'github_branch_verified_at'),
    expected_blob_absent: request.expected_github_blob_absent === true,
    expected_blob_sha: request.expected_github_blob_absent === true
      ? null
      : sha40(request.expected_github_blob_sha, 'expected_github_blob_sha'),
    expected_content_sha256: sha64(request.expected_content_sha256, 'expected_content_sha256'),
  };
}

export function verifyWriterExecutionSnapshot(request, live) {
  const proof = normaliseWriterBranchProof(request);
  const liveRepo = required(live.repo, 'live repo');
  const requestRepo = required(request.repo, 'request repo');
  if (liveRepo !== requestRepo) throw new Error('Live repository does not match the queued request.');
  const liveBranch = safeBranch(live.branch, 'live branch');
  if (liveBranch !== proof.head_branch) throw new Error('Live branch does not match the queued request.');
  const liveHead = sha40(live.head_sha, 'live head SHA');
  if (liveHead !== proof.head_sha) throw new Error('The branch head changed after review.');
  const liveBase = sha40(live.base_sha, 'live base SHA');
  if (liveBase !== proof.base_sha) throw new Error('The branch base changed after review.');
  if (live.merge_base_sha != null && sha40(live.merge_base_sha, 'live merge-base SHA') !== proof.base_sha) {
    throw new Error('The reviewed base is not the current merge base.');
  }
  const absent = live.blob_absent === true;
  const liveBlob = absent ? null : sha40(live.blob_sha, 'live blob SHA');
  if (absent !== proof.expected_blob_absent) throw new Error('Target blob presence changed after review.');
  if (!absent && liveBlob !== proof.expected_blob_sha) throw new Error('Target blob changed after review.');
  return { ok: true, proof, live: { repo: liveRepo, branch: liveBranch, head_sha: liveHead, base_sha: liveBase, blob_sha: liveBlob, blob_absent: absent } };
}

export const WRITER_BRANCH_PROOF_EVIDENCE = Object.freeze({
  source_contract: true,
  database_integration: false,
  github_race_closed: false,
  deployment_authorised: false,
});
