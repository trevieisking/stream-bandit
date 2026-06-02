# Stream Bandit Checkpoint — Owner Brand Route Truth Full Pass V7.12.188

Date: 2026-06-02

## Status

FULL PASS.

## Problem fixed

The Owner menu / overlay route truth for the Brand tools is now working correctly from both normal app pages and from the Brand / App Icons page itself.

## Confirmed working behaviour

From Home / normal app pages:

- Brand / App Icons opens `settings-brand-icons-promoted-v7-12-21-test.html`.
- Brand Image Helper opens `brand-logo-helper-responsive-v7-12-20-test.html`.
- Favicon / App Icon Builder opens `favicon-app-icon-builder-v7-12-15-test.html`.

From the Brand / App Icons page overlay itself:

- Brand / App Icons remains on `settings-brand-icons-promoted-v7-12-21-test.html`.
- Brand Image Helper now opens `brand-logo-helper-responsive-v7-12-20-test.html`.
- Favicon / App Icon Builder now opens `favicon-app-icon-builder-v7-12-15-test.html`.

## Root cause

Multiple route sanitizers were fighting the corrected shell route truth.

The final remaining blocker was:

- `live-readiness-search-supabase-fallback-v7-12-130.js`

That file was not just search. It also had a menu route sanitizer and still routed:

- Brand Image Helper -> Brand / App Icons
- Favicon / App Icon Builder -> Brand / App Icons

This only showed clearly when opening the overlay from `settings-brand-icons-promoted-v7-12-21-test.html`, because that page loads the Live Readiness search fallback directly.

## Files corrected across the pass

- `stream-bandit-global-helper-loader-v7-12-126.js`
  - V7.12.186 Owner Brand Route Truth.
  - Added separate route truth for Brand Image Helper and Favicon Builder.

- `stream-bandit-shell-v6-24.js`
  - V7.12.187 Owner Brand Route Truth.
  - Stopped the legacy shell bridge from rewriting Brand Image Helper and Favicon Builder back to Brand / App Icons.

- `live-readiness-search-supabase-fallback-v7-12-130.js`
  - V7.12.188 Owner Brand Route Truth.
  - Fixed the remaining menu sanitizer route labels, file rewrites, and global route exposure.

## Final route truth

- Brand / App Icons -> `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

## Safety notes

No Supabase writes were added.
No payment logic was touched.
No player engine logic was touched.
No broad shell rebuild was needed after the root cause was found.

## Do not regress

Do not restore any sanitizer mapping that sends Brand Image Helper or Favicon / App Icon Builder back to `settings-brand-icons-promoted-v7-12-21-test.html`.

These three Brand Owner routes must remain separate.
