# Stream Bandit TCG — Master Plan Progress V2.4.9

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Accepted functional parent:** V2.4.8 @ `d218c946daf7fa1971f32589ca0a7dd5c7a655a1`  
**Continuity parent:** `1896dae20805cb700051eadbab301b844650f7a5`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release state:** 🔒 HOLD PR merge / `main` / public / live / production release.

## 1. Target

V2.4.9 implements the next smallest direct-card interaction: selected local hand card → shared Realm slot through the existing server-owned `play_realm` action.

This is presentation/transport only. It adds no gameplay owner, Edge Function, migration, card rule, card-ID branch or browser legality engine.

## 2. Existing authoritative owner

GitHub source and deployed Supabase `tcg-match-actions` v2 agree on `play_realm`. Beyond the shared match/revision/nonce envelope, the browser needs only `card_uid`.

The server alone validates and executes active-player/play-phase authority, Tactic/Realm family legality, once-per-turn timing, same-name replacement prohibition, canonical Realm placement/replacement, event/movement/heal listener continuation and defeat/resolution continuation.

## 3. Browser interaction

When a hand card is selected during an otherwise action-ready play phase, the existing four Reserve targets remain available and the shared Realm slot also becomes a keyboard/click destination. Choosing the Realm sends only `card_uid`; success clears the consumed local selection and both success/rejection re-fetch authoritative state.

The browser deliberately does not pre-classify the card as a Realm and does not predict replacement legality.

## 4. Delivery integrity

The battle HTML tabletop marker and cache keys for the modified tabletop CSS/controller advance to V2.4.9 so browsers load current interaction bytes. The V2.4.7 renderer remains unchanged.

## 5. Scope retained

V2.4.9 does not claim Evolution, Essence, Relic, generic Tactic targeting, setup Vanguard placement, Ability/Withdraw, pending-choice UX or release completion.

## 6. Validation

The final V2.4.9 exact head must freshly pass TCG Card Pass 2 Validation, Code Labs Migration Replay from zero, Code Labs V50 Functional Smoke, zero material review threads and bounded diff review against continuity parent `1896dae2...`.

After acceptance, re-read the Master Plan and choose the next smallest direct-card interaction backed by an existing canonical server owner.


## 7. Exact-head acceptance

V2.4.9 source was accepted on PR #576 at exact head `0df1e34414b0acc9dbccb5a6a4f7707dd6263f5f`.

Fresh same-head evidence:

- TCG Card Pass 2 Validation #662 — SUCCESS;
- Code Labs Migration Replay #832 — SUCCESS from zero;
- Code Labs V50 Functional Smoke #858 — SUCCESS, including independent zero-to-current PostgreSQL replay;
- review threads — 0;
- legacy combined-status entries — none found;
- bounded delta from continuity parent `1896dae20805cb700051eadbab301b844650f7a5` — 2 commits ahead / 0 behind / exactly 8 intended files.

The accepted browser capability is limited to selected known hand card → shared Realm destination. Server `play_realm` retains all Realm family/timing/replacement/listener/defeat legality and mutation authority.

**Release boundary:** accepted PR source state only. PR merge, `main`, GitHub Pages/public, live and production release remain HOLD.

**Next planning instruction:** re-read the latest GitHub comments and Master Plan before choosing V2.4.10. GitHub comments remain source of truth for any locked next slice.
