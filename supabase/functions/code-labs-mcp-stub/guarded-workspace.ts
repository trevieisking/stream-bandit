import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import {
  createCheckpoint as createCheckpointBase,
  getWorkspace,
  listActions as listActionsBase,
  listRecords,
  readCurrentFile,
  readReceipt,
  runAction as runActionBase,
  saveCandidate as saveCandidateBase,
  selectRecord,
  undoAction,
  updateCurrentFile as updateCurrentFileBase,
  updateJob as updateJobBase,
  updatePacket as updatePacketBase,
  updateProject as updateProjectBase,
  updateTest as updateTestBase,
} from "./workspace.ts";
import { backendTablesSnapshot, prepareGithubWriter, prepareRepoHandoff, reviewCodeGod } from "./repo-flow.ts";
import { executeGithubWriter } from "./github-writer.ts";
import { analyzeCgRepairLab, getCgRepairLabAccess } from "./cg-repair-lab.ts";
import { activateOwnerRepository } from "./github-authority.ts";

type Row = Record<string, any>;

function rpcNumber(value: unknown) {
  let current: unknown = value;
  if (Array.isArray(current)) {
    if (current.length !== 1) return Number.NaN;
    current = current[0];
  }
  if (current && typeof current === "object") {
    const values = Object.values(current as Row);
    if (values.length !== 1) return Number.NaN;
    current = values[0];
  }
  return Number(current);
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Row)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  }
  return value;
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalValue(value));
}

function uuidFromBytes(bytes: Uint8Array) {
  const copy = bytes.slice(0, 16);
  copy[6] = (copy[6] & 0x0f) | 0x50;
  copy[8] = (copy[8] & 0x3f) | 0x80;
  const hex = Array.from(copy, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function codeLabsOperationId(ownerId: string, action: string, args: Row) {
  const source = `${ownerId}\n${action}\n${canonicalJson(args)}`;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source)));
  return uuidFromBytes(digest);
}

function rpcObject(value: unknown): Row {
  let current: unknown = value;
  if (Array.isArray(current)) {
    if (current.length !== 1) throw new Error("Code Labs action lease returned an ambiguous array.");
    current = current[0];
  }
  if (current && typeof current === "object") {
    const row = current as Row;
    if (typeof row.state === "string") return row;
    const values = Object.values(row);
    if (values.length === 1 && values[0] && typeof values[0] === "object") return values[0] as Row;
  }
  throw new Error("Code Labs action lease returned an invalid response.");
}

async function beginWorkspaceAction(b: Binding, args: Row, action: string, operationId: string) {
  const expected = Number(args.expected_state_version);
  if (!Number.isSafeInteger(expected) || expected < 1) {
    throw new Error("expected_state_version is required. Read the workspace again before writing.");
  }
  const value = await rest("rpc/code_labs_begin_workspace_action", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: b.owner_id,
      p_operation_id: operationId,
      p_action: action,
      p_expected_state_version: expected,
    }),
  });
  return { expected, lease: rpcObject(value) };
}

async function completeWorkspaceAction(b: Binding, operationId: string, expected: number, result: Row) {
  const value = await rest("rpc/code_labs_complete_workspace_action", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: b.owner_id,
      p_operation_id: operationId,
      p_expected_state_version: expected,
      p_result: result,
    }),
  });
  const completedVersion = rpcNumber(value);
  if (!Number.isSafeInteger(completedVersion) || completedVersion !== expected + 1) {
    throw new Error("Code Labs action lease completed with an invalid workspace version.");
  }
  return completedVersion;
}

async function failWorkspaceAction(b: Binding, operationId: string, expected: number, error: unknown) {
  try {
    await rest("rpc/code_labs_fail_workspace_action", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        p_owner_id: b.owner_id,
        p_operation_id: operationId,
        p_expected_state_version: expected,
        p_error_message: error instanceof Error ? error.message : String(error),
      }),
    });
  } catch (_) {
    // Preserve the original error. Any durable running lease remains visible for recovery.
  }
}

async function guarded<T>(b: Binding, args: Row, action: string, fn: (b: Binding, args: Row) => Promise<T>) {
  const operationId = await codeLabsOperationId(b.owner_id, action, args);
  const { expected, lease } = await beginWorkspaceAction(b, args, action, operationId);
  const leaseState = String(lease.state || "");

  if (leaseState === "completed") {
    const prior = lease.result && typeof lease.result === "object" ? lease.result as Row : {};
    return { ...prior, workspace: { state_version: Number(lease.state_version || expected + 1) } };
  }
  if (leaseState === "running") {
    throw new Error("This Code Labs action is already processing. Read the workspace before retrying.");
  }
  if (leaseState !== "acquired") {
    throw new Error("Code Labs action lease was not acquired.");
  }

  try {
    const result: any = await fn(b, args);
    const completedVersion = await completeWorkspaceAction(b, operationId, expected, result || {});
    return { ...result, workspace: { state_version: completedVersion } };
  } catch (error) {
    await failWorkspaceAction(b, operationId, expected, error);
    throw error;
  }
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
  if (args.confirmed !== true) throw new Error("confirmed must be true to execute the GitHub writer.");
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
      "code_labs_workspace_state?select=state_version&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
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
    workspace: workspace ? { state_version: Number(workspace.state_version || 0) } : undefined,
  };
}

