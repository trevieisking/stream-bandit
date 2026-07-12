import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const VERSION = "Code Labs Sol Chat Diagnostic Proxy V142";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const TARGET = `${SUPABASE_URL}/functions/v1/code-labs-sol-chat`;
const ORIGINS = new Set([
  "https://chatterfriendsstreambandit.co.uk",
  "https://www.chatterfriendsstreambandit.co.uk",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(origin)
      ? origin
      : "https://chatterfriendsstreambandit.co.uk",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(req),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function cleanMessage(value: unknown) {
  return String(value || "Unknown upstream error")
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 1600);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, version: VERSION, error: "POST required" }, 405);

  try {
    const body = await req.text();
    const upstream = await fetch(TARGET, {
      method: "POST",
      headers: {
        "Authorization": req.headers.get("authorization") || "",
        "apikey": req.headers.get("apikey") || "",
        "Content-Type": "application/json",
      },
      body,
    });

    const raw = await upstream.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(raw || "{}");
    } catch {
      data = { error: cleanMessage(raw) };
    }

    if (!upstream.ok || data.ok === false) {
      return json(req, {
        ok: false,
        version: VERSION,
        upstream_status: upstream.status,
        upstream_version: data.version || null,
        error: cleanMessage(data.error || raw),
      });
    }

    return json(req, { ...data, diagnostic_proxy_version: VERSION });
  } catch (error) {
    return json(req, {
      ok: false,
      version: VERSION,
      upstream_status: 0,
      error: cleanMessage(error instanceof Error ? error.message : error),
    });
  }
});
