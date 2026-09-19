# Stream Bandit TCG — Master Plan Checklist V2.4.3

**Canonical plan:** `tcg-master-plan-progress-v2.4.3.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.3.md`  
**Inherits:** `tcg-master-plan-checklist-v2.4.2.md` in full  
**Exact source base:** `main` @ `bf3579b7f2021df8b53c441ca32f25ec6484286b`  
**Release state:** 🔒 HOLD public/live/production.

## A. Outside-match shell implementation

- [x] **NAV-IMPL-01** One shared TCG outside-match shell implements the accepted Stream Bandit rail pattern.
- [x] **NAV-IMPL-02** Every primary destination has a real standalone route; unsupported behavior is explicitly gated rather than linked to fake state.
- [x] **NAV-IMPL-03** Current route is visibly active using `aria-current="page"`; the rail is keyboard-link based and touch-scrollable.
- [ ] **NAV-IMPL-04** Browser-level signed-out/direct-route/access-denied proof still required before release acceptance.
- [x] **NAV-IMPL-05** No Shop route added.
- [x] **NAV-IMPL-06** `tcg-battle-v2.html` does not load the outside-match page shell.

## B. Standalone Account route foundation

- [x] Overview, Profile, Security, Privacy, Notifications, Preferences, Leave TCG and Delete Account each have a standalone route.
- [x] Security identifies existing auth as owner while change-password/session writes stay gated in this slice.
- [x] Privacy/Notifications/Preferences writes remain gated until their scoped owners are proven.
- [x] Leave TCG and Delete Account destructive controls are disabled.
- [ ] Existing Profile/Auth/deletion owners still need deliberate UI wiring and browser/RLS tests before their actions can be marked implemented.

## C. Players/Friends route foundation

- [x] Players is the one discovery route and Public TCG Player Profile is separate.
- [x] Friends, Requests and Blocked each have a standalone route.
- [x] Find Players resolves to `tcg-players.html`; no second search route exists.
- [x] Social/write controls are disabled while scoped owners are missing.
- [ ] **DIRECTORY-IMPL-01** Server-authoritative TCG Directory owner remains open.
- [ ] **SOCIAL-IMPL-01** TCG-scoped friendship owner remains open.
- [ ] **SOCIAL-IMPL-02** TCG-scoped block owner remains open.

## D. Regression evidence

- [x] Static regression covers primary route inventory, standalone files, shell/auth/header/footer reuse, unsafe-write gating, single-directory routing and battle isolation.
- [ ] Exact-head GitHub Actions result must be green before source acceptance.

## E. Inherited gates

All V2.4.2 backend/security gates and V2.4.1 renderer/tabletop/two-user/release gates remain open where not already accepted. No checkbox here implies public/live readiness.

**Decision:** source candidate pending exact-head CI; public/live/production HOLD 🔒.
