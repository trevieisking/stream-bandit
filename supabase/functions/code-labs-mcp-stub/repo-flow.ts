import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import { cleanRepository, verifyOwnerRepository } from "./github-authority.ts";

type Row = Record<string, any>;
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);
const MAX_QUEUE_CONTENT = 180000;

function clone(value: unknown, max = 760000): Row {
  const text = JSON.stringify(value || {});
  if (text.length > max) throw new Error("Payload is too large.");
  return JSON.parse(text);
}

async function digest(value: unknown) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(value ?? null)),
  );
  return Array.from(
    new Uint8Array(bytes),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function selected(owner: string) {
  const state = await one(
    "code_labs_workspace_state?select=*&owner_id=eq." +
      encodeURIComponent(owner) + "&limit=1",
  );
  if (!state?.current_project_id || !state?.current_file_id) {
    throw new Error("Select a project and file first.");
  }
  const [project, file, job] = await Promise.all([
    one(
      "code_labs_projects?select=*&id=eq." +
        encodeURIComponent(state.current_project_id) + "&owner_id=eq." +
        encodeURIComponent(owner) + "&limit=1",
    ),
    one(
      "code_labs_files?select=*&id=eq." +
        encodeURIComponent(state.current_file_id) + "&owner_id=eq." +
        encodeURIComponent(owner) + "&limit=1",
    ),
    state.current_job_id
      ? one(
        "code_labs_jobs?select=*&id=eq." +
          encodeURIComponent(state.current_job_id) + "&owner_id=eq." +
          encodeURIComponent(owner) + "&limit=1",
      )
      : null,
  ]);
  if (!project || !file) {
    throw new Error("The selected Code Labs records were not found.");
  }
  return { state, project, file, job };
}

async function saveMetadata(owner: string, file: Row, metadata: Row) {
  const rows = await rest(
    "code_labs_files?id=eq." + encodeURIComponent(file.id) + "&owner_id=eq." +
      encodeURIComponent(owner),
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ metadata, updated_at: new Date().toISOString() }),
    },
  );
  if (!Array.isArray(rows) || !rows[0]) {
    throw new Error("The selected file could not be updated.");
  }
  return rows[0];
}

async function receipt(
  owner: string,
  action: string,
  file: Row,
  before: unknown,
  after: unknown,
  operationId = "",
) {
  if (operationId) {
    const prior = await one(
      "code_labs_action_receipts?select=*&owner_id=eq." + encodeURIComponent(owner) +
        "&operation_id=eq." + encodeURIComponent(operationId) + "&limit=1",
    );
    if (prior) return prior;
  }
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
      operation_id: operationId || null,
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
  if (
    !path || path.includes("..") || path.includes("\\") ||
    path.startsWith(".") || path.toLowerCase().includes("secrets")
  ) throw new Error("Target path is missing or unsafe.");
  if (/\.(env|pem|key|p12|pfx)$/i.test(path) || path.startsWith(".github/")) {
    throw new Error("Target path is protected.");
  }
  return path;
}

function safeBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) ||
    PROTECTED.has(branch.toLowerCase())
  ) throw new Error("Working branch is missing or protected.");
  return branch;
}

function completeFile(path: string, text: string) {
  const value = String(text || "").trim();
  if (!value || value.length < 120 || value.length > MAX_QUEUE_CONTENT) {
    return false;
  }
  const patchMarkers = ["BEGIN " + "PATCH", "Find:" + "\n", "Replace " + "with:"];
  if (patchMarkers.some((marker) => value.toLowerCase().includes(marker.toLowerCase()))) return false;
  if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(value)) return false;
  if (
    /\.html?$/i.test(path) && !/<!doctype\s+html/i.test(value) &&
    !/<html[\s>]/i.test(value)
  ) return false;
  if (/\.json$/i.test(path)) {
    try {
      JSON.parse(value);
    } catch {
      return false;
    }
  }
  return true;
}

function secretLike(text: string) {
  const value = String(text || "");
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value) ||
    /\bsk-[A-Za-z0-9_-]{20,}\b/.test(value) ||
    /\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(value) ||
    /\bBearer\s+[A-Za-z0-9._~-]{30,}\b/i.test(value) ||
    /(?:password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i.test(value);
}

