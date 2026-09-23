/**
 * Scan Labs source-contract tests.
 * These tests protect the unnumbered, whole-repository, read-only boundary.
 * They do not prove live browser behaviour or authorise promotion.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (relative) => readFile(path.join(root, relative), 'utf8');

function includes(source, value, label) {
  assert.ok(source.includes(value), `${label} Missing: ${value}`);
}
function excludes(source, value, label) {
  assert.ok(!source.includes(value), `${label} Forbidden: ${value}`);
}

test('Scan Labs is a Code Labs-styled unnumbered specialist tool', async () => {
  const page = await read('code-labs/scan-labs.html');
  includes(page, '<title>Code Labs - Scan Labs</title>', 'Title');
  includes(page, 'assets/code-labs-icon.svg', 'Code Labs icon');
  includes(page, 'assets/code-labs.css?v=scan-labs-v1', 'Code Labs stylesheet');
  includes(page, 'data-cl-page-kind="support"', 'Support role');
  includes(page, 'Read-only specialist tool', 'Read-only label');
  includes(page, 'chatgpt-buddy-tools.html', 'Return destination');
  excludes(page, 'step:', 'Numbered workflow ownership');
  excludes(page, 'window.location.assign', 'Automatic workflow navigation');
});

test('Scan Labs scans the whole eligible repository at one exact commit', async () => {
  const page = await read('code-labs/scan-labs.html');
  includes(page, "const VERSION='Scan Labs V1 whole-repository reconnaissance'", 'Version');
  includes(page, "'?recursive=1'", 'Recursive repository tree');
  includes(page, 'resolved_commit_sha:resolved.commitSha', 'Exact commit output');
  includes(page, 'resolved_tree_sha:resolved.treeSha', 'Exact tree output');
  includes(page, 'whole_repository_scope:true', 'Whole repository scope');
  includes(page, 'Repository scan is incomplete:', 'Fail-closed fetch handling');
  includes(page, 'No readiness result was produced.', 'No partial readiness');
  excludes(page, "path.startsWith('code-labs/')&&", 'Code-Labs-only source filter');
});

test('Scan Labs keeps protected content and writes outside its authority', async () => {
  const page = await read('code-labs/scan-labs.html');
  includes(page, 'PROTECTED_PATH', 'Protected path exclusion');
  includes(page, 'protected_file_contents_read:false', 'Protected content flag');
  includes(page, '[redacted-credential-shaped-value]', 'Credential redaction');
  includes(page, 'github_write:false', 'GitHub write safety flag');
  includes(page, 'database_write:false', 'Database write safety flag');
  includes(page, 'workflow_state_write:false', 'Workflow state safety flag');
  includes(page, 'local_storage_write:false', 'Local storage safety flag');
  excludes(page, 'localStorage.setItem(', 'Local storage mutation');
  excludes(page, 'localStorage.removeItem(', 'Local storage deletion');
  excludes(page, '.insert(', 'Supabase insert execution');
  excludes(page, '.update(', 'Supabase update execution');
  excludes(page, '.delete(', 'Supabase delete execution');
  excludes(page, '.upsert(', 'Supabase upsert execution');
  excludes(page, "method:'POST'", 'Hard-coded POST execution');
  excludes(page, "method:'PUT'", 'Hard-coded PUT execution');
  excludes(page, "method:'PATCH'", 'Hard-coded PATCH execution');
  excludes(page, "method:'DELETE'", 'Hard-coded DELETE execution');
});

test('Buddy Tools exposes Scan Labs without changing canonical workflow navigation', async () => {
  const buddy = await read('code-labs/chatgpt-buddy-tools.html');
  includes(buddy, 'data-cl-buddy-tools="v246"', 'Buddy Tools version');
  assert.ok((buddy.match(/href="scan-labs\.html"/g) || []).length >= 2, 'Scan Labs must be prominent and listed.');
  includes(buddy, 'never advances, blocks or owns the numbered workflow', 'Workflow boundary wording');
  includes(buddy, 'assets/cl-nav.js?v=cl-v287-visible-step-route-union-registry', 'Canonical navigation remains owner');
  excludes(buddy, "id:'scan-labs'", 'No private route registry');
  excludes(buddy, 'var ROUTES=', 'No duplicate canonical routes');
});

test('Master Checklist consumes only the bounded read-only evidence projection and preserves manual fallback', async () => {
  const checklist = await read('code-labs/assets/code-labs-checklist-builder.js');
  includes(checklist, "var VERSION='V2.1-master-checklist-projection-consumer'", 'Checklist projection consumer version');
  includes(checklist, "var PROJECTION_VERSION='V1-master-checklist-evidence-projection'", 'Projection schema version');
  includes(checklist, "projection.authority==='read-only-evidence-projection'", 'Read-only authority gate');
  includes(checklist, 'projection.writer_authority===false', 'Writer authority denial');
  includes(checklist, 'projection.promotion_authority===false', 'Promotion authority denial');
  includes(checklist, 'Array.isArray(projection.exact_checklist.items)', 'Exact checklist shape gate');
  includes(checklist, "var PROJECTION_EVENT='code-labs-master-checklist-projection'", 'Projection event');
  includes(checklist, "var PROJECTION_REQUEST_EVENT='code-labs-master-checklist-projection-request'", 'One-shot projection request event');
  includes(checklist, 'hydrateProjection:hydrateProjection', 'Bounded hydration API');
  includes(checklist, "q('#clLoadExactChecklist').onclick=loadCanonical", 'Manual JSON fallback remains');
  includes(checklist, 'installProjectionListener();', 'Event consumer installation');
  includes(checklist, 'requestProjection();', 'One bounded projection request');
  const hydrate = checklist.match(/function hydrateProjection\(value\)\{([\s\S]*?)\n\}/);
  assert.ok(hydrate, 'Hydration function must remain inspectable.');
  excludes(hydrate[1], 'save();', 'Projection hydration must not persist browser state automatically');
  excludes(hydrate[1], '.checked=', 'Projection hydration must not auto-approve manual checkboxes');
  for (const forbidden of ['fetch(', '.from(', 'functions.invoke(', 'CodeLabsBackendWriteQueue', 'github.writer_prepare', 'setInterval(', 'MutationObserver']) {
    excludes(checklist, forbidden, 'Checklist browser authority boundary');
  }
});
