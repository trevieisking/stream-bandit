# Stream Bandit Checkpoint — Global Search passed + policy footer request

Date: 2026-05-26

## Global Search pass

Trevor tested `global-search-global-helpers-v7-4-9-test.html` after the V7.12.89 Global Search Live Polish update and confirmed it passed.

Confirmed pass items:

- Page opens with no refresh loop.
- Menu overlay opens.
- Account/header/search appears.
- Top search overlay shows quick movie results.
- Full search box filters movies.
- Genre chips work.
- Source filter works.
- Sort works.
- Details opens Clean Details.
- Play opens Player 1.
- Footer appears once at the bottom.
- No footer appears in the middle.

## Policy agreement request to note for later

Trevor requested that the About page and global footer should later link to the policy agreement documents. The owner/admin should be able to edit/publish the policy documents, but normal users should only be able to view the published versions.

This is not to be built during the current Browse group pass unless specifically picked up later.

## Policy document links Trevor wants supported

1. Terms / EULA: `https://chatterfriendsstreambandit.co.uk/sb-policy-terms-eula-v7-11-6-test.html`
2. Privacy Policy: `https://chatterfriendsstreambandit.co.uk/sb-policy-privacy-v7-11-6-test.html`
3. Cookie Policy: `https://chatterfriendsstreambandit.co.uk/sb-policy-cookies-v7-11-6-test.html`
4. Children / Family Watch: `https://chatterfriendsstreambandit.co.uk/sb-policy-family-watch-v7-11-6-test.html`
5. Cancellation / Refunds: `https://chatterfriendsstreambandit.co.uk/sb-policy-cancellation-refunds-v7-11-6-test.html`
6. Creator / Content Rules: `https://chatterfriendsstreambandit.co.uk/sb-policy-creator-content-v7-11-6-test.html`
7. Accessibility Statement: `https://chatterfriendsstreambandit.co.uk/sb-policy-accessibility-v7-11-6-test.html`

## Later build rule

When this work starts later:

- Public users: view published policy documents only.
- Owner/admin: edit and publish policy documents.
- Footer: include policy document links once the policy pages are verified.
- About page: include a clear Legal / Policies section linking to these pages.
- Do not connect payments until billing is designed.
- Do not expose admin editing controls to normal users.
