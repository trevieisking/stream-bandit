# Stream Bandit Master Must-Follow Plan

Date: 2026-06-19

Status: MASTER GOVERNING PLAN / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: This document is the project-level source plan for future Stream Bandit work. It is based on the live GitHub source scan, current registry, current app manifest, Web Builder manifest, permissions inspector, pricing preview, user dashboard, and route-access helpers.

This file is a source-of-truth planning document only. It does not approve code rewrites, schema changes, RLS changes, storage changes, payment activation, DNS automation, Home replacement, or shell merging.

---

## 1. Master Rule

Do not rewrite working pages.

The project already has a registry pass, route proof, protected-file proof, current app manifest, Web Builder manifest, permission inspector, pricing preview, user dashboard, and builder page manager. The correct process is:

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
```

No random cleanup. No improvement rewrites. No new pages unless an existing old test page is being promoted as an approved replacement.

---

## 2. Source of Truth Hierarchy

Every future decision must follow this order.

### Level 1 - Current Registry

Primary sources:

```text
all-pages-version-registry-v7-12-122-current-routes-test.html
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
```

The unified route registry defines route classes including public, account-required, creator, admin, owner, Web Builder, and Web Builder owner.

The registry file maps Main App routes and Web Builder routes to their shell, route class, read tables, and write tables.

### Level 2 - Current App Manifest

Primary source:

```text
CURRENT-APP-MANIFEST-V7-12-180.md
```

This confirms:

```text
index.html = platform entry
home-global-helpers-v7-4-4-test.html = main app Home
Web Builder remains separate
No schema/RLS/storage/payment/Home replacement was promoted
```

### Level 3 - Web Builder Manifest

Primary source:

```text
WEB-BUILDER-MANIFEST-V7-12-252.md
```

This confirms the Web Builder product area, route group, table ownership, passed pages, and separation rules.

### Level 4 - Permission / Pricing / Dashboard

Primary sources:

```text
plans-pricing-feature-shop-v7-11-3-test.html
permissions-matrix-user-management-v7-11-4-test.html
user-management-dashboard-v7-11-2-test.html
stream-bandit-authority-gate-v7-12-273.js
stream-bandit-route-access-map-v7-12-271.js
```

The authority gate enforces route decisions from profile authority, plan rank, permissions_json, account status, and route access class.

---

## 3. Permanent Architecture Lock

### Main App stays Main App

Main App owns:

```text
Streaming
Watching
Browse
Creator submission
Review queue
Channels
Collections
Playlists
Social
Messages
Profile
Settings
Admin
```

No Web Builder page shell should replace Main App shell.

### Web Builder stays Web Builder

Web Builder owns:

```text
Builder Hub
Pages Manager
Studio
Preview
Menu Builder
Header/Footer Builder
Form Designer
Form Inbox
Assets
Planning Map
Control Map
Source Map
Domains
Subdomains
Publishing
```

Web Builder is its own builder product area. Main App Watch/Browse/Creator/Group Play routes stay separate from Web Builder.

---

## 4. Index Page Plan

Current index should not be redesigned.

It already has the correct launch concept:

```text
Platform Entry
 |-- Main App Home
 |-- Social Profile
 |-- Registry
 |-- Account Settings
 |-- News Feed
 `-- Web Builder Hub
```

The index preserves Home as the Main App Home and exposes Web Builder as a separate shell route.

### Required index behavior

Keep:

```text
Main App Home button
Web Builder Hub button
Current Routes Registry button
Account Settings button
Social links
```

Do not:

```text
Replace Home
Promote Web Builder over Main App
Add new page files
Merge Main App and Web Builder menus
Hide registry access from owner/admin
```

---

## 5. Route Cleanup Plan

### Rule

Every page must be reachable through the current registry or current access map.

The access map already preserves old URLs by canonical mapping, including old collections, player, user dashboard, pricing, and permissions pages.

### Action

Do not delete old test pages immediately.

Instead:

```text
Old link found
↓
Map to current canonical page
↓
Patch rail/link only
↓
Smoke test
↓
Registry pass
```

### Known stale Web Builder route

The Web Builder connection map identifies a stale shell target in stream-bandit-shell-v6-24.js and says only a tiny route-only fix should be made later, without touching Supabase config.

Target replacement:

```text
old:
web-builder-live-studio-v7-12-116-test.html?page=test-page

new:
web-builder-account-control-hub-v7-12-263-test.html
```

This is not a rewrite. It is a route-only cleanup.

---

## 6. Approved sb_table Map

