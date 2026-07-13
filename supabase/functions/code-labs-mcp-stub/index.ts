const VERSION = "Code Labs V104 unified page read-write";
const SUPABASE_URL = "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const BASE = SUPABASE_URL + "/functions/v1/code-labs-mcp-stub";
const PUBLIC_KEY = "sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN";
const REPO = "trevieisking/stream-bandit";
const V104_CLAIM = "code-labs-v104";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type AnyRecord = Record<string, any>;

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, ...extra, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
function redirect(location: string) { return new Response(null, { status: 302, headers: { ...corsHeaders, Location: location } }); }
function rpc(id: unknown, result: unknown) { return json({ jsonrpc: "2.0", id: id ?? null, result }); }
function rpcError(id: unknown, code: number, message: string, status = 400) { return json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status); }
function authHeaders() { return { "WWW-Authenticate": `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"` }; }
function serviceKey() { return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY") || ""; }
function signingSecret() { return Deno.env.get("CODE_LABS_OAUTH_SECRET") || serviceKey(); }
function now() { return Math.floor(Date.now() / 1000); }
function b64url(bytes: Uint8Array | string) { const bin = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes); return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }
function fromB64url(text: string) { let b64 = text.replace(/-/g, "+").replace(/_/g, "/"); while (b64.length % 4) b64 += "="; return atob(b64); }
async function sha256(text: string) { return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))); }
async function hmac(text: string) {
  const secret = signingSecret();
  if (!secret) throw new Error("Code Labs OAuth secret is missing.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text))));
}
async function signPayload(payload: AnyRecord) { const encoded = b64url(JSON.stringify(payload)); return encoded + "." + await hmac(encoded); }
async function verifySigned(token: string, expectedType: string) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2 || await hmac(parts[0]) !== parts[1]) throw new Error("Invalid OAuth token.");
  const payload = JSON.parse(fromB64url(parts[0]));
  if (payload.typ !== expectedType || Number(payload.exp || 0) < now()) throw new Error("OAuth token expired.");
  return payload;
}
async function verifyPkce(payload: AnyRecord, verifier: string) {
  if (!payload.code_challenge) return true;
  if (!verifier) return false;
  if (payload.code_challenge_method === "S256") return b64url(await sha256(verifier)) === payload.code_challenge;
  return verifier === payload.code_challenge;
}
function parseParams(req: Request, text: string) {
  if ((req.headers.get("content-type") || "").includes("application/json")) { try { return JSON.parse(text || "{}"); } catch { return {}; } }
  return Object.fromEntries(new URLSearchParams(text));
}
function protectedResourceMetadata() { return { resource: BASE, authorization_servers: [BASE], bearer_methods_supported: ["header"], scopes_supported: ["code_labs.read", "code_labs.write"] }; }
function oauthMetadata() {
  return {
    issuer: BASE,
    authorization_endpoint: BASE + "/oauth/authorize",
    token_endpoint: BASE + "/oauth/token",
    registration_endpoint: BASE + "/oauth/register",
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    code_challenge_methods_supported: ["S256", "plain"],
    scopes_supported: ["code_labs.read", "code_labs.write"],
  };
}
async function registerClient(req: Request) {
  const body = await req.json().catch(() => ({}));
  return json({ client_id: "code-labs-chatgpt-client", client_id_issued_at: now(), redirect_uris: body.redirect_uris || [], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], scope: "code_labs.read code_labs.write" }, 201);
}
async function authorize(req: Request) {
  const url = new URL(req.url); const redirectUri = url.searchParams.get("redirect_uri") || ""; const clientId = url.searchParams.get("client_id") || "";
  if (!redirectUri || !clientId) return json({ error: "missing_redirect_uri_or_client_id" }, 400);
  const code = await signPayload({ typ: "code", exp: now() + 300, client_id: clientId, redirect_uri: redirectUri, scope: "code_labs.read code_labs.write", code_challenge: url.searchParams.get("code_challenge") || "", code_challenge_method: url.searchParams.get("code_challenge_method") || "plain", sub: "code-labs-owner" });
  const destination = new URL(redirectUri); destination.searchParams.set("code", code); const state = url.searchParams.get("state"); if (state) destination.searchParams.set("state", state); return redirect(destination.toString());
}
async function token(req: Request) {
  const params = parseParams(req, await req.text()); const grant = params.grant_type || "authorization_code";
  if (grant === "refresh_token") {
    const old = await verifySigned(String(params.refresh_token || ""), "refresh");
    return json({ access_token: await signPayload({ typ: "access", exp: now() + 3600, scope: "code_labs.read code_labs.write", sub: old.sub || "code-labs-owner" }), token_type: "Bearer", expires_in: 3600, scope: "code_labs.read code_labs.write" });
  }
  if (grant !== "authorization_code") return json({ error: "unsupported_grant_type" }, 400);
  const code = await verifySigned(String(params.code || ""), "code");
  if (params.redirect_uri && params.redirect_uri !== code.redirect_uri) return json({ error: "redirect_uri_mismatch" }, 400);
  if (params.client_id && params.client_id !== code.client_id) return json({ error: "client_id_mismatch" }, 400);
  if (!(await verifyPkce(code, String(params.code_verifier || "")))) return json({ error: "pkce_verification_failed" }, 400);
  return json({ access_token: await signPayload({ typ: "access", exp: now() + 3600, scope: "code_labs.read code_labs.write", sub: code.sub || "code-labs-owner" }), refresh_token: await signPayload({ typ: "refresh", exp: now() + 1209600, scope: "code_labs.read code_labs.write", sub: code.sub || "code-labs-owner" }), token_type: "Bearer", expires_in: 3600, scope: "code_labs.read code_labs.write" });
}
async function accessPayload(req: Request) { const auth = req.headers.get("authorization") || ""; if (!auth.startsWith("Bearer ")) throw new Error("Missing bearer token."); return await verifySigned(auth.slice(7), "access"); }
async function authMode(req: Request) { const auth = req.headers.get("authorization") || ""; if (auth.startsWith("Bearer ")) { try { await verifySigned(auth.slice(7), "access"); return "oauth"; } catch {} } if (auth.startsWith("Bearer ") && req.headers.get("apikey")) return "supabase"; return "missing"; }
async function requireToolAuth(req: Request) { if ((await authMode(req)) === "missing") throw new Error("Missing bearer token"); return await accessPayload(req); }

