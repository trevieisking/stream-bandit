import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import { githubRequest, verifyOwnerRepository } from "./github-authority.ts";

type Row = Record<string, any>;

export type SnapshotFile = {
  path: string;
  content: string;
};

export type Finding = {
  severity: "P0" | "P1" | "P2" | "P3";
  rule_id: string;
  message: string;
  correction: string;
  path?: string;
  line?: number;
};

type SecretReference = {
  name: string;
  reference: string;
  declaration: { path: string; line: number };
  aliases: string[];
  call_sites: Array<{ path: string; line: number; expression: string }>;
};

const MAX_FILES = 600;
const MAX_FILE_BYTES = 240000;
const MAX_TOTAL_BYTES = 12000000;
const MAX_FINDINGS = 500;
const MAX_MAP_ITEMS = 1200;
const SUPPORTED = /\.(?:html?|css|m?js|cjs|jsx|ts|tsx|json|sql)$/i;
const SKIP_PATH =
  /(^|\/)(?:node_modules|vendor|dist|build|coverage|\.git|\.github|archive|archives|backup|backups)(\/|$)|(?:^|\/)(?:\.env[^/]*|[^/]+\.(?:pem|key|p12|pfx))$/i;
const TEST_PATH =
  /(?:^|\/)(?:test|tests|__tests__|fixtures|snapshots)(?:\/|$)|(?:[-_.](?:test|spec))\.[^.]+$/i;

const CREDENTIAL_VALUE_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_]{12,}\b/i,
  /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{12,}\b/i,
  /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{12,}\b/i,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|private[_-]?key)\s*[:=]\s*["'][^"'\n]{12,}["']/i,
];

function cleanRepo(value: unknown) {
  const repo = String(value || "").trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("A repository in owner/name form is required.");
  }
  return repo;
}

function cleanRef(value: unknown, fallback = "") {
  const ref = String(value || fallback || "").trim();
  if (!ref || ref.length > 200 || /[\u0000-\u001f\u007f]/.test(ref)) {
    throw new Error("A safe repository ref is required.");
  }
  return ref;
}

function cleanPath(value: unknown) {
  const path = normalizePath(String(value || "").trim().replace(/^\/+/, ""));
  if (
    !path || path.startsWith("../") || path.includes("\\") ||
    SKIP_PATH.test(path)
  ) {
    throw new Error("A safe repository-relative source path is required.");
  }
  return path;
}

function normalizePath(value: string) {
  const output: string[] = [];
  for (const part of value.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!output.length) return "../" + value;
      output.pop();
      continue;
    }
    output.push(part);
  }
  return output.join("/");
}

function dirname(path: string) {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
}

function lineNumber(content: string, index: number) {
  return content.slice(0, Math.max(0, index)).split("\n").length;
}

function hasCredentialValue(value: string) {
  return CREDENTIAL_VALUE_PATTERNS.some((pattern) =>
    pattern.test(String(value || ""))
  );
}

function redactCredentialValues(value: string) {
  let output = String(value || "");
  for (const pattern of CREDENTIAL_VALUE_PATTERNS) {
    output = output.replace(
      new RegExp(
        pattern.source,
        pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g",
      ),
      "[REDACTED_CREDENTIAL]",
    );
  }
  return output;
}

function safeMessage(value: unknown, max = 500) {
  return redactCredentialValues(String(value || "")).slice(0, max);
}

function base64ToBytes(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  const output = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }
  return output;
}

