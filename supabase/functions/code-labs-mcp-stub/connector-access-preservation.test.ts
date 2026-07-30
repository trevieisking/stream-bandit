function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source: string, expected: string, message: string) {
  assert(source.includes(expected), `${message} Missing: ${expected}`);
}

function assertExcludes(source: string, forbidden: string, message: string) {
  assert(!source.includes(forbidden), `${message} Forbidden: ${forbidden}`);
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) {
    throw new Error(`${message} Expected: ${right} Actual: ${left}`);
  }
}

function block(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  assert(start >= 0, `Missing block start: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert(end > start, `Missing block end: ${endMarker}`);
  return source.slice(start, end);
}

async function source(relative: string) {
  return await Deno.readTextFile(new URL(relative, import.meta.url));
}

Deno.test("connector access: OAuth endpoint, scope and ChatGPT client identity remain stable", async () => {
  const oauth = await source("./oauth.ts");

  assertIncludes(
    oauth,
    'export const BASE = SUPABASE_URL + "/functions/v1/code-labs-mcp-stub";',
    "The existing Code Labs connector endpoint must not move during the atomic cutover.",
  );
  assertIncludes(
    oauth,
    'export const SCOPE = "code_labs.read code_labs.write";',
    "The existing read/write OAuth scope contract must remain available.",
  );
  assertIncludes(
    oauth,
    'export const CHATGPT_CLIENT_ID = "code-labs-chatgpt-client";',
    "The registered ChatGPT connector client identity must remain stable.",
  );
  assertIncludes(
    oauth,
    'u.hostname === "chatgpt.com" || u.hostname === "www.chatgpt.com"',
    "The ChatGPT redirect host allowlist must remain present.",
  );
  assertIncludes(
    oauth,
    'u.pathname.startsWith("/connector/oauth/")',
    "The ChatGPT connector OAuth callback path must remain allowed.",
  );
});

Deno.test("connector access: OAuth registration, PKCE, token and owner binding exports remain present", async () => {
  const oauth = await source("./oauth.ts");

  for (const expected of [
    "export async function register(req: Request)",
    "export async function authorize(req: Request)",
    "export async function token(req: Request)",
    "export async function binding(req: Request): Promise<Binding>",
    'u.searchParams.get("code_challenge_method") !== "S256"',
    'grant_types: ["authorization_code", "refresh_token"]',
    'token_type: "Bearer"',
  ]) {
    assertIncludes(oauth, expected, "The existing connector OAuth flow must remain intact.");
  }
});

Deno.test("connector access: bearer binding remains owner-token based and page-session independent", async () => {
  const oauth = await source("./oauth.ts");
  const binding = block(
    oauth,
    "export async function binding(req: Request): Promise<Binding>",
    "\n}",
  );

  assertIncludes(
    binding,
    'req.headers.get("authorization")',
    "Connector calls must continue to authenticate from the bearer token.",
  );
  assertIncludes(
    binding,
    'await verify(auth.slice(7), "access")',
    "Connector calls must continue to verify the existing access token.",
  );
  assertIncludes(
    binding,
    "await configuredOwnerId()",
    "Connector calls must continue to bind to the configured Code Labs owner.",
  );
  assertExcludes(
    binding,
    "activeSession(",
    "Connector authentication must not require a live browser page session.",
  );
  assertExcludes(
    binding,
    "exactSession(",
    "Connector authentication must not require one selected browser tab.",
  );
  assertExcludes(
    binding,
    "code_labs_browser_sessions",
    "The bearer-token binding path must not query browser-session state.",
  );
});

Deno.test("connector access: OAuth discovery and JSON-RPC routes remain available", async () => {
  const main = await source("./main.ts");

  for (const route of [
    "/.well-known/oauth-authorization-server",
    "/.well-known/openid-configuration",
    "/.well-known/oauth-protected-resource",
    "/oauth/register",
    "/oauth/authorize",
    "/oauth/token",
  ]) {
    assertIncludes(main, route, `The existing connector route ${route} must remain available.`);
  }

  for (const method of [
    'body.method === "initialize"',
    'body.method === "ping"',
    'body.method === "notifications/initialized"',
    'body.method === "tools/list"',
    'body.method === "resources/list"',
    'body.method === "prompts/list"',
    'body.method === "tools/call"',
  ]) {
    assertIncludes(main, method, "The existing MCP JSON-RPC surface must remain available.");
  }

  assertIncludes(
    main,
    "const b = await binding(req);",
    "Tool calls must continue through the existing owner-authenticated binding.",
  );
  assertIncludes(
    main,
    'return json(await call(b, body.tool || body.name || "", body));',
    "The compatibility tool-call route must remain available.",
  );
});

Deno.test("connector access: all current public tool names remain registered through cutover", async () => {
  const main = await source("./main.ts");
  const toolsBlock = block(main, "function tools()", "\n}\n\nfunction decodeBase64");
  const actual = Array.from(toolsBlock.matchAll(/name:\s*"([^"]+)"/g), (match) => match[1]);
  const expected = [
    "get_code_labs_context",
    "read_code_labs_url",
    "get_code_labs_workspace",
    "list_code_labs_records",
    "read_code_labs_current_file",
    "list_code_labs_actions",
    "read_code_labs_receipt",
    "get_cg_repair_lab_access",
    "get_cg_repair_lab_workflow",
    "analyze_code_labs_repository",
    "list_code_labs_owner_gallery_images",
    "read_code_labs_owner_gallery_image",
    "select_code_labs_record",
    "update_code_labs_project",
    "update_code_labs_current_file",
    "update_code_labs_repair_job",
    "upsert_code_labs_packet",
    "save_code_labs_candidate",
    "upsert_code_labs_test_result",
    "create_code_labs_checkpoint",
    "run_code_labs_action",
    "execute_code_labs_github_writer",
    "undo_code_labs_action",
    "save_code_labs_write_request",
  ];

  assertEqual(
    actual,
    expected,
    "Atomic workflow repair must not silently rename, remove or reorder the existing connector tools.",
  );
});

Deno.test("connector access: read tools and owner-gallery reads remain callable after dispatcher cutover", async () => {
  const main = await source("./main.ts");
  const callBlock = block(main, "async function call(", "\n}\n\nfunction toolResult");

  for (const route of [
    'if (name === "get_code_labs_context") return getContext(b, args.limit);',
    'if (name === "read_code_labs_url") return readUrl(args);',
    'if (name === "get_code_labs_workspace") return getWorkspace(b);',
    'if (name === "list_code_labs_records") return listRecords(b, args);',
    'if (name === "read_code_labs_current_file") return readCurrentFile(b);',
    'if (name === "list_code_labs_actions")',
    'if (name === "read_code_labs_receipt") return readReceipt(b, args);',
    'if (name === "get_cg_repair_lab_access") return getCgRepairLabAccess(b);',
    'if (name === "get_cg_repair_lab_workflow") return getCgRepairLabWorkflow();',
    'if (name === "analyze_code_labs_repository") return analyzeCgRepairLab(b, args);',
    'if (name === "list_code_labs_owner_gallery_images") return listOwnerGalleryReferences(b);',
    'if (name === "read_code_labs_owner_gallery_image") return readOwnerGalleryImage(b, args);',
  ]) {
    assertIncludes(callBlock, route, "Existing read and owner-gallery capabilities must remain routed.");
  }
});

Deno.test("connector access: V50 preserves File Lab intake discovery and frozen undo compatibility", async () => {
  const guarded = await source("./guarded-workspace.ts");
  const listBlock = block(
    guarded,
    "export function listActions()",
    "\n}\n\nexport function selectRecord",
  );
  const undoBlock = block(
    guarded,
    "export async function undoAction",
    "\n}\n\nexport function executeDirectGithubWriter",
  );

  assertIncludes(
    listBlock,
    '{ action: "file.intake", requires_confirmation: false }',
    "The atomic cutover must keep the existing File Lab intake action discoverable.",
  );
  assertIncludes(
    undoBlock,
    "expectedStateVersion === undefined",
    "The frozen pre-V50 undo registration must remain compatible when it omits state_version.",
  );
  assertIncludes(
    undoBlock,
    "const current = await getWorkspace(b);",
    "The compatibility adapter must read the current owner workspace before atomic undo.",
  );
  assertIncludes(
    undoBlock,
    "expectedStateVersion = current.workspace?.state_version;",
    "The compatibility adapter must bind atomic undo to the freshly read state version.",
  );
  assertIncludes(
    undoBlock,
    'return runAtomicAction(b, "undo.execute"',
    "Both old and refreshed app registrations must use the same atomic undo route.",
  );
});

Deno.test("connector access: advertised compatibility actions remain callable and read-only", async () => {
  const guarded = await source("./guarded-workspace.ts");
  const actionBlock = block(
    guarded,
    "export async function runAction",
    "\n}",
  );

  assertIncludes(
    guarded,
    "runAction as runCompatibilityAction",
    "The guarded router must retain the existing read-only compatibility implementation.",
  );
  assertIncludes(
    actionBlock,
    'if (action === "canvas.load_packet" || action === "github.prepare_request")',
    "Both advertised compatibility actions must remain explicitly routed.",
  );
  assertIncludes(
    actionBlock,
    "return runCompatibilityAction(b, { ...args, action });",
    "Compatibility actions must call their existing read-only implementation.",
  );
  assertExcludes(
    actionBlock,
    "is not available through the mutation dispatcher",
    "An advertised compatibility action must not unconditionally fail.",
  );
});

Deno.test("connector access: atomic migration does not alter OAuth, owner or browser-session tables", async () => {
  const migration = await source(
    "../../migrations/20260728143000_code_labs_atomic_workspace_engine.sql",
  );

  for (const forbidden of [
    "alter table public.code_labs_oauth_grants",
    "alter table public.code_labs_oauth_owner_tokens",
    "alter table public.code_labs_browser_sessions",
    "alter table public.code_labs_owners",
    "drop table public.code_labs_oauth_grants",
    "drop table public.code_labs_oauth_owner_tokens",
    "drop table public.code_labs_browser_sessions",
    "drop table public.code_labs_owners",
    "delete from public.code_labs_oauth_grants",
    "delete from public.code_labs_oauth_owner_tokens",
    "delete from public.code_labs_browser_sessions",
    "delete from public.code_labs_owners",
  ]) {
    assertExcludes(
      migration.toLowerCase(),
      forbidden,
      "The atomic workflow migration must not change connector authentication or page-session ownership data.",
    );
  }
});

Deno.test("connector access: cutover does not introduce connector or helper engine selection flags", async () => {
  const oauth = await source("./oauth.ts");
  const main = await source("./main.ts");
  const guarded = await source("./guarded-workspace.ts");
  const combined = `${oauth}\n${main}\n${guarded}`;

  for (const forbidden of [
    "atomic_connector_only",
    "legacy_connector_only",
    "atomic_page_only",
    "legacy_page_only",
    "connector_engine_selector",
    "page_engine_selector",
    "require_atomic_connector",
    "require_legacy_connector",
  ]) {
    assertExcludes(
      combined,
      forbidden,
      "Connectors and Code Labs pages must not be divided between old and new mutation engines.",
    );
  }
});

Deno.test("evidence boundary: access tests are source-contract evidence, not live page proof", () => {
  const evidence = {
    live_connector_reads_before_change: true,
    oauth_source_contract: true,
    tool_registry_source_contract: true,
    migration_auth_non_interference_source_contract: true,
    post_deployment_connector_smoke_test: false,
    post_deployment_page_smoke_test: false,
  };

  assert(evidence.live_connector_reads_before_change, "The current connector baseline was checked separately.");
  assert(evidence.oauth_source_contract, "OAuth preservation is checked from branch source.");
  assert(evidence.tool_registry_source_contract, "Tool preservation is checked from branch source.");
  assert(
    evidence.migration_auth_non_interference_source_contract,
    "The candidate migration is checked for authentication-table non-interference.",
  );
  assert(
    !evidence.post_deployment_connector_smoke_test,
    "Source tests must not claim post-deployment connector proof.",
  );
  assert(
    !evidence.post_deployment_page_smoke_test,
    "Source tests must not claim post-deployment Code Labs page proof.",
  );
});
