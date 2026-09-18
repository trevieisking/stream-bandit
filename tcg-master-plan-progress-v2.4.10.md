# Stream Bandit TCG — Master Plan Progress V2.4.10

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Accepted V2.4.9 gameplay head:** `0df1e34414b0acc9dbccb5a6a4f7707dd6263f5f`  
**V2.4.9 continuity parent:** `b5baf1dde2d39fc45e93f41cd609d22af18808c2`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release state:** 🔒 HOLD PR merge / `main` / public / live / production release.

## 1. Target

V2.4.10 completes the missing setup/Vanguard side of **V2-INTERACT-01 Creature from hand → Vanguard/Reserve** on the release-shaped battlefield.

The browser gains only the setup intents needed to drive the already-deployed authoritative setup lifecycle:

- opening toss winner chooses first/second;
- selected hand card may be submitted to Vanguard or Reserve during that player's setup turn;
- a setup Creature may be returned to hand through its card-context action;
- Setup Ready locks the current player's setup and allows canonical setup distribution/turn start.

V2.4.8's ordinary-play hand → Reserve transport remains unchanged.

## 2. Existing authoritative owners

Deployed Supabase `tcg-private-alpha-api` v3 is ACTIVE with JWT verification enabled and already owns:

- `opening_choice(choice)` through Match Flow;
- `setup_place(card_uid, where, index)` through Creature/Card-Zone ownership;
- `setup_return(where, index)` through Creature/Card-Zone ownership;
- `setup_ready` through Match Flow + one Card-Zone distribution batch.

Server authority retains setup-turn order, starter-card eligibility, Vanguard/Reserve occupancy, index legality, Vanguard requirement, Reward distribution, opening draw and play-phase transition.

No Supabase deployment is required.

## 3. Card-first setup presentation

Hand selection remains presentation-only. During the local setup turn:

- selected hand card exposes Vanguard and all four Reserve destinations;
- the browser does not inspect Creature stage/family or predict slot legality;
- placed setup Creatures expose one generic card-context **Return to hand** intent;
- the reusable renderer gains a data-only generic card-context action row while preserving Attack markup and zero network/gameplay authority;
- Setup Ready and opening first/second choice remain lifecycle controls rather than gameplay-rule owners.

Success and rejection both re-fetch authoritative match state.

## 4. Delivery integrity

Battle controller, renderer and tabletop cache keys advance to V2.4.10. Existing V2.4.8 Reserve play, V2.4.9 Realm play and Attack transports remain preserved.

## 5. Master-plan effect

After exact-head acceptance, the V2.4.1 interaction family may mark **INTERACT-01** complete through the tap/select path:

- setup Vanguard/Reserve placement is present;
- ordinary play Reserve placement remains present from V2.4.8;
- server authority remains final.

Drag/drop polish and generic legal-target highlighting remain separate visual/input gates and are not falsely claimed here.

## 6. Validation

The final exact head must freshly pass TCG Card Pass 2 Validation, Migration Replay from zero, Functional Smoke, zero material review threads and bounded diff review from `b5baf1dd...`.
