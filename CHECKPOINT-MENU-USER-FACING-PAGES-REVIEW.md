# Stream Bandit — Menu User-Facing Pages Review

Checkpoint name:

`Menu - User-Facing Pages Review`

## User question

The current menu grouping shown by the owner is:

Watch (8)

- Home
- Continue Watching
- Library
- Watchlist
- Accessibility
- Favourites
- Liked
- Supabase Library

Browse (6)

- Genres
- Watch History
- Channels
- Collections
- Playlists
- My Channel

## Review

The public/user-facing tidy work should now focus on pages normal visitors actually use to watch, browse, save, or view content.

Admin-only pages have mostly been reviewed and kept as-is.

## Best current menu logic

### Watch

These are core watching/user save pages and can stay in Watch:

- Home
- Continue Watching
- Library
- Watchlist
- Accessibility
- Favourites
- Liked

### Supabase Library

Supabase Library is a library/browse page. It can stay in Watch if it is the main app library route, but long term it may be cleaner to merge or rename so users are not confused by both Library and Supabase Library.

Possible later decision:

- keep Library as the main library button,
- hide Supabase Library if it is only a technical duplicate,
- or rename Supabase Library to something clearer if still needed.

No change made now.

### Browse

These are browse/discovery pages and can stay in Browse:

- Genres
- Watch History
- Channels
- Collections
- Playlists

### My Channel

My Channel is not really a normal Browse page. It is a creator/profile page and should probably move later into a Creator section if the sidebar gets one.

Possible later Creator section:

- My Channel
- Submit Video

Admin-only Review Queue should stay admin-only.

## Current recommended next tidy focus

Public/user-facing pages to keep checking:

- Home
- Library / Supabase Library relationship
- Genres
- Watch History
- Channels
- Collections
- Playlists
- Watchlist
- Favourites
- Liked
- Continue Watching
- Accessibility

Already tidy/done recently:

- Continue Watching
- Accessibility
- Watch page/player comfort
- Channels
- Collections
- Playlists
- Favourites/Liked menu placement

## No code changes made

This checkpoint is a menu review note only.

Do not change menu grouping further until the owner confirms whether to create a Creator section or merge/hide Supabase Library.
