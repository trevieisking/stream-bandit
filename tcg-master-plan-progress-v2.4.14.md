# Stream Bandit TCG — Master Plan Progress V2.4.14

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `1e136bfbe4aa5804a2699bbbab6a1a20a9bde57d`  
**Master-plan target:** INTERACT-03 Essence browser interaction  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Complete the browser half of direct Essence interaction while keeping all card-family, once-per-turn and target legality in the existing server Essence Attachment owner.

The selected hand card asks deployed `tcg-match-actions` v4 for `attach_essence_targets(card_uid)`. When that owner reports the card eligible, the browser highlights only returned occupied friendly Vanguard/Reserve coordinates. Choosing one sends the existing `attach_essence` action.

## 2. Authority boundary

Browser owns:
- selected-card presentation;
- read-only server projection requests;
- rendering returned legal coordinates;
- green target feedback;
- click/tap/keyboard intent;
- clearing local selection after commit.

Essence Attachment owner retains:
- Essence card identity;
- once-per-turn manual-use lock;
- occupied friendly Creature legality;
- exact target anchor identity;
- final declaration revalidation;
- source removal, attachment mutation, Surge lifecycle and listener continuation.

No card-family or turn-rule branch is added to browser JavaScript.

## 3. Compatibility

Evolution remains higher-priority when its server projection claims the selected card. If neither Evolution nor Essence projection is eligible, existing Creature Reserve and Realm destinations remain available exactly as before. Setup, Attack and card-owned action controls remain unchanged.

## 4. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required. This is a browser/UI slice; no additional Supabase deployment is required unless source evidence reveals a server defect.


## 5. Accepted checkpoint

V2.4.14 is accepted at browser head `6a1dda89ede7bc4519f19f52d3bf9ce56b7ebf94` after TCG #681, Migration Replay #851 and Functional Smoke #877 all succeeded.

INTERACT-03 Essence is complete: the server remains the sole legality owner while the battlefield provides direct selected-card → legal green Creature target → attach interaction. Supabase remains `tcg-match-actions` v4 ACTIVE with JWT verification preserved; no V2.4.14 server redeploy was required.

The next target must be chosen by re-reading the synchronized Master Plan/Checklist and PR continuity after this accepted checkpoint; do not infer it from browser code alone.
