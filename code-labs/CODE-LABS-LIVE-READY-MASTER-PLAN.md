# Code Labs Live-Ready Master Plan

Status: active build plan / Code Labs only / do not touch Stream Bandit app pages.

Date: 2026-06-23

## 1. Mission

Code Labs is a small tool for people who cannot code when ChatGPT tools fail, truncate output, or cannot safely patch a file directly.

Code Labs must help a non-coder:

1. explain what is broken in plain English;
2. give ChatGPT the exact file, code, problem, and do-not-touch rules;
3. generate correct full-file or exact patch instructions;
4. pull untruncated code from a public GitHub file when possible;
5. search large code files by exact text, tag, function name, script link, CSS class, or line range;
6. preview and test before replacing anything live;
7. save checkpoints and repair history;
8. commit or prepare commits safely only after the user approves the exact change;
9. ask ChatGPT to use GitHub safely through test branches and pull requests.

## 2. Product lanes

### Code Labs lane

Code Labs is `CL`.

Allowed Code Labs paths:

- `/code-labs/`
- `/code-labs/index.html`
- `/code-labs/v20.html`
- `/code-labs/*`

Code Labs may use:

- the existing `trevieisking/stream-bandit` GitHub repo;
- the existing IONOS/custom domain;
- the existing Supabase project if rows stay in Code Labs tables;
- the existing Supabase Auth project only if called from Code Labs own login/control later.

### Stream Bandit lane

Stream Bandit stays Stream Bandit.

Code Labs must not:

- use Stream Bandit buttons;
- link users to Stream Bandit app pages;
- send users to Stream Bandit login;
- use Stream Bandit tables for Code Labs records;
- touch or recode Stream Bandit app features;
- cross-match Code Labs routes with Stream Bandit routes.

## 3. Connector rule

GitHub and Supabase are separate connectors.

When a connector is needed, ask for one only:

- `Connect GitHub please, Trev` for repo, branch, PR, preview, merge, public/private repo read, and commit work.
- `Connect Supabase please, Trev` for database/table/history work.

Do not ask for both at the same time unless the user explicitly wants both connected.

## 4. Current page map

No new pages unless agreed. Existing pages should be connected into one clear flow first.

### Main beginner journey

1. `index.html` - Code Labs home and mission.
2. `start-guide.html` - plain-English intake.
3. `fix-wizard.html` - tells the user one next step.
4. `v20.html` - Workflow Hub: Read Request, Code Generator Request, Safe Change Request.
5. `file-lab.html` - paste/load full code.
6. `rescue-room.html` - describe problem and protected rules.
7. `packet-builder.html` - build copyable ChatGPT repair packet.
8. `patch-desk.html` - paste fixed full code.
9. `patch-lab.html` - exact search/replace and line-range repairs.
10. `preview-test.html` - preview and test checklist.
11. `checkpoints.html` - rollback and test records.

### Connector and finishing pages

12. `connector-status.html` - explains GitHub and Supabase separately.
13. `ai-handoff.html` - send clean review package back to ChatGPT.
14. `publish-prep.html` - prepare safe test-branch request.
15. `github-tracker.html` - track PR, preview link, pass/fail.
16. `project-picker.html` - choose project mode.
17. `setup.html` - workspace setup.
18. `help.html` - plain-English help.

## 5. Live-ready target flow

The live-ready version should feel like one small machine, not many separate tools.

### Flow A - user has no idea where to start

1. Home says `Start here`.
2. Start Guide asks project, file, problem, do-not-touch rules.
3. Fix Wizard tells one next page.
4. Workflow Hub gives the exact ChatGPT request.

### Flow B - tools failed or output truncated

1. User opens Workflow Hub.
2. User copies `CODE LABS CODE GENERATOR REQUEST`.
3. ChatGPT receives strict no-truncation and full-file rules.
4. User pastes output into Patch Desk or Patch Lab.
5. User previews and tests.
6. User saves checkpoint.
7. User asks GitHub for a safe branch only after preview passes.

