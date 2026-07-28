/**
 * Red source-contract tests for the atomic workspace migration bundle.
 *
 * These tests review the foundation migration together with its additive
 * hardening migration. They must become green before either migration is
 * attempted against an isolated database.
 *
 * Evidence boundary: this file is source-contract evidence only. It is not a
 * substitute for disposable-database rollback, concurrency, replay or fencing
 * integration tests.
 */

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, expected: string, message: string) {
  assert(source.includes(expected), `${message} Missing: ${expected}`);
}

function assertExcludes(source: string, forbidden: string, message: string) {
  assert(!source.includes(forbidden), `${message} Forbidden: ${forbidden}`);
}

function assertMatches(source: string, expected: RegExp, message: string) {
  assert(expected.test(source), `${message} Missing pattern: ${expected}`);
}

function assertBefore(source: string, first: string, second: string, message: string) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex >= 0, `${message} Missing first marker: ${first}`);
  assert(secondIndex >= 0, `${message} Missing second marker: ${second}`);
  assert(firstIndex < secondIndex, `${message} Expected ${first} before ${second}.`);
}

async function migrations() {
  const foundation = await Deno.readTextFile(
    new URL("../../migrations/20260728143000_code_labs_atomic_workspace_engine.sql", import.meta.url),
  );
  const hardening = await Deno.readTextFile(
    new URL("../../migrations/20260728170000_code_labs_atomic_workspace_engine_hardening.sql", import.meta.url),
  );
  return { foundation, hardening, bundle: `${foundation}\n${hardening}` };
}

Deno.test("schema safety: existing constraints are replaced with the new state machine", async () => {
  const { hardening } = await migrations();
  const constraints = [
    "code_labs_action_runs_request_hash_check",
    "code_labs_action_runs_status_check",
    "code_labs_action_runs_completion_check",
    "code_labs_writer_phase_check",
    "code_labs_writer_expected_blob_check",
    "code_labs_writer_content_hash_check",
  ];

  for (const constraint of constraints) {
    const drop = `drop constraint if exists ${constraint}`;
    const add = `add constraint ${constraint}`;
    assertIncludes(
      hardening,
      drop,
      `An already-existing ${constraint} must be upgraded instead of silently retaining stale rules.`,
    );
    assertBefore(hardening, drop, add, `The old ${constraint} must be removed before its replacement is added.`);
  }
});

Deno.test("schema safety: failure persistence is fenced and retains the operation fence", async () => {
  const { hardening } = await migrations();

  assertIncludes(
    hardening,
    "code_labs_guard_action_run_transition",
    "Failure-state transitions must pass through one database guard.",
  );
  assertMatches(
    hardening,
    /old\.status\s*<>\s*'running'[\s\S]*?old\.fencing_token is null[\s\S]*?operation_failure_fence_failed/i,
    "A failure transition must originate from the running operation that owns a fence.",
  );
  assertMatches(
    hardening,
    /v_operation_id is distinct from old\.operation_id[\s\S]*?v_fencing_token is distinct from old\.fencing_token/i,
    "The transaction-local operation ID and fence must match the durable running row.",
  );
  assertIncludes(
    hardening,
    "new.fencing_token := old.fencing_token",
    "Failure evidence must retain the exact fencing token that owned the attempt.",
  );
});

Deno.test("schema safety: parent-changing patches validate the complete owner hierarchy", async () => {
  const { hardening } = await migrations();

  for (const marker of [
    "job_patch_file_hierarchy_invalid",
    "packet_patch_job_hierarchy_invalid",
    "test_patch_job_hierarchy_invalid",
    "undo_hierarchy_invalid",
  ]) {
    assertIncludes(
      hardening,
      marker,
      "A patch that changes a parent relationship must be rejected before it can create a cross-project or cross-owner hierarchy.",
    );
  }

  for (const trigger of [
    "code_labs_jobs_hierarchy_guard",
    "code_labs_packets_hierarchy_guard",
    "code_labs_test_runs_hierarchy_guard",
  ]) {
    assertIncludes(hardening, trigger, `The database must install ${trigger}.`);
  }
});

