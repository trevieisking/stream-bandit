/* Code Labs V200 compatibility entry.
   Loads exactly three shared owners: header, page runtime, and footer/Buddy/Sol.
*/
(function () {
  'use strict';

  var VERSION = 'V200.9-three-shell';
  var SHELLS = [
    ['assets/code-labs-header-shell-v200.js?v=cl-v200-9', 'data-cl-header-shell-v200'],
    ['assets/code-labs-page-runtime-v200.js?v=cl-v200-9', 'data-cl-page-runtime-v200'],
    ['assets/code-labs-footer-buddy-shell-v200.js?v=cl-v200-9', 'data-cl-footer-buddy-shell-v200']
  ];

  function q(selector) {
    return document.querySelector(selector);
  }

  function loadScript(src, attribute) {
    var existing = q('script[' + attribute + ']');
    if (existing) return existing;
    var script = document.createElement('script');
    script.src = src;
    script.setAttribute(attribute, 'yes');
    document.head.appendChild(script);
    return script;
  }

  function run() {
    SHELLS.forEach(function (shell) {
      loadScript(shell[0], shell[1]);
    });

    if (window.CodeLabsHeaderShellV200 && window.CodeLabsHeaderShellV200.run) {
      window.CodeLabsHeaderShellV200.run();
    }
    if (window.CodeLabsPageRuntimeV200 && window.CodeLabsPageRuntimeV200.run) {
      window.CodeLabsPageRuntimeV200.run();
    }
    if (window.CodeLabsFooterBuddyShellV200 && window.CodeLabsFooterBuddyShellV200.run) {
      window.CodeLabsFooterBuddyShellV200.run();
    }
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 250);
  setTimeout(run, 900);
  setTimeout(run, 3200);

  window.CodeLabsStableNav = {
    version: VERSION,
    links: 10,
    run: run
  };
})();
