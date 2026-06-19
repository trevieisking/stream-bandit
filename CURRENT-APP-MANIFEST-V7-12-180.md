# Stream Bandit Current App Manifest V7.13.058

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

This existing manifest is also the scan-pass checkpoint for the final route/menu/ownership review. No new checkpoint file was created.

## Current strongest checkpoint

`V7.13.058 Final Scan Pass / Header Owner Web Builder Menu Cleanup / Manifest Updated`

## Scan pass status

`PASSED AS FINAL SCAN PASS WITH DEFERRED MANIFEST CLEANUP ITEMS LOGGED`

Confirmed boundaries:

- no new file created
- no checkpoint file created
- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no player/audio/accessibility regression work
- old useful hidden pages were not deleted
- Web Builder-owned public aliases were moved to current owned Web Builder pages where appropriate
- Form Inbox remains the temporary Owner exception and is queued for later Social placement

## Changes made during this pass

### Main shell route cleanup

File:

`stream-bandit-shell-v6-24.js`

Status:

`UPDATED AND VERIFIED`

Effect:

- app-facing old Web Builder support aliases now point to the current owned Web Builder pages
- old Web Builder pages remain available as compatibility/support pages
- no database or storage action was added

Current Web Builder aliases:

- Web Builder Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Owned Pages Manager: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Preview: `web-builder-preview-owned-v7-12-257-test.html?page=test-page`
- Form Designer: `web-builder-form-designer-owned-v7-12-258-test.html?page=test-page`
- Form Inbox: `web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page`

### Header shell owner-menu cleanup

File:

`stream-bandit-header-shell-v7-12-156.js`

Visible shell version:

`V7.13.058 Header Shell / Owner Web Builder Menu Cleanup`

Status:

`UPDATED AND VERIFIED`

Effect:

- Owner group was kept
- Form Inbox was kept in Owner as the explicit exception
- Advanced Form was removed from normal Owner menu exposure
- Pages Manager was removed from normal Owner menu exposure
- Published Preview was removed from normal Owner menu exposure
- News Feed route was corrected to `news-feed-social-v7-13-001-test.html`
- header shell reads Supabase config from the existing global shell/config path instead of carrying a visible inline key

Owner menu now keeps:

- Form Inbox
- One Machine
- Platform Control Centre
- Final Shell Navigation
- Brand / App Icons
- Brand Image Helper
- Favicon / App Icon Builder

## Group scan results

### Web Builder group

Status:

`CURRENT WEB BUILDER ROUTES VERIFIED / OLD SUPPORT ROUTES KEPT FOR COMPATIBILITY`

Current user-facing Web Builder ownership:

- Web Builder Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Owned Pages Manager: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Preview: `web-builder-preview-owned-v7-12-257-test.html?page=test-page`
- Form Designer: `web-builder-form-designer-owned-v7-12-258-test.html?page=test-page`
- Form Inbox bridge: `web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page`

Deferred:

- old Web Builder support pages can remain hidden/compatible
- do not randomly delete useful hidden old pages
- legacy `web-builder-form-submissions-v7-12-94-test.html?page=test-page` is queued for later Social inbox/message placement, not moved now

### Admin group

Status:

`SCAN PASSED / NO PATCH NEEDED`

Scanned Admin group pages:

- Admin Centre: `admin-centre-command-deck-v7-12-121-test.html`
- Live Readiness: `live-readiness-global-helpers-v7-10-2-test.html`
- Current Routes Registry: `all-pages-version-registry-v7-12-122-current-routes-test.html`
- Test Checklist: `test-checklist-global-helpers-v7-10-5-test.html`
- Tools: `tools-page-original-global-pass-v7-12-136-test.html`
- Health Check: `health-check-global-helpers-v7-10-6-test.html`
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html`
- Storage Prep: `storage-prep-global-helpers-v7-10-8-test.html`
- Backup / Safety: `backup-safety-global-helpers-v7-10-9-test.html`

Admin notes:

- Admin Centre is a command deck and route proof page, not a database writer
- Live Readiness, Registry, Checklist, Tools, Health Check, Mux Manager and Backup/Safety remain read-only/proof/support pages
- Storage Prep is scoped image-upload preparation only and must remain controlled

### Social group

Status:

`SCAN PASSED / REAL SOCIAL PAGES PRESERVED`

Current Social group routes:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

Social notes:

- Social Profile is a real account/social/profile write page and must not be blind-patched
- Friends is present and is a real friends/messages/likes page
- News Feed is a real post/comment/reaction/feed page and must not be blind-patched
- Groups is a real groups/events/posts page and must not be blind-patched

### User Management group

Status:

`SCAN PASSED / OWNER-ADMIN CONTROL GROUP PRESERVED`

Current routes:

- User Management Dashboard: `user-management-dashboard-v7-11-2-test.html`
- Feature Shop / Pricing: `plans-pricing-feature-shop-v7-11-3-test.html`
- Permissions Inspector: `permissions-matrix-user-management-v7-11-4-test.html`

User Management notes:

- User Management Dashboard is a real protected owner/admin control room
- Feature Shop / Pricing is preview-only; no provider, billing, upgrades or entitlement writes
- Permissions Inspector is read-only; no writes, no billing, no role changes

### Owner group

Status:

`SCAN PASSED / OWNER ROUTES PRESERVED / WEB BUILDER MENU EXPOSURE REDUCED`

Owner routes kept in Header menu:

- Form Inbox: `web-builder-form-submissions-v7-12-94-test.html?page=test-page`
- One Machine: `stream-bandit-one-machine-v7-12-73-test.html`
- Platform Control Centre: `settings-platform-control-hub-v7-12-85-test.html`
- Final Shell Navigation: `stream-bandit-global-helper-shell-v7-12-126-test.html`
- Brand / App Icons: `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper: `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder: `favicon-app-icon-builder-v7-12-15-test.html`

Owner notes:

- One Machine is read-only route/security/ownership proof and may keep older route witnesses for diagnostics
- Final Shell Navigation is read-only shell/navigation proof and may keep focused route witnesses
- Brand / App Icons is a real owner/global-logo image upload and save page, so it stays preservation-first
- Brand Image Helper is preview-only and writes off
- Favicon / App Icon Builder is preview-only and writes off

## Current route groups by function

### Platform / core watch

- Platform Entry: `index.html`
- Home: `home-global-helpers-v7-4-4-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

### Creator / library management

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`
- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres: `genres-clean-machine-v7-12-45-test.html`

### Group Play

- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
- My Channel: `my-channel-clean-machine-v7-12-47-test.html`
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

### Social Media Group

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

### Account / settings

- Account Settings: `profile-settings-live-ready-v7-12-90-test.html`
- Settings Hub: `settings-platform-control-hub-v7-12-85-test.html`
- Theme Studio: `web-builder-theme-studio-controls-v7-8-9-test.html`

### Web Builder

- Web Builder Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Owned Pages Manager: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Preview: `web-builder-preview-owned-v7-12-257-test.html?page=test-page`
- Form Designer: `web-builder-form-designer-owned-v7-12-258-test.html?page=test-page`
- Form Inbox Bridge: `web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page`

### Admin / proof

- Admin Centre: `admin-centre-command-deck-v7-12-121-test.html`
- Live Readiness: `live-readiness-global-helpers-v7-10-2-test.html`
- Current Routes Registry: `all-pages-version-registry-v7-12-122-current-routes-test.html`
- Test Checklist: `test-checklist-global-helpers-v7-10-5-test.html`
- Tools: `tools-page-original-global-pass-v7-12-136-test.html`
- Health Check: `health-check-global-helpers-v7-10-6-test.html`
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html`
- Storage Prep: `storage-prep-global-helpers-v7-10-8-test.html`
- Backup / Safety: `backup-safety-global-helpers-v7-10-9-test.html`

### Owner / management

- Form Inbox: `web-builder-form-submissions-v7-12-94-test.html?page=test-page`
- One Machine: `stream-bandit-one-machine-v7-12-73-test.html`
- Platform Control Centre: `settings-platform-control-hub-v7-12-85-test.html`
- Final Shell Navigation: `stream-bandit-global-helper-shell-v7-12-126-test.html`
- Brand / App Icons: `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper: `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder: `favicon-app-icon-builder-v7-12-15-test.html`

### User Management

- User Management Dashboard: `user-management-dashboard-v7-11-2-test.html`
- Feature Shop / Pricing: `plans-pricing-feature-shop-v7-11-3-test.html`
- Permissions Inspector: `permissions-matrix-user-management-v7-11-4-test.html`

## Deferred work, not for this pass

- Move/correct Form Inbox into the Social group later.
- Remove or update old Web Builder witness links inside Owner diagnostic pages only when owner diagnostics are intentionally cleaned.
- Do not delete old useful pages just because they are old.
- Do not touch SQL/RLS/storage/payment without a separate approved backend pass.

## Final scan-pass decision

`SCAN PASS COMPLETE. MANIFEST UPDATED. READY FOR NEXT CONTROLLED UPDATE PASS.`
