# Stream Bandit Today Plan — Legacy Slots + Footer Policy Previews V7.12.2

Date: 2026-05-22

## Correction / priority

Pricing Matrix annual deals are remembered as a later pricing upgrade.

Today’s next real work is the plan locked in after Policy Agreements Centre and Control Tower Route Targets passed:

- reuse some Legacy / Reference slots for future modules
- create public read-only policy preview pages
- prepare global footer policy links
- update Control Tower to scan the preview pages too

## Current stable checkpoint before this work

Control Tower Strict Route Targets passed:

- `platform-control-tower-strict-targets-v7-12-1-test.html`
- Found: `94/94`
- Needs review: `0`

This is the scanner to trust before starting the next work.

## Locked plan for today

1. Decide which Legacy / Reference slots are safe to reuse.
2. Build clean read-only preview pages for Terms and Privacy first.
3. Add footer-link plan to Final Shell Navigation.
4. Update Control Tower scan to include policy preview pages.
5. Later wire the actual global footer links into the shared shell.

## Important policy/footer rule

Policy Agreements Centre owns:

- policy wording
- terms / end user agreement wording
- privacy wording
- cookie wording
- cookie banner wording
- cancellation/account request wording
- children/family watch wording
- creator/content rules
- accessibility statement wording

Global Footer owns:

- footer link placement only
- public user-facing links to read-only preview pages

Global Footer must not:

- duplicate policy text
- rewrite policy text
- become a second policy editor
- own cookie banner wording

Editable policy pages are for:

- Trevor/admin
- solicitor review
- drafts and edits

Public preview pages are for:

- normal footer visitors
- read-only policy viewing
- clean user-facing layout

## First preview pages to build

Build these first:

- `policy-preview-terms-v7-12-2-test.html`
- `policy-preview-privacy-v7-12-2-test.html`

Later add:

- `policy-preview-cookies-v7-12-2-test.html`
- `policy-preview-accessibility-v7-12-2-test.html`
- `policy-preview-cancellation-v7-12-2-test.html`
- `policy-preview-family-watch-v7-12-2-test.html`

## Legacy / Reference slots to review

Current Legacy / Reference group:

- Original Global Search
- Original Settings Studio
- Original Final Shell
- Original Live Readiness
- Old Final Shell Upgrade
- Reconciliation Batch 1
- Favourite Tools V5.24.1

Do not remove useful fallback/reference pages blindly.

Use Control Tower first to decide which ones can become future module slots.

Possible future modules for reused legacy slots:

- Domain / Hosting Setup
- Business Builder
- Messaging / Inbox
- Contacts / CRM
- Bookings
- Payments / Memberships
- Business Dashboard
- Website Templates

## Safety

No live/index promotion.
No destructive file removal.
No final legal wording claim.
No billing/checkout.
No account cancellation automation.
No policy ownership duplication.
