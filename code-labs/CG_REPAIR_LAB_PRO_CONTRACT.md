# CG Repair Lab Pro Contract

## 1. Purpose and product placement

CG Repair Lab is a Code Labs Pro feature for repository-aware investigation and repair preparation. In the Code Labs workflow it is placed immediately before Code God.

The required sequence is:

1. Select an eligible repository and source file.
2. Run CG Repair Lab analysis.
3. Review its findings and, when useful, its proposed complete-file candidate.
4. Submit the proposal to Code God for deterministic final review.
5. After a Code God PASS, use GitHub Writer as the only reviewed execution route to the existing non-protected branch and draft pull request.

CG Repair Lab is advisory and preparatory. It does not bypass, replace, weaken or duplicate Code God.

## 2. Code Labs Pro entitlement

Access requires an active Code Labs Pro entitlement.

Entitlement must be enforced in both places:

- **User interface:** hide or disable CG Repair Lab actions for users without Code Labs Pro and present the appropriate upgrade or access message.
- **Server-side action:** independently verify the current owner's Code Labs Pro entitlement on every CG Repair Lab request before repository access or analysis begins.

Client state, hidden controls or a previously successful request are not sufficient proof of entitlement. The server must deny an unentitled request even if it is called directly.

## 3. Repository scope and GitHub verification

CG Repair Lab must support arbitrary repositories owned by the current user. It must not hard-code Stream Bandit, a repository ID, a repository name, an installation ID, a branch or a file path.

Before reading repository content, the server must:

1. resolve the current Code Labs owner;
2. resolve the requested repository through that owner's connected GitHub installation;
3. verify that the installation grants access to the repository;
4. verify that the repository is within the current owner's allowed repository scope; and
5. bind all subsequent reads and generated artifacts to that verified owner, repository, ref and source path.

A repository name or URL supplied by the client is only a request, not authorization. Cross-owner access, unverified installations and repositories outside the current owner's scope must be rejected without attempting analysis.

## 4. Read-only analysis boundary

Repository analysis is read-only. CG Repair Lab may read the verified source and the minimum related repository files needed to understand it, subject to installation permissions and owner scope.

It may generate:

- findings;
- dependency maps;
- debug reports;
- references to relevant call sites;
- remediation guidance; and
- one proposed complete-file candidate for the selected source.

The complete-file candidate is a proposal stored separately from the selected source. Generating, refreshing or discarding a candidate must never automatically replace or modify the selected source.

Analysis must use bounded repository reads and must preserve the verified repository, ref and path provenance needed for later review.

## 5. Secret handling and redaction

CG Repair Lab must never include, display, return, log or persist secret values.

When secret-related context is relevant, reports may identify only:

- secret names;
- environment-variable references; and
- repository call sites that refer to them.

Before any finding, dependency map, debug report, candidate metadata, log or response is stored or returned, the server must redact credential-shaped values. Redaction must cover, at minimum, API keys, access tokens, bearer values, private keys, passwords, connection strings, signed URLs, session secrets and equivalent credential material.

Redaction is required even when a value appears in source code, comments, configuration, generated output, an upstream error or tool output. A redaction failure must fail closed: omit the affected material and report a safe diagnostic without echoing the suspected value.

## 6. Prohibited actions

CG Repair Lab must not:

- commit or push repository changes;
- create, update, merge or close pull requests;
- merge branches;
- deploy applications, functions or infrastructure;
- create, update, delete or migrate database data or schemas;
- change repository settings, secrets, permissions or GitHub installations;
- automatically replace the selected source;
- mark its own candidate as Code God-approved;
- invoke an unreviewed GitHub write route; or
- perform any write merely because analysis found a repair.

These restrictions apply to the user interface, server-side action, background processing and every integration used by the feature.

## 7. Code God review gate

Code God remains the deterministic final review gate.

CG Repair Lab output must be treated as untrusted proposed material until Code God reviews the complete candidate against the complete selected source, verified path and applicable safety rules. Findings or a high-confidence analysis result are not a PASS.

Only Code God may produce the deterministic final review outcome used to authorize the next workflow stage. A failed, incomplete, stale or missing Code God review blocks execution.

## 8. GitHub Writer execution boundary

GitHub Writer remains the only reviewed branch-and-draft-pull-request execution route.

CG Repair Lab may prepare a candidate and supporting report, but it must not execute them. GitHub Writer may act only after the established safeguards are satisfied, including a complete candidate, verified repository and source provenance, an existing non-protected branch, and a current Code God PASS.

The execution route must remain branch-and-draft-PR only. It must never write directly to the default branch, merge, deploy or change databases.

## 9. Output and storage requirements

Every stored or returned CG Repair Lab artifact must:

- be owner-scoped;
- identify the verified repository, ref and source path without exposing private account data;
- distinguish findings from proposed changes;
- identify whether a complete-file candidate exists;
- record that analysis was read-only;
- remain separate from the selected source;
- be safe for subsequent deterministic Code God review; and
- pass credential-shaped-value redaction before persistence and before output.

Reports should contain only the minimum repository context necessary to explain a finding. They must not expose credentials, unrelated private repository content or data from another owner.

## 10. Required server-side outcome states

The server-side action must return a bounded, non-executing outcome such as:

- **DENIED:** Code Labs Pro entitlement or owner-scoped repository authorization failed.
- **READY_FOR_REVIEW:** analysis completed and findings are available.
- **CANDIDATE_READY:** analysis completed and a proposed complete-file candidate is available for Code God.
- **SAFE_FAILURE:** analysis could not complete without violating scope, redaction or read-only constraints.

No CG Repair Lab outcome authorizes a repository write. Only a later, current Code God PASS can make an eligible reviewed candidate available to GitHub Writer.

## 11. Acceptance criteria

CG Repair Lab conforms to this contract only when all of the following are true:

- it appears immediately before Code God in the Code Labs Pro workflow;
- Code Labs Pro entitlement is enforced in the interface and on the server;
- arbitrary user-owned repositories are supported through the connected GitHub installation;
- every repository read is verified and owner-scoped;
- analysis is read-only;
- permitted outputs are limited to safe analysis artifacts and a proposed complete-file candidate;
- the selected source is never replaced automatically;
- secret values are never displayed or stored;
- credential-shaped values are redacted from reports and output;
- Code God remains the deterministic final review gate; and
- GitHub Writer remains the only reviewed branch-and-draft-PR execution route.
