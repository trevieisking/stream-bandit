/* Code Labs Stable Runtime V145
   Compatibility loader for the existing live Code Labs pages.
   Preserves existing page markup, Buddy lane, V140 controls and Sol tools.
*/
(function () {
  'use strict';

  var VERSION = 'V145';
  var ROOT_ATTR = 'data-cl-stable-runtime-v145';

  if (document.documentElement.getAttribute(ROOT_ATTR) === 'yes') return;
  document.documentElement.setAttribute(ROOT_ATTR, 'yes');

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function loadOnce(src, attr, done) {
    var existing = q('script[' + attr + ']');
    if (existing) {
      if (done) done();
      return existing;
    }
    var script = document.createElement('script');
    script.src = src;
    script.setAttribute(attr, 'yes');
    if (done) script.onload = done;
    document.head.appendChild(script);
    return script;
  }

  function ensureAuth(done) {
    if (window.CL_SB || window.CodeLabsRepairHistory) {
      done();
      return;
    }
    loadOnce(
      'assets/code-labs-v1-2-history.js?v=cl-stable-runtime-v145',
      'data-cl-stable-runtime-auth-v145',
      done
    );
  }

  function ensureBridge(done) {
    if (window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge) {
      done();
      return;
    }
    loadOnce(
      'assets/code-labs-buddy-page-bridge-v139.js?v=cl-v140-full-page-write',
      'data-cl-stable-runtime-bridge-v145',
      done
    );
  }

  function ensureSol() {
    if (window.CodeLabsSolWorkbenchV141) return;
    loadOnce(
      'assets/code-labs-sol-packet-guard-v142.js?v=cl-v143-sol-read-output',
      'data-cl-stable-runtime-sol-guard-v145',
      function () {
        loadOnce(
          'assets/code-labs-sol-workbench-v141.js?v=cl-v143-sol-workbench',
          'data-cl-stable-runtime-sol-v145'
        );
      }
    );
  }

  function preserveBuddyLane() {
    document.documentElement.setAttribute('data-cl-buddy-lane-preserved', 'yes');
  }

  function boot() {
    preserveBuddyLane();
    ensureAuth(function () {
      ensureBridge(ensureSol);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CodeLabsStableRuntimeV145 = {
    version: VERSION,
    boot: boot,
    bridge: function () {
      return window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge || null;
    },
    sol: function () {
      return window.CodeLabsSolWorkbenchV141 || null;
    }
  };
})();
