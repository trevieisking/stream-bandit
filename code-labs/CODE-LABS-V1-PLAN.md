# Code Labs Master Plan

Status: Code Labs only / live-promotion preparation / ChatGPT workbench / GitHub connector proven through ChatGPT / Supabase repair history available when connected / Supabase Code Labs maintenance migration applied / future Python analysis lane noted / future utility toolbox noted / no Stream Bandit lane crossing / full current Code Labs menu scan recorded / Publish lane user-tested pass recorded.

Last update: 2026-06-25 - Home, Start Guide, Fix Wizard, Setup, Project Picker, File Lab, Rescue Room, Packet Builder, Patch Desk, Patch Lab, Preview + Test, Checkpoints, Workflow Hub, AI Handoff, Publish Prep, Repo Desk, GitHub Tracker, Connector Status, and Help live-promotion passes recorded. Supabase Code Labs maintenance migration `code_labs_maintenance_indexes_20260625` was applied. One master plan is the source of truth.

## Source of truth rule

GitHub `main` is the live Code Labs source of truth. Uploaded files from chats are old reference material only unless the signed-in user explicitly says a specific uploaded file is the new replacement source.

For current work:

- do not copy old uploaded Code Labs files over GitHub `main`,
- fetch current files from GitHub before any repo patch,
- use Supabase connector only for Code Labs database/history/account work,
- use GitHub connector only for repo files, branches, PRs, previews, and plan updates,
- do not use GitHub connector and Supabase connector in the same pass.

## Mission

Code Labs exists because long ChatGPT chats can become too large to load or too hard to continue. Code Labs is the durable project workbench where the repair job lives so a new chat, a non-coder, and ChatGPT can continue safely.

Code Labs must support two modes:

1. ChatGPT guides or performs the work when the right connector is available.
2. The user follows the same plain-English pages manually when tools are unavailable.

Code Labs should keep the repair state, loaded file, Code Search Report, request packet, fixed code, preview result, checkpoint, GitHub PR/preview links, Supabase repair history, and final PASS/FAIL decision in one place.

## AI operating map for users who do not code

Code Labs should be built for users who do not want to manage code manually and for ChatGPT sessions that need durable, exact context.

Core intent:

- Make coding repairs easier for users who do not code.
- Let ChatGPT use Code Labs pages and tools to guide the user step by step.
- Let the user also work manually when connectors are unavailable.
- Keep enough project state in Code Labs so a new chat can continue without reloading an enormous old conversation.
- Keep Code Labs separate from Stream Bandit app logic unless the signed-in user explicitly starts a separate Stream Bandit repair.
- Keep one master plan here instead of scattered notes.

The intended user path is:

1. Start Guide captures the plain-English problem.
2. Fix Wizard chooses the next safest page.
3. File Lab loads or pastes the full file and creates Code Search evidence.
4. Workflow Hub builds the exact request for ChatGPT.
5. Patch Desk or Patch Lab captures the fix.
6. Preview + Test records PASS/FAIL.
7. Checkpoints preserve rollback.
8. AI Handoff, Publish Prep, Repo Desk, and GitHub Tracker handle the branch/PR/publish lane.
9. Connector Status and Help explain the one-connector rule and the safe tool map.
10. Supabase history is used only for Code Labs repair history after the user connects Supabase.

Issue `#97` was treated as the durable AI operating note and is now folded into this master plan.

## Live promotion goal

Before live promotion, every page in the menu should be clear enough for a non-coder and useful enough for ChatGPT to understand what to do next.

A page is live-promotion ready when:

- the page opens from the menu,
- its purpose is obvious,
- its primary buttons are visible and neat,
- it saves, copies, previews, searches, or tracks the correct item,
- it does not use hard-coded owner/user wording in user-facing prompts,
- it does not route Code Labs users to Stream Bandit login,
- it keeps Code Labs and Stream Bandit lanes separate,
- it keeps manual copy/paste rescue available,
- it does not require a backend just to use the basic workflow.

## Current passed live checks

Passed during live promotion review:

