# Stream Bandit TCG V2.4.29 Checklist — Auth Gate Startup Parity
- [x] V2429-AUTH-01 Screenshot failure traced to Auth Gate first-load concurrency, not missing deck rows.
- [x] V2429-AUTH-02 Play waits for/reuses the existing authoritative Auth Gate decision.
- [x] V2429-AUTH-03 A null in-flight enforce result falls back to Auth Gate decide/state rather than being treated as denied.
- [x] V2429-AUTH-04 Play controller does not duplicate profile approval rules.
- [x] V2429-AUTH-05 Existing RLS-owned tcg_decks query remains unchanged.
- [x] V2429-AUTH-06 Existing tcg-private-alpha-api matchmaking owner remains unchanged.
- [ ] V2429-AUTH-07 Exact-head CI passes.
- [ ] V2429-AUTH-08 Human signed-in deck-feed test passes on a same-origin/live-capable route.
Decision boundary: browser startup sequencing only. No Auth Gate rewrite, DB/RLS change, Edge Function change, deck-rule change or economy change.

- [x] V2429-LAYOUT-01 Legacy/secondary TCG routes are wrapped by the one shared client shell into a bounded internal content feed.
- [x] V2429-LAYOUT-02 Document/body scrolling remains forbidden; no per-page scrolling helper is introduced.
