# Code Labs Master Plan

Status: Code Labs only / live-ready path / connector future planned / no Stream Bandit lane crossing.

Last audit update: 2026-06-24 - GitHub source, PR history, page map, page shell audit, menu grouping, account/usage status panels, and Supabase inspection recorded before database changes.

## Mission

Code Labs helps non-coders and ChatGPT work on website code safely. It gives ChatGPT the exact file context, search evidence, repair request, preview checklist, checkpoint trail, and safe branch request needed to fix code without guessing or deleting working logic.

## Separation rule

Public product name: **Code Labs**.

Code Labs may live in the same GitHub repository, same domain, and eventually the same Supabase project during testing, but it must stay in its own user-facing lane.

Code Labs must not:

- send users to a Stream Bandit login page,
- use Stream Bandit page buttons as Code Labs controls,
- write to Stream Bandit app tables unless the user explicitly chooses a Stream Bandit app file repair,
- expose secret keys in browser code,
- make live writes without a checkpoint, preview, and user approval.

If Code Labs uses the same Supabase Auth project later, the user-facing control must still be Code Labs branded and Code Labs routed. It must not say Stream Bandit login, open Stream Bandit app pages as Code Labs controls, or rely on Stream Bandit page wording.

## Current working flow

1. Home Command Centre - choose the safe path.
2. Start Guide - plain-English first step.
3. Fix Wizard - one next step for non-coders.
4. File Lab - paste, upload, or public GitHub read-only load.
5. Code Search - find exact lines and make a Code Search Report.
6. Workflow Hub - build ChatGPT read, generator, and safe change requests.
7. Patch Desk / Patch Lab - paste fixed code or line-safe patches.
8. Preview + Test - test before replacing.
9. Checkpoints - rollback safety.
10. AI Handoff - send a clean review package back to ChatGPT.
11. Publish Prep - prepare a safe test-branch request.
12. GitHub Tracker - track PR, preview link, and pass/fail decision.
13. Repo Desk - plan repo read/add/change/review requests.

## Current page map

GitHub `main` currently has these 19 Code Labs pages.

### Beginner and repair flow

- `code-labs/index.html` - Home Command Centre.
- `code-labs/start-guide.html` - plain-English intake.
- `code-labs/fix-wizard.html` - one next step.
- `code-labs/file-lab.html` - paste/upload/read-only GitHub file load and Code Search.
- `code-labs/rescue-room.html` - problem, errors, and do-not-touch rules.
- `code-labs/packet-builder.html` - ChatGPT repair packet.
- `code-labs/v20.html` - Workflow Hub.
- `code-labs/patch-desk.html` - paste full fixed code.
- `code-labs/patch-lab.html` - exact search/replace and line-range changes.
- `code-labs/preview-test.html` - original/fixed preview and PASS/FAIL checklist.
- `code-labs/checkpoints.html` - rollback and test history.

### Connector, finishing, and support pages

- `code-labs/connector-status.html` - GitHub/Supabase status and lane wording.
- `code-labs/ai-handoff.html` - copyable review handoff.
- `code-labs/publish-prep.html` - safe branch/PR request.
- `code-labs/github-tracker.html` - PR, branch, preview, and test tracking.
- `code-labs/repo-desk.html` - repo action planning.
- `code-labs/project-picker.html` - project mode selection.
- `code-labs/setup.html` - workspace setup.
- `code-labs/help.html` - plain-English help.

## Current source architecture

Code Labs is currently a static, JavaScript-rendered helper app.

The architecture is:

1. Small HTML shells under `code-labs/`.
2. `assets/code-labs.css` provides the shared Code Labs app shell and UI.
3. `assets/code-labs.js` renders the original core pages and local manual repair state.
4. `assets/code-labs-v1-1-safety.js` adds local safety/export/import tools.
5. `assets/code-labs-v12-save.js` loads Supabase history support and injects newer menu links.
6. Page-specific JavaScript files render newer tools such as Start Guide, Fix Wizard, Workflow Hub, Patch Lab, AI Handoff, Publish Prep, GitHub Tracker, and Repo Desk.

