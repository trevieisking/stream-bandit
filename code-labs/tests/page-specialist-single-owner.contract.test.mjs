/**
 * Red source-contract tests for Code Labs page and Specialist Tool ownership.
 *
 * These tests intentionally expose duplicate ownership that still exists in
 * the current source. They do not prove browser behaviour or authorise a
 * deployment.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (relative) => readFile(path.join(root, relative), 'utf8');

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), `${message} Missing: ${expected}`);
}

function assertExcludes(source, forbidden, message) {
  assert.ok(!source.includes(forbidden), `${message} Forbidden: ${forbidden}`);
}

test('sidebar: V282 is the sole visible route owner', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const v12 = await read('code-labs/assets/code-labs-v12-save.js');

  assertIncludes(loader, "data-cl-nav-owner','V282-first-paint", 'The canonical shell must mark its menu ownership.');
  assertExcludes(v12, 'simplifyMenu();', 'V12 must preserve packet/context features without redrawing the sidebar.');
});

test('route policy: one current route register matches the visible shell', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const register = await read('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md');

  for (const page of ['saved-files.html', 'cg-repair-lab.html', 'code-god.html']) {
    assertIncludes(loader, page, `The current visible route must include ${page}.`);
    assertIncludes(register, page, `The page-role register must document the current visible route entry ${page}.`);
  }
  assertIncludes(register, 'V282', 'The page-role register must name the current route owner.');
});

test('next-step guidance: support pages consume one shared Workflow Hub policy', async () => {
  const wizard = await read('code-labs/assets/code-labs-v18-fix-wizard.js');
  const hub = await read('code-labs/v20.html');

  assertIncludes(wizard, 'support_only', 'Fix Wizard must declare its bounded support role.');
  assertIncludes(wizard, 'CodeLabsWorkflowNextStepPolicy', 'Fix Wizard must consume the shared next-step policy.');
  assertIncludes(hub, 'CodeLabsWorkflowNextStepPolicy', 'Workflow Hub must expose the shared next-step policy.');
  assertExcludes(wizard, 'function nextStep(', 'Fix Wizard must not maintain an independent route engine.');
});

test('support pages: roles are explicit and cannot overwrite backend authority', async () => {
  const start = await read('code-labs/assets/code-labs-v19-start-guide.js');
  const handoff = await read('code-labs/assets/code-labs-v15-handoff.js');

  assertIncludes(start, 'draft_fields', 'Start Guide must declare draft-only field authority.');
  assertExcludes(start, 'localStorage.setItem(KEY', 'Start Guide must not write the authoritative compatibility state directly.');
  assertIncludes(handoff, 'read_only_context', 'AI Handoff must declare read-only context mode.');
  assertExcludes(handoff, 'localStorage.setItem(', 'AI Handoff must remain read-only.');
});

test('Buddy Bridge: every page family has an explicit bounded mode', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const bridge = await read('code-labs/assets/code-labs-buddy-page-bridge-v139.js');

  assertIncludes(loader, 'BUDDY_BRIDGE_MODES', 'The shared loader must declare Buddy Bridge modes by page.');
  for (const marker of ['draft_fields', 'read_only_context', 'assisted_page_fields', 'protected_action_only']) {
    assertIncludes(loader, marker, `The bridge mode register must include ${marker}.`);
  }
  assertExcludes(bridge, 'fetch(', 'The browser bridge must not perform authoritative network mutation.');
  assertExcludes(bridge, '.from(', 'The browser bridge must not call Supabase directly.');
});

test('Checklist Builder: checks are derived from the exact repair and evidence contract', async () => {
  const checklist = await read('code-labs/assets/code-labs-checklist-builder.js');

  for (const marker of [
    'operation_id',
    'expected_state_version',
    'source_hash',
    'candidate_hash',
    'evidence_source',
    'not_run',
    'affected_helpers',
    'preserved_capabilities',
  ]) {
    assertIncludes(checklist, marker, `Dynamic checklist context must include ${marker}.`);
  }
  assertIncludes(checklist, 'user_checks', 'The user must be able to add repair-specific checks.');
  assertExcludes(checklist, 'A checklist cannot mark itself PASS', 'Runtime output must not self-authorise promotion.');
});

test('Specialist Tools: working support and proof capabilities remain discoverable', async () => {
  const register = await read('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md');
  const help = await read('code-labs/help.html');

  for (const capability of [
    'Start Guide',
    'Fix Wizard',
    'AI Handoff',
    'Checklist Builder',
    'Context Packet',
    'Read-Only Proof',
    'Buddy Tools',
  ]) {
    assertIncludes(`${register}\n${help}`, capability, `${capability} must remain discoverable.`);
  }
  assertIncludes(register, 'static retirement notice', 'Owner Read Proof must remain a static retirement notice only.');
});

test('evidence boundary: source ownership tests do not claim runtime success', () => {
  const evidence = {
    source_contract: true,
    browser_regression: false,
    duplicate_panel_smoke: false,
    backend_authority_smoke: false,
    deployment_authorised: false,
  };

  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.browser_regression, false);
  assert.equal(evidence.duplicate_panel_smoke, false);
  assert.equal(evidence.backend_authority_smoke, false);
  assert.equal(evidence.deployment_authorised, false);
});
