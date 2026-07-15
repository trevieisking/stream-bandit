/* Code Labs Buddy Canvas compatibility loader V221. */
(function () {
  'use strict';

  function q(selector) {
    return document.querySelector(selector);
  }

  function loadShells() {
    if (q('script[data-cl-nav-v200]')) return;
    var script = document.createElement('script');
    script.src = 'assets/cl-nav.js?v=cl-v221-canonical-icons';
    script.setAttribute('data-cl-nav-v200', 'yes');
    document.head.appendChild(script);
  }

  function ruleBox() {
    return q('.sidebar .sideBox:not(#clBuddyToolsBox)');
  }

  function run() {
    if ((document.body && document.body.getAttribute('data-page')) !== 'buddy-canvas') return;
    var logoSmall = q('.logo small');
    if (logoSmall) logoSmall.textContent = 'Kind repair workflow for non-coders';
    var side = ruleBox();
    if (side) {
      side.setAttribute('data-cl-buddy-lane-rule', 'V221');
      side.innerHTML = '<b>Buddy Lane rule</b><p>You prepare or approve the complete file. ChatGPT and Sol help with the page; GitHub changes stay on a reviewed branch and pull request.</p>';
    }
    loadShells();
    window.CodeLabsBuddyCanvasMenuV134 = {
      version: 'V221',
      active: true,
      routes: window.CodeLabsStableNav ? window.CodeLabsStableNav.routes : []
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 250);
  setTimeout(run, 900);
})();
