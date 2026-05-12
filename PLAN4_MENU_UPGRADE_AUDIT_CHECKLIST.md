# Stream Bandit Plan 4 Menu Upgrade Audit Checklist

Status file for the new page-by-page Menu Upgrade Audit.

This checklist follows Trevor's confirmed rule from V5.85.2 and V5.89.1:

- Use the full-height pop-out drawer menu.
- Drawer touches the top and bottom of the browser window.
- Drawer replaces only the heavy top page-link navigation.
- Lower in-page tabs stay.
- Small global search goes top-right.
- Every upgraded page is a new version/test file.
- Original passed audit files stay untouched.
- No live promotion.
- No `index.html` edit.
- No file deletion.
- No Supabase/Auth/Mux/Storage writes until explicitly approved.
- Settings Studio must remain linked because it will control branding, player style and future platform-builder settings.
- Audio boost, accessibility and player comfort are protected.
- Do not patch HLS directly after the old MANIFEST_PARSED crash; use monitor-only player/buffer visibility unless a safer plan is approved.

---

## Current progress

| # | Page / area | Original source | New upgrade file | Status | Notes |
|---|---|---|---|---|---|
| 1 | Library | `library-standalone-v5-47-link-test.html` | `library-menu-upgrade-v5-86-test.html` | PASSED | Drawer/menu, lower tabs, search/filter/sort, Details/Play preserved. |
| 2 | Home | `home-standalone-v5-47-link-test.html` | `home-menu-upgrade-v5-87-1-test.html` | PASSED / first ready-to-connect page | Spotlight and cards have Details, Play, Edit, Watchlist, Favourite, Like preview actions. |
| 3 | Details | `details-standalone-v5-45-2-test.html` | `details-menu-upgrade-v5-88-1-test.html` | PASSED | Edit/Watchlist/Favourite/Like/Player Comfort/Copy ID visible. Trailer lives in Trailer tab. |
| 4 | Player / Watch | `watch-standalone-v5-46-test.html` | `watch-player-upgrade-v5-89-1-test.html` | BUILT / TESTING | Full menu fixed. Includes Settings Studio/Branding. Custom player, audio boost, fullscreen, PiP, buffer monitor. |

---

## Pages still to upgrade

### Watch group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 5 | Continue Watching | `continue-watching-standalone-v5-48-test.html` | New version TBD | Resume cards, progress UI, Details/Play/Edit actions, no fake progress writes until approved. |
| 6 | Watch History | `watch-history-standalone-v5-58-test.html` | New version TBD | History rows, Details/Play actions, clear history disabled/no-write unless approved. |
| 7 | Watchlist | `watchlist-standalone-v5-49-test.html` | New version TBD | Saved items view, Details/Play/Edit actions, remove button no-write preview unless auth save safety ready. |
| 8 | Favourites | `favourites-standalone-v5-50-test.html` | New version TBD | Favourite items view, Details/Play/Edit actions, remove no-write preview. |
| 9 | Liked | `liked-standalone-v5-51-test.html` | New version TBD | Liked items view, Details/Play/Edit actions, remove no-write preview. |
| 10 | Accessibility | `accessibility-standalone-v5-55-test.html` | New version TBD | Audio boost, captions/readability, player comfort, deaf-accessibility protections. |

### Browse group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 11 | About | `about-standalone-v5-54-test.html` | New version TBD | Platform explanation, builder direction, clean no-write page. |
| 12 | Supabase Library | `supabase-library-standalone-v5-56-test.html` | New version TBD | Supabase rows, Details/Play/Edit actions, source info, no writes. |
| 13 | Genres | `genres-standalone-v5-57-test.html` | New version TBD | Genre rows, counts, Play/Details actions, lower tabs, link to Genre Creator Studio. |
| 14 | Channels | `channels-standalone-v5-52-test.html` | New version TBD | Channel cards, creator links, channel queue rules later, no unsafe writes. |
| 15 | Collections | `collections-standalone-v5-59-test.html` | New version TBD | Collection cards, real matched titles only, Details/Play actions. |
| 16 | Playlists | `playlists-standalone-v5-60-test.html` | New version TBD | Playlist cards, open playlist reveals matched titles only, Play All later only after queue safety. |

### Creator group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 17 | My Channel | `my-channel-standalone-v5-61-test.html` | New version TBD | Use `sb_profiles`, creator profile, approved videos, avatar/banner notes, no legacy profiles. |
| 18 | Submit Video | `submit-video-standalone-v5-71-test.html` | New version TBD | Submit form preview, URL/upload paths, lockdown/no writes until ready. |
| 19 | Review Queue | `review-queue-standalone-v5-73-test.html` | New version TBD | Moderation view, approve/reject later only after safety. |

### Supabase group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 20 | Supabase Manager | `supabase-manager-standalone-v5-62-test.html` | New version TBD | Admin metadata/edit route, safe writes only after approval, source URLs, image fields. |
| 21 | Supabase Test | `supabase-test-standalone-v5-63-test.html` | New version TBD | Connection/profile tests, `sb_profiles` rule, no legacy profile confusion. |
| 22 | Supabase Migration | `supabase-migration-standalone-v5-65-test.html` | New version TBD | Historic/locked migration route, no accidental reruns. |
| 23 | Health Check | `health-check-standalone-v5-74-test.html` | New version TBD | Read-only app health, source checks, safe status only. |

