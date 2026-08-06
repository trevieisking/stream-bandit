const HASH_VERSION = "sha256-utf8-v1";
const HANDOFF_HASH_VERSION = "canonical-json-v1";
const INDEPENDENT_EVIDENCE_KIND = "master-checklist-independent-gate-v1";
const CODE_GOD_TRUST_STATE = "HOLD_UNTRUSTED_ADVISORY";
const CODE_GOD_REVIEW_VERSION = "V50-code-god-2-bounded-advisory";
const CODE_GOD_CAPABILITY_VERSION = "code-god-structural-preservation-and-five-senses-v3";
const MAX_QUEUE_CONTENT = 180000;
const MAX_REVIEW_INPUTS = 12;
const MAX_REVIEW_INPUT_TEXT = 4000;
const PROTECTED_BRANCHES = new Set(["main", "master", "production", "live", "gh-pages"]);
const CODE_GOD_SENSE_ORDER = Object.freeze(["eyes", "nose", "ears", "brain", "mouth"]);
const REVIEW_INPUT_KINDS = new Set(["instruction", "change", "patch", "fix", "constraint", "question"]);

export const ATOMIC_DOMAIN_PREPARATION_COVERAGE = Object.freeze({
  prepared: Object.freeze([
    "repo.prepare_handoff",
    "code_god.review",
    "github.writer_prepare",
  ]),
  external_evidence_required: Object.freeze([
    "owner_repository_authority",
    "immutable_branch_proof",
    "active_queue_snapshot",
    "target_blob_snapshot",
    "independent_review_checkpoint_receipt",
  ]),
  schema_binding_required_before_cutover: Object.freeze([
    "github_base_sha",
    "github_head_sha",
    "code_god_scope_outcome",
    "independent_evidence_checkpoint_id",
    "independent_evidence_receipt_id",
    "safety_note",
  ]),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function requiredText(value, label, max = 20000) {
  const output = String(value ?? "").trim();
  if (!output || output.length > max) throw new Error(`${label} is required.`);
  return output;
}

function exactSha(value, label) {
  const output = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(output)) throw new Error(`${label} must be an exact 40-character Git SHA.`);
  return output;
}

function exactHash(value, label) {
  const output = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(output)) throw new Error(`${label} must be an exact SHA-256 hash.`);
  return output;
}

function exactUuid(value, label) {
  const output = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(output)) {
    throw new Error(`${label} must be an exact UUID.`);
  }
  return output;
}

function exactTime(value, label) {
  const output = String(value || "").trim();
  if (!output || Number.isNaN(Date.parse(output))) throw new Error(`${label} is required.`);
  return output;
}

function safeRepo(value) {
  const repo = requiredText(value, "repository", 200);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("Repository must use owner/name form.");
  }
  return repo;
}

function safePath(value) {
  const path = requiredText(value, "target path", 500).replace(/^\/+/, "");
  if (
    path.startsWith(".") || path.includes("..") || path.includes("\\") ||
    path.toLowerCase().includes("secrets") || path.startsWith(".github/") ||
    /\.(?:env|pem|key|p12|pfx)$/i.test(path)
  ) {
    throw new Error("Target path is protected or unsafe.");
  }
  return path;
}

function safeBranch(value) {
  const branch = requiredText(value, "working branch", 80);
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) || branch.startsWith("/") ||
    branch.endsWith("/") || branch.includes("//") || branch.includes("..") ||
    PROTECTED_BRANCHES.has(branch.toLowerCase())
  ) {
    throw new Error("Working branch is missing, malformed or protected.");
  }
  return branch;
}

function normalizeAction(value) {
  const action = String(value || "change").trim().toLowerCase();
  if (action === "create") return "add";
  if (action === "delete") return "remove";
  if (action === "add" || action === "change") return action;
  throw new Error("Repo handoff requires an add or change action.");
}

function completeFile(path, value) {
  const content = String(value || "");
  if (!content.trim() || content.length < 120 || content.length > MAX_QUEUE_CONTENT) return false;
  const patchRecipePattern = new RegExp([
    ["BEGIN", "PATCH"].join(" "),
    ["Find", ":"].join("") + "\\s*\\n",
    ["Replace", "with:"].join(" "),
  ].join("|"), "i");
  if (patchRecipePattern.test(content)) return false;
  if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(content)) return false;
  if (/\.html?$/i.test(path) && !/<!doctype\s+html/i.test(content) && !/<html[\s>]/i.test(content)) return false;
  if (/\.json$/i.test(path)) {
    try {
      JSON.parse(content);
    } catch {
      return false;
    }
  }
  return true;
}

function secretLike(value) {
  const text = String(value || "");
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text) ||
    /\bsk-[A-Za-z0-9_-]{20,}\b/.test(text) ||
    /\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(text) ||
    /\bBearer\s+[A-Za-z0-9._~-]{30,}\b/i.test(text) ||
    /(?:password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i.test(text);
}

function matchedValues(value, patterns) {
  const found = new Set();
  const text = String(value || "");
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    let match;
    while ((match = regex.exec(text))) {
      const captured = match[1] || match[2] || match[3] || "";
      if (captured) found.add(captured);
      if (match.index === regex.lastIndex) regex.lastIndex += 1;
    }
  }
  return Array.from(found).sort();
}

function normalizeExportSpecifiers(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim().replace(/^type\s+/i, "").split(/\s+as\s+/i).pop()?.trim())
    .filter(Boolean);
}

