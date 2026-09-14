import {
  atomicOperationId,
  atomicRequestHash,
  canonicalJson,
} from "./atomic-workspace-engine.ts";
import { projectMasterChecklistEvidence } from "./context.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) {
    throw new Error(`${message} Expected: ${right} Actual: ${left}`);
  }
}

function assertIncludes(source: string, expected: string, message: string) {
  assert(source.includes(expected), `${message} Missing: ${expected}`);
}

function assertExcludes(source: string, forbidden: string, message: string) {
  assert(!source.includes(forbidden), `${message} Forbidden: ${forbidden}`);
}

async function source(relative: string) {
  return await Deno.readTextFile(new URL(relative, import.meta.url));
}

const owner = "af380be8-d1e2-4154-a5ed-a113c8271afd";

Deno.test("atomic client: canonical JSON ignores object key order", () => {
  const left = canonicalJson({
    expected_state_version: 769,
    payload: {
      effects: [
        {
          key: "record",
          kind: "record_update",
          patch: { metadata: { candidate_hash: "abc", fixed_output: "complete" } },
        },
      ],
      response: { tool: "save_code_labs_candidate", ok: true },
    },
  });
  const right = canonicalJson({
    payload: {
      response: { ok: true, tool: "save_code_labs_candidate" },
      effects: [
        {
          patch: { metadata: { fixed_output: "complete", candidate_hash: "abc" } },
          kind: "record_update",
          key: "record",
        },
      ],
    },
    expected_state_version: 769,
  });

  assertEqual(left, right, "Equivalent action payloads must have identical canonical JSON.");
});

Deno.test("atomic client: equivalent deliveries share one request hash and operation ID", async () => {
  const left = {
    action: "candidate.save",
    expected_state_version: 769,
    payload: {
      effects: [
        {
          kind: "record_update",
          key: "record",
          record_type: "file",
          record_id: "926db062-c2c6-49b7-bf33-c212524d7755",
          expected_updated_at: "2026-07-28T10:00:00.000Z",
          patch: { metadata: { fixed_output: "complete candidate" } },
        },
      ],
      response: { tool: "save_code_labs_candidate" },
    },
  };
  const right = {
    action: "candidate.save",
    expected_state_version: 769,
    payload: {
      response: { tool: "save_code_labs_candidate" },
      effects: [
        {
          patch: { metadata: { fixed_output: "complete candidate" } },
          expected_updated_at: "2026-07-28T10:00:00.000Z",
          record_id: "926db062-c2c6-49b7-bf33-c212524d7755",
          record_type: "file",
          key: "record",
          kind: "record_update",
        },
      ],
    },
  };

  assertEqual(
    await atomicRequestHash(left),
    await atomicRequestHash(right),
    "Equivalent deliveries must share one deterministic request hash.",
  );
  assertEqual(
    await atomicOperationId(owner, left),
    await atomicOperationId(owner, right),
    "Equivalent deliveries must share one deterministic operation ID.",
  );
});

Deno.test("atomic client: material work changes operation identity", async () => {
  const base = {
    action: "candidate.save",
    expected_state_version: 769,
    payload: {
      effects: [
        {
          kind: "record_update",
          key: "record",
          record_type: "file",
          record_id: "926db062-c2c6-49b7-bf33-c212524d7755",
          expected_updated_at: "2026-07-28T10:00:00.000Z",
          patch: { metadata: { fixed_output: "candidate A" } },
        },
      ],
      response: { tool: "save_code_labs_candidate" },
    },
  };
  const changedCandidate = {
    ...base,
    payload: {
      ...base.payload,
      effects: [
        {
          ...base.payload.effects[0],
          patch: { metadata: { fixed_output: "candidate B" } },
        },
      ],
    },
  };
  const changedState = { ...base, expected_state_version: 770 };
  const changedAction = { ...base, action: "code_god.review" };

  const identity = await atomicOperationId(owner, base);
  assert(identity !== await atomicOperationId(owner, changedCandidate), "Candidate content must affect identity.");
  assert(identity !== await atomicOperationId(owner, changedState), "Expected state must affect identity.");
  assert(identity !== await atomicOperationId(owner, changedAction), "Action name must affect identity.");
});

Deno.test("atomic client: recovery fencing token does not create a second logical operation", async () => {
  const base = {
    action: "checkpoint.create",
    expected_state_version: 769,
    payload: {
      effects: [
        { kind: "checkpoint_insert", key: "checkpoint", label: "Recovery proof" },
        { kind: "receipt_insert", key: "receipt", changed_fields: ["checkpoint"] },
      ],
      response: { tool: "create_code_labs_checkpoint" },
    },
  };

  assertEqual(
    await atomicOperationId(owner, base),
    await atomicOperationId(owner, { ...base, fencing_token: 44 }),
    "A recovery fencing token must resume the same logical operation, not create another operation.",
  );
});

