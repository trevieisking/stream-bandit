# Stream Bandit Long-Term Roadmap

Last updated: 2026-05-09

## Current Live Baseline

**Live version:** V5.39.3 Stable Menu Safe

**Live URL:** https://trevieisking.github.io/stream-bandit/

Live is intentionally conservative after the Storage/menu incident and sidebar scroll rollback.

Current live `index.html` loads:

- HLS.js
- Supabase JS
- Stream Bandit base app
- report bubble and compact report
- buffer guard and dead-source guards
- Final Boss controller
- manager layout hotfix
- player comfort, accessibility, details, channel, collection, playlist, about and Supabase patches

The live stack does **not** currently include the failed sidebar preserve live promotion script.

## Current Safe Standalone Centres

These are the safe heavy-traffic routes that should be expanded before touching the live sidebar again.

### Control Centre

File: `control-centre-v5-41-test.html`

Status: Passed manual test.

Purpose:
- One clean route map for heavy traffic areas.
- Links Stream Bandit Home, Admin Centre, Storage Centre, Tools Centre and future Mux direction.
- Does not change live app logic.

### Admin Centre

File: `admin-centre-v5-40-test.html`

Status: V5.40.1 passed manual test.

Purpose:
- Safer replacement direction for old in-app Admin scroll tabs.
- Uses real standalone tabs.
- Does not save, upload, delete or edit anything by itself.

Known note:
- This is currently a route/planning/admin map, not a full replacement for the live Admin editor yet.

### Storage Centre

File: `storage-v5-39.html`

Status: Passed manual test.

Purpose:
- Standalone storage, backup and safety route.
- Bypasses old in-app Backup/Safety route that caused freezes/menu chaos.
- Reads browser storage and supports Lite Backup export.
- Does not restore, delete, upload, insert, update or write to Supabase.

### Tools Centre

File: `tools-v5-24-1.html`

Status: Passed manual test.

Purpose:
- Stable standalone tools route.
- Loads V5.20.2 full Tools page, then attaches V5.24.1 read-only Quality Tools tab add-on.
- Keeps Quality Tools/audits outside the live app to avoid conflicts.

## Current Known Issues

These are known and tracked. They should not cause panic unless they become worse.

1. **Sidebar/menu scroll jumps to top**
   - Long-standing issue.
   - V5.41.4 test passed, but live promotion behaved differently and was rolled back.
   - Do not try another direct live injection yet.
   - Future fix needs deeper sidebar/menu rebuild on a test page.

2. **Old in-app Admin tabs scroll wrong**
   - Root issue: Final Boss creates/controls old Admin manager tabs.
   - Standalone Admin Centre is the correct route instead of fighting the old anchors.

3. **Settings buttons are scroll anchors, not true tabs**
   - Stability passed.
   - Polish later.

4. **Collections route polish needed**
   - Collections passed.
   - One tab/route and Supabase Manager routing need cleanup.

5. **Submit Video route lacks clear Back to Home button**
   - Route passed.
   - Add later during polish.

6. **Continue/player can be slow on buffer starvation**
   - Player recovers and no JS errors were reported.
   - Keep current buffer/dead-source guards.
   - Do not patch HLS internals directly.

7. **Old Backup/Safety in-app route should remain legacy**
   - Storage Centre replaces it for now.

## Hard Rules

1. Keep live stable first.
2. Test page before live change.
3. No broad global click handlers on live.
4. No direct HLS internals patching.
5. Do not touch Final Boss, player controls, volume, playbar, Supabase writes or Mux logic unless the bug specifically requires it.
6. Heavy tools must stay standalone until a replacement is proven.
7. Use admin Report bubble / Copy Short reports for debugging.
8. Prefer small isolated patches over large rewrites.
9. If a live promotion behaves differently than test, rollback immediately.
10. When a fix fails, record what was learned and continue from the safest stable point.

## Long-Term Goal

