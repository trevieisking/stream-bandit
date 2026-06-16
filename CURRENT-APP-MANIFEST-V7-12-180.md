# Stream Bandit Current App Manifest V7.12.300.14

Date: 2026-06-16

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.300.14 Admin Group Promoted To Index Candidate Tracker / Owner Group Later`

The main app rail rollout has now recorded all previously passed groups plus the completed Admin group as live-ready candidates so they can be tracked clearly before final live/homepage promotion.

These are candidate records only. This manifest update does not promote `index.html` to a final live homepage and does not change production behaviour. Root still redirects to Home.

Current next target group:

`Owner - later, PDF-guided rail and usefulness pass`

Owner group is intentionally deferred because the rail needs a different pass and the owner/user-management/Web Builder completion work changes more page behaviour than the Admin utility rail pass.

## Current scanner rule

For every Supabase-touching page, use the owner-provided `sb_table 1` scanner before editing.

Scanner checks to preserve before any page change:

- route load status
- tables touched
- read tables
- write tables
- auth flag
- storage flag
- write flag
- RPC flag
- overlay flag
- unknown table tokens

No page change should add schema, RLS, storage policy, bucket policy, service-role, live-home promotion, or OpenAI/API keys.

## Current `sb_table 1` scan snapshot

Latest scanner:

`V7.12.300 SB Table Route Scanner`

Known table list:

- `sb_admin_audit_log`
- `sb_app_settings`
- `sb_channels`
- `sb_collection_movies`
- `sb_collections`
- `sb_favourites`
- `sb_form_submissions`
- `sb_genres`
- `sb_import_batches`
- `sb_likes`
- `sb_movies`
- `sb_playlist_movies`
- `sb_playlists`
- `sb_policy_documents`
- `sb_private_messages`
- `sb_profiles`
- `sb_site_pages`
- `sb_submissions`
- `sb_user_friends`
- `sb_watch_progress`
- `sb_watchlist`

Unknown table tokens remain scanner/reference signals and must not be treated as proof of new schema work without inspecting the page source.

## File-count / cleanup rule

Do not grow the repository with endless checkpoint or page files. Routine carry-on memory goes into this manifest. Create a checkpoint only when a pass needs a separate record, and clear one clearly obsolete old checkpoint in the same cleanup pass. Do not create new page piles like `test-1`, `test-2`, `final`, `final-2`. Do not overwrite protected reference pages or working fallback pages. Do not remove accessibility, player comfort, Supabase migration/test, upload/Mux/storage, profile/auth/avatar, global shell/helper, registry, route, manifest, backup, or current checkpoint files unless the owner explicitly approves the specific cleanup.

## Access / visibility model

Owner pages are visible in the overlay for the platform owner and hidden for everyone else. Admin pages are operational pages for admin/owner users. Creator/builders receive only plan-allowed creator, group-play, and Web Builder areas. Viewers can use watch, saved, profile, and public/read pages as allowed. Signed-out users do not see Owner or User Management groups. Protected direct URLs should show a clear locked/not-allowed page, not blank crash.

Special Policy Admin rule:

- `policy-admin-documents-v7-12-120-test.html?policy=terms` is visible as a page to everyone who can reach it.
- Kayleigh/non-admin users may view the page shell and route links only.
- Editor tools remain owner/admin only.
- Owner/admin can edit, save draft, publish, archive, and create defaults.
- Policy Admin reads `sb_policy_documents` and `sb_profiles` and writes only `sb_policy_documents`.

## Page polish standard

Every page in the final polish pass should follow:

- Header shell
- page navigation pill rail directly under the header
- hero/main summary
- internal content tabs only when needed
- page output/content underneath those tabs
- Footer shell

Clean-navigation rules:

- Top rail owns page-to-page navigation.
- Top rail sits directly under the header shell and above the hero.
- Hero keeps only real page actions.
- Do not duplicate route buttons inside hero when those routes already exist in the top rail.
- Do not add duplicate route-card tabs when those routes already exist in the top rail.
- Internal tabs are for current-page content only.

## Live candidate groups so far

### Watch group - 10 candidates

- `home-global-helpers-v7-4-4-test.html`
- `library-global-helpers-v7-4-8-test.html`
- `details-clean-machine-v7-12-38-test.html`
- `player-one-global-helpers-v7-3-3-test.html`
- `continue-watching-global-helpers-v7-3-9-test.html`
- `watch-history-global-helpers-v7-4-0-test.html`
- `watchlist-clean-machine-v7-12-43-test.html`
- `favourites-clean-machine-v7-12-41-test.html`
- `likes-clean-machine-v7-12-42-test.html`
- `accessibility-clean-machine-v7-12-44-test.html`

### Browse group - 4 candidates

- `supabase-library-home-header-form-fix-v7-12-34-test.html`
- `genres-clean-machine-v7-12-45-test.html`
- `global-search-global-helpers-v7-4-9-test.html`
- `about-global-helpers-v7-4-7-test.html`

### Creator group - 3 candidates

- `submit-video-clean-machine-v7-12-79-test.html`
- `rules-clean-machine-v7-12-82-test.html`
- `review-queue-clean-machine-v7-12-80-publish-test.html`

### Group Play group - 5 candidates

- `playlists-global-helpers-v7-5-2-test.html`
- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `player-2-clean-machine-v7-12-58-test.html`

### Settings group - 4 candidates

- `settings-platform-control-hub-v7-12-85-test.html`
- `web-builder-theme-studio-controls-v7-8-9-test.html`
- `profile-settings-live-ready-v7-12-90-test.html`
- `web-builder-account-control-hub-v7-12-263-test.html`

### Policy group - 3 candidates

- `policy-documents-centre-v7-12-119-test.html`
- `policy-reader-v7-12-119-test.html?policy=terms`
- `policy-admin-documents-v7-12-120-test.html?policy=terms`

### Admin group - 9 candidates

- `admin-centre-command-deck-v7-12-121-test.html`
- `live-readiness-global-helpers-v7-10-2-test.html`
- `all-pages-version-registry-v7-12-122-current-routes-test.html`
- `test-checklist-global-helpers-v7-10-5-test.html`
- `tools-page-original-global-pass-v7-12-136-test.html`
- `health-check-global-helpers-v7-10-6-test.html`
- `mux-manager-global-helpers-v7-10-7-test.html`
- `storage-prep-global-helpers-v7-10-8-test.html`
- `backup-safety-global-helpers-v7-10-9-test.html`

## Completed Admin group pass

Admin group is complete and promoted to the `index.html` candidate tracker after owner test pass.

Admin page commits in this pass:

- Admin Centre: `d77a2bc0ed27f0ec5dafa62135172708bcafd5b8`
- Live Readiness: `a24a0592c153c6e36a0ad3783747844938dd7810`
- Current Routes Registry: `27e79324493e469d0e4c67ab528a6e3b67c1b577`
- Test Checklist: `df29a5b7899e3d18a92a5e127a4ada43a759c592`
- Tools: `c9fe83d67979278d589d120e696e15b83d4cfd69`
- Health Check: `946f2bafcd14cabb6c998c83cc3869d2bbd8871c`
- Mux Manager: `f8da89b401b3947d736f16483728438ef5bdbda5`
- Storage Prep: `2d2784c8e8301b29b3b0934dc2cc4c127d206046`
- Backup / Safety: `4736e013bf60406f8f37b4cc81a930509d880139`

## Owner group later / PDF direction

Owner group is not being started in this manifest update. The owner plan says the next larger completion work should avoid treating the project as a routing rescue and instead complete usefulness, account ownership, Web Builder canonical pages, user-management utility pages, and shell consistency.

Do not force Owner group through the simple Admin utility rail pattern. Owner group needs a separate rail and usefulness pass because it includes pages that can change account/profile/user-management/building behaviour.

## Promotion status

`index.html` has been updated as a candidate tracker for Admin group only.

This is not final live-home promotion.

Root redirect remains:

`home-global-helpers-v7-4-4-test.html`