const CODE_GOD_RULES: Record<string, Row> = {
  "CG-IDENTITY-001": {
    title: "Repository authority could not be verified",
    category: "identity",
    why_it_matters: "Code God must prove that the selected repository belongs to the signed-in owner before trusting a repair handoff.",
    evidence_required: "A fresh owner-repository authority check for the exact repository.",
    learned_message: "I learned to verify repository authority before trusting a repair handoff.",
  },
  "CG-IDENTITY-002": {
    title: "Repository path is missing or unsafe",
    category: "identity",
    why_it_matters: "An unsafe or ambiguous path can target the wrong file or escape the intended repository location.",
    evidence_required: "One exact repository-relative path that passes the protected-path checks.",
    learned_message: "I learned that every repair must name one exact safe repository path.",
  },
  "CG-BRANCH-001": {
    title: "Protected branch requested",
    category: "branch-safety",
    why_it_matters: "Writing to a protected branch would bypass the reviewed branch-and-draft-PR boundary.",
    evidence_required: "An existing non-protected branch confirmed for this repair.",
    learned_message: "I learned never to send a repair directly to a protected branch.",
  },
  "CG-FULLFILE-001": {
    title: "Complete file evidence is missing",
    category: "file-integrity",
    why_it_matters: "Writer replaces one complete file, so fragments or oversized content cannot prove a safe replacement.",
    evidence_required: "One complete file under the queue limit with no patch-only markers.",
    learned_message: "I learned to require the complete replacement file before approving Writer.",
  },
  "CG-TRUNCATION-001": {
    title: "Proposed file may be truncated",
    category: "file-integrity",
    why_it_matters: "A much shorter replacement can silently remove working sections even when the edited portion looks correct.",
    evidence_required: "A complete candidate preserving all required sections, with an intentional size reduction explained when applicable.",
    learned_message: "I learned to compare the whole file, not just the repaired section.",
  },
  "CG-CONFLICT-001": {
    title: "Merge conflict markers remain",
    category: "file-integrity",
    why_it_matters: "Conflict markers are unresolved alternatives, not executable final source.",
    evidence_required: "A complete file with every conflict resolved and no conflict markers remaining.",
    learned_message: "I learned that unresolved merge markers must never reach Writer.",
  },
  "CG-FENCE-001": {
    title: "Markdown wrapper found inside source",
    category: "file-integrity",
    why_it_matters: "Chat formatting fences can corrupt a file when they are accidentally saved as source.",
    evidence_required: "Raw complete file contents without conversational wrappers.",
    learned_message: "I learned to separate source code from chat formatting.",
  },
  "CG-SECRET-001": {
    title: "Secret-like value detected",
    category: "security",
    why_it_matters: "Credential-shaped values in source or review evidence can expose privileged access.",
    evidence_required: "A redacted candidate that uses server-side secret references rather than secret values.",
    learned_message: "I learned to report secret names and call sites without exposing secret values.",
  },
  "CG-TIMER-001": {
    title: "Fast repeating timer may duplicate work",
    category: "runtime-safety",
    why_it_matters: "Frequent unguarded timers can overlap actions, duplicate writes and amplify retries.",
    evidence_required: "A single-owner guard, explicit scheduling boundary or proof that overlapping execution is harmless.",
    learned_message: "I learned to distrust fast repeating work unless ownership and overlap are controlled.",
  },
  "CG-IDEMPOTENCY-001": {
    title: "Replay key is read but not persisted",
    category: "idempotency",
    why_it_matters: "A retry cannot locate the first durable side effect when the lookup identity was never written, so duplicate rows can be created.",
    evidence_required: "A broken fixture that is detected, a corrected fixture that passes, the exact identity persisted on first insert and database uniqueness evidence.",
    learned_message: "I learned that an idempotency key only works when the first durable write stores the same key used by retries.",
  },
  "CG-IDENTITY-PROPAGATION-001": {
    title: "Operation identity is lost between layers",
    category: "idempotency",
    why_it_matters: "A guarded action can create one identity and still lose replay safety when a dispatcher omits it before nested writes or receipts.",
    evidence_required: "Broken and corrected dispatcher fixtures plus source proof that every mutating nested call forwards the same operation identity.",
    learned_message: "I learned to follow one operation identity through every mutating layer until all durable side effects are complete.",
  },
  "CG-TEST-AUTHENTICITY-001": {
    title: "Source inspection is being presented as runtime proof",
    category: "evidence-integrity",
    why_it_matters: "Finding text in a file cannot prove concurrency, transactions, retries or durable database side effects actually behave correctly.",
    evidence_required: "A deliberately broken fixture that fails, a corrected fixture that passes, actual function execution and database or faithful transaction-harness evidence for runtime claims.",
    learned_message: "I learned to call source checks source checks and reserve runtime claims for executed evidence.",
  },
  "CG-DUPLICATE-001": {
    title: "Matching Writer request already exists",
    category: "queue-safety",
    why_it_matters: "Multiple active requests for the same file and branch can produce conflicting or duplicate writes.",
    evidence_required: "Proof that the existing request was reused, completed or deliberately closed before another is queued.",
    learned_message: "I learned to reuse one active Writer request instead of creating competing duplicates.",
  },
};

