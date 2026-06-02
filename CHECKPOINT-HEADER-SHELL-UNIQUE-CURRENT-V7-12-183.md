# Stream Bandit Checkpoint — V7.12.183 Header Shell Unique Current Pass

Date: 2026-06-02

## Status

Header shell duplicate-current route fix passed in browser testing.

## File changed

- `stream-bandit-header-shell-v7-12-156.js`

## Commit

- `3bed5948f0ca9858de459a24daf62196ed8b1f48`

## Reason for fix

The overlay current-marker was not broken. The map had multiple active menu entries pointing to the same URL, so the shell correctly marked every matching entry as Current.

This checkpoint records the route-map correction before the Brand Image Helper and Favicon/App Icon Builder page-shell cleanup continues.

## Browser pass confirmed by user

### Health Check / Route Guard Proof

- Open Health Check: PASS
- Open overlay: PASS
- Health Check is Current: PASS
- Route Guard Proof removed from Owner: PASS

### Settings Hub / Platform Control Centre

- Open Settings Hub: PASS
- Open overlay: PASS
- Settings Hub is Current: PASS
- Platform Control Centre is not Current: PASS

### Web Builder / Web Builder Studio

- Open Web Builder: PASS
- Open overlay: PASS
- Web Builder is Current: PASS
- Web Builder Studio removed from Owner: PASS

### Brand / App Icons

- Open Brand / App Icons: PASS
- Open overlay: PASS
- Only Brand / App Icons is Current: PASS

## Header shell route correction

Removed active duplicate-current entries:

- Route Guard Proof
- Owner Web Builder Studio

Restored separate real routes:

- Platform Control Centre -> `platform-control-centre-combined-v7-12-61-test.html`
- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

Kept correct active routes:

- Health Check -> `health-check-global-helpers-v7-10-6-test.html`
- Settings Hub -> `settings-platform-control-hub-v7-12-85-test.html`
- Web Builder -> `web-builder-live-studio-v7-12-116-test.html?page=test-page`
- Brand / App Icons -> `settings-brand-icons-promoted-v7-12-21-test.html`

## Current header shell state

Expected header shell internal state after the pass:

- `activeEntries: 51`
- Duplicate current markers resolved for Health/Route Guard, Settings/Platform Control, Web Builder/Web Builder Studio, and Brand/App Icons.

## Remaining known issue after this checkpoint

The Brand Image Helper and Favicon/App Icon Builder menu entries now point to separate real route files, but the target pages still behave like older standalone/alias pages.

Remaining tasks, one file at a time:

1. `brand-logo-helper-responsive-v7-12-20-test.html`
   - Add current global header shell.
   - Add current global footer shell.
   - Keep the existing Brand Logo Helper content.
   - Ensure opening from overlay stays on Brand Image Helper and marks only Brand Image Helper as Current.

2. `favicon-app-icon-builder-v7-12-15-test.html`
   - Add current global header shell.
   - Add current global footer shell.
   - Keep preview-only icon builder functionality.
   - Ensure opening from overlay stays on Favicon / App Icon Builder and marks only Favicon / App Icon Builder as Current.

## Safety rule for next work

Do not touch registry, footer, manifest, index or One Machine until the two page-shell fixes pass in browser testing.

If a page fix fails, roll back to this checkpoint commit state and restore the header shell commit above.
