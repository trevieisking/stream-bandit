export const SUPABASE_URL = "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
export const BASE = SUPABASE_URL + "/functions/v1/code-labs-mcp-stub";
export const SCOPE = "code_labs.read code_labs.write";
export const CLAIM = "code-labs-v104";
export type Row = Record<string, any>;
export type Binding = { owner_id: string; session_id?: string; session?: Row };

const now = () => Math.floor(Date.now() / 1000);
const key = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY") || "";
const secret = () => Deno.env.get("CODE_LABS_OAUTH_SECRET") || key();
const b64 = (v: Uint8Array | string) => btoa(typeof v === "string" ? v : String.fromCharCode(...v)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const unb64 = (v: string) => { let x = v.replace(/-/g, "+").replace(/_/g, "/"); while (x.length % 4) x += "="; return atob(x); };
const bytes = async (v: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)));
const hex = async (v: string) => Array.from(await bytes(v)).map((x) => x.toString(16).padStart(2, "0")).join("");
const randomCode = () => crypto.randomUUID() + "." + b64(crypto.getRandomValues(new Uint8Array(32)));

async function mac(v: string) {
  if (!secret()) throw new Error("Code Labs OAuth secret is missing.");
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(v))));
}
export async function sign(payload: Row) { const body = b64(JSON.stringify(payload)); return body + "." + await mac(body); }
export async function verify(token: string, type: string) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2 || await mac(parts[0]) !== parts[1]) throw new Error("Invalid OAuth token.");
  const payload = JSON.parse(unb64(parts[0]));
  if (payload.typ !== type || Number(payload.exp || 0) < now()) throw new Error("OAuth token expired.");
  return payload;
}
export async function rest(path: string, init: RequestInit = {}) {
  if (!key()) throw new Error("Code Labs service key is missing.");
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + path, { ...init, headers: { apikey: key(), Authorization: "Bearer " + key(), "Content-Type": "application/json", ...(init.headers || {}) } });
  const text = await r.text(); let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) throw new Error(typeof data === "string" ? data.slice(0, 700) : JSON.stringify(data).slice(0, 700));
  return data;
}
export function redirectUri(raw: unknown) {
  const u = new URL(String(raw || ""));
  if (u.protocol !== "https:" || u.username || u.password || u.hash) throw new Error("Only clean HTTPS redirect URIs are allowed.");
  return u.toString();
}
async function configuredOwnerId() {
  const rows = await rest("code_labs_owners?select=user_id&order=created_at.asc&limit=2");
  if (!Array.isArray(rows) || !rows[0]?.user_id) throw new Error("Code Labs owner is not configured.");
  if (rows.length > 1) throw new Error("Code Labs V104 requires exactly one configured owner.");
  return String(rows[0].user_id);
}
export async function register(req: Request) {
  const body = await req.json().catch(() => ({}));
  const raw = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
  if (!raw.length || raw.length > 10) throw new Error("redirect_uris_required");
  const uris = Array.from(new Set(raw.map(redirectUri)));
  const client_id = await sign({ typ: "client", exp: now() + 31536000, redirect_uris: uris });
  return { client_id, client_id_issued_at: now(), client_id_expires_at: now() + 31536000, redirect_uris: uris, token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], scope: SCOPE };
}
export async function exactSession(owner_id: string, session_id: string) {
  const cutoff = new Date(Date.now() - 30000).toISOString();
  const rows = await rest("code_labs_browser_sessions?select=*&id=eq." + encodeURIComponent(session_id) + "&owner_id=eq." + encodeURIComponent(owner_id) + "&status=eq.paired&claimed_by=eq." + encodeURIComponent(CLAIM) + "&last_seen_at=gt." + encodeURIComponent(cutoff) + "&limit=1");
  const session = Array.isArray(rows) ? rows[0] : null;
  if (!session) throw new Error("No active V104 Code Labs page is available. Open one Code Labs page and keep it visible.");
  if (!session.control_expires_at || new Date(session.control_expires_at).getTime() < Date.now()) throw new Error("The active V104 Code Labs page session expired. Refresh the page.");
  return session;
}
export async function activeSession(owner_id: string): Promise<Binding> {
  const cutoff = new Date(Date.now() - 30000).toISOString();
  const rows = await rest("code_labs_browser_sessions?select=*&owner_id=eq." + encodeURIComponent(owner_id) + "&status=eq.paired&claimed_by=eq." + encodeURIComponent(CLAIM) + "&last_seen_at=gt." + encodeURIComponent(cutoff) + "&control_expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&order=last_seen_at.desc&limit=2");
  if (!Array.isArray(rows) || !rows[0]) throw new Error("No active V104 Code Labs page is available. Open one Code Labs page and keep it visible.");
  if (rows.length > 1) throw new Error("Keep only one V104 Code Labs page visible while using live page controls.");
  const session = rows[0];
  return { owner_id, session_id: String(session.id), session };
}
export async function authorize(req: Request) {
  const u = new URL(req.url);
  const client_id = u.searchParams.get("client_id") || "";
  const redirect_uri = redirectUri(u.searchParams.get("redirect_uri") || "");
  const challenge = u.searchParams.get("code_challenge") || "";
  const client = await verify(client_id, "client");
  if (!Array.isArray(client.redirect_uris) || !client.redirect_uris.includes(redirect_uri)) throw new Error("redirect_uri_not_registered");
  if (!challenge || u.searchParams.get("code_challenge_method") !== "S256") throw new Error("pkce_s256_required");
  const owner_id = await configuredOwnerId();
  const code = randomCode();
  await rest("code_labs_oauth_grants", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ code_hash: await hex(code), owner_id, session_id: null, client_id, redirect_uri, code_challenge: challenge, scope: SCOPE, expires_at: new Date(Date.now() + 120000).toISOString() }) });
  const target = new URL(redirect_uri); target.searchParams.set("code", code); const state = u.searchParams.get("state"); if (state) target.searchParams.set("state", state);
  return target.toString();
}
function params(req: Request, text: string) { if ((req.headers.get("content-type") || "").includes("application/json")) { try { return JSON.parse(text || "{}"); } catch { return {}; } } return Object.fromEntries(new URLSearchParams(text)); }
async function issue(owner_id: string) {
  const configured = await configuredOwnerId();
  if (!owner_id || owner_id !== configured) throw new Error("OAuth owner is not approved for Code Labs V104.");
  return { access_token: await sign({ typ: "access", exp: now() + 3600, scope: SCOPE, sub: owner_id, owner_id }), refresh_token: await sign({ typ: "refresh", exp: now() + 1209600, scope: SCOPE, sub: owner_id, owner_id }), token_type: "Bearer", expires_in: 3600, scope: SCOPE };
}
export async function token(req: Request) {
  const p = params(req, await req.text()); const grant = String(p.grant_type || "authorization_code");
  if (grant === "refresh_token") { const old = await verify(String(p.refresh_token || ""), "refresh"); return await issue(String(old.owner_id || old.sub || "")); }
  if (grant !== "authorization_code") throw new Error("unsupported_grant_type");
  const code_hash = await hex(String(p.code || ""));
  const rows = await rest("code_labs_oauth_grants?select=*&code_hash=eq." + encodeURIComponent(code_hash) + "&used_at=is.null&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&limit=1");
  const row = Array.isArray(rows) ? rows[0] : null; if (!row) throw new Error("Authorization code is invalid, expired, or already used.");
  if (String(p.client_id || "") !== String(row.client_id || "")) throw new Error("client_id_mismatch");
  if (redirectUri(p.redirect_uri || "") !== String(row.redirect_uri || "")) throw new Error("redirect_uri_mismatch");
  if (b64(await bytes(String(p.code_verifier || ""))) !== String(row.code_challenge || "")) throw new Error("pkce_verification_failed");
  const used = await rest("code_labs_oauth_grants?code_hash=eq." + encodeURIComponent(code_hash) + "&used_at=is.null", { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ used_at: new Date().toISOString() }) });
  if (!Array.isArray(used) || !used[0]) throw new Error("Authorization code was already used.");
  return await issue(String(row.owner_id));
}
export async function binding(req: Request): Promise<Binding> {
  const auth = req.headers.get("authorization") || ""; if (!auth.startsWith("Bearer ")) throw new Error("Missing bearer token.");
  const payload = await verify(auth.slice(7), "access"); const owner_id = String(payload.owner_id || payload.sub || "");
  const configured = await configuredOwnerId();
  if (!owner_id || owner_id !== configured) throw new Error("OAuth owner is not approved for Code Labs V104.");
  return { owner_id };
}