function ruleDefinition(ruleId: string) {
  return CODE_GOD_RULES[ruleId] || {
    title: ruleId,
    category: "general",
    why_it_matters: "This rule protects the reviewed Code Labs workflow.",
    evidence_required: "Correct the finding and rerun Code God against the complete file.",
    learned_message: "I learned a new reusable Code God rule: " + ruleId + ".",
  };
}

function finding(
  severity: string,
  rule_id: string,
  message: string,
  correction: string,
  blocks_github = true,
  details: Row = {},
) {
  const rule = ruleDefinition(rule_id);
  return {
    severity,
    rule_id,
    title: String(details.title || rule.title || rule_id),
    category: String(details.category || rule.category || "general"),
    message,
    why_it_matters: String(details.why_it_matters || rule.why_it_matters || message),
    correction,
    next_safe_action: String(details.next_safe_action || correction),
    evidence_required: String(details.evidence_required || rule.evidence_required || "Correct the finding and rerun Code God."),
    learned_message: String(details.learned_message || rule.learned_message || ("I learned " + rule_id + ": " + message)),
    blocks_github,
  };
}

export function codeGodMissingOperationIdentityDispatches(source: string) {
  const start = source.indexOf("export async function runAction");
  if (start < 0) return [];
  const runAction = source.slice(start);
  const checks = [
    { action: "setup.save", callee: "updateProject" },
    { action: "file.replace_current", callee: "updateCurrentFile" },
    { action: "repair.save", callee: "updateJob" },
    { action: "packet.build", callee: "updatePacket" },
    { action: "test.record", callee: "updateTest" },
  ];
  return checks.filter((check) => {
    const line = runAction.split("\n").find((candidate) =>
      candidate.includes('action === "' + check.action + '"') &&
      candidate.includes("return " + check.callee + "(b, {")
    );
    return Boolean(line && !line.includes("operation_id: args.operation_id"));
  }).map((check) => check.action);
}

export function codeGodTestEvidenceAuthenticityIssue(path: string, source: string) {
  if (!/\.test\.(?:ts|tsx|js|jsx)$/i.test(String(path || ""))) return false;
  const sourceInspection = source.includes("Deno.readTextFile") &&
    (source.includes("assertIncludes(") || source.includes(".includes("));
  const behaviouralClaim = /\b(runtime|database[- ]integration|concurrent|transaction|stale lease|duplicate delivery|durable side effect)\b/i.test(source);
  const honestBoundary = source.includes('"source-contract"') && source.includes('"database-integration"');
  return sourceInspection && behaviouralClaim && !honestBoundary;
}

