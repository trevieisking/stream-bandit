import type { Binding } from "../code-labs-mcp-stub/oauth.ts";
import { rest } from "../code-labs-mcp-stub/oauth.ts";
import { verifyOwnerRepository } from "../code-labs-mcp-stub/github-authority.ts";

type Row = Record<string, any>;
type OperationType = "branch_create" | "file_create" | "file_update" | "draft_pr_create";

const VERSION = "Code Labs V105 independent GitHub operations V1";
const API = "https://api.github.com";
const API_VERSION = "2022-11-28";
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);
const SHA1 = /^[a-f0-9]{40}$/i;
const SHA256 = /^[a-f0-9]{64}$/i;
const MAX_CONTENT_BYTES = 750000;

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Row)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cleanOperationKey(value: unknown) {
  const key = String(value || "").trim();
  if (!/^[A-Za-z0-9._:-]{8,200}$/.test(key)) {
    throw new Error("operation_key must be a stable 8-200 character operation identity.");
  }
  return key;
}

function cleanRepo(value: unknown) {
  const repo = String(value || "").trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("A repository in owner/name form is required.");
  }
  return repo;
}

function cleanRef(value: unknown, label = "ref") {
  const ref = String(value || "").trim();
  if (!ref || ref.length > 200 || /[\u0000-\u001f\u007f]/.test(ref)) {
    throw new Error(`A safe GitHub ${label} is required.`);
  }
  return ref;
}

function cleanBranch(value: unknown, defaultBranch?: string) {
  const branch = String(value || "").trim();
  if (!/^[A-Za-z0-9._/-]{3,120}$/.test(branch) || PROTECTED.has(branch.toLowerCase())) {
    throw new Error("A non-protected GitHub branch is required.");
  }
  if (defaultBranch && branch.toLowerCase() === defaultBranch.toLowerCase()) {
    throw new Error("The GitHub operation branch cannot be the repository default branch.");
  }
  return branch;
}

function cleanPath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (
    !path || path.length > 500 || path.includes("..") || path.includes("\\") ||
    path.startsWith(".") || path.startsWith(".github/") ||
    /(?:^|\/)(?:secrets?|\.env[^/]*)$/i.test(path) ||
    /\.(?:pem|key|p12|pfx)$/i.test(path)
  ) throw new Error("A safe repository-relative file path is required.");
  return path;
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function bytesToBase64(value: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < value.length; offset += 0x8000) {
    binary += String.fromCharCode(...value.subarray(offset, Math.min(offset + 0x8000, value.length)));
  }
  return btoa(binary);
}

function base64ToText(value: string) {
  const binary = atob(String(value || "").replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function safeText(value: unknown, max: number) {
  return String(value || "").slice(0, max);
}

function contentInput(args: Row) {
  const content = String(args.content ?? "");
  const size = new TextEncoder().encode(content).length;
  if (!content || size > MAX_CONTENT_BYTES) {
    throw new Error(`Complete file content is required and must be at most ${MAX_CONTENT_BYTES} bytes.`);
  }
  const expectedHash = String(args.content_hash || "").toLowerCase();
  if (!SHA256.test(expectedHash)) throw new Error("content_hash must be a lowercase SHA-256 value.");
  return { content, size, expectedHash };
}

async function githubApi(path: string, token: string, init: RequestInit = {}, allow404 = false) {
  const response = await fetch(API + path, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "code-labs-v105-unified",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
  if (allow404 && response.status === 404) return null;
  if (!response.ok) throw new Error("The verified GitHub request failed with status " + response.status + ".");
  return payload;
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

function publicOperation(row: Row) {
  return {
    operation_key: row.operation_key,
    operation_type: row.operation_type,
    request_hash: row.request_hash,
    repo: row.repo,
    branch: row.branch,
    base_ref: row.base_ref || null,
    path: row.path || null,
    expected_blob_sha: row.expected_blob_sha || null,
    content_hash: row.content_hash || null,
    status: row.status,
    attempt_count: Number(row.attempt_count || 0),
    result: row.result || {},
    error: row.error || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at || null,
  };
}

async function requestHash(type: OperationType, request: Row) {
  return sha256(JSON.stringify(canonical({ operation_type: type, ...request })));
}

async function ensureOperation(binding: Binding, type: OperationType, input: Row) {
  const operationKey = cleanOperationKey(input.operation_key);
  const immutable = {
    repo: cleanRepo(input.repo),
    branch: String(input.branch || ""),
    base_ref: input.base_ref == null ? null : String(input.base_ref),
    path: input.path == null ? null : String(input.path),
    expected_blob_sha: input.expected_blob_sha == null ? null : String(input.expected_blob_sha).toLowerCase(),
    content_hash: input.content_hash == null ? null : String(input.content_hash).toLowerCase(),
    content: input.content == null ? null : String(input.content),
    commit_message: input.commit_message == null ? null : safeText(input.commit_message, 240),
    pr_title: input.pr_title == null ? null : safeText(input.pr_title, 240),
    pr_body: input.pr_body == null ? null : safeText(input.pr_body, 20000),
  };
  const hash = await requestHash(type, immutable);
  const body = {
    owner_id: binding.owner_id,
    operation_key: operationKey,
    operation_type: type,
    request_hash: hash,
    ...immutable,
    status: "queued",
  };
  await rest("code_labs_github_operations?on_conflict=owner_id,operation_key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
  const row = await one(
    "code_labs_github_operations?select=*&owner_id=eq." + encodeURIComponent(binding.owner_id) +
      "&operation_key=eq." + encodeURIComponent(operationKey) + "&limit=1",
  );
  if (!row || row.request_hash !== hash || row.operation_type !== type) {
    throw new Error("The durable GitHub operation identity conflicts with different input.");
  }
  return { row, operationKey, hash };
}

async function claimOperation(binding: Binding, operationKey: string, hash: string, claimId: string) {
  const value = await rest("rpc/code_labs_claim_github_operation", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: binding.owner_id,
      p_operation_key: operationKey,
      p_request_hash: hash,
      p_claim_id: claimId,
    }),
  });
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || row.operation_key !== operationKey) throw new Error("The V105 GitHub operation claim failed.");
  return row as Row;
}

async function completeOperation(binding: Binding, operationKey: string, claimId: string, result: Row) {
  const value = await rest("rpc/code_labs_complete_github_operation", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: binding.owner_id,
      p_operation_key: operationKey,
      p_claim_id: claimId,
      p_result: result,
    }),
  });
  return (Array.isArray(value) ? value[0] : value) as Row;
}

