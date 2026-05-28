# CHECKPOINT — Web Builder Pages Manager V7.12.110 functional pass

Status: FUNCTIONAL PASS

Passed file:
- web-builder-pages-manager-v7-12-110-test.html

Passed notes from Trevor:
- Page opens.
- Existing pages load.
- Test/draft page can be selected.
- Hide / soft delete works.
- Page becomes hidden.
- Hidden / soft deleted filter shows hidden page.
- Restore hidden works.
- Page returns to draft and show-in-menu.
- Save still works.
- Builder / Preview / Form / Inbox still open in the same app window.

Follow-up note:
- Trevor confirmed this is a functional pass, but real delete should remove the page/card/block and its test links, not only hide it.
- Next target: V7.12.111 with safe real delete.

Safety state:
- No protected shell edit.
- No Settings edit.
- No index promotion.
- No Supabase schema change.
- V7.12.109 remains a clean rollback checkpoint.
- V7.12.110 remains the soft-delete functional checkpoint.

Next test file planned:
- web-builder-pages-manager-v7-12-111-test.html

Rule for V7.12.111:
- Permanent delete must be safer than normal clicks.
- It should only delete an already hidden page.
- It should require typed confirmation.
- It should delete only the selected sb_site_pages row.
