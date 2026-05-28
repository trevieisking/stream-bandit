# CHECKPOINT — Current Routes Registry V7.12.122 pass

Status: PASS / USEFUL MACHINE KEPT

Passed page:
- all-pages-version-registry-v7-12-122-current-routes-test.html

Commit:
- 3088d33d121b71ee4e70ef6a76a030234594be31

User result:
- Page loaded and produced a useful current-route report.
- Copy Current Route Report worked.
- User confirmed the machine helps and tells what is needed.

Report summary from user:
- Shell/menu routes: 54
- Index routes: 6
- One-layer routes: 176
- Responding: 226/236

Important interpretation:
- This is a good report.
- All current shell/menu routes responded OK.
- All direct index.html routes responded OK.
- The 10 issue rows are in the one-layer scan and are mostly cleanup clues / text-extraction false positives, not proof that core navigation is broken.

Real useful findings:
1. The protected shell route object still points some entries to older route files.
   - Example: admin -> admin-centre-command-deck-v7-10-0-test.html.
   - Example: registry -> all-pages-version-registry-v7-1-4-full-test.html.
   - This is expected because the shell has not been edited in this Admin cleanup pass.

2. index.html is still V7.12.117 Web Builder / Settings Group Complete.
   - This is expected because Policy index promotion was blocked by safety layer and was not forced.
   - Policy overlay routes are promoted through bridges already.

3. Old Admin Centre V7.10.0 still contains old admin-shell route links.
   - This is expected because V7.12.121 Admin Centre was created as a new test page and not yet promoted into the old overlay/menu route.

4. One-layer scan exposes old text/example routes in helper/diagnostic pages.
   - These are useful warnings, but not all are real clickable broken links.

False-positive / harmless issue examples:
- `0; url=about-clean-machine-v7-12-46-test.html`
- `Example: watchlist-global-helpers-v7-3-5-test.html`
- `Replace index.html`
- `Restored by web-builder-pages-manager-v7-12-111-test.html`
- Long HTML/code snippets containing `.html` inside text/code blocks.

Reason for false positives:
- V7.12.122 intentionally scans page text for `.html` strings to catch hidden route references.
- This helps expose stale route text, but it can catch examples/code notes that are not real clickable links.

Recommended improvement, same machine only:
- Do not create another machine.
- Later, refine this same registry scanner to classify results as:
  - real href/src route
  - script route/string route
  - text/code/example route
  - malformed/extracted text
- This would reduce panic and make the report cleaner without expanding scope.

Rules kept:
- No protected shell edit.
- No Settings logic edit.
- No Supabase schema change.
- No index promotion.
- No whole GitHub repo crawl.
- No deep crawling.
- Scope remains: shell/menu + current index + one layer from those pages only.

Current conclusion:
- V7.12.122 Current Routes Registry is a keeper.
- It should be used as the current route truth scanner during the Admin group and later Google Drive update.
- It should not replace page-by-page testing; it helps identify route drift and stale route references.

Next Admin group action:
- Continue with Admin group page-by-page.
- Next logical page: Live Readiness or Version Registry route cleanup.
- Before promoting Admin Centre, update/bridge the old Admin Centre route so shell/menu/admin opens the passed V7.12.121 current command deck.