function topLevelIndex(value, target) {
  const text = String(value || "");
  let quote = "";
  let escaped = false;
  let round = 0;
  let square = 0;
  let curly = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      quote = character;
      continue;
    }
    if (character === "(") round += 1;
    else if (character === ")") round = Math.max(0, round - 1);
    else if (character === "[") square += 1;
    else if (character === "]") square = Math.max(0, square - 1);
    else if (character === "{") curly += 1;
    else if (character === "}") curly = Math.max(0, curly - 1);
    else if (character === target && round === 0 && square === 0 && curly === 0) return index;
  }
  return -1;
}

function splitTopLevel(value) {
  const text = String(value || "");
  const parts = [];
  let cursor = 0;
  while (cursor <= text.length) {
    const relative = topLevelIndex(text.slice(cursor), ",");
    if (relative < 0) {
      parts.push(text.slice(cursor));
      break;
    }
    parts.push(text.slice(cursor, cursor + relative));
    cursor += relative + 1;
  }
  return parts;
}

function bindingNames(value) {
  let pattern = String(value || "").trim();
  if (!pattern) return [];
  if (pattern.startsWith("...")) pattern = pattern.slice(3).trim();
  const defaultIndex = topLevelIndex(pattern, "=");
  if (defaultIndex >= 0) pattern = pattern.slice(0, defaultIndex).trim();
  if (pattern.startsWith("[") && pattern.endsWith("]")) {
    return splitTopLevel(pattern.slice(1, -1)).flatMap(bindingNames);
  }
  if (pattern.startsWith("{") && pattern.endsWith("}")) {
    return splitTopLevel(pattern.slice(1, -1)).flatMap((entry) => {
      const property = entry.trim();
      if (!property) return [];
      if (property.startsWith("...")) return bindingNames(property.slice(3));
      const colonIndex = topLevelIndex(property, ":");
      return bindingNames(colonIndex >= 0 ? property.slice(colonIndex + 1) : property);
    });
  }
  const typeIndex = topLevelIndex(pattern, ":");
  if (typeIndex >= 0) pattern = pattern.slice(0, typeIndex).trim();
  const identifier = pattern.match(/^([A-Za-z_$][\w$]*)$/);
  return identifier ? [identifier[1]] : [];
}

function declarationBody(text, start) {
  let quote = "";
  let escaped = false;
  let round = 0;
  let square = 0;
  let curly = 0;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      quote = character;
      continue;
    }
    if (character === "(") round += 1;
    else if (character === ")") round = Math.max(0, round - 1);
    else if (character === "[") square += 1;
    else if (character === "]") square = Math.max(0, square - 1);
    else if (character === "{") curly += 1;
    else if (character === "}") curly = Math.max(0, curly - 1);
    else if (character === ";" && round === 0 && square === 0 && curly === 0) {
      return text.slice(start, index);
    } else if (character === "\n" && round === 0 && square === 0 && curly === 0) {
      const current = text.slice(start, index).trimEnd();
      if (/[,=:>]$/.test(current)) continue;
      const next = text.slice(index + 1).match(/^\s*(export|import|const|let|var|function|class|interface|type|enum|return|if|for|while|switch|try|throw)\b/);
      if (next) return text.slice(start, index);
    }
  }
  return text.slice(start);
}

function variableBindings(value, exportedOnly) {
  const text = String(value || "");
  const found = new Set();
  const declaration = /^(export\s+)?(?:declare\s+)?(?:const(?!\s+enum\b)|let|var)\s+/gm;
  let match;
  while ((match = declaration.exec(text))) {
    if (exportedOnly && !match[1]) continue;
    const body = declarationBody(text, declaration.lastIndex);
    for (const declarator of splitTopLevel(body)) {
      for (const name of bindingNames(declarator)) found.add(name);
    }
  }
  return Array.from(found).sort();
}

function wildcardReExports(value) {
  const text = String(value || "");
  const found = new Set();
  const pattern = /^export\s+\*\s*(?:as\s+([A-Za-z_$][\w$]*)\s+)?from\s+["']([^"']+)["']/gm;
  let match;
  while ((match = pattern.exec(text))) {
    found.add(match[1] ? `* as ${match[1]} from ${match[2]}` : `* from ${match[2]}`);
  }
  return Array.from(found).sort();
}

