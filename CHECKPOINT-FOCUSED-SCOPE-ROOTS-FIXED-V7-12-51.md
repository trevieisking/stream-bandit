# Stream Bandit Focused Scope Roots Fixed V7.12.51

Date: 2026-05-25

Purpose: continue the app-fix path using Trevor's simple focused rule.

Must-use scanner:

`focused-keep-scope-scanner-v7-12-49-test.html`

Rule:

- Keep overlay menu pages.
- Keep global/settings/control pages.
- Keep buttons/tabs/child pages/helpers they lead to.
- Everything outside that focused app scope is Review / Not Needed Right Now.

Latest focused scanner result before this root fix batch:

- Repo files: 957
- HTML pages: 601
- Scope roots: 69
- Keep files: 388
- Keep pages: 364
- Review files: 351
- Missing in scope: 23

Fixes completed in this batch:

1. `player-two-clean-machine-v7-12-56-test.html`
   - Added as protected Player 2 route alias.
   - Protects Group Play / Player 2 menu path.

2. `favicon-app-icon-builder-v7-12-20-test.html`
   - Added as protected route alias.
   - Points to current favicon/app icon builder.

3. `brand-icons-favicon-v7-12-19-test.html`
   - Added as protected route alias.
   - Points to current Brand / App Icons page.

Expected next scanner change:

- The three Scope Root Missing rows should disappear.
- Missing In Scope should reduce from 23 by approximately 3, subject to any newly added helper references.

Remaining known Missing In Scope categories:

## Real/repeated logo fallback refs

- `stream_bandit_original_logo_square_256.png`
- `logo-1779203548544.png`

These are logo fallback / brand-helper related. The app usually replaces them through the brand logo helper, but the focused scanner still sees the hardcoded fallback strings.

## Scanner/report generated refs to filter later

- `stream-bandit-focused-keep-scope-v7-12-49.js`
- `stream-bandit-runtime-keep-graph-v7-12-41.js`
- `stream-bandit-runtime-keep-graph-v7-12-40.js`
- `stream-bandit-global-dependency-graph-v7-12-39.js`
- `stream-bandit-full-route-graph-v7-12-38.js`

These are not app pages; they come from report/download naming or scanner text and should be filtered, not treated as app dependencies.

## Old/sample media refs to review later

- `HLS.js`
- `test.html`
- `x.m3u8`
- `t.html`
- `row.js`

These should not drive live-app cleanup until separately reviewed.

Safety rule:

- No deletes.
- No live/index promotion.
- No Supabase writes.
- Continue with small verified fix batches only.
