import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import { githubRequest, verifyOwnerRepository } from "./github-authority.ts";
// @ts-ignore -- Deno loads the reviewed JavaScript source-contract module directly.
import {
  normaliseWriterBranchProof,
  verifyWriterExecutionSnapshot,
} from "./writer-immutable-branch-proof.mjs";
// @ts-ignore -- Deno loads the reviewed JavaScript source-contract module directly.
import {
  buildWriterGitCasPlan,
  validateCreatedCommitProof,
} from "./writer-git-cas-plan.mjs";

type Row = Record<string, any>;

const MAX_CONTENT = 180000;
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);
const HASH = /^[a-f0-9]{64}$/;
const SHA40 = /^[a-f0-9]{40}$/;

function safeBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) ||
    branch.startsWith("/") || branch.endsWith("/") ||
    branch.includes("//") || branch.includes("..") ||
    PROTECTED.has(branch.toLowerCase())
  ) throw new Error("The GitHub branch is missing or protected.");
  return branch;
}

function safePath(value: unknown) {
  const path = String(value || "").trim().replace(/^\/+/, "");
  if (
    !path || path.includes("..") || path.includes("\\") ||
    path.startsWith(".") || path.toLowerCase().includes("secrets")
  ) throw new Error("The GitHub path is missing or unsafe.");
  if (/\.(env|pem|key|p12|pfx)$/i.test(path) || path.startsWith(".github/")) {
    throw new Error("The GitHub path is protected.");
  }
  return path;
}

function exactSha(value: unknown, label: string) {
  const sha = String(value || "").trim().toLowerCase();
  if (!SHA40.test(sha)) throw new Error(label + " is missing or invalid.");
  return sha;
}

function encodeRef(branch: string) {
  return branch.split("/").map(encodeURIComponent).join("/");
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function audit(requestId: string, action: string, detail: Row) {
  await rest("code_labs_write_audit", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ write_request_id: requestId, action, detail }),
  });
}

async function selectedRequest(ownerId: string, requestId: string) {
  const row = await one(
    "code_labs_write_requests?select=*&id=eq." + encodeURIComponent(requestId) +
      "&requested_by=eq." + encodeURIComponent(ownerId) + "&limit=1",
  );
  if (!row) throw new Error("The Code Labs write request was not found.");
  return row;
}

function completedProof(request: Row) {
  const commitSha = String(request.github_commit_sha || "");
  const contentSha = String(request.github_content_sha || "");
  const pullNumber = Number(request.pull_request_number || 0);
  const pullUrl = String(request.pull_request_url || "");
  if (
    String(request.status || "") !== "pr_opened" || !SHA40.test(commitSha) ||
    !SHA40.test(contentSha) || !pullNumber || !pullUrl
  ) return null;
  return {
    branch: String(request.branch || ""),
    path: String(request.path || ""),
    commit_sha: commitSha,
    content_sha: contentSha,
    pull_request_number: pullNumber,
    pull_request_url: pullUrl,
    draft: true,
    reused: true,
  };
}

function immutableReviewProof(request: Row) {
  const proof = {
    version: String(request.code_god_review_version || ""),
    outcome: String(request.code_god_outcome || ""),
    handoff_hash: String(request.code_god_handoff_hash || ""),
    proposed_hash: String(request.code_god_proposed_hash || ""),
    reviewed_at: String(request.code_god_reviewed_at || ""),
    source_file_id: String(request.code_god_source_file_id || ""),
  };
  if (
    proof.outcome !== "PASS" || !proof.version ||
    !HASH.test(proof.handoff_hash) || !HASH.test(proof.proposed_hash) ||
    !proof.reviewed_at || Number.isNaN(Date.parse(proof.reviewed_at)) ||
    !proof.source_file_id
  ) throw new Error("Immutable Code God PASS proof is required.");
  return proof;
}

function sameReviewProof(left: Row, right: Row) {
  return left.version === right.version && left.outcome === right.outcome &&
    left.handoff_hash === right.handoff_hash &&
    left.proposed_hash === right.proposed_hash &&
    left.reviewed_at === right.reviewed_at &&
    left.source_file_id === right.source_file_id;
}

function sameRequestProof(left: Row, right: Row) {
  const leftBranch = normaliseWriterBranchProof(left);
  const rightBranch = normaliseWriterBranchProof(right);
  return JSON.stringify(leftBranch) === JSON.stringify(rightBranch) &&
    String(left.repo || "") === String(right.repo || "") &&
    String(left.action || "") === String(right.action || "") &&
    String(left.content || "") === String(right.content || "") &&
    String(left.commit_message || "") === String(right.commit_message || "") &&
    String(left.pr_title || "") === String(right.pr_title || "") &&
    String(left.pr_body || "") === String(right.pr_body || "") &&
    left.direct_main_write === right.direct_main_write &&
    left.branch_pr_only === right.branch_pr_only &&
    left.deletes_anything === right.deletes_anything;
}