function structuralInventory(value) {
  const text = String(value || "");
  const declarations = matchedValues(text, [
    /^export\s+(?:declare\s+)?(?:async\s+)?function(?:\s*\*\s*|\s+)([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:declare\s+)?class\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:declare\s+)?interface\s+([A-Za-z_$][\w$]*)/gm,
    /^export\s+(?:declare\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/gm,
    /^export\s+(?:declare\s+)?(?:const\s+)?enum\s+([A-Za-z_$][\w$]*)/gm,
  ]);
  const exportedVariables = variableBindings(text, true);
  const specifiers = matchedValues(text, [
    /^export\s+(?:type\s+)?\{([^}]+)\}/gm,
  ]).flatMap(normalizeExportSpecifiers);
  const topLevelFunctionsAndClasses = matchedValues(text, [
    /^(?:export\s+)?(?:declare\s+)?(?:async\s+)?function(?:\s*\*\s*|\s+)([A-Za-z_$][\w$]*)\s*\(/gm,
    /^(?:export\s+)?(?:declare\s+)?class\s+([A-Za-z_$][\w$]*)\b/gm,
  ]);
  return {
    exports: Array.from(new Set([...declarations, ...exportedVariables, ...specifiers])).sort(),
    wildcard_exports: wildcardReExports(text),
    default_export: /\bexport\s+default\b/.test(text) ? ["default"] : [],
    symbols: Array.from(new Set([...topLevelFunctionsAndClasses, ...variableBindings(text, false)])).sort(),
    dom_ids: matchedValues(text, [/\bid\s*=\s*["']([^"']+)["']/gi]),
    route_ids: matchedValues(text, [/\bdata-cl-route-id\s*=\s*["']([^"']+)["']/gi]),
    storage_keys: matchedValues(text, [
      /\b(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\s*\(\s*["']([^"']+)["']/g,
    ]),
    dependencies: matchedValues(text, [
      /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']/g,
      /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g,
      /<(?:script|link)\b[^>]*?(?:src|href)\s*=\s*["']([^"']+)["']/gi,
    ]),
    database_tables: matchedValues(text, [/\.from\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g]),
    rpcs: matchedValues(text, [/\.rpc\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/g]),
    edge_functions: matchedValues(text, [/\.functions\.invoke\(\s*["']([A-Za-z_][A-Za-z0-9_-]*)["']/g]),
    public_actions: matchedValues(text, [
      /\baction\s*:\s*["']([a-z0-9_.-]+)["']/gi,
      /\btool\s*:\s*["']([a-z0-9_.-]+)["']/gi,
    ]),
  };
}

function missingInventoryValues(original, proposed) {
  const before = structuralInventory(original);
  const after = structuralInventory(proposed);
  const missing = {};
  for (const key of Object.keys(before)) {
    const afterValues = new Set(after[key]);
    const removed = before[key].filter((value) => !afterValues.has(value));
    if (removed.length) missing[key] = removed;
  }
  return { before, after, missing };
}

function addPreservationFindings(findings, comparison) {
  const rules = {
    exports: ["CG-EXPORT-PRESERVATION-001", "export"],
    wildcard_exports: ["CG-EXPORT-PRESERVATION-001", "wildcard re-export"],
    default_export: ["CG-EXPORT-PRESERVATION-001", "default export"],
    symbols: ["CG-SYMBOL-PRESERVATION-001", "top-level symbol"],
    dom_ids: ["CG-DOM-ID-PRESERVATION-001", "DOM id"],
    route_ids: ["CG-ROUTE-PRESERVATION-001", "route id"],
    storage_keys: ["CG-STORAGE-PRESERVATION-001", "storage key"],
    dependencies: ["CG-DEPENDENCY-PRESERVATION-001", "dependency"],
    database_tables: ["CG-DATABASE-PRESERVATION-001", "database table"],
    rpcs: ["CG-DATABASE-PRESERVATION-001", "RPC"],
    edge_functions: ["CG-DATABASE-PRESERVATION-001", "Edge Function"],
    public_actions: ["CG-PUBLIC-TOOL-PRESERVATION-001", "public action or tool"],
  };
  for (const [key, values] of Object.entries(comparison.missing)) {
    const [rule, label] = rules[key];
    findings.push(finding(
      "P1",
      rule,
      `The proposed file removes ${label} contract values: ${values.join(", ")}.`,
      "Restore the removed contract or provide a separately reviewed machine-readable retirement manifest in a later trust stage.",
    ));
  }
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalValue(value));
}

export async function hashUtf8Text(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value ?? "")));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashCanonicalJson(value) {
  return await hashUtf8Text(canonicalJson(value));
}

function verifiedAuthority(context, expectedRepo) {
  const authority = object(context.authority, "owner repository authority");
  if (authority.verified !== true) throw new Error("Owner repository authority is not verified.");
  const repo = safeRepo(authority.repo);
  if (repo !== expectedRepo) throw new Error("Owner repository authority does not match the selected repository.");
  return {
    repo,
    default_branch: requiredText(authority.default_branch, "default branch", 200),
    source_commit_sha: exactSha(authority.source_commit_sha, "source commit SHA"),
    verified_at: exactTime(authority.verified_at, "authority verification time"),
  };
}

function verifiedBranch(context, expectedRepo, expectedBranch) {
  const proof = object(context.branch_proof, "immutable branch proof");
  if (proof.verified !== true) throw new Error("Immutable branch proof is not verified.");
  const repo = safeRepo(proof.repo);
  const branch = safeBranch(proof.branch);
  if (repo !== expectedRepo || branch !== expectedBranch) {
    throw new Error("Immutable branch proof does not match the requested repository and branch.");
  }
  return {
    repo,
    branch,
    base_branch: requiredText(proof.base_branch, "base branch", 200),
    base_sha: exactSha(proof.base_sha, "base SHA"),
    head_sha: exactSha(proof.head_sha, "head SHA"),
    verified_at: exactTime(proof.verified_at, "branch verification time"),
  };
}

function queueSnapshot(context, expected) {
  const snapshot = object(context.queue_snapshot, "active queue snapshot");
  if (snapshot.complete !== true) throw new Error("Active queue evidence is incomplete.");
  if (
    safeRepo(snapshot.repo) !== expected.repo || safePath(snapshot.path) !== expected.path ||
    safeBranch(snapshot.branch) !== expected.branch
  ) {
    throw new Error("Active queue evidence does not match the reviewed target.");
  }
  const active = Number(snapshot.active_matching_requests);
  if (!Number.isSafeInteger(active) || active < 0) throw new Error("Active queue count is invalid.");
  return { active_matching_requests: active, captured_at: exactTime(snapshot.captured_at, "queue snapshot time") };
}

function blobSnapshot(context, expected) {
  const snapshot = object(context.blob_snapshot, "target blob snapshot");
  if (snapshot.complete !== true) throw new Error("Target blob evidence is incomplete.");
  if (
    safeRepo(snapshot.repo) !== expected.repo || safePath(snapshot.path) !== expected.path ||
    safeBranch(snapshot.branch) !== expected.branch || exactSha(snapshot.head_sha, "blob snapshot head SHA") !== expected.head_sha
  ) {
    throw new Error("Target blob evidence does not match the reviewed branch head.");
  }
  const absent = snapshot.absent === true;
  const blobSha = absent ? null : exactSha(snapshot.blob_sha, "target blob SHA");
  if (absent && snapshot.blob_sha != null && String(snapshot.blob_sha) !== "") {
    throw new Error("An absent target blob cannot also have a blob SHA.");
  }
  return { absent, blob_sha: blobSha, captured_at: exactTime(snapshot.captured_at, "blob snapshot time") };
}

function independentEvidenceIds(args) {
  const fields = object(args.fields, "Writer preparation fields");
  return {
    kind: INDEPENDENT_EVIDENCE_KIND,
    checkpoint_id: exactUuid(
      fields.independent_evidence_checkpoint_id,
      "independent evidence checkpoint id",
    ),
    receipt_id: exactUuid(
      fields.independent_evidence_receipt_id,
      "independent evidence receipt id",
    ),
  };
}

function receiptEffect(recordId, changedFields) {
  return {
    kind: "receipt_insert",
    key: "receipt",
    record_type: "file",
    record_id: recordId,
    changed_fields: [...changedFields],
    created_new_row: false,
    undo_available: false,
  };
}

function recordUpdate(file, metadata) {
  return {
    kind: "record_update",
    key: "record",
    record_type: "file",
    record_id: requiredText(file.id, "selected file id", 100),
    expected_updated_at: exactTime(file.updated_at, "selected file updated_at"),
    patch: { metadata },
  };
}

function marker(handoff) {
  return {
    version: handoff.version,
    action: handoff.action,
    repo: handoff.repo,
    source_repo: handoff.source_repo,
    source_branch: handoff.source_branch,
    source_commit_sha: handoff.source_commit_sha,
    request_branch: handoff.request_branch,
    github_base_branch: handoff.github_base_branch,
    github_base_sha: handoff.github_base_sha,
    github_head_branch: handoff.github_head_branch,
    github_head_sha: handoff.github_head_sha,
    path: handoff.path,
    source_file_id: handoff.source_file_id,
    current_hash: handoff.current_hash,
    proposed_hash: handoff.proposed_hash,
    hash_version: handoff.hash_version,
    created_at: handoff.created_at,
  };
}

export async function prepareRepoHandoffAtomic(argsValue, contextValue) {
  const args = object(argsValue || {}, "Repo handoff arguments");
  const context = object(contextValue || {}, "Repo handoff context");
  const project = object(context.project, "selected project");
  const file = object(context.file, "selected file");
  const job = context.job && typeof context.job === "object" ? context.job : {};
  const fields = args.fields && typeof args.fields === "object" ? args.fields : {};
  const repo = safeRepo(fields.repo || project.repo);
  if (safeRepo(project.repo) !== repo) throw new Error("The selected project and requested repository do not match.");
  const branch = safeBranch(fields.branch);
  const authority = verifiedAuthority(context, repo);
  const branchProof = verifiedBranch(context, repo, branch);
  if (branchProof.base_branch !== authority.default_branch || branchProof.base_sha !== authority.source_commit_sha) {
    throw new Error("Branch proof does not descend from the verified source commit.");
  }
  const path = safePath(fields.path || file.metadata?.source_path || file.filename);
  const proposed = String(fields.content ?? file.metadata?.fixed_output ?? "");
  if (!completeFile(path, proposed)) throw new Error("A complete proposed file under 180000 characters is required.");
  const original = String(file.current_code || "");
  const now = exactTime(context.now, "preparation time");
  const handoff = {
    version: "V50-repo-handoff-1",
    action: normalizeAction(fields.action),
    repo,
    source_repo: repo,
    source_branch: authority.default_branch,
    source_commit_sha: authority.source_commit_sha,
    request_branch: branch,
    github_base_branch: branchProof.base_branch,
    github_base_sha: branchProof.base_sha,
    github_head_branch: branchProof.branch,
    github_head_sha: branchProof.head_sha,
    branch_verified_at: branchProof.verified_at,
    path,
    source_file_id: requiredText(file.id, "selected file id", 100),
    original,
    proposed,
    notes: String(fields.notes || job.problem || "").slice(0, 12000),
    preserve: String(job.dont_touch || "").slice(0, 12000),
    current_hash: await hashUtf8Text(original),
    proposed_hash: await hashUtf8Text(proposed),
    hash_version: HASH_VERSION,
    created_at: now,
  };
  const metadata = clone(file.metadata || {});
  metadata.repo_handoff = handoff;
  delete metadata.code_god_review;
  delete metadata.github_writer_request;

  return {
    action: "repo.prepare_handoff",
    payload: {
      effects: [recordUpdate(file, metadata), receiptEffect(String(file.id), ["metadata"])],
      response: {
        tool: "run_code_labs_action",
        action: "repo.prepare_handoff",
        mutation_engine: "atomic-v50",
        handoff: marker(handoff),
      },
    },
    handoff,
  };
}

function finding(severity, rule_id, message, correction, blocks_github = true) {
  return { severity, rule_id, message, correction, blocks_github };
}

function canonicalLearningHistory(context) {
  const source = context?.project?.metadata?.workflow_learning_history;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return { entries: [], invalid_ids: ["missing"] };
  }
  const entries = [];
  const invalidIds = [];
  for (const id of Object.keys(source).filter((value) => /^CL-HIST-\d+$/.test(value)).sort()) {
    const value = source[id];
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      invalidIds.push(id);
      continue;
    }
    const cause = String(value.cause || "").trim();
    const correction = String(value.correction || "").trim();
    const regression = String(value.regression || "").trim();
    if (!cause || !correction || !regression) {
      invalidIds.push(id);
      continue;
    }
    entries.push({
      id,
      cause,
      correction,
      regression,
      runtime_proof: String(value.runtime_proof || "").trim(),
      promotion_boundary: String(value.promotion_boundary || "").trim(),
    });
  }
  if (!entries.length && !invalidIds.length) invalidIds.push("missing");
  return { entries, invalid_ids: invalidIds };
}

function normalizedReviewInput(kindValue, textValue, source) {
  const kind = String(kindValue || "instruction").trim().toLowerCase();
  if (!REVIEW_INPUT_KINDS.has(kind)) {
    return { rejected: true, source, kind, reason: "unsupported-input-kind" };
  }
  const text = String(textValue || "").trim();
  if (!text) return null;
  if (text.length > MAX_REVIEW_INPUT_TEXT) {
    return { rejected: true, source, kind, reason: "input-too-large" };
  }
  if (secretLike(text)) {
    return { rejected: true, source, kind, reason: "secret-like-input" };
  }
  return { rejected: false, source, kind, text };
}

async function listenToReviewInputs(argsValue, handoff) {
  const args = argsValue && typeof argsValue === "object" && !Array.isArray(argsValue) ? argsValue : {};
  const fields = args.fields && typeof args.fields === "object" && !Array.isArray(args.fields) ? args.fields : {};
  const candidates = [
    { kind: "instruction", text: handoff.notes, source: "handoff.notes" },
    { kind: "constraint", text: handoff.preserve, source: "handoff.preserve" },
  ];
  for (const kind of ["instruction", "change", "patch", "fix", "constraint", "question"]) {
    if (Object.prototype.hasOwnProperty.call(fields, kind)) {
      candidates.push({ kind, text: fields[kind], source: `fields.${kind}` });
    }
  }
  if (Object.prototype.hasOwnProperty.call(fields, "input")) {
    candidates.push({ kind: "instruction", text: fields.input, source: "fields.input" });
  }
  if (Array.isArray(fields.review_inputs)) {
    fields.review_inputs.forEach((entry, index) => {
      if (typeof entry === "string") {
        candidates.push({ kind: "instruction", text: entry, source: `fields.review_inputs[${index}]` });
      } else if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        candidates.push({
          kind: entry.kind,
          text: entry.text ?? entry.value,
          source: `fields.review_inputs[${index}]`,
        });
      } else {
        candidates.push({ kind: "instruction", text: "", source: `fields.review_inputs[${index}]`, malformed: true });
      }
    });
  }

  const accepted = [];
  const rejected = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (accepted.length + rejected.length >= MAX_REVIEW_INPUTS) {
      rejected.push({ source: candidate.source, kind: String(candidate.kind || "instruction"), reason: "input-limit-exceeded" });
      continue;
    }
    if (candidate.malformed) {
      rejected.push({ source: candidate.source, kind: "instruction", reason: "malformed-input" });
      continue;
    }
    const normalized = normalizedReviewInput(candidate.kind, candidate.text, candidate.source);
    if (!normalized) continue;
    if (normalized.rejected) {
      rejected.push(normalized);
      continue;
    }
    const identity = normalized.kind + "\n" + normalized.text;
    if (seen.has(identity)) continue;
    seen.add(identity);
    accepted.push({
      input_id: `input-${accepted.length + 1}`,
      source: normalized.source,
      kind: normalized.kind,
      text: normalized.text,
      text_hash: await hashUtf8Text(normalized.text),
    });
  }
  return {
    status: "INPUTS_REVIEWED",
    acknowledgement: "Instructions, changes, fixes and patches were listened to as review evidence; none were applied directly.",
    accepted,
    rejected,
    accepted_count: accepted.length,
    rejected_count: rejected.length,
    secret_rejection_count: rejected.filter((entry) => entry.reason === "secret-like-input").length,
  };
}

async function seeCode(original, proposed, comparison, handoff) {
  const encoder = new TextEncoder();
  return {
    status: "SCANNED",
    acknowledgement: "The exact original and proposed files were scanned and are waiting for Nose, Ears, Brain and Mouth processing.",
    source_file_id: String(handoff.source_file_id || ""),
    path: String(handoff.path || ""),
    original_hash: await hashUtf8Text(original),
    proposed_hash: await hashUtf8Text(proposed),
    original_bytes: encoder.encode(original).length,
    proposed_bytes: encoder.encode(proposed).length,
    original_lines: original ? original.split(/\r?\n/).length : 0,
    proposed_lines: proposed ? proposed.split(/\r?\n/).length : 0,
    structural_inventory: comparison,
    waiting_for: "mouth",
  };
}

function smellProblems({ original, proposed, handoff, queue, comparison }) {
  const findings = [];
  if (!completeFile(String(handoff.path || ""), proposed)) {
    findings.push(finding("P1", "CG-FULLFILE-001", "The proposed file is incomplete or too large for the queue.", "Save one complete file under 180000 characters."));
  }
  if (handoff.action === "change" && original && proposed.length < Math.max(120, Math.floor(original.length * 0.65))) {
    findings.push(finding("P1", "CG-TRUNCATION-001", "The proposed file may be truncated.", "Restore missing sections and review again."));
  }
  if (/^(?:\s*<<<<<<<(?:\s|$)|\s*=======\s*$|\s*>>>>>>>(?:\s|$))/m.test(proposed)) {
    findings.push(finding("P1", "CG-CONFLICT-001", "Conflict markers were found.", "Resolve all conflict markers."));
  }
  const fencePattern = new RegExp(["`", "`", "`"].join("") + "(?:html|javascript|js|typescript|ts|json)?", "i");
  if (fencePattern.test(proposed)) {
    findings.push(finding("P2", "CG-FENCE-001", "Markdown fences appear inside the proposed file.", "Keep only complete file contents."));
  }
  if (secretLike(proposed)) {
    findings.push(finding("P0", "CG-SECRET-001", "Secret-like content appears in the proposed file.", "Remove the value and keep privileged values server-side only."));
  }
  if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed)) {
    findings.push(finding("P2", "CG-TIMER-001", "A frequent timer may duplicate work.", "Use a guarded single owner or explicit action.", false));
  }
  if (queue.active_matching_requests > 0) {
    findings.push(finding("P2", "CG-DUPLICATE-001", "A matching write request is already queued or processing.", "Reuse or close the existing request before queuing another.", false));
  }
  addPreservationFindings(findings, comparison);
  return {
    findings,
    report: {
      status: "SIGNALS_REPORTED",
      acknowledgement: "Local defects, contract removals and unsafe patterns were smelled and reported to the Brain.",
      signal_count: findings.length,
      signal_rule_ids: Array.from(new Set(findings.map((item) => item.rule_id))).sort(),
      missing_contract_categories: Object.keys(comparison.missing).sort(),
    },
  };
}

