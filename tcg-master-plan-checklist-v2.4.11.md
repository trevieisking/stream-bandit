# Stream Bandit TCG — Master Plan Checklist V2.4.11

**Plan:** `tcg-master-plan-progress-v2.4.11.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.11.md`  
**Continuity parent:** `2d13fb08de349e4f1ca263d650885d6feab3d991`  
**Release:** 🔒 HOLD merge / `main` / public / live / production.

## A. Parent / rule fence

- [x] V2.4.10 source accepted at `f9f12f9d...`.
- [x] INTERACT-01 accepted through tap/select path.
- [x] Attack remains card-context and turn-ending after full attack resolution/Aftermath.
- [x] All 19 manual Set One active Abilities are own-turn, once per controller turn.

## B. Evolution legality owner

- [x] **EVOLVE-OWNER-01** One shared Creature/Evolution legality engine exists.
- [x] **EVOLVE-OWNER-02** First-personal-turn lock is server-owned.
- [x] **EVOLVE-OWNER-03** Teen/Adult card eligibility is server-owned.
- [x] **EVOLVE-OWNER-04** `evolves_from_id` predecessor matching is server-owned.
- [x] **EVOLVE-OWNER-05** entered/evolved-turn timing is server-owned.
- [x] **EVOLVE-OWNER-06** one-Evolution-per-stack-per-turn remains server-owned.
- [x] **EVOLVE-OWNER-07** final `evolve` command revalidates through the same engine before mutation.

## C. Read-only legal-target seam

- [x] **EVOLVE-TARGET-01** `evolve_targets(card_uid)` returns only server-projected target coordinates/anchors.
- [x] **EVOLVE-TARGET-02** target projection is non-mutating.
- [x] **EVOLVE-TARGET-03** no browser legality engine is introduced.
- [x] **EVOLVE-TARGET-04** no database/schema change or new gameplay owner is introduced.

## D. Exact-head / deployment gates

- [ ] **V2411-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2411-CI-02** Migration Replay succeeds from zero.
- [ ] **V2411-CI-03** Functional Smoke succeeds.
- [ ] **V2411-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2411-DIFF-01** diff stays bounded to Evolution legality owner/action/tests/control docs.
- [ ] **V2411-DEPLOY-01** exact accepted `tcg-match-actions` source is promoted in-place to the existing Supabase function with JWT verification preserved.
- [ ] **V2411-DEPLOY-02** deployed function source/hash/version is re-read and matches the accepted source.

## E. Master-plan interaction state

- [x] **INTERACT-01** Creature → Vanguard/Reserve tap/select path.
- [ ] **INTERACT-02** Evolution board interaction — legality seam built here; browser target/highlight/commit remains V2.4.12.
- [ ] **INTERACT-03** Essence.
- [ ] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.
- [ ] **INTERACT-07** full cancellation.
- [ ] **INTERACT-09** full Ability/Attack/Withdraw card context.

**Decision:** candidate source only until D passes; Supabase/main/public/live remain unchanged.
