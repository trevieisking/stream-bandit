# Stream Bandit Active Route Map V7

Purpose: this is the safe current route map built from the shared menu overlay and recovered Web Builder checkpoints. It is for planning and cleanup only. It does not delete, move, rename or promote anything.

## Rules for using this map

- Keep one active route per page/function where possible.
- Do not delete older files until the active route has passed in browser testing.
- Do not patch working pages randomly.
- Shared shell first, then account/search/theme/profile/global pages, then feature pages.
- If a route fails, inspect and fix the shared cause where possible instead of duplicating pages.

## Core shared files

These are active shared support files and should remain in root.

| Area | Active file | Notes |
|---|---|---|
| Shared menu/search shell | `stream-bandit-shell-v6-24.js` | Main drawer menu and search overlay source. |
| Shared menu counts | `stream-bandit-menu-saves-count-v6-72-1.js` | Watchlist/favourites/likes counts. |
| Shared auth/profile shell | `stream-bandit-auth-profile-v6-31.js` | Account panel and profile read. Needs Supabase SDK available before it loads or a shared SDK-loading fix. |
| Shared auth sync | `stream-bandit-auth-sync-v6-31-7.js` | Header account sync helper. |
| Shared saves | `stream-bandit-core-saves-v6-75.js` | Shared saves support. |
| Current live app | `index.html` | Do not replace until final smoke test and Trevor approval. |

## Final run checkpoint

| Area | Active file | Notes |
|---|---|---|
| Final run registry | `final-run-through-registry-v7-6-0-test.html` | Last-night checkpoint and next-session plan. |
| Main page registry | `all-pages-version-registry-v6-29-test.html` | Main version registry. |
| Admin shell registry | `all-pages-version-registry-admin-shell-v6-61-test.html` | Admin-shell version registry route. |
| Route registry document | `STREAM_BANDIT_ROUTE_REGISTRY_V6_90_12.md` | Markdown route reference. |

## Account and auth routes

| Page/function | Active file | Notes |
|---|---|---|
| Account landing sync candidate | `account-landing-sync-v6-72-2-test.html` | Current candidate from last-night plan. |
| Account landing login | `account-landing-login-v6-72-1-test.html` | Earlier login route. |
| Account login style borrow | `account-login-style-borrow-v6-72-0-test.html` | Style-borrow account checkpoint. |
| Auth/profile shell test | `auth-profile-shell-v6-31-test.html` | Auth/profile read test. |

## Watch routes

| Page/function | Active file | Notes |
|---|---|---|
| Home | `home-watch-shell-v6-32-test.html` | Current Home shell route. |
| Details | `details-artwork-16x9-v6-77-7-test.html` | Current protected Details/artwork route. |
| Player | `player-watch-shell-v6-34-test.html` | Current single player route. |
| Continue Watching | `continue-watching-watch-shell-v6-35-test.html` | Current resume route. |
| Watch History | `watch-history-watch-shell-v6-36-test.html` | Current history route. |
| Watchlist | `watchlist-watch-shell-v6-37-test.html` | Current Watchlist route. |
| Favourites | `favourites-watch-shell-v6-38-test.html` | Current Favourites route. |
| Liked | `liked-watch-shell-v6-39-test.html` | Current Liked route. |
| Accessibility | `accessibility-watch-shell-v6-40-test.html` | Current accessibility/audio comfort route. |

## Browse routes

| Page/function | Active file | Notes |
|---|---|---|
| Library | `library-browse-shell-v6-41-test.html` | Current Library route. |
| About | `about-browse-shell-v6-42-test.html` | Current About route. |
| Supabase Library | `supabase-library-browse-shell-v6-43-test.html` | Current Supabase Library route. |
| Genres | `genres-browse-shell-v6-44-test.html` | Current Genres route. |
| Channels | `channels-browse-shell-v6-45-test.html` | Current Channels route. |
| Collections | `collections-browse-shell-v6-46-1-test.html` | Current Collections route. |
| Playlists | `playlists-browse-shell-v6-47-test.html` | Current Playlists route. |

## Creator routes

| Page/function | Active file | Notes |
|---|---|---|
| My Channel | `my-channel-creator-shell-v6-48-test.html` | Current creator channel route. |
| Submit Video | `submit-video-creator-shell-v6-49-test.html` | Current submit route. Rule 4: images upload, videos use URLs. |
| Creator Rules | `rules-creator-shell-v6-50-test.html` | Current rules route. |
| Review Queue | `review-queue-creator-shell-v6-51-test.html` | Current review queue route. |

## Admin / Settings routes

