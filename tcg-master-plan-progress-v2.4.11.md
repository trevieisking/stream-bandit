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

Fresh TCG Validation, Migration Replay, Functional Smoke, review-thread check, bounded diff review and exact deployed-function identity are required before V2.4.11 acceptance.
