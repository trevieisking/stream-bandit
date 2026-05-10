# Stream Bandit Plan 4 Detailed Checkpoint

Status after Supabase Library audit passed.

## Current state

Plan 4 is a link + layout audit. Nothing is promoted live yet.

Passed: 9 / 32.

Current next page: Genres.

Live promotion: No. Do not edit live index.html until the release candidate passes and Trevor explicitly says promote live.

## Passed pages

1. Home — passed.
2. About — passed.
3. Continue Watching — passed.
4. Library — passed.
5. Watchlist — passed.
6. Accessibility — passed.
7. Favourites — passed.
8. Liked — passed.
9. Supabase Library — passed.

## Next audit order

Next page: Genres.

Then continue in this order:

1. Genres
2. Watch History
3. Channels
4. Collections
5. Playlists
6. My Channel
7. Supabase Manager
8. Supabase Test
9. Live Readiness
10. Supabase Migration
11. Mux Manager
12. Upload Plan
13. Local Storage
14. Storage Prep
15. Backup / Safety
16. Tools Page
17. Submit Video
18. Rules
19. Review Queue
20. Health Check
21. Test Checklist
22. Admin
23. Settings

## Locked Plan 4 rules

- No live index.html promotion until release candidate passes and Trevor says promote live.
- Keep pages test-only and read-only during the link/layout audit unless Trevor explicitly approves action wiring.
- No old sidebar hash-routing in the new shell.
- No duplicate future buttons.
- No broken 404 links.
- Use Tools Page-style layout: big hero, rounded buttons, pill tabs, one section open at a time, tidy cards/rows.
- Use sb_profiles, not old profiles.
- Protect accessibility, louder audio, sound boost, player-first layout and fullscreen comfort.
- Missing 1920 x 1080 artwork is later artwork cleanup, not page logic failure.

## Protected later work

### Global search

Trevor wants the old convenient top search bar available across pages. Build it later in the final shell/global header rather than patching it page by page.

### Saved actions

Wire these later in a safe action phase after layout/link audits:

- Add to Watchlist
- Remove from Watchlist
- Add to Favourites
- Remove from Favourites
- Like
- Unlike
- Continue Watching progress
- Safe remove/clear controls

### Real accessibility settings

Accessibility page passed as a checklist/comfort page. Later build real saved settings for:

- larger text
- high contrast/readability
- audio comfort
- player comfort toggles
- fullscreen/player-first comfort

### Artwork cleanup

Fix missing 1920 x 1080 images after page logic passes. Keep image fixes separate from page wiring.

## Final phase order

1. Finish link + layout audit.
2. Build app-shell-plan3-test.html with WATCH, BROWSE, SUPABASE, MUX, STORAGE and ADMIN TOOLS.
3. Shell smoke test, including global search.
4. Core playback smoke test.
5. Safe action wiring.
6. Artwork cleanup.
7. Release candidate test file.
8. Promote live only after Trevor says all RC checks passed and says promote live.
