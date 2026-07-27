
import { codeLabsOperationId } from "./guarded-workspace.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, expected: string, message: string) {
  assert(source.includes(expected), message + ` Missing: ${expected}`);
}

async function source(relative: string) {
  return await Deno.readTextFile(new URL(relative, import.meta.url));
}

Deno.test("Code Labs action identity is stable across object key ordering", async () => {
  const owner = "af380be8-d1e2-4154-a5ed-a113c8271afd";
  const left = await codeLabsOperationId(owner, "repo.prepare_handoff", {
    expected_state_version: 580,
    fields: { action: "add", path: "supabase/migrations/example.sql" },
    confirmed: true,
  });
  const right = await codeLabsOperationId(owner, "repo.prepare_handoff", {
    confirmed: true,
    fields: { path: "supabase/migrations/example.sql", action: "add" },
    expected_state_version: 580,
  });

  assert(left === right, "Equivalent action arguments must produce the same operation identity.");
  assert(
    /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(left),
    "Operation identity must be a deterministic UUIDv5-shaped value.",
  );
});

Deno.test("Code Labs action identity changes across action and workspace versions", async () => {
  const owner = "af380be8-d1e2-4154-a5ed-a113c8271afd";
  const base = { expected_state_version: 580, fields: { action: "add", path: "example.sql" } };
  const first = await codeLabsOperationId(owner, "repo.prepare_handoff", base);
  const differentAction = await codeLabsOperationId(owner, "code_god.review", base);
  const differentVersion = await codeLabsOperationId(owner, "repo.prepare_handoff", {
    ...base,
    expected_state_version: 581,
  });

  assert(first !== differentAction, "Different actions must not share an operation identity.");
  assert(first !== differentVersion, "Different workspace versions must not share an operation identity.");
});

Deno.test("guarded actions forward one operation identity and remove legacy write bypasses", async () => {
  const guarded = await source("./guarded-workspace.ts");
  assertIncludes(
    guarded,
    "await fn(b, { ...args, operation_id: operationId })",
    "Guarded callbacks must receive the deterministic operation identity.",
  );
  assert(!guarded.includes("const alreadyLocked"), "Select and workflow writes must not bypass the durable lease.");
  assertIncludes(
    guarded,
    "const readOnlyAction = action === \"canvas.load_packet\" || action === \"github.prepare_request\"",
    "Only genuinely read-only actions may bypass the lease.",
  );
});

Deno.test("workspace writes honor active leases and replay checkpoint side effects", async () => {
  const workspace = await source("./workspace.ts");
  assertIncludes(workspace, "action_reservation_id=is.null", "Legacy state transitions must require no active lease.");
  assertIncludes(
    workspace,
    "state_version: operationId ? Number(state.state_version || 0) : Number(state.state_version || 0) + 1",
    "A leased callback must leave the single state increment to lease completion.",
  );
  assertIncludes(workspace, "code_labs_versions?select=*&owner_id=eq.", "Checkpoint retries must replay an existing version.");
  assertIncludes(workspace, "operation_id: operationId || null", "Receipts and checkpoints must store the operation identity.");
});

Deno.test("Writer preparation replays one durable request", async () => {
  const flow = await source("./repo-flow.ts");
  assertIncludes(flow, "&operation_id=eq.", "Writer retries must query by operation identity.");
  assertIncludes(flow, "const rows = replay ? [replay]", "Writer retries must reuse the existing request.");
  assertIncludes(flow, "operation_id: operationId || null", "Writer requests must persist operation identity.");
});

Deno.test("migration recovers stale leases and replays the original completed version", async () => {
  const migration = await source("../../migrations/20260726123000_code_labs_atomic_action_lease.sql");
  assertIncludes(migration, "interval '5 minutes'", "The migration must define bounded stale-lease recovery.");
  assertIncludes(migration, "Stale action lease reclaimed.", "Stale running leases must be durably failed before reuse.");
  assertIncludes(
    migration,
    "'state_version', v_run.completed_state_version",
    "A delayed duplicate must receive the original completed state version.",
  );
  assertIncludes(
    migration,
    "code_labs_workspace_action_lease_guard",
    "Legacy state transitions must be blocked while a lease is active.",
  );
});

Deno.test("migration prevents duplicate receipts, checkpoints and Writer requests", async () => {
  const migration = await source("../../migrations/20260726123000_code_labs_atomic_action_lease.sql");
  assertIncludes(migration, "code_labs_action_receipts_owner_operation_uidx", "Receipt operation identity must be unique.");
  assertIncludes(migration, "code_labs_versions_owner_operation_uidx", "Checkpoint operation identity must be unique.");
  assertIncludes(migration, "code_labs_write_requests_owner_operation_uidx", "Writer request operation identity must be unique.");
});