Deno.test("schema safety: untrusted JSON booleans are parsed without direct casts", async () => {
  const { bundle } = await migrations();

  assertIncludes(
    bundle,
    "code_labs_jsonb_boolean",
    "The migration bundle must use one strict helper for optional JSON booleans.",
  );
  assertIncludes(bundle, "writer_expected_blob_absent_invalid", "Malformed Writer absence proof must fail validation.");
  assertIncludes(bundle, "receipt_boolean_invalid", "Malformed receipt booleans must fail validation.");
  assertExcludes(
    bundle,
    "coalesce((v_request->>'expected_github_blob_absent')::boolean, false)",
    "Writer input must not rely on a direct boolean cast that can bypass controlled validation.",
  );
  assertExcludes(
    bundle,
    "coalesce((v_receipt_spec->>'created_new_row')::boolean, false)",
    "Receipt input must not directly cast created_new_row.",
  );
  assertExcludes(
    bundle,
    "coalesce((v_receipt_spec->>'undo_available')::boolean, false)",
    "Receipt input must not directly cast undo_available.",
  );
});

Deno.test("schema safety: source and candidate hashes are recomputed by PostgreSQL", async () => {
  const { foundation, hardening } = await migrations();

  assertIncludes(hardening, "candidate_hash_invalid", "Candidate metadata must be verified against fixed_output server-side.");
  assertIncludes(hardening, "source_hash_invalid", "Source metadata must be verified against current_code server-side.");
  assertMatches(
    foundation,
    /v_expected_content_sha256\s*<>\s*public\.code_labs_sha256_text\(v_content\)/i,
    "Writer content proof must be recomputed from the complete content inside PostgreSQL.",
  );
  assertMatches(
    foundation,
    /current_hash\s*=\s*case[\s\S]*?public\.code_labs_sha256_text/i,
    "A current-file replacement must derive current_hash from current_code.",
  );
  assertIncludes(
    hardening,
    "code_labs_files_hash_guard",
    "Direct and future file writes must also pass through a database hash guard.",
  );
});

Deno.test("schema safety: Writer preparation requires immutable verified branch proof", async () => {
  const { hardening } = await migrations();

  for (const field of ["github_head_branch_sha", "github_branch_verified_at"]) {
    assertIncludes(hardening, field, `Writer preparation must persist ${field}.`);
  }
  assertIncludes(
    hardening,
    "writer_branch_proof_invalid",
    "Writer preparation must reject missing or mismatched external branch proof.",
  );
  assertIncludes(
    hardening,
    "writer_protected_branch_invalid",
    "Writer preparation must reject main, the default base branch and any protected target.",
  );
  assertIncludes(
    hardening,
    "code_labs_writer_request_proof_guard",
    "Every atomic Writer request row must pass the immutable proof trigger.",
  );
});

Deno.test("schema safety: the database-only transaction contains no GitHub network lane", async () => {
  const { bundle } = await migrations();

  for (const forbidden of ["net.http", "http_post", "api.github.com", "github.com/repos/"]) {
    assertExcludes(
      bundle,
      forbidden,
      "The database-only atomic action must never perform an external GitHub request.",
    );
  }
});

Deno.test("evidence boundary: this red suite does not claim database integration proof", () => {
  const evidence = {
    source_contract: true,
    database_integration: false,
    forced_rollback_proof: false,
    concurrency_proof: false,
    replay_proof: false,
    writer_integration: false,
    deployment_smoke_test: false,
  };

  assert(evidence.source_contract, "This file is executable source-contract evidence.");
  assert(!evidence.database_integration, "A disposable database must still prove atomic rollback.");
  assert(!evidence.forced_rollback_proof, "Receipt and target failures must still be injected in PostgreSQL.");
  assert(!evidence.concurrency_proof, "Concurrent operations must still be tested against a real database.");
  assert(!evidence.replay_proof, "Immediate and delayed replay must still be exercised against stored rows.");
  assert(!evidence.writer_integration, "Writer reconciliation requires a controlled GitHub branch.");
  assert(!evidence.deployment_smoke_test, "No deployment claim is made by this suite.");
});