async function failOperation(binding: Binding, operationKey: string, claimId: string, error: unknown) {
  try {
    await rest("rpc/code_labs_fail_github_operation", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        p_owner_id: binding.owner_id,
        p_operation_key: operationKey,
        p_claim_id: claimId,
        p_error: error instanceof Error ? error.message : String(error),
      }),
    });
  } catch (_) {
    // Preserve the original failure; the durable operation remains inspectable.
  }
}

async function executeDurable(
  binding: Binding,
  type: OperationType,
  input: Row,
  execute: (row: Row) => Promise<Row>,
) {
  const ensured = await ensureOperation(binding, type, input);
  if (ensured.row.status === "completed") {
    return {
      ok: true,
      version: VERSION,
      idempotent_replay: true,
      operation: publicOperation(ensured.row),
      github: ensured.row.result || {},
      workspace_state_read: false,
      workspace_state_changed: false,
    };
  }
  const claimId = crypto.randomUUID();
  const claimed = await claimOperation(binding, ensured.operationKey, ensured.hash, claimId);
  if (claimed.status === "completed") {
    return {
      ok: true,
      version: VERSION,
      idempotent_replay: true,
      operation: publicOperation(claimed),
      github: claimed.result || {},
      workspace_state_read: false,
      workspace_state_changed: false,
    };
  }
  try {
    const result = await execute(claimed);
    const completed = await completeOperation(binding, ensured.operationKey, claimId, result);
    return {
      ok: true,
      version: VERSION,
      idempotent_replay: false,
      operation: publicOperation(completed),
      github: result,
      workspace_state_read: false,
      workspace_state_changed: false,
    };
  } catch (error) {
    await failOperation(binding, ensured.operationKey, claimId, error);
    throw error;
  }
}

export async function readRepository(binding: Binding, args: Row) {
  const repo = cleanRepo(args.repo);
  const authority = await verifyOwnerRepository(binding.owner_id, repo, { contents: "read", metadata: "read" });
  const ref = cleanRef(args.ref || authority.default_branch);
  const repoPath = "/repos/" + [authority.owner, authority.name].map(encodeURIComponent).join("/");
  const repository = await githubApi(repoPath, authority.token);
  const commit = await githubApi(repoPath + "/commits/" + encodeURIComponent(ref), authority.token);
  const path = args.path == null || String(args.path).trim() === "" ? null : cleanPath(args.path);
  let file: Row | null = null;
  if (path) {
    const content = await githubApi(repoPath + "/contents/" + encodePath(path) + "?ref=" + encodeURIComponent(String(commit.sha)), authority.token);
    if (!content || content.type !== "file" || content.encoding !== "base64") {
      throw new Error("The requested repository path is not one readable file.");
    }
    const text = base64ToText(content.content);
    file = {
      path,
      blob_sha: String(content.sha || ""),
      byte_size: Number(content.size || new TextEncoder().encode(text).length),
      content_hash: await sha256(text),
      content: text,
    };
  }
  return {
    ok: true,
    version: VERSION,
    read_only: true,
    owner_authorised: true,
    repository: {
      repo: String(repository.full_name || repo),
      default_branch: String(repository.default_branch || authority.default_branch),
      private: repository.private === true,
      ref,
      commit_sha: String(commit.sha || ""),
    },
    file,
    workspace_state_read: false,
    workspace_state_changed: false,
  };
}

