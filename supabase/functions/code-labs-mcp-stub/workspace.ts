import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";

type Row = Record<string, any>;
type RecordType = "project" | "file" | "job" | "packet" | "test";

const TABLES: Record<RecordType, string> = {
  project: "code_labs_projects",
  file: "code_labs_files",
  job: "code_labs_jobs",
  packet: "code_labs_packets",
  test: "code_labs_test_runs",
};

const STATE_KEYS: Record<RecordType, string> = {
  project: "current_project_id",
  file: "current_file_id",
  job: "current_job_id",
  packet: "current_packet_id",
  test: "current_test_run_id",
};

const ALLOWED_ACTIONS = [
  "setup.save",
  "project.select",
  "file.select",
  "job.select",
  "packet.select",
  "test.select",
  "file.replace_current",
  "repair.save",
  "packet.build",
  "canvas.load_packet",
  "canvas.save_candidate",
  "candidate.save",
  "candidate.accept",
  "test.record",
  "checkpoint.create",
  "github.prepare_request",
  "workflow.advance",
  "workflow.reset",
] as const;

function cleanObject(value: unknown, max = 350000) {
  const text = JSON.stringify(value || {});
  if (text.length > max) throw new Error("Payload is too large.");
  return JSON.parse(text);
}

function changed(before: Row, after: Row) {
  return Object.keys(after).filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]));
}

async function digest(value: unknown) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value ?? null)));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function latest(owner: string, table: string) {
  return one(table + "?select=*&owner_id=eq." + encodeURIComponent(owner) + "&order=created_at.desc&limit=1");
}

async function ensureState(owner: string) {
  let state = await one("code_labs_workspace_state?select=*&owner_id=eq." + encodeURIComponent(owner) + "&limit=1");
  if (state) return state;

  const project = await latest(owner, "code_labs_projects");
  const file = project
    ? await one("code_labs_files?select=*&owner_id=eq." + encodeURIComponent(owner) + "&project_id=eq." + encodeURIComponent(project.id) + "&order=updated_at.desc&limit=1")
    : null;
  const job = project
    ? await one("code_labs_jobs?select=*&owner_id=eq." + encodeURIComponent(owner) + "&project_id=eq." + encodeURIComponent(project.id) + "&order=updated_at.desc&limit=1")
    : null;
  const packet = project
    ? await one("code_labs_packets?select=*&owner_id=eq." + encodeURIComponent(owner) + "&project_id=eq." + encodeURIComponent(project.id) + "&order=created_at.desc&limit=1")
    : null;
  const test = project
    ? await one("code_labs_test_runs?select=*&owner_id=eq." + encodeURIComponent(owner) + "&project_id=eq." + encodeURIComponent(project.id) + "&order=created_at.desc&limit=1")
    : null;

  const saved = await rest("code_labs_workspace_state", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: owner,
      current_project_id: project?.id || null,
      current_file_id: file?.id || null,
      current_job_id: job?.id || null,
      current_packet_id: packet?.id || null,
      current_test_run_id: test?.id || null,
      workflow_step: "setup",
    }),
  });
  return saved[0];
}

async function patchState(owner: string, patch: Row, expected?: number) {
  const state = await ensureState(owner);
  if (expected != null && Number(expected) !== Number(state.state_version)) {
    throw new Error("Workspace state changed. Read the workspace again before writing.");
  }
  const body = {
    ...patch,
    state_version: Number(state.state_version || 0) + 1,
    updated_at: new Date().toISOString(),
  };
  const rows = await rest(
    "code_labs_workspace_state?owner_id=eq." + encodeURIComponent(owner) + "&state_version=eq." + encodeURIComponent(state.state_version),
    { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(body) },
  );
  if (!rows[0]) throw new Error("Workspace state changed before this write completed.");
  return rows[0];
}

async function selected(owner: string, type: RecordType) {
  const state = await ensureState(owner);
  const id = state[STATE_KEYS[type]];
  if (!id) throw new Error("No current " + type + " is selected.");
  const row = await one(
    TABLES[type] + "?select=*&id=eq." + encodeURIComponent(id) + "&owner_id=eq." + encodeURIComponent(owner) + "&limit=1",
  );
  if (!row) throw new Error("The selected " + type + " was not found.");
  return { state, row };
}

