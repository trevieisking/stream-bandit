# Stream Bandit Checkpoints

## V7.12.104 Global Shell Protected Checkpoint

Status: PASSED and PROTECTED.

Rules:
- Do not edit `stream-bandit-shell-v6-24.js`.
- Do not patch the global header, global menu, or global search shell.
- Work must happen inside the target page only unless explicitly overridden.

Passed shell behaviour:
- Real account/profile overlay works.
- Full overlay menu works.
- Current / Here markers work.
- Search and owner icons sit correctly at the top-right.
- Search overlay returns movies and page/menu results.

## V7.12.105 Form Inbox + Private Messages Pass

Status: PASSED.

Passed flow:
- Account chip appears and opens.
- Submissions still load.
- Form reply sends into `sb_private_messages`.
- Sent / Outbox works.
- Refresh keeps sent messages visible.
- New private message sends.
- Spam works.
- Trash works.
- Restore works.
- Delete for me works as soft delete.
- Messages are on-site private messages only, not email.

Design rule:
- Tabs are for Inbox / Sent-Outbox / Spam / Trash.
- Buttons are for selected-message actions only.

## V7.12.106 Web Builder + Published Preview Group Pass

Status: PASSED as a heavy Settings/Web Builder group checkpoint.

Passed flow:
- Web Builder page opens with no blank screen.
- Account chip opens.
- Search overlay still shows movies.
- Menu opens.
- Starter Pack works.
- Block overlay editing works.
- Custom HTML / Code block can be added.
- Iframe/code can be pasted and saved.
- Draft Preview contains the iframe without breaking page width.
- Published Preview renders saved `sb_site_pages` rows.
- Fresh or updated slug saves and displays correctly.
- Form Inbox route works from the builder group.

Next Web Builder idea checkpoint:
- Add a Pages / Navigation manager like a real website builder.
- Manage page list, slugs, titles, home page, visibility, sort order, and menu label.
- Keep it page-only first. Do not edit the protected global shell.
