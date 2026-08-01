const HASH_VERSION = "sha256-utf8-v1";

export const ATOMIC_ACTION_COVERAGE = Object.freeze({
  adapted: Object.freeze([
    "file.intake",
    "setup.save",
    "project.select",
    "file.select",
    "job.select",
    "packet.select",
    "test.select",
    "file.replace_current",
    "repair.save",
    "packet.build",
    "canvas.save_candidate",
    "candidate.save",
    "candidate.accept",
    "test.record",
    "checkpoint.create",
    "workflow.advance",
    "workflow.reset",
    "undo.execute",
  ]),
  requires_domain_preparation: Object.freeze([
    "repo.prepare_handoff",
    "code_god.review",
    "github.writer_prepare",
  ]),
  external_reconciliation: Object.freeze([
    "code_labs.owner_activate_repository",
    "github.branch_create",
    "github.writer_execute",
  ]),
  read_only: Object.freeze([
    "canvas.load_packet",
    "github.prepare_request",
    "cg_repair_lab.access",
    "cg_repair_lab.analyze",
    "backend.tables_snapshot",
  ]),
});

const RECORD_FIELDS = Object.freeze({
  project: Object.freeze([
    "workspace", "site_name", "site_url", "repo", "mode", "notes",
    "status", "metadata",
  ]),
  file_replace: Object.freeze(["filename", "file_type", "current_code", "metadata"]),
  job: Object.freeze([
    "file_id", "title", "problem", "dont_touch", "errors", "status",
    "started_at", "completed_at", "metadata",
  ]),
  packet: Object.freeze(["job_id", "packet_type", "packet_text", "metadata"]),
  test: Object.freeze([
    "job_id", "filename", "result", "checked_count", "total_count",
    "notes", "details",
  ]),
  undo_project: Object.freeze([
    "workspace", "site_name", "site_url", "repo", "mode", "notes",
    "status", "metadata",
  ]),
  undo_file: Object.freeze(["filename", "file_type", "current_code", "metadata"]),
  undo_job: Object.freeze([
    "file_id", "title", "problem", "dont_touch", "errors", "status",
    "started_at", "completed_at", "metadata",
  ]),
  undo_packet: Object.freeze(["job_id", "packet_type", "packet_text", "metadata"]),
  undo_test: Object.freeze([
    "job_id", "filename", "result", "checked_count", "total_count",
    "notes", "details",
  ]),
});

const UPDATE_ACTIONS = Object.freeze({
  "setup.save": { recordType: "project", currentKey: "project", fields: RECORD_FIELDS.project },
  "file.replace_current": { recordType: "file", currentKey: "file", fields: RECORD_FIELDS.file_replace },
  "repair.save": { recordType: "job", currentKey: "job", fields: RECORD_FIELDS.job },
  "packet.build": { recordType: "packet", currentKey: "packet", fields: RECORD_FIELDS.packet },
  "test.record": { recordType: "test", currentKey: "test", fields: RECORD_FIELDS.test },
});

const SELECT_ACTIONS = new Set([
  "project.select", "file.select", "job.select", "packet.select", "test.select",
]);

function row(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function text(value, label, max = 750000) {
  const output = String(value ?? "");
  if (!output || output.length > max) throw new Error(`${label} is required.`);
  return output;
}

function identifier(value, label) {
  const output = String(value || "").trim();
  if (!output) throw new Error(`${label} is required.`);
  return output;
}

function timestamp(value, label) {
  const output = String(value || "").trim();
  if (!output || Number.isNaN(Date.parse(output))) throw new Error(`${label} is required.`);
  return output;
}

function clone(value) {
  if (value === null) return null;
  return JSON.parse(JSON.stringify(value ?? {}));
}

function cleanPatch(value, allowed) {
  const input = row(value, "fields");
  const patch = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(input, key)) patch[key] = clone(input[key]);
  }
  if (!Object.keys(patch).length) throw new Error("No supported fields were provided.");
  return patch;
}

