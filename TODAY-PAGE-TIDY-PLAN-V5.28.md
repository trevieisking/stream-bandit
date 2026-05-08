# Stream Bandit Page Tidy Plan — V5.28 onwards

## Rule for today

Do not divert into new feature upgrades.

The job for the rest of today is page tidy only:

- make pages cleaner,
- move existing sections into neat tab/card layouts,
- keep working logic protected,
- use test routes first,
- promote only after visual checks pass.

## Current live checkpoint

`Stream Bandit V5.26.2 Stable`

Live includes:

- Watch / Supabase Watch tidy passed and promoted,
- Player Sound Booster protected,
- custom volume overlay protected,
- Quality Tools moved into Tools Page,
- Branding colours controlling tab/pink polish,
- Accessibility tidy passed,
- Supabase Details tidy passed.

## Do not touch unless specifically planned

- Admin: Final Boss controls it. Overlay tidy failed and has been stopped.
- Player core: working and protected.
- Sound Booster logic: working and protected.
- Supabase Movie Manager save logic: important, avoid casual layout patching.
- Continue Watching: live version is already good; previous tidy test was not promoted.

## Next page order

1. Genres
2. Watch History
3. Channels
4. Collections
5. Playlists
6. My Channel
7. Watchlist / Favourites polish if needed
8. Admin later as a proper rebuild, not an overlay

## Next immediate task

Start `V5.28 Genres tidy test` as a safe test route only.

Expected approach:

- do not change database writes,
- do not change player,
- do not change Supabase saves,
- tidy the existing Genres page into clean sections/tabs/cards,
- keep branding-aware pink active tabs,
- test visually before promotion.

## Reminder phrase

When the user returns, remind them:

`We are not diverting today — page tidy only. Next page is Genres.`
