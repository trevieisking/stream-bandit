import {
  BASE,
  CLAIM,
  SCOPE,
  authorize,
  binding,
  register,
  rest,
  token,
} from "./oauth.ts";
import {
  VERSION,
  getContext,
  readUrl,
  saveRequest,
} from "./context.ts";
import {
  createCheckpoint,
  getWorkspace,
  listActions,
  listRecords,
  readCurrentFile,
  readReceipt,
  runAction,
  saveCandidate,
  selectRecord,
  undoAction,
  updateCurrentFile,
  updateJob,
  updatePacket,
  updateProject,
  updateTest,
} from "./guarded-workspace.ts";
import {
  analyzeCgRepairLab,
  getCgRepairLabAccess,
  getCgRepairLabWorkflow,
} from "./cg-repair-lab.ts";
import {
  listOwnerGalleryReferences,
  readOwnerGalleryImage,
} from "./owner-gallery-reader.ts";
import {
  createBranch,
  createFile,
  createOrReuseDraftPr,
  inspectGithubOperation,
  inspectPullRequest,
  readRepository,
  updateFile,
} from "./github-operations.ts";
import { protectRepositoryRead } from "./credential-redaction.ts";

type Row = Record<string, any>;

export const V105_STAGING_SAFE_MODE = true as const;

const CONNECTOR = "code-labs-live-v105-unified";
const ARCHITECTURE = "private-tool-only-mcp-with-independent-github-operations";
const SAFE_MODE_ERROR = "V105 staging safe mode blocks mutations.";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...cors,
      ...extra,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
const go = (url: string) =>
  new Response(null, {
    status: 302,
    headers: { ...cors, Location: url, "Cache-Control": "no-store" },
  });
const rpc = (id: unknown, result: unknown) =>
  json({ jsonrpc: "2.0", id: id ?? null, result });
const rpcError = (
  id: unknown,
  code: number,
  message: string,
  status = 400,
) => json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);

const readLocal = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
const readExternal = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};
const workspaceMutation = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};
const externalMutation = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
};
const durableGithubMutation = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const resultSchema = { type: "object", additionalProperties: true };
const fields = { type: "object", additionalProperties: true };
const expected = { type: "number", minimum: 1 };
const operationKey = {
  type: "string",
  pattern: "^[A-Za-z0-9._:-]{8,200}$",
};
const repo = {
  type: "string",
  pattern: "^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$",
};
const branch = { type: "string", pattern: "^[A-Za-z0-9._/-]{3,120}$" };
const sha1 = { type: "string", pattern: "^[a-f0-9]{40}$" };
const sha256 = { type: "string", pattern: "^[a-f0-9]{64}$" };

function protectedResource() {
  return {
    resource: BASE,
    authorization_servers: [BASE],
    bearer_methods_supported: ["header"],
    scopes_supported: ["code_labs.read", "code_labs.write"],
  };
}

function metadata() {
  return {
    issuer: BASE,
    authorization_endpoint: BASE + "/oauth/authorize",
    token_endpoint: BASE + "/oauth/token",
    registration_endpoint: BASE + "/oauth/register",
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["code_labs.read", "code_labs.write"],
  };
}

