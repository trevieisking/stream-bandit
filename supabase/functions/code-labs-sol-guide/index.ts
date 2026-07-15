import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const VERSION = "Code Labs Sol Guide V220";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-terra";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const ORIGINS = new Set([
  "https://chatterfriendsstreambandit.co.uk",
  "https://www.chatterfriendsstreambandit.co.uk",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(origin) ? origin : "https://chatterfriendsstreambandit.co.uk",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function clip(value: unknown, max: number) {
  return String(value == null ? "" : value).slice(0, max);
}

function cleanList(value: unknown, maxItems: number, maxText: number) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => {
    if (typeof item === "string") return clip(item, maxText);
    if (!item || typeof item !== "object") return item;
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(item as Record<string, unknown>)) {
      out[key] = typeof entry === "string" ? clip(entry, maxText) : entry;
    }
    return out;
  });
}

function cleanPage(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const page = value as Record<string, unknown>;
  return {
    page: clip(page.page, 300),
    title: clip(page.title, 500),
    url: clip(page.url, 2000),
    headings: cleanList(page.headings, 24, 500),
    visible_text: clip(page.visible_text, 12000),
    button_labels: cleanList(page.button_labels, 40, 300),
    links: cleanList(page.links, 40, 700),
  };
}

async function requireOwner(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) throw new Error("Sign in to Code Labs first.");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Code Labs authentication is not configured.");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;
  if (userResult.error || !user) throw new Error("Your Code Labs sign-in has expired. Sign in again and retry.");
  const ownerResult = await supabase.from("code_labs_owners").select("user_id").eq("user_id", user.id).maybeSingle();
  if (ownerResult.error || !ownerResult.data) throw new Error("This account is not approved to use the Code Labs Sol guide.");
}

function instructions() {
  return [
    "You are Sol, a read-only page guide inside Code Labs for a non-coder.",
    "Explain only the current visible Code Labs page, what its controls mean, and the next safe workflow step.",
    "You have no tools and cannot edit fields, click buttons, save records, change GitHub or Supabase, open pull requests, merge, publish, deploy, delete, or perform actions.",
    "Never claim an action happened. Tell the user which normal Code Labs control or workflow page they should use instead.",
    "Be patient, direct, and practical. Do not expose secrets or hidden reasoning.",
  ].join("\n");
}

function outputText(result: Record<string, unknown>) {
  if (typeof result.output_text === "string") return result.output_text;
  const output = Array.isArray(result.output) ? result.output as Array<Record<string, unknown>> : [];
  const parts: string[] = [];
  for (const item of output) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const content of item.content as Array<Record<string, unknown>>) {
      if (content.type === "output_text" && typeof content.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

async function askOpenAI(body: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Code Labs Sol guide network failure", { detail: clip((error as Error).message || error, 800) });
    throw new Error("Sol could not reach its AI service. Retry shortly.");
  }
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    console.error("Code Labs Sol guide upstream failure", { status: response.status });
    if (response.status === 401 || response.status === 403) throw new Error("Sol's AI service configuration needs administrator attention.");
    throw new Error("Sol could not complete the guide request. Retry shortly.");
  }
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, error: "POST required" }, 405);
  try {
    await requireOwner(req);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const action = clip(body.action || "chat", 40);
    if (action === "health") return json(req, { ok: true, version: VERSION, configured: Boolean(OPENAI_API_KEY), model: OPENAI_MODEL });
    if (!OPENAI_API_KEY) return json(req, { ok: false, error: "Sol is waiting for its server-side OpenAI key." });
    const message = clip(body.message, 12000).trim();
    if (!message) return json(req, { ok: false, error: "Message required" });
    const context = {
      current_page: cleanPage(body.page),
      recent_chat: cleanList(body.history, 10, 12000),
      user_request: message,
    };
    const request: Record<string, unknown> = {
      model: OPENAI_MODEL,
      instructions: instructions(),
      input: `CODE LABS PAGE GUIDE CONTEXT\n${JSON.stringify(context)}`,
      max_output_tokens: 1800,
      store: true,
    };
    const previous = clip(body.previous_response_id, 160);
    if (previous) request.previous_response_id = previous;
    const result = await askOpenAI(request);
    return json(req, {
      ok: true,
      version: VERSION,
      response_id: clip(result.id, 160),
      text: outputText(result) || "I could not produce guidance for this page.",
    });
  } catch (error) {
    const message = clip((error as Error).message || error, 1200);
    const status = /sign in|sign-in|expired|approved|authentication/i.test(message) ? 401 : 500;
    return json(req, { ok: false, error: message, version: VERSION }, status);
  }
});
