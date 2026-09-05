import { V105_GITHUB_VALIDATION_TEST_API } from "./github-operations.ts";
import {
  protectRepositoryRead,
  redactCredentialValues,
} from "./credential-redaction.ts";

function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals(actual: unknown, expected: unknown, message = "Values are not equal") {
  const actualText = JSON.stringify(actual);
  const expectedText = JSON.stringify(expected);
  if (actualText !== expectedText) {
    throw new Error(`${message}: expected ${expectedText}, received ${actualText}`);
  }
}

function assertThrows(fn: () => unknown, message = "Expected function to throw") {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(message);
}

async function assertRejects(
  fn: () => Promise<unknown>,
  message = "Expected promise to reject",
) {
  let rejected = false;
  try {
    await fn();
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error(message);
}

async function fixtureSha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

const {
  validateOperationKey,
  calculateRequestHash,
  operationIdentityMatches,
  validateBranch,
  validatePath,
  validateContentHash,
  validateExpectedBlobSha,
  validateDraftPullRequest,
} = V105_GITHUB_VALIDATION_TEST_API;

Deno.test("V105 validation test API is immutable", () => {
  assert(Object.isFrozen(V105_GITHUB_VALIDATION_TEST_API));
});

Deno.test("production operation-key validator accepts stable synthetic keys", () => {
  const input = "  test.operation:key-001  ";
  const first = validateOperationKey(input);
  const second = validateOperationKey(input);
  assertEquals(first, "test.operation:key-001");
  assertEquals(second, first);
});

Deno.test("production operation-key validator rejects invalid values", () => {
  assertThrows(() => validateOperationKey(""));
  assertThrows(() => validateOperationKey("invalid/key"));
  assertThrows(() => validateOperationKey("x".repeat(201)));
});

Deno.test("production request hash is canonical and deterministic", async () => {
  const firstRequest = {
    repo: "synthetic/example",
    branch: "test/code-labs-v105-validator",
    path: "code-labs/v105-validator-canary.txt",
    nested: { beta: 2, alpha: 1 },
  };
  const reorderedRequest = {
    nested: { alpha: 1, beta: 2 },
    path: "code-labs/v105-validator-canary.txt",
    branch: "test/code-labs-v105-validator",
    repo: "synthetic/example",
  };
  const changedRequest = {
    ...firstRequest,
    path: "code-labs/v105-validator-changed.txt",
  };

  const first = await calculateRequestHash("file_update", firstRequest);
  const repeated = await calculateRequestHash("file_update", firstRequest);
  const reordered = await calculateRequestHash("file_update", reorderedRequest);
  const changed = await calculateRequestHash("file_update", changedRequest);

  assertEquals(repeated, first);
  assertEquals(reordered, first);
  assert(changed !== first, "A material request change must change the hash");
  assert(/^[a-f0-9]{64}$/.test(first), "Request hash must be lowercase SHA-256");
});

Deno.test("production operation identity predicate compares type and hash", () => {
  const hash = "a".repeat(64);
  const row = { operation_type: "file_update", request_hash: hash };

  assertEquals(operationIdentityMatches(row, "file_update", hash), true);
  assertEquals(operationIdentityMatches(row, "file_create", hash), false);
  assertEquals(operationIdentityMatches(row, "file_update", "b".repeat(64)), false);
});

Deno.test("production branch validator accepts a harmless non-default branch", () => {
  assertEquals(
    validateBranch("test/code-labs-v105-validator", "main"),
    "test/code-labs-v105-validator",
  );
});

Deno.test("production branch validator rejects invalid and protected branches", () => {
  assertThrows(() => validateBranch("", "main"));
  assertThrows(() => validateBranch("bad branch name", "main"));
  for (const branch of ["main", "master", "production", "live", "gh-pages"]) {
    assertThrows(() => validateBranch(branch, "main"));
  }
  assertThrows(() => validateBranch("verified-default", "verified-default"));
});

Deno.test("production path validator accepts a harmless repository path", () => {
  assertEquals(
    validatePath("code-labs/v105-validator-canary.txt"),
    "code-labs/v105-validator-canary.txt",
  );
});

Deno.test("production path validator rejects protected paths", () => {
  for (const path of [
    "",
    "../synthetic-secret.txt",
    "/absolute/synthetic-file.txt",
    ".ssh/id_rsa",
    ".env",
    "keys/synthetic.pem",
    "keys/synthetic.key",
    "certificates/synthetic.p12",
    "certificates/synthetic.pfx",
    ".github/workflows/synthetic.yml",
    ".github/dependabot.yml",
  ]) {
    assertThrows(() => validatePath(path), `Expected protected path rejection: ${path}`);
  }
});

Deno.test("production content-hash validator accepts exact synthetic content", async () => {
  const content = "Synthetic UTF-8 validator content: café — test only.";
  const expectedHash = await fixtureSha256(content);
  assertEquals(await validateContentHash(content, expectedHash), expectedHash);
});

Deno.test("production content-hash validator rejects wrong or malformed hashes", async () => {
  const content = "Synthetic content for negative hash tests.";
  const expectedHash = await fixtureSha256(content);
  const wrongHash = expectedHash === "a".repeat(64)
    ? "b".repeat(64)
    : "a".repeat(64);

  await assertRejects(() => validateContentHash(content, wrongHash));
  await assertRejects(() => validateContentHash(content, ""));
  await assertRejects(() => validateContentHash(content, "not-a-sha256"));
});

Deno.test("production expected-blob validator enforces exact Git blob SHA", () => {
  const expected = "a".repeat(40);
  const different = "b".repeat(40);

  assertEquals(validateExpectedBlobSha(expected), expected);
  assertEquals(validateExpectedBlobSha(expected, expected), expected);
  assertThrows(() => validateExpectedBlobSha(""));
  assertThrows(() => validateExpectedBlobSha("not-a-git-blob-sha"));
  assertThrows(() => validateExpectedBlobSha(expected, different));
});

Deno.test("production draft-PR validators enforce branch and draft boundaries", () => {
  const head = validateBranch("test/code-labs-v105-validator", "main");
  const result = validateDraftPullRequest(head, "main", true);

  assertEquals(result, {
    head: "test/code-labs-v105-validator",
    base: "main",
    draft: true,
  });
  assertEquals(Object.keys(result).sort(), ["base", "draft", "head"]);

  assertThrows(() => validateDraftPullRequest(head, head, true));
  assertThrows(() => validateDraftPullRequest(head, "main", false));
  assertThrows(() => validateBranch("main", "main"));
  assertThrows(() => validateBranch("verified-default", "verified-default"));
});

Deno.test("production credential redaction covers synthetic credential shapes", () => {
  const syntheticValues = {
    github: "ghp_AAAAAAAAAAAAAAAAAAAA",
    provider: "sk_test_SYNTHETIC1234567890",
    jwt:
      "eyJSYNTHETICHEADER12.SYNTHETICPAYLOAD123.SYNTHETICSIGNATURE12",
    bearer: "SYNTHETICBEARERTOKEN1234567890",
    aws: "AKIAAAAAAAAAAAAAAAAA",
    password: "SYNTHETIC_PASSWORD_ONLY",
    jsonSecret: "SYNTHETIC_JSON_SECRET_ONLY",
    urlPassword: "SYNTHETIC_URL_PASSWORD_ONLY",
  };

  const fixture = [
    "-----BEGIN PRIVATE KEY-----",
    "SYNTHETIC_TEST_MATERIAL_ONLY",
    "-----END PRIVATE KEY-----",
    `const githubToken = "${syntheticValues.github}";`,
    `const providerKey = "${syntheticValues.provider}";`,
    `const jwt = "${syntheticValues.jwt}";`,
    `fetch(url, { headers: { Authorization: "Bearer ${syntheticValues.bearer}" } });`,
    `const awsAccessKey = "${syntheticValues.aws}";`,
    `const password = "${syntheticValues.password}";`,
    `const config = { "client_secret": "${syntheticValues.jsonSecret}" };`,
    `const endpoint = "https://synthetic-user:${syntheticValues.urlPassword}@example.invalid/path";`,
    `const envReference = Deno.env.get("SYNTHETIC_API_KEY_NAME");`,
  ].join("\n");

  const result = redactCredentialValues(fixture);

  assert(result.metadata.applied);
  assert(result.content.includes("[REDACTED_CREDENTIAL]"));
  assert(result.content.includes('Deno.env.get("SYNTHETIC_API_KEY_NAME")'));
  assert(result.content.includes("fetch(url"));
  assertEquals(result.metadata.original_values_returned, false);
  assertEquals(result.metadata.environment_variable_names_preserved, true);
  assertEquals(result.metadata.call_sites_preserved, true);

  for (const value of Object.values(syntheticValues)) {
    assert(!result.content.includes(value), `Synthetic credential was not redacted: ${value}`);
  }
  assert(!result.content.includes("SYNTHETIC_TEST_MATERIAL_ONLY"));
});

Deno.test("production repository-read protection preserves safe synthetic metadata", () => {
  const syntheticSecret = "SYNTHETIC_REPOSITORY_SECRET_ONLY";
  const protectedRead = protectRepositoryRead({
    repository: {
      repo: "synthetic/example",
      private: true,
      ref: "test/code-labs-v105-validator",
    },
    file: {
      path: "src/synthetic-example.ts",
      content: `const client_secret = "${syntheticSecret}";`,
    },
  });

  const serialized = JSON.stringify(protectedRead);
  assert(!serialized.includes(syntheticSecret));
  assertEquals(protectedRead.repository.repo, "synthetic/example");
  assertEquals(protectedRead.repository.ref, "test/code-labs-v105-validator");
  assertEquals(protectedRead.file.path, "src/synthetic-example.ts");
  assertEquals(protectedRead.credential_protection.original_values_returned, false);
  assert(!serialized.includes("owner_id"));
  assert(!serialized.includes("installation_id"));
  assert(!serialized.includes("access_token"));
});