async function receipt(
  owner: string,
  action: string,
  type: string | null,
  id: string | null,
  before: Row,
  after: Row,
  created = false,
  undo = false,
) {
  const rows = await rest("code_labs_action_receipts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      owner_id: owner,
      action,
      record_type: type,
      record_id: id,
      before_data: before || {},
      after_data: after || {},
      changed_fields: changed(before || {}, after || {}),
      created_new_row: created,
      undo_available: undo,
    }),
  });
  const r = rows[0];
  return {
    receipt_id: r.id,
    action,
    record_type: type,
    record_id: id,
    before_hash: await digest(before),
    after_hash: await digest(after),
    changed_fields: r.changed_fields,
    created_new_row: created,
    undo_available: undo,
    completed_at: r.created_at,
  };
}

async function patchSelected(b: Binding, type: RecordType, fields: Row, allowed: string[], action: string) {
  const { row } = await selected(b.owner_id, type);
  const safe = cleanObject(fields);
  const patch: Row = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(safe, key)) patch[key] = safe[key];
  }
  if (!Object.keys(patch).length) throw new Error("No supported fields were provided.");
  if (type !== "packet" && type !== "test") patch.updated_at = new Date().toISOString();
  const rows = await rest(
    TABLES[type] + "?id=eq." + encodeURIComponent(row.id) + "&owner_id=eq." + encodeURIComponent(b.owner_id),
    { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) },
  );
  if (!rows[0]) throw new Error("The selected " + type + " could not be updated.");
  return {
    ok: true,
    version: VERSION,
    tool: action,
    record: rows[0],
    receipt: await receipt(b.owner_id, action, type, row.id, row, rows[0], false, true),
  };
}

export async function getWorkspace(b: Binding) {
  const s = await ensureState(b.owner_id);
  const [project, file, job, packet, test] = await Promise.all(
    (["project", "file", "job", "packet", "test"] as RecordType[]).map(async (type) =>
      s[STATE_KEYS[type]]
        ? one(TABLES[type] + "?select=*&id=eq." + encodeURIComponent(s[STATE_KEYS[type]]) + "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1")
        : null,
    ),
  );
  return { ok: true, version: VERSION, tool: "get_code_labs_workspace", workspace: s, current: { project, file, job, packet, test } };
}

export async function listRecords(b: Binding, args: Row) {
  const type = String(args.record_type || "") as RecordType;
  if (!TABLES[type]) throw new Error("record_type must be project, file, job, packet, or test.");
  const limit = Math.max(1, Math.min(Number(args.limit || 10), 50));
  const rows = await rest(TABLES[type] + "?select=*&owner_id=eq." + encodeURIComponent(b.owner_id) + "&order=created_at.desc&limit=" + limit);
  return { ok: true, version: VERSION, tool: "list_code_labs_records", record_type: type, records: rows };
}

export async function readCurrentFile(b: Binding) {
  const { row } = await selected(b.owner_id, "file");
  return { ok: true, version: VERSION, tool: "read_code_labs_current_file", file: row };
}

export function listActions() {
  return {
    ok: true,
    version: VERSION,
    tool: "list_code_labs_actions",
    actions: ALLOWED_ACTIONS.map((action) => ({ action, requires_confirmation: /checkpoint|github|candidate.accept/.test(action) })),
  };
}

export async function selectRecord(b: Binding, args: Row) {
  const type = String(args.record_type || "") as RecordType;
  if (!TABLES[type]) throw new Error("Unsupported record type.");
  const id = String(args.record_id || "");
  if (!id) throw new Error("record_id is required.");
  const row = await one(TABLES[type] + "?select=*&id=eq." + encodeURIComponent(id) + "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&limit=1");
  if (!row) throw new Error("Record not found.");
  const patch: Row = { [STATE_KEYS[type]]: id };
  if (type === "project") {
    patch.current_file_id = null;
    patch.current_job_id = null;
    patch.current_packet_id = null;
    patch.current_test_run_id = null;
  }
  const state = await patchState(b.owner_id, patch, args.expected_state_version);
  return {
    ok: true,
    version: VERSION,
    tool: "select_code_labs_record",
    record_type: type,
    record: row,
    workspace: state,
    receipt: await receipt(b.owner_id, type + ".select", "workspace", b.owner_id, {}, state, false, false),
  };
}

