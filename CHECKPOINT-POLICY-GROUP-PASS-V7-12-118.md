# CHECKPOINT — Policy menu group pass V7.12.118

Status: FULL PASS + ROUTE PROMOTED

Passed pages:
- policy-documents-centre-v7-12-118-test.html
- policy-admin-documents-v7-12-118-test.html
- policy-reader-v7-12-118-test.html

Trevor test results:
- Open Policy Documents Centre: passed.
- All 7 policy cards show: passed.
- Open Admin Editor: passed.
- Admin check unlocks: passed.
- Create missing defaults: passed.
- Select one document: passed.
- Edit a small line: passed.
- Save as draft: passed.
- Publish selected policy: passed.
- Open Public Reader for that document: passed.
- Reader shows source: supabase-published: passed.
- Draft/unpublished docs show fallback safely: passed.

Documents included:
- Terms / EULA
- Privacy Policy
- Cookie Policy
- Children / Family Watch
- Cancellation / Refunds
- Creator / Content Rules
- Accessibility Statement

Storage:
- Uses existing Supabase table: sb_policy_documents.
- No schema change.

Route promotion:
- Old Policy & FAQ Centre route promoted via bridge:
  - policy-agreements-centre-v7-11-6-test.html -> policy-documents-centre-v7-12-118-test.html
  - Commit: 63dd5f57c92b24065590e5ae8de4b90e84aa16e2
- Old Published Policy Proof route promoted via bridge:
  - policy-reader-published-row-v7-12-27-test.html -> policy-reader-v7-12-118-test.html?policy=<same policy>
  - Commit: dd024038e8b308efc88752a7b3519c4370a74d82
- Old Policy Admin Editor route promoted via bridge:
  - policy-admin-save-editor-v7-12-25-test.html -> policy-admin-documents-v7-12-118-test.html?policy=<same policy>
  - Commit: 8c55ba1b8318376057f30bf8392b206a26ae8bb2

Rules kept:
- No protected shell edit.
- No Settings logic edit.
- No index promotion yet.
- No Supabase schema change.
- Public reader remains read-only.
- Admin editor remains protected by Supabase session/profile/admin role/RLS.

Next recommended action:
- Smoke test overlay Policy menu links.
- If they route correctly through the bridges, promote Policy group to index.html after backup note.
