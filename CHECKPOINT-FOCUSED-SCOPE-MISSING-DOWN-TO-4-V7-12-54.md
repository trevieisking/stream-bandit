# Stream Bandit Focused Scope Missing Down To 4 V7.12.54

Date: 2026-05-25

Trevor reran the must-use focused scanner after the HLS and row placeholder fixes.

Scanner used:

`focused-keep-scope-scanner-v7-12-53-test.html`

Result from screenshot:

- Repo files: 962
- HTML pages: 602
- Scope roots: 69
- Keep files: 390
- Keep pages: 364
- Review files: 352
- Missing in scope: 4
- Safe/noise refs: 18

Meaning:

- The focused app scope is stable.
- Missing in scope has improved from 29, then 23, then 6, now down to 4.
- The menu/global/settings keep set remains protected.
- No deletes have happened.
- No live/index promotion has happened.
- No Supabase writes have happened.

Remaining missing rows shown:

1. `stream-bandit-settings-global-v7-1-8.js` -> `eLstyle.css`
2. `stream-bandit-app.js` -> `test.html`
3. `stream-bandit-app.js` -> `x.m3u8`
4. `stream-bandit-app.js` -> `t.html`

Important caution:

Do not blindly create or promote `test.html` because Trevor uses `test.html` as a testing workflow name. Creating a generic placeholder there could confuse local/live testing.

Next safe step:

- Treat old sample/demo references from `stream-bandit-app.js` as safe/noise unless current live pages actually load them.
- Confirm `eLstyle.css` exists on main; it has been added as a legacy CSS alias.
- Improve the focused scanner so it separates old sample/demo refs from real app missing links.

Safety rule remains:

- No deletes.
- No live/index promotion.
- No Supabase writes.
- Keep using focused scanner only for the current app scope.