### Mux / Video group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 24 | Mux Manager | `mux-manager-standalone-v5-66-test.html` | New version TBD | Mux URL/HLS/public playback, no Mux secrets in frontend. |
| 25 | Upload Plan | `upload-plan-standalone-v5-67-test.html` | New version TBD | Upload strategy, image vs video storage rules, Mux/Supabase split. |

### Storage / Safety group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 26 | Local Storage | `local-storage-standalone-v5-68-test.html` | New version TBD | Legacy keys read-only/info only. |
| 27 | Storage Prep | `storage-prep-standalone-v5-69-test.html` | New version TBD | Supabase image bucket/artwork rules. |
| 28 | Backup / Safety | `backup-safety-standalone-v5-70-test.html` | New version TBD | Backup/checklist protections before any cleanup/live. |
| 29 | Live Readiness | `live-readiness-standalone-v5-64-test.html` | New version TBD | No live promotion wording/actions until RC and Trevor approval. |

### Admin Tools group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 30 | Admin Centre | `admin-centre-v5-40-3-test.html` | New version TBD | Admin hub, no unsafe writes, route hub. |
| 31 | Test Checklist | `test-checklist-standalone-v5-75-test.html` | New version TBD | Manual QA checklist for upgraded pages. |
| 32 | Rules | `rules-standalone-v5-72-test.html` | New version TBD | Submission/review rules and safety gates. |
| 33 | Tools Page | `tools-centre-v5-24-2-test.html` | New version TBD | Tools hub if needed; protect favourite tools. |
| 34 | Favourite Tools | `tools-v5-24-1.html` | KEEP / PROTECTED | Do not delete or overwrite. Favourite working Tools page. |

### Settings group

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 35 | Settings Passed | `settings-standalone-v5-77-test.html` | New version TBD | Real Settings page, lower tabs stay, source of platform settings later. |
| 36 | Settings Studio / Branding | `settings-controls-v5-81-test.html` | New version TBD / keep linked | Interactive Settings Studio controls branding, theme, player style, platform-builder settings later. It must affect all pages once connected. |

### Recovery / control pages

| # | Page / area | Current source | Target upgrade | Must keep / add |
|---|---|---|---|---|
| 37 | Recovery Bridge | `plan4-recovery-bridge-v5-84-test.html` | New version TBD | Bridge/control hub for audit + previews. |
| 38 | Global Search | `global-search-v5-80-test.html` | New version TBD | Shared global search source for all pages. |
| 39 | Final Shell Preview | `final-shell-navigation-v5-79-test.html` | New version TBD | Shell/navigation preview, now informed by drawer rule. |
| 40 | Upload + URL Options | `upload-url-options-v5-82-test.html` | New version TBD | Upload/URL options used by Admin/Submit/Settings/My Channel. |
| 41 | Genre Creator Studio | `genre-tools-v5-83-test.html` | New version TBD | Genre creation/packs/tools, must connect to Genres later. |
| 42 | Plan 4 Master Map | `plan4-master-map-test.html` | KEEP / update only if planned | Source anchor: audit 32/32 passed, clean layout 32/32. |
| 43 | Plan 4 Link Audit | `plan4-link-audit-test.html` | KEEP / update only if planned | Original link/layout source. |

---

## Rollout rule per page

For every page upgrade:

1. Create a new version/test file.
2. Keep original passed file untouched.
3. Add the full-height drawer menu.
4. Remove only heavy top page-link buttons.
5. Keep lower in-page tabs.
6. Add small top-right global search.
7. Add visible Details / Play / Edit actions where movie cards or movie details exist.
8. Add Watchlist / Favourite / Like as no-write preview actions until auth/profile safety is ready.
9. Link Settings Studio where branding/player/site settings matter.
10. Preserve page-specific functionality.
11. No writes unless explicitly approved for that page.
12. Trevor tests, then mark PASS/HOLD.

---

## Near-term queue

1. Finish testing `watch-player-upgrade-v5-89-1-test.html`.
2. Upgrade Continue Watching.
3. Upgrade Watch History.
4. Upgrade Watchlist.
5. Upgrade Favourites.
6. Upgrade Liked.
7. Upgrade Accessibility because audio/player comfort is protected.
8. Upgrade Genres and Settings soon because they drive platform builder/customization.

---

## Ready-to-connect meaning

A page is ready-to-connect when:

- It opens on GitHub Pages.
- Drawer menu works and has the full required menu.
- Lower tabs still work.
- Top-right global search works.
- Movie pages show Details / Play / Edit / save-preview actions.
- No accidental write actions exist.
- Page-specific content still works.
- Trevor confirms PASS.

Ready-to-connect does not mean live promotion. Live promotion only happens after RC, smoke test, backup, and Trevor explicitly says promote live.
