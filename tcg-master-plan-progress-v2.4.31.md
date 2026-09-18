# Stream Bandit TCG Master Plan Progress V2.4.31 — TCG Shell Isolation Repair

## Defect proven from human screenshots
The V2.4.30 HTML did not directly include the generic header/footer scripts, but it still loaded `stream-bandit-shell-v6-24.js`. That legacy bridge calls `ensureFoundation()`, which dynamically loads the Stream Bandit website header, footer, theme projector, route/access machinery and global helpers. This is the direct source of the header seen above the TCG.

The same legacy shell exposes Stream Bandit platform route aliases including its platform Settings route, violating the requirement that TCG navigation remain inside game-owned pages.

## Repair
V2.4.31 introduces one static `stream-bandit-tcg-config-v2-4-31.js` bridge. It exposes only the public Supabase URL and publishable key through the existing config globals already consumed by the Auth Gate and TCG controllers. It contains no dynamic loader, route registry, theme projector, header/footer or global helper boot.

Every TCG route that previously loaded `stream-bandit-shell-v6-24.js` now loads the config-only bridge before the shared Auth Gate.

Settings remains `tcg-settings.html`; no platform Settings alias exists in the TCG bridge.

## Zoom correction
The V2.4.30 client top bar was capped at 1320 CSS pixels. At low browser zoom this cap caused the game navigation to become physically tiny and centred. V2.4.31 removes the cap and includes low-resolution/low-zoom scaling for the TCG typography and controls while retaining the fixed 100dvh/no-document-scroll contract.

## Protected boundaries
No database, migration, RLS policy, Edge Function, gameplay rule, matchmaking owner, card definition or economy change.
PR #576 remains draft/unmerged. main/public/live remain HOLD until exact-head gates and human test.


## Product-source verification
Product repair candidate: `e33159a054a693927f68b110a42e6f837117e89f`.
- TCG Card Pass 2 Validation #757 — SUCCESS.
- Code Labs V50 Functional Smoke #953 — SUCCESS, including PostgreSQL replay.
- Standalone Migration Replay #927 was cancelled before jobs because an older replay still held the concurrency lane; no migration failure occurred.
- Exact source audit: 24 TCG client routes checked, 0 legacy `stream-bandit-shell-v6-24.js` dependencies, 0 global theme-projector dependencies, and all 24 load the TCG config-only bridge.
- Battle direct theme-projector dependency discovered during the loop was removed before this acceptance checkpoint.

## Final control-sync contract
The control-sync head that contains this evidence is accepted only if its own Validation, Migration Replay and Functional Smoke all complete successfully with zero unresolved review threads. Human 100%/25% and Settings-click checks remain open.
