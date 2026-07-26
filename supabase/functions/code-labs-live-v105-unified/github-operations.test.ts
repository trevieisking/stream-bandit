import { assert, assertEquals, assertFalse, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";

const root = new URL("./", import.meta.url);
const main = await Deno.readTextFile(new URL("main.ts", root));
const operations = await Deno.readTextFile(new URL("github-operations.ts", root));
const migration = await Deno.readTextFile(
  new URL("../../migrations/20260726150000_code_labs_v105_github_operations.sql", root),
);

Deno.test("V105 GitHub tool schemas omit workspace state version", () => {
  const githubSection = main.slice(main.indexOf('{ name: "read_code_labs_repository"'));
  assertFalse(githubSection.includes("expected_state_version: expected"));
  assert(githubSection.includes("rejectWorkspaceVersion(args)"));
});

Deno.test("independent GitHub executor never reads workspace state", () => {
  assertFalse(operations.includes("code_labs_workspace_state"));
  assertFalse(operations.includes("state_version"));
  assertFalse(operations.includes("expected_state_version"));
});

Deno.test("durable operations require identity, hashes and exact blob proof", () => {
  assert(operations.includes("operation_key"));
  assert(operations.includes("request_hash"));
  assert(operations.includes("content_hash"));
  assert(operations.includes("expected_blob_sha"));
  assert(operations.includes("code_labs_claim_github_operation"));
  assert(operations.includes("idempotent_replay"));
});

Deno.test("GitHub mutation lane blocks protected branches and merges", () => {
  assertMatch(operations, /main.*master.*production.*live.*gh-pages/);
  assertFalse(operations.includes("/merges"));
  assertFalse(operations.includes("method: \"DELETE\""));
  assert(operations.includes("draft: true"));
});

Deno.test("migration is service-only and independent", () => {
  assert(migration.includes("create table if not exists public.code_labs_github_operations"));
  assert(migration.includes("unique (owner_id, operation_key)"));
  assert(migration.includes("revoke all on table public.code_labs_github_operations from anon, authenticated, public"));
  assert(migration.includes("grant execute on function public.code_labs_claim_github_operation"));
  assertFalse(migration.includes("code_labs_workspace_state"));
});

Deno.test("unified source keeps canonical V104 modules external and untouched", () => {
  assert(main.includes('../code-labs-mcp-stub/oauth.ts'));
  assert(main.includes('../code-labs-mcp-stub/guarded-workspace.ts'));
  assert(main.includes('../code-labs-mcp-stub/cg-repair-lab.ts'));
  assert(main.includes('../code-labs-mcp-stub/owner-gallery-reader.ts'));
  assertEquals(main.includes("executeDirectGithubWriter"), false);
});