function codeGodReviewSpeech(outcome: string, findings: Row[]) {
  const blocking = findings.filter((item) => item.blocks_github);
  if (!findings.length) {
    return {
      headline: "I checked the complete candidate and found no blocking rule matches within my current evidence scope.",
      what_i_found: [],
      what_i_learned: [],
      next_safe_action: "Keep the reviewed handoff unchanged and continue only through the protected Writer route.",
      can_continue_to_writer: outcome === "PASS",
    };
  }
  return {
    headline: blocking.length
      ? "I found " + blocking.length + " blocking lesson" + (blocking.length === 1 ? "" : "s") + " that must be corrected before Writer can continue."
      : "I found advisory lessons that should be reviewed before continuing.",
    what_i_found: findings.map((item) => ({
      rule_id: item.rule_id,
      title: item.title,
      severity: item.severity,
      message: item.message,
    })),
    what_i_learned: findings.map((item) => item.learned_message),
    next_safe_action: String((blocking[0] || findings[0])?.next_safe_action || "Review the findings and rerun Code God."),
    can_continue_to_writer: outcome === "PASS",
  };
}

function handoffMarker(value: Row) {
  return {
    version: value.version || null,
    action: value.action || null,
    repo: value.repo || null,
    source_repo: value.source_repo || null,
    source_branch: value.source_branch || null,
    request_branch: value.request_branch || null,
    path: value.path || null,
    current_hash: value.current_hash || null,
    proposed_hash: value.proposed_hash || null,
    created_at: value.created_at || null,
  };
}

export async function prepareRepoHandoff(b: Binding, args: Row) {
  const c = await selected(b.owner_id);
  const fields = clone(args.fields || {});
  const mode = normalizeAction(fields.action);
  if (mode === "read" || mode === "review") {
    throw new Error("Repo Desk handoff requires an add or change action.");
  }
  const repo = cleanRepository(fields.repo || c.project.repo);
  const sourceRepo = String(c.project.repo || repo);
  if (sourceRepo !== repo) {
    throw new Error(
      "The selected project and requested repository do not match.",
    );
  }
  const authority = await verifyOwnerRepository(b.owner_id, repo, {
    contents: "read",
  });
  const path = safePath(
    fields.path || c.file.metadata?.path || c.file.filename,
  );
  const branch = safeBranch(fields.branch);
  const proposed = String(
    fields.content ?? c.file.metadata?.fixed_output ?? "",
  );
  if (!completeFile(path, proposed)) {
    throw new Error(
      "A complete proposed file under 180000 characters is required.",
    );
  }
  const handoff = {
    version: "V104-repo-flow-2",
    action: mode,
    repo,
    source_repo: sourceRepo,
    source_branch: String(fields.source_branch || authority.default_branch),
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
  const previous = handoffMarker(clone(metadataBefore.repo_handoff || {}));
  const metadata: Row = { ...metadataBefore, repo_handoff: handoff };
  delete metadata.code_god_review;
  delete metadata.github_writer_request;
  const file = await saveMetadata(b.owner_id, c.file, metadata);
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "repo.prepare_handoff",
    handoff: handoffMarker(handoff),
    file_id: file.id,
    receipt: await receipt(
      b.owner_id,
      "repo.prepare_handoff",
      c.file,
      previous,
      handoffMarker(handoff),
      String(args.operation_id || ""),
    ),
  };
}

