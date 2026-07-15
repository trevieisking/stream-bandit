import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";

type Row = Record<string, any>;
const REPO = "trevieisking/stream-bandit";
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);
const MAX_QUEUE_CONTENT = 180000;

function clone(value: unknown, max = 760000): Row {
  const text = JSON.stringify(value || {});
  if (text.length > max) throw new Error("Payload is too large.");
  return JSON.parse(text);
}

async function digest(value: unknown) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value ?? null)));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function selected(owner: string) {
  const state = await one("code_labs_workspace_state?select=*&owner_id=eq." + encodeURIComponent(owner) + "&limit=1");
  if (!state?.current_project_id || !state?.current_file_id) throw new Error("Select a project and file first.");
  const [project, file, job] = await Promise.all([
    one("code_labs_projects?select=*&id=eq." + encodeURIComponent(state.current_project_id) + "&owner_id=eq." + encodeURIComponent(owner) + "&limit=1"),
    one("code_labs_files?select=*&id=eq." + encodeURIComponent(state.current_file_id) + "&owner_id=eq." + encodeURIComponent(owner) + "&limit=1"),
    state.current_job_id ? one("code_labs_jobs?select=*&id=eq." + encodeURIComponent(state.current_job_id) + "&owner_id=eq." + encodeURIComponent(owner) + "&limit=1") : null,
  ]);
  if (!project || !file) throw new Error("The selected Code Labs records were not found.");
  return { state, project, file, job };
}

async function saveMetadata(owner: string, file: Row, metadata: Row) {
  const rows = await rest("code_labs_files?id=eq." + encodeURIComponent(file.id) + "&owner_id=eq." + encodeURIComponent(owner), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ metadata, updated_at: new Date().toISOString() }),
  });
  if (!Array.isArray(rows) || !rows[0]) throw new Error("The selected file could not be updated.");
  return rows[0];
}

async function receipt(owner: string, action: string, file: Row, before: unknown, after: unknown) {
  const rows = await rest("code_labs_action_receipts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: owner,
      action,
      record_type: "file",
      record_id: file.id,
      before_data: clone(before, 60000),
      after_data: clone(after, 60000),
      changed_fields: ["metadata"],
      created_new_row: false,
      undo_available: false,
    }),
  });
  return rows?.[0] || null;
}

function normalizeAction(value: unknown) {
  const v = String(value || "change").toLowerCase();
  if (v === "create") return "add";
  if (v === "delete") return "remove";
  return ["read", "add", "change", "review"].includes(v) ? v : "change";
}

function safePath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (!path || path.includes("..") || path.includes("\\") || path.startsWith(".") || path.toLowerCase().includes("secrets")) throw new Error("Target path is missing or unsafe.");
  if (/\.(env|pem|key|p12|pfx)$/i.test(path) || path.startsWith(".github/")) throw new Error("Target path is protected.");
  return path;
}

function safeBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (!/^[A-Za-z0-9._/-]{3,80}$/.test(branch) || PROTECTED.has(branch.toLowerCase())) throw new Error("Working branch is missing or protected.");
  return branch;
}

function completeFile(path: string, text: string) {
  const value = String(text || "").trim();
  if (!value || value.length < 120 || value.length > MAX_QUEUE_CONTENT) return false;
  if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(value)) return false;
  if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(value)) return false;
  if (/\.html?$/i.test(path) && !/<!doctype\s+html/i.test(value) && !/<html[\s>]/i.test(value)) return false;
  if (/\.json$/i.test(path)) { try { JSON.parse(value); } catch { return false; } }
  return true;
}

function secretLike(text: string) {
  const value = String(text || "");
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value)
    || /\bsk-[A-Za-z0-9_-]{20,}\b/.test(value)
    || /\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(value)
    || /\bBearer\s+[A-Za-z0-9._~-]{30,}\b/i.test(value)
    || /(?:password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i.test(value);
}

function finding(severity: string, rule_id: string, message: string, correction: string, blocks_github = true) {
  return { severity, rule_id, message, correction, blocks_github };
}

