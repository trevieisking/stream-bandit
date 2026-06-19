# Stream Bandit Phase 1 Master Audit Sheet V7.13.019

Date: 2026-06-19

Status: PHASE 1 COMPLETE / READ-ONLY AUDIT SHEET / NO LIVE PAGE CHANGES

Governing plan: `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`

This file carries out Phase 1 from the master must-follow plan: create a read-only audit from the current registry and route access map before touching pages.

No HTML page was changed in this phase.
No JavaScript helper was changed in this phase.
No SQL was run or proposed as required in this phase.
No RLS, storage, DNS, payment, service-role or production Home change is approved by this sheet.

---

## 1. Inputs Scanned

Primary source files used for this audit:

```text
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
all-pages-version-registry-v7-12-122-current-routes-test.html
CURRENT-APP-MANIFEST-V7-12-180.md
WEB-BUILDER-MANIFEST-V7-12-252.md
```

The audit uses the master rule:

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
```

---

## 2. Phase 1 Outcome

Phase 1 creates the working audit sheet and action queue. It does not fix pages yet.

Current outcome:

```text
Main App / Web Builder separation: preserved
Index replacement: not approved
Home replacement: not approved
Schema change: not approved
RLS change: not approved
Storage change: not approved
DNS automation: not approved
Payment activation: not approved
Full-page replacement: not triggered yet
```

---

## 3. Registry Foundation Audit

The foundation registry file `stream-bandit-route-registry-v7-13-001.js` currently defines these route classes:

```text
public
account_required
creator_submit
admin_only
owner_only
web_builder
web_builder_owner
protected_file
manifest
```

It currently defines these shells:

```text
main_app_shell
web_builder_studio_shell
protected_helper
```

The foundation registry currently has 38 listed route rows.

---

## 4. Foundation Route Table

| # | Page | Route | Group | Shell | Registry class | Read tables | Write tables | Phase 1 status | Action |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Home | `home-global-helpers-v7-4-4-test.html` | Watch | Main App | public | `sb_movies` | none | OK | Keep as Main App Home. |
| 2 | Library | `library-global-helpers-v7-4-8-test.html` | Watch | Main App | public | `sb_movies`, `sb_watchlist`, `sb_favourites`, `sb_likes` | none | OK | No rewrite. |
| 3 | Details | `details-clean-machine-v7-12-38-test.html` | Watch | Main App | public | `sb_movies` | none | OK | No rewrite. |
| 4 | Player 1 | `player-one-global-helpers-v7-3-3-test.html` | Watch | Main App | public | `sb_movies` | none | OK | No rewrite. |
| 5 | Player 2 | `player-2-clean-machine-v7-12-58-test.html` | Group Play | Main App | public | `sb_movies` | none | OK | No rewrite. |
| 6 | Continue Watching | `continue-watching-global-helpers-v7-3-9-test.html` | Watch | Main App | public | `sb_movies` | none | REVIEW | Access map says account_optional. Align as account-optional personal state later, no full rewrite. |
| 7 | Watch History | `watch-history-global-helpers-v7-4-0-test.html` | Watch | Main App | public | `sb_movies` | none | REVIEW | Access map says account_optional. Align as account-optional personal state later, no full rewrite. |
| 8 | Watchlist | `watchlist-clean-machine-v7-12-43-test.html` | Watch | Main App | account_required | `sb_movies`, `sb_watchlist` | `sb_watchlist` | REVIEW | Access map says account_optional. Keep public prompt view plus account-only writes. |
| 9 | Favourites | `favourites-clean-machine-v7-12-41-test.html` | Watch | Main App | account_required | `sb_movies`, `sb_favourites` | `sb_favourites` | REVIEW | Access map says account_optional. Keep public prompt view plus account-only writes. |
| 10 | Likes | `likes-clean-machine-v7-12-42-test.html` | Watch | Main App | account_required | `sb_movies`, `sb_likes` | `sb_likes` | REVIEW | Access map says account_optional. Keep public prompt view plus account-only writes. |
| 11 | Accessibility | `accessibility-clean-machine-v7-12-44-test.html` | Watch | Main App | public | `sb_app_settings` | none | OK | No rewrite. |
| 12 | Global Search | `global-search-global-helpers-v7-4-9-test.html` | Browse | Main App | public | `sb_movies`, `sb_channels`, `sb_playlists` | none | OK | No rewrite. |
| 13 | About | `about-global-helpers-v7-4-7-test.html` | Browse | Main App | public | none | none | OK | No rewrite. |
| 14 | Supabase Library Editor | `supabase-library-home-header-form-fix-v7-12-34-test.html` | Browse | Main App | admin_only | `sb_movies`, `sb_profiles` | `sb_movies` | OK | Admin/editor write page. No rewrite unless broken. |
| 15 | Genres | `genres-clean-machine-v7-12-45-test.html` | Browse | Main App | admin_only | `sb_genres`, `sb_movies` | `sb_genres` | CONFLICT | Registry says admin; access map says public. Resolve with public browse + admin-only CRUD controls. |
| 16 | Submit Video | `submit-video-clean-machine-v7-12-79-test.html` | Creator | Main App | creator_submit | `sb_channels`, `sb_movies`, `sb_profiles`, `sb_submissions` | `sb_submissions` | OK | Creator submit flow preserved. |
| 17 | Creator Rules | `rules-clean-machine-v7-12-82-test.html` | Creator | Main App | account_required | `sb_profiles` | none | REVIEW | Access map says public. Prefer public rules read, account-only creator extras if any. |
| 18 | Review Queue | `review-queue-clean-machine-v7-12-80-publish-test.html` | Creator | Main App | admin_only | `sb_movies`, `sb_submissions`, `sb_profiles`, `sb_channels` | `sb_movies`, `sb_submissions` | OK | Admin publish gate. No rewrite unless broken. |
| 19 | Playlists | `playlists-global-helpers-v7-5-2-test.html` | Group Play | Main App | account_required | `sb_movies`, `sb_playlists`, `sb_playlist_movies`, `sb_profiles` | `sb_playlists`, `sb_playlist_movies` | REVIEW | Access map says creator_plan min viewer_plus. Align page locks to plan/own-write model. |
| 20 | Channels | `channels-global-helpers-v7-5-3-test.html` | Group Play | Main App | account_required | `sb_channels`, `sb_movies`, `sb_profiles` | `sb_channels`, `sb_profiles` | REVIEW | Access map says creator_plan min creator_starter. Align create/edit controls to plan. |
| 21 | My Channel | `my-channel-clean-machine-v7-12-47-test.html` | Group Play | Main App | account_required | `sb_channels`, `sb_collections`, `sb_movies`, `sb_playlists`, `sb_profiles`, `sb_submissions` | `sb_profiles` | OK | Account page; no rewrite unless broken. |
| 22 | Collections | `collections-clean-machine-v7-12-51-test.html` | Group Play | Main App | account_required | `sb_collection_movies`, `sb_collections`, `sb_movies`, `sb_profiles` | `sb_collections`, `sb_collection_movies` | REVIEW | Access map says creator_plan min creator_growth. Align create/edit/delete controls to plan. |
| 23 | Profile / Login | `profile-settings-live-ready-v7-12-90-test.html` | Account | Main App | public | `sb_profiles` | `sb_profiles` | REVIEW | Access map says account_required. Correct model: public login view, account-only profile writes. |
| 24 | User Management Dashboard | `user-management-dashboard-v7-11-2-test.html` | User Management | Main App | owner_only | `sb_profiles`, `sb_admin_audit_log` | `sb_profiles` | OK | Owner RPC control room. No rewrite unless broken. |
| 25 | Permissions Matrix | `permissions-matrix-user-management-v7-11-4-test.html` | User Management | Main App | owner_only | `sb_profiles`, `sb_admin_audit_log` | none | OK | Read-only inspector. |
| 26 | Web Builder Hub | `web-builder-account-control-hub-v7-12-263-test.html` | Web Builder | Web Builder | web_builder | `sb_profiles`, `sb_site_pages` | none | OK | Web Builder doorway. |
| 27 | Owned Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | `sb_site_pages` | OK | Create/edit/delete page rows. |
| 28 | Studio Shell | `overlay-route-truth-machine-v7-12-66-test.html?page=landing` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | none | OK | Builder studio shell. |
| 29 | Owned Preview | `web-builder-preview-owned-v7-12-257-test.html?page=landing` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages`, `sb_form_submissions` | `sb_form_submissions` | LOCKED OK | Passed full preview. Do not touch unless broken. |
| 30 | Menu Builder | `web-builder-menu-builder-owned-v7-12-264-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | `sb_site_pages` | OK | Menu settings writer. |
| 31 | Form Designer | `web-builder-form-designer-owned-v7-12-258-test.html?page=landing` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages`, `sb_form_submissions`, `sb_private_messages` | `sb_site_pages`, `sb_form_submissions`, `sb_private_messages` | OK | Form designer; no merge with main app forms. |
| 32 | Form Inbox Bridge | `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_private_messages`, `sb_user_friends` | `sb_private_messages`, `sb_user_friends` | LOCKED OK | Passed inbox bridge. Do not touch unless broken. |
| 33 | Assets | `web-builder-assets-v7-12-252-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | none | OK | Existing asset flow only. |
| 34 | Route Map | `web-builder-route-map-v7-12-252-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles` | none | OK | Read-only planning map. |
| 35 | Control Map | `web-builder-control-map-v7-12-253-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles` | none | OK | Read-only control map. |
| 36 | Pages Source Map | `web-builder-pages-source-map-v7-12-255-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | none | OK | Read-only truth checker. |
| 37 | Header/Footer Code | `web-builder-header-footer-code-v7-12-254-test.html` | Web Builder | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | `sb_site_pages` | OK | Writes builder shell data only. |
| 38 | Web Builder Manifest | `WEB-BUILDER-MANIFEST-V7-12-252.md` | Manifest | Web Builder | web_builder_owner | `sb_profiles`, `sb_site_pages` | none | OK | Project memory checkpoint. |

