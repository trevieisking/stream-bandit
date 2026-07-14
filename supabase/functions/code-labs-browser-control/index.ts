const VERSION = "Code Labs V104 no-login browser control V201";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY") || "";
const ALLOWED_ORIGIN = "https://chatterfriendsstreambandit.co.uk";
const CLAIM = "code-labs-v104";

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function randomToken(bytes = 32) { const value = new Uint8Array(bytes); crypto.getRandomValues(value); return btoa(String.fromCharCode(...value)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
async function sha256(value: string) { const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))); return Array.from(bytes, byte => byte.toString(16).padStart(2,"0")).join(""); }
async function rest(path: string, init: RequestInit = {}) {
  if (!SERVICE_KEY) throw new Error("Code Labs browser control service key is missing.");
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, { ...init, headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": "application/json", ...(init.headers || {}) } });
  const text = await response.text(); let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(typeof data === "string" ? data.slice(0,500) : JSON.stringify(data).slice(0,500));
  return data;
}
function validPageUrl(value: unknown) { const url = new URL(String(value || ALLOWED_ORIGIN + "/code-labs/index.html")); if (url.origin !== ALLOWED_ORIGIN || !url.pathname.startsWith("/code-labs/")) throw new Error("Only live Code Labs pages can be controlled."); url.hash = ""; return url.toString(); }
function safe(value: unknown, max = 750000) { const text = JSON.stringify(value || {}); if (text.length > max) throw new Error("The live page packet is too large."); return JSON.parse(text); }
async function ownerId() { const rows = await rest("code_labs_owners?select=user_id&order=created_at.asc&limit=1"); const id = Array.isArray(rows) && rows[0] && rows[0].user_id; if (!id) throw new Error("Code Labs owner is not configured."); return String(id); }
async function session(sessionId: string, browserSecret: string) {
  if (!sessionId || !browserSecret) throw new Error("Browser session details are missing.");
  const rows = await rest("code_labs_browser_sessions?select=*&id=eq." + encodeURIComponent(sessionId) + "&browser_secret_hash=eq." + encodeURIComponent(await sha256(browserSecret)) + "&claimed_by=eq." + encodeURIComponent(CLAIM) + "&status=eq.paired&limit=1");
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) throw new Error("This V104 browser session is not valid.");
  if (!row.control_expires_at || new Date(row.control_expires_at).getTime() < Date.now()) throw new Error("This V104 browser session expired.");
  return row;
}
async function createPairing(req: Request, body: any) {
  const owner = await ownerId(), browserSecret = randomToken(), now = new Date().toISOString(), expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  await rest("code_labs_browser_sessions?claimed_by=eq." + encodeURIComponent(CLAIM) + "&status=eq.paired", { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "closed", updated_at: now }) });
  const saved = await rest("code_labs_browser_sessions", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ owner_id: owner, pairing_code_hash: await sha256(randomToken()), browser_secret_hash: await sha256(browserSecret), claimed_by: CLAIM, paired_at: now, status: "paired", page_name: String(body.page_name || "").slice(0,120), page_url: validPageUrl(body.page_url), page_fingerprint: String(body.page_fingerprint || "").slice(0,120), page_snapshot: safe(body.page_snapshot || {}), last_seen_at: now, control_expires_at: expires, updated_at: now }) });
  return json(req, { ok: true, version: VERSION, session_id: saved[0].id, browser_secret: browserSecret, status: "paired", control_expires_at: expires });
}
async function heartbeat(req: Request, body: any) {
  const row = await session(String(body.session_id || ""), String(body.browser_secret || ""));
  const saved = await rest("code_labs_browser_sessions?id=eq." + encodeURIComponent(row.id), { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ page_name: String(body.page_name || "").slice(0,120), page_url: validPageUrl(body.page_url || row.page_url), page_fingerprint: String(body.page_fingerprint || "").slice(0,120), page_snapshot: safe(body.page_snapshot || {}), last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
  return json(req, { ok: true, version: VERSION, status: saved[0].status, control_expires_at: saved[0].control_expires_at });
}
async function poll(req: Request, body: any) {
  const row = await session(String(body.session_id || ""), String(body.browser_secret || ""));
  const rows = await rest("code_labs_browser_commands?select=*&session_id=eq." + encodeURIComponent(row.id) + "&status=eq.queued&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&order=created_at.asc&limit=1");
  const command = Array.isArray(rows) ? rows[0] : null;
  if (!command) return json(req, { ok: true, version: VERSION, status: row.status, command: null });
  const claimed = await rest("code_labs_browser_commands?id=eq." + encodeURIComponent(command.id) + "&status=eq.queued", { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "running", claimed_at: new Date().toISOString() }) });
  return json(req, { ok: true, version: VERSION, status: row.status, command: claimed[0] || null });
}
async function saveReceipt(req: Request, body: any) {
  const row = await session(String(body.session_id || ""), String(body.browser_secret || "")), receipt = safe(body.receipt || {}, 300000), commandId = String(body.command_id || "");
  if (!commandId) throw new Error("command_id is required."); const ok = receipt.ok === true;
  await rest("code_labs_browser_commands?id=eq." + encodeURIComponent(commandId) + "&session_id=eq." + encodeURIComponent(row.id), { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: ok ? "completed" : "failed", receipt, error: ok ? null : String(receipt.error || receipt.failed?.[0]?.error || "Command failed").slice(0,1000), completed_at: new Date().toISOString() }) });
  await rest("code_labs_browser_sessions?id=eq." + encodeURIComponent(row.id), { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ last_receipt: receipt, page_snapshot: safe(body.page_snapshot || row.page_snapshot), page_name: String(body.page_name || row.page_name).slice(0,120), page_url: validPageUrl(body.page_url || row.page_url), page_fingerprint: String(body.page_fingerprint || row.page_fingerprint).slice(0,120), last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
  return json(req, { ok: true, version: VERSION, command_id: commandId, status: ok ? "completed" : "failed" });
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, version: VERSION, error: "POST only" }, 405);
  try {
    const origin = req.headers.get("origin") || ""; if (origin && origin !== ALLOWED_ORIGIN) throw new Error("Origin is not allowed.");
    const body = await req.json().catch(() => ({})), action = String(body.action || "");
    if (action === "create_pairing") return await createPairing(req, body);
    if (action === "heartbeat") return await heartbeat(req, body);
    if (action === "poll") return await poll(req, body);
    if (action === "receipt") return await saveReceipt(req, body);
    return json(req, { ok: false, version: VERSION, error: "Unknown browser action" }, 404);
  } catch (error) { return json(req, { ok: false, version: VERSION, error: error instanceof Error ? error.message : String(error) }, 400); }
});
