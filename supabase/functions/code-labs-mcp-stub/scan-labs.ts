import { Binding } from "./oauth.ts";
import { VERSION } from "./context.ts";
import { githubRequest, verifyOwnerRepository } from "./github-authority.ts";

type Row = Record<string, any>;
type SnapshotFile = { path: string; text: string; bytes: number };

const SCAN_VERSION = "Scan Labs V1 MCP whole-repository reconnaissance";
const MAX_FILES = 2000;
const MAX_FILE_SIZE = 750000;
const MAX_TOTAL_BYTES = 18000000;
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;
const TEXT_EXT = /\.(?:html?|mjs|cjs|js|jsx|ts|tsx|css|json|md|txt|sql|ya?ml|toml|xml|svg|py|php|rb|go|rs|java|kt|kts|swift|sh|bash|zsh|ps1|ini|conf)$/i;
const PROTECTED_PATH = /(?:^|\/)(?:\.env(?:\.|$)|secrets?|credentials?|private[-_]?keys?)(?:\/|$)|\.(?:pem|key|p12|pfx)$/i;
const GENERATED_PATH = /(?:^|\/)(?:node_modules|vendor|dist|build|coverage|\.next|out)(?:\/|$)/i;
const CREDENTIAL_VALUE = /(?:sk-[A-Za-z0-9_-]{16,}|sb_secret_[A-Za-z0-9_-]{16,}|gh[oprsu]_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]+PRIVATE KEY-----|\bBearer\s+[A-Za-z0-9._~-]{30,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})/g;
const SECRET_NAME = /(?:secret|service[_-]?role|private|password|passwd|api[_-]?key|token|credential|signing|webhook)/i;
const WRITE_OPERATION = new Set(["insert", "update", "delete", "upsert", "post", "put", "patch"]);

function cleanRepo(value: unknown) {
  const repo = String(value || "").trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error("A repository in owner/name form is required.");
  return repo;
}

function cleanRef(value: unknown, fallback: string) {
  const ref = String(value || fallback || "").trim();
  if (!ref || ref.length > 200 || /[\u0000-\u001f\u007f]/.test(ref)) throw new Error("A safe repository ref is required.");
  return ref;
}

function cleanSection(value: unknown) {
  const section = String(value || "summary").trim().toLowerCase();
  const allowed = new Set(["summary", "areas", "pages", "dependencies", "environment", "database", "state", "findings", "all"]);
  if (!allowed.has(section)) throw new Error("Unknown Scan Labs section.");
  return section;
}

function pageArgs(args: Row) {
  const offset = Math.max(0, Math.floor(Number(args.offset || 0)));
  const limit = Math.max(1, Math.min(Math.floor(Number(args.limit || DEFAULT_LIMIT)), MAX_LIMIT));
  return { offset, limit };
}

function bytesFromBase64(value: string) {
  const binary = atob(String(value || "").replace(/\s+/g, ""));
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
  return out;
}

function lineOf(text: string, index: number) {
  return text.slice(0, Math.max(0, index)).split("\n").length;
}

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

function sourceKind(path: string) {
  if (/(?:^|\/)(?:test|tests|fixtures?)(?:\/|\.)|\.(?:test|spec)\.[^.]+$/i.test(path)) return "test_or_fixture";
  if (/\.(?:md|txt)$/i.test(path)) return "documentation";
  if (path.startsWith("supabase/migrations/") || /\.sql$/i.test(path)) return "migration";
  if (path.startsWith(".github/workflows/")) return "workflow";
  if (path.startsWith("supabase/functions/")) return "edge_function";
  return "runtime_source";
}

