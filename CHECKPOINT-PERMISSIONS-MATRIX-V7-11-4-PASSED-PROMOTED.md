# Stream Bandit Checkpoint — Permissions Matrix V7.11.4 Passed + Promoted

Date: 2026-05-21

Passed page:

- `permissions-matrix-user-management-v7-11-4-test.html`

Route promoted:

- `permissions-matrix-v6-70-test.html`

Now opens:

- `permissions-matrix-user-management-v7-11-4-test.html`

Promotion commit:

- `38787d71a6c62c948fc9cd31d6e1a2f51ecccd44`

## Result

The old Permissions Matrix draft has been rebuilt into the User Management permissions rulebook.

Trevor confirmed:

- Page loads: PASS
- Theme matches global theme: PASS
- Account/avatar appears correctly: PASS
- Helper status loads: PASS
- Tabs switch: PASS
- User Manager link opens the new User Management dashboard: PASS
- Pricing Shop link opens the new Pricing Feature Shop: PASS
- Feature Matrix makes sense: PASS
- Current Live Controls clearly says `can_submit` is the working control now: PASS
- No apply/change-role/set-plan/policy/billing/live controls exist: PASS

## Page role

Permissions Matrix is the rulebook between:

- Pricing Feature Shop — sells plans/add-ons
- User Management — applies current user controls
- Permissions Matrix — defines what roles/plans/features mean

## Current live permission control

Working now:

- `sb_profiles.can_submit`

User Management V7.11.2 can remove and restore this field.

## Future schema still needed

- plan key / subscription plan
- account status
- feature JSON / permissions JSON
- admin notes
- expanded RLS policies for safe owner/admin management

## Safety

This page is read-only:

- no permission writes
- no role changes
- no plan changes
- no policy edits
- no billing
- no live/index promotion
