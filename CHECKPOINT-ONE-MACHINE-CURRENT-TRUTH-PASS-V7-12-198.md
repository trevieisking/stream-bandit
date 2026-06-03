# Stream Bandit Checkpoint — One Machine Current Truth Pass V7.12.198

Date: 2026-06-03

## Status

PASS.

## Page

- `stream-bandit-one-machine-v7-12-73-test.html`

## Why this page was refit

One Machine is a read-only ownership and route map. It was safe to bring into the current flow pattern because it does not write to Supabase, does not edit Web Builder, does not promote live pages, and does not touch player/page-manager logic.

## Current shape

One Machine now uses:

- Header Shell
- Page Content
- Footer Shell
- Theme Projector
- Core Saves helper
- Menu Saves Count helper
- Search Fallback helper

## User test results

- Open One Machine: PASS
- Header appears: PASS
- Footer appears once: PASS
- Dashboard loads: PASS
- Manifest tab shows current route truth: PASS
- Brand Image Helper opens correctly: PASS
- Favicon / App Icon Builder works from overlay/footer: PASS
- Run Current Route Scan once: PASS
- Routes loaded shows 50/50: PASS
- Protected Files shows 16/16: PASS
- Copy Report works: PASS

## Route-scan result

Confirmed from user screenshot:

- Current route scan: `All current unique routes loaded: 50/50.`

## Protected-file result

Confirmed from user screenshot / copy report target:

- Protected files: `16/16`

Protected-file witness list aligns with the current registry:

- Header Shell
- Footer Shell
- Theme Projector
- Settings Global
- Brand Logo
- Menu Saves Count
- Core Saves
- Search Fallback / Menu Sanitizer
- Profile Signin
- Supabase Config Source / Legacy Bridge
- Global Helper Loader
- Collections V7.12.50 Source Dependency
- Current Manifest
- Index App Map
- Owner Brand Full Pass Checkpoint
- HTML Test Slot

## Fixes included in V7.12.198

V7.12.198 corrected two One Machine polish bugs found during testing:

1. Manifest routes are now clickable links.
2. Route scan now locks while running and no longer over-counts repeated button presses.

## Confirmed route truth

Current owner-brand route truth remains:

- Brand / App Icons -> `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

## Safety notes

- No Supabase writes were made by One Machine.
- No live/index promotion was made.
- No Web Builder logic was changed.
- No Player logic was changed.
- No Pages Manager logic was changed.
- No form/private-message logic was changed.

## Result

One Machine now matches the V7.12.189 route registry truth while documenting the V7.12.197/V7.12.198 GitHub + Supabase route-flow state.
