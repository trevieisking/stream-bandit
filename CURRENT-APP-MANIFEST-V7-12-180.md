# Stream Bandit Current App Manifest V7.13.012

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.13.012 Profile Social Media Group Groups + Events Pass / Feed Fix Pending Test`

## Current index note

The Profile Social Media Group is still a test/candidate group.

Index promotion is not done yet. The owner has gated index promotion until the whole Profile Social Media Group is built and passed.

Current Home route remains:

`home-global-helpers-v7-4-4-test.html`

## Profile Social Media Group status

Group name for all future references:

`Profile Social Media Group`

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

`FUNCTIONAL CANDIDATE`

Needs final group-link polish before whole-group promotion.

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

`news-feed-social-v7-13-001-test.html`

Status:

`FIXED at V7.13.002 Profile Social Media Group Feed Collector Fix; pending owner retest`

Expected behavior to test:

- Reload Feed
- Create Post overlay opens
- Feed post publishes
- optional image URL or file upload attaches to post
- feed reads profile wall posts
- feed reads group posts
- feed reads events
- comment on feed post
- like feed post
- event RSVP from feed
- Safe Checks pass

Safety/read-write map:

- reads `sb_social_posts`
- reads `sb_social_events`
- reads `sb_profiles`
- reads `sb_social_post_comments`
- reads `sb_social_post_reactions`
- reads `sb_social_event_rsvps`
- writes feed posts to `sb_social_posts`
- writes comments to `sb_social_post_comments`
- writes reactions to `sb_social_post_reactions`
- writes event RSVP to `sb_social_event_rsvps`
- uploads feed images to the existing `stream-bandit-images` bucket only when a file is selected

Authenticated user required. No index promotion.

## Current Profile Social Media Group routes

- `profile-social-v7-13-001-test.html` — passed
- `friends-social-v7-13-001-test.html` — candidate / final polish pending
- `groups-social-v7-13-001-test.html` — passed
- `news-feed-social-v7-13-001-test.html` — fixed / pending retest

## Safety standard

No page change should add schema, storage policy, payment provider, final live-home replacement, or production promotion without explicit approval.

## Next plan target

1. Retest fixed News Feed route.
2. Final-polish Friends page links into the same group.
3. Then update overlay/menu/registry for the complete group.
4. Final `index.html` promotion remains owner-gated after the full Profile Social Media Group pass.
