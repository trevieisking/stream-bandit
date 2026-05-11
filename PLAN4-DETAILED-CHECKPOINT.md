# Stream Bandit Plan 4 Detailed Checkpoint

Status after Playlists V5.60.4 passed.

## Current state

Plan 4 is a link + layout audit. Nothing is promoted live yet.

Passed functionally: 14 / 32.

Clean layout pass: 13 / 32, because Genres works but needs Tools Page-style layout polish before RC.

Current next page: My Channel.

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
12. Channels — passed for the current read-only Plan 4 link/layout audit. Important: final/live behaviour must restore Open Channel and Play All on channel cards.
13. Collections — passed after V5.59.4 layout fix. Scream Collection shows Scream 7 only when matched, no fake Library preview rows. Important: final/live behaviour should restore Open Collection and Play All.
14. Playlists — passed after V5.60.4. The test playlist starts closed, Open Playlist reveals the 3 real matched titles from sb_playlist_movies, and no fake Library preview rows are shown.

## Current notes from Trevor screenshots and review

- Detailed Checkpoint button opens the Markdown file correctly, but it appears as plain text on GitHub Pages. Later make a styled HTML checkpoint page if we want it to look like the app.
- Genres page works but must be visually polished back toward Tools Page-style layout before RC.
- Watch History Read Audit is acceptable: it inspected local/browser keys and found no current history/progress data in this browser.
- Channels current audit page does what it promised, but final channel behaviour must restore live-app controls: Open Channel and Play All.
- Collections passed after removing fake Library previews and fixing layout, but Trevor noted it needs the same exact starts-closed / open-reveals-real-items behaviour later.
- Library also needs this exact safe open/filter review later: no fake rows, no random titles in real groups, and open/filter controls should visibly do something useful.
- Trailer buttons should not open external YouTube/IMDb directly from collection/channel/playlist cards in the final app. Trailers should open from the Details page/player flow.
- Supabase screenshot for Playlists showed key tables: sb_playlists, sb_playlist_movies and sb_movies. V5.60.4 successfully mapped the 3 titles from sb_playlist_movies.

## Open-state / real-items cleanup requirement for later

Trevor confirmed this needs to be applied later where relevant:

- Collection cards/pages should start closed where an Open Collection button exists.
- Open Collection should reveal only real matched collection titles.
- Library groups/filters should be reviewed for the same safe behaviour: no fake rows, no random titles inside real groups, and buttons must visibly change/open/filter something.
- Playlist cards/pages now have the correct model: start closed, Open Playlist reveals real matched titles only.
- Do not use fake Library preview rows inside a real Collection or Playlist.

## Queue / playback navigation requirement for later

Trevor confirmed this live-app behaviour must be restored later, not necessarily during the read-only page audit:

- Channel cards need Open Channel.
- Channel cards need Play All.
- Collection cards need Open Collection.
- Collection cards need Play All.
- Playlist pages need Open Playlist.
- Playlist pages need Play All / queue behaviour.
- Watchlist pages need queue-style playback behaviour where appropriate.
- Channel / Collection / Playlist / Watchlist queued playback should show Next and Previous.
- Single-title playback should not show Next and Previous.
- This belongs in later safe route/player/queue wiring, after link/layout audits or when the relevant page intentionally receives action/route wiring.

## Trailer routing requirement for later

- Trailer access should route through the Details page/player flow.
- Avoid sending users straight out to YouTube/IMDb from cards on Collections, Channels, Playlists or similar pages.
- Details page should be the place to show the trailer option cleanly.

## Next audit order

Next page: My Channel.

Then continue in this order:

1. My Channel
2. Supabase Manager
3. Supabase Test
4. Live Readiness
5. Supabase Migration
6. Mux Manager
7. Upload Plan
8. Local Storage
9. Storage Prep
10. Backup / Safety
11. Tools Page
12. Submit Video
13. Rules
14. Review Queue
15. Health Check
16. Test Checklist
17. Admin
18. Settings

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
- Collections and Library need later open-state / real-items cleanup based on the V5.60.4 Playlist model.

## Final phase order

1. Finish link + layout audit.
2. Fix any layout-polish holds such as Genres.
3. Build app-shell-plan3-test.html with WATCH, BROWSE, SUPABASE, MUX, STORAGE and ADMIN TOOLS.
4. Shell smoke test, including global search.
5. Core playback smoke test.
6. Safe action wiring.
7. Open-state / real-items cleanup for Collections and Library using the V5.60.4 Playlist model.
8. Queue/player route wiring for Open Channel, Open Collection, Open Playlist, Play All, queued Next/Previous and single-title no Next/Previous.
9. Trailer routing through Details page/player flow.
10. Artwork cleanup.
11. Release candidate test file.
12. Promote live only after Trevor says all RC checks passed and says promote live.

## Restart note

Continue with My Channel Plan 4 Link + Layout Audit. Do not promote live. Keep the page read-only and test-only.