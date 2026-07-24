import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import { githubRequest, verifyOwnerRepository } from "./github-authority.ts";

type Row = Record<string, any>;

const MAX_CONTENT = 180000;
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);
const HASH = /^[a-f0-9]{64}$/;

function safeBranch(value: unknown) {
  const branch = String(value || "").trim();
  if (
    !/^[A-Za-z0-9._/-]{3,80}$/.test(branch) ||
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

function bytesToBase64(value: Uint8Array) {
  let binary = "";
  const size = 0x8000;
  for (let offset = 0; offset < value.length; offset += size) {
    binary += String.fromCharCode(
      ...value.subarray(offset, Math.min(offset + size, value.length)),
    );
  }
  return btoa(binary);
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
    String(request.status || "") !== "pr_opened" || !commitSha || !contentSha ||
    !pullNumber || !pullUrl
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
    branch_verification: "The required GitHub branch could not be verified.",
    file_lookup: "The target GitHub file could not be read safely.",
    file_commit: "GitHub did not accept the reviewed complete-file commit.",
    draft_pr: "The draft pull request could not be opened or reused.",
    request_update:
      "GitHub completed, but the Code Labs request receipt could not be updated.",
  };
  if (/GitHub App|GitHub installation|repository operation/i.test(raw)) {
    return fixed.github_token;
  }
  if (
    /branch does not exist|GitHub request failed/i.test(raw) &&
    stage === "branch_verification"
  ) return fixed.branch_verification;
  return fixed[stage] || "The guarded GitHub writer failed before completion.";
}

function requiresManualRecovery(stage: string) {
  return ["file_commit", "draft_pr", "request_update"].includes(stage);
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
  const patch: Row = {
    status: recoveryRequired ? "failed" : "queued",
    error: stage + ": " + message,
    updated_at: new Date().toISOString(),
  };
  if (!recoveryRequired) {
    patch.writer_claim_id = null;
    patch.writer_claimed_at = null;
  }
  if (progress.commit_sha && progress.content_sha) {
    patch.github_branch_created = true;
    patch.github_commit_sha = progress.commit_sha;
    patch.github_content_sha = progress.content_sha;
  }
  if (progress.pull_request_number && progress.pull_request_url) {
    patch.status = "pr_opened";
    patch.pull_request_number = progress.pull_request_number;
    patch.pull_request_url = progress.pull_request_url;
  }
  await Promise.allSettled([
    audit(requestId, "writer_failed", {
      stage,
      claim_id: claimId,
      message,
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
    const proof = completedProof(pending);
    if (proof) {
      return {
        ok: true,
        version: VERSION,
        tool: "execute_code_labs_github_writer",
        wrote_database: false,
        wrote_github: false,
        opened_pr: false,
        deleted_anything: false,
        request: pending,
        github: proof,
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

    stage = "request_claim";
    const request = await claimRequest(b.owner_id, requestId, claimId);
    claimOwned = true;
    const claimedReview = immutableReviewProof(request);
    if (!sameReviewProof(pendingReview, claimedReview)) {
      throw new Error("The immutable Code God review proof changed during claim.");
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
    if (branch.toLowerCase() === authority.default_branch.toLowerCase()) {
      throw new Error("The requested branch is the verified default branch.");
    }

    stage = "branch_verification";
    const branchRef = await githubRequest(
      repoPath + "/git/ref/heads/" + encodeURIComponent(branch),
      token,
    );
    const branchSha = String(branchRef?.object?.sha || "");
    if (!branchSha) {
      throw new Error("The required GitHub branch does not exist.");
    }
    await audit(requestId, "branch_verified", {
      claim_id: claimId,
      branch,
      branch_sha: branchSha,
    });

    stage = "file_lookup";
    let currentSha: string | null = null;
    try {
      const existing = await githubRequest(
        repoPath + "/contents/" +
          path.split("/").map(encodeURIComponent).join("/") + "?ref=" +
          encodeURIComponent(branch),
        token,
      );
      currentSha = existing?.sha ? String(existing.sha) : null;
    } catch (error) {
      if (String(request.action) !== "create_file") throw error;
    }

    stage = "file_commit";
    const encodedContent = bytesToBase64(new TextEncoder().encode(content));
    const commitPayload: Row = {
      message: String(
        request.commit_message || "Code Labs complete-file update",
      ),
      content: encodedContent,
      branch,
    };
    if (currentSha) commitPayload.sha = currentSha;
    const committed = await githubRequest(
      repoPath + "/contents/" +
        path.split("/").map(encodeURIComponent).join("/"),
      token,
      { method: "PUT", body: JSON.stringify(commitPayload) },
    );
    const commitSha = String(committed?.commit?.sha || "");
    const contentSha = String(committed?.content?.sha || "");
    if (!commitSha || !contentSha) {
      throw new Error("GitHub did not return commit proof.");
    }
    progress.commit_sha = commitSha;
    progress.content_sha = contentSha;
    await audit(requestId, "file_committed", {
      claim_id: claimId,
      branch,
      path,
      commit_sha: commitSha,
      content_sha: contentSha,
    });

    stage = "draft_pr";
    const pulls = await githubRequest(
      repoPath + "/pulls?state=open&head=" +
        encodeURIComponent(authority.owner + ":" + branch) + "&base=" +
        encodeURIComponent(authority.default_branch),
      token,
    );
    let pull = Array.isArray(pulls) ? pulls[0] : null;
    if (!pull) {
      pull = await githubRequest(repoPath + "/pulls", token, {
        method: "POST",
        body: JSON.stringify({
          title: String(request.pr_title || "Code Labs update: " + path),
          body: String(
            request.pr_body || "Prepared by Code Labs after Code God PASS.",
          ),
          head: branch,
          base: authority.default_branch,
          draft: true,
          maintainer_can_modify: false,
        }),
      });
    }
    const pullNumber = Number(pull?.number || 0);
    const pullUrl = String(pull?.html_url || "");
    if (!pullNumber || !pullUrl) {
      throw new Error("GitHub did not return pull-request proof.");
    }
    progress.pull_request_number = pullNumber;
    progress.pull_request_url = pullUrl;
    await audit(requestId, "draft_pr_opened", {
      claim_id: claimId,
      pull_request_number: pullNumber,
      pull_request_url: pullUrl,
      reused: Array.isArray(pulls) && pulls.length > 0,
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
          github_branch_created: true,
          github_commit_sha: commitSha,
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
        commit_sha: commitSha,
        content_sha: contentSha,
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
