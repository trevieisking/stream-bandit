import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import {
  getWorkspace,
  listActions as listActionsBase,
  listRecords,
  readCurrentFile,
  readReceipt,
  runAction as runCompatibilityAction,
} from "./workspace.ts";
import { backendTablesSnapshot } from "./repo-flow.ts";
import { executeGithubWriter } from "./github-writer.ts";
import { analyzeCgRepairLab, getCgRepairLabAccess } from "./cg-repair-lab.ts";
import {
  activateOwnerRepository,
  githubRequest,
  verifyOwnerRepository,
} from "./github-authority.ts";
import { executeAtomicWorkspaceAction } from "./atomic-workspace-engine.ts";
import {
  ATOMIC_ACTION_COVERAGE,
  buildAtomicWorkspacePayload,
} from "./atomic-workspace-actions.mjs";
import {
  prepareCodeGodAtomic,
  prepareGithubWriterAtomic,
  prepareRepoHandoffAtomic,
} from "./atomic-domain-preparation.mjs";

type Row = Record<string, any>;

const PROTECTED_BRANCHES = new Set([
  "main",
  "master",
  "production",
  "live",
  "gh-pages",
]);

const ATOMIC_WORKSPACE_RPC_ROUTE = "rpc/code_labs_execute_workspace_action";

const REPAIR_LAB_READ_ONLY_ACTIONS = new Set([
  "cg_repair_lab.access",
  "cg_repair_lab.analyze",
]);

const TRANSACTIONAL_ACTIONS = new Set([
  "file.intake",
  "setup.save",
  "project.select",
  "file.select",
  "job.select",
  "packet.select",
  "test.select",
  "file.replace_current",
  "repair.save",
  "packet.build",
  "canvas.save_candidate",
  "candidate.save",
  "candidate.accept",
  "test.record",
  "checkpoint.create",
  "workflow.advance",
  "workflow.reset",
  "repo.prepare_handoff",
  "code_god.review",
  "github.writer_prepare",
  "undo.execute",
]);

function nowIso() {
  return new Date().toISOString();
}

function expectedVersion(args: Row) {
  const value = Number(args.expected_state_version);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(
      "expected_state_version is required. Read the workspace again before writing.",
    );
  }
  return value;
}

function cleanBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) || branch.startsWith("/") ||
    branch.endsWith("/") || branch.includes("//") || branch.includes("..") ||
    PROTECTED_BRANCHES.has(branch.toLowerCase())
  ) {
    throw new Error("A safe non-protected GitHub branch is required.");
  }
  return branch;
}

function cleanRef(value: unknown, fallback: string) {
  const ref = String(value || fallback || "").trim();
  if (!ref || ref.length > 200 || /[\u0000-\u001f\u007f]/.test(ref)) {
    throw new Error("A safe source ref is required.");
  }
  return ref;
}

function safePath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (
    !path || path.includes("..") || path.includes("\\") || path.startsWith(".") ||
    /(?:^|\/)(?:secrets?|\.env[^/]*)$/i.test(path) ||
    /\.(?:pem|key|p12|pfx)$/i.test(path) || path.startsWith(".github/")
  ) {
    throw new Error("A safe repository-relative path is required.");
  }
  return path;
}

function fileType(path: string) {
  const name = path.split("/").pop() || path;
  const index = name.lastIndexOf(".");
  return index > -1 ? name.slice(index + 1).toLowerCase().slice(0, 20) : "text";
}