export async function reviewCodeGod(b: Binding, args: Row = {}) {
  const c = await selected(b.owner_id);
  const metadataBefore = clone(c.file.metadata || {});
  const handoff = clone(metadataBefore.repo_handoff || {});
  if (!handoff.path) throw new Error("Prepare the Repo Desk handoff first.");
  const proposed = String(handoff.proposed || "");
  const findings: Row[] = [];
  try {
    const authority = await verifyOwnerRepository(b.owner_id, handoff.repo, {
      contents: "read",
    });
    if (handoff.source_repo !== authority.repo) {
      throw new Error("Repository mismatch.");
    }
  } catch {
    findings.push(
      finding(
        "P1",
        "CG-IDENTITY-001",
        "The repository is not verified for the current Code Labs owner and GitHub installation.",
        "Select an owner-authorized repository and prepare the handoff again.",
      ),
    );
  }
  if (!handoff.path || String(handoff.path).includes("..")) {
    findings.push(
      finding(
        "P1",
        "CG-IDENTITY-002",
        "The target path is missing or unsafe.",
        "Save one repository-relative path.",
      ),
    );
  }
  if (PROTECTED.has(String(handoff.request_branch || "").toLowerCase())) {
    findings.push(
      finding(
        "P0",
        "CG-BRANCH-001",
        "The requested branch is protected.",
        "Use a non-protected repair branch.",
      ),
    );
  }
  if (!completeFile(String(handoff.path), proposed)) {
    findings.push(
      finding(
        "P1",
        "CG-FULLFILE-001",
        "The proposed file is incomplete or too large for the queue.",
        "Save one complete file under 180000 characters.",
      ),
    );
  }
  if (
    handoff.action === "change" && handoff.original &&
    proposed.length <
      Math.max(120, Math.floor(String(handoff.original).length * 0.65))
  ) {
    findings.push(
      finding(
        "P1",
        "CG-TRUNCATION-001",
        "The proposed file may be truncated.",
        "Restore missing sections and review again.",
      ),
    );
  }
  if (
    /^(?:\s*<<<<<<<(?:\s|$)|\s*=======\s*$|\s*>>>>>>>(?:\s|$))/m
      .test(proposed)
  ) {
    findings.push(
      finding(
        "P1",
        "CG-CONFLICT-001",
        "Conflict markers were found.",
        "Resolve all conflict markers.",
      ),
    );
  }
  const markdownFence = String.fromCharCode(96).repeat(3);
  if (proposed.toLowerCase().includes(markdownFence)) {
    findings.push(
      finding(
        "P2",
        "CG-FENCE-001",
        "Markdown fences appear inside the proposed file.",
        "Keep only complete file contents.",
      ),
    );
  }
  if (secretLike(proposed)) {
    findings.push(
      finding(
        "P0",
        "CG-SECRET-001",
        "Secret-like content appears in the proposed file.",
        "Remove the value and keep privileged values server-side only.",
      ),
    );
  }
  if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed)) {
    findings.push(
      finding(
        "P2",
        "CG-TIMER-001",
        "A frequent timer may duplicate work.",
        "Use a guarded single owner or explicit action.",
        false,
      ),
    );
  }
  const operationLookupMarker = "operation_" + "id=eq.";
  const operationWriteMarker = "operation_" + "id: operationId";
  const idempotencyBlocks = [
    {
      name: "action receipt",
      start: "async function receipt(",
      end: "\nfunction normalizeAction",
    },
    {
      name: "Writer request",
      start: "export async function prepareGithubWriter",
      end: "\nexport async function backendTablesSnapshot",
    },
  ];
  for (const check of idempotencyBlocks) {
    const start = proposed.indexOf(check.start);
    if (start < 0) continue;
    const end = proposed.indexOf(check.end, start);
    const block = proposed.slice(start, end > start ? end : proposed.length);
    if (
      block.includes(operationLookupMarker) &&
      !block.includes(operationWriteMarker)
    ) {
      findings.push(
        finding(
          "P1",
          "CG-IDEMPOTENCY-001",
          check.name + " looks up a prior row by operation ID but does not persist the same operation ID on the first insert. A retry cannot find the original side effect and may create a duplicate.",
          "Persist the exact operation ID on the first insert, enforce owner-and-operation uniqueness in the database, and replay the existing durable row.",
        ),
      );
    }
  }
  const missingIdentityDispatches = codeGodMissingOperationIdentityDispatches(proposed);
  if (missingIdentityDispatches.length) {
    findings.push(
      finding(
        "P1",
        "CG-IDENTITY-PROPAGATION-001",
        "The runAction dispatcher drops operation identity for: " + missingIdentityDispatches.join(", ") + ". Nested mutations and receipts can no longer replay the same guarded action safely.",
        "Forward operation_id: args.operation_id through every mutating dispatcher call and verify broken-versus-fixed fixtures.",
      ),
    );
  }
  if (codeGodTestEvidenceAuthenticityIssue(String(handoff.path || ""), proposed)) {
    findings.push(
      finding(
        "P1",
        "CG-TEST-AUTHENTICITY-001",
        "This test inspects source text while using language that implies runtime, concurrency, transaction or durable-side-effect proof, but it does not declare the source-contract evidence boundary.",
        "Label source inspections honestly and add executed fixtures plus database or faithful transaction-harness evidence before making runtime claims.",
      ),
    );
  }
  const duplicateRows = await rest(
    "code_labs_write_requests?select=id,status,branch,path,created_at&requested_by=eq." +
      encodeURIComponent(b.owner_id) + "&repo=eq." +
      encodeURIComponent(handoff.repo) + "&path=eq." +
      encodeURIComponent(handoff.path) + "&branch=eq." +
      encodeURIComponent(handoff.request_branch) +
      "&status=in.(queued,processing)&order=created_at.desc&limit=3",
  );
  if (Array.isArray(duplicateRows) && duplicateRows.length) {
    findings.push(
      finding(
        "P2",
        "CG-DUPLICATE-001",
        "A matching write request is already queued or processing.",
        "Reuse or close the existing request before queuing another.",
        false,
      ),
    );
  }
  const blocking = findings.some((item) => item.blocks_github);
  const outcome = blocking
    ? (findings.some((item) => item.severity === "P0") ? "BLOCK" : "FIX_FIRST")
    : "PASS";
  const explanation = codeGodReviewSpeech(outcome, findings);
  const review = {
    version: "V104-code-god-4",
    rules_version: "2026-07-27.2",
    rule_catalog_version: "2026-07-27.2",
    outcome,
    handoff_hash: await digest(handoff),
    repo: handoff.repo,
    path: handoff.path,
    request_branch: handoff.request_branch,
    proposed_hash: handoff.proposed_hash,
    findings,
    explanation,
    learned_rules: Array.from(new Set(findings.map((item) => item.rule_id))),
    evidence_scope: {
      static_source_review: true,
      owner_repository_authority: true,
      live_queue_snapshot: true,
      executable_rule_fixtures: false,
      database_integration: false,
      deployment_smoke_test: false,
      note: "PASS means no blocking rule matched within this evidence scope; it is not runtime or deployment proof.",
    },
    checks_run: [
      "owner-repository-authority",
      "identity",
      "branch",
      "full-file",
      "queue-limit",
      "truncation",
      "conflicts",
      "fences",
      "secret-values",
      "operation-identity-persistence",
      "operation-identity-propagation",
      "test-evidence-authenticity",
      "human-readable-explanation",
      "duplicate-queue",
      "timers",
    ],
    created_at: new Date().toISOString(),
  };
  const metadata: Row = { ...metadataBefore, code_god_review: review };
  delete metadata.github_writer_request;
  const file = await saveMetadata(b.owner_id, c.file, metadata);
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "code_god.review",
    review,
    file_id: file.id,
    receipt: await receipt(
      b.owner_id,
      "code_god.review",
      c.file,
      metadataBefore.code_god_review || {},
      review,
      String(args.operation_id || ""),
    ),
  };
}

