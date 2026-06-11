# Stream Bandit Channels Privacy Brainstorm V7.12.269.3

Date: 2026-06-11

Purpose: quick checkpoint after testing `channels-global-helpers-v7-5-3-test.html` V7.12.269.2.

## What the test proved

- The page loads and the Add / Remove Videos tab opens.
- The dropdown now shows the platform owner/main-library movies.
- Other normal users' private/personal movies are not shown in the attach dropdown.
- The current UI still confuses attachable source movies with attached channel rows.
- Removing a video can report success while a main-library/source card still appears in the available list, which looks like a defiant card but may be the source movie rather than the user's channel copy.
- Creating a new extra channel failed because the database still had `sb_channels_one_channel_per_owner_uidx`, a one-channel-per-owner index. That conflicts with plan-limited multi-channel behavior.

## Privacy and curation rules to meet later

Movie/video visibility should become explicit, not inferred only from owner/channel:

- `public`: anyone can watch if published.
- `private`: only owner/admin can watch.
- `unlisted`: playable by direct/invite link but not browse/search.
- `invite_only`: only invited accounts/groups can watch.
- `followers_only` or `subscribers_only`: visible to approved relationship/account group.
- `paywalled`: requires entitlement, purchase, subscription, rental, or pass.
- `age_restricted` / mature filter: requires age/setting gate.
- `region_restricted`: optional future territory rules.
- `embargoed` / scheduled: visible only after publish time.

Curation/add-to-channel permission should also be explicit:

- `allow_channel_add`: other users may add this video to their channels.
- `allow_playlist_add`: other users may add this video to playlists.
- `allow_collection_add`: other users may add this video to collections.
- `allow_embed`: video can appear in Web Builder or external embeds.
- `require_credit`: show original owner/source attribution when curated.
- `require_owner_approval`: owner must approve before another user can curate.
- `block_remix_or_copy`: prevents cloning/copying rows except platform-approved use.

Profile/channel-level defaults should exist later:

- Default video visibility for new uploads.
- Default curation permission for new uploads.
- Per-channel setting: allow others to add my public videos.
- Per-channel setting: show/hide from browse/search.
- Per-profile setting: public creator profile vs private profile.
- Admin/owner override for moderation, legal, safety and platform library rows.

Current safe interim Channels rule:

- Keep using `sb_movies` as the streaming backbone.
- Do not add `sb_channel_movies` during this fix.
- Allow users to attach their own movies.
- Allow users to attach Stream Bandit main/platform library movies.
- Block other normal users' movies unless a future explicit curation permission says otherwise.
- For platform/main movies, avoid moving the original platform movie out of the main library.
- Extra channels must be plan-limited by entitlements, not blocked by a one-channel-per-owner index.

## Immediate next fix

- Remove the obsolete `sb_channels_one_channel_per_owner_uidx` index if still present.
- Tighten `sb_group_play_set_movie_channel` so platform/main movies are cloned for the user's channel rather than moving the original row.
- Improve Channels UI wording so source-library cards and attached channel cards are not confused.
- Keep old URL and no index/registry/Web Builder/Library Editor promotion.
