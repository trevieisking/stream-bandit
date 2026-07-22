import { BASE, SCOPE, authorize, binding, register, rest, token } from "./oauth.ts";
import { VERSION, getContext, readUrl, saveRequest } from "./context.ts";
import { createCheckpoint, executeDirectGithubWriter, getWorkspace, listActions, listRecords, readCurrentFile, readReceipt, runAction, saveCandidate, selectRecord, undoAction, updateCurrentFile, updateJob, updatePacket, updateProject, updateTest } from "./guarded-workspace.ts";
import { analyzeCgRepairLab, getCgRepairLabAccess, getCgRepairLabWorkflow } from "./cg-repair-lab.ts";
import { githubRequest, verifyOwnerRepository } from "./github-authority.ts";
import { listOwnerGalleryReferences, readOwnerGalleryImage } from "./owner-gallery-reader.ts";

type Row = Record<string, any>;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(body, null, 2), { status, headers: { ...cors, ...extra, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const go = (url: string) => new Response(null, { status: 302, headers: { ...cors, Location: url, "Cache-Control": "no-store" } });
const rpc = (id: unknown, result: unknown) => json({ jsonrpc: "2.0", id: id ?? null, result });
const rpcError = (id: unknown, code: number, message: string, status = 400) => json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);
const protectedResource = () => ({ resource: BASE, authorization_servers: [BASE], bearer_methods_supported: ["header"], scopes_supported: ["code_labs.read", "code_labs.write"] });
const metadata = () => ({ issuer: BASE, authorization_endpoint: BASE + "/oauth/authorize", token_endpoint: BASE + "/oauth/token", registration_endpoint: BASE + "/oauth/register", response_types_supported: ["code"], response_modes_supported: ["query"], grant_types_supported: ["authorization_code", "refresh_token"], token_endpoint_auth_methods_supported: ["none"], code_challenge_methods_supported: ["S256"], scopes_supported: ["code_labs.read", "code_labs.write"] });

const read = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const privateWrite = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const destructiveWrite = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };
const resultSchema = { type: "object", additionalProperties: true };
const fields = { type: "object", additionalProperties: true };
const expected = { type: "number", minimum: 1 };

