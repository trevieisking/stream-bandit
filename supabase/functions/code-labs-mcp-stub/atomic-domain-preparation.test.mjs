import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ATOMIC_DOMAIN_PREPARATION_COVERAGE,
  hashCanonicalJson,
  hashUtf8Text,
  prepareCodeGodAtomic,
  prepareGithubWriterAtomic,
  prepareRepoHandoffAtomic,
} from "./atomic-domain-preparation.mjs";

const now = "2026-07-28T14:00:00.000Z";
const repo = "trevieisking/stream-bandit";
const baseSha = "1".repeat(40);
const headSha = "2".repeat(40);
const blobSha = "3".repeat(40);
const checkpointId = "11111111-1111-4111-8111-111111111111";
const receiptId = "22222222-2222-4222-8222-222222222222";
const currentCode = "export const current = true;\n".repeat(8);
const proposedCode = "export const current = true;\nexport const repaired = true;\n".repeat(6);

function baseContext() {
  return {
    now,
    project: { id: "project-1", repo },
    file: {
      id: "file-1",
      filename: "src/example.ts",
      current_code: currentCode,
      updated_at: "2026-07-28T13:55:00.000Z",
      metadata: { fixed_output: proposedCode, source_path: "src/example.ts" },
    },
    job: { problem: "Repair example", dont_touch: "Preserve exports" },
    authority: {
      verified: true,
      repo,
      default_branch: "main",
      source_commit_sha: baseSha,
      verified_at: "2026-07-28T13:56:00.000Z",
    },
    branch_proof: {
      verified: true,
      repo,
      branch: "fix/example-repair",
      base_branch: "main",
      base_sha: baseSha,
      head_sha: headSha,
      verified_at: "2026-07-28T13:57:00.000Z",
    },
    queue_snapshot: {
      complete: true,
      repo,
      path: "src/example.ts",
      branch: "fix/example-repair",
      active_matching_requests: 0,
      captured_at: "2026-07-28T13:58:00.000Z",
    },
    blob_snapshot: {
      complete: true,
      repo,
      path: "src/example.ts",
      branch: "fix/example-repair",
      head_sha: headSha,
      absent: false,
      blob_sha: blobSha,
      captured_at: "2026-07-28T13:59:00.000Z",
    },
  };
}

async function reviewedContext() {
  const context = baseContext();
  const handoffResult = await prepareRepoHandoffAtomic({
    fields: { action: "change", branch: "fix/example-repair" },
  }, context);
  context.file = {
    ...context.file,
    updated_at: "2026-07-28T14:01:00.000Z",
    metadata: { ...context.file.metadata, repo_handoff: handoffResult.handoff },
  };
  context.now = "2026-07-28T14:02:00.000Z";
  const reviewResult = await prepareCodeGodAtomic({}, context);
  context.file = {
    ...context.file,
    updated_at: "2026-07-28T14:03:00.000Z",
    metadata: { ...context.file.metadata, code_god_review: reviewResult.review },
  };
  context.now = "2026-07-28T14:04:00.000Z";
  return { context, handoffResult, reviewResult };
}

async function reviewMutation(mutator) {
  const context = baseContext();
  const handoffResult = await prepareRepoHandoffAtomic({
    fields: { action: "change", branch: "fix/example-repair" },
  }, context);
  context.file = {
    ...context.file,
    updated_at: "2026-07-28T14:01:00.000Z",
    metadata: { ...context.file.metadata, repo_handoff: handoffResult.handoff },
  };
  await mutator({ context, handoff: handoffResult.handoff });
  context.now = "2026-07-28T14:02:00.000Z";
  return await prepareCodeGodAtomic({}, context);
}

test("Repo handoff is pure, atomic and bound to immutable branch proof", async () => {
  const context = baseContext();
  const result = await prepareRepoHandoffAtomic({
    fields: { action: "change", branch: "fix/example-repair" },
  }, context);
  assert.equal(result.payload.effects[0].kind, "record_update");
  assert.equal(result.payload.effects[1].kind, "receipt_insert");
  assert.equal(result.handoff.current_hash, await hashUtf8Text(currentCode));
  assert.equal(result.handoff.proposed_hash, await hashUtf8Text(proposedCode));
  assert.equal(result.handoff.github_base_sha, baseSha);
  assert.equal(result.handoff.github_head_sha, headSha);
  assert.equal(result.handoff.source_file_id, "file-1");
});