Stream Bandit should become a clean, stable, accessible streaming-library front-end with:

- Supabase as the database and image storage route.
- Mux/HLS as the video delivery route.
- A reliable player with strong accessibility and audio boost.
- Standalone admin/storage/tools centres for heavy tasks.
- A simpler main app menu.
- Clean pages with real tabs where needed.
- A future consolidated V6 structure with fewer patch files.

## Roadmap Phases

## Phase 0 — Current Stable Freeze

**Status:** active

Goal:
- Protect V5.39.3 Stable Menu Safe.
- Do not add risky live scripts.
- Keep Storage, Tools, Admin and Control centres available as standalone routes.

Next action:
- Do not touch live until a specific isolated test passes.

Exit condition:
- A new tested improvement has passed on a separate page and has a rollback plan.

## Phase 1 — Control Centre First

**Goal:** Use `control-centre-v5-41-test.html` as the safe route map.

Steps:
1. Polish Control Centre text and route labels.
2. Add direct links for Admin Centre, Storage Centre, Tools Centre and Mux direction.
3. Add clear warning that live app remains stable and untouched.
4. Later create a tiny menu-safe test that links Control Centre from the app without changing old menu behaviour.

Do not:
- Replace the live sidebar yet.
- Add global click handlers.

Recommended next step:
- Create `control-centre-v5-41-1.html` polish test with clearer cards and a version badge.

## Phase 2 — Admin Centre Replacement Path

**Goal:** Gradually replace old in-app Admin scroll tabs with a standalone Admin Centre.

Steps:
1. Keep `admin-centre-v5-40-test.html` as the safe admin route map.
2. Add clear route cards for:
   - Movie rows
   - Add movie
   - Media / Mux
   - Genres / Tags
   - Cast & Crew
   - Review Queue
   - Health / Safety
3. Add Back to Control Centre and Back to Stream Bandit buttons.
4. Later, decide whether Admin Centre should remain a route map or become a real editor.
5. Only after that, link it from Control Centre or a tested app menu link.

Do not:
- Fight old Final Boss Admin anchors again unless replacing them in a controlled V6 build.

Recommended next step after Control Centre polish:
- Make `admin-centre-v5-40-2.html` with better cards and proper route labels.

## Phase 3 — Storage Centre Hardening

**Goal:** Make Storage Centre the official backup/storage/safety route.

Steps:
1. Keep old in-app Backup/Safety as legacy.
2. Improve Storage Centre tabs visually.
3. Keep Lite Backup export safe and simple.
4. Add clear “what this does not do” warnings.
5. Add a basic storage summary report copy option.
6. Later add safe restore flow only after separate testing.

Do not:
- Add restore/delete/upload features without a separate test page.

Recommended step:
- Make Storage Centre look like Control Centre/Admin Centre.

## Phase 4 — Tools Centre Hardening

**Goal:** Keep Quality Tools and audits isolated.

Steps:
1. Keep `tools-v5-24-1.html` as stable.
2. Avoid changing the stable fallback loader unless needed.
3. Later make a cleaner Tools Centre shell instead of relying on nested document.write fallback.
4. Keep all tools read-only unless explicitly testing writes.

Recommended step:
- Create a modern Tools Centre shell that links to existing stable tools, rather than rewriting tools immediately.

## Phase 5 — Mux Centre

**Goal:** Make video management clearer and safer.

Steps:
1. Create standalone Mux Centre test page.
2. Explain:
   - Public playback ID
   - HLS URL
   - Mux iframe/embed
   - where to paste into Admin
3. Keep secrets out of GitHub Pages.
4. Add copyable examples for HLS and Mux embed.
5. Later connect it to Admin Centre route map.

Do not:
- Add secret Mux upload tokens to the frontend.
- Add direct server-side upload features without a backend.

Recommended step:
- Build `mux-centre-v5-42-test.html` as an information/helper page.