### Active proof tables

These are the current active proof tables from the registry:

```text
sb_admin_audit_log
sb_app_settings
sb_channels
sb_collection_movies
sb_collections
sb_favourites
sb_form_submissions
sb_genres
sb_import_batches
sb_likes
sb_movies
sb_playlist_movies
sb_playlists
sb_policy_documents
sb_private_messages
sb_profiles
sb_site_pages
sb_submissions
sb_user_friends
sb_watch_progress
sb_watchlist
sb_account_deletion_requests
sb_profile_social_settings
sb_social_events
sb_social_event_rsvps
sb_social_group_members
sb_social_groups
sb_social_post_comments
sb_social_post_reactions
sb_social_posts
sb_user_family_relationships
```

The registry source lists these as PROOF_TABLES.

### Optional / future known tokens

These are known tokens, not automatic blockers:

```text
sb_social_notifications
sb_social_post_media
sb_user_blocks
sb_social_remove_own_post
sb_social_update_own_post
sb_can_send_private_message
sb_owner_manage_profile
sb_owner_set_account_deletion_status
sb_builder_accounts
sb_builder_assets
sb_builder_audit_log
sb_builder_deploys
sb_builder_domains
sb_builder_pages
sb_builder_revisions
sb_builder_sites
sb_builder_themes
sb_profile
sb_theme
sb_header_
sb_wb_
sb_preview_rating
sb_form_designer_local_
```

The registry classifies these separately from active proof tables.

### Web Builder current approved tables

The current approved Web Builder tables are:

```text
sb_site_pages
sb_form_submissions
sb_private_messages
sb_user_friends
sb_user_blocks
sb_profiles
```

### Future Builder tables

These are future/planning tables, not approved for migration yet:

```text
sb_builder_accounts
sb_builder_sites
sb_builder_pages
sb_builder_assets
sb_builder_themes
sb_builder_domains
sb_builder_deploys
sb_builder_revisions
sb_builder_audit_log
```

Do not migrate these until code and SQL are delivered together.

---

## 7. Permission and Pricing Lock Plan

### Current state

Pricing is visible but preview-only. It has:

```text
8 plans
24 add-ons
no payment provider
no account upgrades
no entitlement writes
```

The pricing page defines these plan ideas:

```text
Free Viewer
Viewer Plus
Creator Starter
Creator Growth
Creator Pro
Studio Business
Network Partner
Platform Owner
```

The permissions inspector defines these plan ideas:

```text
Free Viewer
Viewer Plus
Creator Starter
Creator Growth
Creator Pro
Studio Business
Platform Owner
```

and feature flags such as:

```text
can_watch_public
can_save_lists
can_continue_watching
can_submit_video
can_create_channel
can_create_playlist
can_create_collection
can_custom_domain
can_use_web_builder
can_use_form_builder
can_use_video_pack
can_use_storage_tools
can_review_submissions
can_manage_users
can_view_permissions
can_access_backup_tools
can_use_platform_builder
can_use_creator_gate
```

### Permission source of truth

Every locked route must evaluate:

```text
sb_profiles.role
sb_profiles.admin_level
sb_profiles.plan_key
sb_profiles.account_status
sb_profiles.can_submit
sb_profiles.permissions_json
```

The authority gate already uses plan ranking, active account status, owner/admin checks, and permissions_json.

### Required implementation rule

No page should invent its own lock rules.

Every page must use:

```text
stream-bandit-authority-gate-v7-12-273.js
stream-bandit-route-access-map-v7-12-271.js
stream-bandit-protected-page-v7-12-273.js
```

or the Web Builder equivalent:

```text
stream-bandit-route-registry-v7-13-001.js
stream-bandit-auth-entry-gate-v7-13-001.js
web-builder-global-projector-v7-12-263.js
```

---

## 8. Page-by-Page Master Matrix

### Platform

| Page | Correct function | Tables | Lock | Action |
| --- | --- | --- | --- | --- |
| `index.html` | Platform entry, not Home replacement | none direct | public | Keep layout; only patch dead links |
| `home-global-helpers-v7-4-4-test.html` | Main App Home | `sb_movies` | public | Keep as main Home |
| `CURRENT-APP-MANIFEST-V7-12-180.md` | Manifest truth | none | owner/reference | Keep filename because scanners reference it |
| `all-pages-version-registry-v7-12-122-current-routes-test.html` | Route/table/proof scanner | proof tables read-only | owner | Keep read-only |

