# Stream Bandit Checkpoint — Owner Brand Route Truth Partial Pass V7.12.187

Date: 2026-06-02

## Status

Partial pass / much closer.

## What now works

After correcting the legacy shell bridge route truth, the Owner menu works correctly when opened from Home / normal app pages.

Confirmed behaviour:

- From Home page overlay/menu:
  - Brand / App Icons opens `settings-brand-icons-promoted-v7-12-21-test.html`.
  - Brand Image Helper opens `brand-logo-helper-responsive-v7-12-20-test.html`.
  - Favicon / App Icon Builder opens `favicon-app-icon-builder-v7-12-15-test.html`.

## Remaining issue

If the overlay/menu is opened from the Brand / App Icons page itself, Brand Image Helper and/or Favicon / App Icon Builder can still jump back to Brand / App Icons instead of their standalone pages.

This means the global route truth is now mostly fixed, but there is still a page-owned/local overlay/helper issue inside or loaded by:

- `settings-brand-icons-promoted-v7-12-21-test.html`

Likely remaining source area:

- page-local overlay/menu code,
- page-local route sanitizer,
- a script loaded only by the Brand / App Icons page,
- or stale in-page links generated after the global shell has already corrected routes.

## Files already corrected in this pass

- `stream-bandit-global-helper-loader-v7-12-126.js`
  - Updated to V7.12.186 Owner Brand Route Truth.
  - Added separate `brandHelper` and `faviconBuilder` route truth.

- `stream-bandit-shell-v6-24.js`
  - Updated to V7.12.187 Owner Brand Route Truth.
  - Stopped the legacy bridge from rewriting Brand Image Helper and Favicon Builder back to Brand / App Icons.

## Important note

Do not revert the V7.12.186 loader or V7.12.187 legacy shell bridge changes. They improved the app: opening the Owner overlay from Home now lands on the correct standalone pages.

Next scan should focus only on the Brand / App Icons page and any scripts it loads. Avoid another global shell rewrite unless the scan proves a global file is still involved.
