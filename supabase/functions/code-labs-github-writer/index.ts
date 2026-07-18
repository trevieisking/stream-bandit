import { binding, rest } from "../code-labs-mcp-stub/oauth.ts";
import { executeGithubWriter } from "../code-labs-mcp-stub/github-writer.ts";

type Row = Record<string, any>;

const VERSION = "Code Labs V104 GitHub Writer v2";
const PROJECT_URL = "https://xzxqfrvqdgkzwujbkdbk.supabase.co";
const BASE = PROJECT_URL + "/functions/v1/code-labs-github-writer";
const AUTH_SERVER = PROJECT_URL + "/functions/v1/code-labs-mcp-stub";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...cors,
      ...extra,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const rpc = (id: unknown, result: unknown) => json({ jsonrpc: "2.0", id: id ?? null, result });
const rpcError = (id: unknown, code: number, message: string, status = 400) =>
  json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);

const writerTool = {
  name: "execute_code_labs_github_writer",
  title: "Execute Reviewed GitHub Writer Request",
  description:
    "Use this only for an already queued Code Labs request with Code God PASS. It verifies an existing non-protected branch, commits exactly one complete reviewed file through the configured GitHub App, and opens or reuses a draft pull request. It cannot write to main, merge, delete, force-push, or modify workflow files.",
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

async function reserveWorkspace(ownerId: string, expected: number) {
  if (!Number.isFinite(expected)) {
    throw new Error("expected_state_version is required. Read the workspace again before writing.");
  }

  const workspace = await rest("rpc/code_labs_reserve_workspace_state_json", {
    method: "POST",
    body: JSON.stringify({
      p_owner_id: ownerId,
      p_expected_state_version: expected,
    }),
  });

  if (
    !workspace ||
    Array.isArray(workspace) ||
    String(workspace.owner_id || "") !== ownerId ||
    Number(workspace.state_version) !== expected + 1
  ) {
    throw new Error("Workspace state changed. Read the workspace again before writing.");
  }

  return workspace;
}

async function execute(req: Request, args: Row) {
  const auth = await binding(req);
  const requestId = String(args.request_id || "").trim();
  const expected = Number(args.expected_state_version);

  if (!requestId) throw new Error("request_id is required.");
  if (args.confirmed !== true) throw new Error("confirmed must be true.");

  const workspace = await reserveWorkspace(auth.owner_id, expected);
  const result: any = await executeGithubWriter(auth, {
    request_id: requestId,
    confirmed: true,
  });

  return {
    ok: true,
    version: VERSION,
    tool: writerTool.name,
    wrote_database: result?.wrote_database === true,
    wrote_github: result?.wrote_github === true,
    opened_pr: result?.opened_pr === true,
    deleted_anything: false,
    workspace: {
      owner_id: workspace.owner_id,
      state_version: workspace.state_version,
    },
    github: result?.github || null,
    request: result?.request
      ? {
          id: result.request.id,
          status: result.request.status,
          repo: result.request.repo,
          path: result.request.path,
          branch: result.request.branch,
          github_commit_sha: result.request.github_commit_sha,
          github_content_sha: result.request.github_content_sha,
          pull_request_number: result.request.pull_request_number,
          pull_request_url: result.request.pull_request_url,
        }
      : null,
  };
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
        architecture: "writer-only",
        tools: [writerTool],
        endpoint: BASE,
      });
    }

    const body = await req.json().catch(() => ({}));
    const id = body.id ?? null;

    if (body.jsonrpc === "2.0") {
      if (body.method === "initialize") {
        return rpc(id, {
          protocolVersion: "2025-06-18",
          capabilities: { tools: { listChanged: true } },
          serverInfo: { name: "code-labs-github-writer", version: VERSION },
          instructions:
            "This connector exposes one reviewed branch-and-draft-PR writer. Never target main, merge, delete, or force-push.",
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
        if (body.params?.name !== writerTool.name) {
          return rpcError(id, -32601, "Unknown tool.", 404);
        }
        const result = await execute(req, body.params?.arguments || {});
        return rpc(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
          isError: false,
        });
      }
      return rpcError(id, -32601, "Unknown method.", 404);
    }

    const toolName = body.tool || body.name || "";
    if (toolName !== writerTool.name) throw new Error("Unknown tool.");
    return json(await execute(req, body));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /Missing bearer token|OAuth token|sign-in/i.test(message) ? 401 : 400;
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
        ? { "WWW-Authenticate": `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"` }
        : {},
    );
  }
});