async function thinkAboutReview(context, systemFindings, noseFindings, ears) {
  const learning = canonicalLearningHistory(context);
  const findings = [...systemFindings, ...noseFindings];
  if (!learning.entries.length || learning.invalid_ids.length) {
    findings.push(finding(
      "P1",
      "CG-LEARNING-HISTORY-001",
      "The Brain could not load a complete canonical CL-HIST regression history.",
      "Restore every confirmed fix as a valid CL-HIST entry with cause, correction and regression fields before Writer preparation.",
    ));
  }
  if (ears.secret_rejection_count > 0) {
    findings.push(finding(
      "P0",
      "CG-INPUT-SECRET-001",
      "The Ears rejected secret-shaped review input.",
      "Remove privileged values and provide only safe instructions, changes, fixes or patches.",
    ));
  }
  const blocking = findings.some((item) => item.blocks_github);
  const outcome = blocking ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FIX_FIRST") : "PASS";
  const scopeOutcome = blocking
    ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FINDINGS_PRESENT")
    : "BOUNDED_CHECKS_CLEAR";
  const learningHistoryHash = await hashCanonicalJson(learning.entries);
  return {
    findings,
    outcome,
    scope_outcome: scopeOutcome,
    report: {
      status: "SYNTHESIZED",
      acknowledgement: "The Brain combined immutable evidence, Eyes inventory, Nose signals, Ear input and canonical regression history.",
      learning_history_status: learning.entries.length && !learning.invalid_ids.length ? "CURRENT" : "INCOMPLETE",
      learning_history_hash: learningHistoryHash,
      known_regression_count: learning.entries.length,
      known_regression_ids: learning.entries.map((entry) => entry.id),
      invalid_regression_ids: learning.invalid_ids,
      accepted_input_ids: ears.accepted.map((entry) => entry.input_id),
      finding_rule_ids: Array.from(new Set(findings.map((item) => item.rule_id))).sort(),
      blocking_finding_count: findings.filter((item) => item.blocks_github).length,
      outcome,
      scope_outcome: scopeOutcome,
    },
  };
}

