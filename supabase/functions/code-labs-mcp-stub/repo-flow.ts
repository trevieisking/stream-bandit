import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";

type Row = Record<string, any>;
const REPO = "trevieisking/stream-bandit";
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);

function copy(value: unknown, max = 760000): Row {
  const text = JSON.stringify(value || {});
  if (text.length > max) throw new Error("Payload is too large.");
  return JSON.parse(text);
}

async function hash(value: unknown) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value ?? null)));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function current(owner: string) {
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

async function saveFile(owner: string, file: Row, metadata: Row) {
  const rows = await rest("code_labs_files?id=eq." + encodeURIComponent(file.id) + "&owner_id=eq." + encodeURIComponent(owner), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ metadata, updated_at: new Date().toISOString() }),
  });
  if (!Array.isArray(rows) || !rows[0]) throw new Error("The selected file could not be updated.");
  return rows[0];
}

async function receipt(owner: string, action: string, file: Row, before: Row, after: Row) {
  const rows = await rest("code_labs_action_receipts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ owner_id: owner, action, record_type: "file", record_id: file.id, before_data: before, after_data: after, changed_fields: ["metadata"], created_new_row: false, undo_available: false }),
  });
  return rows?.[0] || null;
}

function action(value: unknown) {
  const v = String(value || "change").toLowerCase();
  if (v === "create") return "add";
  if (v === "delete") return "remove";
  return ["read", "add", "change", "remove", "review"].includes(v) ? v : "change";
}

function cleanPath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (!path || path.includes("..") || path.includes("\\") || path.startsWith(".") || path.toLowerCase().includes("secrets")) throw new Error("Target path is missing or unsafe.");
  return path;
}

function cleanBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (!/^[A-Za-z0-9._/-]{3,80}$/.test(branch) || PROTECTED.has(branch.toLowerCase())) throw new Error("Working branch is missing or protected.");
  return branch;
}

function fullFile(path: string, text: string) {
  const value = String(text || "").trim();
  if (!value || value.length < 120) return false;
  if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(value)) return false;
  if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(value)) return false;
  if (/\.html?$/i.test(path) && !/<!doctype\s+html/i.test(value) && !/<html[\s>]/i.test(value)) return false;
  if (/\.json$/i.test(path)) { try { JSON.parse(value); } catch { return false; } }
  return true;
}

export async function prepareRepoHandoff(b: Binding, args: Row) {
  const c = await current(b.owner_id);
  const fields = copy(args.fields || {});
  const mode = action(fields.action);
  const repo = String(fields.repo || c.project.repo || REPO);
  if (repo !== REPO) throw new Error("The repository is not approved for Code Labs.");
  const path = cleanPath(fields.path || c.file.metadata?.path || c.file.filename);
  const branch = cleanBranch(fields.branch);
  const proposed = String(fields.content ?? c.file.metadata?.fixed_output ?? "");
  if ((mode === "add" || mode === "change") && !fullFile(path, proposed)) throw new Error("A complete proposed file is required.");
  if (mode === "remove") throw new Error("File removal is not available in the normal V104 lane.");
  const handoff = {
    version: "V104-repo-flow-1",
    action: mode,
    repo,
    source_repo: String(c.project.repo || repo),
    source_branch: String(fields.source_branch || "main"),
    request_branch: branch,
    path,
    original: String(c.file.current_code || ""),
    proposed,
    notes: String(fields.notes || c.job?.problem || "").slice(0, 12000),
    preserve: String(c.job?.dont_touch || "").slice(0, 12000),
    current_hash: await hash(String(c.file.current_code || "")),
    proposed_hash: await hash(proposed),
    created_at: new Date().toISOString(),
  };
  const before = copy(c.file.metadata || {});
  const metadata = { ...before, repo_handoff: handoff };
  const file = await saveFile(b.owner_id, c.file, metadata);
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "repo.prepare_handoff", handoff, file, receipt: await receipt(b.owner_id, "repo.prepare_handoff", c.file, before, metadata) };
}

function finding(severity: string, rule_id: string, message: string, correction: string, blocks_github = true) {
  return { severity, rule_id, message, correction, blocks_github };
}

