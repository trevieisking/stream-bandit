import { codeLabsOperationId } from "./guarded-workspace.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

Deno.test("Code Labs action identity is stable across object key ordering", async () => {
  const owner = "af380be8-d1e2-4154-a5ed-a113c8271afd";
  const left = await codeLabsOperationId(owner, "repo.prepare_handoff", {
    expected_state_version: 580,
    fields: { action: "add", path: "supabase/migrations/example.sql" },
    confirmed: true,
  });
  const right = await codeLabsOperationId(owner, "repo.prepare_handoff", {
    confirmed: true,
    fields: { path: "supabase/migrations/example.sql", action: "add" },
    expected_state_version: 580,
  });

  assert(left === right, "Equivalent action arguments must produce the same operation identity.");
  assert(
    /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(left),
    "Operation identity must be a deterministic UUIDv5-shaped value.",
  );
});

Deno.test("Code Labs action identity changes across action and workspace versions", async () => {
  const owner = "af380be8-d1e2-4154-a5ed-a113c8271afd";
  const base = { expected_state_version: 580, fields: { action: "add", path: "example.sql" } };
  const first = await codeLabsOperationId(owner, "repo.prepare_handoff", base);
  const differentAction = await codeLabsOperationId(owner, "code_god.review", base);
  const differentVersion = await codeLabsOperationId(owner, "repo.prepare_handoff", {
    ...base,
    expected_state_version: 581,
  });

  assert(first !== differentAction, "Different actions must not share an operation identity.");
  assert(first !== differentVersion, "Different workspace versions must not share an operation identity.");
});
