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

test('navigation bundle: V287 is the sole route and visible sidebar owner', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const header = await read('code-labs/assets/code-labs-header-shell-v235.js');
  const footer = await read('code-labs/assets/code-labs-footer-buddy-shell-v200.js');
  const manual = await read('code-labs/assets/code-labs.js');
  const home = await read('code-labs/index.html');
  const v12 = await read('code-labs/assets/code-labs-v12-save.js');
  const inspected = [loader, header, footer, manual, home, v12];
  assert.equal(inspected.filter((source) => source.includes('window.CodeLabsWorkflowRegistry=registry')).length, 1);
  assert.equal(inspected.filter((source) => source.includes('var ROUTES=Object.freeze([')).length, 1);
  assert.equal(inspected.filter((source) => source.includes('nav.innerHTML=')).length, 1);
  assertIncludes(loader, "var VERSION='V287-live-proof-route-union-registry'", 'V287 identity');
  assertIncludes(loader, "data-cl-nav-owner','cl-nav-v287", 'V287 nav owner');
  for (const marker of ["id:'index'",'step:1',"id:'setup'",'step:2',"id:'github-tracker'",'step:18',"id:'checklist-builder'",'step:19','chatgpt-buddy-tools.html']) assertIncludes(loader, marker, 'Canonical route marker');
  assertExcludes(loader, "file.html'", 'Template placeholder');
  assertExcludes(loader, "fixed-file.html'", 'Template placeholder');
  assertIncludes(header, 'window.CodeLabsWorkflowRegistry', 'Header registry consumer');
  assertExcludes(header, 'var ROUTES=', 'Header private routes');
  assertExcludes(header, 'nav.innerHTML=', 'Header nav redraw');
  assertIncludes(footer, 'window.CodeLabsWorkflowRegistry', 'Footer registry consumer');
  assertExcludes(footer, 'var ROUTES=', 'Footer private routes');
  assertExcludes(footer, 'nav.innerHTML=', 'Footer nav redraw');
  assertExcludes(v12, 'simplifyMenu();', 'V12 nav redraw');
});

test('Repo Desk handoff: one scoped helper owns every main-content route into CG Repair Lab', async () => {
  const guard = await read('code-labs/assets/code-labs-workflow-guard-v138.js');
  const gate = await read('code-labs/assets/code-labs-repo-desk-code-god-gate-v212.js');
  const repoDesk = await read('code-labs/repo-desk.html');
  assertIncludes(guard, "role:'advisory-only'", 'Guard role');
  assertExcludes(guard, 'routeRepoDesk', 'Duplicate handoff');
  assertExcludes(guard, "setAttribute('href','cg-repair-lab.html')", 'Route rewrite');
  assertIncludes(gate, "owner: 'repo-desk-main-handoff'", 'Handoff owner');
  assertIncludes(gate, "href === 'publish-prep.html' || href === 'cg-repair-lab.html'", 'Handoff coverage');
  assertIncludes(gate, 'saveVisibleHandoff();', 'Save before handoff');
  assertIncludes(gate, "window.location.assign('cg-repair-lab.html')", 'CG route');
  assertIncludes(repoDesk, 'code-labs-repo-desk-code-god-gate-v212.js', 'Gate loader');
});