async function claimRequest(ownerId: string, requestId: string, claimId: string) {
  const value = await rest("rpc/code_labs_claim_write_request", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_owner_id: ownerId,
      p_request_id: requestId,
      p_claim_id: claimId,
    }),
  });
  const claimed = Array.isArray(value) ? value[0] : value;
  if (
    !claimed || String(claimed.id || "") !== requestId ||
    String(claimed.writer_claim_id || "") !== claimId ||
    String(claimed.status || "") !== "processing"
  ) throw new Error("The Code Labs write request could not be claimed.");
  return claimed;
}

function safeFailureMessage(stage: string, error: unknown) {
  const raw = error instanceof Error
    ? error.message
    : String(error || "Writer execution failed.");
  const fixed: Record<string, string> = {
    request_lookup: "The queued request could not be loaded or validated.",
    review_validation: "The immutable Code God review proof is missing or invalid.",
    request_claim: "The queued request is already claimed or no longer executable.",
    github_token: "GitHub App installation authentication failed.",
    branch_verification: "The reviewed GitHub branch proof could not be verified.",
    snapshot_validation: "The GitHub branch, base, target or pull-request state changed after review.",
    pr_preflight: "The branch already has an unsafe or ambiguous pull-request state.",
    git_blob: "GitHub did not accept the reviewed complete-file blob.",
    git_tree: "GitHub did not accept the reviewed one-file tree.",
    git_commit: "GitHub did not accept the parent-bound commit.",
    ref_update_no_write: "The branch reference was not advanced; the request may be retried.",
    ref_update_conflict: "The branch changed after review; prepare a fresh handoff.",
    ref_update_unknown: "The branch-reference outcome could not be reconciled safely.",
    ref_verify: "The updated branch reference could not be verified.",
    commit_checkpoint: "GitHub committed, but the durable Writer checkpoint could not be saved.",
    draft_pr: "The draft pull request could not be opened or reused.",
    request_update:
      "GitHub completed, but the Code Labs request receipt could not be finalized.",
  };
  if (/GitHub App|GitHub installation|repository operation/i.test(raw)) {
    return fixed.github_token;
  }
  return fixed[stage] || "The guarded GitHub writer failed before completion.";
}

function requiresManualRecovery(stage: string) {
  return [
    "ref_update_unknown",
    "ref_verify",
    "commit_checkpoint",
    "draft_pr",
    "request_update",
  ].includes(stage);
}

function requiresFreshReview(stage: string) {
  return ["snapshot_validation", "pr_preflight", "ref_update_conflict"].includes(stage);
}

async function recordFailure(
  ownerId: string,
  requestId: string,
  claimId: string,
  stage: string,
  error: unknown,
  progress: Row,
) {
  const message = safeFailureMessage(stage, error);
  const recoveryRequired = requiresManualRecovery(stage);
  const freshReviewRequired = requiresFreshReview(stage);
  const retryable = !recoveryRequired && !freshReviewRequired;
  const patch: Row = {
    status: retryable ? "queued" : "failed",
    error: stage + ": " + message,
    updated_at: new Date().toISOString(),
  };
  if (retryable) {
    patch.writer_claim_id = null;
    patch.writer_claimed_at = null;
  }
  if (progress.commit_sha && progress.content_sha) {
    patch.github_branch_created = true;
    patch.github_commit_sha = progress.commit_sha;
    patch.github_content_sha = progress.content_sha;
    patch.writer_phase = "github_committed";
  }
  if (progress.pull_request_number && progress.pull_request_url) {
    patch.status = "pr_opened";
    patch.writer_phase = "pr_opened";
    patch.pull_request_number = progress.pull_request_number;
    patch.pull_request_url = progress.pull_request_url;
  }
  await Promise.allSettled([
    audit(requestId, "writer_failed", {
      stage,
      claim_id: claimId,
      message,
      retryable,
      fresh_review_required: freshReviewRequired,
      recovery_required: recoveryRequired,
      commit_proof_preserved: Boolean(
        progress.commit_sha && progress.content_sha,
      ),
      pull_request_proof_preserved: Boolean(
        progress.pull_request_number && progress.pull_request_url,
      ),
    }),
    rest(
      "code_labs_write_requests?id=eq." + encodeURIComponent(requestId) +
        "&requested_by=eq." + encodeURIComponent(ownerId) +
        "&status=eq.processing&writer_claim_id=eq." +
        encodeURIComponent(claimId),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(patch),
      },
    ),
  ]);
}

