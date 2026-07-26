import {
  SCOPE,
  authorize,
  binding,
  register,
  token,
} from "../code-labs-mcp-stub/oauth.ts";
import { getContext, readUrl, saveRequest, VERSION as V104_VERSION } from "../code-labs-mcp-stub/context.ts";
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
} from "../code-labs-mcp-stub/guarded-workspace.ts";
import {
  analyzeCgRepairLab,
  getCgRepairLabAccess,
  getCgRepairLabWorkflow,
} from "../code-labs-mcp-stub/cg-repair-lab.ts";
import {
  listOwnerGalleryReferences,
  readOwnerGalleryImage,
} from "../code-labs-mcp-stub/owner-gallery-reader.ts";
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

const VERSION = "Code Labs V105 unified candidate V2 credential-safe reads";
const PROJECT_URL = "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const BASE = PROJECT_URL + "/functions/v1/code-labs-live-v105";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...cors, ...extra, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
const go = (url: string) => new Response(null, { status: 302, headers: { ...cors, Location: url, "Cache-Control": "no-store" } });
const rpc = (id: unknown, result: unknown) => json({ jsonrpc: "2.0", id: id ?? null, result });
const rpcError = (id: unknown, code: number, message: string, status = 400) =>
  json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);
const read = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const privateWrite = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const destructiveWrite = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };
const resultSchema = { type: "object", additionalProperties: true };
const fields = { type: "object", additionalProperties: true };
const expected = { type: "number", minimum: 1 };
const operationKey = { type: "string", pattern: "^[A-Za-z0-9._:-]{8,200}$" };
const repo = { type: "string", pattern: "^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$" };
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
    { name: "get_code_labs_context", title: "Get Code Labs Context", description: "Read owner-scoped Code Labs projects, jobs, packets, tests and audit events.", inputSchema: { type: "object", properties: { limit: { type: "number", minimum: 1, maximum: 25 } }, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_url", title: "Read Code Labs URL", description: "Read an approved public Code Labs URL without changing it.", inputSchema: { type: "object", properties: { url: { type: "string" }, max_chars: { type: "number", maximum: 60000 } }, required: ["url"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "get_code_labs_workspace", title: "Get Code Labs Workspace", description: "Read the owner workspace and current selections. Workspace creation remains state-locked.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "list_code_labs_records", title: "List Code Labs Records", description: "List owner-scoped projects, files, jobs, packets or tests.", inputSchema: { type: "object", properties: { record_type: { type: "string", enum: ["project", "file", "job", "packet", "test"] }, limit: { type: "number", minimum: 1, maximum: 50 } }, required: ["record_type"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_current_file", title: "Read Current Code Labs File", description: "Read the complete selected Code Labs file row.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "list_code_labs_actions", title: "List Code Labs Actions", description: "List workspace actions. GitHub execution is exposed separately through V105 operation tools.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_receipt", title: "Read Code Labs Receipt", description: "Read an owner-scoped workspace action receipt.", inputSchema: { type: "object", properties: { receipt_id: { type: "string" } }, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "get_cg_repair_lab_access", title: "Get CG Repair Lab Access", description: "Check Code Labs Pro access and owner-authorised repositories without returning credential values.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "get_cg_repair_lab_workflow", title: "Get CG Repair Lab Workflow", description: "Read the authoritative CG Repair Lab, Code God and Writer workflow mapping.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "analyze_code_labs_repository", title: "Analyze Repository with CG Repair Lab", description: "Run owner-scoped, read-only, credential-redacting CG Repair Lab analysis.", inputSchema: { type: "object", properties: { repo, ref: { type: "string" }, path: { type: "string" } }, required: ["repo", "path"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "list_code_labs_owner_gallery_images", title: "List Code Labs Owner Gallery Images", description: "List private Pro owner-gallery images as opaque references only.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_owner_gallery_image", title: "Read Code Labs Owner Gallery Image", description: "Read one selected private gallery image without exposing its storage path or signed URL.", inputSchema: { type: "object", properties: { reference: { type: "string", pattern: "^img_[a-f0-9]{64}$" } }, required: ["reference"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "select_code_labs_record", title: "Select Code Labs Record", description: "Select a workspace record using expected_state_version.", inputSchema: { type: "object", properties: { record_type: { type: "string", enum: ["project", "file", "job", "packet", "test"] }, record_id: { type: "string" }, expected_state_version: expected }, required: ["record_type", "record_id", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "update_code_labs_project", title: "Update Code Labs Project", description: "Update the selected project under workspace state locking.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "update_code_labs_current_file", title: "Update Current Code Labs File", description: "Replace the selected workspace file under state locking.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "update_code_labs_repair_job", title: "Update Code Labs Repair Job", description: "Update the selected repair job under workspace state locking.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "upsert_code_labs_packet", title: "Update Code Labs Packet", description: "Update the selected packet under workspace state locking.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "save_code_labs_candidate", title: "Save Code Labs Candidate", description: "Save candidate code separately under workspace state locking.", inputSchema: { type: "object", properties: { candidate_code: { type: "string" }, note: { type: "string" }, expected_state_version: expected }, required: ["candidate_code", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "upsert_code_labs_test_result", title: "Update Code Labs Test Result", description: "Update the selected test under workspace state locking.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "create_code_labs_checkpoint", title: "Create Code Labs Checkpoint", description: "Create a deliberate workspace checkpoint under state locking.", inputSchema: { type: "object", properties: { label: { type: "string" }, note: { type: "string" }, confirmed: { type: "boolean" }, expected_state_version: expected }, required: ["confirmed", "expected_state_version"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "run_code_labs_action", title: "Run Code Labs Workspace Action", description: "Run one strict workspace action. GitHub execution actions are rejected in V105 and must use independent operation tools.", inputSchema: { type: "object", properties: { action: { type: "string" }, record_id: { type: "string" }, request_id: { type: "string" }, expected_state_version: expected, confirmed: { type: "boolean" }, label: { type: "string" }, note: { type: "string" }, fields, candidate_code: { type: "string" } }, required: ["action"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "undo_code_labs_action", title: "Undo Code Labs Action", description: "Restore an eligible workspace mutation from its receipt.", inputSchema: { type: "object", properties: { receipt_id: { type: "string" } }, required: ["receipt_id"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "save_code_labs_write_request", title: "Save Legacy Reviewed Write Request", description: "Preserved V104 queue preparation. V105 GitHub execution does not consume workspace state or this queue.", inputSchema: { type: "object", properties: { repo, path: { type: "string" }, branch, content: { type: "string" }, action: { type: "string" }, commit_message: { type: "string" }, pr_title: { type: "string" }, pr_body: { type: "string" }, confirm_branch_pr_only: { type: "boolean" } }, required: ["repo", "path", "branch", "content", "commit_message", "pr_title", "confirm_branch_pr_only"], additionalProperties: false }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "read_code_labs_repository", title: "Read Owner-Authorised Repository", description: "Read repository metadata and optionally one complete source file with credential-shaped literal values redacted. Environment-variable names, identifiers and call sites remain visible. This tool never reads workspace state.", inputSchema: { type: "object", properties: { repo, ref: { type: "string" }, path: { type: "string" } }, required: ["repo"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "create_code_labs_github_branch", title: "Create GitHub Branch", description: "Create one non-main branch through an owner-authorised GitHub App operation with durable identity and claim protection. No expected_state_version is accepted.", inputSchema: { type: "object", properties: { operation_key: operationKey, repo, branch, base_ref: { type: "string" } }, required: ["operation_key", "repo", "branch", "base_ref"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "create_code_labs_github_file", title: "Create Complete GitHub File", description: "Create one complete file on an existing non-main branch after verifying its SHA-256 content hash. No expected_state_version is accepted.", inputSchema: { type: "object", properties: { operation_key: operationKey, repo, branch, path: { type: "string" }, content: { type: "string" }, content_hash: sha256, commit_message: { type: "string" } }, required: ["operation_key", "repo", "branch", "path", "content", "content_hash"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "update_code_labs_github_file", title: "Update Complete GitHub File", description: "Replace one complete file on an existing non-main branch after exact expected blob SHA and content-hash verification. No expected_state_version is accepted.", inputSchema: { type: "object", properties: { operation_key: operationKey, repo, branch, path: { type: "string" }, expected_blob_sha: sha1, content: { type: "string" }, content_hash: sha256, commit_message: { type: "string" } }, required: ["operation_key", "repo", "branch", "path", "expected_blob_sha", "content", "content_hash"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "create_or_reuse_code_labs_draft_pr", title: "Create or Reuse Draft Pull Request", description: "Create or reuse one draft PR for a non-main head branch using durable operation identity. No merge is available.", inputSchema: { type: "object", properties: { operation_key: operationKey, repo, branch, base_ref: { type: "string" }, pr_title: { type: "string" }, pr_body: { type: "string" } }, required: ["operation_key", "repo", "branch", "base_ref", "pr_title"], additionalProperties: false }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "inspect_code_labs_pull_request", title: "Inspect Pull Request", description: "Inspect owner-authorised PR metadata and changed-file proof without changing GitHub or workspace state.", inputSchema: { type: "object", properties: { repo, pull_request_number: { type: "integer", minimum: 1 } }, required: ["repo", "pull_request_number"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
    { name: "inspect_code_labs_github_operation", title: "Inspect V105 GitHub Operation", description: "Read durable operation status and proof without reading workspace state.", inputSchema: { type: "object", properties: { operation_key: operationKey }, required: ["operation_key"], additionalProperties: false }, outputSchema: resultSchema, annotations: read },
  ];
}

function rejectWorkspaceVersion(args: Row) {
  if (Object.prototype.hasOwnProperty.call(args, "expected_state_version")) {
    throw new Error("V105 GitHub operation tools do not accept or read expected_state_version.");
  }
}

async function call(b: any, name: string, args: Row) {
  if (name === "get_code_labs_context") return getContext(b, args.limit);
  if (name === "read_code_labs_url") return readUrl(args);
  if (name === "get_code_labs_workspace") return getWorkspace(b);
  if (name === "list_code_labs_records") return listRecords(b, args);
  if (name === "read_code_labs_current_file") return readCurrentFile(b);
  if (name === "list_code_labs_actions") {
    const value = listActions();
    return { ...value, version: VERSION, github_execution_lane: "independent_v105_operations" };
  }
  if (name === "read_code_labs_receipt") return readReceipt(b, args);
  if (name === "get_cg_repair_lab_access") return getCgRepairLabAccess(b);
  if (name === "get_cg_repair_lab_workflow") return getCgRepairLabWorkflow();
  if (name === "analyze_code_labs_repository") return analyzeCgRepairLab(b, args);
  if (name === "list_code_labs_owner_gallery_images") return listOwnerGalleryReferences(b);
  if (name === "read_code_labs_owner_gallery_image") return readOwnerGalleryImage(b, args);
  if (name === "select_code_labs_record") return selectRecord(b, args);
  if (name === "update_code_labs_project") return updateProject(b, args);
  if (name === "update_code_labs_current_file") return updateCurrentFile(b, args);
  if (name === "update_code_labs_repair_job") return updateJob(b, args);
  if (name === "upsert_code_labs_packet") return updatePacket(b, args);
  if (name === "save_code_labs_candidate") return saveCandidate(b, args);
  if (name === "upsert_code_labs_test_result") return updateTest(b, args);
  if (name === "create_code_labs_checkpoint") return createCheckpoint(b, args);
  if (name === "run_code_labs_action") {
    if (["github.writer_execute", "execute_code_labs_github_writer"].includes(String(args.action || ""))) {
      throw new Error("V105 GitHub execution is separate from workspace state. Use the independent GitHub operation tools.");
    }
    return runAction(b, args);
  }
  if (name === "undo_code_labs_action") return undoAction(b, args);
  if (name === "save_code_labs_write_request") return saveRequest(b, args);
  if (name === "read_code_labs_repository") {
    rejectWorkspaceVersion(args);
    return protectRepositoryRead(await readRepository(b, args));
  }
  if (name === "create_code_labs_github_branch") {
    rejectWorkspaceVersion(args);
    return createBranch(b, args);
  }
  if (name === "create_code_labs_github_file") {
    rejectWorkspaceVersion(args);
    return createFile(b, args);
  }
  if (name === "update_code_labs_github_file") {
    rejectWorkspaceVersion(args);
    return updateFile(b, args);
  }
  if (name === "create_or_reuse_code_labs_draft_pr") {
    rejectWorkspaceVersion(args);
    return createOrReuseDraftPr(b, args);
  }
  if (name === "inspect_code_labs_pull_request") {
    rejectWorkspaceVersion(args);
    return inspectPullRequest(b, args);
  }
  if (name === "inspect_code_labs_github_operation") {
    rejectWorkspaceVersion(args);
    return inspectGithubOperation(b, args);
  }
  throw new Error("Unknown Code Labs V105 tool.");
}

function toolResult(name: string, result: Row) {
  if (name !== "read_code_labs_owner_gallery_image") {
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result, isError: false };
  }
  const { data, ...metadata } = result;
  return {
    content: [
      { type: "text", text: JSON.stringify(metadata, null, 2) },
      { type: "image", data: String(data || ""), mimeType: String(result.mime_type || "image/jpeg") },
    ],
    structuredContent: metadata,
    isError: false,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const path = new URL(req.url).pathname;
  try {
    if (path.endsWith("/.well-known/oauth-authorization-server") || path.endsWith("/.well-known/openid-configuration")) return json(metadata());
    if (path.endsWith("/.well-known/oauth-protected-resource")) return json(protectedResource());
    if (path.endsWith("/oauth/register") && req.method === "POST") return json(await register(req), 201);
    if (path.endsWith("/oauth/authorize")) return go(await authorize(req));
    if (path.endsWith("/oauth/token") && req.method === "POST") return json(await token(req));
    if (req.method !== "POST") {
      return json({
        ok: true,
        version: VERSION,
        canonical_workspace_version: V104_VERSION,
        connector: "code-labs-live-v105-unified",
        architecture: "workspace-locks-plus-independent-github-operations",
        scope: SCOPE,
        tools: tools(),
        endpoint: BASE,
        retired_live_source_replaced: false,
      });
    }
    const body = await req.json().catch(() => ({}));
    const id = body.id ?? null;
    if (body.jsonrpc === "2.0") {
      if (body.method === "initialize") {
        return rpc(id, {
          protocolVersion: "2025-06-18",
          capabilities: { tools: { listChanged: true } },
          serverInfo: { name: "code-labs-live-v105-unified", version: VERSION },
          instructions: "Workspace writes retain expected_state_version locking. GitHub reads and writes use a separate durable operation lane that never accepts, reads or increments workspace state. Repository reads redact credential-shaped literal values while preserving identifiers, environment-variable names and call sites. All GitHub mutations require owner-authorised repository binding, a non-main branch, durable operation identity, claim/idempotency protection and proof.",
        });
      }
      if (body.method === "ping") return rpc(id, {});
      if (body.method === "notifications/initialized") return new Response(null, { status: 202, headers: cors });
      if (body.method === "tools/list") return rpc(id, { tools: tools() });
      if (body.method === "resources/list") return rpc(id, { resources: [] });
      if (body.method === "prompts/list") return rpc(id, { prompts: [] });
      if (body.method === "tools/call") {
        const b = await binding(req);
        const name = String(body.params?.name || "");
        const result = await call(b, name, body.params?.arguments || {});
        return rpc(id, toolResult(name, result));
      }
      return rpcError(id, -32601, "Unknown method", 404);
    }
    const b = await binding(req);
    return json(await call(b, String(body.tool || body.name || ""), body));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /Missing bearer token|OAuth token|sign-in|authorization/i.test(message) ? 401 : 400;
    return json({
      ok: false,
      version: VERSION,
      error: message,
      wrote_database: false,
      wrote_github: false,
      opened_pr: false,
      deleted_anything: false,
      workspace_state_changed: false,
    }, status, status === 401 ? { "WWW-Authenticate": `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"` } : {});
  }
});
