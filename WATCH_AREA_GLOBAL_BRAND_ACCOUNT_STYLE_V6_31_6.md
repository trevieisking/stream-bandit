# Stream Bandit Global Brand / Account Style — V6.31.6

Accepted during the Watch-area audit on the Favourites V6.38 page.

## Accepted style

The top-left header identity should use one joined brand/account block:

- Fixed Stream Bandit base logo/icon: `🎬`
- Fixed wording: `Stream Bandit`
- Account state joined inside the same block
- Account button inside the same block
- Role/admin state visible
- No page-specific icon in the header brand block
- Page-specific icon stays in the page hero/title area only

## Why

This prevents pages like Favourites from showing the Favourites star as the main app logo. The app header should always represent Stream Bandit, while the page hero can use page icons such as Home, Favourites, Watchlist, etc.

## Current implementation

Shared file:

- `stream-bandit-auth-profile-v6-31.js`

Accepted version:

- `V6.31.6 Auth/Profile Shell Add-on`

Commit:

- `daa0aa26b181436cfb8d91fd7f965c8acbfb8845`

## Apply to all pages

Any new Watch/Browse/Creator/Admin test page that loads `stream-bandit-auth-profile-v6-31.js` should inherit this global header style automatically.

Before the final RC/live replacement, smoke test every area to confirm:

- Search remains on the right
- Brand/account block stays left
- Stream Bandit wording is visible
- Account opens correctly
- Signed-in/admin role appears
- Page-specific hero icons remain separate from the global app logo

## Watch-area status at acceptance

Passed so far:

1. Home — `home-watch-shell-v6-32-test.html`
2. Details — `details-watch-shell-v6-33-test.html`
3. Player — `player-watch-shell-v6-34-test.html`
4. Continue Watching — `continue-watching-watch-shell-v6-35-test.html`
5. Watch History — `watch-history-watch-shell-v6-36-test.html`
6. Watchlist — `watchlist-watch-shell-v6-37-test.html`
7. Favourites — `favourites-watch-shell-v6-38-test.html`

Remaining Watch pages:

8. Liked
9. Accessibility

Registry update is still held until the whole Watch area passes.
