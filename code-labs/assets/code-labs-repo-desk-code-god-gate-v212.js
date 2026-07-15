/* Code Labs Repo Desk and GitHub Writer Code God Gate V215. Save visible handoff, then route every forward CTA through read-only review. */
(function () {
  'use strict';

  function page() {
    return document.body && document.body.getAttribute('data-page') || '';
  }

  function forwardHref(link) {
    if (!link) return '';
    return String(link.getAttribute('data-code-god-original-href') || link.getAttribute('href') || '').split('?')[0].split('#')[0];
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
    if (!link.getAttribute('data-code-god-original-href')) link.setAttribute('data-code-god-original-href', forwardHref(link));
    link.setAttribute('href', 'code-god.html');
    if (/track pr|github writer|publish prep|next/i.test(link.textContent || '')) link.textContent = 'Next: Code God';
    link.setAttribute('data-code-god-gate', 'V215');
    return true;
  }

  function apply() {
    if (page() !== 'repo-desk' && page() !== 'publish-prep') return false;
    var links = document.querySelectorAll('a[href]');
    Array.prototype.forEach.call(links, gate);
    return true;
  }

  function intercept(event) {
    if (page() !== 'repo-desk' && page() !== 'publish-prep') return;
    var link = event.target && event.target.closest && event.target.closest('a[href]');
    if (!isForward(link)) return;
    event.preventDefault();
    event.stopPropagation();
    saveVisibleHandoff();
    window.location.href = 'code-god.html';
  }

  function boot() {
    document.addEventListener('click', intercept, true);
    apply();
    var observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
