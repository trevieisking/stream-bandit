# Stream Bandit TCG — Master Plan Checklist V2.4.4

**Canonical plan:** `tcg-master-plan-progress-v2.4.4.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.4.md`  
**Inherits:** `tcg-master-plan-checklist-v2.4.3.md` in full  
**Source parent:** PR #576 @ `e622b9a61c8d1dbf2bea4ade9232c464556c92fe`  
**Release state:** 🔒 HOLD `main` / public / live / production.

## A. Directory production evidence

- [x] **DIRECTORY-EVIDENCE-01** `tcg_player_profiles` RLS is enabled and normal SELECT is own-row only.
- [x] **DIRECTORY-EVIDENCE-02** `sb_profiles` RLS is enabled and normal SELECT is own/admin only.
- [x] **DIRECTORY-EVIDENCE-03** shared `sb_profile_social_settings.profile_visibility` exists as a privacy ceiling.
- [x] **DIRECTORY-EVIDENCE-04** no existing TCG Directory relation/routine was found.
- [x] **DIRECTORY-EVIDENCE-05** no existing source-table RLS policy needs weakening.

## B. Directory source implementation

- [x] **DIRECTORY-SRC-01** Add one TCG-scoped directory-preference owner with `discoverable = false` by default.
- [x] **DIRECTORY-SRC-02** Keep preference reads/writes owner-only under RLS.
- [x] **DIRECTORY-SRC-03** Add one authenticated bounded player-search routine.
- [x] **DIRECTORY-SRC-04** Add one authenticated public-player-profile routine.
- [x] **DIRECTORY-SRC-05** Require TCG opt-in + active shared account + shared public visibility.
- [x] **DIRECTORY-SRC-06** Return only approved display identity and optional public arcade/progression fields.
- [x] **DIRECTORY-SRC-07** Revoke PUBLIC/anon access and grant the minimum authenticated table/routine privileges.
- [x] **DIRECTORY-SRC-08** Add a static regression contract under the existing Card Pass 2 test glob.

## C. Validation/deployment gates

- [ ] **DIRECTORY-CI-01** Exact-head TCG Card Pass 2 Validation succeeds with the Directory contract.
- [ ] **DIRECTORY-CI-02** Zero-to-current migration replay succeeds with the new migration.
- [ ] **DIRECTORY-DEPLOY-01** Production migration is explicitly promoted and applied after exact-source acceptance.
- [ ] **DIRECTORY-DEPLOY-02** Post-deploy schema/RLS/routine grants match reviewed source.
- [ ] **DIRECTORY-DEPLOY-03** Security/performance advisors reviewed after DDL application.
- [ ] **DIRECTORY-UI-01** Players search UI is wired only after the Directory owner is deployed.
- [ ] **DIRECTORY-UI-02** Public TCG Player Profile is wired only after the Directory owner is deployed.

## D. Still gated

- [ ] TCG-scoped Friends authority.
- [ ] TCG-scoped Blocks authority.
- [ ] Social write actions and notifications.
- [ ] All inherited V2.4.1 gameplay/visual/end-to-end release gates.

**Current decision:** source implementation may be validated on PR #576; Supabase production and public/live remain 🔒 HOLD.
