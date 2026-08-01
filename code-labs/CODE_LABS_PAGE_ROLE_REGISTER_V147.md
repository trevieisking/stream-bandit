# Code Labs Page Role Register — V287 Release Alignment

This file is the no-drop and single-owner register for the current Code Labs recovery branch. It documents roles only. It does not create routes, mutate workflow state, authorise Writer, merge, deploy, or replace the authoritative Master Plan and Master Checklist evidence.

## Canonical ownership contract

- **Sole route, visible-step, sidebar and route-family owner:** `code-labs/assets/cl-nav.js` — V287.
- **Visible entry:** Home is visible step 1 but is not a governed workflow stage.
- **First governed workflow stage:** Master Plan + Setup is visible step 2 and workflow index 0.
- **Final governed workflow stage:** Master Plan Checklist is visible step 19.
- **Support pages:** unnumbered and outside `workflowRoutes`; they remain addressable and discoverable.
- **No helper may maintain a second workflow array, page map, next/previous map, visible-step sequence or sidebar renderer.**
- **No browser page may write directly to `main`, merge, deploy, delete, force-push, expose secrets or create parallel infrastructure.**

## Canonical visible route

| Visible step | Route ID | Page | Path | Kind | Role |
| ---: | --- | --- | --- | --- | --- |
| 1 | `index` | Home | `code-labs/index.html` | Entry | Lightweight start and current-repair content. |
| 2 | `setup` | Master Plan + Setup | `code-labs/setup.html` | Workflow | First governed stage; selected plan/project/repository setup. |
| 3 | `project-picker` | Project Picker | `code-labs/project-picker.html` | Workflow | Select the owner-scoped project. |
| 4 | `file-lab` | File Lab | `code-labs/file-lab.html` | Workflow | Load and verify complete source. |
| 5 | `saved-files` | Saved Files | `code-labs/saved-files.html` | Workflow | Select an existing saved file without creating another file owner. |
| 6 | `rescue-room` | Rescue Room | `code-labs/rescue-room.html` | Workflow | Describe the defect and preserve rules. |
| 7 | `packet-builder` | Packet Builder | `code-labs/packet-builder.html` | Workflow | Build complete repair context. |
| 8 | `buddy-canvas` | Buddy Canvas | `code-labs/buddy-canvas.html` | Workflow | Source/fixed-file working lane. |
| 9 | `v20` | Workflow Hub | `code-labs/v20.html` | Workflow | Page-local workflow tools; consumes canonical routes. |
| 10 | `patch-desk` | Patch Desk | `code-labs/patch-desk.html` | Workflow | Review the complete replacement file. |
| 11 | `patch-lab` | Patch Lab | `code-labs/patch-lab.html` | Workflow | Exact-edit fallback. |
| 12 | `preview-test` | Preview + Test | `code-labs/preview-test.html` | Workflow | Preview and record bounded test evidence. |
| 13 | `checkpoints` | Checkpoints | `code-labs/checkpoints.html` | Workflow | Rollback, receipts and recovery evidence. |
| 14 | `repo-desk` | Repo Desk | `code-labs/repo-desk.html` | Workflow | Sole visible repository-action handoff preparation stage. |
| 15 | `cg-repair-lab` | CG Repair Lab | `code-labs/cg-repair-lab.html` | Workflow | Read-only advisory repository analysis. |
| 16 | `code-god` | Code God | `code-labs/code-god.html` | Workflow | Deterministic final review consumer; bounded advisory only. |
| 17 | `publish-prep` | GitHub Writer | `code-labs/publish-prep.html` | Workflow | Prepare the protected one-file branch/draft-PR execution. |
| 18 | `github-tracker` | GitHub Tracker | `code-labs/github-tracker.html` | Workflow | Read PR, preview and check evidence. |
| 19 | `checklist-builder` | Master Plan Checklist | `code-labs/checklist-builder.html` | Workflow | Final exact-plan verification view; no promotion authority. |
| — | `help` | Help + Tools | `code-labs/help.html` | Support/nav | Discoverable support index; unnumbered. |

## Unnumbered support, proof and test routes

| Route ID | Path | Role / keep rule |
| --- | --- | --- |
| `connection-guide` | `code-labs/connection-guide.html` | Safe connection walkthrough. |
| `read-only-proof` | `code-labs/read-only-proof.html` | Active backend read-only proof. |
| `helper-route-map` | `code-labs/helper-route-map.html` | Sole read-only route/helper scanner; do not duplicate. |
| `faq` | `code-labs/faq.html` | Workflow and save guidance. |
| `about` | `code-labs/about.html` | Product explanation. |
| `ai-handoff` | `code-labs/ai-handoff.html` | Read-only assistant context support. |
| `fix-wizard` | `code-labs/fix-wizard.html` | Draft/support guidance; consumes shared policy. |
| `start-guide` | `code-labs/start-guide.html` | Beginner guidance. |
| `context-packet` | `code-labs/context-packet.html` | Assistant context packet support. |
| `connector-status` | `code-labs/connector-status.html` | Connector/status support. |
| `chatgpt-connection` | `code-labs/chatgpt-connection.html` | Connection support/test. |
| `repair-bridge-status` | `code-labs/repair-bridge-status.html` | Tool-only repair status/proof. |
| `owner-read-proof` | `code-labs/owner-read-proof.html` | Static retirement notice only; no OAuth, repository read or write. |
| `oauth-discovery` | `code-labs/oauth-discovery.html` | OAuth discovery test. |
| `oauth-flow-test` | `code-labs/oauth-flow-test.html` | OAuth flow test. |
| `app-reader-test` | `code-labs/app-reader-test.html` | App reader test. |
| `url-reader-test` | `code-labs/url-reader-test.html` | URL reader proof/test. |
| `buddy-canvas-receipt-v115` | `code-labs/buddy-canvas-receipt-v115.html` | V122 local proof and fail-closed freshness/handoff builder. |
| `chatgpt-buddy-tools` | `code-labs/chatgpt-buddy-tools.html` | V245 bounded local support index. |

