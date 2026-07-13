const VERSION = "Code Labs V104 page control v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY") || "";
const INTERNAL_SECRET = Deno.env.get("CODE_LABS_OAUTH_SECRET") || "";
const CLAIMED_BY = "code-labs-v104";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://chatterfriendsstreambandit.co.uk",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-code-labs-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function requireInternalRequest(req: Request) {
  if (!INTERNAL_SECRET) throw new Error("V104 internal secret is not configured.");
  const supplied = req.headers.get("x-code-labs-secret") || "";
  if (!supplied || supplied !== INTERNAL_SECRET) throw new Error("Unauthorized V104 page-control request.");
}

async function rest(_req: Request, path: string, options: RequestInit = {}) {
  if (!SERVICE_KEY) throw new Error("Supabase service key is not configured.");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: "Bearer " + SERVICE_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(typeof data === "string" ? data.slice(0, 700) : JSON.stringify(data).slice(0, 700));
  return data;
}

function safeObject(value: unknown, max = 350000) {
  const text = JSON.stringify(value || {});
  if (text.length > max) throw new Error("Command payload is too large.");
  return JSON.parse(text);
}

function isDangerous(value: unknown) {
  return /(delete|remove|trash|merge|publish|deploy|send|submit|approve|reject|production|main branch)/i.test(String(value || ""));
}

async function activeSession(req: Request) {
  const rows = await rest(
    req,
    "code_labs_browser_sessions?select=*&status=eq.paired&claimed_by=eq." +
      encodeURIComponent(CLAIMED_BY) +
      "&control_expires_at=gt." + encodeURIComponent(new Date().toISOString()) +
      "&order=last_seen_at.desc&limit=1",
  ) as Record<string, unknown>[];

  const session = Array.isArray(rows) ? rows[0] : null;
  if (!session) throw new Error("No active V104 Code Labs page is available.");
  const lastSeen = new Date(String(session.last_seen_at || 0)).getTime();
  if (!lastSeen || Date.now() - lastSeen > 30000) throw new Error("The active Code Labs page is offline. Open the page and try again.");
  return session;
}

function requireFingerprint(session: Record<string, unknown>, expected: unknown) {
  const current = String(session.page_fingerprint || "");
  const supplied = String(expected || "");
  if (!supplied) throw new Error("expected_page_fingerprint is required. Read the page first.");
  if (!current || supplied !== current) throw new Error("The page changed. Read it again before writing.");
}

async function readPage(req: Request) {
  const session = await activeSession(req);
  return {
    ok: true,
    version: VERSION,
    session_id: session.id,
    page: session.page_name,
    page_url: session.page_url,
    page_fingerprint: session.page_fingerprint,
    last_seen_at: session.last_seen_at,
    page_snapshot: session.page_snapshot,
    last_receipt: session.last_receipt,
  };
}

async function enqueue(req: Request, body: Record<string, unknown>, command: Record<string, unknown>, dangerous = false) {
  const session = await activeSession(req);
  requireFingerprint(session, body.expected_page_fingerprint);

  const saved = await rest(req, "code_labs_browser_commands", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ session_id: session.id, requested_by: CLAIMED_BY, command: safeObject(command), dangerous }),
  }) as Record<string, unknown>[];

  const row = Array.isArray(saved) ? saved[0] : null;
  return {
    ok: true,
    version: VERSION,
    command_id: row?.id || null,
    status: row?.status || "queued",
    page: session.page_name,
    page_fingerprint: session.page_fingerprint,
  };
}

async function writeFields(req: Request, body: Record<string, unknown>) {
  const fields = safeObject(body.fields || {}, 300000) as Record<string, unknown>;
  const count = Object.keys(fields).length;
  if (count < 1 || count > 100) throw new Error("Provide between 1 and 100 field writes.");
  return await enqueue(req, body, { type: "write_fields", expected_page_fingerprint: String(body.expected_page_fingerprint || ""), fields });
}

async function writeSection(req: Request, body: Record<string, unknown>) {
  const section = String(body.section_key || "").slice(0, 180);
  if (!section) throw new Error("section_key is required.");
  return await enqueue(req, body, {
    type: "write_section",
    expected_page_fingerprint: String(body.expected_page_fingerprint || ""),
    section,
    fields: safeObject(body.fields || {}, 300000),
  });
}

async function runAction(req: Request, body: Record<string, unknown>) {
  const action = String(body.action_key || "").slice(0, 220);
  if (!action) throw new Error("action_key is required.");
  const dangerous = isDangerous(action);
  if (dangerous && !(body.confirmed === true && body.allow_dangerous === true)) {
    throw new Error("This action requires confirmed=true and allow_dangerous=true.");
  }
  return await enqueue(req, body, {
    type: "run_action",
    expected_page_fingerprint: String(body.expected_page_fingerprint || ""),
    action,
    confirmed: body.confirmed === true,
    allow_dangerous: body.allow_dangerous === true,
  }, dangerous);
}

async function undo(req: Request, body: Record<string, unknown>) {
  return await enqueue(req, body, { type: "undo", expected_page_fingerprint: String(body.expected_page_fingerprint || "") });
}

async function readReceipt(req: Request, body: Record<string, unknown>) {
  const session = await activeSession(req);
  const commandId = String(body.command_id || "");
  if (!commandId) return { ok: true, version: VERSION, session_id: session.id, receipt: session.last_receipt };

  const rows = await rest(
    req,
    "code_labs_browser_commands?select=*&id=eq." + encodeURIComponent(commandId) +
      "&session_id=eq." + encodeURIComponent(String(session.id)) + "&limit=1",
  ) as Record<string, unknown>[];

  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) throw new Error("Command receipt not found.");
  return { ok: true, version: VERSION, command_id: commandId, status: row.status, receipt: row.receipt, error: row.error };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, version: VERSION, error: "POST only" }, 405);

  try {
    requireInternalRequest(req);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action || "");
    if (action === "read_page") return json(await readPage(req));
    if (action === "write_fields") return json(await writeFields(req, body));
    if (action === "write_section") return json(await writeSection(req, body));
    if (action === "run_action") return json(await runAction(req, body));
    if (action === "undo") return json(await undo(req, body));
    if (action === "read_receipt") return json(await readReceipt(req, body));
    return json({ ok: false, version: VERSION, error: "Unknown V104 page-control action" }, 404);
  } catch (error) {
    return json({ ok: false, version: VERSION, error: error instanceof Error ? error.message : String(error) }, 400);
  }
});
