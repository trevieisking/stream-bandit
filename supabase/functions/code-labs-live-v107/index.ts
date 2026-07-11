const VERSION = "Code Labs Live V107 no-secret session bridge";
const SUPABASE_URL = "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const PUBLIC_KEY = "sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
function rpc(id, result) {
  return json({ jsonrpc: "2.0", id: id ?? null, result });
}
function rpcError(id, code, message, status = 400) {
  return json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);
}

async function sha256Bytes(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || ""))));
}
async function connectionId(meta) {
  const raw = String(meta?.["openai/session"] || meta?.["openai/subject"] || "");
  if (!raw) throw new Error("ChatGPT did not provide a session identity. Start a fresh chat and try again.");
  const bytes = await sha256Bytes("code-labs-live-v107:" + raw);
  const hex = Array.from(bytes.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [hex.slice(0, 8), hex.slice(8, 12), "4" + hex.slice(13, 16), "a" + hex.slice(17, 20), hex.slice(20, 32)].join("-");
}

async function callRpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: PUBLIC_KEY,
      Authorization: `Bearer ${PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body || {}),
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data.message || data.error || "Code Labs Live request failed.");
  return data;
}

function safeObject(value, max = 300000) {
  const text = JSON.stringify(value || {});
  if (text.length > max) throw new Error("The live command is too large.");
  return JSON.parse(text);
}
function isDangerous(value) {
  return /(delete|remove|trash|merge|publish|deploy|send|submit|approve|reject|production|main branch)/i.test(String(value || ""));
}
async function ensureRegistered(meta) {
  const id = await connectionId(meta);
  await callRpc("code_labs_live_register_v107", { p_connection_id: id });
  return id;
}

async function readLive(meta) {
  const id = await ensureRegistered(meta);
  return await callRpc("code_labs_live_read_v107", { p_connection_id: id });
}
async function enqueue(meta, command, dangerous = false) {
  const id = await ensureRegistered(meta);
  return await callRpc("code_labs_live_enqueue_v107", {
    p_connection_id: id,
    p_command: safeObject(command),
    p_dangerous: dangerous,
  });
}
async function readReceipt(meta, commandId) {
  const id = await ensureRegistered(meta);
  return await callRpc("code_labs_live_receipt_v107", {
    p_connection_id: id,
    p_command_id: commandId || null,
  });
}
async function closeLive(meta) {
  const id = await connectionId(meta);
  return await callRpc("code_labs_live_close_v107", { p_connection_id: id });
}

function toolList() {
  const fingerprint = { type: "string", description: "Current page fingerprint returned by read_live_code_labs_page." };
  return [
    {
      name: "get_live_code_labs_pairing",
      title: "Get Live Code Labs Pairing",
      description: "Use this when checking the browser-approved Code Labs workspace, current page, online state, and expiry.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
      name: "read_live_code_labs_page",
      title: "Read Live Code Labs Page",
      description: "Use this when reading every safe section, field, action, and latest receipt from the browser-approved live Code Labs page.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
      name: "write_live_code_labs_fields",
      title: "Write Live Code Labs Fields",
      description: "Use this when writing the smallest approved field set on the current live Code Labs page.",
      inputSchema: {
        type: "object",
        properties: { expected_page_fingerprint: fingerprint, fields: { type: "object", additionalProperties: true } },
        required: ["expected_page_fingerprint", "fields"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "write_live_code_labs_section",
      title: "Write Live Code Labs Section",
      description: "Use this when writing approved fields belonging to one named section on the current live Code Labs page.",
      inputSchema: {
        type: "object",
        properties: {
          expected_page_fingerprint: fingerprint,
          section_key: { type: "string" },
          fields: { type: "object", additionalProperties: true },
        },
        required: ["expected_page_fingerprint", "section_key", "fields"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "run_live_code_labs_action",
      title: "Run Live Code Labs Action",
      description: "Use this when pressing one approved page action by stable action key. Dangerous actions require explicit confirmation.",
      inputSchema: {
        type: "object",
        properties: {
          expected_page_fingerprint: fingerprint,
          action_key: { type: "string" },
          confirmed: { type: "boolean" },
          allow_dangerous: { type: "boolean" },
        },
        required: ["expected_page_fingerprint", "action_key"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "read_live_code_labs_receipt",
      title: "Read Live Code Labs Receipt",
      description: "Use this when reading a queued command result or the latest live-page receipt.",
      inputSchema: { type: "object", properties: { command_id: { type: "string" } }, additionalProperties: false },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    {
      name: "undo_live_code_labs_write",
      title: "Undo Live Code Labs Write",
      description: "Use this when undoing the most recent Buddy bridge field write on the current live page.",
      inputSchema: {
        type: "object",
        properties: { expected_page_fingerprint: fingerprint },
        required: ["expected_page_fingerprint"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    {
      name: "close_live_code_labs_pairing",
      title: "Close Live Code Labs Pairing",
      description: "Use this when closing the current browser-approved Code Labs session.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
  ];
}

async function callTool(name, args, meta) {
  if (name === "get_live_code_labs_pairing" || name === "read_live_code_labs_page") return await readLive(meta);
  if (name === "write_live_code_labs_fields") {
    const fields = safeObject(args.fields || {});
    if (!Object.keys(fields).length || Object.keys(fields).length > 100) throw new Error("Provide between 1 and 100 field writes.");
    return await enqueue(meta, {
      type: "write_fields",
      expected_page_fingerprint: String(args.expected_page_fingerprint || ""),
      fields,
    });
  }
  if (name === "write_live_code_labs_section") {
    const section = String(args.section_key || "").slice(0, 180);
    if (!section) throw new Error("section_key is required.");
    return await enqueue(meta, {
      type: "write_section",
      expected_page_fingerprint: String(args.expected_page_fingerprint || ""),
      section,
      fields: safeObject(args.fields || {}),
    });
  }
  if (name === "run_live_code_labs_action") {
    const action = String(args.action_key || "").slice(0, 220);
    if (!action) throw new Error("action_key is required.");
    const dangerous = isDangerous(action);
    if (dangerous && !(args.confirmed === true && args.allow_dangerous === true)) {
      throw new Error("This action requires explicit confirmed=true and allow_dangerous=true.");
    }
    return await enqueue(meta, {
      type: "run_action",
      expected_page_fingerprint: String(args.expected_page_fingerprint || ""),
      action,
      confirmed: args.confirmed === true,
      allow_dangerous: args.allow_dangerous === true,
    }, dangerous);
  }
  if (name === "read_live_code_labs_receipt") return await readReceipt(meta, String(args.command_id || ""));
  if (name === "undo_live_code_labs_write") {
    return await enqueue(meta, {
      type: "undo",
      expected_page_fingerprint: String(args.expected_page_fingerprint || ""),
    });
  }
  if (name === "close_live_code_labs_pairing") return await closeLive(meta);
  throw new Error("Unknown tool.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: true, version: VERSION, tools: toolList() });

  const body = await req.json().catch(() => ({}));
  const id = body.id ?? null;
  try {
    if (body.jsonrpc !== "2.0") return json({ ok: false, version: VERSION, error: "JSON-RPC 2.0 required." }, 400);
    if (body.method === "initialize") {
      return rpc(id, {
        protocolVersion: "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "code-labs-live-v107", version: VERSION },
        instructions: "Use the browser-approved Code Labs session. Read first, write the smallest field set, inspect receipts, and never bypass confirmation for dangerous actions.",
      });
    }
    if (body.method === "ping") return rpc(id, {});
    if (body.method === "notifications/initialized") return new Response(null, { status: 202, headers: corsHeaders });
    if (body.method === "tools/list") return rpc(id, { tools: toolList() });
    if (body.method === "resources/list") return rpc(id, { resources: [] });
    if (body.method === "prompts/list") return rpc(id, { prompts: [] });
    if (body.method === "tools/call") {
      const meta = body.params?._meta || {};
      const result = await callTool(body.params?.name || "", body.params?.arguments || {}, meta);
      return rpc(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
        isError: false,
      });
    }
    return rpcError(id, -32601, "Unknown method", 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return rpc(id, {
      content: [{ type: "text", text: message }],
      structuredContent: { ok: false, version: VERSION, error: message },
      isError: true,
    });
  }
});
