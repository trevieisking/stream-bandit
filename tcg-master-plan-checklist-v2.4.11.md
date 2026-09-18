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

- [x] **V2411-CI-01** TCG Card Pass 2 Validation #669 succeeded at `a1d39bfb35edb7040e551a7a27ccfa326eb282cf`.
- [x] **V2411-CI-02** Migration Replay #839 succeeded from zero at `a1d39bfb35edb7040e551a7a27ccfa326eb282cf`.
- [x] **V2411-CI-03** Functional Smoke #865 succeeded, including independent PostgreSQL replay, at `a1d39bfb35edb7040e551a7a27ccfa326eb282cf`.
- [x] **V2411-REVIEW-01** review threads were 0 and legacy combined-status entries were none found.
- [x] **V2411-DIFF-01** V2.4.11 stayed bounded to 3 commits / 8 intended files from continuity parent `2d13fb08de349e4f1ca263d650885d6feab3d991`.
- [x] **V2411-REPAIR-01** runtime Creature type shape includes the existing stack/Essence/Relic/damage/Shield/condition fields required by downstream owners.
- [x] **V2411-REPAIR-02** release-control `tcg-match-actions` closure is regenerated to the exact final dependency graph rather than weakening the closure gate.
- [x] **V2411-DEPLOY-01** accepted source was promoted in-place to existing Supabase `tcg-match-actions` version 3 with `verify_jwt: true`; no new function/schema change.
- [x] **V2411-DEPLOY-02** deployed v3 entrypoint and Evolution legality engine were re-read and match accepted GitHub source byte-for-byte. Supabase omits the repository's type-only `tcg-match-damage-packet-context-v0-2.ts` from the runtime source package, yielding 84 deployed files from the 85-file source closure.

## E. Master-plan interaction state

- [x] **INTERACT-01** Creature → Vanguard/Reserve tap/select path.
- [ ] **INTERACT-02** Evolution board interaction — legality seam built here; browser target/highlight/commit remains V2.4.12.
- [ ] **INTERACT-03** Essence.
- [ ] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.
- [ ] **INTERACT-07** full cancellation.
- [ ] **INTERACT-09** full Ability/Attack/Withdraw card context.

**Decision:** V2.4.11 source + existing-function deployment ACCEPTED ✅. PR merge / `main` / GitHub Pages/public / full live release remain HOLD 🔒.