export async function prepareGithubWriter(b: Binding, args: Row) {
  if (args.confirmed !== true) {
    throw new Error("confirmed must be true to prepare the GitHub request.");
  }
  const c = await selected(b.owner_id);
  const metadataBefore = clone(c.file.metadata || {});
  const handoff = clone(metadataBefore.repo_handoff || {});
  const review = clone(metadataBefore.code_god_review || {});
  if (review.outcome !== "PASS") {
    throw new Error("Code God PASS is required before GitHub Writer.");
  }
  if (
    review.handoff_hash !== await digest(handoff) ||
    review.proposed_hash !== handoff.proposed_hash
  ) throw new Error("The reviewed handoff changed. Run Code God again.");
  await verifyOwnerRepository(b.owner_id, handoff.repo, { contents: "read" });
  const content = String(handoff.proposed || "");
  if (!content || content.length > MAX_QUEUE_CONTENT) {
    throw new Error("Queued content must be under 180000 characters.");
  }
  const operationId = String(args.operation_id || "");
  const replay = operationId
    ? await one(
      "code_labs_write_requests?select=*&requested_by=eq." + encodeURIComponent(b.owner_id) +
        "&operation_id=eq." + encodeURIComponent(operationId) + "&limit=1",
    )
    : null;
  const existing = replay || await one(
    "code_labs_write_requests?select=id,status,branch,path,created_at&requested_by=eq." +
      encodeURIComponent(b.owner_id) + "&repo=eq." +
      encodeURIComponent(handoff.repo) + "&path=eq." +
      encodeURIComponent(handoff.path) + "&branch=eq." +
      encodeURIComponent(handoff.request_branch) +
      "&status=in.(queued,processing)&order=created_at.desc&limit=1",
  );
  if (existing && !replay) {
    throw new Error(
      "A matching GitHub write request is already queued or processing.",
    );
  }
  const request = {
    repo: handoff.repo,
    path: handoff.path,
    branch: handoff.request_branch,
    action: handoff.action === "add" ? "create_file" : "create_or_update_file",
    content,
    commit_message: String(
      args.fields?.commit_message || "Code Labs update " + handoff.path,
    ).slice(0, 240),
    pr_title: String(
      args.fields?.pr_title || "Code Labs update: " + handoff.path,
    ).slice(0, 240),
    pr_body: String(
      args.fields?.pr_body || "Prepared by Code Labs V104 after Code God PASS.",
    ).slice(0, 20000),
    confirm_branch_pr_only: true,
  };
  const rows = replay ? [replay] : await rest("code_labs_write_requests", {
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
      operation_id: operationId || null,
    }),
  });
  const queued = rows?.[0];
  if (!queued) throw new Error("The GitHub request could not be queued.");
  const marker = {
    request_id: queued.id,
    status: queued.status,
    repo: queued.repo,
    path: queued.path,
    branch: queued.branch,
    prepared_at: new Date().toISOString(),
  };
  const metadata: Row = { ...metadataBefore, github_writer_request: marker };
  const file = await saveMetadata(b.owner_id, c.file, metadata);
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "github.writer_prepare",
    request: { ...request, content: undefined },
    queued: marker,
    next_tool: "Code Labs V104 Writer",
    file_id: file.id,
    receipt: await receipt(
      b.owner_id,
      "github.writer_prepare",
      c.file,
      metadataBefore.github_writer_request || {},
      marker,
      operationId,
    ),
  };
}

