/* Code Labs Repo Desk Code God Gate V212. Route forward CTAs through read-only review. */
(function () {
  'use strict';
  function page() {
    return document.body && document.body.getAttribute('data-page') || '';
  }
  function apply() {
    if (page() !== 'repo-desk') return false;
    var links = document.querySelectorAll('a[href="publish-prep.html"],a[href="github-tracker.html"]');
    Array.prototype.forEach.call(links, function (link) {
      link.setAttribute('href', 'code-god.html');
      if (/track pr|github writer|publish prep|next/i.test(link.textContent || '')) link.textContent = 'Next: Code God';
      link.setAttribute('data-code-god-gate', 'V212');
    });
    return true;
  }
  function boot() {
    apply();
    var observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); apply(); }, 5000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();