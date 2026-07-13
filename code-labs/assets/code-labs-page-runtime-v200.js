/* Code Labs Page Runtime V200
   Loads the shared one-flow behavior and preserves existing route-specific tools.
*/
(function () {
  'use strict';

  var VERSION = 'V200.9';
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
    run: run
  };
})();
