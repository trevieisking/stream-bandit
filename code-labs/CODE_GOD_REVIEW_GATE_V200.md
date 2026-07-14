# Code God Review Gate V200

## Purpose

Code God is the mandatory read-only pre-commit reviewer for Code Labs full-file changes.

It runs before the GitHub connector creates or updates a branch. It does not write GitHub, merge, deploy, edit `main`, modify Supabase data, or press live-page actions.

Codex remains the independent post-commit pull-request reviewer. Code God does not replace Codex.

## Required flow

1. Read the current repository file from the selected source branch.
2. Read the proposed complete replacement file from the current visible Code Labs editor.
3. Verify repository, path, source branch and requested non-main branch.
4. Compare current and proposed files.
5. Compare the proposal against the Code Labs page contract, route map, shared Header/Page/Footer owners, dependency map, storage keys and protected boundaries.
6. Run deterministic syntax, structure, safety and regression checks.
7. Produce a signed review receipt with `PASS`, `FIX_FIRST` or `BLOCK`.
8. Permit the GitHub connector to execute only a current `PASS` receipt whose hashes still match.
9. Open or update a pull request.
10. Request independent Codex review on the exact resulting commit.

## Comparison inputs

Code God must receive:

- repository;
- target path;
- source branch;
- requested branch;
- current file content and SHA;
- proposed full-file content and hash;
- requested outcome;
- preservation rules;
- current Code Labs page fingerprint when the proposal came from a live page;
- relevant route-map and dependency records;
- relevant shared-shell and page-role contracts.

It must reject missing, stale or contradictory identity fields.

## Deterministic checks

### Full-file integrity

- Reject blank files, placeholders, recipes, snippets and unified diffs presented as complete files.
- Detect likely truncation using file type, required closing structures, current/proposed size ratio and abrupt endings.
- Require a complete HTML document for HTML targets.
- Require parseable JSON for JSON targets.
- Run JavaScript or TypeScript syntax checking when supported.
- Detect unresolved conflict markers and accidental Markdown fences.

### Scope and identity

- Repository must be `trevieisking/stream-bandit` unless an approved future contract explicitly changes it.
- Block direct writes to `main`, `master`, `production`, `live` and `gh-pages`.
- Block path traversal, secret-like files and unrelated Stream Bandit application scope during the Code Labs rebuild.
- Confirm that the selected file, current GitHub file and proposed file all refer to the same intended path.
- Confirm that Setup project URL, repository and current file path remain separate values.

### Regression comparison

- Report removed functions, exports, DOM IDs, event names, localStorage keys, Supabase table names, RPC names, Edge Function names, route links and shared helper loads.
- Report changed authentication, RLS, storage, payment, secret, deployment or GitHub-write behavior.
- Detect duplicate shell ownership, repeated panel insertion, competing navigation rewrites and recurring timers that can cause page jumping.
- Detect newly introduced background saves, polling or repeated writes.
- Detect relative preview links that can resolve to 404 routes.
- Check that Header settles before Page Runtime, and Page Runtime settles before Footer/V104.

### Security

- Block service-role keys, private keys, access tokens, passwords and secret environment values in browser code or review output.
- Redact publishable-key values in reports when the value is not needed for the finding.
- Block unauthenticated server-side privileged access.
- Require owner/session binding for live page control.
- Require exact current-page fingerprints for live mutations.
- Require explicit double confirmation for dangerous page actions.
- Keep browser GitHub access read-only; GitHub writes belong only to the GitHub connector.

### GitHub handoff

- Require a non-main branch name.
- Require full replacement content and a current target-file SHA for updates.
- Require a clear commit message and PR title.
- Disallow deletion in the V200 normal lane.
- Require a Code God `PASS` receipt before branch execution.
- Require the GitHub connector to write commit SHA, content SHA, preview URL, PR number and PR URL back to the Code Labs request receipt.

## Review findings

Findings use these levels:

- `P0`: secret exposure, direct-main path, destructive production action or cross-owner access;
- `P1`: likely data loss, broken authentication, wrong repository/file, unusable page or unsafe write;
- `P2`: functional regression, stale state, duplicate helper/timer, broken route or missing cache propagation;
- `P3`: maintainability, clarity, accessibility or low-risk consistency issue.

Every finding must include:

- severity;
- rule ID;
- file and relevant line or section;
- evidence from current and proposed code;
- why it matters;
- exact recommended correction;
- confidence;
- whether it blocks the GitHub handoff.

Code God must not invent a finding without evidence.

## Outcomes

### PASS

No blocking findings. The receipt authorizes one GitHub connector execution for the exact repository, path, branch, current SHA and proposed hash.

### FIX_FIRST

One or more correctable P1/P2 findings exist. Code God returns precise fixes and must rerun against the corrected full file.

### BLOCK

The request violates identity, secret, ownership, protected-branch, destructive-action or scope boundaries. No GitHub request may execute.

## Receipt

A valid receipt contains:

```json
{
  "tool": "code_god_review",
  "version": "V200",
  "review_id": "uuid",
  "outcome": "PASS",
  "repo": "trevieisking/stream-bandit",
  "path": "code-labs/example.html",
  "source_branch": "main",
  "request_branch": "fix/example",
  "current_sha": "git-blob-sha",
  "proposed_hash": "sha256",
  "page_fingerprint": "optional-live-page-fingerprint",
  "findings": [],
  "checks_run": [],
  "created_at": "timestamp",
  "expires_at": "timestamp",
  "used_at": null
}
```

The receipt is single-use and expires. Any change to content, path, repository, branch, current SHA or page fingerprint invalidates it.

## User-facing behavior

Code God explains results for a non-coder:

- what passed;
- what is unsafe or broken;
- what exact full-file correction is needed;
- whether the GitHub branch may be created;
- what will be checked again after the correction.

It must never claim a branch, commit, PR, deployment or database change occurred unless a separate tool receipt proves it.

## Acceptance gates

Code God is complete only when tests prove:

- a valid complete file receives `PASS`;
- truncated files, snippets and diffs are rejected;
- secret-like content is blocked and redacted;
- direct-main and protected-branch requests are blocked;
- wrong-repository and wrong-path state are blocked;
- removed protected APIs, routes and storage keys are reported;
- duplicate helper/timer regressions are reported;
- a changed proposal invalidates the old receipt;
- a `PASS` receipt can be consumed only once;
- the GitHub connector records a complete branch/commit/PR receipt;
- Codex review is still requested after the GitHub commit.