test('Repo Desk handoff runtime: legacy and direct CG links both save once before navigation', async () => {
  const source = await read('code-labs/assets/code-labs-repo-desk-code-god-gate-v212.js');
  const clickListeners = [], assigned = [];
  let saves = 0;
  const main = {};
  function link(href, scope = 'main') {
    const attributes = new Map([['href', href]]);
    const item = { textContent: href === 'publish-prep.html' ? 'GitHub Writer' : 'Next: CG Repair Lab', getAttribute: (name) => attributes.get(name) || null, setAttribute: (name, value) => attributes.set(name, String(value)), closest(selector) { if (selector === '.sidebar') return scope === 'sidebar' ? {} : null; if (selector === '.main') return scope === 'main' ? main : null; if (selector.includes('.main a[')) return item; return null; } };
    return item;
  }
  const legacy = link('publish-prep.html'), direct = link('cg-repair-lab.html'), sidebar = link('publish-prep.html','sidebar');
  const links = [legacy,direct,sidebar], bodyAttributes = new Map([['data-page','repo-desk']]);
  const document = { readyState:'complete', body:{ getAttribute:(name)=>bodyAttributes.get(name)||null, setAttribute:(name,value)=>bodyAttributes.set(name,String(value)) }, addEventListener(type,listener){if(type==='click')clickListeners.push(listener);}, querySelector(selector){if(selector==='#rdSave')return{click(){saves+=1;}};if(selector==='.main')return main;return null;}, querySelectorAll(){return links;} };
  class MutationObserver { observe(){} disconnect(){} }
  const window = { location:{assign(href){assigned.push(href);}}, setTimeout(){return 1;} };
  runInNewContext(source,{document,window,MutationObserver});
  assert.equal(bodyAttributes.get('data-code-labs-repo-handoff-owner'),'V219-single-owner');
  assert.equal(legacy.getAttribute('href'),'cg-repair-lab.html');
  assert.equal(direct.getAttribute('href'),'cg-repair-lab.html');
  assert.equal(sidebar.getAttribute('href'),'publish-prep.html');
  assert.equal(clickListeners.length,1);
  const click=(target)=>clickListeners[0]({target,preventDefault(){},stopPropagation(){}});
  click(legacy);click(direct);click(sidebar);
  assert.equal(saves,2);
  assert.deepEqual(assigned,['cg-repair-lab.html','cg-repair-lab.html']);
});

test('route policy: one current route register matches the visible shell', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const register = await read('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md');
  for (const page of ['saved-files.html','cg-repair-lab.html','code-god.html']) { assertIncludes(loader,page,'Visible route'); assertIncludes(register,page,'Register route'); }
  assertIncludes(register,'code-labs/assets/cl-nav.js','Canonical owner path');
});

test('next-step guidance: support pages consume one shared Workflow Hub policy', async () => {
  const wizard = await read('code-labs/assets/code-labs-v18-fix-wizard.js');
  const hub = await read('code-labs/v20.html');
  assertIncludes(wizard,'support_only','Support role');
  assertIncludes(wizard,'CodeLabsWorkflowNextStepPolicy','Shared policy');
  assertIncludes(hub,'CodeLabsWorkflowNextStepPolicy','Hub policy');
  assertExcludes(wizard,'function nextStep(','Private route engine');
});

test('support pages: roles are explicit and cannot overwrite backend authority', async () => {
  const start = await read('code-labs/assets/code-labs-v19-start-guide.js');
  const handoff = await read('code-labs/assets/code-labs-v15-handoff.js');
  assertIncludes(start,'draft_fields','Start Guide role');
  assertExcludes(start,'localStorage.setItem(KEY','Authoritative state write');
  assertIncludes(handoff,'read_only_context','AI Handoff role');
  assertExcludes(handoff,'localStorage.setItem(','AI Handoff write');
});

test('Buddy Bridge: every page family has an explicit bounded mode', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const bridge = await read('code-labs/assets/code-labs-buddy-page-bridge-v139.js');
  for (const marker of ['window.CodeLabsWorkflowRegistry=registry','buddyBridgeMode','buddyBridgeModes:Object.freeze(ROUTES.reduce','draft_fields','read_only_context','assisted_page_fields','protected_action_only']) assertIncludes(loader,marker,'Bridge mode contract');
  assertExcludes(bridge,'fetch(','Network mutation');
  assertExcludes(bridge,'.from(','Supabase call');
});

test('Checklist Builder: checks are derived from the exact repair and evidence contract', async () => {
  const checklist = await read('code-labs/assets/code-labs-checklist-builder.js');
  for (const marker of ['operation_id','expected_state_version','source_hash','candidate_hash','evidence_source','not_run','affected_helpers','preserved_capabilities','user_checks']) assertIncludes(checklist,marker,'Checklist evidence marker');
  assertExcludes(checklist,'A checklist cannot mark itself PASS','Self-authorisation');
});

test('System Contract Scanner: incomplete source fetches fail closed', async () => {
  const scanner = await read('code-labs/assets/code-labs-system-contract-scanner-app-v141.js');
  for (const marker of ['if(failures.length)','Repository scan is incomplete:','No readiness result was produced.']) assertIncludes(scanner,marker,'Fail-closed scanner');
  assertExcludes(scanner,'const files=fetched.filter(x=>x&&!x.error), failures=fetched.filter(x=>x?.error), fileMap=','Dropped failures');
});

