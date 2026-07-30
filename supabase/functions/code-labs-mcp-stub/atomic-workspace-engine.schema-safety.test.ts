/**
 * Red source-contract tests for the atomic workspace migration bundle.
 *
 * These tests review the foundation, strict boundary and additive hardening
 * migrations together. They must become green before any migration is attempted
 * against an isolated database.
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
  const boundary = await Deno.readTextFile(
    new URL("../../migrations/20260728150000_code_labs_atomic_boolean_boundary.sql", import.meta.url),
  );
  const hardening = await Deno.readTextFile(
    new URL("../../migrations/20260728170000_code_labs_atomic_workspace_engine_hardening.sql", import.meta.url),
  );
  const projectUndo = await Deno.readTextFile(
    new URL("../../migrations/20260730131500_code_labs_project_undo_owner_fix.sql", import.meta.url),
  );
  return {
    foundation,
    boundary,
    hardening,
    projectUndo,
    bundle: `${foundation}\n${boundary}\n${hardening}\n${projectUndo}`,
  };
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

Deno.test("schema safety: selected project undo reuses the single record-patch owner", async () => {
  const { projectUndo } = await migrations();

  assertIncludes(
    projectUndo,
    "pg_catalog.pg_get_functiondef",
    "The forward migration must inspect the existing function owner rather than replace migration history.",
  );
  assertIncludes(
    projectUndo,
    "'public.code_labs_apply_record_patch(uuid,text,text,uuid,timestamptz,jsonb)'::regprocedure",
    "The repair must target the exact existing atomic record-patch signature.",
  );
  assertIncludes(
    projectUndo,
    "p_action not in ('setup.save', 'undo.execute')",
    "Project records may only be changed by setup.save or an eligible undo.execute receipt.",
  );
  assertIncludes(
    projectUndo,
    "v_state.current_project_id is distinct from p_record_id",
    "Undo must remain bound to the currently selected project.",
  );
  assertMatches(
    projectUndo,
    /v_old_count\s*<>\s*1[\s\S]*?project_undo_patch_source_mismatch/i,
    "The forward migration must fail closed unless the verified old gate occurs exactly once.",
  );
  assertMatches(
    projectUndo,
    /position\(v_new_gate in v_definition\)\s*=\s*0[\s\S]*?project_undo_patch_verification_failed/i,
    "The migration must verify the replacement before committing.",
  );
  assertExcludes(
    projectUndo,
    "create table public.code_labs",
    "The undo repair must not introduce a second table or workflow owner.",
  );
  assertExcludes(
    projectUndo,
    "drop function public.code_labs_apply_record_patch",
    "The existing atomic function owner must not be dropped.",
  );
});

Deno.test("schema safety: untrusted JSON booleans pass one strict service-role boundary", async () => {
  const { boundary } = await migrations();
  const atomicClient = await Deno.readTextFile(new URL("./atomic-workspace-engine.ts", import.meta.url));

  assertIncludes(
    boundary,
    "code_labs_require_jsonb_boolean",
    "The expansion bundle must provide one strict JSON-boolean validator.",
  );
  assertMatches(
    boundary,
    /jsonb_typeof\(p_value\) = 'boolean'[\s\S]*?return p_value::text::boolean/i,
    "Only genuine JSON booleans may be accepted.",
  );
  assertExcludes(
    boundary,
    "jsonb_typeof(p_value) = 'string'",
    "String values such as 'true' and 'false' must not be accepted as booleans.",
  );
  assertIncludes(boundary, "writer_expected_blob_absent_invalid", "Malformed Writer absence proof must fail validation.");
  assertIncludes(boundary, "receipt_boolean_invalid", "Malformed receipt booleans must fail validation.");
  assertIncludes(
    boundary,
    "revoke execute on function public.code_labs_execute_workspace_action",
    "The service role must not bypass the strict boundary and call the raw transaction.",
  );
  assertIncludes(
    boundary,
    "grant execute on function public.code_labs_execute_workspace_action_strict",
    "The service role must enter the strict wrapper only.",
  );
  assertIncludes(
    atomicClient,
    'rpc/code_labs_execute_workspace_action_strict',
    "The atomic client must call the strict wrapper.",
  );
  assertExcludes(
    atomicClient,
    'rest("rpc/code_labs_execute_workspace_action",',
    "The atomic client must not call the raw RPC directly.",
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