### Flow C - exact patch only

1. User opens Patch Lab.
2. Loads saved Code Labs code.
3. Finds exact text or line range.
4. Replaces safely.
5. Saves fixed output.
6. Sends report back to ChatGPT.

### Flow D - safe publish

1. Preview Test passes.
2. Publish Prep creates safe test branch request.
3. ChatGPT uses GitHub connector.
4. GitHub Tracker records PR/preview link.
5. User tests branch preview.
6. Merge only after user says pass.

### Flow E - pull untruncated code from a repository

1. User enters a GitHub file URL, repo/branch/path, or public raw URL.
2. Code Labs pulls the full file into File Lab without truncating.
3. Code Labs stores filename, path, branch, raw URL, line count, and character count.
4. Code Search/Find tools help locate script tags, broken links, functions, CSS classes, IDs, and line ranges.
5. Workflow Hub creates a read, generator, patch, or safe publish request from the exact file.

### Flow F - direct repository commit from Code Labs later

This is important for live usefulness, but it needs its own safety layer.

Target behaviour:

1. User connects GitHub from Code Labs.
2. Code Labs reads the target repository and selected file.
3. User generates or pastes fixed code.
4. User previews and saves a checkpoint.
5. Code Labs creates a test branch and commit, or opens a PR.
6. User tests the preview.
7. User explicitly approves merge.

Default rule: commit to a test branch / pull request, not direct to `main`.

Direct-to-main can only exist as a locked expert option later, with a warning and explicit confirmation.

## 6. Tool catalogue for live readiness

Code Labs should become useful by giving ChatGPT and the user these tools.

### 6.1 Start Guide

Purpose: plain-English intake.

Should collect:

- site/project name;
- repo or URL;
- file URL/path;
- problem;
- do-not-touch rules;
- screenshot/error notes.

### 6.2 Repo Reader / Full Code Pull

Purpose: get perfect, untruncated source code.

Should support:

- public GitHub blob URL;
- public raw.githubusercontent.com URL;
- owner/repo/branch/path;
- optional private repo later through GitHub connection;
- line count and character count;
- save to current Code Labs repair state.

Rules:

- no secrets in browser;
- no write from read mode;
- if private repo cannot be read, ask user to connect GitHub.

### 6.3 Code Search / Code Lens

Purpose: help ChatGPT and non-coders inspect a big page without losing context.

Should support searching for:

- `<script`;
- `<link`;
- `supabase`;
- `auth`;
- CSS class names;
- function names;
- button text;
- IDs;
- routes;
- exact error text.

Outputs should include:

- match count;
- line numbers;
- context before/after match;
- copy line range;
- send search report to ChatGPT;
- load selected range into Patch Lab.

This can start inside existing File Lab or Patch Lab. Add a new page only if the existing pages become too crowded.

### 6.4 Workflow Hub Request Builder

Purpose: produce exact prompts for ChatGPT.

Required request types:

- Read Request;
- Code Generator Request;
- Safe Change Request;
- Review Request;
- Exact Patch Request;
- Supabase Help Request;
- GitHub Help Request;
- Direct Commit Request later.

### 6.5 Patch Lab

Purpose: exact safe changes when full replacement is risky.

Should support:

- search exact text;
- replace selected match;
- replace all;
- replace line range;
- show match context;
- save output as fixed code;
- generate report for ChatGPT.

### 6.6 Patch Desk

Purpose: paste a full fixed file from ChatGPT.

Should support:

- original vs fixed comparison;
- character and line count;
- save fixed code;
- checkpoint fixed code;
- copy/download fixed file;
- send to Preview Test.

### 6.7 Preview Test

Purpose: prevent broken live updates.

Should support:

- original/fixed preview;
- desktop/mobile width;
- checklist;
- PASS/FAIL record;
- send pass result to Publish Prep.

### 6.8 Checkpoints

Purpose: rollback safety.

Should support:

- original checkpoint;
- fixed checkpoint;
- publish checkpoint;
- copy checkpoint code;
- restore as current;
- restore as fixed;
- show test history.

