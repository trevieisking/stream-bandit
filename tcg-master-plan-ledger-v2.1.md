# Stream Bandit TCG — Master Plan V2.1 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.1.md`  
**Historical V2 ledger:** `tcg-master-plan-ledger-v2.md`  
**Historical runtime ledger:** `tcg-master-plan-ledger.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.1-1 — 2026-09-16

## Rules

- This file continues the V2 audit trail; it does not rewrite older ledgers.
- GitHub exact commit/PR/comment evidence is repository truth.
- Supabase is live/deployed truth.
- The 8 / 193 / 8 private-alpha baseline remains historical truth until runtime integration changes it.
- Concept images define visual direction, not exact rules authority.
- Structured data defines card rules/numbers.
- UI code never becomes a duplicate gameplay mutation owner.

## Continuity checkpoint

V2 visual/battle authority was accepted through PR #556 at merge:

`29c689fe603d684d4b2cb53c29479f1a88633a79`

That checkpoint locked:

- ten deck/pack visual families
- uploaded match video as interaction choreography reference
- Creature action shapes = Ability + Attack 1 OR Attack 1 + Attack 2
- named numeric properties
- Basic / Rare / Extra Rare / Mythic
- Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic
- dedicated artwork target on every printable identity
- 40-owner architecture retained

## V2.1 transactions

### V2.1-001 — Underworld / Grave Pact design package accepted

**State:** ✅ accepted design/content authority

PR: #557  
Candidate head: `0e59b4affebb648829cdfc9f0e1e325917e0de40`  
Merge SHA: `a61a9795e545ccc50c44e9f5b95c5b0d9e5cc173`

Accepted files:

- `tcg-underworld-grave-pact-v2-candidate.json`
- `tcg-underworld-grave-pact-v2-review.md`

Accepted shape:

- 24 identities
- 11 Creature / 4 Essence / 9 Tactic
- 3 pack-only identities
- exact 60-card Grave Pact starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic copies
- signature Mythic: Thanavor — Debtbound Sovereign
- every Creature obeys the two-action-slot V2 rule

Safety boundary:

- no runtime
- no registry integration
- no migration
- no Edge function
- no Supabase deployment
- no live page change

### V2.1-002 — Fairy / Glimmerwish design package accepted

**State:** ✅ accepted design/content authority

PR: #558  
Candidate head: `e01ebd35a82750d7429d452c91c1a72a4c17681b`  
Merge SHA: `16a745a3cf96f6caf00c34ad88896fb0dcca2a73`

Accepted files:

- `tcg-fairy-glimmerwish-v2-candidate.json`
- `tcg-fairy-glimmerwish-v2-review.md`

Accepted shape:

- 24 identities
- 11 Creature / 4 Essence / 9 Tactic
- 3 pack-only identities
- exact 60-card Glimmerwish starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic copies
- signature Mythic: Moonpetal Empress
- every Creature obeys the two-action-slot V2 rule

Safety boundary:

- no runtime
- no registry integration
- no migration
- no Edge function
- no Supabase deployment
- no live page change

### V2.1-003 — Exact ten-family identity target resolved

**State:** ✅ accepted planning arithmetic

Evidence:

- historical 8 elemental packages = 8 × 24 = 192 elemental identities
- Fairy accepted = 24 identities
- Underworld accepted = 24 identities
- V2 elemental total = 10 × 24 = 240
- Prismatic Founder remains 1 separate special identity

Therefore:

- **240 elemental identities**
- **+ 1 Prismatic Founder**
- **= 241 total V2 gameplay identities**
- **10 exact 60-card starter targets**

This replaces the earlier `TBD_AFTER_COMPLETE_FAIRY_AND_UNDERWORLD_REGISTRIES` planning value.

### V2.1-004 — V2-G0 closed

**State:** ✅ COMPLETE

V2-G0 now has:

- ten approved deck/pack families
- explicit Fairy + Underworld scope
- exact total target 241
- accepted visual card contract
- accepted battle interaction contract
- accepted rarity/printing contract

No further design-scope work is required before structured-schema translation.

### V2.1-005 — V2-G1 becomes the active work lane

**State:** 🔎 IN PROGRESS

Current truth:

- Astral / Ember / Gale / Grove / Shade / Stone / Tide / Volt: canonical structured/runtime-proven package sources already exist
- Fairy: accepted V2 design package; canonical `sb-tcg-card-v0.2` translation pending
- Underworld: accepted V2 design package; canonical `sb-tcg-card-v0.2` translation pending

Locked next operation:

1. translate Fairy to exact shared schema/effect opcodes;
2. translate Underworld to exact shared schema/effect opcodes;
3. validate both against existing owners/capabilities;
4. produce one ten-package deterministic registry + ten exact starter authority;
5. do not change live/runtime until that evidence is complete.

## Current tracker

| Area | State |
|---|---|
| Private-alpha backend 8/193/8 | ✅ historical/live baseline |
| V2 visual/product families | ✅ 10/10 |
| Fairy design identities | ✅ 24/24 |
| Fairy starter | ✅ 60/60 design |
| Underworld design identities | ✅ 24/24 |
| Underworld starter | ✅ 60/60 design |
| V2 total target | ✅ 241 |
| V2-G0 | ✅ COMPLETE |
| Fairy canonical schema | 🔎 NEXT |
| Underworld canonical schema | 🔎 NEXT |
| V2-G1 | 🔎 IN PROGRESS |
| Card renderer | ☐ |
| Battle Client | ☐ |
| Two-user V2 E2E | ☐ |
| Public V2 promotion | 🔒 HOLD |