### Watch / Streaming

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Home | Featured movie/home entry | `sb_movies` | public | Read |
| Library | Browse library + personal status | `sb_movies`, `sb_watchlist`, `sb_favourites`, `sb_likes` | public/account optional | Read |
| Details | Movie detail | `sb_movies` | public | Read |
| Player 1 | Main player | `sb_movies` | public | Read/play |
| Player 2 | Group play/player 2 | `sb_movies` | public | Read/play |
| Continue Watching | Resume progress | `sb_movies`, `sb_watch_progress` | account optional | Read/update own progress |
| Watch History | History | `sb_movies`, `sb_watch_progress` | account optional | Read/clear own history if present |
| Watchlist | Save list | `sb_movies`, `sb_watchlist` | account/account optional | Create/delete own save |
| Favourites | Favourite saves | `sb_movies`, `sb_favourites` | account/account optional | Create/delete own favourite |
| Likes | Likes | `sb_movies`, `sb_likes` | account/account optional | Create/delete own like |
| Accessibility | Accessibility settings/help | `sb_app_settings` | public | Read/settings |

### Browse / Library Admin

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Supabase Library Editor | Admin movie editor | `sb_movies`, `sb_profiles` | admin | Full CRUD on `sb_movies` |
| Genres | Genre manager/browse | `sb_genres`, `sb_movies` | currently admin in registry; public in access map conflict | Resolve lock conflict |
| Global Search | Search movies/channels/playlists | `sb_movies`, `sb_channels`, `sb_playlists` | public | Read |
| About | About page | none | public | Read |

Important: there is a lock conflict. The unified route registry marks Genres as ADMIN, while the route access map marks Genres as public.

#### Genres decision

Use two-mode behavior:

```text
Public users:
read/browse genres

Admin users:
create/edit/delete genres
```

Do not hide the page from public viewers if it is part of browse. Lock only the admin CRUD controls.

### Creator

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Submit Video | Creator submission | `sb_submissions`, `sb_channels`, `sb_profiles`, `sb_movies` | creator | Create submission |
| Rules | Creator rules | `sb_profiles` / policy text | account/public depending final | Read |
| Review Queue | Admin approve/publish gate | `sb_submissions`, `sb_movies`, `sb_profiles`, `sb_channels` | admin | Approve/decline/publish |

Submit Video writes pending rows to sb_submissions, not directly to sb_movies. Review Queue is the admin publish gate.

### Group Play

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Playlists | Playlist builder | `sb_playlists`, `sb_playlist_movies`, `sb_movies`, `sb_profiles` | viewer+/creator | Create/edit/delete own playlists |
| Channels | Channel management | `sb_channels`, `sb_movies`, `sb_profiles` | creator starter | Create/edit own channel |
| My Channel | User channel dashboard | `sb_channels`, `sb_collections`, `sb_movies`, `sb_playlists`, `sb_profiles`, `sb_submissions` | account | Edit own profile/channel |
| Collections | Collection builder | `sb_collections`, `sb_collection_movies`, `sb_movies`, `sb_profiles` | creator growth | Create/edit/delete own collections |
| Player 2 | Group/watch player | `sb_movies` | public | Read/play |

The route access map already assigns minimum plan and feature flags for playlists, channels, and collections.

### Social

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Social Profile | Profile wall, privacy, family, comments, likes | `sb_profiles`, `sb_profile_social_settings`, `sb_social_posts`, `sb_social_post_comments`, `sb_social_post_reactions`, `sb_user_family_relationships`, `sb_user_friends`, `sb_private_messages` | account | Create/edit own posts/profile/social settings |
| Friends | Friends/family bridge | `sb_user_friends`, `sb_private_messages` | account | Request/accept/remove/message |
| News Feed | Feed posts/comments/likes/events | `sb_social_posts`, `sb_social_post_comments`, `sb_social_post_reactions`, `sb_social_events`, `sb_social_event_rsvps` | account | Post/comment/like/edit/delete own |
| Groups and Events | Groups, group posts, events, RSVP | `sb_social_groups`, `sb_social_group_members`, `sb_social_posts`, `sb_social_post_comments`, `sb_social_post_reactions`, `sb_social_events`, `sb_social_event_rsvps` | account | Create group/event/post/comment/RSVP |

Social Profile, Friends, Groups/Events, and News Feed are passed as a complete social group.

