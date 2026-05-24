# CHECKPOINT END OF DAY V7.12.46 — WATCH + BROWSE PASSED, NEXT MENU GROUP PLAN

Date: 2026-05-24

## Current live/pass status

Today ended with the Watch group and Browse group passed and promoted to `index.html`.

Current live entry:

- `index.html` now redirects to `home-global-helpers-v7-4-4-test.html`.
- Backup created before index promotion:
  - `backups/index-before-watch-browse-v7-12-46-2026-05-24.html`

Important note:

- The shared shell big replacement was blocked by the tool safety checker when trying to directly promote About inside `stream-bandit-shell-v6-24.js`.
- This is not a functional blocker because `about-global-helpers-v7-4-7-test.html` was retired and now forwards to `about-clean-machine-v7-12-46-test.html`.
- Next safe manual/full-file shell edit should change the route directly from `about-global-helpers-v7-4-7-test.html` to `about-clean-machine-v7-12-46-test.html`.

## Rules locked for the rest of this pass

These are the working project rules for every remaining page and menu group:

1. Start by scanning the project/page until we are comfortable, normally using Route Pointer or Route Guard.
2. Build a complete test page when a page fails; do not blindly patch partial code.
3. Keep page-owned properties on the page that owns them. Do not duplicate page ownership across the platform.
4. Global shell items must stay global and site-wide:
   - overlay menu,
   - header/search,
   - footer links,
   - favicon,
   - brand/logo builder behaviour,
   - shared settings bridge.
5. The pass is the pass. If Trevor tests a page and marks it passed, record it and do not keep second-guessing it unless a scanner finds a real blocker.
6. Build `test.html`/test page first; Trevor tests until it passes.
7. After a page passes, run a final route/code check and promote that passed page to the overlay menu.
8. Never add back old model buttons or old-version buttons.
9. All visitor forms must use the info mailbox flow.
10. If the tool blocks a big file, Trevor can paste a full replacement into GitHub manually. The instruction should be clear: `Trev please Edit: filename`, then provide the full replacement or exact safe edit.
11. No back-to-old-version buttons on pages.
12. Any page that does not fail the current pass gets recorded as passed under the current checkpoint.
13. When a full overlay menu group passes, back up `index.html`, then promote that full group to `index.html`.
14. Every group batch ends with Route Guard / Route Pointer so we keep reducing bad routes instead of guessing.
15. No live/index promotion happens mid-page. Live/index promotion happens only at group completion.

## What we achieved today

### Supabase policy/public-reader flow

- Confirmed `sb_policy_documents` exists in Supabase.
- Confirmed policy rows save and survive refresh through the admin save editor.
- Proved the public reader path with a published Accessibility policy row.
- Verified the reader can show `source: supabase-published`.
- Kept footer/global promotion locked during the policy proof stage.

### Policy/admin pages

- Policy Admin Save Editor flow was tested and proved admin-only save to Supabase.
- Public reader proof was built/tested for published policy rows.
- No global footer promotion was made during the policy proof.

### Route scanners and machines

Built and used the scanning/route tools that now guide the project:

- V7.12.28 Control Tower Route + Button Link Audit.
- V7.12.29 Route Doctor.
- V7.12.30 cleaner Route Doctor pass.
- V7.12.31 Machine Gated Route Doctor.
- V7.12.32 Live Machine Route Doctor.
- V7.12.35 / V7.12.36 Route Pointer Machine.

Decision locked:

- Route Pointer is the one-page-at-a-time fixing guide.
- Route Guard / Route Doctor is the end-of-batch scanner.
- We do not rebuild ten machines. One accurate Route Pointer + one Route Guard style scanner is enough.

### Supabase Library fix

- Supabase Library form fix was tested.
- Trevor confirmed multiple fields could be edited and saved.
- Current passed route:
  - `supabase-library-home-header-form-fix-v7-12-34-test.html`

### Watch group pass

Watch group is passed and recorded:

- Home: `home-global-helpers-v7-4-4-test.html`
- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Liked: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

Confirmed rules on Watch pages:

- Home-style header.
- Global helpers loaded.
- Search goes to current Global Search.
- Details opens Clean Details.
- Play opens current Player 1.
- Watchlist/Favourite/Like personal behaviour stays.
- No old library route.
- No Play All on saved-list pages.
- No live/index promotion until group pass.

### Browse group pass

Browse group is passed and recorded:

