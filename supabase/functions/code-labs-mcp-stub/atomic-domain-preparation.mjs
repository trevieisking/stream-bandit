const HASH_VERSION = "sha256-utf8-v1";
const HANDOFF_HASH_VERSION = "canonical-json-v1";
const INDEPENDENT_EVIDENCE_KIND = "master-checklist-independent-gate-v1";
const CODE_GOD_TRUST_STATE = "HOLD_UNTRUSTED_ADVISORY";
const MAX_QUEUE_CONTENT = 180000;
const PROTECTED_BRANCHES = new Set(["main", "master", "production", "live", "gh-pages"]);

export const ATOMIC_DOMAIN_PREPARATION_COVERAGE = Object.freeze({
  prepared: Object.freeze([
    "repo.prepare_handoff",
    "code_god.review",
    "github.writer_prepare",
  ]),
  external_evidence_required: Object.freeze([
    "owner_repository_authority",
    "immutable_branch_proof",
    "active_queue_snapshot",
    "target_blob_snapshot",
    "independent_review_checkpoint_receipt",
  ]),
  schema_binding_required_before_cutover: Object.freeze([
    "github_base_sha",
    "github_head_sha",
    "code_god_scope_outcome",
    "independent_evidence_checkpoint_id",
    "independent_evidence_receipt_id",
    "safety_note",
  ]),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function requiredText(value, label, max = 20000) {
  const output = String(value ?? "").trim();
  if (!output || output.length > max) throw new Error(`${label} is required.`);
  return output;
}

function exactSha(value, label) {
  const output = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(output)) throw new Error(`${label} must be an exact 40-character Git SHA.`);
  return output;
}

function exactHash(value, label) {
  const output = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(output)) throw new Error(`${label} must be an exact SHA-256 hash.`);
  return output;
}

function exactUuid(value, label) {
  const output = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(output)) {
    throw new Error(`${label} must be an exact UUID.`);
  }
  return output;
}

function exactTime(value, label) {
  const output = String(value || "").trim();
  if (!output || Number.isNaN(Date.parse(output))) throw new Error(`${label} is required.`);
  return output;
}

function safeRepo(value) {
  const repo = requiredText(value, "repository", 200);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("Repository must use owner/name form.");
  }
  return repo;
}

function safePath(value) {
  const path = requiredText(value, "target path", 500).replace(/^\/+/, "");
  if (
    path.startsWith(".") || path.includes("..") || path.includes("\\") ||
    path.toLowerCase().includes("secrets") || path.startsWith(".github/") ||
    /\.(?:env|pem|key|p12|pfx)$/i.test(path)
  ) {
    throw new Error("Target path is protected or unsafe.");
  }
  return path;
}

function safeBranch(value) {
  const branch = requiredText(value, "working branch", 80);
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) || branch.startsWith("/") ||
    branch.endsWith("/") || branch.includes("//") || branch.includes("..") ||
    PROTECTED_BRANCHES.has(branch.toLowerCase())
  ) {
    throw new Error("Working branch is missing, malformed or protected.");
  }
  return branch;
}

function normalizeAction(value) {
  const action = String(value || "change").trim().toLowerCase();
  if (action === "create") return "add";
  if (action === "delete") return "remove";
  if (action === "add" || action === "change") return action;
  throw new Error("Repo handoff requires an add or change action.");
}

function completeFile(path, value) {
  const content = String(value || "");
  if (!content.trim() || content.length < 120 || content.length > MAX_QUEUE_CONTENT) return false;
  if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(content)) return false;
  if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(content)) return false;
  if (/\.html?$/i.test(path) && !/<!doctype\s+html/i.test(content) && !/<html[\s>]/i.test(content)) return false;
  if (/\.json$/i.test(path)) {
    try {
      JSON.parse(content);
    } catch {
      return false;
    }
  }
  return true;
}

function secretLike(value) {
  const text = String(value || "");
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text) ||
    /\bsk-[A-Za-z0-9_-]{20,}\b/.test(text) ||
    /\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(text) ||
    /\bBearer\s+[A-Za-z0-9._~-]{30,}\b/i.test(text) ||
    /(?:password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i.test(text);
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalValue(value));
}

export async function hashUtf8Text(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value ?? "")));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashCanonicalJson(value) {
  return await hashUtf8Text(canonicalJson(value));
}

function verifiedAuthority(context, expectedRepo) {
  const authority = object(context.authority, "owner repository authority");
  if (authority.verified !== true) throw new Error("Owner repository authority is not verified.");
  const repo = safeRepo(authority.repo);
  if (repo !== expectedRepo) throw new Error("Owner repository authority does not match the selected repository.");
  return {
    repo,
    default_branch: requiredText(authority.default_branch, "default branch", 200),
    source_commit_sha: exactSha(authority.source_commit_sha, "source commit SHA"),
    verified_at: exactTime(authority.verified_at, "authority verification time"),
  };
}

