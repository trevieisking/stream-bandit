# Stream Bandit Future Pass Note — Share Preview SEO Images V7.13.122

Date: 2026-07-01

## Status

Future pass noted only. This is not part of the current Social Auth / Social Profile polish quest.

## User requirement

When a Stream Bandit page is shared externally, the preview must show the correct image and SEO copy for that specific page.

Rules:

- Normal Stream Bandit pages should use the Stream Bandit icon / brand share image and page-specific SEO title/description.
- Movie/detail/player shares should use that movie's cover/poster image only, with movie-specific title/description.
- Social/profile/group/news shares should use the correct public share target and must not expose private/friends-only/member-only/private-message content.
- This must become a separate site-wide Share Preview / SEO Images pass.

## Current likely owner

Start with the existing share owner helper:

- `stream-bandit-social-share-v7-13-001.js`

Reason:

- It is already the privacy-aware external sharing foundation for Social Profile, Friends, News Feed and Groups.
- It already blocks private/friends-only/group-members/private-message content from external share.
- It already builds share URL, title and text for Copy, Native Share, Facebook, WhatsApp, X, Reddit and Email.

## Important technical note

Browser share buttons and social-media preview cards are related, but not the same thing.

The current helper can control the shared URL/title/text used by user-clicked share actions.

External preview cards usually need page-level metadata such as Open Graph and Twitter card tags:

- `og:title`
- `og:description`
- `og:image`
- `og:url`
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

Static Stream Bandit pages can use static page metadata.

Movie-specific share previews may need a dedicated dynamic/static share route or pre-rendered share page because social crawlers may not run the browser JavaScript that loads Supabase movie covers.

## Proposed future pass order

1. Audit current share owner helper and every page that loads it.
2. Audit existing page `<head>` metadata for Open Graph/Twitter tags.
3. Add a generic Stream Bandit brand preview image for normal pages.
4. Add page-specific SEO title/description for main pages.
5. Design movie-specific share preview handling so movie pages use the movie cover/poster image.
6. Keep privacy blocks: no private, friends-only, member-only or private-message external previews.
7. Test with real share preview tools after each route group.

## Boundary

Do not mix this with the current auth-gate/social-polish route pass.

Do not change Supabase schema, RLS, storage policy, Mux, payment, or auth logic for this note.

Do not change movie/player behavior during the note-only checkpoint.

## Tomorrow starting point

When this pass begins, start with:

- `stream-bandit-social-share-v7-13-001.js`
- Social Profile / Friends / News Feed / Groups share cards
- Details/movie share preview ownership for cover/poster image behavior

Then decide whether the Passed Route Ledger should absorb this note after the current quest is finished.