Deno.test("cutover contract: guarded workspace has one exclusive atomic mutation path", async () => {
  const guarded = await source("./guarded-workspace.ts");

  assertIncludes(
    guarded,
    'import { executeAtomicWorkspaceAction',
    "The runtime dispatcher must import the atomic engine explicitly.",
  );
  assertIncludes(
    guarded,
    "const TRANSACTIONAL_ACTIONS",
    "The runtime dispatcher must expose one explicit transactional action registry.",
  );
  assertIncludes(
    guarded,
    "return executeAtomicWorkspaceAction",
    "Every registered database mutation must enter the one atomic RPC client.",
  );
  assertExcludes(
    guarded,
    "code_labs_reserve_workspace_state_version",
    "The old pre-increment RPC must not remain beside the new engine.",
  );
  assertExcludes(
    guarded,
    "async function reserveStateVersion",
    "The old reservation helper must be removed in the same cutover.",
  );
  assertExcludes(
    guarded,
    "return guarded(",
    "The old callback-based multi-REST write wrapper must not remain as a second mutation lane.",
  );
});

Deno.test("cutover contract: main has no separate File Lab mutation engine", async () => {
  const main = await source("./main.ts");

  assertExcludes(
    main,
    "INTAKE_RESERVATION_PREFIX",
    "File Lab must not keep its own state-reservation system beside the atomic engine.",
  );
  assertExcludes(
    main,
    "releaseIntakeReservation",
    "File Lab compensation writes must disappear after transactional cutover.",
  );
  assertExcludes(
    main,
    "async function intakeFile",
    "File Lab mutation must be routed through the shared action engine.",
  );
  assertIncludes(
    main,
    'if (name === "run_code_labs_action") return runAction(b, args);',
    "The public action tool must have one backend dispatcher rather than an intake special case.",
  );
});

Deno.test("cutover contract: helper pages cannot choose an engine", async () => {
  const guarded = await source("./guarded-workspace.ts");
  const main = await source("./main.ts");
  const combined = `${guarded}\n${main}`;

  for (const forbidden of [
    "atomic_engine_enabled",
    "legacy_engine_enabled",
    "shadow_write",
    "dual_write",
    "use_atomic_engine ?",
    "use_legacy_engine ?",
  ]) {
    assertExcludes(
      combined,
      forbidden,
      "Runtime helpers must not select between old and new mutation engines.",
    );
  }
});

Deno.test("evidence boundary: client tests do not claim database or deployment proof", () => {
  const evidence = {
    pure_identity: true,
    source_cutover_contract: true,
    database_integration: false,
    writer_integration: false,
    deployment_smoke_test: false,
  };

  assert(evidence.pure_identity, "The deterministic client identity tests are executable pure evidence.");
  assert(evidence.source_cutover_contract, "The cutover checks are source-contract evidence.");
  assert(!evidence.database_integration, "These tests must not claim database transaction proof.");
  assert(!evidence.writer_integration, "These tests must not claim Writer runtime proof.");
  assert(!evidence.deployment_smoke_test, "These tests must not claim deployment proof.");
});

function projectionFixture() {
  const planId = "11111111-1111-4111-8111-111111111111";
  const fileId = "22222222-2222-4222-8222-222222222222";
  const checkpointId = "33333333-3333-4333-8333-333333333333";
  const receiptId = "44444444-4444-4444-8444-444444444444";
  const sourceHash = "a".repeat(64);
  const candidateHash = "b".repeat(64);
  const planHash = "c".repeat(64);
  const head = "d".repeat(40);
  const operationId = "55555555-5555-4555-8555-555555555555";
  const fencing = 17;
  return {
    workspace: { state_version: 81, workflow_step: "checklist-builder" },
    project: {
      id: "project-1",
      repo: "trevieisking/stream-bandit",
      metadata: {},
    },
    plan: {
      id: planId,
      filename: "code-labs/CODE-LABS-V1-PLAN.md",
      current_hash: planHash,
      metadata: {
        plan_revision: "rev-81",
        exact_checklist: {
          checklist_id: "checklist-owner-81",
          checklist_version: 4,
        },
      },
    },
    file: {
      id: fileId,
      current_hash: sourceHash,
      metadata: {
        candidate_hash: candidateHash,
        repo_handoff: {
          repo: "trevieisking/stream-bandit",
          github_head_sha: head,
        },
        code_god_review: {
          version: "V50-code-god-2-bounded-advisory",
          scope_outcome: "BOUNDED_CHECKS_CLEAR",
          trust_state: "HOLD_UNTRUSTED_ADVISORY",
          authoritative: false,
          github_head_sha: head,
        },
        master_checklist_evidence: {
          github: {
            repository: "trevieisking/stream-bandit",
            pull_request: 554,
            reviewed_head_sha: head,
            workflow_run_count: 3,
            combined_status_count: 2,
            workflow_runs_passed: true,
            combined_statuses_passed: true,
            refresh: { performed: true, reviewed_head_sha: head },
          },
          workflow_checks: {
            beginning_to_end_workflow_tested: { passed: true, evidence: "workflow receipt set" },
            one_owner_per_responsibility_confirmed: { passed: true, evidence: "owner register" },
            working_legacy_capability_preserved: { passed: true, evidence: "regression suite" },
          },
          user_checks: {
            desktop_visual_test_passed: { passed: true, evidence: "user desktop check" },
            mobile_visual_test_passed: { passed: true, evidence: "user mobile check" },
            no_secret_value_exposed: { passed: true, evidence: "user secret check" },
            user_approved_exact_visible_result: { passed: true, evidence: "user acceptance" },
          },
        },
      },
    },
    test: { id: "test-1", result: "PASS" },
    versions: [{
      id: checkpointId,
      file_id: fileId,
      version_kind: "checkpoint",
      operation_id: operationId,
      fencing_token: fencing,
    }],
    receipts: [{
      id: receiptId,
      action: "checkpoint.create",
      record_type: "version",
      record_id: checkpointId,
      operation_id: operationId,
      fencing_token: fencing,
    }],
  };
}

