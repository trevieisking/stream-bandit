/* Code Labs Footer and Buddy Shell V145
   Shared safety/assistant owner for every Code Labs page.
   Loads the existing V140 bridge and Sol Workbench once without changing
   their APIs, storage keys, receipts, undo, or safety rules.
*/
(function () {
  'use strict';

  var VERSION = 'V145';
  var INSTALLED = 'data-cl-footer-buddy-shell-v145-installed';
  var BRIDGE_SRC = 'assets/code-labs-buddy-page-bridge-v139.js?v=cl-v145-every-page-write';
  var AUTH_SRC = 'assets/code-labs-v1-2-history.js?v=cl-sol-auth-20260711';
  var GUARD_SRC = 'assets/code-labs-sol-packet-guard-v142.js?v=cl-v143-sol-read-output';
  var SOL_SRC = 'assets/code-labs-sol-workbench-v141.js?v=cl-v143-sol-workbench';

  if (document.documentElement.getAttribute(INSTALLED) === 'yes') return;
  document.documentElement.setAttribute(INSTALLED, 'yes');

  function q(selector) {
    return document.querySelector(selector);
  }

  function loadOnce(src, attr, onload) {
    var old = q('script[' + attr + ']') || q('script[src*="' + src.split('?')[0] + '"]');
    if (old) {
      if (onload) onload();
      return old;
    }

    var script = document.createElement('script');
    script.src = src;
    script.setAttribute(attr, 'yes');
    if (onload) script.onload = onload;
    document.head.appendChild(script);
    return script;
  }

  function bridgeReady() {
    return window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge;
  }

  function ensureBridge() {
    var bridge = bridgeReady();
    if (bridge) {
      try {
        if (typeof bridge.render === 'function') bridge.render();
      } catch (error) {}
      return bridge;
    }

    loadOnce(BRIDGE_SRC, 'data-cl-buddy-page-bridge-v145-loader', function () {
      var loaded = bridgeReady();
      try {
        if (loaded && typeof loaded.render === 'function') loaded.render();
      } catch (error) {}
    });
    return null;
  }

  function loadSol() {
    loadOnce(GUARD_SRC, 'data-cl-sol-packet-guard-v143', function () {
      loadOnce(SOL_SRC, 'data-cl-sol-workbench-v141');
    });
  }

  function ensureSol() {
    if (window.CodeLabsSolWorkbenchV141 || q('#clSolV141')) return;

    if (window.CL_SB || window.CodeLabsRepairHistory) {
      loadSol();
      return;
    }

    document.documentElement.setAttribute('data-cl-sol-auth-only', '1');
    if (!q('style[data-cl-sol-auth-only]')) {
      var style = document.createElement('style');
      style.setAttribute('data-cl-sol-auth-only', 'yes');
      style.textContent = 'html[data-cl-sol-auth-only="1"] #clHistoryPanel{display:none!important}';
      document.head.appendChild(style);
    }

    loadOnce(AUTH_SRC, 'data-cl-sol-auth-helper', loadSol);
  }

  function run() {
    if (!document.body) return false;
    document.body.setAttribute('data-code-labs-footer-buddy-shell-v145', 'active');
    ensureBridge();
    ensureSol();
    return true;
  }

  function boot() {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1100);
    setTimeout(run, 2400);
    setTimeout(run, 4800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CodeLabsFooterBuddyShellV145 = {
    version: VERSION,
    run: run,
    bridge: bridgeReady
  };
})();