function tools() {
  return [
    {
      name: "get_code_labs_context",
      title: "Get Code Labs Context",
      description:
        "Read owner-scoped Code Labs projects, jobs, packets, tests and audit events.",
      inputSchema: {
        type: "object",
        properties: { limit: { type: "number", minimum: 1, maximum: 25 } },
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "read_code_labs_url",
      title: "Read Code Labs URL",
      description: "Read an approved public Code Labs URL without changing it.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" },
          max_chars: { type: "number", maximum: 60000 },
        },
        required: ["url"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readExternal,
    },
    {
      name: "get_code_labs_workspace",
      title: "Get Code Labs Workspace",
      description:
        "Read the existing owner workspace and current selections without creating state.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "list_code_labs_records",
      title: "List Code Labs Records",
      description: "List owner-scoped projects, files, jobs, packets or tests.",
      inputSchema: {
        type: "object",
        properties: {
          record_type: {
            type: "string",
            enum: ["project", "file", "job", "packet", "test"],
          },
          limit: { type: "number", minimum: 1, maximum: 50 },
        },
        required: ["record_type"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "read_code_labs_current_file",
      title: "Read Current Code Labs File",
      description:
        "Read the selected file only when an existing owner workspace already selects it.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "list_code_labs_actions",
      title: "List Code Labs Actions",
      description:
        "List workspace actions; independent GitHub execution is exposed separately.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "read_code_labs_receipt",
      title: "Read Code Labs Receipt",
      description: "Read an owner-scoped workspace action receipt.",
      inputSchema: {
        type: "object",
        properties: { receipt_id: { type: "string" } },
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "get_cg_repair_lab_access",
      title: "Get CG Repair Lab Access",
      description:
        "Check Code Labs Pro access and owner-authorised repositories without returning credential values.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "get_cg_repair_lab_workflow",
      title: "Get CG Repair Lab Workflow",
      description: "Read the unified V105 CG Repair Lab and Code God workflow mapping.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
    {
      name: "analyze_code_labs_repository",
      title: "Analyze Repository with CG Repair Lab",
      description:
        "Run owner-scoped, read-only, credential-redacting repository analysis.",
      inputSchema: {
        type: "object",
        properties: { repo, ref: { type: "string" }, path: { type: "string" } },
        required: ["repo", "path"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readExternal,
    },
    {
      name: "list_code_labs_owner_gallery_images",
      title: "List Code Labs Owner Gallery Images",
      description: "List private Pro owner-gallery images as opaque references only.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      outputSchema: resultSchema,
      annotations: readExternal,
    },
    {
      name: "read_code_labs_owner_gallery_image",
      title: "Read Code Labs Owner Gallery Image",
      description:
        "Read one private gallery image without exposing its path, filename or signed URL.",
      inputSchema: {
        type: "object",
        properties: {
          reference: { type: "string", pattern: "^img_[a-f0-9]{64}$" },
        },
        required: ["reference"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readExternal,
    },
    {
      name: "select_code_labs_record",
      title: "Select Code Labs Record",
      description: "Select a workspace record using expected_state_version.",
      inputSchema: {
        type: "object",
        properties: {
          record_type: {
            type: "string",
            enum: ["project", "file", "job", "packet", "test"],
          },
          record_id: { type: "string" },
          expected_state_version: expected,
        },
        required: ["record_type", "record_id", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "update_code_labs_project",
      title: "Update Code Labs Project",
      description: "Update the selected project under workspace state locking.",
      inputSchema: {
        type: "object",
        properties: { fields, expected_state_version: expected },
        required: ["fields", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "update_code_labs_current_file",
      title: "Update Current Code Labs File",
      description: "Replace the selected workspace file under state locking.",
      inputSchema: {
        type: "object",
        properties: { fields, expected_state_version: expected },
        required: ["fields", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "update_code_labs_repair_job",
      title: "Update Code Labs Repair Job",
      description: "Update the selected repair job under workspace state locking.",
      inputSchema: {
        type: "object",
        properties: { fields, expected_state_version: expected },
        required: ["fields", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "upsert_code_labs_packet",
      title: "Update Code Labs Packet",
      description: "Update the selected packet under workspace state locking.",
      inputSchema: {
        type: "object",
        properties: { fields, expected_state_version: expected },
        required: ["fields", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "save_code_labs_candidate",
      title: "Save Code Labs Candidate",
      description: "Save candidate code separately under workspace state locking.",
      inputSchema: {
        type: "object",
        properties: {
          candidate_code: { type: "string" },
          note: { type: "string" },
          expected_state_version: expected,
        },
        required: ["candidate_code", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "upsert_code_labs_test_result",
      title: "Update Code Labs Test Result",
      description: "Update the selected test under workspace state locking.",
      inputSchema: {
        type: "object",
        properties: { fields, expected_state_version: expected },
        required: ["fields", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "create_code_labs_checkpoint",
      title: "Create Code Labs Checkpoint",
      description: "Create a deliberate workspace checkpoint under state locking.",
      inputSchema: {
        type: "object",
        properties: {
          label: { type: "string" },
          note: { type: "string" },
          confirmed: { type: "boolean" },
          expected_state_version: expected,
        },
        required: ["confirmed", "expected_state_version"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "run_code_labs_action",
      title: "Run Code Labs Workspace Action",
      description:
        "Run one strict workspace action. The old Writer execution action is not available.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string" },
          record_id: { type: "string" },
          request_id: { type: "string" },
          expected_state_version: expected,
          confirmed: { type: "boolean" },
          label: { type: "string" },
          note: { type: "string" },
          fields,
          candidate_code: { type: "string" },
        },
        required: ["action"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: externalMutation,
    },
    {
      name: "undo_code_labs_action",
      title: "Undo Code Labs Action",
      description: "Restore an eligible workspace mutation from its receipt.",
      inputSchema: {
        type: "object",
        properties: { receipt_id: { type: "string" } },
        required: ["receipt_id"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: workspaceMutation,
    },
    {
      name: "save_code_labs_write_request",
      title: "Prepare Reviewed GitHub Request",
      description:
        "Save one reviewed branch-and-draft-PR request in the private queue; this does not execute GitHub.",
      inputSchema: {
        type: "object",
        properties: {
          repo,
          path: { type: "string" },
          branch,
          content: { type: "string" },
          action: { type: "string" },
          commit_message: { type: "string" },
          pr_title: { type: "string" },
          pr_body: { type: "string" },
          confirm_branch_pr_only: { type: "boolean" },
        },
        required: [
          "repo",
          "path",
          "branch",
          "content",
          "commit_message",
          "pr_title",
          "confirm_branch_pr_only",
        ],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: externalMutation,
    },
    {
      name: "read_code_labs_repository",
      title: "Read Owner-Authorised Repository",
      description:
        "Read repository metadata and optionally one complete source file with credential values redacted. No expected_state_version is accepted.",
      inputSchema: {
        type: "object",
        properties: { repo, ref: { type: "string" }, path: { type: "string" } },
        required: ["repo"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readExternal,
    },
    {
      name: "create_code_labs_github_branch",
      title: "Create GitHub Branch",
      description:
        "Create one non-main branch through a durable owner-authorised operation. No expected_state_version is accepted.",
      inputSchema: {
        type: "object",
        properties: {
          operation_key: operationKey,
          repo,
          branch,
          base_ref: { type: "string" },
        },
        required: ["operation_key", "repo", "branch", "base_ref"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: durableGithubMutation,
    },
    {
      name: "create_code_labs_github_file",
      title: "Create Complete GitHub File",
      description:
        "Create one complete file on an existing non-main branch with SHA-256 proof. No expected_state_version is accepted.",
      inputSchema: {
        type: "object",
        properties: {
          operation_key: operationKey,
          repo,
          branch,
          path: { type: "string" },
          content: { type: "string" },
          content_hash: sha256,
          commit_message: { type: "string" },
        },
        required: [
          "operation_key",
          "repo",
          "branch",
          "path",
          "content",
          "content_hash",
        ],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: durableGithubMutation,
    },
    {
      name: "update_code_labs_github_file",
      title: "Update Complete GitHub File",
      description:
        "Replace one complete file after exact blob-SHA and content-hash verification. No expected_state_version is accepted.",
      inputSchema: {
        type: "object",
        properties: {
          operation_key: operationKey,
          repo,
          branch,
          path: { type: "string" },
          expected_blob_sha: sha1,
          content: { type: "string" },
          content_hash: sha256,
          commit_message: { type: "string" },
        },
        required: [
          "operation_key",
          "repo",
          "branch",
          "path",
          "expected_blob_sha",
          "content",
          "content_hash",
        ],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: durableGithubMutation,
    },
    {
      name: "create_or_reuse_code_labs_draft_pr",
      title: "Create or Reuse Draft Pull Request",
      description:
        "Create or reuse one draft PR for a non-main head branch. No merge is available and no expected_state_version is accepted.",
      inputSchema: {
        type: "object",
        properties: {
          operation_key: operationKey,
          repo,
          branch,
          base_ref: { type: "string" },
          pr_title: { type: "string" },
          pr_body: { type: "string" },
        },
        required: ["operation_key", "repo", "branch", "base_ref", "pr_title"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: durableGithubMutation,
    },
    {
      name: "inspect_code_labs_pull_request",
      title: "Inspect Pull Request",
      description:
        "Inspect owner-authorised PR metadata and changed-file proof without changing state.",
      inputSchema: {
        type: "object",
        properties: {
          repo,
          pull_request_number: { type: "integer", minimum: 1 },
        },
        required: ["repo", "pull_request_number"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readExternal,
    },
    {
      name: "inspect_code_labs_github_operation",
      title: "Inspect V105 GitHub Operation",
      description: "Read durable operation status and proof without changing state.",
      inputSchema: {
        type: "object",
        properties: { operation_key: operationKey },
        required: ["operation_key"],
        additionalProperties: false,
      },
      outputSchema: resultSchema,
      annotations: readLocal,
    },
  ];
}

const READ_ONLY_TOOLS = new Set([
  "get_code_labs_context",
  "read_code_labs_url",
  "get_code_labs_workspace",
  "list_code_labs_records",
  "read_code_labs_current_file",
  "list_code_labs_actions",
  "read_code_labs_receipt",
  "get_cg_repair_lab_access",
  "get_cg_repair_lab_workflow",
  "analyze_code_labs_repository",
  "list_code_labs_owner_gallery_images",
  "read_code_labs_owner_gallery_image",
  "read_code_labs_repository",
  "inspect_code_labs_pull_request",
  "inspect_code_labs_github_operation",
]);

const MUTATION_TOOLS = new Set([
  "select_code_labs_record",
  "update_code_labs_project",
  "update_code_labs_current_file",
  "update_code_labs_repair_job",
  "upsert_code_labs_packet",
  "save_code_labs_candidate",
  "upsert_code_labs_test_result",
  "create_code_labs_checkpoint",
  "undo_code_labs_action",
  "save_code_labs_write_request",
  "create_code_labs_github_branch",
  "create_code_labs_github_file",
  "update_code_labs_github_file",
  "create_or_reuse_code_labs_draft_pr",
]);

const READ_ONLY_ACTIONS = new Set([
  "cg_repair_lab.access",
  "cg_repair_lab.analyze",
  "backend.tables_snapshot",
  "canvas.load_packet",
]);

function safeModeBlocked(operation: string, action?: string) {
  return {
    ok: false,
    error: SAFE_MODE_ERROR,
    staging_safe_mode: true,
    operation,
    action: action || undefined,
    wrote_database: false,
    wrote_github: false,
    opened_pr: false,
    deleted_anything: false,
    workspace_state_changed: false,
  };
}

function rejectWorkspaceVersion(args: Row) {
  if (Object.prototype.hasOwnProperty.call(args, "expected_state_version")) {
    throw new Error(
      "V105 GitHub operation tools do not accept or read expected_state_version.",
    );
  }
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function readExistingWorkspace(bindingValue: Row) {
  const state = await one(
    "code_labs_workspace_state?select=*&owner_id=eq." +
      encodeURIComponent(bindingValue.owner_id) + "&limit=1",
  );
  if (!state) {
    return {
      ok: true,
      version: VERSION,
      tool: "get_code_labs_workspace",
      workspace: null,
      current: { project: null, file: null, job: null, packet: null, test: null },
      read_only: true,
      state_exists: false,
      wrote_database: false,
    };
  }
  const types = [
    ["project", "code_labs_projects", state.current_project_id],
    ["file", "code_labs_files", state.current_file_id],
    ["job", "code_labs_jobs", state.current_job_id],
    ["packet", "code_labs_packets", state.current_packet_id],
    ["test", "code_labs_test_runs", state.current_test_run_id],
  ];
  const current: Row = {};
  for (const [label, table, id] of types) {
    current[String(label)] = id
      ? await one(
        String(table) + "?select=*&id=eq." + encodeURIComponent(String(id)) +
          "&owner_id=eq." + encodeURIComponent(bindingValue.owner_id) + "&limit=1",
      )
      : null;
  }
  return {
    ok: true,
    version: VERSION,
    tool: "get_code_labs_workspace",
    workspace: state,
    current,
    read_only: true,
    state_exists: true,
    wrote_database: false,
  };
}

async function readExistingCurrentFile(bindingValue: Row) {
  const state = await one(
    "code_labs_workspace_state?select=current_file_id&owner_id=eq." +
      encodeURIComponent(bindingValue.owner_id) + "&limit=1",
  );
  if (!state?.current_file_id) {
    throw new Error("No existing workspace file selection is available.");
  }
  const file = await one(
    "code_labs_files?select=*&id=eq." +
      encodeURIComponent(String(state.current_file_id)) + "&owner_id=eq." +
      encodeURIComponent(bindingValue.owner_id) + "&limit=1",
  );
  if (!file) throw new Error("The selected owner-scoped file was not found.");
  return {
    ok: true,
    version: VERSION,
    tool: "read_code_labs_current_file",
    file,
    read_only: true,
    wrote_database: false,
  };
}

async function call(bindingValue: Row, name: string, args: Row) {
  if (V105_STAGING_SAFE_MODE) {
    if (MUTATION_TOOLS.has(name)) return safeModeBlocked(name);
    if (name === "run_code_labs_action") {
      const action = String(args.action || "");
      if (!READ_ONLY_ACTIONS.has(action)) return safeModeBlocked(name, action);
    }
  }

  if (name === "get_code_labs_context") return getContext(bindingValue, args.limit);
  if (name === "read_code_labs_url") return readUrl(args);
  if (name === "get_code_labs_workspace") {
    return V105_STAGING_SAFE_MODE
      ? readExistingWorkspace(bindingValue)
      : getWorkspace(bindingValue);
  }
  if (name === "list_code_labs_records") return listRecords(bindingValue, args);
  if (name === "read_code_labs_current_file") {
    return V105_STAGING_SAFE_MODE
      ? readExistingCurrentFile(bindingValue)
      : readCurrentFile(bindingValue);
  }
  if (name === "list_code_labs_actions") {
    const value = listActions();
    return {
      ...value,
      version: VERSION,
      staging_safe_mode: V105_STAGING_SAFE_MODE,
      github_execution_lane: "independent_v105_operations",
    };
  }
  if (name === "read_code_labs_receipt") return readReceipt(bindingValue, args);
  if (name === "get_cg_repair_lab_access") return getCgRepairLabAccess(bindingValue);
  if (name === "get_cg_repair_lab_workflow") return getCgRepairLabWorkflow();
  if (name === "analyze_code_labs_repository") {
    return analyzeCgRepairLab(bindingValue, args);
  }
  if (name === "list_code_labs_owner_gallery_images") {
    return listOwnerGalleryReferences(bindingValue);
  }
  if (name === "read_code_labs_owner_gallery_image") {
    return readOwnerGalleryImage(bindingValue, args);
  }
  if (name === "select_code_labs_record") return selectRecord(bindingValue, args);
  if (name === "update_code_labs_project") return updateProject(bindingValue, args);
  if (name === "update_code_labs_current_file") {
    return updateCurrentFile(bindingValue, args);
  }
  if (name === "update_code_labs_repair_job") return updateJob(bindingValue, args);
  if (name === "upsert_code_labs_packet") return updatePacket(bindingValue, args);
  if (name === "save_code_labs_candidate") return saveCandidate(bindingValue, args);
  if (name === "upsert_code_labs_test_result") return updateTest(bindingValue, args);
  if (name === "create_code_labs_checkpoint") {
    return createCheckpoint(bindingValue, args);
  }
  if (name === "run_code_labs_action") return runAction(bindingValue, args);
  if (name === "undo_code_labs_action") return undoAction(bindingValue, args);
  if (name === "save_code_labs_write_request") return saveRequest(bindingValue, args);
  if (name === "read_code_labs_repository") {
    rejectWorkspaceVersion(args);
    return protectRepositoryRead(await readRepository(bindingValue, args));
  }
  if (name === "create_code_labs_github_branch") {
    rejectWorkspaceVersion(args);
    return createBranch(bindingValue, args);
  }
  if (name === "create_code_labs_github_file") {
    rejectWorkspaceVersion(args);
    return createFile(bindingValue, args);
  }
  if (name === "update_code_labs_github_file") {
    rejectWorkspaceVersion(args);
    return updateFile(bindingValue, args);
  }
  if (name === "create_or_reuse_code_labs_draft_pr") {
    rejectWorkspaceVersion(args);
    return createOrReuseDraftPr(bindingValue, args);
  }
  if (name === "inspect_code_labs_pull_request") {
    rejectWorkspaceVersion(args);
    return inspectPullRequest(bindingValue, args);
  }
  if (name === "inspect_code_labs_github_operation") {
    rejectWorkspaceVersion(args);
    return inspectGithubOperation(bindingValue, args);
  }
  throw new Error("Unknown Code Labs V105 tool.");
}

function toolResult(name: string, result: Row) {
  if (name === "read_code_labs_owner_gallery_image" && result.ok !== false) {
    const { data, ...metadata } = result;
    return {
      content: [
        { type: "text", text: JSON.stringify(metadata, null, 2) },
        {
          type: "image",
          data: String(data || ""),
          mimeType: String(result.mime_type || "image/jpeg"),
        },
      ],
      structuredContent: metadata,
      isError: false,
    };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    structuredContent: result,
    isError: result?.ok === false,
  };
}

function health() {
  return {
    ok: true,
    version: VERSION,
    connector: CONNECTOR,
    architecture: ARCHITECTURE,
    private_tool_only_mcp: true,
    widget: false,
    staging_safe_mode: V105_STAGING_SAFE_MODE,
    application_mutations_enabled: false,
    workspace_mutations_enabled: false,
    github_mutations_enabled: false,
    storage_mutations_enabled: false,
    oauth_control_plane_enabled: true,
    oauth_control_plane_writes_limited: true,
    database_migrations_required_for_github_mutations: true,
    oauth_control_plane_write_scope: [
      "authorization grant creation",
      "authorization code consumption",
    ],
    scope: SCOPE,
    claim: CLAIM,
    endpoint: BASE,
    tools: tools(),
    secrets_returned: false,
    owner_ids_returned: false,
    installation_ids_returned: false,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const path = new URL(req.url).pathname;
  try {
    if (
      path.endsWith("/.well-known/oauth-authorization-server") ||
      path.endsWith("/.well-known/openid-configuration")
    ) return json(metadata());
    if (path.endsWith("/.well-known/oauth-protected-resource")) {
      return json(protectedResource());
    }
    if (path.endsWith("/oauth/register") && req.method === "POST") {
      return json(await register(req), 201);
    }
    if (path.endsWith("/oauth/authorize")) return go(await authorize(req));
    if (path.endsWith("/oauth/token") && req.method === "POST") {
      return json(await token(req));
    }
    if (req.method !== "POST") return json(health());

    const body = await req.json().catch(() => ({}));
    const id = body.id ?? null;
    if (body.jsonrpc === "2.0") {
      if (body.method === "initialize") {
        return rpc(id, {
          protocolVersion: "2025-06-18",
          capabilities: { tools: { listChanged: true } },
          serverInfo: { name: CONNECTOR, version: VERSION },
          instructions:
            "Code Labs V105 is a private tool-only MCP app. Staging safe mode blocks application, workspace, GitHub and storage mutations dispatched through MCP tools. OAuth registration, authorization and token protocol routes remain enabled outside the MCP tool dispatcher. OAuth authorization may create a grant record, and authorization-code exchange may mark that grant as consumed. Read-only repository access redacts credential-shaped values. Independent GitHub operations never accept expected_state_version.",
        });
      }
      if (body.method === "ping") return rpc(id, {});
      if (body.method === "notifications/initialized") {
        return new Response(null, { status: 202, headers: cors });
      }
      if (body.method === "tools/list") return rpc(id, { tools: tools() });
      if (body.method === "resources/list") return rpc(id, { resources: [] });
      if (body.method === "prompts/list") return rpc(id, { prompts: [] });
      if (body.method === "tools/call") {
        const bindingValue = await binding(req);
        const name = String(body.params?.name || "");
        const result = await call(
          bindingValue,
          name,
          body.params?.arguments || {},
        );
        return rpc(id, toolResult(name, result));
      }
      return rpcError(id, -32601, "Unknown method", 404);
    }

    const bindingValue = await binding(req);
    return json(
      await call(bindingValue, String(body.tool || body.name || ""), body),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /Missing bearer token|OAuth token|sign-in|authorization/i.test(
        message,
      )
      ? 401
      : 400;
    return json(
      {
        ok: false,
        version: VERSION,
        error: message,
        staging_safe_mode: V105_STAGING_SAFE_MODE,
        wrote_database: false,
        wrote_github: false,
        opened_pr: false,
        deleted_anything: false,
        workspace_state_changed: false,
      },
      status,
      status === 401
        ? {
          "WWW-Authenticate":
            `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"`,
        }
        : {},
    );
  }
});
