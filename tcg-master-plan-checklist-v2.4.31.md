# Stream Bandit TCG V2.4.31 Checklist — TCG Shell Isolation Repair

## Human evidence
- [x] At 100% zoom the generic Stream Bandit website header is visibly rendered above the TCG.
- [x] At 25% zoom the legacy header remains present and the capped TCG top navigation shrinks into the centre.
- [x] User reports Settings can lead back to Stream Bandit instead of remaining game-owned.

## Root cause
- [x] `stream-bandit-shell-v6-24.js` is not config-only.
- [x] Its `ensureFoundation()` loads Stream Bandit header, footer, theme projector, route/access and global-helper machinery.
- [x] Its route registry exposes the platform Settings route.
- [x] TCG auth/controller code can operate from `StreamBanditSupabaseConfig` without `StreamBanditShell`.

## Repair
- [x] Add `stream-bandit-tcg-config-v2-4-31.js` as public config-only bridge.
- [x] Bridge exposes no header/footer/theme/global-helper/route registry.
- [x] Every authenticated TCG route replaces `stream-bandit-shell-v6-24.js` with the config-only bridge.
- [x] TCG Settings route remains exactly `tcg-settings.html`.
- [x] Existing shared Auth Gate remains the authentication owner.
- [x] Existing Supabase URL/publishable-key values are reused; no secret/service-role key is introduced.
- [x] Existing gameplay, matchmaking, database, RLS and Edge Function owners are unchanged.
- [x] Remove TCG top-bar 1320px cap and add low-zoom fixed-client scaling.
- [x] Document/body remain non-scrolling; bounded feeds remain the only scrolling surfaces.

## Gates
- [x] Exact-head TCG Validation passes.
- [x] Exact-head Migration Replay passes.
- [x] Exact-head Functional Smoke passes.
- [x] Unresolved review threads = 0.
- [ ] Human 100% screenshot shows no generic Stream Bandit header.
- [ ] Human 25% screenshot keeps the TCG screen-filling without the capped mini-navigation.
- [ ] Human Settings click remains inside `tcg-settings.html`.