export async function updateProject(b: Binding, args: Row) {
  return patchSelected(b, "project", args.fields, ["workspace", "site_name", "site_url", "repo", "mode", "notes", "status", "metadata"], "update_code_labs_project");
}

export async function updateCurrentFile(b: Binding, args: Row) {
  const fields = cleanObject(args.fields);
  if (Object.prototype.hasOwnProperty.call(fields, "current_code")) {
    const code = String(fields.current_code ?? "");
    if (!code || code.length > 750000) throw new Error("current_code is required and must be under 750000 characters.");
    fields.current_hash = await digest(code);
  }
  return patchSelected(b, "file", fields, ["filename", "file_type", "current_code", "current_hash", "metadata"], "update_code_labs_current_file");
}

export async function updateJob(b: Binding, args: Row) {
  return patchSelected(b, "job", args.fields, ["file_id", "title", "problem", "dont_touch", "errors", "status", "started_at", "completed_at", "metadata"], "update_code_labs_repair_job");
}

export async function updatePacket(b: Binding, args: Row) {
  return patchSelected(b, "packet", args.fields, ["job_id", "packet_type", "packet_text", "metadata"], "upsert_code_labs_packet");
}

export async function updateTest(b: Binding, args: Row) {
  return patchSelected(b, "test", args.fields, ["job_id", "filename", "result", "checked_count", "total_count", "notes", "details"], "upsert_code_labs_test_result");
}

export async function saveCandidate(b: Binding, args: Row) {
  const candidateCode = String(args.candidate_code ?? "");
  if (!candidateCode || candidateCode.length > 750000) throw new Error("candidate_code is required and must be under 750000 characters.");
  const { row } = await selected(b.owner_id, "file");
  const metadata = cleanObject(row.metadata || {});
  metadata.fixed_output = candidateCode;
  metadata.candidate_hash = await digest(candidateCode);
  metadata.candidate_note = String(args.note || "").slice(0, 4000);
  metadata.candidate_saved_at = new Date().toISOString();
  return patchSelected(b, "file", { metadata }, ["metadata"], "save_code_labs_candidate");
}

export async function acceptCandidate(b: Binding, args: Row) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to accept the candidate.");
  const { row } = await selected(b.owner_id, "file");
  const metadata = cleanObject(row.metadata || {});
  const candidateCode = String(metadata.fixed_output || "");
  if (!candidateCode) throw new Error("No saved candidate is available.");
  metadata.candidate_accepted_at = new Date().toISOString();
  return updateCurrentFile(b, { fields: { current_code: candidateCode, metadata } });
}

export async function createCheckpoint(b: Binding, args: Row) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to create a checkpoint.");
  const { state, row: file } = await selected(b.owner_id, "file");
  if (!state.current_project_id) throw new Error("No project is selected.");
  const body = {
    owner_id: b.owner_id,
    project_id: state.current_project_id,
    job_id: state.current_job_id || null,
    file_id: file.id,
    version_kind: "checkpoint",
    label: String(args.label || "Checkpoint").slice(0, 200),
    filename: file.filename,
    code: file.current_code || "",
    note: String(args.note || "").slice(0, 4000),
    metadata: { source: "code-labs-v104-tool-only", state_version: state.state_version },
  };
  const rows = await rest("code_labs_versions", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(body) });
  return {
    ok: true,
    version: VERSION,
    tool: "create_code_labs_checkpoint",
    checkpoint: rows[0],
    receipt: await receipt(b.owner_id, "checkpoint.create", "version", rows[0].id, {}, rows[0], true, false),
  };
}

