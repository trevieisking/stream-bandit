/* Code Labs Page Runtime V145
   One guarded entry point for the three-shell Code Labs runtime.
   Existing page HTML and page-specific helpers remain the source of truth.
*/
(function () {
  'use strict';

  var VERSION = 'V145';
  var INSTALLED = 'data-cl-page-runtime-v145-installed';

  if (document.documentElement.getAttribute(INSTALLED) === 'yes') return;
  document.documentElement.setAttribute(INSTALLED, 'yes');

  function q(selector) {
    return document.querySelector(selector);
  }

  function pageName() {
    return (document.body && document.body.getAttribute('data-page')) ||
      location.pathname.split('/').pop().replace(/\.html?$/i, '') ||
      'unknown';
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

  function loadHeader() {
    return loadOnce(
      'assets/code-labs-header-shell-v145.js?v=cl-v145-every-page-write',
      'data-cl-header-shell-v145-loader',
      function () {
        if (window.CodeLabsHeaderShellV145) window.CodeLabsHeaderShellV145.run();
      }
    );
  }

  function loadFooterBuddy() {
    return loadOnce(
      'assets/code-labs-footer-buddy-shell-v145.js?v=cl-v145-every-page-write',
      'data-cl-footer-buddy-shell-v145-loader',
      function () {
        if (window.CodeLabsFooterBuddyShellV145) window.CodeLabsFooterBuddyShellV145.run();
      }
    );
  }

  function run() {
    if (!document.body) return false;
    document.body.setAttribute('data-code-labs-page-runtime-v145', 'active');
    document.body.setAttribute('data-code-labs-runtime-page', pageName());
    loadHeader();
    loadFooterBuddy();
    return true;
  }

  function boot() {
    setTimeout(run, 320);
    setTimeout(run, 750);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CodeLabsPageRuntimeV145 = {
    version: VERSION,
    page: pageName,
    run: run
  };
})();
