# Stream Bandit Global Whatnots Owner Keeper V7.12.67

Date: 2026-05-25

Trevor confirmed the Global Helper Property Owner Scan is the right machine to keep before building the role gate.

Latest scan result from V7.12.66:

- Repo files: 979
- Text scanned: 972
- HTML pages: 609
- JS helpers: 135
- Global helper files: 482
- Script links: 2649
- Missing scripts: 0
- Window globals: 106
- Settings keys: 243
- Supabase tables: 18
- Storage buckets: 0 detected by this scan
- Owner families: 13

Meaning:

- The app has several global helpers and ownership families.
- The role gate must not replace the settings bridge, shell/menu helper, brand helper, profile/auth helpers, or Supabase table ownership.
- The gate must sit above the current property-owner system and decide who can use or write a feature.

Global whatnots to keep visible in the Owner section:

1. Shell/menu/global navigation
   - Main helper: `stream-bandit-shell-v6-24.js`
   - Owns overlay menu, route guard, search and owner menu visibility.

2. Settings bridge/global display
   - Main helper: `stream-bandit-settings-global-v7-1-8.js`
   - Owns global settings/theme/style readout.

3. Brand/logo/favicon/app icons
   - Main helpers/pages include brand logo helper and app icon builder.
   - Public sees the result; owner controls changes.

4. Account/profile/avatar/banner
   - Main helpers include auth/profile/avatar sync.
   - Supabase profile rows decide account/role state.

5. Watch/player/save state
   - Watchlist, favourites, likes, continue watching and history are viewer features.

6. Creator submissions/review queue
   - Submit/rules/my channel/review queue are creator/admin flows.

7. Supabase data tables
   - Tables found by scan must be mapped before gate writes are unlocked.
   - Client gate is UI only; backend safety still needs Supabase policy enforcement later.

8. Admin/system tools
   - Admin centre, health, Mux, storage, backup and readiness are admin/owner only.

9. Owner machines
   - One Machine, Platform Control, scans and route tools are owner-only.

10. Payments/billing
   - Must stay locked until payment build is intentionally designed.

Decision:

Keep the Global Helper Property Owner Scan as an owner tool. Use it before building or changing the role gate, because it tells us which helper/property family owns each feature.

Next safe task:

Add an Owner menu route for this scan when the shared shell can be edited safely, then build the feature-aware role gate from this property-owner map.