- `code-labs/index.html` - passed after Home was cache-busted, showed the durable ChatGPT workbench wording, and displayed the live-promotion status cleanly.
- `code-labs/start-guide.html` - passed after live-user wording, generic examples, and plain-English intake were cleaned up.
- `code-labs/fix-wizard.html` - passed after brand-new users were routed to Start Guide first and the menu-aligned next-step flow was cleaned up.
- `code-labs/setup.html` - passed after Workspace live-ready rules explained local/manual mode, GitHub connector lane, Supabase history lane, and account-later rule.
- `code-labs/project-picker.html` - passed after the same Workspace live-ready rules were added and visible.
- `code-labs/file-lab.html` - passed after GitHub read-only loader showed correct loaded state and generic repo placeholders stopped showing false failure.
- `code-labs/rescue-room.html` - passed after Repair live-ready rules appeared and the existing save/copy flow still worked.
- `code-labs/packet-builder.html` - passed after Repair live-ready rules appeared and the packet flow still worked.
- `code-labs/patch-desk.html` - passed after Repair live-ready rules appeared and the fixed-code paste/checkpoint flow still worked.
- `code-labs/patch-lab.html` - passed after the step order and card layout were corrected so Full code input sits beside Search and replace, the safety gate is step 2, and Replace line range sits beside Full fixed output.
- `code-labs/preview-test.html` - passed after safety-gate guidance appeared and PASS/FAIL preview testing was visible.
- `code-labs/checkpoints.html` - passed after safety-gate guidance appeared and rollback/test history remained visible.
- `code-labs/v20.html` - passed after Workflow Hub card buttons were polished into a neat showcase row and signed-in user prompt wording was added.
- `code-labs/ai-handoff.html` - passed after user test showed the AI Handoff package includes source lock, fixed-code stats, and full fixed code.
- `code-labs/publish-prep.html` - passed after user test showed safe branch/PR request, target path, rollback rules, and full fixed code.
- `code-labs/repo-desk.html` - passed after user test of the publish-lane flow and connector-safe request pattern.
- `code-labs/github-tracker.html` - passed after user test showed PR/review link, branch link, preview link, notes, and next safe action report.
- `code-labs/connector-status.html` - passed after one-connector wording, browser-vs-ChatGPT connector clarity, mode-card clarity, live connection fields, and Supabase history status were verified.
- `code-labs/help.html` - passed after tool map, promotion checklist, plain-English user/ChatGPT guidance, and exact live connection test fields were verified.

Every current Code Labs menu/index page has now been scanned from GitHub `main`, tested through the current live-promotion pass, and recorded in this master plan. No Stream Bandit app page was edited during this scan.

## Menu checklist and page map

Use the menu as the live-promotion checklist.

### Start

- `code-labs/index.html` - Home Command Centre / first showcase landing page. Passed live polish.
- `code-labs/start-guide.html` - plain-English intake. Passed live polish.
- `code-labs/fix-wizard.html` - one next step for non-coders. Passed live polish.
- `code-labs/v20.html` - Workflow Hub request builder. Passed live polish.

### Workspace

- `code-labs/setup.html` - workspace setup and saved repo/project context. Passed live polish.
- `code-labs/project-picker.html` - project mode selection. Passed live polish.

### Repair

- `code-labs/file-lab.html` - paste/upload/read-only GitHub file load and Code Search. Passed live polish.
- `code-labs/rescue-room.html` - problem, errors, and do-not-touch rules. Passed live polish.
- `code-labs/packet-builder.html` - ChatGPT repair packet. Passed live polish.
- `code-labs/patch-desk.html` - paste full fixed code. Passed live polish.
- `code-labs/patch-lab.html` - exact search/replace and line-range changes. Passed live polish.
- `code-labs/preview-test.html` - original/fixed preview and PASS/FAIL checklist. Passed live polish.
- `code-labs/checkpoints.html` - rollback and test history. Passed live polish.

### Publish

- `code-labs/ai-handoff.html` - copyable review handoff. Passed live polish.
- `code-labs/publish-prep.html` - safe branch/PR request. Passed live polish.
- `code-labs/repo-desk.html` - repo action planning and new-file cleanup rule. Passed live polish.
- `code-labs/github-tracker.html` - PR, branch, preview, and test tracking. Passed live polish.

