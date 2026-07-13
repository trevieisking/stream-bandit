/* Code Labs Page Runtime V200
   Loads shared workflow behavior, preserves specialist tools, and synchronizes the current visible full-file editor before Buddy Lane handoff.
*/
(function () {
  'use strict';

  var VERSION = 'V200.9';
  var STATE_KEY = 'codeLabsV1State';
  var PAGE_ROLES = {
    index: { step: 1, title: 'Home' },
    setup: { step: 2, title: 'Setup' },
    'saved-files': { step: 3, title: 'Saved Files' },
    'file-lab': { step: 3, title: 'Saved Files' },
    'rescue-room': { step: 4, title: 'Rescue Room' },
    'packet-builder': { step: 5, title: 'Packet Builder' },
    'patch-lab': { step: 6, title: 'Patch Lab' },
    'buddy-canvas': { step: 7, title: 'Buddy Lane' },
    'preview-test': { step: 8, title: 'Preview + Test' },
    checkpoints: { step: 9, title: 'Checkpoints' },
    help: { step: 10, title: 'Help' }
  };

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function pageId() {
    return (document.body && document.body.getAttribute('data-page')) ||
      location.pathname.split('/').pop().replace(/\.html?$/i, '') ||
      'index';
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function writeState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state || {}));
  }

  function isFullFile(path, code) {
    var text = String(code || '').trim();
    if (!text || text.length < 120) return false;
    if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(text)) return false;
    if (/^(?:diff --git |Index: )/i.test(text)) return false;
    if (/^@@\s*-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?\s*@@/m.test(text)) return false;
    if (/^---\s+\S+/m.test(text) && /^\+\+\+\s+\S+/m.test(text)) return false;
    if (/\.html?$/i.test(path || '') && !/<!doctype\s+html/i.test(text) && !/<html[\s>]/i.test(text)) return false;
    return true;
  }

  function toast(message) {
    var element = q('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    setTimeout(function () { element.classList.remove('show'); }, 2400);
  }

  function synchronizeVisibleEditor(event) {
    var target = event && event.target;
    if (!target || (target.id !== 'clSendBuddyLaneV200' && target.id !== 'clSavedToBuddyV200')) return;

    var page = pageId();
    if (page !== 'patch-lab' && page !== 'buddy-canvas') return;

    var state = readState();
    state.file = state.file || {};
    var path = state.file.path || (state.file.githubSource || {}).path || state.file.filename || 'file.html';
    var source = String(state.file.currentCode || '');
    var fixed = String(state.file.fixedCode || '');

    if (page === 'patch-lab') {
      var patchInput = q('#plIn');
      var patchOutput = q('#plOut');
      if (patchInput && String(patchInput.value || '').trim()) source = String(patchInput.value || '');
      if (patchOutput && String(patchOutput.value || '').trim()) fixed = String(patchOutput.value || '');
    }

    if (page === 'buddy-canvas') {
      var loaded = q('#loadedCode');
      var canvasFixed = q('#fixedCode');
      if (loaded && String(loaded.value || '').trim() && !/^No File Lab code loaded yet\.?$/i.test(String(loaded.value || '').trim())) {
        source = String(loaded.value || '');
      }
      if (canvasFixed && String(canvasFixed.value || '').trim() && !/^Paste ChatGPT fixed full replacement here$/i.test(String(canvasFixed.value || '').trim())) {
        fixed = String(canvasFixed.value || '');
      }
    }

    fixed = fixed || source;
    if (!isFullFile(path, fixed)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toast('Buddy Lane needs the current complete file, not a snippet or patch. No workflow state changed.');
      return;
    }

    state.file.currentCode = source || state.file.currentCode || '';
    state.file.fixedCode = fixed;
    state.file.syncedFromVisibleEditor = page;
    state.file.syncedAt = new Date().toISOString();
    writeState(state);
  }

  function bindCurrentEditorSync() {
    if (document.documentElement.getAttribute('data-cl-current-editor-sync') === VERSION) return;
    document.documentElement.setAttribute('data-cl-current-editor-sync', VERSION);
    document.addEventListener('click', synchronizeVisibleEditor, true);
  }

  function loadScriptOnce(src, attribute, onload) {
    var existing = q('script[' + attribute + ']');
    if (existing) {
      if (onload) onload();
      return existing;
    }
    var script = document.createElement('script');
    script.src = src;
    script.setAttribute(attribute, 'yes');
    if (onload) script.onload = onload;
    document.head.appendChild(script);
    return script;
  }

  function normalizeRole() {
    var role = PAGE_ROLES[pageId()];
    if (!role) return;

    document.documentElement.setAttribute('data-cl-page-runtime-v200', VERSION);
    document.documentElement.setAttribute('data-cl-workflow-step', String(role.step));

    var crumb = q('.crumbs b');
    if (crumb) crumb.textContent = role.title;

    var description = q('meta[name="description"]');
    if (description && /workflow step \d+/i.test(description.content || '')) {
      description.content = String(description.content || '').replace(/workflow step \d+/i, 'workflow step ' + role.step);
    }

    all('a[href="file-lab.html"]').forEach(function (link) {
      link.href = 'saved-files.html';
      var text = String(link.textContent || '');
      if (/file lab/i.test(text)) link.textContent = text.replace(/file lab/ig, 'Saved Files');
    });
  }

  function loadPreservedHelpers() {
    loadScriptOnce('assets/code-labs-workflow-clarity-v130.js?v=cl-v200-three-shell', 'data-cl-workflow-clarity-v130');
    loadScriptOnce('assets/code-labs-page-completion-v139.js?v=cl-v200-three-shell', 'data-cl-page-completion-v139');
    loadScriptOnce('assets/code-labs-page-polish-v172.js?v=cl-v200-three-shell', 'data-cl-page-polish-v172');

    if (pageId() === 'packet-builder') {
      loadScriptOnce('assets/code-labs-packet-builder-route-v131.js?v=cl-v200-three-shell', 'data-cl-packet-builder-route-v131');
    }
    if (pageId() === 'patch-desk') {
      loadScriptOnce('assets/code-labs-v34-patch-desk-dedupe.js?v=cl-v200-three-shell', 'data-cl-patch-desk-dedupe');
    }
  }

  function loadOneFlow() {
    loadScriptOnce('assets/code-labs-one-flow-v200.js?v=cl-v200-9-current-editor', 'data-cl-one-flow-v200');
  }

  function run() {
    bindCurrentEditorSync();
    normalizeRole();
    loadPreservedHelpers();
    loadOneFlow();
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 300);
  setTimeout(run, 1000);

  window.CodeLabsPageRuntimeV200 = {
    version: VERSION,
    roles: PAGE_ROLES,
    isFullFile: isFullFile,
    synchronizeVisibleEditor: synchronizeVisibleEditor,
    run: run
  };
})();
