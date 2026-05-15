# Stream Bandit Route Registry — V6.90.12 Browse / Player 2 Checkpoint

Status: test registry checkpoint. Do not promote live from this file alone.

Last confirmed by Trevor:
- Genres Direct Canonical V6.90.12 passed.
- Player 2 Progress Helper V6.78.9.3 passed.
- Code scan passed after Trevor test.

---

## Working process rule

1. Scan the page and identify what is wrong or missing.
2. Pull it into a test route, correct it, and add all functions it should have.
3. Trevor tests the exact checklist.
4. Run code scan/check.
5. When a whole menu area/group passes, then promote.
6. No live/index promotion before full group pass.

---

## Player routing rules

### Player 1 — single-video player

Route:

```text
player-watch-shell-v6-34-test.html
```

Purpose:

- One movie/video only.
- Normal movie-card Play.
- Details Play.
- Watchlist / Favourites / Likes Play.
- Continue Watching resume.
- Watch History resume.
- Direct movie open.

Protected rule:

- Do not disturb the passed Watch group while Browse work continues.
- Player 1 remains the normal single-video route.

---

### Player 2 — queue / Play All player

Current accepted route:

```text
player-2-progress-helper-v6-78-9-3-test.html
```

Purpose:

- Multi-video queues only.
- Play All flows only.
- Real queue mode only.

Currently used by:

- Genres Play All.

Future use:

- Channels Play All.
- Playlists Play All.
- Collections Play All.
- Curated rows / Search Play All, when added.

Queue storage keys:

```text
streamBanditQueueV1
streamBanditUpNextV1
```

Progress storage key:

```text
stream-bandit-progress-v6-73
```

Player 2 rules:

- Must stay standalone.
- Do not import Player 1 helper scripts.
- Do not import old V6.78.3 bottom polish helper.
- Must keep one queue panel only.
- Must save progress before Next / Previous / Play This / Replay navigation.
- Must read saved progress on reopen.

---

## Browse group routes

### Genres — current accepted candidate

Route:

```text
genres-direct-canonical-v6-90-12-test.html
```

Status:

- Trevor test passed.
- Code scan passed.
- Direct full page, no wrapper/loader.

Functions included:

- Load genres from `sb_movies.genres`.
- Search genres.
- Sort genres.
- Reload genres.
- Normal movie-card Play -> Player 1.
- Play All -> Player 2.
- Create Genre -> adds genre text to selected movie row.
- Remove Genre from one selected movie -> removes genre text only.
- Delete Genre Everywhere -> requires `DELETE GENRE` confirmation and removes genre text from affected movie rows only.

Safety rules:

- No movie delete.
- No schema/table delete.
- No storage action.
- No billing action.
- No live/index action.

Fallback / older test routes:

```text
genres-create-remove-v6-90-9-test.html
genres-player-2-progress-helper-v6-90-11-test.html
genres-player-2-cleanup-v6-90-8-1-test.html
genres-player-2-standalone-v6-90-7-test.html
genres-player-2-label-authority-v6-90-6-test.html
genres-player-2-route-polish-v6-90-5-test.html
genres-queue-stay-tab-route-v6-90-4-test.html
genres-queue-navigation-route-v6-90-3-test.html
genres-queue-reader-route-v6-90-2-test.html
genres-queue-chip-fix-v6-90-1-test.html
```

Fallback note:

- The older wrapper/loader routes are test history only.
- Important route candidates should be direct full pages, not nested loaders.

---

## Form UI rule

Apply overlay/modal or slide-over form pattern to actual forms where appropriate.

Applies to:

- Edit forms.
- Create forms.
- Manager forms.
- Upload forms.
- Admin forms.
- Metadata forms.

Does not apply to:

- Filters.
- Search boxes.
- Sort controls.
- Lightweight page controls.

Preferred form pattern:

- Open form in overlay/modal or slide-over.
- Keep page context visible behind it.
- Clear Save / Cancel / Close actions.
- Avoid messy full-page inline forms unless there is a strong reason.

Future known target:

- Supabase Library Edit Movie should open in an overlay/modal.

---

## Supabase Library future note

When the Supabase Library page is scanned/upgraded:

- Add Edit Movie action.
- Edit should open in overlay/modal.
- Do not navigate away for editing.
- Useful edit fields may include title, description, thumbnail/poster URL, genres, tags, source URL/Mux/HLS, status, featured, channel where appropriate.
- Keep destructive delete separate and only add after its own safe test.

---

## Promotion status

Do not promote live/index yet.

Browse group is in progress. Genres + Player 2 checkpoint is passed and registry-recorded, but remaining Browse pages still need scan/test before group promotion.
