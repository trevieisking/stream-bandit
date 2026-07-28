import {
  atomicOperationId,
  atomicRequestHash,
  canonicalJson,
} from "./atomic-workspace-engine.ts";

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
