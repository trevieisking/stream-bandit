# Stream Bandit Current App Manifest V7.13.013

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.13.013 Profile Social Media Group PASS / Header Overlay Plug-in Pending Test`

## Current index note

The Profile Social Media Group has passed as a complete test/candidate group.

Index promotion is still not done. Final `index.html` promotion remains owner-gated after the social routes are plugged into the global header/menu overlay and smoke-tested from the main app shell.

Current Home route remains:

`home-global-helpers-v7-4-4-test.html`

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

### Friends

Route:

`friends-social-v7-13-001-test.html`

Status:

`PASSED AS SOCIAL GROUP CANDIDATE`

Purpose:

- simple user/friend bridge for the social profile group
- links into profile/family/wall/feed/group flow
- not intended to become a large external-style social network clone

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

Safety/write map:

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

## Header/Menu Overlay Plug-in Plan

The next safe integration target is the global header shell/menu overlay:

`stream-bandit-header-shell-v7-12-156.js`

Required plug-in behavior:

- add Social Profile route to the global route map
- add Friends route to the global route map
- add News Feed route to the global route map
- add Groups route to the global route map
- add a Social group to the global menu overlay
- keep old Account Profile route available as Account Profile / Profile Settings
- point the visible profile/social route from the app shell toward `profile-social-v7-13-001-test.html`
- do not change `index.html` yet

## Safety standard

No page change should add schema, storage policy, payment provider, final live-home replacement, or production index promotion without explicit approval.

## Next plan target

1. Plug the passed Profile Social Media Group into the global header/menu overlay.
2. Smoke-test from Home/header/menu/account chip.
3. Then update any registry/route-map page if needed.
4. Final `index.html` promotion remains owner-gated after the full shell plug-in pass.