---

## 5. Route Access Map Extras

The access map includes additional pages beyond the compact foundation registry. These remain part of the audit and must not be lost.

| Area | Routes | Phase 1 action |
|---|---|---|
| Policy | `policy-documents-centre-v7-12-119-test.html`, `policy-reader-v7-12-119-test.html`, `policy-admin-documents-v7-12-120-test.html` | Keep. Public reader/centre, admin editor. |
| Admin | `admin-centre-command-deck-v7-12-121-test.html`, `live-readiness-global-helpers-v7-10-2-test.html`, `all-pages-version-registry-v7-12-122-current-routes-test.html`, `test-checklist-global-helpers-v7-10-5-test.html`, `tools-page-original-global-pass-v7-12-136-test.html`, `health-check-global-helpers-v7-10-6-test.html`, `mux-manager-global-helpers-v7-10-7-test.html`, `storage-prep-global-helpers-v7-10-8-test.html`, `backup-safety-global-helpers-v7-10-9-test.html` | Keep owner/admin gated. No rewrite. |
| Owner | `web-builder-form-submissions-v7-12-94-test.html`, `web-builder-form-save-v7-12-94-test.html`, `stream-bandit-one-machine-v7-12-73-test.html`, `stream-bandit-global-helper-shell-v7-12-126-test.html`, `settings-brand-icons-promoted-v7-12-21-test.html`, `brand-logo-helper-responsive-v7-12-20-test.html`, `favicon-app-icon-builder-v7-12-15-test.html`, `web-builder-pages-manager-v7-12-111-test.html`, `web-builder-shared-style-preview-v7-12-117-test.html` | Preserve as legacy/support/owner routes. Canonicalize links where newer owned pages are the current target. |
| User Management | `user-management-dashboard-v7-11-2-test.html`, `plans-pricing-feature-shop-v7-11-3-test.html`, `permissions-matrix-user-management-v7-11-4-test.html` | Keep dashboard owner-only, pricing public-reference preview, permissions owner-only read-only. |