This layered model is working, but it is fragile. If a page-specific script fails, a newer page can fall back to the base Home shell or show confusing identity. Future hygiene work should make loader failure obvious and eventually move page registry/status into one source of truth.

## Current proven features

- Manual repair mode.
- Local browser storage.
- Full-file paste and upload.
- Public GitHub read-only file load.
- Code Search Report with file, path, repo, branch, line count, character count, match count, and match lines.
- Workflow Hub uses the saved Code Search Report.
- ChatGPT read request.
- ChatGPT generator request.
- Safe change request wording.
- Fixed-code paste area.
- Compare summary.
- Exact Patch Lab find/replace and line-range workflow.
- Preview iframe.
- Desktop/mobile preview width switch.
- Test checklist.
- Local checkpoints.
- Copy/download/select workflows.
- AI Handoff package.
- Publish Prep safe branch request.
- GitHub Tracker link/test tracking.
- Repo Desk request planner.
- Separate GitHub and Supabase connector wording.
- Safe create-file drill passed.
- Safe delete-file drill passed.
- Noscript page-load hygiene added to `v20.html` and `repo-desk.html` in PR #84.
- Sidebar menu grouping added in PR #85.
- Code Labs account status panel added in PR #86.
- Usage and feedback planned-status panel added in PR #87.

## Audit findings from 2026-06-24 scan

### Source of truth

- GitHub `main` is the source of truth.
- Uploaded HTML files may be stale. Example: uploaded `repo-desk.html` still showed `data-page="github-tracker"`, but GitHub `main` had already corrected Repo Desk to `data-page="repo-desk"`.
- Before coding, fetch from GitHub `main`, not the uploaded bundle.

### Current health

- The shared CSS file exists on GitHub and contains the Code Labs UI shell.
- The page-specific JavaScript assets exist on GitHub for the newer pages.
- The manual repair path is coherent and should be preserved.
- The read-only GitHub loader and Code Search path are now part of the live-ready direction.
- Workflow Hub already reads the saved Code Search Report.
- Repo Desk exists on `main` after the Repo Desk planner and identity promotion work.
- 19 Code Labs HTML shells were checked on `main`; CSS, page identity, noscript fallback, base loader, safety/save layers, and expected page-specific scripts are present.

### Main technical risks

- The layered loader model can hide a failed page-specific script.
- Some advanced pages rely on JavaScript after the base shell has already rendered Home fallback.
- Connector Status wording is still partly patched after render instead of coming from one source of truth.
- Supabase account/status wording must stay Code Labs-only.
- Stale uploaded files and stale draft PRs can conflict with GitHub `main`.
- Do not merge old connector wording that points users to Stream Bandit sign-in.

## Stale branch and PR handling

The stale PR cleanup pass has closed or marked stale drafts before further feature work.

Closed or handled:

- PR #82 - stale Repo Desk planner; Repo Desk already exists on `main`.
- PR #68 - stale Supabase sign-in wording; conflicted with Code Labs-only login/control rule.
- PR #72 - stale connector boundary wording; useful idea but needed rebuild from current `main`.
- PR #71 - old live-ready plan draft; redundant after master plan update.
- PR #66 - duplicate of already-merged Patch Lab work.
- PR #64 - duplicate of already-merged Workflow Hub work.

Trusted merged milestones:

- PR #65 / connector boundary wording.
- PR #73 / File Lab Code Search MVP.
- PR #74 / Code Search to Workflow Hub.
- PR #75 / Home Command Centre.
- PR #76 / navigation and home polish.
- PR #77 / connector master plan.
- PR #78 / Repo Desk planner.
- PR #79 / safe create-file drill.
- PR #80 / safe delete-file drill.
- PR #81 / Repo Desk identity.
- PR #83 / master plan audit findings.
- PR #84 / noscript hygiene.
- PR #85 / sidebar menu grouping.
- PR #86 / account status panel.
- PR #87 / usage and feedback status panel.

## Live page audit checklist

Before feature coding, test every live Code Labs page on the live domain or a RawGitHack branch preview.

