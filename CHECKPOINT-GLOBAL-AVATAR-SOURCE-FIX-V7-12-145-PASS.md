# CHECKPOINT - GLOBAL AVATAR SOURCE FIX V7.12.145 PASS

Date: 2026-05-29
Project: Stream Bandit
Area: Global helpers / source fix
Status: PASSED

## Summary

The repeated page-by-page avatar bug was traced back to the global avatar helper source rather than individual pages.

Source file fixed by user replacement:

`stream-bandit-auth-avatar-v7-0-2.js`

Final passed behaviour:

- One avatar/logo only: PASS
- No second tiny duplicate logo/avatar: PASS
- Avatar helper still wins globally: PASS
- No page-by-page avatar patch needed: PASS

## Pattern found

During the Admin/global pass, the same issue repeated across multiple pages:

- Helper status said Avatar loaded.
- Visible avatar/account area still failed.
- Page-level patches were needed repeatedly.

Affected/tested pattern examples:

- Tools page avatar failed until a visible-slot avatar fix was applied.
- Test Checklist showed the same behaviour after theme started passing.
- The root issue was not the page content; it was that the source avatar helper was too weak.

## Root cause

Original avatar source helper:

`stream-bandit-auth-avatar-v7-0-2.js`

was too limited because it only targeted the first visible logo-like element and did not keep winning after other helpers rebuilt or repainted the header/account area.

It also caused a second small avatar when a stronger account-chip fix was attempted.

## Final source fix rule

The avatar source helper should:

1. Use the existing visible logo/account slot.
2. Avoid creating a second tiny avatar inside the account chip.
3. Remove duplicate chip avatar elements if they exist from earlier experiments.
4. Reapply after auth, brand, helper and menu rebuild events.
5. Reapply on a timer and via mutation observer.
6. Expose state for debugging.

Final visible result should be:

- One avatar/logo only.
- No duplicate chip avatar.
- Global avatar appears without page-level patches.

## Important lesson

Script loaded status is not enough.

Real pass condition is visible state:

- avatar is actually visible
- theme actually matches
- account chip/header looks right
- helper status tells the truth

## Cleanup implication

Because the source helper is now fixed, many one-off page-level avatar experiment files should not remain as future bases.

They should be considered for cleanup after a cleanup manifest is made.

Do not delete old menu-recognised URLs blindly; preserve current routed files that the overlay depends on.

## Final status

Global avatar source behaviour is passed after V7.12.145 no-duplicate fix.