## Phase 6 — Main Menu Rebuild

**Goal:** Fix the old sidebar/menu properly, not by fragile scroll patch.

Steps:
1. Create a separate menu rebuild test page.
2. Replace old grouped menu logic with simpler permanent groups:
   - Watch
   - Browse
   - My Stuff
   - Admin / Centres
3. Add Control Centre link.
4. Keep sidebar scroll position by design, not by after-the-fact restoration.
5. Test Home, Library, Collections, Admin, Settings, Control Centre, Storage and Tools.
6. Promote only after full pass.

Do not:
- Re-attempt the V5.41.6 live injection approach.
- Patch live sidebar with broad event handlers.

Recommended step:
- Build `index-v5-42-menu-rebuild-test.html` later, using fewer sidebar modifications.

## Phase 7 — Page-by-Page Polish

**Goal:** Make every page cleaner and easier.

Order:
1. Home
2. Library
3. Details
4. Watch/player
5. Continue Watching
6. Watchlist / Favourites / Likes
7. Channels
8. Collections
9. Playlists
10. Genres
11. My Channel
12. Submit Video
13. Review Queue
14. Settings
15. About

For each page:
1. Test current route.
2. Note broken wording/buttons/layout.
3. Create a small test patch.
4. Test separately.
5. Promote only after pass.

Known first polish items:
- Watchlist “Open Library” wording.
- Submit Video needs Back to Home.
- Collections/Supabase Manager routing.
- Settings tabs should become real tabs or clearer anchor buttons.

## Phase 8 — Player Stability and Accessibility

**Goal:** Keep player reliable and accessible.

Current working items:
- Buffer guard and dead-source recovery are live.
- Report bubble is live and useful.
- Accessibility/audio boost is important and must remain protected.

Steps:
1. Do not patch HLS internals directly.
2. Keep monitor/report tools admin-only where possible.
3. Optimise slow Continue/player recovery only after a repeatable report shows the issue.
4. Preserve audio boost, keyboard controls and larger controls.

Do not:
- Touch Final Boss/player/playbar/volume unless the exact test requires it.

## Phase 9 — Supabase / Data Health

**Goal:** Keep data clean and safe.

Steps:
1. Keep Supabase reads and writes as currently working.
2. Improve health checks in standalone tools.
3. Build safe duplicate/missing-source reports.
4. Keep public submissions URL-only unless backend changes.
5. Keep image upload on Supabase Storage.
6. Keep video on Mux/HLS/public URLs.

Do not:
- Add secrets to frontend.
- Add destructive database tools without confirmation and test page.

## Phase 10 — V6 Consolidation

**Goal:** Reduce patch chaos and merge stable features.

Steps:
1. Freeze a stable V5 checkpoint.
2. Inventory scripts loaded by `index.html`.
3. Mark scripts as:
   - core
   - required patch
   - legacy
   - standalone-only
   - test-only
4. Merge safe patches into cleaner modules.
5. Remove dead legacy routes only after backups.
6. Build a fresh V6 test page.
7. Run the full manual test sweep before live.

Do not:
- Rewrite everything at once.
- Remove scripts just because names are old; only remove after proving they are unused or replaced.

## Immediate Next Step

The next recommended task is:

**Create a polished Control Centre V5.41.1 test page.**

Why:
- It is safe.
- Control Centre already passed.
- It becomes the anchor for the whole cleanup plan.
- It avoids the risky old menu while giving clear navigation to Admin, Storage and Tools.

Test for next step:
1. Open Control Centre V5.41.1.
2. Open Admin Centre.
3. Return.
4. Open Storage Centre.
5. Return.
6. Open Tools Centre.
7. Return.
8. Back to Stream Bandit Home.

Expected result:
- All routes work.
- No live app changes.
- No menu-scroll risk.

## One-Line Project Rule

**Stabilise first, move heavy areas into standalone centres, then rebuild the menu and polish pages one at a time.**