async function digest(value: unknown) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value ?? "")),
  );
  return Array.from(
    new Uint8Array(bytes),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function entitlement(ownerId: string) {
  const row = await one(
    "code_labs_entitlements?select=plan_key,status,starts_at,expires_at,features" +
      "&owner_id=eq." + encodeURIComponent(ownerId) +
      "&product_key=eq.code_labs&limit=1",
  );
  const now = Date.now();
  const starts = row?.starts_at ? Date.parse(String(row.starts_at)) : null;
  const expires = row?.expires_at ? Date.parse(String(row.expires_at)) : null;
  const entitled = Boolean(
    row &&
      row.plan_key === "pro" &&
      row.status === "active" &&
      (starts === null || Number.isNaN(starts) || starts <= now) &&
      (expires === null || Number.isNaN(expires) || expires > now),
  );
  return {
    entitled,
    plan_key: row?.plan_key || "free",
    status: row?.status || "inactive",
    expires_at: row?.expires_at || null,
  };
}

function addFinding(findings: Finding[], finding: Finding) {
  if (findings.length >= MAX_FINDINGS) return;
  findings.push({
    ...finding,
    message: safeMessage(finding.message),
    correction: safeMessage(finding.correction),
  });
}

function isLivePage(path: string) {
  return /\.html?$/i.test(path) && !TEST_PATH.test(path) &&
    !SKIP_PATH.test(path);
}

function supportedPath(path: string) {
  return SUPPORTED.test(path) && !SKIP_PATH.test(path);
}

function extractDependencyReferences(path: string, content: string) {
  const references: Array<{ raw: string; index: number }> = [];
  const patterns = [
    /<(?:script|img|source|iframe)\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi,
    /<(?:link|a)\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi,
    /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']/g,
    /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g,
    /@import\s+(?:url\()?\s*["']([^"']+)["']/gi,
    /\bnew\s+URL\s*\(\s*["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content))) {
      references.push({ raw: match[1], index: match.index });
    }
  }
  return references;
}

function resolveDependency(source: string, raw: string, paths: Set<string>) {
  const value = String(raw || "").trim();
  if (
    !value || /^(?:[a-z]+:|#|\/\/)/i.test(value) || value.startsWith("data:")
  ) return null;
  const clean = value.split(/[?#]/)[0];
  if (!clean) return null;
  const base = clean.startsWith("/")
    ? clean.replace(/^\/+/, "")
    : normalizePath((dirname(source) ? dirname(source) + "/" : "") + clean);
  const variants = [
    base,
    base + ".js",
    base + ".mjs",
    base + ".ts",
    base + ".tsx",
    base + ".jsx",
    base + ".css",
    base + ".html",
    base + "/index.js",
    base + "/index.ts",
    base + "/index.tsx",
  ];
  return variants.find((candidate) => paths.has(candidate)) || base;
}

function exactSecretReferences(files: SnapshotFile[]) {
  const byKey = new Map<string, SecretReference>();
  const patterns = [
    {
      regex: /Deno\.env\.get\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g,
      label: (name: string) => 'Deno.env.get("' + name + '")',
    },
    {
      regex: /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
      label: (name: string) => "process.env." + name,
    },
    {
      regex: /import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
      label: (name: string) => "import.meta.env." + name,
    },
    {
      regex:
        /window\.([A-Za-z_$][\w$]*(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)[\w$]*)/g,
      label: (name: string) => "window." + name,
    },
    {
      regex:
        /globalThis\.([A-Za-z_$][\w$]*(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)[\w$]*)/g,
      label: (name: string) => "globalThis." + name,
    },
    {
      regex: /process\.env\[\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\]/g,
      label: (name: string) => 'process.env["' + name + '"]',
    },
    {
      regex: /import\.meta\.env\[\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\]/g,
      label: (name: string) => 'import.meta.env["' + name + '"]',
    },
  ];
  for (const file of files) {
    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.regex.exec(file.content))) {
        const name = match[1];
        const key = file.path + ":" + match.index + ":" + name;
        const line = lineNumber(file.content, match.index);
        const lineText = file.content.split(/\r?\n/)[line - 1] || "";
        const aliasMatch = lineText.match(
          /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/,
        );
        byKey.set(key, {
          name,
          reference: pattern.label(name),
          declaration: { path: file.path, line },
          aliases: aliasMatch ? [aliasMatch[1]] : [],
          call_sites: [],
        });
      }
    }
    const callPattern = /\b([A-Za-z_$][\w$]*(?:secret|key|token)[\w$]*)\s*\(/gi;
    let call: RegExpExecArray | null;
    while ((call = callPattern.exec(file.content))) {
      const key = file.path + ":" + call.index + ":call:" + call[1];
      byKey.set(key, {
        name: call[1],
        reference: call[1] + "(…)",
        declaration: {
          path: file.path,
          line: lineNumber(file.content, call.index),
        },
        aliases: [],
        call_sites: [],
      });
    }
  }
  const references = Array.from(byKey.values());
  for (const reference of references) {
    for (const alias of reference.aliases) {
      const escaped = alias.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
      const aliasPattern = new RegExp("\\b" + escaped + "\\b", "g");
      for (const file of files) {
        let match: RegExpExecArray | null;
        while ((match = aliasPattern.exec(file.content))) {
          const line = lineNumber(file.content, match.index);
          if (
            file.path === reference.declaration.path &&
            line === reference.declaration.line
          ) continue;
          const lineText = file.content.split(/\r?\n/)[line - 1] || "";
          const call = lineText.match(
            /([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\(([^)]*)\)/,
          );
          if (!call || !new RegExp("\\b" + escaped + "\\b").test(call[2])) {
            continue;
          }
          reference.call_sites.push({
            path: file.path,
            line,
            expression: call[1] + "(… " + alias + " …)",
          });
          if (reference.call_sites.length >= 20) break;
        }
      }
    }
  }
  return references.slice(0, MAX_MAP_ITEMS);
}

function duplicateCandidate(content: string) {
  const seen = new Set<string>();
  let changed = false;
  const output = content.split(/\r?\n/).filter((line) => {
    const trimmed = line.trim();
    const eligible = /^import\s.+from\s+["'][^"']+["'];?$/.test(trimmed) ||
      /^@import\s+/.test(trimmed) ||
      /^<script\b[^>]*\bsrc=["'][^"']+["'][^>]*><\/script>$/i.test(trimmed) ||
      /^<link\b[^>]*\brel=["']stylesheet["'][^>]*>$/i.test(trimmed);
    if (!eligible) return true;
    if (seen.has(trimmed)) {
      changed = true;
      return false;
    }
    seen.add(trimmed);
    return true;
  });
  return { changed, content: output.join("\n") };
}

function mapDatabaseCalls(files: SnapshotFile[]) {
  const tables = new Map<string, Row>();
  const rpcs = new Map<string, Row>();
  const functions = new Map<string, Row>();
  const storage = new Map<string, Row>();
  const writeRoutes = new Set<string>();
  const declared = new Set<string>();
  const push = (
    map: Map<string, Row>,
    name: string,
    path: string,
    line: number,
    write = false,
  ) => {
    const key = name.toLowerCase();
    const row = map.get(key) ||
      { name, read_call_sites: [], write_call_sites: [] };
    const target = write ? row.write_call_sites : row.read_call_sites;
    if (target.length < 50) target.push({ path, line });
    map.set(key, row);
  };
  for (const file of files) {
    const sql =
      /\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?(?:(?:public|private)\.)?["']?([A-Za-z_][A-Za-z0-9_]*)/gi;
    let declaredMatch: RegExpExecArray | null;
    while ((declaredMatch = sql.exec(file.content))) {
      declared.add(declaredMatch[1].toLowerCase());
    }
    const from = /\.from\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = from.exec(file.content))) {
      const statementEnd = file.content.indexOf(";", match.index);
      const chainEnd = statementEnd === -1
        ? Math.min(file.content.length, match.index + 500)
        : Math.min(statementEnd + 1, match.index + 500);
      const callChain = file.content.slice(match.index, chainEnd);
      const write = /\.(?:insert|update|upsert|delete)\s*\(/.test(callChain);
      if (write) writeRoutes.add(file.path);
      push(
        tables,
        match[1],
        file.path,
        lineNumber(file.content, match.index),
        write,
      );
    }
    const rpc = /\.rpc\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/g;
    while ((match = rpc.exec(file.content))) {
      push(
        rpcs,
        match[1],
        file.path,
        lineNumber(file.content, match.index),
        false,
      );
    }
    const fn = /\.functions\.invoke\(\s*["']([A-Za-z_][A-Za-z0-9_-]*)["']/g;
    while ((match = fn.exec(file.content))) {
      push(
        functions,
        match[1],
        file.path,
        lineNumber(file.content, match.index),
        false,
      );
    }
    const bucket = /\.storage\.from\(\s*["']([^"']+)["']/g;
    while ((match = bucket.exec(file.content))) {
      push(
        storage,
        match[1],
        file.path,
        lineNumber(file.content, match.index),
        false,
      );
    }
  }
  return {
    tables: Array.from(tables.values()).slice(0, MAX_MAP_ITEMS),
    rpcs: Array.from(rpcs.values()).slice(0, MAX_MAP_ITEMS),
    edge_functions: Array.from(functions.values()).slice(0, MAX_MAP_ITEMS),
    storage_buckets: Array.from(storage.values()).slice(0, MAX_MAP_ITEMS),
    declared_tables: Array.from(declared).sort(),
    write_routes: Array.from(writeRoutes).sort(),
    unresolved_tables: Array.from(tables.values())
      .filter((row) =>
        declared.size > 0 && !declared.has(String(row.name).toLowerCase())
      )
      .map((row) => row.name)
      .slice(0, MAX_MAP_ITEMS),
  };
}

export async function scanRepositorySnapshot(input: {
  repo: string;
  ref: string;
  selected_path: string;
  files: SnapshotFile[];
  manifest_paths?: string[];
  coverage_complete?: boolean;
  skipped_paths?: string[];
}) {
  const files = input.files
    .filter((file) => supportedPath(file.path))
    .map((file) => ({
      path: normalizePath(file.path),
      content: String(file.content || ""),
    }));
  const pathSet = new Set(
    input.manifest_paths || files.map((file) => file.path),
  );
  const findings: Finding[] = [];
  const dependencyMap: Array<
    {
      source: string;
      targets: Array<{ path: string; line: number; exists: boolean }>;
    }
  > = [];
  const missingDependencies: Array<
    { source: string; target: string; line: number }
  > = [];
  const symbolMap = new Map<string, Array<{ path: string; line: number }>>();
  const localStorageMap: Array<{ path: string; line: number; action: string }> =
    [];
  let credentialFiles = 0;

  for (const file of files) {
    if (hasCredentialValue(file.content)) {
      credentialFiles += 1;
      addFinding(findings, {
        severity: "P0",
        rule_id: "CGRL-CREDENTIAL-VALUE-001",
        message:
          "A credential-shaped value is present in repository source and was excluded from report output.",
        correction:
          "Remove the value from source control, rotate it if necessary, and keep only a secret name or environment-variable reference.",
        path: file.path,
      });
    }
    if (/<<<<<<<|=======|>>>>>>>/.test(file.content)) {
      addFinding(findings, {
        severity: "P1",
        rule_id: "CGRL-CONFLICT-001",
        message: "Unresolved merge-conflict markers were found.",
        correction:
          "Resolve the conflict before preparing a complete-file candidate.",
        path: file.path,
      });
    }
    if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(file.content)) {
      addFinding(findings, {
        severity: "P2",
        rule_id: "CGRL-TIMER-001",
        message:
          "A frequent repeating timer may cause duplicate work or unstable interface updates.",
        correction:
          "Use an explicit action, a guarded heartbeat, or a visibility-aware schedule.",
        path: file.path,
      });
    }
    if (
      /\.html?$/i.test(file.path) &&
      !/<(?:html|body)\b[^>]*\bdata-page\s*=/i.test(file.content)
    ) {
      addFinding(findings, {
        severity: "P3",
        rule_id: "CGRL-DATA-PAGE-001",
        message:
          "The HTML page has no data-page identity for shared route and shell helpers.",
        correction:
          "Add a stable data-page value if the page participates in a shared workflow shell.",
        path: file.path,
      });
    }
    const ids = new Map<string, number>();
    const idPattern = /\bid\s*=\s*["']([^"']+)["']/gi;
    let idMatch: RegExpExecArray | null;
    while ((idMatch = idPattern.exec(file.content))) {
      const count = (ids.get(idMatch[1]) || 0) + 1;
      ids.set(idMatch[1], count);
      if (count === 2) {
        addFinding(findings, {
          severity: "P2",
          rule_id: "CGRL-DUPLICATE-ID-001",
          message: "The page repeats the DOM id " + idMatch[1] + ".",
          correction:
            "Keep DOM ids unique and use a class or data attribute for repeated elements.",
          path: file.path,
          line: lineNumber(file.content, idMatch.index),
        });
      }
    }
    const functionPattern =
      /\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
    let functionMatch: RegExpExecArray | null;
    while ((functionMatch = functionPattern.exec(file.content))) {
      const name = functionMatch[1] || functionMatch[2];
      const rows = symbolMap.get(name) || [];
      rows.push({
        path: file.path,
        line: lineNumber(file.content, functionMatch.index),
      });
      symbolMap.set(name, rows);
    }
    const storagePattern =
      /\blocalStorage\.(getItem|setItem|removeItem|clear)\s*\(/g;
    let storageMatch: RegExpExecArray | null;
    while ((storageMatch = storagePattern.exec(file.content))) {
      if (localStorageMap.length < MAX_MAP_ITEMS) {
        localStorageMap.push({
          path: file.path,
          line: lineNumber(file.content, storageMatch.index),
          action: storageMatch[1],
        });
      }
    }
    const targets: Array<{ path: string; line: number; exists: boolean }> = [];
    for (
      const reference of extractDependencyReferences(file.path, file.content)
    ) {
      const resolved = resolveDependency(file.path, reference.raw, pathSet);
      if (!resolved) continue;
      const exists = pathSet.has(resolved);
      const line = lineNumber(file.content, reference.index);
      targets.push({ path: resolved, line, exists });
      if (!exists && missingDependencies.length < MAX_MAP_ITEMS) {
        missingDependencies.push({ source: file.path, target: resolved, line });
        addFinding(findings, {
          severity: "P2",
          rule_id: "CGRL-MISSING-DEPENDENCY-001",
          message:
            "A local dependency or route does not exist in the indexed repository tree.",
          correction:
            "Correct the reference or add the missing repository file.",
          path: file.path,
          line,
        });
      }
    }
    if (targets.length && dependencyMap.length < MAX_MAP_ITEMS) {
      dependencyMap.push({
        source: file.path,
        targets: targets.slice(0, MAX_MAP_ITEMS),
      });
    }
  }

  const duplicateSymbols = Array.from(symbolMap.entries())
    .filter(([, locations]) =>
      new Set(locations.map((location) => location.path)).size > 1
    )
    .map(([name, locations]) => ({ name, locations: locations.slice(0, 30) }))
    .slice(0, MAX_MAP_ITEMS);
  for (const duplicate of duplicateSymbols.slice(0, 100)) {
    addFinding(findings, {
      severity: "P3",
      rule_id: "CGRL-DUPLICATE-SYMBOL-001",
      message: "The symbol " + duplicate.name +
        " is declared in multiple files.",
      correction:
        "Confirm whether the declarations are separate page scopes or duplicate shared logic before consolidating them.",
    });
  }

  const selected = files.find((file) => file.path === input.selected_path);
  let candidateCode: string | null = null;
  let candidateHash: string | null = null;
  if (selected && !hasCredentialValue(selected.content)) {
    const candidate = duplicateCandidate(selected.content);
    if (candidate.changed) {
      candidateCode = candidate.content;
      candidateHash = await digest(candidate.content);
      addFinding(findings, {
        severity: "P2",
        rule_id: "CGRL-EXACT-DUPLICATE-001",
        message:
          "Exact duplicate import or linked-asset lines were found in the selected source.",
        correction:
          "Review the proposed complete-file candidate, which removes only exact duplicate include lines, in Code God.",
        path: selected.path,
      });
    }
  }

  const databaseMap = mapDatabaseCalls(files);
  const secretReferences = exactSecretReferences(files);
  const coverageComplete = input.coverage_complete !== false;
  const outcome = !coverageComplete
    ? "SAFE_FAILURE"
    : candidateCode
    ? "CANDIDATE_READY"
    : "READY_FOR_REVIEW";

  return {
    ok: coverageComplete,
    version: VERSION,
    tool: "analyze_code_labs_repository",
    feature: "CG Repair Lab",
    product: "Code Labs Pro",
    outcome,
    read_only: true,
    wrote_database: false,
    wrote_github: false,
    opened_pr: false,
    deployed: false,
    replaced_selected_source: false,
    code_god_outcome: null,
    code_god_required: true,
    github_writer_required: true,
    repository: input.repo,
    ref: input.ref,
    selected_path: input.selected_path,
    coverage: {
      complete: coverageComplete,
      indexed_files: files.length,
      indexed_live_pages: files.filter((file) => isLivePage(file.path)).length,
      manifest_files: pathSet.size,
      skipped_paths: (input.skipped_paths || []).slice(0, 200),
      credential_value_files: credentialFiles,
    },
    findings,
    dependency_map: dependencyMap,
    debug_report: {
      missing_dependencies: missingDependencies,
      duplicate_symbols: duplicateSymbols,
      local_storage_calls: localStorageMap,
      write_routes: databaseMap.write_routes,
    },
    database_map: databaseMap,
    secret_reference_map: secretReferences,
    proposed_complete_file_candidate: candidateCode,
    proposed_candidate_hash: candidateHash,
    next_stage: candidateCode
      ? "Code God deterministic review"
      : "Review findings and prepare a complete-file candidate",
  };
}

async function fetchBlob(repo: string, token: string, row: Row) {
  const size = Number(row.size || 0);
  if (!row.sha || size > MAX_FILE_BYTES) return null;
  const blob = await githubRequest(
    "/repos/" + repo.split("/").map(encodeURIComponent).join("/") +
      "/git/blobs/" + encodeURIComponent(row.sha),
    token,
  );
  if (blob.encoding !== "base64" || typeof blob.content !== "string") {
    return null;
  }
  const bytes = base64ToBytes(blob.content);
  return {
    path: String(row.path),
    content: new TextDecoder().decode(bytes),
  } as SnapshotFile;
}

async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

export async function getCgRepairLabAccess(b: Binding) {
  const access = await entitlement(b.owner_id);
  const rows = access.entitled
    ? await rest(
      "code_labs_github_repositories?select=repo_full_name,default_branch,status" +
        "&owner_id=eq." + encodeURIComponent(b.owner_id) +
        "&status=eq.active&order=repo_full_name.asc&limit=100",
    )
    : [];
  return {
    ok: access.entitled,
    version: VERSION,
    tool: "get_cg_repair_lab_access",
    feature: "CG Repair Lab",
    product: "Code Labs Pro",
    entitled: access.entitled,
    plan_key: access.plan_key,
    status: access.status,
    expires_at: access.expires_at,
    repositories: Array.isArray(rows)
      ? rows.map((row: Row) => ({
        repo: row.repo_full_name,
        default_branch: row.default_branch,
      }))
      : [],
    read_only: true,
    wrote_database: false,
  };
}

export function getCgRepairLabWorkflow() {
  return {
    ok: true,
    version: VERSION,
    feature: "CG Repair Lab",
    product: "Code Labs Pro",
    read_only_default: true,
    controls: [
      {
        control: "check_pro_access",
        connector: "Code Labs V104 Tool-Only",
        tool: "get_cg_repair_lab_access",
        writes: false,
      },
      {
        control: "analyze_repository",
        connector: "Code Labs V104 Tool-Only",
        tool: "analyze_code_labs_repository",
        writes: false,
      },
      {
        control: "save_separate_candidate",
        connector: "Code Labs V104 Tool-Only",
        tool: "run_code_labs_action",
        action: "cg_repair_lab.save_candidate",
        writes: "selected file metadata only",
        replaces_selected_source: false,
      },
      {
        control: "prepare_code_god_handoff",
        connector: "Code Labs V104 Tool-Only",
        tool: "run_code_labs_action",
        action: "repo.prepare_handoff",
        writes: "selected file metadata and receipt only",
      },
      {
        control: "run_code_god",
        connector: "Code Labs V104 Tool-Only",
        tool: "run_code_labs_action",
        action: "code_god.review",
        writes: "deterministic review and receipt only",
      },
      {
        control: "queue_writer_request",
        connector: "Code Labs V104 Tool-Only",
        tool: "run_code_labs_action",
        action: "github.writer_prepare",
        writes: "private queue and receipt only",
        requires_code_god_pass: true,
      },
      {
        control: "execute_reviewed_writer",
        connector: "Code Labs V104 Writer",
        tool: "execute_code_labs_github_writer",
        writes:
          "one reviewed file on an existing non-protected branch and one draft PR",
        requires_code_god_pass: true,
      },
      {
        control: "read_code_labs_page",
        connector: "Code Labs V104",
        tool: "read_code_labs_url",
        writes: false,
      },
    ],
    prohibited: [
      "candidate.accept",
      "direct default-branch write",
      "merge",
      "deploy",
      "database mutation by analysis",
    ],
  };
}

export async function analyzeCgRepairLab(b: Binding, args: Row) {
  const access = await entitlement(b.owner_id);
  if (!access.entitled) {
    throw new Error(
      "CG Repair Lab requires an active Code Labs Pro entitlement.",
    );
  }
  const repo = cleanRepo(args.repo);
  const authority = await verifyOwnerRepository(
    b.owner_id,
    repo,
    { contents: "read", metadata: "read" },
  );
  const ref = cleanRef(args.ref, authority.default_branch);
  const selectedPath = cleanPath(args.path);
  const repoPath = "/repos/" +
    repo.split("/").map(encodeURIComponent).join("/");
  const commit = await githubRequest(
    repoPath + "/commits/" + encodeURIComponent(ref),
    authority.token,
  );
  const commitSha = String(commit.sha || "");
  const treeSha = String(commit.commit?.tree?.sha || "");
  if (!commitSha || !treeSha) {
    throw new Error("GitHub did not return verified source provenance.");
  }
  const tree = await githubRequest(
    repoPath + "/git/trees/" + encodeURIComponent(treeSha) + "?recursive=1",
    authority.token,
  );
  if (tree.truncated) {
    return scanRepositorySnapshot({
      repo,
      ref: commitSha,
      selected_path: selectedPath,
      files: [],
      manifest_paths: [],
      coverage_complete: false,
      skipped_paths: ["Repository tree was truncated by GitHub."],
    });
  }
  const blobs: Row[] = Array.isArray(tree.tree)
    ? tree.tree.filter((row: Row) =>
      row.type === "blob" && !SKIP_PATH.test(String(row.path || ""))
    )
    : [];
  const rows = blobs.filter((row) => supportedPath(String(row.path || "")));
  const manifestPaths = blobs.map((row) => String(row.path));
  const byPath = new Map(rows.map((row) => [String(row.path), row]));
  if (!byPath.has(selectedPath)) {
    throw new Error(
      "The selected source path does not exist at the verified ref.",
    );
  }
  const livePages = rows.filter((row) => isLivePage(String(row.path)));
  const backend = rows.filter((row) =>
    /^supabase\/(?:functions|migrations)\//.test(String(row.path)) ||
    /(?:^|\/)(?:package|deno|tsconfig|vite\.config|next\.config)[^/]*\.(?:json|js|mjs|ts)$/i
      .test(String(row.path))
  );
  const seedMap = new Map<string, Row>();
  for (const row of [byPath.get(selectedPath), ...livePages, ...backend]) {
    if (row) seedMap.set(String(row.path), row);
  }
  if (seedMap.size > MAX_FILES) {
    return scanRepositorySnapshot({
      repo,
      ref: commitSha,
      selected_path: selectedPath,
      files: [],
      manifest_paths: manifestPaths,
      coverage_complete: false,
      skipped_paths: [
        "The live-page and backend seed set exceeds the bounded scan limit.",
      ],
    });
  }
  const fetched = new Map<string, SnapshotFile>();
  let totalBytes = 0;
  const skipped: string[] = [];
  const fetchRows = async (batch: Row[]) => {
    const available = batch.filter((row) => !fetched.has(String(row.path)));
    const results = await mapConcurrent(available, 8, async (row) => {
      try {
        return await fetchBlob(repo, authority.token, row);
      } catch {
        return null;
      }
    });
    results.forEach((file, index) => {
      if (!file) {
        skipped.push(String(available[index].path));
        return;
      }
      totalBytes += new TextEncoder().encode(file.content).length;
      fetched.set(file.path, file);
    });
  };
  await fetchRows(Array.from(seedMap.values()));
  const allPaths = new Set(manifestPaths);
  for (let depth = 0; depth < MAX_FILES; depth += 1) {
    const additions = new Map<string, Row>();
    for (const file of fetched.values()) {
      for (
        const reference of extractDependencyReferences(file.path, file.content)
      ) {
        const resolved = resolveDependency(file.path, reference.raw, allPaths);
        if (!resolved) continue;
        const row = byPath.get(resolved);
        if (row && !fetched.has(resolved)) additions.set(resolved, row);
      }
    }
    if (!additions.size) break;
    if (
      fetched.size + additions.size > MAX_FILES || totalBytes > MAX_TOTAL_BYTES
    ) {
      skipped.push("Dependency expansion exceeded the bounded scan limit.");
      break;
    }
    await fetchRows(Array.from(additions.values()));
  }
  const liveCoverage = livePages.every((row) => fetched.has(String(row.path)));
  const selectedCoverage = fetched.has(selectedPath);
  const sizeCoverage = totalBytes <= MAX_TOTAL_BYTES;
  const report = await scanRepositorySnapshot({
    repo,
    ref: commitSha,
    selected_path: selectedPath,
    files: Array.from(fetched.values()),
    manifest_paths: manifestPaths,
    coverage_complete: liveCoverage && selectedCoverage && sizeCoverage &&
      skipped.length === 0,
    skipped_paths: skipped,
  });
  return {
    ...report,
    verified_source: {
      repository: repo,
      requested_ref: ref,
      commit_sha: commitSha,
      selected_path: selectedPath,
      github_installation_verified: true,
    },
  };
}
