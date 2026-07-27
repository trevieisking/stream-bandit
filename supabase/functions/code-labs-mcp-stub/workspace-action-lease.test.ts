import { codeLabsOperationId } from "./guarded-workspace.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, expected: string, message: string) {
  assert(source.includes(expected), message + ` Missing: ${expected}`);
}

function block(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  assert(start >= 0, `Missing block start: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert(end > start, `Missing block end: ${endMarker}`);
  return source.slice(start, end);
}

function lookupWithoutPersist(sourceBlock: string) {
  const lookupMarker = "operation_" + "id=eq.";
  const writeMarker = "operation_" + "id: operationId";
  return sourceBlock.includes(lookupMarker) && !sourceBlock.includes(writeMarker);
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

Deno.test("CG-IDEMPOTENCY-001 rejects lookup-without-persist and accepts the correction", () => {
  const broken = [
    "async function receipt(operationId: string) {",
    "  const prior = await one('&operation_id=eq.' + operationId);",
    "  if (prior) return prior;",
    "  return await insert({ owner_id: 'owner' });",
    "}",
  ].join("\n");
  const fixed = [
    "async function receipt(operationId: string) {",
    "  const prior = await one('&operation_id=eq.' + operationId);",
    "  if (prior) return prior;",
    "  return await insert({ operation_id: operationId });",
    "}",
  ].join("\n");

  assert(lookupWithoutPersist(broken), "The deliberately broken fixture must be detected.");
  assert(!lookupWithoutPersist(fixed), "The corrected fixture must not be detected.");
});

Deno.test("source contract: guarded callbacks forward one operation identity", async () => {
  const guarded = await source("./guarded-workspace.ts");
  assertIncludes(
    guarded,
    "await fn(b, { ...args, operation_id: operationId })",
    "Guarded callbacks must receive the deterministic operation identity.",
  );
  assert(!guarded.includes("const alreadyLocked"), "Legacy write bypasses must remain removed.");
});

Deno.test("source contract: workspace receipt persists the key it uses for replay", async () => {
  const workspace = await source("./workspace.ts");
  const receipt = block(workspace, "async function receipt(", "\nasync function patchSelected");
  assertIncludes(receipt, "&operation_id=eq.", "Receipt retries must query by operation identity.");
  assertIncludes(
    receipt,
    "operation_id: operationId || null",
    "The initial receipt insert must persist the replay key inside the receipt function.",
  );
  assert(!lookupWithoutPersist(receipt), "The actual receipt block must satisfy CG-IDEMPOTENCY-001.");
});

Deno.test("source contract: checkpoint replay is scoped to createCheckpoint", async () => {
  const workspace = await source("./workspace.ts");
  const checkpoint = block(workspace, "export async function createCheckpoint", "\nexport async function readReceipt");
  assertIncludes(checkpoint, "code_labs_versions?select=*&owner_id=eq.", "Checkpoint retries must query an existing version.");
  assertIncludes(checkpoint, "operation_id: operationId || null", "Checkpoint inserts must persist operation identity.");
  assert(!lookupWithoutPersist(checkpoint), "The checkpoint block must not look up a key without persisting it.");
});

Deno.test("source contract: Writer preparation replays one durable request", async () => {
  const flow = await source("./repo-flow.ts");
  const writer = block(flow, "export async function prepareGithubWriter", "\nexport async function backendTablesSnapshot");
  assertIncludes(writer, "&operation_id=eq.", "Writer retries must query by operation identity.");
  assertIncludes(writer, "const rows = replay ? [replay]", "Writer retries must reuse the existing request.");
  assertIncludes(writer, "operation_id: operationId || null", "Writer requests must persist operation identity.");
  assert(!lookupWithoutPersist(writer), "The Writer block must satisfy CG-IDEMPOTENCY-001.");
});

Deno.test("source contract: migration declares lease recovery and durable uniqueness", async () => {
  const migration = await source("../../migrations/20260726123000_code_labs_atomic_action_lease.sql");
  assertIncludes(migration, "interval '5 minutes'", "The migration must declare bounded stale-lease recovery.");
  assertIncludes(migration, "'state_version', v_run.completed_state_version", "Completed replay must declare the original version.");
  assertIncludes(migration, "code_labs_workspace_action_lease_guard", "Legacy state transitions must declare an active-lease guard.");
  assertIncludes(migration, "code_labs_action_receipts_owner_operation_uidx", "Receipt operation identity must be unique.");
  assertIncludes(migration, "code_labs_versions_owner_operation_uidx", "Checkpoint operation identity must be unique.");
  assertIncludes(migration, "code_labs_write_requests_owner_operation_uidx", "Writer request operation identity must be unique.");
});

Deno.test("evidence boundary: source contracts are not runtime database proof", () => {
  const evidenceKind = "source-contract";
  assert(evidenceKind !== "database-integration", "Source inspection must never be reported as database integration evidence.");
});
