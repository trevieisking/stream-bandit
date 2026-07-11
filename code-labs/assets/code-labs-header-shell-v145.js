/* Code Labs Header Shell V145
   Compatibility-first owner for existing Code Labs header/sidebar navigation.
   It never replaces page content and never creates a second navigation shell.
*/
(function () {
  'use strict';

  var VERSION = 'V145';
  var INSTALLED = 'data-cl-header-shell-v145-installed';

  if (document.documentElement.getAttribute(INSTALLED) === 'yes') return;
  document.documentElement.setAttribute(INSTALLED, 'yes');

  function run() {
    if (!document.body) return false;
    document.body.setAttribute('data-code-labs-header-shell-v145', 'active');

    try {
      if (window.CodeLabsStableNav && typeof window.CodeLabsStableNav.run === 'function') {
        window.CodeLabsStableNav.run();
      }
    } catch (error) {}

    return true;
  }

  function boot() {
    run();
    setTimeout(run, 120);
    setTimeout(run, 500);
    setTimeout(run, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CodeLabsHeaderShellV145 = {
    version: VERSION,
    run: run
  };
})();