async function hashUtf8(value) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value ?? "")),
  );
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function receiptEffect({ recordType = null, recordId = null, changedFields = [], undoAvailable = false }) {
  return {
    kind: "receipt_insert",
    key: "receipt",
    record_type: recordType,
    record_id: recordId,
    changed_fields: [...changedFields],
    created_new_row: false,
    undo_available: undoAvailable,
  };
}

function response(action) {
  return { tool: "run_code_labs_action", action, mutation_engine: "atomic-v50" };
}

function selectedCurrent(context, key) {
  return row(row(context.current, "current workspace records")[key], `selected ${key}`);
}

function recordUpdatePayload(action, args, context) {
  const config = UPDATE_ACTIONS[action];
  const current = selectedCurrent(context, config.currentKey);
  const patch = cleanPatch(args.fields, config.fields);
  const recordId = identifier(current.id, `${config.recordType} id`);
  const expectedUpdatedAt = timestamp(current.updated_at, `${config.recordType} updated_at`);

  return {
    effects: [
      {
        kind: "record_update",
        key: "record",
        record_type: config.recordType,
        record_id: recordId,
        expected_updated_at: expectedUpdatedAt,
        patch,
      },
      receiptEffect({
        recordType: config.recordType,
        recordId,
        changedFields: Object.keys(patch),
        undoAvailable: true,
      }),
    ],
    response: response(action),
  };
}

async function candidatePayload(action, args, context, now) {
  const current = selectedCurrent(context, "file");
  const candidateCode = text(args.candidate_code ?? args.fields?.candidate_code, "candidate_code");
  const metadata = clone(current.metadata || {});
  metadata.fixed_output = candidateCode;
  metadata.candidate_hash = await hashUtf8(candidateCode);
  metadata.candidate_hash_version = HASH_VERSION;
  metadata.candidate_note = String(args.note ?? args.fields?.note ?? "").slice(0, 4000);
  metadata.candidate_saved_at = now;

  return {
    effects: [
      {
        kind: "record_update",
        key: "record",
        record_type: "file",
        record_id: identifier(current.id, "file id"),
        expected_updated_at: timestamp(current.updated_at, "file updated_at"),
        patch: { metadata },
      },
      receiptEffect({
        recordType: "file",
        recordId: String(current.id),
        changedFields: ["metadata"],
        undoAvailable: true,
      }),
    ],
    response: response(action),
  };
}

function candidateAcceptPayload(args, context, now) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to accept the candidate.");
  const current = selectedCurrent(context, "file");
  const metadata = clone(current.metadata || {});
  const candidateCode = text(metadata.fixed_output, "saved candidate");
  metadata.candidate_accepted_at = now;

  return {
    effects: [
      {
        kind: "record_update",
        key: "record",
        record_type: "file",
        record_id: identifier(current.id, "file id"),
        expected_updated_at: timestamp(current.updated_at, "file updated_at"),
        patch: { current_code: candidateCode, metadata },
      },
      receiptEffect({
        recordType: "file",
        recordId: String(current.id),
        changedFields: ["current_code", "metadata"],
        undoAvailable: true,
      }),
    ],
    response: response("candidate.accept"),
  };
}

function selectionPayload(action, args) {
  return {
    effects: [
      {
        kind: "workspace_select",
        key: "record",
        record_id: identifier(args.record_id ?? args.fields?.record_id, "record_id"),
      },
      receiptEffect({ changedFields: ["workspace", "state_version"] }),
    ],
    response: response(action),
  };
}

function workflowPayload(action) {
  return {
    effects: [
      { kind: "workflow_move", key: "workspace" },
      receiptEffect({ changedFields: ["workflow_step", "state_version"] }),
    ],
    response: response(action),
  };
}

function checkpointPayload(args) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to create a checkpoint.");
  return {
    effects: [
      {
        kind: "checkpoint_insert",
        key: "checkpoint",
        label: String(args.label || "Checkpoint").slice(0, 200),
        note: String(args.note || "").slice(0, 4000),
      },
      receiptEffect({ changedFields: ["checkpoint"] }),
    ],
    response: response("checkpoint.create"),
  };
}

