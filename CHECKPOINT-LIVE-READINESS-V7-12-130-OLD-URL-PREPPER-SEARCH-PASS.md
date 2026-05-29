# CHECKPOINT - LIVE READINESS V7.12.130 OLD-URL PROMOTION + PREPPER SEARCH PASS

Date: 2026-05-29
Project: Stream Bandit
Area: Admin group / Globals / Live Readiness
Status: PASSED

## Summary

Live Readiness is now passed on the old menu-recognised URL while running the current V7.12.129/V7.12.130 behaviour.

The old URL remains:

`live-readiness-global-helpers-v7-10-2-test.html`

The passed backup/test page remains:

`live-readiness-global-helpers-v7-12-129-test.html`

This pass followed the new project rule: preserve old menu-recognised URLs when the shell expects them, but bring the passed current behaviour onto that URL with page-level helpers or a safe bridge. The protected shell was not edited.

## Main goal of this pass

This pass is part of the current global/admin run-through:

1. Add/confirm globals: global shell, page helpers, menu overlay, footer, avatar/account chip, header icons and search overlay.
2. Remove or bypass stale button routes without breaking old menu-recognised URLs.
3. Unlock useful owner/admin actions while keeping dangerous live/schema/payment actions blocked.
4. Keep the protected all-in-one shell untouched unless explicitly approved later.

## Files changed during this pass

### Passed Live Readiness test page

`live-readiness-global-helpers-v7-12-129-test.html`

Purpose:
- Current Live Readiness test page.
- Loads current global shell/helpers.
- Provides release gates, route checks, owner actions, checklist, debug and footer.
- Keeps dangerous actions locked as status checks only.

### Search fallback helper

`live-readiness-search-supabase-fallback-v7-12-130.js`

Purpose:
- Page-level Supabase/site prepper search fallback.
- Reads with public/publishable Supabase access only.
- Does not write to Supabase.
- Does not touch payments.
- Does not edit shell or index.

Search coverage:
- `sb_movies`
- generated genre rows from movie genres
- `sb_channels`
- `sb_playlists`
- `sb_collections`
- `sb_site_pages`
- current route/page text
- menu/footer/page links

### Live Readiness page bridge/helper

`live-readiness-page-fix-v7-12-129.js`

Purpose:
- Keeps avatar winning over logo/brand helper.
- Loads the V7.12.130 Supabase search fallback.
- Marks Live Readiness current in the overlay menu.
- Final fix removed page-helper scroll grip so the menu can scroll freely.

Final scroll behaviour:
- No page-helper `scrollIntoView()` remains.
- No repeated forced scroll.
- No observer scroll grip.
- No interval scroll grip.
- Base shell may perform its own normal open-positioning.
- Manual menu scrolling is now free.

### Old URL promotion bridge

`live-readiness-global-helpers-v7-10-2-test.html`

Purpose:
- Preserves old menu-recognised URL.
- Loads passed V7.12.129 page in a full-page frame.
- Address bar stays old URL.
- Menu recognises Live Readiness as current.

## Successes confirmed by user

### Old URL / menu recognition

- Old URL stays in address bar: PASS
- Passed Live Readiness appears: PASS
- Menu recognises Live Readiness as current: PASS
- Menu opens: PASS
- Menu auto positioning works enough to locate Live Readiness: PASS
- Menu can now scroll freely after final scroll-grip removal: PASS

### Avatar/account

- Account chip appears: PASS
- Avatar appears: PASS
- Avatar remains after helper pass: PASS

### Search overlay

- Search overlay opens: PASS
- Search overlay returns movie/Supabase results: PASS
- Prepper overlay behaviour passed: PASS
- Search coverage expanded beyond movie-only to include Supabase movies, genres, channels, playlists, collections, site pages and route/page text.

### Live Readiness page controls

- Footer links: PASS
- Tabs: PASS
- Run Final Gate Scan: PASS
- Owner actions: PASS
- Locked live/schema/payment checks: PASS

### Safety rules confirmed

