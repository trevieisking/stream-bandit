# Stream Bandit Admin Overlay + Search Fixes — V7.12.156

## Status

The Admin helper group normal pages and two special overlay-route pages have passed after direct old-route repair.

## Passed normal Admin helper pages

- `test-checklist-global-helpers-v7-10-5-test.html`
- `health-check-global-helpers-v7-10-6-test.html`
- `mux-manager-global-helpers-v7-10-7-test.html`
- `storage-prep-global-helpers-v7-10-8-test.html`
- `backup-safety-global-helpers-v7-10-9-test.html`

## Passed special overlay-route pages

- `live-readiness-global-helpers-v7-10-2-test.html`
- `all-pages-version-registry-v7-1-4-full-test.html`

## Important proven fix

The menu overlay behaves correctly when the real page lives directly on the URL the overlay expects.

Broken pattern:

- Old URL is only a wrapper, loader, shim or iframe.
- Real page is on another URL.
- Overlay current-page recognition and menu scroll can become unreliable.

Working pattern:

- Keep the old menu URL.
- Put the full real page directly on that old URL.
- Remove wrapper/iframe/loader behaviour unless absolutely required.
- Use the passed shell/header/footer pattern.

## Five page rules still apply

1. Keep the old menu URL on promotion.
2. No new pages unless unavoidable; scan and reuse old/current route.
3. Safe useful actions only; remove controls that should never unlock.
4. Use the passed global shell/header/footer/icon pattern.
5. Current route links only.

## Search fallback rule added

The global helper loader alone can fall back to the older movie-only search path. That can make the overlay show only `sb_movies` results.

Permanent rule:

- `stream-bandit-global-helper-loader-v7-12-126.js`
- `live-readiness-search-supabase-fallback-v7-12-130.js`

must travel together on repaired/global pages.

The full fallback searches and renders:

- movies
- genres
- channels
- playlists
- collections
- site pages
- current route/page text

## Theme ownership rule

Global theme ownership remains with:

- `web-builder-theme-studio-controls-v7-8-9-test.html`

Other pages should listen through shared/global helpers. They should not become the theme owner.

## Fixes completed after this checkpoint

- Live Readiness wrapper removed and full page placed directly on `live-readiness-global-helpers-v7-10-2-test.html`.
- Version Registry loader/shim removed and direct page placed on `all-pages-version-registry-v7-1-4-full-test.html`.
- Full search fallback restored on both pages after the direct-page rebuild.
- Search overlay results restored beyond movie-only results.

## Remaining Admin special page

Next page:

- `admin-centre-command-deck-v7-12-121-test.html`

Expected work:

- Scan before changing.
- Preserve old/current Admin Centre menu URL.
- Apply direct-page shell/header/footer/search fallback rule.
- Ensure menu overlay recognises Admin Centre correctly.
- Ensure icons match the passed pages.
- Ensure all buttons point to current routes.
- Ensure only safe useful actions are shown.
