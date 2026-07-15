/* Code Labs Repo Desk Code God Gate V217.
   Route only the Repo Desk content CTA through read-only Code God review.
   Sidebar navigation and GitHub Writer -> Tracker remain canonical and untouched.
*/
(function () {
  'use strict';
  var VERSION = 'V217';
  var timer = 0;
  var observer = null;
  var scans = 0;
  var MAX_SCANS = 24;

  function page() {
    return document.body && document.body.getAttribute('data-page') || '';
  }

  function cleanHref(link) {
    if (!link) return '';
    return String(link.getAttribute('data-code-god-original-href') || link.getAttribute('href') || '')
      .split('?')[0].split('#')[0];
  }

  function eligible(link) {
    if (!link || page() !== 'repo-desk') return false;
    if (link.closest && link.closest('.sidebar')) return false;
    if (!(link.closest && link.closest('.main'))) return false;
    return cleanHref(link) === 'publish-prep.html';
  }

  function saveVisibleHandoff() {
    var button = document.querySelector('#rdSave');
    if (button && typeof button.click === 'function') button.click();
  }

  function gate(link) {
    if (!eligible(link)) return false;
    var changed = false;
    if (!link.getAttribute('data-code-god-original-href')) {
      link.setAttribute('data-code-god-original-href', cleanHref(link));
      changed = true;
    }
    if (link.getAttribute('href') !== 'code-god.html') {
      link.setAttribute('href', 'code-god.html');
      changed = true;
    }
    if (link.textContent !== 'Next: Code God') {
      link.textContent = 'Next: Code God';
      changed = true;
    }
    if (link.getAttribute('data-code-god-gate') !== VERSION) {
      link.setAttribute('data-code-god-gate', VERSION);
      changed = true;
    }
    return changed;
  }

  function apply() {
    if (page() !== 'repo-desk') return false;
    scans += 1;
    var changed = false;
    var links = document.querySelectorAll('.main a[href],.main a[data-code-god-original-href]');
    Array.prototype.forEach.call(links, function (link) {
      if (gate(link)) changed = true;
    });
    if (scans >= MAX_SCANS && observer) {
      observer.disconnect();
      observer = null;
    }
    return changed;
  }

  function scheduleApply() {
    if (timer || scans >= MAX_SCANS) return;
    timer = window.setTimeout(function () {
      timer = 0;
      apply();
    }, 60);
  }

  function intercept(event) {
    if (page() !== 'repo-desk') return;
    var link = event.target && event.target.closest &&
      event.target.closest('.main a[href],.main a[data-code-god-original-href]');
    if (!eligible(link)) return;
    event.preventDefault();
    event.stopPropagation();
    saveVisibleHandoff();
    window.location.assign('code-god.html');
  }

  function boot() {
    if (page() !== 'repo-desk') return;
    document.addEventListener('click', intercept, true);
    apply();
    var main = document.querySelector('.main');
    if (main) {
      observer = new MutationObserver(scheduleApply);
      observer.observe(main, { childList: true, subtree: true });
    }
    window.setTimeout(function () {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.CodeLabsCodeGodGate = {
    version: VERSION,
    run: apply,
    max_scans: MAX_SCANS,
    scope: 'repo-desk-main-only'
  };
})();
