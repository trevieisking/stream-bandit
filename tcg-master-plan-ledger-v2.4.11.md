# Stream Bandit TCG — Master Plan V2.4.11 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.11.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.11.md`  
**Continuity parent:** `2d13fb08de349e4f1ca263d650885d6feab3d991`  
**Owner-family baseline:** 40 gameplay owners.

## V2.4.11-001 — target selected

**State:** ✅

Canonical V2.4.1 interaction order makes Evolution the earliest unfinished direct-card family after accepted INTERACT-01 and INTERACT-05.

## V2.4.11-002 — missing seam proven

**State:** ✅

Deployed Supabase `tcg-match-actions` v2 has `evolve` but no read-only legal-target/preflight action. Browser-side calculation would duplicate stage, predecessor and timing legality.

## V2.4.11-003 — Evolution legality engine

**State:** ✅ SOURCE CANDIDATE

A pure shared engine now projects legal targets and validates final declarations while preserving existing public error names. Creature stack mutation remains with `runtimeV02EvolveCreatureFromHand`.

## V2.4.11-004 — read-only target action

**State:** ✅ SOURCE CANDIDATE

`evolve_targets(card_uid)` returns authoritative target coordinates/anchors without commit or mutation.

## V2.4.11-005 — first exact-head validation

**State:** 🧪 REPAIR REQUIRED

Initial PR head `aa79924b...` reached TCG #667. The game-rule design was not rejected; two integration contracts failed:
1. the new Evolution legality state type was narrower than the existing runtime Creature shape used by Creature/Condition owners;
2. release-control still fingerprinted the old 84-file `tcg-match-actions` closure although the new Evolution module correctly made it 85 files.

Migration/Functional work on that head is allowed to finish for evidence, but Supabase deployment remains HOLD.

## V2.4.11-006 — bounded repair

**State:** ✅ DETACHED REPAIR CANDIDATE

The repair adds the existing runtime Creature fields to the legality type/test fixture and regenerates the immutable release-control closure using final Git blob SHAs and the same SHA-256 algorithm enforced by `card-pass-2-release-control.test.mjs`. TCG #668 then proved one final type-only mismatch: lifecycle turn stamps must be numeric, matching the existing Creature owner. The follow-up tightens only `entered_turn/evolved_turn/became_vanguard_turn` to optional numbers and refreshes the same closure fingerprint. No Evolution rule or mutation behavior changes.

## V2.4.11-007 — deployment fence

**State:** 🔄

After repaired exact-head CI succeeds, separately decide in-place Supabase promotion of `tcg-match-actions`. No database change is required.

## Checkpoint

PR/main/public/live production remain unchanged until the repaired head is validated.


## V2.4.11-008 — exact-head acceptance

**State:** ✅ ACCEPTED

Exact head `a1d39bfb35edb7040e551a7a27ccfa326eb282cf` passed:

- TCG #669;
- Migration #839;
- Functional #865;
- 0 review threads;
- no legacy combined-status entries.

The complete V2.4.11 delta from `2d13fb08...` is 3 commits / 8 intended files.

## V2.4.11-009 — in-place Supabase promotion

**State:** ✅ ACCEPTED

Existing `tcg-match-actions` was promoted in place to version 3. It remains ACTIVE with `verify_jwt: true`.

Post-deploy verification proved:
- deployed `functions/tcg-match-actions/index.ts` exactly matches accepted GitHub source;
- deployed `functions/_shared/tcg-match-evolution-legality-v0-2.ts` exactly matches accepted GitHub source;
- all 82 pre-existing live dependencies were compared to the accepted GitHub head before deployment and matched byte-for-byte;
- the repository source closure contains 85 files while Supabase returns 84 deployed source files because `tcg-match-damage-packet-context-v0-2.ts` is referenced through TypeScript `import type` and stripped from the runtime package;
- this normalization predates V2.4.11: live v2 was already 83 files against the prior 84-file source closure.

No database/schema, new function, PR merge, `main`, public page or full-live promotion occurred.

## V2.4.11 complete

**INTERACT-02 server legality seam:** ✅  
**Next:** V2.4.12 browser Evolution interaction using server `evolve_targets` + existing `evolve`.  
**Release boundary:** PR merge/main/public/full-live remain HOLD.
