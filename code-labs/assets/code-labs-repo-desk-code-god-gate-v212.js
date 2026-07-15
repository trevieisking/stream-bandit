/* Code Labs Repo Desk and GitHub Writer Code God Gate V216.
   Save visible handoff, then route forward CTAs through read-only review.
   Bounded, idempotent scans prevent browser mutation loops.
*/
(function () {
  'use strict';
  var VERSION = 'V216';
  var timer = 0;
  var observer = null;
  var scans = 0;
  var MAX_SCANS = 24;

  function page() {
    return document.body && document.body.getAttribute('data-page') || '';
  }

  function forwardHref(link) {
    if (!link) return '';
    return String(link.getAttribute('data-code-god-original-href') || link.getAttribute('href') || '')
      .split('?')[0].split('#')[0];
  }

  function isForward(link) {
    var href = forwardHref(link);
    if (page() === 'repo-desk') return href === 'publish-prep.html' || href === 'github-tracker.html';
    if (page() === 'publish-prep') return href === 'github-tracker.html';
    return false;
  }

  function saveVisibleHandoff() {
    var selector = page() === 'publish-prep' ? '#gwSave' : page() === 'repo-desk' ? '#rdSave' : '';
    var button = selector && document.querySelector(selector);
    if (button && typeof button.click === 'function') button.click();
  }

  function gate(link) {
    if (!isForward(link)) return false;
    var original = forwardHref(link);
    if (!link.getAttribute('data-code-god-original-href')) {
      link.setAttribute('data-code-god-original-href', original);
    }
    if (link.getAttribute('href') !== 'code-god.html') {
      link.setAttribute('href', 'code-god.html');
    }
    if (/track pr|github writer|publish prep|next/i.test(link.textContent || '') &&
        link.textContent !== 'Next: Code God') {
      link.textContent = 'Next: Code God';
    }
    link.setAttribute('data-code-god-gate', VERSION);
    return true;
  }

  function apply() {
    if (page() !== 'repo-desk' && page() !== 'publish-prep') return false;
    scans += 1;
    var changed = false;
    var links = document.querySelectorAll('a[href],a[data-code-god-original-href]');
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
    if (page() !== 'repo-desk' && page() !== 'publish-prep') return;
    var link = event.target && event.target.closest &&
      event.target.closest('a[href],a[data-code-god-original-href]');
    if (!isForward(link)) return;
    event.preventDefault();
    event.stopPropagation();
    saveVisibleHandoff();
    window.location.assign('code-god.html');
  }

  function boot() {
    if (page() !== 'repo-desk' && page() !== 'publish-prep') return;
    document.addEventListener('click', intercept, true);
    apply();
    observer = new MutationObserver(scheduleApply);
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
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
    max_scans: MAX_SCANS
  };
})();