function treeEntry(tree: Row, path: string) {
  if (tree?.truncated === true) {
    throw new Error("The reviewed parent tree is too large to verify safely.");
  }
  const rows = Array.isArray(tree?.tree) ? tree.tree : [];
  return rows.find((entry: Row) => String(entry?.path || "") === path) || null;
}

async function openPulls(
  repoPath: string,
  token: string,
  owner: string,
  branch: string,
  baseBranch: string,
) {
  const pulls = await githubRequest(
    repoPath + "/pulls?state=open&head=" +
      encodeURIComponent(owner + ":" + branch) + "&base=" +
      encodeURIComponent(baseBranch),
    token,
  );
  return Array.isArray(pulls) ? pulls : [];
}

function safeDraftPull(pulls: Row[], branch: string, baseBranch: string) {
  if (pulls.length > 1) {
    throw new Error("More than one open pull request matches the reviewed branch route.");
  }
  const pull = pulls[0] || null;
  if (!pull) return null;
  if (
    pull.draft !== true || String(pull.state || "") !== "open" ||
    String(pull.head?.ref || "") !== branch ||
    String(pull.base?.ref || "") !== baseBranch
  ) {
    throw new Error("The existing pull request is not the reviewed open draft route.");
  }
  return pull;
}

async function persistCommitCheckpoint(
  ownerId: string,
  requestId: string,
  claimId: string,
  commitSha: string,
  contentSha: string,
) {
  const updated = await rest(
    "code_labs_write_requests?id=eq." + encodeURIComponent(requestId) +
      "&requested_by=eq." + encodeURIComponent(ownerId) +
      "&status=eq.processing&writer_claim_id=eq." + encodeURIComponent(claimId),
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        github_branch_created: true,
        github_commit_sha: commitSha,
        github_content_sha: contentSha,
        writer_phase: "github_committed",
        error: null,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!Array.isArray(updated) || !updated[0]) {
    throw new Error("The GitHub commit checkpoint could not be persisted.");
  }
  return updated[0];
}

