import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ATOMIC_ACTION_COVERAGE,
  buildAtomicWorkspacePayload,
} from "./atomic-workspace-actions.mjs";

const now = "2026-09-15T13:15:00.000Z";
const planHash = "a".repeat(64);
const plan = {
  id: "plan-1",
  filename: "code-labs/CODE-LABS-V1-PLAN.md",
  current_hash: planHash,
  updated_at: now,
  metadata: { preserved: true, exact_checklist: { stale: true } },
};
const exactChecklist = {
  checklist_id: "checklist-1",
  checklist_version: 4,
  plan_record_id: "plan-1",
  plan_revision: 9,
  source_hash: planHash,
  checklist_scope_state: "HOLD",
  items: [{ id: "exact-head", state: "PASS" }],
};
const projection = {
  version: "V1-master-checklist-evidence-projection",
  authority: "read-only-evidence-projection",
  writer_authority: false,
  promotion_authority: false,
  workspace_state_version: 17,
  exact_checklist: exactChecklist,
};

function context(overrides = {}) {
  return {
    now,
    plan,
    checklist_projection: projection,
    ...overrides,
  };
}

test("checklist persistence uses one Master Plan metadata update and one undoable receipt", async () => {
  const payload = await buildAtomicWorkspacePayload(
    "checklist.persist_projection",
    { fields: { exact_checklist: { attacker_supplied: true } } },
    context(),
  );

  assert.deepEqual(payload.effects.map((effect) => effect.kind), [
    "record_update",
    "receipt_insert",
  ]);
  const update = payload.effects[0];
  assert.equal(update.record_type, "file");
  assert.equal(update.record_id, "plan-1");
  assert.equal(update.expected_updated_at, now);
  assert.equal(update.patch.metadata.preserved, true);
  assert.deepEqual(update.patch.metadata.exact_checklist, exactChecklist);
  assert.equal(update.patch.metadata.exact_checklist.attacker_supplied, undefined);

  const receipt = payload.effects[1];
  assert.equal(receipt.record_type, "file");
  assert.equal(receipt.record_id, "plan-1");
  assert.deepEqual(receipt.changed_fields, ["metadata"]);
  assert.equal(receipt.undo_available, true);
  assert.equal(payload.response.action, "checklist.persist_projection");
  assert.equal(payload.response.mutation_engine, "atomic-v50");
});

test("checklist persistence is an adapted atomic action", () => {
  assert.equal(
    ATOMIC_ACTION_COVERAGE.adapted.includes("checklist.persist_projection"),
    true,
  );
});

test("checklist persistence rejects authority-bearing or malformed projections", async () => {
  for (const bad of [
    { ...projection, authority: "writer-authority" },
    { ...projection, writer_authority: true },
    { ...projection, promotion_authority: true },
    { ...projection, version: "future-unreviewed-version" },
    { ...projection, exact_checklist: { ...exactChecklist, items: null } },
  ]) {
    await assert.rejects(
      buildAtomicWorkspacePayload(
        "checklist.persist_projection",
        {},
        context({ checklist_projection: bad }),
      ),
    );
  }
});

test("checklist persistence rejects a projection bound to another plan or source hash", async () => {
  await assert.rejects(
    buildAtomicWorkspacePayload(
      "checklist.persist_projection",
      {},
      context({
        checklist_projection: {
          ...projection,
          exact_checklist: { ...exactChecklist, plan_record_id: "plan-2" },
        },
      }),
    ),
    /not bound to this Master Plan/,
  );

  await assert.rejects(
    buildAtomicWorkspacePayload(
      "checklist.persist_projection",
      {},
      context({
        checklist_projection: {
          ...projection,
          exact_checklist: { ...exactChecklist, source_hash: "b".repeat(64) },
        },
      }),
    ),
    /not bound to this Master Plan/,
  );
});

test("guarded workspace derives checklist persistence input from the server projection and exact workspace version", async () => {
  const source = await readFile(new URL("./guarded-workspace.ts", import.meta.url), "utf8");
  assert.match(source, /"checklist\.persist_projection"/);
  assert.match(source, /getContext\(b, 25\)/);
  assert.match(source, /projection\.version !== MASTER_CHECKLIST_PROJECTION_VERSION/);
  assert.match(source, /projection\.authority !== "read-only-evidence-projection"/);
  assert.match(source, /projection\.writer_authority !== false/);
  assert.match(source, /projection\.promotion_authority !== false/);
  assert.match(source, /Number\(projection\.workspace_state_version\) !== expected/);
  assert.match(source, /code-labs\/CODE-LABS-V1-PLAN\.md/);
  assert.match(source, /return executeAtomicWorkspaceAction\(b,/);

  const helper = source.match(/async function prepareChecklistProjectionContext[\s\S]*?\n}\n\nasync function prepareFileIntakeContext/);
  assert.ok(helper, "The checklist projection context helper must remain inspectable.");
  assert.doesNotMatch(helper[0], /args\.fields/);
  assert.doesNotMatch(helper[0], /rest\([^)]*method:\s*"(?:POST|PATCH|PUT|DELETE)"/);
});

test("forward migration extends only the existing atomic record/receipt policy and exact Master Plan metadata gate", async () => {
  const migration = await readFile(
    new URL("../../migrations/20260915130500_code_labs_checklist_projection_atomic_persistence.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /code_labs_effect_allowed\(text,text\)/);
  assert.match(migration, /code_labs_apply_record_patch\(uuid,text,text,uuid,timestamptz,jsonb\)/);
  assert.equal(migration.includes("''checklist.persist_projection'',\\n      ''undo.execute''\\n    )\\n    when ''file_intake_upsert''"), true);
  assert.equal(migration.includes("''checklist.persist_projection'',\\n      ''undo.execute''\\n    )\\n    else false"), true);
  assert.match(migration, /p_action not in \(''undo\.execute'', ''checklist\.persist_projection''\)/);
  assert.match(migration, /code-labs\/CODE-LABS-V1-PLAN\.md/);
  assert.match(migration, /p_patch->''metadata''->''exact_checklist''->>''plan_record_id''/);
  assert.match(migration, /p_patch->''metadata''->''exact_checklist''->>''source_hash''/);
  assert.match(migration, /p_patch->''metadata'', ''\{\}''::jsonb\) - ''exact_checklist''/);
  assert.doesNotMatch(migration, /create or replace function/i);
  assert.doesNotMatch(migration, /when ''write_request_insert'' then p_action = ''checklist\.persist_projection''/);
});
