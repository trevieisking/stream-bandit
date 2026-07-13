/* Code Labs Footer and Buddy Shell V200
   Owns shared receipts, page bridge, Sol loading and previous/next navigation.
   Sol keeps its existing approved page-control behavior.
*/
(function () {
  'use strict';

  var VERSION = 'V200.9';
  var ROUTES = [
    ['index', 'index.html', 'Home'],
    ['setup', 'setup.html', 'Setup'],
    ['saved-files', 'saved-files.html', 'Saved Files'],
    ['file-lab', 'saved-files.html', 'Saved Files'],
    ['rescue-room', 'rescue-room.html', 'Rescue Room'],
    ['packet-builder', 'packet-builder.html', 'Packet Builder'],
    ['patch-lab', 'patch-lab.html', 'Patch Lab'],
    ['buddy-canvas', 'buddy-canvas.html', 'Buddy Lane'],
    ['preview-test', 'preview-test.html', 'Preview + Test'],
    ['checkpoints', 'checkpoints.html', 'Checkpoints'],
    ['help', 'help.html', 'Help']
  ];

  function q(selector, root) {
    return (root || document).querySelector(selector);
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

  function loadPageBridge() {
    if (window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge) return;
    loadScriptOnce('assets/code-labs-buddy-page-bridge-v139.js?v=cl-v200-three-shell', 'data-cl-buddy-page-bridge-v139');
  }

  function loadSol() {
    function startSol() {
      loadScriptOnce('assets/code-labs-sol-packet-guard-v142.js?v=cl-v200-three-shell', 'data-cl-sol-packet-guard-v143', function () {
        loadScriptOnce('assets/code-labs-sol-workbench-v141.js?v=cl-v200-three-shell', 'data-cl-sol-workbench-v141');
      });
    }

    if (window.CL_SB || window.CodeLabsRepairHistory) {
      startSol();
      return;
    }

    document.documentElement.setAttribute('data-cl-sol-auth-only', '1');
    if (!q('style[data-cl-sol-auth-only]')) {
      var style = document.createElement('style');
      style.setAttribute('data-cl-sol-auth-only', 'yes');
      style.textContent = 'html[data-cl-sol-auth-only="1"] #clHistoryPanel{display:none!important}';
      document.head.appendChild(style);
    }
    loadScriptOnce('assets/code-labs-v1-2-history.js?v=cl-v200-three-shell', 'data-cl-sol-auth-helper', startSol);
  }

  function routeIndex() {
    var id = pageId();
    for (var index = 0; index < ROUTES.length; index += 1) {
      if (ROUTES[index][0] === id) return index;
    }
    return -1;
  }

  function addFooter() {
    var main = q('.main') || q('main');
    if (!main || q('#clFooterBuddyShellV200')) return;

    var index = routeIndex();
    if (index < 0) return;

    var previous = index > 0 ? ROUTES[index - 1] : null;
    var next = index < ROUTES.length - 1 ? ROUTES[index + 1] : null;
    var footer = document.createElement('section');
    footer.id = 'clFooterBuddyShellV200';
    footer.className = 'panel';
    footer.setAttribute('data-cl-footer-shell', VERSION);
    footer.innerHTML = '<h2>Safe next step</h2>' +
      '<p>Use Sol for page guidance and approved controls. GitHub file changes still happen through a reviewed branch and pull request.</p>' +
      '<div class="actions">' +
      (previous ? '<a class="btn ghost" href="' + previous[1] + '">Previous: ' + previous[2] + '</a>' : '') +
      (next ? '<a class="btn primary" href="' + next[1] + '">Next: ' + next[2] + '</a>' : '') +
      '<a class="btn ghost" href="help.html">Help</a>' +
      '</div><p class="fine">Code Labs three-shell runtime ' + VERSION + ' · one page bridge · one Sol panel · branch and PR only.</p>';
    main.appendChild(footer);
  }

  function run() {
    document.documentElement.setAttribute('data-cl-footer-buddy-shell-v200', VERSION);
    loadPageBridge();
    loadSol();
    addFooter();
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 500);
  setTimeout(run, 1500);

  window.CodeLabsFooterBuddyShellV200 = {
    version: VERSION,
    run: run
  };
})();