### Connect and Help

- `code-labs/connector-status.html` - GitHub/Supabase status, one-connector rule, lane wording, and browser-vs-ChatGPT connector clarity. Passed live polish.
- `code-labs/help.html` - tool map, promotion checklist, plain-English help, and exact live connection test fields. Passed live polish.

## Current index scan map

This scan covered Code Labs only. It checked the current shell page, `body data-page`, loaded CSS, shared JS, page-specific JS, and the visible operating purpose for every current menu/index page.

| Page | `data-page` | Main loaded Code Labs assets | Current role |
| --- | --- | --- | --- |
| `code-labs/index.html` | `index` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-home-live.js` | Home Command Centre and durable ChatGPT workbench landing page. |
| `code-labs/start-guide.html` | `start-guide` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v19-start-guide.js` | Plain-English intake for a non-coder. |
| `code-labs/fix-wizard.html` | `fix-wizard` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v18-fix-wizard.js` | One next safest step. |
| `code-labs/v20.html` | `v20` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v20.js` | Workflow Hub and ChatGPT request builder. |
| `code-labs/setup.html` | `setup` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Workspace setup and Code Labs account/auth decision notes. |
| `code-labs/project-picker.html` | `project-picker` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Project mode selection. |
| `code-labs/file-lab.html` | `file-lab` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v13-loader.js`, `code-labs-v1-3-github-readonly.js` | Paste/upload/read-only GitHub file load and Code Search Report. |
| `code-labs/rescue-room.html` | `rescue-room` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Problem, errors, and do-not-touch rules. |
| `code-labs/packet-builder.html` | `packet-builder` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | ChatGPT repair packet builder. |
| `code-labs/patch-desk.html` | `patch-desk` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Paste full fixed code, compare, checkpoint, copy, and download. |
| `code-labs/patch-lab.html` | `patch-lab` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v14-loader.js`, `code-labs-v14-patch-lab.js` | Exact find/replace and line-range patching. |
| `code-labs/preview-test.html` | `preview-test` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Original/fixed preview and PASS/FAIL test notes. |
| `code-labs/checkpoints.html` | `checkpoints` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Rollback versions and saved test history. |
| `code-labs/ai-handoff.html` | `ai-handoff` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v15-handoff.js` | Copyable review handoff for ChatGPT. |
| `code-labs/publish-prep.html` | `publish-prep` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v16-publish-prep.js` | Safe branch/PR request packet. |
| `code-labs/repo-desk.html` | `repo-desk` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v30-repo-desk.js` | GitHub connector request planning and new-file cleanup rule. |
| `code-labs/github-tracker.html` | `github-tracker` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v17-github-tracker.js` | PR, branch, preview, test result, and approval tracker. |
| `code-labs/connector-status.html` | `connector-status` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js`, `code-labs-v13-loader.js`, `code-labs-v40-connector-rule.js` | GitHub/Supabase connector boundary, one-connector rule, and browser-vs-ChatGPT connector clarity. |
| `code-labs/help.html` | `help` | `code-labs.js`, `code-labs-v1-1-safety.js`, `code-labs-v12-save.js` | Tool map, promotion checklist, plain-English help, and exact live connection test fields. |

Scan finding: all current menu/index pages are Code Labs pages under `code-labs/`. Several pages are rendered by shared JavaScript after the small HTML shell loads; this is expected for the current static helper architecture.

## Separation rule

Public product name: **Code Labs**.

Code Labs may live in the same GitHub repository, same domain, and same Supabase project during testing, but it must stay in its own user-facing lane.

Code Labs must not:

- send users to a Stream Bandit login page,
- use Stream Bandit page buttons as Code Labs controls,
- write to Stream Bandit app tables unless the user explicitly starts a Stream Bandit app repair,
- expose secret keys in browser code,
- make silent writes to main,
- hide what changed.

If Code Labs later uses Supabase Auth, the user-facing control must still be Code Labs branded and Code Labs routed. The live name should come from the signed-in Code Labs user/profile, not from hard-coded developer wording.

## One main cleanup rule

One main rule for new repo files:

**Do not create any new repo file unless three old Stream Bandit V4/V5/V6 pages or checkpoint files are first verified as stale cleanup candidates.**

This rule is only triggered by creating a new repo file. Editing existing Code Labs files and creating a branch/PR do not trigger the cleanup rule.

Under this rule:

- Never delete Stream Bandit V7 files.
- Never delete Code Labs pages.
- Never use live, useful, uncertain, or unverified files as cleanup candidates.
- Prefer editing existing Code Labs files over adding files.
- If three safe old V4/V5/V6 cleanup candidates cannot be verified, stop before creating the new file.

## Protected files and cleanup rule

Stream Bandit V7 files are protected. Do not touch, delete, reuse, rename, or clean up Stream Bandit V7 files.

To avoid GitHub truncation and repo clutter:

- Prefer editing existing Code Labs files over creating new files.
- Any future new repo file must stop unless three old Stream Bandit V4/V5/V6 pages or checkpoint files are first verified as stale cleanup candidates.
- Never use Stream Bandit V7 files as cleanup candidates.
- Never delete Code Labs pages for this cleanup rule.
- If any cleanup candidate is live, useful, uncertain, or not clearly an old V4/V5/V6 page/checkpoint, do not delete it.
- Branch creation and editing existing files do not trigger the cleanup rule.

## Current source architecture

Code Labs is currently a static, JavaScript-rendered helper app.

The architecture is:

1. Small HTML shells under `code-labs/`.
2. `assets/code-labs.css` provides the shared Code Labs UI shell.
3. `assets/code-labs.js` renders the original core pages and local manual repair state.
4. `assets/code-labs-v1-1-safety.js` adds local safety/export/import tools.
5. `assets/code-labs-v12-save.js` loads Supabase repair-history support and shared menu/page helpers.
6. Page-specific JavaScript files render newer tools such as Start Guide, Fix Wizard, Workflow Hub, Patch Lab, AI Handoff, Publish Prep, GitHub Tracker, Repo Desk, and Connector Status helpers.

GitHub `main` is the source of truth. Uploaded files may be stale.

Before any page patch:

1. Fetch the current page shell from GitHub `main`.
2. Record its `body data-page`.
3. Record attached CSS and JS.
4. Fetch the attached page-specific JS and shared helper JS.
5. Check PR history if a feature appears missing.
6. Patch the smallest existing file.
7. Cache-bust only the affected page when needed.

## Current proven features

- Manual local repair mode.
- Local browser storage.
- Full-file paste and upload.
- Public GitHub read-only file load.
- Code Search Report with file, path, repo, branch, line count, character count, match count, and match lines.
- Start Guide live-user intake.
- Fix Wizard next-step routing.
- Setup and Project Picker Workspace live-ready rules.
- Rescue Room, Packet Builder, and Patch Desk Repair live-ready rules.
- Patch Lab exact change workflow, corrected step order, and corrected card layout.
- Preview + Test and Checkpoints safety-gate rules.
- Workflow Hub uses the saved Code Search Report.
- ChatGPT read request.
- ChatGPT generator request.
- ChatGPT review request.
- ChatGPT exact patch request.
- GitHub Help and Supabase Help prompts using signed-in Code Labs user wording.
- Safe change request wording.
- Fixed-code paste area.
- Compare summary.
- Exact Patch Lab find/replace and line-range workflow.
- Preview iframe.
- Desktop/mobile preview width switch.
- Test checklist.
- Local checkpoints.
- Export/import/copy/select workflows.
- AI Handoff package.
- Publish Prep safe branch request.
- GitHub Tracker link/test tracking.
- Repo Desk request planner.
- Separate GitHub and Supabase connector wording.
- One-connector-at-a-time rule visible on Connector Status.
- Safe create-file drill passed through ChatGPT GitHub connector in PR #79.
- Safe delete-file drill passed through ChatGPT GitHub connector in PR #80.
- Repo Desk and Workflow Hub support the new-file cleanup rule.
- Hard-coded developer name wording was removed from live user-facing connector prompts in PR #101.
- Full current Code Labs menu/index scan recorded in this master plan.
- Publish lane user-tested pass recorded for AI Handoff, Publish Prep, Repo Desk, and GitHub Tracker.
- Help and Connector Status hold the tool map, promotion checklist, hard stop rules, exact live connection test fields, and connector-status clarity.
- Connector Status says GitHub connector and Supabase connector do not run together.
- Supabase Code Labs maintenance migration `code_labs_maintenance_indexes_20260625` has been applied.

## Plans already made and folded into this master plan

This master plan is the single source of truth for the Code Labs plans made so far.

Recorded plan/history points:

- PR #79 proved a safe create-file workflow through ChatGPT GitHub connector.
- PR #80 proved a safe delete-file workflow through ChatGPT GitHub connector.
- Issue #97 recorded the AI operating map and promotion readiness intent; that content is now folded into this plan.
- PR #100 added the live-promotion menu checklist and hard stop rules.
- PR #101 removed hard-coded developer/user wording from live Code Labs connector prompts.
- PR #102 fixed Code Labs UI polish issues for Workflow Hub and File Lab.
- PR #103, PR #104, and PR #105 polished Workflow Hub card/button layout.
- PR #106 refreshed this master plan for live promotion.
- PR #107 updated Home wording and recorded the future Python sandbox/analysis lane.
- PR #108 added the future Code Labs utility toolbox plan.
- PR #109 recorded Home as passed.
- PR #110 polished Start Guide and Fix Wizard.
- PR #111 polished Workspace pages.
- PR #112 recorded Start and Workspace pages as passed.
- PR #113 added Repair flow live-ready panels.
- PR #114 recorded Repair flow pages as passed.
- PR #115 added safety-gate live-ready panels.
- PR #116 corrected Patch Lab step order.
- PR #117 polished Patch Lab card layout.
- PR #118 recorded Patch Lab as passed.
- PR #119 added Publish lane live-ready panels.
- PR #120 recorded the full Code Labs menu scan in the master plan.
- PR #121 added live connection test fields to Help and Connector Status.
- PR #122 clarified browser-vs-ChatGPT connector status wording.
- PR #123 clarified Connector Status mode cards.
- PR #124 recorded the user-tested Publish lane pass.
- PR #126 clarified one-connector labels on Connector Status.
- Supabase migration `code_labs_maintenance_indexes_20260625` fixed Code Labs maintenance items without touching Stream Bandit `sb_*` tables.

Planning principle: do not scatter future plans across random files. Add them here first, then build from existing Code Labs pages/assets when a visible change is needed.

## Connector reality

There are four distinct active/future layers. Do not mix them up.

### Browser Code Labs

The static browser pages are safe/manual-first. They can read public GitHub files, save local state, use Supabase repair history when the user is authenticated, build request packets, preview/test, and export/import jobs.

The browser pages must not silently write GitHub files or push to main.

### ChatGPT with GitHub connector

GitHub repo work through ChatGPT is proven. The ChatGPT GitHub connector has already supported safe branch/PR workflows, including create-file and delete-file drills.

For GitHub repo work, the live user-facing prompt should be:

`Connect GitHub connector for this Code Labs user`

Use GitHub connector for repo reads, branches, PRs, previews, merges, and verified cleanup after the signed-in user connects GitHub connector.

Do not use Supabase connector in the same GitHub connector pass.

### Supabase

Supabase repair-history support exists for Code Labs tables when Supabase auth is active. Supabase and GitHub are separate connectors; use one connector at a time.

For Supabase/database work, the live user-facing prompt should be:

`Connect Supabase connector for this Code Labs user`

Use Supabase connector for Code Labs tables, RLS, auth planning, repair history, database migrations, and database inspections.

Do not use GitHub connector in the same Supabase connector pass.

No additional Supabase schema, RLS, auth, or policy changes should be made without a reviewed Code Labs-only SQL plan.

### Future Python sandbox / analysis connector

A Python lane would be useful later for controlled analysis, validation, and report generation. It should be treated as an optional hosted/sandboxed connector, not a live-promotion blocker and not unsafe browser-side Python.

Useful Python jobs could include checking HTML/CSS/JS structure, counting files and duplicate sections, comparing before/after code, validating exported repair-job JSON, building reports, running non-destructive sandbox tests, and preparing cleanup candidate reports.

Python safety rules:

- no arbitrary user code execution without a sandbox,
- no secret keys exposed to Python jobs,
- no filesystem or repo writes unless explicitly approved through a scoped connector action,
- read-only analysis first,
- audit every production Python connector run,
- keep manual copy/paste fallback available.

### Future hosted ChatGPT app/connector

A proper hosted Code Labs ChatGPT app/connector is still future work. It needs a server endpoint, account handshake, scoped tool actions, audit trail, and user approval gates before write actions.

## Future Code Labs utility toolbox

Code Labs should eventually include a toolbox for common repair and ChatGPT support tasks. These are small practical tools that help non-coders and ChatGPT prepare safer requests without needing separate websites.

Candidate browser-safe utilities:

- Base64 encode/decode,
- URL encode/decode,
- HTML entity encode/decode,
- JSON validate, format, minify, and compare,
- Markdown/plain-text cleaner,
- regex tester with clear match count,
- line counter and character counter,
- duplicate ID and duplicate script checker,
- HTML/CSS/JS quick structure checker,
- before/after diff viewer,
- raw GitHub URL builder,
- GitHub blob URL to raw URL converter,
- file path normalizer,
- hash/checksum generator for copied files,
- local repair-job JSON validator,
- safe secrets scanner for obvious API keys before sharing code,
- file manifest builder for pasted project bundles,
- cleanup candidate report builder for old V4/V5/V6 pages/checkpoints.

Candidate hosted/sandbox-only utilities:

- ZIP/project package inspection,
- dependency/package manifest inspection,
- deeper syntax/lint checks,
- static link checker,
- batch duplicate-code scan,
- generated test report builder,
- Python-powered cleanup report.

Utility toolbox safety rules:

- browser utilities should run locally and not upload code by default,
- no secrets should be sent to hosted tools without explicit approval,
- hosted utilities need signed-in user scope and audit logs,
- outputs should be copyable into Workflow Hub, AI Handoff, Repo Desk, or Supabase notes,
- utility tools should support non-coders with plain-English explanations.

## Supabase checkpoint

### 2026-06-25 Code Labs maintenance

Supabase connector was used by itself for a Code Labs-only maintenance pass. GitHub connector was not used in that Supabase pass.

Applied migration:

- `20260625162930` - `code_labs_maintenance_indexes_20260625`.

Migration scope:

- fixed `public.code_labs_set_updated_at` search path,
- added missing covering indexes for Code Labs foreign keys,
- touched only Code Labs `code_labs_*` objects,
- did not change Stream Bandit `sb_*` tables,
- did not change storage buckets,
- did not change auth settings,
- did not change Code Labs data rows.

The larger Code Labs RLS performance rewrite was intentionally not applied yet. It remains a future reviewed SQL plan item.

### 2026-06-24 read-only checkpoint

Supabase inspection on 2026-06-24 was read-only. No schema changes, no table writes, no RLS edits, and no auth changes were made.

Project inspected:

- Project name: Stream Bandit.
- Project ref: `xzxqfrvqdgkzwujbkdbk`.
- Region: `eu-west-2`.
- Status: active/healthy.
- Database: PostgreSQL 17.

Code Labs tables already present in `public`, all with RLS enabled:

- `code_labs_projects` - 6 rows.
- `code_labs_files` - 6 rows.
- `code_labs_jobs` - 6 rows.
- `code_labs_versions` - 2 rows.
- `code_labs_packets` - 0 rows.
- `code_labs_test_runs` - 0 rows.
- `code_labs_audit_log` - 6 rows.

Planned tables not present yet:

- `code_labs_usage_events`.
- `code_labs_feedback`.
- `code_labs_accounts` or a Code Labs profile link table.

Remaining Code Labs Supabase findings to fix later in a reviewed Code Labs-only migration:

1. RLS policies should avoid per-row auth function re-evaluation where possible.
2. Account/profile design should be reviewed before production connector writes.
3. Usage and feedback tables should only be added if privacy-light tracking is approved.

Out of scope for Code Labs promotion unless separately requested:

- Stream Bandit `sb_*` advisor warnings.
- Storage bucket warnings.
- Stream Bandit social/admin/auth functions.

## Account and signed-in user rule

Before live promotion, no user-facing Code Labs page should hard-code the developer/user name. Use neutral wording such as signed-in Code Labs user, this Code Labs user, saved project owner, or owner/repo for examples.

Later, when the account layer is active, replace neutral text with the actual signed-in Code Labs profile/user name where appropriate.

Account system requirements before production connector writes:

- Code Labs sign-in page or panel.
- Code Labs profile row.
- User-owned workspace list.
- User-owned repair jobs.
- User-owned files.
- User-owned packets.
- User-owned checkpoints.
- User-owned test runs.
- No service-role key in browser code.
- No cross-user repair access.
- Owner/support diagnostics only with clear scope.

## Usage and feedback plan

Usage tracking should be privacy-light.

Allowed later: page opened, GitHub file loaded read-only, Code Search report generated, Workflow request copied, preview test saved, checkpoint saved, safe change request generated, feedback submitted.

Avoid storing full user code in usage events, private personal details, secret keys, unrelated browser data, or other users' repair details.

Feedback can include rating, what worked, what was confusing, and optional contact only if the user chooses to provide it.

## Build order from here

1. Keep this file as the one Code Labs master plan.
2. Keep GitHub `main` as the source of truth.
3. Keep uploaded files as old reference unless explicitly promoted.
4. Keep using existing Code Labs files where possible.
5. Fix only visible page problems or connector-readiness blockers.
6. Keep hard-coded user names out of live pages.
7. Keep Start Guide, Fix Wizard, and Workflow Hub as the main non-coder path.
8. Keep File Lab and Code Search as the evidence path ChatGPT can rely on.
9. Keep Preview + Test and Checkpoints as the manual safety gate.
10. Keep AI Handoff, Publish Prep, Repo Desk, and GitHub Tracker as the publish lane.
11. Use GitHub connector by itself for repo plan/page/file changes.
12. Use Supabase connector by itself for Code Labs database/history/account work.
13. Plan Code Labs auth/profile layer before adding production account flows.
14. Plan remaining Supabase RLS changes before SQL.
15. Build server-side connector prototype after static workflow is stable.
16. Add read-only connector tools before write tools.
17. Add scoped Code Labs write tools after account/RLS review.
18. Add browser-safe utility toolbox where it improves non-coder repair flow.
19. Add Python sandbox/analysis connector design as an optional non-blocking improvement.
20. Add GitHub branch/PR actions only after explicit safety review.
21. Keep the one main cleanup rule in force before any new repo file is created.

## Stop rules

Stop and ask before:

- adding a new page,
- touching Stream Bandit app files,
- touching any Stream Bandit V7 file,
- changing Supabase schema beyond the reviewed Code Labs-only plan,
- adding auth redirects,
- adding browser-side GitHub writes,
- deleting any Code Labs page,
- deleting any Stream Bandit V7 file,
- cleaning old Stream Bandit files without verifying they are stale V4/V5/V6 page/checkpoint candidates,
- replacing a full page when a tiny safe fix would work,
- merging a stale draft PR,
- merging connector wording that mentions Stream Bandit login as a Code Labs path,
- using GitHub connector and Supabase connector together in one pass.

## Safety rules

- Never overwrite without a checkpoint or branch/PR path.
- Never push to live main from browser code.
- Never hide what changed.
- Always support manual copy/paste rescue mode.
- Prefer full-file replacement for non-coders when safe.
- Prefer reuse/rewrite of existing Code Labs files over adding new files.
- Keep Code Labs and Stream Bandit user-facing lanes separate.
- Keep Stream Bandit `sb_*` database objects out of Code Labs database passes unless a separate Stream Bandit pass is explicitly started.
- Keep secrets server-side only.
- Make every production write action visible in an audit trail.
- Use test branches and pull requests before merge.
- Merge only after user testing says pass or the change is a plan-only update.