### Settings / User Management

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Profile Settings | Account profile settings | `sb_profiles` | account | Update own profile |
| User Management Dashboard | Owner/admin control room | `sb_profiles`, `sb_admin_audit_log`, `sb_account_deletion_requests` | owner | Manage users via RPC |
| Pricing Matrix / Feature Shop | Pricing preview | none/write disabled | public reference | Read-only |
| Permissions Matrix | Permission inspector | `sb_profiles`, `sb_admin_audit_log` | owner | Read-only inspector |
| Settings Hub | Platform/settings route hub | varies | account optional | Depends on cards |
| Theme Studio | Branding/theme studio | `sb_app_settings` | feature add-on | Update theme settings if enabled |

User Management confirms real owner controls for role, submit privilege, account status, admin level, plan, and permissions_json.

It also confirms safety locks: protected page lock, owner/admin guard, no service-role in browser, no admin/owner delete, profile RPC, and Edge Function Auth delete boundary.

### Policy / Admin / Owner

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Policy Centre | Policy docs | `sb_policy_documents` | public | Read |
| Policy Reader | Published policy | `sb_policy_documents` | public | Read |
| Policy Admin Editor | Edit policy docs | `sb_policy_documents` | admin/owner | Create/edit/publish |
| Admin Centre | Admin command deck | admin tables | owner/admin | Admin actions |
| Live Readiness | Readiness diagnostics | many read-only | owner/admin | Read/check |
| Test Checklist | Tests | read-only | owner/admin | Read/check |
| Tools | Tools | varies | owner/admin | Controlled |
| Health Check | Health | read-only | owner/admin | Read/check |
| Mux Manager | Mux/video tools | future/video | owner/admin | Locked until ready |
| Storage Prep | Storage readiness | storage settings | owner/admin | Locked until ready |
| Backup / Safety | Backup/safety | backup/admin | owner/admin | Locked until ready |

The route access map classifies these admin routes as owner/admin or owner-only.

---

## 9. Web Builder Master Matrix

Current Web Builder flow:

```text
Hub
↓
Pages Manager
↓
Studio / Publish
↓
Published Full Preview
```

### Web Builder pages

| Page | Correct function | Tables | Lock | CRUD |
| --- | --- | --- | --- | --- |
| Web Builder Hub | Doorway/control hub | `sb_profiles`, `sb_site_pages` | Web Builder | Read workspace |
| Owned Pages Manager | Page manager | `sb_profiles`, `sb_site_pages` | Web Builder owner | Create/edit/delete `sb_site_pages` |
| Studio / Overlay Route Truth Machine | Builder canvas/studio | `sb_profiles`, `sb_site_pages` | Web Builder owner | Edit existing page source |
| Published Full Preview | Full rendered page | `sb_profiles`, `sb_site_pages`, `sb_form_submissions` | Web Builder owner/public-preview depending publish | Submit forms |
| Menu Builder | Page menu builder | `sb_profiles`, `sb_site_pages` | Web Builder owner | Edit menu settings |
| Header/Footer Code | Builder shell/header/footer | `sb_profiles`, `sb_site_pages` | Web Builder owner | Edit `settings_json.web_builder_shell` |
| Form Designer | Forms | `sb_profiles`, `sb_site_pages`, `sb_form_submissions`, `sb_private_messages` | Web Builder owner | Create/edit forms |
| Form Inbox Bridge | Builder inbox | `sb_form_submissions`, `sb_private_messages`, `sb_user_friends`, `sb_user_blocks` | Web Builder owner | Reply/status actions |
| Assets | Assets | profiles/site pages/storage | Web Builder owner | Existing asset flow only |
| Route Map | Planning map | `sb_profiles` | Web Builder owner | Read-only |
| Control Map | Control map | `sb_profiles` | Web Builder owner | Read-only |
| Source Map | Truth checker | `sb_profiles`, `sb_site_pages` | Web Builder owner | Read-only |

---

## 10. Web Builder Domain and Subdomain Hosting Plan

### Current evidence

Pages Manager already has hosting fields inside sb_site_pages.settings_json, including:

```text
customDomain
subdomain
hostingStatus
sslStatus
deployTarget
notes
```

It normalizes those fields through web_builder_hosting, domain_custom, domain_subdomain, hosting_status, ssl_status, and deploy_target.

When saving page rows, the same page persists those hosting fields into sb_site_pages.settings_json.

### Phase 1 hosting: use existing table

Do this first:

```text
sb_site_pages.settings_json.web_builder_hosting.customDomain
sb_site_pages.settings_json.web_builder_hosting.subdomain
sb_site_pages.settings_json.web_builder_hosting.hostingStatus
sb_site_pages.settings_json.web_builder_hosting.sslStatus
sb_site_pages.settings_json.web_builder_hosting.deployTarget
```