export async function createBranch(binding: Binding, args: Row) {
  const repo = cleanRepo(args.repo);
  const authority = await verifyOwnerRepository(binding.owner_id, repo, { contents: "write", metadata: "read" });
  const branch = cleanBranch(args.branch, authority.default_branch);
  const baseRef = cleanRef(args.base_ref || authority.default_branch, "base ref");
  return executeDurable(binding, "branch_create", {
    operation_key: args.operation_key,
    repo,
    branch,
    base_ref: baseRef,
  }, async () => {
    const repoPath = "/repos/" + [authority.owner, authority.name].map(encodeURIComponent).join("/");
    const existing = await githubApi(repoPath + "/git/ref/heads/" + encodeURIComponent(branch), authority.token, {}, true);
    if (existing) throw new Error("The requested GitHub branch already exists under a different operation.");
    const commit = await githubApi(repoPath + "/commits/" + encodeURIComponent(baseRef), authority.token);
    const baseSha = String(commit?.sha || "");
    if (!SHA1.test(baseSha)) throw new Error("GitHub did not return a valid base commit SHA.");
    const created = await githubApi(repoPath + "/git/refs", authority.token, {
      method: "POST",
      body: JSON.stringify({ ref: "refs/heads/" + branch, sha: baseSha }),
    });
    return {
      operation: "branch_create",
      repo,
      branch,
      base_ref: baseRef,
      base_commit_sha: baseSha,
      ref: String(created?.ref || "refs/heads/" + branch),
      created: true,
      protected_branch_write: false,
    };
  });
}

async function writeFile(binding: Binding, args: Row, mode: "file_create" | "file_update") {
  const repo = cleanRepo(args.repo);
  const authority = await verifyOwnerRepository(binding.owner_id, repo, { contents: "write", metadata: "read" });
  const branch = cleanBranch(args.branch, authority.default_branch);
  const path = cleanPath(args.path);
  const content = contentInput(args);
  const actualHash = await sha256(content.content);
  if (actualHash !== content.expectedHash) throw new Error("The complete file content does not match content_hash.");
  const expectedBlobSha = mode === "file_update" ? String(args.expected_blob_sha || "").toLowerCase() : null;
  if (mode === "file_update" && !SHA1.test(String(expectedBlobSha))) {
    throw new Error("expected_blob_sha is required for a file update.");
  }
  return executeDurable(binding, mode, {
    operation_key: args.operation_key,
    repo,
    branch,
    path,
    expected_blob_sha: expectedBlobSha,
    content_hash: actualHash,
    content: content.content,
    commit_message: safeText(args.commit_message || `Code Labs V105 ${mode === "file_create" ? "create" : "update"} ${path}`, 240),
  }, async (operation) => {
    const repoPath = "/repos/" + [authority.owner, authority.name].map(encodeURIComponent).join("/");
    const branchRef = await githubApi(repoPath + "/git/ref/heads/" + encodeURIComponent(branch), authority.token);
    if (!SHA1.test(String(branchRef?.object?.sha || ""))) throw new Error("The required non-main branch does not exist.");
    const current = await githubApi(repoPath + "/contents/" + encodePath(path) + "?ref=" + encodeURIComponent(branch), authority.token, {}, true);
    if (mode === "file_create" && current) throw new Error("The target file already exists; use the update tool with its exact blob SHA.");
    if (mode === "file_update") {
      if (!current || current.type !== "file") throw new Error("The target file does not exist for update.");
      if (String(current.sha || "").toLowerCase() !== expectedBlobSha) {
        throw new Error("The GitHub blob changed. Read the file again and supply the new expected_blob_sha.");
      }
    }
    const payload: Row = {
      message: operation.commit_message,
      content: bytesToBase64(new TextEncoder().encode(content.content)),
      branch,
    };
    if (mode === "file_update") payload.sha = expectedBlobSha;
    const saved = await githubApi(repoPath + "/contents/" + encodePath(path), authority.token, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const commitSha = String(saved?.commit?.sha || "");
    const blobSha = String(saved?.content?.sha || "");
    if (!SHA1.test(commitSha) || !SHA1.test(blobSha)) throw new Error("GitHub did not return complete commit and blob proof.");
    return {
      operation: mode,
      repo,
      branch,
      path,
      previous_blob_sha: expectedBlobSha,
      content_hash: actualHash,
      content_bytes: content.size,
      commit_sha: commitSha,
      blob_sha: blobSha,
      protected_branch_write: false,
    };
  });
}

export function createFile(binding: Binding, args: Row) {
  return writeFile(binding, args, "file_create");
}

export function updateFile(binding: Binding, args: Row) {
  return writeFile(binding, args, "file_update");
}

export async function createOrReuseDraftPr(binding: Binding, args: Row) {
  const repo = cleanRepo(args.repo);
  const authority = await verifyOwnerRepository(binding.owner_id, repo, { contents: "read", pull_requests: "write", metadata: "read" });
  const branch = cleanBranch(args.branch, authority.default_branch);
  const baseRef = cleanRef(args.base_ref || authority.default_branch, "base branch");
  if (branch.toLowerCase() === baseRef.toLowerCase()) throw new Error("Pull-request head and base branches must differ.");
  const title = safeText(args.pr_title || `Code Labs V105: ${branch}`, 240);
  const body = safeText(args.pr_body || "Prepared by the independent Code Labs V105 GitHub operation lane.", 20000);
  return executeDurable(binding, "draft_pr_create", {
    operation_key: args.operation_key,
    repo,
    branch,
    base_ref: baseRef,
    pr_title: title,
    pr_body: body,
  }, async () => {
    const repoPath = "/repos/" + [authority.owner, authority.name].map(encodeURIComponent).join("/");
    await githubApi(repoPath + "/git/ref/heads/" + encodeURIComponent(branch), authority.token);
    const pulls = await githubApi(
      repoPath + "/pulls?state=open&head=" + encodeURIComponent(authority.owner + ":" + branch) + "&base=" + encodeURIComponent(baseRef),
      authority.token,
    );
    const reused = Array.isArray(pulls) && Boolean(pulls[0]);
    const pull = reused ? pulls[0] : await githubApi(repoPath + "/pulls", authority.token, {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        head: branch,
        base: baseRef,
        draft: true,
        maintainer_can_modify: false,
      }),
    });
    const number = Number(pull?.number || 0);
    const url = String(pull?.html_url || "");
    if (!number || !url) throw new Error("GitHub did not return draft pull-request proof.");
    if (pull.draft !== true) throw new Error("The pull request is not a draft; V105 will not continue.");
    return {
      operation: "draft_pr_create",
      repo,
      head: branch,
      base: baseRef,
      pull_request_number: number,
      pull_request_url: url,
      draft: true,
      reused,
      protected_branch_write: false,
    };
  });
}

