# Stream Bandit Current App Manifest V7.13.017

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest checkpoint

`V7.13.017 Profile Social Media Group PASS / Platform Entry PASS / Registry Social Matrix Upgrade Installed`

## What is passed and logged

### Platform entry

Route:

`index.html`

Visible version:

`V7.13.016 Platform Entry · Social Group Promoted`

Status:

`PASSED AS PLATFORM ENTRY PROMOTION`

Confirmed behavior:

- index is the platform entry route
- Home remains the main app Home route, not replaced
- platform entry links Social Profile, Friends, News Feed, Groups, Account Settings, Web Builder Hub and Current Routes Registry
- platform entry loads the global helper/header/footer/menu stack
- no payment promotion
- no production Home replacement
- no schema/RLS/storage change

### Main app Home

Route:

`home-global-helpers-v7-4-4-test.html`

Status:

`STILL MAIN APP HOME`

### Passed global header shell JavaScript

File:

`stream-bandit-header-shell-v7-12-156.js`

Visible shell version:

`V7.13.014 Header Shell / Account Settings Menu Cleanup`

Status:

`PASSED ON HOME AND PLATFORM ENTRY`

Passed shell behavior:

- header shell loads on Home
- header shell loads on platform entry
- Social Profile route is available
- Friends route is available
- News Feed route is available
- Groups route is available
- Account Settings remains separate from Social Profile
- duplicate Account Profile menu entry removed
- old account/settings route remains available as Account Settings

## Profile Social Media Group

Group status:

`PASSED AS COMPLETE SOCIAL GROUP`

Routes:

- `profile-social-v7-13-001-test.html` — Social Profile, passed at V7.13.010
- `friends-social-v7-13-001-test.html` — Friends bridge, passed candidate
- `groups-social-v7-13-001-test.html` — Groups + Events, passed at V7.13.002
- `news-feed-social-v7-13-003-test.html` — News Feed, passed at V7.13.007 Maestro Embed + Mux Support

Social Profile passed behavior:

- account profile text
- avatar overlay
- banner overlay
- rich questions
- privacy settings
- family request / confirm / remove
- wall post
- wall comment
- wall like
- refresh persistence
- safe checks
- account request overlay opens only

Groups + Events passed behavior:

- reload groups
- create group
- new group appears in My Groups
- open selected group
- publish group post
- comment on group post
- like group post
- create event
- RSVP Going / Interested
- safe checks

News Feed passed behavior:

- reload feed
- create post overlay opens
- text-only post publishes
- image URL post publishes
- direct image upload post publishes
- profile wall post appears
- group post appears
- event appears
- comment on feed post
- like feed post
- event RSVP from feed
- edit own feed post
- remove own feed post through `sb_social_remove_own_post`
- Maestro embed / Maestro src video plays on feed
- Mux/HLS/direct video support remains available for valid playable sources
- safe checks

## Registry status

Registry route:

`all-pages-version-registry-v7-12-122-current-routes-test.html`

Installed registry version:

`V7.13.017 Registry Machine · Social Matrix + Supabase Proof · 16 Protected Checks`

Status:

`INSTALLED / READY FOR BROWSER SCAN ALL TEST`

What changed in registry V7.13.017:

- added Platform route group
- added Social route group
- added Social Profile route
- added Friends route
- added News Feed route
- added Groups and Events route
- renamed Settings > Profile Settings to Account Settings
- added social table parser coverage
- added social proof table coverage
- kept protected files at 16 checks
- kept scanner read-only
- kept no schema/RLS/storage/service-role/payment/Home replacement side effects

Active proof tables now include the old main app table set plus social proof tables:

- `sb_account_deletion_requests`
- `sb_profile_social_settings`
- `sb_social_events`
- `sb_social_event_rsvps`
- `sb_social_group_members`
- `sb_social_groups`
- `sb_social_post_comments`
- `sb_social_post_reactions`
- `sb_social_posts`
- `sb_user_family_relationships`

Known optional/future tokens are classified so they do not appear as plain unknown schema:

- `sb_social_notifications`
- `sb_social_post_media`
- `sb_user_blocks`
- `sb_social_remove_own_post`
- `sb_social_update_own_post`
- Web Builder future `sb_builder_*` tokens

## Current route groups by function

Main app movie streaming:

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

Creator / library management:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`
- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres: `genres-clean-machine-v7-12-45-test.html`

Group Play:

- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
- My Channel: `my-channel-clean-machine-v7-12-47-test.html`
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

Social Media Group:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-003-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

Account / settings:

- Account Settings: `profile-settings-live-ready-v7-12-90-test.html`
- Settings Hub: `settings-platform-control-hub-v7-12-85-test.html`
- Theme Studio: `web-builder-theme-studio-controls-v7-8-9-test.html`

Web Builder:

- Web Builder Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Owned Pages Manager: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Preview: `web-builder-preview-owned-v7-12-257-test.html?page=landing`
- Menu Builder: `web-builder-menu-builder-owned-v7-12-264-test.html`
- Form Designer: `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`
- Form Inbox Bridge: `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`
- Assets: `web-builder-assets-v7-12-252-test.html`
- Route Map: `web-builder-route-map-v7-12-252-test.html`
- Control Map: `web-builder-control-map-v7-12-253-test.html`
- Source Map: `web-builder-pages-source-map-v7-12-255-test.html`
- Header/Footer Code: `web-builder-header-footer-code-v7-12-254-test.html`

Admin / proof:

- Admin Centre: `admin-centre-command-deck-v7-12-121-test.html`
- Live Readiness: `live-readiness-global-helpers-v7-10-2-test.html`
- Current Routes Registry: `all-pages-version-registry-v7-12-122-current-routes-test.html`
- Test Checklist: `test-checklist-global-helpers-v7-10-5-test.html`
- Tools: `tools-page-original-global-pass-v7-12-136-test.html`
- Health Check: `health-check-global-helpers-v7-10-6-test.html`
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html`
- Storage Prep: `storage-prep-global-helpers-v7-10-8-test.html`
- Backup / Safety: `backup-safety-global-helpers-v7-10-9-test.html`

## Safety standard

No page change should add schema, storage policy, payment provider, production Home replacement, service-role key, or destructive cleanup without explicit approval.

## Next test

Open:

`https://chatterfriendsstreambandit.co.uk/all-pages-version-registry-v7-12-122-current-routes-test.html?v=713017`

Run:

`Scan All + Supabase Proof`

Pass condition:

- route bad = 0
- file bad = 0
- Social group appears as a route group
- Platform group appears as a route group
- social tables appear in table proof/matrix instead of only manifest unknown warnings
- Supabase proof remains connected
