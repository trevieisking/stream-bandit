# Stream Bandit Checkpoint — Session Pause After Supabase Schema Scan V7.12.5

Date: 2026-05-22

## Pause reason

Trevor is taking the dogs for a walk. This is a safe pause checkpoint so the session can continue cleanly when he returns.

## Current working rule

Do not rush domain/login testing while GitHub HTTPS and Supabase Auth redirect behaviour settle.

Do not spend the remaining magic-link test until the custom domain and HTTPS state are stable.

## Major work completed today

### IONOS domain and email

- Custom domain connected to GitHub Pages over HTTP.
- DNS work completed carefully without breaking mail records.
- Stream Bandit public mailbox created and tested:

```txt
info@chatterfriendsstreambandit.co.uk
```

- Send and receive test passed through IONOS Webmail.
- This email should become the preferred public contact for Stream Bandit policies, contact, account and cancellation requests.

### Supabase Auth redirects

Supabase Authentication URL Configuration now has seven redirect URLs covering:

```txt
https://trevieisking.github.io/stream-bandit/
https://trevieisking.github.io/stream-bandit/**
http://chatterfriendsstreambandit.co.uk/
http://chatterfriendsstreambandit.co.uk/**
http://www.chatterfriendsstreambandit.co.uk/**
https://chatterfriendsstreambandit.co.uk/**
https://www.chatterfriendsstreambandit.co.uk/**
```

Site URL was left unchanged:

```txt
https://trevieisking.github.io/stream-bandit/
```

No magic link was tested after the redirect setup.

### Current page waiting for full authenticated test

```txt
control-tower-footer-policy-previews-v7-12-5-test.html
```

Current state:

- Page loads on custom domain.
- Global helpers load.
- Shared style/theme appears present.
- Header/account shell restored.
- Full account/avatar/global-owner-theme test is pending HTTPS and login stability.

### Mux / Maestro strategy

Trevor clarified the video source strategy:

```txt
Images/posters/profile art  -> Supabase Storage
Video files / streaming URLs -> Maestro / Mux / HLS / public playable URLs
Metadata / movie rows        -> Supabase database
Static frontend              -> GitHub Pages / custom domain
Public contact email         -> info@chatterfriendsstreambandit.co.uk
```

Stream Bandit should store playable URLs, not private video files.

Maestro/Chatterfriends can be used as a practical video library/source when it provides playable stream links.

Mux remains useful for higher-quality assets, playback IDs, HLS URLs, player URLs, thumbnails and embeds.

No private Mux API keys should be used in frontend code.

## Supabase schema scan completed

Checked and found structurally suitable:

```txt
sb_profiles
sb_movies
sb_site_pages
sb_form_submissions
sb_app_settings
sb_channels
sb_submissions
sb_playlists
sb_playlist_movies
sb_collections
sb_collection_movies
sb_watch_progress
sb_watchlist
sb_favourites
sb_likes
sb_import_batches
```

### Important schema observations

#### sb_profiles

Current live profile/user controls are mainly:

```txt
role
can_submit
profile/channel display fields
avatar_url
banner_url
```

Future plan/feature entitlement fields are not present yet.

#### sb_movies

Already supports Mux/Maestro/public video strategy with:

```txt
video_url
mux_playback_url
thumbnail_url
trailer_url
source_type
status
genres
tags
channel_id
owner_id
```

Allowed source_type values:

```txt
mux
hls
url
local
missing
```

For Maestro-provided `.m3u8` links, use:

```txt
video_url = full .m3u8 link
source_type = hls
```

#### sb_app_settings

The global settings row ID is:

```txt
stream_bandit
```

Important theme/style fields found:

```txt
builderStyle
web_builder_style
web_builder_shared_style_v7_8_8
logoUrl
logo
```

This explains why helpers must read `sb_app_settings.id = stream_bandit`.

The shared style helper already reads `stream_bandit` and checks the correct theme keys.

The settings bridge wording can be misleading because `defaults-no-settings-json` may only mean feature-control JSON is missing, not that theme failed.

Future wording improvement:

```txt
Shared style: loaded from stream_bandit / web_builder_style
Settings bridge: no feature-control JSON yet
```

#### Playlists and collections

Both are structurally complete:

```txt
sb_playlists + sb_playlist_movies + sb_movies
sb_collections + sb_collection_movies + sb_movies
```

#### Watch progress and saved lists

Continue Watching and resume playback are supported by:

```txt
sb_watch_progress
```

Watchlist, Favourites and Likes are supported by:

```txt
sb_watchlist
sb_favourites
sb_likes
```

No separate `sb_watch_history` table is visible. Basic watch history can be derived from `sb_watch_progress.last_watched_at`; a true event-history table can be added later only if needed.

## Safe next moves after Trevor returns

1. Check GitHub Pages HTTPS/custom domain state.
2. Do not change Supabase Site URL until HTTPS is stable.
3. Do one careful magic-link/login test only when ready.
4. Re-test `control-tower-footer-policy-previews-v7-12-5-test.html` with account/avatar/theme.
5. Consider improving helper status wording so theme and feature-control JSON are shown separately.
6. Later update policy/contact pages to use `info@chatterfriendsstreambandit.co.uk`.

## Things not done

- No SQL was run.
- No Supabase rows were edited.
- No RLS policies were changed.
- No DNS changes after the safe setup.
- No live/index promotion.
- No magic-link test was used after redirect setup.