export async function backendTablesSnapshot(b: Binding) {
  const specs = [
    [
      "code_labs_projects",
      "id,site_name,site_url,repo,mode,status,created_at,updated_at",
      "owner_id",
    ],
    [
      "code_labs_files",
      "id,project_id,filename,file_type,current_hash,created_at,updated_at",
      "owner_id",
    ],
    [
      "code_labs_jobs",
      "id,project_id,file_id,title,status,created_at,updated_at",
      "owner_id",
    ],
    [
      "code_labs_packets",
      "id,project_id,job_id,packet_type,created_at",
      "owner_id",
    ],
    [
      "code_labs_test_runs",
      "id,project_id,job_id,filename,result,checked_count,total_count,created_at",
      "owner_id",
    ],
    [
      "code_labs_versions",
      "id,project_id,job_id,file_id,version_kind,label,filename,created_at",
      "owner_id",
    ],
    [
      "code_labs_write_requests",
      "id,repo,path,branch,action,status,branch_pr_only,direct_main_write,deletes_anything,created_at,updated_at",
      "requested_by",
    ],
    [
      "code_labs_action_receipts",
      "id,action,record_type,record_id,changed_fields,created_new_row,undo_available,undone_at,created_at",
      "owner_id",
    ],
  ];
  const snapshots: Row = {};
  for (const [table, columns, ownerColumn] of specs) {
    const rows = await rest(
      table + "?select=" + encodeURIComponent(columns) + "&" + ownerColumn +
        "=eq." + encodeURIComponent(b.owner_id) +
        "&order=created_at.desc&limit=5",
    );
    snapshots[table] = Array.isArray(rows) ? rows : [];
  }
  return {
    ok: true,
    version: VERSION,
    tool: "run_code_labs_action",
    action: "backend.tables_snapshot",
    read_only: true,
    snapshots,
  };
}
