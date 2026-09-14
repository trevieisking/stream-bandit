import { Binding, rest, Row } from "./oauth.ts";
import { verifyOwnerRepository } from "./github-authority.ts";
export const VERSION = "Code Labs V104 tool-only workspace control V45 immutable proof";
export const MASTER_CHECKLIST_PROJECTION_VERSION = "V1-master-checklist-evidence-projection";

const SHA40 = /^[a-f0-9]{40}$/i;
const HASH64 = /^[a-f0-9]{64}$/i;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const CHECKLIST_STATES = new Set(["PASS", "HOLD", "BLOCK", "NOT_RUN", "USER_CHECK"]);

function row(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Row
    : {};
}

function list(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as Row[]
    : [];
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function positiveInt(value: unknown) {
  const number = Number(value || 0);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function nonNegativeInt(value: unknown) {
  const number = Number(value || 0);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const output = text(value);
    if (output) return output;
  }
  return "";
}

function firstPositiveInt(...values: unknown[]) {
  for (const value of values) {
    const output = positiveInt(value);
    if (output) return output;
  }
  return 0;
}

function firstNonNegativeInt(...values: unknown[]) {
  for (const value of values) {
    if (value === 0 || text(value)) return nonNegativeInt(value);
  }
  return 0;
}

function state(value: unknown, fallback: string) {
  const normalized = text(value).toUpperCase().replace(/[ -]+/g, "_");
  return CHECKLIST_STATES.has(normalized) ? normalized : fallback;
}

function item(id: string, itemState: string, requirement: string, evidence: string) {
  return {
    id,
    state: state(itemState, "HOLD"),
    requirement,
    evidence: evidence || "No exact evidence is recorded yet.",
  };
}

function recordedGate(value: unknown, label: string, manual = false) {
  if (value === true) {
    return item(label, "PASS", label, "Explicit PASS was recorded by the owner-scoped workflow evidence.");
  }
  if (value === false || value == null) {
    return item(
      label,
      manual ? "USER_CHECK" : "NOT_RUN",
      label,
      manual ? "This visible/user check still requires an explicit user result." : "No completed evidence was recorded for this workflow check.",
    );
  }
  const source = row(value);
  const evidence = firstText(source.evidence, source.reason, source.source, source.receipt_id, source.checkpoint_id);
  if (source.failed === true || state(source.state, "") === "BLOCK") {
    return item(label, "BLOCK", label, evidence || "The recorded check failed.");
  }
  if (source.passed === true || state(source.state, "") === "PASS") {
    if (!evidence) {
      return item(label, "HOLD", label, "A PASS-like value exists, but no evidence source is bound to it.");
    }
    return item(label, "PASS", label, evidence);
  }
  const explicitState = state(source.state, manual ? "USER_CHECK" : "NOT_RUN");
  return item(label, explicitState, label, evidence || "The recorded check is not complete.");
}

function mergedChecklistEvidence(project: Row, plan: Row, file: Row) {
  return {
    ...row(row(project.metadata).master_checklist_evidence),
    ...row(row(plan.metadata).master_checklist_evidence),
    ...row(row(file.metadata).master_checklist_evidence),
  };
}

function exactCheckpoint(file: Row, versions: Row[], receipts: Row[]) {
  const fileId = text(file.id);
  if (!fileId) return null;
  for (const checkpoint of versions) {
    if (
      text(checkpoint.file_id) !== fileId ||
      text(checkpoint.version_kind) !== "checkpoint" ||
      !text(checkpoint.id)
    ) continue;
    const receipt = receipts.find((candidate) =>
      text(candidate.action) === "checkpoint.create" &&
      text(candidate.record_type) === "version" &&
      text(candidate.record_id) === text(checkpoint.id) &&
      text(candidate.operation_id) === text(checkpoint.operation_id) &&
      text(candidate.fencing_token) === text(checkpoint.fencing_token)
    );
    if (receipt) return { checkpoint, receipt };
  }
  return null;
}

function scopeState(items: Row[]) {
  if (items.some((entry) => entry.state === "BLOCK")) return "BLOCK";
  if (items.length && items.every((entry) => entry.state === "PASS")) return "PASS";
  return "HOLD";
}

export function projectMasterChecklistEvidence(value: unknown) {
  const input = row(value);
  const workspace = row(input.workspace);
  const project = row(input.project);
  const file = row(input.file);
  const plan = row(input.plan);
  const test = row(input.test);
  const receipts = list(input.receipts);
  const versions = list(input.versions);
  const projectMetadata = row(project.metadata);
  const fileMetadata = row(file.metadata);
  const planMetadata = row(plan.metadata);
  const handoff = row(fileMetadata.repo_handoff);
  const codeGod = row(fileMetadata.code_god_review);
  const existingChecklist = row(planMetadata.exact_checklist);
  const evidence = mergedChecklistEvidence(project, plan, file);
  const workflowChecks = row(evidence.workflow_checks);
  const userChecks = row(evidence.user_checks);
  const github = row(evidence.github);

  const planId = text(plan.id);
  const planHash = text(plan.current_hash).toLowerCase();
  const planRevision = firstText(
    evidence.plan_revision,
    existingChecklist.plan_revision,
    planMetadata.plan_revision,
    projectMetadata.plan_revision,
  );
  const checklistId = firstText(existingChecklist.checklist_id, evidence.checklist_id);
  const checklistVersion = firstPositiveInt(existingChecklist.checklist_version, evidence.checklist_version);
  const repository = firstText(
    github.repository,
    evidence.repository,
    existingChecklist.reviewed_repository,
    handoff.repo,
    project.repo,
  );
  const pullRequest = firstPositiveInt(
    github.pull_request,
    github.pull_request_number,
    evidence.pull_request,
    evidence.pull_request_number,
    existingChecklist.reviewed_pull_request,
  );
  const reviewedHead = firstText(
    github.reviewed_head_sha,
    github.head_sha,
    evidence.reviewed_head_sha,
    existingChecklist.reviewed_head_sha,
    codeGod.github_head_sha,
    handoff.github_head_sha,
  ).toLowerCase();
  const workflowRunCount = firstNonNegativeInt(
    github.workflow_run_count,
    evidence.workflow_run_count,
    existingChecklist.workflow_run_count,
  );
  const combinedStatusCount = firstNonNegativeInt(
    github.combined_status_count,
    evidence.combined_status_count,
    existingChecklist.combined_status_count,
  );
  const sourceHash = text(file.current_hash).toLowerCase();
  const candidateHash = firstText(fileMetadata.candidate_hash, fileMetadata.proposed_hash).toLowerCase();

  const coreItems: Row[] = [];
  const planReady = UUID.test(planId) && HASH64.test(planHash) && Boolean(planRevision);
  coreItems.push(item(
    "plan-binding",
    planReady ? "PASS" : "HOLD",
    "Exact Master Plan record, revision and canonical hash are bound",
    planReady
      ? `Plan ${planId}; revision ${planRevision}; SHA-256 ${planHash}.`
      : "The owner-scoped Master Plan record, revision or canonical SHA-256 is incomplete.",
  ));

  const repositoryReady = REPOSITORY.test(repository);
  const githubIdentityReady = repositoryReady && pullRequest > 0 && SHA40.test(reviewedHead);
  coreItems.push(item(
    "github-binding",
    githubIdentityReady ? "PASS" : "HOLD",
    "Repository, pull request and reviewed head SHA are exact",
    githubIdentityReady
      ? `${repository} PR #${pullRequest} at ${reviewedHead}.`
      : "Repository/PR/head evidence is not yet complete enough for an exact GitHub binding.",
  ));

  const hashesReady = HASH64.test(sourceHash) && HASH64.test(candidateHash);
  coreItems.push(item(
    "source-candidate-binding",
    hashesReady ? "PASS" : "HOLD",
    "Selected source and candidate hashes are exact",
    hashesReady
      ? `Source ${sourceHash}; candidate ${candidateHash}.`
      : "The selected source SHA-256 or candidate SHA-256 is missing.",
  ));

  const refresh = row(github.refresh);
  const refreshHead = firstText(refresh.reviewed_head_sha, refresh.head_sha).toLowerCase();
  let refreshState = "NOT_RUN";
  let refreshEvidence = "Exact GitHub workflows/statuses have not been explicitly refreshed for this projection.";
  if (refresh.performed === true) {
    if (!SHA40.test(reviewedHead) || !SHA40.test(refreshHead) || refreshHead !== reviewedHead) {
      refreshState = "BLOCK";
      refreshEvidence = "GitHub refresh evidence is bound to a different or invalid head SHA.";
    } else {
      refreshState = "PASS";
      refreshEvidence = `GitHub mutable facts were refreshed for exact head ${reviewedHead}.`;
    }
  }
  coreItems.push(item(
    "github-refresh",
    refreshState,
    "Mutable GitHub facts were refreshed for the exact reviewed head",
    refreshEvidence,
  ));

  let workflowState = "NOT_RUN";
  let workflowEvidence = "No exact-head workflow run evidence is recorded.";
  if (refreshState === "BLOCK") {
    workflowState = "BLOCK";
    workflowEvidence = refreshEvidence;
  } else if (refreshState === "PASS") {
    if (workflowRunCount === 0) {
      workflowState = "NOT_RUN";
      workflowEvidence = "GitHub refresh found zero workflow runs; absence is not PASS.";
    } else if (github.workflow_runs_failed === true) {
      workflowState = "BLOCK";
      workflowEvidence = `${workflowRunCount} workflow run(s) were found and at least one required run failed.`;
    } else if (github.workflow_runs_passed === true) {
      workflowState = "PASS";
      workflowEvidence = `${workflowRunCount} exact-head workflow run(s) were explicitly recorded as passing.`;
    } else {
      workflowState = "HOLD";
      workflowEvidence = `${workflowRunCount} workflow run(s) were found, but their required conclusions are not proven.`;
    }
  }
  coreItems.push(item(
    "workflow-runs",
    workflowState,
    "Required workflow runs are proven for the exact reviewed head",
    workflowEvidence,
  ));

  let statusState = "NOT_RUN";
  let statusEvidence = "No exact-head combined-status evidence is recorded.";
  if (refreshState === "BLOCK") {
    statusState = "BLOCK";
    statusEvidence = refreshEvidence;
  } else if (refreshState === "PASS") {
    if (combinedStatusCount === 0) {
      statusState = "NOT_RUN";
      statusEvidence = "GitHub refresh found zero combined statuses; none found is not PASS.";
    } else if (github.combined_statuses_failed === true) {
      statusState = "BLOCK";
      statusEvidence = `${combinedStatusCount} status record(s) were found and at least one required status failed.`;
    } else if (github.combined_statuses_passed === true) {
      statusState = "PASS";
      statusEvidence = `${combinedStatusCount} exact-head status record(s) were explicitly recorded as passing.`;
    } else {
      statusState = "HOLD";
      statusEvidence = `${combinedStatusCount} status record(s) were found, but their required states are not proven.`;
    }
  }
  coreItems.push(item(
    "combined-statuses",
    statusState,
    "Combined commit statuses are proven for the exact reviewed head",
    statusEvidence,
  ));

  const reviewPresent = Boolean(text(codeGod.version));
  const codeGodPass = reviewPresent &&
    text(codeGod.scope_outcome) === "BOUNDED_CHECKS_CLEAR" &&
    text(codeGod.trust_state) === "HOLD_UNTRUSTED_ADVISORY" &&
    codeGod.authoritative === false;
  coreItems.push(item(
    "bounded-code-god",
    !reviewPresent ? "NOT_RUN" : codeGodPass ? "PASS" : "BLOCK",
    "Bounded Code God evidence is current and explicitly advisory",
    !reviewPresent
      ? "No bounded Code God review is attached to the selected file."
      : codeGodPass
      ? `Bounded review ${text(codeGod.version)} is clear and remains non-authoritative.`
      : "The attached Code God review is stale, contradictory, blocking or not explicitly advisory.",
  ));

  const checkpoint = exactCheckpoint(file, versions, receipts);
  coreItems.push(item(
    "checkpoint-receipt",
    checkpoint ? "PASS" : "NOT_RUN",
    "Rollback checkpoint has its exact immutable creation receipt",
    checkpoint
      ? `Checkpoint ${text(checkpoint.checkpoint.id)} is bound to receipt ${text(checkpoint.receipt.id)}.`
      : "No matching current-file checkpoint and immutable checkpoint.create receipt were found.",
  ));

  const workflowItems = [
    recordedGate(
      workflowChecks.beginning_to_end_workflow_tested,
      "Beginning-to-end workflow tested",
    ),
    recordedGate(
      workflowChecks.one_owner_per_responsibility_confirmed,
      "One owner per responsibility confirmed",
    ),
    recordedGate(
      workflowChecks.working_legacy_capability_preserved,
      "Working legacy capability preserved",
    ),
    checkpoint
      ? item(
        "Rollback route confirmed",
        "PASS",
        "Rollback route confirmed",
        `Exact checkpoint ${text(checkpoint.checkpoint.id)} and receipt ${text(checkpoint.receipt.id)} prove a rollback snapshot exists.`,
      )
      : recordedGate(workflowChecks.rollback_route_confirmed, "Rollback route confirmed"),
  ];

  const userItems = [
    recordedGate(userChecks.desktop_visual_test_passed, "Desktop visual test passed", true),
    recordedGate(userChecks.mobile_visual_test_passed, "Mobile visual test passed", true),
    recordedGate(userChecks.no_secret_value_exposed, "No secret value exposed", true),
    recordedGate(userChecks.user_approved_exact_visible_result, "User approved exact visible result", true),
  ];

  const items = [...coreItems, ...workflowItems, ...userItems];
  const overall = scopeState(items);
  const checklist = {
    checklist_id: checklistId,
    checklist_version: checklistVersion,
    plan_record_id: planId,
    plan_revision: planRevision,
    source_hash: planHash,
    reviewed_repository: repository,
    reviewed_pull_request: pullRequest ? String(pullRequest) : "",
    reviewed_head_sha: reviewedHead,
    workflow_run_count: workflowRunCount,
    combined_status_count: combinedStatusCount,
    source_file_id: text(file.id),
    source_file_hash: sourceHash,
    candidate_hash: candidateHash,
    checklist_scope_state: overall,
    items,
  };

  return {
    version: MASTER_CHECKLIST_PROJECTION_VERSION,
    authority: "read-only-evidence-projection",
    promotion_authority: false,
    writer_authority: false,
    workspace_state_version: nonNegativeInt(workspace.state_version),
    workflow_step: text(workspace.workflow_step),
    exact_checklist: checklist,
    checklist_scope_state: overall,
    pass_count: items.filter((entry) => entry.state === "PASS").length,
    unresolved_count: items.filter((entry) => entry.state !== "PASS").length,
    blockers: items.filter((entry) => entry.state === "BLOCK").map((entry) => entry.id),
    unresolved: items.filter((entry) => entry.state !== "PASS").map((entry) => entry.id),
    evidence_sources: [
      planId ? "selected Master Plan record" : "Master Plan record missing",
      text(file.id) ? "selected source file" : "selected source file missing",
      receipts.length ? "action receipts" : "action receipts none found",
      versions.length ? "version checkpoints" : "version checkpoints none found",
      text(test.id) ? "selected test record" : "selected test record missing",
      "mutable GitHub facts require an explicit exact-head refresh",
      "manual visible checks require explicit user evidence",
    ],
  };
}

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

async function selectedRow(
  ownerId: string,
  tableName: string,
  recordId: string,
  select = "*",
) {
  if (!recordId) return null;
  return await one(
    tableName + "?select=" + encodeURIComponent(select) +
      "&id=eq." + encodeURIComponent(recordId) +
      "&owner_id=eq." + encodeURIComponent(ownerId) + "&limit=1",
  );
}

export async function getContext(b: Binding, limit = 5) {
  const cap = Math.max(1, Math.min(Number(limit || 5), 25));
  const state = await one(
    "code_labs_workspace_state?select=current_project_id,current_file_id,current_job_id,current_packet_id,current_test_run_id,state_version,workflow_step" +
      "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1",
  );
  const currentProjectId = String(state?.current_project_id || "");
  const currentFileId = String(state?.current_file_id || "");
  const currentJobId = String(state?.current_job_id || "");
  const currentPacketId = String(state?.current_packet_id || "");
  const selectedTestId = String(state?.current_test_run_id || "");
  const currentProjectFilter = currentProjectId
    ? "&project_id=eq." + encodeURIComponent(currentProjectId)
    : "&id=is.null";

  const [
    projects,
    jobs,
    packets,
    tests,
    testHistory,
    audit,
    receipts,
    currentProject,
    currentFile,
    currentJob,
    currentPacket,
    selectedTest,
    masterPlan,
    versions,
  ] = await Promise.all([
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
    table(
      b,
      "code_labs_action_receipts",
      "id,action,record_type,record_id,operation_id,fencing_token,changed_fields,created_new_row,undo_available,created_at",
      Math.min(50, Math.max(12, cap * 4)),
    ),
    selectedRow(b.owner_id, "code_labs_projects", currentProjectId),
    selectedRow(b.owner_id, "code_labs_files", currentFileId),
    selectedRow(b.owner_id, "code_labs_jobs", currentJobId),
    selectedRow(b.owner_id, "code_labs_packets", currentPacketId),
    selectedRow(
      b.owner_id,
      "code_labs_test_runs",
      selectedTestId,
      "id,project_id,job_id,filename,result,checked_count,total_count,notes,details,created_at",
    ),
    currentProjectId
      ? one(
        "code_labs_files?select=id,project_id,filename,current_hash,metadata,updated_at" +
          "&owner_id=eq." + encodeURIComponent(b.owner_id) +
          "&project_id=eq." + encodeURIComponent(currentProjectId) +
          "&filename=eq." + encodeURIComponent("code-labs/CODE-LABS-V1-PLAN.md") +
          "&order=updated_at.desc&limit=1",
      )
      : Promise.resolve(null),
    currentFileId
      ? table(
        b,
        "code_labs_versions",
        "id,file_id,version_kind,label,filename,operation_id,fencing_token,created_at",
        Math.min(25, Math.max(5, cap)),
        "&file_id=eq." + encodeURIComponent(currentFileId),
      )
      : Promise.resolve([]),
  ]);

  const projection = projectMasterChecklistEvidence({
    workspace: state,
    project: currentProject,
    file: currentFile,
    job: currentJob,
    packet: currentPacket,
    test: selectedTest,
    plan: masterPlan,
    receipts,
    versions,
    audit,
  });

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
    master_checklist_projection: projection,
    reads: {
      workspace: state,
      current_project: currentProject,
      current_file: currentFile,
      current_job: currentJob,
      current_packet: currentPacket,
      selected_test: selectedTest,
      master_plan: masterPlan,
      action_receipts: receipts,
      versions,
      projects,
      jobs,
      packets,
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