export async function readReceipt(b: Binding, args: Row) {
  const id = String(args.receipt_id || "");
  const path = "code_labs_action_receipts?select=*&owner_id=eq." + encodeURIComponent(b.owner_id) + (id ? "&id=eq." + encodeURIComponent(id) : "") + "&order=created_at.desc&limit=1";
  const row = await one(path);
  if (!row) throw new Error("Receipt not found.");
  return { ok: true, version: VERSION, tool: "read_code_labs_receipt", receipt: row };
}

export async function undoAction(b: Binding, args: Row) {
  const id = String(args.receipt_id || "");
  if (!id) throw new Error("receipt_id is required.");
  const r = await one("code_labs_action_receipts?select=*&id=eq." + encodeURIComponent(id) + "&owner_id=eq." + encodeURIComponent(b.owner_id) + "&undo_available=eq.true&undone_at=is.null&limit=1");
  if (!r) throw new Error("This receipt is not available for undo.");
  const type = String(r.record_type || "") as RecordType;
  if (!TABLES[type] || !r.record_id) throw new Error("This action cannot be undone.");
  const before = cleanObject(r.before_data);
  delete before.id;
  delete before.owner_id;
  delete before.created_at;
  const rows = await rest(TABLES[type] + "?id=eq." + encodeURIComponent(r.record_id) + "&owner_id=eq." + encodeURIComponent(b.owner_id), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(before),
  });
  if (!rows[0]) throw new Error("Undo failed.");
  await rest("code_labs_action_receipts?id=eq." + encodeURIComponent(id), {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ undone_at: new Date().toISOString(), undo_available: false }),
  });
  return {
    ok: true,
    version: VERSION,
    tool: "undo_code_labs_action",
    record: rows[0],
    receipt: await receipt(b.owner_id, "undo." + r.action, type, r.record_id, r.after_data, rows[0], false, false),
  };
}

export async function runAction(b: Binding, args: Row) {
  const action = String(args.action || "");
  if (!(ALLOWED_ACTIONS as readonly string[]).includes(action)) throw new Error("Unknown Code Labs action.");

  if (action === "workflow.reset") {
    const before = await ensureState(b.owner_id);
    const after = await patchState(b.owner_id, { workflow_step: "setup" }, args.expected_state_version);
    return { ok: true, version: VERSION, tool: "run_code_labs_action", workspace: after, receipt: await receipt(b.owner_id, action, "workspace", b.owner_id, before, after, false, true) };
  }

  if (action === "workflow.advance") {
    const before = await ensureState(b.owner_id);
    const order = ["setup", "project", "file", "repair", "packet", "candidate", "test", "checkpoint", "github"];
    const index = Math.max(0, order.indexOf(before.workflow_step));
    const after = await patchState(b.owner_id, { workflow_step: order[Math.min(index + 1, order.length - 1)] }, args.expected_state_version);
    return { ok: true, version: VERSION, tool: "run_code_labs_action", workspace: after, receipt: await receipt(b.owner_id, action, "workspace", b.owner_id, before, after, false, true) };
  }

  if (action.endsWith(".select")) {
    return selectRecord(b, { record_type: action.split(".")[0], record_id: args.record_id, expected_state_version: args.expected_state_version });
  }
  if (action === "setup.save") return updateProject(b, { fields: args.fields });
  if (action === "file.replace_current") return updateCurrentFile(b, { fields: args.fields });
  if (action === "repair.save") return updateJob(b, { fields: args.fields });
  if (action === "packet.build") return updatePacket(b, { fields: args.fields });
  if (action === "canvas.load_packet") return selected(b.owner_id, "packet").then(({ row }) => ({ ok: true, version: VERSION, tool: "run_code_labs_action", action, packet: row }));
  if (action === "canvas.save_candidate" || action === "candidate.save") return saveCandidate(b, args);
  if (action === "candidate.accept") return acceptCandidate(b, args);
  if (action === "test.record") return updateTest(b, { fields: args.fields });
  if (action === "checkpoint.create") return createCheckpoint(b, args);
  if (action === "github.prepare_request") {
    if (args.confirmed !== true) throw new Error("confirmed must be true to prepare a GitHub request.");
    return { ok: true, version: VERSION, tool: "run_code_labs_action", action, next_tool: "save_code_labs_write_request" };
  }
  throw new Error("Use the matching dedicated V104 tool for this action.");
}
