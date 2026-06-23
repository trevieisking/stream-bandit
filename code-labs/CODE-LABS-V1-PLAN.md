# Code Labs Master Plan

Status: Code Labs only / live-ready path / connector future planned / no Stream Bandit lane crossing.

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

## Current working flow

The current Code Labs flow is now:

1. Home Command Centre - choose the safe path.
2. Start Guide - plain-English first step.
3. File Lab - paste, upload, or public GitHub read-only load.
4. Code Search - find exact lines and make a Code Search Report.
5. Workflow Hub - build ChatGPT read, generator, and safe change requests.
6. Patch Desk / Patch Lab - paste fixed code or line-safe patches.
7. Preview + Test - test before replacing.
8. Checkpoints - rollback safety.
9. Publish Prep / GitHub Tracker - safe branch and PR tracking later.

## Current proven features

- Manual repair mode.
- Local browser storage.
- Full-file paste and upload.
- Public GitHub read-only file load.
- Code Search Report with file, path, repo, branch, line count, character count, match count, and match lines.
- Workflow Hub uses the saved Code Search Report.
- ChatGPT generator request.
- Safe change request wording.
- Fixed-code paste area.
- Compare summary.
- Preview iframe.
- Test checklist.
- Local checkpoints.
- Copy/download/select workflows.
- Separate GitHub and Supabase connector wording.

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

Current or planned table family:

- code_labs_projects
- code_labs_files
- code_labs_jobs
- code_labs_versions
- code_labs_packets
- code_labs_test_runs
- code_labs_audit_log
- code_labs_usage_events
- code_labs_feedback
- code_labs_accounts or profile link table if needed

Usage and feedback tables must avoid personal details unless the user chooses to send feedback.

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

## Build order from here

1. Finish navigation/home polish.
2. Add Code Labs account plan UI or account status page.
3. Add usage and feedback plan UI in read-only/local mode first.
4. Add Supabase schema plan for Code Labs accounts, usage, and feedback.
5. Add RLS policies in a Supabase branch/test pass only.
6. Build server-side connector prototype.
7. Add ChatGPT app/connector setup notes.
8. Add read-only connector tools first.
9. Add scoped Code Labs write tools.
10. Add GitHub branch/PR actions only after safety review.

## Safety rules

- Never overwrite without a checkpoint.
- Never push to live main from browser code.
- Never hide what changed.
- Always support manual copy/paste rescue mode.
- Prefer full-file replacement for non-coders.
- Keep Code Labs and Stream Bandit user-facing lanes separate.
- Keep secrets server-side only.
- Make every write action visible in an audit trail.
