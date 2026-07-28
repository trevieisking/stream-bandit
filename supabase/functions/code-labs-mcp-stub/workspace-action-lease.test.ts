import { codeLabsOperationId } from "./guarded-workspace.ts";
import {
  codeGodMissingOperationIdentityDispatches,
  codeGodShouldCheckIdentityPropagation,
  codeGodTestEvidenceAuthenticityIssue,
} from "./repo-flow.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, expected: string, message: string) {
  assert(source.includes(expected), message + ` Missing: ${expected}`);
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message} Expected: ${JSON.stringify(expected)} Actual: ${JSON.stringify(actual)}`,
  );
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

Deno.test("CG-IDENTITY-PROPAGATION-001 detects every dropped dispatcher identity", () => {
  const broken = [
    "export async function runAction(b: Binding, args: Row) {",
    "  const action = String(args.action || '');",
    '  if (action === "setup.save") return updateProject(b, { ...args });',
    '  if (action === "file.replace_current") return updateCurrentFile(b, { ...args });',
    '  if (action === "repair.save") return updateJob(b, { ...args });',
    '  if (action === "packet.build") return updatePacket(b, { ...args });',
    '  if (action === "test.record") return updateTest(b, { ...args });',
    "}",
  ].join("\n");

  assertEqual(
    codeGodMissingOperationIdentityDispatches(broken),
    ["setup.save", "file.replace_current", "repair.save", "packet.build", "test.record"],
    "The deliberately broken dispatcher fixture must identify all missing identities.",
  );
});

Deno.test("CG-IDENTITY-PROPAGATION-001 accepts corrected dispatcher identity", () => {
  const fixed = [
    "export async function runAction(b: Binding, args: Row) {",
    "  const action = String(args.action || '');",
    '  if (action === "setup.save") return updateProject(b, { ...args, operation_id: args.operation_id });',
    '  if (action === "file.replace_current") return updateCurrentFile(b, { ...args, operation_id: args.operation_id });',
    '  if (action === "repair.save") return updateJob(b, { ...args, operation_id: args.operation_id });',
    '  if (action === "packet.build") return updatePacket(b, { ...args, operation_id: args.operation_id });',
    '  if (action === "test.record") return updateTest(b, { ...args, operation_id: args.operation_id });',
    "}",
  ].join("\n");

  assertEqual(
    codeGodMissingOperationIdentityDispatches(fixed),
    [],
    "The corrected dispatcher fixture must preserve one operation identity through every mutation.",
  );
});

Deno.test("CG-DETECTOR-SCOPE-001 applies identity propagation only to workspace implementation", () => {
  assert(codeGodShouldCheckIdentityPropagation("workspace.ts"), "The root workspace implementation must be checked.");
  assert(
    codeGodShouldCheckIdentityPropagation("supabase/functions/code-labs-mcp-stub/workspace.ts"),
    "The nested workspace implementation must be checked.",
  );
  assert(
    !codeGodShouldCheckIdentityPropagation("workspace-action-lease.test.ts"),
    "A test fixture must not be judged as the live workspace implementation.",
  );
  assert(
    !codeGodShouldCheckIdentityPropagation("docs/workspace.ts.md"),
    "Documentation quoting workspace code must not be judged as live source.",
  );
  assert(
    !codeGodShouldCheckIdentityPropagation("examples/workspace.ts.example"),
    "Example code must not be judged as the live workspace implementation.",
  );
});

Deno.test("CG-TEST-AUTHENTICITY-001 detects overstated source-only evidence", () => {
  const broken = [
    'const source = await Deno.readTextFile("workspace.ts");',
    'assertIncludes(source, "transaction", "This proves concurrent database runtime behaviour and durable side effects.");',
  ].join("\n");
  const corrected = [
    'const evidenceKind = "source-contract";',
    'const missingEvidence = "database-integration";',
    'const source = await Deno.readTextFile("workspace.ts");',
    'assertIncludes(source, "transaction", "This checks declared source structure only.");',
  ].join("\n");

  assert(
    codeGodTestEvidenceAuthenticityIssue("workspace-action-lease.test.ts", broken),
    "The overstated source-only fixture must be detected.",
  );
  assert(
    !codeGodTestEvidenceAuthenticityIssue("workspace-action-lease.test.ts", corrected),
    "The honest evidence-boundary fixture must not be detected.",
  );
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

Deno.test("source contract: Code God V4.1 exposes lessons, evidence scope and human explanation", async () => {
  const flow = await source("./repo-flow.ts");
  assertIncludes(flow, 'version: "V104-code-god-4.1"', "The reviewed Code God version must remain explicit.");
  assertIncludes(flow, '"CG-IDENTITY-PROPAGATION-001"', "The identity propagation lesson must remain permanent.");
  assertIncludes(flow, '"CG-TEST-AUTHENTICITY-001"', "The evidence authenticity lesson must remain permanent.");
  assertIncludes(flow, '"CG-DETECTOR-SCOPE-001"', "The detector scope lesson must remain permanent.");
  assertIncludes(flow, "why_it_matters", "Every lesson must explain why it matters.");
  assertIncludes(flow, "next_safe_action", "Every finding must explain the next safe action.");
  assertIncludes(flow, "evidence_required", "Every lesson must state the evidence it requires.");
  assertIncludes(flow, "learned_message", "Every lesson must preserve what Code God learned.");
  assertIncludes(flow, "can_continue_to_writer", "The explanation must state whether Writer can continue.");
  assertIncludes(flow, "executable_rule_fixtures: false", "Code God must not claim fixtures ran before execution evidence exists.");
  assertIncludes(flow, "database_integration: false", "Code God must not claim database integration evidence before it exists.");
  assertIncludes(flow, "deployment_smoke_test: false", "Code God must not claim deployment proof before deployment.");
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
  const evidenceKind: string = "source-contract";
  assert(evidenceKind !== "database-integration", "Source inspection must never be reported as database integration evidence.");
});

function functionBody(sourceText: string, name: string) {
  const marker = "function " + name + "(";
  const start = sourceText.indexOf(marker);
  assert(start >= 0, `Missing function: ${name}`);
  const open = sourceText.indexOf("{", start + marker.length);
  assert(open >= 0, `Missing function body: ${name}`);
  let depth = 0;
  for (let index = open; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return sourceText.slice(open + 1, index);
    }
  }
  throw new Error(`Unclosed function body: ${name}`);
}

function executableFunction(sourceText: string, name: string, parameters: string[]) {
  return new Function(...parameters, functionBody(sourceText, name));
}

function executableAsyncFunction(sourceText: string, name: string, parameters: string[]) {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  return new AsyncFunction(...parameters, functionBody(sourceText, name));
}

function assertThrows(fn: () => unknown, message: string) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  assert(threw, message);
}

Deno.test("File candidate path helper executes accepted and protected-path fixtures", async () => {
  const main = await source("./main.ts");
  const safeCandidatePath = executableFunction(main, "safeCandidatePath", ["value"]) as (value: unknown) => string;

  assertEqual(safeCandidatePath("src/new-file.ts"), "src/new-file.ts", "A normal repository-relative path must be accepted.");
  assertEqual(safeCandidatePath(" docs/new-file.md "), "docs/new-file.md", "Safe surrounding whitespace must be trimmed.");

  for (const unsafe of [
    "",
    "/absolute.ts",
    "folder/",
    "../escape.ts",
    "folder\\escape.ts",
    ".hidden.ts",
    ".env",
    "nested/.env.local",
    "nested/secret",
    "nested/secrets",
    ".github/workflows/write.yml",
    "private.pem",
    "private.key",
    "bad\u0000name.ts",
  ]) {
    assertThrows(() => safeCandidatePath(unsafe), `Unsafe path must be rejected: ${JSON.stringify(unsafe)}`);
  }
});

Deno.test("File candidate repository helper executes owner/repository fixtures", async () => {
  const main = await source("./main.ts");
  const safeRepo = executableFunction(main, "safeRepo", ["value"]) as (value: unknown) => string;

  assertEqual(safeRepo("trevieisking/stream-bandit"), "trevieisking/stream-bandit", "The selected repository format must be accepted.");
  for (const unsafe of ["", "stream-bandit", "/stream-bandit", "owner/", "owner/repo/extra", "owner repo/name"]) {
    assertThrows(() => safeRepo(unsafe), `Unsafe repository must be rejected: ${JSON.stringify(unsafe)}`);
  }
});

Deno.test("File candidate deterministic identity executes stable and separating fixtures", async () => {
  const main = await source("./main.ts");
  const deterministicFileId = executableAsyncFunction(main, "deterministicFileId", ["ownerId", "projectId", "path"]) as (
    ownerId: string,
    projectId: string,
    path: string,
  ) => Promise<string>;

  const first = await deterministicFileId("owner-a", "project-a", "src/new-file.ts");
  const replay = await deterministicFileId("owner-a", "project-a", "src/new-file.ts");
  const otherPath = await deterministicFileId("owner-a", "project-a", "src/other.ts");
  const otherProject = await deterministicFileId("owner-a", "project-b", "src/new-file.ts");

  assertEqual(first, replay, "An identical new-file request must resolve to one deterministic identity.");
  assert(first !== otherPath, "Different paths must not share a file identity.");
  assert(first !== otherProject, "Different projects must not share a file identity.");
  assert(
    /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(first),
    "The deterministic file identity must be UUIDv8-shaped.",
  );
});

Deno.test("File candidate reservation helper executes intake and create-candidate fixtures", async () => {
  const main = await source("./main.ts");
  const fileReservationActive = new Function(
    "value",
    'const INTAKE_RESERVATION_PREFIX = "file_intake_pending:";' +
      'const CREATE_CANDIDATE_RESERVATION_PREFIX = "file_create_candidate_pending:";' +
      functionBody(main, "fileReservationActive"),
  ) as (value: unknown) => boolean;

  assert(fileReservationActive("file_intake_pending:123"), "An intake reservation must be recognised.");
  assert(fileReservationActive("file_create_candidate_pending:123"), "A new-file candidate reservation must be recognised.");
  assert(!fileReservationActive("file"), "A completed File Lab step must not be treated as reserved.");
  assert(!fileReservationActive("project"), "A project step must not be treated as reserved.");
});

Deno.test("source contract: new-file candidate stays proposed-only and cannot call GitHub", async () => {
  const main = await source("./main.ts");
  const candidate = block(main, "async function createFileCandidate", "\nfunction actionsWithFileBootstrap");

  assert(!candidate.includes("githubRequest("), "New-file candidate creation must not call GitHub.");
  assert(!candidate.includes("verifyOwnerRepository("), "New-file candidate creation must not acquire GitHub authority.");
  assertIncludes(candidate, 'source: "file.create_candidate"', "The proposed row must identify its source action.");
  assertIncludes(candidate, "proposed: true", "The new-file row must remain proposed-only.");
  assertIncludes(candidate, 'current_code: ""', "The new-file row must not pretend candidate code is live source.");
  assertIncludes(candidate, "github_source_verified: false", "The candidate must not claim GitHub source verification.");
  assertIncludes(candidate, "can_authorize_writer: false", "The candidate must not authorise Writer.");
  assertIncludes(candidate, "if (file && !matchingProposedFile)", "A real or conflicting file must be refused.");
  assertIncludes(candidate, "matchingProposedFile &&", "An identical proposed row must be eligible for replay.");
  assertIncludes(candidate, "wrote_database: false", "A completed identical replay must report no new database write.");
  assertIncludes(candidate, "wrote_github: false", "Every candidate result must report no GitHub write.");
  assertIncludes(candidate, "releaseFileReservation", "Failure must attempt to release the workspace reservation.");
});

Deno.test("source contract: new-file candidate action is listed and dispatched deliberately", async () => {
  const main = await source("./main.ts");
  assertIncludes(main, '{ action: "file.create_candidate", requires_confirmation: false }', "The new-file action must be listed explicitly.");
  assertIncludes(main, 'if (action === "file.create_candidate") return createFileCandidate(b, args);', "The dispatcher must route only the exact action ID.");
});

Deno.test("evidence boundary: executable pure helpers are not database integration proof", () => {
  const evidenceKind: string = "executable-pure-helper";
  const missingEvidence: string = "database-integration";
  assert(evidenceKind !== missingEvidence, "Pure helper execution must not be reported as database integration evidence.");
});
