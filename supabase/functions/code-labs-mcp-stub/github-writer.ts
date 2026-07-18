import { importPKCS8, SignJWT } from "npm:jose@5.9.6";
import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";

type Row = Record<string, any>;

const REPO = "trevieisking/stream-bandit";
const OWNER = "trevieisking";
const REPO_NAME = "stream-bandit";
const BASE_BRANCH = "main";
const API = "https://api.github.com";
const API_VERSION = "2026-03-10";
const MAX_CONTENT = 180000;
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);

function requiredSecret(name: string) {
  const value = String(Deno.env.get(name) || "").trim();
  if (!value) throw new Error(name + " is not configured in Supabase secrets.");
  return value;
}

function safeBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (!/^[A-Za-z0-9._/-]{3,80}$/.test(branch) || PROTECTED.has(branch.toLowerCase())) throw new Error("The GitHub branch is missing or protected.");
  return branch;
}

function safePath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (!path || path.includes("..") || path.includes("\\") || path.startsWith(".") || path.toLowerCase().includes("secrets")) throw new Error("The GitHub path is missing or unsafe.");
  if (/\.(env|pem|key|p12|pfx)$/i.test(path) || path.startsWith(".github/")) throw new Error("The GitHub path is protected.");
  return path;
}

function concatBytes(...parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
}

function derLength(length: number) {
  if (length < 128) return new Uint8Array([length]);
  const bytes: number[] = [];
  for (let value = length; value > 0; value >>>= 8) bytes.unshift(value & 255);
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function der(tag: number, body: Uint8Array) {
  return concatBytes(new Uint8Array([tag]), derLength(body.length), body);
}

function base64ToBytes(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function bytesToBase64(value: Uint8Array) {
  let binary = "";
  const size = 0x8000;
  for (let offset = 0; offset < value.length; offset += size) {
    binary += String.fromCharCode(...value.subarray(offset, Math.min(offset + size, value.length)));
  }
  return btoa(binary);
}

function pem(label: string, value: Uint8Array) {
  const encoded = bytesToBase64(value);
  const lines = encoded.match(/.{1,64}/g) || [];
  return "-----BEGIN " + label + "-----\n" + lines.join("\n") + "\n-----END " + label + "-----\n";
}

function normalizePrivateKey(value: string) {
  const key = String(value || "").trim();
  if (key.includes("-----BEGIN PRIVATE KEY-----")) return key + "\n";
  if (!key.includes("-----BEGIN RSA PRIVATE KEY-----")) throw new Error("The GitHub App private key format is unsupported.");
  const body = key
    .replace("-----BEGIN RSA PRIVATE KEY-----", "")
    .replace("-----END RSA PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const pkcs1 = base64ToBytes(body);
  const version = der(0x02, new Uint8Array([0]));
  const rsaAlgorithm = new Uint8Array([0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00]);
  const privateKey = der(0x04, pkcs1);
  return pem("PRIVATE KEY", der(0x30, concatBytes(version, rsaAlgorithm, privateKey)));
}

async function digest(value: unknown) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(value ?? null)));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function githubAppToken() {
  const appId = requiredSecret("CODE_LABS_GITHUB_APP_ID");
  const installationId = requiredSecret("CODE_LABS_GITHUB_INSTALLATION_ID");
  const encodedKey = requiredSecret("CODE_LABS_GITHUB_APP_KEY_B64");
  const keyBytes = base64ToBytes(encodedKey);
  const keyText = normalizePrivateKey(new TextDecoder().decode(keyBytes));
  const key = await importPKCS8(keyText, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(appId)
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 540)
    .sign(key);
  const response = await fetch(API + "/app/installations/" + encodeURIComponent(installationId) + "/access_tokens", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + jwt,
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "stream-bandit-code-labs",
    },
    body: JSON.stringify({ repositories: [REPO_NAME], permissions: { contents: "write", pull_requests: "write", metadata: "read" } }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) throw new Error("GitHub App installation token could not be created.");
  return String(payload.token);
}

async function github(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(API + path, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "stream-bandit-code-labs",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) throw new Error("GitHub API request failed with status " + response.status + ".");
  return payload;
}

async function audit(requestId: string, action: string, detail: Row) {
  await rest("code_labs_write_audit", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ write_request_id: requestId, action, detail }),
  });
}

async function selectedRequest(ownerId: string, requestId: string) {
  const row = await one("code_labs_write_requests?select=*&id=eq." + encodeURIComponent(requestId) + "&requested_by=eq." + encodeURIComponent(ownerId) + "&limit=1");
  if (!row) throw new Error("The Code Labs write request was not found.");
  return row;
}

