import { Binding, rest, Row } from "./oauth.ts";
import { verifyOwnerRepository } from "./github-authority.ts";
export const VERSION = "Code Labs V104 tool-only workspace control";

async function table(
  b: Binding,
  name: string,
  select: string,
  limit: number,
  filters = "",
  ownerColumn = "owner_id",
) {
  const rows = await rest(
    name + "?select=" + encodeURIComponent(select) +
      "&" + ownerColumn + "=eq." + encodeURIComponent(b.owner_id) +
      filters + "&order=created_at.desc&limit=" + limit,
  );
  return Array.isArray(rows) ? rows : [];
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function getContext(b: Binding, limit = 5) {
  const cap = Math.max(1, Math.min(Number(limit || 5), 25));
  const state = await one(
    "code_labs_workspace_state?select=current_project_id,current_test_run_id" +
      "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
  );
  const currentProjectId = String(state?.current_project_id || "");
  const selectedTestId = String(state?.current_test_run_id || "");
  const currentProjectFilter = currentProjectId
    ? "&project_id=eq." + encodeURIComponent(currentProjectId)
    : "&id=is.null";

  const [projects, jobs, packets, tests, testHistory, audit, selectedTest] =
    await Promise.all([
      table(
        b,
        "code_labs_projects",
        "id,site_name,site_url,repo,mode,created_at",
        cap,
      ),
      table(
        b,
        "code_labs_jobs",
        "id,title,status,problem,created_at,started_at,completed_at",
        cap,
      ),
      table(
        b,
        "code_labs_packets",
        "id,packet_type,packet_text,created_at",
        Math.min(cap, 10),
      ),
      table(
        b,
        "code_labs_test_runs",
        "id,filename,result,checked_count,total_count,created_at",
        cap,
        currentProjectFilter,
      ),
      table(
        b,
        "code_labs_test_runs",
        "id,project_id,filename,result,checked_count,total_count,created_at",
        cap,
      ),
      table(b, "code_labs_audit_log", "id,action,created_at", cap),
      selectedTestId
        ? one(
          "code_labs_test_runs?select=id,filename,result,checked_count,total_count,notes,details,created_at" +
            "&id=eq." + encodeURIComponent(selectedTestId) +
            "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
        )
        : Promise.resolve(null),
    ]);

  return {
    ok: true,
    version: VERSION,
    tool: "get_code_labs_context",
    limit: cap,
    read_only: true,
    owner_scoped: true,
    wrote_database: false,
    wrote_github: false,
    opened_pr: false,
    deleted_anything: false,
    reads: {
      projects,
      jobs,
      packets,
      selected_test: selectedTest,
      tests,
      test_history: testHistory,
      audit,
    },
  };
}
function validUrl(raw: unknown) {
  const u = new URL(String(raw || ""));
  if (
    u.protocol !== "https:" ||
    u.hostname !== "chatterfriendsstreambandit.co.uk" ||
    !u.pathname.startsWith("/code-labs/")
  ) throw new Error("Only public Code Labs HTTPS URLs are allowed");
  u.username = "";
  u.password = "";
  u.hash = "";
  return u.toString();
}
export async function readUrl(args: Row) {
  const url = validUrl(args.url);
  const max = Math.max(1000, Math.min(Number(args.max_chars || 20000), 60000));
  const r = await fetch(url, { redirect: "follow" });
  const source = await r.text();
  return {
    ok: r.ok,
    version: VERSION,
    tool: "read_code_labs_url",
    read_only: true,
    url,
    status: r.status,
    content_type: r.headers.get("content-type") || "",
    chars_total: source.length,
    chars_returned: Math.min(source.length, max),
    source_text: source.length > max
      ? source.slice(0, max) + "\n...[trimmed]"
      : source,
  };
}
export async function saveRequest(b: Binding, args: Row) {
  const authority = await verifyOwnerRepository(b.owner_id, args.repo, {
    contents: "read",
  });
  if (args.confirm_branch_pr_only !== true) {
    throw new Error("confirm_branch_pr_only must be true");
  }
  const content = String(args.content ?? "");
  if (!content || content.length > 180000) {
    throw new Error("content is required and must be under 180000 characters");
  }
  const p = String(args.path || "").trim().replace(/^\/+/, "");
  if (
    !p || p.includes("..") || p.includes("\\") || p.startsWith(".") ||
    /\.(env|pem|key|p12|pfx)$/i.test(p) || p.startsWith(".github/") ||
    p.toLowerCase().includes("secrets")
  ) throw new Error("Unsafe path");
  const branch = String(args.branch || "").trim();
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) ||
    ["main", "master", "gh-pages", "production", "live"].includes(
      branch.toLowerCase(),
    ) || branch.toLowerCase() === authority.default_branch.toLowerCase()
  ) throw new Error("Unsafe branch");
  const row = {
    requested_by: b.owner_id,
    repo: authority.repo,
    path: p,
    branch,
    action: args.action || "create_or_update_file",
    content,
    commit_message: String(
      args.commit_message || "Code Labs safe write request",
    ),
    pr_title: String(args.pr_title || "Code Labs safe write request"),
    pr_body: String(args.pr_body || ""),
    status: "queued",
    direct_main_write: false,
    branch_pr_only: true,
    deletes_anything: false,
    requested_source: "code_labs_v104_tool_only",
  };
  const saved = await rest("code_labs_write_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  return {
    ok: true,
    version: VERSION,
    tool: "save_code_labs_write_request",
    wrote_database: true,
    wrote_github: false,
    opened_pr: false,
    deleted_anything: false,
    request_id: saved?.[0]?.id || null,
    status: saved?.[0]?.status || "queued",
    repo: row.repo,
    path: row.path,
    branch: row.branch,
    action: row.action,
  };
}