async function rest(path: string, options: RequestInit = {}) {
  const key = serviceKey(); if (!key) throw new Error("Code Labs service key is missing.");
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, { ...options, headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text(); let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(typeof data === "string" ? data.slice(0, 600) : JSON.stringify(data).slice(0, 600));
  return data;
}
function safeObject(value: unknown, max = 350000) { const text = JSON.stringify(value || {}); if (text.length > max) throw new Error("Payload is too large."); return JSON.parse(text); }
function safePath(path: string) { const p = String(path || "").trim().replace(/^\/+/, ""); if (!p || p.includes("..") || p.includes("\\") || p.startsWith(".")) throw new Error("Unsafe path"); if (/\.(env|pem|key|p12|pfx)$/i.test(p) || p.startsWith(".github/") || p.toLowerCase().includes("secrets")) throw new Error("Secret-like path blocked"); return p; }
function safeBranch(branch: string) { const b = String(branch || "").trim(); if (!/^[A-Za-z0-9._/-]{3,80}$/.test(b)) throw new Error("Unsafe branch name"); if (["main", "master", "gh-pages", "production", "live"].includes(b.toLowerCase())) throw new Error("Protected branch writes are blocked"); return b; }
function isDangerous(value: unknown) { return /(delete|remove|trash|merge|publish|deploy|send|submit|approve|reject|production|main branch)/i.test(String(value || "")); }

async function readTable(table: string, selectText: string, limit: number) {
  const rows = await rest(table + "?select=" + encodeURIComponent(selectText) + "&order=created_at.desc&limit=" + String(limit));
  return Array.isArray(rows) ? rows : [];
}
async function getContext(limit = 5) {
  const cap = Math.max(1, Math.min(Number(limit || 5), 25));
  const [projects, jobs, packets, tests, audit] = await Promise.all([
    readTable("code_labs_projects", "id,site_name,site_url,repo,mode,created_at", cap),
    readTable("code_labs_jobs", "id,title,status,problem,created_at,started_at,completed_at", cap),
    readTable("code_labs_packets", "id,packet_type,packet_text,created_at", Math.min(cap, 10)),
    readTable("code_labs_test_runs", "id,filename,result,checked_count,total_count,created_at", cap),
    readTable("code_labs_audit_log", "id,action,created_at", cap),
  ]);
  return { ok: true, version: VERSION, tool: "get_code_labs_context", limit: cap, read_only: true, wrote_database: false, wrote_github: false, opened_pr: false, deleted_anything: false, reads: { projects, jobs, packets, tests, audit } };
}
function validateCodeLabsUrl(rawUrl: string) { const u = new URL(String(rawUrl || "")); if (u.protocol !== "https:" || u.hostname !== "chatterfriendsstreambandit.co.uk" || !u.pathname.startsWith("/code-labs/")) throw new Error("Only public Code Labs HTTPS URLs are allowed"); u.username = ""; u.password = ""; u.hash = ""; return u.toString(); }
async function readCodeLabsUrl(args: AnyRecord) { const url = validateCodeLabsUrl(args.url); const max = Math.max(1000, Math.min(Number(args.max_chars || 20000), 60000)); const response = await fetch(url, { redirect: "follow" }); const source = await response.text(); return { ok: response.ok, version: VERSION, tool: "read_code_labs_url", read_only: true, url, status: response.status, content_type: response.headers.get("content-type") || "", chars_total: source.length, chars_returned: Math.min(source.length, max), source_text: source.length > max ? source.slice(0, max) + "\n...[trimmed]" : source }; }

async function activeSession() {
  const cutoff = new Date(Date.now() - 30000).toISOString();
  const rows = await rest("code_labs_browser_sessions?select=*&status=eq.paired&claimed_by=eq." + encodeURIComponent(V104_CLAIM) + "&last_seen_at=gt." + encodeURIComponent(cutoff) + "&order=last_seen_at.desc&limit=2");
  if (!Array.isArray(rows) || !rows[0]) throw new Error("No active signed-in Code Labs page is connected to V104. Open one Code Labs page and sign in.");
  if (rows.length > 1) throw new Error("More than one active V104 page session was found. Keep only the page you want V104 to control visible.");
  const session = rows[0];
  if (!session.control_expires_at || new Date(session.control_expires_at).getTime() < Date.now()) throw new Error("The active V104 page session expired. Refresh the Code Labs page.");
  return session;
}
async function readLivePage() { const session = await activeSession(); return { ok: true, version: VERSION, tool: "read_live_code_labs_page", session_id: session.id, page: session.page_name, page_url: session.page_url, page_fingerprint: session.page_fingerprint, last_seen_at: session.last_seen_at, page_snapshot: session.page_snapshot, last_receipt: session.last_receipt }; }
async function enqueue(command: AnyRecord, dangerous = false) {
  const session = await activeSession();
  const expected = String(command.expected_page_fingerprint || "");
  if (!expected || expected !== String(session.page_fingerprint || "")) throw new Error("Read the current live page first and use its exact page fingerprint.");
  const saved = await rest("code_labs_browser_commands", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ session_id: session.id, requested_by: V104_CLAIM, command: safeObject(command), dangerous }) });
  return { ok: true, version: VERSION, command_id: saved[0].id, status: saved[0].status, page: session.page_name, page_fingerprint: session.page_fingerprint };
}
async function writeFields(args: AnyRecord) { const fields = safeObject(args.fields || {}, 300000); const keys = Object.keys(fields); if (!keys.length || keys.length > 100) throw new Error("Provide between 1 and 100 field writes."); return await enqueue({ type: "write_fields", expected_page_fingerprint: String(args.expected_page_fingerprint || ""), fields }); }
async function writeSection(args: AnyRecord) { const section = String(args.section_key || "").slice(0, 180); if (!section) throw new Error("section_key is required."); return await enqueue({ type: "write_section", expected_page_fingerprint: String(args.expected_page_fingerprint || ""), section, fields: safeObject(args.fields || {}, 300000) }); }
async function runAction(args: AnyRecord) { const action = String(args.action_key || "").slice(0, 220); if (!action) throw new Error("action_key is required."); const dangerous = isDangerous(action); if (dangerous && !(args.confirmed === true && args.allow_dangerous === true)) throw new Error("This action requires confirmed=true and allow_dangerous=true."); return await enqueue({ type: "run_action", expected_page_fingerprint: String(args.expected_page_fingerprint || ""), action, confirmed: args.confirmed === true, allow_dangerous: args.allow_dangerous === true }, dangerous); }
async function undo(args: AnyRecord) { return await enqueue({ type: "undo", expected_page_fingerprint: String(args.expected_page_fingerprint || "") }); }
async function readReceipt(args: AnyRecord) { const session = await activeSession(); const commandId = String(args.command_id || ""); if (!commandId) return { ok: true, version: VERSION, tool: "read_live_code_labs_receipt", session_id: session.id, receipt: session.last_receipt }; const rows = await rest("code_labs_browser_commands?select=*&id=eq." + encodeURIComponent(commandId) + "&session_id=eq." + encodeURIComponent(session.id) + "&limit=1"); if (!rows[0]) throw new Error("Command receipt not found."); return { ok: true, version: VERSION, command_id: commandId, status: rows[0].status, receipt: rows[0].receipt, error: rows[0].error }; }