test("Repo handoff fails closed on unverified authority", async () => {
  const context = baseContext();
  context.authority.verified = false;
  await assert.rejects(
    prepareRepoHandoffAtomic({ fields: { branch: "fix/example-repair" } }, context),
    /authority is not verified/,
  );
});

test("Repo handoff rejects branch proof from a different base commit", async () => {
  const context = baseContext();
  context.branch_proof.base_sha = "4".repeat(40);
  await assert.rejects(
    prepareRepoHandoffAtomic({ fields: { branch: "fix/example-repair" } }, context),
    /does not descend from the verified source commit/,
  );
});

test("Code God returns bounded advisory checks and explicit limitations", async () => {
  const { reviewResult, handoffResult } = await reviewedContext();
  assert.equal(reviewResult.review.outcome, "PASS");
  assert.equal(reviewResult.review.scope_outcome, "BOUNDED_CHECKS_CLEAR");
  assert.equal(reviewResult.review.authoritative, false);
  assert.equal(reviewResult.review.trust_state, "HOLD_UNTRUSTED_ADVISORY");
  assert.equal(reviewResult.review.requires_independent_evidence_receipt, true);
  assert.ok(reviewResult.review.checks_not_run.includes("runtime-behaviour"));
  assert.ok(reviewResult.review.limitations.length > 0);
  assert.equal(reviewResult.review.handoff_hash, await hashCanonicalJson(handoffResult.handoff));
  assert.equal(reviewResult.review.github_head_sha, headSha);
  assert.equal(reviewResult.payload.effects[0].kind, "record_update");
});

test("Code God blocks stale content hashes", async () => {
  const context = baseContext();
  const handoffResult = await prepareRepoHandoffAtomic({ fields: { branch: "fix/example-repair" } }, context);
  handoffResult.handoff.proposed = proposedCode + "\nchanged after handoff";
  context.file = {
    ...context.file,
    updated_at: "2026-07-28T14:01:00.000Z",
    metadata: { ...context.file.metadata, repo_handoff: handoffResult.handoff },
  };
  context.now = "2026-07-28T14:02:00.000Z";
  const result = await prepareCodeGodAtomic({}, context);
  assert.equal(result.review.outcome, "FIX_FIRST");
  assert.ok(result.review.findings.some((finding) => finding.rule_id === "CG-HASH-BINDING-001"));
});

test("Code God refuses incomplete queue evidence", async () => {
  const context = baseContext();
  const handoffResult = await prepareRepoHandoffAtomic({ fields: { branch: "fix/example-repair" } }, context);
  context.file = {
    ...context.file,
    updated_at: "2026-07-28T14:01:00.000Z",
    metadata: { ...context.file.metadata, repo_handoff: handoffResult.handoff },
  };
  context.queue_snapshot.complete = false;
  context.now = "2026-07-28T14:02:00.000Z";
  await assert.rejects(prepareCodeGodAtomic({}, context), /queue evidence is incomplete/);
});

test("Writer payload binds exact review, branch, blob and independent checkpoint IDs", async () => {
  const { context, reviewResult } = await reviewedContext();
  const result = await prepareGithubWriterAtomic({
    confirmed: true,
    fields: {
      independent_evidence_checkpoint_id: checkpointId,
      independent_evidence_receipt_id: receiptId,
    },
  }, context);
  const request = result.request;
  assert.equal(result.payload.effects[0].kind, "write_request_insert");
  assert.equal(result.payload.effects[1].kind, "receipt_insert");
  assert.equal(request.code_god_handoff_hash, reviewResult.review.handoff_hash);
  assert.equal(request.expected_content_sha256, await hashUtf8Text(proposedCode));
  assert.equal(request.expected_github_blob_sha, blobSha);
  assert.equal(request.expected_github_blob_absent, false);
  assert.equal(request.github_base_sha, baseSha);
  assert.equal(request.github_head_sha, headSha);
  assert.equal(request.code_god_scope_outcome, "BOUNDED_CHECKS_CLEAR");
  assert.equal(request.independent_evidence_checkpoint_id, checkpointId);
  assert.equal(request.independent_evidence_receipt_id, receiptId);
  assert.deepEqual(
    result.payload.response.schema_binding_required_before_cutover,
    [
      "github_base_sha", "github_head_sha", "code_god_scope_outcome",
      "independent_evidence_checkpoint_id", "independent_evidence_receipt_id", "safety_note",
    ],
  );
  assert.deepEqual(result.payload.response.independent_evidence, {
    kind: "master-checklist-independent-gate-v1",
    checkpoint_id: checkpointId,
    receipt_id: receiptId,
    validation: "atomic-sql-and-protected-writer",
  });
});