export async function reviewCodeGod(b: Binding) {
  const c = await current(b.owner_id);
  const before = copy(c.file.metadata || {});
  const handoff = copy(before.repo_handoff || {});
  if (!handoff.path) throw new Error("Prepare the Repo Desk handoff first.");
  const findings: Row[] = [];
  if (handoff.repo !== REPO) findings.push(finding("P1", "CG-IDENTITY-001", "The repository is not approved.", "Select the approved repository."));
  if (!handoff.path || String(handoff.path).includes("..")) findings.push(finding("P1", "CG-IDENTITY-002", "The target path is missing or unsafe.", "Save one repository-relative path."));
  if (PROTECTED.has(String(handoff.request_branch || "").toLowerCase())) findings.push(finding("P0", "CG-BRANCH-001", "The requested branch is protected.", "Use a non-protected repair branch."));
  if ((handoff.action === "add" || handoff.action === "change") && !fullFile(String(handoff.path), String(handoff.proposed || ""))) findings.push(finding("P1", "CG-FULLFILE-001", "The proposed file is incomplete.", "Save one complete replacement file."));
  if (handoff.action === "change" && handoff.original && String(handoff.proposed || "").length < Math.max(120, Math.floor(String(handoff.original).length * 0.65))) findings.push(finding("P1", "CG-TRUNCATION-001", "The proposed file may be truncated.", "Restore missing sections and review again."));
  if (/<<<<<<<|=======|>>>>>>>/.test(String(handoff.proposed || ""))) findings.push(finding("P1", "CG-CONFLICT-001", "Conflict markers were found.", "Resolve the conflict markers."));
  if (/```(?:html|javascript|js|typescript|ts|json)?/i.test(String(handoff.proposed || ""))) findings.push(finding("P2", "CG-FENCE-001", "Markdown fences appear inside the proposed file.", "Keep only the complete file contents."));
  if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(String(handoff.proposed || ""))) findings.push(finding("P2", "CG-TIMER-001", "A frequent timer may duplicate work.", "Use a guarded single owner or explicit action.", false));
  const blocking = findings.some((item) => item.blocks_github);
  const outcome = blocking ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FIX_FIRST") : "PASS";
  const review = { version: "V104-code-god-1", outcome, handoff_hash: await hash(handoff), repo: handoff.repo, path: handoff.path, request_branch: handoff.request_branch, proposed_hash: handoff.proposed_hash, findings, checks_run: ["identity", "branch", "full-file", "truncation", "conflicts", "fences", "timers"], created_at: new Date().toISOString() };
  const metadata = { ...before, code_god_review: review };
  const file = await saveFile(b.owner_id, c.file, metadata);
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "code_god.review", review, file, receipt: await receipt(b.owner_id, "code_god.review", c.file, before, metadata) };
}

export async function prepareGithubWriter(b: Binding, args: Row) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to prepare the GitHub request.");
  const c = await current(b.owner_id);
  const before = copy(c.file.metadata || {});
  const handoff = copy(before.repo_handoff || {});
  const review = copy(before.code_god_review || {});
  if (review.outcome !== "PASS") throw new Error("Code God PASS is required before GitHub Writer.");
  if (review.handoff_hash !== await hash(handoff) || review.proposed_hash !== handoff.proposed_hash) throw new Error("The reviewed handoff changed. Run Code God again.");
  const request = {
    repo: handoff.repo,
    path: handoff.path,
    branch: handoff.request_branch,
    action: handoff.action === "add" ? "create_file" : "create_or_update_file",
    content: String(handoff.proposed || ""),
    commit_message: String(args.fields?.commit_message || "Code Labs update " + handoff.path).slice(0, 240),
    pr_title: String(args.fields?.pr_title || "Code Labs update: " + handoff.path).slice(0, 240),
    pr_body: String(args.fields?.pr_body || "Prepared by Code Labs V104 after Code God PASS.").slice(0, 20000),
    confirm_branch_pr_only: true,
  };
  const rows = await rest("code_labs_write_requests", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ requested_by: b.owner_id, requested_source: "code_labs_v104_tool_only", repo: request.repo, path: request.path, branch: request.branch, action: request.action, content: request.content, commit_message: request.commit_message, pr_title: request.pr_title, pr_body: request.pr_body, status: "queued", direct_main_write: false, branch_pr_only: true, deletes_anything: false, safety_note: "Code God PASS recorded before connector execution." }) });
  const queued = rows?.[0];
  if (!queued) throw new Error("The GitHub request could not be queued.");
  const metadata = { ...before, github_writer_request: { request_id: queued.id, status: queued.status, repo: queued.repo, path: queued.path, branch: queued.branch, prepared_at: new Date().toISOString() } };
  const file = await saveFile(b.owner_id, c.file, metadata);
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "github.writer_prepare", request, queued, next_tool: "GitHub connector", file, receipt: await receipt(b.owner_id, "github.writer_prepare", c.file, before, metadata) };
}

export async function backendTablesSnapshot(b: Binding) {
  const tables = ["code_labs_projects", "code_labs_files", "code_labs_jobs", "code_labs_packets", "code_labs_test_runs", "code_labs_versions", "code_labs_write_requests", "code_labs_action_receipts"];
  const snapshots: Row = {};
  for (const table of tables) {
    const rows = await rest(table + "?select=*&" + (table === "code_labs_write_requests" ? "requested_by" : "owner_id") + "=eq." + encodeURIComponent(b.owner_id) + "&order=created_at.desc&limit=5");
    snapshots[table] = Array.isArray(rows) ? rows : [];
  }
  return { ok: true, version: VERSION, tool: "run_code_labs_action", action: "backend.tables_snapshot", read_only: true, snapshots };
}
