# Code Labs Master Plan

Status: Code Labs only / live-promotion preparation / ChatGPT workbench / GitHub connector proven through ChatGPT / Supabase repair history available when connected / future Python analysis lane noted / future utility toolbox noted / no Stream Bandit lane crossing.

Last update: 2026-06-24 - live-promotion position, passed-page notes, connector reality, signed-in user wording, cleanup rule, Python sandbox idea, utility toolbox idea, and ChatGPT workbench purpose recorded.

## Mission

Code Labs exists because long ChatGPT chats can become too large to load or too hard to continue. Code Labs is the durable project workbench where the repair job lives so a new chat, a non-coder, and ChatGPT can continue safely.

Code Labs must help two modes:

1. ChatGPT guides or performs the work when the right connector is available.
2. The user follows the same plain-English pages manually when tools are unavailable.

Code Labs should keep the repair state, loaded file, Code Search Report, request packet, fixed code, preview result, checkpoint, GitHub PR/preview links, Supabase repair history, and final PASS/FAIL decision in one place.

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
- `code-labs/file-lab.html` - passed after GitHub read-only loader showed correct loaded state and generic repo placeholders stopped showing false failure.
- `code-labs/v20.html` - passed after Workflow Hub card buttons were polished into a neat showcase row and signed-in user prompt wording was added.

Continue testing through the menu checklist and record passes here.

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

## Protected files and cleanup rule

Stream Bandit V7 files are protected. Do not touch, delete, reuse, rename, or clean up Stream Bandit V7 files.

To avoid GitHub truncation and repo clutter:

- Prefer editing existing Code Labs files over creating new files.
- Any future new repo file must stop unless three old Stream Bandit V4/V5/V6 pages or checkpoint files are first verified as stale cleanup candidates.
- Never use Stream Bandit V7 files as cleanup candidates.
- Never delete Code Labs pages for this cleanup rule.
- If any cleanup candidate is live, useful, uncertain, or not clearly an old V4/V5/V6 page/checkpoint, do not delete it.
- Branch creation and editing existing files do not trigger the cleanup rule.

## Menu checklist and page map

Use the menu as the live-promotion checklist.

### Start

- `code-labs/index.html` - Home Command Centre / first showcase landing page. Passed live polish.
- `code-labs/start-guide.html` - plain-English intake.
- `code-labs/fix-wizard.html` - one next step for non-coders.
- `code-labs/v20.html` - Workflow Hub request builder. Passed live polish.

### Workspace

- `code-labs/setup.html` - workspace setup and saved repo/project context.
- `code-labs/project-picker.html` - project mode selection.

### Repair

- `code-labs/file-lab.html` - paste/upload/read-only GitHub file load and Code Search. Passed live polish.
- `code-labs/rescue-room.html` - problem, errors, and do-not-touch rules.
- `code-labs/packet-builder.html` - ChatGPT repair packet.
- `code-labs/patch-desk.html` - paste full fixed code.
- `code-labs/patch-lab.html` - exact search/replace and line-range changes.
- `code-labs/preview-test.html` - original/fixed preview and PASS/FAIL checklist.
- `code-labs/checkpoints.html` - rollback and test history.

### Publish

- `code-labs/ai-handoff.html` - copyable review handoff.
- `code-labs/publish-prep.html` - safe branch/PR request.
- `code-labs/repo-desk.html` - repo action planning and new-file cleanup rule.
- `code-labs/github-tracker.html` - PR, branch, preview, and test tracking.

### Connect and Help

- `code-labs/connector-status.html` - GitHub/Supabase status, one-connector rule, and lane wording.
- `code-labs/help.html` - tool map, promotion checklist, and plain-English help.

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
- Repo Desk and Workflow Hub now support the new-file cleanup rule.
- Hard-coded developer name wording was removed from live user-facing connector prompts in PR #101.

## Connector reality

There are four distinct active/future layers. Do not mix them up.

### Browser Code Labs

The static browser pages are safe/manual-first. They can read public GitHub files, save local state, use Supabase repair history when the user is authenticated, build request packets, preview/test, and export/import jobs.

The browser pages must not silently write GitHub files or push to main.

### ChatGPT with GitHub connector

GitHub repo work through ChatGPT is proven. The ChatGPT GitHub connector has already supported safe branch/PR workflows, including create-file and delete-file drills.