The canonical union is **39 unique routes**: 1 entry, 18 governed workflow routes and 20 support routes. The visible navigation contains Home, all 18 workflow routes and Help + Tools.

## Current shared-owner and specialist-helper register

| File | Current role | Ownership boundary |
| --- | --- | --- |
| `code-labs/assets/cl-nav.js` | V287 canonical route union and sidebar renderer | Sole route/order/number/family/sidebar owner. |
| `code-labs/assets/code-labs-setup-route-v145.js` | V288 compatibility reader | Passive registry consumer; no DOM, route or numbering authority. |
| `code-labs/assets/code-labs-workflow-clarity-v130.js` | V288 clarity API | Passive registry consumer; no private route maps, DOM panel or timers. |
| `code-labs/assets/code-labs-v20.js` | V3.2 Workflow Hub | Page-local root only; preserves siblings and resolves links through V287. |
| `code-labs/assets/code-labs-page-completion-v139.js` | V208 completion panel | Completion wording/checklist only; canonical next route comes from V287. |
| `code-labs/assets/code-labs-v33-workflow-current-file-bridge.js` | V3.5 current-file hydration | Event-driven field hydration; no invented repo/branch/action or route filenames. |
| `code-labs/assets/code-labs-current-file-overwrite-v201.js` | V203.3 compatibility facade | Read-only delegation and fail-closed mutation methods. |
| `code-labs/assets/code-labs-current-file-v104-overwrite-v201.js` | V203.0 retired transport facade | No browser endpoint, secret, button, timer or backend-write authority. |
| `code-labs/assets/code-labs-preview-route-v200.js` | V201 preview normaliser | Only relative `#preview[srcdoc]` base/link normalisation. |
| `code-labs/code-god.html` | V242 Code God page | One canonical nav and one read-only handoff-context consumer. |
| `code-labs/assets/code-labs-header-shell-v235.js` | V247 header/tool drawer | Passive `toolRoutes` consumer; never rebuilds workflow navigation. |
| `code-labs/assets/code-labs-footer-buddy-shell-v200.js` | V209 footer | Reads page-declared action IDs and canonical previous/next; never stamps actions. |
| `code-labs/assets/code-labs.js` | V204 manual renderer | Preserves local manual functions and resolves generated links through V287. |
| `code-labs/index.html` | V263 Home content | One empty canonical nav mount; content only. |
| `code-labs/helper-route-map.html` | V141 scanner | Sole scanner; canonical 39-page coverage fails closed. |
| `code-labs/chatgpt-buddy-tools.html` | V245 Buddy Tools | Unnumbered support page; one empty canonical nav mount. |
| `code-labs/buddy-canvas-receipt-v115.html` | V122 Receipt | Requires explicit repo/branch/path and successful freshness before handoff/chunks. |
| `code-labs/assets/code-labs-buddy-page-bridge-v139.js` | V143 Buddy Bridge | Excludes helper-generated surfaces; preserves local notes/write/undo/receipts and requires explicit protected identity without defaults. |
| `code-labs/assets/code-labs-checklist-builder.js` | Master Checklist V2 | Local final-verification view only; cannot authorise Writer or promotion. |
| `code-labs/assets/code-labs-page-runtime-v235.js` | V250 page runtime baseline | Bounded tab grouping and discovery; no route ownership. |

## Resolved release blocker — CL-HIST-070

Buddy Bridge V143 is committed on the recovery branch with complete page-local notes/write/section/action/receipt/undo compatibility and fail-closed protected identity. It no longer invents a source branch, requested action or request branch when those values are absent.

- local page assistance remains browser-local and cannot write GitHub;
- protected context is ready only with an explicit valid repository, safe path, source branch, non-main request branch, supported action and fixed output;
- the 19-test single-owner regression binds V143 identity, compatibility methods, helper-surface exclusion and forbidden fallback values;
- Writer, merge, deployment and production promotion are never inferred from Buddy Bridge browser context.

## Promotion evidence boundary

- Code God and CG Repair Lab remain bounded advisory evidence.
- Candidate, handoff, checkpoint, receipt, source hash and exact GitHub head binding are authoritative only through the protected Code Labs workflow and current GitHub facts.
- Missing workflow runs or statuses are reported as none found; absence is never converted to PASS.
- Browser visual, desktop/mobile, duplicate-panel, user-acceptance and deployed-source checks remain separate release gates.
- This register is documentation and a regression source; it is not a promotion decision.

## No-drop checklist

1. Read the current V287 registry before changing routes or labels.
2. Run/read Helper Route Map V141 and fail closed on missing canonical pages.
3. Preserve all 39 unique route targets unless an explicit retirement is separately approved and documented.
4. Preserve one owner per route, stage, mutable property and execution capability.
5. Keep support pages discoverable without numbering them or inserting them into `workflowRoutes`.
6. Preserve the protected sequence: Tool-Only workspace → Code God bounded review → independent checkpoint/receipt → one-file Writer → existing non-main branch and draft PR.
7. Never write directly to `main`, merge, deploy, delete, force-push, expose secrets or create a paid parallel backend through browser helpers.
8. Treat CL-HIST-070 as resolved only while V143 and its exact-head regression remain present; do not mark live promotion ready while any required browser, user-acceptance or deployed-source gate remains not run.
