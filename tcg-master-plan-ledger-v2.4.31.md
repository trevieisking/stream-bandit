# Stream Bandit TCG V2.4.31 Ledger

## V2.4.31-001 — Human defect evidence
100% and 25% screenshots show the generic Stream Bandit header above the TCG. User also reports Settings escaping back to Stream Bandit.

## V2.4.31-002 — Root cause
`stream-bandit-shell-v6-24.js` claims legacy shell retirement but its `ensureFoundation()` dynamically loads `stream-bandit-header-shell-v7-12-156.js`, `stream-bandit-footer-shell-v7-12-156.js`, the theme projector, route/access components and global helper loader. The TCG pages were loading that file for config, therefore unintentionally booting the website shell.

## V2.4.31-003 — Correct owner boundary
New `stream-bandit-tcg-config-v2-4-31.js` exposes only public Supabase client configuration. Auth remains owned by the existing shared Auth Gate. No StreamBanditRoutes/StreamBanditShell object, dynamic loader or platform Settings alias is created.

## V2.4.31-004 — Route and zoom repair
All TCG client pages use the config bridge. Primary Settings remains `tcg-settings.html`. The TCG top-bar max-width cap is removed and a low-browser-zoom media contract restores client scale without enabling document scrolling.

## V2.4.31-005 — Release boundary
Draft PR #576 only. No main, Pages-public, Supabase runtime or protected Writer change.