function verifiedBranch(context, expectedRepo, expectedBranch) {
  const proof = object(context.branch_proof, "immutable branch proof");
  if (proof.verified !== true) throw new Error("Immutable branch proof is not verified.");
  const repo = safeRepo(proof.repo);
  const branch = safeBranch(proof.branch);
  if (repo !== expectedRepo || branch !== expectedBranch) {
    throw new Error("Immutable branch proof does not match the requested repository and branch.");
  }
  return {
    repo,
    branch,
    base_branch: requiredText(proof.base_branch, "base branch", 200),
    base_sha: exactSha(proof.base_sha, "base SHA"),
    head_sha: exactSha(proof.head_sha, "head SHA"),
    verified_at: exactTime(proof.verified_at, "branch verification time"),
  };
}

function queueSnapshot(context, expected) {
  const snapshot = object(context.queue_snapshot, "active queue snapshot");
  if (snapshot.complete !== true) throw new Error("Active queue evidence is incomplete.");
  if (
    safeRepo(snapshot.repo) !== expected.repo || safePath(snapshot.path) !== expected.path ||
    safeBranch(snapshot.branch) !== expected.branch
  ) {
    throw new Error("Active queue evidence does not match the reviewed target.");
  }
  const active = Number(snapshot.active_matching_requests);
  if (!Number.isSafeInteger(active) || active < 0) throw new Error("Active queue count is invalid.");
  return { active_matching_requests: active, captured_at: exactTime(snapshot.captured_at, "queue snapshot time") };
}

function blobSnapshot(context, expected) {
  const snapshot = object(context.blob_snapshot, "target blob snapshot");
  if (snapshot.complete !== true) throw new Error("Target blob evidence is incomplete.");
  if (
    safeRepo(snapshot.repo) !== expected.repo || safePath(snapshot.path) !== expected.path ||
    safeBranch(snapshot.branch) !== expected.branch || exactSha(snapshot.head_sha, "blob snapshot head SHA") !== expected.head_sha
  ) {
    throw new Error("Target blob evidence does not match the reviewed branch head.");
  }
  const absent = snapshot.absent === true;
  const blobSha = absent ? null : exactSha(snapshot.blob_sha, "target blob SHA");
  if (absent && snapshot.blob_sha != null && String(snapshot.blob_sha) !== "") {
    throw new Error("An absent target blob cannot also have a blob SHA.");
  }
  return { absent, blob_sha: blobSha, captured_at: exactTime(snapshot.captured_at, "blob snapshot time") };
}

function independentEvidenceIds(args) {
  const fields = object(args.fields, "Writer preparation fields");
  return {
    kind: INDEPENDENT_EVIDENCE_KIND,
    checkpoint_id: exactUuid(
      fields.independent_evidence_checkpoint_id,
      "independent evidence checkpoint id",
    ),
    receipt_id: exactUuid(
      fields.independent_evidence_receipt_id,
      "independent evidence receipt id",
    ),
  };
}

function receiptEffect(recordId, changedFields) {
  return {
    kind: "receipt_insert",
    key: "receipt",
    record_type: "file",
    record_id: recordId,
    changed_fields: [...changedFields],
    created_new_row: false,
    undo_available: false,
  };
}

function recordUpdate(file, metadata) {
  return {
    kind: "record_update",
    key: "record",
    record_type: "file",
    record_id: requiredText(file.id, "selected file id", 100),
    expected_updated_at: exactTime(file.updated_at, "selected file updated_at"),
    patch: { metadata },
  };
}

function marker(handoff) {
  return {
    version: handoff.version,
    action: handoff.action,
    repo: handoff.repo,
    source_repo: handoff.source_repo,
    source_branch: handoff.source_branch,
    source_commit_sha: handoff.source_commit_sha,
    request_branch: handoff.request_branch,
    github_base_branch: handoff.github_base_branch,
    github_base_sha: handoff.github_base_sha,
    github_head_branch: handoff.github_head_branch,
    github_head_sha: handoff.github_head_sha,
    path: handoff.path,
    source_file_id: handoff.source_file_id,
    current_hash: handoff.current_hash,
    proposed_hash: handoff.proposed_hash,
    hash_version: handoff.hash_version,
    created_at: handoff.created_at,
  };
}