test("Writer preparation refuses missing independent checkpoint IDs", async () => {
  const { context } = await reviewedContext();
  await assert.rejects(
    prepareGithubWriterAtomic({ confirmed: true, fields: {} }, context),
    /independent evidence checkpoint id must be an exact UUID/,
  );
});

test("Writer preparation refuses malformed independent evidence IDs", async () => {
  const { context } = await reviewedContext();
  await assert.rejects(
    prepareGithubWriterAtomic({
      confirmed: true,
      fields: {
        independent_evidence_checkpoint_id: "not-a-checkpoint",
        independent_evidence_receipt_id: receiptId,
      },
    }, context),
    /independent evidence checkpoint id must be an exact UUID/,
  );
});

test("Writer preparation refuses an unscoped or authoritative Code God result", async () => {
  const { context } = await reviewedContext();
  context.file.metadata.code_god_review.scope_outcome = "PASS";
  await assert.rejects(
    prepareGithubWriterAtomic({
      confirmed: true,
      fields: {
        independent_evidence_checkpoint_id: checkpointId,
        independent_evidence_receipt_id: receiptId,
      },
    }, context),
    /Bounded Code God checks must be clear and explicitly advisory/,
  );
});

test("Writer preparation blocks a changed branch head", async () => {
  const { context } = await reviewedContext();
  context.branch_proof.head_sha = "5".repeat(40);
  context.blob_snapshot.head_sha = context.branch_proof.head_sha;
  await assert.rejects(
    prepareGithubWriterAtomic({
      confirmed: true,
      fields: {
        independent_evidence_checkpoint_id: checkpointId,
        independent_evidence_receipt_id: receiptId,
      },
    }, context),
    /reviewed branch head changed/,
  );
});

test("Writer preparation blocks an active duplicate request", async () => {
  const { context } = await reviewedContext();
  context.queue_snapshot.active_matching_requests = 1;
  await assert.rejects(
    prepareGithubWriterAtomic({
      confirmed: true,
      fields: {
        independent_evidence_checkpoint_id: checkpointId,
        independent_evidence_receipt_id: receiptId,
      },
    }, context),
    /already queued or processing/,
  );
});

test("Domain preparation declares all external evidence and missing schema bindings", () => {
  assert.deepEqual(
    ATOMIC_DOMAIN_PREPARATION_COVERAGE.prepared,
    ["repo.prepare_handoff", "code_god.review", "github.writer_prepare"],
  );
  assert.ok(ATOMIC_DOMAIN_PREPARATION_COVERAGE.external_evidence_required.includes("immutable_branch_proof"));
  assert.ok(
    ATOMIC_DOMAIN_PREPARATION_COVERAGE.external_evidence_required.includes("independent_review_checkpoint_receipt"),
  );
  assert.deepEqual(
    ATOMIC_DOMAIN_PREPARATION_COVERAGE.schema_binding_required_before_cutover,
    [
      "github_base_sha", "github_head_sha", "code_god_scope_outcome",
      "independent_evidence_checkpoint_id", "independent_evidence_receipt_id", "safety_note",
    ],
  );
});

