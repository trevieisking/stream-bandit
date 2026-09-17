# Stream Bandit TCG — Canonical Master Plan V2.3.4

**Date:** 2026-09-17  
**Status:** active implementation checkpoint  
**Inherits:** every requirement, rule, UX authority, owner boundary, Deck Search invariant, gate and LIVE definition in `tcg-master-plan-progress-v2.3.3.md` unless explicitly changed here  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Non-negotiable authority

The original playable prototype remains the player-experience source of truth: **RESTORE, DO NOT REDESIGN**. The established 40-owner server architecture remains the gameplay authority. No debug-form redesign, card-specific helper, duplicate owner or owner #41 is authorized by this checkpoint.

The browser interaction rule is now explicit: **the card is the player control, but the card/browser is not the rules authority**. Card tap/select/drag operations produce structured intents; canonical server owners validate legality, costs, targets, state transitions, damage, listeners, defeat resolution and aftermath; the browser then renders the authoritative returned state. A second browser rules engine is forbidden.

The V2.3.3 Deck Search rule remains fully locked: every true `search.deck` has the mandatory authoritative postcondition `deck.shuffle`, with player-facing wording **Then shuffle your deck.**

## V2-G0R historical private-alpha hardening state

- **G0R-11 — Validation workflow coverage: COMPLETE ✅** — PR #565; Validation #571 SUCCESS; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.
- **G0R-07 — Matchmaking room lifetime: COMPLETE IN SOURCE ✅** — PR #566; Validation #574 + Replay #799 + Smoke #825 SUCCESS; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`.
- **G0R-08 — Setup-legal deck validation: COMPLETE IN SOURCE ✅** — PR #567 head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; Validation #586 + Replay #800 + Smoke #826 SUCCESS; merge checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- **G0R-09 — Private-room Ready concurrency: COMPLETE IN SOURCE ✅**
  - defect fixed in the authoritative Ready RPC with a room-scoped transaction advisory lock around Ready mutation + aggregate count;
  - membership and deck-validation fences preserved;
  - exact two-members/two-ready `all_ready` rule preserved;
  - PR #568 reviewed head `cc46b1fda04361105bc390c9efeddc8c475c6571`;
  - TCG Validation #597 / `35235272269`, Migration Replay #801 / `35235272316`, Functional Smoke #827 / `35235272663` all SUCCESS;
  - zero review threads; exact two-file diff;
  - merged to source main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`;
  - Supabase/live not deployed by this source merge.
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡** — only Ally/Device may enter one-shot `play_tactic`; Relic/Realm remain dedicated-owner actions; runtime guard not yet accepted.

**Accepted G0R source repairs:** **4 / 11 ✅**.

### G0R execution classification after prototype-restoration decision

The historical private-alpha runtime is compatibility/test provenance, not the finished V2 product target. Remaining G0R items stay recorded and must not be forgotten, but they do **not** block beginning the V2 prototype-restoration implementation unless the V2 path reuses the affected runtime boundary or the defect would compromise deterministic tests, security, hidden information, economy integrity or a later live promotion.

G0R-10 remains explicitly queued. No existing accepted G0R repair is reverted.

## V2 prototype restoration — IN PROGRESS 🎴

### V2-UI-01 — Card-face Attack control: COMPLETE IN SOURCE ✅

- PR #569: `TCG V2: restore card-face attack control foundation`.
- exact reviewed head: `ba1f5ef61439d24a4e91ae96272a5d046ae9d80c`.
- merge/current implementation checkpoint: `e59ee73443ed085b04175a2339b2eac3f8f8d818`.
- TCG Card Pass 2 Validation #608 / run `35241870575`: SUCCESS.
- exact diff: 3 additive files / no deletions.
- review threads: 0; combined legacy statuses: 0.
- added `tcg-battle-v2.html` as the additive one-screen V2 battle surface.
- added `stream-bandit-tcg-v2-battle-controller.js` as presentation + player-intent controller only.
- added focused `card-pass-2-v2-battle-card-control-attack` contract coverage.
- selecting the active Vanguard card exposes its structured Attack slots on the card face.
- Attack submits existing generic `attack` with `attack_slot`, `match_id`, fresh `client_nonce`, and `expected_revision`.
- `tcg-match-actions` remains authoritative for legality, payment, target resolution, damage, effects, listeners, defeat scanning and aftermath.
- no card-name browser branches, gameplay `prompt()` / `confirm()` targeting, browser damage/payment engine or browser RNG was introduced.
- rejected actions refresh authoritative state and keep the server rejection reason visible.
- historical `t.html` remains untouched.
- Supabase, database, deployed Edge Functions, live and production were not changed.

## Exact next operation

1. refresh exact implementation `main` from `e59ee73443ed085b04175a2339b2eac3f8f8d818`;
2. extend the same card-as-control / server-authoritative contract to **active Ability** using the existing generic `use_ability` route with board position (`where`, `index`);
3. do not add card-name branches or a browser rules engine; server rejection remains the legality backstop;
4. after Ability, implement reusable hand-card physical controls in bounded slices: Creature placement → Evolution target highlight/drop → Essence attachment → Relic → Realm → Ally/Device Tactic;
5. keep drag/drop and tap/select accessibility paths equivalent; illegal or rejected intents return to authoritative board state with a visible reason;
6. require exact-head validation/review before each source merge and update plan/checklist/ledger/release index after every accepted slice;
7. keep Supabase/live deployment separate from source implementation until a real two-user V2 end-to-end fence is ready.

G0R-10 remains explicitly queued and cannot be silently skipped before any live/public promotion that uses `play_tactic`.