---

## 6. Old URL Canonical Map

These old URLs are preserved by the access map and should be canonicalized when found in rails or buttons. Do not delete them yet.

| Old URL | Canonical URL | Action |
|---|---|---|
| `collections-clean-machine-v7-12-48-test.html` | `collections-clean-machine-v7-12-51-test.html` | Patch links only. |
| `collections-clean-machine-v7-12-49-test.html` | `collections-clean-machine-v7-12-51-test.html` | Patch links only. |
| `collections-clean-machine-v7-12-50-test.html` | `collections-clean-machine-v7-12-51-test.html` | Patch links only. |
| `collections-global-helpers-v7-5-1-test.html` | `collections-clean-machine-v7-12-51-test.html` | Patch links only. |
| `collections-browse-shell-v6-46-1-test.html` | `collections-clean-machine-v7-12-51-test.html` | Patch links only. |
| `player-two-global-helpers-v7-3-4-test.html` | `player-2-clean-machine-v7-12-58-test.html` | Patch links only. |
| `player-2-clean-machine-v7-12-57-test.html` | `player-2-clean-machine-v7-12-58-test.html` | Patch links only. |
| `user-dashboard-concept-v6-68-test.html` | `user-management-dashboard-v7-11-2-test.html` | Patch links only. |
| `plans-pricing-matrix-v6-69-test.html` | `plans-pricing-feature-shop-v7-11-3-test.html` | Patch links only. |
| `permissions-matrix-v6-70-test.html` | `permissions-matrix-user-management-v7-11-4-test.html` | Patch links only. |

---

## 7. Lock Conflict Queue

These are not live page breaks yet. They are Phase 2 audit targets.