export async function prepareRepoHandoff(b: Binding, args: Row) {
  const c = await selected(b.owner_id);
  const fields = clone(args.fields || {});
  const mode = normalizeAction(fields.action);
  if (mode === "read" || mode === "review") throw new Error("Repo Desk handoff requires an add or change action.");
  const repo = String(fields.repo || c.project.repo || REPO);
  const sourceRepo = String(c.project.repo || repo);
  if (repo !== REPO || sourceRepo !== REPO) throw new Error("The repository identity does not match the approved Code Labs repository.");
  const path = safePath(fields.path || c.file.metadata?.path || c.file.filename);
  const branch = safeBranch(fields.branch);
  const proposed = String(fields.content ?? c.file.metadata?.fixed_output ?? "");
  if (!completeFile(path, proposed)) throw new Error("A complete proposed file under 180000 characters is required.");
  const handoff = {
    version: "V104-repo-flow-2",
    action: mode,
    repo,
    source_repo: sourceRepo,
    source_branch: String(fields.source_branch || "main"),
    request_branch: branch,
    path,
    original: String(c.file.current_code || ""),
    proposed,
    notes: String(fields.notes || c.job?.problem || "").slice(0, 12000),
    preserve: String(c.job?.dont_touch || "").slice(0, 12000),
    current_hash: await digest(String(c.file.current_code || "")),
    proposed_hash: await digest(proposed),
    created_at: new Date().toISOString(),
  };
  const metadataBefore = clone(c.file.metadata || {});
  const metadata = { ...metadataBefore, repo_handoff: handoff };
  delete metadata.code_god_review;
  delete metadata.github_writer_request;
  const file = await saveMetadata(b.owner_id, c.file, metadata);
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "repo.prepare_handoff",
    handoff: { ...handoff, original: undefined, proposed: undefined },
    file_id: file.id,
    receipt: await receipt(b.owner_id, "repo.prepare_handoff", c.file, metadataBefore.repo_handoff || {}, handoff),
  };
}

