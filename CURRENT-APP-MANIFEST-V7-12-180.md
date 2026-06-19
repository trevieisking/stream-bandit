# Stream Bandit Current App Manifest V7.13.016

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.13.016 Profile Social Media Group PASS / Platform Entry Promotion PASS / Registry Social Matrix Next`

## Current index note

`index.html` is now the platform entry route for the passed social group links and global overlay shell.

Visible index version:

`V7.13.016 Platform Entry · Social Group Promoted`

Home remains the main app home route:

`home-global-helpers-v7-4-4-test.html`

The platform entry is not a Home replacement. It is a route launcher that now includes the passed Profile Social Media Group and loads the global helper/header/footer/menu stack.

Passed global shell JavaScript:

`stream-bandit-header-shell-v7-12-156.js`

Passed visible shell version:

`V7.13.014 Header Shell / Account Settings Menu Cleanup`

Passed shell behavior:

- header shell loads on Home
- header shell loads on the platform entry
- Social Profile route is available
- Friends route is available
- News Feed route is available
- Groups route is available
- Account Settings remains separate from Social Profile
- duplicate Account Profile menu entry is removed
- old account/settings route remains available as Account Settings

## Profile Social Media Group status

Group name for all future references:

`Profile Social Media Group`

Overall status:

`PASSED AS COMPLETE SOCIAL GROUP`

### Main Social Profile

Route:

`profile-social-v7-13-001-test.html`

Status:

`PASSED at V7.13.010 Profile Social Media Group Polish Test`

Passed behavior:

- account profile text
- avatar overlay
- banner overlay
- rich questions
- privacy settings
- family request / confirm
- family remove link
- wall post
- wall comment
- wall like
- refresh persistence
- safe checks
- account request overlay opens only

Safety/read-write map:

- reads/writes `sb_profiles` for current-user profile text/avatar/banner
- reads/writes `sb_profile_social_settings`
- reads/writes `sb_user_family_relationships`
- reads `sb_user_friends`
- writes profile wall posts to `sb_social_posts`
- writes wall comments to `sb_social_post_comments`
- writes wall likes to `sb_social_post_reactions`
- writes account requests only to `sb_account_deletion_requests`

### Friends

Route:

`friends-social-v7-13-001-test.html`

Status:

`PASSED AS SOCIAL GROUP CANDIDATE`

Purpose:

- simple user/friend bridge for the social profile group
- links into profile/family/wall/feed/group flow
- not intended to become a large external-style social network clone

Safety/read-write map:

- reads `sb_profiles`
- reads/writes `sb_user_friends`
- may read `sb_user_family_relationships` for family/social bridge state

### Groups + Events

Route:

`groups-social-v7-13-001-test.html`

Status:

`PASSED at V7.13.002 Profile Social Media Group Groups Events Fix`

Passed behavior:

- Groups > Reload Groups
- Groups > Create Group
- Groups > new group appears in My Groups
- Groups > Open selected group
- Groups > Publish Group Post
- Groups > Comment on Group Post
- Groups > Like Group Post
- Groups > Create Event
- Groups > RSVP Going / Interested
- Groups > Run Safe Checks

Safety/read-write map:

- `sb_social_groups`
- `sb_social_group_members`
- `sb_social_posts`
- `sb_social_post_comments`
- `sb_social_post_reactions`
- `sb_social_events`
- `sb_social_event_rsvps`

Authenticated user required.

### News Feed

Route:

`news-feed-social-v7-13-003-test.html`

Status:

`PASSED at V7.13.007 Maestro Embed + Mux Support`

Passed behavior:

- hard refresh route
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
- Safe Checks pass

Safety/read-write map:

- reads `sb_social_posts`
- reads `sb_social_events`
- reads `sb_profiles`
- reads `sb_social_post_comments`
- reads `sb_social_post_reactions`
- reads `sb_social_event_rsvps`
- writes feed posts to `sb_social_posts`
- edits own feed posts through `sb_social_update_own_post`
- removes own feed posts through `sb_social_remove_own_post`
- writes comments to `sb_social_post_comments`
- writes reactions to `sb_social_post_reactions`
- writes event RSVP to `sb_social_event_rsvps`
- uploads feed images to the existing `stream-bandit-images` bucket only when a file is selected

Authenticated user required.

## Current Profile Social Media Group routes

- `profile-social-v7-13-001-test.html` — passed
- `friends-social-v7-13-001-test.html` — passed as social group candidate
- `groups-social-v7-13-001-test.html` — passed
- `news-feed-social-v7-13-003-test.html` — passed

## Platform entry routes now linked from `index.html`

- Main App Home: `home-global-helpers-v7-4-4-test.html`
- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-003-test.html`
- Groups: `groups-social-v7-13-001-test.html`
- Account Settings: `profile-settings-live-ready-v7-12-90-test.html`
- Web Builder Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Current Routes Registry: `all-pages-version-registry-v7-12-122-current-routes-test.html`

## Header/Menu Overlay status

Global header shell:

`stream-bandit-header-shell-v7-12-156.js`

Passed target version:

`V7.13.014 Header Shell / Account Settings Menu Cleanup`

Passed plug-in behavior:

- Social Profile route in the global route map
- Friends route in the global route map
- News Feed route in the global route map
- Groups route in the global route map
- Social group in the global menu overlay
- old account route available as Account Settings
- duplicate Account Profile removed from the Social group
- Settings > Account Profile renamed to Settings > Account Settings
- visible social route points toward `profile-social-v7-13-001-test.html`

## Registry upgrade target

The registry page must now recognise the Profile Social Media Group as first-class routes, not just unknown tokens found inside this manifest.

Registry route:

`all-pages-version-registry-v7-12-122-current-routes-test.html`

Required registry upgrade:

- add Social route group
- add Profile Social route
- add Friends route
- add News Feed route
- add Groups route
- rename Settings > Profile Settings to Account Settings
- add social tables to known table proof list
- classify social RPCs as RPC/function references, not unknown schema

Social tables to include in known table proof:

- `sb_account_deletion_requests`
- `sb_profile_social_settings`
- `sb_social_events`
- `sb_social_event_rsvps`
- `sb_social_group_members`
- `sb_social_groups`
- `sb_social_notifications`
- `sb_social_post_comments`
- `sb_social_post_media`
- `sb_social_post_reactions`
- `sb_social_posts`
- `sb_user_blocks`
- `sb_user_family_relationships`

## Safety standard

No page change should add schema, storage policy, payment provider, final live-home replacement, or production home replacement without explicit approval.

## Next plan target

1. Smoke-test `index.html` as platform entry.
2. Upgrade the Current Routes Registry social group/table matrix.
3. Smoke-test Scan All + Supabase Proof.
4. Confirm Social routes and social tables are no longer only manifest unknown warnings.
