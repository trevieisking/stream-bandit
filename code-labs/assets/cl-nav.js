/* Code Labs V200 compatibility entry.
   Loads exactly three shared owners in order: header, page runtime, footer/Buddy/V104.
*/
(function () {
  'use strict';

  var VERSION = 'V200.13-sequential-shells';
  var started = false;
  var completed = false;

  function q(selector) {
    return document.querySelector(selector);
  }

  function addSettlingStyle() {
    if (q('style[data-cl-shell-settling]')) return;
    var style = document.createElement('style');
    style.setAttribute('data-cl-shell-settling', 'yes');
    style.textContent =
      'html[data-cl-shell-settling="1"] .sidebar .nav{visibility:hidden!important}' +
      'html[data-cl-shell-settling="1"] #clFooterBuddyShellV200{visibility:hidden!important}';
    document.head.appendChild(style);
  }

  function reveal() {
    completed = true;
    document.documentElement.removeAttribute('data-cl-shell-settling');
    document.documentElement.setAttribute('data-cl-shell-ready', VERSION);
  }

  function loadScript(src, attribute, ready, next) {
    var existing = q('script[' + attribute + ']');
    function continueWhenReady(attempt) {
      if (ready()) {
        next();
        return;
      }
      if (attempt > 80) {
        reveal();
        return;
      }
      setTimeout(function () { continueWhenReady(attempt + 1); }, 50);
    }
    if (existing) {
      continueWhenReady(0);
      return existing;
    }
    var script = document.createElement('script');
    script.src = src;
    script.setAttribute(attribute, 'yes');
    script.onload = function () { continueWhenReady(0); };
    script.onerror = reveal;
    document.head.appendChild(script);
    return script;
  }

  function runOwners() {
    if (window.CodeLabsHeaderShellV200 && window.CodeLabsHeaderShellV200.run) {
      window.CodeLabsHeaderShellV200.run();
    }
    loadScript(
      'assets/code-labs-page-runtime-v200.js?v=cl-v200-13-sequential',
      'data-cl-page-runtime-v200',
      function () { return !!window.CodeLabsPageRuntimeV200; },
      function () {
        if (window.CodeLabsPageRuntimeV200.run) window.CodeLabsPageRuntimeV200.run();
        loadScript(
          'assets/code-labs-footer-buddy-shell-v200.js?v=cl-v200-18-v104-safe-relay',
          'data-cl-footer-buddy-shell-v200',
          function () { return !!window.CodeLabsFooterBuddyShellV200; },
          function () {
            if (window.CodeLabsFooterBuddyShellV200.run) window.CodeLabsFooterBuddyShellV200.run();
            reveal();
          }
        );
      }
    );
  }

  function run() {
    if (completed) {
      runOwners();
      return true;
    }
    if (started) return true;
    started = true;
    addSettlingStyle();
    document.documentElement.setAttribute('data-cl-shell-settling', '1');
    loadScript(
      'assets/code-labs-header-shell-v200.js?v=cl-v200-13-sequential',
      'data-cl-header-shell-v200',
      function () { return !!window.CodeLabsHeaderShellV200; },
      runOwners
    );
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(function () {
    if (!completed) {
      started = false;
      run();
    }
  }, 1600);

  window.CodeLabsStableNav = {
    version: VERSION,
    links: 10,
    run: run
  };
})();
