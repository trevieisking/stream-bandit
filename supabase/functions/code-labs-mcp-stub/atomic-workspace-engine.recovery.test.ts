function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
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

Deno.test("recovery contract: guarded workspace no longer pre-increments state", async () => {
  const guarded = await source("./guarded-workspace.ts");

  assertExcludes(
    guarded,
    "code_labs_reserve_workspace_state_version",
    "The old state-reservation RPC must be removed from the guarded action path.",
  );
  assertExcludes(
    guarded,
    "async function reserveStateVersion",
    "The old pre-increment helper must be removed.",
  );
  assertIncludes(
    guarded,
    "rpc/code_labs_execute_workspace_action",
    "Database-only actions must enter one transactional RPC.",
  );
});

Deno.test("recovery contract: every mutating internal route uses one transaction dispatcher", async () => {
  const guarded = await source("./guarded-workspace.ts");
  const required = [
    "file.intake",
    "setup.save",
    "project.select",
    "file.select",
    "job.select",
    "packet.select",
    "test.select",
    "file.replace_current",
    "repair.save",
    "packet.build",
    "canvas.save_candidate",
    "candidate.save",
    "candidate.accept",
    "test.record",
    "checkpoint.create",
    "workflow.advance",
    "workflow.reset",
    "repo.prepare_handoff",
    "code_god.review",
    "github.writer_prepare",
    "undo.execute",
  ];

  assertIncludes(
    guarded,
    "TRANSACTIONAL_ACTIONS",
    "The guarded route must declare one explicit transactional action registry.",
  );
  for (const action of required) {
    assertIncludes(
      guarded,
      `\"${action}\"`,
      `The transaction registry must cover ${action}.`,
    );
  }
});

Deno.test("recovery contract: migration provides fenced atomic execution and exact replay", async () => {
  const migration = await source(
    "../../migrations/20260728143000_code_labs_atomic_workspace_engine.sql",
  );

  assertIncludes(
    migration,
    "create or replace function public.code_labs_execute_workspace_action",
    "The migration must expose one atomic database-action RPC.",
  );
  assertIncludes(
    migration,
    "fencing_token bigint",
    "Operation runs must persist a fencing token.",
  );
  assertIncludes(
    migration,
    "workspace_fencing_token",
    "The workspace must own a monotonically increasing fencing token.",
  );
  assertIncludes(
    migration,
    "completed_state_version",
    "Completed replay must persist its original completed version.",
  );
  assertIncludes(
    migration,
    "stored_result jsonb",
    "Completed replay must persist the exact original response.",
  );
  assertIncludes(
    migration,
    "failed_validation",
    "Validation failure must be represented without consuming workspace state.",
  );
  assertIncludes(
    migration,
    "interrupted",
    "Interrupted operations must be distinct from safely retryable validation failures.",
  );
  assertExcludes(
    migration,
    "state_version = state_version + 1;\n\n  update public.code_labs_action_runs",
    "State completion must not be separated from the action-owned mutations.",
  );
});

Deno.test("recovery contract: transaction result binds original state version", async () => {
  const migration = await source(
    "../../migrations/20260728143000_code_labs_atomic_workspace_engine.sql",
  );

  assertIncludes(
    migration,
    "'completed_state_version', v_completed_state_version",
    "A duplicate must receive the operation's original completed state version.",
  );
  assertIncludes(
    migration,
    "'replayed', true",
    "The RPC must explicitly distinguish a replay from a new execution.",
  );
  assertIncludes(
    migration,
    "p_fencing_token",
    "Completion and reconciliation must prove the exact fencing token.",
  );
});

Deno.test("recovery contract: Writer uses durable external phases and reconciliation", async () => {
  const writer = await source("./github-writer.ts");

  for (const phase of [
    "queued",
    "processing",
    "github_committed",
    "pr_opened",
    "completed",
  ]) {
    assertIncludes(writer, `\"${phase}\"`, `Writer must understand the ${phase} phase.`);
  }
  assertIncludes(
    writer,
    "writer_fencing_token",
    "Writer updates must be fenced.",
  );
  assertIncludes(
    writer,
    "reconcileExistingCommit",
    "Writer retry must reconcile an existing GitHub commit before creating another.",
  );
  assertIncludes(
    writer,
    "verifyStoredPullRequest",
    "Stored pull-request proof must be re-read and verified.",
  );
  assertIncludes(
    writer,
    "expected_github_blob_sha",
    "The queued request must bind the expected current blob SHA or explicit absence proof.",
  );
});

Deno.test("evidence boundary: this red suite is source-contract evidence only", () => {
  const evidence = {
    source_contract: true,
    database_integration: false,
    writer_integration: false,
    deployment_smoke_test: false,
  };

  assert(evidence.source_contract, "The test file must identify its actual evidence type.");
  assert(!evidence.database_integration, "Source tests must not claim database runtime proof.");
  assert(!evidence.writer_integration, "Source tests must not claim GitHub Writer runtime proof.");
  assert(!evidence.deployment_smoke_test, "Source tests must not claim deployment proof.");
});