| Page/function | Active file | Notes |
|---|---|---|
| Global Search | `global-search-admin-shell-v6-52-test.html` | Current admin search route. |
| Admin Centre | `admin-centre-admin-shell-v6-53-test.html` | Current admin centre route. |
| Settings | `settings-admin-shell-v6-54-test.html` | Current settings route. |
| Settings Studio | `settings-studio-admin-shell-v6-55-test.html` | Current settings studio route. |
| Profile Settings | `profile-settings-admin-shell-v6-56-test.html` | Current profile/avatar/banner/global profile route. Likely important for global identity/logo work. |
| Web Builder | `web-builder-admin-shell-v6-57-test.html` | Admin Web Builder route. |
| Platform Builder | `platform-builder-admin-shell-v6-58-test.html` | Current platform builder route. |
| Final Shell Navigation | `final-shell-navigation-admin-shell-v6-59-test.html` | Current final shell navigation route. |
| Live Readiness | `live-readiness-admin-shell-v6-60-test.html` | Current live readiness route. |
| Test Checklist | `test-checklist-admin-shell-v6-62-test.html` | Current checklist route. |
| Tools Page | `tools-page-admin-shell-v6-63-test.html` | Current tools route. |
| Health Check | `health-check-admin-shell-v6-64-test.html` | Current health check route. |
| Mux Manager | `mux-manager-admin-shell-v6-65-test.html` | Current Mux route. Videos are URL/Mux/HLS, not frontend uploads. |
| Storage Prep | `storage-prep-admin-shell-v6-66-test.html` | Current storage prep route. Images are upload-first. |
| Backup / Safety | `backup-safety-admin-shell-v6-67-test.html` | Current backup/safety route. |

## User management routes

| Page/function | Active file | Notes |
|---|---|---|
| User Dashboard | `user-dashboard-concept-v6-68-test.html` | Current user dashboard concept route. |
| Pricing Matrix | `plans-pricing-matrix-v6-69-test.html` | Current pricing matrix route. |
| Permissions Matrix | `permissions-matrix-v6-70-test.html` | Current permissions route. |
| Policy & FAQ Centre | `policy-faq-centre-v6-71-test.html` | Current policy/help route. |

## Current Web Builder route chain

This is the recovered/current Web Builder chain. Use this before older V7.5/V7.6/V7.7/V7.8 workflow files.

| Page/function | Active file | Notes |
|---|---|---|
| Current Web Builder hub | `web-builder-current-links-v7-9-8-test.html` | Newest recovered current-links hub. |
| Shared shell workflow hub | `web-builder-workflow-shared-shell-v7-9-7-test.html` | Correct shared shell shape. |
| Auth shell workflow hub | `web-builder-workflow-auth-shell-v7-9-6-test.html` | Account-aware workflow checkpoint. |
| Final shell workflow hub | `web-builder-workflow-final-shell-v7-9-5-test.html` | Final-shell workflow checkpoint. |
| Global shell workflow hub | `web-builder-workflow-global-shell-v7-9-4-test.html` | Global-shell workflow checkpoint. |
| Shell workflow hub | `web-builder-workflow-shell-v7-9-2-test.html` | Earlier shell workflow checkpoint. |
| Theme Studio controls | `web-builder-theme-studio-controls-v7-8-9-test.html` | Current Web Builder Theme Studio. |
| Full Builder | `web-builder-full-edit-lock-v7-8-5-test.html` | Current full builder. |
| Shared style preview | `web-builder-shared-style-preview-v7-9-0-test.html` | Current shared-style preview. |
| Shared style block page | `web-builder-shared-style-block-v7-9-0-test.html` | Current shared-style block page. |
| Form save | `web-builder-form-save-v7-6-5-test.html` | Current form submit/save route. |
| Form answers | `web-builder-form-viewer-v7-6-6-test.html` | Current form answers route. |
| Web Builder registry prep | `web-builder-registry-prep-v7-7-9-test.html` | Current Web Builder prep list. |

## Legacy / Reference routes still in menu

These appear in the shell menu as reference routes. They can be archived later only after a deliberate decision.

| Page/function | Active/reference file | Notes |
|---|---|---|
| Original Global Search | `global-search-v5-80-test.html` | Legacy original search preview. |
| Original Settings Studio | `settings-controls-v5-81-test.html` | Legacy original settings studio. |
| Original Final Shell | `final-shell-navigation-v5-79-test.html` | Legacy original final shell navigation. |
| Original Live Readiness | `live-readiness-standalone-v5-64-test.html` | Legacy live readiness. |
| Old Final Shell Upgrade | `old-final-shell-menu-upgrade-v6-26-test.html` | Reference old final shell menu. |
| Reconciliation Batch 1 | `reconciliation-batch1-v6-24-test.html` | Shared shell reconciliation launcher. |
| Favourite Tools V5.24.1 | `tools-v5-24-1.html` | Protected working tools page. Keep until duplicated safely. |

## First route order for the final run

This is the intended dependency order. Do not jump randomly to Home.

1. Account/Login and shared auth shell.
2. Menu/search/shared shell.
3. Profile Settings, because avatar/banner/profile identity should affect pages globally where intended.
4. Settings and Settings Studio.
5. Theme Studio / Web Builder style flow.
6. Accessibility/player comfort.
7. Supabase Library and Storage Prep.
8. Admin Centre / permissions / policy.
9. Watch/Browse/Creator pages from the menu overlay.
10. Web Builder current chain and registry.
11. Live Readiness and Backup/Safety.
12. Only then consider live/index promotion.

## Known immediate issue

Some pages load `stream-bandit-auth-profile-v6-31.js` without loading the Supabase SDK first. When that happens, the account panel can show:

`Supabase client not available`

Preferred fix:

- Update the shared auth helper to load the Supabase SDK itself when missing.

Fallback fix:

- Add the Supabase SDK script before `stream-bandit-auth-profile-v6-31.js` on affected pages.

Do not patch random pages until this shared cause is handled.

## Cleanup comparison

Use this map together with:

- `STREAM-BANDIT-REPO-CLEANUP-INVENTORY-V7.md`

Anything not listed here is a candidate for archive review, not immediate deletion.