test("Pure domain module contains no database, GitHub or ambient-clock calls", async () => {
  const source = await readFile(new URL("./atomic-domain-preparation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\brest\s*\(/);
  assert.doesNotMatch(source, /githubRequest\s*\(/);
  assert.doesNotMatch(source, /verifyOwnerRepository\s*\(/);
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /new Date\s*\(/);
  assert.doesNotMatch(source, /crypto\.randomUUID\s*\(/);
});

test("CL-TRUST-001 frozen 15-case Code God benchmark", async (t) => {
  const cases = [
    {
      id: "clean-control",
      expected: "PASS",
      run: async () => (await reviewedContext()).reviewResult,
    },
    {
      id: "repository-provenance-drift",
      rule: "CG-IDENTITY-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(({ handoff }) => { handoff.source_commit_sha = "9".repeat(40); }),
    },
    {
      id: "selected-file-identity-drift",
      rule: "CG-FILE-IDENTITY-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(({ handoff }) => { handoff.source_file_id = "different-file"; }),
    },
    {
      id: "branch-proof-drift",
      rule: "CG-BRANCH-PROOF-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(({ handoff }) => { handoff.github_head_sha = "8".repeat(40); }),
    },
    {
      id: "noncanonical-hash-version",
      rule: "CG-HASH-VERSION-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(({ handoff }) => { handoff.hash_version = "legacy"; }),
    },
    {
      id: "candidate-content-tampering",
      rule: "CG-HASH-BINDING-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(({ handoff }) => { handoff.proposed += "\nchanged"; }),
    },
    {
      id: "incomplete-file",
      rule: "CG-FULLFILE-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(async ({ handoff }) => {
        handoff.proposed = "short";
        handoff.proposed_hash = await hashUtf8Text(handoff.proposed);
      }),
    },
    {
      id: "truncated-file",
      rule: "CG-TRUNCATION-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(async ({ handoff }) => {
        handoff.proposed = "export const stillComplete = true;\n".repeat(4);
        handoff.proposed_hash = await hashUtf8Text(handoff.proposed);
      }),
    },
    {
      id: "merge-conflict-markers",
      rule: "CG-CONFLICT-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(async ({ handoff }) => {
        handoff.proposed += "\n<<<<<<< ours\nvalue\n=======\nother\n>>>>>>> theirs\n";
        handoff.proposed_hash = await hashUtf8Text(handoff.proposed);
      }),
    },
    {
      id: "markdown-fence-contamination",
      rule: "CG-FENCE-001",
      expected: "FIX_FIRST",
      run: () => reviewMutation(async ({ handoff }) => {
        const fence = String.fromCharCode(96).repeat(3);
        handoff.proposed += "\n" + fence + "js\nconsole.log('review');\n" + fence + "\n";
        handoff.proposed_hash = await hashUtf8Text(handoff.proposed);
      }),
    },
    {
      id: "secret-shaped-value",
      rule: "CG-SECRET-001",
      expected: "BLOCK",
      run: () => reviewMutation(async ({ handoff }) => {
        handoff.proposed += "\nconst password = \"very-secret-password\";\n";
        handoff.proposed_hash = await hashUtf8Text(handoff.proposed);
      }),
    },
    {
      id: "frequent-duplicate-timer",
      rule: "CG-TIMER-001",
      expected: "PASS",
      nonblocking: true,
      run: () => reviewMutation(async ({ handoff }) => {
        handoff.proposed += "\nset" + "Interval(() => refresh(), 500);\n";
        handoff.proposed_hash = await hashUtf8Text(handoff.proposed);
      }),
    },
    {
      id: "duplicate-active-queue",
      rule: "CG-DUPLICATE-001",
      expected: "PASS",
      nonblocking: true,
      run: () => reviewMutation(({ context }) => { context.queue_snapshot.active_matching_requests = 1; }),
    },
    {
      id: "incomplete-queue-evidence",
      rejects: /queue evidence is incomplete/,
      run: () => reviewMutation(({ context }) => { context.queue_snapshot.complete = false; }),
    },
    {
      id: "post-review-branch-drift",
      rejects: /reviewed branch head changed/,
      run: async () => {
        const { context } = await reviewedContext();
        context.branch_proof.head_sha = "5".repeat(40);
        context.blob_snapshot.head_sha = context.branch_proof.head_sha;
        return await prepareGithubWriterAtomic({
          confirmed: true,
          fields: {
            independent_evidence_checkpoint_id: checkpointId,
            independent_evidence_receipt_id: receiptId,
          },
        }, context);
      },
    },
  ];

  assert.equal(cases.length, 15);
  let blockingMisses = 0;
  for (const benchmark of cases) {
    await t.test(benchmark.id, async () => {
      if (benchmark.rejects) {
        await assert.rejects(benchmark.run(), benchmark.rejects);
        return;
      }
      const result = await benchmark.run();
      const review = result.review;
      assert.equal(review.outcome, benchmark.expected);
      if (!benchmark.rule) return;
      const finding = review.findings.find((item) => item.rule_id === benchmark.rule);
      if (!finding && !benchmark.nonblocking) blockingMisses += 1;
      assert.ok(finding, `${benchmark.id} must emit ${benchmark.rule}`);
      assert.equal(finding.blocks_github, benchmark.nonblocking !== true);
    });
  }
  assert.equal(blockingMisses, 0, "No blocking benchmark defect may be missed");
});