test('Specialist Tools: working support and proof capabilities remain discoverable', async () => {
  const register = await read('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md');
  const help = await read('code-labs/help.html');
  const loader = await read('code-labs/assets/cl-nav.js');
  const discoverability = `${register}\n${help}\n${loader}`;
  for (const capability of ['Start Guide','Fix Wizard','AI Handoff','Buddy Canvas Receipt','Context Packet','Read-Only Proof','Buddy Tools']) assertIncludes(discoverability,capability,'Discoverability');
  assertIncludes(register,'static retirement notice','Retirement notice');
});

test('manual renderer bundle: existing shells are adopted and navigation is never redrawn', async () => {
  const manual = await read('code-labs/assets/code-labs.js');
  assertIncludes(manual,"var app=$('.app');",'Existing app inspection');
  assertIncludes(manual,"if(app){shellMode='adopted';return app;}",'Existing shell adoption');
  assertIncludes(manual,"data-cl-neutral-specialist-shell','adopted-v204",'Adopted marker');
  assertIncludes(manual,"data-cl-neutral-specialist-shell','created-v204",'Created marker');
  assertExcludes(manual,'nav.innerHTML=','Navigation redraw');
  assertExcludes(manual,'document.body.innerHTML','Body replacement');
  assertExcludes(manual,"shell('')",'Unknown page blanking');
});

