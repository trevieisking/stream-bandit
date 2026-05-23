# Stream Bandit Checkpoint — Custom Domain + Supabase Auth Login PASSED V7.12.9

Date: 2026-05-23

## Result

Custom domain HTTPS and Supabase Auth login passed.

Trevor confirmed with screenshot evidence that the app loads on the new HTTPS custom domain and the account/profile helpers work after login.

## Passed checks

```txt
GitHub Pages DNS check successful
HTTPS custom domain working
Supabase Site URL updated to https://chatterfriendsstreambandit.co.uk/
Supabase redirect URLs include custom domain HTTPS root and wildcard routes
Magic-link login returned correctly
Account/Profile helper loaded
Avatar/profile visible
Shared style/theme applied
Signed in: Yes
Watchlist/Favourites/Likes counts visible
```

## Safe current custom domain

```txt
https://chatterfriendsstreambandit.co.uk/
```

## Confirmed test page context

The working login/theme check was seen on the Home Direct Global Helpers test page.

## Important notes

The old GitHub Pages redirect URLs remain as fallback for now.

Do not remove old HTTP or GitHub fallback redirects until multiple normal pages have passed on the custom domain.

## Safety

No Supabase SQL was run.
No Supabase rows were edited.
No RLS policies were changed.
No live/index promotion was performed in this checkpoint.
