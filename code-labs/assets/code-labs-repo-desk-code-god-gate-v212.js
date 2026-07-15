/* Code Labs Repo Desk Code God Gate V212. Route every forward CTA through read-only review. */
(function () {
  'use strict';
  function page() {
    return document.body && document.body.getAttribute('data-page') || '';
  }
  function isForward(link) {
    if (!link) return false;
    var href = String(link.getAttribute('href') || '').split('?')[0].split('#')[0];
    return href === 'publish-prep.html' || href === 'github-tracker.html';
  }
  function gate(link) {
    if (!isForward(link)) return false;
    link.setAttribute('href', 'code-god.html');
    if (/track pr|github writer|publish prep|next/i.test(link.textContent || '')) link.textContent = 'Next: Code God';
    link.setAttribute('data-code-god-gate', 'V212');
    return true;
  }
  function apply() {
    if (page() !== 'repo-desk') return false;
    var links = document.querySelectorAll('a[href]');
    Array.prototype.forEach.call(links, gate);
    return true;
  }
  function intercept(event) {
    if (page() !== 'repo-desk') return;
    var link = event.target && event.target.closest && event.target.closest('a[href]');
    if (!isForward(link)) return;
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'code-god.html';
  }
  function boot() {
    document.addEventListener('click', intercept, true);
    apply();
    var observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); apply(); }, 5000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();