export async function prepareRepoHandoffAtomic(argsValue, contextValue) {
  const args = object(argsValue || {}, "Repo handoff arguments");
  const context = object(contextValue || {}, "Repo handoff context");
  const project = object(context.project, "selected project");
  const file = object(context.file, "selected file");
  const job = context.job && typeof context.job === "object" ? context.job : {};
  const fields = args.fields && typeof args.fields === "object" ? args.fields : {};
  const repo = safeRepo(fields.repo || project.repo);
  if (safeRepo(project.repo) !== repo) throw new Error("The selected project and requested repository do not match.");
  const branch = safeBranch(fields.branch);
  const authority = verifiedAuthority(context, repo);
  const branchProof = verifiedBranch(context, repo, branch);
  if (branchProof.base_branch !== authority.default_branch || branchProof.base_sha !== authority.source_commit_sha) {
    throw new Error("Branch proof does not descend from the verified source commit.");
  }
  const path = safePath(fields.path || file.metadata?.source_path || file.filename);
  const proposed = String(fields.content ?? file.metadata?.fixed_output ?? "");
  if (!completeFile(path, proposed)) throw new Error("A complete proposed file under 180000 characters is required.");
  const original = String(file.current_code || "");
  const now = exactTime(context.now, "preparation time");
  const handoff = {
    version: "V50-repo-handoff-1",
    action: normalizeAction(fields.action),
    repo,
    source_repo: repo,
    source_branch: authority.default_branch,
    source_commit_sha: authority.source_commit_sha,
    request_branch: branch,
    github_base_branch: branchProof.base_branch,
    github_base_sha: branchProof.base_sha,
    github_head_branch: branchProof.branch,
    github_head_sha: branchProof.head_sha,
    branch_verified_at: branchProof.verified_at,
    path,
    source_file_id: requiredText(file.id, "selected file id", 100),
    original,
    proposed,
    notes: String(fields.notes || job.problem || "").slice(0, 12000),
    preserve: String(job.dont_touch || "").slice(0, 12000),
    current_hash: await hashUtf8Text(original),
    proposed_hash: await hashUtf8Text(proposed),
    hash_version: HASH_VERSION,
    created_at: now,
  };
  const metadata = clone(file.metadata || {});
  metadata.repo_handoff = handoff;
  delete metadata.code_god_review;
  delete metadata.github_writer_request;

  return {
    action: "repo.prepare_handoff",
    payload: {
      effects: [recordUpdate(file, metadata), receiptEffect(String(file.id), ["metadata"])],
      response: {
        tool: "run_code_labs_action",
        action: "repo.prepare_handoff",
        mutation_engine: "atomic-v50",
        handoff: marker(handoff),
      },
    },
    handoff,
  };
}

function finding(severity, rule_id, message, correction, blocks_github = true) {
  return { severity, rule_id, message, correction, blocks_github };
}

