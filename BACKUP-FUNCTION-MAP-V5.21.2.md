# Stream Bandit V5.21.2 Backup Function Mapping

## Purpose

This note maps the real Backup page route before any live Backup page tidy patch is attempted.

The focused Backup layout mock has passed as:

`backup-page-v5-21-1-test.html`

That mock is not live. It only proves the desired layout:

- Export Backup
- Restore Backup
- Safety Checklist

## Current stable checkpoint

Current stable checkpoint remains:

`Stream Bandit V5.20.2 - Full Tools Page plus Backup Notes Builder Live`

Current live Tools page:

`tools-v5-20-2.html`

## Real app routing map

The main app file is:

`assets/stream-bandit-app.js`

The app uses one internal page router. The Backup view is mapped as:

`backup: backupPage`

When the app renders the Backup view, it calls:

`bindBackup()`

This means the live Backup page is not a separate HTML page. It is created inside the main app and then wired by the Backup binding function.

## Important safety conclusion

Do not replace the live Backup page directly until the exact existing backup button IDs and handlers are preserved.

The tidy layout must reuse the existing Backup page behaviour rather than inventing new backup logic.

## V5.21.1 mock result

The focused mock passed with:

- Direct test page loaded
- Tabs worked
- Safety check passed
- Live app still reachable
- Tools V5.20.2 still reachable
- No live app actions used

## Next safe implementation route

Next patch should be a test-only app patch, not a direct rewrite of the core app.

Recommended next version:

`V5.21.3 - Backup Page Tidy Overlay Test`

Goal:

- Leave `assets/stream-bandit-app.js` unchanged if possible.
- Add a separate small JavaScript patch file.
- Load it after the existing app scripts.
- Only activate when the current app view is Backup.
- Detect the existing Backup page content.
- Reorganise the visible layout into Export, Restore and Safety sections.
- Do not change the underlying backup data format.
- Do not change login, settings, admin, movie manager, player, Mux, Tools or database behaviour.

## Protected areas

Leave these alone during the Backup tidy work:

- Settings active logic
- Admin active page logic
- Movie Manager behaviour
- Movie rows
- Player behaviour
- Mux assets
- Sound Booster
- Tools page live route
- Supabase database tables
- Supabase Storage policies

## Rollback rule

If the Backup tidy overlay causes any issue, remove only the new patch file or remove only its script tag from `index.html`.

The current stable app should remain recoverable because the core app file is left untouched.
