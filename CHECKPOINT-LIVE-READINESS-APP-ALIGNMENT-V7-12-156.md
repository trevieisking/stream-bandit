# Stream Bandit Checkpoint — Live Readiness App Alignment V7.12.156

Date: 2026-05-30

## Purpose

Align the wider Stream Bandit app with the passed Live Readiness route:

`live-readiness-global-helpers-v7-10-2-test.html`

Target label: `V7.12.156 Readiness`

## Confirmed reference behaviour

The Live Readiness page is the reference shell/behaviour template. It keeps the old direct route and loads the global helper stack plus the live readiness search fallback together.

Key requirements carried forward:

- Old menu URLs stay where the global shell expects them.
- Overlay/current route memory must match menu route values.
- Theme ownership stays with `web-builder-theme-studio-controls-v7-8-9-test.html`.
- Header/logo/icon behaviour should match the readiness page.
- Full search overlay should cover movies, genres, channels, playlists, collections/pages and policy agreements.
- No new public pages are created for route fixes.
- No payment system.
- No blind Supabase writes.

## GitHub access check

Repo access confirmed:

- Repository: `trevieisking/stream-bandit`
- Branch: `main`
- Connector permission observed: admin / maintain / push / pull / triage

## Drive access check

Drive access confirmed. Existing Google Drive project memory was behind and still recorded V7.12.128 as the current checkpoint before this update pass.

## Work completed in this pass

### Search fallback upgraded

Updated:

`live-readiness-search-supabase-fallback-v7-12-130.js`

New effective label:

`V7.12.156 Live Readiness Supabase Search Fallback`

The fallback now indexes these result categories:

- Movies from `sb_movies`
- Genres derived from movie genres
- Channels from `sb_channels`
- Playlists from `sb_playlists`
- Collections from `sb_collections`
- Site pages from `sb_site_pages`
- Policy agreements from `sb_policy_documents` when readable
- Static policy agreement fallback routes for Terms, Privacy, Cookies, Family Watch, Cancellation/Refunds, Creator/Content Rules and Accessibility
- Current route/page text

### Safer Supabase handling

The fallback no longer repeats the Supabase publishable key directly in its file body. It reads the existing shell configuration from `stream-bandit-shell-v6-24.js` at runtime, matching the safer pattern already used by the global helper loader.

## Important limitation

The first direct write was blocked because it repeated the publishable key. The corrected write succeeded after switching to runtime shell config reading.

## Next action

Wire the V7.12.156 fallback into every page that carries the global helper loader, or promote pages one-by-one using the Live Readiness script stack:

1. `stream-bandit-shell-v6-24.js`
2. `stream-bandit-menu-saves-count-v6-72-1.js`
3. `stream-bandit-auth-profile-v6-31.js`
4. `stream-bandit-auth-sync-v6-31-7.js`
5. `stream-bandit-auth-avatar-v7-0-2.js`
6. `stream-bandit-shared-style-v7-0-2.js`
7. `stream-bandit-settings-global-v7-1-8.js`
8. `stream-bandit-brand-logo-v7-12-12.js`
9. `stream-bandit-global-helper-loader-v7-12-126.js`
10. `live-readiness-search-supabase-fallback-v7-12-130.js`

Do not edit protected shell files unless Trevor explicitly approves.

## Current status

Partial pass:

- Live Readiness reference scanned.
- Search fallback upgraded to cover the required app-wide search categories.
- GitHub checkpoint added.
- Further full-page promotion still required page-by-page for pages that do not yet load the full helper/fallback stack.
