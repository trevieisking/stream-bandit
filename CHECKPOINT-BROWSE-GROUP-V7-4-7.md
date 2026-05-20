# Stream Bandit Browse Group Checkpoint — V7.4.7

Date: 2026-05-20

## Passed / promoted

- About page promoted to `about-global-helpers-v7-4-7-test.html`.
- Old About route `about-browse-shell-v6-42-test.html` now forwards to About V7.4.7.

## Left stable intentionally

### Library

`library-browse-shell-v6-41-test.html`

- Already reads Supabase `sb_movies`.
- Save buttons work with Watchlist/Favourites/Likes.
- Details/Player use old route filenames, but the old route filenames now forward to current V7 routes.
- No rewrite during this pass.

### Supabase Library

`supabase-library-browse-shell-v6-43-test.html` -> `supabase-library-clean-editor-v6-93-0-test.html`

- Stable hard page must remain connected to Supabase at all costs.
- Failed V7.4.5 wrapper is parked and should not be promoted.
- Failed V7.4.6 direct rebuild is parked and should not be promoted.
- Do not patch/wrap this page.
- Future fix should be a tiny exact copy of the working original, with only Play All removed, or leave V6.93.0 stable.

### Genres

`genres-browse-shell-v6-44-test.html` -> `genres-direct-canonical-v6-90-12-test.html`

- Has Supabase read and genre write tools.
- Has Player 2 Play All.
- Do not alter casually.
- Future decision needed: keep as genre management page or create separate read-only Browse Genres page.

### Global Search

`global-search-admin-shell-v6-52-test.html`

- Read-only Supabase movie search.
- No writes.
- Details/Play use old filenames that now forward to current V7 routes.
- No rewrite during this pass.

## Rules locked

- Browse pages are discovery/listing pages by default.
- Supabase Library is browse/editor only and is not a group-play owner.
- Group Play belongs to Playlists, Channels, My Channel and Collections.
- Card Play opens Player 1.
- Details opens Details V7.3.1 through current route forwards.
- No live/index promotion until final RC, backup and Trevor approval.
