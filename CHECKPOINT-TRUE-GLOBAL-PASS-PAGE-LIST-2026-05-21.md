# Stream Bandit Checkpoint — True Global Pass Page List

Date/time note: saved around 2026-05-21 after the long run from yesterday 12pm UK time to about 1:45am.

## Correction

The bedtime summary understated the amount of work completed. The true list is larger than just Web Builder and Supabase Library.

The two hardest protected systems cleared were:

- Web Builder
- Supabase Library

But many other pages/routes had already been scanned, tested, promoted, or confirmed in the same wider run.

## Browse group / menu map pages covered

Browse group status from Trevor's menu list:

- Browse group
- Library
- Supabase Library
- Genres
- Global Search
- About

Important passed/current pages from this run and previous deep scan since 12pm UK time:

- Main Library: `library-global-helpers-v7-4-8-test.html`
- Supabase Library: `supabase-library-clean-editor-v6-93-3-test.html`
- Supabase Library route: `supabase-library-browse-shell-v6-43-test.html`
- Genres: `genres-global-helpers-v7-5-4-test.html`
- Genres route: `genres-browse-shell-v6-44-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About Us: `about-global-helpers-v7-4-7-test.html`

## Player and watch pages covered

Passed/current watch-player pages from the run:

- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2 target confirmed/used: `player-2-progress-helper-v6-78-9-4-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-global-helpers-v7-3-5-test.html`
- My Favorites: `favourites-global-helpers-v7-3-6-test.html`
- Liked: `likes-global-helpers-v7-3-7-test.html`

Important rule:

- Current Details route should be `details-global-helpers-v7-3-1-test.html`.
- Current Player 1 route should be `player-one-global-helpers-v7-3-3-test.html`.
- Current Player 2 global carry route should be `player-2-progress-helper-v6-78-9-4-test.html`.
- Player 2 queues should carry `streamBanditQueueV1`, `streamBanditUpNextV1`, and `streamBanditPlayer2Queue` where possible.

## Web Builder / forms covered

Web Builder and forms were part of the true passed set, not a side issue.

Passed/current pages:

- Web Builder structured editor: `web-builder-full-edit-lock-v7-8-6-test.html`
- Web Builder menu route: `web-builder-admin-shell-v6-57-test.html`
- Form Submit global page: `web-builder-form-save-v7-6-7-test.html`
- Old Form Save route now forwarding: `web-builder-form-save-v7-6-5-test.html`
- Form Answers viewer remains useful/current reference: `web-builder-form-viewer-v7-6-6-test.html`

Important form table:

- `public.sb_form_submissions`

Important form answer rule:

- form answers belong together inside `answers_json`
- do not save form answers one field at a time as separate partial records

## Creator / channel pages mentioned as done or already handled in wider scan

Trevor noted My Channel was done in the true list.

Known current/handled direction:

- My Channel/global route had already been part of the earlier deep scan/pass work
- Creator/channel pages should continue to be checked against the same current global-helper route standard

## Accessibility and supporting pages covered

- Accessibility: `accessibility-global-helpers-v7-4-2-test.html`

Accessibility remains especially important because Trevor needs louder/easier player comfort support.

## Pages Trevor explicitly listed as done earlier in this continuation

Trevor's earlier passed list:

- Home: `stream-bandit/home-global-helpers-v7-4-4-test.html`
- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-global-helpers-v7-3-5-test.html`
- My Favorites: `favourites-global-helpers-v7-3-6-test.html`
- Liked: `likes-global-helpers-v7-3-7-test.html`
- Accessibility: `accessibility-global-helpers-v7-4-2-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About Us: `about-global-helpers-v7-4-7-test.html`

Missed from that list and then completed in this session:

- Genres: completed and route promoted
- Supabase Library: completed properly as direct V6.93.3 and route promoted

## Big rule locked in

The menu overlay is the map.

After each page passes:

1. Check the matching route/menu target.
2. Promote only after Trevor's checklist passes.
3. Re-read the promoted route for final code check.
4. Save a checkpoint.

Do not promote live `index.html` until final RC, backup, full smoke test, and explicit approval.

## Why this note exists

The earlier checkpoint was useful but too narrow. The truer result is that since yesterday 12pm UK time, a large number of Stream Bandit global-helper pages, player routes, browse pages, form pages, and protected hard systems were scanned/tested/connected. This note preserves that larger context for tomorrow.