export async function executeGithubWriter(b: Binding, args: Row) {
  if (args.confirmed !== true) {
    throw new Error("confirmed must be true to execute the GitHub writer.");
  }
  const requestId = String(args.request_id || "").trim();
  if (!requestId) throw new Error("request_id is required.");

  let stage = "request_lookup";
  let claimOwned = false;
  const claimId = crypto.randomUUID();
  const progress: Row = {};
  try {
    const pending = await selectedRequest(b.owner_id, requestId);
    const completed = completedProof(pending);
    if (completed) {
      return {
        ok: true,
        version: VERSION,
        tool: "execute_code_labs_github_writer",
        wrote_database: false,
        wrote_github: false,
        opened_pr: false,
        deleted_anything: false,
        request: pending,
        github: completed,
      };
    }
    if (
      pending.direct_main_write !== false || pending.branch_pr_only !== true ||
      pending.deletes_anything !== false
    ) throw new Error("The request safety flags are invalid.");
    if (
      !["queued", "prepared", "branch_created"].includes(
        String(pending.status || ""),
      )
    ) throw new Error("The request is not executable in its current state.");
    const branch = safeBranch(pending.branch);
    const path = safePath(pending.path);
    const content = String(pending.content || "");
    if (!content || content.length > MAX_CONTENT) {
      throw new Error("A complete file under the queue limit is required.");
    }

    stage = "review_validation";
    const pendingReview = immutableReviewProof(pending);
    normaliseWriterBranchProof(pending);

    stage = "request_claim";
    const request = await claimRequest(b.owner_id, requestId, claimId);
    claimOwned = true;
    const claimedReview = immutableReviewProof(request);
    if (!sameReviewProof(pendingReview, claimedReview) || !sameRequestProof(pending, request)) {
      throw new Error("The immutable request proof changed during claim.");
    }
    await audit(requestId, "writer_claimed", {
      claim_id: claimId,
      branch,
      path,
      code_god_review_version: claimedReview.version,
      code_god_handoff_hash: claimedReview.handoff_hash,
      code_god_proposed_hash: claimedReview.proposed_hash,
    });

    stage = "github_token";
    const authority = await verifyOwnerRepository(b.owner_id, request.repo, {
      contents: "write",
      pull_requests: "write",
    });
    const token = authority.token;
    const repoPath = "/repos/" +
      [authority.owner, authority.name].map(encodeURIComponent).join("/");
    const proof = normaliseWriterBranchProof(request);
    if (proof.base_branch !== authority.default_branch) {
      throw new Error("The reviewed base branch is no longer the verified default branch.");
    }
    if (branch.toLowerCase() === authority.default_branch.toLowerCase()) {
      throw new Error("The requested branch is the verified default branch.");
    }

    stage = "branch_verification";
    const [baseRef, headRef] = await Promise.all([
      githubRequest(
        repoPath + "/git/ref/heads/" + encodeRef(proof.base_branch),
        token,
      ),
      githubRequest(
        repoPath + "/git/ref/heads/" + encodeRef(branch),
        token,
      ),
    ]);
    const baseSha = exactSha(baseRef?.object?.sha, "The base branch SHA");
    const headSha = exactSha(headRef?.object?.sha, "The repair branch SHA");
    const comparison = await githubRequest(
      repoPath + "/compare/" + encodeURIComponent(baseSha) + "..." +
        encodeURIComponent(headSha),
      token,
    );
    const mergeBaseSha = exactSha(
      comparison?.merge_base_commit?.sha,
      "The merge-base SHA",
    );
    const parentCommit = await githubRequest(
      repoPath + "/git/commits/" + encodeURIComponent(headSha),
      token,
    );
    const parentTreeSha = exactSha(
      parentCommit?.tree?.sha,
      "The reviewed parent tree SHA",
    );
    const parentTree = await githubRequest(
      repoPath + "/git/trees/" + encodeURIComponent(parentTreeSha) + "?recursive=1",
      token,
    );
    const entry = treeEntry(parentTree, path);
    const live = {
      repo: String(request.repo || ""),
      branch,
      base_sha: baseSha,
      head_sha: headSha,
      merge_base_sha: mergeBaseSha,
      blob_absent: entry == null,
      blob_sha: entry == null ? null : exactSha(entry.sha, "The target blob SHA"),
      blob_mode: entry == null ? null : String(entry.mode || ""),
      blob_type: entry == null ? null : String(entry.type || ""),
    };

    stage = "snapshot_validation";
    verifyWriterExecutionSnapshot(request, live);
    const plan = await buildWriterGitCasPlan(request, live);
    await audit(requestId, "branch_verified", {
      claim_id: claimId,
      branch,
      base_sha: plan.expected_base_sha,
      head_sha: plan.expected_parent_sha,
      merge_base_sha: mergeBaseSha,
      target_blob_sha: plan.expected_blob_sha,
      target_blob_absent: plan.expected_blob_absent,
      target_blob_mode: plan.expected_blob_mode,
    });

    stage = "pr_preflight";
    safeDraftPull(
      await openPulls(repoPath, token, authority.owner, branch, proof.base_branch),
      branch,
      proof.base_branch,
    );

    stage = "git_blob";
    const createdBlob = await githubRequest(repoPath + "/git/blobs", token, {
      method: "POST",
      body: JSON.stringify(plan.requests.create_blob.body),
    });
    const contentSha = exactSha(createdBlob?.sha, "The created blob SHA");

    stage = "git_tree";
    const createdTree = await githubRequest(repoPath + "/git/trees", token, {
      method: "POST",
      body: JSON.stringify({
        base_tree: parentTreeSha,
        tree: [{
          path,
          mode: plan.expected_blob_mode,
          type: "blob",
          sha: contentSha,
        }],
      }),
    });
    const createdTreeSha = exactSha(createdTree?.sha, "The created tree SHA");

    stage = "git_commit";
    const createdCommit = await githubRequest(repoPath + "/git/commits", token, {
      method: "POST",
      body: JSON.stringify({
        message: String(
          request.commit_message || "Code Labs complete-file update",
        ).slice(0, 240),
        tree: createdTreeSha,
        parents: [plan.expected_parent_sha],
      }),
    });
    const createdCommitSha = exactSha(
      createdCommit?.sha,
      "The created commit SHA",
    );
    const createdCommitProof = await githubRequest(
      repoPath + "/git/commits/" + encodeURIComponent(createdCommitSha),
      token,
    );
    const createdParents = Array.isArray(createdCommitProof?.parents)
      ? createdCommitProof.parents
      : [];
    if (
      createdParents.length !== 1 ||
      exactSha(createdParents[0]?.sha, "The created commit parent SHA") !==
        plan.expected_parent_sha
    ) {
      throw new Error("The created commit is not bound to the reviewed parent.");
    }

    stage = "pr_preflight";
    safeDraftPull(
      await openPulls(repoPath, token, authority.owner, branch, proof.base_branch),
      branch,
      proof.base_branch,
    );

    stage = "ref_update_no_write";
    try {
      await githubRequest(
        repoPath + "/git/refs/heads/" + encodeRef(branch),
        token,
        {
          method: "PATCH",
          body: JSON.stringify({ sha: createdCommitSha, force: false }),
        },
      );
    } catch (error) {
      let reconciledSha = "";
      try {
        const refAfterError = await githubRequest(
          repoPath + "/git/ref/heads/" + encodeRef(branch),
          token,
        );
        reconciledSha = exactSha(
          refAfterError?.object?.sha,
          "The reconciled branch SHA",
        );
      } catch {
        stage = "ref_update_unknown";
        throw error;
      }
      if (reconciledSha === createdCommitSha) {
        // GitHub applied the ref update but the original response was lost.
      } else if (reconciledSha === plan.expected_parent_sha) {
        stage = "ref_update_no_write";
        throw error;
      } else {
        stage = "ref_update_conflict";
        throw new Error("The branch head changed before the reviewed commit could be applied.");
      }
    }

    stage = "ref_verify";
    const updatedRef = await githubRequest(
      repoPath + "/git/ref/heads/" + encodeRef(branch),
      token,
    );
    const refSha = exactSha(updatedRef?.object?.sha, "The updated branch SHA");
    validateCreatedCommitProof(plan, {
      commit_sha: createdCommitSha,
      parent_sha: plan.expected_parent_sha,
      ref_sha: refSha,
    });
    progress.commit_sha = createdCommitSha;
    progress.content_sha = contentSha;
    await audit(requestId, "file_committed", {
      claim_id: claimId,
      branch,
      path,
      parent_sha: plan.expected_parent_sha,
      commit_sha: createdCommitSha,
      content_sha: contentSha,
      file_mode: plan.expected_blob_mode,
      force: false,
    });

    stage = "commit_checkpoint";
    await persistCommitCheckpoint(
      b.owner_id,
      requestId,
      claimId,
      createdCommitSha,
      contentSha,
    );

    stage = "draft_pr";
    const pulls = await openPulls(
      repoPath,
      token,
      authority.owner,
      branch,
      proof.base_branch,
    );
    let pull = safeDraftPull(pulls, branch, proof.base_branch);
    if (!pull) {
      pull = await githubRequest(repoPath + "/pulls", token, {
        method: "POST",
        body: JSON.stringify({
          title: String(request.pr_title || "Code Labs update: " + path),
          body: String(
            request.pr_body || "Prepared by Code Labs after Code God PASS.",
          ),
          head: branch,
          base: proof.base_branch,
          draft: true,
          maintainer_can_modify: false,
        }),
      });
    }
    const pullNumber = Number(pull?.number || 0);
    const pullUrl = String(pull?.html_url || "");
    if (!pullNumber || !pullUrl || pull?.draft !== true) {
      throw new Error("GitHub did not return draft pull-request proof.");
    }
    progress.pull_request_number = pullNumber;
    progress.pull_request_url = pullUrl;
    await audit(requestId, "draft_pr_opened", {
      claim_id: claimId,
      pull_request_number: pullNumber,
      pull_request_url: pullUrl,
      reused: Array.isArray(pulls) && pulls.length > 0,
      draft: true,
    });

    stage = "request_update";
    const updated = await rest(
      "code_labs_write_requests?id=eq." + encodeURIComponent(requestId) +
        "&requested_by=eq." + encodeURIComponent(b.owner_id) +
        "&status=eq.processing&writer_claim_id=eq." +
        encodeURIComponent(claimId),
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "pr_opened",
          writer_phase: "pr_opened",
          github_branch_created: true,
          github_commit_sha: createdCommitSha,
          github_content_sha: contentSha,
          pull_request_number: pullNumber,
          pull_request_url: pullUrl,
          error: null,
          updated_at: new Date().toISOString(),
        }),
      },
    );
    if (!Array.isArray(updated) || !updated[0]) {
      throw new Error("The claimed request could not be finalized.");
    }
    return {
      ok: true,
      version: VERSION,
      tool: "execute_code_labs_github_writer",
      wrote_database: true,
      wrote_github: true,
      opened_pr: true,
      deleted_anything: false,
      request: updated[0],
      github: {
        branch,
        path,
        parent_sha: plan.expected_parent_sha,
        commit_sha: createdCommitSha,
        content_sha: contentSha,
        file_mode: plan.expected_blob_mode,
        pull_request_number: pullNumber,
        pull_request_url: pullUrl,
        draft: true,
      },
    };
  } catch (error) {
    if (claimOwned) {
      await recordFailure(
        b.owner_id,
        requestId,
        claimId,
        stage,
        error,
        progress,
      );
    }
    throw error;
  }
}
