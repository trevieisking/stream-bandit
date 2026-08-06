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
