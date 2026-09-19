# Stream Bandit TCG — Master Plan Progress V2.4.11

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `2d13fb08de349e4f1ca263d650885d6feab3d991`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release:** 🔒 HOLD merge / `main` / public / live / production.

## 1. Target

V2.4.11 builds the server-side legal-target seam required by **INTERACT-02 Evolution** before the browser is allowed to display green legal stacks.

The canonical Creature/Evolution family remains owner #13. No gameplay owner #41 is added.

## 2. Why this server seam is required

The deployed `evolve` action already owns:

- active-player/play-phase authority;
- first-personal-turn Evolution lock;
- Teen/Adult card requirement;
- exact `evolves_from_id` predecessor match;
- entered/evolved-this-turn timing;
- one Evolution per stack per turn;
- mutation, evolved event, listeners, healing and defeat continuation.

The V2.4.1 master plan also requires **legal Evolution targets to glow green**. The browser must not reproduce those rules to calculate the glow.

V2.4.11 therefore adds one read-only server projection, `evolve_targets(card_uid)`, backed by the same Evolution legality engine that revalidates the final `evolve` declaration.

## 3. Engine boundary

New shared module `tcg-match-evolution-legality-v0-2.ts` belongs to the existing Creature/Evolution family.

It owns only legality evaluation and legal-target projection. It does not move cards, mutate a Creature stack, resolve listeners, touch the database, or perform network I/O.

`runtimeV02ValidateEvolutionDeclaration` preserves the existing public error contract and runs before `runtimeV02EvolveCreatureFromHand`.

## 4. Production boundary

Source candidate first. Production Supabase `tcg-match-actions` remains unchanged until exact-head TCG validation is green and deployment receives a separate PROMOTE decision.

After a safe deployment, V2.4.12 can wire the board to `evolve_targets` and the existing `evolve` action without a browser rules engine.

## 5. Validation

Fresh TCG Validation, Migration Replay, Functional Smoke, review-thread check, bounded diff review, exact release-control dependency closure and exact deployed-function identity are required before V2.4.11 acceptance.

### Candidate repair note

Initial V2.4.11 head `aa79924b...` exposed two integration defects only: the new legality type omitted existing runtime Creature fields required by downstream owners, and the immutable `tcg-match-actions` dependency closure still described the pre-engine 84-file graph. The repair widens only the TypeScript state shape and regenerates the existing release-control fingerprint for the final 85-file closure; Evolution gameplay rules are unchanged.


## 6. Exact-head acceptance and deployment

V2.4.11 source is accepted at exact PR head `a1d39bfb35edb7040e551a7a27ccfa326eb282cf`.

Fresh exact-head evidence:

- TCG Card Pass 2 Validation #669 — SUCCESS;
- Code Labs Migration Replay #839 — SUCCESS from zero;
- Code Labs V50 Functional Smoke #865 — SUCCESS, including independent PostgreSQL replay;
- review threads — 0;
- legacy combined-status entries — none found;
- bounded V2.4.11 delta from `2d13fb08de349e4f1ca263d650885d6feab3d991` — 3 commits / 8 files.

Production promotion was limited to the existing Supabase `tcg-match-actions` Edge Function only.

**Deployed function:** version 3 / ACTIVE / `verify_jwt: true`.

The deployed runtime-reachable entrypoint and new Evolution legality engine match the accepted GitHub source byte-for-byte.

Supabase reports 84 source files against the 85-file repository source closure because `tcg-match-damage-packet-context-v0-2.ts` is reached only through TypeScript `import type` and is stripped by deployment packaging. This is the same pre-existing normalization pattern that left live v2 at 83 files against the earlier 84-file source closure. No runtime implementation is missing.

No database/schema change, no new Edge Function, no PR merge, no `main`, GitHub Pages/public or full live release occurred.

**Next target:** V2.4.12 — complete INTERACT-02 by wiring selected Evolution cards to the server-owned `evolve_targets` projection, visibly highlighting only returned legal stacks, and committing through the existing `evolve` action.
