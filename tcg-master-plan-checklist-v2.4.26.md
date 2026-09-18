# Stream Bandit TCG — Master Plan Checklist V2.4.26

**Plan:** `tcg-master-plan-progress-v2.4.26.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.26.md`  
**Continuity parent:** `22c6ce6669a786f83c709b86782c5a5f5b128bf4`

## A. Match projection

- [ ] **V2426-MATCH-01** read-only `play_card_targets` accepts exact selected hand UID only in the existing active-play gate.
- [ ] **V2426-MATCH-02** ordinary Creature legal Reserve targets are proven on clones through the existing Creature placement owner.
- [ ] **V2426-MATCH-03** Realm legality is proven on cloned state through the existing Realm transaction owner.
- [ ] **V2426-MATCH-04** projection does not commit or mutate authoritative state.
- [ ] **V2426-MATCH-05** existing `play_creature` / `play_realm` commands remain final legality authority.

## B. Browser projection

- [ ] **V2426-BROWSER-01** selected hand card requests the Match direct-play projection.
- [ ] **V2426-BROWSER-02** only sanitized server-projected Reserve/Realm destinations become interactive/highlighted.
- [ ] **V2426-BROWSER-03** stale/missing projection blocks direct Creature/Realm submission.
- [ ] **V2426-BROWSER-04** browser contains no Baby/Standalone/Mythic or Realm once-per-turn/same-name legality evaluator.
- [ ] **V2426-BROWSER-05** accepted specialized Evolution/Essence/Relic/Tactic routing remains higher-priority and unchanged.
- [ ] **V2426-BROWSER-06** battle cache advances to V2.4.26.

## C. Regression / scope

- [ ] **V2426-REG-01** all accepted V2.4.25 visible-state behavior remains intact.
- [ ] **V2426-REG-02** no schema, migration, card-data, Tactic runtime or Setup runtime change.
- [ ] **V2426-REG-03** Match mutation actions are unchanged except for adding the read-only projection route/import.

## D. Exact-head source acceptance

- [ ] **V2426-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2426-CI-02** Migration Replay succeeds from zero.
- [ ] **V2426-CI-03** Functional Smoke succeeds.
- [ ] **V2426-REVIEW-01** review threads/status findings are clean.
- [ ] **V2426-DIFF-01** exact diff is bounded to V2.4.26 scope.

## E. Deployment acceptance

- [ ] **V2426-DEPLOY-01** promotion controller returns PROMOTE for Match only.
- [ ] **V2426-DEPLOY-02** `tcg-match-actions` deploys in place with JWT verification preserved.
- [ ] **V2426-DEPLOY-03** deployed Match readback/entrypoint proves the accepted projection is live.
- [ ] **V2426-DEPLOY-04** Tactic/Setup/database remain unchanged.

## F. Canonical effect after E passes

- [ ] **STATE-VIS-05** legal targets highlight; illegal targets remain inactive.
- [ ] **ORDER-05** direct card interaction + board-visible state implementation stage complete.