test('Home bundle: canonical menu mount is empty and Buddy Tools is prominent', async () => {
  const home = await read('code-labs/index.html');
  const navMatch = home.match(/<nav class="nav"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(navMatch);
  assert.equal((navMatch[1].match(/<a\b/g)||[]).length,0);
  assert.equal((home.match(/assets\/cl-nav\.js/g)||[]).length,1);
  assert.equal((home.match(/chatgpt-buddy-tools\.html/g)||[]).length,2);
  for (const marker of ['Buddy Tools · everyday tools','Home is visible step 1','Master Plan + Setup is step 2','final governed step 19']) assertIncludes(home,marker,'Home wording');
  for (const forbidden of ['setTimeout(','setInterval(','MutationObserver','localStorage','sessionStorage','fetch(']) assertExcludes(home,forbidden,'Home lightweight boundary');
});

test('route union: every verified canonical route target is represented by a repository page', async () => {
  const loader = await read('code-labs/assets/cl-nav.js');
  const routeFiles = [...loader.matchAll(/file:'([^']+\.html)'/g)].map((match)=>match[1]);
  const unique = [...new Set(routeFiles)];
  assert.equal(routeFiles.length,unique.length);
  assert.equal(unique.length,39);
  for (const relative of unique) await assert.doesNotReject(read(`code-labs/${relative}`));
});

test('shared guidance helpers: clarity and completion are passive V287 consumers', async () => {
  const clarity = await read('code-labs/assets/code-labs-workflow-clarity-v130.js');
  const completion = await read('code-labs/assets/code-labs-page-completion-v139.js');
  assertIncludes(clarity,'window.CodeLabsWorkflowRegistry','Clarity consumer');
  for (const forbidden of ['var FLOW=','var SUPPORT=','var ROUTE=','var BACK=','setTimeout(','MutationObserver','localStorage.']) assertExcludes(clarity,forbidden,'Clarity authority');
  assertIncludes(completion,'window.CodeLabsWorkflowRegistry','Completion consumer');
  assertIncludes(completion,'clPageCompletionV139','Completion panel');
  for (const forbidden of ['var PAGES=','setTimeout(','MutationObserver']) assertExcludes(completion,forbidden,'Completion authority');
});

test('Buddy Page Bridge V143: local page assistance fails closed on protected identity', async () => {
  const bridge = await read('code-labs/assets/code-labs-buddy-page-bridge-v139.js');
  assertIncludes(bridge,"var VERSION = 'V143';",'V143 identity');
  assertIncludes(bridge,'GENERATED_SURFACE_SELECTORS','Generated surface exclusion');
  for (const selector of ['[id^="clWorkflowClarity"]','[id^="clWorkflowBridge"]','[id^="clPageCompletion"]','[id^="clFooterBuddyShell"]','[id^="clHeaderShell"]','[data-cl-generated-helper-surface]','.nav','.sidebar']) assertIncludes(bridge,selector,'Excluded surface');
  for (const marker of ['function generatedSurface(element)','function isPageOwnedSurface(element)',"section_scope: 'page_owned_only'",'generated_helper_surfaces_excluded: true',"data-cl-generated-helper-surface', 'buddy-section-notes", "data-cl-generated-helper-surface', 'buddy-page-bridge",'writeFields: writeFields','writeSection: writeSection','undoLastWrite: undoLastWrite','processQueuedCommand: processQueuedCommand','Sensitive fields are redacted and blocked.','identity_defaults_applied: false']) assertIncludes(bridge,marker,'V143 compatibility marker');
  assertIncludes(bridge,'validBranch(requestBranch, false)','Non-main request branch gate');
  assertIncludes(bridge,'validAction(action)','Explicit action gate');
  assertIncludes(bridge,"packet.source_branch || 'missing'",'Missing source identity');
  assertIncludes(bridge,"packet.request_branch || 'missing'",'Missing request identity');
  assertIncludes(bridge,"packet.action || 'missing'",'Missing action identity');
  for (const forbidden of ["'read_context'","'code-labs-buddy-'",'setTimeout(createPanel,','var renderTimer = 0','fetch(','.from(']) assertExcludes(bridge,forbidden,'V143 forbidden fallback');
});

test('Buddy Canvas Receipt: local proof functions remain while its private sidebar is removed', async () => {
  const receipt = await read('code-labs/buddy-canvas-receipt-v115.html');
  const navMatch = receipt.match(/<nav class="nav"[^>]*>([\s\S]*?)<\/nav>/);
  assertIncludes(receipt,'data-page="buddy-canvas-receipt-v115"','Receipt identity');
  assert.ok(navMatch);
  assert.equal((navMatch[1].match(/<a\b/g)||[]).length,0);
  assert.equal((receipt.match(/assets\/cl-nav\.js/g)||[]).length,1);
  for (const capability of ['function checkFresh()','function startFixed()','function handoff()','function buildChunks()','function receipt()','publish:false','delete:false','database_schema:false']) assertIncludes(receipt,capability,'Receipt capability');
  assertExcludes(receipt,'.from(','Supabase direct');
  assertExcludes(receipt,'supabase.functions','Edge Function direct');
});

test('Helper Route Map: scanner coverage is bound to the exact 39-route V287 union', async () => {
  const scanner = await read('code-labs/helper-route-map.html');
  const fallbackMatch = scanner.match(/const PAGE_FALLBACK=\[([^\n]*)\];/);
  assert.ok(fallbackMatch);
  const fallback = [...fallbackMatch[1].matchAll(/'([^']+\.html)'/g)].map((match)=>match[1]);
  assert.equal(fallback.length,39);
  assert.equal(new Set(fallback).size,39);
  for (const marker of ["const CANONICAL_ROUTE_OWNER='code-labs/assets/cl-nav.js'",'function resolvePageSeeds()','Canonical route registry and scanner fallback disagree.','Incomplete canonical page coverage:','code-labs/chatgpt-buddy-tools.html','sourceReadOnly:true']) assertIncludes(scanner,marker,'Scanner contract');
});

test('Buddy Tools page: everyday utilities consume canonical navigation without a private route list', async () => {
  const tools = await read('code-labs/chatgpt-buddy-tools.html');
  const navMatch = tools.match(/<nav class="nav"[^>]*>([\s\S]*?)<\/nav>/);
  assertIncludes(tools,'data-page="chatgpt-buddy-tools"','Buddy Tools identity');
  assert.ok(navMatch);
  assert.equal((navMatch[1].match(/<a\b/g)||[]).length,0);
  assert.equal((tools.match(/assets\/cl-nav\.js/g)||[]).length,1);
  for (const href of ['buddy-canvas.html','repair-bridge-status.html','read-only-proof.html','chatgpt-connection.html','app-reader-test.html','help.html','publish-prep.html']) assertIncludes(tools,href,'Buddy Tools link');
  assertExcludes(tools,'MutationObserver','Observer');
  assertExcludes(tools,'setTimeout(','Delayed retry');
});

test('evidence boundary: source ownership tests do not claim runtime success', () => {
  const evidence={source_contract:true,browser_regression:false,duplicate_panel_smoke:false,backend_authority_smoke:false,deployment_authorised:false};
  assert.equal(evidence.source_contract,true);
  assert.equal(evidence.browser_regression,false);
  assert.equal(evidence.duplicate_panel_smoke,false);
  assert.equal(evidence.backend_authority_smoke,false);
  assert.equal(evidence.deployment_authorised,false);
});
