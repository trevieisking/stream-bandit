# Stream Bandit Source Note — Footer Policy Previews + Legacy Slots V7.11.9

Date: 2026-05-21

## Context

After Policy Agreements Centre V7.11.6 and Control Tower Policy Routes V7.11.8 passed, Trevor confirmed the next planning rule:

- Some Legacy / Reference page slots can be reused tomorrow for future platform modules.
- Policy and Terms should be linked from the global footer.
- Footer links should take normal users to clean preview/read-only pages showing the written policy/terms text.
- Editable policy documents are for Trevor/solicitor review, not the normal footer destination.

## Ownership rule

Policy Agreements Centre owns:

- policy document wording
- terms / end user agreement wording
- privacy wording
- cookie wording
- cookie banner wording
- cancellation/account request wording
- children/family watch wording
- creator/content rules
- accessibility statement wording

Global Footer owns:

- simple footer links only
- route placement of Terms / Privacy / Cookies / Accessibility / Cancellation / Family Watch links

Global Footer must not:

- duplicate policy wording
- rewrite policy wording
- become a second policy editor
- own cookie-banner wording

Web Builder Theme Studio owns:

- global display/theme

Platform Control Tower owns:

- diagnostics/readiness/route scanning only
- checking that policy preview pages and editable policy documents exist

## Required future footer behaviour

Global footer should eventually show simple text links such as:

- Terms
- Privacy
- Cookies
- Accessibility
- Cancellation
- Family Watch

When clicked, they should open clean user-facing preview pages.

Example future preview pages:

- `policy-preview-terms-v7-11-9-test.html`
- `policy-preview-privacy-v7-11-9-test.html`
- `policy-preview-cookies-v7-11-9-test.html`
- `policy-preview-accessibility-v7-11-9-test.html`
- `policy-preview-cancellation-v7-11-9-test.html`
- `policy-preview-family-watch-v7-11-9-test.html`

These preview pages should read/display the same text source as the editable documents where practical.

## Editable vs preview rule

Editable document pages:

- for Trevor/admin/solicitor review
- editable white document area
- copy / print controls
- not ideal as public footer destination

Preview document pages:

- for users/public site footer
- read-only
- clean policy layout
- no editing controls
- can link back to Policy Centre only if appropriate

## Legacy / Reference slots for future modules

Some Legacy / Reference menu slots can be reused later to build future modules from the Future Business / Platform Upgrades plan.

Candidate future modules:

- Domain / Hosting Setup
- Business Builder
- Messaging / Inbox
- Contacts / CRM
- Bookings
- Payments / Memberships
- Business Dashboard
- Website Builder Templates

Do not erase useful old routes blindly. Reuse only after checking whether the legacy page is still needed as a reference/fallback.

## Tomorrow likely order

1. Decide which Legacy / Reference slots are safe to reuse.
2. Build read-only public policy preview pages for Terms and Privacy first.
3. Add footer-link plan to Final Shell Navigation.
4. Update Control Tower route scan to include policy preview pages.
5. Later, add the actual global footer links into the global shell.

## Safety

No live/index promotion.
No legal finalisation.
No billing changes.
No account cancellation automation.
No duplicate policy ownership.