async function approvedHandoff(ownerId: string, request: Row) {
  const state = await one("code_labs_workspace_state?select=*&owner_id=eq." + encodeURIComponent(ownerId) + "&limit=1");
  if (!state?.current_file_id) throw new Error("No Code Labs file is selected.");
  const file = await one("code_labs_files?select=*&id=eq." + encodeURIComponent(state.current_file_id) + "&owner_id=eq." + encodeURIComponent(ownerId) + "&limit=1");
  const handoff = file?.metadata?.repo_handoff || {};
  const review = file?.metadata?.code_god_review || {};
  if (review.outcome !== "PASS") throw new Error("Code God PASS is required.");
  if (review.handoff_hash !== await digest(handoff) || review.proposed_hash !== handoff.proposed_hash) throw new Error("The reviewed handoff changed after Code God review.");
  if (String(handoff.repo) !== REPO || String(request.repo) !== REPO) throw new Error("The repository is not approved.");
  if (String(handoff.path) !== String(request.path) || String(handoff.request_branch) !== String(request.branch)) throw new Error("The queued request does not match the reviewed handoff.");
  if (String(handoff.proposed || "") !== String(request.content || "")) throw new Error("The queued content does not match the reviewed candidate.");
  return { handoff, review };
}

export async function executeGithubWriter(b: Binding, args: Row) {
  if (args.confirmed !== true) throw new Error("confirmed must be true to execute the GitHub writer.");
  const requestId = String(args.request_id || "").trim();
  if (!requestId) throw new Error("request_id is required.");
  const request = await selectedRequest(b.owner_id, requestId);
  if (request.direct_main_write !== false || request.branch_pr_only !== true || request.deletes_anything !== false) throw new Error("The request safety flags are invalid.");
  if (!["queued", "prepared", "branch_created", "failed"].includes(String(request.status || ""))) throw new Error("The request is not executable in its current state.");
  const branch = safeBranch(request.branch);
  const path = safePath(request.path);
  const content = String(request.content || "");
  if (!content || content.length > MAX_CONTENT) throw new Error("A complete file under the queue limit is required.");
  await approvedHandoff(b.owner_id, request);

  const token = await githubAppToken();
  const branchRef = await github("/repos/" + OWNER + "/" + REPO_NAME + "/git/ref/heads/" + encodeURIComponent(branch), token);
  const branchSha = String(branchRef?.object?.sha || "");
  if (!branchSha) throw new Error("The required GitHub branch does not exist.");
  await audit(requestId, "branch_verified", { branch, branch_sha: branchSha });

  let currentSha: string | null = null;
  try {
    const existing = await github("/repos/" + OWNER + "/" + REPO_NAME + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(branch), token);
    currentSha = existing?.sha ? String(existing.sha) : null;
  } catch (error) {
    if (String(request.action) !== "create_file") throw error;
  }

  const encodedContent = bytesToBase64(new TextEncoder().encode(content));
  const commitPayload: Row = { message: String(request.commit_message || "Code Labs complete-file update"), content: encodedContent, branch };
  if (currentSha) commitPayload.sha = currentSha;
  const committed = await github("/repos/" + OWNER + "/" + REPO_NAME + "/contents/" + path.split("/").map(encodeURIComponent).join("/"), token, { method: "PUT", body: JSON.stringify(commitPayload) });
  const commitSha = String(committed?.commit?.sha || "");
  const contentSha = String(committed?.content?.sha || "");
  if (!commitSha || !contentSha) throw new Error("GitHub did not return commit proof.");
  await audit(requestId, "file_committed", { branch, path, commit_sha: commitSha, content_sha: contentSha });

  const pulls = await github("/repos/" + OWNER + "/" + REPO_NAME + "/pulls?state=open&head=" + encodeURIComponent(OWNER + ":" + branch) + "&base=" + encodeURIComponent(BASE_BRANCH), token);
  let pull = Array.isArray(pulls) ? pulls[0] : null;
  if (!pull) {
    pull = await github("/repos/" + OWNER + "/" + REPO_NAME + "/pulls", token, {
      method: "POST",
      body: JSON.stringify({ title: String(request.pr_title || "Code Labs update: " + path), body: String(request.pr_body || "Prepared by Code Labs after Code God PASS."), head: branch, base: BASE_BRANCH, draft: true, maintainer_can_modify: false }),
    });
  }
  const pullNumber = Number(pull?.number || 0);
  const pullUrl = String(pull?.html_url || "");
  if (!pullNumber || !pullUrl) throw new Error("GitHub did not return pull-request proof.");
  await audit(requestId, "draft_pr_opened", { pull_request_number: pullNumber, pull_request_url: pullUrl, reused: Array.isArray(pulls) && pulls.length > 0 });

  const updated = await rest("code_labs_write_requests?id=eq." + encodeURIComponent(requestId) + "&requested_by=eq." + encodeURIComponent(b.owner_id), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status: "pr_opened", github_branch_created: true, github_commit_sha: commitSha, github_content_sha: contentSha, pull_request_number: pullNumber, pull_request_url: pullUrl, error: null, updated_at: new Date().toISOString() }),
  });
  return { ok: true, version: VERSION, tool: "execute_code_labs_github_writer", wrote_database: true, wrote_github: true, opened_pr: true, deleted_anything: false, request: updated?.[0] || null, github: { branch, path, commit_sha: commitSha, content_sha: contentSha, pull_request_number: pullNumber, pull_request_url: pullUrl, draft: true } };
}