Deno.test("Master Checklist projector: complete exact evidence can reach PASS without granting authority", () => {
  const projection = projectMasterChecklistEvidence(projectionFixture());
  assertEqual(projection.checklist_scope_state, "PASS", "A fully proven projection should be PASS.");
  assertEqual(projection.writer_authority, false, "Projection must never grant Writer authority.");
  assertEqual(projection.promotion_authority, false, "Projection must never grant promotion authority.");
  assertEqual(projection.unresolved_count, 0, "A complete projection should have no unresolved checklist items.");
  assertEqual(projection.exact_checklist.reviewed_pull_request, "554", "PR binding must be normalized into the exact checklist.");
});

Deno.test("Master Checklist projector: missing evidence fails closed and manual checks remain USER_CHECK", () => {
  const projection = projectMasterChecklistEvidence({});
  assertEqual(projection.checklist_scope_state, "HOLD", "Missing evidence must not become PASS.");
  const desktop = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "Desktop visual test passed");
  const workflows = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "workflow-runs");
  assertEqual(desktop?.state, "USER_CHECK", "Desktop verification must remain an explicit user check.");
  assertEqual(workflows?.state, "NOT_RUN", "Missing workflow runs must report NOT_RUN.");
});

Deno.test("Master Checklist projector: stale GitHub refresh head blocks the projection", () => {
  const fixture = projectionFixture();
  fixture.file.metadata.master_checklist_evidence.github.refresh.reviewed_head_sha = "e".repeat(40);
  const projection = projectMasterChecklistEvidence(fixture);
  assertEqual(projection.checklist_scope_state, "BLOCK", "A refresh bound to another head must block.");
  assert(projection.blockers.includes("github-refresh"), "The blocker list must identify the stale GitHub refresh.");
});

Deno.test("Master Checklist projector: zero workflow runs and statuses are never converted to PASS", () => {
  const fixture = projectionFixture();
  fixture.file.metadata.master_checklist_evidence.github.workflow_run_count = 0;
  fixture.file.metadata.master_checklist_evidence.github.combined_status_count = 0;
  const projection = projectMasterChecklistEvidence(fixture);
  const workflows = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "workflow-runs");
  const statuses = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "combined-statuses");
  assertEqual(workflows?.state, "NOT_RUN", "Zero workflow runs must remain NOT_RUN.");
  assertEqual(statuses?.state, "NOT_RUN", "Zero combined statuses must remain NOT_RUN.");
  assertEqual(projection.checklist_scope_state, "HOLD", "Missing GitHub gates must hold the checklist.");
});

Deno.test("Master Checklist projector: PASS-like checks without evidence stay HOLD", () => {
  const fixture = projectionFixture();
  fixture.file.metadata.master_checklist_evidence.user_checks.desktop_visual_test_passed = { passed: true, evidence: "" };
  const projection = projectMasterChecklistEvidence(fixture);
  const desktop = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "Desktop visual test passed");
  assertEqual(desktop?.state, "HOLD", "A PASS-like manual value without bound evidence must not pass.");
});

Deno.test("Master Checklist projector: rollback PASS requires matching checkpoint and creation receipt identity", () => {
  const fixture = projectionFixture();
  fixture.receipts[0].operation_id = "66666666-6666-4666-8666-666666666666";
  const projection = projectMasterChecklistEvidence(fixture);
  const rollback = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "Rollback route confirmed");
  const checkpoint = projection.exact_checklist.items.find((entry: Record<string, unknown>) => entry.id === "checkpoint-receipt");
  assertEqual(rollback?.state, "NOT_RUN", "A mismatched checkpoint receipt must not prove rollback.");
  assertEqual(checkpoint?.state, "NOT_RUN", "A mismatched receipt must fail the checkpoint evidence item.");
});
