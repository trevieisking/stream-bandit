# Stream Bandit Watch Area Decision — Liked Preview Buttons V6.39

Recorded during the Watch-area audit after testing `liked-watch-shell-v6-39-test.html`.

## Decision

The Liked page does not need the Watchlist and Favourite buttons to open their pages at this stage.

## Reason

For the current Watch-area shell audit, Watchlist/Favourite/Unlike buttons on the Liked page are preview-only safety buttons.

They should confirm that the action exists visually, but they should not yet perform navigation or writes.

## Required for V6.39 Liked pass

- Page loads as `V6.39 Liked Watch Shell TEST`
- Shared menu works
- Search overlay works while typing
- Joined `🎬 Stream Bandit` account block appears
- Saved Liked cards or Link Test cards appear
- Details opens `details-watch-shell-v6-33-test.html`
- Play opens `player-watch-shell-v6-34-test.html`
- No Edit route
- Unlike is preview-only
- Watchlist and Favourite are preview-only
- Tabs switch
- No real like/unlike/favourite/watchlist/save/write/live/index action

## Future final wiring

Later, after auth/profile save rules are fully approved, Watchlist/Favourite/Unlike can become real Supabase actions or page navigation if deliberately chosen.

For now, this behaviour is a pass, not a fail.
