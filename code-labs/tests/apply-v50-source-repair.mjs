import { readFile, writeFile } from 'node:fs/promises';

async function change(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`No asserted change applied to ${path}`);
  await writeFile(path, after);
}

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first === -1) throw new Error(`Missing asserted source for ${label}`);
  if (source.indexOf(from, first + from.length) !== -1) {
    throw new Error(`Ambiguous asserted source for ${label}`);
  }
  return source.slice(0, first) + to + source.slice(first + from.length);
}

const finalOwnerMarker = `-- Folded into 20260728172000_code_labs_v50_coherent_hardening.sql.
-- Marker only: it intentionally owns no function, trigger, constraint or grant.
-- Kept so the reviewed migration sequence remains explicit and auditable.

begin;
commit;
`;

for (const path of [
  'supabase/migrations/20260728170500_code_labs_atomic_boolean_owner_cleanup.sql',
  'supabase/migrations/20260728171000_code_labs_atomic_failure_transition_cleanup.sql',
]) {
  await change(path, () => finalOwnerMarker);
}

await change('supabase/functions/code-labs-mcp-stub/atomic-boolean-owner.contract.test.mjs', (source) => {
  let next = replaceOnce(
    source,
    "../../migrations/20260728170500_code_labs_atomic_boolean_owner_cleanup.sql",
    "../../migrations/20260728172000_code_labs_v50_coherent_hardening.sql",
    'boolean final-owner path',
  );
  next = replaceOnce(
    next,
    "test('boolean owner: cleanup must be folded into hardening before deployment', async () => {\n  const { cleanup } = await sources();\n\n  assert.match(cleanup, /POST-CUTOVER CLEANUP ONLY/i);\n  assert.match(cleanup, /folded into the[\\s\\S]*final hardening migration before any deployment decision/i);\n});",
    "test('boolean owner: cleanup is owned by final hardening before deployment', async () => {\n  const { cleanup } = await sources();\n\n  assert.match(cleanup, /strict expansion helper is the sole boolean boundary/i);\n  assert.match(cleanup, /drop function if exists public\\.code_labs_jsonb_boolean/i);\n  assert.match(cleanup, /grant execute on function public\\.code_labs_require_jsonb_boolean/i);\n});",
    'boolean final-owner assertion',
  );
  return next;
});

await change('supabase/functions/code-labs-mcp-stub/atomic-failure-fencing.contract.test.mjs', (source) =>
  source.replaceAll(
    "20260728171000_code_labs_atomic_failure_transition_cleanup.sql",
    "20260728172000_code_labs_v50_coherent_hardening.sql",
  )
);

await change('supabase/functions/code-labs-mcp-stub/github-writer.ts', (source) => {
  let next = replaceOnce(
    source,
    'function reconcileExistingCommit(currentHead: string, createdCommit: string, expectedParent: string) {\n  if (currentHead === createdCommit) return "applied";\n  if (currentHead === expectedParent) return "no_write";\n  return "conflict";\n}',
    'function reconcileExistingCommit(reconciledSha: string, createdCommitSha: string, expectedParentSha: string) {\n  if (reconciledSha === createdCommitSha) return "applied";\n  if (reconciledSha === expectedParentSha) return "no_write";\n  return "conflict";\n}',
    'Writer explicit reconciliation branches',
  );
  next = replaceOnce(
    next,
    '    String(left.pr_body || "") === String(right.pr_body || "") &&\n    left.direct_main_write === right.direct_main_write &&',
    '    String(left.pr_body || "") === String(right.pr_body || "") &&\n    String(left.expected_github_blob_sha || "") === String(right.expected_github_blob_sha || "") &&\n    left.expected_github_blob_absent === right.expected_github_blob_absent &&\n    left.direct_main_write === right.direct_main_write &&',
    'Writer queued blob-proof binding',
  );
  return next;
});

console.log('Applied assertion-guarded V50 final-owner and Writer contract repairs.');
