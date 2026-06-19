# Checkpoint: Theme Studio Route Cleanup Map V7.13.033

Status: scanned and mapped before any Theme Studio rewrite.

## Why this checkpoint exists

`web-builder-theme-studio-controls-v7-8-9-test.html` is not just a link doorway. It owns real global theme saving and reads Supabase public config through the shared shell.

Because of that, Theme Studio must not be blindly full-rewritten just to fix three links.

---

## Confirmed old links in Theme Studio

### Top rail old links

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
web-builder-pages-manager-v7-12-111-test.html
web-builder-shared-style-preview-v7-12-117-test.html?page=test-page
```

### Route Proof old links

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
web-builder-shared-style-preview-v7-12-117-test.html?page=test-page
```

---

## Correct current targets

```text
Old Web Builder live studio
-> web-builder-account-control-hub-v7-12-263-test.html

Old Pages Manager
-> web-builder-pages-manager-owned-v7-12-256-test.html

Old Shared Preview
-> web-builder-preview-owned-v7-12-257-test.html?page=test-page
```

---

## Exact safe replacements

Replace every exact occurrence of:

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
```

with:

```text
web-builder-account-control-hub-v7-12-263-test.html
```

Replace every exact occurrence of:

```text
web-builder-pages-manager-v7-12-111-test.html
```

with:

```text
web-builder-pages-manager-owned-v7-12-256-test.html
```

Replace every exact occurrence of:

```text
web-builder-shared-style-preview-v7-12-117-test.html?page=test-page
```

with:

```text
web-builder-preview-owned-v7-12-257-test.html?page=test-page
```

---

## Do not change

```text
Theme save logic
Supabase app settings table name
STYLE_KEY / GLOBAL_KEYS
Theme Projector loader
Header/Footer loader
Core Saves loader
Menu Count loader
Search Fallback loader
Settings Global loader
Brand Logo loader
LocalStorage theme keys
Save Global Theme button
Load Saved Theme button
Reset Bandit Default button
```

---

## Theme Studio real responsibilities found

Theme Studio writes/reads real app settings:

```text
sb_app_settings.settings.streamBanditTheme
web_builder_shared_style_v7_8_8
web_builder_style
builderStyle
```

It also writes local bridge keys for fast projection across shell pages.

---

## Safety state

```text
SQL added: no
RLS changed: no
Storage changed: no
Payment changed: no
Index/Home changed: no
Theme Studio file rewritten yet: no
```

---

## Next move

If the full Theme Studio file can be preserved safely through the tool, apply only the exact route replacements above and bump the visible/debug version.

If the tool blocks or the full file cannot be preserved, do not force it. Keep this checkpoint as the manual replacement map.
