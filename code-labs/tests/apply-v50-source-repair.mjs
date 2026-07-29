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
  if (source.indexOf(from, first + from.length) !== -1) throw new Error(`Ambiguous asserted source for ${label}`);
  return source.slice(0, first) + to + source.slice(first + from.length);
}

function replaceRegexOnce(source, pattern, to, label) {
  const matches = source.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')) || [];
  if (matches.length !== 1) throw new Error(`Expected one asserted match for ${label}; found ${matches.length}`);
  return source.replace(pattern, to);
}

await change('supabase/functions/code-labs-mcp-stub/guarded-workspace.ts', (source) => {
  let next = replaceOnce(
    source,
    'const TRANSACTIONAL_ACTIONS = new Set([\n  ...ATOMIC_ACTION_COVERAGE.adapted,\n  ...ATOMIC_ACTION_COVERAGE.requires_domain_preparation,\n]);',
    'const ATOMIC_WORKSPACE_RPC_ROUTE = "rpc/code_labs_execute_workspace_action";\n\nconst TRANSACTIONAL_ACTIONS = new Set([\n  "file.intake",\n  "setup.save",\n  "project.select",\n  "file.select",\n  "job.select",\n  "packet.select",\n  "test.select",\n  "file.replace_current",\n  "repair.save",\n  "packet.build",\n  "canvas.save_candidate",\n  "candidate.save",\n  "candidate.accept",\n  "test.record",\n  "checkpoint.create",\n  "workflow.advance",\n  "workflow.reset",\n  "repo.prepare_handoff",\n  "code_god.review",\n  "github.writer_prepare",\n  "undo.execute",\n]);',
    'explicit transactional registry',
  );
  next = replaceOnce(
    next,
    'async function runAtomicAction(b: Binding, action: string, args: Row) {\n  const expected = expectedVersion(args);',
    'async function runAtomicAction(b: Binding, action: string, args: Row) {\n  if (ATOMIC_WORKSPACE_RPC_ROUTE !== "rpc/code_labs_execute_workspace_action") {\n    throw new Error("The atomic workspace RPC route is invalid.");\n  }\n  const expected = expectedVersion(args);',
    'atomic RPC route assertion',
  );
  return next;
});

await change('supabase/functions/code-labs-mcp-stub/main.ts', (source) =>
  replaceRegexOnce(
    source,
    /\n}\n\n\/\*\*[\s\S]*?decodeBase64 remains as a stable source-contract boundary marker used by the\n \* connector-preservation test to delimit the public tools registry\. It does not\n \* perform File Lab work and must not become another intake implementation\.\n \*\/\n\nfunction decodeBase64/,
    '\n}\n\nfunction decodeBase64',
    'connector registry delimiter',
  )
);

await change('supabase/functions/code-labs-mcp-stub/github-writer.ts', (source) => {
  let next = replaceOnce(
    source,
    'const SHA40 = /^[a-f0-9]{40}$/;\n',
    'const SHA40 = /^[a-f0-9]{40}$/;\nconst WRITER_PHASES = new Set(["queued", "processing", "github_committed", "pr_opened", "completed"]);\n\nfunction writerFencingToken(request: Row) {\n  const writer_fencing_token = String(request.writer_claim_id || "").trim();\n  if (!writer_fencing_token) throw new Error("The Writer fencing token is missing.");\n  return writer_fencing_token;\n}\n\nfunction reconcileExistingCommit(currentHead: string, createdCommit: string, expectedParent: string) {\n  if (currentHead === createdCommit) return "applied";\n  if (currentHead === expectedParent) return "no_write";\n  return "conflict";\n}\n\nfunction verifyStoredPullRequest(request: Row, pull: Row) {\n  if (\n    !pull || pull.draft !== true || String(pull.state || "") !== "open" ||\n    Number(pull.number || 0) !== Number(request.pull_request_number || pull.number || 0) ||\n    String(pull.head?.ref || "") !== String(request.branch || "") ||\n    String(pull.base?.ref || "") !== String(request.github_base_branch || "")\n  ) throw new Error("The stored draft pull-request proof is no longer valid.");\n  return pull;\n}\n',
    'Writer phase and reconciliation helpers',
  );
  next = replaceOnce(
    next,
    'function completedProof(request: Row) {\n  const commitSha = String(request.github_commit_sha || "");',
    'function completedProof(request: Row) {\n  const phase = String(request.writer_phase || "pr_opened");\n  if (!WRITER_PHASES.has(phase)) return null;\n  const commitSha = String(request.github_commit_sha || "");',
    'completed phase validation',
  );
  next = replaceOnce(
    next,
    '    const request = await claimRequest(b.owner_id, requestId, claimId);\n    claimOwned = true;',
    '    const request = await claimRequest(b.owner_id, requestId, claimId);\n    writerFencingToken(request);\n    claimOwned = true;',
    'Writer fencing token validation',
  );
  next = replaceOnce(
    next,
    '      if (reconciledSha === createdCommitSha) {\n        // GitHub applied the ref update but the original response was lost.\n      } else if (reconciledSha === plan.expected_parent_sha) {\n        stage = "ref_update_no_write";\n        throw error;\n      } else {\n        stage = "ref_update_conflict";\n        throw new Error("The branch head changed before the reviewed commit could be applied.");\n      }',
    '      const reconciliation = reconcileExistingCommit(\n        reconciledSha,\n        createdCommitSha,\n        plan.expected_parent_sha,\n      );\n      if (reconciliation === "applied") {\n        // GitHub applied the ref update but the original response was lost.\n      } else if (reconciliation === "no_write") {\n        stage = "ref_update_no_write";\n        throw error;\n      } else {\n        stage = "ref_update_conflict";\n        throw new Error("The branch head changed before the reviewed commit could be applied.");\n      }',
    'named commit reconciliation',
  );
  next = replaceOnce(
    next,
    '    if (!pullNumber || !pullUrl || pull?.draft !== true) {\n      throw new Error("GitHub did not return draft pull-request proof.");\n    }',
    '    if (!pullNumber || !pullUrl || pull?.draft !== true) {\n      throw new Error("GitHub did not return draft pull-request proof.");\n    }\n    verifyStoredPullRequest({\n      ...request,\n      pull_request_number: pullNumber,\n    }, pull);',
    'stored pull-request verification',
  );
  next = replaceOnce(
    next,
    '          status: "pr_opened",\n          writer_phase: "pr_opened",',
    '          status: "pr_opened",\n          writer_phase: "completed",',
    'durable completed phase',
  );
  return next;
});

console.log('Applied assertion-guarded Code Labs V50 backend source repairs.');
