# Stream Bandit Current App Manifest V7.13.015

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.13.015 Profile Social Media Group PASS / Header Shell JS PASS / Registry Social Matrix Upgrade`

## Current index note

Home remains the main app home route:

`home-global-helpers-v7-4-4-test.html`

The current `index.html` remains the platform entry page, not the Home replacement.

The passed global shell JavaScript for the main app is now:

`stream-bandit-header-shell-v7-12-156.js`

Passed visible shell version:

`V7.13.014 Header Shell / Account Settings Menu Cleanup`

Passed Home smoke behavior:

- header shell loads on Home
- Social Profile route is available
- Friends route is available
- News Feed route is available
- Groups route is available
- Account Settings remains separate from Social Profile
- duplicate Account Profile menu entry is removed when the V7.13.014 shell code is installed
- old account/settings route remains available as Account Settings

Index promotion is still owner-gated. The safe next index step is to reference the current passed shell state from the platform entry, not replace Home.

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
- account deletion request overlay opens only

Safety/read-write map:

- reads/writes `sb_profiles` for current-user profile text/avatar/banner
- reads/writes `sb_profile_social_settings`
- reads/writes `sb_user_family_relationships`
- reads `sb_user_friends`
- writes profile wall posts to `sb_social_posts`
- writes wall comments to `sb_social_post_comments`
- writes wall likes to `sb_social_post_reactions`
- writes deletion requests only to `sb_account_deletion_requests`

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

Authenticated user required. No index promotion.

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

Authenticated user required. No index promotion.

## Current Profile Social Media Group routes

- `profile-social-v7-13-001-test.html` — passed
- `friends-social-v7-13-001-test.html` — passed as social group candidate
- `groups-social-v7-13-001-test.html` — passed
- `news-feed-social-v7-13-003-test.html` — passed

## Header/Menu Overlay status

Global header shell:

`stream-bandit-header-shell-v7-12-156.js`

Passed target version:

`V7.13.014 Header Shell / Account Settings Menu Cleanup`

Required/passed plug-in behavior:

- add Social Profile route to the global route map
- add Friends route to the global route map
- add News Feed route to the global route map
- add Groups route to the global route map
- add a Social group to the global menu overlay
- keep old account route available as Account Settings
- remove duplicate Account Profile from the Social group
- rename Settings > Account Profile to Settings > Account Settings
- point the visible profile/social route from the app shell toward `profile-social-v7-13-001-test.html`

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

No page change should add schema, storage policy, payment provider, final live-home replacement, or production index promotion without explicit approval.

## Next plan target

1. Upgrade the Current Routes Registry social group/table matrix.
2. Smoke-test Scan All + Supabase Proof.
3. Confirm Social routes and social tables are no longer only manifest unknown warnings.
4. Then decide whether the platform entry `index.html` should show a simple link card for the passed Social group and passed Header Shell JS.
