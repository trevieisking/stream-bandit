# Stream Bandit Plan 4 Detailed Checkpoint

Status after Channels audit review and Trevor's channel / collection playback note.

## Current state

Plan 4 is a link + layout audit. Nothing is promoted live yet.

Passed functionally: 12 / 32.

Clean layout pass: 11 / 32, because Genres works but needs Tools Page-style layout polish before RC.

Current next page: Collections.

Live promotion: No. Do not edit live index.html until the release candidate passes and Trevor explicitly says promote live.

## Passed / reviewed pages

1. Home — passed.
2. About — passed.
3. Continue Watching — passed.
4. Library — passed.
5. Watchlist — passed.
6. Accessibility — passed.
7. Favourites — passed.
8. Liked — passed.
9. Supabase Library — passed.
10. Genres — functional pass after V5.57.3. Open Genre and Filter Movies intentionally use the same safe in-page filter behaviour for this audit. Important: Trevor flagged that the page no longer visually matches the Tools Page-style layout well enough. Mark as layout polish needed before release candidate.
11. Watch History — passed as safe read-only audit. Screenshots show 0 matched history/progress rows and Read Audit rows for inspected local/browser keys. This is a valid safe empty-state/read-audit pass.
12. Channels — passed for the current read-only Plan 4 link/layout audit. Important: Trevor noted the final/live behaviour must restore Open Channel and Play All on channel cards.

## Current notes from Trevor screenshots and review

- Detailed Checkpoint button opens the Markdown file correctly, but it appears as plain text on GitHub Pages. Later make a styled HTML checkpoint page if we want it to look like the app.
- Genres page works but must be visually polished back toward Tools Page-style layout before RC.
- Watch History Read Audit is acceptable: it inspected local/browser keys and found no current history/progress data in this browser.
- Channels current audit page does what it promised, but final channel behaviour must restore live-app controls: Open Channel and Play All.
- Collections likely need the same final/live behaviour: Open Collection and Play All.

## Queue / playback navigation requirement for later

Trevor confirmed this live-app behaviour must be restored later, not necessarily during the read-only page audit:

- Channel cards need Open Channel.
- Channel cards need Play All.
- Collection cards need Open Collection.
- Collection cards need Play All.
- Playlist pages need Play All / queue behaviour.
- Watchlist pages need queue-style playback behaviour where appropriate.
- Channel / Collection / Playlist / Watchlist queued playback should show Next and Previous.
- Single-title playback should not show Next and Previous.
- This belongs in later safe route/player/queue wiring, after link/layout audits or when the relevant page intentionally receives action/route wiring.

## Next audit order

Next page: Collections.

Then continue in this order:

1. Collections
2. Playlists
3. My Channel
4. Supabase Manager
5. Supabase Test
6. Live Readiness
7. Supabase Migration
8. Mux Manager
9. Upload Plan
10. Local Storage
11. Storage Prep
12. Backup / Safety
13. Tools Page
14. Submit Video
15. Rules
16. Review Queue
17. Health Check
18. Test Checklist
19. Admin
20. Settings

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

### Layout polish before RC

- Genres needs visual layout polish to match the Tools Page-style layout again.
- Consider making PLAN4-DETAILED-CHECKPOINT.md into a styled HTML checkpoint page, because the Markdown page looks like plain text when opened from GitHub Pages.

## Final phase order

1. Finish link + layout audit.
2. Fix any layout-polish holds such as Genres.
3. Build app-shell-plan3-test.html with WATCH, BROWSE, SUPABASE, MUX, STORAGE and ADMIN TOOLS.
4. Shell smoke test, including global search.
5. Core playback smoke test.
6. Safe action wiring.
7. Queue/player route wiring for Open Channel, Open Collection, Play All, queued Next/Previous and single-title no Next/Previous.
8. Artwork cleanup.
9. Release candidate test file.
10. Promote live only after Trevor says all RC checks passed and says promote live.

## Restart note

Continue with Collections Plan 4 Link + Layout Audit. Do not promote live. Keep the page read-only and test-only.