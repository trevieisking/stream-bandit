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

async function latest(owner: string, table: string, filters = "") {
  return one(table + "?select=*&owner_id=eq." + encodeURIComponent(owner) + filters + "&order=created_at.desc&limit=1");
}

async function owned(owner: string, type: RecordType, id: unknown) {
  const value = String(id || "");
  if (!value) return null;
  return one(TABLES[type] + "?select=*&id=eq." + encodeURIComponent(value) + "&owner_id=eq." + encodeURIComponent(owner) + "&limit=1");
}

function requireProjectMatch(row: Row | null, projectId: string, label: string) {
  if (!row) throw new Error("The selected " + label + " was not found.");
  if (String(row.project_id || "") !== projectId) {
    throw new Error("The selected " + label + " does not belong to the selected project.");
  }
  return row;
}

async function linkedFile(owner: string, projectId: string, fileId: unknown) {
  return requireProjectMatch(await owned(owner, "file", fileId), projectId, "file");
}

async function linkedJob(owner: string, projectId: string, jobId: unknown) {
  const job = requireProjectMatch(await owned(owner, "job", jobId), projectId, "job");
  const file = await linkedFile(owner, projectId, job.file_id);
  return { job, file };
}

async function ensureState(owner: string) {
  let state = await one("code_labs_workspace_state?select=*&owner_id=eq." + encodeURIComponent(owner) + "&limit=1");
  if (state) return state;

  const project = await latest(owner, "code_labs_projects");
  const projectFilter = project ? "&project_id=eq." + encodeURIComponent(project.id) : "";
  const file = project ? await latest(owner, "code_labs_files", projectFilter) : null;
  const job = project && file
    ? await latest(owner, "code_labs_jobs", projectFilter + "&file_id=eq." + encodeURIComponent(file.id))
    : null;
  const packet = project && job
    ? await latest(owner, "code_labs_packets", projectFilter + "&job_id=eq." + encodeURIComponent(job.id))
    : null;
  const test = project && job
    ? await latest(owner, "code_labs_test_runs", projectFilter + "&job_id=eq." + encodeURIComponent(job.id))
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

async function hierarchy(owner: string, state: Row) {
  const project = state.current_project_id ? await owned(owner, "project", state.current_project_id) : null;
  if (!project) {
    if (state.current_file_id || state.current_job_id || state.current_packet_id || state.current_test_run_id) {
      throw new Error("The workspace contains child selections without a valid selected project.");
    }
    return { project: null, file: null, job: null, packet: null, test: null };
  }
  const projectId = String(project.id);
  const file = state.current_file_id
    ? requireProjectMatch(await owned(owner, "file", state.current_file_id), projectId, "file")
    : null;
  const job = state.current_job_id
    ? requireProjectMatch(await owned(owner, "job", state.current_job_id), projectId, "job")
    : null;
  if (job) {
    if (!file || String(job.file_id || "") !== String(file.id)) {
      throw new Error("The selected job is not linked to the selected file.");
    }
  }
  const packet = state.current_packet_id
    ? requireProjectMatch(await owned(owner, "packet", state.current_packet_id), projectId, "packet")
    : null;
  if (packet && (!job || String(packet.job_id || "") !== String(job.id))) {
    throw new Error("The selected packet is not linked to the selected job.");
  }
  const test = state.current_test_run_id
    ? requireProjectMatch(await owned(owner, "test", state.current_test_run_id), projectId, "test")
    : null;
  if (test && (!job || String(test.job_id || "") !== String(job.id))) {
    throw new Error("The selected test is not linked to the selected job.");
  }
  return { project, file, job, packet, test };
}

async function selected(owner: string, type: RecordType) {
  const state = await ensureState(owner);
  const current = await hierarchy(owner, state);
  const row = current[type];
  if (!row) throw new Error("No current " + type + " is selected.");
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
  const { state, row } = await selected(b.owner_id, type);
  const safe = cleanObject(fields);
  const patch: Row = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(safe, key)) patch[key] = safe[key];
  }
  if (!Object.keys(patch).length) throw new Error("No supported fields were provided.");
  if (type !== "project" && String(row.project_id || "") !== String(state.current_project_id || "")) {
    throw new Error("The selected " + type + " does not belong to the selected project.");
  }
  if (type !== "packet" && type !== "test") patch.updated_at = new Date().toISOString();
  const projectFilter = type === "project" ? "" : "&project_id=eq." + encodeURIComponent(state.current_project_id);
  const rows = await rest(
    TABLES[type] + "?id=eq." + encodeURIComponent(row.id) + "&owner_id=eq." + encodeURIComponent(b.owner_id) + projectFilter,
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
  const state = await ensureState(b.owner_id);
  const current = await hierarchy(b.owner_id, state);
  return { ok: true, version: VERSION, tool: "get_code_labs_workspace", workspace: state, current };
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
  const before = await ensureState(b.owner_id);
  if (Number(args.expected_state_version) !== Number(before.state_version)) {
    throw new Error("Workspace state changed. Read the workspace again before writing.");
  }
  const row = await owned(b.owner_id, type, id);
  if (!row) throw new Error("Record not found.");
  const patch: Row = {};

  if (type === "project") {
    patch.current_project_id = row.id;
    patch.current_file_id = null;
    patch.current_job_id = null;
    patch.current_packet_id = null;
    patch.current_test_run_id = null;
  } else {
    const projectId = String(before.current_project_id || "");
    if (!projectId || !await owned(b.owner_id, "project", projectId)) {
      throw new Error("Select a valid project before selecting child records.");
    }
    requireProjectMatch(row, projectId, type);
    if (type === "file") {
      patch.current_file_id = row.id;
      patch.current_job_id = null;
      patch.current_packet_id = null;
      patch.current_test_run_id = null;
    }
    if (type === "job") {
      const file = await linkedFile(b.owner_id, projectId, row.file_id);
      patch.current_file_id = file.id;
      patch.current_job_id = row.id;
      patch.current_packet_id = null;
      patch.current_test_run_id = null;
    }
    if (type === "packet") {
      const linked = await linkedJob(b.owner_id, projectId, row.job_id);
      patch.current_file_id = linked.file.id;
      patch.current_job_id = linked.job.id;
      patch.current_packet_id = row.id;
      patch.current_test_run_id = null;
    }
    if (type === "test") {
      const linked = await linkedJob(b.owner_id, projectId, row.job_id);
      const packet = before.current_packet_id ? await owned(b.owner_id, "packet", before.current_packet_id) : null;
      patch.current_file_id = linked.file.id;
      patch.current_job_id = linked.job.id;
      patch.current_packet_id = packet && String(packet.project_id || "") === projectId && String(packet.job_id || "") === String(linked.job.id)
        ? packet.id
        : null;
      patch.current_test_run_id = row.id;
    }
  }

  const state = await patchState(b.owner_id, patch, args.expected_state_version);
  return {
    ok: true,
    version: VERSION,
    tool: "select_code_labs_record",
    record_type: type,
    record: row,
    workspace: state,
    receipt: await receipt(b.owner_id, type + ".select", "workspace", b.owner_id, before, state, false, false),
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
  const fields = cleanObject(args.fields);
  const state = await ensureState(b.owner_id);
  if (!state.current_project_id) throw new Error("Select a project before updating a job.");
  if (Object.prototype.hasOwnProperty.call(fields, "file_id")) {
    await linkedFile(b.owner_id, String(state.current_project_id), fields.file_id);
  }
  return patchSelected(b, "job", fields, ["file_id", "title", "problem", "dont_touch", "errors", "status", "started_at", "completed_at", "metadata"], "update_code_labs_repair_job");
}

export async function updatePacket(b: Binding, args: Row) {
  const fields = cleanObject(args.fields);
  const state = await ensureState(b.owner_id);
  if (!state.current_project_id) throw new Error("Select a project before updating a packet.");
  if (Object.prototype.hasOwnProperty.call(fields, "job_id")) {
    await linkedJob(b.owner_id, String(state.current_project_id), fields.job_id);
  }
  return patchSelected(b, "packet", fields, ["job_id", "packet_type", "packet_text", "metadata"], "upsert_code_labs_packet");
}

export async function updateTest(b: Binding, args: Row) {
  const fields = cleanObject(args.fields);
  const state = await ensureState(b.owner_id);
  if (!state.current_project_id) throw new Error("Select a project before updating a test.");
  if (Object.prototype.hasOwnProperty.call(fields, "job_id")) {
    await linkedJob(b.owner_id, String(state.current_project_id), fields.job_id);
  }
  return patchSelected(b, "test", fields, ["job_id", "filename", "result", "checked_count", "total_count", "notes", "details"], "upsert_code_labs_test_result");
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
    const order = [
      "setup",
      "project",
      "file",
      "repair",
      "packet",
      "candidate",
      "test",
      "checkpoint",
      "repo",
      "cg_repair_lab",
      "code_god",
      "github_writer",
      "github_tracker",
    ];
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