export async function prepareCodeGodAtomic(_argsValue, contextValue) {
  const context = object(contextValue || {}, "Code God context");
  const file = object(context.file, "selected file");
  const metadata = clone(file.metadata || {});
  const handoff = object(metadata.repo_handoff, "Repo handoff");
  const repo = safeRepo(handoff.repo);
  const branch = safeBranch(handoff.request_branch);
  const authority = verifiedAuthority(context, repo);
  const branchProof = verifiedBranch(context, repo, branch);
  const queue = queueSnapshot(context, { repo, path: safePath(handoff.path), branch });
  const proposed = String(handoff.proposed || "");
  const original = String(handoff.original || "");
  const findings = [];

  if (handoff.source_repo !== authority.repo || handoff.source_commit_sha !== authority.source_commit_sha) {
    findings.push(finding("P1", "CG-IDENTITY-001", "The reviewed repository provenance changed.", "Prepare the handoff again from current immutable repository evidence."));
  }
  if (handoff.source_file_id !== String(file.id || "")) {
    findings.push(finding("P1", "CG-FILE-IDENTITY-001", "The handoff belongs to a different selected file.", "Select the correct file and prepare the handoff again."));
  }
  if (
    handoff.github_base_branch !== branchProof.base_branch || handoff.github_base_sha !== branchProof.base_sha ||
    handoff.github_head_branch !== branchProof.branch || handoff.github_head_sha !== branchProof.head_sha
  ) {
    findings.push(finding("P1", "CG-BRANCH-PROOF-001", "The immutable branch proof changed after handoff preparation.", "Refresh branch proof and prepare the handoff again."));
  }
  if (handoff.hash_version !== HASH_VERSION) {
    findings.push(finding("P1", "CG-HASH-VERSION-001", "The handoff does not use the canonical UTF-8 hash contract.", "Rebuild the handoff with sha256-utf8-v1."));
  }
  if (handoff.current_hash !== await hashUtf8Text(original) || handoff.proposed_hash !== await hashUtf8Text(proposed)) {
    findings.push(finding("P1", "CG-HASH-BINDING-001", "The handoff content no longer matches its recorded hashes.", "Prepare a fresh handoff from the exact complete files."));
  }
  if (!completeFile(String(handoff.path || ""), proposed)) {
    findings.push(finding("P1", "CG-FULLFILE-001", "The proposed file is incomplete or too large for the queue.", "Save one complete file under 180000 characters."));
  }
  if (handoff.action === "change" && original && proposed.length < Math.max(120, Math.floor(original.length * 0.65))) {
    findings.push(finding("P1", "CG-TRUNCATION-001", "The proposed file may be truncated.", "Restore missing sections and review again."));
  }
  if (/^(?:\s*<<<<<<<(?:\s|$)|\s*=======\s*$|\s*>>>>>>>(?:\s|$))/m.test(proposed)) {
    findings.push(finding("P1", "CG-CONFLICT-001", "Conflict markers were found.", "Resolve all conflict markers."));
  }
  if (/```(?:html|javascript|js|typescript|ts|json)?/i.test(proposed)) {
    findings.push(finding("P2", "CG-FENCE-001", "Markdown fences appear inside the proposed file.", "Keep only complete file contents."));
  }
  if (secretLike(proposed)) {
    findings.push(finding("P0", "CG-SECRET-001", "Secret-like content appears in the proposed file.", "Remove the value and keep privileged values server-side only."));
  }
  if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed)) {
    findings.push(finding("P2", "CG-TIMER-001", "A frequent timer may duplicate work.", "Use a guarded single owner or explicit action.", false));
  }
  if (queue.active_matching_requests > 0) {
    findings.push(finding("P2", "CG-DUPLICATE-001", "A matching write request is already queued or processing.", "Reuse or close the existing request before queuing another.", false));
  }

  const blocking = findings.some((item) => item.blocks_github);
  const outcome = blocking ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FIX_FIRST") : "PASS";
  const scopeOutcome = blocking
    ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FINDINGS_PRESENT")
    : "BOUNDED_CHECKS_CLEAR";
  const review = {
    version: "V50-code-god-2-bounded-advisory",
    outcome,
    scope_outcome: scopeOutcome,
    authoritative: false,
    decision_scope: "bounded_static_checks",
    trust_state: CODE_GOD_TRUST_STATE,
    requires_independent_evidence_receipt: true,
    handoff_hash: await hashCanonicalJson(handoff),
    handoff_hash_version: HANDOFF_HASH_VERSION,
    repo,
    path: handoff.path,
    request_branch: branch,
    github_base_sha: branchProof.base_sha,
    github_head_sha: branchProof.head_sha,
    source_file_id: String(file.id),
    proposed_hash: handoff.proposed_hash,
    findings,
    checks_run: [
      "owner-repository-authority", "immutable-branch-proof", "source-file-identity",
      "hash-contract", "full-file", "queue-limit", "truncation", "conflicts",
      "fences", "secret-values", "duplicate-queue", "timers",
    ],
    checks_not_run: [
      "language-compile-or-typecheck", "runtime-behaviour", "browser-interaction",
      "database-integration", "migration-replay", "deployment",
      "feature-and-workflow-parity", "user-acceptance",
    ],
    limitations: [
      "The result covers only the deterministic checks listed in checks_run.",
      "A compatibility PASS token is not Writer, merge, deployment or production approval.",
      "An independent Master Checklist checkpoint and exact-head evidence remain mandatory.",
    ],
    evidence: {
      authority_verified_at: authority.verified_at,
      branch_verified_at: branchProof.verified_at,
      queue_snapshot_at: queue.captured_at,
    },
    created_at: exactTime(context.now, "review time"),
  };
  metadata.code_god_review = review;
  delete metadata.github_writer_request;

  return {
    action: "code_god.review",
    payload: {
      effects: [recordUpdate(file, metadata), receiptEffect(String(file.id), ["metadata"])],
      response: {
        tool: "run_code_labs_action",
        action: "code_god.review",
        mutation_engine: "atomic-v50",
        review,
      },
    },
    review,
  };
}

export async function prepareGithubWriterAtomic(argsValue, contextValue) {
  const args = object(argsValue || {}, "Writer preparation arguments");
  if (args.confirmed !== true) throw new Error("confirmed must be true to prepare the GitHub request.");
  const context = object(contextValue || {}, "Writer preparation context");
  const file = object(context.file, "selected file");
  const metadata = clone(file.metadata || {});
  const handoff = object(metadata.repo_handoff, "Repo handoff");
  const review = object(metadata.code_god_review, "Code God review");
  if (
    review.outcome !== "PASS" || review.scope_outcome !== "BOUNDED_CHECKS_CLEAR" ||
    review.authoritative !== false || review.trust_state !== CODE_GOD_TRUST_STATE ||
    review.requires_independent_evidence_receipt !== true
  ) {
    throw new Error("Bounded Code God checks must be clear and explicitly advisory before Writer preparation.");
  }
  const repo = safeRepo(handoff.repo);
  const path = safePath(handoff.path);
  const branch = safeBranch(handoff.request_branch);
  const authority = verifiedAuthority(context, repo);
  const branchProof = verifiedBranch(context, repo, branch);
  const queue = queueSnapshot(context, { repo, path, branch });
  if (queue.active_matching_requests !== 0) throw new Error("A matching GitHub write request is already queued or processing.");
  const blob = blobSnapshot(context, { repo, path, branch, head_sha: branchProof.head_sha });
  const currentHandoffHash = await hashCanonicalJson(handoff);
  const content = String(handoff.proposed || "");
  const contentHash = await hashUtf8Text(content);

  if (review.handoff_hash_version !== HANDOFF_HASH_VERSION || review.handoff_hash !== currentHandoffHash) {
    throw new Error("The reviewed handoff changed. Run Code God again.");
  }
  if (review.source_file_id !== String(file.id || "") || review.proposed_hash !== contentHash) {
    throw new Error("Code God proof does not match the selected file and candidate.");
  }
  if (
    review.github_base_sha !== branchProof.base_sha || review.github_head_sha !== branchProof.head_sha ||
    handoff.github_base_sha !== branchProof.base_sha || handoff.github_head_sha !== branchProof.head_sha
  ) {
    throw new Error("The reviewed branch head changed. Refresh the handoff and Code God review.");
  }
  if (authority.source_commit_sha !== branchProof.base_sha) {
    throw new Error("The Writer base SHA does not match current repository authority evidence.");
  }
  if (!completeFile(path, content)) throw new Error("Queued content must be one complete file under 180000 characters.");
  const independent = independentEvidenceIds(args);

  const fields = args.fields && typeof args.fields === "object" ? args.fields : {};
  const request = {
    repo,
    path,
    branch,
    action: handoff.action === "add" ? "create_file" : "create_or_update_file",
    content,
    commit_message: String(fields.commit_message || `Code Labs update ${path}`).slice(0, 240),
    pr_title: String(fields.pr_title || `Code Labs update: ${path}`).slice(0, 240),
    pr_body: String(fields.pr_body || "Prepared by Code Labs V50 after bounded Code God checks and an independently verified Master Checklist checkpoint.").slice(0, 20000),
    confirm_branch_pr_only: true,
    expected_content_sha256: contentHash,
    expected_github_blob_sha: blob.blob_sha,
    expected_github_blob_absent: blob.absent,
    github_base_branch: branchProof.base_branch,
    github_base_sha: branchProof.base_sha,
    github_head_branch: branchProof.branch,
    github_head_sha: branchProof.head_sha,
    code_god_review_version: review.version,
    code_god_outcome: review.outcome,
    code_god_scope_outcome: review.scope_outcome,
    code_god_handoff_hash: review.handoff_hash,
    code_god_proposed_hash: review.proposed_hash,
    code_god_reviewed_at: review.created_at,
    code_god_source_file_id: review.source_file_id,
    independent_evidence_checkpoint_id: independent.checkpoint_id,
    independent_evidence_receipt_id: independent.receipt_id,
  };

  return {
    action: "github.writer_prepare",
    payload: {
      effects: [
        { kind: "write_request_insert", key: "write_request", request },
        receiptEffect(String(file.id), ["metadata", "write_request"]),
      ],
      response: {
        tool: "run_code_labs_action",
        action: "github.writer_prepare",
        mutation_engine: "atomic-v50",
        next_tool: "Code Labs V104 Writer",
        immutable_branch_proof: {
          base_sha: branchProof.base_sha,
          head_sha: branchProof.head_sha,
        },
        schema_binding_required_before_cutover: [
          "github_base_sha", "github_head_sha", "code_god_scope_outcome",
          "independent_evidence_checkpoint_id",
          "independent_evidence_receipt_id", "safety_note",
        ],
        independent_evidence: {
          kind: independent.kind, checkpoint_id: independent.checkpoint_id,
          receipt_id: independent.receipt_id, validation: "atomic-sql-and-protected-writer",
        },
      },
    },
    request,
  };
}
