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

const learningHistory = {
  "CL-HIST-001": {
    cause: "A duplicate owner could disagree with the canonical workflow.",
    correction: "Keep exactly one authoritative owner and make helpers consume it.",
    regression: "Prove one owner and fail closed on duplicate ownership.",
    runtime_proof: "Fixture proof.",
    promotion_boundary: "Test only.",
  },
  "CL-HIST-089": {
    cause: "The reviewer missed later bindings, wildcard re-exports and generator functions.",
    correction: "Use one shared structural binding parser and freeze the senses pipeline.",
    regression: "Every exported binding, wildcard re-export and generator removal must block.",
    runtime_proof: "Deterministic benchmark fixture.",
    promotion_boundary: "No live promotion from fixture evidence.",
  },
};

function baseContext() {
  return {
    now,
    project: { id: "project-1", repo, metadata: { workflow_learning_history: JSON.parse(JSON.stringify(learningHistory)) } },
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


const fiveSenseOriginal = `
import "./dependency.js";
import "./wild.js";
export * from "./wild.js";
export * as helpers from "./helpers.js";
export function* stream() { yield 1; }
export async function* asyncStream() { yield 2; }
export const foo = 1, bar = 2;
export const multiLineOne = 1,
  multiLineTwo = 2;
export const { alpha, beta: gamma, nested: { delta }, ...rest } = source;
export const [first, , third, ...tail] = values;
export interface Shape { value: number; }
export type Alias = string;
export const enum Mode { One, Two }
export type { Shape as PublicShape };
export { alpha as publicAlpha };
const localOne = 1, localTwo = 2;
function localFunction() { return true; }
const markup = '<div id="main-panel" data-cl-route-id="setup"></div>';
localStorage.setItem("code-labs-state", "ready");
const contract = { action: "setup.save", tool: "code_god.review" };
const query = client.from("code_labs_files");
const call = client.rpc("code_labs_apply_workspace_action_strict");
const invoke = client.functions.invoke("code-labs-mcp-stub");
export const stablePadding = "This fixture deliberately stays large enough that one removed contract cannot be misclassified as truncation.";
`;

function fiveSenseContext(proposed) {
  return {
    now: "2026-08-02T20:30:00.000Z",
    project: { id: "project-five-senses", repo, metadata: { workflow_learning_history: JSON.parse(JSON.stringify(learningHistory)) } },
    file: {
      id: "file-five-senses",
      filename: "src/five-senses.ts",
      current_code: fiveSenseOriginal,
      updated_at: "2026-08-02T20:29:00.000Z",
      metadata: { fixed_output: proposed, source_path: "src/five-senses.ts" },
    },
    job: { problem: "Five-senses regression", dont_touch: "Preserve every public contract" },
    authority: {
      verified: true,
      repo,
      default_branch: "main",
      source_commit_sha: baseSha,
      verified_at: "2026-08-02T20:29:10.000Z",
    },
    branch_proof: {
      verified: true,
      repo,
      branch: "fix/five-senses",
      base_branch: "main",
      base_sha: baseSha,
      head_sha: headSha,
      verified_at: "2026-08-02T20:29:20.000Z",
    },
    queue_snapshot: {
      complete: true,
      repo,
      path: "src/five-senses.ts",
      branch: "fix/five-senses",
      active_matching_requests: 0,
      captured_at: "2026-08-02T20:29:30.000Z",
    },
  };
}

async function reviewFiveSenses(proposed, reviewArgs = {}, mutateContext = null) {
  const context = fiveSenseContext(proposed);
  const handoff = await prepareRepoHandoffAtomic({ fields: { branch: "fix/five-senses" } }, context);
  context.file = {
    ...context.file,
    updated_at: "2026-08-02T20:30:10.000Z",
    metadata: { ...context.file.metadata, repo_handoff: handoff.handoff },
  };
  if (mutateContext) await mutateContext(context, handoff.handoff);
  context.now = "2026-08-02T20:30:20.000Z";
  return (await prepareCodeGodAtomic(reviewArgs, context)).review;
}

function fiveSenseFinding(reviewResult, rule) {
  return reviewResult.findings.find((item) => item.rule_id === rule);
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
  assert.deepEqual(reviewResult.review.senses.order, ["eyes", "nose", "ears", "brain", "mouth"]);
  assert.equal(reviewResult.review.senses.eyes.status, "SCANNED");
  assert.equal(reviewResult.review.senses.brain.learning_history_status, "CURRENT");
  assert.equal(reviewResult.review.senses.mouth.findings_owner, "review.findings");
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
    /Bounded Code God senses must be complete, clear and explicitly advisory/,
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

test("Writer preparation refuses stale canonical learning history", async () => {
  const { context } = await reviewedContext();
  context.project.metadata.workflow_learning_history["CL-HIST-090"] = {
    cause: "A new confirmed defect was recorded after review.",
    correction: "Run the Brain again against the current history.",
    regression: "Writer must reject a stale history hash.",
  };
  await assert.rejects(
    prepareGithubWriterAtomic({
      confirmed: true,
      fields: {
        independent_evidence_checkpoint_id: checkpointId,
        independent_evidence_receipt_id: receiptId,
      },
    }, context),
    /regression history changed or is incomplete/,
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


test("CL-TRUST-002 frozen five-senses structural benchmark", async (t) => {
  const cases = [
    {
      id: "clean-five-senses-control",
      run: () => reviewFiveSenses(fiveSenseOriginal.replace(
        "export { alpha as publicAlpha };",
        "export {alpha as publicAlpha};",
      )),
      verify: (result) => {
        assert.equal(result.outcome, "PASS");
        assert.equal(result.capability_version, "code-god-structural-preservation-and-five-senses-v3");
        assert.deepEqual(result.senses.order, ["eyes", "nose", "ears", "brain", "mouth"]);
        assert.equal(result.senses.eyes.status, "SCANNED");
        assert.equal(result.senses.nose.status, "SIGNALS_REPORTED");
        assert.equal(result.senses.ears.status, "INPUTS_REVIEWED");
        assert.equal(result.senses.brain.status, "SYNTHESIZED");
        assert.equal(result.senses.brain.learning_history_status, "CURRENT");
        assert.deepEqual(result.senses.brain.known_regression_ids, ["CL-HIST-001", "CL-HIST-089"]);
        assert.equal(result.senses.mouth.status, "SPOKEN");
        assert.equal(result.senses.mouth.findings_owner, "review.findings");
        assert.ok(result.checks_run.includes("wildcard-reexport-preservation"));
        assert.ok(result.checks_run.includes("brain-regression-history"));
        assert.deepEqual(result.senses.eyes.structural_inventory.missing, {});
      },
    },
    {
      id: "later-exported-binding-removal",
      run: () => reviewFiveSenses(fiveSenseOriginal.replace(
        "export const foo = 1, bar = 2;",
        "export const foo = 1;",
      )),
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(fiveSenseFinding(result, "CG-EXPORT-PRESERVATION-001"));
        assert.ok(result.senses.eyes.structural_inventory.missing.exports.includes("bar"));
        assert.ok(result.senses.eyes.structural_inventory.missing.symbols.includes("bar"));
      },
    },
    {
      id: "multiline-and-destructured-binding-removal",
      run: () => {
        let proposed = fiveSenseOriginal.replace("  multiLineTwo = 2;", "  replacementTwo = 2;");
        proposed = proposed.replace("beta: gamma", "beta: replacementGamma");
        proposed = proposed.replace("nested: { delta }", "nested: { replacementDelta }");
        proposed = proposed.replace("...rest", "...replacementRest");
        proposed = proposed.replace("third, ...tail", "replacementThird, ...replacementTail");
        return reviewFiveSenses(proposed);
      },
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        for (const name of ["multiLineTwo", "gamma", "delta", "rest", "third", "tail"]) {
          assert.ok(result.senses.eyes.structural_inventory.missing.exports.includes(name), `missing exported binding ${name}`);
        }
      },
    },
    {
      id: "exported-generator-removal",
      run: () => reviewFiveSenses(fiveSenseOriginal.replace(
        "export function* stream() { yield 1; }",
        "function replacementStream() { return 1; }",
      )),
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(result.senses.eyes.structural_inventory.missing.exports.includes("stream"));
        assert.ok(result.senses.eyes.structural_inventory.missing.symbols.includes("stream"));
      },
    },
    {
      id: "wildcard-reexport-removal-with-retained-import",
      run: () => reviewFiveSenses(fiveSenseOriginal.replace(
        "export * from \"./wild.js\";",
        "const wildcardStillImported = true;",
      )),
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(result.senses.eyes.structural_inventory.before.dependencies.includes("./wild.js"));
        assert.ok(result.senses.eyes.structural_inventory.after.dependencies.includes("./wild.js"));
        assert.deepEqual(result.senses.eyes.structural_inventory.missing.wildcard_exports, ["* from ./wild.js"]);
      },
    },
    {
      id: "structure-contract-removal",
      run: () => reviewFiveSenses(fiveSenseOriginal.replace(
        'id="main-panel" data-cl-route-id="setup"',
        'id="replacement-panel" data-cl-route-id="replacement"',
      )),
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(fiveSenseFinding(result, "CG-DOM-ID-PRESERVATION-001"));
        assert.ok(fiveSenseFinding(result, "CG-ROUTE-PRESERVATION-001"));
      },
    },
    {
      id: "dependency-contract-removal",
      run: () => reviewFiveSenses(fiveSenseOriginal.replace(
        'import "./dependency.js";',
        "const dependencyReplacement = true;",
      )),
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(fiveSenseFinding(result, "CG-DEPENDENCY-PRESERVATION-001"));
      },
    },
    {
      id: "state-contract-removal",
      run: () => {
        let proposed = fiveSenseOriginal.replace(
          'localStorage.setItem("code-labs-state", "ready");',
          "const replacementStorage = true;",
        );
        proposed = proposed.replace(
          '{ action: "setup.save", tool: "code_god.review" }',
          "{ replacement: true }",
        );
        return reviewFiveSenses(proposed);
      },
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(fiveSenseFinding(result, "CG-STORAGE-PRESERVATION-001"));
        assert.ok(fiveSenseFinding(result, "CG-PUBLIC-TOOL-PRESERVATION-001"));
      },
    },
    {
      id: "backend-contract-removal",
      run: () => {
        let proposed = fiveSenseOriginal.replace(
          'client.from("code_labs_files")',
          "client.from(replacementTable)",
        );
        proposed = proposed.replace(
          'client.rpc("code_labs_apply_workspace_action_strict")',
          "client.rpc(replacementRpc)",
        );
        proposed = proposed.replace(
          'client.functions.invoke("code-labs-mcp-stub")',
          "client.functions.invoke(replacementFunction)",
        );
        return reviewFiveSenses(proposed);
      },
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.ok(result.senses.eyes.structural_inventory.missing.database_tables.includes("code_labs_files"));
        assert.ok(result.senses.eyes.structural_inventory.missing.rpcs.includes("code_labs_apply_workspace_action_strict"));
        assert.ok(result.senses.eyes.structural_inventory.missing.edge_functions.includes("code-labs-mcp-stub"));
        assert.ok(fiveSenseFinding(result, "CG-DATABASE-PRESERVATION-001"));
      },
    },
    {
      id: "ears-accept-change-fix-and-patch",
      run: () => reviewFiveSenses(
        fiveSenseOriginal,
        {
          fields: {
            review_inputs: [
              { kind: "change", text: "Keep the canonical route owner unchanged." },
              { kind: "fix", text: "Preserve every exported binding." },
              { kind: "patch", text: "Replace only the reviewed parser block." },
            ],
          },
        },
      ),
      verify: (result) => {
        assert.equal(result.outcome, "PASS");
        assert.equal(result.senses.ears.accepted_count, 5);
        assert.deepEqual(
          result.senses.ears.accepted.slice(-3).map((entry) => entry.kind),
          ["change", "fix", "patch"],
        );
        assert.deepEqual(
          result.senses.mouth.acknowledged_input_ids,
          result.senses.ears.accepted.map((entry) => entry.input_id),
        );
        assert.match(result.senses.mouth.change_and_patch_policy, /protected one-file Writer/);
      },
    },
    {
      id: "ears-reject-secret-shaped-input",
      run: () => {
        const secretInput = ["pass", "word"].join("") + ' = "very-secret-value"';
        return reviewFiveSenses(fiveSenseOriginal, { fields: { patch: secretInput } });
      },
      verify: (result) => {
        assert.equal(result.outcome, "BLOCK");
        assert.equal(result.senses.ears.secret_rejection_count, 1);
        assert.ok(fiveSenseFinding(result, "CG-INPUT-SECRET-001"));
      },
    },
    {
      id: "brain-requires-canonical-learning-history",
      run: () => reviewFiveSenses(
        fiveSenseOriginal,
        {},
        (context) => { context.project.metadata.workflow_learning_history = {}; },
      ),
      verify: (result) => {
        assert.equal(result.outcome, "FIX_FIRST");
        assert.equal(result.senses.brain.learning_history_status, "INCOMPLETE");
        assert.ok(fiveSenseFinding(result, "CG-LEARNING-HISTORY-001"));
      },
    },
  ];

  assert.equal(cases.length, 12);
  for (const benchmark of cases) {
    await t.test(benchmark.id, async () => benchmark.verify(await benchmark.run()));
  }
});
