# Stream Bandit Full Feature Scan Before Role Gate V7.12.65

Date: 2026-05-25

Purpose: pause the gate build until every known Stream Bandit feature has been scanned, grouped, and assigned a sensible live-app role/permission rule.

This uses:

- The current overlay menu groups.
- The V7.12.63 Full App Action Audit result.
- The existing Settings Full Feature Control Map V7.1.5.
- Trevor's rule: make the live app usable now; no payment systems yet; no normal-user access to admin/owner/review/promotion tools.

## Current confirmed technical status

- Main menu routes: 50 checked / 50 pass.
- Focused keep scope: Missing In Scope = 0.
- Clickable child routes: Missing = 0.
- Full app action audit: Missing = 0, Review/Old = 0.
- Remaining issue class: feature permissions and locked/non-payment controls.
- Payment/billing stays locked until intentionally built.

## Feature families found / known

### 1. Core watch app

Features:

- Home
- Details
- Player 1
- Player 2 / Queue player
- Continue Watching
- Watch History
- Watchlist
- Favourites
- Likes
- Accessibility / player comfort
- Audio boost
- Fullscreen comfort
- Resume/progress saving
- Mux/HLS playback
- Direct URL playback
- External embed playback

Live rule:

- Guest can browse public content and open public details/player if allowed.
- Signed-in viewer can save Watchlist/Favourites/Likes/Continue Watching/Watch History.
- Creator/admin/owner inherit all viewer rights.
- Payment/premium video paywall stays off/locked until billing is built.

### 2. Browse/discovery

Features:

- Library
- Supabase Library
- Genres
- Global Search
- About
- Sorting/filtering
- Genre counts
- Creator/channel labels on cards
- Premium badges later

Live rule:

- Guest can browse/search public content.
- Signed-in viewer gets personal save actions.
- Supabase admin edit actions are admin/owner only.
- Global Search admin/index/promote actions are owner/admin only, not public.

### 3. Group play/social organization

Features:

- Playlists
- Channels
- My Channel
- Collections
- Channel Play All
- Playlist Play All
- Collection Play All
- Channel artwork
- Playlist artwork
- Collection artwork
- Public channel pages
- Public playlists/collections
- Future followers/subscribers

Live rule:

- Guest can view public channels/playlists/collections.
- Signed-in viewer can use public playlists/collections and save personal items.
- Creator can manage own channel and own submissions.
- Admin/owner can moderate and manage global records.

### 4. Creator/upload flow

Features:

- Submit Video
- Rules
- Review Queue
- My Channel
- Creator profile/channel editing
- Own submission status
- URL videos
- Mux/HLS videos
- Embeds
- Image uploads
- Admin approval required
- Auto-approve admin uploads

Live rule:

- Signed-in users can submit videos if creator submissions are enabled.
- Rules are public/read-only.
- My Channel requires signed-in user.
- Review Queue decisions are admin/owner only.
- Storage/Mux actions are admin/owner only.
- Creator can edit only their own channel/profile/submissions.

### 5. Account/profile

Features:

- Sign in/account state
- Profile text
- Avatar
- Banner
- Display name / username / handle
- Bio
- Contact email visibility
- Social/profile links
- Creator badge
- Admin badge
- Profile link on cards/submissions
- Own profile settings
- Role management
- Delete profile
- Promote live / protected profile admin actions

Live rule:

- Guest gets sign-in prompts.
- Signed-in viewer can edit only their own safe profile fields.
- Creator can show channel/profile details.
- Admin/owner can manage roles/moderation.
- Delete/change role/promote live are owner/admin-only and must not be public.

### 6. Comments/community - future/off until built

Features planned in the feature map:

- Comments on profile/videos/channels/playlists/collections
- Replies
- Like comments
- Report comments
- Pin comments
- Delete own comments
- Admin moderation/delete comments
- Comment count/preview

Live rule:

- Keep disabled/off until built properly.
- Do not expose half-built comments to users.
- Later: signed-in users can comment; moderation defaults on; admin/owner can moderate.

### 7. Settings/control hub

Features:

- Settings Hub
- Settings Studio / Settings Sources
- Theme Owner
- Profile owner
- Web Builder owner
- Platform diagnostics
- Final shell map
- Source files map
- Future modules
- Safety/checklist/debug
- Feature visibility controls
- Menu visibility controls
- Public/private/paid modes

Live rule:

- Settings hub/status can be visible to admin/owner only.
- Theme Owner and property-owner pages are owner/admin only while changing live app behaviour.
- Normal users never see platform settings controls.
- Settings controls availability/visibility; specialist owner pages do the actual editing.

### 8. Branding / app identity

Features:

- Header logo
- Brand image helper
- Logo upload
- Avatar/banner image helpers
- Favicon/app icon builder
- Apple touch icon
- Android/PWA icons
- Browser tab title
- App name/tagline/login text
- Shared style/theme

Live rule:

- Public sees resulting branding only.
- Owner/admin can edit branding.
- Publish live branding is owner only until stable.
- Payment branding settings remain inactive until payment build.

### 9. Web Builder

Features:

- Web Builder
- Published builder pages
- Blocks/forms/galleries/pricing/FAQ/reviews/contact blocks
- Shared style preview
- Theme inheritance
- Page layout/form blocks
- Future paywall blocks

Live rule:

- Admin/owner only for editing.
- Published builder pages can be public if marked public.
- Forms can be public only after submission storage is checked.
- Paywall blocks locked until payments are built.

### 10. Policy/legal

Features:

- Policy & FAQ Centre
- Policy Admin Editor
- Published Policy Proof
- Policy reader row
- Terms/EULA
- Privacy
- Cookies
- Family watch
- Cancellation/refunds
- Creator content
- Accessibility policy
- Public footer promotion

Live rule:

- Public can read published policies.
- Admin/owner can edit policies.
- Global footer promotion/publish actions owner/admin only.
- Policy preview links can remain but labels should not confuse users with “old preview”.

### 11. User management/pricing/permissions

Features:

- User Dashboard Concept
- Fair Pricing Matrix
- Permissions Matrix
- Pricing plans display
- Plan badges
- Upgrade prompts
- Account plan display later

Live rule:

- Pricing/Fair Pricing can be public read-only information.
- Permissions Matrix/admin role pages should be admin/owner only.
- Payment/checkout/subscriptions stay locked.
- No real payment collection until Stripe/billing rules are intentionally built.

### 12. Admin/system tools

Features:

- Admin Centre
- Live Readiness
- All Pages Version Registry
- Test Checklist
- Tools Page
- Health Check
- Mux Manager
- Storage Prep
- Backup/Safety
- Supabase Test
- Migration tools
- Local storage legacy tools
- Debug panels
- Route registry
- Dangerous actions safe mode

Live rule:

- Admin/owner only.
- Live promotion/replace index/rollback/delete/schema changes are owner-only.
- No normal users should see or use these tools.
- Delete/archive cleanup is not part of live promotion now.

### 13. Owner/control machines

Features:

- One Machine
- Platform Control Centre
- Route Guard Proof
- Route Pointer Machine
- Final Shell Navigation
- Clean Machine Menu
- Focused Scanner
- Menu Test Board
- Child Button Auditors
- Full App Action Audit
- Route doctors/diagnostics
- Brand/app icon owner tools

Live rule:

- Owner only.
- Admin can view selected diagnostics if needed.
- Normal users never see owner/control machines.
- These are not public app features.

### 14. Payments/paywall - intentionally locked

Features planned:

- Payments enabled/off
- Pricing page
- Paid service mode
- Plan badges
- Premium locks
- Upgrade prompts
- Paywall overlay
- Stripe/checkout/subscriptions later
- Current plan on profile later
- Creator paid tier later

Live rule:

- Keep payment/checkout/subscriptions locked/off now.
- Pricing page can be public as information only.
- Premium locks should show “coming later” or “not active yet”, not a broken action.

## Role matrix for live build

| Feature family | Guest | Viewer | Creator | Admin | Owner |
|---|---:|---:|---:|---:|---:|
| Home/About/Policies | View | View | View | View | View/Edit where relevant |
| Library/Genres/Search | Public browse | Browse/save | Browse/save | Manage | Manage |
| Player/Details | Public allowed content | Watch/save progress | Watch/save | Manage content | Manage content/live |
| Watchlist/Favourites/Likes | Prompt sign-in | Use | Use | Use/manage | Use/manage |
| Continue Watching/History | Prompt sign-in | Use own | Use own | Support/manage | Support/manage |
| Profile | Sign-in prompt | Edit own | Edit own/channel | Moderate/manage | Full manage |
| Submit Video | Sign-in prompt | Submit if enabled | Submit/manage own | Review/manage | Full control |
| Review Queue | No | No | No decision rights | Use | Use |
| My Channel | Sign-in prompt | Own read/basic | Edit own | Moderate | Full control |
| Channels/Playlists/Collections | View public | Use public | Own channel features | Manage | Full control |
| Settings/Theme/Brand | No | No | No | Limited admin | Full control |
| Web Builder | View published public only | View public | No edit by default | Edit | Full edit/publish |
| Admin/System | No | No | No | Use safe admin tools | Full control |
| Owner machines | No | No | No | Usually no | Use |
| Payments | Informational only | Locked | Locked | Locked | Locked until built |

## Build order after this feature scan

1. Build global permission helper with these role groups and a friendly lock message.
2. Apply it to menu visibility and page actions without changing the 50 main route filenames.
3. Unlock owner/admin controls for Trevor/admin/owner first, except payments.
4. Keep dangerous actions owner-only: replace index, promote live, rollback, delete, schema changes, payment setup.
5. Make the user-facing flow feel live: browse, watch, save, profile, creator submit.
6. Make creator/admin flows role-safe: submit videos, my channel, review queue, Mux/storage/admin tools.
7. Run the same three checks before live promotion: focused scope 0 missing, menu load 50/50, full app audit no unexpected non-payment locks for owner/admin.

## Decision

Do not build the gate blindly from only the 20 locked controls. Build it from this full feature inventory so every current and planned feature has a place.

The next coding task is still the role gate, but now it must be feature-aware, not just button-aware.