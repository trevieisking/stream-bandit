/**
 * Red source-contract tests for the atomic workspace migration.
 *
 * These tests deliberately describe safety requirements that are not all
 * satisfied by the current migration candidate. They must become green before
 * an isolated database migration is attempted.
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

async function migration() {
  return await Deno.readTextFile(
    new URL("../../migrations/20260728143000_code_labs_atomic_workspace_engine.sql", import.meta.url),
  );
}

Deno.test("schema safety: existing constraints are replaced with the new state machine", async () => {
  const sql = await migration();
  const constraints = [
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
      sql,
      drop,
      `An already-existing ${constraint} must be upgraded instead of silently retaining stale rules.`,
    );
    assertBefore(sql, drop, add, `The old ${constraint} must be removed before its replacement is added.`);
  }
});

Deno.test("schema safety: failure persistence is fenced and retains the operation fence", async () => {
  const sql = await migration();
  const failure = sql.slice(sql.indexOf("exception when others"));

  assertMatches(
    failure,
    /update public\.code_labs_action_runs[\s\S]*?where owner_id = p_owner_id[\s\S]*?and operation_id = p_operation_id[\s\S]*?and status = 'running'[\s\S]*?and fencing_token = v_fencing_token/i,
    "A stale worker must not be able to overwrite the durable failure state for a newer fence.",
  );
  assertExcludes(
    failure,
    "fencing_token = null",
    "Failure evidence must retain the exact fencing token that owned the attempt.",
  );
  assertIncludes(
    failure,
    "operation_failure_fence_failed",
    "Failure recording must stop when its fenced update does not match exactly one running operation.",
  );
});

Deno.test("schema safety: parent-changing patches validate the complete owner hierarchy", async () => {
  const sql = await migration();

  for (const marker of [
    "job_patch_file_hierarchy_invalid",
    "packet_patch_job_hierarchy_invalid",
    "test_patch_job_hierarchy_invalid",
    "undo_hierarchy_invalid",
  ]) {
    assertIncludes(
      sql,
      marker,
      "A patch that changes a parent relationship must be rejected before it can create a cross-project or cross-owner hierarchy.",
    );
  }
});

Deno.test("schema safety: untrusted JSON booleans are parsed without direct casts", async () => {
  const sql = await migration();

  assertIncludes(
    sql,
    "code_labs_jsonb_boolean",
    "The migration must use one strict helper for optional JSON booleans.",
  );
  assertIncludes(sql, "writer_expected_blob_absent_invalid", "Malformed Writer absence proof must fail validation.");
  assertIncludes(sql, "receipt_boolean_invalid", "Malformed receipt booleans must fail validation.");
  assertExcludes(
    sql,
    "coalesce((v_request->>'expected_github_blob_absent')::boolean, false)",
    "Writer input must not rely on a direct boolean cast that can bypass controlled validation.",
  );
  assertExcludes(
    sql,
    "coalesce((v_receipt_spec->>'created_new_row')::boolean, false)",
    "Receipt input must not directly cast created_new_row.",
  );
  assertExcludes(
    sql,
    "coalesce((v_receipt_spec->>'undo_available')::boolean, false)",
    "Receipt input must not directly cast undo_available.",
  );
});

Deno.test("schema safety: source and candidate hashes are recomputed by PostgreSQL", async () => {
  const sql = await migration();

  assertIncludes(sql, "candidate_hash_invalid", "Candidate metadata must be verified against fixed_output server-side.");
  assertIncludes(sql, "source_hash_invalid", "Source metadata must be verified against current_code server-side.");
  assertMatches(
    sql,
    /v_expected_content_sha256\s*<>\s*public\.code_labs_sha256_text\(v_content\)/i,
    "Writer content proof must be recomputed from the complete content inside PostgreSQL.",
  );
  assertMatches(
    sql,
    /current_hash\s*=\s*case[\s\S]*?public\.code_labs_sha256_text/i,
    "A current-file replacement must derive current_hash from current_code.",
  );
});

Deno.test("schema safety: Writer preparation requires immutable verified branch proof", async () => {
  const sql = await migration();

  for (const field of ["github_head_branch_sha", "github_branch_verified_at"]) {
    assertIncludes(sql, field, `Writer preparation must persist ${field}.`);
  }
  assertIncludes(
    sql,
    "writer_branch_proof_invalid",
    "Writer preparation must reject missing or mismatched external branch proof.",
  );
  assertIncludes(
    sql,
    "writer_protected_branch_invalid",
    "Writer preparation must reject main, the default base branch and any protected target.",
  );
});

Deno.test("schema safety: the database-only transaction contains no GitHub network lane", async () => {
  const sql = await migration();

  for (const forbidden of ["net.http", "http_post", "api.github.com", "github.com/repos/"]) {
    assertExcludes(
      sql,
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
