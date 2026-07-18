import { Binding, rest } from "./oauth.ts";
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

type Row = Record<string, any>;

async function reserveStateVersion(b: Binding, args: Row) {
  const expected = Number(args.expected_state_version);
  if (!Number.isFinite(expected)) throw new Error("expected_state_version is required. Read the workspace again before writing.");
  const response = await rest("rpc/code_labs_reserve_workspace_state", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ p_owner_id: b.owner_id, p_expected_state_version: expected }),
  });
  const workspace = Array.isArray(response) ? response[0] : response;
  if (!workspace || String(workspace.owner_id || "") !== String(b.owner_id) || Number(workspace.state_version) !== expected + 1) {
    throw new Error("Workspace state changed. Read the workspace again before writing.");
  }
  return workspace;
}

async function guarded<T>(b: Binding, args: Row, fn: (b: Binding, args: Row) => Promise<T>) {
  const workspace = await reserveStateVersion(b, args);
  const result: any = await fn(b, args);
  return { ...result, workspace };
}

export { getWorkspace, listRecords, readCurrentFile, readReceipt, selectRecord, undoAction };

export function listActions() {
  const base: any = listActionsBase();
  const extra = [
    { action: "repo.prepare_handoff", requires_confirmation: false },
    { action: "code_god.review", requires_confirmation: false },
    { action: "github.writer_prepare", requires_confirmation: true },
    { action: "github.writer_execute", requires_confirmation: true },
    { action: "backend.tables_snapshot", requires_confirmation: false },
  ];
  return { ...base, actions: [...(base.actions || []), ...extra] };
}

export function updateProject(b: Binding, args: Row) {
  return guarded(b, args, updateProjectBase);
}

export function updateCurrentFile(b: Binding, args: Row) {
  return guarded(b, args, updateCurrentFileBase);
}

export function updateJob(b: Binding, args: Row) {
  return guarded(b, args, updateJobBase);
}

export function updatePacket(b: Binding, args: Row) {
  return guarded(b, args, updatePacketBase);
}

export function updateTest(b: Binding, args: Row) {
  return guarded(b, args, updateTestBase);
}

export function saveCandidate(b: Binding, args: Row) {
  return guarded(b, args, saveCandidateBase);
}

export function createCheckpoint(b: Binding, args: Row) {
  return guarded(b, args, createCheckpointBase);
}

export function executeDirectGithubWriter(b: Binding, args: Row) {
  return guarded(b, args, executeGithubWriter);
}

export async function runAction(b: Binding, args: Row) {
  const action = String(args.action || "");

  if (action === "backend.tables_snapshot") return backendTablesSnapshot(b);
  if (action === "repo.prepare_handoff") {
    const requested = String(args.fields?.action || "change").toLowerCase();
    if (requested === "remove" || requested === "delete") throw new Error("File removal is not available in the normal V104 lane.");
    return guarded(b, args, prepareRepoHandoff);
  }
  if (action === "code_god.review") return guarded(b, args, reviewCodeGod);
  if (action === "github.writer_prepare") return guarded(b, args, prepareGithubWriter);
  if (action === "github.writer_execute") {
    const requestId = String(args.request_id || args.record_id || args.fields?.request_id || "").trim();
    return guarded(b, { ...args, request_id: requestId }, executeGithubWriter);
  }

  const alreadyLocked = action.endsWith(".select") || action === "workflow.advance" || action === "workflow.reset";
  const readOnlyAction = action === "canvas.load_packet" || action === "github.prepare_request";
  const result: any = alreadyLocked || readOnlyAction
    ? await runActionBase(b, args)
    : await guarded(b, args, runActionBase);

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
