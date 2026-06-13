# CHECKPOINT — SAVED / COMFORT CLEAN NAVIGATION GROUP PASS V7.12.277

Date: 2026-06-13

## Carry-on point

`V7.12.277 Saved / Comfort Clean Navigation Group Pass`

This checkpoint records the full passed polish group for saved pages, Details, Continue Watching, and Accessibility comfort/theme bridge.

Use this as the carry-on point before moving into the next public browse-page polish group.

## User-confirmed passed pages

### Details

File:

`details-clean-machine-v7-12-38-test.html`

Passed state:

`V7.12.173 Details · Clean Navigation`

Commit:

`db84d50d87a75147205ea6030bfc5eb9b83bce01`

Confirmed:

- Header / footer / account chip passed.
- Top rail remains the page navigation area.
- Duplicate Library button removed from Movie actions.
- Play remains as the real movie action.
- Refresh Details remains as a real page action.
- Watchlist / Favourite / Like save buttons remain working.
- Full `sb_movies` Details output remains working.
- Tabs, cast cards, source info, ownership, related titles, and debug remain working.

### Continue Watching

File:

`continue-watching-global-helpers-v7-3-9-test.html`

Passed state:

`V7.12.230 Continue Watching · Clean Navigation`

Commit:

`b74df0f98334cab44b081efa72cf0baa1590ffd0`

Confirmed:

- Header / footer / account chip passed.
- Top rail remains the page navigation area.
- Duplicate Player 1 / Watch History / Library buttons removed from hero.
- Reload Continue Rows remains as the real page action.
- Read-only local progress behavior preserved.
- Duplicate progress-row dedupe preserved.
- Resume opens Player 1 correctly.
- Details opens the correct movie.
- Save buttons and counts remain working.

### Watchlist

File:

`watchlist-clean-machine-v7-12-43-test.html`

Passed state:

`V7.12.159 Watchlist · Clean Navigation`

Commit:

`0f785addcbb9d5666e8717d862cc45c43d648c64`

Confirmed:

- Header / footer / account chip passed.
- Top rail only; no duplicate hero route buttons.
- Reload Watchlist works.
- Saved Titles tab passed.
- Summary tab passed.
- Rules tab passed.
- Search filter works.
- Sort dropdown works.
- Details opens the right movie.
- Play opens Player 1 on the right movie.
- Save buttons and counts still work.

### Favourites

File:

`favourites-clean-machine-v7-12-41-test.html`

Passed state:

`V7.12.159 Favourites · Clean Navigation`

Commit:

`92bf387ff63caac9803549c13c1688ca4e2255f4`

Confirmed:

- Header / footer / account chip passed.
- Top rail only; no duplicate hero route buttons.
- Reload Favourites works.
- Favourite Titles tab passed.
- Summary tab passed.
- Rules tab passed.
- Search filter works.
- Sort dropdown works.
- Details opens the right movie.
- Play opens Player 1 on the right movie.
- Save buttons and counts still work.

### Likes

File:

`likes-clean-machine-v7-12-42-test.html`

Passed state:

`V7.12.158 Likes · Clean Navigation`

Commit:

`c7549319486a64c51bdd6ff0ff21f50e458b5d12`

Confirmed:

- Header / footer / account chip passed.
- Top rail only; no duplicate hero route buttons.
- Reload Likes works.
- Liked Titles tab passed.
- Summary tab passed.
- Rules tab passed.
- Search filter works.
- Sort dropdown works.
- Details opens the right movie.
- Play opens Player 1 on the right movie.
- Save buttons and counts still work.

### Accessibility

File:

`accessibility-clean-machine-v7-12-44-test.html`

Passed state:

`V7.12.228 Accessibility · Clean Theme Bridge`

Commit:

`127af25e9c9d57d5e87fe67c6001d5b2d05fbcec`

Confirmed:

- Header / footer / account chip passed.
- Top rail clean navigation passed.
- Duplicate Test Player 1 hero route button removed.
- Stale Player 2 route link removed.
- Apply Preview works.
- Save Global Readability appears working.
- Overview tab passed.
- Theme Bridge tab passed.
- Player Comfort tab passed.
- State tab passed.
- Rules tab passed.
- Checklist tab passed.

## Clean navigation rule now locked

For this group and future public-page polish:

- Top rail owns page-to-page navigation.
- Hero keeps only the page's real actions.
- No duplicate `Library`, `Watchlist`, `Favourites`, `Likes`, `Continue`, `History`, `Player 1`, or `Details` links inside hero cards when those routes already exist in the top rail.
- No duplicate route-card tab when those routes already exist in the top rail.
- Internal tabs are content sections only.
- Outputs stay under the tabs they belong to.

## Saved page standard now locked

Saved/account pages should match the Home/Watchlist/Favourites/Likes standard:

- Header shell.
- Theme-controlled pill rail under header.
- Hero under the rail.
- Internal tabs below hero.
- Movie cards with Details, Play, and shared save buttons.
- Save counters through Core Saves and Menu Saves Count.
- Footer shell.
- No admin/delete/upload/billing/publish actions.

## Accessibility bridge rule now locked

Accessibility may save local readability comfort through the Theme Projector bridge:

- Text scale through `fontScale`.
- Contrast through the shared `line` variable.
- Local browser comfort profile through `streamBanditAccessibilityComfort`.
- No Supabase writes.
- No shell rewrites.
- No takeover of Theme Studio colours.
- Player audio boost remains owned by Player 1.

## Safety state for this checkpoint

No index promotion.

No schema changes.

No Supabase migrations.

No storage actions.

No billing/payment buttons.

No admin destructive controls added.

No global access-gate change.

## Current passed group list

- Home — PASS.
- Library — PASS.
- Details — PASS clean navigation.
- Player 1 — PASS.
- Continue Watching — PASS clean navigation.
- Watch History — PASS.
- Watchlist — PASS clean navigation.
- Favourites — PASS clean navigation.
- Likes — PASS clean navigation.
- Accessibility — PASS clean navigation / theme bridge.

## Next work order

Continue the public browse-page polish group:

1. Genres — `genres-clean-machine-v7-12-45-test.html`
2. Global Search — `global-search-global-helpers-v7-4-9-test.html`
3. About — `about-global-helpers-v7-4-7-test.html`

Then move into creator/group-play pages only after the browse group is clean.
