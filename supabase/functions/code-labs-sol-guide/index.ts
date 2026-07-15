import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const VERSION = "Code Labs Sol Guide V220";
const API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-terra";
const URL = Deno.env.get("SUPABASE_URL") || "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "";
const ALLOWED = new Set([
  "https://chatterfriendsstreambandit.co.uk",
  "https://www.chatterfriendsstreambandit.co.uk",
]);

function headers(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.has(origin) ? origin : "https://chatterfriendsstreambandit.co.uk",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function reply(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headers(req) });
}

function text(value: unknown, limit: number) {
  return String(value == null ? "" : value).slice(0, limit);
}

function page(value: unknown) {
  const p = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    page: text(p.page, 300),
    title: text(p.title, 500),
    url: text(p.url, 2000),
    headings: Array.isArray(p.headings) ? p.headings.slice(0, 24).map((v) => text(v, 300)) : [],
    visible_text: text(p.visible_text, 12000),
    button_labels: Array.isArray(p.button_labels) ? p.button_labels.slice(0, 40).map((v) => text(v, 200)) : [],
    links: Array.isArray(p.links) ? p.links.slice(0, 40) : [],
  };
}

async function requireOwner(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) throw new Error("Sign in to Code Labs first.");
  if (!URL || !ANON) throw new Error("Code Labs authentication is not configured.");
  const client = createClient(URL, ANON, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const userResult = await client.auth.getUser();
  const user = userResult.data.user;
  if (userResult.error || !user) throw new Error("Your Code Labs sign-in has expired.");
  const owner = await client.from("code_labs_owners").select("user_id").eq("user_id", user.id).maybeSingle();
  if (owner.error || !owner.data) throw new Error("This account is not approved for Code Labs.");
}

function outputText(result: Record<string, unknown>) {
  if (typeof result.output_text === "string") return result.output_text;
  const output = Array.isArray(result.output) ? result.output as Array<Record<string, unknown>> : [];
  const parts: string[] = [];
  for (const item of output) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content as Array<Record<string, unknown>>) {
      if (part.type === "output_text" && typeof part.text === "string") parts.push(part.text);
    }
  }
  return parts.join("\n").trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(req) });
  if (req.method !== "POST") return reply(req, { ok: false, error: "POST required" }, 405);
  try {
    await requireOwner(req);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    if (text(body.action, 40) === "health") {
      return reply(req, { ok: true, version: VERSION, configured: Boolean(API_KEY) });
    }
    if (!API_KEY) return reply(req, { ok: false, error: "Sol is waiting for its server-side AI key." });
    const message = text(body.message, 12000).trim();
    if (!message) return reply(req, { ok: false, error: "Message required" });
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    const input = JSON.stringify({ current_page: page(body.page), recent_chat: history, user_request: message });
    const request: Record<string, unknown> = {
      model: MODEL,
      instructions: [
        "You are Sol, the read-only page guide inside Code Labs for a non-coder.",
        "Explain the current page in simple language and suggest the next safe normal workflow step.",
        "You have no tools. Never claim to click, edit, save, delete, publish, deploy, merge, open a pull request, or change GitHub, Supabase, files, fields, or settings.",
        "Never request or reveal passwords, tokens, API keys, private keys, or hidden reasoning.",
        "When an action is needed, describe what the user or ChatGPT should do without pretending it happened.",
      ].join("\n"),
      input,
      max_output_tokens: 1800,
      store: true,
    };
    const previous = text(body.previous_response_id, 160);
    if (previous) request.previous_response_id = previous;
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const result = await upstream.json().catch(() => ({})) as Record<string, unknown>;
    if (!upstream.ok) {
      console.error("Sol guide upstream failure", { status: upstream.status });
      throw new Error("Sol could not complete this guide request. Try again shortly.");
    }
    return reply(req, {
      ok: true,
      version: VERSION,
      response_id: text(result.id, 160),
      text: outputText(result),
    });
  } catch (error) {
    const message = text((error as Error).message || error, 500);
    const status = /sign in|expired|approved|authentication/i.test(message) ? 401 : 200;
    return reply(req, { ok: false, error: message || "Sol guide is unavailable." }, status);
  }
});