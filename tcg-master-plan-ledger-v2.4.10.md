# Stream Bandit TCG — Master Plan V2.4.10 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.10.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.10.md`  
**Continuity parent:** `b5baf1dde2d39fc45e93f41cd609d22af18808c2`  
**Owner-family baseline:** 40 gameplay owners  
**Release:** 🔒 HOLD merge / `main` / public / live / production.

## V2.4.10-001 — parent accepted

**State:** ✅

V2.4.9 accepted gameplay is recorded at `0df1e344...`; continuity head `b5baf1dd...` contains only the acceptance synchronization and passed TCG #663, Migration #833 and Functional #859.

## V2.4.10-002 — live setup owners verified

**State:** ✅ EVIDENCE ACCEPTED

Supabase project `xzxqfrvqdgkzwujbkdbk` is ACTIVE_HEALTHY. Deployed `tcg-private-alpha-api` v3 is ACTIVE and JWT-protected. Its existing setup routes are `opening_choice`, `setup_place`, `setup_return` and `setup_ready`.

No Supabase mutation is required.

## V2.4.10-003 — setup board transport

**State:** ✅ SOURCE CANDIDATE

Release-shaped battlefield now exposes setup destinations from selected hand state and submits only server protocol fields. The browser does not classify starter cards or slot legality.

## V2.4.10-004 — reusable card-context action row

**State:** ✅ SOURCE CANDIDATE

The pure renderer gains generic intent markup for card-context actions without network/gameplay authority. `setup_return` is the first consumer; Attack remains unchanged.

## V2.4.10-005 — setup lifecycle controls

**State:** ✅ SOURCE CANDIDATE

Opening first/second and Setup Ready controls route directly to the existing private-alpha lifecycle owner. Both success and rejection re-sync authoritative state.

## V2.4.10-006 — validation fence

**State:** ✅ ACCEPTED @ `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`

TCG #665, Migration #835 and Functional #861 all succeeded at the exact repaired head. Review threads were zero, legacy combined statuses had no entries, and the bounded V2.4.10 delta from `b5baf1dd...` was 2 commits / 9 intended files.

## V2.4.10-007 — historical Realm regression repair

**State:** ✅ ACCEPTED

Initial head `783c66b0...` exposed only two stale V2.4.9 presentation assertions. Repair head `f9f12f9d...` modified one historical Realm regression test so later tabletop versions can advance cache identity while still proving the V2.4.9 Realm authority contract. No gameplay/controller/server bytes changed in the repair.

## V2.4.10-008 — Attack / Ability rule fence

**State:** ✅ EVIDENCE ACCEPTED

GitHub `supabase/functions/tcg-match-actions/index.ts` matches deployed Supabase `tcg-match-actions` v2 byte-for-byte.

Attack is card-context and turn-ending: full Attack damage/effects/choices/listeners and defeat-resolution complete before canonical Aftermath and turn advancement. Special extra-turn rules may alter who receives the next turn.

All 19 current Set One manual active Abilities are `timing: own_turn` and exactly once per controller turn. Their effects are card-defined and include inspection/search/reorder, Essence attach/move, healing, switching, modifiers, Shield transfer, control replacement and related programs. Triggered/continuous Abilities are separate.

## V2.4.10 checkpoint

**Accepted exact head:** `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`.  
**INTERACT-01:** ✅ accepted through tap/select path.  
**PR:** #576 remains draft/unmerged.  
**Supabase production:** unchanged.  
**`main` / GitHub Pages / public/live:** HOLD.  
**Next:** re-read latest GitHub comments + canonical Master Plan before selecting V2.4.11.
