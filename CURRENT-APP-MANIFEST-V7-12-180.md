# Stream Bandit Current App Manifest V7.13.010

Date: 2026-06-19

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.13.010 Profile Social Media Group Main Profile Page Polish Pass`

Manifest-only checkpoint: no new checkpoint file was created for this log.

Previous checkpoint file:

`CHECKPOINT-WEB-BUILDER-SOURCE-MAP-PASS-V7-12-300-38.md`

## Current index note

The Profile Social Media Group main profile page has passed as a test/candidate page.

Index promotion is not done yet. The owner has gated index promotion until the whole Profile Social Media Group is built and passed.

Current Home route remains:

`home-global-helpers-v7-4-4-test.html`

## Profile Social Media Group pass detail

Main profile route passed:

`profile-social-v7-13-001-test.html`

Passed version:

`V7.13.010 Profile Social Media Group Polish Test`

Group name for all future references:

`Profile Social Media Group`

Passed behavior:

- Account Tools > Save Profile Text
- Account Tools > Avatar Overlay
- Account Tools > Banner Overlay
- Questions > Save Rich Questions
- Privacy > Save Privacy
- Friends & Family > family request / confirm
- Friends & Family layout polish
- Friends & Family > Remove Family Link
- Wall > Publish Wall Post
- Wall > Comment on post
- Wall > Like post
- Wall/comment/like persistence after refresh
- Checks tab > Run Safe Checks
- Delete account request overlay opens only

Current known minor polish for later:

- Friends & Family has a small visual/card polish issue, but the workflow passed.

Safety:

- writes current signed-in account text/avatar/banner to `sb_profiles`
- writes social profile settings to `sb_profile_social_settings`
- writes family request/status changes to `sb_user_family_relationships`
- writes wall posts to `sb_social_posts`
- writes wall comments to `sb_social_post_comments`
- writes wall reactions/likes to `sb_social_post_reactions`
- writes account deletion requests only to `sb_account_deletion_requests`
- no browser Auth deletion
- no service-role key
- no schema change in the page
- no storage policy change in the page
- no index promotion
- no live-home replacement

Current Profile Social Media Group routes:

- Main Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html` planned/linked, not passed yet
- Groups: `groups-social-v7-13-001-test.html` planned/linked, not passed yet
- Events: future group feature

## Previous Web Builder Source Map pass detail

Route passed:

`web-builder-pages-source-map-v7-12-255-test.html?page=landing`

Passed version:

`V7.12.300.38 Web Builder Source Map Truth Checker`

Passed behavior:

- selected slug
- page row found / missing
- owner_id match
- page status
- layout_json present
- settings_json present
- web_builder_shell present
- header/footer shell counts
- Page Menu settings present
- Form Designer settings present
- Preview route
- Studio route
- Header/Footer route
- readiness result
- output on page
- detail overlay

Safety:

- reads `sb_profiles` and `sb_site_pages`
- no Supabase writes
- no schema change
- no storage action
- no fake publish
- no index promotion

## Previous Web Builder pass detail

Header/Footer Builder and Owned Preview connection passed at `V7.12.300.37`.

- Header/Footer Builder saves a real builder-site shell to `sb_site_pages.settings_json.web_builder_shell`.
- Compatibility fields are mirrored to `site_name`, `footer_title`, `footer_text`, `header_footer_status`, and `header_footer_updated_at`.
- Owned Preview renders the saved header/footer shell.
- Page Menu Builder remains separate as the on-page custom menu builder.

## Future login/account gate

After the full Web Builder plan is complete and the group is promoted, the owner wants the finished builder flow locked behind a proper Supabase email/password login system.

Future login requirements:

- email/password sign-up and sign-in
- one account per email
- Supabase Auth-backed account creation
- profile row creation in `sb_profiles`
- no duplicate account for the same email
- owner/admin gates remain protected

This is future work and is not part of the current Profile Social Media Group main page checkpoint.

## Safety standard

No page change should add schema, RLS, storage policy, bucket policy, service-role, final live-home replacement, payment provider, or browser secret keys without explicit approval.

## Current live candidate groups

### Profile Social Media Group

- `profile-social-v7-13-001-test.html` — passed as main profile candidate at V7.13.010
- `friends-social-v7-13-001-test.html` — passed earlier as friends page candidate
- `news-feed-social-v7-13-001-test.html` — linked/planned, not passed yet
- `groups-social-v7-13-001-test.html` — linked/planned, not passed yet

Index promotion for this group remains blocked until the whole group passes.

### Account + User Management

- `profile-settings-live-ready-v7-12-90-test.html`
- `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-feature-shop-v7-11-3-test.html`
- `permissions-matrix-user-management-v7-11-4-test.html`

### Watch group

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

### Web Builder functional pass candidates

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-assets-v7-12-252-test.html?page=<slug>`
- `web-builder-route-map-v7-12-252-test.html?page=<slug>`
- `web-builder-control-map-v7-12-253-test.html?page=<slug>`
- `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`
- `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

## Scanner rule

For every Supabase-touching page, use the owner-provided `sb_table 1` scanner before editing.

Scanner checks to preserve:

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

## Next plan target

Continue the Profile Social Media Group without index promotion:

1. Build/pass the News Feed route.
2. Build/pass the Groups route.
3. Add Events only after groups/feed are stable.
4. Then update overlay/menu/registry for the complete group.
5. Final `index.html` promotion remains owner-gated after the full Profile Social Media Group pass.
