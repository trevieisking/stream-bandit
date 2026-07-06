# Code Labs Page Role Register V147/V148

This register is the no-drop list for Code Labs pages. A page can be removed from the visible main route only when it is clearly documented as support, proof, receipt, test, or legacy/watch. A working page must not disappear just because it is not part of the main repair workflow.

## Route protection rule

- Prep route: Home -> Setup -> File Lab.
- Setup is required because it stores project, site, and repo details before File Lab.
- Project Picker still exists, but it is not currently a required step between Setup and File Lab.
- Main workflow starts at File Lab.
- Support, proof, receipt, scanner, and test pages may be outside the main workflow, but they must stay discoverable from Help, Tools, About, Connection Guide, scanner output, or documentation.

## Scanner coverage note

The live scanner remains `code-labs/helper-route-map.html`. Do not build another scanner.

V148 adds `code-labs/CODE_LABS_SCANNER_MANIFEST_ADDENDUM_V148.md` so the scanner manifest can be refreshed deliberately to include:

- `code-labs/assets/code-labs-setup-route-v145.js`
- `code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md`

## Prep pages

| Page | Path | Role | Keep rule |
| --- | --- | --- | --- |
| Home | `code-labs/index.html` | Public landing and first route page | Must point users to Setup first. |
| Setup | `code-labs/setup.html` | Project, site, repo, mode, and notes setup | Must stay after Home and before File Lab. Not a locked repair step. |
| Project Picker | `code-labs/project-picker.html` | Older/support prep selector | Keep as support/legacy prep unless explicitly re-promoted. Do not force it between Setup and File Lab. |

## Main repair workflow pages

| Step | Page | Path | Role | Keep rule |
| --- | --- | --- | --- | --- |
| 1 | File Lab | `code-labs/file-lab.html` | Load or read the full current file | Main workflow start. |
| 2 | Rescue Room | `code-labs/rescue-room.html` | Describe the problem and preserve rules | Main workflow. |
| 3 | Packet Builder | `code-labs/packet-builder.html` | Build the assistant repair packet | Main workflow, not support-only. |
| 4 | Buddy Canvas | `code-labs/buddy-canvas.html` | Assistant/source-proof and fixed-code lane | Main workflow, not support-only. |
| 5 | Workflow Hub | `code-labs/v20.html` | Choose next safe route | Main workflow. |
| 6 | Patch Desk | `code-labs/patch-desk.html` | Full fixed file review/writer lane | Main workflow. |
| 7 | Patch Lab | `code-labs/patch-lab.html` | Exact patch fallback | Main workflow. |
| 8 | Preview + Test | `code-labs/preview-test.html` | Preview and pass/fail test notes | Main workflow. |
| 9 | Checkpoints | `code-labs/checkpoints.html` | Rollback proof | Main workflow. |
| 10 | Repo Desk | `code-labs/repo-desk.html` | Choose repo handoff/action | Main workflow. |
| 11 | GitHub Writer | `code-labs/publish-prep.html` | Build reviewed GitHub handoff | Main workflow. |
| 12 | GitHub Tracker | `code-labs/github-tracker.html` | Track PR, preview, checks, and result | Main workflow. |

## Support and user guidance pages

| Page | Path | Role | Keep rule |
| --- | --- | --- | --- |
| About | `code-labs/about.html` | Explains what Code Labs does | Keep discoverable from Tools/About. |
| FAQ | `code-labs/faq.html` | Answers workflow and save questions | Keep discoverable from Help/FAQ. |
| Help + Tools | `code-labs/help.html` | Utility/help page | Keep as tool index. |
| Start Guide | `code-labs/start-guide.html` | Beginner guide | Keep as support page. |
| Fix Wizard | `code-labs/fix-wizard.html` | Guided repair support page | Keep as support page; do not force into main route. |
| AI Handoff | `code-labs/ai-handoff.html` | Assistant handoff package support | Keep as support page. |
| Checklist Builder | `code-labs/checklist-builder.html` | Build review/pass checklists | Keep as support/tool page. |
| Connection Guide | `code-labs/connection-guide.html` | Safe connection walkthrough | Keep discoverable from Tools. |
| Connector Status | `code-labs/connector-status.html` | Connection/helper status page | Keep as support/status page. |
| Context Packet | `code-labs/context-packet.html` | Assistant context packet support | Keep as support/proof page. |

