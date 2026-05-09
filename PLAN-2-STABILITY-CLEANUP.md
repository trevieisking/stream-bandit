# Stream Bandit Plan 2 — Stability, Simplification, Polish

Checkpoint date: 2026-05-09

## Current Stable Live Checkpoint

**Live version:** V5.39.3 Stable Menu Safe

**Live page:** https://trevieisking.github.io/stream-bandit/

## Confirmed Passed Manual Tests

The following live checks passed after removing the broken Storage/menu click script:

- Menu safe
- Storage standalone page
- Tools standalone page
- Mux route
- Player quick test
- Continue Watching
- Details route and Back to Library
- Watchlist
- Favourites
- Likes
- Admin fields typing
- Accessibility save
- Search
- Submit page
- Channels
- Collections
- Playlists
- Genres
- My Channel
- About
- Supabase Library
- Supabase Details and Play
- Logout/login

## Known Notes for Later Polish

These are not blockers for the stable checkpoint:

- Continue/player can be slow when buffer starvation hits.
- Collections has a tab/route issue.
- Supabase Manager button can route Home.
- Watchlist has wording such as "Open Library" that needs polish.
- Storage and Tools should stay standalone for now.
- Backup/Safety old in-app route caused menu chaos and should not be patched live again without a separate test page.

## Current Safe Standalone Pages

- Storage Centre: `storage-v5-39.html`
- Lite Backup: `backup-v5-37-8-lite.html`
- Tools Centre: `tools-v5-24-1.html`

## Hard Rules Going Forward

1. Keep live stable first.
2. Use separate test pages before touching live menu or routing.
3. Do not add broad global click handlers on live.
4. Do not patch HLS internals directly.
5. Do not touch player controls, Final Boss, volume, playbar, or Supabase writes unless the exact bug requires it.
6. Prefer standalone pages for heavy tools, backup, storage, audits, and managers.
7. Use the admin Report bubble and Copy Short reports for debugging.

## Plan 2 Route

### Phase 1 — Stabilise

- Keep V5.39.3 as the stable live checkpoint.
- Avoid new live menu surgery.
- Keep Storage and Tools standalone.

### Phase 2 — Simplify Navigation

- Build a new clean standalone navigation model on a test page.
- Replace crowded old groups with simple links only after testing.
- Target final simple routes:
  - Home
  - Library
  - Watchlist
  - Favourites
  - Likes
  - Continue Watching
  - Channels
  - Collections
  - Playlists
  - Genres
  - My Channel
  - Submit
  - Admin
  - Accessibility
  - About
  - Tools Centre
  - Storage Centre
  - Mux Manager / Mux Centre

### Phase 3 — Page-by-page Cleanup

For each page:

1. Test current route.
2. Note broken buttons/wording/layout.
3. Create a small test patch.
4. Test separately.
5. Promote only after pass.

### Phase 4 — Polish

- Convert messy sections into neat tabs.
- Make standalone pages visually consistent.
- Add clear Back to Stream Bandit buttons where needed.
- Remove or mark old legacy scripts only after a stable replacement exists.

## Current Priority

Do not divert. Priority is now:

**Stability → Simplify → Page-by-page polish.**
