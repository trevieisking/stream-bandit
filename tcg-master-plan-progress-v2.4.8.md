# Stream Bandit TCG — Master Plan Progress V2.4.8

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Accepted functional parent:** V2.4.7 @ `0e8887730a4af6c47d69f7089644e977bc3036fb`  
**Continuity-only parent:** `bc721a31ec1f5a48dd7910993177b402ab4d4fdf`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release state:** 🔒 HOLD PR merge / `main` / public / live / production release.

## 1. Target

V2.4.8 implements the next locked master-plan slice: direct physical hand card → Reserve interaction through the existing server-owned `play_creature` action.

This is a browser transport/presentation slice only. It does not add a gameplay owner, Edge Function, migration, card rule, card-specific branch or browser legality engine.

## 2. Existing authoritative owner

`tcg-match-actions` already owns `play_creature` and receives:

- the existing action envelope: `match_id`, `client_nonce`, `expected_revision`;
- `card_uid`;
- `reserve_index`.

The server alone validates:

- active-player/play-phase authority;
- Reserve index range and whether the Reserve slot is empty;
- whether the selected hand card is a legal Baby / Standalone / Mythic placement;
- canonical Creature placement;
- entered-play event listeners;
- movement listeners;
- heal-listener continuation;
- defeat/resolution continuation.

## 3. Browser interaction

The battle controller now lets the player:

1. select a known hand card;
2. see the four local Reserve positions become explicit placement targets;
3. choose a Reserve position;
4. send only `card_uid + reserve_index` beyond the shared action envelope;
5. refresh from authoritative state after success or rejection.

The browser deliberately does not pre-classify the selected card as Creature/Baby/Standalone/Mythic and does not claim Reserve emptiness as gameplay legality. Invalid attempts remain server rejections.

## 4. Selection safety

Hand selection uses only the authoritative instance UID already visible to the player. Selecting the same hand card again cancels that local presentation state. Selecting the Vanguard for card actions clears hand selection, and selecting a hand card clears Vanguard selection.

Selection state is not persisted and never becomes match authority.

## 5. Interaction scope

This closes only the **Reserve placement source transport** portion of the wider Creature-from-hand interaction family. It does not claim:

- setup Vanguard placement;
- Evolution;
- Essence/Relic/Realm/Tactic interactions;
- Ability/Withdraw;
- legal-target highlighting;
- pending-choice UI;
- any server rule parity beyond the existing `play_creature` owner.

## 6. Validation

The final V2.4.8 exact head must freshly pass:

1. TCG Card Pass 2 Validation;
2. Code Labs Migration Replay from zero;
3. Code Labs V50 Functional Smoke;
4. zero material review threads;
5. bounded diff review against continuity parent `bc721a31...`.

After acceptance, re-read the Master Plan and choose the next smallest direct-card interaction that can reuse an existing canonical server owner without moving rules into the browser.


## 7. Exact-head acceptance

V2.4.8 source was accepted on PR #576 at exact head `d218c946daf7fa1971f32589ca0a7dd5c7a655a1`.

Fresh same-head evidence:

- TCG Card Pass 2 Validation #659 — SUCCESS;
- Code Labs Migration Replay #829 — SUCCESS from zero;
- Code Labs V50 Functional Smoke #855 — SUCCESS, including independent zero-to-current PostgreSQL replay;
- review threads — 0;
- legacy combined-status entries — none found;
- bounded V2.4.8 delta from continuity parent `bc721a31ec1f5a48dd7910993177b402ab4d4fdf` — 3 commits ahead / 0 behind / exactly 8 intended files.

This acceptance authorizes the V2.4.8 capability as PR source state only. PR merge, `main`, GitHub Pages/public, live and production release remain HOLD.

**Next planning instruction:** re-read the accepted Master Plan and choose the next smallest direct-card interaction that reuses an existing canonical server command without moving gameplay legality into the browser.
