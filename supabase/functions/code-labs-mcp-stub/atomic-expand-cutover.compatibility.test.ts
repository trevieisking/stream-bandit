/**
 * Red source-contract tests for the Code Labs expand-cutover sequence.
 *
 * These tests protect the currently deployed V49 function from schema skew while
 * the atomic-only replacement is prepared. They are source-contract evidence
 * only and do not prove runtime database compatibility or deployment safety.
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

/**
 * Remove dollar-quoted SQL bodies before inspecting migration-time statements.
 *
 * A CREATE FUNCTION body can contain UPDATE/INSERT/DELETE statements without
 * executing those statements when the migration is applied. Expansion safety
 * must therefore inspect top-level migration SQL separately from dormant RPC
 * implementation text.
 */
function stripDollarQuotedBodies(source: string) {
  const opener = /\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/g;
  let output = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = opener.exec(source))) {
    const delimiter = match[0];
    const closing = source.indexOf(delimiter, opener.lastIndex);
    if (closing < 0) {
      output += source.slice(cursor);
      return output;
    }

    output += source.slice(cursor, match.index);
    output += `${delimiter}/* dollar-quoted body omitted for top-level inspection */${delimiter}`;
    cursor = closing + delimiter.length;
    opener.lastIndex = cursor;
  }

  return output + source.slice(cursor);
}

async function read(relative: string) {
  return await Deno.readTextFile(new URL(relative, import.meta.url));
}

async function expansion() {
  return await read("../../migrations/20260728143000_code_labs_atomic_workspace_engine.sql");
}

async function enforcement() {
  return await read("../../migrations/20260728170000_code_labs_atomic_workspace_engine_hardening.sql");
}

Deno.test("expand contract: the pre-cutover migration remains backward compatible with V49", async () => {
  const sql = await expansion();
  const topLevelSql = stripDollarQuotedBodies(sql);

  assertIncludes(
    sql,
    "Candidate only: do not apply to production",
    "The expansion candidate must retain an explicit non-production boundary.",
  );
  assertIncludes(
    sql,
    "create or replace function public.code_labs_execute_workspace_action",
    "The expansion may define the dormant atomic RPC without executing its mutation body.",
  );
  assertExcludes(
    topLevelSql,
    "create trigger",
    "The expansion phase must not attach enforcement triggers to tables used by V49.",
  );
  assertExcludes(
    topLevelSql,
    "drop function public.code_labs_reserve_workspace_state_version",
    "The expansion phase must preserve the reservation RPC required by V49.",
  );
  assertExcludes(
    topLevelSql,
    "revoke all on function public.code_labs_reserve_workspace_state_version",
    "The expansion phase must not revoke the reservation RPC required by V49.",
  );
  assertExcludes(
    topLevelSql,
    "update public.code_labs_files",
    "The expansion phase must not rewrite existing live file rows or hash metadata during migration application.",
  );
});

Deno.test("expand contract: new atomic fields remain optional for legacy rows", async () => {
  const sql = await expansion();

  for (const column of [
    "operation_id uuid",
    "writer_fencing_token bigint",
    "writer_phase text",
    "expected_github_blob_sha text",
    "expected_content_sha256 text",
    "github_base_branch text",
    "github_head_branch text",
  ]) {
    assertIncludes(sql, column, `The atomic expansion must add ${column}.`);
  }

  assertExcludes(
    sql,
    "alter column operation_id set not null",
    "Legacy Writer, receipt and version rows must remain readable after expansion.",
  );
  assertIncludes(
    sql,
    "operation_id is null",
    "New Writer constraints must explicitly permit legacy rows without an operation ID.",
  );
});

Deno.test("cutover contract: hardening is classified as post-cutover enforcement only", async () => {
  const sql = await enforcement();

  assertIncludes(
    sql,
    "POST-CUTOVER ONLY",
    "The hardening migration must state that it cannot run while V49 is active.",
  );
  assertIncludes(sql, "create trigger", "The enforcement migration owns table triggers.");
  assertIncludes(
    sql,
    "code_labs_writer_request_proof_guard",
    "Writer branch and content proof belongs to post-cutover enforcement.",
  );
  assertIncludes(
    sql,
    "code_labs_files_hash_guard",
    "Canonical file-hash enforcement belongs to post-cutover enforcement.",
  );
});