| Priority | Route | Conflict | Correct direction | Patch type |
|---:|---|---|---|---|
| 1 | `genres-clean-machine-v7-12-45-test.html` | Foundation registry says admin-only; access map says public. | Public read/browse page, admin-only create/edit/delete controls. | Route/lock alignment, page scan before edit. |
| 2 | `watchlist-clean-machine-v7-12-43-test.html` | Registry says account_required; access map says account_optional. | Public prompt/read shell allowed; write/save/delete requires account. | Lock wording/control alignment. |
| 3 | `favourites-clean-machine-v7-12-41-test.html` | Registry says account_required; access map says account_optional. | Public prompt/read shell allowed; write/save/delete requires account. | Lock wording/control alignment. |
| 4 | `likes-clean-machine-v7-12-42-test.html` | Registry says account_required; access map says account_optional. | Public prompt/read shell allowed; write/save/delete requires account. | Lock wording/control alignment. |
| 5 | `continue-watching-global-helpers-v7-3-9-test.html` | Registry says public; access map says account_optional. | Page can load publicly, personal data needs account. | Access-map/registry language alignment. |
| 6 | `watch-history-global-helpers-v7-4-0-test.html` | Registry says public; access map says account_optional. | Page can load publicly, personal data needs account. | Access-map/registry language alignment. |
| 7 | `rules-clean-machine-v7-12-82-test.html` | Registry says account_required; access map says public. | Rules should be public read unless a creator-only area exists. | Lock wording alignment. |
| 8 | `profile-settings-live-ready-v7-12-90-test.html` | Registry says public; access map says account_required. | Public login/sign-in area, account-only profile writes. | Control-level lock alignment. |
| 9 | `playlists-global-helpers-v7-5-2-test.html` | Registry says account_required; access map says creator_plan/viewer_plus. | Account shell plus plan-gated create/edit/delete. | Plan lock alignment. |
| 10 | `channels-global-helpers-v7-5-3-test.html` | Registry says account_required; access map says creator_plan/creator_starter. | Account shell plus plan-gated channel create/edit. | Plan lock alignment. |
| 11 | `collections-clean-machine-v7-12-51-test.html` | Registry says account_required; access map says creator_plan/creator_growth. | Account shell plus plan-gated collection CRUD. | Plan lock alignment. |

---

## 8. Known Route-Only Cleanup Queue

| Priority | File | Current/old value | Target value | Rules |
|---:|---|---|---|---|
| 1 | `stream-bandit-shell-v6-24.js` | `web-builder-live-studio-v7-12-116-test.html?page=test-page` | `web-builder-account-control-hub-v7-12-263-test.html` | Scan full file first. Route-only patch. Do not touch Supabase config bridge. |

---

## 9. Web Builder Hosting Audit

Phase 1 confirms the hosting plan remains table-safe.

Current storage target for domain/subdomain metadata:

```text
sb_site_pages.settings_json.web_builder_hosting.customDomain
sb_site_pages.settings_json.web_builder_hosting.subdomain
sb_site_pages.settings_json.web_builder_hosting.hostingStatus
sb_site_pages.settings_json.web_builder_hosting.sslStatus
sb_site_pages.settings_json.web_builder_hosting.deployTarget
```

No new SQL is required for this phase.

Future hosting tables remain planning-only:

```text
sb_builder_sites
sb_builder_domains
sb_builder_deploys
sb_builder_revisions
```

Do not migrate these until a full SQL + full affected page replacement package is prepared.

---

## 10. Two Inbox Audit

The two inbox lanes remain separate.

| Lane | Primary table | Used by | Merge allowed? |
|---|---|---|---|
| Social / private messages | `sb_private_messages` | Social Profile, Friends, News Feed, Groups, global footer communications overlay, Web Builder private-message tab | No |
| Web Builder form submissions | `sb_form_submissions` | Web Builder forms, Full Preview form submits, Web Builder Form Inbox submissions tab, global footer submissions overlay | No |

Communications overlays may show both lanes, but they must remain different data types.

---

## 11. SQL Status

SQL status for Phase 1:

```text
SQL required now: no
RLS change required now: no
Storage policy change required now: no
DNS table migration required now: no
Billing entitlement schema required now: no
```

SQL becomes allowed only when paired with:

```text
full affected page replacement
route registry update notes
RLS/storage notes
rollback notes
smoke test checklist
```

---

## 12. Next Action After This Audit Sheet

Proceed to Phase 2 only.

Phase 2 target:

```text
Resolve route lock conflicts without redesigning pages.
```

First Phase 2 item:

```text
genres-clean-machine-v7-12-45-test.html
```

Required Phase 2 sequence:

```text
1. Fetch full Genres page source.
2. Verify whether public browse and admin CRUD already exist.
3. If controls already behave correctly, only align registry/access wording.
4. If broken but patchable, patch smallest safe route/control lock.
5. If tangled or blocked, provide full-page replacement plus any SQL if required.
6. Re-scan registry after the patch.
```

Current expectation:

```text
No SQL expected for Genres.
No new page expected for Genres.
Likely action is lock wording/control alignment only.
```

---

## 13. Phase 1 Completion Lock

Phase 1 is complete when this file exists in source.

Completed:

```text
Master audit sheet saved
No source pages touched
No SQL added
No feature removed
Next action identified: Genres lock conflict scan
```
