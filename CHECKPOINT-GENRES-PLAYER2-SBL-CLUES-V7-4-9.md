# Stream Bandit Checkpoint — Genres Player 2 + SBL Clues

Date: 2026-05-20

## Why Genres is important

Genres is where Play All / Player 2 first worked properly. It is useful as a clue page for the later Supabase Library repair.

Current Genres route:

- `genres-browse-shell-v6-44-test.html` -> `genres-direct-canonical-v6-90-12-test.html`

## How Genres Player 2 works

Genres has a real selected group context:

- `active` = selected genre name
- selected rows = movies where `sb_movies.genres` contains the selected genre

When Play All runs, Genres builds a real queue payload first and saves it to storage:

- `sessionStorage.streamBanditQueueV1`
- `sessionStorage.streamBanditUpNextV1`
- `localStorage.streamBanditQueueV1`
- `localStorage.streamBanditUpNextV1`

Payload shape:

```js
{
  type: 'genre',
  version: 'V6.90.12',
  genre: active,
  createdAt: new Date().toISOString(),
  currentIndex: 0,
  items: rows.map((m, i) => ({
    id: String(m.id),
    title: m.title || 'Untitled',
    source: firstUrl(m),
    poster: poster(m),
    genres: movieGenres(m),
    index: i
  }))
}
```

Then it opens Player 2 with:

```txt
player-2-progress-helper-v6-78-9-3-test.html?id=<firstMovieId>&queue=genre&genre=<activeGenre>&qi=0&tab=queue
```

## Why Supabase Library Play All failed

Supabase Library tried to behave like a group owner by sending a fake queue value such as `queue=library`.

Player 2 then failed with:

```txt
invalid input syntax for type uuid: "library"
```

This proves Player 2 needs one of these:

1. A real queue payload already stored in session/local storage, or
2. A real group owner/id that Player 2 knows how to resolve.

It should not be given fake queue ids such as `library`.

## Locked rule for SBL

Supabase Library is browse/editor only.

- Keep Supabase Library connected to Supabase at all costs.
- Do not wrapper-patch SBL.
- Do not hand-rebuild SBL casually.
- Future repair should use full current SBL code and table/column screenshots.
- Remove Play All from SBL unless a deliberate real queue-payload feature is designed.
- Card Play should stay Player 1.
- Details should open Details V7.3.1.

## Genres risk profile

Genres is easier than SBL/Web Builder but is still not a casual page because it writes to `sb_movies.genres`.

Write tools found:

- Create Genre: adds genre to selected movie.
- Remove From Selected Movie: removes genre from one movie.
- Delete Genre Everywhere: removes genre text from every affected movie row after confirmation.

No movie delete/schema/storage/live action is present in the Genres page.

## Future V7 Genres pass

A safe V7 Genres pass should:

- Keep the working queue payload logic.
- Update normal Play route to Player 1 V7.3.3.
- Update Details route to Details V7.3.1.
- Update Player 2 route to Player 2 V7.3.4 only after checking Player 2 queue payload compatibility.
- Add global helper status.
- Keep Create/Remove/Delete Genre tools only if Trevor deliberately wants Genres to remain a management page.
- Consider a separate read-only Browse Genres page later if needed.
