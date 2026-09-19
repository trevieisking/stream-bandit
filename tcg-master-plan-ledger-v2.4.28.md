# Stream Bandit TCG V2.4.28 Ledger
## V2.4.28-001 — Visual authority
User approved seven 1672×941 Play/Battle/Decks/Collection/Battle Pass/Shop/Settings references. SHA-256 fingerprints are recorded in `tcg-visual-authority-v2.4.28.md`. These references are immutable until the user explicitly approves a replacement.

## V2.4.28-002 — Fixed viewport contract
The TCG client owns 100dvh. Document/page scrolling is prohibited. Only bounded feeds may scroll.

## V2.4.28-003 — Shell separation
Rendered Stream Bandit website header/footer are removed from TCG routes. Existing shared config/auth functionality remains reusable and non-visual.

## V2.4.28-004 — Battle Pass
Battle Pass becomes a required route and navigation destination. Its visual surface may ship ahead of its owner, but progression, premium state, currency and reward claims remain gated.

## Release boundary
PR #576 remains draft/unmerged. main/Pages/public/full-live remain HOLD until exact-head CI and human visual acceptance.


## V2.4.28-005 — CI assertion alignment
Initial visual source exposed three stale assertions: the historical blanket ban on match menus, the V2.4.26 CSS cache string, and literal Ranked copy. These were updated to the user-approved TCG-owned in-game menu, V2.4.28 visual CSS cache with unchanged V2.4.26 gameplay-controller cache, and the still-gated Coming Soon Ranked state. No gameplay/runtime product bytes changed in those corrections.

At head `18d41a62be6d226f9e31404b50ab04250432ce37`, TCG Validation #746 and Functional Smoke #942 are green. A fresh control-sync head is required only to acquire a non-cancelled exact-head standalone Migration Replay after concurrency cleared.