export async function reviewCodeGod(b: Binding) {
  const c = await selected(b.owner_id);
  const metadataBefore = clone(c.file.metadata || {});
  const handoff = clone(metadataBefore.repo_handoff || {});
  if (!handoff.path) throw new Error("Prepare the Repo Desk handoff first.");
  const proposed = String(handoff.proposed || "");
  const findings: Row[] = [];
  if (handoff.repo !== REPO || handoff.source_repo !== REPO) findings.push(finding("P1", "CG-IDENTITY-001", "The repository identity is not approved.", "Select the approved repository and prepare the handoff again."));
  if (!handoff.path || String(handoff.path).includes("..")) findings.push(finding("P1", "CG-IDENTITY-002", "The target path is missing or unsafe.", "Save one repository-relative path."));
  if (PROTECTED.has(String(handoff.request_branch || "").toLowerCase())) findings.push(finding("P0", "CG-BRANCH-001", "The requested branch is protected.", "Use a non-protected repair branch."));
  if (!completeFile(String(handoff.path), proposed)) findings.push(finding("P1", "CG-FULLFILE-001", "The proposed file is incomplete or too large for the queue.", "Save one complete file under 180000 characters."));
  if (handoff.action === "change" && handoff.original && proposed.length < Math.max(120, Math.floor(String(handoff.original).length * 0.65))) findings.push(finding("P1", "CG-TRUNCATION-001", "The proposed file may be truncated.", "Restore missing sections and review again."));
  if (/<<<<<<<|=======|>>>>>>>/.test(proposed)) findings.push(finding("P1", "CG-CONFLICT-001", "Conflict markers were found.", "Resolve all conflict markers."));
  if (/```(?:html|javascript|js|typescript|ts|json)?/i.test(proposed)) findings.push(finding("P2", "CG-FENCE-001", "Markdown fences appear inside the proposed file.", "Keep only complete file contents."));
  if (secretLike(proposed)) findings.push(finding("P0", "CG-SECRET-001", "Secret-like content appears in the proposed file.", "Remove the value and keep privileged values server-side only."));
  if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed)) findings.push(finding("P2", "CG-TIMER-001", "A frequent timer may duplicate work.", "Use a guarded single owner or explicit action.", false));
  const duplicateRows = await rest("code_labs_write_requests?select=id,status,branch,path,created_at&requested_by=eq." + encodeURIComponent(b.owner_id) + "&repo=eq." + encodeURIComponent(REPO) + "&path=eq." + encodeURIComponent(handoff.path) + "&branch=eq." + encodeURIComponent(handoff.request_branch) + "&status=in.(queued,processing)&order=created_at.desc&limit=3");
  if (Array.isArray(duplicateRows) && duplicateRows.length) findings.push(finding("P2", "CG-DUPLICATE-001", "A matching write request is already queued or processing.", "Reuse or close the existing request before queuing another.", false));
  const blocking = findings.some((item) => item.blocks_github);
  const outcome = blocking ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FIX_FIRST") : "PASS";
  const review = {
    version: "V104-code-god-2",
    outcome,
    handoff_hash: await digest(handoff),
    repo: handoff.repo,
    path: handoff.path,
    request_branch: handoff.request_branch,
    proposed_hash: handoff.proposed_hash,
    findings,
    checks_run: ["identity", "branch", "full-file", "queue-limit", "truncation", "conflicts", "fences", "secret-values", "duplicate-queue", "timers"],
    created_at: new Date().toISOString(),
  };
  const metadata = { ...metadataBefore, code_god_review: review };
  delete metadata.github_writer_request;
  const file = await saveMetadata(b.owner_id, c.file, metadata);
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "code_god.review", review, file_id: file.id, receipt: await receipt(b.owner_id, "code_god.review", c.file, metadataBefore.code_god_review || {}, review) };
}

export async function prepareGithubWriter(b: Binding, args: Row) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to prepare the GitHub request.");
  const c = await selected(b.owner_id);
  const metadataBefore = clone(c.file.metadata || {});
  const handoff = clone(metadataBefore.repo_handoff || {});
  const review = clone(metadataBefore.code_god_review || {});
  if (review.outcome !== "PASS") throw new Error("Code God PASS is required before GitHub Writer.");
  if (review.handoff_hash !== await digest(handoff) || review.proposed_hash !== handoff.proposed_hash) throw new Error("The reviewed handoff changed. Run Code God again.");
  const content = String(handoff.proposed || "");
  if (!content || content.length > MAX_QUEUE_CONTENT) throw new Error("Queued content must be under 180000 characters.");
  const existing = await one("code_labs_write_requests?select=id,status,branch,path,created_at&requested_by=eq." + encodeURIComponent(b.owner_id) + "&repo=eq." + encodeURIComponent(REPO) + "&path=eq." + encodeURIComponent(handoff.path) + "&branch=eq." + encodeURIComponent(handoff.request_branch) + "&status=in.(queued,processing)&order=created_at.desc&limit=1");
  if (existing) throw new Error("A matching GitHub write request is already queued or processing.");
  const request = {
    repo: REPO,
    path: handoff.path,
    branch: handoff.request_branch,
    action: handoff.action === "add" ? "create_file" : "create_or_update_file",
    content,
    commit_message: String(args.fields?.commit_message || "Code Labs update " + handoff.path).slice(0, 240),
    pr_title: String(args.fields?.pr_title || "Code Labs update: " + handoff.path).slice(0, 240),
    pr_body: String(args.fields?.pr_body || "Prepared by Code Labs V104 after Code God PASS.").slice(0, 20000),
    confirm_branch_pr_only: true,
  };
  const rows = await rest("code_labs_write_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      requested_by: b.owner_id,
      requested_source: "code_labs_v104_tool_only",
      repo: request.repo,
      path: request.path,
      branch: request.branch,
      action: request.action,
      content: request.content,
      commit_message: request.commit_message,
      pr_title: request.pr_title,
      pr_body: request.pr_body,
      status: "queued",
      direct_main_write: false,
      branch_pr_only: true,
      deletes_anything: false,
      safety_note: "Code God PASS recorded before connector execution.",
    }),
  });
  const queued = rows?.[0];
  if (!queued) throw new Error("The GitHub request could not be queued.");
  const marker = { request_id: queued.id, status: queued.status, repo: queued.repo, path: queued.path, branch: queued.branch, prepared_at: new Date().toISOString() };
  const metadata = { ...metadataBefore, github_writer_request: marker };
  const file = await saveMetadata(b.owner_id, c.file, metadata);
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "github.writer_prepare", request: { ...request, content: undefined }, queued: marker, next_tool: "GitHub connector", file_id: file.id, receipt: await receipt(b.owner_id, "github.writer_prepare", c.file, metadataBefore.github_writer_request || {}, marker) };
}

export async function backendTablesSnapshot(b: Binding) {
  const specs = [
    ["code_labs_projects", "id,site_name,site_url,repo,mode,status,created_at,updated_at", "owner_id"],
    ["code_labs_files", "id,project_id,filename,file_type,current_hash,metadata,created_at,updated_at", "owner_id"],
    ["code_labs_jobs", "id,project_id,file_id,title,status,created_at,updated_at", "owner_id"],
    ["code_labs_packets", "id,project_id,job_id,packet_type,metadata,created_at", "owner_id"],
    ["code_labs_test_runs", "id,project_id,job_id,filename,result,checked_count,total_count,created_at", "owner_id"],
    ["code_labs_versions", "id,project_id,job_id,file_id,version_kind,label,filename,created_at", "owner_id"],
    ["code_labs_write_requests", "id,repo,path,branch,action,status,branch_pr_only,direct_main_write,deletes_anything,created_at,updated_at", "requested_by"],
    ["code_labs_action_receipts", "id,action,record_type,record_id,changed_fields,created_new_row,undo_available,undone_at,created_at", "owner_id"],
  ];
  const snapshots: Row = {};
  for (const [table, columns, ownerColumn] of specs) {
    const rows = await rest(table + "?select=" + encodeURIComponent(columns) + "&" + ownerColumn + "=eq." + encodeURIComponent(b.owner_id) + "&order=created_at.desc&limit=5");
    snapshots[table] = Array.isArray(rows) ? rows : [];
  }
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "backend.tables_snapshot", read_only: true, snapshots };
}