async function guardedWriter(b: Binding, args: Row) {
  const requestId = writerRequestId(args);
  const normalized = { ...args, request_id: requestId };
  const completed = await completedWriterResult(b, normalized);
  if (completed) return safeWriterResult(completed);
  return safeWriterResult(await guarded(b, normalized, "github.writer_execute", executeGithubWriter) as Row);
}

export { getWorkspace, listRecords, readCurrentFile, readReceipt, selectRecord, undoAction };

export function listActions() {
  const base: any = listActionsBase();
  const extra = [
    { action: "repo.prepare_handoff", requires_confirmation: false },
    { action: "cg_repair_lab.access", requires_confirmation: false },
    { action: "cg_repair_lab.analyze", requires_confirmation: false },
    { action: "cg_repair_lab.save_candidate", requires_confirmation: false },
    { action: "code_labs.owner_activate_repository", requires_confirmation: true },
    { action: "code_god.review", requires_confirmation: false },
    { action: "github.writer_prepare", requires_confirmation: true },
    { action: "github.writer_execute", requires_confirmation: true },
    { action: "backend.tables_snapshot", requires_confirmation: false },
  ];
  return { ...base, actions: [...(base.actions || []), ...extra] };
}

export function updateProject(b: Binding, args: Row) {
  return guarded(b, args, "project.update", updateProjectBase);
}
export function updateCurrentFile(b: Binding, args: Row) {
  return guarded(b, args, "file.update", updateCurrentFileBase);
}
export function updateJob(b: Binding, args: Row) {
  return guarded(b, args, "job.update", updateJobBase);
}
export function updatePacket(b: Binding, args: Row) {
  return guarded(b, args, "packet.update", updatePacketBase);
}
export function updateTest(b: Binding, args: Row) {
  return guarded(b, args, "test.update", updateTestBase);
}
export function saveCandidate(b: Binding, args: Row) {
  return guarded(b, args, "candidate.save", saveCandidateBase);
}
export function createCheckpoint(b: Binding, args: Row) {
  return guarded(b, args, "checkpoint.create", createCheckpointBase);
}
export function executeDirectGithubWriter(b: Binding, args: Row) {
  return guardedWriter(b, args);
}

export async function runAction(b: Binding, args: Row) {
  const action = String(args.action || "");

  if (action === "cg_repair_lab.access") return getCgRepairLabAccess(b);
  if (action === "cg_repair_lab.analyze") return analyzeCgRepairLab(b, { ...args, ...(args.fields || {}) });
  if (action === "code_labs.owner_activate_repository") {
    if (args.confirmed !== true) throw new Error("Confirmed owner activation is required.");
    return activateOwnerRepository(b.owner_id, args.fields?.repo);
  }
  if (action === "cg_repair_lab.save_candidate") {
    return guarded(b, {
      ...args,
      candidate_code: args.candidate_code ?? args.fields?.candidate_code,
      note: args.note ?? args.fields?.note,
    }, action, saveCandidateBase);
  }
  if (action === "backend.tables_snapshot") return backendTablesSnapshot(b);
  if (action === "repo.prepare_handoff") {
    const requested = String(args.fields?.action || "change").toLowerCase();
    if (requested === "remove" || requested === "delete") throw new Error("File removal is not available in the normal V104 lane.");
    return guarded(b, args, action, prepareRepoHandoff);
  }
  if (action === "code_god.review") return guarded(b, args, action, reviewCodeGod);
  if (action === "github.writer_prepare") return guarded(b, args, action, prepareGithubWriter);
  if (action === "github.writer_execute") {
    const requestId = String(args.request_id || args.record_id || args.fields?.request_id || "").trim();
    return guardedWriter(b, { ...args, request_id: requestId });
  }

  const alreadyLocked = action.endsWith(".select") || action === "workflow.advance" || action === "workflow.reset";
  const readOnlyAction = action === "canvas.load_packet" || action === "github.prepare_request";
  const result: any = alreadyLocked || readOnlyAction
    ? await runActionBase(b, args)
    : await guarded(b, args, action || "workspace.action", runActionBase);

  if ((action === "workflow.advance" || action === "workflow.reset") && result?.receipt?.receipt_id) {
    await rest("code_labs_action_receipts?id=eq." + encodeURIComponent(result.receipt.receipt_id) + "&owner_id=eq." + encodeURIComponent(b.owner_id), {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ undo_available: false }),
    });
    result.receipt.undo_available = false;
  }
  return result;
}
