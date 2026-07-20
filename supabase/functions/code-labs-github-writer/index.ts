type Row = Record<string, unknown>;

const VERSION = "Code Labs V104 GitHub Writer clean proxy v8";
const PROJECT_URL = "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const BASE = PROJECT_URL + "/functions/v1/code-labs-github-writer";
const AUTH_SERVER = PROJECT_URL + "/functions/v1/code-labs-mcp-stub";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...cors,
      ...extra,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const rpc = (id: unknown, result: unknown) =>
  json({ jsonrpc: "2.0", id: id ?? null, result });

const rpcError = (
  id: unknown,
  code: number,
  message: string,
  status = 400,
) => json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);

const writerTool = {
  name: "execute_code_labs_github_writer",
  title: "Execute Reviewed GitHub Writer Request",
  description:
    "Execute one already queued and Code God-approved Code Labs request through the guarded Code Labs backend. The backend verifies the existing non-main branch, commits one complete reviewed file through the configured GitHub App, and opens or reuses a draft pull request. It cannot write to main, merge, delete, force-push, or modify workflow files.",
  inputSchema: {
    type: "object",
    properties: {
      request_id: { type: "string" },
      expected_state_version: { type: "number", minimum: 1 },
      confirmed: { type: "boolean" },
    },
    required: ["request_id", "expected_state_version", "confirmed"],
    additionalProperties: false,
  },
  outputSchema: { type: "object", additionalProperties: true },
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: false,
  },
};

function authorization(req: Request) {
  const value = String(req.headers.get("authorization") || "").trim();
  if (!value) throw new Error("Missing Code Labs OAuth authorization.");
  return value;
}

async function execute(req: Request, args: Row) {
  const requestId = String(args.request_id || "").trim();
  const expected = Number(args.expected_state_version);

  if (!requestId) throw new Error("request_id is required.");
  if (!Number.isSafeInteger(expected) || expected < 1) {
    throw new Error(
      "expected_state_version is required. Read the workspace again before writing.",
    );
  }
  if (args.confirmed !== true) throw new Error("confirmed must be true.");

  const upstream = await fetch(AUTH_SERVER, {
    method: "POST",
    headers: {
      Authorization: authorization(req),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tools/call",
      params: {
        name: "execute_code_labs_github_writer",
        arguments: {
          request_id: requestId,
          expected_state_version: expected,
          confirmed: true,
        },
      },
    }),
  });

  const payload = await upstream.json().catch(() => null) as Record<string, unknown> | null;
  if (!upstream.ok) {
    throw new Error("The guarded Code Labs Writer request was not accepted.");
  }

  const rpcFailure = payload?.error as Record<string, unknown> | undefined;
  if (rpcFailure) {
    throw new Error(String(rpcFailure.message || "The guarded Writer failed."));
  }

  const result = payload?.result as Record<string, unknown> | undefined;
  const structured = result?.structuredContent as Record<string, unknown> | undefined;
  if (!structured || structured.ok !== true) {
    throw new Error("The guarded Code Labs Writer did not return verified proof.");
  }

  return structured;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const path = new URL(req.url).pathname;

  try {
    if (path.endsWith("/.well-known/oauth-protected-resource")) {
      return json({
        resource: BASE,
        authorization_servers: [AUTH_SERVER],
        bearer_methods_supported: ["header"],
        scopes_supported: ["code_labs.read", "code_labs.write"],
      });
    }

    if (req.method !== "POST") {
      return json({
        ok: true,
        version: VERSION,
        connector: "code-labs-github-writer",
        architecture: "guarded-code-labs-proxy",
        tools: [writerTool],
        endpoint: BASE,
      });
    }

    const body = await req.json().catch(() => ({})) as Row;
    const id = body.id ?? null;

    if (body.jsonrpc === "2.0") {
      if (body.method === "initialize") {
        return rpc(id, {
          protocolVersion: "2025-06-18",
          capabilities: { tools: { listChanged: true } },
          serverInfo: { name: "code-labs-github-writer", version: VERSION },
          instructions:
            "This connector forwards only the reviewed request ID, workspace state and confirmation to the guarded Code Labs backend. GitHub App credentials and installation tokens remain server-side.",
        });
      }
      if (body.method === "ping") return rpc(id, {});
      if (body.method === "notifications/initialized") {
        return new Response(null, { status: 202, headers: cors });
      }
      if (body.method === "tools/list") return rpc(id, { tools: [writerTool] });
      if (body.method === "resources/list") return rpc(id, { resources: [] });
      if (body.method === "prompts/list") return rpc(id, { prompts: [] });
      if (body.method === "tools/call") {
        const params = body.params as Row | undefined;
        if (params?.name !== writerTool.name) {
          return rpcError(id, -32601, "Unknown tool.", 404);
        }
        const result = await execute(req, (params?.arguments || {}) as Row);
        return rpc(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
          isError: false,
        });
      }
      return rpcError(id, -32601, "Unknown method.", 404);
    }

    const toolName = String(body.tool || body.name || "");
    if (toolName !== writerTool.name) throw new Error("Unknown tool.");
    return json(await execute(req, body));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /authorization|OAuth|sign-in/i.test(message) ? 401 : 400;
    return json(
      {
        ok: false,
        version: VERSION,
        error: message,
        wrote_database: false,
        wrote_github: false,
        opened_pr: false,
        deleted_anything: false,
      },
      status,
      status === 401
        ? {
            "WWW-Authenticate":
              `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"`,
          }
        : {},
    );
  }
});
