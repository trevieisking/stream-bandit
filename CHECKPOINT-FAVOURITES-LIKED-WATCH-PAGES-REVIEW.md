# Stream Bandit — Favourites and Liked Watch Pages Review

Checkpoint name:

`Favourites + Liked - Watch Pages Review`

## Decision

Keep the Favourites and Liked pages as-is for now.

## Reason

Both pages are user-facing Watch pages and already use the working Supabase save/read layout.

They show:

- logged-in session status,
- saved count,
- loaded movie count,
- refresh Supabase saves action,
- open Library action,
- movie cards with Play and Details,
- Watchlist/Favourite/Liked state buttons.

## Menu decision

Liked belongs in the Watch section, not Admin Tools.

This has already been fixed in:

`assets/stream-bandit-v5-6-menu-organiser.js`

Favourites is already in the Watch section and should stay there.

## Protected areas

Do not change lightly:

- Supabase save/read logic,
- Watchlist/Favourites/Liked counts,
- movie card buttons,
- Play/Details actions,
- Supabase movie rows,
- player,
- Sound Booster.

## Current recommendation

No tidy rebuild needed for Favourites or Liked.

They are already clean enough and consistent with the current card layout.

## Next recommended page

Continue with remaining low-risk user/admin pages:

- Submit Video
- Rules
- Review Queue
- Health Check
- Test Checklist

Recommended next target: Submit Video.
