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
import {
  backendTablesSnapshot,
  prepareGithubWriter,
  prepareRepoHandoff,
  reviewCodeGod,
} from "./repo-flow.ts";
import {
  analyzeCgRepairLab,
  getCgRepairLabAccess,
} from "./cg-repair-lab.ts";
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

async function reserveStateVersion(b: Binding, args: Row) {
  const expected = Number(args.expected_state_version);
  if (!Number.isSafeInteger(expected) || expected < 1) {
    throw new Error(
      "expected_state_version is required. Read the workspace again before writing.",
    );
  }
  const value = await rest("rpc/code_labs_reserve_workspace_state_version", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: b.owner_id,
      p_expected_state_version: expected,
    }),
  });
  const reservedVersion = rpcNumber(value);
  if (
    !Number.isSafeInteger(reservedVersion) ||
    reservedVersion !== expected + 1
  ) {
    throw new Error(
      "Workspace state changed. Read the workspace again before writing.",
    );
  }
  return { state_version: reservedVersion };
}

async function guarded<T>(
  b: Binding,
  args: Row,
  fn: (b: Binding, args: Row) => Promise<T>,
) {
  const workspace = await reserveStateVersion(b, args);
  const result: any = await fn(b, args);
  return { ...result, workspace };
}

export {
  getWorkspace,
  listRecords,
  readCurrentFile,
  readReceipt,
  selectRecord,
  undoAction,
};

export function listActions() {
  const base: any = listActionsBase();
  const extra = [
    { action: "repo.prepare_handoff", requires_confirmation: false },
    { action: "cg_repair_lab.access", requires_confirmation: false },
    { action: "cg_repair_lab.analyze", requires_confirmation: false },
    { action: "cg_repair_lab.save_candidate", requires_confirmation: false },
    {
      action: "code_labs.owner_activate_repository",
      requires_confirmation: true,
    },
    { action: "code_god.review", requires_confirmation: false },
    { action: "github.writer_prepare", requires_confirmation: true },
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

export async function runAction(b: Binding, args: Row) {
  const action = String(args.action || "");

  if (action === "cg_repair_lab.access") return getCgRepairLabAccess(b);
  if (action === "cg_repair_lab.analyze") {
    return analyzeCgRepairLab(b, { ...args, ...(args.fields || {}) });
  }
  if (action === "code_labs.owner_activate_repository") {
    if (args.confirmed !== true) {
      throw new Error("Confirmed owner activation is required.");
    }
    return activateOwnerRepository(
      b.owner_id,
      args.fields?.repo,
    );
  }
  if (action === "cg_repair_lab.save_candidate") {
    return guarded(
      b,
      {
        ...args,
        candidate_code: args.candidate_code ?? args.fields?.candidate_code,
        note: args.note ?? args.fields?.note,
      },
      saveCandidateBase,
    );
  }
  if (action === "backend.tables_snapshot") {
    return backendTablesSnapshot(b);
  }
  if (action === "repo.prepare_handoff") {
    const requested = String(args.fields?.action || "change").toLowerCase();
    if (requested === "remove" || requested === "delete") {
      throw new Error(
        "File removal is not available in the normal V105 workspace lane.",
      );
    }
    return guarded(b, args, prepareRepoHandoff);
  }
  if (action === "code_god.review") {
    return guarded(b, args, reviewCodeGod);
  }
  if (action === "github.writer_prepare") {
    return guarded(b, args, prepareGithubWriter);
  }

  const alreadyLocked = action.endsWith(".select") ||
    action === "workflow.advance" ||
    action === "workflow.reset";
  const readOnlyAction = action === "canvas.load_packet" ||
    action === "github.prepare_request";
  const result: any = alreadyLocked || readOnlyAction
    ? await runActionBase(b, args)
    : await guarded(b, args, runActionBase);

  if (
    (action === "workflow.advance" || action === "workflow.reset") &&
    result?.receipt?.receipt_id
  ) {
    await rest(
      "code_labs_action_receipts?id=eq." +
        encodeURIComponent(result.receipt.receipt_id) +
        "&owner_id=eq." + encodeURIComponent(b.owner_id),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ undo_available: false }),
      },
    );
    result.receipt.undo_available = false;
  }
  return result;
}