No new SQL required for Phase 1.

### Phase 2 hosting: future real hosting tables

Only after Phase 1 is proven:

```text
sb_builder_sites
sb_builder_domains
sb_builder_deploys
sb_builder_revisions
```

These are already listed as future/planning-only tables, so they should not be migrated until code and SQL are delivered together.

### Required hosting workflow

```text
Create / choose builder page
↓
Set subdomain or custom domain
↓
Save hosting metadata to sb_site_pages.settings_json
↓
Preview
↓
Publish/deploy status
↓
Later: migrate to sb_builder_domains and sb_builder_deploys when approved
```

### Required domain states

```text
planning
pending_dns
dns_found
ssl_pending
ssl_active
published
failed
paused
```

No DNS automation should be promised until the deploy/domain provider path is chosen.

---

## 11. Two Inbox Flow Plan

Two inboxes are required.

### Inbox Flow A - Social / Private Messages

Primary table:

```text
sb_private_messages
```

Used by:

```text
Social Profile
Friends
News Feed
Groups
Global footer communications overlay
Web Builder Form Inbox private-message tab
```

### Inbox Flow B - Web Builder Form Submissions

Primary table:

```text
sb_form_submissions
```

Used by:

```text
Web Builder forms
Published Full Preview form submissions
Web Builder Form Inbox submissions tab
Global footer submissions overlay
```

### Rule

Never merge the two flows.

They can appear in the same communications overlay, but they must remain separate data lanes:

```text
Private message = person-to-person
Form submission = website lead/contact/form response
```

---

## 12. CRUD Rules

### Full CRUD required

These pages need create/edit/delete where ownership allows it:

```text
Genres
Playlists
Channels
Collections
Web Builder Pages Manager
Menu Builder
Header/Footer Builder
Form Designer
Policy Admin Editor
User Management Dashboard
```

### Partial CRUD required

```text
Watchlist = create/delete own rows
Favourites = create/delete own rows
Likes = create/delete own rows
Submit Video = create own submission
Review Queue = approve/decline/publish
Social posts = create/edit/delete own posts
Comments = create/delete own comments where allowed
Events = create/RSVP/edit own/admin
Groups = create/join/manage own/admin
```

### Read-only by design

```text
Route Registry
Permissions Inspector
Pricing Preview
Source Map
Route Map
Control Map
Live Readiness
Health Check
Manifests
```

Source Map is a truth checker, not another editor, and is read-only.

---

## 13. Replacement Rule

If a page is too blocked or too tangled to patch safely:

```text
DO NOT PATCH SMALL PIECES
SEND FULL PAGE REPLACEMENT
```

Every full replacement package must include:

```text
1. Full HTML
2. Full CSS
3. Full JS
4. Any required SQL
5. Any RLS/storage policy notes
6. Route registry update notes
7. Smoke test checklist
```

No exceptions.

If SQL is required, SQL and full-page code must be delivered in the same package.

---

## 14. SQL Plan

### Current answer

No SQL should be executed yet.

Reason:

- Registry proof already passed current tables.
- Web Builder manifest says no schema/RLS/storage changes are approved in the current checkpoint.
- Web Builder domain/subdomain metadata can start inside existing sb_site_pages.settings_json.
- Pricing and permissions are still preview/read-only for billing/entitlements.

### SQL only becomes required when one of these happens

```text
Real domain records need ownership/audit/history
Real deploy records need rollback/publish history
Real paid entitlements need immutable plan/add-on tracking
Real team permissions need team/member tables
Real notifications need sb_social_notifications
Real post media needs sb_social_post_media
Real blocking needs sb_user_blocks if not already present live
```

### SQL package rule

When SQL is needed, deliver it as:

```text
SQL migration
+
full affected page replacement
+
registry update
+
rollback notes
```

Never give loose SQL alone if the page depends on it.

---

## 15. Implementation Roadmap

### Phase 0 - Freeze

Do not touch:

```text
index.html
home-global-helpers-v7-4-4-test.html
Web Builder Full Preview
Web Builder Form Inbox
global footer shell
Supabase config bridge
RLS/storage policies
payment state
```

unless a real break is proven.

### Phase 1 - Generate the Master Audit Sheet

Create a read-only audit from the registry:

```text
Page
Route
Group
Shell
Route class
Read tables
Write tables
Permission source
Pricing tier
CRUD required
CRUD present
Dead links
Old links
Action needed
```

Use:

```text
stream-bandit-route-registry-v7-13-001.js
all-pages-version-registry-v7-12-122-current-routes-test.html
stream-bandit-route-access-map-v7-12-271.js
```

### Phase 2 - Resolve Route Lock Conflicts

Known conflict:

```text
Genres
```

Registry says admin; access map says public.

Correct resolution:

```text
Page public for browsing
Admin controls locked for create/edit/delete
```

Then verify no other route class conflicts.

### Phase 3 - Main App Rail Cleanup

Patch only links.

Remove or canonicalize old rails:

```text
collections-clean-machine-v7-12-48-test.html
collections-clean-machine-v7-12-49-test.html
collections-clean-machine-v7-12-50-test.html
collections-global-helpers-v7-5-1-test.html
collections-browse-shell-v6-46-1-test.html
player-two-global-helpers-v7-3-4-test.html
player-2-clean-machine-v7-12-57-test.html
user-dashboard-concept-v6-68-test.html
plans-pricing-matrix-v6-69-test.html
permissions-matrix-v6-70-test.html
```

Map them through the existing canonical map. Do not delete them immediately.

### Phase 4 - Web Builder Rail Cleanup

Every Web Builder route must link correctly:

```text
Hub -> Pages Manager
Hub -> Studio
Hub -> Preview
Hub -> Assets
Hub -> Form Designer
Hub -> Form Inbox
Hub -> Source Map
Hub -> Control Map
Hub -> Route Map
```

Pages Manager already builds per-page links for:

```text
Studio
Preview
Form Designer
Form Inbox
Source Map
Header/Footer
Page Menu
```

### Phase 5 - Domain/Subdomain Hosting Pass

Use existing sb_site_pages.settings_json first.

Add/verify UI fields in Pages Manager only:

```text
Custom domain
Subdomain
Hosting status
SSL status
Deploy target
Domain notes
```

No SQL in Phase 5.

### Phase 6 - Permission Enforcement Pass

Every protected route must resolve through:

```text
route access map
authority gate
profile fields
permissions_json
plan_key
account_status
```

Do not rely on visual-only locks.

### Phase 7 - Pricing Matrix Activation Plan

Keep pricing page preview-only until:

```text
Payment provider chosen
Plan entitlements finalized
Entitlement storage design approved
RLS policies written
Upgrade/downgrade rules approved
Refund/cancel handling approved
Admin override rules approved
```

Until then, pricing only informs permission design.

### Phase 8 - CRUD Gap Pass

For each page:

```text
Check create
Check edit
Check delete
Check ownership
Check admin override
Check readback
Check error messages
```

Patch only missing required CRUD.

### Phase 9 - Registry Re-Scan

After each batch:

```text
Run registry scan
Run protected file scan
Run Supabase proof
Compare route count
Compare write routes
Compare unknown tokens
Compare table matrix
```

Target:

```text
routes OK: 69/69 or better
protected files OK: 16/16
proof tables readable
unknown tokens classified
no accidental schema claims
```

### Phase 10 - Final Promotion Lock

Only after all checks pass:

```text
Update manifest
Update checkpoint
Do not rewrite index unless approved
Do not replace Home
Do not merge shells
```

---

## 16. What Must Not Happen

Do not:

```text
Merge Main App and Web Builder
Replace Home with index
Replace index with Web Builder
Remove working pages
Create new pages unnecessarily
Run random SQL
Expose service role keys
Put admin deletes in browser
Use pricing preview as real billing
Treat settings_json domain fields as real DNS automation
Rewrite passed Web Builder Full Preview
Rewrite locked Web Builder Form Inbox
Rewrite locked global footer shell
```

---

## 17. Final Success Criteria

The work is complete only when:

```text
Main App remains separate
Web Builder remains separate
Index remains platform entry
Home remains Main App Home
Main App box remains
Web Builder box remains
Every Main App page is linked
Every Web Builder page is linked
Old rails are canonicalized
Pricing matrix maps to permissions
Permissions matrix maps to dashboard/profile fields
Two inbox flows work separately
Domains/subdomains are represented in builder hosting fields
CRUD exists where required
Read-only pages stay read-only
All sb_tables are documented
No unapproved SQL is required
Registry passes
Protected file scan passes
Supabase proof passes
No working features are lost
```

This is the master plan to follow: registry-first, source-safe, no feature loss, no schema surprise, Main App and Web Builder separate, old links canonicalized, permissions centralized, domains staged through existing builder page metadata first, and full-page replacement only when a page is genuinely too blocked to patch safely.