function speakReview(brainResult, ears) {
  const findings = brainResult.findings;
  return {
    status: "SPOKEN",
    acknowledgement: findings.length
      ? `The Mouth is reporting ${findings.length} finding${findings.length === 1 ? "" : "s"} and proposed corrections.`
      : "The Mouth found no bounded defect to report.",
    findings_owner: "review.findings",
    finding_rule_ids: brainResult.report.finding_rule_ids,
    proposed_fixes: findings.map((item) => ({
      rule_id: item.rule_id,
      severity: item.severity,
      correction: item.correction,
      blocks_github: item.blocks_github,
      derived_from: "review.findings",
    })),
    acknowledged_input_ids: ears.accepted.map((entry) => entry.input_id),
    change_and_patch_policy: "Inputs, changes, fixes and patches are reviewed as evidence. The Mouth proposes corrections but cannot apply them; the protected one-file Writer remains the only GitHub write path.",
  };
}

export async function prepareCodeGodAtomic(argsValue, contextValue) {
  const args = argsValue && typeof argsValue === "object" && !Array.isArray(argsValue) ? argsValue : {};
  const context = object(contextValue || {}, "Code God context");
  const file = object(context.file, "selected file");
  const metadata = clone(file.metadata || {});
  const handoff = object(metadata.repo_handoff, "Repo handoff");
  const repo = safeRepo(handoff.repo);
  const branch = safeBranch(handoff.request_branch);
  const authority = verifiedAuthority(context, repo);
  const branchProof = verifiedBranch(context, repo, branch);
  const queue = queueSnapshot(context, { repo, path: safePath(handoff.path), branch });
  const proposed = String(handoff.proposed || "");
  const original = String(handoff.original || "");
  const systemFindings = [];

  if (handoff.source_repo !== authority.repo || handoff.source_commit_sha !== authority.source_commit_sha) {
    systemFindings.push(finding("P1", "CG-IDENTITY-001", "The reviewed repository provenance changed.", "Prepare the handoff again from current immutable repository evidence."));
  }
  if (handoff.source_file_id !== String(file.id || "")) {
    systemFindings.push(finding("P1", "CG-FILE-IDENTITY-001", "The handoff belongs to a different selected file.", "Select the correct file and prepare the handoff again."));
  }
  if (
    handoff.github_base_branch !== branchProof.base_branch || handoff.github_base_sha !== branchProof.base_sha ||
    handoff.github_head_branch !== branchProof.branch || handoff.github_head_sha !== branchProof.head_sha
  ) {
    systemFindings.push(finding("P1", "CG-BRANCH-PROOF-001", "The immutable branch proof changed after handoff preparation.", "Refresh branch proof and prepare the handoff again."));
  }
  if (handoff.hash_version !== HASH_VERSION) {
    systemFindings.push(finding("P1", "CG-HASH-VERSION-001", "The handoff does not use the canonical UTF-8 hash contract.", "Rebuild the handoff with sha256-utf8-v1."));
  }
  if (handoff.current_hash !== await hashUtf8Text(original) || handoff.proposed_hash !== await hashUtf8Text(proposed)) {
    systemFindings.push(finding("P1", "CG-HASH-BINDING-001", "The handoff content no longer matches its recorded hashes.", "Prepare a fresh handoff from the exact complete files."));
  }

  const structural = missingInventoryValues(original, proposed);
  const eyes = await seeCode(original, proposed, structural, handoff);
  const nose = smellProblems({ original, proposed, handoff, queue, comparison: structural });
  const ears = await listenToReviewInputs(args, handoff);
  const brain = await thinkAboutReview(context, systemFindings, nose.findings, ears);
  const mouth = speakReview(brain, ears);

  const review = {
    version: CODE_GOD_REVIEW_VERSION,
    capability_version: CODE_GOD_CAPABILITY_VERSION,
    outcome: brain.outcome,
    scope_outcome: brain.scope_outcome,
    authoritative: false,
    decision_scope: "bounded_static_structural_and_five_senses_checks",
    trust_state: CODE_GOD_TRUST_STATE,
    requires_independent_evidence_receipt: true,
    handoff_hash: await hashCanonicalJson(handoff),
    handoff_hash_version: HANDOFF_HASH_VERSION,
    repo,
    path: handoff.path,
    request_branch: branch,
    github_base_sha: branchProof.base_sha,
    github_head_sha: branchProof.head_sha,
    source_file_id: String(file.id),
    proposed_hash: handoff.proposed_hash,
    structural_inventory_owner: "senses.eyes.structural_inventory",
    findings: brain.findings,
    senses: {
      order: [...CODE_GOD_SENSE_ORDER],
      eyes,
      nose: nose.report,
      ears,
      brain: brain.report,
      mouth,
    },
    checks_run: [
      "owner-repository-authority", "immutable-branch-proof", "source-file-identity",
      "hash-contract", "full-file", "queue-limit", "truncation", "conflicts",
      "fences", "secret-values", "duplicate-queue", "timers",
      "export-preservation", "wildcard-reexport-preservation", "top-level-symbol-preservation",
      "dom-id-preservation", "route-id-preservation", "storage-key-preservation",
      "dependency-preservation", "database-contract-preservation",
      "public-action-and-tool-preservation", "eyes-code-scan", "nose-problem-signals",
      "ears-review-inputs", "brain-regression-history", "mouth-fix-proposals",
    ],
    checks_not_run: [
      "language-compile-or-typecheck", "runtime-behaviour", "browser-interaction",
      "database-integration", "migration-replay", "deployment",
      "feature-and-workflow-parity", "user-acceptance", "intentional-retirement-manifest",
      "natural-language-semantic-proof", "automatic-patch-application",
    ],
    limitations: [
      "The result covers only the deterministic checks listed in checks_run.",
      "The Brain knows the canonical CL-HIST entries supplied by the selected project; it cannot know an unrecorded fix.",
      "The Ears acknowledge bounded text inputs but do not prove the semantic correctness of natural-language advice.",
      "Structural extraction is conservative and removal-blocking; it does not prove runtime equivalence.",
      "The Mouth proposes corrections but cannot apply a patch, write GitHub, merge or deploy.",
      "Intentional retirements remain blocked until a separately reviewed machine-readable retirement manifest is implemented.",
      "A compatibility PASS token is not Writer, merge, deployment or production approval.",
      "An independent Master Checklist checkpoint and exact-head evidence remain mandatory.",
    ],
    evidence: {
      authority_verified_at: authority.verified_at,
      branch_verified_at: branchProof.verified_at,
      queue_snapshot_at: queue.captured_at,
      learning_history_hash: brain.report.learning_history_hash,
    },
    created_at: exactTime(context.now, "review time"),
  };
  metadata.code_god_review = review;
  delete metadata.github_writer_request;

  return {
    action: "code_god.review",
    payload: {
      effects: [recordUpdate(file, metadata), receiptEffect(String(file.id), ["metadata"])],
      response: {
        tool: "run_code_labs_action",
        action: "code_god.review",
        mutation_engine: "atomic-v50",
        review,
      },
    },
    review,
  };
}

