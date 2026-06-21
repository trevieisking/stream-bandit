# Stream Bandit Current App Manifest V7.13.078

Date: 2026-06-21

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

This existing manifest is also the scan-pass checkpoint for the final route/menu/ownership review. No new checkpoint file was created.

## Current strongest checkpoint

`V7.13.078 Auth Gate Controlled Watch Group Pass / Continue Watching Passed / Watch History Passed / Watchlist Passed / Manifest Updated`

## Scan pass status

`FINAL SCAN PASS PRESERVED / AUTH GATE CONTROLLED ROLLOUT UPDATED / CONTINUE WATCHING PASSED / WATCH HISTORY PASSED / WATCHLIST PASSED`

Confirmed boundaries:

- no new file created
- no checkpoint file created
- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no player/audio/accessibility regression work
- no Header Shell mass auth-gate injection
- old useful hidden pages were not deleted
- Web Builder-owned public aliases were moved to current owned Web Builder pages where appropriate
- Form Inbox remains the temporary Owner exception and is queued for later Social placement

## Changes made during this pass

### Auth gate controlled rollout update

Status:

`CONTROLLED PAGE-BY-PAGE ROLLOUT / NO MASS HEADER SHELL GATE / CONTINUE WATCHING PASSED / WATCH HISTORY PASSED / WATCHLIST PASSED`

Files updated:

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`

Continue Watching result:

- upgraded from V7.12.230 to V7.12.231 Continue Watching Auth Gate Test
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- `StreamBanditAuthGate.enforce()` added to the existing helper loop
- helper status now includes Auth Gate
- helper state records `authGate` true/false
- Trevor confirmed a full pass
- read-only progress stayed preserved
- dedupe stayed preserved
- resume links stayed preserved
- save buttons stayed preserved
- Details links stayed preserved
- clean navigation stayed preserved
- no backend or destructive action was added

Watch History result:

- upgraded from V7.12.226 to V7.12.227 Watch History Auth Gate Test
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- `StreamBanditAuthGate.enforce()` added to the existing helper loop
- helper status now includes Auth Gate
- debug state records `authGate` true/false
- Trevor confirmed Watch History is working now and passed
- read-only history/progress logic stayed preserved
- dedupe logic stayed preserved
- resume links stayed preserved
- save buttons stayed preserved
- Details links stayed preserved
- theme tabs stayed preserved
- no backend or destructive action was added

Watchlist result:

- upgraded from V7.12.159 to V7.12.160 Watchlist Auth Gate Test
- visible badge is `V7.12.160 Watchlist · Auth Gate Test`
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- `StreamBanditAuthGate.enforce()` added to the existing helper loop
- helper status now includes Auth Gate
- summary now records Auth Gate attached/checking
- Trevor confirmed the gate works and Watchlist passed
- real `sb_watchlist` table read stayed preserved
- search/filter stayed preserved
- sort stayed preserved
- shared save buttons stayed preserved
- Details links stayed preserved
- Player 1 links stayed preserved
- clean top rail stayed preserved
- no backend or destructive action was added

Current auth-gate controlled rollout status:

- Index: passed
- Home: passed
- Library: passed
- Details: passed
- Player 1: auth gate passed; separate Details wrong-movie link issue logged for later
- Continue Watching: passed
- Watch History: passed
- Watchlist: passed

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
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

### Creator / library management

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`
