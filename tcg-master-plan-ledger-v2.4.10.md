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

**State:** 🔄 FRESH EXACT-HEAD EVIDENCE REQUIRED

Fresh TCG Validation, zero-to-current Migration Replay, Functional Smoke, review-thread check and bounded diff review are mandatory before acceptance.

## V2.4.10 checkpoint

PR #576 remains draft/unmerged. Production Supabase and `main` are unchanged.