function tools() {
  return [
    { name: "get_code_labs_context", title: "Get Code Labs Context", description: "Read saved Code Labs projects, jobs, packets, tests, and audit events.", inputSchema: { type: "object", properties: { limit: { type: "number", minimum: 1, maximum: 25 } } }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_url", title: "Read Code Labs URL", description: "Read a public Code Labs URL without changing it.", inputSchema: { type: "object", properties: { url: { type: "string" }, max_chars: { type: "number", maximum: 60000 } }, required: ["url"] }, outputSchema: resultSchema, annotations: read },
    { name: "get_code_labs_workspace", title: "Get Code Labs Workspace", description: "Read the owner workspace selection and current records; creates the single owner-state row on first use when absent.", inputSchema: { type: "object", properties: {} }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "list_code_labs_records", title: "List Code Labs Records", description: "List existing projects, files, jobs, packets, or tests.", inputSchema: { type: "object", properties: { record_type: { type: "string", enum: ["project", "file", "job", "packet", "test"] }, limit: { type: "number", minimum: 1, maximum: 50 } }, required: ["record_type"] }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_current_file", title: "Read Current Code Labs File", description: "Read the complete currently selected Code Labs file row.", inputSchema: { type: "object", properties: {} }, outputSchema: resultSchema, annotations: read },
    { name: "list_code_labs_actions", title: "List Code Labs Actions", description: "List the strict server-side Code Labs action IDs available to V104.", inputSchema: { type: "object", properties: {} }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_receipt", title: "Read Code Labs Receipt", description: "Read one action receipt or the most recent receipt.", inputSchema: { type: "object", properties: { receipt_id: { type: "string" } } }, outputSchema: resultSchema, annotations: read },
    { name: "get_cg_repair_lab_access", title: "Get CG Repair Lab Access", description: "Check the signed-in owner's Code Labs Pro entitlement and owner-scoped GitHub repository bindings. This read-only check never returns credential values, user identifiers, email addresses, or installation metadata.", inputSchema: { type: "object", properties: {} }, outputSchema: resultSchema, annotations: read },
    { name: "get_cg_repair_lab_workflow", title: "Get CG Repair Lab Workflow", description: "Read the authoritative mapping between every CG Repair Lab control and the Code Labs V104, Tool-Only, Code God, and Writer tools. This does not read repository contents or change state.", inputSchema: { type: "object", properties: {} }, outputSchema: resultSchema, annotations: read },
    { name: "analyze_code_labs_repository", title: "Analyze Repository with CG Repair Lab", description: "Run Code Labs Pro's read-only CG Repair Lab across the selected owner-authorized GitHub repository. It reports dependency, database and exact secret-reference call sites while redacting credential-shaped values. It cannot replace source, commit, merge, deploy, change a database, or bypass Code God and GitHub Writer.", inputSchema: { type: "object", properties: { repo: { type: "string", description: "Owner-authorized repository in owner/name form." }, ref: { type: "string", description: "Optional branch, tag, or commit ref. Defaults to the verified repository's default branch." }, path: { type: "string", description: "Repository-relative source file to prepare as the optional complete-file candidate." } }, required: ["repo", "path"] }, outputSchema: resultSchema, annotations: read },
    { name: "list_code_labs_owner_gallery_images", title: "List Code Labs Owner Gallery Images", description: "List the signed-in Code Labs owner's private gallery as opaque image references. Rechecks owner and active Pro access server-side and returns no filenames, owner identifiers, object paths, or signed URLs. This tool cannot upload, replace, or delete images.", inputSchema: { type: "object", properties: {} }, outputSchema: resultSchema, annotations: read },
    { name: "read_code_labs_owner_gallery_image", title: "Read Code Labs Owner Gallery Image", description: "Read one deliberately selected private owner-gallery image by its opaque reference. Rechecks owner and active Pro access server-side and returns the image directly without exposing a filename, owner identifier, object path, or signed URL. This tool cannot upload, replace, or delete images.", inputSchema: { type: "object", properties: { reference: { type: "string", pattern: "^img_[a-f0-9]{64}$" } }, required: ["reference"] }, outputSchema: resultSchema, annotations: read },
    { name: "select_code_labs_record", title: "Select Code Labs Record", description: "Select an existing project, file, job, packet, or test without creating a duplicate; requires the current workspace version.", inputSchema: { type: "object", properties: { record_type: { type: "string", enum: ["project", "file", "job", "packet", "test"] }, record_id: { type: "string" }, expected_state_version: expected }, required: ["record_type", "record_id", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "update_code_labs_project", title: "Update Code Labs Project", description: "Update the selected project in place after matching the current workspace version.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "update_code_labs_current_file", title: "Update Current Code Labs File", description: "Update the selected file row in place after matching the current workspace version; never creates a duplicate file.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"] }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "update_code_labs_repair_job", title: "Update Code Labs Repair Job", description: "Update the selected repair job in place after matching the current workspace version.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "upsert_code_labs_packet", title: "Update Code Labs Packet", description: "Update the selected packet in place after matching the current workspace version; does not create a duplicate packet.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "save_code_labs_candidate", title: "Save Code Labs Candidate", description: "Save candidate code in selected-file metadata without replacing current_code; requires the current workspace version.", inputSchema: { type: "object", properties: { candidate_code: { type: "string" }, note: { type: "string" }, expected_state_version: expected }, required: ["candidate_code", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "upsert_code_labs_test_result", title: "Update Code Labs Test Result", description: "Update the selected test result in place after matching the current workspace version; does not create a duplicate test row.", inputSchema: { type: "object", properties: { fields, expected_state_version: expected }, required: ["fields", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "create_code_labs_checkpoint", title: "Create Code Labs Checkpoint", description: "Create one deliberate version checkpoint from the selected current file after matching the current workspace version.", inputSchema: { type: "object", properties: { label: { type: "string" }, note: { type: "string" }, confirmed: { type: "boolean" }, expected_state_version: expected }, required: ["confirmed", "expected_state_version"] }, outputSchema: resultSchema, annotations: privateWrite },
    { name: "run_code_labs_action", title: "Run Code Labs Action", description: "Run one strict server-side Code Labs action ID. State-changing actions require the current workspace version; this never clicks a browser page.", inputSchema: { type: "object", properties: { action: { type: "string" }, record_id: { type: "string" }, request_id: { type: "string" }, expected_state_version: expected, confirmed: { type: "boolean" }, label: { type: "string" }, note: { type: "string" }, fields, candidate_code: { type: "string" } }, required: ["action"] }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "execute_code_labs_github_writer", title: "Execute Code Labs GitHub Writer", description: "Use this only after a Code God PASS and a queued branch-and-PR request exist. It verifies an existing non-protected branch, commits one complete reviewed file through the configured GitHub App, opens or reuses a draft pull request, and records GitHub proof in Supabase. It cannot write to main, delete files, merge, force-push, or modify workflow files.", inputSchema: { type: "object", properties: { request_id: { type: "string" }, expected_state_version: expected, confirmed: { type: "boolean" } }, required: ["request_id", "expected_state_version", "confirmed"] }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "undo_code_labs_action", title: "Undo Code Labs Action", description: "Restore an eligible in-place Code Labs write from its receipt.", inputSchema: { type: "object", properties: { receipt_id: { type: "string" } }, required: ["receipt_id"] }, outputSchema: resultSchema, annotations: destructiveWrite },
    { name: "save_code_labs_write_request", title: "Save Code Labs Write Request", description: "Queue one private full-file GitHub branch-and-pull-request request. It never writes GitHub or main directly.", inputSchema: { type: "object", properties: { repo: { type: "string" }, path: { type: "string" }, branch: { type: "string" }, content: { type: "string" }, action: { type: "string" }, commit_message: { type: "string" }, pr_title: { type: "string" }, pr_body: { type: "string" }, confirm_branch_pr_only: { type: "boolean" } }, required: ["repo", "path", "branch", "content", "commit_message", "pr_title", "confirm_branch_pr_only"] }, outputSchema: resultSchema, annotations: privateWrite },
  ];
}

function decodeBase64(value: string) {
  const binary = atob(String(value || "").replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

async function hashText(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeIntakePath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (!path || path.includes("..") || path.includes("\\") || path.startsWith(".") || /(?:^|\/)(?:secrets?|\.env[^/]*)$/i.test(path) || /\.(?:pem|key|p12|pfx)$/i.test(path) || path.startsWith(".github/")) {
    throw new Error("A safe repository-relative File Lab path is required.");
  }
  return path;
}

function fileType(path: string) {
  const name = path.split("/").pop() || path;
  const index = name.lastIndexOf(".");
  return index > -1 ? name.slice(index + 1).toLowerCase().slice(0, 20) : "text";
}

async function intakeReceipt(ownerId: string, fileId: string, created: boolean, path: string, stateVersion: number) {
  const rows = await rest("code_labs_action_receipts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: ownerId,
      action: "file.intake",
      record_type: "file",
      record_id: fileId,
      before_data: {},
      after_data: { path, selected: true, downstream_cleared: true, state_version: stateVersion },
      changed_fields: ["current_file_id", "current_job_id", "current_packet_id", "current_test_run_id", "workflow_step", "state_version"],
      created_new_row: created,
      undo_available: false,
    }),
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function intakeFile(b: any, args: Row) {
  const expectedVersion = Number(args.expected_state_version);
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) throw new Error("expected_state_version is required.");
  const input = args.fields && typeof args.fields === "object" ? args.fields : {};
  const path = safeIntakePath(input.path);
  const repo = String(input.repo || "").trim();
  const stateRows = await rest("code_labs_workspace_state?select=*&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1");
  const before = Array.isArray(stateRows) ? stateRows[0] || null : null;
  if (!before || Number(before.state_version) !== expectedVersion) throw new Error("Workspace state changed. Read the workspace again before writing.");
  if (!before.current_project_id) throw new Error("Select the File Lab project first.");
  const projectRows = await rest("code_labs_projects?select=id,repo&owner_id=eq." + encodeURIComponent(b.owner_id) + "&id=eq." + encodeURIComponent(before.current_project_id) + "&limit=1");
  const project = Array.isArray(projectRows) ? projectRows[0] || null : null;
  if (!project || String(project.repo || "") !== repo) throw new Error("The selected File Lab project and requested repository do not match.");
  const authority = await verifyOwnerRepository(b.owner_id, repo, { contents: "read", metadata: "read" });
  const ref = String(input.ref || authority.default_branch).trim();
  if (!ref || ref.length > 200 || /[\u0000-\u001f\u007f]/.test(ref)) throw new Error("A safe repository ref is required.");
  const source = await githubRequest("/repos/" + repo.split("/").map(encodeURIComponent).join("/") + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(ref), authority.token);
  if (!source || source.type !== "file" || source.encoding !== "base64" || typeof source.content !== "string") throw new Error("GitHub did not return one readable File Lab source file.");
  const code = decodeBase64(source.content);
  const size = new TextEncoder().encode(code).length;
  if (!code || size > 750000) throw new Error("The File Lab source must be non-empty and under 750000 bytes.");
  const currentHash = await hashText(code);
  const now = new Date().toISOString();
  const lockedRows = await rest("code_labs_workspace_state?owner_id=eq." + encodeURIComponent(b.owner_id) + "&state_version=eq." + encodeURIComponent(expectedVersion), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ current_file_id: null, current_job_id: null, current_packet_id: null, current_test_run_id: null, workflow_step: "file", state_version: expectedVersion + 1, updated_at: now }),
  });
  const locked = Array.isArray(lockedRows) ? lockedRows[0] || null : null;
  if (!locked) throw new Error("Workspace state changed before File Lab intake could begin.");
  const matches = await rest("code_labs_files?select=*&owner_id=eq." + encodeURIComponent(b.owner_id) + "&project_id=eq." + encodeURIComponent(project.id) + "&filename=eq." + encodeURIComponent(path) + "&order=updated_at.desc&limit=2");
  if (!Array.isArray(matches)) throw new Error("File Lab could not read its exact file inventory.");
  if (matches.length > 1) throw new Error("Multiple File Lab rows already exist for this exact path. Resolve the duplicate before intake.");
  const sourceMetadata = {
    source: "file.intake",
    source_repo: repo,
    source_ref: ref,
    source_path: path,
    source_blob_sha: String(source.sha || ""),
    source_commit_sha: String(source._links?.git || "").split("/").pop() || null,
    verified_owner_repository: true,
    intake_at: now,
  };
  let file = matches[0] || null;
  let created = false;
  if (file) {
    const rows = await rest("code_labs_files?id=eq." + encodeURIComponent(file.id) + "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&project_id=eq." + encodeURIComponent(project.id), {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ filename: path, file_type: fileType(path), current_code: code, current_hash: currentHash, metadata: sourceMetadata, updated_at: now }),
    });
    file = Array.isArray(rows) ? rows[0] || null : null;
  } else {
    const rows = await rest("code_labs_files", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ owner_id: b.owner_id, project_id: project.id, filename: path, file_type: fileType(path), current_code: code, current_hash: currentHash, metadata: sourceMetadata }),
    });
    file = Array.isArray(rows) ? rows[0] || null : null;
    created = true;
  }
  if (!file) throw new Error("File Lab could not save the verified source file.");
  const selectedRows = await rest("code_labs_workspace_state?owner_id=eq." + encodeURIComponent(b.owner_id) + "&state_version=eq." + encodeURIComponent(expectedVersion + 1), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ current_file_id: file.id, current_job_id: null, current_packet_id: null, current_test_run_id: null, workflow_step: "file", state_version: expectedVersion + 2, updated_at: new Date().toISOString() }),
  });
  const selected = Array.isArray(selectedRows) ? selectedRows[0] || null : null;
  if (!selected) throw new Error("File Lab source was saved but the workspace changed before selection completed. Read the workspace before continuing.");
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "file.intake",
    file: { path, file_type: file.file_type, current_hash: currentHash, created, source_verified: true },
    workspace: { workflow_step: selected.workflow_step, state_version: selected.state_version, downstream_cleared: true },
    receipt: await intakeReceipt(b.owner_id, file.id, created, path, Number(selected.state_version)),
    wrote_database: true,
    wrote_github: false,
    opened_pr: false,
    deleted_anything: false,
  };
}

