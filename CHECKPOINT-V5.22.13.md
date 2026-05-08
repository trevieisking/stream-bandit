# Stream Bandit V5.22.13 Stable Checkpoint

Current stable checkpoint:

`Stream Bandit V5.22.13 - Supabase Details Buttons Polish Live`

## Live app

Live entry file:

`index.html`

Current live title:

`Stream Bandit V5.22.13 Stable`

Live GitHub Pages route:

`https://trevieisking.github.io/stream-bandit/`

## What was completed today

### 1. Player controls and sound booster stabilised

The player conflict was resolved by keeping the clean V5.21.12 player setup live.

Current player rule:

- Custom Stream Bandit volume overlay is the main volume control.
- Sound Booster boost selector controls accessibility/louder-audio boost.
- Native browser/player volume bar can be ignored.
- Old V5.11.9 Sound Booster remains removed from live because it caused the native player volume to snap back to maximum.

Live player scripts:

- `assets/stream-bandit-v5-21-5-player-comfort-fixed.js`
- `assets/stream-bandit-v5-21-12-clean-player-controls.js`

### 2. Supabase trailer display fixed and promoted

V5.22.1 fixed the issue where a trailer/extra link saved through Supabase Movie Manager did not appear on the Supabase Details Trailer tab.

Live trailer fix script:

- `assets/stream-bandit-v5-22-1-supabase-trailer-details-fix.js`

Confirmed result:

- Movie Manager trailer/extra link saves correctly.
- Supabase Details Trailer tab now displays the trailer instead of showing `No trailer added yet` when a saved trailer URL exists.
- Fix is read-only and does not update Supabase rows.

### 3. Supabase Details tidy testing completed

Several Details tidy tests were tried to improve the Overview card layout. The final working decision was:

- Keep the restored Supabase Details layout.
- Do not move the Year, Rating, Runtime, Age rating or Source boxes for now.
- Do not rebuild the Details card with hard-coded overlay rows.
- Only make the `Play / Resume` and `Back to Library` buttons bigger and neater.

The abandoned test routes/scripts should be treated as old experiments, not stable code:

- `index-v5-22-2-details-tidy-test.html`
- `index-v5-22-3-details-action-test.html`
- `index-v5-22-4-details-compact-test.html`
- `index-v5-22-5-details-info-strip-test.html`
- `index-v5-22-6-details-info-row-test.html`
- `index-v5-22-7-details-horizontal-row-test.html`
- `index-v5-22-8-details-row-polish-test.html`
- `index-v5-22-9-details-force-row-test.html`
- `index-v5-22-10-details-clean-cards-test.html`
- `index-v5-22-11-details-simple-row-test.html`
- `index-v5-22-12-details-restore-test.html`

Important lesson:

The info boxes should not be moved with patch overlays. If they are tidied later, the proper fix should happen inside the real Supabase Details render, not through post-render layout patches.

### 4. Supabase Details buttons polish promoted live

V5.22.13 was tested and promoted live.

Live Details polish script:

- `assets/stream-bandit-v5-22-13-details-buttons-only.js`

Confirmed result:

- Supabase Details restored layout remains intact.
- `Play / Resume` button is larger and cleaner.
- `Back to Library` button is larger and cleaner.
- Trailer tab still works.
- Player still works.

## Current live scripts after V5.22.13

Live `index.html` now loads:

- `assets/stream-bandit-app.js`
- `assets/stream-bandit-v5-5-1-supabase-cast-manager.js`
- `assets/stream-bandit-v5-6-menu-organiser.js`
- `assets/stream-bandit-v5-6-2-settings-logo.js`
- `assets/stream-bandit-v5-11-8-final-boss-controller.js`
- `assets/stream-bandit-v5-12-1-manager-layout-hotfix.js`
- `assets/stream-bandit-v5-14-6-live-tools-link.js`
- `assets/stream-bandit-v5-21-3-backup-tidy-overlay.js`
- `assets/stream-bandit-v5-21-5-player-comfort-fixed.js`
- `assets/stream-bandit-v5-21-12-clean-player-controls.js`
- `assets/stream-bandit-v5-22-1-supabase-trailer-details-fix.js`
- `assets/stream-bandit-v5-22-13-details-buttons-only.js`

## Current live Tools setup

Live Tools page remains:

`tools-v5-20-2.html`

Live Tools link script remains:

`assets/stream-bandit-v5-14-6-live-tools-link.js`

## Full current menu page list

### Watch (7)

- Home
- Continue Watching
- Library
- Watchlist
- Accessibility
- Favourites
- Supabase Library

### Browse (6)

- Genres
- Watch History
- Channels
- Collections
- Playlists
- My Channel

### Supabase (4)

- Supabase Manager
- Supabase Test
- Live Readiness
- Supabase Migration

### Mux (2)

- Mux Manager
- Upload Plan

### Storage (3)

- Local Storage
- Storage Prep
- Backup / Safety

### Admin Tools (10)

- Tools Page
- Liked
- Submit Video
- Rules
- Review Queue
- Health Check
- Quality Tools
- Test Checklist
- Admin
- Settings

## Pages already tidied or recently stabilised

These should be treated as good reference pages for tabbed tidy style:

- Supabase Details
- Stream Bandit Tools
- Settings
- Admin
- Backup Centre / Backup Safety
- Supabase Movie Manager

## Tomorrow's recommended plan

Continue one page at a time. Use the same safe route:

1. Create a test route only.
2. Do not touch live.
3. User smoke-tests the page.
4. Promote only after it passes.
5. Add a checkpoint note.

Suggested first tidy target for tomorrow:

`Accessibility`

Reason:

- It still contains older player comfort/audio boost wording.
- It should be updated to match the current V5.21.12/V5.22.13 player setup.
- It should explain that custom Stream Bandit volume overlay is the main volume control and Sound Booster controls accessibility boost.

Suggested next targets after Accessibility:

1. Favourites / Watchlist / Liked count polish.
2. Continue Watching and Watch History tidy.
3. Genres, Channels, Collections, Playlists and My Channel tidy.
4. Supabase Test, Live Readiness and Supabase Migration cleanup.
5. Mux Manager and Upload Plan cleanup.
6. Storage pages cleanup.
7. Admin Tools pages cleanup.

## Do not use / old notes no longer needed

The following are no longer recommended as the active approach:

- Details overlay patches that move Year/Rating/Runtime/Age/Source boxes after render.
- Generated hard-coded info-card rows for Details Overview.
- Old V5.11.9 Sound Booster live path.
- Any approach that embeds many helper tools back into active pages instead of the standalone Tools page.

## Safe rollback notes

If anything goes wrong after V5.22.13, the last known safe fallback is:

`V5.22.1 - Supabase Trailer Details Fix Live`

That version kept:

- clean player controls,
- trailer fix,
- no Details buttons polish.

Rollback would mean removing this line from live `index.html`:

`assets/stream-bandit-v5-22-13-details-buttons-only.js`