function repositoryArea(path: string) {
  if (path.startsWith("code-labs/")) return "code_labs";
  if (path.startsWith("supabase/functions/")) return "supabase_edge_functions";
  if (path.startsWith("supabase/migrations/")) return "database_migrations";
  if (path.startsWith(".github/workflows/")) return "github_automation";
  if (sourceKind(path) === "test_or_fixture") return "tests_and_fixtures";
  if (sourceKind(path) === "documentation") return "documentation";
  if (!path.includes("/")) return "root_application";
  return path.split("/")[0] || "repository_source";
}

function browserRuntime(path: string) {
  const kind = sourceKind(path);
  if (kind !== "runtime_source") return false;
  if (path.startsWith("supabase/") || path.startsWith(".github/") || /(?:^|\/)(?:scripts?|server|api|functions?)(?:\/|$)/i.test(path)) return false;
  return /\.(?:html?|js|jsx|mjs|css)$/i.test(path);
}

function normalise(from: string, value: string) {
  if (!value || /^(?:https?:|data:|mailto:|tel:|#|\/\/)/i.test(value)) return "";
  const clean = String(value).split(/[?#]/)[0];
  if (!clean) return "";
  if (clean.startsWith("/")) return clean.slice(1);
  const base = String(from || "").split("/").slice(0, -1);
  for (const part of clean.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return base.join("/");
}

function references(text: string, from: string) {
  const out: string[] = [];
  const patterns = [
    /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']/g,
    /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g,
    /<(?:script|link)\b[^>]*?(?:src|href)\s*=\s*["']([^"']+)["']/gi,
    /\bfetch\s*\(\s*["']([^"']+)["']/g,
  ];
  for (const regex of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
      const value = normalise(from, match[1]);
      if (value) out.push(value);
    }
  }
  return uniq(out).sort();
}

function storageCalls(text: string, path: string) {
  const rows: Row[] = [];
  const regex = /\b(localStorage|sessionStorage)\.(getItem|setItem|removeItem)\s*\(\s*(["'`])([^"'`]+)\3/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    rows.push({
      file: path,
      line: lineOf(text, match.index),
      store: match[1],
      operation: match[2],
      key: match[4],
      authority: /workflow|current(?:file|project|job|packet|test)|candidate|codegod|writer|handoff/i.test(match[4])
        ? "workflow_authoritative_risk"
        : /token|auth|session|credential|secret/i.test(match[4])
        ? "security_sensitive"
        : /draft|backup|canvas|packet|pending|autosave/i.test(match[4])
        ? "local_draft_or_backup"
        : "local_utility_or_unknown",
    });
  }
  if (/\bindexedDB\b/.test(text)) rows.push({ file: path, line: lineOf(text, text.indexOf("indexedDB")), store: "indexedDB", operation: "reference", key: "", authority: "needs_review" });
  return rows;
}

function environmentCalls(files: SnapshotFile[]) {
  const rows: Row[] = [];
  const patterns = [
    { regex: /Deno\.env\.get\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g, kind: "Deno.env.get" },
    { regex: /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g, kind: "process.env" },
    { regex: /import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g, kind: "import.meta.env" },
  ];
  for (const file of files) {
    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.regex.exec(file.text))) rows.push({ file: file.path, line: lineOf(file.text, match.index), kind: pattern.kind, name: match[1], secret_like: SECRET_NAME.test(match[1]), browser_exposure: browserRuntime(file.path) });
    }
  }
  return rows;
}

function databaseCalls(files: SnapshotFile[]) {
  const rows: Row[] = [];
  for (const file of files) {
    const from = /\.from\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = from.exec(file.text))) {
      const tail = file.text.slice(match.index, Math.min(file.text.length, match.index + 600));
      const operation = tail.match(/\.(select|insert|update|delete|upsert)\s*\(/)?.[1] || "reference";
      rows.push({ file: file.path, line: lineOf(file.text, match.index), channel: browserRuntime(file.path) ? "browser" : "server", kind: "table", target: match[1], operation });
    }
    const rpc = /\.rpc\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/g;
    while ((match = rpc.exec(file.text))) rows.push({ file: file.path, line: lineOf(file.text, match.index), channel: browserRuntime(file.path) ? "browser" : "server", kind: "rpc", target: match[1], operation: "invoke" });
    const invoke = /\.functions\.invoke\(\s*["']([A-Za-z_][A-Za-z0-9_-]*)["']/g;
    while ((match = invoke.exec(file.text))) rows.push({ file: file.path, line: lineOf(file.text, match.index), channel: browserRuntime(file.path) ? "browser" : "server", kind: "edge_function", target: match[1], operation: "invoke" });
  }
  return rows;
}

function pages(files: SnapshotFile[], fileMap: Map<string, string>) {
  return files.filter((file) => /\.html?$/i.test(file.path)).map((file) => {
    const title = file.text.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    const dataPage = file.text.match(/\bdata-page\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    const scripts = uniq(Array.from(file.text.matchAll(/<script\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi), (match) => normalise(file.path, match[1])).filter(Boolean)).sort();
    const styles = uniq(Array.from(file.text.matchAll(/<link\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi), (match) => normalise(file.path, match[1])).filter(Boolean)).sort();
    const combined = [file.text, ...scripts.map((path) => fileMap.get(path) || "")].join("\n");
    return {
      path: file.path,
      area: repositoryArea(file.path),
      title,
      data_page: dataPage,
      scripts,
      styles,
      buttons: Array.from(file.text.matchAll(/<button\b/gi)).length,
      forms: Array.from(file.text.matchAll(/<form\b/gi)).length,
      storage_writes: storageCalls(combined, file.path).filter((row) => row.operation !== "getItem").map((row) => row.store + ":" + row.key + ":" + row.authority),
    };
  });
}

function buildFindings(report: Row) {
  const confirmed: string[] = [];
  const suspected: string[] = [];
  const warnings: string[] = [];
  for (const row of report.environment_variables) if (row.browser_exposure && row.secret_like) confirmed.push("Secret-like environment call in browser runtime: " + row.file + ":" + row.line + " " + row.name);
  for (const row of report.database_rpc) if (row.channel === "browser" && WRITE_OPERATION.has(row.operation)) confirmed.push("Browser-side mutation pattern: " + row.file + ":" + row.line + " " + row.operation + " " + row.target);
  for (const row of report.browser_state) {
    if (row.operation === "getItem") continue;
    if (row.authority === "workflow_authoritative_risk") confirmed.push("Workflow-authoritative browser state write: " + row.file + ":" + row.line + " " + row.key);
    if (row.authority === "security_sensitive") confirmed.push("Security-sensitive browser state write: " + row.file + ":" + row.line + " " + row.key);
  }
  for (const file of report.files) {
    if (/\b(?:refs\/heads\/main|branch\s*[:=]\s*["']main["']|force\s*:\s*true)\b/i.test(file.text)) suspected.push("Protected-branch or force-write wording needs review: " + file.path);
    CREDENTIAL_VALUE.lastIndex = 0;
    if (CREDENTIAL_VALUE.test(file.text)) confirmed.push("Credential-shaped literal detected and redacted from report: " + file.path);
    CREDENTIAL_VALUE.lastIndex = 0;
  }
  warnings.push("Static reconnaissance does not prove runtime behaviour, browser interaction, CI success, deployment identity, feature parity or user acceptance.");
  return { confirmed: uniq(confirmed).sort(), suspected: uniq(suspected).sort(), warnings: uniq(warnings).sort() };
}

function sanitiseFile(file: SnapshotFile) {
  CREDENTIAL_VALUE.lastIndex = 0;
  const text = file.text.replace(CREDENTIAL_VALUE, "[redacted-credential-shaped-value]");
  CREDENTIAL_VALUE.lastIndex = 0;
  return { path: file.path, bytes: file.bytes, area: repositoryArea(file.path), kind: sourceKind(file.path), text };
}

function paginate(items: any[], offset: number, limit: number) {
  const slice = items.slice(offset, offset + limit);
  return { offset, limit, total: items.length, returned: slice.length, has_more: offset + slice.length < items.length, items: slice };
}

async function mapConcurrent<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const output: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      output[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, run));
  return output;
}

export async function scanCodeLabsRepository(binding: Binding, args: Row) {
  const repo = cleanRepo(args.repo);
  const authority = await verifyOwnerRepository(binding.owner_id, repo, { contents: "read", metadata: "read" });
  const requestedRef = cleanRef(args.ref, authority.default_branch);
  const section = cleanSection(args.section);
  const { offset, limit } = pageArgs(args);
  const repoPath = "/repos/" + repo.split("/").map(encodeURIComponent).join("/");
  const commit = await githubRequest(repoPath + "/commits/" + encodeURIComponent(requestedRef), authority.token);
  const commitSha = String(commit?.sha || "").toLowerCase();
  const treeSha = String(commit?.commit?.tree?.sha || "").toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(commitSha) || !/^[a-f0-9]{40}$/.test(treeSha)) throw new Error("GitHub did not return immutable Scan Labs source provenance.");
  const tree = await githubRequest(repoPath + "/git/trees/" + encodeURIComponent(treeSha) + "?recursive=1", authority.token);
  if (tree?.truncated === true) throw new Error("Scan Labs safe failure: GitHub returned a truncated repository tree.");
  const allRows: Row[] = Array.isArray(tree?.tree) ? tree.tree.filter((row: Row) => row?.type === "blob") : [];
  const skippedProtectedPaths = allRows.map((row) => String(row.path || "")).filter((path) => PROTECTED_PATH.test(path));
  const skippedGeneratedPaths = allRows.map((row) => String(row.path || "")).filter((path) => GENERATED_PATH.test(path));
  const eligible = allRows.filter((row) => {
    const path = String(row.path || "");
    const size = Number(row.size || 0);
    return TEXT_EXT.test(path) && !PROTECTED_PATH.test(path) && !GENERATED_PATH.test(path) && size <= MAX_FILE_SIZE;
  });
  if (eligible.length > MAX_FILES) throw new Error("Scan Labs safe failure: eligible file count exceeds " + MAX_FILES + ".");
  const totalDeclaredBytes = eligible.reduce((sum, row) => sum + Math.max(0, Number(row.size || 0)), 0);
  if (totalDeclaredBytes > MAX_TOTAL_BYTES) throw new Error("Scan Labs safe failure: eligible repository source exceeds the bounded byte limit.");
  const failed: string[] = [];
  const fetched = await mapConcurrent(eligible, 10, async (row): Promise<SnapshotFile | null> => {
    const path = String(row.path || "");
    try {
      const blob = await githubRequest(repoPath + "/git/blobs/" + encodeURIComponent(String(row.sha || "")), authority.token);
      if (blob?.encoding !== "base64" || typeof blob?.content !== "string") throw new Error("unreadable blob");
      const bytes = bytesFromBase64(blob.content);
      if (bytes.length > MAX_FILE_SIZE) throw new Error("oversized blob");
      return { path, text: new TextDecoder().decode(bytes), bytes: bytes.length };
    } catch {
      failed.push(path);
      return null;
    }
  });
  if (failed.length) throw new Error("Scan Labs safe failure: " + failed.length + " eligible source file(s) could not be read (" + failed.slice(0, 10).join(", ") + "). No readiness result was produced.");
  const files = fetched.filter((value): value is SnapshotFile => Boolean(value)).sort((left, right) => left.path.localeCompare(right.path));
  const fileMap = new Map(files.map((file) => [file.path, file.text]));
  const safeFiles = files.map(sanitiseFile);
  const repositoryAreas = Array.from(safeFiles.reduce((map, file) => {
    const row = map.get(file.area) || { area: file.area, files: 0, bytes: 0, extensions: new Set<string>() };
    row.files += 1;
    row.bytes += file.bytes;
    const extension = file.path.match(/\.([A-Za-z0-9]+)$/)?.[1]?.toLowerCase() || "none";
    row.extensions.add(extension);
    map.set(file.area, row);
    return map;
  }, new Map<string, any>()).values()).map((row: any) => ({ ...row, extensions: Array.from(row.extensions).sort() })).sort((left, right) => left.area.localeCompare(right.area));
  const pageRows = pages(files, fileMap);
  const dependencies = safeFiles.map((file) => ({ file: file.path, references: references(file.text, file.path) })).filter((row) => row.references.length);
  const environment = environmentCalls(files);
  const database = databaseCalls(files);
  const state = files.flatMap((file) => storageCalls(file.text, file.path));
  const report: Row = { files: safeFiles, environment_variables: environment, database_rpc: database, browser_state: state };
  const findings = buildFindings(report);
  const totals = {
    files: safeFiles.length,
    pages: pageRows.length,
    areas: repositoryAreas.length,
    environment_calls: environment.length,
    database_rpc_patterns: database.length,
    browser_state_calls: state.length,
    confirmed_findings: findings.confirmed.length,
    suspected_findings: findings.suspected.length,
  };
  const assistantSummary = {
    headline: "Scan Labs completed whole-repository reconnaissance at exact commit " + commitSha + ".",
    next_use: "Use sections to narrow targeted Code Labs source reads. Findings are evidence for review, not automatic repair or promotion decisions.",
  };
  const sectionData: Row = section === "summary"
    ? { assistant_summary: assistantSummary, totals, repository_areas: repositoryAreas, findings, available_sections: ["summary", "areas", "pages", "dependencies", "environment", "database", "state", "findings", "all"], paging: { default_limit: DEFAULT_LIMIT, max_limit: MAX_LIMIT } }
    : section === "areas" ? paginate(repositoryAreas, offset, limit)
    : section === "pages" ? paginate(pageRows, offset, limit)
    : section === "dependencies" ? paginate(dependencies, offset, limit)
    : section === "environment" ? paginate(environment, offset, limit)
    : section === "database" ? paginate(database, offset, limit)
    : section === "state" ? paginate(state, offset, limit)
    : section === "findings" ? findings
    : {
      assistant_summary: assistantSummary,
      totals,
      areas: paginate(repositoryAreas, offset, limit),
      pages: paginate(pageRows, offset, limit),
      dependencies: paginate(dependencies, offset, limit),
      environment: paginate(environment, offset, limit),
      database: paginate(database, offset, limit),
      state: paginate(state, offset, limit),
      findings,
    };
  return {
    ok: true,
    version: VERSION,
    scan_version: SCAN_VERSION,
    tool: "scan_code_labs_repository",
    feature: "Scan Labs",
    read_only: true,
    unnumbered_support_tool: true,
    early_optional_tool: true,
    repository: repo,
    requested_ref: requestedRef,
    resolved_commit_sha: commitSha,
    resolved_tree_sha: treeSha,
    generated_at: new Date().toISOString(),
    eligible_file_limit: MAX_FILES,
    max_file_size: MAX_FILE_SIZE,
    files_scanned: files.length,
    skipped_protected_paths: skippedProtectedPaths,
    skipped_generated_paths: skippedGeneratedPaths,
    totals,
    returned_section: section,
    section_data: sectionData,
    safety_flags: {
      whole_repository_scope: true,
      exact_commit_bound: true,
      credentials_redacted: true,
      protected_paths_excluded: true,
      workflow_owner: false,
      promotion_authority: false,
      repair_authority: false,
    },
    wrote_database: false,
    wrote_github: false,
    opened_pr: false,
    deployed: false,
    workflow_state_written: false,
    repaired_source: false,
    code_god_run: false,
    writer_queued: false,
    promotion_decided: false,
  };
}