## Proof, scanner, receipt, and test pages

| Page | Path | Role | Keep rule |
| --- | --- | --- | --- |
| Helper Route Map Scanner | `code-labs/helper-route-map.html` | Source-read scanner for pages/helpers/assets | Keep. Use before editing Code Labs. |
| Read-Only Proof | `code-labs/read-only-proof.html` | Backend read-only proof | Keep as proof page. |
| Owner Read Proof | `code-labs/owner-read-proof.html` | Owner proof/read test | Keep as proof page. |
| Repair Bridge Status | `code-labs/repair-bridge-status.html` | Repair bridge status | Keep as status/proof page. |
| ChatGPT Connection | `code-labs/chatgpt-connection.html` | Connection stub/test | Keep as test/support page. |
| OAuth Discovery | `code-labs/oauth-discovery.html` | OAuth discovery test | Keep as test page. |
| OAuth Flow Test | `code-labs/oauth-flow-test.html` | OAuth flow test | Keep as test page. |
| App Reader Test | `code-labs/app-reader-test.html` | App read tool test | Keep as test page. |
| URL Reader Test | `code-labs/url-reader-test.html` | URL reader proof/test | Keep as test page. |
| Buddy Canvas Receipt | `code-labs/buddy-canvas-receipt-v115.html` | Local receipt and handoff proof | Keep as receipt/proof page. |

## Asset/helper protection summary

These helpers are especially important and must not be removed casually:

- `code-labs/assets/code-labs.js` — base app/state/page renderer.
- `code-labs/assets/cl-nav.js` — shared navigation loader and helper loader.
- `code-labs/assets/code-labs-v1-1-safety.js` — safety/backup panel and promoted helper loader.
- `code-labs/assets/code-labs-v12-save.js` — rebuilt sidebar, workflow panel, and safe write packet source owner.
- `code-labs/assets/code-labs-setup-route-v145.js` — keeps Setup visible after Home while protected V12 still omits Setup.
- `code-labs/assets/code-labs-workflow-clarity-v130.js` — numbering, purpose, soft guidance.
- `code-labs/assets/code-labs-save-language-v132.js` — clearer save/checkpoint labels.
- `code-labs/assets/code-labs-buddy-canvas-menu-v134.js` — Buddy Canvas menu alignment.
- `code-labs/assets/code-labs-workflow-guard-v138.js` — soft workflow locks.
- `code-labs/assets/code-labs-page-completion-v139.js` — page completion checklist.
- `code-labs/assets/code-labs-v33-workflow-current-file-bridge.js` — current file bridge for workflow pages.
- `code-labs/assets/buddy-canvas-source-proof-v111.js` and related Buddy Canvas helpers — source proof, source control, proof tools, handoff desk, assistant sync, and autosave lanes.

## No-drop checklist before future route/menu work

Before changing menu, route, helper loading, or page labels:

1. Run or read the Helper Route Map Scanner.
2. Compare the page against this register.
3. Decide whether the page is Prep, Main Workflow, Support, Proof/Test, Receipt, or Legacy/Watch.
4. Never remove a working page from docs or access paths without explicitly recording why.
5. If a page is hidden from the main menu, make sure it is still discoverable from Tools, Help, About, Connection Guide, scanner output, or a route document.
6. If two helpers fight, fix the source route owner when possible. If a protected helper cannot be safely rewritten, keep the stabilizer small and document it here.
7. Before editing the scanner manifest, read `code-labs/CODE_LABS_SCANNER_MANIFEST_ADDENDUM_V148.md`.