- No protected shell edit: PASS
- No index promotion: PASS
- No Supabase writes: PASS
- No payment code: PASS
- No destructive action: PASS

## Failures / problems found and fixed

### Problem 1 - Old URL vs new URL mismatch

Issue:
- New Live Readiness page worked, but the overlay menu still expected the old URL.
- If only the new URL was used, menu recognition could fail.

Fix:
- Preserve old URL `live-readiness-global-helpers-v7-10-2-test.html`.
- Load passed V7.12.129 page inside the old URL bridge.

Result:
- Old URL stays in address bar.
- Menu recognises Live Readiness as current.

### Problem 2 - Avatar missing

Issue:
- Account chip appeared, but avatar image did not reliably win over brand/logo helpers.

Fix:
- Page-level helper applies avatar last and repeats avatar refresh safely.

Result:
- Avatar appears and remains.

### Problem 3 - Search overlay missing or wrong

Issue:
- Initial search overlay either did not open or behaved like movie-only/global search.
- Needed wider search: movies, genres, site pages, channels, playlists, collections and tools/routes.

Fix:
- Added page-level capture search logic and then replaced it with direct Supabase REST fallback.
- Created `live-readiness-search-supabase-fallback-v7-12-130.js`.

Result:
- Search overlay opens and returns Supabase/movie results.
- It now acts as a prepper overlay for broader project navigation/search.

### Problem 4 - Search indexed many local results but not Supabase movies

Issue:
- Overlay showed indexed local/page results but movies were zero.
- Home page could find movie result, so Live Readiness needed the proven Supabase access pattern.

Fix:
- Added direct Supabase REST fallback using publishable key.
- Added movies, genres, channels, playlists, collections and site pages.

Result:
- User confirmed search returns movie/Supabase results.

### Problem 5 - Menu auto-scroll locked onto Live Readiness too aggressively

Issue:
- Helper scrolled to Live Readiness but then kept pulling the menu back like a pit bull.
- Manual scrolling became annoying or blocked.

Fix attempts:
1. Reduced repeated scrolls.
2. Removed MutationObserver grip.
3. Removed interval grip.
4. Final fix removed page-helper scroll entirely and left menu positioning to base shell only.

Final result:
- Menu opens.
- Menu can scroll freely.
- It no longer jumps back from Live Readiness helper.

## Final user-confirmed pass statement

User confirmed:

- open menu: PASS
- let it position itself: PASS
- scroll away manually: PASS
- it should not jump back from Live Readiness helper anymore: PASS

## Current rule learned from this pass

When a page is linked from the protected overlay menu:

1. Do not break the old menu-recognised URL.
2. Preserve the old URL when needed.
3. Bring passed new behaviour to that old URL page-by-page.
4. Use page-level helpers first.
5. Do not edit protected shell unless explicitly approved.
6. If helper scrolling is needed, make it one-time or let the shell own it.
7. Do not let helper code fight the shell.

## New reusable pattern

For future Admin pages:

- Old URL stays if shell/menu expects it.
- New behaviour can live in a backup/current test page.
- Old URL either hosts or frames the passed behaviour.
- Avatar/search/footer/header/menu helpers are added page-by-page.
- Useful buttons are unlocked as navigation/check tools.
- Dangerous actions remain blocked unless owner explicitly approves.

## Next page candidate

Next Admin group page should be Tools:

`tools-page-global-helpers-v7-10-1-test.html`

Reason:
- User uses it heavily.
- It is a loved/protected page historically.
- It should get careful read-only scan first.
- Main goals: globals, helpers, search overlay, footer/avatar/header icons, route cleanup, and useful action unlocking without cluttering Supabase Manager.

## Final checkpoint status

Live Readiness V7.12.130 old-url promotion and prepper search overlay is PASSED.

Do not regress:
- Old URL preservation.
- Avatar/account chip.
- Supabase prepper search.
- Free menu scrolling.
- No shell edit.
- No index promotion.
- No Supabase writes.
- No payments.
