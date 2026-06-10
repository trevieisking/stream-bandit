# Web Builder Supabase Page Flow Checkpoint V7.12.264.1

Date: 2026-06-10

Status: PASS by user test.

## Confirmed flow

The working flow is:

1. Main app account system owns Auth/admin identity.
2. Web Builder Pages Manager creates a local page draft.
3. Local draft is saved to Supabase `sb_site_pages`.
4. Web Builder opens the saved slug.
5. Starter pack is selected/applied.
6. Page is published.
7. Preview opens with the saved slug.
8. Preview shows the exact starter pack chosen.

Tested example:

- Saved page slug: `new-page`
- Preview showed the exact selected starter pack.

## Ownership rule

Account/Auth is a main app system.

Web Builder should use the signed-in main app admin session. It should not create a separate account system.

## Supabase rule

`sb_site_pages` creation/update is for authenticated admin accounts.

Normal public/anon users must not create Web Builder site pages.

## Page state

Active test route:

- `web-builder-pages-manager-owned-v7-12-256-test.html`

Active checkpoint version:

- `V7.12.264.1 Web Builder-owned Pages Manager Slug Persistence Pass`

Known GitHub file SHA at checkpoint time:

- `f5dd61afa2ff634b27528a5931eccb1aaf36782c`

## Safety notes

No schema expansion was needed for this pass.

Do not build a separate Web Builder account system.

Do not loosen `sb_site_pages` to public writes.

Keep debug visible until the next connected page pass is proven.

## Next safe step

Next target should be the connected starter-pack/publish/preview chain, then form layout save/load.

Likely pages:

- `web-builder-preview-owned-v7-12-257-test.html`
- `web-builder-form-designer-owned-v7-12-258-test.html`
- `web-builder-form-inbox-owned-v7-12-258-test.html`

Do not promote to index/main app until the chain has been tested end-to-end again.