function actionsWithIntake() {
  const result = listActions();
  const actions = Array.isArray(result.actions) ? result.actions : [];
  return { ...result, actions: [{ action: "file.intake", requires_confirmation: false }, ...actions] };
}

async function call(b: any, name: string, args: Row) {
  if (name === "get_code_labs_context") return getContext(b, args.limit);
  if (name === "read_code_labs_url") return readUrl(args);
  if (name === "get_code_labs_workspace") return getWorkspace(b);
  if (name === "list_code_labs_records") return listRecords(b, args);
  if (name === "read_code_labs_current_file") return readCurrentFile(b);
  if (name === "list_code_labs_actions") return actionsWithIntake();
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
  if (name === "run_code_labs_action") return String(args.action || "") === "file.intake" ? intakeFile(b, args) : runAction(b, args);
  if (name === "execute_code_labs_github_writer") return executeDirectGithubWriter(b, args);
  if (name === "undo_code_labs_action") return undoAction(b, args);
  if (name === "save_code_labs_write_request") return saveRequest(b, args);
  throw new Error("Unknown tool.");
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
  const p = new URL(req.url).pathname;
  try {
    if (p.endsWith("/.well-known/oauth-authorization-server") || p.endsWith("/.well-known/openid-configuration")) return json(metadata());
    if (p.endsWith("/.well-known/oauth-protected-resource")) return json(protectedResource());
    if (p.endsWith("/oauth/register") && req.method === "POST") return json(await register(req), 201);
    if (p.endsWith("/oauth/authorize")) return go(await authorize(req));
    if (p.endsWith("/oauth/token") && req.method === "POST") return json(await token(req));
    if (req.method !== "POST") return json({ ok: true, version: VERSION, connector: "code-labs-v104", architecture: "tool-only", scope: SCOPE, tools: tools(), endpoint: BASE });
    const body = await req.json().catch(() => ({}));
    const id = body.id ?? null;
    if (body.jsonrpc === "2.0") {
      if (body.method === "initialize") return rpc(id, { protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: true } }, serverInfo: { name: "code-labs-mcp-stub", version: VERSION }, instructions: "Use Code Labs V104 server tools directly. The reviewed route is File Lab, CG Repair Lab, Code God, then GitHub Writer. CG Repair Lab is Code Labs Pro, owner-scoped, read-only, and value-redacting. The private owner gallery is available only through opaque read-only references and deliberate selected-image reads. No browser pairing, page session, page fingerprint, or live-tab control is used. Read the workspace before writes, supply its current state_version, inspect receipts, and keep GitHub changes branch and pull-request only." });
      if (body.method === "ping") return rpc(id, {});
      if (body.method === "notifications/initialized") return new Response(null, { status: 202, headers: cors });
      if (body.method === "tools/list") return rpc(id, { tools: tools() });
      if (body.method === "resources/list") return rpc(id, { resources: [] });
      if (body.method === "prompts/list") return rpc(id, { prompts: [] });
      if (body.method === "tools/call") {
        const b = await binding(req);
        const name = body.params?.name || "";
        const result = await call(b, name, body.params?.arguments || {});
        return rpc(id, toolResult(name, result));
      }
      return rpcError(id, -32601, "Unknown method", 404);
    }
    const b = await binding(req);
    return json(await call(b, body.tool || body.name || "", body));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = /Missing bearer token|OAuth token|sign-in/i.test(message) ? 401 : 400;
    return json({ ok: false, version: VERSION, error: message, wrote_database: false, wrote_github: false, opened_pr: false, deleted_anything: false }, status, status === 401 ? { "WWW-Authenticate": `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"` } : {});
  }
});