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
    script.setAttribute('data-cl