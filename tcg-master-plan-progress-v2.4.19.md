# Stream Bandit TCG — Master Plan Progress V2.4.19

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `72ad47d3c2fdd0f958d943e6571145bbc96a3662`  
**Master-plan target:** INTERACT-06 Tactic browser interaction  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Complete the browser half of direct Ally/Device Tactic interaction without moving any Tactic legality into the browser.

The selected hand card is projected through live `tcg-tactic-actions` v4 using `play_tactic_legality(card_uid)`. Only a server-eligible card receives a **Play Tactic** action on that card. The commit reuses `play_tactic`.

## 2. Ownership boundary

Browser owns only:
- selected-card presentation;
- the read-only playability request;
- showing Play Tactic when `eligible === true`;
- sending the selected card UID to `play_tactic`;
- rendering the generic authoritative pending-choice view;
- collecting the option IDs selected by the player;
- sending `choice_id + choice_ids` to `resolve_choice`.

Server remains sole owner of:
- Ally/Device vs Realm/Relic routing;
- Tactic identity/effect schema;
- first-player Ally restriction;
- play requirements;
- required targets/resources;
- unsupported effect contracts;
- effect execution and continuation;
- every pending-choice option, label, min/max and mode.

## 3. Generic choice surface

The Tactic owner already persists three browser-visible Tactic choice families:
- `pending_choice`;
- `pending_movement_listener_choice` while phase is `effect_resolution`;
- `pending_heal_listener_choice` while phase is `effect_resolution`.

All use the same public schema: `id`, `kind`, `waiting`, `prompt`, `min`, `max`, `mode`, and `options[{id,label}]`.

The browser renders that schema generically and never branches on a card ID, effect opcode, listener ID, Tactic subtype or choice kind.

## 4. Card-owned control

Play Tactic is rendered through the existing generic card-action renderer inside the selected hand card. There is no detached normal-play Tactic control strip. The separate choice panel appears only while an authoritative Tactic continuation is pending.

## 5. Compatibility

Projection precedence becomes Evolution → Essence → Relic → eligible Tactic → generic Creature/Realm fallback.

An ineligible Tactic projection does not invent another browser route; all attempted fallback actions remain server-validated.

The card renderer, Supabase runtime, database schema, migrations and card definitions are unchanged in this slice.

## 6. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required. Because V2.4.19 changes no Supabase runtime bytes, accepted `tcg-tactic-actions` v4 remains live without redeployment.


## 7. Accepted checkpoint

V2.4.19 is accepted at browser head `0ebe40be69223bb1ebc6df88c1bc5b1d1a0aa5e8` after TCG #696, Migration #866 and Functional Smoke #892 all succeeded.

INTERACT-06 Tactic is complete. Supabase remains `tcg-tactic-actions` v4 ACTIVE with JWT verification preserved; no V2.4.19 server redeploy was required.

**Next locked target from canonical V2.4.1:** INTERACT-07 — misclick/selection can be cancelled before authoritative commit where rules permit. Existing select-again toggle behavior must be proven first; add new code only if the current transport cannot satisfy the requirement safely.
