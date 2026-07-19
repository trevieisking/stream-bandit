import { Binding, rest } from "./oauth.ts";
import { VERSION } from "./context.ts";
import { githubRequest, verifyOwnerRepository } from "./github-authority.ts";

type Row = Record<string, any>;

const MAX_CONTENT = 180000;
const PROTECTED = new Set(["main", "master", "production", "live", "gh-pages"]);

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

async function digest(value: unknown) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(value ?? null)),
  );
  return Array.from(
    new Uint8Array(bytes),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
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

async function approvedHandoff(ownerId: string, request: Row) {
  const state = await one(
    "code_labs_workspace_state?select=*&owner_id=eq." +
      encodeURIComponent(ownerId) + "&limit=1",
  );
  if (!state?.current_file_id) {
    throw new Error("No Code Labs file is selected.");
  }
  const file = await one(
    "code_labs_files?select=*&id=eq." +
      encodeURIComponent(state.current_file_id) + "&owner_id=eq." +
      encodeURIComponent(ownerId) + "&limit=1",
  );
  const handoff = file?.metadata?.repo_handoff || {};
  const review = file?.metadata?.code_god_review || {};
  if (review.outcome !== "PASS") throw new Error("Code God PASS is required.");
  if (
    review.handoff_hash !== await digest(handoff) ||
    review.proposed_hash !== handoff.proposed_hash
  ) throw new Error("The reviewed handoff changed after Code God review.");
  if (!handoff.repo || String(handoff.repo) !== String(request.repo)) {
    throw new Error(
      "The queued repository does not match the reviewed handoff.",
    );
  }
  if (
    String(handoff.path) !== String(request.path) ||
    String(handoff.request_branch) !== String(request.branch)
  ) throw new Error("The queued request does not match the reviewed handoff.");
  if (String(handoff.proposed || "") !== String(request.content || "")) {
    throw new Error(
      "The queued content does not match the reviewed candidate.",
    );
  }
  return { handoff, review };
}

function safeFailureMessage(stage: string, error: unknown) {
  const raw = error instanceof Error
    ? error.message
    : String(error || "Writer execution failed.");
  const fixed: Record<string, string> = {
    request_lookup: "The queued request could not be loaded or validated.",
    handoff_validation:
      "The reviewed Code Labs handoff could not be validated.",
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
        "&requested_by=eq." + encodeURIComponent(ownerId),
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
  const progress: Row = {};
  try {
    const request = await selectedRequest(b.owner_id, requestId);
    if (
      request.direct_main_write !== false || request.branch_pr_only !== true ||
      request.deletes_anything !== false
    ) throw new Error("The request safety flags are invalid.");
    if (
      !["queued", "prepared", "branch_created"].includes(
        String(request.status || ""),
      )
    ) throw new Error("The request is not executable in its current state.");
    const branch = safeBranch(request.branch);
    const path = safePath(request.path);
    const content = String(request.content || "");
    if (!content || content.length > MAX_CONTENT) {
      throw new Error("A complete file under the queue limit is required.");
    }

    stage = "handoff_validation";
    await approvedHandoff(b.owner_id, request);

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
      pull_request_number: pullNumber,
      pull_request_url: pullUrl,
      reused: Array.isArray(pulls) && pulls.length > 0,
    });

    stage = "request_update";
    const updated = await rest(
      "code_labs_write_requests?id=eq." + encodeURIComponent(requestId) +
        "&requested_by=eq." + encodeURIComponent(b.owner_id),
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
    return {
      ok: true,
      version: VERSION,
      tool: "execute_code_labs_github_writer",
      wrote_database: true,
      wrote_github: true,
      opened_pr: true,
      deleted_anything: false,
      request: updated?.[0] || null,
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
    await recordFailure(b.owner_id, requestId, stage, error, progress);
    throw error;
  }
}
