# Stream Bandit backup checkpoint before cleanup

Date: 2026-05-25

Backup branch created before any further route cleanup or file deletion:

`backup-before-cleanup-v7-12-38`

Source commit:

`d8e7c6747a5e35dc17bed53eecf0a18fbbc7d591`

Reason:

Trevor correctly flagged that active pages are not only menu pages. Pages can be active through hidden links, admin tools, global helper scripts, settings pages, buttons, route tables, and support scripts.

Rules from this checkpoint:

- Do not delete more files until the global route graph is improved.
- Do not trust menu-only scans.
- Do not trust HTML-only scans for final cleanup.
- Global JavaScript/helper files must be scanned for route references.
- Archive/delete candidates are review candidates only.
- If anything breaks, restore from branch `backup-before-cleanup-v7-12-38`.

Status:

- No new deletion approved from this checkpoint.
- The previous deletion of 6 files must be treated as a warning sign.
- Next scanner should include global scripts and helper JS references before any cleanup.
