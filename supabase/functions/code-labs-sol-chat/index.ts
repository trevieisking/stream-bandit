import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const VERSION = "Code Labs Sol Chat V144";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const ORIGINS = new Set([
  "https://chatterfriendsstreambandit.co.uk",
  "https://www.chatterfriendsstreambandit.co.uk",
]);

const tools = [
  { type: "function", name: "read_live_code_labs_page", description: "Read a fresh safe snapshot of the current Code Labs page before deciding what to do.", strict: true, parameters: { type: "object", properties: {}, required: [], additionalProperties: false } },
  { type: "function", name: "write_live_code_labs_fields", description: "Write the smallest safe set of normal Code Labs fields by stable field key. Never write secrets or file inputs.", strict: true, parameters: { type: "object", properties: { expected_page: { type: "string" }, expected_page_fingerprint: { type: "string" }, fields: { type: "array", items: { type: "object", properties: { key: { type: "string" }, value: { type: ["string", "number", "boolean", "null"] } }, required: ["key", "value"], additionalProperties: false } } }, required: ["expected_page", "expected_page_fingerprint", "fields"], additionalProperties: false } },
  { type: "function", name: "write_live_code_labs_section", description: "Write safe fields belonging to one named Code Labs section.", strict: true, parameters: { type: "object", properties: { expected_page_fingerprint: { type: "string" }, section_key: { type: "string" }, fields: { type: "array", items: { type: "object", properties: { key: { type: "string" }, value: { type: ["string", "number", "boolean", "null"] } }, required: ["key", "value"], additionalProperties: false } } }, required: ["expected_page_fingerprint", "section_key", "fields"], additionalProperties: false } },
  { type: "function", name: "run_live_code_labs_action", description: "Press one page action by stable action key. Dangerous actions require explicit confirmation in the current user message.", strict: true, parameters: { type: "object", properties: { expected_page_fingerprint: { type: "string" }, action_key: { type: "string" }, confirmed: { type: "boolean" }, allow_dangerous: { type: "boolean" } }, required: ["expected_page_fingerprint", "action_key", "confirmed", "allow_dangerous"], additionalProperties: false } },
  { type: "function", name: "undo_live_code_labs_write", description: "Undo the most recent V140 page-field write on the unchanged current page.", strict: true, parameters: { type: "object", properties: {}, required: [], additionalProperties: false } },
];

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
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function text(value: unknown, max: number) { return String(value == null ? "" : value).slice(0, max); }
function safeArray(value: unknown, maxItems: number, maxText: number) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(entry as Record<string, unknown>)) {
      out[key] = typeof item === "string" ? text(item, maxText) : item;
    }
    return out;
  });
}
function compact(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const p = value as Record<string, unknown>;
  return {
    page: text(p.page, 300), page_fingerprint: text(p.page_fingerprint, 500), title: text(p.title, 500), url: text(p.url, 2000),
    repo: text(p.repo, 500), path: text(p.path, 1500), source_branch: text(p.source_branch, 500), request_branch: text(p.request_branch, 500),
    action: text(p.action, 2000), problem: text(p.problem, 12000), preserve_rules: text(p.preserve_rules, 12000), error_notes: text(p.error_notes, 12000), test_notes: text(p.test_notes, 12000),
    counts: p.counts || {}, sections: safeArray(p.sections, 80, 4000), fields: safeArray(p.fields, 240, 12000), actions: safeArray(p.actions, 160, 4000),
    current_source: text(p.current_source, 120000), fixed_output: text(p.fixed_output, 120000),
    github_writer: p.github_writer || null, github_lane: p.github_lane || null, safety_rules: p.safety_rules || null,
  };
}
function compactReadPacket(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const p = value as Record<string, unknown>;
  return {
    page: text(p.page, 300), page_fingerprint: text(p.page_fingerprint, 500), title: text(p.title, 500), url: text(p.url, 2000),
    repo: text(p.repo, 500), path: text(p.path, 1500), action: text(p.action, 1000), counts: p.counts || {},
    sections: safeArray(p.sections, 80, 1500), fields: safeArray(p.fields, 240, 4000), actions: safeArray(p.actions, 160, 1500),
  };
}
function compactToolOutput(value: unknown) {
  const raw = String(value == null ? "" : value);
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && parsed.packet) parsed.packet = compactReadPacket(parsed.packet);
    return text(JSON.stringify(parsed), 30000);
  } catch {
    return text(raw, 30000);
  }
}
function instructions() {
  return [
    "You are Sol inside Code Labs, a workbench for a non-coder.", "Be direct, patient and practical. Read before writing.",
    "Use live page tools instead of asking the user to copy or patch code manually.",
    "For page edits, write the smallest field set, inspect the receipt, then read again before claiming success.",
    "Never invent field or action keys.", "Never handle passwords, tokens, API keys, private keys, login prompts, CAPTCHA or local file selections.",
    "Never claim a repository, deployment or database change happened unless a tool receipt proves it.",
    "Repository changes remain branch-and-pull-request only.",
    "Delete, remove, publish, deploy, merge, send, submit and production actions require explicit confirmation of that exact action in the current message.",
    "Do not expose secrets or hidden reasoning.",
  ].join("\n");
}
function outputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output as Array<Record<string, unknown>> : [];
  const parts: string[] = [];
  for (const item of output) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const content of item.content as Array<Record<string, unknown>>) if (content.type === "output_text" && typeof content.text === "string") parts.push(content.text);
  }
  return parts.join("\n").trim();
}
function calls(response: Record<string, unknown>) {
  const output = Array.isArray(response.output) ? response.output as Array<Record<string, unknown>> : [];
  return output.filter((item) => item.type === "function_call").map((item) => {
    let args: unknown = {};
    try { args = JSON.parse(String(item.arguments || "{}")); } catch { args = {}; }
    return { call_id: String(item.call_id || ""), name: String(item.name || ""), arguments: args };
  }).filter((item) => item.call_id && item.name);
}
async function requireOwner(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) throw new Error("Sign in to Code Labs first.");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Code Labs authentication is not configured.");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;
  if (userResult.error || !user) throw new Error("Your Code Labs sign-in has expired. Sign in again and retry.");
  const ownerResult = await supabase.from("code_labs_owners").select("user_id").eq("user_id", user.id).maybeSingle();
  if (ownerResult.error || !ownerResult.data) throw new Error("This account is not approved to use the Code Labs Sol workbench.");
}
async function openai(body: Record<string, unknown>, stage: string) {
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    const detail = text(data?.error?.message || `OpenAI request failed (${response.status})`, 1000);
    const code = text(data?.error?.code || data?.error?.type || "upstream_error", 120);
    throw new Error(`OpenAI ${stage} failed (${response.status}, ${code}): ${detail}`);
  }
  return data as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, error: "POST required" }, 405);
  let stage = "authentication";
  try {
    await requireOwner(req);
    stage = "request";
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const action = text(body.action || "chat", 40);
    if (action === "health") return json(req, { ok: true, version: VERSION, configured: Boolean(OPENAI_API_KEY), model: OPENAI_MODEL });
    if (!OPENAI_API_KEY) return json(req, { ok: false, error: "Code Labs Sol is waiting for its server-side OpenAI key." }, 503);
    const previousResponseId = text(body.previous_response_id, 160) || undefined;
    let input: unknown;
    if (action === "tool_outputs") {
      stage = "tool-output continuation";
      if (!previousResponseId) return json(req, { ok: false, error: "Previous Sol response is missing. Start a new Sol chat and retry.", version: VERSION, stage }, 400);
      const outputs = Array.isArray(body.tool_outputs) ? body.tool_outputs : [];
      if (!outputs.length) return json(req, { ok: false, error: "Tool output is missing.", version: VERSION, stage }, 400);
      input = outputs.slice(0, 8).map((value) => {
        const item = value as Record<string, unknown>;
        return { type: "function_call_output", call_id: text(item.call_id, 160), output: compactToolOutput(item.output) };
      });
    } else {
      stage = "initial response";
      const message = text(body.message, 12000);
      if (!message.trim()) return json(req, { ok: false, error: "Message required" }, 400);
      input = `CODE LABS LIVE CONTEXT\n${JSON.stringify({ live_page: compact(body.page), recent_visible_chat: Array.isArray(body.history) ? body.history.slice(-10) : [], user_request: message })}`;
    }
    const request: Record<string, unknown> = { model: OPENAI_MODEL, instructions: instructions(), input, tools, tool_choice: "auto", parallel_tool_calls: false, max_output_tokens: 6000, store: true };
    if (previousResponseId) request.previous_response_id = previousResponseId;
    const result = await openai(request, stage);
    return json(req, { ok: true, version: VERSION, model: result.model || OPENAI_MODEL, response_id: result.id || "", text: outputText(result), tool_calls: calls(result), usage: result.usage || null });
  } catch (error) {
    const message = text((error as Error).message || error, 1400);
    const status = /sign-in|approved|authentication/i.test(message) ? 401 : 500;
    return json(req, { ok: false, error: message, version: VERSION, stage }, status);
  }
});
