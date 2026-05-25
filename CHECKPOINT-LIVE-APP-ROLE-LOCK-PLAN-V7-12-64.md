# Stream Bandit Live App Role Lock Plan V7.12.64

Date: 2026-05-25

Purpose: stop building more scanners and move into live app repair/promotion planning.

## Current scan position

Latest big scan result from Trevor:

- Repo files: 976
- HTML pages: 608
- Menu pages checked: 50
- Menu load fail: 0
- Clickable routes: 107
- Missing clickable routes: 0
- Review/Old routes: 0
- Locked non-payment controls: 20
- Payment locked: 0 reported by scanner, but payments/billing must stay intentionally disabled until billing is designed
- Write/Admin actions: 79

Interpretation:

- Main overlay menu routes are now stable.
- Child clickable route targets are now stable.
- The real remaining work is not routing. The real work is permissions, role gates, button behaviour, and making pages usable for the correct user type.
- Do not change the 50 main menu routes unless a page is genuinely broken.
- Do not delete old files yet. Archive/review cleanup happens after live promotion is stable.

## Simple rule going forward

Open everything for Trevor/admin/owner.
Lock dangerous controls for normal users.
Keep payment/billing locked for everyone until billing is intentionally built.
Public/free users should be able to browse, watch allowed content, create profile/watch state, and submit videos where allowed.
Normal users must not access admin, review queue, live promotion, schema, delete, rollback, route tools, or owner controls.

## Roles

### Guest / not signed in

Allowed:

- Home
- About
- Library browsing preview
- Supabase Library browsing preview
- Genres browsing preview
- Global Search basic search
- Policy / FAQ Centre
- Published Policy Proof
- Pricing/Fair Pricing page as read-only information
- Login/account entry

Restricted:

- Watchlist/Favourites/Likes saves require sign-in
- Continue Watching and Watch History require sign-in
- Submit Video requires sign-in
- My Channel requires sign-in
- Admin/Owner/Settings write tools blocked

### Signed-in viewer

Allowed:

- Home
- Details
- Player 1 / Player 2 for allowed content
- Continue Watching
- Watch History
- Watchlist
- Favourites
- Liked
- Accessibility/player comfort
- Library
- Supabase Library
- Genres
- Global Search
- About
- Playlists read/use
- Channels read/use
- Collections read/use
- Profile Settings: own profile only
- Policy/FAQ/public policy pages

Restricted:

- Review Queue
- Admin Centre
- Live Readiness promotion tools
- All Pages Version Registry admin actions
- Test Checklist admin actions
- Tools Page admin actions
- Health Check admin actions that expose admin controls
- Mux Manager
- Storage Prep
- Backup/Safety
- Owner section
- Platform Control Centre
- Brand/App Icons write actions
- Brand Image Helper write actions
- Favicon builder publish/write actions

### Creator

Everything viewer can do, plus:

- Submit Video
- Rules
- My Channel
- Creator profile/channel editing for their own channel
- View own submissions/status

Restricted:

- Review Queue decisions
- Approve/reject submissions
- Admin storage/Mux actions unless owner/admin

### Admin

Everything creator can do, plus:

- Review Queue
- Admin Centre
- Health Check
- Test Checklist
- Tools Page
- Mux Manager
- Storage Prep
- Backup/Safety
- Version Registry read/tools
- Content moderation and submission review
- Channel/content admin actions

Restricted:

- Owner-only live promotion, schema, delete repository files, route machine publishing, global brand ownership, payment/billing setup unless owner grants it

### Owner

Everything allowed:

- One Machine
- Platform Control Centre
- Brand/App Icons
- Brand Image Helper
- Favicon/App Icon Builder
- Route machines
- Final Shell Navigation
- Live Readiness promotion controls
- Replace index.html / promote live
- Rollback live
- Delete files only after archive review and backup checkpoint

Still locked for now:

- Payment/billing/checkout/subscriptions/Stripe

## Build order from here

### Pass 1: Global role gate helper

Create/update one shared helper used by the app pages:

- Detect signed-in Supabase user
- Read profile role from `sb_profiles` or equivalent profile table
- Return role: guest, viewer, creator, admin, owner
- Add helper functions:
  - `canWatch()`
  - `canSaveWatchState()`
  - `canSubmitVideo()`
  - `canReviewSubmissions()`
  - `canUseAdminTools()`
  - `canUseOwnerTools()`
  - `paymentsLocked()`
- Normal buttons should not disappear randomly. They should show a friendly lock message when the user lacks permission.

### Pass 2: Replace locked placeholders with role-aware buttons

Use the big scan locked rows as the first batch:

- Global Search locked actions: owner/admin only unless they are safe user actions
- Profile Settings protected actions: own profile editable for user; role change/promote/delete admin/owner only
- Live Readiness locked actions: owner only
- Policy Admin global footer promotion: owner/admin only
- Platform Control Centre blocked actions: owner only
- Brand/App Icons save/upload/remove/publish: owner only

### Pass 3: User-facing watch flow

Make the user app feel live:

- Home loads content
- Library and Supabase Library load content
- Search works
- Details opens
- Player opens
- Watchlist/Favourite/Like save if signed in
- Continue Watching and Watch History save if signed in
- Accessibility/player comfort always available

### Pass 4: Creator flow

Make creator pages usable but safe:

- Submit Video form works for signed-in users/creators
- Rules page works read-only
- My Channel loads own profile/channel/submissions
- Review Queue hidden/locked for non-admin users

### Pass 5: Admin/owner flow

Make admin and owner pages open fully for Trevor/admin:

- Review queue actions work for admin/owner
- Mux manager admin only
- Storage prep admin only
- Backup/safety admin/owner only
- Brand/app icon tools owner only
- Live readiness owner only
- Route scanners and cleanup tools owner only

### Pass 6: Live promotion gate

Before index/live promotion:

- Menu Test Board: 50/50 pass
- Focused Scope: Missing 0
- Clickable Child Audit: Missing 0
- Full App Action Audit: no unexpected locked non-pay controls for owner/admin
- Manual smoke test: guest, signed-in user, creator, admin/owner
- Payments still disabled with a clean message

## What not to do now

- Do not build more scanners unless a new class of bug appears.
- Do not delete old files yet.
- Do not change main menu route names now.
- Do not promote payment/billing.
- Do not expose admin/owner pages to normal users.

## Immediate next coding task

Build the global role gate and permission wrapper, then apply it to the 20 locked non-payment rows shown by the Full App Action Audit. The target outcome is:

- Trevor/admin/owner sees working controls.
- Normal users see only safe user controls.
- Restricted controls show a clear friendly lock message.
- Payment remains intentionally locked.