Pages to test:

- `/code-labs/index.html`
- `/code-labs/start-guide.html`
- `/code-labs/fix-wizard.html`
- `/code-labs/v20.html`
- `/code-labs/file-lab.html`
- `/code-labs/rescue-room.html`
- `/code-labs/packet-builder.html`
- `/code-labs/patch-desk.html`
- `/code-labs/patch-lab.html`
- `/code-labs/preview-test.html`
- `/code-labs/checkpoints.html`
- `/code-labs/connector-status.html`
- `/code-labs/ai-handoff.html`
- `/code-labs/publish-prep.html`
- `/code-labs/github-tracker.html`
- `/code-labs/repo-desk.html`
- `/code-labs/project-picker.html`
- `/code-labs/setup.html`
- `/code-labs/help.html`

For each page confirm:

- page opens,
- intended content appears,
- it does not render as the wrong page or Home fallback,
- menu appears,
- correct active menu state where possible,
- primary buttons are visible,
- no Stream Bandit login wording or redirect,
- no console-breaking script failure,
- mobile layout is usable,
- no Stream Bandit app page is changed.

## Tool goal

Code Labs should become a real tool that ChatGPT can use, not only a static helper site.

The target is a proper Code Labs connector/app with controlled read and write abilities. The connector should give ChatGPT tools such as:

- read Code Labs project state,
- read a selected file record,
- read a saved Code Search Report,
- create or update a Code Labs repair job,
- save a generated packet,
- save a test result,
- save a checkpoint record,
- prepare a safe GitHub branch request,
- later create a test branch or PR after explicit user approval.

The connector must be permissioned. It should not be a hidden admin back door.

## Authentication and account system plan

Code Labs needs its own account system before real connector writes become active.

Required account pieces:

- Code Labs sign-in page or panel.
- Code Labs user profile row.
- Clear user-owned workspace list.
- User-owned repair jobs.
- User-owned files.
- User-owned packets.
- User-owned checkpoints.
- User-owned test runs.
- Owner/admin view for support only.
- No service-role key in browser code.
- No automatic access to another user's jobs.

The account system should use Code Labs wording only. It must not say Stream Bandit login.

## Permission model

Suggested roles:

- guest: can use local manual mode only.
- user: can save personal Code Labs jobs and reports.
- trusted tester: can use extra testing tools.
- owner: can inspect usage totals and support diagnostics.
- system tool: server-side connector role with scoped actions only.

Write permissions must be narrow:

- Users can write their own Code Labs rows.
- Owner can inspect aggregate usage and support reports.
- Server tool can only run approved connector actions.
- GitHub branch or PR write needs explicit user confirmation.
- No silent writes to main.

## Database plan

Use Code Labs tables, separate from Stream Bandit app tables.

Planned table family:

- `code_labs_projects`
- `code_labs_files`
- `code_labs_jobs`
- `code_labs_versions`
- `code_labs_packets`
- `code_labs_test_runs`
- `code_labs_audit_log`
- `code_labs_usage_events`
- `code_labs_feedback`
- `code_labs_accounts` or profile link table if needed

Usage and feedback tables must avoid personal details unless the user chooses to send feedback.

## Supabase inspection checkpoint - 2026-06-24

Supabase inspection was read-only. No schema changes, no table writes, no RLS edits, and no auth changes were made.

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

Code Labs advisor findings to fix later in a Code Labs-only migration:

1. Security: `public.code_labs_set_updated_at` has mutable `search_path`. Later fix by pinning the function `search_path`.
2. Performance: Code Labs foreign keys are missing covering indexes on files, jobs, versions, packets, test runs, and audit log relationships.
3. Performance: Code Labs RLS policies re-evaluate auth functions per row. Later optimize with the Supabase `(select auth.uid())` style.

Out of scope for this Code Labs pass:

- Stream Bandit `sb_*` advisor warnings.
- Storage bucket warnings.
- Stream Bandit social/admin/auth functions.

Next database step must be a separate Code Labs-only Supabase migration plan. It should not touch Stream Bandit tables or policies unless the user explicitly starts a separate Stream Bandit database safety pass.