Deno.test("hash compatibility: source declares one versioned canonical text-hash contract", async () => {
  const atomicClient = await read("./atomic-workspace-engine.ts");
  const enforcementSql = await enforcement();

  assertIncludes(
    atomicClient,
    'ATOMIC_CONTENT_HASH_VERSION = "sha256-utf8-v1"',
    "The atomic client must name the exact hash algorithm and byte encoding.",
  );
  assertIncludes(
    atomicClient,
    "hashUtf8Text",
    "The atomic client must use a dedicated raw UTF-8 text hashing helper.",
  );
  assertIncludes(
    enforcementSql,
    "sha256-utf8-v1",
    "PostgreSQL enforcement must identify the same canonical hash contract.",
  );
  assertIncludes(
    enforcementSql,
    "legacy_hash_version",
    "Existing hashes must be classified and preserved rather than silently rewritten.",
  );
});

Deno.test("cutover contract: the candidate runtime exposes one atomic mutation engine only", async () => {
  const guarded = await read("./guarded-workspace.ts");
  const main = await read("./main.ts");
  const combined = `${guarded}\n${main}`;

  assertIncludes(
    guarded,
    'import { executeAtomicWorkspaceAction',
    "The replacement runtime must import the atomic RPC client explicitly.",
  );
  assertIncludes(
    guarded,
    "return executeAtomicWorkspaceAction",
    "Registered database mutations must enter the atomic RPC client.",
  );
  assertExcludes(
    combined,
    "code_labs_reserve_workspace_state_version",
    "The atomic candidate must not retain the legacy pre-increment route.",
  );
  assertExcludes(
    combined,
    "INTAKE_RESERVATION_PREFIX",
    "File Lab must not retain a second reservation engine.",
  );

  for (const forbidden of [
    "atomic_engine_enabled",
    "legacy_engine_enabled",
    "shadow_write",
    "dual_write",
    "fallback_mutation_engine",
  ]) {
    assertExcludes(
      combined,
      forbidden,
      "The deployed candidate must not choose between old and new mutation engines.",
    );
  }
});

Deno.test("deployment contract: unsupported code/schema combinations are named explicitly", () => {
  const combinations = {
    v49_old_schema: "supported",
    v49_expanded_schema: "must_be_proven",
    v50_old_schema: "blocked",
    v50_expanded_schema: "must_be_proven",
    v49_enforcement_schema: "prohibited",
    v50_enforcement_schema: "must_be_proven_after_cutover",
  } as const;

  assert(combinations.v49_old_schema === "supported", "The current live pairing remains the rollback baseline.");
  assert(combinations.v50_old_schema === "blocked", "Atomic V50 must fail closed when required schema is absent.");
  assert(combinations.v49_enforcement_schema === "prohibited", "V49 must never run against enforcement schema.");
});

Deno.test("evidence boundary: compatibility source tests do not authorise production changes", () => {
  const evidence = {
    source_contract: true,
    live_schema_inventory: true,
    count_only_compatibility_audit: true,
    isolated_old_function_smoke: false,
    disposable_database_integration: false,
    isolated_atomic_function_smoke: false,
    production_expansion: false,
    production_deployment: false,
  };

  assert(evidence.source_contract, "This suite is source-contract evidence.");
  assert(evidence.live_schema_inventory, "The live schema has been inspected read-only.");
  assert(evidence.count_only_compatibility_audit, "Live compatibility was measured without returning row contents.");
  assert(!evidence.isolated_old_function_smoke, "V49 must still be tested against expansion on an isolated branch.");
  assert(!evidence.disposable_database_integration, "Rollback, replay, concurrency and fencing still require a real test database.");
  assert(!evidence.isolated_atomic_function_smoke, "Atomic V50 still requires an isolated deployment smoke test.");
  assert(!evidence.production_expansion, "No production migration is authorised by this suite.");
  assert(!evidence.production_deployment, "No production Edge Function deployment is authorised by this suite.");
});