function decodeBase64(value: string) {
  const binary = atob(String(value || "").replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

async function hashText(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(
    new Uint8Array(bytes),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function deterministicFileId(
  ownerId: string,
  projectId: string,
  path: string,
) {
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ownerId + "\n" + projectId + "\n" + path),
    ),
  );
  const bytes = digest.slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(
    bytes,
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function cleanIntakeMetadata(value: unknown) {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Row) }
    : {};
  for (
    const key of [
      "fixed_output",
      "candidate_hash",
      "candidate_hash_version",
      "candidate_note",
      "candidate_saved_at",
      "candidate_accepted_at",
      "repo_handoff",
      "code_god_review",
      "github_writer_request",
      "proposed",
      "proposed_hash",
      "repair_branch",
      "request_scope",
      "request_branch",
    ]
  ) delete source[key];
  return source;
}

async function workspaceContext(b: Binding) {
  const snapshot: any = await getWorkspace(b);
  const current = snapshot?.current && typeof snapshot.current === "object"
    ? snapshot.current
    : {};
  return { now: nowIso(), current, ...current };
}

async function prepareFileIntakeContext(
  b: Binding,
  args: Row,
  context: Row,
) {
  const input = args.fields && typeof args.fields === "object" ? args.fields : {};
  const path = safePath(input.path);
  const repo = String(input.repo || "").trim();
  const project = context.project;
  if (!project?.id) throw new Error("Select the File Lab project first.");
  if (String(project.repo || "") !== repo) {
    throw new Error(
      "The selected File Lab project and requested repository do not match.",
    );
  }

  const authority = await verifyOwnerRepository(
    b.owner_id,
    repo,
    { contents: "read", metadata: "read" },
  );
  const requestedRef = cleanRef(input.ref, authority.default_branch);
  const repoPath = "/repos/" +
    repo.split("/").map(encodeURIComponent).join("/");
  const commit = await githubRequest(
    repoPath + "/commits/" + encodeURIComponent(requestedRef),
    authority.token,
  );
  const commitSha = String(commit?.sha || "");
  if (!/^[a-f0-9]{40}$/i.test(commitSha)) {
    throw new Error("GitHub did not return immutable source provenance.");
  }
  const source = await githubRequest(
    repoPath + "/contents/" + path.split("/").map(encodeURIComponent).join("/") +
      "?ref=" + encodeURIComponent(commitSha),
    authority.token,
  );
  if (
    !source || source.type !== "file" || source.encoding !== "base64" ||
    typeof source.content !== "string"
  ) {
    throw new Error("GitHub did not return one readable File Lab source file.");
  }
  const code = decodeBase64(source.content);
  const size = new TextEncoder().encode(code).length;
  if (!code || size > 750000) {
    throw new Error("The File Lab source must be non-empty and under 750000 bytes.");
  }

  const matches = await rest(
    "code_labs_files?select=id,metadata&owner_id=eq." +
      encodeURIComponent(b.owner_id) + "&project_id=eq." +
      encodeURIComponent(project.id) + "&filename=eq." +
      encodeURIComponent(path) + "&order=updated_at.desc&limit=2",
  );
  if (!Array.isArray(matches)) {
    throw new Error("File Lab could not read its exact file inventory.");
  }
  if (matches.length > 1) {
    throw new Error(
      "Multiple File Lab rows already exist for this exact path. Resolve the duplicate before intake.",
    );
  }

  const existing = matches[0] || null;
  const intakeAt = nowIso();
  return {
    ...context,
    now: intakeAt,
    intake: {
      project_id: String(project.id),
      file_id: existing?.id ||
        await deterministicFileId(b.owner_id, String(project.id), path),
      filename: path,
      file_type: fileType(path),
      current_code: code,
      current_hash: await hashText(code),
      metadata: {
        ...cleanIntakeMetadata(existing?.metadata),
        source: "file.intake",
        source_repo: repo,
        source_ref: requestedRef,
        source_path: path,
        source_blob_sha: String(source.sha || ""),
        source_commit_sha: commitSha,
        verified_owner_repository: true,
        intake_at: intakeAt,
      },
    },
  };
}

async function undoContext(b: Binding, args: Row, context: Row) {
  const receiptId = String(args.receipt_id || args.record_id || "").trim();
  if (!receiptId) throw new Error("receipt_id is required.");
  const receiptRows = await rest(
    "code_labs_action_receipts?select=*&id=eq." + encodeURIComponent(receiptId) +
      "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
  );
  const receipt = Array.isArray(receiptRows) ? receiptRows[0] || null : null;
  if (!receipt || receipt.undo_available !== true || receipt.undone_at) {
    throw new Error("This receipt is not eligible for undo.");
  }
  const table: Record<string, string> = {
    project: "code_labs_projects",
    file: "code_labs_files",
    job: "code_labs_repair_jobs",
    packet: "code_labs_packets",
    test: "code_labs_test_runs",
  };
  const target = table[String(receipt.record_type || "")];
  if (!target || !receipt.record_id) {
    throw new Error("This receipt record type cannot be undone atomically.");
  }
  const rows = await rest(
    target + "?select=*&id=eq." + encodeURIComponent(receipt.record_id) +
      "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
  );
  const record = Array.isArray(rows) ? rows[0] || null : null;
  if (!record) throw new Error("The undo target no longer exists.");
  return { ...context, undo_receipt: receipt, undo_record: record };
}

async function repositoryEvidence(
  b: Binding,
  args: Row,
  context: Row,
  includeQueue: boolean,
  includeBlob: boolean,
) {
  const fields = args.fields && typeof args.fields === "object" ? args.fields : {};
  const file = context.file || {};
  const project = context.project || {};
  const handoff = file.metadata?.repo_handoff || {};
  const repo = String(fields.repo || handoff.repo || project.repo || "").trim();
  const branch = cleanBranch(fields.branch || handoff.request_branch);
  const path = safePath(fields.path || handoff.path || file.metadata?.source_path || file.filename);
  const authority = await verifyOwnerRepository(
    b.owner_id,
    repo,
    { contents: includeBlob ? "write" : "read", metadata: "read" },
  );
  const repoPath = "/repos/" +
    repo.split("/").map(encodeURIComponent).join("/");
  const [baseCommit, headCommit] = await Promise.all([
    githubRequest(
      repoPath + "/commits/" + encodeURIComponent(authority.default_branch),
      authority.token,
    ),
    githubRequest(
      repoPath + "/commits/" + encodeURIComponent(branch),
      authority.token,
    ),
  ]);
  const baseSha = String(baseCommit?.sha || "").toLowerCase();
  const headSha = String(headCommit?.sha || "").toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(baseSha) || !/^[a-f0-9]{40}$/.test(headSha)) {
    throw new Error("GitHub did not return immutable branch proof.");
  }
  const capturedAt = nowIso();
  const evidence: Row = {
    ...context,
    now: capturedAt,
    authority: {
      verified: true,
      repo: authority.repo,
      default_branch: authority.default_branch,
      source_commit_sha: baseSha,
      verified_at: capturedAt,
    },
    branch_proof: {
      verified: true,
      repo: authority.repo,
      branch,
      base_branch: authority.default_branch,
      base_sha: baseSha,
      head_sha: headSha,
      verified_at: capturedAt,
    },
  };

  if (includeQueue) {
    const queueRows = await rest(
      "code_labs_write_requests?select=id,status&requested_by=eq." +
        encodeURIComponent(b.owner_id) + "&repo=eq." + encodeURIComponent(repo) +
        "&path=eq." + encodeURIComponent(path) + "&branch=eq." +
        encodeURIComponent(branch) + "&status=in.(queued,processing)&limit=2",
    );
    evidence.queue_snapshot = {
      complete: Array.isArray(queueRows),
      repo,
      path,
      branch,
      active_matching_requests: Array.isArray(queueRows) ? queueRows.length : -1,
      captured_at: capturedAt,
    };
  }

  if (includeBlob) {
    let absent = false;
    let blobSha: string | null = null;
    try {
      const blob = await githubRequest(
        repoPath + "/contents/" +
          path.split("/").map(encodeURIComponent).join("/") + "?ref=" +
          encodeURIComponent(headSha),
        authority.token,
      );
      blobSha = String(blob?.sha || "").toLowerCase();
      if (!/^[a-f0-9]{40}$/.test(blobSha)) {
        throw new Error("GitHub did not return immutable target blob proof.");
      }
    } catch (error) {
      const message = String((error as Error)?.message || error || "");
      if (!/404|not found/i.test(message)) throw error;
      absent = true;
      blobSha = null;
    }
    evidence.blob_snapshot = {
      complete: true,
      repo,
      path,
      branch,
      head_sha: headSha,
      absent,
      blob_sha: blobSha,
      captured_at: capturedAt,
    };
  }

  return evidence;
}

