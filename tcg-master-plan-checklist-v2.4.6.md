# Stream Bandit TCG — Master Plan Checklist V2.4.6

**Canonical plan:** `tcg-master-plan-progress-v2.4.6.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.6.md`  
**Inherits:** `tcg-master-plan-checklist-v2.4.5.md` in full  
**Accepted V2.4.5 source head:** PR #576 @ `b8479c2998e4ed66525dd6e9b17fc07bc49ab232`  
**Release state:** 🔒 HOLD `main` / public / full live release.

## A. Close V2.4.5 production gates

- [x] **DIRECTORY-SEC-CI-01** TCG Card Pass 2 Validation #635 succeeded at exact head `b8479c2998e4ed66525dd6e9b17fc07bc49ab232`.
- [x] **DIRECTORY-SEC-CI-02** Zero-to-current Migration Replay #805 succeeded at the same head.
- [x] **DIRECTORY-SEC-CI-03** Functional Smoke #831 succeeded at the same head.
- [x] **DIRECTORY-SEC-REVIEW-01** Material review threads were zero.
- [x] **DIRECTORY-DEPLOY-01** Immutable GitHub/Supabase evidence refreshed immediately before DDL.
- [x] **DIRECTORY-DEPLOY-02** Only reviewed `tcg_player_directory_v0_1` migration applied to production.
- [x] **DIRECTORY-DEPLOY-03** Migration history, RLS, policies, grants, functions and triggers verified post-deploy.
- [x] **DIRECTORY-DEPLOY-04** Public RPC/private privileged function execution shapes verified with read-only SQL probes.
- [x] **DIRECTORY-DEPLOY-05** Fresh security advisor added zero TCG Directory exposed-`SECURITY DEFINER` warnings.
- [x] **DIRECTORY-DEPLOY-06** Fresh performance advisor captured; only new TCG item is the newly-created opt-in index being unused before traffic.

## B. V2.4.6 Directory UI source

- [x] **DIRECTORY-UI-01** Add one reusable TCG Directory browser controller.
- [x] **DIRECTORY-UI-02** Wire Players search to `tcg_search_public_players` only.
- [x] **DIRECTORY-UI-03** Wire Public TCG Player Profile to `tcg_get_public_player` only.
- [x] **DIRECTORY-UI-04** Wire Account Privacy to the signed-in user's own `tcg_player_directory_preferences` row.
- [x] **DIRECTORY-UI-05** Preserve database-private default and shared-profile public-visibility server gate.
- [x] **DIRECTORY-UI-06** Do not browse source profile tables or the private projection from browser code.
- [x] **DIRECTORY-UI-07** Do not reuse `sb_user_friends` or `sb_user_blocks` as TCG social authority.
- [x] **DIRECTORY-UI-08** Keep Add Friend, Challenge/Invite and TCG-specific Block writes gated.
- [x] **DIRECTORY-UI-09** Add a Card Pass 2 regression contract for the UI ownership boundary.

## C. Exact-head acceptance gates for V2.4.6

- [ ] **DIRECTORY-UI-CI-01** TCG Card Pass 2 Validation succeeds at the final V2.4.6 head.
- [ ] **DIRECTORY-UI-CI-02** Zero-to-current Migration Replay succeeds at that exact head.
- [ ] **DIRECTORY-UI-CI-03** Functional Smoke succeeds at that exact head.
- [ ] **DIRECTORY-UI-REVIEW-01** Material review threads remain zero or all findings are resolved.
- [ ] **DIRECTORY-UI-DIFF-01** Final diff proves no gameplay engine, card registry, rules owner, Edge Function or new migration was changed by the V2.4.6 UI slice.

## D. Still gated / next authority

- [ ] TCG-scoped Friends authority.
- [ ] TCG-scoped Blocks authority.
- [ ] Challenge/Invite social owner and notifications.
- [ ] Full end-to-end gameplay route gate from sign-in through match result and return.
- [ ] Merge PR #576.
- [ ] `main` / GitHub Pages / public/full live TCG release.

**Current decision:** Directory backend is accepted live. V2.4.6 UI source is implemented on the existing draft PR branch and remains HOLD pending fresh exact-head validation.
