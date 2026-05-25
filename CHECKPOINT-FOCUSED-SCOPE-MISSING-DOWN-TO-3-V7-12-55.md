# Stream Bandit Focused Scope Missing Down To 3 V7.12.55

Date: 2026-05-25

Trevor reran the must-use focused scanner after adding `x.m3u8` and `t.html` protective placeholders.

Scanner used:

`focused-keep-scope-scanner-v7-12-53-test.html`

Result from screenshot:

- Repo files: 965
- HTML pages: 603
- Scope roots: 69
- Keep files: 392
- Keep pages: 365
- Review files: 352
- Missing in scope: 3
- Safe/noise refs: 18

Meaning:

- Missing in scope has improved again: 29 -> 23 -> 6 -> 4 -> 3.
- The focused app scope remains stable.
- No deletes have happened.
- No live/index promotion has happened.
- No Supabase writes have happened.

Remaining missing rows shown:

1. `stream-bandit-settings-global-v7-1-8.js` -> `eLstyle.css`
2. `stream-bandit-app.js` -> `test.html`
3. `t.html` -> `test.html`

Important notes:

- `eLstyle.css` already exists on the repository main branch as a legacy CSS alias, so if it continues to show missing this may be GitHub Pages / scanner cache timing or the scanner tree cache.
- Do not blindly create or overwrite `test.html`. Trevor uses `test.html` as part of the normal testing workflow, so replacing it with a generic placeholder may cause confusion.
- `t.html` is only a small legacy alias and should not become a blocker.

Next safe action:

- Do not ask Trevor for every long result list.
- Only need the top counts and the Missing In Scope tab.
- Leave `test.html` alone unless Trevor explicitly wants a hosted test placeholder.
- Next scanner version should mark `test.html` as a protected workflow-name reference / safe-noise rather than a real app-missing page.

Safety rule remains:

- No deletes.
- No live/index promotion.
- No Supabase writes.
- Keep using the focused scanner for the simple app scope rule.