async function atomicPayload(b: Binding, action: string, args: Row) {
  let context = await workspaceContext(b);
  if (action === "file.intake") {
    context = await prepareFileIntakeContext(b, args, context);
  } else if (action === "undo.execute") {
    context = await undoContext(b, args, context);
  }

  if (ATOMIC_ACTION_COVERAGE.adapted.includes(action)) {
    return await buildAtomicWorkspacePayload(action, args, context);
  }
  if (action === "repo.prepare_handoff") {
    context = await repositoryEvidence(b, args, context, false, false);
    return (await prepareRepoHandoffAtomic(args, context)).payload;
  }
  if (action === "code_god.review") {
    context = await repositoryEvidence(b, args, context, true, false);
    return (await prepareCodeGodAtomic(args, context)).payload;
  }
  if (action === "github.writer_prepare") {
    context = await repositoryEvidence(b, args, context, true, true);
    return (await prepareGithubWriterAtomic(args, context)).payload;
  }
  throw new Error("Unknown transactional Code Labs action.");
}

async function runAtomicAction(b: Binding, action: string, args: Row) {
  if (ATOMIC_WORKSPACE_RPC_ROUTE !== "rpc/code_labs_execute_workspace_action") {
    throw new Error("The atomic workspace RPC route is invalid.");
  }
  const expected = expectedVersion(args);
  const payload = await atomicPayload(b, action, args);
  return executeAtomicWorkspaceAction(b, {
    action,
    expected_state_version: expected,
    payload,
    fencing_token: args.fencing_token == null
      ? null
      : Number(args.fencing_token),
  });
}

