# Stream Bandit Watch Area Fix Pattern — V6.34

Checkpoint recorded after Player V6.34 passed.

## Passed Watch pages so far

1. Home — `home-watch-shell-v6-32-test.html` — passed
2. Details — `details-watch-shell-v6-33-test.html` — passed
3. Player — `player-watch-shell-v6-34-test.html` — passed

## Repeat fix pattern for remaining Watch-area pages

For each remaining Watch page, check and fix the same recurring issues:

### 1. Shared search overlay
- Top-right search must show overlay results while typing.
- Movie-aware results must appear.
- Page results must appear.
- Enter/Search must open `global-search-menu-upgrade-v6-27-test.html` in the same tab.
- Do not use old `global-search-v5-80-test.html`.
- Do not open a new browser tab.

### 2. Auth/Profile shell
- Account chip must appear under the Stream Bandit logo/brand area.
- Must show signed-out or signed-in state.
- Signed-in state must read from Supabase Auth + `sb_profiles`.
- Role/admin state must display.
- Do not use legacy/localStorage profile as the main source.

### 3. Current route links only
- Details links should use `details-watch-shell-v6-33-test.html` or the current Details rescue route.
- Player links should use `player-watch-shell-v6-34-test.html` or the current Player rescue route.
- Avoid old standalone routes such as `watch-standalone-v5-46-test.html`.
- Avoid old Details routes where the Watch shell standard is required.

### 4. Old Settings Studio / admin route protection
- Watch-area pages must not open old Settings Studio routes directly.
- Settings Studio can be listed in the shared menu, but page-level buttons should be locked/removed unless that area has been audited.
- Avoid old Supabase Manager/Edit routes from Watch pages unless deliberately planned later.

### 5. Page-specific content must stay useful
- Home: Supabase rows, cards, Details/Play actions, tabs.
- Details: movie metadata, trailer kept inside Trailers tab, Cast tab clear even if no cast data exists, More Like This uses current player route.
- Player: video playback, volume, audio boost, fullscreen, PiP, playback monitor, no fake Up Next.
- Remaining Watch pages should keep their own main feature while adopting the same shell/search/auth route standards.

### 6. Safety
- No live `index.html` edit.
- No live promotion.
- No publish/delete/migration/clear action.
- No accidental Supabase writes from read-only Watch tests.
- Registry update waits until the whole Watch area passes.

## Next remaining Watch pages

4. Continue Watching
5. Watch History
6. Watchlist
7. Favourites
8. Liked
9. Accessibility

Registry/page map update is deliberately held until the whole Watch area is complete.
