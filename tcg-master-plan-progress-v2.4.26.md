# Stream Bandit TCG — Master Plan Progress V2.4.26

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `22c6ce6669a786f83c709b86782c5a5f5b128bf4`  
**Master-plan target:** close the final Stage 3 board-visible state item, `STATE-VIS-05`.  
**Release:** 🔒 HOLD merge / `main` / public / full-live.

## 1. Exact gap

Specialized direct interactions already use authoritative server projections:
- Evolution;
- Essence;
- Relic;
- Tactic;
- Ability;
- Withdrawal;
- Reward claim;
- mandatory promotion.

The remaining fallback path can visually activate ordinary Reserve/Realm destinations before the server has proven them legal.

## 2. V2.4.26 owner boundary

Add one read-only Match projection for a selected hand-card UID.

The Match owner returns only legal direct destinations:
- ordinary Creature → exact empty legal Reserve slots;
- Realm → the shared Realm destination only when the canonical Realm owner accepts the play.

Creature legality is exercised against cloned player state through the existing Creature placement owner. Realm legality is exercised against cloned canonical state through the existing Realm transaction owner.

The projection never mutates authoritative state. The existing `play_creature` / `play_realm` commands remain the final legality authority and revalidate on commit.

## 3. Browser boundary

The browser:
- stores only sanitized server-projected direct-play targets;
- highlights only projected Reserve/Realm destinations;
- keeps illegal destinations inactive;
- refuses a direct Creature/Realm intent if its projection is stale/missing;
- does not classify Baby/Standalone/Mythic or Realm cards;
- does not evaluate Realm once-per-turn or same-name replacement rules.

## 4. Scope

Match read-only projection + browser controller/cache + regression tests + V2.4.26 controls.

No database schema, migration, card-data, Tactic runtime, Setup runtime, or gameplay-rule rewrite.

## 5. Acceptance

Freeze one exact candidate head and require:
1. TCG Card Pass 2 Validation;
2. Migration Replay from zero;
3. Functional Smoke;
4. zero unresolved material review threads/status findings;
5. bounded diff review;
6. in-place Match deployment verification if source acceptance is PROMOTE.

After verified Match deployment:
- STATE-VIS-05 closes;
- V2-VISUAL-02 becomes 12/12;
- ORDER-05 closes;
- Stage 3 direct tabletop interaction + visible state is ready for focused human testing.