function fileIntakePayload(args, context) {
  const intake = row(context.intake, "verified File Lab intake");
  const currentHash = identifier(intake.current_hash, "current_hash").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(currentHash)) throw new Error("A canonical File Lab content hash is required.");
  const metadata = clone(intake.metadata || {});
  if (metadata.verified_owner_repository !== true) {
    throw new Error("Verified owner-repository provenance is required.");
  }

  return {
    effects: [
      {
        kind: "file_intake_upsert",
        key: "file",
        project_id: identifier(intake.project_id, "project_id"),
        file_id: identifier(intake.file_id, "file_id"),
        filename: identifier(intake.filename, "filename"),
        file_type: String(intake.file_type || "text").slice(0, 20),
        current_code: text(intake.current_code, "current_code"),
        current_hash: currentHash,
        metadata,
      },
      {
        kind: "workspace_patch",
        key: "workspace",
        current_file_id: String(intake.file_id),
      },
      receiptEffect({
        recordType: "file",
        recordId: String(intake.file_id),
        changedFields: ["file", "workspace", "state_version"],
      }),
    ],
    response: response("file.intake"),
  };
}

function undoFields(recordType) {
  const fields = RECORD_FIELDS[`undo_${recordType}`];
  if (!fields) throw new Error("This receipt record type cannot be undone atomically.");
  return fields;
}

function undoPayload(args, context) {
  const undoReceipt = row(context.undo_receipt, "undo receipt");
  const recordType = identifier(undoReceipt.record_type, "undo record type");
  const recordId = identifier(undoReceipt.record_id, "undo record id");
  const current = row(context.undo_record, "current undo record");
  if (String(current.id || "") !== recordId) throw new Error("Undo record identity mismatch.");
  const patch = cleanPatch(undoReceipt.before_data, undoFields(recordType));

  return {
    undo_receipt_id: identifier(args.receipt_id ?? undoReceipt.id, "receipt_id"),
    effects: [
      {
        kind: "record_update",
        key: "record",
        record_type: recordType,
        record_id: recordId,
        expected_updated_at: timestamp(current.updated_at, "undo record updated_at"),
        patch,
      },
      {
        kind: "receipt_update",
        key: "undone_receipt",
        receipt_id: String(undoReceipt.id),
      },
      receiptEffect({
        recordType,
        recordId,
        changedFields: Object.keys(patch),
      }),
    ],
    response: response("undo.execute"),
  };
}

export async function buildAtomicWorkspacePayload(actionValue, argsValue, contextValue) {
  const action = identifier(actionValue, "action");
  const args = row(argsValue || {}, "action arguments");
  const context = row(contextValue || {}, "action context");
  const now = timestamp(context.now, "context now");

  if (!ATOMIC_ACTION_COVERAGE.adapted.includes(action)) {
    if (ATOMIC_ACTION_COVERAGE.requires_domain_preparation.includes(action)) {
      throw new Error(`Atomic domain preparation is still required for ${action}.`);
    }
    if (ATOMIC_ACTION_COVERAGE.external_reconciliation.includes(action)) {
      throw new Error(`External reconciliation is required for ${action}.`);
    }
    if (ATOMIC_ACTION_COVERAGE.read_only.includes(action)) {
      throw new Error(`${action} is read-only and must not enter the mutation engine.`);
    }
    throw new Error("Unknown Code Labs action.");
  }

  if (SELECT_ACTIONS.has(action)) return selectionPayload(action, args);
  if (action === "workflow.advance" || action === "workflow.reset") return workflowPayload(action);
  if (UPDATE_ACTIONS[action]) return recordUpdatePayload(action, args, context);
  if (action === "canvas.save_candidate" || action === "candidate.save") {
    return await candidatePayload(action, args, context, now);
  }
  if (action === "candidate.accept") return candidateAcceptPayload(args, context, now);
  if (action === "checkpoint.create") return checkpointPayload(args);
  if (action === "file.intake") return fileIntakePayload(args, context);
  if (action === "undo.execute") return undoPayload(args, context);

  throw new Error(`Atomic adapter is missing for ${action}.`);
}