async function createGithubBranch(b: Binding, args: Row) {
  if (args.confirmed !== true) {
    throw new Error("confirmed must be true to create a GitHub branch.");
  }
  const repo = String(args.fields?.repo || "").trim();
  const branch = cleanBranch(args.fields?.branch);
  const authority = await verifyOwnerRepository(
    b.owner_id,
    repo,
    { contents: "write", metadata: "read" },
  );
  if (branch.toLowerCase() === authority.default_branch.toLowerCase()) {
    throw new Error("The requested branch is the verified default branch.");
  }
  const sourceRef = cleanRef(args.fields?.source_ref, authority.default_branch);
  const repoPath = "/repos/" +
    [authority.owner, authority.name].map(encodeURIComponent).join("/");
  const matches = await githubRequest(
    repoPath + "/git/matching-refs/heads/" + encodeURIComponent(branch),
    authority.token,
  );
  if (
    Array.isArray(matches) && matches.some((row: Row) =>
      String(row?.ref || "") === "refs/heads/" + branch
    )
  ) {
    throw new Error("The requested GitHub branch already exists.");
  }
  const source = await githubRequest(
    repoPath + "/commits/" + encodeURIComponent(sourceRef),
    authority.token,
  );
  const sourceSha = String(source?.sha || "");
  if (!/^[a-f0-9]{40}$/i.test(sourceSha)) {
    throw new Error("GitHub did not return immutable source commit proof.");
  }
  const created = await githubRequest(repoPath + "/git/refs", authority.token, {
    method: "POST",
    body: JSON.stringify({ ref: "refs/heads/" + branch, sha: sourceSha }),
  });
  const createdRef = String(created?.ref || "");
  const createdSha = String(created?.object?.sha || "");
  if (createdRef !== "refs/heads/" + branch || createdSha !== sourceSha) {
    throw new Error("GitHub did not return branch creation proof.");
  }
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "github.branch_create",
    wrote_database: false,
    wrote_github: true,
    opened_pr: false,
    deleted_anything: false,
    direct_main_write: false,
    merged: false,
    force_pushed: false,
    workflows_modified: false,
    github: {
      repo: authority.repo,
      branch,
      source_ref: sourceRef,
      source_commit_sha: sourceSha,
      created_ref: createdRef,
    },
  };
}

