import { assert, assertEquals, assertFalse, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { protectRepositoryRead, redactCredentialValues } from "./credential-redaction.ts";

const root = new URL("./", import.meta.url);
const main = await Deno.readTextFile(new URL("main.ts", root));
const operations = await Deno.readTextFile(new URL("github-operations.ts", root));
const redaction = await Deno.readTextFile(new URL("credential-redaction.ts", root));
const migration = await Deno.readTextFile(
  new URL("../../migrations/20260726150000_code_labs_v105_github_operations.sql", root),
);

Deno.test("V105 GitHub tool schemas omit workspace state version", () => {
  const githubSection = main.slice(main.indexOf('{ name: "read_code_labs_repository"'));
  assertFalse(githubSection.includes("expected_state_version: expected"));
  assert(githubSection.includes("rejectWorkspaceVersion(args)"));
});

Deno.test("independent GitHub executor never reads or updates workspace state", () => {
  assertFalse(operations.includes("code_labs_workspace_state"));
  assertFalse(operations.includes("state_version"));
  assertFalse(operations.includes("expected_state_version"));
  assertFalse(migration.includes("code_labs_workspace_state"));
});

Deno.test("durable operations require identity, immutable hashes and claim protection", () => {
  assert(operations.includes("operation_key"));
  assert(operations.includes("request_hash"));
  assert(operations.includes("content_hash"));
  assert(operations.includes("expected_blob_sha"));
  assert(operations.includes("code_labs_claim_github_operation"));
  assert(operations.includes("idempotent_replay"));
  assert(migration.includes("unique (owner_id, operation_key)"));
});

Deno.test("duplicate completed operation returns durable replay proof", () => {
  assertMatch(operations, /status === "completed"[\s\S]*idempotent_replay: true/);
  assert(operations.includes("The durable GitHub operation identity conflicts with different input."));
});

Deno.test("wrong content hash is rejected before durable GitHub execution", () => {
  assert(operations.includes("The complete file content does not match content_hash."));
  const hashCheck = operations.indexOf("actualHash !== content.expectedHash");
  const executeCall = operations.indexOf("return executeDurable(binding, mode");
  assert(hashCheck > -1 && executeCall > hashCheck);
});

Deno.test("wrong blob SHA is rejected before file update", () => {
  assert(operations.includes("The GitHub blob changed. Read the file again and supply the new expected_blob_sha."));
  assert(operations.includes("String(current.sha || \"\").toLowerCase() !== expectedBlobSha"));
  assert(operations.includes("payload.sha = expectedBlobSha"));
});

Deno.test("GitHub mutation lane blocks protected and default branches", () => {
  assertMatch(operations, /main.*master.*production.*live.*gh-pages/);
  assert(operations.includes("branch.toLowerCase() === defaultBranch.toLowerCase()"));
  assert(operations.includes("The GitHub operation branch cannot be the repository default branch."));
  assertFalse(operations.includes("/merges"));
  assertFalse(operations.includes('method: "DELETE"'));
});

Deno.test("pull request execution is draft only", () => {
  assert(operations.includes("draft: true"));
  assert(operations.includes("if (pull.draft !== true)"));
  assert(operations.includes("The pull request is not a draft; V105 will not continue."));
  assertFalse(operations.includes("merge_pull_request"));
});

Deno.test("repository reads redact credential values but preserve identifiers", () => {
  const fixture = [
    'const API_KEY = "sk-test_1234567890abcdefghijkl";',
    'const TOKEN_NAME = Deno.env.get("TOKEN_NAME");',
    'const password = "correct-horse-battery-staple";',
    'fetch(url, { headers: { Authorization: "Bearer abcdefghijklmnopqrstuvwxyz123456" } });',
  ].join("\n");
  const result = redactCredentialValues(fixture);
  assertFalse(result.content.includes("1234567890abcdefghijkl"));
  assertFalse(result.content.includes("correct-horse-battery-staple"));
  assertFalse(result.content.includes("abcdefghijklmnopqrstuvwxyz123456"));
  assert(result.content.includes("API_KEY"));
  assert(result.content.includes('Deno.env.get("TOKEN_NAME")'));
  assert(result.content.includes("fetch(url"));
  assert(result.content.includes("[REDACTED_CREDENTIAL]"));
  assert(result.metadata.applied);
  assert(result.metadata.redaction_count >= 3);
  assertEquals(result.metadata.original_values_returned, false);
  assertEquals(result.metadata.identifiers_preserved, true);
  assertEquals(result.metadata.environment_variable_names_preserved, true);
  assertEquals(result.metadata.call_sites_preserved, true);
});

Deno.test("repository read wrapper returns explicit redaction metadata", () => {
  const protectedRead = protectRepositoryRead({
    file: { path: "src/example.ts", content: 'const client_secret = "secret-value-12345";' },
  });
  assertEquals(protectedRead.credential_protection.applied, true);
  assertEquals(protectedRead.credential_protection.original_values_returned, false);
  assertFalse(protectedRead.file.content.includes("secret-value-12345"));
  assert(protectedRead.file.content.includes("client_secret"));
});

Deno.test("migration is service-only with RLS and fixed security-definer paths", () => {
  assert(migration.includes("create table if not exists public.code_labs_github_operations"));
  assert(migration.includes("alter table public.code_labs_github_operations enable row level security"));
  assert(migration.includes("revoke all on table public.code_labs_github_operations from anon, authenticated, public"));
  assert(migration.includes("grant all on table public.code_labs_github_operations to service_role"));
  assert(migration.includes("security definer"));
  assert(migration.includes("set search_path = pg_catalog, public"));
  assert(migration.includes("grant execute on function public.code_labs_claim_github_operation"));
  assertFalse(migration.includes("grant execute on function public.code_labs_claim_github_operation") && migration.includes("to anon"));
});

Deno.test("unified source imports canonical V48 modules without changing V104", () => {
  assert(main.includes('../code-labs-mcp-stub/oauth.ts'));
  assert(main.includes('../code-labs-mcp-stub/context.ts'));
  assert(main.includes('../code-labs-mcp-stub/guarded-workspace.ts'));
  assert(main.includes('../code-labs-mcp-stub/cg-repair-lab.ts'));
  assert(main.includes('../code-labs-mcp-stub/owner-gallery-reader.ts'));
  assertEquals(main.includes("executeDirectGithubWriter"), false);
});

Deno.test("credential redaction implementation never reports matched values", () => {
  assert(redaction.includes("original_values_returned: false"));
  assertFalse(redaction.includes("matched_values"));
  assertFalse(redaction.includes("original_value:"));
});