## Minimal usage tracker

The usage tracker should be privacy-light.

Allowed aggregate events:

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

Store counts, timestamps, route/tool name, and optional anonymous/session/user id depending on account state.

## Feedback plan

Add a small Code Labs feedback box later:

- rating or emoji,
- what worked,
- what was confusing,
- optional contact only if user chooses,
- link feedback to a job only when the signed-in user owns that job.

Owner dashboard can show totals and recent feedback, not private code by default.

## ChatGPT connector/app plan

To be useful inside ChatGPT, Code Labs needs a hosted server endpoint, not just static GitHub Pages files.

High-level connector pieces:

1. Hosted Code Labs server.
2. Auth handshake for the signed-in Code Labs account.
3. Scoped tool actions for ChatGPT.
4. Audit trail for every connector action.
5. User approval gates before write actions.
6. Safe fallback to manual copy/paste if the connector is unavailable.

The app/connector screen in ChatGPT should be treated as a future integration target. The current static Code Labs pages are not enough by themselves to provide ChatGPT with read/write tools.

## Connector safety rules

Read tools may:

- read user-owned Code Labs project metadata,
- read user-owned repair job state,
- read saved reports and packets,
- read public GitHub files when user provides a URL.

Write tools may only:

- save Code Labs job state,
- save reports,
- save packets,
- save checkpoints,
- save test results,
- create usage events,
- create feedback rows.

GitHub write tools are later and must require:

- selected repo,
- selected branch or base branch,
- target file path,
- explicit user approval,
- PR preview/testing path,
- no direct main update.

## What is not active yet

- No production Code Labs account system yet.
- No live ChatGPT app/connector endpoint yet.
- No automatic GitHub write from Code Labs browser pages.
- No service-role key in browser code.
- No live promotion pipeline.
- No cross-user repair access.
- No payment buttons.
- No usage tracker writes.
- No feedback table writes.

## Build order from here

1. Keep this merged master plan authoritative.
2. Keep stale PRs closed or rebuild them from current `main` only.
3. Continue live page checks after every UI/helper change.
4. Add missing Workflow Hub request types only after the current planning/status lane is stable.
5. Design the Code Labs-only Supabase migration for account/profile link, usage, feedback, FK indexes, function search path, and RLS initplan cleanup.
6. Run one Supabase migration pass only after the exact SQL is reviewed.
7. Build server-side connector prototype.
8. Add ChatGPT app/connector setup notes.
9. Add read-only connector tools first.
10. Add scoped Code Labs write tools.
11. Add GitHub branch/PR actions only after safety review.

## Next recommended jobs

Do these in order:

1. Planning lock - this master plan stays authoritative.
2. Live page spot check after PR #84, PR #85, PR #86, and PR #87.
3. Workflow Hub request set - add missing Review, Exact Patch, Supabase Help, and GitHub Help requests.
4. Code Labs auth UI decision - same Supabase project is acceptable only with Code Labs-only login/control wording.
5. Code Labs Supabase migration design - plan before SQL.
6. Usage and feedback UI - local/read-only first; database writes only after RLS is confirmed.
7. GitHub direct commit design - design before coding, branch/PR only by default.
8. Logo and favicon - Code Labs identity only, no Stream Bandit branding.

## Stop rules

Stop and ask before:

- adding a new page,
- touching Stream Bandit app files,
- changing Supabase schema,
- adding auth redirects,
- adding browser-side GitHub writes,
- deleting any Code Labs page,
- replacing a full page when a tiny safe fix would work,
- merging a stale draft PR,
- merging connector wording that mentions Stream Bandit login as a Code Labs path.

## Safety rules

- Never overwrite without a checkpoint.
- Never push to live main from browser code.
- Never hide what changed.
- Always support manual copy/paste rescue mode.
- Prefer full-file replacement for non-coders.
- Keep Code Labs and Stream Bandit user-facing lanes separate.
- Keep secrets server-side only.
- Make every write action visible in an audit trail.
- Use test branches and pull requests before merge.
- Merge only after user testing says pass.