export async function inspectPullRequest(binding: Binding, args: Row) {
  const repo = cleanRepo(args.repo);
  const number = Number(args.pull_request_number);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("pull_request_number is required.");
  const authority = await verifyOwnerRepository(binding.owner_id, repo, { contents: "read", pull_requests: "read", metadata: "read" });
  const repoPath = "/repos/" + [authority.owner, authority.name].map(encodeURIComponent).join("/");
  const pull = await githubApi(repoPath + "/pulls/" + number, authority.token);
  const files = await githubApi(repoPath + "/pulls/" + number + "/files?per_page=100", authority.token);
  return {
    ok: true,
    version: VERSION,
    read_only: true,
    owner_authorised: true,
    pull_request: {
      number,
      url: String(pull.html_url || ""),
      state: String(pull.state || ""),
      draft: pull.draft === true,
      mergeable: pull.mergeable,
      mergeable_state: String(pull.mergeable_state || ""),
      head: String(pull.head?.ref || ""),
      head_sha: String(pull.head?.sha || ""),
      base: String(pull.base?.ref || ""),
      base_sha: String(pull.base?.sha || ""),
      changed_files: Number(pull.changed_files || 0),
      additions: Number(pull.additions || 0),
      deletions: Number(pull.deletions || 0),
      files: Array.isArray(files) ? files.map((file: Row) => ({
        path: String(file.filename || ""),
        status: String(file.status || ""),
        additions: Number(file.additions || 0),
        deletions: Number(file.deletions || 0),
        changes: Number(file.changes || 0),
        blob_url: String(file.blob_url || ""),
        raw_url: String(file.raw_url || ""),
      })) : [],
    },
    workspace_state_read: false,
    workspace_state_changed: false,
  };
}

export async function inspectGithubOperation(binding: Binding, args: Row) {
  const operationKey = cleanOperationKey(args.operation_key);
  const row = await one(
    "code_labs_github_operations?select=*&owner_id=eq." + encodeURIComponent(binding.owner_id) +
      "&operation_key=eq." + encodeURIComponent(operationKey) + "&limit=1",
  );
  if (!row) throw new Error("The V105 GitHub operation was not found.");
  return {
    ok: true,
    version: VERSION,
    read_only: true,
    operation: publicOperation(row),
    workspace_state_read: false,
    workspace_state_changed: false,
  };
}