function safeWriterResult(result: Row) {
  const github = result?.github && typeof result.github === "object"
    ? {
      branch: String(result.github.branch || ""),
      path: String(result.github.path || ""),
      commit_sha: String(result.github.commit_sha || ""),
      content_sha: String(result.github.content_sha || ""),
      pull_request_number: Number(result.github.pull_request_number || 0),
      pull_request_url: String(result.github.pull_request_url || ""),
      draft: result.github.draft === true,
      reused: result.github.reused === true,
    }
    : null;
  return {
    ok: result?.ok === true,
    version: String(result?.version || ""),
    tool: "execute_code_labs_github_writer",
    wrote_database: result?.wrote_database === true,
    wrote_github: result?.wrote_github === true,
    opened_pr: result?.opened_pr === true,
    deleted_anything: false,
    direct_main_write: false,
    merged: false,
    force_pushed: false,
    workflows_modified: false,
    github,
    workspace: result?.workspace && typeof result.workspace === "object"
      ? { state_version: Number(result.workspace.state_version || 0) }
      : undefined,
  };
}

function writerRequestId(args: Row) {
  if (args.confirmed !== true) {
    throw new Error("confirmed must be true to execute the GitHub writer.");
  }
  const requestId = String(args.request_id || "").trim();
  if (!requestId) throw new Error("request_id is required.");
  return requestId;
}

async function completedWriterResult(b: Binding, args: Row) {
  const requestId = writerRequestId(args);
  const [requestRows, workspaceRows] = await Promise.all([
    rest(
      "code_labs_write_requests?select=status,branch,path,github_commit_sha,github_content_sha,pull_request_number,pull_request_url" +
        "&id=eq." + encodeURIComponent(requestId) +
        "&requested_by=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
    ),
    rest(
      "code_labs_workspace_state?select=state_version&owner_id=eq." +
        encodeURIComponent(b.owner_id) + "&limit=1",
    ),
  ]);
  const request = Array.isArray(requestRows) ? requestRows[0] || null : null;
  if (!request || String(request.status || "") !== "pr_opened") return null;
  const commitSha = String(request.github_commit_sha || "");
  const contentSha = String(request.github_content_sha || "");
  const pullNumber = Number(request.pull_request_number || 0);
  const pullUrl = String(request.pull_request_url || "");
  if (!commitSha || !contentSha || !pullNumber || !pullUrl) return null;
  const workspace = Array.isArray(workspaceRows) ? workspaceRows[0] || null : null;
  return {
    ok: true,
    version: VERSION,
    tool: "execute_code_labs_github_writer",
    wrote_database: false,
    wrote_github: false,
    opened_pr: false,
    deleted_anything: false,
    github: {
      branch: String(request.branch || ""),
      path: String(request.path || ""),
      commit_sha: commitSha,
      content_sha: contentSha,
      pull_request_number: pullNumber,
      pull_request_url: pullUrl,
      draft: true,
      reused: true,
    },
    workspace: workspace
      ? { state_version: Number(workspace.state_version || 0) }
      : undefined,
  };
}

async function executeWriterExternal(b: Binding, args: Row) {
  const requestId = writerRequestId(args);
  const normalized = { ...args, request_id: requestId };
  const completed = await completedWriterResult(b, normalized);
  if (completed) return safeWriterResult(completed);
  return safeWriterResult(await executeGithubWriter(b, normalized) as Row);
}

