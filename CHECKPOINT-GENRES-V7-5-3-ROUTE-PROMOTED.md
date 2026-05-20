# Stream Bandit Checkpoint — Genres V7.5.3 Route Promoted

Date: 2026-05-20

## Result

Genres route has been promoted safely for the final run-through.

## Route chain

- `genres-browse-shell-v6-44-test.html`
- now forwards to `genres-global-helpers-v7-5-3-test.html`
- which links to protected canonical page `genres-direct-canonical-v6-90-12-test.html`

## Why this was the safest move

Genres is not a simple read-only page. It reads Supabase movies and also contains genre management tools:

- reads `sb_movies`
- builds genre list from `sb_movies.genres`
- opens selected genre rows
- Create Genre adds a genre to one selected movie
- Remove From Selected Movie removes a genre from one movie row
- Delete Genre Everywhere removes genre text from affected movie rows after confirmation
- card Details opens the current Details route through existing route forwards
- card Play opens Player 1 through existing route forwards
- Play All builds a real stored genre queue payload and opens Player 2

Because the Player 2 genre queue logic is hard-won and useful as the clue pattern for later group pages, this pass did not rewrite the canonical Genres manager.

## Protected page

Do not casually edit:

- `genres-direct-canonical-v6-90-12-test.html`

That page contains the working Supabase genre reads/writes and the working Player 2 genre queue payload logic.

## Created

- `genres-global-helpers-v7-5-3-test.html`

This is a route wrapper/checkpoint page. It records the global-settings pass rule and loads shared shell/profile/menu helper scripts where practical, but it does not alter the protected canonical Genres manager.

## Updated

- `genres-browse-shell-v6-44-test.html`

It now forwards to the V7.5.3 wrapper instead of directly to V6.90.12.

## Global settings pass rule

This final run-through must make main/global settings affect other pages by the end of the pass.

For Genres, the safe V7.5.3 step records that rule and keeps the protected manager stable. A later deliberate global settings wiring pass should check theme, logo/brand, accessibility/player comfort, profile/auth state and menu/header state across the whole app shell.

Do not force that directly into the protected Genres manager until the shared global settings source is deliberately wired and tested.

## Test checklist for Trevor

1. Open `genres-browse-shell-v6-44-test.html`.
2. Confirm it forwards to `genres-global-helpers-v7-5-3-test.html`.
3. Confirm the wrapper loads and mentions global settings pass rule.
4. Click `Open Genres V6.90.12`.
5. Confirm genre list loads.
6. Open a genre.
7. Confirm movies show.
8. Click Details on a video.
9. Click single Play on a video.
10. Click Play All in Player 2.

## Do not test first unless deliberate

These are write tools and should only be tested when Trevor is ready:

- Create Genre
- Remove From Selected Movie
- Delete Genre Everywhere

## Live status

No live/index promotion was performed.

## Next safest target

After Genres passes, the next safest target is likely either:

1. Global Search route review, because it is read-only Supabase movie search, or
2. Playlists route, but only as a cautious read/route/queue test because it is complex and currently on research hold.

Supabase Library remains protected and should not be touched casually.