For GitHub repo work, the live user-facing prompt should be:

`Connect GitHub for this Code Labs user`

Use GitHub for repo reads, branches, PRs, previews, merges, and verified cleanup after the signed-in user connects GitHub.

### Supabase

Supabase repair-history support exists for Code Labs tables when Supabase auth is active. Supabase and GitHub are separate connectors; use one connector at a time.

For Supabase/database work, the live user-facing prompt should be:

`Connect Supabase for this Code Labs user`

No Supabase schema, RLS, auth, or policy changes should be made without a reviewed Code Labs-only SQL plan.

### Future Python sandbox / analysis connector

A Python lane would be useful later for controlled analysis, validation, and report generation. It should be treated as an optional hosted/sandboxed connector, not a live-promotion blocker and not unsafe browser-side Python.

Useful Python jobs could include:

- checking HTML/CSS/JS files for obvious syntax or structure problems,
- counting files, lines, duplicate IDs, duplicate scripts, or repeated sections,
- comparing before/after code safely,
- validating exported Code Labs repair-job JSON,
- building simple reports for ChatGPT,
- running non-destructive local-style tests in a sandbox,
- preparing cleanup candidate reports before new files are added.

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

Advisor findings to fix later in a Code Labs-only migration:

1. Security: `public.code_labs_set_updated_at` has mutable `search_path`.
2. Performance: Code Labs foreign keys are missing covering indexes.
3. Performance: Code Labs RLS policies should avoid per-row auth function re-evaluation where possible.

Out of scope for Code Labs promotion unless separately requested:

- Stream Bandit `sb_*` advisor warnings.
- Storage bucket warnings.
- Stream Bandit social/admin/auth functions.

## Account and signed-in user rule

Before live promotion, no user-facing Code Labs page should hard-code the developer/user name. Use neutral wording such as:

- signed-in Code Labs user,
- this Code Labs user,
- saved project owner,
- owner/repo for examples.

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

Allowed later:

- page opened,
- GitHub file loaded read-only,
- Code Search report generated,
- Workflow request copied,
- preview test saved,
- checkpoint saved,
- safe change request generated,
- feedback submitted.

Avoid storing:

- full user code in usage events,
- private personal details,
- secret keys,
- unrelated browser data,
- other users' repair details.

Feedback can include rating, what worked, what was confusing, and optional contact only if the user chooses to provide it.

## Build order from here

1. Continue menu-by-menu live promotion checks.
2. Record passed pages in this plan.
3. Keep GitHub `main` as the source of truth.
4. Keep using existing Code Labs files where possible.
5. Fix only visible page problems or connector-readiness blockers.
6. Keep hard-coded user names out of live pages.
7. Plan Code Labs auth/profile layer before adding production account flows.
8. Plan Supabase schema changes before SQL.
9. Build server-side connector prototype after static workflow is stable.
10. Add read-only connector tools before write tools.
11. Add scoped Code Labs write tools after account/RLS review.
12. Add browser-safe utility toolbox where it improves non-coder repair flow.
13. Add Python sandbox/analysis connector design as an optional non-blocking improvement.
14. Add GitHub branch/PR actions only after explicit safety review.

## Stop rules

Stop and ask before:

- adding a new page,
- touching Stream Bandit app files,
- touching any Stream Bandit V7 file,
- changing Supabase schema,
- adding auth redirects,
- adding browser-side GitHub writes,
- deleting any Code Labs page,
- deleting any Stream Bandit V7 file,
- cleaning old Stream Bandit files without verifying they are stale V4/V5/V6 page/checkpoint candidates,
- replacing a full page when a tiny safe fix would work,
- merging a stale draft PR,
- merging connector wording that mentions Stream Bandit login as a Code Labs path.

## Safety rules

- Never overwrite without a checkpoint or branch/PR path.
- Never push to live main from browser code.
- Never hide what changed.
- Always support manual copy/paste rescue mode.
- Prefer full-file replacement for non-coders when safe.
- Prefer reuse/rewrite of existing Code Labs files over adding new files.
- Keep Code Labs and Stream Bandit user-facing lanes separate.
- Keep secrets server-side only.
- Make every production write action visible in an audit trail.
- Use test branches and pull requests before merge.
- Merge only after user testing says pass or the change is a plan-only update.
