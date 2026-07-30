/**
 * Source-contract tests for Code Labs page and Specialist Tool ownership.
 *
 * These tests enforce single-owner and bounded-authority rules in source.
 * They do not prove browser behaviour or authorise a deployment.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (relative) => readFile(path.join(root, relative), 'utf8');

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), `${message} Missing: ${expected}`);
}

function assertExcludes(source, forbidden, message) {
  assert.ok(!source.includes(forbidden), `${message} Forbidden: ${forbidden}`);
}

test('sidebar: V283 is the sole visible route owner', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const header = await read('code-labs/assets/code-labs-header-shell-v235.js');
  const v12 = await read('code-labs/assets/code-labs-v12-save.js');

  const canonicalOwners = [loader, header, v12].filter((source) =>
    source.includes("data-cl-route-registry-owner','cl-nav-v283") &&
    source.includes('window.CodeLabsWorkflowRegistry=registry')
  );

  assert.equal(canonicalOwners.length, 1, 'Exactly one inspected shell source must publish the canonical V283 route registry.');
  assertIncludes(loader, "var VERSION='V283-canonical-workflow-registry'", 'The canonical shell must identify the V283 registry contract.');
  assertIncludes(loader, "data-cl-nav-owner','cl-nav-v283", 'The canonical shell must mark its menu ownership.');
  assertIncludes(loader, 'var ROUTES=Object.freeze([', 'The canonical route collection must be immutable.');
  assertIncludes(header, 'owner.firstNav()', 'The compatibility header must delegate sidebar repair to the canonical owner.');
  assertExcludes(header, "n.innerHTML=''", 'The compatibility header must not redraw the canonical sidebar.');
  assertExcludes(header, 'n.appendChild(link(', 'The compatibility header must not maintain a second sidebar renderer.');
  assertExcludes(v12, 'simplifyMenu();', 'V12 must preserve packet/context features without redrawing the sidebar.');
});

test('Repo Desk handoff: one scoped helper owns every main-content route into CG Repair Lab', async () => {
  const guard = await read('code-labs/assets/code-labs-workflow-guard-v138.js');
  const gate = await read('code-labs/assets/code-labs-repo-desk-code-god-gate-v212.js');
  const repoDesk = await read('code-labs/repo-desk.html');

  assertIncludes(guard, "role:'advisory-only'", 'The general workflow guard must declare its display-only role.');
  assertExcludes(guard, 'routeRepoDesk', 'The general workflow guard must not compete for the Repo Desk handoff.');
  assertExcludes(guard, "setAttribute('href','cg-repair-lab.html')", 'The general workflow guard must not rewrite routes.');
  assertIncludes(gate, "owner: 'repo-desk-main-handoff'", 'The scoped gate must declare the sole handoff responsibility.');
  assertIncludes(gate, "href === 'publish-prep.html' || href === 'cg-repair-lab.html'", 'The scoped gate must cover legacy and already-correct CG links.');
  assertIncludes(gate, 'saveVisibleHandoff();', 'Every captured Repo Desk handoff must save visible fields before navigation.');
  assertIncludes(gate, "window.location.assign('cg-repair-lab.html')", 'The scoped gate must route to CG Repair Lab after saving.');
  assertIncludes(repoDesk, 'code-labs-repo-desk-code-god-gate-v212.js', 'Repo Desk must load the scoped handoff owner.');
});

test('Repo Desk handoff runtime: legacy and direct CG links both save once before navigation', async () => {
  const source = await read('code-labs/assets/code-labs-repo-desk-code-god-gate-v212.js');
  const clickListeners = [];
  const assigned = [];
  let saves = 0;

  function link(href, scope = 'main') {
    const attributes = new Map([['href', href]]);
    const item = {
      textContent: href === 'publish-prep.html' ? 'GitHub Writer' : 'Next: CG Repair Lab',
      getAttribute(name) {
        return attributes.get(name) || null;
      },
      setAttribute(name, value) {
        attributes.set(name, String(value));
      },
      closest(selector) {
        if (selector === '.sidebar') return scope === 'sidebar' ? {} : null;
        if (selector === '.main') return scope === 'main' ? main : null;
        if (selector.includes('.main a[')) return item;
        return null;
      },
    };
    return item;
  }

  const legacy = link('publish-prep.html');
  const direct = link('cg-repair-lab.html');
  const sidebar = link('publish-prep.html', 'sidebar');
  const links = [legacy, direct, sidebar];
  const main = {};
  const bodyAttributes = new Map([['data-page', 'repo-desk']]);
  const document = {
    readyState: 'complete',
    body: {
      getAttribute(name) {
        return bodyAttributes.get(name) || null;
      },
      setAttribute(name, value) {
        bodyAttributes.set(name, String(value));
      },
    },
    addEventListener(type, listener) {
      if (type === 'click') clickListeners.push(listener);
    },
    querySelector(selector) {
      if (selector === '#rdSave') return { click() { saves += 1; } };
      if (selector === '.main') return main;
      return null;
    },
    querySelectorAll() {
      return links;
    },
  };
  class MutationObserver {
    observe() {}
    disconnect() {}
  }
  const window = {
    location: { assign(href) { assigned.push(href); } },
    setTimeout() { return 1; },
  };

  runInNewContext(source, { document, window, MutationObserver });

  assert.equal(bodyAttributes.get('data-code-labs-repo-handoff-owner'), 'V219-single-owner');
  assert.equal(legacy.getAttribute('href'), 'cg-repair-lab.html');
  assert.equal(direct.getAttribute('href'), 'cg-repair-lab.html');
  assert.equal(sidebar.getAttribute('href'), 'publish-prep.html');
  assert.equal(clickListeners.length, 1);

  function click(target) {
    clickListeners[0]({
      target,
      preventDefault() {},
      stopPropagation() {},
    });
  }
  click(legacy);
  click(direct);
  click(sidebar);

  assert.equal(saves, 2);
  assert.deepEqual(assigned, ['cg-repair-lab.html', 'cg-repair-lab.html']);
});

test('route policy: one current route register matches the visible shell', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const register = await read('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md');

  for (const page of ['saved-files.html', 'cg-repair-lab.html', 'code-god.html']) {
    assertIncludes(loader, page, `The current visible route must include ${page}.`);
    assertIncludes(register, page, `The page-role register must document the current visible route entry ${page}.`);
  }
  assertIncludes(register, 'code-labs/assets/cl-nav.js', 'The page-role register must name the canonical shared-loader file.');
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

  assertIncludes(loader, 'window.CodeLabsWorkflowRegistry=registry', 'Buddy Bridge modes must be anchored to the canonical route registry.');
  assertIncludes(loader, 'buddyBridgeMode', 'Each canonical route must declare its bounded Buddy Bridge mode.');
  assertIncludes(loader, 'buddyBridgeModes:Object.freeze(ROUTES.reduce', 'The compatibility API must derive an immutable mode map from canonical routes.');
  for (const marker of ['draft_fields', 'read_only_context', 'assisted_page_fields', 'protected_action_only']) {
    assertIncludes(loader, marker, `The canonical route registry must include ${marker}.`);
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

test('System Contract Scanner: incomplete source fetches fail closed', async () => {
  const scanner = await read('code-labs/assets/code-labs-system-contract-scanner-app-v141.js');

  assertIncludes(scanner, 'if(failures.length)', 'The scanner must stop when any relevant source fetch fails.');
  assertIncludes(scanner, 'Repository scan is incomplete:', 'The failure must be reported as incomplete coverage.');
  assertIncludes(scanner, 'No readiness result was produced.', 'An incomplete scan must not emit a green readiness result.');
  assertExcludes(scanner, 'const files=fetched.filter(x=>x&&!x.error), failures=fetched.filter(x=>x?.error), fileMap=', 'Failed files must not be silently dropped before analysis.');
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
