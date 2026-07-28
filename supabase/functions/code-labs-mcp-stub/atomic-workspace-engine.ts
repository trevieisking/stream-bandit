import { Binding, rest } from "./oauth.ts";

type Row = Record<string, unknown>;

export type AtomicWorkspaceActionInput = {
  action: string;
  expected_state_version: number;
  payload: Row;
  fencing_token?: number | null;
};

export type AtomicWorkspaceActionResult = Row & {
  ok: boolean;
  action: string;
  operation_id: string;
  replayed: boolean;
  completed_state_version: number | null;
  fencing_token: number | null;
};

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Row)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalValue(value));
}

async function sha256Bytes(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

export async function sha256Hex(value: string) {
  return Array.from(
    await sha256Bytes(value),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

function uuidFromDigest(bytes: Uint8Array) {
  const copy = bytes.slice(0, 16);
  copy[6] = (copy[6] & 0x0f) | 0x50;
  copy[8] = (copy[8] & 0x3f) | 0x80;
  const hex = Array.from(copy, (byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function cleanAction(value: unknown) {
  const action = String(value || "").trim();
  if (!/^[a-z0-9_.]{3,80}$/.test(action)) {
    throw new Error("A valid Code Labs action is required.");
  }
  return action;
}

function cleanExpectedVersion(value: unknown) {
  const version = Number(value);
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error(
      "expected_state_version is required. Read the workspace again before writing.",
    );
  }
  return version;
}

function cleanFencingToken(value: unknown) {
  if (value == null) return null;
  const token = Number(value);
  if (!Number.isSafeInteger(token) || token < 1) {
    throw new Error("A valid fencing token is required for action recovery.");
  }
  return token;
}

function cleanPayload(value: unknown) {
  const text = canonicalJson(value || {});
  if (text.length > 2_000_000) throw new Error("Atomic action payload is too large.");
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Atomic action payload must be an object.");
  }
  return parsed as Row;
}

export async function atomicRequestHash(input: AtomicWorkspaceActionInput) {
  const action = cleanAction(input.action);
  const expected = cleanExpectedVersion(input.expected_state_version);
  const payload = cleanPayload(input.payload);
  return await sha256Hex(canonicalJson({ action, expected_state_version: expected, payload }));
}

export async function atomicOperationId(
  ownerId: string,
  input: AtomicWorkspaceActionInput,
) {
  const owner = String(ownerId || "").trim();
  if (!owner) throw new Error("Code Labs owner identity is required.");
  const requestHash = await atomicRequestHash(input);
  return uuidFromDigest(await sha256Bytes(`${owner}\n${requestHash}`));
}

function unwrapRpcObject(value: unknown): Row {
  let current = value;
  if (Array.isArray(current)) {
    if (current.length !== 1) {
      throw new Error("Atomic workspace RPC returned an ambiguous array.");
    }
    current = current[0];
  }
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    throw new Error("Atomic workspace RPC returned an invalid response.");
  }
  const row = current as Row;
  const values = Object.values(row);
  if (
    values.length === 1 && values[0] && typeof values[0] === "object" &&
    !Array.isArray(values[0])
  ) {
    return values[0] as Row;
  }
  return row;
}

function validateResult(
  value: Row,
  expectedAction: string,
  expectedOperationId: string,
): AtomicWorkspaceActionResult {
  const action = String(value.action || "");
  const operationId = String(value.operation_id || "");
  const replayed = value.replayed === true;
  const fencing = value.fencing_token == null ? null : Number(value.fencing_token);
  const completed = value.completed_state_version == null
    ? null
    : Number(value.completed_state_version);

  if (action !== expectedAction || operationId !== expectedOperationId) {
    throw new Error("Atomic workspace response identity did not match the request.");
  }
  if (fencing != null && (!Number.isSafeInteger(fencing) || fencing < 1)) {
    throw new Error("Atomic workspace response contained an invalid fencing token.");
  }
  if (completed != null && (!Number.isSafeInteger(completed) || completed < 2)) {
    throw new Error("Atomic workspace response contained an invalid completed version.");
  }

  const result = {
    ...value,
    ok: value.ok === true,
    action,
    operation_id: operationId,
    replayed,
    fencing_token: fencing,
    completed_state_version: completed,
  } as AtomicWorkspaceActionResult;

  if (!result.ok) {
    const message = String(value.error || "Atomic Code Labs action failed.").slice(0, 500);
    throw new Error(message);
  }
  if (result.completed_state_version == null || result.fencing_token == null) {
    throw new Error("Atomic workspace action completed without immutable proof.");
  }
  return result;
}

export async function executeAtomicWorkspaceAction(
  binding: Binding,
  input: AtomicWorkspaceActionInput,
) {
  const action = cleanAction(input.action);
  const expected = cleanExpectedVersion(input.expected_state_version);
  const payload = cleanPayload(input.payload);
  const fencingToken = cleanFencingToken(input.fencing_token);
  const normalized: AtomicWorkspaceActionInput = {
    action,
    expected_state_version: expected,
    payload,
    fencing_token: fencingToken,
  };
  const requestHash = await atomicRequestHash(normalized);
  const operationId = await atomicOperationId(binding.owner_id, normalized);

  const value = await rest("rpc/code_labs_execute_workspace_action", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: binding.owner_id,
      p_operation_id: operationId,
      p_action: action,
      p_expected_state_version: expected,
      p_request_hash: requestHash,
      p_payload: payload,
      p_fencing_token: fencingToken,
    }),
  });

  return validateResult(unwrapRpcObject(value), action, operationId);
}