export async function prepareGithubWriterAtomic(argsValue, contextValue) {
  const args = object(argsValue || {}, "Writer preparation arguments");
  if (args.confirmed !== true) throw new Error("confirmed must be true to prepare the GitHub request.");
  const context = object(contextValue || {}, "Writer preparation context");
  const file = object(context.file, "selected file");
  const metadata = clone(file.metadata || {});
  const handoff = object(metadata.repo_handoff, "Repo handoff");
  const review = object(metadata.code_god_review, "Code God review");
  if (
    review.version !== CODE_GOD_REVIEW_VERSION ||
    review.capability_version !== CODE_GOD_CAPABILITY_VERSION ||
    review.outcome !== "PASS" || review.scope_outcome !== "BOUNDED_CHECKS_CLEAR" ||
    review.authoritative !== false || review.trust_state !== CODE_GOD_TRUST_STATE ||
    review.requires_independent_evidence_receipt !== true ||
    !review.senses || !Array.isArray(review.senses.order) ||
    review.senses.order.join(",") !== CODE_GOD_SENSE_ORDER.join(",") ||
    review.senses.eyes?.status !== "SCANNED" ||
    review.senses.nose?.status !== "SIGNALS_REPORTED" ||
    review.senses.ears?.status !== "INPUTS_REVIEWED" ||
    review.senses.brain?.status !== "SYNTHESIZED" ||
    review.senses.mouth?.status !== "SPOKEN" ||
    review.senses.brain?.learning_history_status !== "CURRENT"
  ) {
    throw new Error("Bounded Code God senses must be complete, clear and explicitly advisory before Writer preparation.");
  }
  const currentLearning = canonicalLearningHistory(context);
  const currentLearningHash = await hashCanonicalJson(currentLearning.entries);
  if (
    currentLearning.invalid_ids.length ||
    review.senses.brain.learning_history_hash !== currentLearningHash ||
    review.evidence?.learning_history_hash !== currentLearningHash
  ) {
    throw new Error("The canonical CL-HIST regression history changed or is incomplete. Run Code God again.");
  }
  const repo = safeRepo(handoff.repo);
  const path = safePath(handoff.path);
  const branch = safeBranch(handoff.request_branch);
  const authority = verifiedAuthority(context, repo);
  const branchProof = verifiedBranch(context, repo, branch);
  const queue = queueSnapshot(context, { repo, path, branch });
  if (queue.active_matching_requests !== 0) throw new Error("A matching GitHub write request is already queued or processing.");
  const blob = blobSnapshot(context, { repo, path, branch, head_sha: branchProof.head_sha });
  const currentHandoffHash = await hashCanonicalJson(handoff);
  const content = String(handoff.proposed || "");
  const contentHash = await hashUtf8Text(content);

  if (review.handoff_hash_version !== HANDOFF_HASH_VERSION || review.handoff_hash !== currentHandoffHash) {
    throw new Error("The reviewed handoff changed. Run Code God again.");
  }
  if (review.source_file_id !== String(file.id || "") || review.proposed_hash !== contentHash) {
    throw new Error("Code God proof does not match the selected file and candidate.");
  }
  if (
    review.github_base_sha !== branchProof.base_sha || review.github_head_sha !== branchProof.head_sha ||
    handoff.github_base_sha !== branchProof.base_sha || handoff.github_head_sha !== branchProof.head_sha
  ) {
    throw new Error("The reviewed branch head changed. Refresh the handoff and Code God review.");
  }
  if (authority.source_commit_sha !== branchProof.base_sha) {
    throw new Error("The Writer base SHA does not match current repository authority evidence.");
  }
  if (!completeFile(path, content)) throw new Error("Queued content must be one complete file under 180000 characters.");
  const independent = independentEvidenceIds(args);

  const fields = args.fields && typeof args.fields === "object" ? args.fields : {};
  const request = {
    repo,
    path,
    branch,
    action: handoff.action === "add" ? "create_file" : "create_or_update_file",
    content,
    commit_message: String(fields.commit_message || `Code Labs update ${path}`).slice(0, 240),
    pr_title: String(fields.pr_title || `Code Labs update: ${path}`).slice(0, 240),
    pr_body: String(fields.pr_body || "Prepared by Code Labs V50 after bounded Code God checks and an independently verified Master Checklist checkpoint.").slice(0, 20000),
    confirm_branch_pr_only: true,
    expected_content_sha256: contentHash,
    expected_github_blob_sha: blob.blob_sha,
    expected_github_blob_absent: blob.absent,
    github_base_branch: branchProof.base_branch,
    github_base_sha: branchProof.base_sha,
    github_head_branch: branchProof.branch,
    github_head_sha: branchProof.head_sha,
    code_god_review_version: review.version,
    code_god_outcome: review.outcome,
    code_god_scope_outcome: review.scope_outcome,
    code_god_handoff_hash: review.handoff_hash,
    code_god_proposed_hash: review.proposed_hash,
    code_god_reviewed_at: review.created_at,
    code_god_source_file_id: review.source_file_id,
    independent_evidence_checkpoint_id: independent.checkpoint_id,
    independent_evidence_receipt_id: independent.receipt_id,
  };

  return {
    action: "github.writer_prepare",
    payload: {
      effects: [
        { kind: "write_request_insert", key: "write_request", request },
        receiptEffect(String(file.id), ["metadata", "write_request"]),
      ],
      response: {
        tool: "run_code_labs_action",
        action: "github.writer_prepare",
        mutation_engine: "atomic-v50",
        next_tool: "Code Labs V104 Writer",
        immutable_branch_proof: {
          base_sha: branchProof.base_sha,
          head_sha: branchProof.head_sha,
        },
        schema_binding_required_before_cutover: [
          "github_base_sha", "github_head_sha", "code_god_scope_outcome",
          "independent_evidence_checkpoint_id",
          "independent_evidence_receipt_id", "safety_note",
        ],
        independent_evidence: {
          kind: independent.kind, checkpoint_id: independent.checkpoint_id,
          receipt_id: independent.receipt_id, validation: "atomic-sql-and-protected-writer",
        },
      },
    },
    request,
  };
}
