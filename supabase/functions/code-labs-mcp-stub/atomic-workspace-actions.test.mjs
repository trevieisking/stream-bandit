import assert from "node:assert/strict";
import test from "node:test";
import {
  ATOMIC_ACTION_COVERAGE,
  buildAtomicWorkspacePayload,
} from "./atomic-workspace-actions.mjs";

const now = "2026-07-28T16:00:00.000Z";
const current = {
  project: { id: "project-1", updated_at: now, metadata: {} },
  file: { id: "file-1", updated_at: now, metadata: { preserved: true } },
  job: { id: "job-1", updated_at: now, metadata: {} },
  packet: { id: "packet-1", updated_at: now, metadata: {} },
  test: { id: "test-1", updated_at: now, details: {} },
};

function context(extra = {}) {
  return { now, current, ...extra };
}

test("selection uses one workspace effect and one receipt", async () => {
  const payload = await buildAtomicWorkspacePayload(
    "file.select",
    { record_id: "file-2" },
    context(),
  );
  assert.equal(payload.effects.length, 2);
  assert.deepEqual(payload.effects[0], {
    kind: "workspace_select",
    key: "record",
    record_id: "file-2",
  });
  assert.equal(payload.effects[1].kind, "receipt_insert");
});

test("record updates strip unsupported fields", async () => {
  const payload = await buildAtomicWorkspacePayload(
    "setup.save",
    { fields: { site_name: "Code Labs", owner_id: "must-not-pass" } },
    context(),
  );
  assert.deepEqual(payload.effects[0].patch, { site_name: "Code Labs" });
  assert.equal(payload.effects[0].record_type, "project");
  assert.equal(payload.effects[1].undo_available, true);
});

test("candidate hashing is raw UTF-8 SHA-256 with an explicit version", async () => {
  const payload = await buildAtomicWorkspacePayload(
    "candidate.save",
    { candidate_code: "abc", note: "fixture" },
    context(),
  );
  const metadata = payload.effects[0].patch.metadata;
  assert.equal(
    metadata.candidate_hash,
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
  assert.equal(metadata.candidate_hash_version, "sha256-utf8-v1");
  assert.equal(metadata.preserved, true);
});

test("file intake is one payload with file, workspace, and receipt effects", async () => {
  const payload = await buildAtomicWorkspacePayload(
    "file.intake",
    {},
    context({
      intake: {
        project_id: "project-1",
        file_id: "file-9",
        filename: "src/example.ts",
        file_type: "ts",
        current_code: "export const ok = true;",
        current_hash: "a".repeat(64),
        metadata: {
          source_commit_sha: "b".repeat(40),
          verified_owner_repository: true,
        },
      },
    }),
  );
  assert.deepEqual(payload.effects.map((effect) => effect.kind), [
    "file_intake_upsert",
    "workspace_patch",
    "receipt_insert",
  ]);
});

test("undo uses the stored before image and consumes the original receipt", async () => {
  const payload = await buildAtomicWorkspacePayload(
    "undo.execute",
    { receipt_id: "receipt-1" },
    context({
      undo_receipt: {
        id: "receipt-1",
        record_type: "file",
        record_id: "file-1",
        before_data: {
          id: "file-1",
          owner_id: "owner-1",
          filename: "before.ts",
          current_code: "before",
          metadata: { stage: "before" },
        },
      },
      undo_record: current.file,
    }),
  );
  assert.equal(payload.undo_receipt_id, "receipt-1");
  assert.deepEqual(payload.effects.map((effect) => effect.kind), [
    "record_update",
    "receipt_update",
    "receipt_insert",
  ]);
  assert.equal(payload.effects[0].patch.id, undefined);
  assert.equal(payload.effects[0].patch.owner_id, undefined);
});

test("unadapted, external, and read-only actions fail closed with their real category", async () => {
  await assert.rejects(
    buildAtomicWorkspacePayload("code_god.review", {}, context()),
    /domain preparation is still required/,
  );
  await assert.rejects(
    buildAtomicWorkspacePayload("github.branch_create", {}, context()),
    /External reconciliation is required/,
  );
  await assert.rejects(
    buildAtomicWorkspacePayload("canvas.load_packet", {}, context()),
    /read-only/,
  );
});

test("coverage catalogue has no duplicates and leaves no hidden category", () => {
  const categories = Object.values(ATOMIC_ACTION_COVERAGE);
  const flattened = categories.flat();
  assert.equal(new Set(flattened).size, flattened.length);
  assert.deepEqual(ATOMIC_ACTION_COVERAGE.requires_domain_preparation, [
    "repo.prepare_handoff",
    "code_god.review",
    "github.writer_prepare",
  ]);
  assert.deepEqual(ATOMIC_ACTION_COVERAGE.external_reconciliation, [
    "code_labs.owner_activate_repository",
    "github.branch_create",
    "github.writer_execute",
  ]);
});