export { getWorkspace, listRecords, readCurrentFile, readReceipt };

export function listActions() {
  const base: any = listActionsBase();
  const extra = [
    { action: "file.intake", requires_confirmation: false },
    { action: "repo.prepare_handoff", requires_confirmation: false },
    { action: "cg_repair_lab.access", requires_confirmation: false },
    { action: "cg_repair_lab.analyze", requires_confirmation: false },
    { action: "code_labs.owner_activate_repository", requires_confirmation: true },
    { action: "code_god.review", requires_confirmation: false },
    { action: "github.branch_create", requires_confirmation: true },
    { action: "github.writer_prepare", requires_confirmation: true },
    { action: "github.writer_execute", requires_confirmation: true },
    { action: "backend.tables_snapshot", requires_confirmation: false },
  ];
  return { ...base, actions: [...(base.actions || []), ...extra] };
}

export function selectRecord(b: Binding, args: Row) {
  const action = String(args.record_type || "") + ".select";
  return runAtomicAction(b, action, args);
}

export function updateProject(b: Binding, args: Row) {
  return runAtomicAction(b, "setup.save", args);
}

export function updateCurrentFile(b: Binding, args: Row) {
  return runAtomicAction(b, "file.replace_current", args);
}

export function updateJob(b: Binding, args: Row) {
  return runAtomicAction(b, "repair.save", args);
}

export function updatePacket(b: Binding, args: Row) {
  return runAtomicAction(b, "packet.build", args);
}

export function updateTest(b: Binding, args: Row) {
  return runAtomicAction(b, "test.record", args);
}

export function saveCandidate(b: Binding, args: Row) {
  return runAtomicAction(b, "candidate.save", args);
}

export function createCheckpoint(b: Binding, args: Row) {
  return runAtomicAction(b, "checkpoint.create", args);
}

export async function undoAction(b: Binding, args: Row) {
  let expectedStateVersion = args.expected_state_version;
  if (
    expectedStateVersion === undefined || expectedStateVersion === null ||
    expectedStateVersion === ""
  ) {
    const current = await getWorkspace(b);
    expectedStateVersion = current.workspace?.state_version;
  }
  return runAtomicAction(b, "undo.execute", {
    ...args,
    expected_state_version: expectedStateVersion,
    receipt_id: args.receipt_id,
  });
}

export function executeDirectGithubWriter(b: Binding, args: Row) {
  return executeWriterExternal(b, args);
}

export async function runAction(b: Binding, args: Row) {
  let action = String(args.action || "");

  if (REPAIR_LAB_READ_ONLY_ACTIONS.has(action)) {
    if (action === "cg_repair_lab.access") return getCgRepairLabAccess(b);
    if (action === "cg_repair_lab.analyze") {
      return analyzeCgRepairLab(b, { ...args, ...(args.fields || {}) });
    }
  }
  if (action.startsWith("cg_repair_lab.")) {
    throw new Error(
      "CG Repair Lab is read-only and cannot execute workspace mutations while trust is held.",
    );
  }
  if (action === "backend.tables_snapshot") return backendTablesSnapshot(b);
  if (action === "canvas.load_packet" || action === "github.prepare_request") {
    return runCompatibilityAction(b, { ...args, action });
  }
  if (action === "code_labs.owner_activate_repository") {
    if (args.confirmed !== true) {
      throw new Error("Confirmed owner activation is required.");
    }
    return activateOwnerRepository(b.owner_id, args.fields?.repo);
  }
  if (action === "github.branch_create") return createGithubBranch(b, args);
  if (action === "github.writer_execute") {
    const requestId = String(
      args.request_id || args.record_id || args.fields?.request_id || "",
    ).trim();
    return executeWriterExternal(b, { ...args, request_id: requestId });
  }

  if (!TRANSACTIONAL_ACTIONS.has(action)) {
    throw new Error("Unknown or unsupported Code Labs action.");
  }
  return runAtomicAction(b, action, args);
}