async function saveWriteRequest(args: AnyRecord) {
  if (args.repo !== REPO) throw new Error("repo must be trevieisking/stream-bandit");
  if (args.confirm_branch_pr_only !== true) throw new Error("confirm_branch_pr_only must be true");
  const content = String(args.content ?? ""); if (!content || content.length > 180000) throw new Error("content is required and must be under 180000 characters");
  const row = { repo: REPO, path: safePath(args.path), branch: safeBranch(args.branch), action: args.action || "create_or_update_file", content, commit_message: String(args.commit_message || "Code Labs safe write request"), pr_title: String(args.pr_title || "Code Labs safe write request"), pr_body: String(args.pr_body || ""), status: "queued", direct_main_write: false, branch_pr_only: true, deletes_anything: false, requested_source: "code_labs_chatgpt_app" };
  const saved = await rest("code_labs_write_requests", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) });
  return { ok: true, version: VERSION, tool: "save_code_labs_write_request", wrote_database: true, wrote_github: false, opened_pr: false, deleted_anything: false, request_id: saved?.[0]?.id || null, status: saved?.[0]?.status || "queued", repo: row.repo, path: row.path, branch: row.branch, action: row.action };
}

function toolList() {
  const fingerprint = { type: "string", description: "Exact page fingerprint from read_live_code_labs_page." };
  return [
    { name: "get_code_labs_context", title: "Get Code Labs Context", description: "Read saved Code Labs context. Default 5 rows, maximum 25 per table.", inputSchema: { type: "object", properties: { limit: { type: "number", minimum: 1, maximum: 25 } } }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true } },
    { name: "read_code_labs_url", title: "Read Code Labs URL", description: "Read a public Code Labs URL.", inputSchema: { type: "object", properties: { url: { type: "string" }, max_chars: { type: "number", maximum: 60000 } }, required: ["url"] }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true } },
    { name: "read_live_code_labs_page", title: "Read Live Code Labs Page", description: "Read the active signed-in Code Labs page, including safe sections, fields, actions and receipt.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true } },
    { name: "write_live_code_labs_fields", title: "Write Live Code Labs Fields", description: "Write the smallest safe field set on the active page.", inputSchema: { type: "object", properties: { expected_page_fingerprint: fingerprint, fields: { type: "object", additionalProperties: true } }, required: ["expected_page_fingerprint", "fields"] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
    { name: "write_live_code_labs_section", title: "Write Live Code Labs Section", description: "Write safe fields in one page section.", inputSchema: { type: "object", properties: { expected_page_fingerprint: fingerprint, section_key: { type: "string" }, fields: { type: "object", additionalProperties: true } }, required: ["expected_page_fingerprint", "section_key", "fields"] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
    { name: "run_live_code_labs_action", title: "Run Live Code Labs Action", description: "Press an approved page button by stable action key.", inputSchema: { type: "object", properties: { expected_page_fingerprint: fingerprint, action_key: { type: "string" }, confirmed: { type: "boolean" }, allow_dangerous: { type: "boolean" } }, required: ["expected_page_fingerprint", "action_key"] }, annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false } },
    { name: "read_live_code_labs_receipt", title: "Read Live Code Labs Receipt", description: "Read a command result or the latest page receipt.", inputSchema: { type: "object", properties: { command_id: { type: "string" } } }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true } },
    { name: "undo_live_code_labs_write", title: "Undo Live Code Labs Write", description: "Undo the most recent page-field write.", inputSchema: { type: "object", properties: { expected_page_fingerprint: fingerprint }, required: ["expected_page_fingerprint"] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
    { name: "save_code_labs_write_request", title: "Save Code Labs Write Request", description: "Queue one branch/PR-only full-file request in Code Labs SQL.", inputSchema: { type: "object", properties: { repo: { type: "string" }, path: { type: "string" }, branch: { type: "string" }, content: { type: "string" }, action: { type: "string" }, commit_message: { type: "string" }, pr_title: { type: "string" }, pr_body: { type: "string" }, confirm_branch_pr_only: { type: "boolean" } }, required: ["repo", "path", "branch", "content", "commit_message", "pr_title", "confirm_branch_pr_only"] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
  ];
}
async function callTool(name: string, args: AnyRecord) {
  if (name === "get_code_labs_context") return await getContext(args.limit);
  if (name === "read_code_labs_url") return await readCodeLabsUrl(args);
  if (name === "read_live_code_labs_page") return await readLivePage();
  if (name === "write_live_code_labs_fields") return await writeFields(args);
  if (name === "write_live_code_labs_section") return await writeSection(args);
  if (name === "run_live_code_labs_action") return await runAction(args);
  if (name === "read_live_code_labs_receipt") return await readReceipt(args);
  if (name === "undo_live_code_labs_write") return await undo(args);
  if (name === "save_code_labs_write_request") return await saveWriteRequest(args);
  throw new Error("Unknown tool.");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url); const path = url.pathname;
  try {
    if (path.endsWith("/.well-known/oauth-authorization-server") || path.endsWith("/.well-known/openid-configuration")) return json(oauthMetadata());
    if (path.endsWith("/.well-known/oauth-protected-resource")) return json(protectedResourceMetadata());
    if (path.endsWith("/oauth/register") && req.method === "POST") return await registerClient(req);
    if (path.endsWith("/oauth/authorize")) return await authorize(req);
    if (path.endsWith("/oauth/token") && req.method === "POST") return await token(req);
    if (req.method !== "POST") return json({ ok: true, version: VERSION, tools: toolList(), endpoint: BASE });
    const body = await req.json().catch(() => ({})); const id = body.id ?? null;
    if (body.jsonrpc === "2.0") {
      if (body.method === "initialize") return rpc(id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "code-labs-mcp-stub", version: VERSION }, instructions: "Use V104 as the one Code Labs connector. Read the live page first, write the smallest safe change using the exact fingerprint, inspect the receipt, and keep GitHub changes branch/PR-only." });
      if (body.method === "ping") return rpc(id, {});
      if (body.method === "notifications/initialized") return new Response(null, { status: 202, headers: corsHeaders });
      if (body.method === "tools/list") return rpc(id, { tools: toolList() });
      if (body.method === "resources/list") return rpc(id, { resources: [] });
      if (body.method === "prompts/list") return rpc(id, { prompts: [] });
      if (body.method === "tools/call") { await requireToolAuth(req); const result = await callTool(body.params?.name || "", body.params?.arguments || {}); return rpc(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result, isError: false }); }
      return rpcError(id, -32601, "Unknown method", 404);
    }
    await requireToolAuth(req); return json(await callTool(body.tool || body.name || "", body));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /Missing bearer token|OAuth token/i.test(message) ? 401 : 400;
    return json({ ok: false, version: VERSION, error: message, wrote_database: false, wrote_github: false, opened_pr: false, deleted_anything: false }, status, status === 401 ? authHeaders() : {});
  }
});