### 6.9 GitHub Publisher

Purpose: commit safely to a user's repo.

MVP path:

- ChatGPT connector creates branch/PR.
- Code Labs prepares the exact request and tracks the result.

Later direct app path:

- user connects GitHub;
- Code Labs reads repo file;
- Code Labs commits fixed code to a new branch;
- Code Labs opens PR;
- Code Labs records PR and preview link.

Safety rules:

- no browser service tokens;
- no hidden writes;
- branch first;
- PR first;
- merge only after user pass;
- show exact file path before write.

### 6.10 Supabase Repair History

Purpose: save jobs and make repair work reusable.

Should support:

- Code Labs projects;
- files;
- jobs;
- versions;
- packets;
- test runs;
- audit log.

Rules:

- Code Labs tables only;
- no Stream Bandit tables;
- Code Labs login/control only;
- no Stream Bandit page redirect.

### 6.11 Tips and Help System

Purpose: teach non-coders what to do without guessing.

Useful tips:

- paste the full file, not a screenshot of code;
- save a checkpoint before replacing anything;
- preview before publishing;
- if output is cut off, use Code Generator Request again and say split only when asked;
- use exact line search for small fixes;
- never paste secret keys into ChatGPT or browser pages;
- only merge after the branch preview passes.

## 7. Required build phases

### Phase 1 - Planning lock

Goal: stop drifting.

Tasks:

- Keep this master plan updated.
- Add a repair log/checkpoint section.
- Keep Code Labs and Stream Bandit lane rules visible.
- Do not start random page builds without updating this plan.

Status: in progress.

### Phase 2 - Navigation and wording cleanup

Goal: make the app feel small and understandable.

Tasks:

- Home should show only the main beginner route.
- Menu should group or visually separate primary and advanced tools.
- No duplicate icon meanings.
- Every page should say: what this page is for, what to click next, and what not to do.
- Use `CL` branding, not Stream Bandit branding.

Status: started.

### Phase 3 - Workflow Hub becomes command centre

Goal: one page can create the right request for ChatGPT.

Required requests:

- Read Request.
- Code Generator Request.
- Safe Change Request.
- Review Request.
- Exact Patch Request.
- Supabase Help Request.
- GitHub Help Request.
- Direct Commit Request later.

Status: Read, Generator, and Safe Change are started.

### Phase 4 - State handoff between pages

Goal: pages share one repair job cleanly.

Tasks:

- Start Guide writes project, file, problem, rules.
- File Lab writes current code and GitHub source.
- Rescue Room writes problem and errors.
- Workflow Hub reads all saved data.
- Patch Desk/Patch Lab write fixed code.
- Preview Test writes pass/fail result.
- GitHub Tracker writes PR and preview link.
- Checkpoints shows repair timeline.

Status: partially working through `codeLabsV1State`.

### Phase 5 - Repo Reader and Code Search

Goal: let Code Labs pull full pages from GitHub and inspect them without truncation.

Tasks:

- Improve File Lab GitHub loader.
- Add searchable code index/report.
- Add line-range copy helper.
- Add search report for ChatGPT.
- Send selected code/range to Patch Lab.

Status: planned.

### Phase 6 - Supabase repair history

Goal: optional save/load for Code Labs records.

Rules:

- Use Code Labs tables only.
- Do not use Stream Bandit tables.
- Do not send user to Stream Bandit login.
- If auth is shared project-wide, the login control must still be Code Labs-branded and Code Labs-routed.
- Browser may use publishable/anon keys only.
- No service-role key in browser.

Status: save/load exists, wording corrected, auth UI still needs final Code Labs-only pass.

### Phase 7 - GitHub safe publishing

Goal: GitHub actions happen safely.

MVP rules:

- Browser pages do not write to GitHub.
- ChatGPT creates test branch and PR.
- User tests raw.githack preview.
- Merge only after user confirms pass.

Later direct-write rules:

- Code Labs may commit to a user's repo only after GitHub is connected.
- Show target owner/repo/branch/path before write.
- Create branch/PR by default.
- Do not write to `main` unless a later expert mode is explicitly approved.

Status: Workflow Hub and Publish Prep request flow exists.

### Phase 8 - Branding and favicon

Goal: Code Labs has its own identity.

Tasks:

- Generate 4 to 8 logo options.
- User chooses favourites.
- Pick one final logo.
- Create favicon/app icon assets.
- Update Code Labs shell only.
- Do not use Stream Bandit logo/branding.

Status: planned.

### Phase 9 - Final live-readiness pass

Goal: launch Code Labs as a small useful public helper.

Checklist:

- all Code Labs pages open on live domain;
- menu works from every Code Labs page;
- no Stream Bandit login/page redirects;
- connector status is clear;
- manual mode works without connectors;
- repo reader can pull public GitHub files;
- code search can find script tags, routes, functions, and line ranges;
- Workflow Hub generator request works;
- patch lab works;
- preview/test works;
- checkpoints work;
- Supabase save/load is clear and safe;
- help page explains the app simply;
- favicon/logo installed;
- no root Stream Bandit app changes.

Status: not complete.

## 8. Current passed checkpoints

- V1 Manual Rescue: pass.
- V1.1 Safety Tools: pass.
- V1.2 Supabase Repair History: pass, but auth UI needs final Code Labs-only pass.
- V1.3 GitHub Read-Only Loader: pass.
- V1.4 Patch Lab: pass.
- V1.5 AI Handoff: pass.
- V1.6 Publish Prep: pass.
- V1.7 GitHub Tracker: pass.
- V1.8 Fix Wizard: pass.
- V1.9 Start Guide: pass.
- V2.0 Workflow Hub: pass.
- V2.2 Connector boundary wording: pass and merged.
- V2.3 Code Generator Request: pass and merged.
- Menu icon duplicate fix: pass and merged.
- Workflow Hub cache refresh: pass and merged.

## 9. Repair log format

Use this format for every future Code Labs fix:

```text
Date:
Branch:
PR:
Page/file touched:
Problem:
Fix:
User test:
Merge status:
Notes:
```

## 10. Next recommended jobs

Do these in order.

### Job 1 - Home command centre

Make `index.html`/home explain the live-ready path in four choices:

1. Start Guide.
2. Workflow Hub.
3. Patch Lab.
4. Preview + Test.

### Job 2 - Repo Reader and Code Search MVP

Use existing File Lab/Patch Lab first.

Add:

- pull full public GitHub file;
- search big file;
- show line numbers and snippets;
- copy selected line range;
- generate Code Search Report for ChatGPT;
- send selected range to Patch Lab.

### Job 3 - Menu grouping

Make the menu easier without adding pages:

- Start here.
- Fix flow.
- Test and publish.
- Advanced tools.

### Job 4 - Workflow Hub request set

Add missing request types:

- Review Request.
- Exact Patch Request.
- Supabase Help Request.
- GitHub Help Request.
- Direct Commit Request later.

### Job 5 - Code Labs auth UI decision

Decide whether Supabase auth stays in same project with Code Labs-only login control, or separate project later.

Current user rule:

- same auth may be okay if called from Code Labs own login;
- no Stream Bandit buttons, pages, tables, or redirects.

### Job 6 - GitHub direct commit design

Design before coding.

Must answer:

- public repo only or private repo too;
- branch-only by default;
- PR creation;
- rollback/checkpoint;
- whether direct main commit is allowed later as expert mode;
- how Code Labs receives GitHub permission without secrets in browser.

### Job 7 - Logo and favicon

Generate logo options, choose final, then wire favicon and CL logo into Code Labs shell.

## 11. Stop rules

Stop and ask before:

- adding a new page;
- touching Stream Bandit app files;
- changing Supabase schema;
- adding auth redirects;
- adding browser-side GitHub writes;
- deleting any Code Labs page;
- replacing a full page when a tiny safe fix would work.
