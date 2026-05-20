# Stream Bandit Checkpoint — Channels Group Play + Image Columns

Date: 2026-05-20

## Current canonical page

- `channels-image-column-fix-v6-94-2-test.html`

## Trevor memory confirmed

Channels is similar to Playlists/My Channel. It has create/edit channel, cover/banner upload, logo/avatar upload, add/remove videos and Play All.

The screenshot and code confirm this is a real Group Play page.

## What Channels does

The current V6.94.2 page:

- reads `sb_channels`
- reads `sb_movies`
- displays channel list and selected channel hero
- supports create channel
- supports edit channel
- supports remove/hide channel
- supports upload banner image at 1920x1080
- supports upload avatar/logo at 512x512
- supports add/remove videos by patching `sb_movies.channel_id`
- supports normal single Play
- supports Channel Play All in Player 2

## Image column fix

This is the hard-won part of the page.

The page detects and saves uploaded image URLs into whichever real `sb_channels` columns the table supports.

Banner save columns include:

- `banner_url`
- `cover_url`
- `image_url`
- `thumbnail_url`
- `metadata`
- related metadata/branding/settings object fields

Avatar/logo save columns include:

- `avatar_url`
- `logo_url`
- `profile_image_url`
- `metadata`
- related metadata/branding/settings object fields

This avoids the old issue where a channel image disappeared or fell back to the first movie image.

## Player 2 / queue clue

Channels builds a real queue payload for Player 2, similar to the pattern that first came from Genres.

Payload type:

```js
type: 'channel'
```

It includes:

- channel id
- channel name
- currentIndex
- item list with movie id, title, source, poster, genres and index

This confirms:

- Channels = valid Group Play owner.
- Channel Play All = Player 2.
- Normal card Play = Player 1.

## Difference from Supabase Library

Channels has a real group context:

- real channel id
- selected channel row
- movies linked by `sb_movies.channel_id`

Supabase Library did not have this. `queue=library` failed because it was not a real group id/context.

## Future V7 Channels pass

A safe V7 Channels pass should preserve:

- image column detection
- banner/avatar upload and preview
- create/edit channel logic
- add/remove video by `sb_movies.channel_id`
- channel queue payload logic

It should update:

- Details -> `details-global-helpers-v7-3-1-test.html`
- Player 1 -> `player-one-global-helpers-v7-3-3-test.html`
- Player 2 -> `player-two-global-helpers-v7-3-4-test.html`, after confirming queue compatibility
- global helper status

## Testing caution

First V7 pass should test read/route/queue only:

- page opens
- channels load
- selected channel loads
- Details opens V7 Details
- card Play opens Player 1
- Channel Play All opens Player 2 queue

Do not test write tools first unless deliberate:

- create channel
- edit channel
- upload banner
- upload avatar
- add/remove video
- remove channel

## Relationship to My Channel

My Channel may share some channel image/profile ideas, but should be scanned separately. Channels is the broader channel-management / group-play page. My Channel may be the creator-facing personal channel page.