- Library: `library-global-helpers-v7-4-8-test.html`
- Supabase Library: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-clean-machine-v7-12-46-test.html`

About final pass includes:

- Home-style header/search corrected.
- Policy & FAQ Centre link.
- Published Policy Proof link where needed.
- Contact Us overlay form.
- Request a Title overlay form with Title, Year, Email and Notes.
- Email draft only.
- No Supabase writes.
- No old Accessibility route.

### Index promotion

- The restored rule was applied: a full group pass can promote to `index.html` after backup.
- Watch + Browse were promoted to index.
- `index.html` now loads clean Home instead of old `home-watch-shell-v6-32-test.html`.

## Remaining menu groups and exact plan

The rest of the pass is now menu-group based. Every page goes through the same flow:

1. Open Route Pointer.
2. Select the source page from the overlay menu group.
3. Scan the selected page.
4. If bad candidates are zero and the page works, record it as passed.
5. If bad candidates are real blockers, build a complete clean test page.
6. Trevor tests the page.
7. When passed, checkpoint it.
8. Promote the clean route to the overlay menu.
9. Retire old routes only when safe.
10. When the full group passes, back up `index.html` and promote that group to index.

## Next group: GROUP PLAY

Group Play has 5 pages:

1. Playlists
2. Channels
3. My Channel
4. Collections
5. Player 2

### Group Play ownership rules

- Group playback belongs here, not to Watchlist/Favourites/Liked.
- Player 2 is the group/queue player.
- Play All belongs to Playlists, Channels, My Channel and Collections when appropriate.
- Personal saved-list pages must not borrow Group Play ownership.
- Group Play pages must not route back to old Browse/Creator V6 pages unless those are known support routes and deliberately allowed.

### Group Play test rules per page

For each page test:

- Home-style header.
- Overlay menu opens.
- Search opens current Global Search.
- Page data loads.
- Cards/rows open Clean Details where relevant.
- Single-title Play opens Player 1 where relevant.
- Play All / queue opens Player 2 where relevant.
- No old model buttons.
- No back-to-old-version buttons.
- No broken old V5/V6 route unless it is a known support route.
- No blind Supabase writes.
- If the page edits data, edits must be page-owned and deliberate.

### Group Play page order

#### 1. Playlists

Route Pointer scan first.

Expected targets:

- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-progress-helper-v6-78-9-4-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Search: `global-search-global-helpers-v7-4-9-test.html`

If current page passes, record it. If not, build clean Playlists test page.

#### 2. Channels

Route Pointer scan after Playlists.

Rules:

- Channel rows/cards must open current channel/detail/player routes.
- Channel Play All must use Player 2.
- No old channel image-column fix route unless retired/forwarded safely.

#### 3. My Channel

Route Pointer scan after Channels.

Rules:

- My Channel owns creator profile/channel display.
- Approved videos/submissions must point to current clean routes.
- Play All uses Player 2.
- It must not borrow Review Queue ownership unless only linking to the current Review Queue page.

#### 4. Collections

Route Pointer scan after My Channel.

Rules:

- Collections owns grouped title sets.
- Collection Play All uses Player 2.
- Collection single play uses Player 1.
- Details use Clean Details.
- Remove/edit behaviour must be page-owned.

#### 5. Player 2

Route Pointer scan last for Group Play.

Rules:

- Player 2 is the group/queue player.
- It must keep progress/helper behaviour that currently works.
- It should not overwrite Player 1 ownership.
- No old group-player route buttons.

Group Play completion:

- Run Route Guard / Route Pointer after Player 2 passes.
- Save Group Play passed checkpoint.
- Back up `index.html`.
- Promote Group Play into `index.html`.

## Next group after Group Play: CREATOR

Creator has 3 pages:

1. Submit Video
2. Rules
3. Review Queue

### Creator ownership rules

- Submit Video owns creator submissions/intake.
- Rules owns creator rules wording/display.
- Review Queue owns review/admin decision workflow.
- Creator pages may write only when they are intentionally form/save/admin pages.
- Visitor-facing creator rules should stay read-only.

### Creator test rules

- Home-style header.
- Overlay menu opens.
- Search opens Global Search.
- Submit Video form points to the correct Supabase submission flow if enabled.
- Review Queue must not accidentally publish or delete without deliberate page-owned control.
- Rules must not route back to old creator shell.
- No old model buttons.

Creator completion:

- Route Guard scan.
- Creator checkpoint.
- Back up index.
- Promote Creator group to index.

## Next group after Creator: SETTINGS

Settings has 8 pages:

1. Settings
2. Settings Studio
3. Profile Settings
4. Web Builder
5. Clean Machine Menu
6. Route Guard Proof
7. Route Pointer Machine
8. Final Shell Navigation

### Settings ownership rules

- Settings owns global settings controls.
- Settings Studio owns theme/branding control design.
- Profile Settings owns user profile/avatar/account display settings.
- Web Builder owns global display/theme and page/form layout builder ideas.
- Clean Machine Menu owns current clean menu display.
- Route Guard and Route Pointer are diagnostics only.
- Final Shell Navigation is navigation verification only.

### Settings test rules

- Header must match Home.
- Overlay must work.
- Search must work.
- Global settings must affect pages where intended, not just Settings page.
- Logo/favicon/brand rules must remain global.
- Diagnostic pages must not write.
- Settings save pages may write only their page-owned data.
- No old shell/admin pages unless retired safely.

Settings completion:

- Run Route Guard after all 8 pages.
- Save Settings checkpoint.
- Back up index.
- Promote Settings group to index.

## Next group after Settings: POLICY

Policy has 3 pages:

1. Policy & FAQ Centre
2. Policy Admin Editor
3. Published Policy Proof

### Policy ownership rules

- Policy Centre owns policy text, terms, privacy, cookies, family watch, cancellation and creator wording.
- Policy Admin Editor owns admin-only policy editing.
- Published Policy Proof owns read-only public proof from Supabase published rows.
- Global footer must only link to policies; it must not duplicate policy wording.
- Policy pages must keep legal review flags clear.

### Policy test rules

- Public policy pages read published rows where intended.
- Admin editor requires Supabase Auth + profile role + RLS.
- No frontend password.
- No footer promotion until policy text and public reader pass.
- No accidental draft-to-public promotion.

Policy completion:

- Route Guard scan.
- Policy checkpoint.
- Back up index.
- Promote Policy group to index.

## Next group after Policy: USER MANAGEMENT

User Management has 3 pages:

1. User Dashboard Concept
2. Fair Pricing Matrix
3. Permissions Matrix

### User Management ownership rules

- User Dashboard owns user-facing account/subscription/status concept.
- Pricing Matrix owns plans/pricing display only unless deliberately connected later.
- Permissions Matrix owns role/permission explanation.
- These pages should be read-only unless a future backend task deliberately upgrades them.

### User Management test rules

- Header/overlay/search match Home.
- No fake save flows.
- No old admin routes.
- No accidental payment/subscription claims.
- No Supabase writes unless deliberately added later.

User Management completion:

- Route Guard scan.
- User Management checkpoint.
- Back up index.
- Promote User Management group to index.

## Final group: ADMIN

Admin has 9 pages:

1. Admin Centre
2. Live Readiness
3. All Pages Version Registry
4. Test Checklist
5. Tools Page
6. Health Check
7. Mux Manager
8. Storage Prep
9. Backup / Safety

### Admin ownership rules

- Admin Centre owns admin command/navigation.
- Live Readiness owns release readiness checks.
- Version Registry owns version records.
- Test Checklist owns manual QA checklist.
- Tools Page owns admin tools list.
- Health Check owns diagnostics/readiness.
- Mux Manager owns Mux/HLS/video management flow.
- Storage Prep owns Supabase storage setup/support.
- Backup/Safety owns restore/backup instructions.

### Admin test rules

- Header/overlay/search match Home.
- Admin-only pages must not expose unsafe public controls.
- Read-only diagnostics must stay read-only.
- Mux Manager must not promise unavailable uploads unless the flow is genuinely wired.
- Storage Prep must not make secret keys public.
- Backup/Safety must clearly show what is safe to do.
- No old admin-shell route buttons.

Admin completion:

- Route Guard final scan.
- Admin checkpoint.
- Back up index.
- Promote Admin group to index.
- Run full overlay menu smoke test.
- Run final `index.html` smoke test.

## Final release candidate after all groups pass

When all menu groups pass:

1. Run Route Guard / Route Pointer against current live machine.
2. Confirm bad route count is zero or only approved safe map/root candidates.
3. Confirm every overlay menu group opens from Home.
4. Confirm Search works site-wide.
5. Confirm About forms open email drafts.
6. Confirm policy reader works for published policy row.
7. Confirm Supabase Library still saves multiple fields.
8. Confirm Watchlist/Favourites/Liked still work.
9. Confirm Player 1 and Player 2 still work.
10. Confirm no old model buttons are visible.
11. Create final full checkpoint.
12. Create final backup/source copy.
13. Only then treat it as an RC/live candidate.
