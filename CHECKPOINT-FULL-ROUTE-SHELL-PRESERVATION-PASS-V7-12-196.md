# Stream Bandit Checkpoint — Full Route / Shell Preservation Pass V7.12.196

Date: 2026-06-02

## Status

FULL GROUP SCAN / PRESERVATION PASS COMPLETE.

This checkpoint records the major route, shell, group, policy, admin, owner and user-management scan after the V7.12.189 current registry baseline.

The goal of this pass was not to rewrite everything. The goal was to find the small stale route/helper/data assumptions that were powerful enough to make the app feel broken, fix only proven safe issues, and preserve dangerous working logic.

## Baseline route truth remembered

Current Registry baseline:

- `V7.12.189 Current Routes Registry / 53 Active Entries / 50 Unique URLs`
- 50/50 route URLs loaded 200
- 16/16 protected files loaded 200

Active registry route:

- `all-pages-version-registry-v7-12-122-current-routes-test.html`

Important rule:

Many page URLs stayed the same while the page internals moved forward. This is correct. Route truth is about the stable URL the shell/menu expects.

Examples:

- `settings-platform-control-hub-v7-12-85-test.html` now contains newer Settings Hub fixes.
- `live-readiness-global-helpers-v7-10-2-test.html` now contains V7.12.196 shell/search proof.
- `policy-documents-centre-v7-12-119-test.html` now contains V7.12.195 public preview logic.
- `admin-centre-command-deck-v7-12-121-test.html` now contains V7.12.195 current registry route truth.

## Major passes completed

### 1. Owner Brand route truth

Previous owner-brand pass remains valid:

- Brand / App Icons -> `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

The issue where Brand Image Helper and Favicon Builder collapsed back to Brand / App Icons was fixed earlier and confirmed.

### 2. Group Play clean/data pass

Checkpoint:

- `CHECKPOINT-GROUP-PLAY-CLEAN-SHELL-DATA-PASS-V7-12-191.md`

Confirmed:

- My Channel route truth passed.
- Playlists now reads `sb_playlists` + `sb_playlist_movies` + `sb_movies` correctly.
- Channels now reads `sb_channels.id` -> `sb_movies.channel_id` correctly.
- Channels shows published movies only.
- Hidden movies do not show.
- Player 2 queue handoff works for My Channel, Playlist and Channel.

Preserved:

- Player 2 engine was not rewritten.
- Upload permissions were not expanded.
- Public viewer pages were not given edit/upload powers.

### 3. Creator group scan

Checkpoint:

- `CHECKPOINT-CREATOR-GROUP-SCAN-STABLE-V7-12-191.md`

Confirmed:

- Submit Video writes pending rows to `sb_submissions`.
- Rules is read-only.
- Review Queue remains the publish gate into `sb_movies`.

Decision:

- No rewrite. Workflow responsibilities are correct.

### 4. Browse group scan

Checkpoint:

- `CHECKPOINT-BROWSE-GROUP-SCAN-STABLE-V7-12-191.md`

Confirmed:

- Supabase Library / Movie Row Editor was scanned only and not rewritten.
- Genres is stable/read-only.
- Global Search is stable/read-only.
- About is stable/informational.

Important:

- Supabase Library Editor is high-risk and database-reliant. Do not rewrite unless a real break is proven.

### 5. Settings group pass

Checkpoints:

- `CHECKPOINT-SETTINGS-HUB-CURRENT-ROUTES-PASS-V7-12-193.md`
- `CHECKPOINT-SETTINGS-HUB-HEADER-COUNTERS-PASS-V7-12-194.md`
- `CHECKPOINT-THEME-STUDIO-GLOBAL-SETTINGS-PRESERVED-V7-12-194.md`
- `CHECKPOINT-PROFILE-SETTINGS-SCAN-PRESERVED-V7-12-194.md`
- `CHECKPOINT-WEB-BUILDER-SCAN-PROTECTED-V7-12-194.md`

Confirmed:

- Settings Hub route truth passed.
- Settings Hub header/menu works.
- Footer appears once.
- Movie Row Editor link works.
- Watchlist/Favourites/Likes counters restored on Settings Hub.
- Theme Studio global setting keys match Theme Projector keys.
- Profile Settings profile/avatar/banner logic preserved.
- Web Builder is protected and preserved.

Important preserved paths:

- Theme Studio still owns global theme writes.
- Theme Projector reads and applies the same theme keys.
- Profile Settings still owns profile/avatar/banner writes and Supabase Storage image upload.
- Web Builder remains a V7.12.116 repair wrapper over the protected V7.12.106 engine.

### 6. Policy group pass

Checkpoint/TODO:

- `CHECKPOINT-POLICY-ADMIN-OWNER-HARDENING-TODO-V7-12-195.md`

Fixed:

- Policy Centre is public preview/read-only.
- Policy Reader is public read-only.
- Public users no longer see Admin Edit links on public policy pages.
- Reader still only loads rows where `status = 'published'`.
- Missing/unpublished policies show safe fallback text.

Preserved:

- `policy-admin-documents-v7-12-120-test.html?policy=terms` publish logic was not disturbed.

Future hardening required before public launch:

- Policy Admin must move to Admin/Owner only.
- Normal users must not edit/save/publish/archive policies.
- Supabase RLS/database policies must enforce writes, not just hidden frontend links.

### 7. Admin group pass

Checkpoints:

- `CHECKPOINT-ADMIN-CENTRE-ROUTE-TRUTH-PASS-V7-12-195.md`
- `CHECKPOINT-LIVE-READINESS-SHELL-SEARCH-PASS-V7-12-196.md`
- `CHECKPOINT-ADMIN-SUPPORT-TOOLS-SCAN-STABLE-V7-12-196.md`

Confirmed:

- Admin Centre opens.
- Current Registry route corrected to `all-pages-version-registry-v7-12-122-current-routes-test.html`.
- Admin route check passed.
- Header/menu/search functional.
- Live Readiness now proves Header Shell + Footer Shell + Theme Projector + Search Fallback + Save Counts.
- Live Readiness route check: 15/15 loaded.
- Test Checklist scanned stable.
- Tools scanned stable.
- Health Check scanned stable.
- Mux Manager scanned stable.
- Storage Prep scanned stable.
- Backup / Safety scanned stable.

Important:

Live Readiness is now the current shell/search foundation proof page again.

### 8. Owner group scan

Checkpoint:

- `CHECKPOINT-OWNER-GROUP-SCAN-PRESERVED-V7-12-196.md`

Preserved:

- Form Inbox private-message/reply logic.
- Advanced Form submission/upload logic.
- Web Builder Studio protected engine.
- Pages Manager create/hide/restore/permanent-delete logic.
- Published Preview rendering/rating/form flow.
- Brand/App Icons standalone route pass.

Deferred polish:

- Form Inbox old footer/visible route labels.
- Advanced Form old builder/preview/settings links.
- Pages Manager old builder/preview/settings links.
- One Machine internal route map still collapses Brand Image Helper/Favicon Builder back to Brand / App Icons.
- Global Helper Shell / Final Shell Navigation still uses the older global-helper stack, not the compact Live Readiness V7.12.196 pattern.

Decision:

- Preserve dangerous owner tools. Later polish one tool at a time.

### 9. User Management group scan

Checkpoint:

- `CHECKPOINT-USER-MANAGEMENT-GROUP-SCAN-STABLE-V7-12-196.md`

Confirmed:

- User Dashboard is current-schema safe.
- It only uses `sb_profiles.role` and `sb_profiles.can_submit`.
- It avoids unsupported future role names.
- Pricing Feature Shop is draft/planning only.
- Permissions Matrix is a rule map only.
- No billing was added.
- No entitlement writes were added.
- No role schema changes were made.

Deferred polish:

- Update old visible User Manager / Pricing / Permission witness links to current V7.11 routes.

## What was actually wrong

The app foundation was not massively broken.

The recurring problem was small stale route/data assumptions inside powerful places:

1. Route sanitizers and helper maps fighting each other.
2. Some active pages still showing old local header/footer/link maps.
3. Some relationship readers using old assumptions.
4. Supabase counters needing their helper/Supabase foundation restored on newly cleaned pages.
5. Public pages exposing admin/edit links where they should only preview/read.

Because several of those helpers run globally or repeatedly, a small stale route could look like an unstoppable problem.

## What must not be casually rewritten

Do not casually rewrite these without a dedicated preservation plan:

- Player 2 engine.
- Supabase Library / Movie Row Editor.
- Theme Studio.
- Profile Settings.
- Web Builder Studio / V7.12.116 wrapper / V7.12.106 base engine.
- Policy Admin publish logic.
- Form Inbox private-message logic.
- Advanced Form submission/upload logic.
- Pages Manager delete/restore logic.
- Published Preview renderer.
- User Management live `role + can_submit` controls.

## Current clean-shell target

Where safe, the target remains:

- Header Shell
- Page Content
- Footer Shell
- Theme Projector
- Search Fallback where search/route proof is needed
- Core saves/menu count helpers where header counters must match

But this is not a blanket rewrite rule for dangerous owner/admin/database tools.

## Next recommended moves

### Move 1 — Create a new current master checkpoint/manifest note

Update or create a human-readable manifest that says:

- Current Registry remains V7.12.189 route truth.
- Live Readiness V7.12.196 is the current shell/search proof.
- Settings Hub V7.12.194 is the current Settings doorway.
- Policy public pages are V7.12.195 public read-only.
- Admin Centre V7.12.195 is current-registry corrected.

### Move 2 — Owner/Admin security plan before real users

Plan and later enforce owner/admin-only access for:

- Policy Admin Editor,
- Pages Manager,
- Form Inbox,
- User Management,
- Supabase Library / Movie Row Editor,
- Storage/admin tools,
- any publish/delete/archive controls.

This must include Supabase RLS/database policy checks, not only frontend hidden links.

### Move 3 — Route-label polish pass, one risky owner tool at a time

Later, polish stale visible route labels inside:

- Form Inbox,
- Advanced Form,
- Pages Manager,
- User Dashboard,
- Pricing Feature Shop,
- Permissions Matrix,
- One Machine.

Do not rewrite their logic. Only update visible route targets after backing up and testing each page.

### Move 4 — Optional Global Helper Shell polish

`stream-bandit-global-helper-shell-v7-12-126-test.html` can later be refit closer to Live Readiness V7.12.196 if needed.

For now, Live Readiness is the stronger foundation proof page.

### Move 5 — Final live/index promotion later only

Do not promote live/index as part of this pass.

Before live/index promotion:

1. Re-run route registry.
2. Re-test Live Readiness shell/search/counters.
3. Re-test Settings Hub counters.
4. Re-test Group Play data flows.
5. Re-test Policy public/admin split.
6. Re-test Web Builder save/publish.
7. Confirm owner/admin security plan.
8. Then promote only with explicit approval.

## Final pass summary

Groups covered:

- Watch / saved pages: preserved and route truth stable.
- Browse: stable.
- Creator: stable.
- Group Play: fixed and passed.
- Settings: hub fixed; dangerous pages preserved.
- Policy: public read-only fixed; admin publish logic preserved.
- Admin: route truth, Live Readiness and support tools passed.
- Owner: preserved; route-label polish deferred.
- User Management: stable; route-label polish deferred.

Overall result:

The app is much healthier than it felt. The main system works. The remaining issues are mostly controlled polish/security-hardening tasks, not unstoppable shell failure.
